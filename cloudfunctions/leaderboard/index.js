const cloudbase = require('@cloudbase/node-sdk');
const crypto = require('crypto');

const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();

const TRAINERS = [
  { studentId: '__trainer_oxygen', name: '阿氧', avatar: '🫧', xp: 260, level: 3, completed: 18, streak: 5, trainer: true },
  { studentId: '__trainer_copper', name: '小铜', avatar: '🟠', xp: 180, level: 2, completed: 12, streak: 3, trainer: true },
  { studentId: '__trainer_flask', name: '烧瓶仔', avatar: '⚗️', xp: 110, level: 2, completed: 7, streak: 2, trainer: true },
];

function stateWeight(state) {
  const completed = (state?.completedNodes || []).length;
  const unlocked = (state?.unlockedNodes || []).length;
  return completed + unlocked;
}

function isRicherState(next, current) {
  if (!current) return true;
  const progressDelta = stateWeight(next) - stateWeight(current);
  if (progressDelta !== 0) return progressDelta > 0;
  return (next?.xp || 0) > (current?.xp || 0);
}

function baseStudentKey(studentKey) {
  const parts = String(studentKey || '').split(':');
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : studentKey;
}

function json(body, code = 200) {
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  };
}

function tokenMatches(student, token) {
  if (!student?.socialTokenHash || !student?.socialTokenExpiresAt || !token) return false;
  if (Date.parse(student.socialTokenExpiresAt) <= Date.now()) return false;
  const actual = crypto.createHash('sha256').update(String(token)).digest();
  const expected = Buffer.from(student.socialTokenHash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

async function authenticate(payload) {
  const classCode = String(payload?.classCode ?? '').trim().toUpperCase();
  const studentId = String(payload?.studentId ?? '').trim();
  const socialToken = String(payload?.socialToken ?? '').trim();
  if (!classCode || !studentId || !socialToken) return null;

  const res = await db.collection('students').where({ classCode, studentId }).limit(1).get();
  const student = res.data?.[0];
  return tokenMatches(student, socialToken) ? student : null;
}

async function loadProgressMap() {
  const progressRes = await db.collection('progress')
    .field({ studentKey: true, state: true })
    .limit(500)
    .get();
  const progressMap = new Map();
  for (const p of progressRes.data || []) {
    if (!p.studentKey || !p.state) continue;
    const key = baseStudentKey(p.studentKey);
    if (isRicherState(p.state, progressMap.get(key))) progressMap.set(key, p.state);
  }
  return progressMap;
}

function toRankEntry(student, progress, requesterId) {
  return {
    studentId: student.studentId,
    name: student.displayName || student.studentId,
    avatar: student.avatar || '🔬',
    xp: progress?.xp || 0,
    level: progress?.level || 1,
    completed: (progress?.completedNodes || []).length,
    streak: progress?.maxStreak || 0,
    cheersReceived: student.cheersReceived || 0,
    isMe: student.studentId === requesterId,
  };
}

async function getGlobalLeaderboard() {
  const [studentsRes, progressMap] = await Promise.all([
    db.collection('students')
      .field({ studentId: true, displayName: true, avatar: true, classCode: true })
      .limit(500)
      .get(),
    loadProgressMap(),
  ]);

  const rankings = [];
  for (const student of studentsRes.data || []) {
    const progress = progressMap.get(`${student.classCode || ''}:${student.studentId}`);
    if (progress) rankings.push(toRankEntry(student, progress, ''));
  }
  rankings.push(...TRAINERS);
  rankings.sort((a, b) => b.xp - a.xp);
  return rankings.slice(0, 50);
}

async function getClassProgress(payload, requester) {
  const classCode = requester.classCode;
  const [studentsRes, progressMap] = await Promise.all([
    db.collection('students')
      .where({ classCode })
      .field({ studentId: true, displayName: true, avatar: true, classCode: true, cheersReceived: true })
      .limit(200)
      .get(),
    loadProgressMap(),
  ]);

  const realEntries = (studentsRes.data || []).map(student => (
    toRankEntry(student, progressMap.get(`${classCode}:${student.studentId}`), requester.studentId)
  ));
  realEntries.sort((a, b) => Number(b.isMe) - Number(a.isMe) || b.completed - a.completed || b.xp - a.xp);

  const completedTotal = realEntries.reduce((sum, entry) => sum + entry.completed, 0);
  const target = Math.max(40, realEntries.length * 24);
  return {
    ok: true,
    rankings: [...realEntries, ...TRAINERS.map(trainer => ({ ...trainer, cheersReceived: 0, isMe: false }))],
    goal: { current: completedTotal, target, realStudents: realEntries.length },
  };
}

async function cheer(payload, requester) {
  const targetStudentId = String(payload?.targetStudentId ?? '').trim();
  if (!targetStudentId || targetStudentId === requester.studentId || targetStudentId.startsWith('__trainer_')) {
    return json({ ok: false, message: '不能给这个成员加油' }, 400);
  }

  const targetRes = await db.collection('students')
    .where({ classCode: requester.classCode, studentId: targetStudentId })
    .limit(1)
    .get();
  const target = targetRes.data?.[0];
  if (!target) return json({ ok: false, message: '没有找到这位同学' }, 404);

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
  const cheerKey = `${targetStudentId}:${today}`;
  const cheerLog = Array.isArray(requester.cheerLog) ? requester.cheerLog : [];
  if (cheerLog.includes(cheerKey)) return json({ ok: true, already: true, message: '今天已经为 TA 加过油啦' });

  await Promise.all([
    db.collection('students').doc(target._id).update({ cheersReceived: db.command.inc(1) }),
    db.collection('students').doc(requester._id).update({ cheerLog: [...cheerLog, cheerKey].slice(-60) }),
  ]);
  return json({ ok: true, message: '加油送达！' });
}

exports.main = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') return json({ ok: true });
    if (event.httpMethod === 'GET' || !event.httpMethod) {
      return json({ ok: true, rankings: await getGlobalLeaderboard() });
    }

    const payload = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : (event.body || {});
    const requester = await authenticate(payload);
    if (!requester) return json({ ok: false, message: '登录状态已过期，请重新登录' }, 401);

    if (payload.action === 'classProgress') return json(await getClassProgress(payload, requester));
    if (payload.action === 'cheer') return cheer(payload, requester);
    return json({ ok: false, message: '未知操作' }, 400);
  } catch (err) {
    return json({ ok: false, message: '服务器错误: ' + (err.message ?? String(err)) }, 500);
  }
};
