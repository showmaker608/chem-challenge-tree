const cloudbase = require('@cloudbase/node-sdk');
const crypto = require('crypto');
const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();
const DASHBOARD_CLASS_CODE = 'CHEM莲花';
const DASHBOARD_STUDENT_ID = '0815';
const ADMIN_ACTIONS = new Set(['listCodes', 'addCodes', 'listFeedbacks', 'listStudents']);

function json(body, code = 200) {
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  };
}

function parseBody(event) {
  if (event.httpMethod === 'OPTIONS') return null;
  if (event.body) return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  return event;
}

async function hasDashboardAccess(payload) {
  const accessToken = String(payload?.accessToken || '').trim();
  if (!accessToken) return false;

  const tokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');
  const accountRes = await db.collection('students')
    .where({ dashboardTokenHash: tokenHash })
    .limit(1)
    .get();
  const account = accountRes.data?.[0];

  return Boolean(
    account
    && account.classCode === DASHBOARD_CLASS_CODE
    && account.studentId === DASHBOARD_STUDENT_ID
    && Date.parse(account.dashboardTokenExpiresAt || '') > Date.now()
  );
}

function publicStudent(student) {
  return {
    studentId: student.studentId || '',
    name: student.displayName || student.studentName || student.studentId || '',
    classCode: student.classCode || '',
    className: student.className || '',
    createdAt: student.createdAt || '',
  };
}

function publicFeedback(feedback) {
  return {
    id: feedback._id || '',
    classCode: feedback.classCode || '',
    studentName: feedback.studentName || '游客',
    nodeId: feedback.nodeId || '',
    nodeTopic: feedback.nodeTopic || '',
    stem: feedback.stem || '',
    userAnswer: feedback.userAnswer || '',
    correctAnswer: feedback.correctAnswer || '',
    comment: feedback.comment || '',
    createdAt: feedback.createdAt || '',
    resolved: Boolean(feedback.resolved),
  };
}

exports.main = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json({ ok: true });
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return json({ ok: false, message: '无权访问' }, 403);
  }

  let payload;
  try { payload = parseBody(event); } catch { return json({ ok: false }, 400); }

  const action = payload?.action;
  if (ADMIN_ACTIONS.has(action) && !(await hasDashboardAccess(payload))) {
    return json({ ok: false, message: '无权访问' }, 403);
  }

  if (action === 'listCodes') {
    const res = await db.collection('invitations').where({ active: true }).get();
    // Also count students per code
    const codes = [];
    for (const doc of res.data ?? []) {
      const studentCount = await db.collection('students').where({ classCode: doc.code }).count();
      codes.push({
        code: doc.code,
        className: doc.className,
        maxUses: doc.maxUses ?? 1,
        usedCount: studentCount.total ?? 0,
      });
    }
    return json({ ok: true, codes });
  }

  if (action === 'addCodes') {
    const { prefix, className, count, maxUses } = payload;
    if (!prefix || !className || !count) {
      return json({ ok: false, message: '缺少参数' }, 400);
    }
    const codes = [];
    for (let i = 1; i <= count; i++) {
      const code = `${prefix}-${String(i).padStart(2, '0')}`;
      // Check if exists
      const exist = await db.collection('invitations').where({ code }).limit(1).get();
      if (exist.data?.length) continue;
      codes.push({
        code,
        className,
        maxUses: maxUses ?? 1,
        usedCount: 0,
        active: true,
        createdAt: new Date().toISOString(),
      });
    }
    if (codes.length > 0) {
      // Insert in batches
      for (const c of codes) {
        await db.collection('invitations').add(c);
      }
    }
    return json({ ok: true, added: codes.length, codes: codes.map(c => c.code) });
  }

  if (action === 'submitFeedback') {
    const { classCode, studentName, nodeId, nodeTopic, stem, userAnswer, correctAnswer, comment } = payload;
    if (!comment) return json({ ok: false, message: '请填写反馈内容' }, 400);
    await db.collection('feedbacks').add({
      classCode: classCode ?? '',
      studentName: studentName ?? '游客',
      nodeId: nodeId ?? '',
      nodeTopic: nodeTopic ?? '',
      stem: stem ?? '',
      userAnswer: userAnswer ?? '',
      correctAnswer: correctAnswer ?? '',
      comment,
      createdAt: new Date().toISOString(),
      resolved: false,
    });
    return json({ ok: true, message: '反馈已提交，老师会统一查看' });
  }

  if (action === 'listFeedbacks') {
    const res = await db.collection('feedbacks').where({ resolved: false }).limit(50).get();
    return json({ ok: true, feedbacks: (res.data ?? []).map(publicFeedback) });
  }

  if (action === 'listStudents') {
    const { classCode } = payload;
    const query = classCode ? { classCode } : {};
    const res = await db.collection('students').where(query).limit(100).get();
    return json({ ok: true, students: (res.data ?? []).map(publicStudent) });
  }

  return json({ ok: false, message: '未知操作' }, 400);
};
