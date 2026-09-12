export interface Challenge {
  stem: string;
  options: string[];
  answer: number;
  explanation: string;
  type?: 'choice' | 'fill';
  fillAnswers?: string[];
  source?: string;
  scenario?: string; // 情景引入（用于例题包装）
  scenarioImage?: string; // 情景配图
  misconceptionTag?: string; // 本题答错时优先记录的错因标签
}

export interface BigQuestion {
  context: string;
  subQuestions: Challenge[];
}

export interface ReviewMaterial {
  title: string;
  href: string;
  kind?: 'paper' | 'answer' | 'handout';
  source?: string;
  note?: string;
  highlights?: string[];
  relatedNodeIds?: string[];
  strategy?: string[];
}

export interface LearningContent {
  concept: string;
  conceptImage?: string;        // 概念示意图 URL
  keywords?: { word: string; note: string }[]; // 关键词注释
  example: Challenge;
  whyWrong?: string[];          // 例题每个错误选项的解释
  tips: string[];
  summary?: string;             // 课后总结
  examWeight: number;
  interactiveWidget?: string;   // 交互组件的名称
  interactiveWidgetMode?: 'embedded' | 'gated'; // gated: 完成互动后才展示知识整理
  flashcard?: { front: string; back: string }; // 卡片翻转记忆测试
  guidedSteps?: GuidedLessonStep[];
}

export interface GuidedLessonStep {
  title: string;
  eyebrow?: string;
  lead?: string;
  question: string;
  visual?: GuidedLessonVisual;
  options?: { text: string; correct?: boolean; feedback: string }[];
  revealTitle?: string;
  reveal: string;
  keyPoint?: string;
  quickCheck?: Challenge;
}

export type GuidedLessonVisualIcon =
  | 'bottle'
  | 'test-tube'
  | 'beaker'
  | 'evaporating-dish'
  | 'combustion-spoon'
  | 'round-flask'
  | 'graduated-cylinder'
  | 'conical-flask'
  | 'dropper'
  | 'reagent-bottle'
  | 'spatula'
  | 'alcohol-lamp'
  | 'gas-jar'
  | 'funnel'
  | 'balance'
  | 'separatory-funnel'
  | 'stand'
  | 'mortar'
  | 'direct-heat'
  | 'mesh-heat'
  | 'no-heat'
  | 'flame'
  | 'wire'
  | 'diamond'
  | 'ice'
  | 'rust'
  | 'pure'
  | 'mixture'
  | 'element'
  | 'atom'
  | 'molecule'
  | 'formula';

export type GuidedLessonMolecularModel =
  | 'air'
  | 'h2o'
  | 'liquid-water'
  | 'water-vapor'
  | 'water-phase-change'
  | 'water-sample-zoom'
  | 'co2'
  | 'h2o2'
  | 'o-atom'
  | 'oxygen-element-group'
  | 'o2'
  | 'h2'
  | '2h-atoms'
  | '2h2'
  | '2h2o'
  | '2h2-plus-o2'
  | '3co2';

export interface GuidedLessonVisual {
  layout?: 'pair' | 'grid' | 'wide';
  caption?: string;
  items: {
    icon: GuidedLessonVisualIcon;
    imageSrc?: string;
    imageAlt?: string;
    model?: GuidedLessonMolecularModel;
    title: string;
    note?: string;
    tone?: 'cyan' | 'amber' | 'emerald' | 'violet';
    answerLabel?: string;
  }[];
}

export type PlayModuleId = 'elements' | 'valence' | 'electronShell';

export interface PlayModule {
  id: PlayModuleId;
  title: string;
  description: string;
  icon: string;
}

export interface KnowledgePoint {
  id: string;
  topic: string;
  difficulty: number; // 1-3
  source?: string;
  /** 独立入口：可直接学习与挑战，不参与知识树的顺序解锁链。 */
  standaloneEntry?: boolean;
  prerequisites?: string[];
  challenges: Challenge[];
  bigQuestion?: BigQuestion;
  learningContent?: LearningContent;
  playModules?: PlayModule[];
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
  grade?: string;
  sortOrder?: number;
  sections: Section[];
  badge?: string;
  desc?: string;
  materials?: ReviewMaterial[];
}

