import type { Challenge, Chapter, Course, KnowledgePoint } from '../types';

const HANDOUT_ROOT = '/Users/xudingkun/Downloads/上海高中化学/高一/2026暑-领航班/讲义';

interface HandoutLesson {
  lessonNo: number;
  title: string;
  fileName: string;
  pages: number;
  icon: string;
}

export const g10SummerHandouts: HandoutLesson[] = [
  { lessonNo: 1, title: '化学键（上）', fileName: '第1节-化学键（上）.pdf', pages: 12, icon: '🔗' },
  { lessonNo: 2, title: '化学键（下）', fileName: '第2节-化学键（下）.pdf', pages: 11, icon: '🔗' },
  { lessonNo: 3, title: '相对原子质量', fileName: '第3节-相对原子质量.pdf', pages: 11, icon: '⚖️' },
  { lessonNo: 4, title: '电解质与离子反应（上）', fileName: '第4节-电解质与离子反应（上）.pdf', pages: 11, icon: '💧' },
  { lessonNo: 5, title: '电解质与离子反应（下）', fileName: '第5节-电解质与离子反应（下）.pdf', pages: 12, icon: '💧' },
  { lessonNo: 6, title: '化学计量基础（上）', fileName: '第6节-化学计量基础（上）.pdf', pages: 12, icon: '🧮' },
  { lessonNo: 7, title: '化学计量基础（中）', fileName: '第7节-化学计量基础（中）.pdf', pages: 11, icon: '🧮' },
  { lessonNo: 8, title: '化学计量基础（下）', fileName: '第8节-化学计量基础（下）.pdf', pages: 8, icon: '🧮' },
  { lessonNo: 10, title: '氧化还原反应（上）', fileName: '第10节-氧化还原反应（上）.pdf', pages: 14, icon: '🔁' },
  { lessonNo: 11, title: '氧化还原反应（中）', fileName: '第11节-氧化还原反应（中）.pdf', pages: 12, icon: '🔁' },
  { lessonNo: 12, title: '氧化还原反应（下）', fileName: '第12节-氧化还原反应（下）.pdf', pages: 8, icon: '🔁' },
  { lessonNo: 13, title: '氯及其化合物（上）', fileName: '第13节-氯及其化合物（上）.pdf', pages: 11, icon: '🟢' },
  { lessonNo: 14, title: '氯及其化合物（下）', fileName: '第14节-氯及其化合物（下）.pdf', pages: 12, icon: '🟢' },
  { lessonNo: 15, title: '金属——钠、铁、铜', fileName: '第15节-金属——钠、铁、铜.pdf', pages: 11, icon: '⚙️' },
  { lessonNo: 16, title: '元素周期表和元素周期律初步', fileName: '第16节-元素周期表和元素周期律初步.pdf', pages: 12, icon: '🧬' },
  { lessonNo: 17, title: '气体的制备', fileName: '第17节-气体的制备.pdf', pages: 20, icon: '💨' },
];

const lesson1Nodes: KnowledgePoint[] = [
  {
    id: 'g10-l01-n01',
    topic: '构成物质的微粒与化学键概念',
    difficulty: 1,
    learningContent: {
      concept: '**先看作用对象。**原子或离子之间的强烈相互作用，才叫化学键；分子之间的吸引不叫化学键。判断一个变化是否破坏化学键，就看分子内部有没有被拆开、原子有没有重新组合。',
      example: {
        stem: '干冰升华时，CO2 从固体变成气体。这个过程是否破坏了化学键？',
        options: ['破坏了，因为物质状态变了', '破坏了，因为 CO2 分子被拆开了', '没有破坏，因为只是 CO2 分子间距离变大', '无法判断，因为没有化学方程式'],
        answer: 2,
        explanation: '干冰升华是物理变化，CO2 分子本身没有被拆开，只是分子间距离变大，克服的是分子间作用力，不是 CO2 分子内的化学键。',
      },
      flashcard: {
        front: '判断“是不是化学键”，第一眼看什么？',
        back: '看作用对象：原子/离子之间才可能是化学键；分子之间不是化学键。',
      },
      tips: ['判断口诀：**分子内看化学键，分子间不算键**', '物理变化通常不破坏化学键；化学反应通常伴随旧键断裂和新键形成', '不要被“状态改变、溶解、升华”骗到，先问：分子有没有被拆开？'],
      summary: '化学键是微粒结合成稳定物质的核心作用力。',
      examWeight: 2,
    },
    challenges: [
      {
        stem: '下列变化中，不需要破坏化学键的是',
        options: ['水通电分解', '氯化氢和硝酸银反应', '干冰升华', '甲烷燃烧'],
        answer: 2,
        explanation: '干冰升华只改变 CO2 分子间距离，不拆开 CO2 分子，因此不破坏化学键。其余变化都属于化学变化，会涉及旧键断裂和新键形成。',
      },
      {
        stem: '化学反应的微观本质可以概括为',
        options: ['原子核发生变化', '分子间距离改变', '旧化学键断裂和新化学键形成', '元素种类发生改变'],
        answer: 2,
        explanation: '化学反应中原子重新组合，本质是旧化学键断裂并形成新的化学键。',
      },
      {
        stem: '下列关于化学键的说法，正确的是',
        options: ['任何微粒之间的作用力都叫化学键', '化学键通常指相邻原子或离子间的强烈相互作用', '分子之间的吸引力就是化学键', '化学键只存在于金属单质中'],
        answer: 1,
        explanation: '化学键强调“相邻原子或离子之间”的“强烈相互作用”。分子间作用力不属于化学键。',
      },
    ],
  },
  {
    id: 'g10-l01-n02',
    topic: '原子结构与核电荷数',
    difficulty: 1,
    learningContent: {
      concept: '**先判定是不是中性原子。**中性原子中，核电荷数 = 质子数 = 核外电子数 = 原子序数；但离子已经得失电子，核外电子数不能再直接等于质子数。核电荷数也不能直接确定中子数。',
      example: {
        stem: '一个粒子的核电荷数为 17。只凭这个信息，最不能确定的是',
        options: ['它的质子数', '它的元素种类', '它的原子序数', '它的中子数'],
        answer: 3,
        explanation: '核电荷数就是质子数，也决定元素种类和原子序数；但同种元素可能有不同中子数，必须知道质量数等信息才能确定中子数。',
      },
      flashcard: {
        front: '看到“核电荷数”，最稳定的第一反应是什么？',
        back: '核电荷数 = 质子数 = 原子序数；只有中性原子才还能等于核外电子数。',
      },
      tips: ['中性原子：**质子数 = 核外电子数**', '离子：电子数已经变了，先看电荷再算', '同种元素可有不同中子数，因此核电荷数不能唯一确定中子数'],
      summary: '核电荷数是连接原子结构和元素周期表的关键数量。',
      examWeight: 2,
    },
    challenges: [
      {
        stem: '原子序数为 2 的氦原子中，核电荷数和核外电子数分别为',
        options: ['2、2', '2、4', '4、2', '4、4'],
        answer: 0,
        explanation: '氦的原子序数为 2，核电荷数为 2；中性原子中核外电子数也为 2。',
      },
      {
        stem: '下列各组物质中，核外电子总数相等的是',
        options: ['CO 和 NO', 'H2O 和 HCl', 'SO2 和 H2S', 'NH3 和 CH4'],
        answer: 3,
        explanation: 'NH3 的电子总数为 7+3=10，CH4 的电子总数为 6+4=10，二者相等。',
      },
    ],
  },
  {
    id: 'g10-l01-n03',
    topic: '核外电子排布规律与结构示意图',
    difficulty: 2,
    prerequisites: ['g10-l01-n02'],
    learningContent: {
      concept: '**先分清“理论容量”和“最外层限制”。**第 n 层最多容纳 2n² 个电子，这是电子层理论容量；但如果这一层是最外层，通常不超过 8 个电子，K 层作最外层时不超过 2 个。',
      example: {
        stem: '第四层为最外层时，该电子层最多容纳的电子数目是',
        options: ['2 个', '8 个', '18 个', '32 个'],
        answer: 1,
        explanation: '虽然第 4 层理论最多可容纳 2n²=32 个电子，但作为最外层时通常不超过 8 个电子。',
      },
      flashcard: {
        front: '第 4 层最多 32 个电子，为什么作最外层时不是 32？',
        back: '32 是理论容量；最外层通常不超过 8 个电子，这是两条不同规则。',
      },
      tips: ['先排低能层，再排高能层', '**2n² 是容量规则，最外层 8 是稳定结构规则**', '最外层 8 电子稳定结构是后续离子和化学键判断的基础'],
      summary: '电子排布规律用于推断元素性质、离子形成和化学键类型。',
      examWeight: 3,
    },
    challenges: [
      {
        stem: '某元素原子核外 L 层上的电子数是 K 层电子数的 3 倍，该元素是',
        options: ['氧', '铝', '硫', '硼'],
        answer: 0,
        explanation: 'K 层有 2 个电子，L 层为其 3 倍即 6 个电子，电子排布为 2、6，对应氧元素。',
      },
      {
        stem: '1~18 号元素中，原子核外电子层数等于最外层电子数的元素共有',
        options: ['1 种', '2 种', '3 种', '4 种'],
        answer: 2,
        explanation: 'H：1 层且最外层 1 个电子；Be：2 层且最外层 2 个电子；Al：3 层且最外层 3 个电子，共 3 种。',
      },
      {
        stem: 'M 层有 2 个电子的元素 A 与 L 层有 6 个电子的元素 B 所形成的化合物是',
        options: ['MgO', 'CaS', 'MgS', 'BeO'],
        answer: 0,
        explanation: 'M 层有 2 个电子的元素是 Mg；L 层有 6 个电子的元素是 O，形成 MgO。',
      },
    ],
  },
  {
    id: 'g10-l01-n04',
    topic: '原子电子式与离子表示',
    difficulty: 2,
    prerequisites: ['g10-l01-n03'],
    learningContent: {
      concept: '**电子式只画最外层电子。**原子得失电子后形成离子：正离子是失电子，满足“质子数 - 电子数 = 电荷数”；负离子是得电子，满足“电子数 - 质子数 = 电荷数”。',
      example: {
        stem: '某离子 M2+ 核外电子数为 24。这个元素原子的质子数是多少？',
        options: ['22', '24', '26', '28'],
        answer: 2,
        explanation: 'M2+ 表示原子失去 2 个电子后还剩 24 个电子，所以中性原子原来有 26 个电子，质子数也为 26。',
      },
      flashcard: {
        front: 'M2+ 的电子数比中性原子多还是少？',
        back: '少 2 个。正离子由失电子形成，电荷数是多少，就少几个电子。',
      },
      tips: ['正离子：**质子数 - 电子数 = 正电荷数**', '负离子：**电子数 - 质子数 = 负电荷数**', '简单金属阳离子的电子式常用离子符号表示；阴离子要用方括号并标电荷'],
      summary: '电子式和离子结构示意图是描述原子得失电子过程的重要工具。',
      examWeight: 3,
    },
    challenges: [
      {
        stem: '对于 Fe3+、Fe2+ 和 Fe 三种微粒，下列说法错误的是',
        options: ['核电荷数相同', '质量几乎相等', '核外电子排布相同', '化学性质不同'],
        answer: 2,
        explanation: '三者质子数相同，质量主要由原子核决定所以几乎相等；但核外电子数不同，电子排布不同，化学性质也不同。',
      },
      {
        stem: '某离子 M2+ 核外电子数为 24，则该元素原子的质子数为',
        options: ['24', '22', '26', '28'],
        answer: 2,
        explanation: 'M2+ 比中性原子少 2 个电子，因此原子核外电子数为 26；中性原子的质子数也为 26。',
      },
      {
        stem: '正离子 Xm+ 中，质子数、电子数与电荷数 m 的关系是',
        options: ['电子数 - 质子数 = m', '质子数 - 电子数 = m', '质子数 + 电子数 = m', '质子数 = 电子数 = m'],
        answer: 1,
        explanation: '正离子由原子失去电子形成，质子数多于电子数，差值等于正电荷数。',
      },
    ],
  },
  {
    id: 'g10-l01-n05',
    topic: '离子键、共价键与化学键形成',
    difficulty: 2,
    prerequisites: ['g10-l01-n04'],
    learningContent: {
      concept: '**先看元素组合，再看电子怎么稳定。**活泼金属 + 活泼非金属，常通过电子得失形成阴阳离子，再靠静电作用形成离子键；非金属 + 非金属，通常通过共用电子对形成共价键。',
      example: {
        stem: 'Na 和 Cl 形成 NaCl 时，最关键的成键方式是',
        options: ['两个原子共用电子对', '钠失电子、氯得电子后通过静电作用结合', '分子之间互相吸引', '原子核之间直接结合'],
        answer: 1,
        explanation: 'Na 是活泼金属，Cl 是活泼非金属；Na 失去电子形成 Na+，Cl 得到电子形成 Cl-，阴阳离子通过静电作用形成离子键。',
      },
      flashcard: {
        front: 'NaCl 和 HCl 的成键判断第一步有什么不同？',
        back: 'NaCl 是金属 + 非金属，优先离子键；HCl 是非金属 + 非金属，优先共价键。',
      },
      tips: ['金属 + 非金属：优先考虑离子键', '非金属 + 非金属：优先考虑共价键', '稳定状态不是“只有吸引力”，而是吸引和排斥达到平衡'],
      summary: '化学键类型取决于成键微粒和电子转移或共用方式。',
      examWeight: 3,
    },
    challenges: [
      {
        stem: '原子结合成分子时，稳定状态下原子间',
        options: ['只存在吸引力', '没有排斥力', '吸引力大于排斥力', '吸引力与排斥力达到平衡'],
        answer: 3,
        explanation: '稳定分子中原子间距离适中，吸引力与排斥力达到平衡，体系能量较低。',
      },
      {
        stem: '下列不是化学键特性的是',
        options: ['作用于原子间', '作用于分子间', '整体作用稳定', '作用力强烈'],
        answer: 1,
        explanation: '化学键主要是相邻原子或离子间的强烈相互作用，不是分子间作用力。',
      },
    ],
  },
];

