const cloudbase = require('@cloudbase/node-sdk');
const crypto = require('crypto');

const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();
const ALLOWED_EVENTS = new Set(['visit', 'start_experience', 'complete']);

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

function parseBody(event) {
  if (event.body) return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  return event;
}

function cleanDimension(value, fallback, maxLength = 64) {
  const cleaned = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength);
  return cleaned || fallback;
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function cleanPath(value) {
  const path = String(value || '/')
    .replace(/[^a-zA-Z0-9/_-]+/g, '-')
    .slice(0, 120);
  return path.startsWith('/') ? path : `/${path}`;
}

exports.main = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json({ ok: true });
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return json({ ok: false, message: '请求方式不支持' }, 405);
  }

  let payload;
  try {
    payload = parseBody(event) || {};
  } catch {
    return json({ ok: false, message: '请求内容无效' }, 400);
  }

  const eventName = String(payload.eventName || '');
  const visitorId = String(payload.visitorId || '').trim();
  const sessionId = String(payload.sessionId || '').trim();
  if (!ALLOWED_EVENTS.has(eventName) || !visitorId || !sessionId) {
    return json({ ok: false, message: '缺少有效事件' }, 400);
  }

  const source = cleanDimension(payload.source, 'direct');
  const campaign = cleanDimension(payload.campaign, 'none');
  const experienceId = cleanDimension(payload.experienceId, 'site');
  const visitorHash = hash(visitorId.slice(0, 128));
  const sessionHash = hash(sessionId.slice(0, 128));
  const dedupeKey = hash(`${eventName}|${sessionHash}|${source}|${experienceId}`);

  try {
    const existing = await db.collection('analytics_events').where({ dedupeKey }).limit(1).get();
    if (existing.data?.length) return json({ ok: true, duplicate: true });

    await db.collection('analytics_events').add({
      eventName,
      visitorHash,
      sessionHash,
      source,
      campaign,
      experienceId,
      path: cleanPath(payload.path),
      dedupeKey,
      createdAt: new Date().toISOString(),
    });
    return json({ ok: true, duplicate: false });
  } catch {
    return json({ ok: false, message: '记录失败' }, 500);
  }
};
