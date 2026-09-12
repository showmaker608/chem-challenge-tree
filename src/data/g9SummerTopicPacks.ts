import type { Chapter, KnowledgePoint, Section } from '../types';

const electrolyteNodes: KnowledgePoint[] = [
  {
    id: 'g9-electrolyte-n1',
    topic: '电解质与非电解质边界',
    difficulty: 3,
    learningContent: {
      concept: '能在水溶液或熔融状态下导电的化合物叫电解质；酸、碱、盐大多是电解质。酒精、蔗糖等化合物溶于水后不产生自由移动离子，属于非电解质。',
      example: {
        stem: '下列物质中，属于电解质的是',
        options: ['铜丝', '酒精', '氯化钠', '蔗糖'],
        answer: 2,
        explanation: '氯化钠是化合物，熔融或溶于水后能产生自由移动离子而导电，属于电解质。铜丝是单质，不叫电解质；酒精、蔗糖溶液不导电，是非电解质。',
      },
      whyWrong: ['铜能导电，但它是单质，不属于电解质分类范围。', '酒精是化合物，但水溶液中不电离出离子。', '', '蔗糖溶于水后仍以分子形式存在。'],
      tips: ['电解质首先必须是化合物', '能导电的金属不是电解质', '酸、碱、盐大多是电解质，酒精、蔗糖常考非电解质'],
      summary: '判断电解质先看“是不是化合物”，再看“水溶液或熔融状态能不能导电”。',
      examWeight: 4,
    },
    challenges: [
      {
        stem: '下列说法正确的是',
        options: ['能导电的物质一定是电解质', '电解质一定是化合物', '蔗糖溶液能导电', '铜是最典型的电解质'],
        answer: 1,
        explanation: '电解质必须是化合物，且在水溶液或熔融状态下能导电。金属能导电但不是电解质。',
      },
      {
        stem: '下列物质溶于水后，溶液通常不能导电的是',
        options: ['HCl', 'NaOH', 'KNO3', 'C2H5OH'],
        answer: 3,
        explanation: '乙醇溶于水后主要以分子形式存在，不能产生大量自由移动离子，溶液通常不能导电。',
      },
      {
        stem: '固体 NaCl 不导电，但 NaCl 溶液能导电，主要原因是',
        options: ['NaCl 溶液中有自由移动的离子', 'NaCl 溶液中有自由移动的电子', '水分子都变成了电子', 'NaCl 溶液变成了金属'],
        answer: 0,
        explanation: '溶液导电依靠自由移动的离子，不是自由电子；金属导电才主要依靠自由电子。',
      },
    ],
  },
  {
    id: 'g9-electrolyte-n2',
    topic: '电离方程式与离子书写',
    difficulty: 3,
    prerequisites: ['g9-electrolyte-n1'],
    learningContent: {
      concept: '电离方程式表示电解质在水溶液中形成离子的过程。书写时要守住原子种类、电荷总数和离子个数。',
      example: {
        stem: '下列电离方程式书写正确的是',
        options: ['NaCl = Na+ + Cl-', 'CaCl2 = Ca+ + 2Cl-', 'H2SO4 = H+ + SO42-', 'Al2(SO4)3 = 2Al3+ + 3SO42-'],
        answer: 3,
        explanation: 'Al2(SO4)3 电离生成 2 个 Al3+ 和 3 个 SO42-，电荷总数为 +6 和 -6，守恒。',
      },
      whyWrong: ['表达上最好写离子电荷为 Na+、Cl-，但本题更关键是后面选项的电荷和个数。', '钙离子应为 Ca2+。', 'H2SO4 应产生 2 个 H+。', ''],
      tips: ['下标变成离子个数', '离子电荷不能随便改', '最后检查电荷总数是否为 0'],
      summary: '电离方程式不是背符号，而是把化学式拆成“正确个数的正确离子”。',
      examWeight: 4,
    },
    challenges: [
      {
        stem: 'MgCl2 在水溶液中的电离可表示为',
        options: ['MgCl2 = Mg+ + 2Cl-', 'MgCl2 = Mg2+ + 2Cl-', 'MgCl2 = Mg2+ + Cl2-', 'MgCl2 = Mg + Cl2'],
        answer: 1,
        explanation: '氯化镁由 Mg2+ 和 Cl- 构成，一个 MgCl2 单元对应 1 个 Mg2+ 和 2 个 Cl-。',
      },
      {
        stem: 'Na2SO4 电离后，钠离子和硫酸根离子的个数比为',
        options: ['1:1', '2:1', '1:2', '2:4'],
        answer: 1,
        explanation: 'Na2SO4 中有 2 个 Na+ 和 1 个 SO42-，离子个数比为 2:1。',
      },
      {
        stem: '书写电离方程式时，下列检查最关键的是',
        options: ['颜色是否好看', '电荷总数是否守恒', '溶液是否有味道', '是否一定产生气体'],
        answer: 1,
        explanation: '电离方程式必须满足原子种类、原子个数和电荷守恒。',
      },
    ],
  },
  {
    id: 'g9-electrolyte-n3',
    topic: '溶液导电的微观解释',
    difficulty: 3,
    prerequisites: ['g9-electrolyte-n2'],
    learningContent: {
      concept: '溶液能否导电，核心看有没有足够多自由移动的带电粒子。酸、碱、盐溶液里常有离子；蔗糖水、酒精水主要是分子。',
      example: {
        stem: '相同条件下，下列液体接入导电装置后灯泡最可能发亮的是',
        options: ['蒸馏水', '蔗糖水', '稀盐酸', '酒精溶液'],
        answer: 2,
        explanation: '稀盐酸中有大量 H+ 和 Cl-，能导电。蒸馏水、蔗糖水、酒精溶液中自由移动离子很少或没有，导电性弱。',
      },
      whyWrong: ['蒸馏水中离子极少，导电性很弱。', '蔗糖以分子形式存在。', '', '酒精以分子形式存在。'],
      tips: ['导电靠自由移动离子', '溶液导电强弱和离子浓度有关', '看到蔗糖、酒精，先警惕“分子不电离”'],
      summary: '导电实验题不要只看“溶了没有”，要看“有没有离子在动”。',
      examWeight: 4,
    },
    challenges: [
      {
        stem: '下列关于溶液导电的说法正确的是',
        options: ['所有溶液都能强烈导电', '溶液导电主要依靠自由移动离子', '蔗糖水导电性一定比盐水强', '导电说明溶液中有金属单质'],
        answer: 1,
        explanation: '酸、碱、盐溶液导电主要依靠自由移动离子。',
      },
      {
        stem: '向水中加入少量 NaCl 后，导电性增强，原因是',
        options: ['水变成金属', '产生了自由移动的 Na+ 和 Cl-', '水分子变大', 'NaCl 分子会发光'],
        answer: 1,
        explanation: 'NaCl 溶于水形成自由移动的 Na+ 和 Cl-，所以导电性增强。',
      },
      {
        stem: '某无色溶液不能使导电装置灯泡明显发亮，该溶液可能是',
        options: ['稀硫酸', '氢氧化钠溶液', '硝酸钾溶液', '蔗糖溶液'],
        answer: 3,
        explanation: '蔗糖溶液中缺少大量自由移动离子，导电性弱。',
      },
    ],
  },
];

