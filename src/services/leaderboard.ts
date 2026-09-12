const BASE = import.meta.env.VITE_CLOUD_FUNCTION_BASE;

export interface RankEntry {
  studentId: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  completed: number;
  streak: number;
  trainer?: boolean;
  cheersReceived?: number;
  isMe?: boolean;
}

export interface ClassProgressResult {
  ok: boolean;
  rankings: RankEntry[];
  goal: { current: number; target: number; realStudents: number };
  message?: string;
  needsRelogin?: boolean;
}

async function fetchJson(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return { res, data: await res.json() };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getLeaderboard(): Promise<RankEntry[]> {
  if (!BASE) return [];
  // 尝试两次，防止偶尔超时
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { res, data } = await fetchJson(`${BASE}/leaderboard`);
      if (!res.ok) continue;
      return data.rankings ?? [];
    } catch {
      if (attempt === 1) return [];
    }
  }
  return [];
}

export async function getClassProgress(input: {
  classCode: string;
  studentId: string;
  socialToken: string;
}): Promise<ClassProgressResult> {
  if (!BASE) return { ok: false, rankings: [], goal: { current: 0, target: 40, realStudents: 0 }, message: '云端服务未配置' };
  if (import.meta.env.DEV && !input.socialToken) {
    return {
      ok: true,
      rankings: [
        { studentId: input.studentId, name: '我', avatar: '🔬', xp: 190, level: 2, completed: 14, streak: 4, cheersReceived: 3, isMe: true },
        { studentId: '__preview_classmate', name: '元素侦探', avatar: '🧪', xp: 150, level: 2, completed: 10, streak: 3, cheersReceived: 2 },
        { studentId: '__trainer_oxygen', name: '阿氧', avatar: '🫧', xp: 260, level: 3, completed: 18, streak: 5, trainer: true },
        { studentId: '__trainer_copper', name: '小铜', avatar: '🟠', xp: 180, level: 2, completed: 12, streak: 3, trainer: true },
      ],
      goal: { current: 24, target: 48, realStudents: 2 },
    };
  }
  if (!input.socialToken) {
    return { ok: false, rankings: [], goal: { current: 0, target: 40, realStudents: 0 }, message: '重新登录后即可查看同班进度', needsRelogin: true };
  }

  try {
    const { res, data } = await fetchJson(`${BASE}/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'classProgress', ...input }),
    });
    if (!res.ok) {
      return { ok: false, rankings: [], goal: { current: 0, target: 40, realStudents: 0 }, message: data.message || '同班进度暂时不可用', needsRelogin: res.status === 401 };
    }
    return data;
  } catch {
    return { ok: false, rankings: [], goal: { current: 0, target: 40, realStudents: 0 }, message: '网络连接失败，请稍后重试' };
  }
}

export async function sendCheer(input: {
  classCode: string;
  studentId: string;
  socialToken: string;
  targetStudentId: string;
}): Promise<{ ok: boolean; already?: boolean; message?: string }> {
  if (!BASE || !input.socialToken) return { ok: false, message: '重新登录后再来加油' };
  try {
    const { res, data } = await fetchJson(`${BASE}/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cheer', ...input }),
    });
    return res.ok ? data : { ok: false, message: data.message || '加油失败，请稍后再试' };
  } catch {
    return { ok: false, message: '网络连接失败，请稍后再试' };
  }
}