const lesson2Nodes: KnowledgePoint[] = [
  {
    id: 'g10-l02-n01',
    topic: '离子键的形成与判断',
    difficulty: 2,
    prerequisites: ['g10-l01-n05'],
    learningContent: {
      concept: '**离子键不是只有吸引力。**离子键是阴阳离子之间的静电作用，既包含吸引，也包含排斥；当吸引和排斥达到平衡时，正负离子保持稳定距离。',
      example: {
        stem: '下列关于离子键的说法，最准确的是',
        options: ['正负离子通过静电引力形成离子键', '离子键只存在于金属和非金属之间', '离子键是正负离子之间的静电作用', '只要含金属元素就一定有离子键'],
        answer: 2,
        explanation: '离子键是正负离子间的静电作用，既有吸引也有排斥。金属和非金属之间常形成离子键，但不是绝对，如 AlCl3 中主要为共价键。',
      },
      flashcard: {
        front: '“离子键 = 静电引力”这句话为什么不严谨？',
        back: '因为静电作用包括吸引和排斥；稳定离子键来自吸引与排斥的平衡。',
      },
      tips: ['活泼金属 + 活泼非金属：优先判断离子键', '铵根离子与酸根离子也能形成离子键', '离子键表述用“静电作用”比“静电引力”更准确'],
      summary: '离子键判断要同时看粒子类型和静电作用本质。',
      examWeight: 3,
    },
    challenges: [
      {
        stem: '下列元素的原子间最不容易形成离子键的是',
        options: ['钠和氟', '镁和溴', '钙和氧', '硅和氧'],
        answer: 3,
        explanation: 'Na/F、Mg/Br、Ca/O 都是典型金属与非金属组合，容易形成离子键；Si 和 O 形成的 SiO2 主要为共价键。',
      },
      {
        stem: '下列物质中存在离子键的是',
        options: ['Ne', 'CO2', 'KI', 'HCl'],
        answer: 2,
        explanation: 'KI 由 K+ 和 I- 构成，存在离子键。Ne 是单原子分子，CO2 和 HCl 主要含共价键。',
      },
      {
        stem: '下列叙述正确的是',
        options: ['金属元素与非金属元素化合时一定形成离子键', '仅由非金属元素组成的物质不可能含有离子键', '某元素最外层只有一个电子，与氯形成的键不一定是离子键', '离子键只存在于简单离子之间'],
        answer: 2,
        explanation: '最外层只有一个电子的元素可能是 H，H 与 Cl 形成 HCl 时为共价键。NH4Cl 等仅由非金属元素组成的物质也可含离子键。',
      },
    ],
  },
  {
    id: 'g10-l02-n02',
    topic: '离子化合物的性质与验证',
    difficulty: 2,
    prerequisites: ['g10-l02-n01'],
    learningContent: {
      concept: '**判断离子化合物，最硬的证据看熔融导电。**离子化合物固态时离子不能自由移动；熔化或溶于水后，离子键被破坏，离子可自由移动，因此能导电。',
      example: {
        stem: '下列性质中，可以证明某化合物中一定存在离子键的是',
        options: ['可溶于水', '具有较高熔点', '水溶液能导电', '熔融状态能导电'],
        answer: 3,
        explanation: '熔融状态能导电，说明熔化后产生了可自由移动的离子，这是判断离子化合物的强证据。水溶液导电可能是共价化合物溶于水后电离造成的，如 HCl。',
      },
      flashcard: {
        front: '为什么“水溶液导电”不能直接证明是离子化合物？',
        back: '有些共价化合物溶于水也会电离导电，如 HCl；熔融状态导电更能证明离子化合物。',
      },
      tips: ['固态离子化合物通常不导电，因为离子不能自由移动', '熔融导电：离子化合物的重要实验特征', '溶于水导电要小心，酸也可能导电'],
      summary: '离子化合物的性质来自离子键和离子能否自由移动。',
      examWeight: 3,
    },
    challenges: [
      {
        stem: '下列变化过程中，离子键被破坏的是',
        options: ['干冰变气态', '将氯化钠熔化', '碘升华', '冰熔化'],
        answer: 1,
        explanation: '氯化钠熔化时，Na+ 和 Cl- 的稳定排列被破坏，离子键被破坏。干冰、碘、冰的状态变化主要克服分子间作用力或氢键等。',
      },
      {
        stem: '下列物质中属于离子化合物的是',
        options: ['苛性钾', '碘化氢', '硫酸', '高氯酸'],
        answer: 0,
        explanation: '苛性钾是 KOH，属于强碱，是离子化合物；HI、H2SO4、HClO4 都是共价化合物，溶于水后可电离。',
      },
      {
        stem: '下列各组原子序数表示的元素，能形成 AB2 型离子化合物的是',
        options: ['6 和 8', '11 和 13', '11 和 16', '12 和 17'],
        answer: 3,
        explanation: '原子序数 12 为 Mg，17 为 Cl，形成 MgCl2，属于 AB2 型离子化合物。',
      },
    ],
  },
  {
    id: 'g10-l02-n03',
    topic: '共价键与共价化合物',
    difficulty: 2,
    prerequisites: ['g10-l02-n02'],
    learningContent: {
      concept: '**共价键的核心是共用电子对。**非金属原子之间难以发生完全电子得失，常通过各自提供电子形成共用电子对，从而达到稳定结构。',
      example: {
        stem: '下列事实最能说明氯化氢是共价化合物的是',
        options: ['氯化氢不易分解', '液态氯化氢不导电', '氯化氢溶于水发生电离', '氯化氢水溶液呈酸性'],
        answer: 1,
        explanation: '液态 HCl 不导电，说明纯液态中没有自由移动的离子，符合共价化合物特征。HCl 溶于水后导电，是因为在水中电离。',
      },
      flashcard: {
        front: 'HCl 水溶液导电，为什么 HCl 仍是共价化合物？',
        back: '看纯物质状态：液态 HCl 不导电；溶于水导电是水促使其电离后的结果。',
      },
      tips: ['非金属 + 非金属：优先考虑共价键', '稀有气体为单原子分子，通常没有化学键', '共价化合物在气态、固态或纯液态时通常不导电'],
      summary: '共价键来自共用电子对，共价化合物不能只看水溶液是否导电。',
      examWeight: 3,
    },
    challenges: [
      {
        stem: '下列物质中存在共价键的是',
        options: ['NaCl', 'NH4NO3', '汞', 'CH4'],
        answer: 3,
        explanation: 'CH4 中 C-H 键为共价键。NH4NO3 也含共价键，但同时是离子化合物；本题若按单选且最典型纯共价分子，应选 CH4。',
      },
      {
        stem: '下列物质中不存在共价键的是',
        options: ['金刚石', '氮气', '氙气', '二氧化碳'],
        answer: 2,
        explanation: '氙气是稀有气体单原子分子，通常不存在化学键；金刚石、N2、CO2 都含共价键。',
      },
      {
        stem: '下列物质中，只存在共价键的是',
        options: ['C60', 'CaF2', 'Na', 'KNO3'],
        answer: 0,
        explanation: 'C60 是非金属单质，只含共价键；CaF2 含离子键，Na 含金属键，KNO3 既含离子键又含共价键。',
      },
    ],
  },
  {
    id: 'g10-l02-n04',
    topic: '只含离子键、只含共价键与混合键型',
    difficulty: 3,
    prerequisites: ['g10-l02-n03'],
    learningContent: {
      concept: '**先判断整体是不是离子化合物，再看原子团内部。**盐、强碱等常有离子键；若含 NH4+、OH-、NO3-、SO4^2- 等原子团，原子团内部通常还含共价键。',
      example: {
        stem: '下列物质按“只含离子键、只含共价键、既含离子键又含共价键”的顺序排列，正确的是',
        options: ['Cl2、CO2、NaOH', 'NaCl、H2O2、NH4Cl', 'NaCl、Na2SO4、NH4Cl', 'NaCl、He、NaOH'],
        answer: 1,
        explanation: 'NaCl 只含离子键；H2O2 只含共价键；NH4Cl 中 NH4+ 与 Cl- 间有离子键，NH4+ 内 N-H 为共价键。',
      },
      flashcard: {
        front: '看到 NH4Cl、NaOH、KNO3，为什么不能只说“有离子键”？',
        back: '它们有离子键，但原子团内部还有共价键，所以属于既含离子键又含共价键。',
      },
      tips: ['简单盐如 NaCl：常只含离子键', '含原子团的离子化合物：通常既含离子键又含共价键', '共价化合物与离子化合物的分类看整体，不是只看某一条键'],
      summary: '混合键型题的关键是识别原子团。',
      examWeight: 4,
    },
    challenges: [
      {
        stem: '下列物质中属于含有共价键的离子化合物的是',
        options: ['氢氧化钠', '碘化氢', '二氧化碳', '氯化钾'],
        answer: 0,
        explanation: 'NaOH 中 Na+ 与 OH- 间有离子键，OH- 内 O-H 为共价键。HI 和 CO2 是共价化合物，KCl 通常只含离子键。',
      },
      {
        stem: '下列说法正确的是',
        options: ['共价键只存在于单质和共价化合物中', '离子键只存在于离子化合物中', '完全由非金属元素组成的化合物一定是共价化合物', '离子化合物中一定含有金属元素'],
        answer: 1,
        explanation: '离子键存在于离子化合物中。共价键也可存在于离子化合物的原子团内；NH4Cl 全由非金属元素组成但为离子化合物。',
      },
    ],
  },
  {
    id: 'g10-l02-n05',
    topic: '电子式、结构式与分子式表达',
    difficulty: 2,
    prerequisites: ['g10-l02-n04'],
    learningContent: {
      concept: '**电子式看最外层电子，结构式看共用电子对。**用一根短线表示一对共用电子，就是结构式；离子化合物的电子式由正负离子的电子式组合而成。',
      example: {
        stem: '下列表示物质的化学式，又可以称为分子式的是',
        options: ['硫酸铜', '二氧化硅', '铁', '四氯化碳'],
        answer: 3,
        explanation: 'CCl4 由分子构成，化学式也可称为分子式。硫酸铜、二氧化硅、铁都不是由单个分子构成。',
      },
      flashcard: {
        front: '所有化学式都能叫分子式吗？',
        back: '不能。只有由分子构成的物质，化学式才可称为分子式。',
      },
      tips: ['结构式：一根短线 = 一对共用电子', '离子化合物不存在单个分子，通常不能称分子式', '金属晶体、离子晶体、原子晶体要谨慎使用“分子”概念'],
      summary: '表达方式要和物质构成方式匹配。',
      examWeight: 2,
    },
    challenges: [
      {
        stem: '下列物质中，化学式也可称为分子式的是',
        options: ['NaCl', 'SiO2', 'Fe', 'CO2'],
        answer: 3,
        explanation: 'CO2 由 CO2 分子构成，化学式可称为分子式。NaCl 是离子晶体，SiO2 是原子晶体，Fe 是金属晶体。',
      },
      {
        stem: '下列物质气化或熔化时，克服的微粒间作用力属同种类型的是',
        options: ['碘和干冰的升华', '金刚石和生石灰的熔化', '氯化钠和铁的熔化', '铜和冰的熔化'],
        answer: 0,
        explanation: '碘和干冰都是分子晶体，升华时主要克服分子间作用力。其他选项涉及共价键、离子键、金属键或氢键等不同类型。',
      },
    ],
  },
];

interface LessonNodeSeed {
  topic: string;
  difficulty: number;
  concept: string;
  example: Challenge;
  tips: string[];
  summary: string;
  examWeight: number;
  flashcard?: { front: string; back: string };
  challenges: Challenge[];
}

function buildLessonNodes(lessonNo: number, seeds: LessonNodeSeed[], firstPrerequisite?: string): KnowledgePoint[] {
  const lessonKey = String(lessonNo).padStart(2, '0');
  return seeds.map((seed, index) => {
    const nodeNo = String(index + 1).padStart(2, '0');
    const previousNodeId = index === 0 ? firstPrerequisite : `g10-l${lessonKey}-n${String(index).padStart(2, '0')}`;
    return {
      id: `g10-l${lessonKey}-n${nodeNo}`,
      topic: seed.topic,
      difficulty: seed.difficulty,
      prerequisites: previousNodeId ? [previousNodeId] : undefined,
      learningContent: {
        concept: seed.concept,
        example: seed.example,
        tips: seed.tips,
        summary: seed.summary,
        examWeight: seed.examWeight,
        flashcard: seed.flashcard,
      },
      challenges: seed.challenges,
    };
  });
}

const lesson3Nodes = buildLessonNodes(3, [
  {
    topic: '质量数、质子数与中子数',
    difficulty: 1,
    concept: '**先抓两个等式。**质量数 = 质子数 + 中子数；中性原子中，质子数 = 核外电子数。带电粒子要先用电荷修正电子数，再判断质子数和中子数。',
    example: {
      stem: '某原子含 8 个质子、10 个中子、8 个电子，该原子的质量数为',
      options: ['8', '10', '18', '26'],
      answer: 2,
      explanation: '质量数等于质子数与中子数之和，8+10=18。电子数不参与质量数计算。',
    },
    flashcard: { front: '质量数怎么算？', back: '质量数 = 质子数 + 中子数。' },
    tips: ['看到“质量数”先找质子和中子', '中性原子才有质子数 = 电子数', '离子题先还原电子得失，再定原子序数'],
    summary: '原子结构计算的核心是分清核内粒子和核外电子。',
    examWeight: 3,
    challenges: [
      {
        stem: '某元素原子有 19 个质子、20 个中子，则该原子的质量数为',
        options: ['19', '20', '39', '40'],
        answer: 2,
        explanation: '质量数 = 质子数 + 中子数 = 19+20=39。',
      },
      {
        stem: '某离子 X2- 含有 18 个电子，X 原子的质子数为',
        options: ['16', '18', '20', '34'],
        answer: 0,
        explanation: 'X2- 比中性原子多 2 个电子，所以中性 X 原子有 16 个电子，质子数为 16。',
      },
    ],
  },
  {
    topic: '元素、核素与同位素',
    difficulty: 2,
    concept: '**元素看质子数，核素看质子数和中子数。**同位素是质子数相同、中子数不同的同种元素原子；H2 分子不是核素，也不是同位素。',
    example: {
      stem: '下列粒子互为同位素的是',
      options: ['H2 和 D2', '12C 和 14C', 'O2 和 O3', 'Na+ 和 Na'],
      answer: 1,
      explanation: '12C 和 14C 质子数相同，质量数不同，中子数不同，互为同位素。',
    },
    flashcard: { front: '元素种类由什么决定？', back: '质子数，也就是核电荷数。' },
    tips: ['同位素必须是原子，不是分子或离子对', '元素种类看质子数，原子种类看质子数和中子数', '同位素化学性质相似，物理性质可不同'],
    summary: '同位素题的第一步是确认对象是不是“同种元素的不同原子”。',
    examWeight: 3,
    challenges: [
      {
        stem: '关于 1H、2H、3H 的说法正确的是',
        options: ['它们质子数不同', '它们互为同位素', '它们化学性质完全不同', '它们是三种不同元素'],
        answer: 1,
        explanation: '三者都是氢元素原子，质子数相同，中子数不同，互为同位素。',
      },
      {
        stem: '元素的种类主要取决于原子的',
        options: ['中子数', '电子层数', '质子数', '相对原子质量'],
        answer: 2,
        explanation: '质子数决定元素种类；同种元素可以有不同中子数。',
      },
    ],
  },
  {
    topic: '相对原子质量与平均相对原子质量',
    difficulty: 2,
    concept: '**相对原子质量是比较值，平均相对原子质量要按丰度加权。**元素周期表中的相对原子质量通常不是某一个原子的质量数，而是天然同位素按丰度平均后的结果。',
    example: {
      stem: '氯元素有 35Cl 和 37Cl 两种同位素，原子个数比约为 3:1，则氯元素的平均相对原子质量约为',
      options: ['35', '35.5', '36', '37'],
      answer: 1,
      explanation: '加权平均：(35×3+37×1)/4=35.5。',
    },
    flashcard: { front: '平均相对原子质量为什么常有小数？', back: '因为它是天然同位素按丰度加权平均的结果。' },
    tips: ['质量数常为整数，平均相对原子质量可为小数', '加权平均要用“原子个数分数/丰度”', '不要把周期表小数直接当成中子数'],
    summary: '相对原子质量计算本质是比例平均。',
    examWeight: 4,
    challenges: [
      {
        stem: '某元素两种同位素的质量数为 10 和 11，丰度分别为 20% 和 80%，该元素平均相对原子质量约为',
        options: ['10.2', '10.5', '10.8', '11.0'],
        answer: 2,
        explanation: '10×20%+11×80%=10.8。',
      },
      {
        stem: '周期表中氯的相对原子质量约为 35.5，这说明',
        options: ['每个氯原子都有 35.5 个中子', '天然氯是同位素混合物', '氯原子质量数一定为 35.5', '氯只有一种核素'],
        answer: 1,
        explanation: '35.5 来自 35Cl、37Cl 等同位素的平均，不表示单个原子的质量数。',
      },
    ],
  },
  {
    topic: '同位素组成与式量推断',
    difficulty: 3,
    concept: '**分子式量题先列可能组合。**由两种同位素组成的双原子分子会出现轻轻、轻重、重重三类式量，强度或比例再由原子丰度推断。',
    example: {
      stem: '氯气由 35Cl 和 37Cl 组成，可能出现的 Cl2 相对分子质量不包括',
      options: ['70', '72', '74', '76'],
      answer: 3,
      explanation: '35+35=70，35+37=72，37+37=74，不可能为 76。',
    },
    flashcard: { front: '双原子分子同位素组合怎么列？', back: '轻轻、轻重、重重三种组合，注意轻重有两种排列但式量相同。' },
    tips: ['先列质量数组合，再看丰度比例', '式量种类不等于同位素种类', '混合物平均值不能替代单个分子的式量'],
    summary: '同位素分子题训练的是组合意识和加权意识。',
    examWeight: 3,
    challenges: [
      {
        stem: '若某元素 X 有 10X 和 11X 两种同位素，则 X2 分子可能有几种不同相对分子质量',
        options: ['1 种', '2 种', '3 种', '4 种'],
        answer: 2,
        explanation: '可能为 20、21、22 三种相对分子质量。',
      },
      {
        stem: '等物质的量的 12C 和 14C 原子相比，一定相同的是',
        options: ['中子总数', '质量', '原子个数', '每个原子的质量数'],
        answer: 2,
        explanation: '等物质的量表示粒子数相同；12C 和 14C 的中子数、质量数和质量不同。',
      },
    ],
  },
], 'g10-l02-n05');