const ionReactionNodes: KnowledgePoint[] = [
  {
    id: 'g9-ion-n1',
    topic: '复分解反应发生条件',
    difficulty: 3,
    learningContent: {
      concept: '酸、碱、盐之间发生复分解反应，常见推动力是生成沉淀、气体或水。做题先看离子交换后有没有这三类生成物。',
      example: {
        stem: '下列反应最容易发生的是',
        options: ['NaCl 溶液与 KNO3 溶液混合', 'BaCl2 溶液与 Na2SO4 溶液混合', 'NaNO3 溶液与 KCl 溶液混合', '蔗糖水与酒精混合'],
        answer: 1,
        explanation: 'Ba2+ 与 SO42- 结合生成 BaSO4 白色沉淀，满足复分解反应发生条件。',
      },
      whyWrong: ['交换后没有沉淀、气体或水。', '', '交换后没有沉淀、气体或水。', '蔗糖水和酒精不是典型酸碱盐复分解体系。'],
      tips: ['沉淀、气体、水是三大信号', '碳酸盐遇酸常放 CO2', '酸碱中和生成水'],
      summary: '复分解题先做“离子配对”，再看是否有沉淀、气体、水把反应拉走。',
      examWeight: 5,
    },
    challenges: [
      {
        stem: 'Na2CO3 溶液与稀盐酸反应能发生，主要因为生成了',
        options: ['氢气', '氧气', '二氧化碳和水', '金属钠'],
        answer: 2,
        explanation: '碳酸盐与酸反应生成盐、水和 CO2，气体逸出推动反应发生。',
      },
      {
        stem: 'BaCl2 + Na2SO4 = BaSO4↓ + 2NaCl 中的反应信号是',
        options: ['产生白色沉淀', '产生红褐色沉淀', '产生蓝色沉淀', '产生刺激性气体'],
        answer: 0,
        explanation: 'BaSO4 是难溶白色沉淀。',
      },
      {
        stem: '酸和碱发生中和反应属于复分解反应，关键生成物是',
        options: ['水', '氢气', '氧气', '单质铁'],
        answer: 0,
        explanation: 'H+ 与 OH- 结合生成水，是中和反应的本质。',
      },
    ],
  },
  {
    id: 'g9-ion-n2',
    topic: '离子共存判断',
    difficulty: 3,
    prerequisites: ['g9-ion-n1'],
    learningContent: {
      concept: '判断离子能否大量共存，看它们相遇后会不会生成沉淀、气体或水。若会反应，就不能大量共存。',
      example: {
        stem: '下列离子在水溶液中能大量共存的是',
        options: ['H+、CO32-', 'Ba2+、SO42-', 'Na+、Cl-', 'Ag+、Cl-'],
        answer: 2,
        explanation: 'Na+ 与 Cl- 不生成沉淀、气体或水，可以大量共存。其他选项会生成 CO2 和水、BaSO4 沉淀、AgCl 沉淀。',
      },
      whyWrong: ['H+ 与 CO32- 反应产生 CO2 和水。', 'BaSO4 是沉淀。', '', 'AgCl 是沉淀。'],
      tips: ['H+ + CO32- 不共存', 'Ba2+ + SO42- 不共存', 'Ag+ + Cl- 不共存', 'H+ + OH- 不共存'],
      summary: '离子共存就是把常见沉淀、气体、水的组合背成反应雷区。',
      examWeight: 5,
    },
    challenges: [
      {
        stem: '下列离子不能大量共存的是',
        options: ['Na+ 和 NO3-', 'K+ 和 Cl-', 'H+ 和 OH-', 'Na+ 和 SO42-'],
        answer: 2,
        explanation: 'H+ 与 OH- 会结合生成水，不能大量共存。',
      },
      {
        stem: '含有 CO32- 的溶液中加入稀盐酸，常见现象是',
        options: ['产生气泡', '出现蓝色沉淀', '固体变黑', '产生大量氧气'],
        answer: 0,
        explanation: 'CO32- 与 H+ 反应生成 CO2 气体和水。',
      },
      {
        stem: '检验 Cl- 常用 AgNO3 溶液，若有 Cl-，现象通常是',
        options: ['产生白色沉淀', '溶液变蓝', '产生红褐色沉淀', '火焰呈紫色'],
        answer: 0,
        explanation: 'Ag+ 与 Cl- 生成 AgCl 白色沉淀。',
      },
    ],
  },
  {
    id: 'g9-ion-n3',
    topic: '酸碱盐鉴别与除杂',
    difficulty: 3,
    prerequisites: ['g9-ion-n2'],
    learningContent: {
      concept: '鉴别题要选能产生不同现象的试剂；除杂题要除去杂质、保留主体、不能引入新杂质。',
      example: {
        stem: '要鉴别 Na2CO3 溶液和 NaCl 溶液，最合适的试剂是',
        options: ['稀盐酸', '蒸馏水', '蔗糖水', '酒精'],
        answer: 0,
        explanation: 'Na2CO3 遇稀盐酸产生 CO2 气泡，NaCl 与稀盐酸无明显现象，可鉴别。',
      },
      whyWrong: ['','蒸馏水不能产生差异现象。','蔗糖水通常不能产生差异现象。','酒精通常不能产生差异现象。'],
      tips: ['鉴别要有不同现象', '除杂不能引入新杂质', '碳酸盐、氯离子、硫酸根是高频鉴别点'],
      summary: '鉴别看“能不能分开”，除杂看“除掉谁、留下谁、会不会添新东西”。',
      examWeight: 5,
    },
    challenges: [
      {
        stem: '除去 NaCl 溶液中少量 Na2CO3，较合适的是加入适量',
        options: ['稀盐酸', 'NaOH 溶液', '蔗糖', '水'],
        answer: 0,
        explanation: '适量稀盐酸能与 Na2CO3 反应生成 NaCl、水和 CO2，不引入新杂质。',
      },
      {
        stem: '鉴别稀盐酸和 NaOH 溶液，可用',
        options: ['无色酚酞', 'NaCl 固体', '蒸馏水', '蔗糖'],
        answer: 0,
        explanation: '无色酚酞遇 NaOH 溶液变红，遇稀盐酸不变色。',
      },
      {
        stem: '除杂题中“适量”的含义最接近',
        options: ['越多越好', '刚好反应掉杂质', '随便加一点', '一定加到有沉淀剩余'],
        answer: 1,
        explanation: '适量是为了除去杂质又不引入过量试剂形成新杂质。',
      },
    ],
  },
];

