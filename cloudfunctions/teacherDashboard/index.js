const cloudbase = require('@cloudbase/node-sdk');
const crypto = require('crypto');
const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();
const DASHBOARD_CLASS_CODE = 'CHEM莲花';
const DASHBOARD_STUDENT_ID = '0815';

function json(body, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  };
}

function percent(numerator, denominator) {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;
}

function summarizeFunnel(events, days, now = Date.now()) {
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  const recent = events.filter(event =>
    Date.parse(event.createdAt || '') >= cutoff
    && !String(event.source || '').startsWith('qa-')
  );
  const visitors = new Set(recent.map(event => event.visitorHash).filter(Boolean));
  const visits = new Set(recent.filter(event => event.eventName === 'visit').map(event => event.sessionHash).filter(Boolean));
  const starts = new Set(recent.filter(event => event.eventName === 'start_experience').map(event => event.sessionHash).filter(Boolean));
  const completes = new Set(recent.filter(event => event.eventName === 'complete').map(event => event.sessionHash).filter(Boolean));

  return {
    days,
    visitors: visitors.size,
    visits: visits.size,
    starts: starts.size,
    completes: completes.size,
    startRate: percent(starts.size, visits.size),
    completionRate: percent(completes.size, starts.size),
    visitToCompleteRate: percent(completes.size, visits.size),
  };
}

function summarizeSources(events, days = 30, now = Date.now()) {
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  const grouped = new Map();
  for (const event of events) {
    if (Date.parse(event.createdAt || '') < cutoff) continue;
    const source = event.source || 'direct';
    if (String(source).startsWith('qa-')) continue;
    if (!grouped.has(source)) grouped.set(source, { source, visitSessions: new Set(), startSessions: new Set(), completeSessions: new Set() });
    const item = grouped.get(source);
    if (event.eventName === 'visit') item.visitSessions.add(event.sessionHash);
    if (event.eventName === 'start_experience') item.startSessions.add(event.sessionHash);
    if (event.eventName === 'complete') item.completeSessions.add(event.sessionHash);
  }
  return [...grouped.values()]
    .map(item => ({
      source: item.source,
      visits: item.visitSessions.size,
      starts: item.startSessions.size,
      completes: item.completeSessions.size,
    }))
    .sort((a, b) => b.visits - a.visits || b.starts - a.starts)
    .slice(0, 12);
}

async function readAnalyticsEvents() {
  try {
    const result = await db.collection('analytics_events').limit(1000).get();
    return result.data || [];
  } catch {
    return [];
  }
}

exports._test = { summarizeFunnel, summarizeSources };

exports.main = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') return json({ ok: true });
    if (event.httpMethod && event.httpMethod !== 'POST') {
      return json({ ok: false, message: '无权访问' }, 403);
    }

    const payload = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
    const accessToken = String(payload.accessToken || '');
    if (!accessToken) return json({ ok: false, message: '无权访问' }, 403);

    const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');
    const accountRes = await db.collection('students').where({ dashboardTokenHash: tokenHash }).limit(1).get();
    const account = accountRes.data?.[0];
    const hasAccess = account
      && account.classCode === DASHBOARD_CLASS_CODE
      && account.studentId === DASHBOARD_STUDENT_ID
      && Date.parse(account.dashboardTokenExpiresAt || '') > Date.now();
    if (!hasAccess) return json({ ok: false, message: '无权访问' }, 403);

    const [studentsRes, progressRes, feedbacksRes, analyticsEvents] = await Promise.all([
      db.collection('students').limit(500).get(),
      db.collection('progress').limit(500).get(),
      db.collection('feedbacks').where({ resolved: false }).limit(100).get(),
      readAnalyticsEvents(),
    ]);

    const students = studentsRes.data || [];
    const allProgress = progressRes.data || [];

    const pmap = new Map();
    for (const p of allProgress) {
      if (p.studentKey && p.state) pmap.set(p.studentKey, p.state);
    }

    const cmap = new Map();
    for (const s of students) {
      const code = String(s.classCode || '未知');
      if (!cmap.has(code)) cmap.set(code, { classCode: code, className: code, total: 0, active: 0, totalCompleted: 0, totalXp: 0 });
      const o = cmap.get(code);
      o.total++;
      const key = code + ':' + s.studentId;
      const p = pmap.get(key);
      if (p) {
        o.totalCompleted += (p.completedNodes || []).length;
        o.totalXp += p.xp || 0;
        if ((p.completedNodes || []).length > 0) o.active++;
      }
    }

    const wc = new Map();
    for (const p of allProgress) {
      for (const w of (p.state?.wrongList || [])) {
        const k = (w.nodeTopic || '?') + '|||' + (w.stem || '').slice(0, 50);
        wc.set(k, (wc.get(k) || 0) + 1);
      }
    }
    const topWrongs = [...wc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)
      .map(([k, count]) => { const [topic, stem] = k.split('|||'); return { topic, stem, count }; });

    let active = 0, completed = 0, xp = 0;
    for (const p of pmap.values()) {
      if ((p.completedNodes || []).length > 0) active++;
      completed += (p.completedNodes || []).length;
      xp += p.xp || 0;
    }

    // 学生名单
    const studentList = students.map(s => {
      const key = s.classCode + ':' + s.studentId;
      const p = pmap.get(key);
      const wrongList = (p?.wrongList || []).map(w => ({
        nodeId: w.nodeId || '',
        nodeTopic: w.nodeTopic || '',
        stem: (w.stem || '').slice(0, 80),
      }));
      return {
        studentId: s.studentId,
        name: s.displayName || s.studentName || s.studentId,
        classCode: s.classCode || '未知',
        xp: p?.xp || 0,
        completed: (p?.completedNodes || []).length,
        completedNodes: p?.completedNodes || [],
        wrongList,
        createdAt: s.createdAt || '',
      };
    }).sort((a, b) => b.xp - a.xp);

    // 学生反馈
    const feedbacks = (feedbacksRes.data || []).map(f => ({
      studentName: f.studentName || '?',
      nodeTopic: f.nodeTopic || '?',
      stem: (f.stem || '').slice(0, 60),
      comment: f.comment || '',
      createdAt: f.createdAt || '',
    })).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    return json({
      ok: true,
      overview: { totalStudents: students.length, activeStudents: active, totalCompleted: completed, totalXp: xp },
      classes: [...cmap.values()].sort((a, b) => b.totalCompleted - a.totalCompleted),
      topWrongs,
      students: studentList,
      feedbacks,
      analytics: {
        sevenDays: summarizeFunnel(analyticsEvents, 7),
        thirtyDays: summarizeFunnel(analyticsEvents, 30),
        sources: summarizeSources(analyticsEvents),
        sampleLimitReached: analyticsEvents.length >= 1000,
      },
    });
  } catch (err) {
    return json({ ok: false, message: '错误: ' + String(err.message || err) });
  }
};
