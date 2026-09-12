import type { Chapter, Course, KnowledgePoint, Section } from '../types';

const TEXTBOOK_ROOT = '/Users/xudingkun/Downloads/上海高中化学/上海高中化学教材';

type TextbookTag = {
  grade: string;
  badge: string;
  desc: string;
  icon: string;
};

type TextbookTopic = string | { title: string; importance: number };

function requiredTag(grade: string): TextbookTag {
  return {
    grade,
    badge: '全国必修 · 上海必修',
    desc: '高中化学共同基础，所有学生都要学',
    icon: '📘',
  };
}

function selectiveTag(grade: string): TextbookTag {
  return {
    grade,
    badge: '全国选考必修 · 上海等级考必修',
    desc: '选择化学方向必学；上海等级考按必学内容处理',
    icon: '📗',
  };
}

const requiredBook1 = requiredTag('必修第一册');
const requiredBook2 = requiredTag('必修第二册');
const selectiveBook1 = selectiveTag('选择性必修1');
const selectiveBook2 = selectiveTag('选择性必修2');
const selectiveBook3 = selectiveTag('选择性必修3');

function makeNode(id: string, topic: string, difficulty = 1): KnowledgePoint {
  return {
    id,
    topic,
    difficulty,
    challenges: [],
  };
}

function resolveTopic(topic: TextbookTopic, fallbackImportance: number) {
  if (typeof topic === 'string') return { title: topic, importance: fallbackImportance };
  return topic;
}

function makeSection(id: string, title: string, topics: TextbookTopic[], difficulty = 1): Section {
  return {
    id,
    title,
    nodes: topics.map((topic, index) => {
      const item = resolveTopic(topic, difficulty);
      return makeNode(`${id}-n${index + 1}`, item.title, item.importance);
    }),
  };
}

function makeChapter(
  id: string,
  tag: TextbookTag,
  sortOrder: number,
  name: string,
  sectionTitle: string,
  topics: TextbookTopic[],
  difficulty = 1,
): Chapter {
  return {
    id,
    name,
    icon: tag.icon,
    grade: tag.grade,
    sortOrder,
    badge: tag.badge,
    desc: tag.desc,
    sections: [makeSection(`${id}-s1`, sectionTitle, topics, difficulty)],
  };
}