const redoxNodes: KnowledgePoint[] = [
  {
    id: 'g9-redox-n1',
    topic: '得氧失氧看氧化还原',
    difficulty: 3,
    learningContent: {
      concept: '初中阶段可先用“得氧被氧化，失氧被还原”理解氧化还原。金属氧化物失去氧变成金属，发生还原反应。',
      example: {
        stem: '反应 CuO + H2 = Cu + H2O 中，CuO 发生的变化是',
        options: ['得氧，被氧化', '失氧，被还原', '得氢，被氧化', '没有变化'],
        answer: 1,
        explanation: 'CuO 失去氧变成 Cu，发生还原反应。',
      },
      whyWrong: ['CuO 没有得氧。', '', '初中用得氧失氧判断即可。', 'CuO 生成了 Cu，发生了变化。'],
      tips: ['得氧叫氧化', '失氧叫还原', '金属氧化物变金属通常是被还原'],
      summary: '先用得氧失氧建立方向感，再进入更高阶的电子得失。',
      examWeight: 4,
    },
    challenges: [
      {
        stem: 'C + 2CuO = 2Cu + CO2 中，CuO 发生',
        options: ['氧化反应', '还原反应', '分解反应', '中和反应'],
        answer: 1,
        explanation: 'CuO 失去氧生成 Cu，发生还原反应。',
      },
      {
        stem: 'CO 还原 Fe2O3 的实验中，Fe2O3 最终生成',
        options: ['Fe', 'FeCl3', 'Fe(OH)3', 'H2O'],
        answer: 0,
        explanation: '一氧化碳夺取氧化铁中的氧，使氧化铁被还原为铁。',
      },
      {
        stem: '“被氧化”在初中得氧失氧模型中通常表示物质',
        options: ['得到氧', '失去氧', '变成水', '一定变成沉淀'],
        answer: 0,
        explanation: '初中可先记“得氧被氧化，失氧被还原”。',
      },
    ],
  },
  {
    id: 'g9-redox-n2',
    topic: '还原剂与还原能力比较',
    difficulty: 3,
    prerequisites: ['g9-redox-n1'],
    learningContent: {
      concept: '能夺取金属氧化物中氧的物质常作还原剂，如 C、CO、H2。还原剂自身通常被氧化。',
      example: {
        stem: '在 CO + CuO = Cu + CO2 中，作还原剂的是',
        options: ['CO', 'CuO', 'Cu', 'CO2'],
        answer: 0,
        explanation: 'CO 夺取 CuO 中的氧，使 CuO 被还原，CO 自身被氧化成 CO2，因此 CO 是还原剂。',
      },
      whyWrong: ['', 'CuO 被还原，是氧化剂。', 'Cu 是产物。', 'CO2 是氧化后的产物。'],
      tips: ['夺氧者常作还原剂', '还原剂自身被氧化', 'C、CO、H2 是初中高频还原剂'],
      summary: '看谁把氧抢走，谁就是还原剂。',
      examWeight: 4,
    },
    challenges: [
      {
        stem: '下列物质常用于还原金属氧化物的是',
        options: ['CO', 'NaCl', 'CaCO3', 'H2O'],
        answer: 0,
        explanation: 'CO 具有还原性，能还原某些金属氧化物。',
      },
      {
        stem: '木炭还原氧化铜实验中，木炭的主要作用是',
        options: ['作还原剂', '作催化剂', '作溶剂', '作指示剂'],
        answer: 0,
        explanation: '木炭夺取氧化铜中的氧，使氧化铜被还原为铜。',
      },
      {
        stem: '还原剂在反应中通常',
        options: ['被氧化', '被还原', '一定不变化', '一定生成沉淀'],
        answer: 0,
        explanation: '还原剂使别的物质被还原，自己通常被氧化。',
      },
    ],
  },
  {
    id: 'g9-redox-n3',
    topic: '还原实验现象与安全',
    difficulty: 3,
    prerequisites: ['g9-redox-n2'],
    learningContent: {
      concept: '还原实验常考现象、装置顺序与尾气处理。CO 有毒，实验结束必须处理尾气，防止污染和中毒。',
      example: {
        stem: 'CO 还原氧化铁实验中，尾气处理的主要原因是',
        options: ['CO 有毒且可燃', 'CO2 有蓝色', 'Fe2O3 会溶于水', '铁会挥发'],
        answer: 0,
        explanation: 'CO 有毒，且未反应完的 CO 可燃，需要点燃或收集处理。',
      },
      whyWrong: ['', 'CO2 无色。', '与尾气处理无关。', '铁不会在该实验条件下挥发。'],
      tips: ['CO 有毒，要尾气处理', '黑色 CuO 变红色 Cu', '红棕色 Fe2O3 可变黑色 Fe'],
      summary: '还原实验既考化学性质，也考实验安全和现象描述。',
      examWeight: 4,
    },
    challenges: [
      {
        stem: '氢气还原氧化铜实验的主要现象是',
        options: ['黑色固体逐渐变红', '红色固体逐渐变黑', '产生蓝色沉淀', '溶液变紫'],
        answer: 0,
        explanation: '黑色 CuO 被还原为红色 Cu。',
      },
      {
        stem: 'CO 还原金属氧化物实验开始时，通常先通 CO 再加热，目的是',
        options: ['排尽装置内空气，防止爆炸', '让玻璃变软', '让水蒸发', '让固体溶解'],
        answer: 0,
        explanation: 'CO 与空气混合遇热可能爆炸，先通 CO 是为了排尽空气。',
      },
      {
        stem: '描述实验现象时，下列表达更规范的是',
        options: ['物质变好了', '黑色固体逐渐变为红色', '反应成功了', '它很厉害'],
        answer: 1,
        explanation: '实验现象要写看得见的颜色、状态、气体、沉淀等变化。',
      },
    ],
  },
];

