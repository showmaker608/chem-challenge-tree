import { useEffect, useRef, useState } from 'react';
import { ChemExpression } from '../ChemExpression';
import { HeatedOxygenPreparationLab } from './HeatedOxygenPreparationLab';
import {
  OxygenRoutePreview,
  PeroxideGeneratorVisual,
  PreparationEvidenceVisual,
} from './OxygenPreparationVisuals';
import { GasTightnessLab } from './GasTightnessLab';

type CollectionMethod = 'water' | 'upward' | 'downward';
type LearningStage = 'generation' | 'preparation' | 'collection' | 'verification' | 'safety';
type GeneratorChoice = 'solid-heat' | 'long-neck' | 'dropping';

const stageOrder: LearningStage[] = ['generation', 'preparation', 'collection', 'verification', 'safety'];

interface PreparationDecision {
  eyebrow: string;
  title: string;
  question: string;
  options: string[];
  answer: number;
  wrongFeedback: string[];
  conclusion: string;
}

const preparationDecisions: PreparationDecision[] = [
  {
    eyebrow: '准备 1/3 · 连接装置',
    title: '玻璃导管要插入带孔橡皮塞',
    question: '怎样连接既省力又安全？',
    options: [
      '先把玻璃管口用水润湿，再稍稍用力转动插入',
      '把玻璃管抵在桌面上，垂直向下猛压',
      '用手掌堵住玻璃管口，再用力推进橡皮塞',
    ],
    answer: 0,
    wrongFeedback: [
      '',
      '抵住桌面猛压容易折断玻璃管。连接玻璃仪器不能靠蛮力。',
      '手掌正对玻璃管口，一旦折断很容易刺伤手。先想怎样减小摩擦。',
    ],
    conclusion: '连接玻璃管和橡皮塞：先用水润湿，再边转动边插入；整套装置按“从下到上、从左到右”连接。',
  },
  {
    eyebrow: '准备 2/3 · 检查气密性',
    title: '药品还没有加入，现在检查装置是否漏气',
    question: '请调整装置并亲手完成检查：怎样才能得到可以判断气密性的现象？',
    options: [
      '关闭分液漏斗活塞，把导管口浸入水中；手握锥形瓶，导管口有气泡',
      '先加入过氧化氢，看锥形瓶里有没有大量气泡',
      '把导管口留在空气中，用嘴向导管内吹气',
    ],
    answer: 0,
    wrongFeedback: [
      '',
      '加入药品后反应已经开始，即使发现漏气也来不及安全拆装。气密性必须在装药前检查。',
      '导管口不浸入水中，就没有清楚的可观察现象；也不应直接用嘴吹实验装置。',
    ],
    conclusion: '先形成密闭体系，再用温度变化造成压强差。导管口出现气泡，说明气体能沿唯一通道排出，装置气密性良好。',
  },
  {
    eyebrow: '准备 3/3 · 装入药品',
    title: '装置已经连接并确认不漏气',
    question: '接下来怎样装药并启动反应？',
    options: [
      '先把二氧化锰放入锥形瓶，再把过氧化氢装入分液漏斗，最后打开活塞滴加',
      '先在烧杯中把两种药品混合，产生气泡后再倒入锥形瓶',
      '先把过氧化氢全部倒入锥形瓶，反应开始后再加入二氧化锰',
    ],
    answer: 0,
    wrongFeedback: [
      '',
      '两种药品一旦混合就开始放出氧气，边反应边转移会造成气体散失，也来不及密闭装置。',
      '一次倒入过氧化氢无法控制反应速度；反应开始后再拆开装置加入固体也不安全。',
    ],
    conclusion: '先装固体，再把液体装入分液漏斗；需要制气时才打开活塞逐滴加入。这样反应何时开始、进行多快都可控制。',
  },
];

const generatorChoices: Array<{
  id: GeneratorChoice;
  label: string;
  description: string;
  wrongFeedback?: string;
}> = [
  {
    id: 'solid-heat',
    label: '装置 A',
    description: '横放试管＋酒精灯',
    wrongFeedback: '装置 A 是固体加热型。题目要求过氧化氢与二氧化锰在常温下反应，不需要酒精灯。',
  },
  {
    id: 'long-neck',
    label: '装置 B',
    description: '长颈漏斗＋锥形瓶',
    wrongFeedback: '装置 B 能完成常温制气，但长颈漏斗没有活塞，不能随时调节过氧化氢的滴加速度。再看任务中的“便于控制反应速度”。',
  },
  {
    id: 'dropping',
    label: '装置 C',
    description: '分液漏斗＋锥形瓶',
  },
];

interface MethodInfo {
  label: string;
  shortLabel: string;
  question: string;
  answers: string[];
  correctAnswer: number;
  observation: string;
  displaced: string;
  conclusion: string;
  tone: 'cyan' | 'emerald' | 'rose';
}

interface CollectionMission {
  eyebrow: string;
  title: string;
  constraint: string;
  prompt: string;
  targetMethod: CollectionMethod;
  correctFeedback: string;
  wrongFeedback: string;
}

const missions: CollectionMission[] = [
  {
    eyebrow: '任务 1 · 纯度优先',
    title: '水槽可用，要收集一瓶较纯的氧气',
    constraint: '已知氧气不易溶于水；目标是尽量少混入空气。',
    prompt: '你先选哪一种收集方法？',
    targetMethod: 'water',
    correctFeedback: '选择成立。接下来亲眼确认：氧气进入后，究竟是谁被排走。',
    wrongFeedback: '先回到目标：“较纯”意味着要尽量避免与空气混合；水槽又是可用条件。',
  },
  {
    eyebrow: '任务 2 · 条件改变',
    title: '现场没有水槽，但仍要收集氧气',
    constraint: '已知氧气的密度比空气略大；现在不能使用排水法。',
    prompt: '应当让导管伸到瓶内哪里，并采用哪种方法？',
    targetMethod: 'upward',
    correctFeedback: '选择成立。氧气要从瓶底附近进入，看看原有空气会往哪里离开。',
    wrongFeedback: '这次没有水槽，只能根据氧气与空气的密度关系判断谁应留在下方。',
  },
  {
    eyebrow: '任务 3 · 反例验证',
    title: '同学坚持说“向下排空气法也能收集氧气”',
    constraint: '这一步不是寻找正确收集法，而是故意运行他的方案，验证它为什么失败。',
    prompt: '应选择哪套装置来做这次反例实验？',
    targetMethod: 'downward',
    correctFeedback: '对，先按错误方案真实运行，再根据气体移动方向否定它。',
    wrongFeedback: '任务要求验证“向下排空气法”这个具体方案，不是再选一次正确方法。',
  },
];