const lesson4Nodes = buildLessonNodes(4, [
  {
    topic: '电解质、非电解质与导电本质',
    difficulty: 2,
    concept: '**分类对象必须是化合物。**电解质是在水溶液或熔融状态下能导电的化合物；非电解质是在这两种条件下都不导电的化合物。单质和混合物不属于这组分类。',
    example: {
      stem: '下列物质中，属于电解质的是',
      options: ['铜', '盐酸', '氯化钠固体', '蔗糖溶液'],
      answer: 2,
      explanation: 'NaCl 是化合物，溶于水或熔融时能导电，属于电解质。铜是单质，盐酸和蔗糖溶液是混合物。',
    },
    flashcard: { front: '判断电解质前先问什么？', back: '先问它是不是化合物；单质和混合物不参与电解质/非电解质分类。' },
    tips: ['能导电的原因是有自由移动的离子或电子', '电解质本身可以在固态时不导电', 'CO2、NH3 的水溶液导电，但它们本身常归为非电解质'],
    summary: '电解质概念题最容易错在分类对象和导电原因。',
    examWeight: 4,
    challenges: [
      {
        stem: '下列说法正确的是',
        options: ['能导电的物质一定是电解质', '电解质固态时一定导电', '电解质必须是化合物', '盐酸是电解质'],
        answer: 2,
        explanation: '电解质必须是化合物。金属能导电但不是电解质；盐酸是混合物，不是电解质。',
      },
      {
        stem: 'CO2 的水溶液能导电，CO2 属于',
        options: ['强电解质', '弱电解质', '非电解质', '单质'],
        answer: 2,
        explanation: '导电的是 CO2 与水反应生成的碳酸发生电离，CO2 本身属于非电解质。',
      },
    ],
  },
  {
    topic: '强电解质与弱电解质',
    difficulty: 2,
    concept: '**强弱看电离程度，不看溶解度。**强电解质在水中完全电离，弱电解质部分电离。难溶盐如 BaSO4 虽溶解少，但溶解的部分完全电离，仍属于强电解质。',
    example: {
      stem: '下列物质属于弱电解质的是',
      options: ['NaCl', 'BaSO4', 'CH3COOH', 'HNO3'],
      answer: 2,
      explanation: '醋酸是弱酸，在水中部分电离，属于弱电解质。强酸、强碱、大多数盐属于强电解质。',
    },
    flashcard: { front: '强电解质一定易溶吗？', back: '不一定。强弱看电离是否完全，不看溶解度大小。' },
    tips: ['强酸、强碱、大多数盐：强电解质', '弱酸、弱碱、水：弱电解质', '难溶不等于弱电解质'],
    summary: '强弱电解质判断围绕“是否完全电离”。',
    examWeight: 4,
    challenges: [
      {
        stem: '下列各组物质均属于强电解质的是',
        options: ['HCl、NaOH、Na2SO4', 'NH3、H2O、CH3COOH', 'CO2、SO2、蔗糖', 'Cu、NaCl、HCl'],
        answer: 0,
        explanation: 'HCl、NaOH、Na2SO4 在水中完全电离，属于强电解质。',
      },
      {
        stem: '能说明某酸是弱酸的事实是',
        options: ['水溶液能导电', '能与碱反应', '同浓度溶液中 H+ 浓度明显小于酸的浓度', '能使石蕊变红'],
        answer: 2,
        explanation: '弱酸部分电离，同浓度下产生的 H+ 少，这是本质证据。',
      },
    ],
  },
  {
    topic: '电离方程式书写',
    difficulty: 2,
    concept: '**强电解质用等号，弱电解质用可逆号。**书写时要拆成真实存在的离子，并检查元素守恒和电荷守恒；多元弱酸分步电离，酸式盐要看在水中如何电离。',
    example: {
      stem: '下列电离方程式正确的是',
      options: ['Na2SO4 = Na+ + SO4^2-', 'Ba(OH)2 = Ba2+ + OH-', 'HCl = H+ + Cl-', 'CH3COOH = CH3COO- + H+'],
      answer: 2,
      explanation: 'HCl 是强酸，完全电离为 H+ 和 Cl-。Na2SO4 应为 2Na+；Ba(OH)2 应为 2OH-；醋酸为弱电解质，应使用可逆号。',
    },
    flashcard: { front: '电离方程式最后检查哪两件事？', back: '元素守恒和电荷守恒。' },
    tips: ['强电解质完全电离，弱电解质部分电离', '下标变系数，电荷不能丢', '原子团通常整体电离出来'],
    summary: '电离方程式是离子反应学习的入口。',
    examWeight: 4,
    challenges: [
      {
        stem: 'Na2CO3 在水中的电离方程式应为',
        options: ['Na2CO3 = Na2+ + CO3^2-', 'Na2CO3 = 2Na+ + CO3^2-', 'Na2CO3 = Na+ + CO3-', 'Na2CO3 = 2Na + CO3'],
        answer: 1,
        explanation: 'Na2CO3 完全电离为 2 个 Na+ 和 1 个 CO3^2-。',
      },
      {
        stem: '下列物质在水中电离时，能产生 2 mol H+ 的是 1 mol',
        options: ['HCl', 'HNO3', 'H2SO4', 'NaHSO4 固体在熔融状态'],
        answer: 2,
        explanation: '1 mol H2SO4 在水中可电离产生 2 mol H+。熔融 NaHSO4 不按水溶液方式产生 H+。',
      },
    ],
  },
  {
    topic: '状态导电实验与微观解释',
    difficulty: 3,
    concept: '**导电要有能自由移动的带电粒子。**金属靠自由电子导电；电解质溶液或熔融电解质靠自由移动的离子导电；离子晶体固态时离子被固定，通常不导电。',
    example: {
      stem: 'MgO 在熔融状态下能导电，其本质原因是',
      options: ['产生了自由电子', '产生了自由移动的 Mg2+ 和 O2-', '生成了 Mg 单质', '发生了化学反应'],
      answer: 1,
      explanation: 'MgO 是离子化合物，熔融后离子可自由移动，因此导电。',
    },
    flashcard: { front: '固态 NaCl 为什么不导电？', back: '离子被固定在晶体中，不能自由移动。' },
    tips: ['固态离子晶体不导电，熔融或溶于水后可导电', '金属导电不是电解质电离', '分子化合物纯液态通常不导电'],
    summary: '导电实验是把宏观现象和微观粒子连接起来的关键模型。',
    examWeight: 3,
    challenges: [
      {
        stem: '下列状态下，NaCl 能导电的是',
        options: ['固态 NaCl', '熔融 NaCl', '干燥 NaCl 粉末', 'NaCl 晶体'],
        answer: 1,
        explanation: '熔融状态下 Na+、Cl- 可自由移动，可以导电。',
      },
      {
        stem: '下列物质导电能力最可能最差的是',
        options: ['铜丝', '熔融 KCl', '稀硫酸', '蔗糖溶液'],
        answer: 3,
        explanation: '蔗糖是非电解质，水溶液中几乎没有自由移动的离子。',
      },
    ],
  },
], 'g10-l03-n04');

const lesson5Nodes = buildLessonNodes(5, [
  {
    topic: '离子反应的条件',
    difficulty: 2,
    concept: '**离子反应要让离子数目或种类发生实际变化。**复分解型离子反应常因生成沉淀、气体或弱电解质而发生；氧化还原型离子反应还要看电子转移。',
    example: {
      stem: '下列混合后能发生离子反应的是',
      options: ['NaCl 溶液和 KNO3 溶液', 'BaCl2 溶液和 Na2SO4 溶液', 'NaNO3 溶液和 KCl 溶液', 'KNO3 溶液和 NaCl 溶液'],
      answer: 1,
      explanation: 'Ba2+ 与 SO4^2- 生成 BaSO4 沉淀，离子浓度发生变化，发生离子反应。',
    },
    flashcard: { front: '复分解型离子反应常见发生条件？', back: '生成沉淀、气体或弱电解质。' },
    tips: ['不生成新弱物质时，常只是离子共存', '沉淀、气体、水是最常见信号', '离子反应不一定都是复分解，也可能是氧化还原'],
    summary: '判断离子反应，关键看溶液中真实离子是否被消耗。',
    examWeight: 4,
    challenges: [
      {
        stem: '下列反应中属于离子反应的是',
        options: ['木炭燃烧', '铁丝在氧气中燃烧', '盐酸与氢氧化钠溶液反应', '氢气还原氧化铜'],
        answer: 2,
        explanation: '酸碱中和在溶液中由 H+ 和 OH- 反应生成水，属于离子反应。',
      },
      {
        stem: 'NaCl 溶液与 AgNO3 溶液混合的离子反应本质是',
        options: ['Na+ + NO3- 结合', 'Ag+ + Cl- 生成 AgCl 沉淀', 'Na+ + Cl- 结合', 'Ag+ + NO3- 结合'],
        answer: 1,
        explanation: 'AgCl 是难溶沉淀，Ag+ 与 Cl- 被消耗。',
      },
    ],
  },
  {
    topic: '离子方程式的意义与书写',
    difficulty: 2,
    concept: '**拆强留弱，删同看本质。**离子方程式把可溶强电解质拆成离子，沉淀、气体、弱电解质、单质、氧化物保留化学式，最后删去两边相同离子。',
    example: {
      stem: '能用 H+ + OH- = H2O 表示的是',
      options: ['醋酸和 NaOH 溶液反应', '盐酸和 Ba(OH)2 溶液反应', 'Cu(OH)2 和盐酸反应', '氨水和盐酸反应'],
      answer: 1,
      explanation: '盐酸和 Ba(OH)2 都是强电解质，反应本质可表示为 H+ + OH- = H2O。',
    },
    flashcard: { front: '离子方程式书写口诀？', back: '写、拆、删、查：写方程，拆强电解质，删旁观离子，查守恒。' },
    tips: ['弱酸、弱碱、水不能拆', '沉淀和气体不能拆', '离子方程式要同时守恒原子和电荷'],
    summary: '离子方程式训练的是“看见反应本质”。',
    examWeight: 5,
    challenges: [
      {
        stem: 'BaCl2 溶液与 Na2SO4 溶液反应的离子方程式为',
        options: ['Ba2+ + SO4^2- = BaSO4↓', 'BaCl2 + SO4^2- = BaSO4↓ + 2Cl-', 'Na+ + Cl- = NaCl', 'Ba2+ + 2Cl- = BaCl2'],
        answer: 0,
        explanation: '旁观离子 Na+、Cl- 删去，保留生成的 BaSO4 沉淀。',
      },
      {
        stem: '碳酸钠溶液与足量盐酸反应的离子方程式可写为',
        options: ['CO3^2- + 2H+ = CO2↑ + H2O', 'Na2CO3 + 2H+ = 2Na+ + CO2↑ + H2O', 'CO3^2- + H+ = HCO3-', 'Na+ + Cl- = NaCl'],
        answer: 0,
        explanation: '足量强酸下 CO3^2- 最终生成 CO2 和 H2O。',
      },
    ],
  },
  {
    topic: '离子方程式正误判断',
    difficulty: 3,
    concept: '**先查客观事实，再查拆写守恒。**常见错误包括：不符合反应事实、该拆没拆、不该拆却拆、电荷不守恒、配比不符合少量/过量条件。',
    example: {
      stem: '下列离子方程式正确的是',
      options: ['Fe + 2H+ = Fe3+ + H2↑', 'Cu + 2H+ = Cu2+ + H2↑', 'Ag+ + Cl- = AgCl↓', 'CO2 + OH- = CO3^2- + H2O'],
      answer: 2,
      explanation: 'Ag+ 与 Cl- 生成 AgCl 沉淀正确。铁与非氧化性酸通常生成 Fe2+；铜不与稀盐酸反应；CO2 与 OH- 配比不足。',
    },
    flashcard: { front: '离子方程式查错第一步？', back: '先看反应事实是否真实发生。' },
    tips: ['先事实，后拆写，再守恒', '少量过量会改变产物和配比', '氧化还原离子方程式还要查电子守恒'],
    summary: '正误判断不是背格式，而是把反应事实、拆写规则和守恒一起检查。',
    examWeight: 5,
    challenges: [
      {
        stem: '将 CO2 通入足量 NaOH 溶液，正确的离子方程式是',
        options: ['CO2 + OH- = HCO3-', 'CO2 + 2OH- = CO3^2- + H2O', 'CO2 + H2O = H2CO3', 'CO3^2- + 2H+ = CO2 + H2O'],
        answer: 1,
        explanation: '足量 OH- 条件下生成 CO3^2-，配比为 1:2。',
      },
      {
        stem: '下列离子方程式错误的是',
        options: ['H+ + OH- = H2O', 'Ba2+ + SO4^2- = BaSO4↓', 'CaCO3 + 2H+ = Ca2+ + CO2↑ + H2O', 'H2SO4 = 2H+ + SO4^2-'],
        answer: 3,
        explanation: 'H2SO4 的电离方程式不是具体反应的离子方程式；若作为电离式，写法本身可对，但不属于“离子反应方程式”。',
      },
    ],
  },
  {
    topic: '离子共存与除杂思路',
    difficulty: 3,
    concept: '**共存题先看限定条件。**强酸、强碱、无色、氧化还原环境都会改变答案；再查离子之间是否生成沉淀、气体、弱电解质或发生氧化还原。',
    example: {
      stem: '下列各组离子在强酸性溶液中能大量共存的是',
      options: ['H+、CO3^2-、Na+、Cl-', 'Ba2+、SO4^2-、K+、NO3-', 'Na+、K+、Cl-、NO3-', 'Ag+、Cl-、H+、NO3-'],
      answer: 2,
      explanation: 'Na+、K+、Cl-、NO3- 彼此不反应，也不与强酸条件冲突。',
    },
    flashcard: { front: '离子共存题先看什么？', back: '先看题干限定：酸性、碱性、无色、氧化性或还原性。' },
    tips: ['酸性排除 CO3^2-、OH- 等', '碱性排除大量 H+ 和许多金属阳离子', '无色条件排除 Cu2+、Fe3+、MnO4- 等有色离子'],
    summary: '共存和除杂都服务于“哪些离子能被选择性消耗”。',
    examWeight: 4,
    challenges: [
      {
        stem: '强碱性无色溶液中能大量共存的是',
        options: ['Cu2+、Na+、Cl-、NO3-', 'NH4+、K+、SO4^2-、Cl-', 'Na+、K+、NO3-、Cl-', 'Fe3+、Na+、Cl-、SO4^2-'],
        answer: 2,
        explanation: 'Na+、K+、NO3-、Cl- 在强碱性无色溶液中不反应；Cu2+、Fe3+ 有色且会生成沉淀，NH4+ 与 OH- 反应。',
      },
      {
        stem: '除去 NaCl 溶液中的少量 SO4^2-，较合适加入',
        options: ['AgNO3 溶液', 'BaCl2 溶液', 'NaOH 溶液', '稀盐酸'],
        answer: 1,
        explanation: 'Ba2+ 可与 SO4^2- 生成 BaSO4 沉淀，同时引入 Cl- 不改变 NaCl 主体阴离子。',
      },
    ],
  },
], 'g10-l04-n04');

