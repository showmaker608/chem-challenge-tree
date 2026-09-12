const cloudbase = require('@cloudbase/node-sdk');
const crypto = require('crypto');

const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV });
const db = app.database();
const DEFAULT_COURSE_ID = 'shanghai-junior-chemistry';
const DASHBOARD_CLASS_CODE = 'CHEM莲花';
const DASHBOARD_STUDENT_ID = '0815';
const DASHBOARD_SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const SOCIAL_SESSION_MS = 30 * 24 * 60 * 60 * 1000;

function isDashboardAccount(classCode, studentId) {
  return classCode === DASHBOARD_CLASS_CODE && studentId === DASHBOARD_STUDENT_ID;
}

async function issueDashboardToken(studentDocId, classCode, studentId) {
  if (!studentDocId || !isDashboardAccount(classCode, studentId)) return '';

  const token = crypto.randomBytes(32).toString('hex');
  await db.collection('students').doc(studentDocId).update({
    dashboardTokenHash: crypto.createHash('sha256').update(token).digest('hex'),
    dashboardTokenExpiresAt: new Date(Date.now() + DASHBOARD_SESSION_MS).toISOString(),
  });
  return token;
}

async function issueSocialToken(studentDocId) {
  if (!studentDocId) return '';

  const token = crypto.randomBytes(32).toString('hex');
  await db.collection('students').doc(studentDocId).update({
    socialTokenHash: crypto.createHash('sha256').update(token).digest('hex'),
    socialTokenExpiresAt: new Date(Date.now() + SOCIAL_SESSION_MS).toISOString(),
  });
  return token;
}

function progressWeight(progress) {
  const state = progress?.state ?? progress;
  const completed = (state?.completedNodes || []).length;
  const unlocked = (state?.unlockedNodes || []).length;
  return completed + unlocked;
}