const methodInfo: Record<CollectionMethod, MethodInfo> = {
  water: {
    label: '排水法',
    shortLabel: '排水',
    question: '观察集气瓶内的变化：氧气进入后，主要是谁离开了集气瓶？',
    answers: ['水被氧气排出', '空气向上离开', '氧气又跑出去了'],
    correctAnswer: 0,
    observation: '氧气从导管口形成气泡，瓶内水面逐渐下降。',
    displaced: '水向下排出',
    conclusion: '氧气不易溶于水，所以能把水排走并留在瓶内；这种方法收集的氧气通常较纯。',
    tone: 'cyan',
  },
  upward: {
    label: '向上排空气法',
    shortLabel: '向上排空气',
    question: '灰色空气粒子从瓶口离开。这里“向上”的是谁？',
    answers: ['氧气向上逃走', '原有空气被向上排出', '集气瓶向上移动'],
    correctAnswer: 1,
    observation: '氧气从瓶底附近进入，原有空气从上方瓶口离开。',
    displaced: '空气向上排出',
    conclusion: '氧气的密度比空气略大，进入瓶内后主要停留在下方，把原有空气向上推出瓶口。',
    tone: 'emerald',
  },
  downward: {
    label: '向下排空气法',
    shortLabel: '向下排空气',
    question: '把集气瓶倒置后，为什么这次很难收集到氧气？',
    answers: ['氧气会与空气反应', '氧气密度较大，会从下方瓶口逸出', '氧气极易溶于空气'],
    correctAnswer: 1,
    observation: '氧气进入倒置集气瓶后向下沉降，又从下方瓶口逸出。',
    displaced: '氧气反而逸出',
    conclusion: '向下排空气法适合密度比空气小的气体。氧气密度较大，不能稳定留在倒置集气瓶内。',
    tone: 'rose',
  },
};

const oxygenDots = [
  [225, 82], [270, 70], [315, 94], [245, 122], [300, 140],
  [218, 164], [270, 177], [328, 190], [246, 214], [304, 226],
];

const airDots = [
  [222, 72], [270, 90], [321, 70], [244, 126], [305, 128],
  [220, 176], [278, 170], [330, 178], [248, 218], [308, 220],
];

function OxygenDot({ x, y, opacity = 1 }: { x: number; y: number; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <circle cx="-5" cy="0" r="6" fill="#38bdf8" stroke="#bae6fd" strokeWidth="1.5" />
      <circle cx="5" cy="0" r="6" fill="#38bdf8" stroke="#bae6fd" strokeWidth="1.5" />
      <text x="0" y="3" textAnchor="middle" fill="#082f49" fontSize="6" fontWeight="900">O₂</text>
    </g>
  );
}

function AirDot({ x, y, opacity = 1 }: { x: number; y: number; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <circle r="7" fill="#94a3b8" fillOpacity="0.82" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x="0" y="3" textAnchor="middle" fill="#0f172a" fontSize="6" fontWeight="900">空气</text>
    </g>
  );
}

function Legend() {
  return (
    <g transform="translate(18 18)">
      <rect width="206" height="34" rx="11" fill="#0f172a" fillOpacity="0.82" stroke="#334155" />
      <g transform="translate(14 17)">
        <OxygenDot x={0} y={0} />
        <text x="15" y="4" fill="#e0f2fe" fontSize="11" fontWeight="800">氧气（示意色）</text>
      </g>
      <g transform="translate(140 17)">
        <AirDot x={0} y={0} />
        <text x="13" y="4" fill="#e2e8f0" fontSize="11" fontWeight="800">空气</text>
      </g>
    </g>
  );
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function smoothStep(value: number) {
  const bounded = clamp01(value);
  return bounded * bounded * (3 - 2 * bounded);
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

const oxygenFillTargets = [...oxygenDots].sort((left, right) => right[1] - left[1]);

function WaterCollectionVisual({ running, progress }: { running: boolean; progress: number }) {
  const displaced = smoothStep((progress - 0.03) / 0.94);
  const waterTop = lerp(47, 177, displaced);
  const troughTop = lerp(226, 222, displaced);

  return (
    <>
      <rect x="80" y="224" width="350" height="54" rx="14" fill="#075985" fillOpacity="0.45" stroke="#38bdf8" strokeWidth="3" />
      <path d={`M82 ${troughTop} Q130 ${troughTop - 8} 178 ${troughTop} T274 ${troughTop} T370 ${troughTop} T428 ${troughTop}`} fill="none" stroke="#7dd3fc" strokeWidth="4" />

      <path d="M190 235 V57 Q190 38 210 38 H346 Q366 38 366 57 V235" fill="#e0f2fe" fillOpacity="0.06" stroke="#cbd5e1" strokeWidth="5" />
      <line x1="181" y1="242" x2="375" y2="242" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
      <path
        d={`M195 ${waterTop} H361 V235 H195 Z`}
        fill="#0ea5e9"
        fillOpacity="0.38"
      />
      <path
        d={`M195 ${waterTop} Q235 ${waterTop - 7} 278 ${waterTop} T361 ${waterTop}`}
        fill="none"
        stroke="#7dd3fc"
        strokeWidth="4"
      />

      <path d="M30 178 H138 Q158 178 158 198 V232 H224 V206" fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 178 H138 Q158 178 158 198 V232 H224 V206" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {oxygenDots.slice(0, 8).map(([targetX, targetY], index) => {
        const arrival = smoothStep((progress - (0.13 + index * 0.075)) / 0.25);
        const visibleTargetY = Math.min(targetY, waterTop - 13);
        const x = lerp(224, targetX + Math.sin(progress * 18 + index) * 2, arrival);
        const y = lerp(waterTop - 7, visibleTargetY, arrival);
        return arrival > 0 ? <OxygenDot key={`${targetX}-${targetY}`} x={x} y={y} opacity={arrival * 0.95} /> : null;
      })}

      {running && [0, 1, 2, 3, 4, 5].map((index) => {
        const travelled = progress * 8.5 - index * 0.22;
        if (travelled <= 0) return null;
        const phase = travelled - Math.floor(travelled);
        const bubbleY = lerp(208, waterTop + 5, phase);
        const bubbleX = 224 + Math.sin(phase * Math.PI * 3 + index) * (5 + index % 3);
        return (
          <circle
            key={index}
            cx={bubbleX}
            cy={bubbleY}
            r={4 + (index % 3)}
            fill="#38bdf8"
            fillOpacity={0.35}
            stroke="#e0f2fe"
            strokeWidth="2"
            opacity={Math.sin(phase * Math.PI)}
          />
        );
      })}

      {progress > 0 && (
        <g opacity={smoothStep(progress / 0.18)}>
          <path d="M385 140 V208" stroke="#7dd3fc" strokeWidth="5" strokeLinecap="round" />
          <path d="M375 196 L385 210 L395 196" fill="none" stroke="#7dd3fc" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="401" y="164" fill="#bae6fd" fontSize="12" fontWeight="900">水位连续下降</text>
        </g>
      )}
    </>
  );
}

