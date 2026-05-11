const cloudbase = require('@cloudbase/node-sdk');

const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();

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
  const state = payload?.state;

  if (!classCode || !studentId) {
    return json({ ok: false, message: '缺少班级码或学号' }, 400);
  }

  const studentKey = `${classCode}:${studentId}`;

  if (state) {
    // 上传进度
    const existing = await db.collection('progress').where({ studentKey }).limit(1).get();
    const now = new Date().toISOString();

    if (existing.data?.length) {
      await db.collection('progress').doc(existing.data[0]._id).update({
        state,
        updatedAt: now,
      });
    } else {
      await db.collection('progress').add({
        studentKey,
        classCode,
        studentId,
        state,
        createdAt: now,
        updatedAt: now,
      });
    }
    return json({ ok: true, action: 'saved' });
  }

  // 下载进度
  const progressRes = await db.collection('progress').where({ studentKey }).limit(1).get();
  const [progress] = progressRes.data ?? [];
  return json({ ok: true, progress: progress?.state ?? null });
};
