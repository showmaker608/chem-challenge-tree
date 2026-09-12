import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Course, KnowledgePoint } from '../types';
import { Mascot } from './Mascot';

interface ClassSessionProps {
  course: Course;
  onStartNode: (node: KnowledgePoint) => void;
  onBack: () => void;
}

interface ClassActivity {
  phase: string;
  title: string;
  time: string;
  mode: string;
  nodeIds: string[];
  cue: string;
  studentAction: string;
  board: string;
}

interface GuidedQuestion {
  title: string;
  question: string;
  hint: string;
  answer: string;
  followUp: string;
  nodeIds: string[];
}

interface ModelStep {
  label: string;
  prompt: string;
  reveal: string;
  nodeIds: string[];
}

interface MindMapBranch {
  title: string;
  items: string[];
  color: string;
}

interface LessonModel {
  title: string;
  problem: string;
  steps: ModelStep[];
}

interface LessonPlan {
  no: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  glow: string;
  minutes: string;
  mission: string;
  stakes: string;
  goal: string;
  hook: string;
  checkpoints: string[];
  questions: GuidedQuestion[];
  model: LessonModel;
  mindMap: MindMapBranch[];
  activities: ClassActivity[];
}

const LESSONS: LessonPlan[] = [
  {
    no: '13',
    title: '享素生活',
    subtitle: '能源、有机物、营养素',
    icon: '🌱',
    accent: '#0f766e',
    glow: 'rgba(20, 184, 166, 0.18)',
    minutes: '12-18 分钟',
    mission: '从一天的吃喝用电出发，把生活经验整理成三条化学判断线。',
    stakes: '这节课不急着背结论，先让学生说理由，再用模型把理由变成规则。',
    goal: '把生活常识变成可判断的化学规则：能源先看能否再生，有机物先看含碳例外，营养素看来源、功能、缺乏症。',
    hook: '让学生说出今天来上课前“用过的能源”和“吃过的食物”，再追问：这些东西能不能用化学眼光分类？',
    checkpoints: ['煤油气不可再生', 'CO2 不是酸雨主因', 'CO/CO2/碳酸盐不是有机物', '糖供能、蛋白质修补、油脂储能'],
    questions: [
      {
        title: '早餐拆解',
        question: '面包、鸡蛋、牛奶、花生油分别更适合放进哪一类营养素？为什么？',
        hint: '先不要背菜单，先问它主要负责“供能、构成身体，还是调节代谢”。',
        answer: '面包主要看糖类供能；鸡蛋、牛奶突出蛋白质构成和修补身体；花生油属于油脂，能储能。牛奶还可顺手引出无机盐和水。',
        followUp: '如果一个学生只说“鸡蛋有营养”，继续追问：它到底提供哪类营养素？证据是什么？',
        nodeIds: ['jh-g8tf-l13-n03'],
      },
      {
        title: '含碳陷阱',
        question: 'CO2、CaCO3、乙醇、淀粉都含碳，为什么不能都叫有机物？',
        hint: '先说主线：多数有机物含碳；再说例外：CO、CO2、H2CO3、碳酸盐。',
        answer: '乙醇、淀粉属于有机物；CO2 和 CaCO3 虽含碳，但分别属于氧化物、碳酸盐，是初中常见“含碳但不是有机物”的例外。',
        followUp: '让学生补一句完整表述：有机物通常是含碳化合物，但不是所有含碳物质都是有机物。',
        nodeIds: ['jh-g8tf-l13-n02'],
      },
      {
        title: '新能源判断',
        question: '氢能燃烧只生成水，为什么还不能一句话说“马上替代汽油”？',
        hint: '能源选择不只看产物，还要看制取、储存、运输和安全。',
        answer: '氢气燃烧产物清洁，但制取和储存成本高，运输和安全要求高。评价能源要综合来源、能量、污染、储存和使用条件。',
        followUp: '让学生把“环保”改成更严谨的说法：燃烧产物相对清洁，但应用还受制取和储存限制。',
        nodeIds: ['jh-g8tf-l13-n01', 'ch7-n3'],
      },
    ],
    model: {
      title: '生活物质三步分类模型',
      problem: '看到一个生活材料，怎样从“常识回答”升级成“化学判断”？',
      steps: [
        {
          label: '看来源',
          prompt: '它是能源吗？短期内能不能再生？',
          reveal: '煤、石油、天然气属于化石燃料，短期内不能再生；太阳能、风能、氢能常作为新能源讨论。',
          nodeIds: ['jh-g8tf-l13-n01'],
        },
        {
          label: '看例外',
          prompt: '它含碳吗？有没有落入含碳例外？',
          reveal: '含碳不等于有机物，先排除 CO、CO2、H2CO3、碳酸盐，再判断乙醇、淀粉、蛋白质等有机物。',
          nodeIds: ['jh-g8tf-l13-n02'],
        },
        {
          label: '看功能',
          prompt: '它在人体里主要负责什么功能？',
          reveal: '糖类供能，油脂储能，蛋白质构成和修补身体，维生素调节代谢。题目常从功能和缺乏症反推营养素。',
          nodeIds: ['jh-g8tf-l13-n03'],
        },
      ],
    },
    mindMap: [
      { title: '能源', color: '#14b8a6', items: ['化石燃料', '不可再生', '新能源', '氢能评价'] },
      { title: '有机物', color: '#f59e0b', items: ['多数含碳', '四类例外', '乙醇/淀粉', '生活材料'] },
      { title: '营养素', color: '#38bdf8', items: ['糖类供能', '蛋白质修补', '油脂储能', '维生素调节'] },
    ],
    activities: [
      {
        phase: '热身',
        title: '一分钟生活清单',
        time: '2 min',
        mode: '举手 + 快问快答',
        nodeIds: ['jh-g8tf-l13-n01'],
        cue: '今天你用了哪些能源？早餐里哪些成分能供能？',
        studentAction: '每组说一个能源或营养素，不能重复。',
        board: '用能：化石燃料 / 新能源；饮食：有机物 / 营养素',
      },
      {
        phase: '追问',
        title: '可再生与不可再生',
        time: '4 min',
        mode: '点名解释',
        nodeIds: ['jh-g8tf-l13-n01', 'ch7-n3'],
        cue: '判断能源题时，第一眼看“短期内能不能再生”。',
        studentAction: '学生先说判断，再补一句理由：为什么煤油气不可再生？',
        board: '煤、石油、天然气 = 化石燃料 = 不可再生',
      },
      {
        phase: '辨析',
        title: '含碳不一定是有机物',
        time: '5 min',
        mode: '例外排雷',
        nodeIds: ['jh-g8tf-l13-n02'],
        cue: '看到“含碳”先别急着选有机物，先排除四类例外。',
        studentAction: '学生快速判断 CO2、CaCO3、淀粉、乙醇谁是有机物。',
        board: '有机物：含碳化合物；例外：CO、CO2、H2CO3、碳酸盐',
      },
      {
        phase: '抢答',
        title: '营养素对号入座',
        time: '5 min',
        mode: '抢答 + 出门测',
        nodeIds: ['jh-g8tf-l13-n03'],
        cue: '营养素题不要背菜单，要抓“来源、功能、缺乏症”。',
        studentAction: '老师报缺乏症或食物，学生抢答对应营养素。',
        board: '糖类供能；油脂储能；蛋白质构成和修补；维生素调节代谢',
      },
    ],
  },
  {
    no: '14',
    title: '未知的探索',
    subtitle: '实验探究、方案评价、信息提取',
    icon: '🔎',
    accent: '#2563eb',
    glow: 'rgba(59, 130, 246, 0.16)',
    minutes: '12-16 分钟',
    mission: '把陌生实验题当成案件现场：先找目的，再控变量，最后用证据说话。',
    stakes: '学生不用怕陌生材料，题干给的装置、数据和现象就是破题线索。',
    goal: '让学生面对陌生实验题时不乱猜，按“目的、装置、变量、证据、结论”的顺序读题。',
    hook: '把实验探究题说成“破案”：结论不是猜出来的，是证据链推出来的。',
    checkpoints: ['先看实验目的', '控制变量只改一个因素', '装置作用要说清楚', '陌生材料先读题干信息'],
    questions: [
      {
        title: '变量锁定',
        question: '比较催化剂种类对 H2O2 分解速率的影响时，哪些条件必须保持相同？',
        hint: '要比较谁，就只改变谁；其余条件尽量都相同。',
        answer: '只能改变催化剂种类，温度、H2O2 浓度和体积、催化剂质量等都要保持相同。',
        followUp: '追问学生：如果温度也变了，最后到底是在比较催化剂，还是比较温度？',
        nodeIds: ['ch8-n42'],
      },
      {
        title: '装置读法',
        question: '制取氧气时，为什么刚开始产生的气体通常不马上收集？结束时为什么先取导管再熄灯？',
        hint: '一个问题看“空气混入”，另一个问题看“水倒吸”。',
        answer: '刚开始气体中混有空气，不够纯；加热制气结束时先撤导管再熄灯，防止水倒吸使试管炸裂。',
        followUp: '让学生用“原因 + 后果”的句式回答，避免只背操作顺序。',
        nodeIds: ['ch8-n37', 'ch8-n44'],
      },
      {
        title: '陌生材料',
        question: '题目出现 MOFs、纳米材料等陌生词时，第一反应应该是什么？',
        hint: '不要凭生活经验猜，先回到题干给的信息。',
        answer: '陌生词往往只是情境，真正可用的信息在题干、图像、表格和实验现象中。先圈功能、结构、数据变化，再下结论。',
        followUp: '点一个学生只用题干原话解释，不允许说“我感觉”。',
        nodeIds: ['ch8-n45', 'ch8-n42'],
      },
    ],
    model: {
      title: '实验探究证据链模型',
      problem: '看到长实验题，怎样避免一上来就猜答案？',
      steps: [
        {
          label: '目的',
          prompt: '实验到底想研究什么？',
          reveal: '先圈研究对象和问题，例如“催化剂种类是否影响速率”。目的决定后面变量怎么控。',
          nodeIds: ['ch8-n42'],
        },
        {
          label: '变量',
          prompt: '本组实验只允许改变哪一个因素？',
          reveal: '自变量只改一个；无关变量如温度、浓度、用量、装置要保持一致。',
          nodeIds: ['ch8-n42'],
        },
        {
          label: '证据',
          prompt: '题目给了什么现象或数据？',
          reveal: '现象回答“看到什么”，结论回答“说明什么”。实验题最怕把现象和结论混写。',
          nodeIds: ['ch8-n38', 'ch8-n40'],
        },
        {
          label: '结论',
          prompt: '结论能不能被前面的证据支持？',
          reveal: '只写证据能推出的结论，不把题干没有比较过的因素写进去。',
          nodeIds: ['ch8-n45'],
        },
      ],
    },
    mindMap: [
      { title: '读题顺序', color: '#60a5fa', items: ['目的', '装置', '变量', '证据'] },
      { title: '装置判断', color: '#22c55e', items: ['反应物状态', '反应条件', '收集方法', '结束顺序'] },
      { title: '表达规范', color: '#f97316', items: ['现象', '结论', '检验', '验满'] },
    ],
    activities: [
      {
        phase: '热身',
        title: '四步读题法',
        time: '3 min',
        mode: '齐读模板',
        nodeIds: ['ch8-n42'],
        cue: '实验题先问：目的是什么？变量是谁？证据在哪？',
        studentAction: '学生一起把长题拆成目的、装置、现象/数据、结论。',
        board: '目的 -> 装置 -> 变量 -> 证据 -> 结论',
      },
      {
        phase: '探究',
        title: '制氧装置与操作细节',
        time: '5 min',
        mode: '装置观察',
        nodeIds: ['ch8-n37', 'ch8-n44'],
        cue: '制气题看反应物状态、反应条件、收集方法和结束顺序。',
        studentAction: '指出为什么刚开始的气体不能马上检验，为什么要先取导管再熄灯。',
        board: '先排空气；先取导管再熄灯，防倒吸',
      },
      {
        phase: '证据',
        title: 'CO2 制取与检验',
        time: '4 min',
        mode: '现象连结论',
        nodeIds: ['ch8-n38', 'ch8-n40'],
        cue: '现象是“看到什么”，结论是“说明什么”，不能混写。',
        studentAction: '判断验满、检验和性质验证分别用什么操作。',
        board: '检验 CO2：澄清石灰水变浑浊；验满：燃着木条放瓶口',
      },
      {
        phase: '挑战',
        title: '陌生材料拆壳',
        time: '4 min',
        mode: '小组解释',
        nodeIds: ['ch8-n45', 'ch8-n42'],
        cue: 'MOFs、纳米材料这些词不用怕，题干一定给结构或用途。',
        studentAction: '学生只从材料中找证据，不凭感觉作答。',
        board: '陌生名词不重要，题干信息才重要',
      },
    ],
  },
  {
    no: '15',
    title: '温故而知新 3',
    subtitle: '质量守恒、方程式、能源与氧气实验',
    icon: '⚖️',
    accent: '#c2410c',
    glow: 'rgba(249, 115, 22, 0.18)',
    minutes: '12-18 分钟',
    mission: '把第12-14讲串成复习闭环：守恒、燃料评价、实验装置、规范表达。',
    stakes: '复习课不是把答案报一遍，而是让学生把“为什么这样做”讲出来。',
    goal: '把第12、13、14讲的关键能力串起来：方程式与质量守恒、能源燃料选择、氧气制取、还原氧化铜。',
    hook: '用“长征三号燃料选择”开场：燃料不是越厉害越好，还要看能量、毒性、产物和储存条件。',
    checkpoints: ['质量守恒看原子守恒', '方程式只改系数不改角码', '氧气制取要会选装置', '木炭还原氧化铜要防倒吸'],
    questions: [
      {
        title: '配平追问',
        question: '配平 CH4 + O2 -> CO2 + H2O 时，为什么 O2 前面是 2？',
        hint: '先定 C 和 H，再回头数 O；配平只能改系数。',
        answer: '1 个 C 对应 1 个 CO2；4 个 H 对应 2 个 H2O；右边共有 4 个 O，所以左边需要 2 个 O2。',
        followUp: '追问：如果把 H2O 改成 H4O2 可以吗？让学生说出“不能改角码”。',
        nodeIds: ['ch5-n1', 'ch5-n2', 'ch5-n3'],
      },
      {
        title: '燃料评审',
        question: '火箭燃料选择时，为什么不能只看“燃烧热大不大”？',
        hint: '把它当成工程选择题：能量、毒性、产物、储存都要看。',
        answer: '燃料评价要综合单位质量放热、是否有毒、燃烧产物是否污染、储存运输是否方便安全。',
        followUp: '让学生把“这个燃料好”改成四维评价句。',
        nodeIds: ['jh-g8tf-l13-n01', 'ch7-n4'],
      },
      {
        title: '实验双证据',
        question: '木炭还原氧化铜时，黑色变红和澄清石灰水变浑浊分别说明什么？',
        hint: '一个证据证明铜生成，一个证据证明二氧化碳生成。',
        answer: '黑色 CuO 变红说明生成 Cu；澄清石灰水变浑浊说明产生 CO2，二者共同支持木炭还原氧化铜的反应结论。',
        followUp: '追问安全操作：为什么结束时要防止倒吸？',
        nodeIds: ['ch8-n9'],
      },
    ],
    model: {
      title: '复习题解题闭环模型',
      problem: '遇到综合复习题，怎样从零散知识点串成完整答案？',
      steps: [
        {
          label: '守恒',
          prompt: '先检查原子种类、数目和质量是否守恒。',
          reveal: '质量守恒的本质是反应前后原子种类和数目不变，方程式配平只改系数。',
          nodeIds: ['ch5-n1', 'ch5-n2'],
        },
        {
          label: '评价',
          prompt: '遇到燃料或能源选择，不能只看单一优点。',
          reveal: '用“能量、污染、毒性、储存、安全”五个词组织答案，会比只写环保更稳。',
          nodeIds: ['jh-g8tf-l13-n01', 'ch7-n4'],
        },
        {
          label: '装置',
          prompt: '气体制备题先选发生装置，再选收集方法。',
          reveal: '反应物状态和反应条件决定发生装置；气体密度和溶解性决定收集方法。',
          nodeIds: ['ch8-n37', 'ch8-n44'],
        },
        {
          label: '安全',
          prompt: '实验结尾为什么经常考操作顺序？',
          reveal: '顺序题背后通常是防倒吸、防爆炸、防污染。说清风险，答案就不死背。',
          nodeIds: ['ch8-n9'],
        },
      ],
    },
    mindMap: [
      { title: '方程式', color: '#f97316', items: ['写对化学式', '只改系数', '检查守恒', '标条件符号'] },
      { title: '能源燃料', color: '#14b8a6', items: ['能量', '毒性', '产物', '储存安全'] },
      { title: '实验复习', color: '#6366f1', items: ['O2 制备', 'CO2 检验', '还原 CuO', '防倒吸'] },
    ],
    activities: [
      {
        phase: '复盘',
        title: '质量守恒与方程式',
        time: '5 min',
        mode: '板演',
        nodeIds: ['ch5-n1', 'ch5-n2', 'ch5-n3'],
        cue: '方程式题先写对化学式，再配平，最后检查条件和气体符号。',
        studentAction: '学生上台配平甲烷、乙醇、碳还原氧化铜相关方程式。',
        board: '守恒的是原子种类、数目、质量；配平只改系数',
      },
      {
        phase: '迁移',
        title: '火箭燃料怎么选',
        time: '4 min',
        mode: '材料选择',
        nodeIds: ['jh-g8tf-l13-n01', 'ch7-n4'],
        cue: '燃料选择要综合单位能量、毒性、燃烧产物、储存条件。',
        studentAction: '学生解释“最环保”不等于“最容易储存”。',
        board: '燃料评价：能量、毒性、产物、储存',
      },
      {
        phase: '实验',
        title: '氧气性质与制备',
        time: '5 min',
        mode: '装置连线',
        nodeIds: ['ch8-n37', 'ch8-n44'],
        cue: '氧气题要会从发生装置、收集装置、检验方法三个角度回答。',
        studentAction: '学生说出高锰酸钾、双氧水制氧的装置差异。',
        board: 'O2：支持燃烧；检验用带火星木条复燃',
      },
      {
        phase: '收束',
        title: '还原氧化铜与安全操作',
        time: '4 min',
        mode: '风险判断',
        nodeIds: ['ch8-n9'],
        cue: '还原实验不只考方程式，还考现象和防倒吸。',
        studentAction: '说出黑色变红、石灰水变浑浊分别说明什么。',
        board: '黑色 CuO -> 红色 Cu；CO2 使澄清石灰水变浑浊',
      },
    ],
  },
];

