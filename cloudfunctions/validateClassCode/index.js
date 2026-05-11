const cloudbase = require('@cloudbase/node-sdk');

const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV,
});

const db = app.database();

function jsonResponse(body, statusCode = 200) {
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

function parsePayload(event) {
  if (event.httpMethod === 'OPTIONS') return null;
  if (event.body) {
    return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  }
  return event;
}

exports.main = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse({ ok: true });
  }

  let payload;
  try {
    payload = parsePayload(event);
  } catch {
    return jsonResponse({ ok: false, message: '请求格式不正确' }, 400);
  }

  const classCode = String(payload?.classCode ?? '').trim().toUpperCase();
  if (!classCode) {
    return jsonResponse({ ok: false, message: '请填写班级码' }, 400);
  }

  const result = await db
    .collection('classes')
    .where({
      classCode,
      active: true,
    })
    .limit(1)
    .get();

  const [classRecord] = result.data ?? [];
  if (!classRecord) {
    return jsonResponse({ ok: false, message: '班级码不存在或已停用' });
  }

  return jsonResponse({
    ok: true,
    classCode: classRecord.classCode,
    className: classRecord.className,
  });
};
