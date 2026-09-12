import { useEffect, useMemo, useRef, useState } from 'react';

type Stage = 'predict' | 'process' | 'classify' | 'experiment' | 'chain' | 'boundary' | 'summary';
type ChangeKey = 'melting' | 'vaporizing' | 'burning';
type ChangeKind = 'physical' | 'chemical' | 'pending';
type FinalChangeKind = Exclude<ChangeKind, 'pending'>;
type ExperimentKey = 'water' | 'carbonDioxide';
type ChainKey = 'water' | 'carbonDioxide';

interface CandleInquiryLabProps {
  onComplete?: () => void;
}

const stageOrder: Stage[] = ['predict', 'process', 'classify', 'experiment', 'chain', 'boundary', 'summary'];
const stageNames: Record<Stage, string> = {
  predict: '预测',
  process: '操作观察',
  classify: '初步分类',
  experiment: '寻找生成物证据',
  chain: '整理证据',
  boundary: '边界迁移',
  summary: '结论',
};

const processSteps = [
  {
    title: '蜡面受热',
    note: '靠近烛芯的固态石蜡先形成液态蜡池。',
  },
  {
    title: '液体沿烛芯上升',
    note: '液态石蜡进入烛芯细小孔隙，在毛细作用下沿烛芯向上输送。',
  },
  {
    title: '烛芯上端继续受热',
    note: '液态石蜡在高温处汽化，形成肉眼不易直接看见的石蜡蒸气。',
  },
  {
    title: '火焰区持续燃烧',
    note: '石蜡蒸气与空气混合，在火焰区发生燃烧。',
  },
];

const changeTasks: Array<{
  key: ChangeKey;
  title: string;
  prompt: string;
  answer: ChangeKind;
  kinds: ChangeKind[];
  reasons: string[];
  reasonAnswer: number;
}> = [
  {
    key: 'melting',
    title: '固态石蜡熔化',
    prompt: '固态变成液态',
    answer: 'physical',
    kinds: ['physical', 'chemical'],
    reasons: ['只有状态改变，仍是石蜡', '出现液体，所以生成了新物质', '只要吸热就是化学变化'],
    reasonAnswer: 0,
  },
  {
    key: 'vaporizing',
    title: '液态石蜡汽化',
    prompt: '液态变成气态',
    answer: 'physical',
    kinds: ['physical', 'chemical'],
    reasons: ['看不见就说明物质消失了', '只有状态改变，仍是石蜡', '气体一定是新物质'],
    reasonAnswer: 1,
  },
  {
    key: 'burning',
    title: '石蜡蒸气燃烧',
    prompt: '目前只观察到发光、放热',
    answer: 'pending',
    kinds: ['physical', 'chemical', 'pending'],
    reasons: ['火焰很亮，所以一定是化学变化', '仅凭发光、放热还不够，需要检验是否生成新物质', '正在燃烧，所以一定只是状态改变'],
    reasonAnswer: 1,
  },
];

const experimentTasks: Record<ExperimentKey, {
  eyebrow: string;
  title: string;
  options: string[];
  answer: number;
  wrongFeedback: string[];
  interpretationTitle: string;
  interpretationOptions: string[];
  interpretationAnswer: number;
  interpretationWrongFeedback: string[];
  interpretationSuccess: string;
}> = {
  water: {
    eyebrow: '任务 1 · 收集火焰上方的可凝结物',
    title: '怎样收集实验后可能新出现的物质，同时减少器材原有水分的干扰？',
    options: [
      '把干燥、洁净的烧杯短暂罩在火焰上方，观察内壁',
      '先在烧杯内喷一层水，再罩住蜡烛',
      '把烧杯放在蜡烛旁边，只比较火焰颜色',
    ],
    answer: 0,
    wrongFeedback: [
      '',
      '器材内原有的水会干扰判断，无法说明水是实验后新出现的。',
      '火焰颜色不能说明生成了哪种物质，需要让燃烧后的物质接触合适的收集界面。',
    ],
    interpretationTitle: '原本干燥的烧杯内壁出现无色液滴，这个现象目前能支持什么？',
    interpretationOptions: [
      '液滴只能是熔化后飞上来的石蜡，因此与燃烧无关',
      '在器材原本干燥的条件下，液滴进一步支持有水生成；若要更强确认，还可补充水的特征检验',
      '只要看到液滴，就已经证明所有燃烧生成物都只有水',
    ],
    interpretationAnswer: 1,
    interpretationWrongFeedback: [
      '先比较实验前后：液滴出现在火焰上方的干燥内壁，不能不加分析地归因于熔化石蜡。',
      '',
      '一个现象只能支持对应物质存在，不能穷尽全部生成物。',
    ],
    interpretationSuccess: '在器材原本干燥、实验后出现液滴的条件下，这一现象进一步支持有水生成；它不是对全部生成物的穷尽证明。',
  },
  carbonDioxide: {
    eyebrow: '任务 2 · 收集燃烧后的气体',
    title: '怎样让燃烧后的气体充分接触一种能产生明显现象的检验试剂？',
    options: [
      '仍用干燥烧杯罩住火焰，只看内壁是否起雾',
      '用漏斗收集燃烧气体，借助抽气装置使其经导管通入澄清石灰水',
      '把燃着的木条放到火焰旁，观察是否熄灭',
    ],
    answer: 1,
    wrongFeedback: [
      '这个操作只能收集可凝结物，没有让其余燃烧气体进入检验试剂。',
      '',
      '燃烧气体可能是混合物，木条现象不能在这里说明具体出现了哪种生成物。',
    ],
    interpretationTitle: '澄清石灰水变浑浊，这个现象目前能支持什么？',
    interpretationOptions: [
      '支持燃烧气体中有二氧化碳，但不能说明全部气体都是二氧化碳',
      '证明全部燃烧生成物只有二氧化碳',
      '支持燃烧气体中产生了氧气',
    ],
    interpretationAnswer: 0,
    interpretationWrongFeedback: [
      '',
      '石灰水的现象只支持相应物质存在，不能排除其他生成物。',
      '澄清石灰水变浑浊不是检验氧气的现象。',
    ],
    interpretationSuccess: '澄清石灰水变浑浊，支持燃烧气体中有二氧化碳；它不表示全部生成物只有二氧化碳。',
  },
};

