import { useState } from 'react';
import { elements20 } from '../../data/elements20';
import { IonFormationTransfer } from './IonFormationTransfer';

type TrainerMode = 'atom' | 'ion';
type LearningStage = 'guided' | 'formation' | 'challenge';
type FeedbackKind = 'hint' | 'answer' | 'success';

interface IonTask {
  atomicNumber: number;
  charge: number;
  symbol: string;
  action: string;
}

interface Feedback {
  kind: FeedbackKind;
  text: string;
}

interface GuidedTarget {
  name: string;
  symbol: string;
  atomicNumber: number;
  focus: string;
  completion: string;
  initialShells?: number[];
  taskLabel?: string;
  intro?: string;
}

const atomOrder = [11, 17, 8, 12, 13, 2, 10, 19, 20, 6, 7, 9, 14, 15, 16, 18, 1, 3, 4, 5];

const ionTasks: IonTask[] = [
  { atomicNumber: 11, charge: 1, symbol: 'Na⁺', action: '失去 1 个电子' },
  { atomicNumber: 17, charge: -1, symbol: 'Cl⁻', action: '得到 1 个电子' },
  { atomicNumber: 12, charge: 2, symbol: 'Mg²⁺', action: '失去 2 个电子' },
  { atomicNumber: 8, charge: -2, symbol: 'O²⁻', action: '得到 2 个电子' },
  { atomicNumber: 13, charge: 3, symbol: 'Al³⁺', action: '失去 3 个电子' },
  { atomicNumber: 9, charge: -1, symbol: 'F⁻', action: '得到 1 个电子' },
  { atomicNumber: 16, charge: -2, symbol: 'S²⁻', action: '得到 2 个电子' },
  { atomicNumber: 19, charge: 1, symbol: 'K⁺', action: '失去 1 个电子' },
  { atomicNumber: 20, charge: 2, symbol: 'Ca²⁺', action: '失去 2 个电子' },
];

const shellNames = ['K', 'L', 'M', 'N'];
const shellNumbers = [1, 2, 3, 4];
const theoreticalMaximums = [2, 8, 18, 32];
const first20TrainingLimits = [2, 8, 8, 2];
const ringRadii = [32, 58, 84, 110];
const shellVisuals = [
  { stroke: '#0f766e', dot: 'bg-teal-600', card: 'border-teal-200 bg-teal-50 text-teal-950' },
  { stroke: '#0369a1', dot: 'bg-sky-600', card: 'border-sky-200 bg-sky-50 text-sky-950' },
  { stroke: '#7c3aed', dot: 'bg-violet-600', card: 'border-violet-200 bg-violet-50 text-violet-950' },
  { stroke: '#c2410c', dot: 'bg-orange-600', card: 'border-orange-200 bg-orange-50 text-orange-950' },
];
const outerShellOptions = [2, 8, 18, 32];
const guidedTargets: GuidedTarget[] = [
  {
    name: '氦原子',
    symbol: 'He',
    atomicNumber: 2,
    focus: 'K 层也是最外层，最多 2 个',
    completion: '2 枚电子排完：2。氦只有 K 层，K 层作为最外层时最多容纳 2 个电子。',
  },
  {
    name: '氖原子',
    symbol: 'Ne',
    atomicNumber: 10,
    focus: '最外层达到 8 个电子',
    completion: '10 枚电子排完：2、8。氖的最外层有 8 个电子，达到相对稳定结构。',
  },
  {
    name: '钠原子',
    symbol: 'Na',
    atomicNumber: 11,
    focus: 'L 层排满后进入 M 层',
    completion: '11 枚电子排完：2、8、1。L 层排满后，第 11 枚电子进入 M 层。',
  },
  {
    name: '钾原子',
    symbol: 'K',
    atomicNumber: 19,
    focus: '迁移挑战：第 19 枚进哪层',
    completion: '钾原子排布完成：2、8、8、1。第 19 枚电子进入 N 层，而不是继续把 M 层填到 18。',
    initialShells: [2, 8, 8, 0],
    taskLabel: '判断钾原子的第 19 枚电子',
    intro: '已先排好 2、8、8。迁移挑战：钾原子的第 19 枚电子应该进入 M 层还是 N 层？',
  },
];

function electronDistribution(total: number) {
  const values: number[] = [];
  let remaining = total;
  for (const limit of first20TrainingLimits) {
    if (remaining <= 0) break;
    const value = Math.min(limit, remaining);
    values.push(value);
    remaining -= value;
  }
  return values;
}