const moleNodes: KnowledgePoint[] = [
  {
    id: 'g9-mole-n1',
    topic: '物质的量与摩尔',
    difficulty: 3,
    learningContent: {
      concept: '物质的量用 n 表示，单位是 mol。1 mol 微粒约含 6.02×10^23 个微粒，这个数叫阿伏伽德罗常数。',
      example: {
        stem: '下列关于 1 mol 水分子的说法正确的是',
        options: ['只表示 1 个水分子', '约含 6.02×10^23 个水分子', '质量一定是 1 g', '体积一定是 1 L'],
        answer: 1,
        explanation: '1 mol 任意微粒都约含 6.02×10^23 个对应微粒。',
      },
      whyWrong: ['1 mol 不是 1 个。', '', '1 mol 水的质量约为 18 g。', '液体体积不能这样固定。'],
      tips: ['n 表示物质的量', '单位 mol', '1 mol 约等于 6.02×10^23 个微粒'],
      summary: 'mol 是把微观粒子数打包计数的单位。',
      examWeight: 4,
    },
    challenges: [
      {
        stem: '物质的量的单位是',
        options: ['g', 'L', 'mol', '℃'],
        answer: 2,
        explanation: '物质的量的单位是 mol。',
      },
      {
        stem: '2 mol CO2 分子中约含 CO2 分子数为',
        options: ['2 个', '6.02×10^23 个', '1.204×10^24 个', '44 个'],
        answer: 2,
        explanation: '2 mol 微粒约含 2×6.02×10^23 = 1.204×10^24 个微粒。',
      },
      {
        stem: '“1 mol Na+”表示的是',
        options: ['1 个钠离子', '约 6.02×10^23 个钠离子', '1 g 钠离子', '1 L 钠离子'],
        answer: 1,
        explanation: '1 mol 任意指定微粒都约含阿伏伽德罗常数个该微粒。',
      },
    ],
  },
  {
    id: 'g9-mole-n2',
    topic: '摩尔质量与质量换算',
    difficulty: 3,
    prerequisites: ['g9-mole-n1'],
    learningContent: {
      concept: '摩尔质量 M 的单位常用 g/mol，数值上等于相对分子质量或相对原子质量。核心公式：m = nM。',
      example: {
        stem: 'CO2 的摩尔质量为',
        options: ['12 g/mol', '16 g/mol', '28 g/mol', '44 g/mol'],
        answer: 3,
        explanation: 'CO2 的相对分子质量为 12 + 16×2 = 44，所以摩尔质量为 44 g/mol。',
      },
      whyWrong: ['12 是碳的相对原子质量。', '16 是氧的相对原子质量。', '28 是 CO 的相对分子质量。', ''],
      tips: ['M 数值等于相对分子质量', 'm = nM', 'n = m/M'],
      summary: '摩尔质量把“多少 mol”和“多少克”连起来。',
      examWeight: 4,
    },
    challenges: [
      {
        stem: '2 mol CO2 的质量为',
        options: ['22 g', '44 g', '88 g', '6.02 g'],
        answer: 2,
        explanation: 'CO2 的摩尔质量为 44 g/mol，2 mol 的质量为 2×44 = 88 g。',
      },
      {
        stem: '18 g H2O 的物质的量为',
        options: ['0.5 mol', '1 mol', '2 mol', '18 mol'],
        answer: 1,
        explanation: 'H2O 的摩尔质量为 18 g/mol，n = 18/18 = 1 mol。',
      },
      {
        stem: '下列公式正确的是',
        options: ['m = nM', 'M = mn', 'n = mM', 'm = n/M'],
        answer: 0,
        explanation: '质量、物质的量、摩尔质量的关系为 m = nM。',
      },
    ],
  },
  {
    id: 'g9-mole-n3',
    topic: '微粒数、质量、物质的量三角关系',
    difficulty: 3,
    prerequisites: ['g9-mole-n2'],
    learningContent: {
      concept: '物质的量是中间桥梁：微粒数 N = nNA，质量 m = nM。遇到综合题，先把已知量统一转成 n。',
      example: {
        stem: '已知 0.5 mol O2，下列说法正确的是',
        options: ['约含 0.5 个 O2 分子', '质量为 16 g', '质量为 32 g', '约含 6.02×10^23 个 O2 分子'],
        answer: 1,
        explanation: 'O2 的摩尔质量为 32 g/mol，0.5 mol 的质量为 0.5×32 = 16 g。',
      },
      whyWrong: ['0.5 mol 不是 0.5 个。', '', '32 g 是 1 mol O2 的质量。', '0.5 mol 约含 3.01×10^23 个 O2 分子。'],
      tips: ['质量题找 M', '粒子数题找 NA', '先转 n 再转目标量'],
      summary: 'n 像中转站，质量和粒子数都可以通过它互相换算。',
      examWeight: 4,
    },
    challenges: [
      {
        stem: '0.25 mol CO2 的质量为',
        options: ['11 g', '22 g', '44 g', '88 g'],
        answer: 0,
        explanation: 'CO2 的摩尔质量为 44 g/mol，0.25×44 = 11 g。',
      },
      {
        stem: '约 6.02×10^23 个 H2 分子的物质的量为',
        options: ['0.5 mol', '1 mol', '2 mol', '6 mol'],
        answer: 1,
        explanation: '阿伏伽德罗常数个微粒对应 1 mol。',
      },
      {
        stem: '比较 1 mol O2 和 1 mol CO2，下列说法正确的是',
        options: ['分子数相同', '质量相同', '原子总数相同', '颜色相同'],
        answer: 0,
        explanation: '同为 1 mol 分子，分子数相同；但 O2 和 CO2 摩尔质量不同，原子总数也不同。',
      },
    ],
  },
];