const lesson6Nodes = buildLessonNodes(6, [
  {
    topic: '物质的量与阿伏加德罗常数',
    difficulty: 2,
    concept: '**物质的量是“数粒子”的物理量。**1 mol 任何微粒都含约 NA 个指定微粒。使用 mol 时必须说清楚对象：原子、分子、离子还是电子。',
    example: {
      stem: '下列说法正确的是',
      options: ['1 mol 氢就是 1 mol H2', '1 mol H2 含有 NA 个氢原子', '1 mol H2O 含有 NA 个水分子', '1 mol 任何物质质量都相同'],
      answer: 2,
      explanation: '1 mol H2O 含 NA 个水分子；1 mol H2 含 2NA 个 H 原子。',
    },
    flashcard: { front: '用 mol 时必须补上什么？', back: '必须说清粒子对象。' },
    tips: ['n = N / NA', '粒子对象不同，数量关系不同', '分子中原子数要乘下标'],
    summary: '物质的量把宏观质量和微观粒子数连接起来。',
    examWeight: 4,
    challenges: [
      {
        stem: '0.5 mol CO2 中含有的氧原子物质的量为',
        options: ['0.5 mol', '1 mol', '1.5 mol', '2 mol'],
        answer: 1,
        explanation: '1 个 CO2 分子含 2 个氧原子，0.5 mol CO2 含 1 mol O 原子。',
      },
      {
        stem: '含 3.01×10^23 个 NH3 分子的 NH3 物质的量约为',
        options: ['0.25 mol', '0.5 mol', '1 mol', '2 mol'],
        answer: 1,
        explanation: '3.01×10^23 约为 0.5NA，因此为 0.5 mol。',
      },
    ],
  },
  {
    topic: '摩尔质量与质量换算',
    difficulty: 2,
    concept: '**摩尔质量在数值上等于相对分子质量，单位是 g/mol。**质量、物质的量、摩尔质量三者关系为 n = m / M。',
    example: {
      stem: '44 g CO2 的物质的量为',
      options: ['0.5 mol', '1 mol', '2 mol', '44 mol'],
      answer: 1,
      explanation: 'CO2 的摩尔质量为 44 g/mol，n=44/44=1 mol。',
    },
    flashcard: { front: '质量和物质的量怎么换？', back: 'n = m / M，m = nM。' },
    tips: ['先算式量，再写摩尔质量', '等质量比较粒子数，摩尔质量越小粒子数越多', '原子个数要继续乘化学式下标'],
    summary: '摩尔质量是计量计算的换算桥。',
    examWeight: 4,
    challenges: [
      {
        stem: '等质量的下列物质中，分子数最多的是',
        options: ['H2', 'O2', 'CO2', 'SO2'],
        answer: 0,
        explanation: '等质量时 n=m/M，摩尔质量越小物质的量越大，H2 摩尔质量最小。',
      },
      {
        stem: '16 g O2 中含氧原子的物质的量为',
        options: ['0.25 mol', '0.5 mol', '1 mol', '2 mol'],
        answer: 2,
        explanation: '16 g O2 为 0.5 mol O2，含 1 mol O 原子。',
      },
    ],
  },
  {
    topic: '质量、粒子数与元素守恒综合',
    difficulty: 3,
    concept: '**复杂计量题先把所有量都转成 mol。**再按化学式下标、元素守恒或反应比例去换算，避免在克、个、mol 之间来回跳。',
    example: {
      stem: '3.612×10^23 个 N2 分子的质量约为',
      options: ['8.4 g', '16.8 g', '28 g', '56 g'],
      answer: 1,
      explanation: '3.612×10^23 个分子约为 0.6 mol，N2 摩尔质量为 28 g/mol，质量为 16.8 g。',
    },
    flashcard: { front: '计量综合题第一步？', back: '统一转成 mol。' },
    tips: ['粒子数转 mol，质量转 mol', '比较前先统一对象', '元素守恒常比直接配平更快'],
    summary: '计量综合题的稳定做法是“统一单位，再看关系”。',
    examWeight: 5,
    challenges: [
      {
        stem: '质量相等的 SO2 和 SO3，所含氧原子数之比为',
        options: ['1:1', '5:6', '4:5', '2:3'],
        answer: 1,
        explanation: '设质量为 m，SO2 氧原子物质的量为 2m/64，SO3 为 3m/80，比例为 (2/64):(3/80)=5:6。',
      },
      {
        stem: '1 mol Na2SO4 中含有 Na+ 的物质的量为',
        options: ['0.5 mol', '1 mol', '2 mol', '4 mol'],
        answer: 2,
        explanation: '每个 Na2SO4 单元含 2 个 Na+，所以 1 mol 中含 2 mol Na+。',
      },
    ],
  },
  {
    topic: '以物质的量为核心的反应计算',
    difficulty: 3,
    concept: '**反应计算先配平，再按系数比。**质量守恒和物质的量比例都来自化学方程式，限制量题要先判断谁先反应完。',
    example: {
      stem: '2 mol H2 与 1 mol O2 完全反应生成水的物质的量为',
      options: ['1 mol', '2 mol', '3 mol', '4 mol'],
      answer: 1,
      explanation: '2H2 + O2 = 2H2O，给定量恰好按 2:1 反应，生成 2 mol H2O。',
    },
    flashcard: { front: '化学方程式系数表示什么 mol 关系？', back: '表示各物质参加反应或生成的物质的量之比。' },
    tips: ['先配平，系数才有意义', '有两种反应物时先判限制量', '反应前后总质量守恒，但物质的量总数不一定守恒'],
    summary: '反应计量是后续溶液、氧还和气体计算的共同基础。',
    examWeight: 5,
    challenges: [
      {
        stem: '足量盐酸与 0.5 mol Zn 反应，理论上生成 H2 的物质的量为',
        options: ['0.25 mol', '0.5 mol', '1 mol', '2 mol'],
        answer: 1,
        explanation: 'Zn + 2HCl = ZnCl2 + H2，Zn 与 H2 系数比为 1:1。',
      },
      {
        stem: '2Al + 6HCl = 2AlCl3 + 3H2，0.2 mol Al 完全反应生成 H2 为',
        options: ['0.1 mol', '0.2 mol', '0.3 mol', '0.6 mol'],
        answer: 2,
        explanation: 'Al:H2 = 2:3，0.2 mol Al 生成 0.3 mol H2。',
      },
    ],
  },
], 'g10-l05-n04');

const lesson7Nodes = buildLessonNodes(7, [
  {
    topic: '气体体积的决定因素',
    difficulty: 2,
    concept: '**气体体积主要看粒子数、温度和压强。**同温同压下，不同气体分子间距离远大于分子本身体积，所以相同物质的量的气体体积近似相同。',
    example: {
      stem: '同温同压下，决定一定量气体体积大小的主要因素是',
      options: ['气体分子质量', '气体分子种类', '气体分子数目', '气体颜色'],
      answer: 2,
      explanation: '同温同压下，气体体积主要由粒子数决定，与分子种类关系不大。',
    },
    flashcard: { front: '同温同压下气体体积为什么可比较？', back: '因为相同物质的量的气体含相同分子数，体积近似相同。' },
    tips: ['固体液体体积主要受粒子大小和排列影响', '气体体积受温度、压强影响很大', '比较气体体积前先确认同温同压'],
    summary: '气体计量的基础是把宏观体积和微观粒子数联系起来。',
    examWeight: 3,
    challenges: [
      {
        stem: '同温同压下，1 mol O2 和 1 mol CO2 的体积关系是',
        options: ['O2 大', 'CO2 大', '近似相等', '无法比较'],
        answer: 2,
        explanation: '同温同压下，相同物质的量的气体体积近似相等。',
      },
      {
        stem: '下列条件改变会明显影响一定量气体体积的是',
        options: ['气体颜色', '温度', '相对分子质量', '是否为单质'],
        answer: 1,
        explanation: '一定量气体体积明显受温度和压强影响。',
      },
    ],
  },
  {
    topic: '气体摩尔体积与标准状况',
    difficulty: 2,
    concept: '**22.4 L/mol 只能在标准状况下近似使用。**标准状况下，1 mol 任何气体体积约为 22.4 L；题目若是常温常压或液体固体，不能直接套用。',
    example: {
      stem: '标准状况下，11.2 L O2 的物质的量为',
      options: ['0.25 mol', '0.5 mol', '1 mol', '2 mol'],
      answer: 1,
      explanation: '标准状况下 n=V/22.4=11.2/22.4=0.5 mol。',
    },
    flashcard: { front: '22.4 L/mol 的使用条件？', back: '标准状况，且对象是气体。' },
    tips: ['标况：气体 1 mol 约 22.4 L', '常温常压不能默认 22.4 L/mol', '水、酒精、SO3 等非气体状态要小心'],
    summary: '气体摩尔体积题最怕忽略状态和条件。',
    examWeight: 5,
    challenges: [
      {
        stem: '标准状况下，4.48 L CO2 中含有的 CO2 分子物质的量为',
        options: ['0.1 mol', '0.2 mol', '0.5 mol', '1 mol'],
        answer: 1,
        explanation: 'n=4.48/22.4=0.2 mol。',
      },
      {
        stem: '下列说法一定错误的是',
        options: ['标准状况下 1 mol O2 约为 22.4 L', '标准状况下 22.4 L H2 含 NA 个分子', '常温常压下 11.2 L N2 一定为 0.5 mol', '标准状况下 0.5 mol CO 约为 11.2 L'],
        answer: 2,
        explanation: '常温常压不是标准状况，不能直接用 22.4 L/mol。',
      },
    ],
  },
  {
    topic: '阿伏加德罗定律及推论',
    difficulty: 3,
    concept: '**同温同压同体积，气体分子数相同。**由此可推出体积比等于物质的量比；同温同压下，密度比等于摩尔质量比。',
    example: {
      stem: '同温同压下，体积相同的 O2 和 CO2 一定相同的是',
      options: ['质量', '分子数', '密度', '原子总数'],
      answer: 1,
      explanation: '同温同压同体积的气体含有相同分子数，即物质的量相同。',
    },
    flashcard: { front: '同温同压下，气体体积比等于什么？', back: '等于物质的量比，也等于分子数比。' },
    tips: ['同 T、P：V 比 = n 比', '同 T、P：密度比 = 摩尔质量比', '等质量气体比较体积，摩尔质量越小体积越大'],
    summary: '阿伏加德罗定律是气体比较题的核心工具。',
    examWeight: 4,
    challenges: [
      {
        stem: '同温同压下，等质量的 O2 和 SO2 体积比为',
        options: ['1:1', '1:2', '2:1', '4:1'],
        answer: 2,
        explanation: '等质量时 n=m/M，O2 摩尔质量 32，SO2 为 64，所以物质的量和体积比为 2:1。',
      },
      {
        stem: '同温同压下，某气体与 O2 的密度比为 2，则该气体相对分子质量约为',
        options: ['16', '32', '48', '64'],
        answer: 3,
        explanation: '同温同压下密度比等于摩尔质量比，M=2×32=64。',
      },
    ],
  },
  {
    topic: '气体计量综合换算',
    difficulty: 3,
    concept: '**气体综合题统一走 n。**V、m、N 三类信息都先转物质的量，再按分子式和反应方程式处理。',
    example: {
      stem: '标准状况下，6.72 L CH4 的物质的量为',
      options: ['0.1 mol', '0.2 mol', '0.3 mol', '0.4 mol'],
      answer: 2,
      explanation: 'n=6.72/22.4=0.3 mol。',
    },
    flashcard: { front: '气体 V、m、N 综合题怎么开头？', back: '先统一转成物质的量 n。' },
    tips: ['V 用 n=V/Vm', 'm 用 n=m/M', 'N 用 n=N/NA'],
    summary: '所有计量通道都回到物质的量。',
    examWeight: 4,
    challenges: [
      {
        stem: '标准状况下 2.24 L NH3 中含氢原子的物质的量为',
        options: ['0.1 mol', '0.2 mol', '0.3 mol', '0.4 mol'],
        answer: 2,
        explanation: 'NH3 为 0.1 mol，每个分子含 3 个 H 原子，所以 H 原子为 0.3 mol。',
      },
      {
        stem: '标准状况下 0.2 mol CO2 的体积约为',
        options: ['2.24 L', '4.48 L', '11.2 L', '22.4 L'],
        answer: 1,
        explanation: 'V=nVm=0.2×22.4=4.48 L。',
      },
    ],
  },
], 'g10-l06-n04');

