export type SummerLessonLine = 'tengfei' | 'linghang';

export interface SummerLessonTarget {
  chapterId: string;
  chapterName: string;
  detail: string;
  sectionIds?: string[];
  isPrimary?: boolean;
}

export interface SummerLessonRecommendation {
  line: SummerLessonLine;
  lessonNo: number;
  title: string;
  focus: string;
  targets: SummerLessonTarget[];
  gapNote?: string;
  reviewNote?: string;
}

export const summerLessonLines: Record<SummerLessonLine, { name: string; shortName: string; desc: string; accent: string }> = {
  tengfei: {
    name: '九阶腾飞班',
    shortName: '腾飞',
    desc: '先溶液，再金属，后酸碱盐收束',
    accent: 'teal',
  },
  linghang: {
    name: '九阶领航班',
    shortName: '领航',
    desc: '先酸碱盐，再金属与综合拔高',
    accent: 'amber',
  },
};

export const availableSummerLessonLines: SummerLessonLine[] = [];

export const summerLessonRecommendations: Record<SummerLessonLine, SummerLessonRecommendation[]> = {
  tengfei: [
    {
      line: 'tengfei',
      lessonNo: 1,
      title: '你吃饱了吗',
      focus: '溶液定义、溶质溶剂、饱和不饱和',
      targets: [
        { chapterId: 'ch10', chapterName: '溶液', detail: '溶液的形成；讲义强化·溶液基础与饱和判断', sectionIds: ['ch10-s1', 'ch10-s-handout-solution'], isPrimary: true },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 2,
      title: '曲线“绘”溶解',
      focus: '溶解度四要素、曲线读数、析晶',
      targets: [
        { chapterId: 'ch10', chapterName: '溶液', detail: '溶解度的概念与曲线', sectionIds: ['ch10-s2'], isPrimary: true },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 3,
      title: '果汁加糖',
      focus: '溶质质量分数、浓稀判断、配制流程',
      targets: [
        { chapterId: 'ch10', chapterName: '溶液', detail: '溶质质量分数的计算', sectionIds: ['ch10-s2'], isPrimary: true },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 4,
      title: '瘦身计划',
      focus: '稀释、加溶质、加水与质量分数变化',
      targets: [
        { chapterId: 'ch10', chapterName: '溶液', detail: '质量分数、稀释、配制', sectionIds: ['ch10-s2'], isPrimary: true },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 5,
      title: '古老的青铜器',
      focus: '金属物理性质、合金、材料选择',
      targets: [
        { chapterId: 'ch9', chapterName: '金属材料', detail: '金属物理性质与合金', sectionIds: ['ch9-s1'], isPrimary: true },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 6,
      title: '金属的 I 和 E',
      focus: '金属与氧气反应、方程式书写',
      targets: [
        { chapterId: 'ch9', chapterName: '金属材料', detail: '金属与氧气反应', sectionIds: ['ch9-s2'], isPrimary: true },
        { chapterId: 'ch5', chapterName: '化学方程式', detail: '补方程式书写与配平', sectionIds: ['ch5-s1', 'ch5-s2'] },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 7,
      title: '金属排位赛',
      focus: '金属活动性顺序、置换反应与实验设计',
      targets: [
        { chapterId: 'ch9', chapterName: '金属材料', detail: '金属活动性顺序、实验设计综合', sectionIds: ['ch9-s2'], isPrimary: true },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 8,
      title: '温故而知新 1',
      focus: '溶液与金属阶段回炉',
      targets: [
        { chapterId: 'ch10', chapterName: '溶液', detail: '复刷溶液形成、溶解度、质量分数', isPrimary: true },
        { chapterId: 'ch9', chapterName: '金属材料', detail: '复刷金属性质与活动性' },
      ],
      reviewNote: '阶段复习课建议按错题分布决定先刷溶液还是金属。',
    },
    {
      line: 'tengfei',
      lessonNo: 9,
      title: '舌尖上的化学',
      focus: '指示剂、pH、酸碱性边界',
      targets: [
        { chapterId: 'ch11', chapterName: '酸和碱', detail: 'pH 与酸碱指示剂；讲义强化·酸碱性与 pH', sectionIds: ['ch11-s2', 'ch11-s-handout-ph'], isPrimary: true },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 10,
      title: '五指山',
      focus: '常见酸、酸的通性',
      targets: [
        { chapterId: 'ch11', chapterName: '酸和碱', detail: '常见酸、酸的通性', sectionIds: ['ch11-s1'], isPrimary: true },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 11,
      title: '四大金刚',
      focus: '常见碱、碱的四条通性',
      targets: [
        { chapterId: 'ch11', chapterName: '酸和碱', detail: '常见碱及其性质', sectionIds: ['ch11-s1'], isPrimary: true },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 12,
      title: '“中和”调色盘',
      focus: '中和反应、pH 图像、实验现象',
      targets: [
        { chapterId: 'ch11', chapterName: '酸和碱', detail: '酸碱中和反应、pH 图像', sectionIds: ['ch11-s2'], isPrimary: true },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 13,
      title: '食盐与盐',
      focus: '盐的分类、命名、常见盐用途',
      targets: [
        { chapterId: 'ch12', chapterName: '盐和化肥', detail: '常见盐的性质与用途', sectionIds: ['ch12-s1'], isPrimary: true },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 14,
      title: '华尔兹圆舞曲',
      focus: '盐的反应、复分解线索、方程式',
      targets: [
        { chapterId: 'ch12', chapterName: '盐和化肥', detail: '盐的反应、离子共存', sectionIds: ['ch12-s1'], isPrimary: true },
        { chapterId: 'ch5', chapterName: '化学方程式', detail: '补方程式书写与配平', sectionIds: ['ch5-s1', 'ch5-s2'] },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 15,
      title: '化学三重奏',
      focus: '酸、碱、盐性质综合辨析',
      targets: [
        { chapterId: 'ch11', chapterName: '酸和碱', detail: '酸和碱性质辨析', isPrimary: true },
        { chapterId: 'ch12', chapterName: '盐和化肥', detail: '盐的性质与离子共存' },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 16,
      title: '溶液导电的秘密',
      focus: '电离、离子、溶液导电',
      targets: [
        { chapterId: 'ch3', chapterName: '物质构成的奥秘', detail: '九阶专题 · 电解质、电离与导电', sectionIds: ['ch3-s-g9-electrolyte'], isPrimary: true },
        { chapterId: 'ch12', chapterName: '盐和化肥', detail: '九阶专题 · 离子反应与共存', sectionIds: ['ch12-s-g9-ion-reaction'] },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 17,
      title: '离子的奇妙碰撞',
      focus: '离子反应、沉淀气体水、共存判断',
      targets: [
        { chapterId: 'ch12', chapterName: '盐和化肥', detail: '九阶专题 · 离子反应与共存', sectionIds: ['ch12-s-g9-ion-reaction'], isPrimary: true },
      ],
    },
    {
      line: 'tengfei',
      lessonNo: 18,
      title: '温故而知新 2',
      focus: '酸碱盐与离子收官复习',
      targets: [
        { chapterId: 'ch11', chapterName: '酸和碱', detail: '酸碱性质回炉', isPrimary: true },
        { chapterId: 'ch12', chapterName: '盐和化肥', detail: '盐与离子共存回炉' },
        { chapterId: 'ch3', chapterName: '物质构成的奥秘', detail: '电解质、电离与导电补强', sectionIds: ['ch3-s-g9-electrolyte'] },
      ],
      reviewNote: '作为暑假后半程收官复习，优先清掉 ch11、ch12 错题。',
    },
  ],
  linghang: [
    {
      line: 'linghang',
      lessonNo: 1,
      title: '舌尖上的化学',
      focus: '指示剂、pH、酸碱性边界',
      targets: [
        { chapterId: 'ch11', chapterName: '酸和碱', detail: 'pH 与酸碱指示剂；讲义强化·酸碱性与 pH', sectionIds: ['ch11-s2', 'ch11-s-handout-ph'], isPrimary: true },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 2,
      title: '五指山',
      focus: '常见酸、浓酸个性、酸的五条通性',
      targets: [
        { chapterId: 'ch11', chapterName: '酸和碱', detail: '常见酸、酸的五条通性', sectionIds: ['ch11-s1'], isPrimary: true },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 3,
      title: '四大金刚',
      focus: 'NaOH、Ca(OH)2、碱的四条通性',
      targets: [
        { chapterId: 'ch11', chapterName: '酸和碱', detail: '常见碱及其性质', sectionIds: ['ch11-s1'], isPrimary: true },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 4,
      title: '“中和”调色盘',
      focus: '中和反应、pH、温度与指示剂',
      targets: [
        { chapterId: 'ch11', chapterName: '酸和碱', detail: '酸碱中和反应、pH', sectionIds: ['ch11-s2'], isPrimary: true },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 5,
      title: '食盐与盐',
      focus: '盐的组成、分类、命名、常见盐',
      targets: [
        { chapterId: 'ch12', chapterName: '盐和化肥', detail: '常见盐的性质与用途', sectionIds: ['ch12-s1'], isPrimary: true },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 6,
      title: '华尔兹圆舞曲',
      focus: '盐的化学性质、复分解与特殊反应',
      targets: [
        { chapterId: 'ch12', chapterName: '盐和化肥', detail: '盐的化学性质、离子共存', sectionIds: ['ch12-s1'], isPrimary: true },
        { chapterId: 'ch5', chapterName: '化学方程式', detail: '补方程式书写与配平', sectionIds: ['ch5-s1', 'ch5-s2'] },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 7,
      title: '温故而知新',
      focus: '酸碱盐第一轮闭环',
      targets: [
        { chapterId: 'ch11', chapterName: '酸和碱', detail: '复刷酸碱性质', isPrimary: true },
        { chapterId: 'ch12', chapterName: '盐和化肥', detail: '复刷盐与离子共存' },
      ],
      reviewNote: '领航前 7 讲建议直接形成酸碱盐第一轮错题清单。',
    },
    {
      line: 'linghang',
      lessonNo: 8,
      title: '溶液导电的秘密',
      focus: '电解质、电离、导电微观解释',
      targets: [
        { chapterId: 'ch3', chapterName: '物质构成的奥秘', detail: '九阶专题 · 电解质、电离与导电', sectionIds: ['ch3-s-g9-electrolyte'], isPrimary: true },
        { chapterId: 'ch12', chapterName: '盐和化肥', detail: '九阶专题 · 离子反应与共存', sectionIds: ['ch12-s-g9-ion-reaction'] },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 9,
      title: '离子的奇妙碰撞',
      focus: '离子反应、共存判断、沉淀气体水',
      targets: [
        { chapterId: 'ch12', chapterName: '盐和化肥', detail: '九阶专题 · 离子反应与共存', sectionIds: ['ch12-s-g9-ion-reaction'], isPrimary: true },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 10,
      title: '古老的青铜器',
      focus: '金属物理性质、合金、材料应用',
      targets: [
        { chapterId: 'ch9', chapterName: '金属材料', detail: '金属物理性质与合金', sectionIds: ['ch9-s1'], isPrimary: true },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 11,
      title: '金属的 I 和 E',
      focus: '金属与氧气、金属化学性质',
      targets: [
        { chapterId: 'ch9', chapterName: '金属材料', detail: '金属与氧气反应、金属化学性质', sectionIds: ['ch9-s2'], isPrimary: true },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 12,
      title: '金属排位赛',
      focus: '金属活动性顺序、实验探究',
      targets: [
        { chapterId: 'ch9', chapterName: '金属材料', detail: '金属活动性顺序、实验设计综合', sectionIds: ['ch9-s2'], isPrimary: true },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 13,
      title: '他强任他强',
      focus: '还原反应、碳还原金属氧化物',
      targets: [
        { chapterId: 'ch6', chapterName: '碳和碳的氧化物', detail: '九阶专题 · 氧化还原入门', sectionIds: ['ch6-s-g9-redox'], isPrimary: true },
        { chapterId: 'ch5', chapterName: '化学方程式', detail: '补方程式书写与配平' },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 14,
      title: '一山更比一山高',
      focus: '氧化还原分类、还原能力比较',
      targets: [
        { chapterId: 'ch6', chapterName: '碳和碳的氧化物', detail: '九阶专题 · 氧化还原入门', sectionIds: ['ch6-s-g9-redox'], isPrimary: true },
        { chapterId: 'ch5', chapterName: '化学方程式', detail: '补氧化还原相关方程式' },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 15,
      title: '摩尔庄园',
      focus: '物质的量、摩尔质量、微粒数',
      targets: [
        { chapterId: 'ch13', chapterName: '九阶高中衔接', detail: '物质的量、摩尔质量与微粒数', sectionIds: ['ch13-s1'], isPrimary: true },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 16,
      title: '特立独行的气体',
      focus: '气体体积、密度、物质的量关系',
      targets: [
        { chapterId: 'ch13', chapterName: '九阶高中衔接', detail: '气体体积、密度与物质的量', sectionIds: ['ch13-s2'], isPrimary: true },
        { chapterId: 'ch2', chapterName: '我们周围的空气', detail: '补氧气性质与制取', sectionIds: ['ch2-s2'] },
        { chapterId: 'ch6', chapterName: '碳和碳的氧化物', detail: '补 CO2 性质与检验', sectionIds: ['ch6-s2'] },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 17,
      title: '以不变应万变',
      focus: '浓度表示、溶质质量分数、守恒思路',
      targets: [
        { chapterId: 'ch10', chapterName: '溶液', detail: '质量分数、浓度表示、溶液计算', sectionIds: ['ch10-s2'], isPrimary: true },
        { chapterId: 'ch13', chapterName: '九阶高中衔接', detail: '物质的量换算补强', sectionIds: ['ch13-s1'] },
      ],
    },
    {
      line: 'linghang',
      lessonNo: 18,
      title: '温故而知新 2',
      focus: '电离、金属、溶液计算综合收束',
      targets: [
        { chapterId: 'ch3', chapterName: '物质构成的奥秘', detail: '电离与导电补强', sectionIds: ['ch3-s-g9-electrolyte'], isPrimary: true },
        { chapterId: 'ch9', chapterName: '金属材料', detail: '金属性质与活动性回炉' },
        { chapterId: 'ch10', chapterName: '溶液', detail: '溶液计算回炉' },
        { chapterId: 'ch13', chapterName: '九阶高中衔接', detail: '摩尔与气体综合回炉' },
      ],
      reviewNote: '收官复习优先看 ch3、ch9、ch10 的错题分布。',
    },
  ],
};
