import { useState } from 'react';

type Stage = 'plan' | 'prepare' | 'collect' | 'verify' | 'finish';

interface Decision {
  eyebrow: string;
  title: string;
  question: string;
  options: string[];
  answer: number;
  wrongFeedback: string[];
  conclusion: string;
}

const stages: Stage[] = ['plan', 'prepare', 'collect', 'verify', 'finish'];
const stageLabels = ['定方案', '连接装药', '收集', '检验验满', '收尾'];

const preparationDecisions: Decision[] = [
  {
    eyebrow: '准备 1/3 · 连接装置',
    title: '先把长颈漏斗、导管和锥形瓶连接好',
    question: '玻璃导管插入带孔橡皮塞时，哪项操作安全、规范？',
    options: [
      '管口用水润湿，再稍稍用力转动插入橡皮塞',
      '玻璃管抵住桌面，垂直向下猛压',
      '手掌正对玻璃管口，用力推入橡皮塞',
    ],
    answer: 0,
    wrongFeedback: [
      '',
      '抵住桌面猛压容易折断玻璃管。连接玻璃仪器不能依靠蛮力。',
      '手掌正对管口，一旦玻璃管折断容易刺伤。先想怎样减小摩擦。',
    ],
    conclusion: '先润湿，边转动边插入；整套装置按照从下到上、从左到右的顺序连接。',
  },
  {
    eyebrow: '准备 2/3 · 检查气密性',
    title: '装置已经连接，药品还没有加入',
    question: '气密性检查应该安排在什么时候？',
    options: [
      '加入大理石和稀盐酸之前',
      '已经产生大量气泡以后',
      '二氧化碳收集满以后',
    ],
    answer: 0,
    wrongFeedback: [
      '',
      '反应开始后才发现漏气，二氧化碳会逸出，也不便再拆装修正。',
      '收集完成后再检查，已经失去了防止漏气的意义。',
    ],
    conclusion: '凡是制取气体，都应在装药前检查气密性；确认不漏气后，才能加入药品。',
  },
  {
    eyebrow: '准备 3/3 · 装入药品',
    title: '装置不漏气，现在装入大理石和稀盐酸',
    question: '哪一种装药操作正确？',
    options: [
      '锥形瓶横放，把块状大理石送到底部后慢慢竖起；再沿长颈漏斗加稀盐酸，液面浸没漏斗下端',
      '从高处把大理石直接砸入直立锥形瓶，再加入浓盐酸',
      '先把大理石磨成粉末，再一次倒入大量稀盐酸',
    ],
    answer: 0,
    wrongFeedback: [
      '',
      '块状固体从高处落下可能击破瓶底；浓盐酸还会挥发出HCl，使气体不纯。',
      '粉末与酸接触面积太大，反应过快，气流难以控制。',
    ],
    conclusion: '块状大理石要轻放；稀盐酸从长颈漏斗加入，并浸没漏斗下端形成液封，防止气体从漏斗口逸出。',
  },
];

