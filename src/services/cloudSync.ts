import type { StudentProfile, PlayerState } from '../types';

const BASE = import.meta.env.VITE_CLOUD_FUNCTION_BASE;

interface LoginResult {
  ok: boolean;
  profile?: StudentProfile & { studentId?: string };
  progress?: PlayerState | null;
  message?: string;
}

export async function cloudLogin(
  classCode: string,
  studentId: string,
  pin: string,
): Promise<LoginResult> {
  if (!BASE) {
    return { ok: false, message: '云端服务未配置' };
  }

  try {
    const res = await fetch(`${BASE}/studentLogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classCode: classCode.trim().toUpperCase(), studentId: studentId.trim(), pin: pin.trim() }),
    });

    if (!res.ok) {
      return { ok: false, message: '登录服务暂时不可用' };
    }

    const data = await res.json();
    return data;
  } catch {
    return { ok: false, message: '网络连接失败，请检查网络后重试' };
  }
}

export async function cloudSyncProgress(
  classCode: string,
  studentId: string,
  state: PlayerState,
): Promise<boolean> {
  if (!BASE) return false;

  try {
    await fetch(`${BASE}/syncProgress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classCode, studentId, state }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function cloudLoadProgress(
  classCode: string,
  studentId: string,
): Promise<PlayerState | null> {
  if (!BASE) return null;

  try {
    const res = await fetch(`${BASE}/syncProgress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classCode, studentId, state: null }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.progress ?? null;
  } catch {
    return null;
  }
}
