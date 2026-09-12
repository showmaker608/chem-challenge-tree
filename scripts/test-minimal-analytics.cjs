const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const Module = require('node:module');

const analyticsRows = [];

function chain(rows) {
  return {
    limit() { return this; },
    async get() { return { data: rows }; },
  };
}

const db = {
  collection(name) {
    if (name === 'analytics_events') {
      return {
        where(query) {
          return chain(analyticsRows.filter(row => row.dedupeKey === query.dedupeKey));
        },
        async add(row) {
          analyticsRows.push(row);
          return { id: `event-${analyticsRows.length}` };
        },
        limit() { return chain(analyticsRows); },
      };
    }
    if (name === 'students') {
      return {
        where(query) {
          const validHash = crypto.createHash('sha256').update('teacher-token').digest('hex');
          return chain(query.dashboardTokenHash === validHash ? [{
            classCode: 'CHEM莲花',
            studentId: '0815',
            dashboardTokenExpiresAt: '2999-01-01T00:00:00.000Z',
          }] : []);
        },
        limit() { return chain([]); },
      };
    }
    if (name === 'progress' || name === 'feedbacks') {
      return {
        where() { return chain([]); },
        limit() { return chain([]); },
      };
    }
    throw new Error(`Unexpected collection: ${name}`);
  },
};

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === '@cloudbase/node-sdk') {
    return { SYMBOL_CURRENT_ENV: 'test', init: () => ({ database: () => db }) };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const analytics = require('../cloudfunctions/analytics/index.js');
const teacherDashboard = require('../cloudfunctions/teacherDashboard/index.js');
Module._load = originalLoad;

function parse(response) {
  return { status: response.statusCode, body: JSON.parse(response.body) };
}

(async () => {
  const invalidMethod = parse(await analytics.main({ httpMethod: 'GET' }));
  assert.equal(invalidMethod.status, 405);

  const invalidEvent = parse(await analytics.main({
    httpMethod: 'POST',
    body: JSON.stringify({ eventName: 'password_capture', visitorId: 'v1', sessionId: 's1' }),
  }));
  assert.equal(invalidEvent.status, 400);

  const payload = {
    eventName: 'visit',
    visitorId: 'visitor-secret',
    sessionId: 'session-secret',
    source: 'Douyin / 量筒',
    campaign: 'Summer 2026',
    experienceId: 'Elements 20',
    path: '/try?<script>alert(1)</script>',
    studentName: '不应记录',
  };
  const first = parse(await analytics.main({ httpMethod: 'POST', body: JSON.stringify(payload) }));
  const duplicate = parse(await analytics.main({ httpMethod: 'POST', body: JSON.stringify(payload) }));
  assert.deepEqual(first.body, { ok: true, duplicate: false });
  assert.deepEqual(duplicate.body, { ok: true, duplicate: true });
  assert.equal(analyticsRows.length, 1);
  assert.equal(analyticsRows[0].source, 'douyin');
  assert.equal(analyticsRows[0].campaign, 'summer-2026');
  assert.equal(analyticsRows[0].experienceId, 'elements-20');
  assert.equal(analyticsRows[0].path, '/try-script-alert-1-/script-');
  assert.equal('visitorId' in analyticsRows[0], false);
  assert.equal('sessionId' in analyticsRows[0], false);
  assert.equal('studentName' in analyticsRows[0], false);
  assert.equal(analyticsRows[0].visitorHash.length, 64);
  assert.equal(analyticsRows[0].sessionHash.length, 64);

  const now = Date.now();
  const recent = new Date(now - 60_000).toISOString();
  const events = [
    { eventName: 'visit', visitorHash: 'v1', sessionHash: 's1', source: 'douyin', createdAt: recent },
    { eventName: 'start_experience', visitorHash: 'v1', sessionHash: 's1', source: 'douyin', createdAt: recent },
    { eventName: 'complete', visitorHash: 'v1', sessionHash: 's1', source: 'douyin', createdAt: recent },
    { eventName: 'visit', visitorHash: 'v2', sessionHash: 's2', source: 'direct', createdAt: recent },
    { eventName: 'visit', visitorHash: 'v3', sessionHash: 's3', source: 'qa-deploy', createdAt: recent },
  ];
  const summary = teacherDashboard._test.summarizeFunnel(events, 7, now);
  assert.deepEqual(summary, {
    days: 7,
    visitors: 2,
    visits: 2,
    starts: 1,
    completes: 1,
    startRate: 50,
    completionRate: 100,
    visitToCompleteRate: 50,
  });
  assert.deepEqual(teacherDashboard._test.summarizeSources(events, 30, now), [
    { source: 'douyin', visits: 1, starts: 1, completes: 1 },
    { source: 'direct', visits: 1, starts: 0, completes: 0 },
  ]);

  const dashboard = parse(await teacherDashboard.main({
    httpMethod: 'POST',
    body: JSON.stringify({ accessToken: 'teacher-token' }),
  }));
  assert.equal(dashboard.status, 200);
  assert.equal(dashboard.body.ok, true);
  assert.ok(dashboard.body.analytics);

  console.log('minimal analytics checks: 20 assertions passed');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
