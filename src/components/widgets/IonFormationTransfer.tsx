import { useState } from 'react';

type TransferStep = 'ready' | 'removed' | 'transferred' | 'verified';
type FeedbackKind = 'hint' | 'answer' | 'success';

interface IonFormationTransferProps {
  onContinue: () => void;
}

interface AtomDiagramProps {
  symbol: string;
  name: string;
  nucleusCharge: number;
  shells: number[];
  status: string;
  highlightRemovableElectron?: boolean;
  highlightReceivedElectron?: boolean;
  onRemoveElectron?: () => void;
}

const radii = [28, 50, 72];
const ringColors = ['#0f766e', '#0369a1', '#7c3aed'];

function AtomDiagram({
  symbol,
  name,
  nucleusCharge,
  shells,
  status,
  highlightRemovableElectron = false,
  highlightReceivedElectron = false,
  onRemoveElectron,
}: AtomDiagramProps) {
  const electronCount = shells.reduce((sum, value) => sum + value, 0);
  const filterId = `ion-transfer-shadow-${symbol}`;
  const dots = shells.flatMap((count, shellIndex) => Array.from({ length: count }, (_, electronIndex) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * electronIndex) / Math.max(count, 1);
    return {
      key: `${shellIndex}-${electronIndex}`,
      shellIndex,
      electronIndex,
      x: 90 + Math.cos(angle) * radii[shellIndex],
      y: 90 + Math.sin(angle) * radii[shellIndex],
    };
  }));

  return (
    <div className="min-w-0 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] p-2.5 text-center shadow-sm lg:p-4">
      <div className="flex items-start justify-between gap-2 text-left">
        <div>
          <div className="text-sm font-black text-[var(--text-main)] lg:text-base">{name}</div>
          <div className="mt-0.5 text-[10px] font-bold text-[var(--text-muted)]">电子排布 {shells.filter((_, index) => index === 0 || shells[index] > 0).join('、')}</div>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-black ${status.includes('⁺')
          ? 'bg-rose-100 text-rose-800'
          : status.includes('⁻')
            ? 'bg-sky-100 text-sky-800'
            : 'bg-slate-100 text-slate-700'}`}
        >
          {status}
        </span>
      </div>

      <svg
        className="mx-auto mt-1 aspect-square w-full max-w-[210px]"
        viewBox="0 0 180 180"
        role="img"
        aria-label={`${name}结构示意图，核电荷数加${nucleusCharge}，共有${electronCount}个电子`}
      >
        <defs>
          <filter id={filterId} x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.4" floodColor="#312e81" floodOpacity="0.35" />
          </filter>
        </defs>
        {radii.map((radius, index) => (
          <circle
            key={radius}
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={shells[index] > 0 ? ringColors[index] : 'var(--border-color)'}
            strokeWidth={shells[index] > 0 ? '2.4' : '1.5'}
            opacity={shells[index] > 0 ? '0.92' : '0.45'}
          />
        ))}
        <circle cx="90" cy="90" r="21" fill="var(--accent)" />
        <text x="90" y="88" textAnchor="middle" fontSize="15" fontWeight="900" fill="white">{symbol}</text>
        <text x="90" y="103" textAnchor="middle" fontSize="10" fontWeight="800" fill="white">+{nucleusCharge}</text>

        {dots.map((dot) => {
          const removable = highlightRemovableElectron && dot.shellIndex === 2 && dot.electronIndex === shells[2] - 1;
          const received = highlightReceivedElectron && dot.shellIndex === 2 && dot.electronIndex === shells[2] - 1;
          return (
            <g
              key={dot.key}
              transform={`translate(${dot.x} ${dot.y})`}
              role={removable ? 'button' : undefined}
              tabIndex={removable ? 0 : undefined}
              aria-label={removable ? '点击移走钠原子最外层电子' : undefined}
              onClick={removable ? onRemoveElectron : undefined}
              onKeyDown={removable ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') onRemoveElectron?.();
              } : undefined}
              className={removable ? 'cursor-pointer outline-none' : undefined}
            >
              {(removable || received) && (
                <circle r="13" fill="none" stroke={removable ? '#f59e0b' : '#10b981'} strokeWidth="3" className="animate-pulse" />
              )}
              <circle
                r="7.5"
                fill={removable ? '#f59e0b' : received ? '#10b981' : '#4338ca'}
                stroke="#ffffff"
                strokeWidth="2.4"
                filter={`url(#${filterId})`}
              />
              <text x="0" y="3.2" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#ffffff">−</text>
            </g>
          );
        })}
      </svg>

      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-black lg:text-xs">
        <div className="rounded-lg bg-rose-50 px-1.5 py-2 text-rose-800">质子 {nucleusCharge}</div>
        <div className="rounded-lg bg-indigo-50 px-1.5 py-2 text-indigo-800">电子 {electronCount}</div>
      </div>
    </div>
  );
}