const lesson8Nodes = buildLessonNodes(8, [
  {
    topic: '物质的量浓度概念',
    difficulty: 2,
    concept: '**物质的量浓度看溶液体积，不是溶剂体积。**公式 c=n/V，V 必须用配成后溶液的体积，单位通常为 L。',
    example: {
      stem: '将 0.5 mol NaOH 配成 250 mL 溶液，物质的量浓度为',
      options: ['0.5 mol/L', '1 mol/L', '2 mol/L', '4 mol/L'],
      answer: 2,
      explanation: '250 mL=0.25 L，c=0.5/0.25=2 mol/L。',
    },
    flashcard: { front: 'c=n/V 中 V 是谁的体积？', back: '配成后溶液的体积，不是水的体积。' },
    tips: ['mL 先换 L', '取出一部分溶液，浓度不变', '溶液混合体积题按题目是否默认体积加和处理'],
    summary: '浓度计算的第一坑是体积单位和对象。',
    examWeight: 5,
    challenges: [
      {
        stem: '4 g NaOH 溶于水配成 100 mL 溶液，其物质的量浓度为',
        options: ['0.1 mol/L', '0.5 mol/L', '1 mol/L', '2 mol/L'],
        answer: 2,
        explanation: 'NaOH 摩尔质量 40 g/mol，n=0.1 mol，V=0.1 L，c=1 mol/L。',
      },
      {
        stem: '从 100 mL 1 mol/L NaCl 溶液中取出 10 mL，取出部分的浓度为',
        options: ['0.1 mol/L', '0.5 mol/L', '1 mol/L', '10 mol/L'],
        answer: 2,
        explanation: '均一溶液取出一部分，物质的量和体积同比例减少，浓度不变。',
      },
    ],
  },
  {
    topic: '溶液中离子浓度计算',
    difficulty: 3,
    concept: '**先看化学式下标，再乘浓度。**强电解质完全电离时，离子浓度等于溶质浓度乘对应离子个数；混合溶液要把同种离子的物质的量相加。',
    example: {
      stem: '1 mol/L CaCl2 溶液中 Cl- 的物质的量浓度为',
      options: ['0.5 mol/L', '1 mol/L', '2 mol/L', '3 mol/L'],
      answer: 2,
      explanation: '每 1 个 CaCl2 电离出 2 个 Cl-，所以 c(Cl-)=2 mol/L。',
    },
    flashcard: { front: 'CaCl2 溶液中 Cl- 浓度怎么算？', back: 'c(Cl-) = 2c(CaCl2)。' },
    tips: ['先写电离方程式', '同种离子来自多种溶质时要相加', '混合后浓度 = 总物质的量 / 总体积'],
    summary: '离子浓度计算是电解质和物质的量浓度的结合点。',
    examWeight: 5,
    challenges: [
      {
        stem: '0.2 mol/L AlCl3 溶液中 Cl- 浓度为',
        options: ['0.2 mol/L', '0.3 mol/L', '0.6 mol/L', '1.0 mol/L'],
        answer: 2,
        explanation: 'AlCl3 电离出 3 个 Cl-，c(Cl-)=3×0.2=0.6 mol/L。',
      },
      {
        stem: '50 mL 1 mol/L Na2SO4 溶液中 SO4^2- 的物质的量为',
        options: ['0.025 mol', '0.05 mol', '0.1 mol', '1 mol'],
        answer: 1,
        explanation: 'n=cV=1×0.05=0.05 mol。',
      },
    ],
  },
  {
    topic: '质量分数、密度与物质的量浓度',
    difficulty: 3,
    concept: '**浓溶液标签题用 c=1000ρw/M。**ρ 用 g/mL，w 用小数，M 用 g/mol，得到 mol/L。这个公式来自 1 L 溶液的质量、溶质质量和物质的量。',
    example: {
      stem: '98% 浓硫酸密度为 1.84 g/mL，H2SO4 摩尔质量为 98 g/mol，其物质的量浓度约为',
      options: ['9.8 mol/L', '12 mol/L', '18.4 mol/L', '36.8 mol/L'],
      answer: 2,
      explanation: '1 L 溶液质量 1840 g，溶质质量 1840×0.98 g，物质的量约 18.4 mol。',
    },
    flashcard: { front: '质量分数转物质的量浓度公式？', back: 'c=1000ρw/M。' },
    tips: ['ρ 常用 g/mL，要乘 1000 得到 1 L 溶液质量', 'w 要用小数不是百分号数字', 'M 是溶质摩尔质量'],
    summary: '标签计算题要把“1 L 溶液”作为桥梁。',
    examWeight: 4,
    challenges: [
      {
        stem: '密度 1.19 g/mL、质量分数 36.5% 的盐酸，HCl 摩尔质量 36.5 g/mol，其浓度约为',
        options: ['6 mol/L', '8 mol/L', '12 mol/L', '18 mol/L'],
        answer: 2,
        explanation: 'c=1000×1.19×0.365/36.5≈11.9 mol/L。',
      },
      {
        stem: '将 a L HCl 气体溶于水配成 V L 溶液，标准状况下所得盐酸浓度为',
        options: ['a/V', 'a/(22.4V)', '22.4a/V', 'V/(22.4a)'],
        answer: 1,
        explanation: 'HCl 物质的量为 a/22.4 mol，浓度为 a/(22.4V) mol/L。',
      },
    ],
  },
  {
    topic: '溶液稀释与浓缩计算',
    difficulty: 3,
    concept: '**稀释浓缩抓住溶质守恒。**加水、蒸发水、定容过程中，只要溶质不挥发不析出，溶质物质的量保持不变，常用 c1V1=c2V2。',
    example: {
      stem: '100 mL 0.5 mol/L 盐酸稀释到 200 mL 后，浓度为',
      options: ['0.1 mol/L', '0.25 mol/L', '0.5 mol/L', '1 mol/L'],
      answer: 1,
      explanation: 'c1V1=c2V2，c2=0.5×100/200=0.25 mol/L。',
    },
    flashcard: { front: '稀释题什么量守恒？', back: '溶质的物质的量守恒。' },
    tips: ['加水只改变体积，不改变溶质物质的量', '蒸发水浓度变大，但溶质守恒', '浓溶液配稀溶液先算需要的溶质物质的量'],
    summary: '稀释浓缩题的核心不是背公式，而是溶质守恒。',
    examWeight: 5,
    challenges: [
      {
        stem: '配制 500 mL 1 mol/L H2SO4 溶液，需要 H2SO4 的物质的量为',
        options: ['0.1 mol', '0.5 mol', '1 mol', '2 mol'],
        answer: 1,
        explanation: 'n=cV=1×0.5=0.5 mol。',
      },
      {
        stem: '50 mL 2 mol/L NaCl 溶液加水稀释至 200 mL，浓度变为',
        options: ['0.25 mol/L', '0.5 mol/L', '1 mol/L', '4 mol/L'],
        answer: 1,
        explanation: 'c2=2×50/200=0.5 mol/L。',
      },
    ],
  },
], 'g10-l07-n04');

const lesson10Nodes = buildLessonNodes(10, [
  {
    topic: '氧化还原反应的特征与本质',
    difficulty: 2,
    concept: '**特征看化合价变化，本质看电子转移。**有元素化合价升降的反应就是氧化还原反应；化合价升高表示失电子，被氧化。',
    example: {
      stem: '下列反应一定属于氧化还原反应的是',
      options: ['酸碱中和', '复分解反应', '置换反应', '沉淀反应'],
      answer: 2,
      explanation: '置换反应中单质与化合物反应生成新单质和新化合物，必有元素化合价变化。',
    },
    flashcard: { front: '氧化还原反应的判断特征？', back: '元素化合价发生变化。' },
    tips: ['升失氧，降得还', '化合价升高：失电子，被氧化', '化合价降低：得电子，被还原'],
    summary: '氧化还原的所有后续技巧都建立在化合价变化上。',
    examWeight: 5,
    challenges: [
      {
        stem: 'Fe + CuSO4 = FeSO4 + Cu 中，被氧化的是',
        options: ['Fe', 'Cu2+', 'SO4^2-', 'Cu'],
        answer: 0,
        explanation: 'Fe 从 0 价升到 +2 价，失电子，被氧化。',
      },
      {
        stem: '下列变化中，氯元素被氧化的是',
        options: ['Cl2 -> Cl-', 'Cl- -> Cl2', 'ClO3- -> Cl-', 'HClO -> Cl-'],
        answer: 1,
        explanation: 'Cl- 中 Cl 为 -1 价，Cl2 中为 0 价，化合价升高，被氧化。',
      },
    ],
  },
  {
    topic: '氧化剂、还原剂与产物判断',
    difficulty: 3,
    concept: '**剂和产物跟电子方向绑定。**氧化剂得电子、化合价降低、被还原，生成还原产物；还原剂失电子、化合价升高、被氧化，生成氧化产物。',
    example: {
      stem: '反应 Zn + Cu2+ = Zn2+ + Cu 中，氧化剂是',
      options: ['Zn', 'Cu2+', 'Zn2+', 'Cu'],
      answer: 1,
      explanation: 'Cu2+ 得电子变为 Cu，化合价降低，被还原，是氧化剂。',
    },
    flashcard: { front: '氧化剂发生什么变化？', back: '得电子，化合价降低，被还原。' },
    tips: ['氧化剂对应还原产物', '还原剂对应氧化产物', '不要被“剂”的名字绕晕：氧化剂自己被还原'],
    summary: '氧化剂和还原剂判断是氧还题的基本语言。',
    examWeight: 5,
    challenges: [
      {
        stem: '反应 2Fe3+ + Cu = 2Fe2+ + Cu2+ 中，还原剂是',
        options: ['Fe3+', 'Fe2+', 'Cu', 'Cu2+'],
        answer: 2,
        explanation: 'Cu 失电子变为 Cu2+，化合价升高，是还原剂。',
      },
      {
        stem: '需要加入氧化剂才能实现的是',
        options: ['Fe3+ -> Fe2+', 'Cl2 -> Cl-', 'S2- -> S', 'Cu2+ -> Cu'],
        answer: 2,
        explanation: 'S2- 到 S 化合价升高，需要被氧化，因此要加入氧化剂。',
      },
    ],
  },
  {
    topic: '氧化还原与四大基本反应类型',
    difficulty: 2,
    concept: '**置换必氧还，复分解通常不是氧还。**化合、分解反应有的属于氧化还原，有的不属于；判断最终仍回到化合价是否变化。',
    example: {
      stem: '下列反应不一定是氧化还原反应的是',
      options: ['置换反应', '有单质参加的化合反应', '复分解反应', '有单质生成的分解反应'],
      answer: 1,
      explanation: '有单质参加的化合反应不一定发生化合价变化，如某些同素异形体变化不属于典型氧还；判断仍看化合价。',
    },
    flashcard: { front: '哪类基本反应一定是氧化还原？', back: '置换反应。' },
    tips: ['复分解反应通常无化合价变化', '有单质出现只是强信号，不是唯一标准', '最终标准永远是化合价升降'],
    summary: '基本反应类型是辅助判断，不可替代化合价分析。',
    examWeight: 3,
    challenges: [
      {
        stem: '下列反应属于氧化还原反应的是',
        options: ['NaOH + HCl = NaCl + H2O', 'BaCl2 + Na2SO4 = BaSO4↓ + 2NaCl', 'C + O2 = CO2', 'CaCO3 = CaO + CO2'],
        answer: 2,
        explanation: 'C 从 0 价升到 +4 价，O 从 0 价降到 -2 价，属于氧化还原。',
      },
      {
        stem: '关于复分解反应和氧化还原反应的关系，正确的是',
        options: ['复分解反应一定是氧化还原', '复分解反应一定不是氧化还原', '多数复分解反应无化合价变化', '二者完全相同'],
        answer: 2,
        explanation: '高中初学阶段多数复分解反应无化合价变化，但判断标准仍是化合价。',
      },
    ],
  },
  {
    topic: '常见氧化剂和还原剂',
    difficulty: 3,
    concept: '**高价常氧化，低价常还原，中间价态两边都可能。**常见氧化剂有 Cl2、O2、浓 H2SO4、HNO3、KMnO4；常见还原剂有活泼金属、H2、CO、I-、S2-、SO2 等。',
    example: {
      stem: '下列物质通常表现强氧化性的是',
      options: ['Na', 'CO', 'KMnO4 酸性溶液', 'I-'],
      answer: 2,
      explanation: '酸性 KMnO4 中 Mn 为高价，常作强氧化剂。',
    },
    flashcard: { front: '元素处于最低价时通常有什么性？', back: '通常只有还原性。' },
    tips: ['最高价：通常只有氧化性', '最低价：通常只有还原性', '中间价态：可能既有氧化性又有还原性'],
    summary: '常见剂的识别能大幅提高氧还判断速度。',
    examWeight: 4,
    challenges: [
      {
        stem: '下列微粒既可能作氧化剂又可能作还原剂的是',
        options: ['Cl-', 'Na+', 'Fe2+', 'O2-'],
        answer: 2,
        explanation: 'Fe2+ 可被氧化为 Fe3+，也可被还原为 Fe，处于中间价态。',
      },
      {
        stem: '需要加入还原剂才能实现的是',
        options: ['Fe2+ -> Fe3+', 'Cl- -> Cl2', 'Cu2+ -> Cu', 'S -> SO2'],
        answer: 2,
        explanation: 'Cu2+ 到 Cu 化合价降低，需要得电子，因此要加入还原剂。',
      },
    ],
  },
], 'g10-l08-n04');

