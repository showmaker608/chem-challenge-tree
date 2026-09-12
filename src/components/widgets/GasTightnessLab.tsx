import { useEffect, useRef, useState } from 'react';

type TrialState = 'idle' | 'warming' | 'success' | 'incomplete';

interface GasTightnessLabProps {
  onComplete: () => void;
}

export function GasTightnessLab({ onComplete }: GasTightnessLabProps) {
  const [stopcockClosed, setStopcockClosed] = useState(false);
  const [tubeImmersed, setTubeImmersed] = useState(false);
  const [trialState, setTrialState] = useState<TrialState>('idle');
  const [observationAnswer, setObservationAnswer] = useState<number | null>(null);
  const [conclusionAnswer, setConclusionAnswer] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const resetEvidence = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setTrialState('idle');
    setObservationAnswer(null);
    setConclusionAnswer(null);
  };

  const toggleStopcock = () => {
    if (trialState === 'warming' || conclusionAnswer === 0) return;
    resetEvidence();
    setStopcockClosed((value) => !value);
  };

  const toggleTube = () => {
    if (trialState === 'warming' || conclusionAnswer === 0) return;
    resetEvidence();
    setTubeImmersed((value) => !value);
  };

  const runWarmingTrial = () => {
    if (trialState === 'warming' || conclusionAnswer === 0) return;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setObservationAnswer(null);
    setConclusionAnswer(null);
    setTrialState('warming');
    timerRef.current = window.setTimeout(() => {
      setTrialState(stopcockClosed && tubeImmersed ? 'success' : 'incomplete');
      timerRef.current = null;
    }, 1900);
  };

  const chooseConclusion = (index: number) => {
    setConclusionAnswer(index);
    if (index === 0) onComplete();
  };

  const isWarming = trialState === 'warming';
  const canProduceEvidence = stopcockClosed && tubeImmersed;
  const showGasMotion = canProduceEvidence && (trialState === 'warming' || trialState === 'success');
  const observationCorrect = observationAnswer === 0;
  const conclusionCorrect = conclusionAnswer === 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-cyan-300/30 bg-slate-900 shadow-xl shadow-cyan-950/20">
      <div className="border-b border-slate-700 px-4 py-4 sm:px-5">
        <div className="text-[11px] font-black tracking-[0.16em] text-cyan-300">可操作实验台 · 装药前检查</div>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-lg font-black text-white">怎样让“气密性良好”变成可观察的证据？</h4>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-300">
              自由调整装置，再用手握住锥形瓶。先观察真实后果，不要凭口诀猜结论。
            </p>
          </div>
          <div className="rounded-full border border-amber-300/35 bg-amber-400/10 px-3 py-1.5 text-xs font-black text-amber-100">
            药品尚未加入
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-2 sm:p-4">
        <svg
          viewBox="0 0 760 430"
          role="img"
          aria-label={`气密性检查实验台：分液漏斗活塞${stopcockClosed ? '已关闭' : '仍开启'}，导管口${tubeImmersed ? '已浸入水中' : '仍在水面上方'}${showGasMotion ? '，手握锥形瓶后导管口出现气泡' : ''}`}
          className="h-auto w-full"
        >
          <defs>
            <linearGradient id="tightness-glass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#dbeafe" stopOpacity="0.66" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.52" />
            </linearGradient>
            <linearGradient id="tightness-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.64" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.82" />
            </linearGradient>
            <filter id="tightness-shadow" x="-20%" y="-20%" width="140%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.16" />
            </filter>
          </defs>

          <rect x="12" y="12" width="736" height="406" rx="28" fill="#f8fafc" stroke="#bae6fd" strokeWidth="2" />

          <g fontSize="13" fontWeight="800">
            <rect x="34" y="30" width="148" height="34" rx="17" fill={stopcockClosed ? '#059669' : '#e2e8f0'} />
            <text x="108" y="52" textAnchor="middle" fill={stopcockClosed ? '#ffffff' : '#334155'}>
              活塞：{stopcockClosed ? '已关闭' : '开启中'}
            </text>
            <rect x="194" y="30" width="164" height="34" rx="17" fill={tubeImmersed ? '#0284c7' : '#e2e8f0'} />
            <text x="276" y="52" textAnchor="middle" fill={tubeImmersed ? '#ffffff' : '#334155'}>
              导管口：{tubeImmersed ? '水中' : '水面上方'}
            </text>
            <rect x="370" y="30" width="152" height="34" rx="17" fill="#fef3c7" />
            <text x="446" y="52" textAnchor="middle" fill="#92400e">装药前 · 空装置</text>
          </g>

          <g filter="url(#tightness-shadow)">
            <rect x="72" y="91" width="24" height="275" rx="10" fill="#334155" />
            <rect x="42" y="352" width="180" height="22" rx="11" fill="#475569" />
            <rect x="94" y="163" width="152" height="16" rx="8" fill="#475569" />
            <rect x="162" y="120" width="18" height="178" rx="8" fill="#334155" />
            <rect x="142" y="158" width="58" height="16" rx="8" fill="#64748b" />

            <path d="M218 82 h72 l-10 72 q-4 30-26 30 q-22 0-26-30z" fill="url(#tightness-glass)" stroke="#0369a1" strokeWidth="6" />
            <path d="M254 184 v64" fill="none" stroke="#0369a1" strokeWidth="7" />
            <rect x="231" y="188" width="48" height="13" rx="6.5" fill="#334155" />
            <rect
              x="249"
              y="179"
              width="12"
              height="31"
              rx="6"
              fill={stopcockClosed ? '#10b981' : '#0ea5e9'}
              transform={stopcockClosed ? 'rotate(90 255 194.5)' : 'rotate(0 255 194.5)'}
              className="transition-transform duration-500"
            />
            <circle cx="255" cy="194" r="7" fill="#0f172a" />

            <path d="M192 238 h128" stroke="#475569" strokeWidth="22" strokeLinecap="round" />
            <path d="M216 250 v34 l-76 94 q-11 15 9 15 h214 q20 0 9-15 l-76-94 v-34" fill="url(#tightness-glass)" stroke="#334155" strokeWidth="7" strokeLinejoin="round" />
            <path d="M174 356 q82 26 164 0 l28 33 h-220z" fill="#e0f2fe" fillOpacity="0.52" />
            <text x="256" y="347" textAnchor="middle" fill="#64748b" fontSize="15" fontWeight="800">空锥形瓶</text>

            <path
              d={`M304 238 h44 q20 0 20 20 v18 h174 q28 0 28 28 v${tubeImmersed ? 61 : 13}`}
              fill="none"
              stroke="#334155"
              strokeWidth="15"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500"
            />
            <path
              d={`M304 238 h44 q20 0 20 20 v18 h174 q28 0 28 28 v${tubeImmersed ? 61 : 13}`}
              fill="none"
              stroke="#bae6fd"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-500"
            />
          </g>

          <g transform="translate(510 292)">
            <path d="M0 0 h172 l-15 111 h-142z" fill="#eff6ff" stroke="#0369a1" strokeWidth="5" />
            <path d="M8 43 h156 l-9 65 h-138z" fill="url(#tightness-water)" />
            <path d="M8 43 q18-8 36 0 t36 0 t36 0 t36 0" fill="none" stroke="#0284c7" strokeWidth="3" opacity="0.75" />
            <text x="86" y="92" textAnchor="middle" fill="#075985" fontSize="15" fontWeight="800">水</text>
          </g>

          {isWarming && (
            <g aria-hidden="true">
              <path d="M127 276 q-31 12-35 49 q-2 24 16 42" fill="none" stroke="#f59e0b" strokeWidth="14" strokeLinecap="round" opacity="0.72" />
              <path d="M383 277 q31 13 34 49 q2 24-17 42" fill="none" stroke="#f59e0b" strokeWidth="14" strokeLinecap="round" opacity="0.72" />
              <path d="M184 320 q72-22 144 0" fill="none" stroke="#fbbf24" strokeWidth="5" strokeDasharray="10 10" opacity="0.8">
                <animate attributeName="stroke-dashoffset" values="0;40" dur="0.8s" repeatCount="indefinite" />
              </path>
              <text x="256" y="408" textAnchor="middle" fill="#b45309" fontSize="14" fontWeight="900">手握瓶体 · 空气受热膨胀</text>
            </g>
          )}

          {showGasMotion && (
            <g aria-hidden="true">
              {[0, 0.45, 0.9].map((delay) => (
                <circle key={delay} r="6" fill="#22d3ee" stroke="#0e7490" strokeWidth="2">
                  <animateMotion
                    path="M320 238 H348 Q368 238 368 258 V276 H542 Q570 276 570 304 V365"
                    dur="1.5s"
                    begin={`${delay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
              {[0, 0.35, 0.7].map((delay, index) => (
                <circle key={delay} cx={570 + index * 10} cy="365" r="7" fill="none" stroke="#0284c7" strokeWidth="3">
                  <animate attributeName="cy" values="365;322" dur="1.25s" begin={`${delay}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0" dur="1.25s" begin={`${delay}s`} repeatCount="indefinite" />
                  <animate attributeName="r" values="4;10" dur="1.25s" begin={`${delay}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </g>
          )}

          {trialState === 'incomplete' && (
            <g>
              <rect x="524" y="80" width="188" height="70" rx="18" fill="#fff7ed" stroke="#fb923c" strokeWidth="3" />
              <text x="618" y="108" textAnchor="middle" fill="#9a3412" fontSize="14" fontWeight="900">没有得到可判断的现象</text>
              <text x="618" y="132" textAnchor="middle" fill="#c2410c" fontSize="12" fontWeight="700">继续调整装置后再试</text>
            </g>
          )}
        </svg>
      </div>

      <div className="border-t border-slate-700 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={toggleStopcock}
            disabled={isWarming || conclusionCorrect}
            className={`rounded-2xl border-2 px-4 py-3 text-left transition ${
              stopcockClosed
                ? 'border-emerald-300 bg-emerald-400/15 text-emerald-50'
                : 'border-slate-600 bg-slate-950 text-slate-100 hover:border-cyan-300'
            }`}
          >
            <div className="text-[10px] font-black tracking-widest text-slate-400">可调部件</div>
            <div className="mt-1 text-sm font-black">转动分液漏斗活塞</div>
            <div className="mt-1 text-xs font-bold opacity-70">当前：{stopcockClosed ? '关闭' : '开启'}</div>
          </button>
          <button
            type="button"
            onClick={toggleTube}
            disabled={isWarming || conclusionCorrect}
            className={`rounded-2xl border-2 px-4 py-3 text-left transition ${
              tubeImmersed
                ? 'border-sky-300 bg-sky-400/15 text-sky-50'
                : 'border-slate-600 bg-slate-950 text-slate-100 hover:border-cyan-300'
            }`}
          >
            <div className="text-[10px] font-black tracking-widest text-slate-400">可调部件</div>
            <div className="mt-1 text-sm font-black">移动导管末端</div>
            <div className="mt-1 text-xs font-bold opacity-70">当前：{tubeImmersed ? '浸入水中' : '水面上方'}</div>
          </button>
          <button
            type="button"
            onClick={runWarmingTrial}
            disabled={isWarming || conclusionCorrect}
            className="rounded-2xl border-2 border-amber-300/70 bg-amber-400 px-4 py-3 text-left text-amber-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-65"
          >
            <div className="text-[10px] font-black tracking-widest opacity-65">执行观察</div>
            <div className="mt-1 text-sm font-black">{isWarming ? '正在手握瓶体…' : '用手握住锥形瓶'}</div>
            <div className="mt-1 text-xs font-bold opacity-70">观察导管口是否出现现象</div>
          </button>
        </div>

        {trialState === 'idle' && (
          <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm font-semibold leading-6 text-slate-300">
            装置可以反复调整。想一想：怎样形成只有一个气体出口的密闭体系，又怎样把变化转化成看得见的现象？
          </div>
        )}

        {trialState === 'incomplete' && (
          <div className="mt-4 rounded-2xl border border-orange-300/40 bg-orange-400/10 px-4 py-3 text-sm font-semibold leading-6 text-orange-100" aria-live="polite">
            这次没有得到可以判断气密性的现象。检查气体是否只有一个出口，以及导管口的变化能否在水中被看见。
          </div>
        )}

        {trialState === 'success' && (
          <div className="mt-4 space-y-4" aria-live="polite">
            <div className="rounded-2xl border border-cyan-300/35 bg-cyan-400/10 p-4">
              <div className="text-xs font-black tracking-widest text-cyan-200">观察记录 1/2</div>
              <div className="mt-2 text-sm font-black text-white">刚才真正看到的现象是什么？</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {['导管口有气泡冒出', '锥形瓶内出现蓝色溶液', '分液漏斗中的液面明显上升'].map((option, index) => {
                  const selected = observationAnswer === index;
                  const correct = observationCorrect && index === 0;
                  const incorrect = selected && index !== 0;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={observationCorrect}
                      onClick={() => setObservationAnswer(index)}
                      className={`rounded-xl border-2 px-3 py-3 text-left text-xs font-black leading-5 transition ${
                        correct
                          ? 'border-emerald-300 bg-emerald-400/15 text-emerald-50'
                          : incorrect
                            ? 'border-rose-300 bg-rose-400/15 text-rose-50'
                            : 'border-slate-600 bg-slate-950 text-slate-100 hover:border-cyan-300'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {observationAnswer !== null && !observationCorrect && (
                <p className="mt-2 text-xs font-bold text-rose-200">只记录刚才在导管口真实出现的变化，再看一次动画。</p>
              )}
            </div>

            {observationCorrect && (
              <div className="rounded-2xl border border-emerald-300/35 bg-emerald-400/10 p-4">
                <div className="text-xs font-black tracking-widest text-emerald-200">依据现象判断 2/2</div>
                <div className="mt-2 text-sm font-black text-white">手握瓶体后，导管口持续冒泡，可以说明什么？</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {['装置气密性良好', '装置一定漏气', '过氧化氢已经开始分解'].map((option, index) => {
                    const selected = conclusionAnswer === index;
                    const correct = conclusionCorrect && index === 0;
                    const incorrect = selected && index !== 0;
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={conclusionCorrect}
                        onClick={() => chooseConclusion(index)}
                        className={`rounded-xl border-2 px-3 py-3 text-left text-xs font-black leading-5 transition ${
                          correct
                            ? 'border-emerald-300 bg-emerald-400/20 text-emerald-50'
                            : incorrect
                              ? 'border-rose-300 bg-rose-400/15 text-rose-50'
                              : 'border-slate-600 bg-slate-950 text-slate-100 hover:border-emerald-300'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {conclusionAnswer !== null && !conclusionCorrect && (
                  <p className="mt-2 text-xs font-bold text-rose-200">药品还没有加入，现象来自瓶内空气受热膨胀，不是化学反应。</p>
                )}
                {conclusionCorrect && (
                  <p className="mt-3 rounded-xl bg-emerald-300 px-3 py-2 text-sm font-black text-emerald-950">
                    证据链成立：密闭装置内空气受热膨胀，只能沿导管排出，因此水中出现气泡。
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