const gasAmountNodes: KnowledgePoint[] = [
  {
    id: 'g9-gas-n1',
    topic: '气体体积与物质的量',
    difficulty: 3,
    prerequisites: ['g9-mole-n1'],
    learningContent: {
      concept: '同温同压下，气体体积与物质的量成正比。领航衔接阶段先掌握“同温同压、同体积气体，分子数相同”。',
      example: {
        stem: '同温同压下，1 L O2 和 1 L CO2 具有相同的',
        options: ['质量', '分子数', '颜色', '化学性质'],
        answer: 1,
        explanation: '同温同压下，相同体积的气体含有相同数目的分子。',
      },
      whyWrong: ['O2 和 CO2 摩尔质量不同，质量不同。', '', '两者都无色，但这不是气体体积规律的核心。', '两者化学性质不同。'],
      tips: ['前提是同温同压', '相同体积气体分子数相同', '质量还要看摩尔质量'],
      summary: '气体题最怕丢前提：同温同压。',
      examWeight: 3,
    },
    challenges: [
      {
        stem: '同温同压下，2 L H2 与 2 L O2 相同的是',
        options: ['质量', '分子数', '密度', '燃烧现象'],
        answer: 1,
        explanation: '同温同压下，同体积气体含相同数目的分子。',
      },
      {
        stem: '同温同压下，气体体积增大到原来的 2 倍，物质的量通常',
        options: ['也变为 2 倍', '变为一半', '不变', '一定变为 0'],
        answer: 0,
        explanation: '同温同压下，气体体积与物质的量成正比。',
      },
      {
        stem: '使用气体体积规律时，必须先确认',
        options: ['是否同温同压', '是否有颜色', '是否可燃', '是否有沉淀'],
        answer: 0,
        explanation: '同温同压是气体体积与物质的量关系成立的重要前提。',
      },
    ],
  },
  {
    id: 'g9-gas-n2',
    topic: '气体密度与摩尔质量',
    difficulty: 3,
    prerequisites: ['g9-gas-n1'],
    learningContent: {
      concept: '同温同压下，气体密度与摩尔质量成正比。摩尔质量越大，同体积气体质量越大，密度越大。',
      example: {
        stem: '同温同压下，下列气体密度最大的是',
        options: ['H2', 'O2', 'CO2', 'N2'],
        answer: 2,
        explanation: '同温同压下，气体密度与摩尔质量成正比。CO2 的摩尔质量 44 g/mol 最大。',
      },
      whyWrong: ['H2 摩尔质量为 2。', 'O2 摩尔质量为 32。', '', 'N2 摩尔质量为 28。'],
      tips: ['同温同压下比密度，可比摩尔质量', 'CO2 比空气密度大', 'H2 密度很小'],
      summary: '气体密度题常常转化为摩尔质量比较题。',
      examWeight: 3,
    },
    challenges: [
      {
        stem: '同温同压下，H2 和 CO2 相比，密度较小的是',
        options: ['H2', 'CO2', '一样大', '无法判断'],
        answer: 0,
        explanation: 'H2 的摩尔质量为 2 g/mol，远小于 CO2 的 44 g/mol。',
      },
      {
        stem: 'CO2 可用向上排空气法收集，常见原因之一是',
        options: ['CO2 密度比空气大', 'CO2 密度比空气小', 'CO2 能燃烧', 'CO2 有蓝色'],
        answer: 0,
        explanation: 'CO2 密度比空气大，可用向上排空气法收集。',
      },
      {
        stem: '同温同压下，比较气体密度大小最常用的依据是',
        options: ['摩尔质量', '颜色', '是否溶于水', '是否有气味'],
        answer: 0,
        explanation: '同温同压下，气体密度与摩尔质量成正比。',
      },
    ],
  },
  {
    id: 'g9-gas-n3',
    topic: '气体综合计算入门',
    difficulty: 3,
    prerequisites: ['g9-gas-n2'],
    learningContent: {
      concept: '气体综合题常把体积、物质的量、质量连在一起。先看同温同压条件，再把体积关系转成物质的量关系。',
      example: {
        stem: '同温同压下，等体积的 O2 和 CO2 相比，下列正确的是',
        options: ['物质的量相同，质量不同', '质量相同，物质的量不同', '质量和物质的量都相同', '分子数不同'],
        answer: 0,
        explanation: '同温同压等体积气体物质的量和分子数相同，但摩尔质量不同，质量不同。',
      },
      whyWrong: ['', '物质的量相同。', '质量不同。', '分子数相同。'],
      tips: ['等体积气体先得出 n 相同', '质量再用 m = nM', '别把体积相同误认为质量相同'],
      summary: '同体积气体是“粒子数相同”，不是“质量相同”。',
      examWeight: 3,
    },
    challenges: [
      {
        stem: '同温同压下，1 mol O2 与 1 mol CO2 的体积关系通常是',
        options: ['相同', 'O2 更大', 'CO2 更大', '无法比较'],
        answer: 0,
        explanation: '同温同压下，相同物质的量的气体体积相同。',
      },
      {
        stem: '同温同压下，等体积 H2 和 O2 的质量比为',
        options: ['1:1', '1:16', '2:1', '16:1'],
        answer: 1,
        explanation: '等体积气体物质的量相同，质量比等于摩尔质量比，H2:O2 = 2:32 = 1:16。',
      },
      {
        stem: '气体综合题中，“同体积”最先能推出的是',
        options: ['同质量', '同物质的量', '同颜色', '同化学性质'],
        answer: 1,
        explanation: '同温同压下，同体积气体具有相同物质的量和分子数。',
      },
    ],
  },
];