const lesson11Nodes = buildLessonNodes(11, [
  {
    topic: '双线桥法表示电子得失',
    difficulty: 3,
    concept: '**双线桥从反应物指向产物，标清得失电子。**先标化合价，再找升降元素，最后写“失/得 n e-”和对应原子个数。',
    example: {
      stem: '在 2Na + Cl2 = 2NaCl 中，转移电子的物质的量与 Na 的物质的量关系是',
      options: ['1:2', '1:1', '2:1', '无法判断'],
      answer: 1,
      explanation: '每个 Na 失去 1 个电子，2 mol Na 转移 2 mol 电子，所以与 Na 物质的量相等。',
    },
    flashcard: { front: '双线桥第一步？', back: '先标变价元素的化合价。' },
    tips: ['箭头从同种元素反应物指向产物', '升价标失电子，降价标得电子', '得失电子总数必须相等'],
    summary: '双线桥是把化合价变化转化成电子转移的图示工具。',
    examWeight: 4,
    challenges: [
      {
        stem: '反应 Fe + 2H+ = Fe2+ + H2 中，1 mol Fe 反应转移电子为',
        options: ['1 mol', '2 mol', '3 mol', '4 mol'],
        answer: 1,
        explanation: 'Fe 从 0 价升到 +2 价，每 mol Fe 失 2 mol 电子。',
      },
      {
        stem: '双线桥法中，化合价降低的一方应标注',
        options: ['失电子，被氧化', '得电子，被还原', '失电子，被还原', '得电子，被氧化'],
        answer: 1,
        explanation: '化合价降低表示得电子，被还原。',
      },
    ],
  },
  {
    topic: '单线桥法表示电子转移',
    difficulty: 3,
    concept: '**单线桥从还原剂指向氧化剂。**它只在反应物之间画电子转移方向，表示电子从失电子元素转移给得电子元素。',
    example: {
      stem: '单线桥法中，箭头通常从',
      options: ['氧化剂指向还原剂', '还原剂指向氧化剂', '产物指向反应物', '任意方向均可'],
      answer: 1,
      explanation: '电子由还原剂失去，被氧化剂得到，因此箭头从还原剂指向氧化剂。',
    },
    flashcard: { front: '单线桥箭头方向？', back: '从还原剂指向氧化剂。' },
    tips: ['单线桥只画反应物之间', '箭头方向表示电子转移方向', '数字表示转移电子总数'],
    summary: '单线桥强调“谁把电子给了谁”。',
    examWeight: 3,
    challenges: [
      {
        stem: 'Zn + Cu2+ = Zn2+ + Cu 中，单线桥箭头应从',
        options: ['Zn 指向 Cu2+', 'Cu2+ 指向 Zn', 'Zn2+ 指向 Cu', 'Cu 指向 Zn2+'],
        answer: 0,
        explanation: 'Zn 是还原剂，失电子给 Cu2+。',
      },
      {
        stem: '单线桥法不直接表示的是',
        options: ['电子转移方向', '转移电子数', '还原剂到氧化剂', '产物之间的电子转移'],
        answer: 3,
        explanation: '单线桥画在反应物之间，不表示产物之间发生电子转移。',
      },
    ],
  },
  {
    topic: '氧化还原方程式配平',
    difficulty: 3,
    concept: '**配平核心是电子守恒。**先标价，找升降，令升高总数等于降低总数，再配其他原子，最后检查电荷和原子守恒。',
    example: {
      stem: '配平 Fe2+ + Cl2 -> Fe3+ + Cl- 时，Fe2+ 与 Cl2 的系数比为',
      options: ['1:1', '2:1', '1:2', '3:2'],
      answer: 1,
      explanation: 'Cl2 得 2 e- 生成 2Cl-，每个 Fe2+ 失 1 e-，需 2 个 Fe2+，比例为 2:1。',
    },
    flashcard: { front: '氧还配平的核心守恒？', back: '电子得失守恒。' },
    tips: ['先配变价元素', '电子守恒定主系数', '酸性碱性环境再补 H+、OH-、H2O'],
    summary: '氧还配平是化合价变化和守恒思想的综合。',
    examWeight: 5,
    challenges: [
      {
        stem: '反应 MnO4- + Fe2+ + H+ -> Mn2+ + Fe3+ + H2O 中，MnO4- 与 Fe2+ 的系数比为',
        options: ['1:1', '1:3', '1:5', '2:5'],
        answer: 2,
        explanation: 'Mn 从 +7 到 +2 得 5 e-，每个 Fe2+ 失 1 e-，比例为 1:5。',
      },
      {
        stem: '氧化还原配平时，最先应确定的是',
        options: ['水的系数', '变价元素的化合价变化', '沉淀符号', '反应条件'],
        answer: 1,
        explanation: '只有先确定化合价升降，才能应用电子守恒。',
      },
    ],
  },
  {
    topic: '氧还配平中的酸碱环境',
    difficulty: 3,
    concept: '**酸性补 H+ 和 H2O，碱性补 OH- 和 H2O。**离子方程式配平不仅要守恒电子，还要守恒电荷；环境离子不能随意添加。',
    example: {
      stem: '酸性条件下，MnO4- 被还原为 Mn2+ 时，1 mol MnO4- 得电子数为',
      options: ['3 mol', '5 mol', '6 mol', '7 mol'],
      answer: 1,
      explanation: 'Mn 从 +7 价降到 +2 价，得 5 mol 电子。',
    },
    flashcard: { front: '酸性氧还离子方程式常用什么补氢氧？', back: '用 H+ 和 H2O。' },
    tips: ['酸性不随意出现 OH-', '碱性不随意留下大量 H+', '最后必须查电荷守恒'],
    summary: '环境条件决定离子方程式里能出现哪些辅助粒子。',
    examWeight: 4,
    challenges: [
      {
        stem: '碱性条件下配平氧还离子方程式时，常用来平衡氢元素的是',
        options: ['H+ 和 H2O', 'OH- 和 H2O', 'H2 和 O2', 'Na+ 和 Cl-'],
        answer: 1,
        explanation: '碱性环境通常用 OH- 和 H2O 配平 H、O。',
      },
      {
        stem: '酸性条件下 Cr2O7^2- 中 Cr 被还原为 Cr3+，1 mol Cr2O7^2- 共得电子',
        options: ['3 mol', '4 mol', '6 mol', '12 mol'],
        answer: 2,
        explanation: '两个 Cr 均由 +6 到 +3，每个得 3 e-，共得 6 mol e-。',
      },
    ],
  },
], 'g10-l10-n04');

const lesson12Nodes = buildLessonNodes(12, [
  {
    topic: '氧化还原守恒规律',
    difficulty: 3,
    concept: '**得失电子永远守恒。**氧化剂得到的电子总数等于还原剂失去的电子总数，这是氧还计算和配平的底层规则。',
    example: {
      stem: 'Cl2 + 2KBr = 2KCl + Br2 中，1 mol Cl2 反应转移电子为',
      options: ['1 mol', '2 mol', '4 mol', '6 mol'],
      answer: 1,
      explanation: 'Cl2 中两个 Cl 从 0 价降到 -1 价，共得 2 mol 电子。',
    },
    flashcard: { front: '氧还计算最重要的守恒？', back: '电子得失守恒。' },
    tips: ['只算变价元素', '乘上原子个数和物质的量', '氧化剂得电子数 = 还原剂失电子数'],
    summary: '电子守恒让复杂氧还计算变成等量关系。',
    examWeight: 5,
    challenges: [
      {
        stem: '3Cl2 + 6KOH = 5KCl + KClO3 + 3H2O 中，氧化剂与还原剂的物质的量之比为',
        options: ['1:5', '5:1', '1:1', '2:1'],
        answer: 1,
        explanation: 'Cl2 自身氧化还原，5 个 Cl 被还原为 Cl-，1 个 Cl 被氧化为 ClO3-，氧化剂:还原剂=5:1。',
      },
      {
        stem: 'SO3^2- 被氧化为 SO4^2- 时，每 mol SO3^2- 失电子',
        options: ['1 mol', '2 mol', '4 mol', '6 mol'],
        answer: 1,
        explanation: 'S 从 +4 价升到 +6 价，每 mol SO3^2- 失 2 mol 电子。',
      },
    ],
  },
  {
    topic: '价态规律与不交叉规律',
    difficulty: 3,
    concept: '**同种元素高价和低价反应，常向中间价靠拢。**产物价态一般不交叉：高价降低、低价升高，但不会互相越过对方。',
    example: {
      stem: 'H2S 中 S 为 -2 价，浓 H2SO4 中 S 为 +6 价，二者反应时较合理的硫元素产物组合是',
      options: ['S 和 SO2', 'H2S 和 H2SO4', 'SO3 和 S2-', 'S6+ 和 S2- 互换'],
      answer: 0,
      explanation: '高价硫被还原、低价硫被氧化，产物价态向中间靠拢，可生成 S、SO2 等。',
    },
    flashcard: { front: '不交叉规律说的是什么？', back: '同元素不同价态反应时，价态升降不相互越过。' },
    tips: ['最高价通常只降', '最低价通常只升', '中间价产物更常见'],
    summary: '价态规律能快速排除不合理产物。',
    examWeight: 4,
    challenges: [
      {
        stem: '同种元素中，处于最低价的微粒通常',
        options: ['只具有氧化性', '只具有还原性', '既无氧化性又无还原性', '一定很稳定'],
        answer: 1,
        explanation: '最低价不能再降低，通常只能升高，表现还原性。',
      },
      {
        stem: 'S2-、S、SO2、SO4^2- 中，既有氧化性又有还原性的是',
        options: ['只有 S2-', '只有 SO4^2-', 'S 和 SO2', '全部都是'],
        answer: 2,
        explanation: 'S 为 0 价、SO2 中 S 为 +4 价，处于中间价态，既可升也可降。',
      },
    ],
  },
  {
    topic: '氧化性还原性强弱比较',
    difficulty: 3,
    concept: '**一个自发氧还反应中：氧化剂氧化性强于氧化产物，还原剂还原性强于还原产物。**用反应事实可以建立强弱顺序。',
    example: {
      stem: '反应 Cu2+ + Zn = Cu + Zn2+ 能发生，说明',
      options: ['Cu2+ 氧化性强于 Zn2+', 'Zn2+ 氧化性强于 Cu2+', 'Cu 还原性强于 Zn', 'Zn2+ 还原性强于 Zn'],
      answer: 0,
      explanation: '该反应中 Cu2+ 是氧化剂，Zn2+ 是氧化产物，氧化剂氧化性强于氧化产物。',
    },
    flashcard: { front: '氧化剂和氧化产物谁氧化性强？', back: '氧化剂更强。' },
    tips: ['氧化性：氧化剂 > 氧化产物', '还原性：还原剂 > 还原产物', '多个反应可串联排序'],
    summary: '强弱比较是氧还规律题的重要模型。',
    examWeight: 4,
    challenges: [
      {
        stem: '反应 2Fe2+ + Cl2 = 2Fe3+ + 2Cl- 说明氧化性强弱为',
        options: ['Cl2 > Fe3+', 'Fe3+ > Cl2', 'Fe2+ > Cl-', 'Cl- > Fe2+'],
        answer: 0,
        explanation: 'Cl2 是氧化剂，Fe3+ 是氧化产物，因此 Cl2 氧化性强于 Fe3+。',
      },
      {
        stem: '若还原性 Cl- < Fe2+ < I-，向含 Fe2+、I- 的溶液中通入少量 Cl2，优先被氧化的是',
        options: ['Cl-', 'Fe2+', 'I-', '水'],
        answer: 2,
        explanation: '还原性越强越先被氧化，I- 还原性强于 Fe2+。',
      },
    ],
  },
  {
    topic: '电子守恒计算',
    difficulty: 3,
    concept: '**氧还计算不一定要完整配平，抓电子守恒即可。**先求每个粒子得失电子数，再用“得电子总数 = 失电子总数”列式。',
    example: {
      stem: '1 mol MnO4- 在酸性条件下变为 Mn2+，可氧化 Fe2+ 的物质的量为',
      options: ['1 mol', '3 mol', '5 mol', '7 mol'],
      answer: 2,
      explanation: 'Mn 从 +7 到 +2 得 5 e-，每 mol Fe2+ 失 1 e-，所以可氧化 5 mol Fe2+。',
    },
    flashcard: { front: '电子守恒计算三步？', back: '标价、算每粒子得失电子、列得失电子相等。' },
    tips: ['不要被方程式复杂形态吓住', '只看变价元素即可', '歧化反应要分清同一物质中谁升谁降'],
    summary: '电子守恒是高一氧还计算的高频得分工具。',
    examWeight: 5,
    challenges: [
      {
        stem: 'Cr2O7^2- 在酸性条件下变为 2Cr3+，1 mol Cr2O7^2- 可氧化 Fe2+ 的物质的量为',
        options: ['3 mol', '5 mol', '6 mol', '7 mol'],
        answer: 2,
        explanation: 'Cr 共得 6 mol 电子，每 mol Fe2+ 失 1 mol 电子。',
      },
      {
        stem: 'H2O2 中 O 为 -1 价，若 H2O2 被氧化为 O2，每 mol H2O2 转移电子',
        options: ['1 mol', '2 mol', '4 mol', '6 mol'],
        answer: 1,
        explanation: '两个 O 均由 -1 到 0，每个失 1 e-，共失 2 mol 电子。',
      },
    ],
  },
], 'g10-l11-n04');

const lesson13Nodes = buildLessonNodes(13, [
  {
    topic: '氯气的结构、物理性质与价态',
    difficulty: 2,
    concept: '**氯原子最外层 7 个电子，容易得 1 个电子。**氯气是黄绿色、有刺激性气味、有毒、密度比空气大的气体，氯元素常见价态从 -1 到 +7。',
    example: {
      stem: '下列关于氯气和氯离子的说法正确的是',
      options: ['Cl2 和 Cl- 都呈黄绿色', 'Cl2 有强氧化性，Cl- 通常有还原性', 'Cl- 比 Cl2 更容易得电子', '氯气无毒'],
      answer: 1,
      explanation: 'Cl2 中氯为 0 价，常作氧化剂；Cl- 中氯为 -1 价，通常表现还原性。',
    },
    flashcard: { front: '氯原子为什么容易形成 Cl-？', back: '最外层有 7 个电子，得 1 个电子可达稳定结构。' },
    tips: ['氯气黄绿色、有毒、密度比空气大', 'Cl2 常表现氧化性', '自然界氯主要以化合态存在'],
    summary: '氯的结构决定其活泼性和氧化性。',
    examWeight: 3,
    challenges: [
      {
        stem: '氯气在通常情况下的颜色是',
        options: ['无色', '黄绿色', '红棕色', '紫黑色'],
        answer: 1,
        explanation: '氯气是黄绿色气体，有刺激性气味且有毒。',
      },
      {
        stem: '氯元素最低价和常见最高价分别为',
        options: ['0、+7', '-1、+7', '-1、+5', '0、+5'],
        answer: 1,
        explanation: '氯常见最低价为 -1，最高正价可为 +7。',
      },
    ],
  },
  {
    topic: '氯气与金属、非金属反应',
    difficulty: 3,
    concept: '**氯气氧化性较强，常把可变价金属氧化到较高价态。**铁在氯气中燃烧生成 FeCl3，而铁与稀盐酸反应通常生成 FeCl2。',
    example: {
      stem: '下列物质不能由相应单质直接化合得到的是',
      options: ['FeCl3', 'CuCl2', 'NaCl', 'FeCl2'],
      answer: 3,
      explanation: '铁与氯气直接化合通常生成 FeCl3，不生成 FeCl2。',
    },
    flashcard: { front: '铁和氯气直接反应生成什么？', back: 'FeCl3。' },
    tips: ['Cl2 与金属反应体现强氧化性', 'H2 在 Cl2 中燃烧有苍白色火焰', '可变价金属与氯气常生成高价氯化物'],
    summary: '氯气反应题要抓住强氧化性。',
    examWeight: 4,
    challenges: [
      {
        stem: '氢气在氯气中燃烧的火焰颜色通常为',
        options: ['淡蓝色', '苍白色', '黄色', '蓝紫色'],
        answer: 1,
        explanation: 'H2 在 Cl2 中燃烧产生苍白色火焰，生成 HCl。',
      },
      {
        stem: '铜与氯气充分反应生成',
        options: ['CuCl', 'CuCl2', 'Cu2Cl', '不反应'],
        answer: 1,
        explanation: '氯气氧化性强，铜与氯气反应生成 CuCl2。',
      },
    ],
  },
  {
    topic: '氯水成分与多重性质',
    difficulty: 3,
    concept: '**新制氯水是混合体系。**其中含 Cl2、H2O、HClO、H+、Cl-、ClO- 等微粒，因此同时具有酸性、漂白性、氧化性和能产生 AgCl 沉淀等性质。',
    example: {
      stem: '新制氯水使有色布条褪色，主要起作用的是',
      options: ['Cl-', 'H+', 'HClO', 'H2O'],
      answer: 2,
      explanation: 'HClO 具有强氧化性，可漂白有色物质。',
    },
    flashcard: { front: '新制氯水漂白的主要微粒？', back: 'HClO。' },
    tips: ['Cl2 + H2O ⇌ HCl + HClO', '酸性来自 H+', 'AgNO3 检验 Cl-，漂白主要靠 HClO'],
    summary: '氯水题要把“多成分对应多性质”拆开。',
    examWeight: 5,
    challenges: [
      {
        stem: '向新制氯水中滴加 AgNO3 溶液出现白色沉淀，说明存在',
        options: ['Cl-', 'Cl2', 'HClO', 'O2'],
        answer: 0,
        explanation: 'Ag+ 与 Cl- 生成 AgCl 白色沉淀。',
      },
      {
        stem: '久置氯水中明显减少的主要成分是',
        options: ['HCl', 'Cl2 和 HClO', 'Cl-', 'H+'],
        answer: 1,
        explanation: 'HClO 不稳定分解，Cl2 也逐渐反应或逸出，久置氯水趋向稀盐酸。',
      },
    ],
  },
  {
    topic: '氯气用途与安全',
    difficulty: 2,
    concept: '**氯气能消毒也有毒，应用必须建立在可控反应上。**自来水消毒、漂白剂制备都与氯及含氯氧化性物质有关，但含氯消毒剂不可与酸性清洁剂混用。',
    example: {
      stem: '含氯漂白剂不能与洁厕灵混用，主要原因是可能生成',
      options: ['H2', 'O2', 'Cl2', 'CO2'],
      answer: 2,
      explanation: '次氯酸盐遇酸可能生成有毒 Cl2，存在安全风险。',
    },
    flashcard: { front: '含氯消毒剂和酸混用的风险？', back: '可能释放有毒氯气。' },
    tips: ['氯气可用于杀菌消毒', '液氯储运需干燥', '实验室处理氯气要有尾气吸收'],
    summary: '含氯物质学习要同时重视性质、用途和安全。',
    examWeight: 3,
    challenges: [
      {
        stem: '实验室吸收多余氯气常用',
        options: ['浓硫酸', 'NaOH 溶液', '饱和食盐水', '蒸馏水'],
        answer: 1,
        explanation: 'NaOH 溶液能与 Cl2 反应，可用于尾气吸收。',
      },
      {
        stem: '下列用途主要利用氯气或含氯物质氧化性的是',
        options: ['氯化钠调味', '自来水消毒', '盐酸除水垢', '氯化钙干燥'],
        answer: 1,
        explanation: '自来水消毒依赖氯气与水反应生成的氧化性物质。',
      },
    ],
  },
], 'g10-l12-n04');

