import type { StudentProfile, PlayerState } from '../types';

const BASE = import.meta.env.VITE_CLOUD_FUNCTION_BASE;

interface AuthResult {
  ok: boolean;
  profile?: StudentProfile & { studentId?: string };
  progress?: PlayerState | null;
  message?: string;
}

// 注册（首次，消耗邀请码名额）
export async function cloudRegister(
  classCode: string,
  studentId: string,
  studentName: string,
  password: string,
  courseId: string,
): Promise<AuthResult> {
  if (!BASE) return { ok: false, message: '云端服务未配置' };

  try {
    const res = await fetch(`${BASE}/studentLogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        classCode: classCode.trim().toUpperCase(),
        studentId: studentId.trim(),
        studentName: studentName.trim(),
        password: password,
        courseId,
      }),
    });

    if (!res.ok) return { ok: false, message: '注册服务暂时不可用' };
    return await res.json();
  } catch {
    return { ok: false, message: '网络连接失败，请检查网络后重试' };
  }
}

// 登录（不消耗邀请码名额）
export async function cloudLogin(
  classCode: string,
  studentId: string,
  password: string,
  courseId: string,
): Promise<AuthResult> {
  if (!BASE) return { ok: false, message: '云端服务未配置' };

  try {
    const res = await fetch(`${BASE}/studentLogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        classCode: classCode.trim().toUpperCase(),
        studentId: studentId.trim(),
        password: password,
        courseId,
      }),
    });

    if (!res.ok) return { ok: false, message: '登录服务暂时不可用' };
    return await res.json();
  } catch {
    return { ok: false, message: '网络连接失败，请检查网络后重试' };
  }
}

// 同步进度
export async function cloudSyncProgress(
  classCode: string,
  studentId: string,
  state: PlayerState,
  courseId: string,
): Promise<boolean> {
  if (!BASE) return false;

  try {
    await fetch(`${BASE}/syncProgress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classCode, studentId, state, courseId }),
    });
    return true;
  } catch {
    return false;
  }
}

// 更新学生资料（昵称、头像同步到云端）
export async function cloudUpdateProfile(
  classCode: string,
  studentId: string,
  displayName: string,
  avatar: string,
): Promise<boolean> {
  if (!BASE) return false;
  try {
    const res = await fetch(`${BASE}/studentLogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateProfile', classCode, studentId, displayName, avatar }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 读取进度
export async function cloudLoadProgress(
  classCode: string,
  studentId: string,
  courseId: string,
): Promise<PlayerState | null> {
  if (!BASE) return null;

  try {
    const res = await fetch(`${BASE}/syncProgress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classCode, studentId, state: null, courseId }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.progress ?? null;
  } catch {
    return null;
  }
}
