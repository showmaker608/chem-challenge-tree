import { useMemo, useState } from 'react';

type LabMode = 'ratio' | 'fraction' | 'mixture';

interface ElementPart {
  symbol: string;
  ar: number;
  count: number;
  color: string;
  soft: string;
}

interface Compound {
  key: string;
  formula: string;
  elements: ElementPart[];
}

const compounds: Compound[] = [
  {
    key: 'ethanol',
    formula: 'C₂H₆O',
    elements: [
      { symbol: 'C', ar: 12, count: 2, color: '#38bdf8', soft: '#e0f2fe' },
      { symbol: 'H', ar: 1, count: 6, color: '#fb923c', soft: '#ffedd5' },
      { symbol: 'O', ar: 16, count: 1, color: '#4ade80', soft: '#dcfce7' },
    ],
  },
  {
    key: 'sulfuric',
    formula: 'H₂SO₄',
    elements: [
      { symbol: 'H', ar: 1, count: 2, color: '#fb923c', soft: '#ffedd5' },
      { symbol: 'S', ar: 32, count: 1, color: '#f472b6', soft: '#fce7f3' },
      { symbol: 'O', ar: 16, count: 4, color: '#4ade80', soft: '#dcfce7' },
    ],
  },
  {
    key: 'calcium-carbonate',
    formula: 'CaCO₃',
    elements: [
      { symbol: 'Ca', ar: 40, count: 1, color: '#a78bfa', soft: '#ede9fe' },
      { symbol: 'C', ar: 12, count: 1, color: '#38bdf8', soft: '#e0f2fe' },
      { symbol: 'O', ar: 16, count: 3, color: '#4ade80', soft: '#dcfce7' },
    ],
  },
  {
    key: 'ammonium-nitrate',
    formula: 'NH₄NO₃',
    elements: [
      { symbol: 'N', ar: 14, count: 2, color: '#38bdf8', soft: '#e0f2fe' },
      { symbol: 'H', ar: 1, count: 4, color: '#fb923c', soft: '#ffedd5' },
      { symbol: 'O', ar: 16, count: 3, color: '#4ade80', soft: '#dcfce7' },
    ],
  },
  {
    key: 'ferrous-sulfate',
    formula: 'FeSO₄',
    elements: [
      { symbol: 'Fe', ar: 56, count: 1, color: '#a78bfa', soft: '#ede9fe' },
      { symbol: 'S', ar: 32, count: 1, color: '#f472b6', soft: '#fce7f3' },
      { symbol: 'O', ar: 16, count: 4, color: '#4ade80', soft: '#dcfce7' },
    ],
  },
];

const modeDefaults: Record<LabMode, { compound: string; target: string }> = {
  ratio: { compound: 'ethanol', target: 'C' },
  fraction: { compound: 'ammonium-nitrate', target: 'N' },
  mixture: { compound: 'calcium-carbonate', target: 'Ca' },
};