const chainSlots = [
  {
    label: '操作',
    options: [
      { value: 'dryBeaker', label: '干燥烧杯短暂罩在火焰上方' },
      { value: 'limewater', label: '收集燃烧气体并使其通过澄清石灰水' },
      { value: 'watchFlame', label: '只观察火焰亮度' },
    ],
  },
  {
    label: '现象',
    options: [
      { value: 'droplets', label: '原本干燥的内壁出现无色液滴' },
      { value: 'turbid', label: '澄清石灰水变浑浊' },
      { value: 'brighter', label: '火焰变亮' },
    ],
  },
  {
    label: '现象支持的物质',
    options: [
      { value: 'water', label: '水' },
      { value: 'co2', label: '二氧化碳' },
      { value: 'oxygen', label: '氧气' },
    ],
  },
  {
    label: '元素推断',
    options: [
      { value: 'hydrogen', label: '燃烧物中含氢元素' },
      { value: 'carbon', label: '燃烧物中含碳元素' },
      { value: 'oxygen', label: '燃烧物一定含氧元素' },
    ],
  },
];

const chainAnswers: Record<ChainKey, string[]> = {
  water: ['dryBeaker', 'droplets', 'water', 'hydrogen'],
  carbonDioxide: ['limewater', 'turbid', 'co2', 'carbon'],
};

const boundaryQuestions = [
  {
    stem: '检出水和二氧化碳，能否证明普通石蜡“只含碳、氢元素”？',
    options: ['能，两个生成物已经足够', '不能，只能支持含碳、氢，不能排除其他元素', '能，还能确定石蜡的唯一化学式'],
    answer: 1,
    wrong: '现有证据只说明哪些元素“存在”，还没有完成排他性证明。',
  },
  {
    stem: '生成物中有氧元素，能否据此推出石蜡一定含氧元素？',
    options: ['能，生成物中的元素都只能来自石蜡', '不能，生成物中的氧还可能来自空气中的氧气', '能，因为火焰外焰温度高'],
    answer: 1,
    wrong: '先检查反应体系：生成物中的元素可能来自不止一种反应物。',
  },
  {
    stem: '研究一支有香味、有颜色的实际蜡烛时，哪种表述最严谨？',
    options: ['整支蜡烛都可无条件看作纯石蜡', '只研究火焰，不必区分样品来源', '区分石蜡、烛芯和香料/色素等添加物，再限定结论对象'],
    answer: 2,
    wrong: '实际燃烧体系可能含多个物质来源，结论必须先说明研究对象。',
  },
];

function CandleProcessVisual({ step }: { step: number }) {
  const focusAreas = [
    { left: '42.5%', top: '39%', width: '15%', height: '10%' },
    { left: '48.5%', top: '31%', width: '3%', height: '17%' },
    { left: '45%', top: '25%', width: '10%', height: '12%' },
    { left: '44.5%', top: '13%', width: '11%', height: '26%' },
  ];

  return (
    <figure
      className="overflow-hidden rounded-2xl border border-amber-200 bg-[#f7f0e4]"
      role="img"
      aria-label={`正在燃烧的普通白色石蜡蜡烛，当前观察区域：${processSteps[step].title}`}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src="/candle-inquiry/wax-path-observation.jpg"
          alt=""
          draggable={false}
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className={`absolute rounded-full border-[3px] shadow-[0_0_0_6px_rgba(251,191,36,0.16),0_0_24px_rgba(251,191,36,0.5)] transition-all duration-500 ${
              step === 2 ? 'border-dashed border-cyan-500' : 'border-amber-500'
            }`}
            style={focusAreas[step]}
          >
            <span className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-amber-300 shadow-lg">
              {step + 1}
            </span>
          </div>
        </div>
      </div>
      <figcaption className="border-t border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-950/75">
        观察标记只指出本步要追踪的区域；气相石蜡本身肉眼不易直接看见，不能把它画成一团“烟”。
      </figcaption>
    </figure>
  );
}

function Feedback({ kind, children }: { kind: 'neutral' | 'success' | 'error'; children: React.ReactNode }) {
  const styles = {
    neutral: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100',
    success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
    error: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
  };
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={`rounded-xl border px-4 py-3 text-sm leading-6 ${styles[kind]}`}
    >
      {children}
    </div>
  );
}

