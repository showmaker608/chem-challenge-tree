import { useId, useState } from 'react';

export type CylinderEyeAngle = 'up' | 'normal' | 'down';

interface GraduatedCylinderReaderProps {
  variant?: 'standalone' | 'compact';
  angle?: CylinderEyeAngle;
  onAngleChange?: (angle: CylinderEyeAngle) => void;
  targetVolume?: number;
  actualVolume?: number;
  revealed?: boolean;
}

const angleInfo: Record<CylinderEyeAngle, {
  label: string;
  readingDelta: number;
  eyeY: number;
  result: string;
  measureResult: string;
}> = {
  down: {
    label: '俯视',
    readingDelta: 2,
    eyeY: 104,
    result: '读数偏大',
    measureResult: '实际量取偏少',
  },
  normal: {
    label: '平视',
    readingDelta: 0,
    eyeY: 174,
    result: '读数正确',
    measureResult: '实际量取准确',
  },
  up: {
    label: '仰视',
    readingDelta: -2,
    eyeY: 238,
    result: '读数偏小',
    measureResult: '实际量取偏多',
  },
};

function formatVolume(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function GraduatedCylinderReader({
  variant = 'standalone',
  angle: controlledAngle,
  onAngleChange,
  targetVolume = 25,
  actualVolume,
  revealed = true,
}: GraduatedCylinderReaderProps) {
  const [internalAngle, setInternalAngle] = useState<CylinderEyeAngle>('normal');
  const angle = controlledAngle ?? internalAngle;
  const info = angleInfo[angle];
  const gradientId = `cylinder-water-${useId().replace(/:/g, '')}`;
  const isCompact = variant === 'compact';
  const displayedActual = actualVolume ?? targetVolume;
  const readingLineY = isCompact
    ? clamp(174 - (displayedActual - targetVolume) * 4.5, 118, 220)
    : 174;
  const meniscusEdgeY = readingLineY - 12;
  const readingValue = targetVolume + info.readingDelta;
  const scaleValues = [targetVolume + 5, targetVolume + 2, targetVolume, targetVolume - 2];

  const chooseAngle = (nextAngle: CylinderEyeAngle) => {
    if (onAngleChange) onAngleChange(nextAngle);
    if (controlledAngle === undefined) setInternalAngle(nextAngle);
  };

  const visual = (
    <svg
      className={isCompact ? 'h-52 w-full max-w-md' : 'h-72 w-full'}
      viewBox="0 0 520 300"
      role="img"
      aria-label={`量筒${info.label}示意图`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.72" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.38" />
        </linearGradient>
      </defs>

      <rect x="188" y="30" width="122" height="230" rx="8" fill="#ffffff" fillOpacity="0.04" stroke="#94a3b8" strokeWidth="4" />
      <path d="M174 260 H324" fill="none" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

      {revealed && (
        <>
          <path
            d={`M193 ${meniscusEdgeY} Q249 ${readingLineY} 305 ${meniscusEdgeY} V254 H193 Z`}
            fill={`url(#${gradientId})`}
            className="transition-all duration-500"
          />
          <path
            d={`M193 ${meniscusEdgeY} Q249 ${readingLineY} 305 ${meniscusEdgeY}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="4"
            className="transition-all duration-500"
          />
        </>
      )}

      {[92, 132, 174, 218].map((y, index) => (
        <g key={y}>
          <line x1="188" y1={y} x2={index === 2 ? 220 : 211} y2={y} stroke="#94a3b8" strokeWidth={index === 2 ? 3 : 2} />
          <text x="172" y={y + 5} fill="#cbd5e1" fontSize="15" textAnchor="end" fontWeight="700">
            {formatVolume(scaleValues[index])}
          </text>
        </g>
      ))}

      {revealed && (
        <g className="transition-all duration-500">
          <line
            x1="382"
            y1={info.eyeY}
            x2="249"
            y2={readingLineY}
            stroke={angle === 'normal' ? '#22c55e' : '#fb7185'}
            strokeWidth="4"
            strokeDasharray="9 7"
          />
          <path
            d={`M374 ${info.eyeY} Q410 ${info.eyeY - 27} 446 ${info.eyeY} Q410 ${info.eyeY + 27} 374 ${info.eyeY} Z`}
            fill="#ffffff"
            fillOpacity="0.08"
            stroke={angle === 'normal' ? '#22c55e' : '#a78bfa'}
            strokeWidth="4"
          />
          <circle cx="410" cy={info.eyeY} r="11" fill={angle === 'normal' ? '#22c55e' : '#a78bfa'} />
        </g>
      )}

      {!revealed && (
        <text x="249" y="150" fill="#94a3b8" fontSize="16" textAnchor="middle" fontWeight="700">
          等待量取
        </text>
      )}
    </svg>
  );

  if (isCompact) {
    return (
      <div className="flex w-full flex-col items-center">
        <div className="mb-2 w-full rounded-lg border border-slate-700/70 bg-slate-900/90 px-3 py-2 text-center text-[10px] leading-relaxed text-slate-300">
          <div>
            设定读数体积：<strong className="font-mono text-cyan-300">{formatVolume(targetVolume)} mL</strong>
          </div>
          {revealed ? (
            <div className="text-amber-300">
              实际倒入：<strong className="font-mono text-white">{formatVolume(displayedActual)} mL</strong> · {info.measureResult}
            </div>
          ) : (
            <div className="text-indigo-300">选定视线后确认量取</div>
          )}
        </div>
        {visual}
      </div>
    );
  }

  return (
    <div className="my-4 w-full overflow-hidden rounded-3xl border border-slate-700 bg-[#0a0f1d] p-4 text-slate-100 shadow-xl sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold tracking-[0.18em] text-cyan-300">量筒读数观察器</div>
          <h3 className="mt-1 text-xl font-black">移动视线，观察读数怎样变化</h3>
        </div>
        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-200">真实体积固定为 25 mL</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
        <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-cyan-950/30 p-2">
          {visual}
        </div>

        <div className="flex flex-col justify-center rounded-2xl border border-slate-800 bg-slate-900/75 p-4">
          <div className="mb-3 text-sm font-bold text-slate-300">选择观察位置</div>
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="选择量筒观察位置">
            {(['down', 'normal', 'up'] as CylinderEyeAngle[]).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={angle === item}
                onClick={() => chooseAngle(item)}
                className={`rounded-xl border px-3 py-3 text-sm font-bold transition-colors ${
                  angle === item
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                    : 'border-slate-700 bg-slate-950/40 text-slate-300 hover:border-slate-500'
                }`}
              >
                {angleInfo[item].label}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/55 p-4" aria-live="polite">
            <div className="text-sm font-bold text-violet-300">{info.label}</div>
            <div className="mt-1 text-2xl font-black text-white">读数约为 {formatVolume(readingValue)} mL</div>
            <div className={`mt-2 text-sm font-bold ${angle === 'normal' ? 'text-emerald-300' : 'text-amber-300'}`}>{info.result}</div>
          </div>

          <div className="mt-4 rounded-xl border-l-4 border-emerald-400 bg-emerald-500/10 px-4 py-3 text-sm leading-relaxed text-slate-200">
            <strong className="text-emerald-300">必记：</strong>俯视读数偏大，仰视读数偏小。若按刻度量取液体，则仰视实际体积偏多，俯视实际体积偏少。
          </div>
        </div>
      </div>
    </div>
  );
}