function feedbackClass(kind: FeedbackKind) {
  if (kind === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-950';
  if (kind === 'hint') return 'border-amber-200 bg-amber-50 text-amber-950';
  return 'border-rose-200 bg-rose-50 text-rose-950';
}

export function IonFormationTransfer({ onContinue }: IonFormationTransferProps) {
  const [step, setStep] = useState<TransferStep>('ready');
  const [feedback, setFeedback] = useState<{ kind: FeedbackKind; text: string }>({
    kind: 'hint',
    text: '先观察Na原子的最外层：点击闪动的电子，把它从Na原子上取下来。',
  });

  const naShells = step === 'ready' ? [2, 8, 1] : [2, 8, 0];
  const clShells = step === 'transferred' || step === 'verified' ? [2, 8, 8] : [2, 8, 7];
  const stepIndex = step === 'ready' ? 0 : step === 'removed' ? 1 : step === 'transferred' ? 2 : 3;

  const removeElectron = () => {
    if (step !== 'ready') return;
    setStep('removed');
    setFeedback({
      kind: 'success',
      text: 'Na最外层的1个电子已经移出。Na现在仍有11个质子，但只剩10个电子。下一步：这枚电子应该交给谁？',
    });
  };

  const chooseDestination = (destination: 'chlorine' | 'neon') => {
    if (step !== 'removed') return;
    if (destination === 'neon') {
      setFeedback({
        kind: 'answer',
        text: 'Ne原子本来就是2、8的相对稳定结构，不需要这枚电子。比较Cl的2、8、7，它只差1个电子达到2、8、8。',
      });
      return;
    }

    setStep('transferred');
    setFeedback({
      kind: 'hint',
      text: '电子已经进入Cl最外层。现在不要靠名称猜：比较左右两边的质子数和电子数，判断它们分别变成了什么微粒。',
    });
  };

  const chooseIdentity = (answer: 'correct' | 'reversed' | 'neutral') => {
    if (step !== 'transferred') return;
    if (answer !== 'correct') {
      setFeedback({
        kind: 'answer',
        text: answer === 'reversed'
          ? '正负号反了：Na少了1个带负电的电子，应显正；Cl多了1个电子，应显负。'
          : '电子转移后质子数和电子数已经不相等，它们不再是中性原子。',
      });
      return;
    }

    setStep('verified');
    setFeedback({
      kind: 'success',
      text: '判断正确！Na：11p > 10e，形成Na⁺；Cl：17p < 18e，形成Cl⁻。原子核没变，改变的是核外电子数。',
    });
  };

  const reset = () => {
    setStep('ready');
    setFeedback({
      kind: 'hint',
      text: '重新开始：点击Na原子最外层闪动的电子，观察它离开后两边的电子数怎样变化。',
    });
  };

  return (
    <div className="px-4 py-4 lg:px-6 lg:py-6">
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-highlight)] p-3 lg:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-black tracking-wide text-violet-700">离子形成实验</div>
            <h3 className="mt-1 text-lg font-black text-[var(--text-main)] lg:text-2xl">把Na最外层电子转移给Cl</h3>
            <p className="mt-1 text-xs font-bold leading-5 text-[var(--text-muted)] lg:text-sm">
              先操作，再根据质子数和电子数给新微粒命名。
            </p>
          </div>
          <div className="rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-center text-xs font-black text-violet-800">
            Na 2、8、1
            <span className="block text-[10px]">Cl 2、8、7</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-1.5" aria-label="离子形成步骤">
          {['移走电子', '选择去向', '判断电性', '形成离子'].map((label, index) => (
            <div key={label} className={`rounded-lg px-1.5 py-2 text-center text-[9px] font-black lg:text-xs ${index <= stepIndex ? 'bg-teal-700 text-white' : 'bg-[var(--bg-disabled)] text-[var(--text-muted)]'}`}>
              {index + 1}. {label}
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_110px_minmax(0,1fr)] lg:gap-4">
          <AtomDiagram
            symbol="Na"
            name="钠原子一侧"
            nucleusCharge={11}
            shells={naShells}
            status={step === 'verified' ? 'Na⁺' : step === 'ready' ? 'Na原子' : '待判断'}
            highlightRemovableElectron={step === 'ready'}
            onRemoveElectron={removeElectron}
          />

          <div className="flex flex-row items-center justify-center gap-2 text-center sm:flex-col">
            <div className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-black shadow-sm transition-all lg:h-14 lg:w-14 lg:text-base ${step === 'removed'
              ? 'animate-bounce border-amber-300 bg-amber-100 text-amber-900'
              : step === 'transferred' || step === 'verified'
                ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
                : 'border-dashed border-[var(--border-color)] bg-[var(--bg-card-bright)] text-[var(--text-muted)]'}`}
            >
              {step === 'removed' ? 'e⁻' : step === 'transferred' || step === 'verified' ? '✓' : (
                <>
                  <span className="sm:hidden">↓</span>
                  <span className="hidden sm:inline">→</span>
                </>
              )}
            </div>
            <div className="text-[9px] font-black leading-4 text-[var(--text-muted)] lg:text-xs">
              {step === 'ready' ? '等待移出' : step === 'removed' ? '电子中转' : '已经转移'}
            </div>
          </div>

          <AtomDiagram
            symbol="Cl"
            name="氯原子一侧"
            nucleusCharge={17}
            shells={clShells}
            status={step === 'verified' ? 'Cl⁻' : step === 'transferred' ? '待判断' : 'Cl原子'}
            highlightReceivedElectron={step === 'transferred' || step === 'verified'}
          />
        </div>

        <div className={`mt-4 rounded-xl border px-3 py-3 text-sm font-bold leading-6 lg:px-4 lg:text-base lg:leading-7 ${feedbackClass(feedback.kind)}`} aria-live="polite">
          {feedback.text}
        </div>

        <div className="mt-3">
          {step === 'ready' && (
            <button type="button" onClick={removeElectron} className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-black text-amber-950 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-amber-400 lg:py-4 lg:text-base">
              点击Na最外层电子，把它移走 e⁻
            </button>
          )}

          {step === 'removed' && (
            <div>
              <div className="mb-2 text-center text-xs font-black text-[var(--text-muted)]">这枚电子交给谁，能让双方都形成相对稳定结构？</div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => chooseDestination('chlorine')} className="rounded-xl bg-teal-700 px-3 py-3 text-sm font-black text-white hover:bg-teal-600 lg:py-4 lg:text-base">
                  交给Cl原子
                </button>
                <button type="button" onClick={() => chooseDestination('neon')} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-3 py-3 text-sm font-black text-[var(--text-muted)] hover:border-rose-300 lg:py-4 lg:text-base">
                  交给Ne原子
                </button>
              </div>
            </div>
          )}

          {step === 'transferred' && (
            <div>
              <div className="mb-2 text-center text-xs font-black text-[var(--text-muted)]">电子转移后，左右微粒分别是什么？</div>
              <div className="grid gap-2 sm:grid-cols-3">
                <button type="button" onClick={() => chooseIdentity('correct')} className="rounded-xl bg-teal-700 px-2 py-3 text-sm font-black text-white hover:bg-teal-600">Na⁺ 和 Cl⁻</button>
                <button type="button" onClick={() => chooseIdentity('reversed')} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-2 py-3 text-sm font-black text-[var(--text-muted)]">Na⁻ 和 Cl⁺</button>
                <button type="button" onClick={() => chooseIdentity('neutral')} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-2 py-3 text-sm font-black text-[var(--text-muted)]">仍是Na和Cl原子</button>
              </div>
            </div>
          )}

          {step === 'verified' && (
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={reset} className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-3 text-sm font-black text-teal-900 hover:border-teal-400">
                再演示一次
              </button>
              <button type="button" onClick={onContinue} className="rounded-xl bg-teal-700 px-3 py-3 text-sm font-black text-white hover:bg-teal-600">
                进入原子与离子挑战 →
              </button>
            </div>
          )}
        </div>

        <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[10px] font-bold leading-5 text-sky-900 lg:text-xs">
          模型说明：这里用一个Na原子和一个Cl原子跟踪一枚电子的转移；实际反应中氯气以Cl₂参加反应。
        </div>
      </div>
    </div>
  );
}