const lesson14Nodes = buildLessonNodes(14, [
  {
    topic: '氯化氢与盐酸性质',
    difficulty: 2,
    concept: '**HCl 是共价化合物，盐酸是 HCl 的水溶液。**浓盐酸有挥发性，遇空气中水蒸气形成白雾；盐酸具有酸的通性。',
    example: {
      stem: '浓盐酸敞口放置时瓶口出现白雾，主要原因是',
      options: ['HCl 挥发并与水蒸气形成盐酸小液滴', '盐酸分解生成氯气', '水蒸气凝结成纯水', 'HCl 燃烧'],
      answer: 0,
      explanation: '浓盐酸易挥发，挥出的 HCl 与空气中的水蒸气形成盐酸小液滴。',
    },
    flashcard: { front: '浓盐酸的特性？', back: '挥发性，瓶口可见白雾。' },
    tips: ['HCl 气体极易溶于水', '盐酸是混合物，不是电解质分类对象', '浓盐酸可挥发，保存要密封'],
    summary: '区分 HCl 气体、液态 HCl 和盐酸是本讲基础。',
    examWeight: 3,
    challenges: [
      {
        stem: '鉴别 HCl 气体和 Cl2，不能只依赖的是',
        options: ['颜色', '湿润蓝色石蕊试纸', 'AgNO3 溶液', '气味安全嗅闻'],
        answer: 3,
        explanation: 'HCl 和 Cl2 都有刺激性且有危险，不能用直接嗅闻作为安全鉴别方法。',
      },
      {
        stem: '盐酸能与 NaOH 反应，体现的是',
        options: ['酸的通性', '漂白性', '强氧化性', '还原性'],
        answer: 0,
        explanation: '盐酸与碱发生中和反应，体现酸的通性。',
      },
    ],
  },
  {
    topic: '次氯酸性质与氯水变化',
    difficulty: 3,
    concept: '**HClO 弱酸、强氧化、易分解。**新制氯水放置或光照后 HClO 分解，漂白能力下降，溶液逐渐更接近稀盐酸。',
    example: {
      stem: '可证明 HClO 是弱酸的事实是',
      options: ['HClO 有漂白性', 'HClO 不稳定', '次氯酸盐遇较强酸可生成 HClO', 'HClO 含氧'],
      answer: 2,
      explanation: '较强酸能制取较弱酸，说明 HClO 酸性弱于该酸。',
    },
    flashcard: { front: 'HClO 的三个关键词？', back: '弱酸、强氧化、易分解。' },
    tips: ['漂白主要靠氧化性', 'HClO 光照易分解', '久置氯水漂白性减弱'],
    summary: '次氯酸是理解氯水漂白和消毒的关键。',
    examWeight: 4,
    challenges: [
      {
        stem: '新制氯水光照后产生的气体主要是',
        options: ['H2', 'O2', 'Cl2', 'CO2'],
        answer: 1,
        explanation: 'HClO 光照分解可生成 HCl 和 O2。',
      },
      {
        stem: '干燥氯气不能使干燥有色布条褪色，说明漂白需要',
        options: ['Cl- 直接作用', '水参与生成 HClO', 'N2 参与', 'CO2 参与'],
        answer: 1,
        explanation: 'Cl2 与水反应生成 HClO 后才表现明显漂白性。',
      },
    ],
  },
  {
    topic: '次氯酸盐与漂白粉',
    difficulty: 3,
    concept: '**漂白粉有效成分是 Ca(ClO)2。**它在空气中与 CO2、H2O 作用生成 HClO，HClO 进一步分解，导致漂白粉久置失效。',
    example: {
      stem: '漂白粉在空气中容易失效，主要是因为有效成分最终转化并分解，其中有效成分是',
      options: ['CaCl2', 'Ca(ClO)2', 'CaCO3', 'HCl'],
      answer: 1,
      explanation: '漂白粉有效成分是 Ca(ClO)2，遇 CO2 和水可生成 HClO，HClO 分解使漂白能力下降。',
    },
    flashcard: { front: '漂白粉有效成分？', back: 'Ca(ClO)2。' },
    tips: ['制漂白粉：Cl2 与石灰乳反应', '有效成分是次氯酸钙', '酸化可增强漂白但也可能释放 Cl2，注意安全'],
    summary: '漂白粉题常考制备、有效成分和失效原因。',
    examWeight: 4,
    challenges: [
      {
        stem: '工业制漂白粉常用氯气与下列物质反应',
        options: ['石灰乳', '纯碱溶液', '浓硫酸', '食盐水'],
        answer: 0,
        explanation: 'Cl2 与 Ca(OH)2 石灰乳反应制得漂白粉。',
      },
      {
        stem: '漂白粉应密封保存，主要为了避免',
        options: ['吸收 N2', '与 CO2 和水作用失效', '被阳光变成 NaCl', '升华损失'],
        answer: 1,
        explanation: '空气中的 CO2 和水会使次氯酸盐转化为 HClO，进一步分解失效。',
      },
    ],
  },
  {
    topic: '含氯歧化反应计算',
    difficulty: 3,
    concept: '**氯气与碱反应常发生自身氧化还原。**低温生成 Cl- 和 ClO-，热浓碱可生成 Cl- 和 ClO3-；计算时按氯元素升降价电子守恒。',
    example: {
      stem: 'Cl2 与冷 NaOH 溶液反应生成 NaCl 和 NaClO，氧化剂与还原剂物质的量之比为',
      options: ['1:1', '1:2', '2:1', '5:1'],
      answer: 0,
      explanation: 'Cl2 中一半 Cl 降为 -1，一半升为 +1，同一物质既作氧化剂又作还原剂，比例为 1:1。',
    },
    flashcard: { front: 'Cl2 + 冷碱主要生成什么？', back: 'Cl- 和 ClO-。' },
    tips: ['同一元素一部分升价一部分降价叫歧化', '冷碱：ClO-，热浓碱：ClO3-', '用电子守恒定氧化剂/还原剂比例'],
    summary: '含氯歧化反应把氯水、漂白剂和氧还计算连起来。',
    examWeight: 5,
    challenges: [
      {
        stem: '3Cl2 + 6NaOH = 5NaCl + NaClO3 + 3H2O 中，被氧化的 Cl 与被还原的 Cl 原子数比为',
        options: ['1:5', '5:1', '1:1', '3:2'],
        answer: 0,
        explanation: '1 个 Cl 升到 +5，5 个 Cl 降到 -1，被氧化:被还原=1:5。',
      },
      {
        stem: 'Cl2 与 NaOH 溶液反应的本质一定包含',
        options: ['沉淀生成', '氯元素价态变化', '金属置换', '酸碱中和'],
        answer: 1,
        explanation: 'Cl2 在碱中发生自身氧化还原，氯元素同时升价和降价。',
      },
    ],
  },
], 'g10-l13-n04');

const lesson15Nodes = buildLessonNodes(15, [
  {
    topic: '铜的性质与铜盐制备',
    difficulty: 2,
    concept: '**铜不活泼，但能被强氧化剂氧化。**铜与氧气、氯气、浓硫酸、硝酸等可反应；废铜制硫酸铜要兼顾理论、操作、环保和经济性。',
    example: {
      stem: '铜在空气中久置生成铜绿，主要涉及空气中的',
      options: ['O2、CO2、H2O', 'N2、O2、He', 'CO、H2、O2', 'Ar、CO2、H2'],
      answer: 0,
      explanation: '铜绿主要成分可看作碱式碳酸铜，形成需要 O2、CO2 和 H2O。',
    },
    flashcard: { front: '铜与稀盐酸通常反应吗？', back: '通常不反应，因为铜位于氢后，稀盐酸非强氧化性酸。' },
    tips: ['铜与氯气直接反应生成 CuCl2', '铜与浓硫酸、硝酸反应体现酸的氧化性', '制备方案要考虑污染和原料利用率'],
    summary: '铜的化学性质核心是“较不活泼但可被氧化”。',
    examWeight: 3,
    challenges: [
      {
        stem: '下列物质通常不能与铜直接反应的是',
        options: ['Cl2', 'O2 加热', '稀盐酸', '浓硫酸加热'],
        answer: 2,
        explanation: '铜位于氢后，通常不与非氧化性稀盐酸反应。',
      },
      {
        stem: '由废铜制 CuSO4，较环保的思路是',
        options: ['直接用浓硫酸大量加热', '先氧化铜再与稀硫酸反应', '与食盐水反应', '与水反应'],
        answer: 1,
        explanation: '先将 Cu 氧化为 CuO，再与稀硫酸反应可减少 SO2 等污染。',
      },
    ],
  },
  {
    topic: '铁的性质与 Fe2+/Fe3+ 转化',
    difficulty: 3,
    concept: '**铁有变价，Fe2+ 和 Fe3+ 可相互转化。**铁与非氧化性酸生成 Fe2+；强氧化剂可把 Fe2+ 氧化为 Fe3+；Fe3+ 可氧化 Cu。',
    example: {
      stem: '制印刷电路常用 FeCl3 溶液腐蚀铜，反应中 Fe3+ 的作用是',
      options: ['还原剂', '氧化剂', '催化剂', '沉淀剂'],
      answer: 1,
      explanation: 'Fe3+ 得电子变为 Fe2+，把 Cu 氧化为 Cu2+，因此作氧化剂。',
    },
    flashcard: { front: '铁与稀盐酸通常生成几价铁？', back: 'Fe2+，如 FeCl2。' },
    tips: ['Fe 与 Cl2 生成 FeCl3', 'Fe 与稀盐酸生成 FeCl2', 'Fe3+ 可氧化 Cu，Cu 可把 Fe3+ 还原为 Fe2+'],
    summary: '铁题常考变价和氧还关系。',
    examWeight: 5,
    challenges: [
      {
        stem: '铁与水蒸气高温反应的主要产物之一是',
        options: ['FeO', 'Fe2O3', 'Fe3O4', 'FeCl3'],
        answer: 2,
        explanation: '铁与水蒸气高温反应生成 Fe3O4 和 H2。',
      },
      {
        stem: '下列能将 Fe2+ 氧化为 Fe3+ 的是',
        options: ['Zn', 'Cl2', 'Cu', 'Cl-'],
        answer: 1,
        explanation: 'Cl2 有较强氧化性，可将 Fe2+ 氧化为 Fe3+。',
      },
    ],
  },
  {
    topic: '钠的结构、保存与反应',
    difficulty: 3,
    concept: '**钠最外层 1 个电子，极易失电子。**钠质软、密度小、熔点低，与水剧烈反应生成 NaOH 和 H2，通常保存在煤油中。',
    example: {
      stem: '钠投入水中不会出现的现象是',
      options: ['浮在水面', '熔成小球', '产生气体', '生成红棕色气体'],
      answer: 3,
      explanation: '钠与水反应放热，生成 NaOH 和 H2，不会生成红棕色气体。',
    },
    flashcard: { front: '钠和水反应方程式？', back: '2Na + 2H2O = 2NaOH + H2↑。' },
    tips: ['浮、熔、游、响、红', '钠保存在煤油中隔绝水和空气', '钠先与水反应，再考虑溶液中其他离子'],
    summary: '钠的性质由强还原性和低密度低熔点共同决定。',
    examWeight: 5,
    challenges: [
      {
        stem: '4.6 g Na 与足量水反应，生成 H2 的物质的量为',
        options: ['0.05 mol', '0.1 mol', '0.2 mol', '0.4 mol'],
        answer: 1,
        explanation: '4.6 g Na 为 0.2 mol，2Na 生成 1H2，所以 H2 为 0.1 mol。',
      },
      {
        stem: '钠投入滴有酚酞的水中，溶液变红说明生成了',
        options: ['HCl', 'NaOH', 'NaCl', 'O2'],
        answer: 1,
        explanation: '钠与水反应生成 NaOH，溶液呈碱性，使酚酞变红。',
      },
    ],
  },
  {
    topic: '金属活动性与混合物计算',
    difficulty: 3,
    concept: '**金属与酸反应看活动性和化合价。**活泼金属与非氧化性酸反应放出 H2；计算时用电子守恒或方程式系数比较产氢量。',
    example: {
      stem: '等物质的量的 Fe 分别与足量盐酸、水蒸气充分反应，生成 H2 的物质的量关系是',
      options: ['与盐酸更多', '与水蒸气更多', '相等', '无法判断'],
      answer: 1,
      explanation: 'Fe+2HCl 生成 1 mol H2；3Fe+4H2O 生成 4 mol H2，平均每 mol Fe 生成 4/3 mol H2，因此与水蒸气反应生成 H2 更多。',
    },
    flashcard: { front: '金属产氢量怎么比？', back: '按失电子数或方程式系数比。' },
    tips: ['Mg、Al、Zn、Fe 可与酸放 H2', 'Cu 通常不与稀盐酸放 H2', '混合金属题常用极值或平均摩尔质量'],
    summary: '金属计算连接活动性、化合价和物质的量。',
    examWeight: 4,
    challenges: [
      {
        stem: '等物质的量的 Mg、Al 分别与足量盐酸反应，生成 H2 物质的量比为',
        options: ['1:1', '2:3', '1:2', '3:2'],
        answer: 1,
        explanation: 'Mg 失 2 e- 生成 1 mol H2；Al 失 3 e-，1 mol Al 生成 1.5 mol H2，比例为 1:1.5=2:3。',
      },
      {
        stem: '下列金属投入足量稀盐酸中通常不产生 H2 的是',
        options: ['Mg', 'Al', 'Fe', 'Cu'],
        answer: 3,
        explanation: '铜位于氢后，通常不与稀盐酸反应放氢。',
      },
    ],
  },
], 'g10-l14-n04');