function pickRicherProgress(items) {
  return items
    .filter(Boolean)
    .sort((a, b) => {
      const progressDelta = progressWeight(b) - progressWeight(a);
      if (progressDelta !== 0) return progressDelta;
      return ((b?.state ?? b)?.xp || 0) - ((a?.state ?? a)?.xp || 0);
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

exports.main = async (event) => {
  try {
    if (event.httpMethod === 'OPTIONS') return json({ ok: true });

    const payload = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const action = payload?.action || 'login';
    const inviteCode = String(payload?.classCode ?? '').trim().toUpperCase();
    const studentId = String(payload?.studentId ?? '').trim();
    const password = String(payload?.password ?? '').trim();
    const courseId = String(payload?.courseId ?? DEFAULT_COURSE_ID).trim() || DEFAULT_COURSE_ID;

    // ======== 更新资料（不需要密码）========
    if (action === 'updateProfile') {
      const displayName = String(payload?.displayName ?? '').trim();
      const avatar = String(payload?.avatar ?? '').trim();
      if (!inviteCode || !studentId) {
        return json({ ok: false, message: '缺少参数' }, 400);
      }
      // 先按 classCode + studentId 查询
      let studentRes = await db.collection('students')
        .where({ classCode: inviteCode, studentId }).limit(1).get();

      // 如果未查到，且可能是旧版将 studentName 误作 studentId 传入，则按 studentName 兜底查询
      if (!studentRes.data?.length) {
        studentRes = await db.collection('students')
          .where({ classCode: inviteCode, studentName: studentId }).limit(1).get();
      }

      if (!studentRes.data?.length) {
        return json({ ok: false, message: '学生不存在' });
      }
      await db.collection('students').doc(studentRes.data[0]._id).update({
        displayName: displayName || '',
        avatar: avatar || '',
        updatedAt: new Date().toISOString(),
      });
      return json({ ok: true });
    }

    if (!inviteCode || !studentId || !password) {
      return json({ ok: false, message: '请填写邀请码、学号和密码' }, 400);
    }

    // 1. 查邀请码
    const invRes = await db.collection('invitations').where({ code: inviteCode, active: true }).limit(1).get();
    if (!invRes.data?.length) {
      return json({ ok: false, message: '邀请码不存在或已停用' });
    }
    const classRecord = invRes.data[0];
    const className = classRecord.className ?? '';

    // ======== 注册 ========
    if (action === 'register') {
      const studentName = String(payload?.studentName ?? '').trim();
      if (!studentName) {
        return json({ ok: false, message: '请填写姓名' }, 400);
      }

      // 检查名额
      if (classRecord.maxUses && (classRecord.usedCount ?? 0) >= classRecord.maxUses) {
        return json({ ok: false, message: '邀请码已用完，请联系老师' });
      }

      // 检查学号是否已存在
      const existRes = await db.collection('students')
        .where({ classCode: inviteCode, studentId }).limit(1).get();
      if (existRes.data?.length) {
        return json({ ok: false, message: '该学号已被注册，请换一个或直接登录' });
      }

      // 创建学生
      const createdStudent = await db.collection('students').add({
        classCode: inviteCode,
        className,
        studentId,
        studentName,
        password, // 生产环境建议 hash
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      const dashboardToken = await issueDashboardToken(createdStudent.id, inviteCode, studentId);
      const socialToken = await issueSocialToken(createdStudent.id);

      // 消耗名额（仅注册时）
      if (classRecord._id) {
        await db.collection('invitations').doc(classRecord._id).update({
          usedCount: (classRecord.usedCount ?? 0) + 1,
        });
      }

      return json({
        ok: true,
        profile: {
          profileId: `${inviteCode}:${studentId}`,
          classCode: inviteCode,
          className,
          studentName,
          studentId,
          createdAt: new Date().toISOString(),
          dashboardToken,
          socialToken,
        },
        progress: null,
      });
    }

    // ======== 登录 ========
    const studentRes = await db.collection('students')
      .where({ classCode: inviteCode, studentId, password })
      .limit(1).get();

    if (!studentRes.data?.length) {
      return json({ ok: false, message: '学号或密码错误，请重试' });
    }

    const student = studentRes.data[0];
    await db.collection('students').doc(student._id).update({ updatedAt: new Date().toISOString() });
    const dashboardToken = await issueDashboardToken(student._id, inviteCode, studentId);
    const socialToken = await issueSocialToken(student._id);

    // 同步昵称和头像（如果学生之前在别的设备设置过但没同步到云端，这里补上）
    if (!student.displayName && payload?.displayName) {
      await db.collection('students').doc(student._id).update({ displayName: payload.displayName });
      student.displayName = payload.displayName;
    }
    if (!student.avatar && payload?.avatar) {
      await db.collection('students').doc(student._id).update({ avatar: payload.avatar });
      student.avatar = payload.avatar;
    }

    // 读进度：兼容旧 studentKey 与课程化 studentKey，取更完整的一份
    const courseProgressRes = await db.collection('progress')
      .where({ studentKey: `${inviteCode}:${studentId}:${courseId}` })
      .limit(1).get();
    let legacyProgress = null;
    if (courseId === DEFAULT_COURSE_ID) {
      const legacyProgressRes = await db.collection('progress')
        .where({ studentKey: `${inviteCode}:${studentId}` })
        .limit(1).get();
      legacyProgress = legacyProgressRes.data?.[0] ?? null;
    }
    const progress = pickRicherProgress([
      courseProgressRes.data?.[0] ?? null,
      legacyProgress,
    ]);

    return json({
      ok: true,
      profile: {
        profileId: `${inviteCode}:${studentId}`,
        classCode: inviteCode,
        className: student.className ?? className,
        studentName: student.studentName,
        studentId: student.studentId,
        displayName: student.displayName || '',
        avatar: student.avatar || '',
        createdAt: student.createdAt,
        dashboardToken,
        socialToken,
      },
      progress: progress?.state ?? null,
    });
  } catch (err) {
    return json({ ok: false, message: '服务器错误: ' + (err.message ?? String(err)) }, 500);
  }
};
