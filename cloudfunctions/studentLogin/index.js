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

  const inviteCode = String(payload?.classCode ?? '').trim().toUpperCase();
  const studentName = String(payload?.studentId ?? '').trim();
  const pin = String(payload?.pin ?? '').trim();

  if (!inviteCode || !studentName || !pin) {
    return json({ ok: false, message: '请填写邀请码、姓名和 PIN' }, 400);
  }

  if (!/^\d{4}$/.test(pin)) {
    return json({ ok: false, message: 'PIN 请输入 4 位数字' }, 400);
  }

  // 1. 查邀请码（优先查 invitations，兼容 classes）
  let classRecord = null;
  const invRes = await db.collection('invitations').where({ code: inviteCode, active: true }).limit(1).get();
  if (invRes.data?.length) {
    classRecord = invRes.data[0];
    if (classRecord.maxUses && classRecord.usedCount >= classRecord.maxUses) {
      return json({ ok: false, message: '邀请码已用完，请联系老师获取新码' });
    }
  } else {
    // 向后兼容 classes 集合
    const classRes = await db.collection('classes').where({ classCode: inviteCode, active: true }).limit(1).get();
    if (classRes.data?.length) {
      classRecord = classRes.data[0];
    }
  }

  if (!classRecord) {
    return json({ ok: false, message: '邀请码不存在或已停用，请向老师确认' });
  }

  const className = classRecord.className ?? classRecord.name ?? '';

  // 2. 查学生（inviteCode + studentName 唯一）
  const studentRes = await db.collection('students')
    .where({ classCode: inviteCode, studentId: studentName })
    .limit(1).get();
  const [student] = studentRes.data ?? [];

  if (!student) {
    // 首次登录：自动注册 + 扣减邀请码次数
    const newStudent = {
      classCode: inviteCode,
      className,
      studentId: studentName,
      studentName,
      pin,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection('students').add(newStudent);

    // 扣减 invitations 次数
    if (invRes.data?.length) {
      await db.collection('invitations').doc(classRecord._id).update({
        usedCount: (classRecord.usedCount ?? 0) + 1,
      });
    }

    return json({
      ok: true,
      profile: {
        profileId: `${inviteCode}:${studentName}:${pin}`,
        classCode: inviteCode,
        className,
        studentName,
        pin,
        createdAt: newStudent.createdAt,
      },
      progress: null,
    });
  }

  // 已有学生：校验 PIN
  if (student.pin !== pin) {
    return json({ ok: false, message: 'PIN 不正确，如忘记请联系老师重置' });
  }

  await db.collection('students').doc(student._id).update({ updatedAt: new Date().toISOString() });

  // 3. 读取进度
  const progressRes = await db.collection('progress')
    .where({ studentKey: `${inviteCode}:${studentName}` })
    .limit(1).get();
  const [progress] = progressRes.data ?? [];

  return json({
    ok: true,
    profile: {
      profileId: `${inviteCode}:${studentName}:${pin}`,
      classCode: inviteCode,
      className,
      studentName,
      pin,
      createdAt: student.createdAt,
    },
    progress: progress?.state ?? null,
  });
};