function UpwardCollectionVisual({ running, progress }: { running: boolean; progress: number }) {
  return (
    <>
      <path d="M188 48 V238 Q188 254 205 254 H350 Q367 254 367 238 V48" fill="#e2e8f0" fillOpacity="0.05" stroke="#cbd5e1" strokeWidth="5" />
      <line x1="178" y1="43" x2="377" y2="43" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />

      <path d="M30 75 H245 V225" fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 75 H245 V225" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {airDots.map(([startX, startY], index) => {
        const escape = smoothStep((progress - (0.08 + index * 0.055)) / 0.48);
        const x = startX + Math.sin(progress * 16 + index * 1.7) * 5;
        const y = lerp(startY, -12 - (index % 3) * 8, escape);
        return <AirDot key={`${startX}-${startY}`} x={x} y={y} opacity={1 - escape * 0.96} />;
      })}

      {oxygenFillTargets.map(([targetX, targetY], index) => {
        const arrival = smoothStep((progress - (0.05 + index * 0.065)) / 0.36);
        const x = lerp(245, targetX + Math.sin(progress * 13 + index) * 3, arrival);
        const y = lerp(225, targetY + 12, arrival);
        return arrival > 0 ? <OxygenDot key={`${targetX}-${targetY}`} x={x} y={y} opacity={arrival * 0.96} /> : null;
      })}

      {running && [0, 1, 2, 3].map((index) => {
        const travelled = progress * 7 - index * 0.24;
        if (travelled <= 0) return null;
        const phase = travelled - Math.floor(travelled);
        return (
          <OxygenDot
            key={index}
            x={245 + Math.sin(phase * Math.PI * 2 + index) * 4}
            y={lerp(225, 168, phase)}
            opacity={Math.sin(phase * Math.PI) * 0.9}
          />
        );
      })}

      {progress > 0 && (
        <g opacity={smoothStep(progress / 0.18)}>
          <path d="M408 134 V66" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
          <path d="M398 77 L408 63 L418 77" fill="none" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="392" y="156" textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="900">空气向上</text>
        </g>
      )}
    </>
  );
}

function DownwardCollectionVisual({ running, progress }: { running: boolean; progress: number }) {
  return (
    <>
      <path d="M188 242 V62 Q188 42 208 42 H347 Q367 42 367 62 V242" fill="#e2e8f0" fillOpacity="0.05" stroke="#cbd5e1" strokeWidth="5" />
      <line x1="178" y1="248" x2="377" y2="248" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
      <path d="M30 272 H238 V78" fill="none" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 272 H238 V78" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {airDots.slice(0, 8).map(([x, y], index) => (
        <AirDot
          key={`${x}-${y}`}
          x={x + Math.sin(progress * 12 + index) * 3}
          y={Math.min(y, 180) + Math.cos(progress * 10 + index * 1.4) * 2}
          opacity={0.78}
        />
      ))}

      {(running || progress >= 1) && [0, 1, 2, 3, 4, 5].map((index) => {
        const travelled = Math.max(0, progress * 6.2 - index * 0.24);
        const phase = travelled - Math.floor(travelled);
        const x = 255 + index * 13 + Math.sin(phase * Math.PI * 2 + index) * 10;
        const y = lerp(78, 286, phase);
        return travelled > 0 ? (
          <OxygenDot
            key={index}
            x={x}
            y={y}
            opacity={Math.sin(Math.PI * clamp01(phase)) * 0.95}
          />
        ) : null;
      })}

      {progress > 0 && (
        <g opacity={smoothStep(progress / 0.18)}>
          <path d="M410 164 V233" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
          <path d="M400 220 L410 235 L420 220" fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="398" y="151" textAnchor="middle" fill="#bae6fd" fontSize="13" fontWeight="900">氧气下沉逸出</text>
        </g>
      )}
    </>
  );
}

function CollectionVisual({
  method,
  running,
  progress,
  runId,
}: {
  method: CollectionMethod;
  running: boolean;
  progress: number;
  runId: number;
}) {
  return (
    <svg
      key={`${method}-${runId}`}
      viewBox="0 0 460 300"
      className="h-auto w-full"
      role="img"
      aria-label={`${methodInfo[method].label}收集氧气的动态示意图`}
    >
      <defs>
        <linearGradient id="oxygen-lab-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#082f49" />
          <stop offset="55%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
      </defs>
      <rect width="460" height="300" rx="22" fill="url(#oxygen-lab-bg)" />
      <Legend />
      {method === 'water' && <WaterCollectionVisual running={running} progress={progress} />}
      {method === 'upward' && <UpwardCollectionVisual running={running} progress={progress} />}
      {method === 'downward' && <DownwardCollectionVisual running={running} progress={progress} />}
      <text x="28" y="292" fill="#94a3b8" fontSize="10" fontWeight="700">气体本身无色；颜色和粒子大小仅用于展示移动方向</text>
    </svg>
  );
}