export function ClassSession({ course, onStartNode, onBack }: ClassSessionProps) {
  const [activeLesson, setActiveLesson] = useState(0);
  const [activeRound, setActiveRound] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [activeModelStep, setActiveModelStep] = useState(0);
  const [revealMode, setRevealMode] = useState<'none' | 'hint' | 'answer'>('none');

  const nodeMap = useMemo(() => {
    const map = new Map<string, KnowledgePoint>();
    for (const chapter of [...course.chapters, ...(course.reviewChapters ?? [])]) {
      for (const section of chapter.sections) {
        for (const node of section.nodes) map.set(node.id, node);
      }
    }
    return map;
  }, [course]);

  const lesson = LESSONS[activeLesson];
  const accentStyle = {
    '--lesson-accent': lesson.accent,
    '--lesson-glow': lesson.glow,
  } as CSSProperties;

  const getNodes = (ids: string[]) =>
    ids.map((id) => nodeMap.get(id)).filter((node): node is KnowledgePoint => Boolean(node));

  const lessonNodes = getNodes(Array.from(new Set(lesson.activities.flatMap((activity) => activity.nodeIds))));
  const currentActivity = lesson.activities[activeRound] ?? lesson.activities[0];
  const currentNodes = getNodes(currentActivity.nodeIds);
  const currentQuestion = lesson.questions[activeQuestion] ?? lesson.questions[0];
  const currentQuestionNodes = getNodes(currentQuestion.nodeIds);
  const currentStep = lesson.model.steps[activeModelStep] ?? lesson.model.steps[0];
  const currentStepNodes = getNodes(currentStep.nodeIds);
  const totalQuestions = lessonNodes.reduce(
    (sum, node) => sum + (node.challenges.length || node.bigQuestion?.subQuestions.length || 0),
    0,
  );
  const activityProgress = Math.round(((activeRound + 1) / lesson.activities.length) * 100);
  const thinkingProgress = Math.min(
    96,
    32 + activeRound * 10 + activeModelStep * 8 + (revealMode === 'hint' ? 12 : revealMode === 'answer' ? 24 : 0),
  );

  const switchLesson = (idx: number) => {
    setActiveLesson(idx);
    setActiveRound(0);
    setActiveQuestion(0);
    setActiveModelStep(0);
    setRevealMode('none');
  };

  const switchQuestion = (idx: number) => {
    setActiveQuestion(idx);
    setRevealMode('none');
  };

  const goRound = (direction: 1 | -1) => {
    setActiveRound((current) => {
      const next = current + direction;
      if (next < 0) return lesson.activities.length - 1;
      if (next >= lesson.activities.length) return 0;
      return next;
    });
  };

  const goQuestion = () => {
    setActiveQuestion((current) => (current + 1) % lesson.questions.length);
    setRevealMode('none');
  };

  return (
    <div
      className="min-h-screen px-4 py-5 relative overflow-x-hidden"
      style={{
        ...accentStyle,
        background:
          'radial-gradient(circle at 14% 0%, var(--lesson-glow), transparent 25rem), radial-gradient(circle at 85% 8%, rgba(251, 191, 36, .12), transparent 24rem), linear-gradient(180deg, var(--bg-page-start) 0%, var(--bg-page-mid) 58%, var(--bg-page-end) 100%)',
      }}
    >
      <div className="absolute inset-x-0 top-0 h-72 tiny-lab-dot opacity-30 pointer-events-none" />
      <div className="relative z-10 max-w-6xl mx-auto pb-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <button onClick={onBack} className="text-sm font-black text-teal-700 hover:text-teal-900">
            ← 返回模式选择
          </button>
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-black text-[var(--text-main)]">
            <span className="w-2 h-2 rounded-full bg-[var(--lesson-accent)]" />
            HANDOUT TEACHING MODE
          </div>
        </div>

        <section className="rounded-[1.75rem] overflow-hidden mb-4 relative border border-[var(--border-color)] bg-[var(--bg-card-bright)] shadow-xl">
          <div
            className="absolute inset-0 opacity-95"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in srgb, var(--lesson-accent) 88%, black 12%) 0%, color-mix(in srgb, var(--lesson-accent) 52%, #0f172a 48%) 55%, #111827 100%)',
            }}
          />
          <div className="relative p-5 md:p-6 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-center gap-4 min-w-0">
                <div className="shrink-0 h-20 w-20 flex items-center justify-center">
                  <Mascot mood="wow" size="sm" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="rounded-full bg-white/16 px-3 py-1 text-[11px] font-black tracking-widest">第 {lesson.no} 讲</span>
                    <span className="rounded-full bg-amber-300 text-slate-950 px-3 py-1 text-[11px] font-black">讲义教学模式</span>
                    <span className="rounded-full bg-white/16 px-3 py-1 text-[11px] font-black">{lesson.minutes}</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight break-words">
                    {lesson.icon} {lesson.title}
                  </h1>
                  <p className="mt-1 text-sm md:text-base font-bold text-white/86">{lesson.subtitle}</p>
                  <p className="mt-3 text-base md:text-xl font-black leading-snug max-w-3xl [overflow-wrap:anywhere]">
                    {lesson.mission}
                  </p>
                </div>
              </div>

              <div className="w-full lg:w-72 rounded-3xl bg-white/12 border border-white/20 p-4 backdrop-blur">
                <div className="flex items-center justify-between text-xs font-black text-white/80">
                  <span>课堂推进</span>
                  <span>{thinkingProgress}%</span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-black/25 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 via-lime-300 to-cyan-200 transition-all duration-500"
                    style={{ width: `${thinkingProgress}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="min-w-0 rounded-2xl bg-white/12 px-2 py-2">
                    <div className="text-lg font-black">{lesson.questions.length}</div>
                    <div className="text-[10px] font-bold text-white/70">提问</div>
                  </div>
                  <div className="min-w-0 rounded-2xl bg-white/12 px-2 py-2">
                    <div className="text-lg font-black">{lesson.model.steps.length}</div>
                    <div className="text-[10px] font-bold text-white/70">模型</div>
                  </div>
                  <div className="min-w-0 rounded-2xl bg-white/12 px-2 py-2">
                    <div className="text-lg font-black">{totalQuestions}</div>
                    <div className="text-[10px] font-bold text-white/70">题目</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          {LESSONS.map((item, idx) => {
            const isActive = idx === activeLesson;
            return (
              <button
                key={item.no}
                onClick={() => switchLesson(idx)}
                className={`text-left rounded-2xl border p-4 transition-all ${
                  isActive
                    ? 'bg-[var(--bg-card-bright)] shadow-lg -translate-y-0.5'
                    : 'bg-[var(--bg-card)]/80 hover:bg-[var(--bg-card-bright)]'
                }`}
                style={{ borderColor: isActive ? item.accent : 'var(--border-color)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-black tracking-widest text-[var(--text-muted)]">LESSON {item.no}</div>
                    <div className="mt-1 text-base font-black text-[var(--text-main)] truncate">
                      {item.icon} {item.title}
                    </div>
                    <div className="text-xs font-bold text-[var(--text-muted)] mt-1">{item.subtitle}</div>
                  </div>
                  <span
                    className="shrink-0 w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-black"
                    style={{ backgroundColor: item.accent }}
                  >
                    {idx + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <section className="soft-card rounded-[1.75rem] p-5 md:p-6 overflow-hidden relative mb-5">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[var(--bg-disabled)]">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${activityProgress}%`, backgroundColor: lesson.accent }}
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="text-xs font-black tracking-widest text-[var(--text-muted)]">01 · 课堂主线</div>
              <h2 className="mt-1 text-2xl md:text-4xl font-black text-[var(--text-main)] tracking-tight">
                {currentActivity.title}
              </h2>
              <p className="mt-2 text-sm font-bold text-[var(--text-muted)]">{lesson.stakes}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goRound(-1)}
                className="w-11 h-11 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] text-lg font-black text-[var(--text-main)] hover:-translate-y-0.5 transition-all"
                title="上一环节"
              >
                ←
              </button>
              <button
                onClick={() => goRound(1)}
                className="w-11 h-11 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] text-lg font-black text-[var(--text-main)] hover:-translate-y-0.5 transition-all"
                title="下一环节"
              >
                →
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2">
            {lesson.activities.map((activity, idx) => {
              const isCurrent = idx === activeRound;
              return (
                <button
                  key={activity.title}
                  onClick={() => setActiveRound(idx)}
                  className={`min-w-0 rounded-2xl border px-2 py-3 text-center transition-all ${
                    isCurrent ? 'text-white shadow-md' : 'bg-[var(--bg-card-bright)] text-[var(--text-muted)]'
                  }`}
                  style={{
                    backgroundColor: isCurrent ? lesson.accent : undefined,
                    borderColor: isCurrent ? lesson.accent : 'var(--border-color)',
                  }}
                >
                  <div className="text-sm font-black">{idx + 1}</div>
                  <div className="mt-1 text-[10px] font-black truncate">{activity.phase}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-4">
            <div className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--bg-highlight)]/70 p-5">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="rounded-full px-3 py-1 text-xs font-black text-white" style={{ backgroundColor: lesson.accent }}>
                  {currentActivity.phase}
                </span>
                <span className="rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-xs font-black">{currentActivity.time}</span>
                <span className="rounded-full bg-sky-100 text-sky-900 px-3 py-1 text-xs font-black">{currentActivity.mode}</span>
              </div>
              <div className="text-[11px] font-black tracking-widest text-teal-800 mb-2">现在只问这一句</div>
              <p className="text-xl md:text-3xl font-black leading-snug text-[var(--text-main)] [overflow-wrap:anywhere]">
                {currentActivity.cue}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {currentNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => onStartNode(node)}
                    className="rounded-full border border-[var(--border-color)] bg-[var(--bg-card-bright)] hover:border-teal-300 hover:-translate-y-0.5 transition-all px-4 py-2.5 text-xs font-black text-[var(--text-main)] [overflow-wrap:anywhere]"
                  >
                    练：{node.topic} · {(node.challenges.length || node.bigQuestion?.subQuestions.length || 0)}题
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-[1.35rem] border border-[var(--border-color)] bg-[var(--bg-card-bright)] p-4">
                <div className="text-[11px] font-black tracking-widest text-[var(--text-muted)] mb-2">学生动作</div>
                <p className="text-sm font-bold leading-relaxed text-[var(--text-main)] [overflow-wrap:anywhere]">{currentActivity.studentAction}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-800 bg-slate-950 p-4 text-white">
                <div className="text-[11px] font-black tracking-widest text-emerald-300 mb-2">黑板保留</div>
                <p className="text-sm md:text-base font-black leading-relaxed [overflow-wrap:anywhere]">{currentActivity.board}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <section className="soft-card rounded-[1.75rem] p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
              <div>
                <div className="text-xs font-black tracking-widest text-[var(--text-muted)]">02 · 提问接力</div>
                <h3 className="text-2xl font-black text-[var(--text-main)]">先想，再提示，再板书</h3>
              </div>
              <button
                onClick={goQuestion}
                className="w-full sm:w-auto shrink-0 rounded-2xl px-4 py-2.5 text-sm font-black text-white hover:-translate-y-0.5 transition-all"
                style={{ backgroundColor: lesson.accent }}
              >
                换下一问
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {lesson.questions.map((question, idx) => {
                const isCurrent = idx === activeQuestion;
                return (
                  <button
                    key={question.title}
                    onClick={() => switchQuestion(idx)}
                    className={`min-w-0 rounded-2xl border px-2 py-3 text-center transition-all ${
                      isCurrent ? 'text-white shadow-md' : 'bg-[var(--bg-card-bright)] text-[var(--text-muted)]'
                    }`}
                    style={{
                      backgroundColor: isCurrent ? lesson.accent : undefined,
                      borderColor: isCurrent ? lesson.accent : 'var(--border-color)',
                    }}
                  >
                    <div className="text-[10px] font-black tracking-widest">Q{idx + 1}</div>
                    <div className="mt-1 text-xs font-black truncate">{question.title}</div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--bg-card-bright)] p-4 md:p-5">
              <div className="text-[11px] font-black tracking-widest text-teal-800 mb-2">先问学生</div>
              <p className="text-lg md:text-2xl font-black leading-snug text-[var(--text-main)] [overflow-wrap:anywhere]">
                {currentQuestion.question}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setRevealMode('hint')}
                  className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black text-amber-900 hover:-translate-y-0.5 transition-all"
                >
                  给一点提示
                </button>
                <button
                  onClick={() => setRevealMode('answer')}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-900 hover:-translate-y-0.5 transition-all"
                >
                  显示板书答案
                </button>
                {currentQuestionNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => onStartNode(node)}
                    className="rounded-full border border-[var(--border-color)] bg-[var(--bg-highlight)] px-4 py-2 text-xs font-black text-[var(--text-main)] hover:-translate-y-0.5 transition-all"
                  >
                    练：{node.topic}
                  </button>
                ))}
              </div>
            </div>

            {revealMode !== 'none' && (
              <div className="mt-3 rounded-[1.35rem] border border-[var(--border-color)] bg-[var(--bg-highlight)]/80 p-4">
                <div className="text-[11px] font-black tracking-widest text-teal-800 mb-2">
                  {revealMode === 'answer' ? '板书答案' : '提示 + 继续追问'}
                </div>
                <p className="text-sm font-bold leading-relaxed text-[var(--text-main)] [overflow-wrap:anywhere]">
                  {revealMode === 'answer' ? currentQuestion.answer : `${currentQuestion.hint} ${currentQuestion.followUp}`}
                </p>
              </div>
            )}
          </section>

          <section className="soft-card rounded-[1.75rem] p-5 md:p-6">
            <div className="mb-5">
              <div className="text-xs font-black tracking-widest text-[var(--text-muted)]">03 · 模型演示</div>
              <h3 className="text-2xl font-black text-[var(--text-main)]">{lesson.model.title}</h3>
              <p className="mt-1 text-sm font-bold text-[var(--text-muted)] [overflow-wrap:anywhere]">{lesson.model.problem}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[0.82fr_1.18fr] gap-4">
              <div className="space-y-2">
                {lesson.model.steps.map((step, idx) => {
                  const isCurrent = idx === activeModelStep;
                  return (
                    <button
                      key={step.label}
                      onClick={() => setActiveModelStep(idx)}
                      className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                        isCurrent ? 'text-white shadow-md' : 'bg-[var(--bg-card-bright)] text-[var(--text-main)]'
                      }`}
                      style={{
                        backgroundColor: isCurrent ? lesson.accent : undefined,
                        borderColor: isCurrent ? lesson.accent : 'var(--border-color)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${isCurrent ? 'bg-white/18 text-white' : 'bg-[var(--bg-highlight)] text-teal-800'}`}>
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-black">{step.label}</div>
                          <div className={`text-xs mt-0.5 truncate ${isCurrent ? 'text-white/78' : 'text-[var(--text-muted)]'}`}>{step.prompt}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--bg-highlight)]/70 p-4">
                <div className="text-[11px] font-black tracking-widest text-teal-800 mb-2">当前模型步</div>
                <h4 className="text-xl font-black text-[var(--text-main)]">{currentStep.label}</h4>
                <p className="mt-2 text-sm font-bold leading-relaxed text-[var(--text-main)] [overflow-wrap:anywhere]">{currentStep.prompt}</p>
                <div className="mt-4 rounded-2xl bg-[var(--bg-card-bright)] border border-[var(--border-color)] p-4">
                  <div className="text-[11px] font-black tracking-widest text-[var(--text-muted)] mb-2">老师揭示</div>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)] [overflow-wrap:anywhere]">{currentStep.reveal}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentStepNodes.map((node) => (
                    <button
                      key={node.id}
                      onClick={() => onStartNode(node)}
                      className="rounded-full border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-3 py-2 text-xs font-black text-[var(--text-main)] hover:-translate-y-0.5 transition-all"
                    >
                      对应练习：{node.topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="soft-card rounded-[1.75rem] p-5 md:p-6 mb-5">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
            <div>
              <div className="text-xs font-black tracking-widest text-[var(--text-muted)]">04 · 讲义思维树</div>
              <h3 className="text-2xl md:text-3xl font-black text-[var(--text-main)]">先说主干，再补叶子</h3>
            </div>
            <p className="text-xs font-bold text-[var(--text-muted)]">投屏时让学生先说分支，老师再点题练习。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[0.58fr_1.42fr] gap-4 items-stretch">
            <div
              className="rounded-[1.5rem] p-5 text-white flex flex-col items-center justify-center text-center min-h-40"
              style={{
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--lesson-accent) 88%, black 12%), color-mix(in srgb, var(--lesson-accent) 52%, #111827 48%))',
              }}
            >
              <div className="text-4xl mb-3">{lesson.icon}</div>
              <div className="text-xs font-black tracking-widest text-white/70">ROOT</div>
              <div className="text-2xl font-black mt-1">{lesson.title}</div>
              <div className="mt-3 h-1 w-16 rounded-full bg-white/35" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {lesson.mindMap.map((branch) => (
                <div key={branch.title} className="relative rounded-[1.35rem] border border-[var(--border-color)] bg-[var(--bg-card-bright)] p-4 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: branch.color }} />
                  <div className="text-[11px] font-black tracking-widest text-[var(--text-muted)]">BRANCH</div>
                  <div className="text-lg font-black text-[var(--text-main)] mt-1">{branch.title}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {branch.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border px-3 py-1.5 text-xs font-black bg-[var(--bg-highlight)] text-[var(--text-main)]"
                        style={{ borderColor: branch.color }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1.18fr_0.82fr] gap-5">
          <section className="soft-card rounded-[1.75rem] p-5">
            <div className="text-xs font-black tracking-widest text-[var(--text-muted)]">05 · 练习入口</div>
            <h3 className="text-2xl font-black text-[var(--text-main)] mt-1">讲完立刻验证</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {lessonNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => onStartNode(node)}
                  className="w-full text-left rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-3.5 py-3 transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-black text-[var(--text-main)]">{node.topic}</div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">
                        {'⭐'.repeat(node.difficulty)} · {(node.challenges.length || node.bigQuestion?.subQuestions.length || 0)} 题
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-black text-white px-2 py-1 rounded-full" style={{ backgroundColor: lesson.accent }}>
                      开始
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="soft-card rounded-[1.75rem] p-5">
            <div className="text-xs font-black tracking-widest text-[var(--text-muted)]">06 · 下课前带走</div>
            <h3 className="text-2xl font-black text-[var(--text-main)] mt-1">四句收束</h3>
            <div className="mt-4 grid grid-cols-1 gap-2">
              {lesson.checkpoints.map((checkpoint, idx) => (
                <div key={checkpoint} className="flex items-start gap-3 rounded-2xl bg-[var(--bg-highlight)]/70 border border-[var(--border-color)] px-3 py-2.5">
                  <span
                    className="shrink-0 w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center"
                    style={{ backgroundColor: lesson.accent }}
                  >
                    {idx + 1}
                  </span>
                  <p className="text-xs font-bold text-[var(--text-muted)] leading-relaxed">{checkpoint}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
