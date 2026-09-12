const cloudbase = require('@cloudbase/node-sdk');

const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();
const DEFAULT_COURSE_ID = 'shanghai-junior-chemistry';

function stateWeight(state) {
  const completed = (state?.completedNodes || []).length;
  const unlocked = (state?.unlockedNodes || []).length;
  return completed + unlocked;
}

function pickRicherProgress(items) {
  return items
    .filter(Boolean)
    .sort((a, b) => {
      const progressDelta = stateWeight(b?.state) - stateWeight(a?.state);
      if (progressDelta !== 0) return progressDelta;
      return (b?.state?.xp || 0) - (a?.state?.xp || 0);
    })[0] ?? null;
}

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
  if (event.body) {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  }
  return event;
}

exports.main = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json({ ok: true });

  let payload;
  try { payload = parseBody(event); } catch { return json({ ok: false, message: '请求格式不正确' }, 400); }

  const classCode = String(payload?.classCode ?? '').trim().toUpperCase();
  const studentId = String(payload?.studentId ?? '').trim();
  const courseId = String(payload?.courseId ?? DEFAULT_COURSE_ID).trim() || DEFAULT_COURSE_ID;
  const state = payload?.state;

  if (!classCode || !studentId) {
    return json({ ok: false, message: '缺少班级码或学号' }, 400);
  }

  const studentKey = `${classCode}:${studentId}:${courseId}`;
  const legacyStudentKey = `${classCode}:${studentId}`;

  if (state) {
    // 上传进度（保护：不接受比已有数据更少的进度）
    const [existing, legacyExisting] = await Promise.all([
      db.collection('progress').where({ studentKey }).limit(1).get(),
      courseId === DEFAULT_COURSE_ID
        ? db.collection('progress').where({ studentKey: legacyStudentKey }).limit(1).get()
        : Promise.resolve({ data: [] }),
    ]);
    const now = new Date().toISOString();

    const newTotal = stateWeight(state);
    const richestExisting = pickRicherProgress([
      existing.data?.[0] ?? null,
      legacyExisting.data?.[0] ?? null,
    ]);
    const richestExistingTotal = stateWeight(richestExisting?.state);

    if (richestExisting && newTotal < richestExistingTotal) {
      return json({ ok: true, action: 'skipped', reason: 'stale data' });
    }

    if (existing.data?.length) {
      const old = existing.data[0];
      await db.collection('progress').doc(old._id).update({
        state,
        updatedAt: now,
      });
    } else {
      await db.collection('progress').add({
        studentKey,
        legacyStudentKey,
        classCode,
        studentId,
        courseId,
        state,
        createdAt: now,
        updatedAt: now,
      });
    }
    return json({ ok: true, action: 'saved' });
  }

  // 下载进度
  const [progressRes, legacyProgressRes] = await Promise.all([
    db.collection('progress').where({ studentKey }).limit(1).get(),
    courseId === DEFAULT_COURSE_ID
      ? db.collection('progress').where({ studentKey: legacyStudentKey }).limit(1).get()
      : Promise.resolve({ data: [] }),
  ]);
  const progress = pickRicherProgress([
    progressRes.data?.[0] ?? null,
    legacyProgressRes.data?.[0] ?? null,
  ]);
  return json({ ok: true, progress: progress?.state ?? null });
};