function StageProgress({ stage }: { stage: LearningStage }) {
  const activeIndex = stageOrder.indexOf(stage);
  const labels = ['选装置', '连接装药', '收集', '检验', '收尾'];

  return (
    <div className="mb-4 grid grid-cols-5 gap-1.5" aria-label={`实验决策进度：第 ${activeIndex + 1} 阶段，共 5 阶段`}>
      {labels.map((label, index) => (
        <div key={label} className="min-w-0 text-center">
          <div className={`h-1.5 rounded-full ${index < activeIndex ? 'bg-emerald-400' : index === activeIndex ? 'bg-cyan-400' : 'bg-slate-700'}`} />
          <div className={`mt-1 text-[10px] font-black ${index === activeIndex ? 'text-cyan-200' : index < activeIndex ? 'text-emerald-300' : 'text-slate-500'}`}>
            {index < activeIndex ? '✓ ' : ''}{label}
          </div>
        </div>
      ))}
    </div>
  );
}

function PeroxideOxygenRoute({
  onComplete,
  collectionOnly = false,
}: {
  onComplete?: () => void;
  collectionOnly?: boolean;
}) {
  const [stage, setStage] = useState<LearningStage>(collectionOnly ? 'collection' : 'generation');
  const [generatorChoice, setGeneratorChoice] = useState<GeneratorChoice | null>(null);
  const [generatorResolved, setGeneratorResolved] = useState(false);
  const [generatorFeedback, setGeneratorFeedback] = useState('');
  const [preparationStep, setPreparationStep] = useState(0);
  const [preparationAnswer, setPreparationAnswer] = useState<number | null>(null);
  const [missionIndex, setMissionIndex] = useState(0);
  const [method, setMethod] = useState<CollectionMethod>('water');
  const [candidateMethod, setCandidateMethod] = useState<CollectionMethod | null>(null);
  const [methodConfirmed, setMethodConfirmed] = useState(false);
  const [methodFeedback, setMethodFeedback] = useState('');
  const [running, setRunning] = useState(false);
  const [observed, setObserved] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [resolved, setResolved] = useState(false);
  const [completed, setCompleted] = useState<Partial<Record<CollectionMethod, boolean>>>({});
  const [runId, setRunId] = useState(0);
  const [progress, setProgress] = useState(0);
  const [verificationAnswer, setVerificationAnswer] = useState<number | null>(null);
  const [safetyAnswer, setSafetyAnswer] = useState<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mission = missions[missionIndex];
  const info = methodInfo[method];
  const preparation = preparationDecisions[preparationStep];
  const preparationResolved = preparationAnswer === preparation.answer;
  const completedCount = Object.values(completed).filter(Boolean).length;
  const progressPercent = Math.round(progress * 100);

  useEffect(() => () => {
    if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const resetExperiment = () => {
    if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
    setRunning(false);
    setObserved(false);
    setSelectedAnswer(null);
    setResolved(false);
    setProgress(0);
  };

  const chooseMethod = (nextMethod: CollectionMethod) => {
    if (running || observed || resolved) return;
    resetExperiment();
    setCandidateMethod(nextMethod);
    if (nextMethod !== mission.targetMethod) {
      setMethodConfirmed(false);
      setMethodFeedback(mission.wrongFeedback);
      return;
    }
    setMethod(nextMethod);
    setMethodConfirmed(true);
    setMethodFeedback(mission.correctFeedback);
  };

  const startExperiment = () => {
    if (!methodConfirmed) return;
    if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
    setRunId((value) => value + 1);
    setRunning(true);
    setObserved(false);
    setSelectedAnswer(null);
    setResolved(false);
    setProgress(0);

    const duration = 4200;
    const startedAt = window.performance.now();
    let lastRenderedProgress = -1;

    const advanceSimulation = (now: number) => {
      const nextProgress = clamp01((now - startedAt) / duration);
      if (nextProgress - lastRenderedProgress >= 0.006 || nextProgress === 1) {
        setProgress(nextProgress);
        lastRenderedProgress = nextProgress;
      }

      if (nextProgress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(advanceSimulation);
        return;
      }

      setRunning(false);
      setObserved(true);
      animationFrameRef.current = null;
    };

    animationFrameRef.current = window.requestAnimationFrame(advanceSimulation);
  };

  const answerQuestion = (index: number) => {
    if (!observed || resolved) return;
    setSelectedAnswer(index);
    if (index === info.correctAnswer) {
      setResolved(true);
      setCompleted((value) => ({ ...value, [method]: true }));
    }
  };

  const moveToNextMission = () => {
    resetExperiment();
    setCandidateMethod(null);
    setMethodConfirmed(false);
    setMethodFeedback('');
    if (missionIndex >= missions.length - 1) {
      if (collectionOnly) {
        onComplete?.();
        return;
      }
      setStage('verification');
      return;
    }
    setMissionIndex((value) => value + 1);
  };

  const chooseGenerator = (choice: GeneratorChoice) => {
    if (generatorResolved) return;
    setGeneratorChoice(choice);
    if (choice !== 'dropping') {
      const option = generatorChoices.find((item) => item.id === choice);
      setGeneratorFeedback(option?.wrongFeedback ?? '请重新根据反应物状态和是否加热判断。');
      return;
    }
    setGeneratorResolved(true);
    setGeneratorFeedback('选择成立：装置 C 不需要加热，分液漏斗的活塞还能调节过氧化氢的滴加速度，从而控制反应快慢。');
  };

  const movePreparationNext = () => {
    if (!preparationResolved) return;
    if (preparationStep >= preparationDecisions.length - 1) {
      setStage('collection');
      return;
    }
    setPreparationStep((value) => value + 1);
    setPreparationAnswer(null);
  };

  const toneClasses = {
    cyan: 'border-cyan-300/60 bg-cyan-400/10 text-cyan-100',
    emerald: 'border-emerald-300/60 bg-emerald-400/10 text-emerald-100',
    rose: 'border-rose-300/60 bg-rose-400/10 text-rose-100',
  }[info.tone];

  if (stage === 'generation') {
    return (
      <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="oxygen-generation-title">
        <div className="mx-auto max-w-5xl">
          <div className="pr-12">
            <div className="text-[11px] font-black tracking-[0.18em] text-cyan-300">实验方案与操作决策型 · 第 1/5 阶段</div>
            <h2 id="oxygen-generation-title" className="mt-1 text-xl font-black text-white sm:text-2xl">先把氧气制出来：选择发生装置</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-300">
              只看下面三条信息，选出合适的发生装置。
            </p>
          </div>

          <div className="mt-4"><StageProgress stage={stage} /></div>

          <div className="rounded-3xl border border-cyan-300/35 bg-gradient-to-br from-cyan-500/15 to-indigo-500/10 p-4 sm:p-5">
            <div className="text-[11px] font-black tracking-widest text-cyan-200">制取任务</div>
            <h3 className="mt-1.5 text-lg font-black text-white sm:text-xl">用过氧化氢溶液和二氧化锰制取一瓶氧气</h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                ['反应物状态', '液体＋固体'],
                ['反应条件', '常温、不加热'],
                ['操作目标', '控制滴速＋导出气体'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3">
                  <div className="text-[10px] font-black tracking-widest text-slate-400">{label}</div>
                  <div className="mt-1 text-sm font-black text-white">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm font-black text-amber-50">
              根据这三点，选择发生装置。
            </div>
          </div>

          <figure className="mt-4 overflow-hidden rounded-3xl border border-slate-700 bg-white p-3 sm:p-5">
            <img
              src="/oxygen/generation-apparatus-abc.png"
              alt="讲义题目中的三套氧气发生装置：A为固体加热装置，B为长颈漏斗与锥形瓶装置，C为分液漏斗与锥形瓶装置"
              className="mx-auto max-h-72 w-full object-contain"
            />
          </figure>

          <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="选择氧气发生装置">
            {generatorChoices.map((choice) => {
              const selected = generatorChoice === choice.id;
              const correct = selected && generatorResolved;
              const incorrect = selected && !generatorResolved;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => chooseGenerator(choice.id)}
                  disabled={generatorResolved}
                  aria-label={`${choice.label}：${choice.description}`}
                  className={`rounded-2xl border-2 px-2 py-3 text-center transition sm:px-4 ${
                    correct
                      ? 'border-emerald-300 bg-emerald-400/15'
                      : incorrect
                        ? 'border-rose-300 bg-rose-400/10'
                        : 'border-slate-700 bg-slate-900 hover:border-cyan-300 disabled:opacity-60'
                  }`}
                >
                  <div className="text-sm font-black text-white">{choice.label}</div>
                </button>
              );
            })}
          </div>

          {generatorFeedback && (
            <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-bold leading-6 ${
              generatorResolved
                ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-100'
                : 'border-rose-300/40 bg-rose-400/10 text-rose-100'
            }`} aria-live="polite">
              {generatorFeedback}
            </div>
          )}

          {generatorResolved && (
            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(290px,0.7fr)]" aria-live="polite">
              <figure className="overflow-hidden rounded-3xl border border-sky-200 bg-white lg:col-span-2">
                <PeroxideGeneratorVisual />
                <figcaption className="border-t border-slate-100 px-4 py-2 text-center text-[11px] font-bold text-slate-500">
                  当前只确认发生装置 C；收集装置与收集方法留到第 3 阶段再判断
                </figcaption>
              </figure>
              <div className="rounded-3xl border border-emerald-300/40 bg-emerald-400/10 p-5">
                <div className="text-xs font-black tracking-widest text-emerald-200">选择依据</div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-black">
                  <span className="rounded-xl bg-slate-900 px-3 py-2">固体＋液体</span>
                  <span className="text-cyan-300">＋</span>
                  <span className="rounded-xl bg-slate-900 px-3 py-2">不加热</span>
                  <span className="text-cyan-300">→</span>
                  <span className="rounded-xl bg-slate-900 px-3 py-2">控制滴速</span>
                  <span className="text-cyan-300">→</span>
                  <span className="rounded-xl bg-emerald-300 px-3 py-2 text-emerald-950">装置 C</span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-emerald-50">
                  C 属于固液不加热型，并能用分液漏斗活塞控制反应速度。若改用高锰酸钾固体加热，才应选择装置 A。
                </p>
              </div>
              <div className="rounded-3xl border border-cyan-300/30 bg-slate-900 p-5">
                <div className="text-xs font-black tracking-widest text-cyan-200">规范的符号表达式</div>
                <div className="mt-3 overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 text-center text-base font-black leading-8 text-white">
                  <ChemExpression
                    source="H2O2 ->[MnO2] H2O + O2"
                    label="过氧化氢在二氧化锰催化下生成水和氧气"
                  />
                </div>
                <p className="mt-2 text-xs font-bold leading-5 text-slate-400">符号表达式不配平、不写气体符号“↑”；MnO₂写在反应条件位置。</p>
              </div>
              <button
                type="button"
                onClick={() => setStage('preparation')}
                className="w-full rounded-2xl bg-cyan-400 px-5 py-4 text-base font-black text-cyan-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-300 lg:col-span-2"
              >
                装置选定，开始连接与准备 →
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (stage === 'preparation') {
    return (
      <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="oxygen-preparation-title">
        <div className="mx-auto max-w-5xl">
          <div className="pr-12">
            <div className="text-[11px] font-black tracking-[0.18em] text-cyan-300">实验方案与操作决策型 · 第 2/5 阶段 · {preparation.eyebrow}</div>
            <h2 id="oxygen-preparation-title" className="mt-1 text-xl font-black text-white sm:text-2xl">装置选定以后，按顺序完成准备</h2>
            <p className="mt-2 text-sm font-black text-slate-300">连接装置 → 检查气密性 → 装入药品</p>
          </div>

          <div className="mt-4"><StageProgress stage={stage} /></div>

          {preparationStep === 1 ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
                <div className="text-[11px] font-black tracking-widest text-cyan-300">当前操作</div>
                <h3 className="mt-2 text-lg font-black text-white">{preparation.title}</h3>
                <div className="mt-3 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm font-black leading-6 text-cyan-50">
                  {preparation.question}
                </div>
              </div>
              <GasTightnessLab onComplete={() => setPreparationAnswer(preparation.answer)} />
              {preparationResolved && (
                <div className="rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4 text-sm font-semibold leading-6 text-emerald-50" aria-live="polite">
                  {preparation.conclusion}
                </div>
              )}
            </div>
          ) : (
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.78fr)]">
              <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
                <div className="text-[11px] font-black tracking-widest text-cyan-300">当前操作</div>
                <h3 className="mt-2 text-lg font-black text-white">{preparation.title}</h3>
                <div className="mt-3 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm font-black leading-6 text-cyan-50">
                  {preparation.question}
                </div>

                <div className="mt-4 space-y-3" role="group" aria-label={preparation.question}>
                  {preparation.options.map((option, index) => {
                    const selected = preparationAnswer === index;
                    const correct = preparationResolved && index === preparation.answer;
                    const incorrect = selected && !preparationResolved;
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={preparationResolved}
                        onClick={() => setPreparationAnswer(index)}
                        className={`w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-black leading-6 transition ${
                          correct
                            ? 'border-emerald-300 bg-emerald-400/15 text-emerald-50'
                            : incorrect
                              ? 'border-rose-300 bg-rose-400/15 text-rose-50'
                              : 'border-slate-700 bg-slate-950/70 text-slate-100 hover:border-cyan-300'
                        }`}
                      >
                        <span className="mr-2 text-xs text-slate-400">{String.fromCharCode(65 + index)}.</span>{option}
                      </button>
                    );
                  })}
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

              <PreparationEvidenceVisual step={preparationStep} />
            </div>
          )}

          {preparationResolved && (
            <button
              type="button"
              onClick={movePreparationNext}
              className="mt-5 w-full rounded-2xl bg-cyan-400 px-5 py-4 text-base font-black text-cyan-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-300"
            >
              {preparationStep >= preparationDecisions.length - 1 ? '准备完成，开始收集氧气 →' : '继续下一项准备 →'}
            </button>
          )}
        </div>
      </section>
    );
  }

  if (stage === 'verification') {
    const verificationResolved = verificationAnswer === 0;
    const verificationOptions = [
      '检验：带火星木条伸入瓶内；验满：带火星木条放在瓶口',
      '检验：带火星木条放在瓶口；验满：带火星木条伸入瓶内',
      '检验和验满都向瓶内倒入澄清石灰水',
    ];

    return (
      <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="oxygen-verification-title">
        <div className="mx-auto max-w-4xl">
          <div className="pr-12">
            <div className="text-[11px] font-black tracking-[0.18em] text-cyan-300">实验方案与操作决策型 · 第 4/5 阶段</div>
            <h2 id="oxygen-verification-title" className="mt-1 text-xl font-black text-white sm:text-2xl">已经收集好了：怎样检验和验满？</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-300">
              “检验”回答是不是氧气；“验满”回答瓶口处是否已经充满。目标不同，木条放置位置也不同。
            </p>
          </div>

          <div className="mt-4"><StageProgress stage={stage} /></div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
            <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5">
              <div className="text-xs font-black tracking-widest text-cyan-300">选择一套完整操作</div>
              <div className="mt-4 space-y-3">
                {verificationOptions.map((option, index) => {
                  const selected = verificationAnswer === index;
                  const correct = verificationResolved && index === 0;
                  const incorrect = selected && !verificationResolved;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={verificationResolved}
                      onClick={() => setVerificationAnswer(index)}
                      className={`w-full rounded-2xl border-2 px-4 py-4 text-left text-sm font-black leading-6 transition ${
                        correct
                          ? 'border-emerald-300 bg-emerald-400/15 text-emerald-50'
                          : incorrect
                            ? 'border-rose-300 bg-rose-400/15 text-rose-50'
                            : 'border-slate-700 bg-slate-950/70 text-slate-100 hover:border-cyan-300'
                      }`}
                    >
                      <span className="mr-2 text-xs text-slate-400">{String.fromCharCode(65 + index)}.</span>{option}
                    </button>
                  );
                })}
              </div>

              {verificationAnswer !== null && !verificationResolved && (
                <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-400/10 p-4 text-sm font-semibold leading-6 text-rose-100" aria-live="polite">
                  {verificationAnswer === 1
                    ? '位置颠倒了：要判断整瓶气体是不是氧气，木条应伸入瓶内；只判断瓶口是否已有氧气，才放在瓶口。'
                    : '澄清石灰水用于检验二氧化碳。氧气能使带火星的木条复燃。'}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-cyan-300/30 bg-gradient-to-br from-cyan-500/15 to-indigo-500/10 p-5">
              <div className="text-xs font-black tracking-widest text-cyan-200">先分清两个问题</div>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                  <div className="text-xs font-black text-slate-400">检验：是不是氧气？</div>
                  <div className="mt-1 text-sm font-black text-white">检查瓶内气体</div>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                  <div className="text-xs font-black text-slate-400">验满：满到瓶口了吗？</div>
                  <div className="mt-1 text-sm font-black text-white">检查瓶口气体</div>
                </div>
              </div>
              {verificationResolved && (
                <div className="mt-4 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4 text-sm font-semibold leading-6 text-emerald-50" aria-live="polite">
                  选择正确。两种操作都依据“氧气能使带火星木条复燃”，差别只在判断目标和木条位置。
                </div>
              )}
            </div>
          </div>

          {verificationResolved && (
            <button
              type="button"
              onClick={() => setStage('safety')}
              className="mt-5 w-full rounded-2xl bg-cyan-400 px-5 py-4 text-base font-black text-cyan-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-300"
            >
              气体确认无误，进入安全收尾 →
            </button>
          )}
        </div>
      </section>
    );
  }

  if (stage === 'safety') {
    const safetyResolved = safetyAnswer === 1;
    return (
      <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="oxygen-safety-title">
        <div className="mx-auto max-w-4xl">
          <div className="pr-12">
            <div className="text-[11px] font-black tracking-[0.18em] text-emerald-300">实验方案与操作决策型 · 第 5/5 阶段</div>
            <h2 id="oxygen-safety-title" className="mt-1 text-xl font-black text-white sm:text-2xl">最后判断：怎样安全结束常温制氧？</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-300">
              情境：分液漏斗仍在滴加过氧化氢，导管口浸在水槽中。氧气已经收集完毕，下一步怎么做？
            </p>
          </div>

          <div className="mt-4"><StageProgress stage={stage} /></div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
            <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5">
              <div className="text-xs font-black tracking-widest text-cyan-300">请选择操作顺序</div>
              <div className="mt-4 space-y-3">
                {[
                  '反应还在进行时，立即拔下橡皮塞并拆开锥形瓶',
                  '先关闭分液漏斗活塞停止滴加；等反应停止后再拆卸、清洗',
                ].map((option, index) => {
                  const selected = safetyAnswer === index;
                  const correct = safetyResolved && index === 1;
                  const incorrect = selected && index === 0;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={safetyResolved}
                      onClick={() => setSafetyAnswer(index)}
                      className={`w-full rounded-2xl border-2 px-4 py-4 text-left text-sm font-black leading-6 transition ${
                        correct
                          ? 'border-emerald-300 bg-emerald-400/15 text-emerald-50'
                          : incorrect
                            ? 'border-rose-300 bg-rose-400/15 text-rose-50'
                            : 'border-slate-700 bg-slate-950/70 text-slate-100 hover:border-cyan-300'
                      }`}
                    >
                      <span className="mr-2 text-xs text-slate-400">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {safetyAnswer === 0 && (
                <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-400/10 p-4 text-sm font-semibold leading-6 text-rose-100" aria-live="polite">
                  两种药品还在接触并持续放出氧气。此时强行拆开装置，药液和气体可能逸出。应先停止加入反应物。
                </div>
              )}

              {safetyResolved && (
                <div className="mt-4 rounded-2xl border border-emerald-300/50 bg-emerald-400/10 p-4" aria-live="polite">
                  <div className="text-sm font-black text-emerald-100">选择正确：先停止滴加，再等待反应结束</div>
                  <p className="mt-1.5 text-sm font-semibold leading-6 text-emerald-50">
                    关闭活塞后，不再有新的过氧化氢进入锥形瓶；等瓶内气泡停止，再拆卸、清洗仪器，并按要求处理剩余药品。
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-cyan-300/30 bg-gradient-to-br from-cyan-500/15 to-indigo-500/10 p-5">
              <div className="text-xs font-black tracking-widest text-cyan-200">把口诀还原成因果</div>
              <div className="mt-4 space-y-2 text-center text-sm font-black">
                <div className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5">关闭分液漏斗活塞</div>
                <div className="text-cyan-300">↓</div>
                <div className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5">停止加入过氧化氢</div>
                <div className="text-cyan-300">↓</div>
                <div className="rounded-xl border border-emerald-300/50 bg-emerald-400/10 px-3 py-2.5 text-emerald-100">反应停止后再拆洗</div>
              </div>
              <div className="mt-4 rounded-xl bg-white/5 p-3 text-xs font-bold leading-5 text-slate-300">
                决策规则：先判断危险通道在哪里，再决定先切断什么，不靠死背操作顺序。
              </div>
            </div>
          </div>

          {safetyResolved && (
            <button
              type="button"
              onClick={onComplete}
              className="mt-5 w-full rounded-2xl bg-emerald-400 px-5 py-4 text-base font-black text-emerald-950 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-300"
            >
              五阶段决策完成，整理完整知识 →
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="oxygen-collection-title">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 pr-12">
          <div className="text-[11px] font-black tracking-[0.18em] text-cyan-300">
            {collectionOnly ? '氧气收集方法互动' : '实验方案与操作决策型 · 第 3/5 阶段'} · 收集任务 {missionIndex + 1}/3
          </div>
          <h2 id="oxygen-collection-title" className="mt-1 text-xl font-black text-white sm:text-2xl">
            {collectionOnly ? '排水法与排空气法：谁被排走？' : '氧气已经产生：再选择收集方法'}
          </h2>
          <p className="mt-1.5 max-w-3xl text-sm font-semibold leading-6 text-slate-300">
            根据两条证据作出选择：氧气<span className="text-cyan-200">不易溶于水</span>，密度比空气<span className="text-cyan-200">略大</span>。运行后盯住原有物质，看清究竟是谁被排走。
          </p>
        </div>

        {!collectionOnly && <StageProgress stage={stage} />}

        <div className="mb-4 grid grid-cols-3 gap-1.5" aria-label={`收集方法任务进度：第 ${missionIndex + 1} 个，共 3 个`}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`h-1 rounded-full ${index < missionIndex ? 'bg-emerald-400' : index === missionIndex ? 'bg-cyan-300' : 'bg-slate-800'}`}
            />
          ))}
        </div>

        <div className="mb-4 rounded-3xl border border-cyan-300/35 bg-gradient-to-br from-cyan-500/15 to-indigo-500/10 p-4 sm:p-5">
          <div className="text-[11px] font-black tracking-widest text-cyan-200">{mission.eyebrow}</div>
          <h3 className="mt-1.5 text-lg font-black text-white sm:text-xl">{mission.title}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">{mission.constraint}</p>
          <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm font-black text-white">
            {mission.prompt}
          </div>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2" role="group" aria-label="选择氧气收集方法">
          {(Object.keys(methodInfo) as CollectionMethod[]).map((key) => {
            const selected = candidateMethod === key;
            const correct = selected && methodConfirmed;
            const incorrect = selected && !methodConfirmed;
            return (
              <button
                key={key}
                type="button"
                onClick={() => chooseMethod(key)}
                disabled={running || observed || methodConfirmed}
                className={`min-h-14 rounded-2xl border px-2 py-2 text-xs font-black transition sm:text-sm ${
                  correct
                    ? 'border-emerald-300 bg-emerald-400/20 text-emerald-50'
                    : incorrect
                      ? 'border-rose-300 bg-rose-400/15 text-rose-100'
                      : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 disabled:opacity-55'
                }`}
              >
                <span className="block">{completed[key] ? '✓ ' : ''}{methodInfo[key].shortLabel}</span>
              </button>
            );
          })}
        </div>

        {methodFeedback && (
          <div
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-bold leading-6 ${
              methodConfirmed
                ? 'border-emerald-300/40 bg-emerald-400/10 text-emerald-100'
                : 'border-amber-300/40 bg-amber-400/10 text-amber-100'
            }`}
            aria-live="polite"
          >
            {methodFeedback}
          </div>
        )}

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div className="overflow-hidden rounded-[1.4rem] border border-slate-700 bg-slate-900 shadow-2xl shadow-black/25">
            {methodConfirmed ? (
              <CollectionVisual method={method} running={running} progress={progress} runId={runId} />
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center sm:min-h-72">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 text-3xl">?</div>
                <div className="mt-4 text-base font-black text-white">装置暂不展示</div>
                <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-400">
                  先用任务目标和氧气性质作出选择，选定后才能运行并看到真实后果。
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-cyan-300">当前状态</div>
                  <div className="mt-0.5 text-lg font-black text-white">{methodConfirmed ? info.label : '等待选择方法'}</div>
                </div>
                <div className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                  已完成 {completedCount}/3
                </div>
              </div>

              <button
                type="button"
                onClick={startExperiment}
                disabled={running || !methodConfirmed}
                className="mt-4 w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/40 transition hover:bg-cyan-300 disabled:cursor-wait disabled:bg-slate-700 disabled:text-slate-300"
              >
                {!methodConfirmed ? '先完成方法选择' : running ? `持续进气中 · ${progressPercent}%` : observed ? '重新运行一次' : missionIndex === 2 ? '运行反例实验' : '开始通入氧气'}
              </button>

              {running && (
                <div className="mt-3" aria-live="polite">
                  <div className="mb-1.5 flex items-center justify-between text-[11px] font-black text-cyan-200">
                    <span>气流持续进入，观察瓶内变化</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {!observed && (
                <p className="mt-3 text-xs font-semibold leading-5 text-slate-400">
                  观察提示：过程持续约 4 秒。盯住瓶内原来的物质，看看它如何逐渐离开。
                </p>
              )}
            </div>

            {observed && (
              <div className="rounded-2xl border border-amber-300/40 bg-amber-400/10 p-4" aria-live="polite">
                <div className="text-xs font-black text-amber-200">你看到了什么？</div>
                <p className="mt-1.5 text-sm font-bold leading-6 text-amber-50">{info.observation}</p>
                <p className="mt-3 text-sm font-black leading-6 text-white">{info.question}</p>
                <div className="mt-3 space-y-2">
                  {info.answers.map((answer, index) => {
                    const selected = selectedAnswer === index;
                    const correct = resolved && index === info.correctAnswer;
                    const incorrect = selected && index !== info.correctAnswer;
                    return (
                      <button
                        key={answer}
                        type="button"
                        onClick={() => answerQuestion(index)}
                        disabled={resolved}
                        className={`w-full rounded-xl border px-3 py-2.5 text-left text-xs font-bold leading-5 transition ${
                          correct
                            ? 'border-emerald-300 bg-emerald-400/20 text-emerald-50'
                            : incorrect
                              ? 'border-rose-300 bg-rose-400/15 text-rose-100'
                              : 'border-slate-600 bg-slate-900/70 text-slate-200 hover:border-cyan-300'
                        }`}
                      >
                        {answer}
                      </button>
                    );
                  })}
                </div>
                {selectedAnswer !== null && !resolved && (
                  <p className="mt-2 text-xs font-bold text-rose-200">再观察移动方向：最后是谁从瓶口离开？</p>
                )}
              </div>
            )}

            {resolved && (
              <div className={`rounded-2xl border p-4 ${toneClasses}`} aria-live="polite">
                <div className="text-xs font-black opacity-80">观察结论</div>
                <div className="mt-1 text-lg font-black">{info.displaced}</div>
                <p className="mt-2 text-sm font-semibold leading-6">{info.conclusion}</p>
                <button
                  type="button"
                  onClick={moveToNextMission}
                  className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-slate-100"
                >
                  {missionIndex === missions.length - 1
                    ? collectionOnly
                      ? '三种方法观察完成，整理知识 →'
                      : '完成收集，进入检验与验满 →'
                    : '条件改变，进入下一任务 →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function OxygenCollectionLab({ onComplete }: { onComplete?: () => void }) {
  const [route, setRoute] = useState<'collection' | 'peroxide' | 'heated' | null>(null);

  if (route === 'collection') return <PeroxideOxygenRoute collectionOnly onComplete={onComplete} />;
  if (route === 'peroxide') return <PeroxideOxygenRoute onComplete={onComplete} />;
  if (route === 'heated') return <HeatedOxygenPreparationLab onComplete={onComplete} />;

  return (
    <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="oxygen-route-title">
      <div className="mx-auto max-w-5xl">
        <div className="pr-12">
          <div className="text-[11px] font-black tracking-[0.18em] text-cyan-300">实验方案与操作决策型 · 氧气的制取</div>
          <h2 id="oxygen-route-title" className="mt-1 text-xl font-black sm:text-2xl">选择一条实验路线</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">同样制取氧气，反应物状态和反应条件不同，发生装置与收尾规则也会改变。</p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <button type="button" onClick={() => setRoute('collection')} className="overflow-hidden rounded-3xl border-2 border-emerald-300/45 bg-slate-900 text-left transition hover:-translate-y-0.5 hover:border-emerald-300">
            <div className="aspect-video overflow-hidden bg-slate-950">
              <CollectionVisual method="water" running={false} progress={0.72} runId={0} />
            </div>
            <div className="p-5">
              <div className="text-[11px] font-black tracking-widest text-emerald-300">重点互动 · 收集方法</div>
              <h3 className="mt-1.5 text-lg font-black">排水法与排空气法对比</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-400">先选方法，再观察水、空气和氧气的移动；明确到底是谁被排走。</p>
              <div className="mt-4 rounded-xl bg-emerald-400 px-4 py-3 text-center text-sm font-black text-emerald-950">直接进入收集动画 →</div>
            </div>
          </button>

          <button type="button" onClick={() => setRoute('peroxide')} className="overflow-hidden rounded-3xl border-2 border-cyan-300/35 bg-slate-900 text-left transition hover:border-cyan-300 hover:-translate-y-0.5">
            <div className="aspect-video overflow-hidden">
              <OxygenRoutePreview kind="peroxide" />
            </div>
            <div className="p-5">
              <div className="text-[11px] font-black tracking-widest text-cyan-300">路线一 · 固液常温型</div>
              <h3 className="mt-1.5 text-lg font-black">过氧化氢＋二氧化锰制氧气</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-400">重点：分液漏斗控制滴速、常温反应、关闭活塞后安全拆洗。</p>
              <div className="mt-4 rounded-xl bg-cyan-400 px-4 py-3 text-center text-sm font-black text-cyan-950">进入常温制氧路线 →</div>
            </div>
          </button>

          <button type="button" onClick={() => setRoute('heated')} className="overflow-hidden rounded-3xl border-2 border-violet-300/35 bg-slate-900 text-left transition hover:border-violet-300 hover:-translate-y-0.5">
            <div className="aspect-video overflow-hidden">
              <OxygenRoutePreview kind="heated" />
            </div>
            <div className="p-5">
              <div className="text-[11px] font-black tracking-widest text-violet-300">路线二 · 固体加热型</div>
              <h3 className="mt-1.5 text-lg font-black">加热高锰酸钾制氧气</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-400">重点：棉花、管口方向、预热、收集时机，以及先移导管后熄灯。</p>
              <div className="mt-4 rounded-xl bg-violet-400 px-4 py-3 text-center text-sm font-black text-violet-950">进入固体加热路线 →</div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