const g9BoostSections: Record<string, Section[]> = {
  ch3: [
    {
      id: 'ch3-s-g9-electrolyte',
      title: '九阶专题 · 电解质、电离与导电',
      nodes: electrolyteNodes,
    },
  ],
  ch6: [
    {
      id: 'ch6-s-g9-redox',
      title: '九阶专题 · 氧化还原入门',
      nodes: redoxNodes,
    },
  ],
  ch12: [
    {
      id: 'ch12-s-g9-ion-reaction',
      title: '九阶专题 · 离子反应与共存',
      nodes: ionReactionNodes,
    },
  ],
};

const bridgeChapter: Chapter = {
  id: 'ch13',
  grade: '九年级',
  sortOrder: 6,
  name: '九阶高中衔接',
  icon: '🧮',
  badge: '九阶专题',
  desc: '承接领航后段的物质的量、摩尔质量、气体体积与密度，不硬塞进普通初中主线。',
  sections: [
    {
      id: 'ch13-s1',
      title: '物质的量、摩尔质量与微粒数',
      nodes: moleNodes,
    },
    {
      id: 'ch13-s2',
      title: '气体体积、密度与物质的量',
      nodes: gasAmountNodes,
    },
  ],
};

export function withG9SummerTopicPacks(chapters: Chapter[]): Chapter[] {
  const boosted = chapters.map((chapter) => {
    const sections = g9BoostSections[chapter.id];
    if (!sections) return chapter;

    return {
      ...chapter,
      sections: [...chapter.sections, ...sections],
    };
  });

  if (boosted.some((chapter) => chapter.id === bridgeChapter.id)) return boosted;
  return [...boosted, bridgeChapter];
}
