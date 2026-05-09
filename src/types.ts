export interface Challenge {
  stem: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface KnowledgePoint {
  id: string;
  topic: string;
  difficulty: number; // 1-3
  challenges: Challenge[];
}

export interface Section {
  id: string;
  title: string;
  nodes: KnowledgePoint[];
}

export interface Chapter {
  id: string;
  name: string;
  icon: string;
  sections: Section[];
}

export interface Zone {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface TreeData {
  zones: Zone[];
}

export interface NodeState {
  status: 'locked' | 'available' | 'completed';
  bestScore: number;
  attempts: number;
}

export interface PlayerState {
  xp: number;
  level: number;
  streak: number;
  maxStreak: number;
  completedNodes: string[];
  nodeStates: Record<string, NodeState>;
  achievements: string[];
}

// 等级定义
export const LEVELS = [
  { level: 1, name: '化学小白', xp: 0, icon: '☁️' },
  { level: 2, name: '初窥门径', xp: 100, icon: '🌱' },
  { level: 3, name: '略有小成', xp: 250, icon: '🌿' },
  { level: 4, name: '驾轻就熟', xp: 500, icon: '🌳' },
  { level: 5, name: '融会贯通', xp: 800, icon: '⚡' },
  { level: 6, name: '出类拔萃', xp: 1200, icon: '🔥' },
  { level: 7, name: '炉火纯青', xp: 1800, icon: '💎' },
  { level: 8, name: '登峰造极', xp: 2500, icon: '🏆' },
  { level: 9, name: '化学大师', xp: 3500, icon: '👑' },
  { level: 10, name: '元素之主', xp: 5000, icon: '🌟' },
] as const;

export type LevelInfo = (typeof LEVELS)[number];

export function getLevel(xp: number): LevelInfo {
  let current: LevelInfo = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xp) current = lvl;
    else break;
  }
  return current;
}

export function getNextLevel(xp: number): LevelInfo | null {
  for (const lvl of LEVELS) {
    if (xp < lvl.xp) return lvl;
  }
  return null;
}

export const XP_PER_NODE = 30;
export const XP_BONUS_STREAK = 10;