export interface Course {
  id: string;
  name: string;
  shortName: string;
  region: string;
  stage: 'junior' | 'senior';
  examSystem: string;
  textbook?: string;
  status?: 'draft' | 'published';
  sourcePath?: string;
  description: string;
  modeSummary: string;
  gradeOrder: string[];
  chapters: Chapter[];
  reviewChapters?: Chapter[];
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

export interface WrongRecord {
  courseId?: string;
  nodeId: string;
  nodeTopic: string;
  challengeIdx: number;
  stem: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  misconceptionTag?: string;
  timestamp: string;
}

export interface PlayerState {
  version?: number;
  xp: number;
  level: number;
  streak: number;
  maxStreak: number;
  completedNodes: string[];
  unlockedNodes: string[];
  nodeStates: Record<string, NodeState>;
  achievements: string[];
  wrongList: WrongRecord[];
  completedChapters?: string[];
}

export interface StudentProfile {
  profileId: string;
  classCode: string;
  className: string;
  studentName: string;
  studentId?: string;
  displayName?: string;
  avatar?: string;
  dashboardToken?: string;
  socialToken?: string;
  pin?: string;
  createdAt: string;
}

export const AVATAR_POOL: { name: string; src: string }[] = [
  { name: '🔬', src: '🔬' },
  { name: '⚗️', src: '⚗️' },
  { name: '🧪', src: '🧪' },
  { name: '💎', src: '💎' },
  { name: '⚡', src: '⚡' },
  { name: '🔥', src: '🔥' },
  { name: '🌿', src: '🌿' },
  { name: '瓶中小影', src: '/avatars/alchemy/flask-homunculus.webp' },
  { name: '机械炼金少年', src: '/avatars/alchemy/mechanical-alchemist.webp' },
  { name: '铠甲弟弟', src: '/avatars/alchemy/armor-brother.webp' },
  { name: '长生贤者', src: '/avatars/alchemy/wandering-sage.webp' },
  { name: '城墙新兵', src: '/avatars/alchemy/wall-scout.webp' },
  { name: '冷面兵长', src: '/avatars/alchemy/stoic-captain.webp' },
  { name: '烧瓶小人', src: '/avatars/flask-idle.svg' },
  { name: '牢大', src: '/avatars/OIP.56aDw0yiVvAEhBe0LjPjiQAAAA.jpeg' },
  { name: '大白', src: '/avatars/OIP.5x4js4e01UNOxSsUZh-DYQAAAA.webp' },
  { name: '叮咚鸡', src: '/avatars/OIP.DbRsfHa6mcFN8II-xZV_GwHaHa.jpeg' },
  { name: '大狗叫', src: '/avatars/OIP.KDVwkXaIgSqhDUDhOQBpJQAAAA.jpeg' },
  { name: '🏀', src: '/avatars/OIP.S_HKu306npyN-TZV72GZcAHaHa.webp' },
  { name: '拉瓦锡', src: '/avatars/OIP.U3j2WP6pgxEjAT__M5n2bwAAAA.jpeg' },
  { name: '布丁', src: '/avatars/OIP.b1TBaFy8V-Hs6U13PSxkGgHaKe.jpeg' },
  { name: '将军', src: '/avatars/OIP.qW7IUVG0BZSyVHBiRnm9iQHaHa.jpeg' },
  { name: '波风水门', src: '/avatars/OIP.zoB1DmZadgep47SZ9YrQLgHaHa.jpeg' },
  { name: '乡村音乐', src: '/avatars/country music.jpg' },
  { name: '法拉利', src: '/avatars/Ferrari and Lake.jpg' },
  { name: '耶稣', src: '/avatars/JesuswithGod.jpg' },
  { name: '帮派', src: '/avatars/gang.jpg' },
  { name: '三角洲', src: '/avatars/三角洲特种兵.jpg' },
  { name: 'TETO', src: '/avatars/TETO.jpg' },
  { name: '鸟鸟我', src: '/avatars/鸟鸟我.jpg' },
  { name: '鸟不鸟你', src: '/avatars/鸟不鸟你.jpg' },
  { name: '我要上天', src: '/avatars/我要上天.jpg' },
  { name: '高冷女神', src: '/avatars/高冷女神.jpg' },
  { name: '生闷气', src: '/avatars/生闷气.jpg' },
  { name: '小可爱本尊', src: '/avatars/小可爱本尊.jpg' },
  { name: '负分滚出', src: '/avatars/负分滚出.jpg' },
  { name: '我已发疯', src: '/avatars/我已发疯.jpg' },
  { name: '小艾', src: '/avatars/小艾.jpg' },
];

export interface ClassAccess {
  classCode: string;
  className: string;
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