function StageProgress({ stage }: { stage: Stage }) {
  const activeIndex = stages.indexOf(stage);
  return (
    <div className="grid grid-cols-5 gap-1.5" aria-label={`二氧化碳制取进度：第${activeIndex + 1}阶段，共5阶段`}>
      {stageLabels.map((label, index) => (
        <div key={label} className="min-w-0 text-center">
          <div className={`h-1.5 rounded-full ${index < activeIndex ? 'bg-emerald-400' : index === activeIndex ? 'bg-orange-400' : 'bg-slate-700'}`} />
          <div className={`mt-1 text-[9px] font-black sm:text-[10px] ${index === activeIndex ? 'text-orange-200' : index < activeIndex ? 'text-emerald-300' : 'text-slate-500'}`}>
            {index < activeIndex ? '✓ ' : ''}{label}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChoiceList({
  options,
  selected,
  answer,
  resolved,
  onSelect,
}: {
  options: string[];
  selected: number | null;
  answer: number;
  resolved: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="space-y-2.5">
      {options.map((option, index) => {
        const chosen = selected === index;
        const correct = resolved && index === answer;
        const incorrect = chosen && !resolved;
        return (
          <button
            key={option}
            type="button"
            disabled={resolved}
            onClick={() => onSelect(index)}
            className={`w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-black leading-6 transition ${
              correct
                ? 'border-emerald-300 bg-emerald-400/15 text-emerald-50'
                : incorrect
                  ? 'border-rose-300 bg-rose-400/15 text-rose-50'
                  : 'border-slate-700 bg-slate-950/70 text-slate-100 hover:border-orange-300'
            }`}
          >
            <span className="mr-2 text-xs text-slate-400">{String.fromCharCode(65 + index)}.</span>{option}
          </button>
        );
      })}
    </div>
  );
}

function TextbookApparatus() {
  return (
    <figure className="overflow-hidden rounded-3xl border border-sky-200 bg-white">
      <img
        src="/gas-labs/co2-textbook-apparatus.png"
        alt="沪科版教材图3.25：长颈漏斗、锥形瓶和集气瓶组成的二氧化碳实验室制取装置"
        className="h-auto w-full"
      />
      <figcaption className="border-t border-slate-100 px-4 py-2 text-center text-[11px] font-bold text-slate-500">
        教材图3.25：大理石＋稀盐酸制取二氧化碳
      </figcaption>
    </figure>
  );
}

function CarbonDioxideCollectionVisual() {
  const molecules = [
    [150, 210], [235, 230], [320, 205], [190, 150], [285, 140], [235, 85],
  ];
  return (
    <svg viewBox="0 0 500 300" className="h-auto w-full" role="img" aria-label="二氧化碳从集气瓶底部进入，把空气从瓶口向上排出的示意图">
      <defs>
        <linearGradient id="co2-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#431407" />
          <stop offset="55%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
      </defs>
      <rect width="500" height="300" rx="26" fill="url(#co2-bg)" />
      <path d="M110 44 H370 V266 H110 Z" fill="rgba(255,255,255,0.05)" stroke="#fdba74" strokeWidth="4" />
      <path d="M62 250 C78 250 88 250 110 250 H150 V86" fill="none" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" />
      <path d="M150 86 V58" stroke="#fb923c" strokeWidth="4" markerEnd="url(#none)" />
      {molecules.map(([x, y], index) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} opacity={0.7 + index * 0.05}>
          <circle cx="-20" cy="0" r="12" fill="#fb7185" />
          <circle cx="0" cy="0" r="10" fill="#64748b" />
          <circle cx="20" cy="0" r="12" fill="#fb7185" />
          <text x="-29" y="4" fontSize="9" fontWeight="900" fill="white">O</text>
          <text x="-4" y="4" fontSize="9" fontWeight="900" fill="white">C</text>
          <text x="16" y="4" fontSize="9" fontWeight="900" fill="white">O</text>
        </g>
      ))}
      {[145, 220, 300, 350].map((x, index) => (
        <g key={x} opacity={0.9 - index * 0.12}>
          <circle cx={x} cy={45 - index * 6} r="6" fill="#7dd3fc" />
          <path d={`M${x} ${38 - index * 6} v-24`} stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />
          <path d={`M${x - 6} ${20 - index * 6} l6-7 6 7`} fill="none" stroke="#7dd3fc" strokeWidth="3" />
        </g>
      ))}
      <text x="394" y="82" fill="#fdba74" fontSize="14" fontWeight="900">CO₂从下部进入</text>
      <text x="388" y="112" fill="#7dd3fc" fontSize="14" fontWeight="900">空气向上排出</text>
      <text x="30" y="286" fill="#94a3b8" fontSize="11" fontWeight="700">颜色仅用于区分气体；真实CO₂和空气均无色</text>
    </svg>
  );
}

export function CarbonDioxidePreparationLab({ onComplete }: { onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('plan');
  const [planStep, setPlanStep] = useState(0);
  const [planAnswer, setPlanAnswer] = useState<number | null>(null);
  const [preparationStep, setPreparationStep] = useState(0);
  const [preparationAnswer, setPreparationAnswer] = useState<number | null>(null);
  const [collectionAnswer, setCollectionAnswer] = useState<number | null>(null);
  const [verificationAnswer, setVerificationAnswer] = useState<number | null>(null);
  const [finishAnswer, setFinishAnswer] = useState<number | null>(null);

  const planQuestions: Decision[] = [
    {
      eyebrow: '定方案 1/2 · 选择药品',
      title: '目标：持续、平稳地制取一瓶二氧化碳',
      question: '选择哪一组药品最合适？',
      options: ['块状大理石＋稀盐酸', '块状大理石＋稀硫酸', '碳酸钠粉末＋稀盐酸'],
      answer: 0,
      wrongFeedback: [
        '',
        '会生成微溶的硫酸钙，覆盖在大理石表面，使反应逐渐停止。',
        '粉末接触面积太大，反应过快，不容易得到平稳气流。',
      ],
      conclusion: '块状大理石与稀盐酸反应速度适中，生成的氯化钙可溶，不会覆盖大理石表面。',
    },
    {
      eyebrow: '定方案 2/2 · 选择发生装置',
      title: '按教材基本装置完成制取',
      question: '根据三条信息，选择发生装置。',
      options: ['装置 A', '装置 B', '装置 C'],
      answer: 1,
      wrongFeedback: [
        '装置A用于固体加热。这里是固体与液体在常温下反应，不需要酒精灯。',
        '',
        '装置C也能制气并可控制滴速，但本任务指定复现教材的长颈漏斗基本装置。',
      ],
      conclusion: '装置B符合固液常温型；长颈漏斗下端浸入液面后形成液封，气体只能沿导管导出。',
    },
  ];
  const plan = planQuestions[planStep];
  const planResolved = planAnswer === plan.answer;
  const preparation = preparationDecisions[preparationStep];
  const preparationResolved = preparationAnswer === preparation.answer;
  const collectionResolved = collectionAnswer === 1;
  const verificationResolved = verificationAnswer === 0;
  const finishResolved = finishAnswer === 1;

  const nextPlan = () => {
    if (!planResolved) return;
    if (planStep === 0) {
      setPlanStep(1);
      setPlanAnswer(null);
      return;
    }
    setStage('prepare');
  };

  const nextPreparation = () => {
    if (!preparationResolved) return;
    if (preparationStep < preparationDecisions.length - 1) {
      setPreparationStep((value) => value + 1);
      setPreparationAnswer(null);
      return;
    }
    setStage('collect');
  };

  if (stage === 'plan') {
    return (
      <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="co2-plan-title">
        <div className="mx-auto max-w-5xl">
          <div className="pr-12">
            <div className="text-[11px] font-black tracking-[0.18em] text-orange-300">实验方案与操作决策型 · 第1/5阶段 · {plan.eyebrow}</div>
            <h2 id="co2-plan-title" className="mt-1 text-xl font-black sm:text-2xl">二氧化碳的实验室制取</h2>
          </div>
          <div className="mt-4"><StageProgress stage={stage} /></div>

          <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)]">
            <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
              <div className="text-[11px] font-black tracking-widest text-orange-300">{plan.eyebrow}</div>
              <h3 className="mt-2 text-lg font-black">{plan.title}</h3>

              {planStep === 1 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    ['反应物状态', '固体＋液体'],
                    ['反应条件', '常温、不加热'],
                    ['操作目标', '长颈漏斗液封＋导气'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-center">
                      <div className="text-[9px] font-black tracking-widest text-slate-400">{label}</div>
                      <div className="mt-1 text-xs font-black text-white sm:text-sm">{value}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 rounded-2xl border border-orange-300/30 bg-orange-400/10 px-4 py-3 text-sm font-black text-orange-50">{plan.question}</div>

              {planStep === 1 && (
                <img
                  src="/oxygen/generation-apparatus-abc.png"
                  alt="三套发生装置：A为固体加热，B为长颈漏斗固液常温，C为分液漏斗固液常温"
                  className="mt-4 w-full rounded-2xl bg-white p-3"
                />
              )}

              <div className="mt-4">
                <ChoiceList options={plan.options} selected={planAnswer} answer={plan.answer} resolved={planResolved} onSelect={setPlanAnswer} />
              </div>

              {planAnswer !== null && !planResolved && (
                <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-400/10 p-4 text-sm font-semibold leading-6 text-rose-100" aria-live="polite">
                  {plan.wrongFeedback[planAnswer]}
                </div>
              )}
              {planResolved && (
                <div className="mt-4 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4 text-sm font-semibold leading-6 text-emerald-50" aria-live="polite">
                  {plan.conclusion}
                </div>
              )}
            </div>

            {planStep === 0 ? (
              <div className="rounded-3xl border border-orange-300/25 bg-gradient-to-br from-orange-500/15 to-indigo-500/10 p-5">
                <div className="text-xs font-black tracking-widest text-orange-200">先选药品，再选装置</div>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">药品决定反应能不能持续、气流是否平稳；装置必须等反应条件确定后再选。</p>
                <div className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-center text-base font-black">CaCO₃＋HCl → ?</div>
              </div>
            ) : (
              <TextbookApparatus />
            )}
          </div>

          {planResolved && (
            <button type="button" onClick={nextPlan} className="mt-5 w-full rounded-2xl bg-orange-400 px-5 py-4 text-base font-black text-orange-950 transition hover:bg-orange-300">
              {planStep === 0 ? '药品选定，继续选择发生装置 →' : '方案确定，开始连接与装药 →'}
            </button>
          )}
        </div>
      </section>
    );
  }

  if (stage === 'prepare') {
    return (
      <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="co2-prepare-title">
        <div className="mx-auto max-w-5xl">
          <div className="pr-12">
            <div className="text-[11px] font-black tracking-[0.18em] text-orange-300">实验方案与操作决策型 · 第2/5阶段 · {preparation.eyebrow}</div>
            <h2 id="co2-prepare-title" className="mt-1 text-xl font-black sm:text-2xl">连接装置 → 检查气密性 → 装入药品</h2>
          </div>
          <div className="mt-4"><StageProgress stage={stage} /></div>

          <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)]">
            <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
              <div className="text-[11px] font-black tracking-widest text-orange-300">{preparation.eyebrow}</div>
              <h3 className="mt-2 text-lg font-black">{preparation.title}</h3>
              <div className="mt-3 rounded-2xl border border-orange-300/30 bg-orange-400/10 px-4 py-3 text-sm font-black leading-6 text-orange-50">{preparation.question}</div>
              <div className="mt-4">
                <ChoiceList options={preparation.options} selected={preparationAnswer} answer={preparation.answer} resolved={preparationResolved} onSelect={setPreparationAnswer} />
              </div>
              {preparationAnswer !== null && !preparationResolved && (
                <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-400/10 p-4 text-sm font-semibold leading-6 text-rose-100" aria-live="polite">
                  {preparation.wrongFeedback[preparationAnswer]}
                </div>
              )}
              {preparationResolved && (
                <div className="mt-4 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4 text-sm font-semibold leading-6 text-emerald-50" aria-live="polite">
                  {preparation.conclusion}
                </div>
              )}
            </div>
            <TextbookApparatus />
          </div>

          {preparationResolved && (
            <button type="button" onClick={nextPreparation} className="mt-5 w-full rounded-2xl bg-orange-400 px-5 py-4 text-base font-black text-orange-950 transition hover:bg-orange-300">
              {preparationStep === preparationDecisions.length - 1 ? '准备完成，选择收集方法 →' : '继续下一项准备 →'}
            </button>
          )}
        </div>
      </section>
    );
  }

  if (stage === 'collect') {
    const options = ['排水法', '向上排空气法', '向下排空气法'];
    return (
      <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="co2-collect-title">
        <div className="mx-auto max-w-5xl">
          <div className="pr-12">
            <div className="text-[11px] font-black tracking-[0.18em] text-orange-300">实验方案与操作决策型 · 第3/5阶段</div>
            <h2 id="co2-collect-title" className="mt-1 text-xl font-black sm:text-2xl">二氧化碳已经产生：选择收集方法</h2>
          </div>
          <div className="mt-4"><StageProgress stage={stage} /></div>
          <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-slate-950 p-4"><div className="text-[10px] font-black text-slate-400">与水的关系</div><div className="mt-1 text-sm font-black">能溶于水，并与水反应</div></div>
                <div className="rounded-2xl bg-slate-950 p-4"><div className="text-[10px] font-black text-slate-400">与空气比较</div><div className="mt-1 text-sm font-black">密度比空气大</div></div>
              </div>
              <div className="mt-4 rounded-2xl border border-orange-300/30 bg-orange-400/10 px-4 py-3 text-sm font-black text-orange-50">根据这两条性质，选择收集方法。</div>
              <div className="mt-4"><ChoiceList options={options} selected={collectionAnswer} answer={1} resolved={collectionResolved} onSelect={setCollectionAnswer} /></div>
              {collectionAnswer !== null && !collectionResolved && (
                <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-400/10 p-4 text-sm font-semibold leading-6 text-rose-100" aria-live="polite">
                  {collectionAnswer === 0 ? '二氧化碳能溶于水并与水反应，不能按本实验的基本要求用排水法收集。' : '密度比空气大的气体应从集气瓶下部进入，把空气向上排出。'}
                </div>
              )}
              {collectionResolved && (
                <div className="mt-4 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4 text-sm font-semibold leading-6 text-emerald-50" aria-live="polite">选择正确：向上排空气法。CO₂从下部进入，原有空气从瓶口向上排出。</div>
              )}
            </div>
            {collectionResolved ? <CarbonDioxideCollectionVisual /> : (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-slate-700 bg-slate-900 px-6 text-center">
                <div className="text-4xl">?</div><div className="mt-3 text-base font-black">先依据性质作出选择</div><p className="mt-2 text-sm font-semibold text-slate-400">收集图在判断正确后出现，避免提前给出气流方向。</p>
              </div>
            )}
          </div>
          {collectionResolved && <button type="button" onClick={() => setStage('verify')} className="mt-5 w-full rounded-2xl bg-orange-400 px-5 py-4 text-base font-black text-orange-950 transition hover:bg-orange-300">收集方法确定，进入检验与验满 →</button>}
        </div>
      </section>
    );
  }

  if (stage === 'verify') {
    const options = [
      '检验：通入澄清石灰水；验满：燃着的木条放在集气瓶口',
      '检验：带火星木条伸入瓶内；验满：带火星木条放在瓶口',
      '检验和验满都把燃着的木条伸入集气瓶内部',
    ];
    return (
      <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="co2-verify-title">
        <div className="mx-auto max-w-4xl">
          <div className="pr-12">
            <div className="text-[11px] font-black tracking-[0.18em] text-orange-300">实验方案与操作决策型 · 第4/5阶段</div>
            <h2 id="co2-verify-title" className="mt-1 text-xl font-black sm:text-2xl">分清“检验”和“验满”</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">检验回答“是不是CO₂”；验满回答“瓶口处有没有CO₂”。</p>
          </div>
          <div className="mt-4"><StageProgress stage={stage} /></div>
          <div className="mt-4 rounded-3xl border border-slate-700 bg-slate-900 p-5">
            <ChoiceList options={options} selected={verificationAnswer} answer={0} resolved={verificationResolved} onSelect={setVerificationAnswer} />
            {verificationAnswer !== null && !verificationResolved && (
              <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-400/10 p-4 text-sm font-semibold leading-6 text-rose-100" aria-live="polite">
                {verificationAnswer === 1 ? '带火星木条用于检验氧气，不是二氧化碳。' : '木条熄灭只能说明气体不支持燃烧，不能唯一证明它是CO₂；检验CO₂要看澄清石灰水是否变浑浊。'}
              </div>
            )}
            {verificationResolved && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2" aria-live="polite">
                <div className="rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4"><div className="text-xs font-black text-emerald-200">检验</div><div className="mt-1 text-sm font-black">澄清石灰水变浑浊</div><p className="mt-2 text-xs font-semibold leading-5 text-emerald-50">生成碳酸钙白色沉淀，证明气体是CO₂。</p></div>
                <div className="rounded-2xl border border-orange-300/40 bg-orange-400/10 p-4"><div className="text-xs font-black text-orange-200">验满</div><div className="mt-1 text-sm font-black">燃着木条放在瓶口并熄灭</div><p className="mt-2 text-xs font-semibold leading-5 text-orange-50">瓶口已有不支持燃烧的CO₂，说明已满。</p></div>
              </div>
            )}
          </div>
          {verificationResolved && <button type="button" onClick={() => setStage('finish')} className="mt-5 w-full rounded-2xl bg-orange-400 px-5 py-4 text-base font-black text-orange-950 transition hover:bg-orange-300">确认气体，完成安全收尾 →</button>}
        </div>
      </section>
    );
  }

  const finishOptions = [
    '集满后立即拔开锥形瓶橡皮塞，把剩余酸液倒入水槽',
    '导管移出集气瓶，用毛玻璃片盖好；待反应停止后再拆洗并按要求处理药品',
    '继续通气直到大理石和盐酸全部耗尽，再敞口放在桌面上',
  ];
  return (
    <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="co2-finish-title">
      <div className="mx-auto max-w-4xl">
        <div className="pr-12">
          <div className="text-[11px] font-black tracking-[0.18em] text-emerald-300">实验方案与操作决策型 · 第5/5阶段</div>
          <h2 id="co2-finish-title" className="mt-1 text-xl font-black sm:text-2xl">最后一步：保存气体并整理装置</h2>
        </div>
        <div className="mt-4"><StageProgress stage={stage} /></div>
        <div className="mt-4 rounded-3xl border border-slate-700 bg-slate-900 p-5">
          <ChoiceList options={finishOptions} selected={finishAnswer} answer={1} resolved={finishResolved} onSelect={setFinishAnswer} />
          {finishAnswer !== null && !finishResolved && (
            <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-400/10 p-4 text-sm font-semibold leading-6 text-rose-100" aria-live="polite">反应仍在进行时不能强行拆开，也不能把实验废液随意倒入水槽。先保护已经收集的气体，再等待反应结束。</div>
          )}
          {finishResolved && (
            <div className="mt-4 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4 text-sm font-semibold leading-6 text-emerald-50" aria-live="polite">顺序正确：移出导管 → 毛玻璃片盖好集气瓶 → 反应停止后拆洗 → 剩余药品按实验室要求处理。</div>
          )}
        </div>
        {finishResolved && <button type="button" onClick={onComplete} className="mt-5 w-full rounded-2xl bg-emerald-400 px-5 py-4 text-base font-black text-emerald-950 transition hover:bg-emerald-300">五阶段决策完成，整理完整知识 →</button>}
      </div>
    </section>
  );
}