export const seniorTextbookChapters: Chapter[] = [
  makeChapter(
    'hs-b1-c1',
    requiredBook1,
    1,
    '第1章 化学研究的天地',
    '教材小节',
    [
      { title: '1.1 物质的分类', importance: 2 },
      { title: '1.2 物质的量', importance: 5 },
      { title: '1.3 化学中常用的实验方法', importance: 3 },
      { title: '项目学习：如何测定气体摩尔体积', importance: 2 },
    ],
  ),
  makeChapter(
    'hs-b1-c2',
    requiredBook1,
    2,
    '第2章 海洋中的卤素资源',
    '教材小节',
    [
      { title: '2.1 海水中的氯', importance: 4 },
      { title: '2.2 氧化还原反应和离子反应', importance: 5 },
      { title: '2.3 溴和碘的提取', importance: 3 },
    ],
    2,
  ),
  makeChapter(
    'hs-b1-c3',
    requiredBook1,
    3,
    '第3章 硫、氮及其循环',
    '教材小节',
    [
      { title: '3.1 硫及其重要化合物', importance: 4 },
      { title: '3.2 氮及其重要化合物', importance: 4 },
      { title: '3.3 硫循环和氮循环', importance: 3 },
      { title: '项目学习：如何测定硫酸铜晶体中结晶水的含量', importance: 3 },
    ],
    2,
  ),
  makeChapter(
    'hs-b1-c4',
    requiredBook1,
    4,
    '第4章 原子结构和化学键',
    '教材小节',
    [
      { title: '4.1 元素周期表和元素周期律', importance: 4 },
      { title: '4.2 原子结构', importance: 3 },
      { title: '4.3 核外电子排布', importance: 4 },
      { title: '4.4 化学键', importance: 5 },
    ],
    2,
  ),
  makeChapter(
    'hs-b2-c5',
    requiredBook2,
    5,
    '第5章 金属及其化合物',
    '教材小节',
    [
      { title: '5.1 金属的性质', importance: 3 },
      { title: '5.2 重要的金属化合物', importance: 4 },
      { title: '5.3 化学变化中的能量变化', importance: 3 },
    ],
    2,
  ),
  makeChapter(
    'hs-b2-c6',
    requiredBook2,
    6,
    '第6章 化学反应速率和化学平衡',
    '教材小节',
    [
      { title: '6.1 化学反应速率', importance: 4 },
      { title: '6.2 化学平衡', importance: 5 },
      { title: '6.3 化工生产', importance: 3 },
    ],
    2,
  ),
  makeChapter(
    'hs-b2-c7',
    requiredBook2,
    7,
    '第7章 常见的有机化合物',
    '教材小节',
    [
      { title: '7.1 饱和烃', importance: 3 },
      { title: '7.2 不饱和烃', importance: 4 },
      { title: '7.3 乙醇和乙酸', importance: 4 },
      { title: '7.4 糖、油脂和蛋白质', importance: 2 },
    ],
    2,
  ),
  makeChapter(
    'hs-x1-c1',
    selectiveBook1,
    8,
    '第1章 化学反应的热效应',
    '教材小节',
    [
      { title: '1.1 化学反应与能量变化', importance: 3 },
      { title: '1.2 反应热的测量和计算', importance: 4 },
      { title: '1.3 燃料的合理利用', importance: 2 },
    ],
    2,
  ),
  makeChapter(
    'hs-x1-c2',
    selectiveBook1,
    9,
    '第2章 化学反应的方向、限度和速率',
    '教材小节',
    [
      { title: '2.1 化学反应的方向', importance: 3 },
      { title: '2.2 化学反应的限度', importance: 5 },
      { title: '2.3 化学反应的速率', importance: 5 },
      { title: '2.4 工业合成氨', importance: 4 },
    ],
    3,
  ),
  makeChapter(
    'hs-x1-c3',
    selectiveBook1,
    10,
    '第3章 水溶液中的离子反应与平衡',
    '教材小节',
    [
      { title: '3.1 水的电离和溶液的酸碱性', importance: 4 },
      { title: '3.2 弱电解质的电离平衡', importance: 5 },
      { title: '3.3 酸碱中和与盐类水解', importance: 5 },
      { title: '3.4 难溶电解质的沉淀溶解平衡', importance: 5 },
    ],
    3,
  ),
  makeChapter(
    'hs-x1-c4',
    selectiveBook1,
    11,
    '第4章 氧化还原反应和电化学',
    '教材小节',
    [
      { title: '4.1 氧化还原反应', importance: 4 },
      { title: '4.2 原电池和化学电源', importance: 5 },
      { title: '4.3 电解池', importance: 5 },
      { title: '4.4 金属的电化学腐蚀与防护', importance: 4 },
    ],
    3,
  ),
  makeChapter(
    'hs-x2-c1',
    selectiveBook2,
    12,
    '第1章 原子结构与元素性质',
    '教材小节',
    [
      { title: '1.1 氢原子结构模型', importance: 3 },
      { title: '1.2 多电子原子核外电子的排布', importance: 5 },
      { title: '1.3 元素周期律', importance: 4 },
    ],
    3,
  ),
  makeChapter(
    'hs-x2-c2',
    selectiveBook2,
    13,
    '第2章 分子结构与性质',
    '教材小节',
    [
      { title: '2.1 共价分子的空间结构', importance: 5 },
      { title: '2.2 分子结构与物质的性质', importance: 5 },
      { title: '2.3 配位化合物和超分子', importance: 3 },
    ],
    3,
  ),
  makeChapter(
    'hs-x2-c3',
    selectiveBook2,
    14,
    '第3章 晶体结构与性质',
    '教材小节',
    [
      { title: '3.1 金属晶体', importance: 4 },
      { title: '3.2 离子晶体', importance: 5 },
      { title: '3.3 共价晶体和分子晶体', importance: 5 },
    ],
    3,
  ),
  makeChapter(
    'hs-x3-c1',
    selectiveBook3,
    15,
    '第1章 认识有机化学',
    '教材小节',
    [
      { title: '1.1 有机化学的建立和发展', importance: 2 },
      { title: '1.2 有机化合物的结构', importance: 5 },
      { title: '1.3 有机化合物的命名', importance: 4 },
    ],
    2,
  ),
  makeChapter(
    'hs-x3-c2',
    selectiveBook3,
    16,
    '第2章 烃和卤代烃',
    '教材小节',
    [
      { title: '2.1 脂肪烃', importance: 4 },
      { title: '2.2 芳香烃', importance: 3 },
      { title: '2.3 卤代烃', importance: 5 },
    ],
    3,
  ),
  makeChapter(
    'hs-x3-c3',
    selectiveBook3,
    17,
    '第3章 烃的含氧衍生物',
    '教材小节',
    [
      { title: '3.1 醇和酚', importance: 4 },
      { title: '3.2 醛和酮', importance: 5 },
      { title: '3.3 羧酸及其衍生物', importance: 5 },
    ],
    3,
  ),
  makeChapter(
    'hs-x3-c4',
    selectiveBook3,
    18,
    '第4章 生物大分子与合成高分子',
    '教材小节',
    [
      { title: '4.1 生物大分子', importance: 3 },
      { title: '4.2 合成高分子', importance: 3 },
    ],
    2,
  ),
  makeChapter(
    'hs-x3-c5',
    selectiveBook3,
    19,
    '第5章 有机化合物的合成与研究',
    '教材小节',
    [
      { title: '5.1 有机合成初步', importance: 5 },
      { title: '5.2 研究有机化合物的一般方法', importance: 4 },
    ],
    3,
  ),
];

export const seniorTextbookCourse: Course = {
  id: 'shanghai-senior-chemistry-textbooks',
  name: '上海高中化学五册教材',
  shortName: '高中化学五册',
  region: '上海',
  stage: 'senior',
  examSystem: '上海等级考 / 全国新高考',
  textbook: '沪科版高中化学：必修第一册、必修第二册、选择性必修1-3',
  status: 'draft',
  sourcePath: TEXTBOOK_ROOT,
  description: '沪科版高中化学五册教材 · 标清全国必修、全国选考必修、上海等级考必学',
  modeSummary: '按教材正门进入，再叠加刷题模式和点拨模式',
  gradeOrder: ['必修第一册', '必修第二册', '选择性必修1', '选择性必修2', '选择性必修3'],
  chapters: seniorTextbookChapters,
  reviewChapters: [],
};