export function CandleInquiryLab({ onComplete }: CandleInquiryLabProps) {
  const [stage, setStage] = useState<Stage>('predict');
  const [prediction, setPrediction] = useState<number | null>(null);
  const [predictionSubmitted, setPredictionSubmitted] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [visitedProcess, setVisitedProcess] = useState<boolean[]>([true, false, false, false]);
  const [processChoice, setProcessChoice] = useState<number | null>(null);
  const [processSolved, setProcessSolved] = useState(false);
  const [processTried, setProcessTried] = useState(false);
  const [changeKinds, setChangeKinds] = useState<Partial<Record<ChangeKey, ChangeKind>>>({});
  const [changeReasons, setChangeReasons] = useState<Partial<Record<ChangeKey, number>>>({});
  const [classifyTried, setClassifyTried] = useState(false);
  const [classifySolved, setClassifySolved] = useState(false);
  const [activeExperiment, setActiveExperiment] = useState<ExperimentKey>('water');
  const [experimentChoices, setExperimentChoices] = useState<Partial<Record<ExperimentKey, number>>>({});
  const [experimentOperated, setExperimentOperated] = useState<Partial<Record<ExperimentKey, boolean>>>({});
  const [experimentInterpretations, setExperimentInterpretations] = useState<Partial<Record<ExperimentKey, number>>>({});
  const [experimentSolved, setExperimentSolved] = useState<Partial<Record<ExperimentKey, boolean>>>({});
  const [experimentFeedback, setExperimentFeedback] = useState<Partial<Record<ExperimentKey, string>>>({});
  const [interpretationFeedback, setInterpretationFeedback] = useState<Partial<Record<ExperimentKey, string>>>({});
  const [chains, setChains] = useState<Record<ChainKey, string[]>>({
    water: ['', '', '', ''],
    carbonDioxide: ['', '', '', ''],
  });
  const [chainTried, setChainTried] = useState(false);
  const [chainSolved, setChainSolved] = useState(false);
  const [burningFinalKind, setBurningFinalKind] = useState<FinalChangeKind | null>(null);
  const [burningFinalReason, setBurningFinalReason] = useState<number | null>(null);
  const [boundaryAnswers, setBoundaryAnswers] = useState<Array<number | null>>([null, null, null]);
  const [boundaryTried, setBoundaryTried] = useState(false);
  const [reportedComplete, setReportedComplete] = useState(false);
  const processFeedbackRef = useRef<HTMLDivElement>(null);

  const stageIndex = stageOrder.indexOf(stage);
  const allProcessVisited = visitedProcess.every(Boolean);
  const experimentsComplete = Boolean(experimentSolved.water && experimentSolved.carbonDioxide);
  const boundaryCorrect = boundaryQuestions.map((question, index) => boundaryAnswers[index] === question.answer);

  const progressText = useMemo(() => `${stageIndex + 1}/${stageOrder.length}`, [stageIndex]);

  useEffect(() => {
    if (!processTried && !processSolved) return;
    const frame = window.requestAnimationFrame(() => {
      processFeedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [processSolved, processTried]);

  const goTo = (next: Stage) => {
    setStage(next);
  };

  const visitProcessStep = (next: number) => {
    setProcessStep(next);
    setVisitedProcess((current) => current.map((visited, index) => visited || index === next));
  };

  const submitProcessReasoning = () => {
    setProcessTried(true);
    if (processChoice === 1) setProcessSolved(true);
  };

  const submitClassifications = () => {
    setClassifyTried(true);
    const solved = changeTasks.every((task) =>
      changeKinds[task.key] === task.answer && changeReasons[task.key] === task.reasonAnswer,
    );
    setClassifySolved(solved);
  };

  const chooseExperiment = (index: number) => {
    const task = experimentTasks[activeExperiment];
    setExperimentChoices((current) => ({ ...current, [activeExperiment]: index }));
    if (index === task.answer) {
      setExperimentOperated((current) => ({ ...current, [activeExperiment]: true }));
      setExperimentFeedback((current) => ({ ...current, [activeExperiment]: '' }));
      return;
    }
    setExperimentFeedback((current) => ({ ...current, [activeExperiment]: task.wrongFeedback[index] }));
  };

  const chooseInterpretation = (index: number) => {
    const task = experimentTasks[activeExperiment];
    setExperimentInterpretations((current) => ({ ...current, [activeExperiment]: index }));
    if (index === task.interpretationAnswer) {
      setExperimentSolved((current) => ({ ...current, [activeExperiment]: true }));
      setInterpretationFeedback((current) => ({ ...current, [activeExperiment]: '' }));
      return;
    }
    setInterpretationFeedback((current) => ({
      ...current,
      [activeExperiment]: task.interpretationWrongFeedback[index],
    }));
  };

  const submitChains = () => {
    setChainTried(true);
    const chainsCorrect = (Object.keys(chainAnswers) as ChainKey[]).every((chainKey) =>
      chainAnswers[chainKey].every((answer, index) => chains[chainKey][index] === answer),
    );
    const solved = chainsCorrect && burningFinalKind === 'chemical' && burningFinalReason === 0;
    setChainSolved(solved);
  };

  const submitBoundaries = () => {
    setBoundaryTried(true);
  };

  const finishInquiry = () => {
    if (!boundaryCorrect.every(Boolean)) return;
    goTo('summary');
  };

  const completeInquiry = () => {
    if (reportedComplete) return;
    setReportedComplete(true);
    onComplete?.();
  };

  const reset = () => {
    setStage('predict');
    setPrediction(null);
    setPredictionSubmitted(false);
    setProcessStep(0);
    setVisitedProcess([true, false, false, false]);
    setProcessChoice(null);
    setProcessSolved(false);
    setProcessTried(false);
    setChangeKinds({});
    setChangeReasons({});
    setClassifyTried(false);
    setClassifySolved(false);
    setActiveExperiment('water');
    setExperimentChoices({});
    setExperimentOperated({});
    setExperimentInterpretations({});
    setExperimentSolved({});
    setExperimentFeedback({});
    setInterpretationFeedback({});
    setChains({ water: ['', '', '', ''], carbonDioxide: ['', '', '', ''] });
    setChainTried(false);
    setChainSolved(false);
    setBurningFinalKind(null);
    setBurningFinalReason(null);
    setBoundaryAnswers([null, null, null]);
    setBoundaryTried(false);
    setReportedComplete(false);
  };

  return (
    <div className="min-w-0 bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-700/70 bg-slate-950/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-2 pr-10 sm:gap-3">
          {stageIndex > 0 && (
            <button
              type="button"
              onClick={() => goTo(stageOrder[stageIndex - 1])}
              className="shrink-0 rounded-full border border-slate-700 px-3 py-2 text-xs font-black text-slate-300 hover:border-cyan-400 hover:text-cyan-200"
            >
              ← <span className="hidden sm:inline">上一步</span>
            </button>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold tracking-[0.16em] text-amber-400">蜡烛探究实验 · {progressText}</div>
            <div className="mt-1 flex gap-1" aria-label={`当前阶段：${stageNames[stage]}`}>
              {stageOrder.map((item, index) => (
                <span
                  key={item}
                  className={`h-1.5 flex-1 rounded-full ${index <= stageIndex ? 'bg-amber-400' : 'bg-slate-700'}`}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 rounded-full border border-slate-600 px-3 py-2 text-xs font-bold text-slate-300 hover:border-amber-400 hover:text-amber-200"
          >
            重开
          </button>
        </div>
      </header>

      <main className="mx-auto min-h-[620px] max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
        {stage === 'predict' && (
          <section className="mx-auto max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
              第一步不是背结论，而是先留下可检验的预测
            </div>
            <h2 className="text-2xl font-black leading-tight text-white sm:text-4xl">
              怎样通过实验现象和证据，探究蜡烛的成分以及燃烧过程中发生的变化？
            </h2>
            <div className="mt-6 rounded-2xl border border-cyan-500/30 bg-slate-900 p-4 sm:p-6">
              <p className="text-lg font-bold text-cyan-100">先判断：火焰附近真正主要燃烧的物质，可能是哪一种状态？</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {['固态石蜡本体', '液态石蜡蜡池', '石蜡受热后形成的气相物质'].map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    disabled={predictionSubmitted}
                    aria-pressed={prediction === index}
                    onClick={() => setPrediction(index)}
                    className={`min-h-20 rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                      prediction === index
                        ? 'border-cyan-400 bg-cyan-500/15 text-cyan-100'
                        : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-cyan-500/60'
                    } disabled:cursor-default`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {!predictionSubmitted ? (
                <button
                  type="button"
                  disabled={prediction === null}
                  onClick={() => setPredictionSubmitted(true)}
                  className="mt-4 w-full rounded-xl bg-cyan-600 px-4 py-3 font-bold text-white hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500"
                >
                  记录预测，暂不揭晓
                </button>
              ) : (
                <div className="mt-4 space-y-3">
                  <Feedback kind="neutral">预测已记录。现在先操作和观察，再回头判断；这里不提前判定你的预测。</Feedback>
                  <button type="button" onClick={() => goTo('process')} className="w-full rounded-xl bg-amber-500 px-4 py-3 font-black text-slate-950 hover:bg-amber-400">
                    开始操作蜡烛 →
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {stage === 'process' && (
          <section>
            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,.75fr)]">
              <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-3 sm:p-5">
                <div className="mb-3">
                  <div className="text-xs font-bold tracking-widest text-amber-400">操作观察</div>
                  <h2 className="mt-1 text-xl font-black sm:text-2xl">拖动加热进程，追踪石蜡怎样到达火焰</h2>
                </div>
                <CandleProcessVisual step={processStep} />
                <label className="mt-4 block text-sm font-bold text-slate-200" htmlFor="candle-process">
                  当前：{processSteps[processStep].title}
                </label>
                <input
                  id="candle-process"
                  type="range"
                  min="0"
                  max="3"
                  step="1"
                  value={processStep}
                  onChange={(event) => visitProcessStep(Number(event.target.value))}
                  className="mt-3 w-full accent-amber-400"
                />
                <div className="mt-3 grid grid-cols-4 gap-1.5">
                  {processSteps.map((item, index) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => visitProcessStep(index)}
                      className={`rounded-lg border px-1 py-2 text-[10px] font-bold sm:text-xs ${
                        processStep === index
                          ? 'border-amber-400 bg-amber-500/15 text-amber-200'
                          : visitedProcess[index]
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                            : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {visitedProcess[index] ? '✓ ' : ''}{index + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                  <div className="text-xs font-bold text-cyan-400">本步观察</div>
                  <h3 className="mt-1 text-lg font-black">{processSteps[processStep].title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{processSteps[processStep].note}</p>
                </div>
                {!allProcessVisited ? (
                  <Feedback kind="neutral">还需拖到其余阶段。连续过程不能只看火焰最后一帧。</Feedback>
                ) : (
                  <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
                    <div className="text-xs font-bold text-violet-300">吹灭后的追踪实验</div>
                    <figure className="mt-3 overflow-hidden rounded-xl border border-violet-300/30 bg-[#f7f0e4]">
                      <img
                        src="/candle-inquiry/white-smoke-relight.jpg"
                        alt="刚熄灭的白色蜡烛上方出现细窄白烟，一根燃着的火柴靠近白烟上部但没有接触烛芯"
                        loading="lazy"
                        className="aspect-video w-full object-cover"
                      />
                      <figcaption className="border-t border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold leading-5 text-violet-950/75">
                        只记录可见操作与现象，先不要把白烟直接命名成某种气体。
                      </figcaption>
                    </figure>
                    <p className="mt-2 text-sm font-bold leading-6 text-white">
                      刚吹灭时，把火柴火焰靠近上升的白烟，火焰可沿白烟方向回到烛芯并重新点燃。这个现象最支持哪种解释？
                    </p>
                    <div className="mt-3 space-y-2">
                      {[
                        '白烟本身就是纯净的石蜡蒸气，所以看见白烟就等于看见气体',
                        '石蜡先形成可燃气相并在火焰区燃烧；可见白烟主要是未燃烧的石蜡蒸气冷却后形成的微小石蜡颗粒',
                        '固态蜡块直接越过烛芯进入火焰，没有状态变化',
                      ].map((option, index) => (
                        <button
                          key={option}
                          type="button"
                          disabled={processSolved}
                          onClick={() => { setProcessChoice(index); setProcessTried(false); }}
                          className={`w-full rounded-xl border px-3 py-3 text-left text-sm font-bold leading-5 ${
                            processChoice === index
                              ? 'border-violet-400 bg-violet-500/15 text-violet-100'
                              : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-violet-500/60'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {!processSolved && (
                      <button
                        type="button"
                        disabled={processChoice === null}
                        onClick={submitProcessReasoning}
                        className="mt-3 w-full rounded-xl bg-violet-600 px-4 py-3 font-bold text-white hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500"
                      >
                        提交解释
                      </button>
                    )}
                  </div>
                )}
                {processTried && !processSolved && (
                  <div ref={processFeedbackRef}>
                    <Feedback kind="error">这个解释没有同时处理“可燃物怎样到达火焰”和“白烟究竟是什么”。请根据连续过程再选。</Feedback>
                  </div>
                )}
                {processSolved && (
                  <div ref={processFeedbackRef} className="space-y-3">
                    <Feedback kind="success">
                      证据支持：真正主要燃烧的是石蜡蒸气。可见白烟主要由未燃烧的石蜡蒸气冷却后形成的微小石蜡颗粒构成，可混有少量炭黑等颗粒；它不是石蜡蒸气本身。颗粒的具体相态会随温度和蜡的组成变化，本实验不把白烟简单等同于某一种纯物质或单一相态。
                    </Feedback>
                    <div className="rounded-xl border border-amber-500/30 bg-slate-900 p-4 text-sm leading-6 text-slate-300">
                      黄色明亮区主要由炽热炭黑发光；外焰附近与空气接触通常更充分、燃烧更充分，温度也通常更高。火焰亮度不能单独作为变化分类依据。
                    </div>
                    <button type="button" onClick={() => goTo('classify')} className="w-full rounded-xl bg-amber-500 px-4 py-3 font-black text-slate-950 hover:bg-amber-400">
                      给三种变化分类 →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {stage === 'classify' && (
          <section>
            <div className="max-w-3xl">
              <div className="text-xs font-bold tracking-widest text-cyan-400">初步分类</div>
              <h2 className="mt-1 text-2xl font-black">能判断的先判断，证据不足的先留下待证问题</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">发光、放热、看得见或看不见都不是判断依据；如果还不知道是否生成新物质，就不能抢先给燃烧定性。</p>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {changeTasks.map((task) => (
                <article key={task.key} className="min-w-0 rounded-2xl border border-slate-700 bg-slate-900 p-4">
                  <div className="text-xs font-bold text-slate-500">{task.prompt}</div>
                  <h3 className="mt-1 text-lg font-black">{task.title}</h3>
                  <div className={`mt-4 grid gap-2 ${task.kinds.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    {task.kinds.map((kind) => (
                      <button
                        key={kind}
                        type="button"
                        disabled={classifySolved}
                        onClick={() => { setChangeKinds((current) => ({ ...current, [task.key]: kind })); setClassifyTried(false); }}
                        className={`rounded-xl border px-2 py-3 text-sm font-bold ${
                          changeKinds[task.key] === kind
                            ? 'border-cyan-400 bg-cyan-500/15 text-cyan-100'
                            : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-cyan-500/50'
                        }`}
                      >
                        {kind === 'physical' ? '物理变化' : kind === 'chemical' ? '化学变化' : '证据不足'}
                      </button>
                    ))}
                  </div>
                  <label className="mt-4 block text-xs font-bold text-slate-400" htmlFor={`reason-${task.key}`}>判断依据</label>
                  <select
                    id={`reason-${task.key}`}
                    disabled={classifySolved}
                    value={changeReasons[task.key] ?? ''}
                    onChange={(event) => { setChangeReasons((current) => ({ ...current, [task.key]: Number(event.target.value) })); setClassifyTried(false); }}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400"
                  >
                    <option value="">请选择依据</option>
                    {task.reasons.map((reason, index) => <option key={reason} value={index}>{reason}</option>)}
                  </select>
                </article>
              ))}
            </div>
            <div className="mx-auto mt-5 max-w-3xl space-y-3">
              {!classifySolved && (
                <button type="button" onClick={submitClassifications} className="w-full rounded-xl bg-cyan-600 px-4 py-3 font-black text-white hover:bg-cyan-500">
                  提交三项初步判断
                </button>
              )}
              {classifyTried && !classifySolved && (
                <Feedback kind="error">至少有一组“判断—依据”不匹配。能确认只是状态改变的可以先分类；燃烧还要问“是否已有新物质证据”。</Feedback>
              )}
              {classifySolved && (
                <>
                  <Feedback kind="success">熔化、汽化都只是石蜡状态改变，可先判为物理变化；目前对燃烧只观察到发光、放热，仍需寻找是否生成新物质的证据。</Feedback>
                  <button type="button" onClick={() => goTo('experiment')} className="w-full rounded-xl bg-amber-500 px-4 py-3 font-black text-slate-950 hover:bg-amber-400">
                    去寻找未知生成物的证据 →
                  </button>
                </>
              )}
            </div>
          </section>
        )}

        {stage === 'experiment' && (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-xs font-bold tracking-widest text-emerald-400">寻找生成物证据</div>
                <h2 className="mt-1 text-2xl font-black">先收集未知物，再判断现象支持什么</h2>
              </div>
              <div className="flex gap-2">
                {(['water', 'carbonDioxide'] as ExperimentKey[]).map((key, index) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveExperiment(key)}
                    className={`rounded-full border px-3 py-2 text-xs font-bold ${
                      activeExperiment === key
                        ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                        : experimentSolved[key]
                          ? 'border-emerald-500/30 bg-slate-900 text-emerald-300'
                          : 'border-slate-700 bg-slate-900 text-slate-300'
                    }`}
                  >
                    {experimentSolved[key] ? '✓ ' : ''}任务 {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <Feedback kind="neutral">
              这里不先认定生成了哪种物质，也不试图一次穷尽全部生成物。我们从现有器材能捕捉的两类线索开始：可凝结物，以及能让检验试剂产生明显变化的气体；没有检验到的其他生成物仍不能排除。
            </Feedback>

            <div className="mt-5 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.8fr)]">
              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
                <div className="text-xs font-bold text-emerald-400">{experimentTasks[activeExperiment].eyebrow}</div>
                <h3 className="mt-1 text-xl font-black">{experimentTasks[activeExperiment].title}</h3>
                <div className="mt-4 space-y-3">
                  {experimentTasks[activeExperiment].options.map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      disabled={experimentOperated[activeExperiment]}
                      onClick={() => chooseExperiment(index)}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-bold leading-6 ${
                        experimentChoices[activeExperiment] === index
                          ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                          : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-emerald-500/50'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </button>
                  ))}
                </div>
                {experimentFeedback[activeExperiment] && (
                  <div className="mt-3"><Feedback kind="error">{experimentFeedback[activeExperiment]}</Feedback></div>
                )}
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
                {!experimentOperated[activeExperiment] ? (
                  <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 p-6 text-center text-sm leading-6 text-slate-500">
                    这里暂不显示实验现象，也不预告生成物名称。先选能收集线索、又尽量减少干扰的操作。
                  </div>
                ) : activeExperiment === 'water' ? (
                  <div className="space-y-4">
                    <figure className="overflow-hidden rounded-xl border border-amber-200 bg-[#f7f0e4]">
                      <img
                        src="/candle-inquiry/water-condensation-evidence.jpg"
                        alt="燃烧的白色蜡烛上方罩着干燥烧杯，杯口与火焰之间留有间隙，烧杯内壁出现细小雾状物和无色液滴"
                        loading="lazy"
                        className="aspect-video w-full object-cover"
                      />
                    </figure>
                    <Feedback kind="neutral">只记录现象：原本干燥的烧杯内壁出现细小雾状物和无色液滴。先不要把液滴直接命名成某种物质。</Feedback>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <figure className="overflow-hidden rounded-xl border border-amber-200 bg-[#f7f0e4]">
                      <img
                        src="/candle-inquiry/limewater-evidence.jpg"
                        alt="漏斗收集蜡烛燃烧气体，导管伸到石灰水液面以下并冒出气泡，石灰水呈均匀乳白浑浊"
                        loading="lazy"
                        className="aspect-video w-full object-cover"
                      />
                    </figure>
                    <Feedback kind="neutral">只记录现象：澄清石灰水由澄清变浑浊。先不要跳过现象，直接写生成物名称。</Feedback>
                    <p className="text-xs leading-5 text-slate-400">课堂真实操作还要用合适的抽气条件维持气流；图中重点呈现“收集燃烧气体—液面下通入—观察浑浊”。</p>
                  </div>
                )}

                {experimentOperated[activeExperiment] && (
                  <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                    <h4 className="text-sm font-black leading-6 text-emerald-100">{experimentTasks[activeExperiment].interpretationTitle}</h4>
                    <div className="mt-3 space-y-2">
                      {experimentTasks[activeExperiment].interpretationOptions.map((option, index) => (
                        <button
                          key={option}
                          type="button"
                          disabled={experimentSolved[activeExperiment]}
                          onClick={() => chooseInterpretation(index)}
                          className={`w-full rounded-xl border px-3 py-3 text-left text-sm font-bold leading-5 ${
                            experimentInterpretations[activeExperiment] === index
                              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                              : 'border-slate-700 bg-slate-950/70 text-slate-200 hover:border-emerald-500/50'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {interpretationFeedback[activeExperiment] && (
                      <div className="mt-3"><Feedback kind="error">{interpretationFeedback[activeExperiment]}</Feedback></div>
                    )}
                    {experimentSolved[activeExperiment] && (
                      <div className="mt-3"><Feedback kind="success">{experimentTasks[activeExperiment].interpretationSuccess}</Feedback></div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {experimentsComplete && (
              <div className="mx-auto mt-5 max-w-3xl">
                <button type="button" onClick={() => goTo('chain')} className="w-full rounded-xl bg-amber-500 px-4 py-3 font-black text-slate-950 hover:bg-amber-400">
                  把两组现象拼成证据链 →
                </button>
              </div>
            )}
          </section>
        )}

        {stage === 'chain' && (
          <section>
            <div className="max-w-3xl">
              <div className="text-xs font-bold tracking-widest text-violet-400">整理证据</div>
              <h2 className="mt-1 text-2xl font-black">把证据连起来，再回答燃烧属于哪类变化</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">每一环都要能支持下一环；不能从“火焰很亮”直接跳到生成物、元素组成或变化分类。</p>
            </div>
            <div className="mt-5 space-y-4">
              {(['water', 'carbonDioxide'] as ChainKey[]).map((chainKey, rowIndex) => (
                <article key={chainKey} className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                  <div className="mb-3 text-sm font-black text-white">证据链 {rowIndex + 1}</div>
                  <div className="grid min-w-0 gap-2 lg:grid-cols-4">
                    {chainSlots.map((slot, slotIndex) => (
                      <label key={slot.label} className="min-w-0 text-xs font-bold text-slate-400">
                        {slotIndex > 0 && <span className="mr-1 hidden text-slate-600 lg:inline">→</span>}{slot.label}
                        <select
                          value={chains[chainKey][slotIndex]}
                          disabled={chainSolved}
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            setChains((current) => ({
                              ...current,
                              [chainKey]: current[chainKey].map((value, index) => index === slotIndex ? nextValue : value),
                            }));
                            setChainTried(false);
                          }}
                          className="mt-1 block w-full min-w-0 rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-sm text-slate-100 outline-none focus:border-violet-400"
                        >
                          <option value="">请选择</option>
                          {slot.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                </article>
              ))}
              <article className="rounded-2xl border border-violet-500/40 bg-violet-500/10 p-4 sm:p-5">
                <div className="text-xs font-bold text-violet-300">回到第三步留下的待证问题</div>
                <h3 className="mt-1 text-lg font-black text-white">根据已经整理出的生成物证据，石蜡蒸气燃烧属于哪类变化？</h3>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {(['physical', 'chemical'] as FinalChangeKind[]).map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      disabled={chainSolved}
                      onClick={() => { setBurningFinalKind(kind); setChainTried(false); }}
                      className={`rounded-xl border px-3 py-3 text-sm font-bold ${
                        burningFinalKind === kind
                          ? 'border-violet-400 bg-violet-500/20 text-violet-100'
                          : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-violet-500/50'
                      }`}
                    >
                      {kind === 'physical' ? '物理变化' : '化学变化'}
                    </button>
                  ))}
                </div>
                <label className="mt-4 block text-xs font-bold text-slate-300" htmlFor="burning-final-reason">最终判断依据</label>
                <select
                  id="burning-final-reason"
                  value={burningFinalReason ?? ''}
                  disabled={chainSolved}
                  onChange={(event) => { setBurningFinalReason(Number(event.target.value)); setChainTried(false); }}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-100 outline-none focus:border-violet-400"
                >
                  <option value="">请选择依据</option>
                  <option value="0">检验到了原来没有的、可识别的新物质</option>
                  <option value="1">火焰明亮并放热</option>
                  <option value="2">石蜡只改变了状态和位置</option>
                </select>
              </article>
            </div>
            <div className="mx-auto mt-5 max-w-3xl space-y-3">
              {!chainSolved && (
                <button type="button" onClick={submitChains} className="w-full rounded-xl bg-violet-600 px-4 py-3 font-black text-white hover:bg-violet-500">
                  提交证据链与燃烧分类
                </button>
              )}
              {chainTried && !chainSolved && (
                <Feedback kind="error">至少有一环或最终分类不匹配。先由现象判断支持哪种物质，再用“是否出现新物质”完成燃烧分类。</Feedback>
              )}
              {chainSolved && (
                <>
                  <Feedback kind="success">现象分别支持有水、二氧化碳生成，因此有证据说明燃烧产生了新物质，可将燃烧判为化学变化；水和二氧化碳还分别支持燃烧物中含氢、碳元素，但都不是对全部生成物或全部元素的穷尽证明。</Feedback>
                  <button type="button" onClick={() => goTo('boundary')} className="w-full rounded-xl bg-amber-500 px-4 py-3 font-black text-slate-950 hover:bg-amber-400">
                    检查结论能走多远 →
                  </button>
                </>
              )}
            </div>
          </section>
        )}

        {stage === 'boundary' && (
          <section>
            <div className="max-w-3xl">
              <div className="text-xs font-bold tracking-widest text-rose-400">边界迁移</div>
              <h2 className="mt-1 text-2xl font-black">证据成立，不等于什么都能推出</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">三题全部判断正确，才生成本次探究结论。</p>
            </div>
            <div className="mt-5 space-y-4">
              {boundaryQuestions.map((question, questionIndex) => {
                const isCorrect = boundaryCorrect[questionIndex];
                const showWrong = boundaryTried && boundaryAnswers[questionIndex] !== null && !isCorrect;
                return (
                  <article key={question.stem} className="rounded-2xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
                    <div className="text-xs font-bold text-rose-400">边界题 {questionIndex + 1}</div>
                    <h3 className="mt-1 text-base font-black leading-6 text-white">{question.stem}</h3>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {question.options.map((option, optionIndex) => (
                        <button
                          key={option}
                          type="button"
                          disabled={boundaryTried && isCorrect}
                          onClick={() => {
                            setBoundaryAnswers((current) => current.map((answer, index) => index === questionIndex ? optionIndex : answer));
                            setBoundaryTried(false);
                          }}
                          className={`rounded-xl border px-3 py-3 text-left text-sm font-bold leading-5 ${
                            boundaryAnswers[questionIndex] === optionIndex
                              ? 'border-rose-400 bg-rose-500/15 text-rose-100'
                              : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-rose-500/50'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    {showWrong && <div className="mt-3"><Feedback kind="error">{question.wrong}</Feedback></div>}
                    {boundaryTried && isCorrect && <div className="mt-3"><Feedback kind="success">这条边界判断成立。</Feedback></div>}
                  </article>
                );
              })}
            </div>
            <div className="mx-auto mt-5 max-w-3xl space-y-3">
              <button type="button" onClick={submitBoundaries} className="w-full rounded-xl bg-rose-600 px-4 py-3 font-black text-white hover:bg-rose-500">
                提交三道边界题
              </button>
              {boundaryTried && boundaryCorrect.every(Boolean) && (
                <button type="button" onClick={finishInquiry} className="w-full rounded-xl bg-amber-500 px-4 py-3 font-black text-slate-950 hover:bg-amber-400">
                  生成有边界的探究结论 →
                </button>
              )}
            </div>
          </section>
        )}

        {stage === 'summary' && (
          <section className="mx-auto max-w-4xl">
            <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-5 sm:p-8">
              <div className="text-xs font-bold tracking-widest text-emerald-300">完成探究 · 所有关键门槛已通过</div>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">结论必须和证据强度相匹配</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ['过程与变化', '固态石蜡熔化、液态石蜡受毛细作用沿烛芯上升并汽化，均属物理变化；真正主要燃烧的是石蜡蒸气，燃烧生成新物质，属化学变化。'],
                  ['生成物证据', '干燥烧杯内出现水雾或水滴，进一步支持生成水；燃烧气体使澄清石灰水变浑浊，支持生成二氧化碳。'],
                  ['组成推断', '水支持燃烧物中含氢元素，二氧化碳支持燃烧物中含碳元素；不能据此证明只含碳、氢，也不能确定唯一化学式。'],
                  ['体系边界', '生成物中的氧可能来自空气中的氧气；实际蜡烛还应区分普通石蜡、烛芯以及香料、色素等添加物。'],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-2xl border border-emerald-500/20 bg-slate-950/60 p-4">
                    <h3 className="font-black text-emerald-200">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
                可见白烟主要由未燃烧的石蜡蒸气冷却后形成的微小石蜡颗粒构成，可混有少量炭黑等颗粒；它不是石蜡蒸气本身。黄色明亮区主要由炽热炭黑发光，外焰附近通常燃烧更充分、温度更高。
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={reset} className="rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 font-bold text-slate-200 hover:border-cyan-400">
                重新探究
              </button>
              <button type="button" onClick={completeInquiry} disabled={reportedComplete} className="rounded-xl bg-cyan-600 px-4 py-3 font-black text-white hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-400">
                整理成知识卡片，再做迁移题 →
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