function arraysEqual(left: number[], right: number[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function trimShells(values: number[]) {
  const next = [...values];
  while (next.length > 1 && next[next.length - 1] === 0) next.pop();
  return next;
}

function feedbackClass(kind: FeedbackKind) {
  if (kind === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-950';
  if (kind === 'hint') return 'border-amber-200 bg-amber-50 text-amber-950';
  return 'border-rose-200 bg-rose-50 text-rose-950';
}

export function ElectronShellTrainer() {
  const [stage, setStage] = useState<LearningStage>('guided');
  const [mode, setMode] = useState<TrainerMode>('atom');
  const [taskIndex, setTaskIndex] = useState(0);
  const [shells, setShells] = useState([0, 0, 0, 0]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [guidedTargetIndex, setGuidedTargetIndex] = useState(2);
  const [guidedShells, setGuidedShells] = useState([0, 0, 0, 0]);
  const [guidedFeedback, setGuidedFeedback] = useState<Feedback>({
    kind: 'hint',
    text: '先别急着填答案：第 1 枚电子应该进入哪一层？请自己选择。',
  });
  const [outerShellAnswer, setOuterShellAnswer] = useState<number | null>(null);

  const atomNumber = mode === 'atom'
    ? atomOrder[taskIndex % atomOrder.length]
    : ionTasks[taskIndex % ionTasks.length].atomicNumber;
  const element = elements20.find((item) => item.atomicNumber === atomNumber) ?? elements20[0];
  const ionTask = mode === 'ion' ? ionTasks[taskIndex % ionTasks.length] : null;
  const totalElectrons = mode === 'atom' ? atomNumber : atomNumber - (ionTask?.charge ?? 0);
  const expected = electronDistribution(totalElectrons);
  const studentShells = trimShells(shells);
  const targetLabel = mode === 'atom' ? `${element.name}原子 ${element.symbol}` : ionTask?.symbol ?? element.symbol;

  const guidedTarget = guidedTargets[guidedTargetIndex];
  const guidedExpected = electronDistribution(guidedTarget.atomicNumber);
  const guidedPlaced = guidedShells.reduce((sum, value) => sum + value, 0);
  const guidedPlacementComplete = guidedPlaced === guidedTarget.atomicNumber;
  const guidedComplete = guidedPlacementComplete && outerShellAnswer === 8;

  const displayedShells = stage === 'guided' ? guidedShells : shells;
  const displayedAtomicNumber = stage === 'guided' ? guidedTarget.atomicNumber : atomNumber;
  const displayedSymbol = stage === 'guided' ? guidedTarget.symbol : element.symbol;
  const displayedLabel = stage === 'guided'
    ? guidedTarget.taskLabel ?? `给${guidedTarget.name}的 ${guidedTarget.atomicNumber} 枚电子排队`
    : targetLabel;

  const resetAnswer = () => {
    setShells([0, 0, 0, 0]);
    setAttempts(0);
    setFeedback(null);
  };

  const resetGuided = () => {
    setGuidedShells(guidedTarget.initialShells ? [...guidedTarget.initialShells] : [0, 0, 0, 0]);
    setOuterShellAnswer(null);
    setGuidedFeedback({
      kind: 'hint',
      text: guidedTarget.intro ?? `重新开始：给${guidedTarget.name}排电子，第 1 枚应该进入哪一层？`,
    });
  };

  const changeGuidedTarget = (nextIndex: number) => {
    const nextTarget = guidedTargets[nextIndex];
    setGuidedTargetIndex(nextIndex);
    setGuidedShells(nextTarget.initialShells ? [...nextTarget.initialShells] : [0, 0, 0, 0]);
    setOuterShellAnswer(null);
    setGuidedFeedback({
      kind: 'hint',
      text: nextTarget.intro ?? `新任务：给${nextTarget.name}的 ${nextTarget.atomicNumber} 枚电子排队。第 1 枚应该进入哪一层？`,
    });
  };

  const changeMode = (nextMode: TrainerMode) => {
    setMode(nextMode);
    setTaskIndex(0);
    resetAnswer();
  };

  const chooseGuidedShell = (selectedIndex: number) => {
    if (guidedPlacementComplete) return;

    const correctIndex = guidedExpected.findIndex((limit, index) => guidedShells[index] < limit);
    if (selectedIndex !== correctIndex) {
      if (guidedTarget.symbol === 'K' && selectedIndex === 2) {
        setGuidedFeedback({
          kind: 'answer',
          text: 'M 层理论上能容纳 18 个电子，但 2n² 只表示容量上限，不表示实际排布时必须先填满。对前 20 号元素，钾的第 19 枚电子进入 N 层。',
        });
        return;
      }

      const selectedName = shellNames[selectedIndex];
      const correctName = shellNames[correctIndex];
      const selectedAlreadyFull = selectedIndex < correctIndex;
      setGuidedFeedback({
        kind: 'answer',
        text: selectedAlreadyFull
          ? `${selectedName} 层在当前排布中已经完成。下一枚电子应该进入 ${correctName} 层。`
          : `先别跳到 ${selectedName} 层：${correctName} 层还没有排完。电子通常先排能量较低、离核较近的电子层。`,
      });
      return;
    }

    const next = guidedShells.map((value, index) => (index === correctIndex ? value + 1 : value));
    const nextPlaced = guidedPlaced + 1;
    setGuidedShells(next);

    if (nextPlaced === 1) {
      setGuidedFeedback({
        kind: 'success',
        text: '正确！第 1 枚电子先进入离核最近、能量最低的 K 层。',
      });
      return;
    }

    if (nextPlaced === guidedTarget.atomicNumber) {
      setGuidedFeedback({
        kind: 'success',
        text: `${guidedTarget.completion} 现在再完成最后一道规则判断。`,
      });
      return;
    }

    if (next[0] === theoreticalMaximums[0] && guidedShells[0] < theoreticalMaximums[0]) {
      setGuidedFeedback({
        kind: 'success',
        text: 'K 层达到容量上限：2 × 1² = 2。下一枚电子要进入 L 层。',
      });
      return;
    }

    if (next[1] === theoreticalMaximums[1] && guidedShells[1] < theoreticalMaximums[1]) {
      setGuidedFeedback({
        kind: 'success',
        text: 'L 层达到容量上限：2 × 2² = 8。下一枚电子要进入 M 层。',
      });
      return;
    }

    setGuidedFeedback({
      kind: 'success',
      text: `第 ${nextPlaced} 枚电子进入 ${shellNames[correctIndex]} 层。继续判断下一枚电子的位置。`,
    });
  };

  const chooseOuterShellAnswer = (answer: number) => {
    setOuterShellAnswer(answer);
    if (answer === 8) {
      setGuidedFeedback({
        kind: 'success',
        text: '规则归纳正确：最外层通常不超过 8 个电子；K 层作为最外层时不超过 2 个。',
      });
      return;
    }

    setGuidedFeedback({
      kind: 'answer',
      text: answer === 2
        ? '2 是 K 层作为最外层时的特殊上限。一般最外层不超过 8 个电子。'
        : `${answer} 是某一整层的理论容量信息，不是最外层电子数的一般上限。`,
    });
  };

  const adjustShell = (index: number, delta: number) => {
    setShells((current) => current.map((value, shellIndex) => (
      shellIndex === index
        ? Math.max(0, Math.min(first20TrainingLimits[index], value + delta))
        : value
    )));
    setFeedback(null);
  };

  const checkAnswer = () => {
    if (arraysEqual(studentShells, expected)) {
      const outer = expected[expected.length - 1];
      const stable = (expected.length === 1 && outer === 2) || outer === 8;
      setFeedback({
        kind: 'success',
        text: `排布正确：${expected.join('、')}。最外层有 ${outer} 个电子${stable ? '，达到相对稳定结构' : ''}。`,
      });
      return;
    }

    const nextAttempt = attempts + 1;
    setAttempts(nextAttempt);
    if (nextAttempt === 1) {
      const enteredTotal = shells.reduce((sum, value) => sum + value, 0);
      const hint = enteredTotal !== totalElectrons
        ? `先核对电子总数。${mode === 'atom' ? '中性原子的电子数等于质子数。' : '离子要根据右上角电荷修正电子数。'}`
        : '电子通常先排能量较低的内层；K 层最多 2 个，再向外排。';
      setFeedback({ kind: 'hint', text: hint });
      return;
    }

    setFeedback({
      kind: 'answer',
      text: `正确排布是 ${expected.join('、')}。${mode === 'atom'
        ? `${element.name}原子有 ${atomNumber} 个质子和 ${atomNumber} 个电子。`
        : `${ionTask?.symbol}由${element.name}原子${ionTask?.action}形成，共有 ${totalElectrons} 个电子。`}`,
    });
  };

  const nextTask = () => {
    const length = mode === 'atom' ? atomOrder.length : ionTasks.length;
    setTaskIndex((current) => (current + 1) % length);
    resetAnswer();
  };

  const electronDots = displayedShells.flatMap((count, shellIndex) => {
    const radius = ringRadii[shellIndex];
    return Array.from({ length: count }, (_, electronIndex) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * electronIndex) / Math.max(count, 1);
      return {
        key: `${shellIndex}-${electronIndex}`,
        x: 150 + Math.cos(angle) * radius,
        y: 138 + Math.sin(angle) * radius,
      };
    });
  });

  return (
    <div className="w-full border-b border-[var(--border-color)] bg-[var(--bg-card)] pb-20 text-[var(--text-main)]">
      <div className="px-4 pt-4 lg:px-6 lg:pt-6">
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-highlight)] p-1.5 lg:gap-2" role="group" aria-label="选择学习阶段">
          <button
            type="button"
            aria-pressed={stage === 'guided'}
            onClick={() => setStage('guided')}
            className={`rounded-xl px-3 py-2.5 text-xs font-black transition-all lg:text-sm ${stage === 'guided' ? 'bg-teal-700 text-white shadow-md' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-bright)]'}`}
          >
            ① 电子排布
            <span className="mt-0.5 block text-[9px] font-bold opacity-75">先内后外</span>
          </button>
          <button
            type="button"
            aria-pressed={stage === 'formation'}
            onClick={() => setStage('formation')}
            className={`rounded-xl px-2 py-2.5 text-[11px] font-black transition-all lg:px-3 lg:text-sm ${stage === 'formation' ? 'bg-teal-700 text-white shadow-md' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-bright)]'}`}
          >
            ② 离子形成
            <span className="mt-0.5 block text-[9px] font-bold opacity-75">转移最外层电子</span>
          </button>
          <button
            type="button"
            aria-pressed={stage === 'challenge'}
            onClick={() => setStage('challenge')}
            className={`rounded-xl px-3 py-2.5 text-xs font-black transition-all lg:text-sm ${stage === 'challenge' ? 'bg-teal-700 text-white shadow-md' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card-bright)]'}`}
          >
            ③ 自由挑战
            <span className="mt-0.5 block text-[9px] font-bold opacity-75">原子与离子练习</span>
          </button>
        </div>
      </div>

      {stage === 'guided' && (
        <div className="grid grid-cols-2 gap-2 px-4 pt-3 sm:grid-cols-4 lg:gap-3 lg:px-6" role="group" aria-label="选择规则探究原子">
          {guidedTargets.map((target, index) => (
            <button
              key={target.symbol}
              type="button"
              aria-pressed={guidedTargetIndex === index}
              onClick={() => changeGuidedTarget(index)}
              className={`rounded-xl border px-2 py-2.5 text-left transition-all lg:px-4 lg:py-3 ${guidedTargetIndex === index
                ? 'border-teal-600 bg-teal-700 text-white shadow-md'
                : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] text-[var(--text-main)] hover:border-teal-300'}`}
            >
              <span className="text-sm font-black lg:text-base">{target.symbol} · {target.name}</span>
              <span className="mt-0.5 block text-[9px] font-bold leading-4 opacity-80 lg:text-[11px]">{target.focus}</span>
            </button>
          ))}
        </div>
      )}

      {stage === 'challenge' && (
        <div className="flex flex-wrap gap-2 px-4 pt-3 lg:gap-3 lg:px-6" role="group" aria-label="选择练习模式">
          <button
            type="button"
            aria-pressed={mode === 'atom'}
            onClick={() => changeMode('atom')}
            className={`rounded-full border px-3 py-2 text-xs font-black lg:px-5 lg:py-3 lg:text-sm ${mode === 'atom' ? 'border-teal-600 bg-teal-700 text-white' : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] text-[var(--text-muted)]'}`}
          >
            1-20 号原子
          </button>
          <button
            type="button"
            aria-pressed={mode === 'ion'}
            onClick={() => changeMode('ion')}
            className={`rounded-full border px-3 py-2 text-xs font-black lg:px-5 lg:py-3 lg:text-sm ${mode === 'ion' ? 'border-teal-600 bg-teal-700 text-white' : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] text-[var(--text-muted)]'}`}
          >
            常见离子
          </button>
        </div>
      )}

      {stage === 'formation' && (
        <IonFormationTransfer onContinue={() => setStage('challenge')} />
      )}

      {stage !== 'formation' && (
      <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(240px,.9fr)] lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,.8fr)] lg:gap-6 lg:p-6">
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-highlight)] p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-[var(--text-muted)]">{stage === 'guided' ? '规则探究任务' : '本题目标'}</div>
              <div className="mt-1 text-lg font-black lg:text-2xl">{displayedLabel}</div>
              {stage === 'guided' && (
                <div className="mt-1 text-xs font-bold text-teal-800">已排 {guidedPlaced} / {guidedTarget.atomicNumber} 枚</div>
              )}
            </div>
            <div className="rounded-xl bg-[var(--bg-card-bright)] px-3 py-2 text-center text-xs font-bold lg:px-4 lg:py-3 lg:text-sm">
              核电荷数<b className="ml-2 text-base text-teal-800 lg:text-xl">+{displayedAtomicNumber}</b>
            </div>
          </div>

          {stage === 'guided' && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--bg-disabled)]" aria-label={`已排入 ${guidedPlaced} 枚，共 ${guidedTarget.atomicNumber} 枚`}>
              <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all" style={{ width: `${(guidedPlaced / guidedTarget.atomicNumber) * 100}%` }} />
            </div>
          )}

          <svg
            className="mx-auto mt-2 h-72 w-full max-w-sm rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] lg:h-[26rem] lg:max-w-xl"
            viewBox="0 0 300 280"
            role="img"
            aria-label={`${displayedLabel}电子排布练习图，${shellNames.map((name, index) => `${name}层${displayedShells[index]}个电子`).join('，')}`}
          >
            <defs>
              <filter id="electron-shadow" x="-60%" y="-60%" width="220%" height="220%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.3" floodColor="#312e81" floodOpacity="0.35" />
              </filter>
            </defs>
            {ringRadii.map((radius, index) => (
              <circle
                key={radius}
                cx="150"
                cy="138"
                r={radius}
                fill="none"
                stroke={displayedShells[index] > 0 ? shellVisuals[index].stroke : 'var(--border-color)'}
                strokeWidth={displayedShells[index] > 0 ? '2.8' : '1.8'}
                opacity={displayedShells[index] > 0 ? '0.95' : '0.5'}
              />
            ))}
            <circle cx="150" cy="138" r="24" fill="var(--accent)" />
            <text x="150" y="135" textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--bg-card-bright)">{displayedSymbol}</text>
            <text x="150" y="153" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--bg-card-bright)">+{displayedAtomicNumber}</text>
            {electronDots.map((electron) => (
              <g key={electron.key} transform={`translate(${electron.x} ${electron.y})`}>
                <circle r="7.5" fill="#4338ca" stroke="#ffffff" strokeWidth="2.5" filter="url(#electron-shadow)" />
                <text x="0" y="3.2" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#ffffff">−</text>
              </g>
            ))}
          </svg>

          <div className="mt-2 grid grid-cols-4 gap-1.5" aria-label="各电子层当前电子数">
            {shellNames.map((name, index) => (
              <div key={name} className={`rounded-xl border px-1.5 py-2 text-center ${shellVisuals[index].card}`}>
                <div className="flex items-center justify-center gap-1 text-[10px] font-black">
                  <span className={`h-2 w-2 rounded-full ${shellVisuals[index].dot}`} />
                  {name} 层
                </div>
                <div className="mt-0.5 text-lg font-black leading-none">
                  {displayedShells[index]}
                  <span className="ml-0.5 text-[9px] font-bold">个</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-black lg:text-xs">
            <div className="rounded-xl border border-teal-100 bg-teal-50 px-2 py-2 text-teal-900">
              先内后外
              <span className="mt-0.5 block font-bold text-teal-700">先排能量较低层</span>
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50 px-2 py-2 text-sky-900">
              每层上限
              <span className="mt-0.5 block font-bold text-sky-700">2n²</span>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-2 py-2 text-amber-900">
              最外层
              <span className="mt-0.5 block font-bold text-amber-700">通常不超过 8</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:gap-4">
          {stage === 'guided' ? (
            <>
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] p-3 lg:p-4">
                {!guidedPlacementComplete ? (
                  <>
                    <div className="text-xs font-black text-[var(--text-muted)]">轮到第 {guidedPlaced + 1} 枚电子</div>
                    <h3 className="mt-1 text-base font-black lg:text-xl">它应该进入哪一层？</h3>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {shellNames.map((name, index) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => chooseGuidedShell(index)}
                          className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-highlight)] px-3 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50"
                        >
                          <span className="text-base font-black text-teal-900">{name} 层</span>
                          <span className="mt-0.5 block text-[10px] font-bold text-[var(--text-muted)]">第 {shellNumbers[index]} 层 · 理论上限 {theoreticalMaximums[index]}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-black text-[var(--text-muted)]">最后一道规则判断</div>
                    <h3 className="mt-1 text-base font-black lg:text-xl">一般情况下，最外层不超过几个电子？</h3>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {outerShellOptions.map((answer) => (
                        <button
                          key={answer}
                          type="button"
                          onClick={() => chooseOuterShellAnswer(answer)}
                          className={`rounded-xl border px-2 py-3 text-lg font-black transition-all ${outerShellAnswer === answer
                            ? answer === 8
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                              : 'border-rose-300 bg-rose-50 text-rose-900'
                            : 'border-[var(--border-color)] bg-[var(--bg-highlight)] hover:border-teal-300'}`}
                        >
                          {answer}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div aria-live="polite" className={`rounded-xl border px-3 py-3 text-sm font-bold leading-6 lg:px-4 lg:text-base lg:leading-7 ${feedbackClass(guidedFeedback.kind)}`}>
                {guidedFeedback.text}
              </div>

              {guidedComplete && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => changeGuidedTarget((guidedTargetIndex + 1) % guidedTargets.length)}
                    className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-3 text-xs font-black text-teal-900 transition-all hover:-translate-y-0.5 hover:border-teal-400 lg:text-sm"
                  >
                    换一个原子练习
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage('formation')}
                    className="rounded-xl bg-teal-700 px-3 py-3 text-xs font-black text-white shadow-lg shadow-teal-700/15 transition-all hover:-translate-y-0.5 hover:bg-teal-600 lg:text-sm"
                  >
                    下一步：让原子变成离子 →
                  </button>
                </div>
              )}

              <button type="button" onClick={resetGuided} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-3 py-2.5 text-xs font-black text-[var(--text-muted)]">
                重新演示
              </button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                {shellNames.map((name, index) => (
                  <div key={name} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] p-2">
                    <div className="flex items-center justify-between text-xs font-black lg:text-sm">
                      <span>{name} 层</span>
                      <span className="text-teal-800">当前 {shells[index]} 个</span>
                    </div>
                    <div className="mt-1 text-[9px] font-bold leading-4 text-[var(--text-muted)]">
                      {index < 2
                        ? `理论上限 2×${shellNumbers[index]}² = ${theoreticalMaximums[index]}`
                        : `理论上限 ${theoreticalMaximums[index]} · 前20号训练至 ${first20TrainingLimits[index]}`}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => adjustShell(index, -1)}
                        disabled={shells[index] === 0}
                        className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-highlight)] py-2 text-base font-black disabled:opacity-35 lg:py-3 lg:text-lg"
                        aria-label={`${name}层减少一个电子`}
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustShell(index, 1)}
                        disabled={shells[index] === first20TrainingLimits[index]}
                        className="rounded-lg bg-teal-700 py-2 text-base font-black text-white disabled:opacity-35 lg:py-3 lg:text-lg"
                        aria-label={`${name}层增加一个电子`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-[var(--bg-highlight)] px-3 py-2 text-xs font-bold text-[var(--text-muted)] lg:px-4 lg:py-3 lg:text-sm">
                当前填写：{shells.join('、')} · 共 {shells.reduce((sum, value) => sum + value, 0)} 个电子
              </div>

              <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[10px] font-bold leading-5 text-sky-900 lg:text-xs">
                <b>别把训练范围当成层容量：</b>M 层理论上限 18、N 层理论上限 32；前 20 号元素的简化实际排布范围是 2、8、8、2。
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <button type="button" onClick={checkAnswer} className="rounded-xl bg-teal-700 px-3 py-3 text-sm font-black text-white hover:bg-teal-600 lg:py-4 lg:text-base">
                  检查排布
                </button>
                <button type="button" onClick={nextTask} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-3 py-3 text-sm font-black text-[var(--text-muted)] lg:py-4 lg:text-base">
                  换一题
                </button>
              </div>

              <div aria-live="polite" className="min-h-14">
                {feedback && (
                  <div className={`rounded-xl border px-3 py-2 text-sm font-bold leading-6 lg:px-4 lg:py-3 lg:text-base lg:leading-7 ${feedbackClass(feedback.kind)}`}>
                    {feedback.text}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
