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
  const pin = String(payload?.pin ?? '').trim();

  if (!classCode || !studentId || !pin) {
    return json({ ok: false, message: '请填写班级码、学号和 PIN' }, 400);
  }

  if (!/^\d{4}$/.test(pin)) {
    return json({ ok: false, message: 'PIN 格式不正确' }, 400);
  }

  // 1. 查班级码
  const classRes = await db.collection('classes').where({ classCode, active: true }).limit(1).get();
  const [classRecord] = classRes.data ?? [];
  if (!classRecord) {
    return json({ ok: false, message: '班级码不存在或已停用' });
  }

  // 2. 查学生（classCode + studentId 唯一）
  const studentRes = await db.collection('students')
    .where({ classCode, studentId })
    .limit(1).get();
  const [student] = studentRes.data ?? [];

  if (!student) {
    // 首次登录：自动注册
    const newStudent = {
      classCode,
      className: classRecord.className,
      studentId,
      studentName: studentId,
      pin,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection('students').add(newStudent);

    return json({
      ok: true,
      profile: {
        profileId: `${classCode}:${studentId}:${pin}`,
        classCode,
        className: classRecord.className,
        studentName: studentId,
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

  // 更新时间
  await db.collection('students').doc(student._id).update({ updatedAt: new Date().toISOString() });

  // 3. 读取进度
  const progressRes = await db.collection('progress')
    .where({ studentKey: `${classCode}:${studentId}` })
    .limit(1).get();
  const [progress] = progressRes.data ?? [];

  return json({
    ok: true,
    profile: {
      profileId: `${classCode}:${studentId}:${pin}`,
      classCode,
      className: classRecord.className,
      studentName: studentId,
      pin,
      createdAt: student.createdAt,
    },
    progress: progress?.state ?? null,
  });
};