const modeMeta: Record<LabMode, { label: string; eyebrow: string; steps: string[] }> = {
  ratio: {
    label: '元素质量比',
    eyebrow: '第一关 · 三队称重',
    steps: ['看单个质量', '算各队总质量', '化成最简比'],
  },
  fraction: {
    label: '元素质量分数',
    eyebrow: '第二关 · 部分与整体',
    steps: ['看各队贡献', '找部分与整体', '化成百分数'],
  },
  mixture: {
    label: '混合物中元素质量',
    eyebrow: '第三关 · 两次筛选',
    steps: ['先按纯度筛选', '再取目标元素', '连成一步'],
  },
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function contribution(element: ElementPart) {
  return element.ar * element.count;
}

function formulaMass(compound: Compound) {
  return compound.elements.reduce((sum, element) => sum + contribution(element), 0);
}

function formatNumber(value: number, digits = 1) {
  const rounded = Number(value.toFixed(digits));
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(digits);
}

function clamp(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function Prompt({
  mode,
  compound,
  target,
  selected,
  onSelect,
}: {
  mode: LabMode;
  compound: Compound;
  target: ElementPart;
  selected: number | null;
  onSelect: (index: number) => void;
}) {
  const prompts = {
    ratio: {
      question: `在 ${compound.formula} 中，原子个数最多的元素，质量贡献一定最大吗？`,
      options: ['一定最大', '不一定，还要看每个原子多重'],
      answer: 1,
      success: '判断正确：人数多不等于整队最重，还要乘每个原子的相对原子质量。',
      hint: '先别只数下标。6个质量为1的H原子，可能还没有2个质量为12的C原子重。',
    },
    fraction: {
      question: `计算 ${compound.formula} 中 ${target.symbol} 元素的质量分数，分母应该是谁？`,
      options: [`${target.symbol}这一队的质量`, `${compound.formula}三队的总质量`, '化学式里元素的种类数'],
      answer: 1,
      success: '判断正确：质量分数是“目标元素这部分 ÷ 整个化合物”。',
      hint: '质量分数比较的是部分和整体。先把所有元素的质量贡献相加，才得到分母。',
    },
    mixture: {
      question: `${formatNumber(100)} g、纯度80%的${compound.formula}样品，先算 100×80%，得到的是什么？`,
      options: [`${target.symbol}元素质量`, `纯${compound.formula}质量`, '杂质质量'],
      answer: 1,
      success: `判断正确：第一步只能筛出纯${compound.formula}，还要再乘其中${target.symbol}的质量分数。`,
      hint: `纯度只告诉你样品里有多少纯${compound.formula}，并没有直接给出${target.symbol}元素质量。`,
    },
  } satisfies Record<LabMode, {
    question: string;
    options: string[];
    answer: number;
    success: string;
    hint: string;
  }>;

  const prompt = prompts[mode];
  const resolved = selected === prompt.answer;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
      <div className="text-xs font-black tracking-[0.15em] text-cyan-300">先凭直觉判断</div>
      <p className="mt-1.5 text-sm font-black leading-6 text-white sm:text-base">{prompt.question}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {prompt.options.map((option, index) => {
          const chosen = selected === index;
          const correct = index === prompt.answer;
          const classes = selected === null
            ? 'border-white/15 bg-slate-900/80 text-slate-100 hover:border-cyan-400/70'
            : correct
              ? 'border-emerald-400 bg-emerald-400/15 text-emerald-100'
              : chosen
                ? 'border-amber-400 bg-amber-400/10 text-amber-100'
                : 'border-white/10 bg-slate-900/50 text-slate-400';
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(index)}
              className={`rounded-xl border px-3 py-2 text-left text-xs font-bold leading-5 transition-colors sm:text-sm ${classes}`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div
          className={`mt-3 rounded-xl px-3 py-2 text-xs font-bold leading-5 sm:text-sm ${
            resolved ? 'bg-emerald-400/10 text-emerald-200' : 'bg-amber-400/10 text-amber-100'
          }`}
          role="status"
        >
          {resolved ? prompt.success : prompt.hint}
        </div>
      )}
    </div>
  );
}

function RatioStage({ compound, step }: { compound: Compound; step: number }) {
  const totals = compound.elements.map(contribution);
  const maxTotal = Math.max(...totals);
  const divisor = totals.reduce((value, item) => gcd(value, item));
  const simplest = totals.map((item) => item / divisor);

  return (
    <div className="space-y-2" aria-live="polite">
      {compound.elements.map((element, index) => (
        <div
          key={element.symbol}
          className="grid gap-2 border-b border-white/10 py-2.5 sm:grid-cols-[150px_minmax(210px,1fr)_minmax(180px,0.8fr)] sm:items-center sm:gap-4"
        >
          <div className="flex items-center gap-3">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 text-sm font-black text-slate-950"
              style={{ backgroundColor: element.soft, borderColor: element.color }}
            >
              {element.symbol}
            </span>
            <div>
              <div className="text-[0.65rem] font-bold text-slate-400">每个原子</div>
              <div className="text-sm font-black text-white">质量 {element.ar} 份</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {Array.from({ length: element.count }, (_, atomIndex) => (
              <span
                key={`${element.symbol}-${atomIndex}`}
                className="grid h-9 w-9 place-items-center rounded-full border text-xs font-black text-slate-950"
                style={{ backgroundColor: element.soft, borderColor: element.color }}
                aria-hidden="true"
              >
                {element.ar}
              </span>
            ))}
            <span className="ml-1 text-xs font-bold text-slate-400">× {element.count}个</span>
          </div>
          <div>
            <div className="mb-1.5 min-h-5 text-xs font-black text-white">
              {step >= 2 ? `${element.ar} × ${element.count} = ${totals[index]} 份` : '这一队一共多重？'}
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: step >= 2 ? `${totals[index] / maxTotal * 100}%` : '0%',
                  backgroundColor: element.color,
                }}
              />
            </div>
          </div>
        </div>
      ))}
      {step >= 3 && (
        <div className="mx-auto mt-3 max-w-2xl rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-center">
          <div className="text-xs font-bold text-cyan-200">比较各队原子的总质量</div>
          <div className="mt-1 text-sm font-black text-white sm:text-base">
            {compound.elements.map((element) => `m(${element.symbol})`).join(' : ')}
            {' = '}
            {totals.join(' : ')}
            {' = '}
            {simplest.join(' : ')}
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({
  compound,
  mutedExcept,
}: {
  compound: Compound;
  mutedExcept?: string;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-black text-slate-200">
      {compound.elements.map((element) => (
        <span key={element.symbol} className={mutedExcept && mutedExcept !== element.symbol ? 'opacity-45' : ''}>
          <span
            className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: element.color }}
          />
          {element.symbol}：{contribution(element)}份
        </span>
      ))}
    </div>
  );
}

function FractionStage({
  compound,
  target,
  step,
}: {
  compound: Compound;
  target: ElementPart;
  step: number;
}) {
  const total = formulaMass(compound);
  const targetMass = contribution(target);
  const percent = targetMass / total * 100;

  return (
    <div className="space-y-4 py-2" aria-live="polite">
      <div
        className="flex h-14 w-full overflow-hidden rounded-2xl bg-white/10 sm:h-20"
        role="img"
        aria-label={compound.elements.map((element) => `${element.symbol}元素贡献${contribution(element)}份`).join('，')}
      >
        {compound.elements.map((element) => (
          <div
            key={element.symbol}
            className={`h-full transition-opacity duration-300 ${
              step >= 2 && target.symbol !== element.symbol ? 'opacity-35' : 'opacity-100'
            }`}
            style={{
              width: `${contribution(element) / total * 100}%`,
              backgroundColor: element.color,
            }}
          />
        ))}
      </div>
      <Legend compound={compound} mutedExcept={step >= 2 ? target.symbol : undefined} />
      <div className="text-center text-xs font-bold text-slate-400 sm:text-sm">
        {step === 1
          ? `整条代表${compound.formula}，三队质量一共是多少份？`
          : `整体 ${total} 份，其中 ${target.symbol} 元素占 ${targetMass} 份`}
      </div>
      {step >= 2 && (
        <div className="mx-auto max-w-2xl rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-center">
          <div className="text-xs font-bold text-cyan-200">
            {step >= 3 ? '部分质量 ÷ 化合物总质量' : '先找到部分，再找到整体'}
          </div>
          <div className="mt-1 text-sm font-black text-white sm:text-base">
            {step >= 3
              ? `${targetMass} ÷ ${total} × 100% = ${formatNumber(percent)}%`
              : `w(${target.symbol}) = ${targetMass} ÷ ${total}`}
          </div>
        </div>
      )}
    </div>
  );
}

function MixtureStage({
  compound,
  target,
  step,
  sampleMass,
  purity,
}: {
  compound: Compound;
  target: ElementPart;
  step: number;
  sampleMass: number;
  purity: number;
}) {
  const total = formulaMass(compound);
  const targetPercent = contribution(target) / total * 100;
  const pureMass = sampleMass * purity / 100;
  const impurityMass = sampleMass - pureMass;
  const targetMass = pureMass * targetPercent / 100;
  const otherPureMass = pureMass - targetMass;

  const segments = step === 1
    ? [
        { label: `纯${compound.formula}`, mass: pureMass, color: '#38bdf8' },
        { label: '杂质', mass: impurityMass, color: '#64748b' },
      ]
    : [
        { label: target.symbol, mass: targetMass, color: target.color },
        { label: '纯物质中其他元素', mass: otherPureMass, color: '#38bdf8' },
        { label: '杂质', mass: impurityMass, color: '#64748b' },
      ];

  return (
    <div className="space-y-3 py-1" aria-live="polite">
      <div className="grid items-center gap-2 text-center sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <div className="text-xs font-bold text-slate-400">混合物</div>
          <div className="text-sm font-black text-white">{formatNumber(sampleMass)} g</div>
        </div>
        <div className="text-xs font-black text-cyan-300">
          {step === 1 ? '先看纯度 →' : '再看元素质量分数 →'}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <div className="text-xs font-bold text-slate-400">
            {step === 1 ? `纯${compound.formula}` : `其中${target.symbol}元素`}
          </div>
          <div className="text-sm font-black text-white">
            {step === 1
              ? `${formatNumber(sampleMass)} × ${formatNumber(purity)}% = ${formatNumber(pureMass)} g`
              : `${formatNumber(pureMass)} × ${formatNumber(targetPercent)}% = ${formatNumber(targetMass)} g`}
          </div>
        </div>
      </div>

      <div
        className="flex h-14 overflow-hidden rounded-2xl bg-white/10 sm:h-20"
        role="img"
        aria-label={segments.map((segment) => `${segment.label}${formatNumber(segment.mass)}克`).join('，')}
      >
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="h-full transition-[width] duration-500"
            style={{
              width: `${segment.mass / sampleMass * 100}%`,
              backgroundColor: segment.color,
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-black text-slate-200">
        {segments.map((segment) => (
          <span key={segment.label}>
            <span
              className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            {segment.label}：{formatNumber(segment.mass)} g
          </span>
        ))}
      </div>

      {step >= 3 && (
        <div className="mx-auto max-w-2xl rounded-2xl border border-violet-400/25 bg-violet-400/10 px-4 py-3 text-center">
          <div className="text-xs font-bold text-violet-200">
            混合物质量 × 纯度 × 纯物质中该元素的质量分数
          </div>
          <div className="mt-1 text-sm font-black text-white sm:text-base">
            {formatNumber(sampleMass)} g × {formatNumber(purity)}% × {formatNumber(targetPercent)}% = {formatNumber(targetMass)} g
          </div>
        </div>
      )}
    </div>
  );
}

export function ElementMassLab() {
  const [mode, setMode] = useState<LabMode>('ratio');
  const [compoundKey, setCompoundKey] = useState(modeDefaults.ratio.compound);
  const [targetSymbol, setTargetSymbol] = useState(modeDefaults.ratio.target);
  const [judgement, setJudgement] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [sampleMass, setSampleMass] = useState(100);
  const [purity, setPurity] = useState(80);

  const compound = useMemo(
    () => compounds.find((item) => item.key === compoundKey) ?? compounds[0],
    [compoundKey],
  );
  const target = compound.elements.find((element) => element.symbol === targetSymbol) ?? compound.elements[0];

  const changeMode = (nextMode: LabMode) => {
    const defaults = modeDefaults[nextMode];
    setMode(nextMode);
    setCompoundKey(defaults.compound);
    setTargetSymbol(defaults.target);
    setJudgement(null);
    setStep(1);
    setSampleMass(100);
    setPurity(80);
  };

  const changeCompound = (nextKey: string) => {
    const nextCompound = compounds.find((item) => item.key === nextKey) ?? compounds[0];
    setCompoundKey(nextCompound.key);
    setTargetSymbol(nextCompound.elements[0].symbol);
    setJudgement(null);
    setStep(1);
  };

  const judgementCorrect = judgement === 1;

  return (
    <div className="w-full border-b border-slate-800 bg-slate-950 pb-28 text-white">
      <div className="px-3 pt-4 sm:px-5 sm:pt-5 lg:px-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-black tracking-[0.18em] text-cyan-300">第12讲 · 元素称重站</div>
            <h3 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">从“三队称重”到混合物两次筛选</h3>
            <p className="mt-1 max-w-3xl text-xs font-bold leading-5 text-slate-400 sm:text-sm">
              不背三套公式：先算每种元素贡献了多少质量，再看它占整体多少；遇到混合物，先乘纯度。
            </p>
          </div>
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-200">
            {modeMeta[mode].eyebrow}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1.5" role="group" aria-label="选择计算类型">
          {(Object.keys(modeMeta) as LabMode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => changeMode(item)}
              aria-pressed={mode === item}
              className={`rounded-xl border px-2 py-2 text-xs font-black leading-4 transition-colors sm:text-sm ${
                mode === item
                  ? 'border-cyan-300 bg-cyan-400 text-slate-950'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/50'
              }`}
            >
              {modeMeta[item].label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="min-w-[130px] flex-1 text-xs font-black text-slate-300">
            化合物
            <select
              value={compound.key}
              onChange={(event) => changeCompound(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm font-black text-white outline-none focus:border-cyan-400"
            >
              {compounds.map((item) => (
                <option key={item.key} value={item.key}>{item.formula}</option>
              ))}
            </select>
          </label>

          {mode !== 'ratio' && (
            <label className="min-w-[105px] flex-1 text-xs font-black text-slate-300">
              目标元素
              <select
                value={target.symbol}
                onChange={(event) => {
                  setTargetSymbol(event.target.value);
                  setJudgement(null);
                  setStep(1);
                }}
                className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm font-black text-white outline-none focus:border-cyan-400"
              >
                {compound.elements.map((element) => (
                  <option key={element.symbol} value={element.symbol}>{element.symbol}</option>
                ))}
              </select>
            </label>
          )}

          {mode === 'mixture' && (
            <>
              <label className="min-w-[120px] flex-1 text-xs font-black text-slate-300">
                混合物质量（g）
                <input
                  value={sampleMass}
                  onChange={(event) => {
                    setSampleMass(clamp(Number(event.target.value), 1, 1000, 100));
                    setJudgement(null);
                    setStep(1);
                  }}
                  type="number"
                  min="1"
                  max="1000"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm font-black text-white outline-none focus:border-cyan-400"
                />
              </label>
              <label className="min-w-[100px] flex-1 text-xs font-black text-slate-300">
                纯度（%）
                <input
                  value={purity}
                  onChange={(event) => {
                    setPurity(clamp(Number(event.target.value), 0, 100, 80));
                    setJudgement(null);
                    setStep(1);
                  }}
                  type="number"
                  min="0"
                  max="100"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm font-black text-white outline-none focus:border-cyan-400"
                />
              </label>
            </>
          )}
        </div>

        {mode === 'mixture' && (
          <div className="mt-2 text-right text-[0.65rem] font-black text-amber-200">
            前提：杂质不含目标元素
          </div>
        )}

        <div className="mt-3 text-center">
          <span className="text-xs font-bold text-slate-400">
            {mode === 'mixture' ? '混合物的主要成分' : '一个化学式单位'}
          </span>
          <div className="mt-0.5 text-2xl font-black tracking-tight text-white sm:text-3xl">{compound.formula}</div>
        </div>

        <div className="mt-3">
          <Prompt
            mode={mode}
            compound={compound}
            target={target}
            selected={judgement}
            onSelect={setJudgement}
          />
        </div>

        {judgementCorrect && (
          <>
            <div className="mt-3 grid grid-cols-3 gap-1.5" role="group" aria-label="选择演示步骤">
              {modeMeta[mode].steps.map((label, index) => {
                const itemStep = index + 1;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setStep(itemStep)}
                    aria-pressed={step === itemStep}
                    className={`rounded-xl border px-2 py-2 text-[0.68rem] font-black leading-4 transition-colors sm:text-xs ${
                      step === itemStep
                        ? 'border-white bg-white text-slate-950'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/35'
                    }`}
                  >
                    {itemStep} {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 min-h-[250px] rounded-2xl border border-white/10 bg-slate-900/65 p-3 sm:p-4">
              {mode === 'ratio' && <RatioStage compound={compound} step={step} />}
              {mode === 'fraction' && <FractionStage compound={compound} target={target} step={step} />}
              {mode === 'mixture' && (
                <MixtureStage
                  compound={compound}
                  target={target}
                  step={step}
                  sampleMass={sampleMass}
                  purity={purity}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