const lesson16Nodes = buildLessonNodes(16, [
  {
    topic: '元素周期表的周期与族',
    difficulty: 2,
    concept: '**周期看电子层数，主族看最外层电子数。**元素周期表共有 7 个周期、18 个纵列；主族元素的族序数常与最外层电子数相关。',
    example: {
      stem: '元素周期表中周期的划分主要依据是原子的',
      options: ['质子数', '中子数', '电子层数', '相对原子质量'],
      answer: 2,
      explanation: '同一周期元素原子电子层数相同。',
    },
    flashcard: { front: '周期和主族分别看什么？', back: '周期看电子层数，主族常看最外层电子数。' },
    tips: ['第 18 列为 0 族/稀有气体', '第 8、9、10 列合称 VIII 族', '位置推断要结合原子序数和电子排布'],
    summary: '周期表结构是性质递变的地图。',
    examWeight: 4,
    challenges: [
      {
        stem: '第 3 周期第 VIIA 族元素是',
        options: ['F', 'Cl', 'Br', 'I'],
        answer: 1,
        explanation: '第 3 周期卤族元素为氯。',
      },
      {
        stem: '第 32 号元素 Ge 位于第 4 周期，其主族为',
        options: ['IIA', 'IVA', 'VIA', 'VIIA'],
        answer: 1,
        explanation: 'Ge 与 C、Si 同族，位于 IVA 族。',
      },
    ],
  },
  {
    topic: '碱金属性质递变',
    difficulty: 3,
    concept: '**碱金属从上到下原子半径增大，失电子能力增强，金属性增强。**与水反应越来越剧烈，熔点整体降低，密度总体增大但有例外。',
    example: {
      stem: 'Li、Na、K、Rb、Cs 中，金属性通常最强的是',
      options: ['Li', 'Na', 'K', 'Cs'],
      answer: 3,
      explanation: '同主族从上到下失电子能力增强，金属性增强，Cs 在给定选项中最强。',
    },
    flashcard: { front: '碱金属从上到下金属性怎么变？', back: '增强。' },
    tips: ['最外层均为 1 个电子', '从上到下半径增大、电离能降低', '与水反应剧烈程度增强'],
    summary: '碱金属是同主族递变规律的典型样本。',
    examWeight: 4,
    challenges: [
      {
        stem: '下列关于碱金属的说法正确的是',
        options: ['都很难失电子', '最外层都有 1 个电子', '从上到下金属性减弱', '都可保存在水中'],
        answer: 1,
        explanation: '碱金属最外层均有 1 个电子，易失电子。',
      },
      {
        stem: '钾与水反应比钠更剧烈，主要原因是钾原子',
        options: ['相对原子质量更大所以更稳定', '半径更大，更易失电子', '中子更多', '颜色更深'],
        answer: 1,
        explanation: '同主族向下原子半径增大，失电子能力增强。',
      },
    ],
  },
  {
    topic: '卤族元素性质递变',
    difficulty: 3,
    concept: '**卤素从上到下非金属性和单质氧化性减弱。**F2、Cl2、Br2、I2 的颜色逐渐加深，状态由气体到液体再到固体；活泼性逐渐降低。',
    example: {
      stem: '下列卤素单质氧化性由强到弱排列正确的是',
      options: ['I2 > Br2 > Cl2 > F2', 'F2 > Cl2 > Br2 > I2', 'Cl2 > F2 > Br2 > I2', 'Br2 > Cl2 > I2 > F2'],
      answer: 1,
      explanation: '卤素同主族从上到下氧化性减弱。',
    },
    flashcard: { front: '卤素从上到下氧化性怎么变？', back: '减弱。' },
    tips: ['Cl2 可置换 Br-、I-', 'Br2 可置换 I-，不能置换 Cl-', '卤素颜色和状态随原子序数增大变化明显'],
    summary: '卤族递变常通过置换实验验证。',
    examWeight: 5,
    challenges: [
      {
        stem: '向 KI 溶液中通入 Cl2，发生反应说明',
        options: ['Cl2 氧化性强于 I2', 'I2 氧化性强于 Cl2', 'Cl- 还原性强于 I-', 'K+ 被氧化'],
        answer: 0,
        explanation: 'Cl2 能把 I- 氧化成 I2，说明 Cl2 氧化性强于 I2。',
      },
      {
        stem: '下列单质通常为液态的是',
        options: ['F2', 'Cl2', 'Br2', 'I2'],
        answer: 2,
        explanation: '常温下 Br2 为液态，F2、Cl2 为气体，I2 为固体。',
      },
    ],
  },
  {
    topic: '周期律与位置-结构-性质推断',
    difficulty: 3,
    concept: '**位置、结构、性质三者互推。**同周期从左到右原子半径减小、金属性减弱、非金属性增强；同主族从上到下电子层数增多，性质呈规律变化。',
    example: {
      stem: '第 3 周期中，金属性最强的元素是',
      options: ['Na', 'Mg', 'Al', 'Cl'],
      answer: 0,
      explanation: '同周期从左到右金属性减弱，第 3 周期左端 Na 金属性最强。',
    },
    flashcard: { front: '同周期从左到右非金属性怎么变？', back: '增强。' },
    tips: ['同周期半径逐渐减小', '金属性看失电子能力', '非金属性看得电子能力和最高价氧化物水化物酸性等'],
    summary: '周期律题要把趋势放回周期表位置上判断。',
    examWeight: 5,
    challenges: [
      {
        stem: 'Na、Mg、Al 三者原子半径由大到小为',
        options: ['Na > Mg > Al', 'Al > Mg > Na', 'Mg > Na > Al', 'Na > Al > Mg'],
        answer: 0,
        explanation: '同周期从左到右原子半径逐渐减小。',
      },
      {
        stem: '同主族从上到下，原子半径一般',
        options: ['减小', '增大', '不变', '先减小后增大'],
        answer: 1,
        explanation: '同主族从上到下电子层数增加，原子半径增大。',
      },
    ],
  },
], 'g10-l15-n04');

const lesson17Nodes = buildLessonNodes(17, [
  {
    topic: '制气装置的构成与选择',
    difficulty: 2,
    concept: '**完整制气流程包括发生、净化干燥、收集、检验验满和尾气处理。**发生装置看反应物状态和是否加热；收集方法看密度和溶解性。',
    example: {
      stem: '实验室制取气体选择发生装置时，最应先考虑',
      options: ['气体颜色', '反应物状态和反应条件', '导管长短', '试管大小'],
      answer: 1,
      explanation: '发生装置取决于固液/固固等反应物状态以及是否需要加热。',
    },
    flashcard: { front: '制气发生装置看哪两个因素？', back: '反应物状态和是否加热。' },
    tips: ['固固加热、固液不加热是两大常见模型', '收集法看溶解性和密度', '有毒气体必须尾气处理'],
    summary: '气体制备不是背装置，而是按性质选择模块。',
    examWeight: 5,
    challenges: [
      {
        stem: '收集不易溶于水的气体，常可采用',
        options: ['排水法', '过滤法', '蒸发法', '萃取法'],
        answer: 0,
        explanation: '不易溶于水且不与水反应的气体可用排水法收集。',
      },
      {
        stem: '密度比空气大且能与水反应的气体，较适合用',
        options: ['排水法', '向上排空气法', '向下排空气法', '冷凝法'],
        answer: 1,
        explanation: '不能用排水法；密度比空气大，应用向上排空气法。',
      },
    ],
  },
  {
    topic: '常见气体制备原理',
    difficulty: 3,
    concept: '**制备原理要满足反应可控、杂质少、便于收集。**O2、H2、CO2、NH3、Cl2 等常见气体的实验室制法都要同时考虑试剂、装置和除杂。',
    example: {
      stem: '实验室用大理石和稀盐酸制 CO2，不能用稀硫酸替代的主要原因是',
      options: ['稀硫酸没有酸性', '生成 CaSO4 微溶覆盖固体阻碍反应', '稀硫酸会生成 H2', 'CO2 不溶于水'],
      answer: 1,
      explanation: 'CaSO4 微溶，会覆盖在大理石表面，使反应难以持续。',
    },
    flashcard: { front: 'CO2 实验室制法常用试剂？', back: '大理石或石灰石与稀盐酸。' },
    tips: ['O2 可由 H2O2 分解或 KClO3 加热制取', 'H2 常由活泼金属与稀酸反应制取', 'NH3 常用铵盐与碱加热制取'],
    summary: '制气原理要服务“稳定地产生目标气体”。',
    examWeight: 5,
    challenges: [
      {
        stem: '用 H2O2 制 O2 时，常加入 MnO2 的作用是',
        options: ['反应物', '催化剂', '干燥剂', '吸收剂'],
        answer: 1,
        explanation: 'MnO2 催化 H2O2 分解，反应前后质量和化学性质基本不变。',
      },
      {
        stem: '实验室制 H2 可选用',
        options: ['Zn 和稀硫酸', 'Cu 和稀盐酸', 'CaCO3 和稀盐酸', 'NH4Cl 和 Ca(OH)2'],
        answer: 0,
        explanation: 'Zn 与稀硫酸反应生成 ZnSO4 和 H2。',
      },
    ],
  },
  {
    topic: '气体净化、干燥与尾气处理',
    difficulty: 3,
    concept: '**除杂试剂不能消耗目标气体。**净化先除杂、后干燥更常见；干燥剂要与目标气体不反应；有毒、污染性气体要用合适吸收液处理。',
    example: {
      stem: '干燥 NH3 不能选用浓硫酸，原因是',
      options: ['浓硫酸不能吸水', 'NH3 会与浓硫酸反应', 'NH3 不含水', '浓硫酸会生成 O2'],
      answer: 1,
      explanation: 'NH3 是碱性气体，会与酸性浓硫酸反应，不能用浓硫酸干燥。',
    },
    flashcard: { front: '选择干燥剂的底线？', back: '能吸水，但不与目标气体反应。' },
    tips: ['酸性气体不用碱石灰干燥', '碱性气体不用浓硫酸干燥', 'Cl2 尾气常用 NaOH 溶液吸收'],
    summary: '净化干燥题本质是选择性吸收。',
    examWeight: 4,
    challenges: [
      {
        stem: '干燥 CO2 可选用',
        options: ['浓硫酸', 'NaOH 固体', '碱石灰', '澄清石灰水'],
        answer: 0,
        explanation: '浓硫酸可吸水且不与 CO2 反应；碱性干燥剂会吸收 CO2。',
      },
      {
        stem: '吸收多余 HCl 气体可用',
        options: ['NaOH 溶液', '浓盐酸', '无水 CuSO4', '饱和食盐水'],
        answer: 0,
        explanation: 'HCl 是酸性气体，可被 NaOH 溶液吸收。',
      },
    ],
  },
  {
    topic: '气体检验与验满',
    difficulty: 3,
    concept: '**检验看特征反应，验满看收集口现象。**O2 用带火星木条复燃，CO2 用澄清石灰水变浑浊，H2 可点燃听轻微爆鸣，NH3 使湿润红色石蕊变蓝。',
    example: {
      stem: '检验 CO2 的常用方法是通入',
      options: ['澄清石灰水', '浓硫酸', 'NaCl 溶液', '紫色石蕊干燥试纸'],
      answer: 0,
      explanation: 'CO2 使澄清石灰水变浑浊，生成 CaCO3 沉淀。',
    },
    flashcard: { front: '氧气验满常用什么？', back: '带火星木条放在集气瓶口，复燃说明已满。' },
    tips: ['检验和除杂不要混淆', '湿润试纸体现气体溶于水后的酸碱性', '可燃性气体点燃前要验纯'],
    summary: '气体检验题强调“现象必须有唯一指向”。',
    examWeight: 4,
    challenges: [
      {
        stem: '能使湿润红色石蕊试纸变蓝的气体是',
        options: ['NH3', 'CO2', 'HCl', 'Cl2'],
        answer: 0,
        explanation: 'NH3 溶于水形成碱性溶液，使湿润红色石蕊试纸变蓝。',
      },
      {
        stem: '检验 O2 常用',
        options: ['燃着木条熄灭', '带火星木条复燃', '澄清石灰水变浑浊', '湿润蓝色石蕊变红'],
        answer: 1,
        explanation: '氧气能支持燃烧，使带火星木条复燃。',
      },
    ],
  },
  {
    topic: '综合制气实验评价',
    difficulty: 3,
    concept: '**综合实验评价要按气流方向逐段检查。**看发生是否可控、除杂是否充分、干燥是否合理、收集是否匹配、尾气是否安全，任何一段出错都会影响结论。',
    example: {
      stem: '评价一套制气装置时，合理的检查顺序是',
      options: ['只看收集瓶', '发生-净化-干燥-收集-尾气', '先看尾气再看发生', '只看药品价格'],
      answer: 1,
      explanation: '按气流方向逐段检查最稳定，能发现每个模块是否匹配目标气体性质。',
    },
    flashcard: { front: '制气综合题按什么方向检查？', back: '按气流方向逐段检查。' },
    tips: ['洗气瓶长进短出是常见规则', '防倒吸、防堵塞、防污染都要考虑', '定量实验还要防漏气和杂质干扰'],
    summary: '综合制气题是实验思维的集中训练。',
    examWeight: 5,
    challenges: [
      {
        stem: '洗气瓶用于除杂时，气体通常应',
        options: ['短管进长管出', '长管进短管出', '两管随意', '不进入液体'],
        answer: 1,
        explanation: '长管进气可使气体充分通过洗液，短管出气。',
      },
      {
        stem: '可燃性气体点燃前必须',
        options: ['先验纯', '先加水', '先冷却到 0℃', '先通入 CO2'],
        answer: 0,
        explanation: '可燃性气体与空气混合可能爆炸，点燃前必须验纯。',
      },
    ],
  },
], 'g10-l16-n04');

const lessonNodesByNo: Record<number, KnowledgePoint[]> = {
  1: lesson1Nodes,
  2: lesson2Nodes,
  3: lesson3Nodes,
  4: lesson4Nodes,
  5: lesson5Nodes,
  6: lesson6Nodes,
  7: lesson7Nodes,
  8: lesson8Nodes,
  10: lesson10Nodes,
  11: lesson11Nodes,
  12: lesson12Nodes,
  13: lesson13Nodes,
  14: lesson14Nodes,
  15: lesson15Nodes,
  16: lesson16Nodes,
  17: lesson17Nodes,
};

export const g10SummerChapters: Chapter[] = g10SummerHandouts.map((lesson, index) => ({
  id: `g10-summer-l${String(lesson.lessonNo).padStart(2, '0')}`,
  name: `第${lesson.lessonNo}节 ${lesson.title}`,
  icon: lesson.icon,
  grade: '高一暑期',
  sortOrder: index + 1,
  sections: [
    {
      id: `g10-summer-l${String(lesson.lessonNo).padStart(2, '0')}-draft`,
      title: `讲义拆解 · ${lesson.title}`,
      nodes: lessonNodesByNo[lesson.lessonNo] ?? [],
    },
  ],
}));

export const g10SummerCourse: Course = {
  id: 'shanghai-senior-chemistry-g10-summer',
  name: '上海高一化学暑期特供版',
  shortName: '高一暑期特供',
  region: '上海',
  stage: 'senior',
  examSystem: '上海高中化学',
  textbook: '高一暑期自编讲义',
  status: 'draft',
  sourcePath: HANDOUT_ROOT,
  description: '上海高一化学暑期特供版 · 按真实课堂节奏重排 · 草稿课程',
  modeSummary: '先服务暑假班：降低坡度，按学生可做度重构讲义与题目',
  gradeOrder: ['高一暑期'],
  chapters: g10SummerChapters,
  reviewChapters: [],
};
