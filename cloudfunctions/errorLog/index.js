const cloudbase = require('@cloudbase/node-sdk');
const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();

function json(body) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  };
}

exports.main = async (event) => {
  try {
    const payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { message, stack, url, userAgent, timestamp } = payload || {};

    await db.collection('error_logs').add({
      message: String(message || '').slice(0, 500),
      stack: String(stack || '').slice(0, 1000),
      url: String(url || '').slice(0, 200),
      userAgent: String(userAgent || '').slice(0, 200),
      timestamp: timestamp || new Date().toISOString(),
    });

    return json({ ok: true });
  } catch {
    return json({ ok: true }); // 静默失败，不让错误上报本身导致更多问题
  }
};
