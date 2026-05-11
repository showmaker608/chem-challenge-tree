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
  if (event.body) return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  return event;
}

exports.main = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json({ ok: true });

  let payload;
  try { payload = parseBody(event); } catch { return json({ ok: false }, 400); }

  const action = payload?.action;

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

  if (action === 'listStudents') {
    const { classCode } = payload;
    const query = classCode ? { classCode } : {};
    const res = await db.collection('students').where(query).limit(100).get();
    return json({ ok: true, students: res.data ?? [] });
  }

  return json({ ok: false, message: '未知操作' }, 400);
};
