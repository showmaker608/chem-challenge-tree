const BASE = import.meta.env.VITE_CLOUD_FUNCTION_BASE;

export interface ClassStat {
  classCode: string;
  className: string;
  maxUses: number;
  total: number;
  active: number;
  totalCompleted: number;
  totalXp: number;
}

export interface WrongStat { topic: string; stem: string; count: number }

export interface StudentInfo {
  studentId: string; name: string; classCode: string;
  xp: number; completed: number; createdAt: string;
  completedNodes?: string[];
  wrongList?: { nodeId: string; nodeTopic: string; stem: string }[];
}

export interface FeedbackInfo {
  studentName: string; nodeTopic: string; stem: string;
  comment: string; createdAt: string;
}

export interface FunnelWindow {
  days: number;
  visitors: number;
  visits: number;
  starts: number;
  completes: number;
  startRate: number;
  completionRate: number;
  visitToCompleteRate: number;
}

export interface FunnelSource {
  source: string;
  visits: number;
  starts: number;
  completes: number;
}

export interface DashboardData {
  ok: boolean;
  overview: { totalStudents: number; activeStudents: number; totalCompleted: number; totalXp: number };
  classes: ClassStat[];
  topWrongs: WrongStat[];
  students: StudentInfo[];
  feedbacks: FeedbackInfo[];
  analytics: {
    sevenDays: FunnelWindow;
    thirtyDays: FunnelWindow;
    sources: FunnelSource[];
    sampleLimitReached: boolean;
  };
}

export async function getDashboard(accessToken: string): Promise<DashboardData | null> {
  if (!BASE || !accessToken) return null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(`${BASE}/teacherDashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) continue;
      return await res.json();
    } catch {
      if (attempt === 1) return null;
    }
  }
  return null;
}
