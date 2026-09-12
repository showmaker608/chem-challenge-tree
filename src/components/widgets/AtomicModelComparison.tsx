import { useMemo, useState } from 'react';

type ModelKey = 'dalton' | 'thomson' | 'mystery';
type RouteKind = 'pass' | 'deflect' | 'rebound';

interface ModelInfo {
  year: string;
  tab: string;
  name: string;
  claim: string;
  prompt: string;
  verdict: string;
  routeLabels: [string, string, string];
}

interface ParticleRoute {
  d: string;
  kind: RouteKind;
}

interface InferenceStep {
  evidence: string;
  question: string;
  choices: [string, string];
  answer: number;
  hint: string;
  reason: string;
}

const modelInfo: Record<ModelKey, ModelInfo> = {
  dalton: {
    year: '1803',
    tab: '实心原子',
    name: '如果原子是实心小球',
    claim: '先把一个原子放大：内部没有空隙，α 粒子撞上后会怎样？',
    prompt: '先观察右侧的实心原子，再检验它预测的轨迹。',
    verdict: '预测与真实实验冲突：如果原子是实心的，大多数 α 粒子应该被挡住，不可能几乎都穿过金箔。',
    routeLabels: ['很少穿过', '一部分偏转', '多数受阻或弹回'],
  },
  thomson: {
    year: '1904',
    tab: '葡萄干面包',
    name: '如果正电荷均匀铺满原子',
    claim: '电子像“葡萄干”嵌在连续、均匀分布的正电荷中，α 粒子只会受到分散而微弱的作用。',
    prompt: '先观察右侧的均匀正电模型，再检验它预测的轨迹。',
    verdict: '这个模型能解释 α 粒子几乎全部近似直穿，却无法解释为什么会出现大角度偏转甚至反弹。',
    routeLabels: ['几乎全部近似直穿', '可能出现微小偏转', '极难大角度偏转或反弹'],
  },
  mystery: {
    year: '1911',
    tab: '只看实验',
    name: '先遮住答案，只看真实轨迹',
    claim: '不要先画原子内部结构。让三类实验现象自己说话。',
    prompt: '播放真实散射现象，再用每一类轨迹推出一条结构信息。',
    verdict: '',
    routeLabels: ['绝大多数直穿', '少数大角度偏转', '极少数反弹'],
  },
};

const routeSets: Record<ModelKey, ParticleRoute[]> = {
  dalton: [
    { d: 'M55 82 L315 82 Q248 58 155 34', kind: 'rebound' },
    { d: 'M55 108 L315 108 Q250 92 172 76', kind: 'rebound' },
    { d: 'M55 134 L315 134 Q250 132 165 132', kind: 'rebound' },
    { d: 'M55 160 L315 160 Q405 124 602 88', kind: 'deflect' },
    { d: 'M55 186 L315 186 Q250 198 170 220', kind: 'rebound' },
    { d: 'M55 212 L315 212 Q408 246 602 278', kind: 'deflect' },
    { d: 'M55 238 L315 238 Q250 266 158 300', kind: 'rebound' },
    { d: 'M55 264 L602 264', kind: 'pass' },
  ],
  thomson: [
    { d: 'M55 82 L602 82', kind: 'pass' },
    { d: 'M55 108 L602 108', kind: 'pass' },
    { d: 'M55 134 L315 134 Q430 126 602 118', kind: 'deflect' },
    { d: 'M55 160 L602 160', kind: 'pass' },
    { d: 'M55 186 L315 186 Q430 194 602 204', kind: 'deflect' },
    { d: 'M55 212 L602 212', kind: 'pass' },
    { d: 'M55 238 L602 238', kind: 'pass' },
    { d: 'M55 264 L602 264', kind: 'pass' },
  ],
  mystery: [
    { d: 'M55 82 L602 82', kind: 'pass' },
    { d: 'M55 108 L602 108', kind: 'pass' },
    { d: 'M55 134 L602 134', kind: 'pass' },
    { d: 'M55 160 L315 160 Q430 118 602 72', kind: 'deflect' },
    { d: 'M55 186 L602 186', kind: 'pass' },
    { d: 'M55 212 L315 212 Q430 250 602 292', kind: 'deflect' },
    { d: 'M55 238 L315 238 Q248 220 142 170', kind: 'rebound' },
    { d: 'M55 264 L602 264', kind: 'pass' },
  ],
};

const inferenceSteps: InferenceStep[] = [
  {
    evidence: '绝大多数 α 粒子直接穿过金箔',
    question: '这首先说明原子内部怎样？',
    choices: ['内部大部分是空的', '内部被物质填得很满'],
    answer: 0,
    hint: '如果内部被填满，带正电的 α 粒子还能几乎都直穿吗？',
    reason: '绝大多数直穿，说明它们在原子内部几乎没有遇到阻挡——原子内部大部分是空的。',
  },
  {
    evidence: '少数 α 粒子发生大角度偏转，极少数甚至反弹',
    question: 'α 粒子带正电，强烈偏转说明内部存在什么？',
    choices: ['能强烈排斥它的正电中心', '能强烈吸引它的负电中心'],
    answer: 0,
    hint: '同种电荷相斥。让正电 α 粒子“急转弯”的作用来自排斥还是吸引？',
    reason: 'α 粒子带正电，受到强烈排斥才会大角度偏转或反弹，说明原子内部存在带正电的中心。',
  },
  {
    evidence: '只有极少数 α 粒子遇到这种强烈排斥',
    question: '这个带正电的中心占原子的体积怎样？',
    choices: ['体积很小', '几乎占满整个原子'],
    answer: 0,
    hint: '如果正电区域很大，强烈偏转还会只是“极少数”吗？',
    reason: '只有极少数粒子靠近它，说明这个正电中心在原子中所占体积很小。',
  },
  {
    evidence: '极少数高速 α 粒子甚至几乎沿原路返回',
    question: '能把高速 α 粒子“顶回来”，还说明这个小中心怎样？',
    choices: ['质量集中、惯性很大', '质量很小、容易被撞走'],
    answer: 0,
    hint: '如果这个中心轻飘飘的，碰撞时它自己就容易后退，还能把高速 α 粒子近乎原路“顶回来”吗？',
    reason: '近乎原路反弹说明这个小中心具有很大的惯性；再结合电子质量很小，可知原子的几乎全部质量集中在原子核内。',
  },
];

const routeColor: Record<RouteKind, string> = {
  pass: 'var(--accent)',
  deflect: 'var(--warning)',
  rebound: 'var(--danger)',
};

function ModelDiagram({ model, revealed }: { model: ModelKey; revealed: boolean }) {
  if (model === 'dalton') {
    return (
      <svg viewBox="0 0 380 330" className="h-full w-full" role="img" aria-label="实心原子模型放大图">
        <rect x="8" y="8" width="364" height="314" rx="24" fill="var(--bg-highlight)" />
        <text x="190" y="38" textAnchor="middle" fontSize="17" fontWeight="800" fill="var(--text-main)">如果原子是实心的</text>
        <circle cx="218" cy="166" r="94" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="5" />
        <circle cx="188" cy="132" r="22" fill="var(--bg-card-bright)" opacity="0.25" />
        <path d="M24 126 L120 126 Q84 96 45 76" fill="none" stroke="var(--danger)" strokeWidth="5" strokeLinecap="round" />
        <path d="M24 166 L120 166 Q82 166 36 166" fill="none" stroke="var(--danger)" strokeWidth="5" strokeLinecap="round" />
        <path d="M24 206 L120 206 Q84 238 45 260" fill="none" stroke="var(--danger)" strokeWidth="5" strokeLinecap="round" />
        <text x="218" y="172" textAnchor="middle" fontSize="22" fontWeight="900" fill="var(--text-main)">实心</text>
        <text x="190" y="298" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-muted)">预测：多数 α 粒子被挡住或弹回</text>
      </svg>
    );
  }

  if (model === 'thomson') {
    return (
      <svg viewBox="0 0 380 330" className="h-full w-full" role="img" aria-label="汤姆孙葡萄干面包模型放大图">
        <rect x="8" y="8" width="364" height="314" rx="24" fill="var(--bg-highlight)" />
        <text x="190" y="38" textAnchor="middle" fontSize="17" fontWeight="800" fill="var(--text-main)">如果正电均匀铺开</text>
        <circle cx="210" cy="166" r="94" fill="var(--bg-amber)" stroke="var(--warning)" strokeWidth="5" />
        <text x="210" y="91" textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--text-amber)">正电荷连续、均匀分布</text>
        {[[175, 105], [230, 112], [152, 160], [216, 172], [264, 154], [176, 218], [240, 224]].map(([x, y], index) => (
          <g key={index} transform={`translate(${x} ${y})`}>
            <circle r="8" fill="var(--accent)" />
            <text x="0" y="4" textAnchor="middle" fontSize="12" fontWeight="900" fill="var(--bg-card-bright)">−</text>
          </g>
        ))}
        <path d="M22 164 L116 164 Q228 151 355 157" fill="none" stroke="var(--warning)" strokeWidth="5" strokeLinecap="round" />
        <text x="190" y="298" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-muted)">预测：几乎全部近似直穿，只可能微小偏转</text>
      </svg>
    );
  }

  if (!revealed) {
    return (
      <svg viewBox="0 0 380 330" className="h-full w-full" role="img" aria-label="尚未揭晓的原子内部结构">
        <rect x="8" y="8" width="364" height="314" rx="24" fill="var(--bg-highlight)" />
        <text x="190" y="38" textAnchor="middle" fontSize="17" fontWeight="800" fill="var(--text-main)">原子内部到底是什么？</text>
        <circle cx="190" cy="165" r="98" fill="var(--bg-card-bright)" stroke="var(--border-color)" strokeWidth="4" strokeDasharray="10 9" />
        <text x="190" y="186" textAnchor="middle" fontSize="72" fontWeight="900" fill="var(--text-muted)">?</text>
        <text x="190" y="298" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-muted)">先不画答案，只用轨迹推理</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 380 330" className="h-full w-full" role="img" aria-label="由散射证据推断出的原子核式结构：原子核很小、带正电，并集中了原子的几乎全部质量">
      <rect x="8" y="8" width="364" height="314" rx="24" fill="var(--bg-highlight)" />
      <text x="190" y="38" textAnchor="middle" fontSize="17" fontWeight="800" fill="var(--text-main)">四步证据推理拼出的结构</text>
      <circle cx="190" cy="165" r="98" fill="var(--bg-card-bright)" stroke="var(--border-color)" strokeWidth="3" strokeDasharray="7 8" />
      <circle cx="190" cy="165" r="14" fill="var(--danger)" stroke="var(--bg-card-bright)" strokeWidth="3" />
      <text x="190" y="171" textAnchor="middle" fontSize="18" fontWeight="900" fill="var(--bg-card-bright)">+</text>
      <circle cx="278" cy="165" r="7" fill="var(--accent)" />
      <circle cx="145" cy="88" r="7" fill="var(--accent)" />
      <circle cx="145" cy="242" r="7" fill="var(--accent)" />
      <path d="M206 156 L266 116" stroke="var(--danger)" strokeWidth="2" />
      <text x="270" y="105" fontSize="12.5" fontWeight="800" fill="var(--text-main)">体积很小、带正电</text>
      <text x="270" y="124" fontSize="12.5" fontWeight="800" fill="var(--danger)">几乎全部质量在这里</text>
      <text x="190" y="298" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text-muted)">内部大部分是空的，质量却集中在小核内</text>
    </svg>
  );
}

export function AtomicModelComparison() {
  const [model, setModel] = useState<ModelKey>('dalton');
  const [hasRun, setHasRun] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [inferenceStep, setInferenceStep] = useState(0);
  const [inferenceAttempts, setInferenceAttempts] = useState(0);
  const [inferenceResolved, setInferenceResolved] = useState(false);
  const [inferenceFeedback, setInferenceFeedback] = useState<{ kind: 'hint' | 'success' | 'answer'; text: string } | null>(null);
  const info = modelInfo[model];
  const revealed = model === 'mystery' && inferenceStep >= inferenceSteps.length;
  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const resetInference = () => {
    setInferenceStep(0);
    setInferenceAttempts(0);
    setInferenceResolved(false);
    setInferenceFeedback(null);
  };

  const chooseModel = (next: ModelKey) => {
    setModel(next);
    setHasRun(false);
    resetInference();
  };

  const fireParticles = () => {
    setRunKey((value) => value + 1);
    setHasRun(true);
    if (model === 'mystery') resetInference();
  };

  const answerInference = (choiceIndex: number) => {
    if (inferenceResolved || inferenceStep >= inferenceSteps.length) return;
    const step = inferenceSteps[inferenceStep];
    if (choiceIndex === step.answer) {
      setInferenceResolved(true);
      setInferenceFeedback({ kind: 'success', text: step.reason });
      return;
    }

    const nextAttempt = inferenceAttempts + 1;
    setInferenceAttempts(nextAttempt);
    if (nextAttempt === 1) {
      setInferenceFeedback({ kind: 'hint', text: step.hint });
      return;
    }

    setInferenceResolved(true);
    setInferenceFeedback({ kind: 'answer', text: `正确判断：${step.choices[step.answer]}。${step.reason}` });
  };

  const continueInference = () => {
    setInferenceStep((value) => value + 1);
    setInferenceAttempts(0);
    setInferenceResolved(false);
    setInferenceFeedback(null);
  };

  return (
    <div className="w-full border-b border-[var(--border-color)] bg-[var(--bg-card)] pb-20 text-[var(--text-main)]">
      <div className="flex flex-wrap gap-2 px-4 pt-4 lg:gap-3 lg:px-6 lg:pt-6" role="group" aria-label="选择原子模型或实验事实">
        {(Object.keys(modelInfo) as ModelKey[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={model === key}
            onClick={() => chooseModel(key)}
            className={`rounded-full border px-3 py-2 text-xs font-black transition lg:px-5 lg:py-3 lg:text-sm ${
              model === key
                ? 'border-teal-600 bg-teal-700 text-white shadow-sm'
                : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] text-[var(--text-muted)] hover:border-teal-400'
            }`}
          >
            {modelInfo[key].year} · {modelInfo[key].tab}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-3 lg:px-6 lg:pt-4">
        <div>
          <div className="text-sm font-black lg:text-xl">{info.name}</div>
          <div className="mt-1 max-w-3xl text-xs font-medium text-[var(--text-muted)] lg:text-sm">{info.claim}</div>
        </div>
        <button
          type="button"
          onClick={fireParticles}
          className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-teal-600 lg:px-6 lg:py-3 lg:text-base"
        >
          {model === 'mystery' ? '播放真实散射轨迹' : '检验这个模型'}
        </button>
      </div>

      <div className="grid gap-3 px-4 pt-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,.75fr)] lg:gap-5 lg:px-6">
        <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-highlight)]">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border-color)] px-3 py-2 text-xs font-black lg:px-4 lg:text-sm">
            <span>金箔中的 α 粒子轨迹</span>
            <span className="text-[var(--text-muted)]">{hasRun ? '正在比较轨迹' : '等待播放'}</span>
          </div>
          <svg className="h-64 w-full lg:h-[25rem]" viewBox="0 0 650 350" role="img" aria-label={`${info.name}对应的α粒子散射轨迹`}>
            <g transform="translate(48 174)">
              <circle r="22" fill="var(--bg-card-bright)" stroke="var(--accent)" strokeWidth="3" />
              <text x="0" y="6" textAnchor="middle" fontSize="16" fontWeight="900" fill="var(--accent)">α</text>
            </g>
            <text x="48" y="328" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-muted)">粒子源</text>
            <rect x="308" y="38" width="14" height="270" rx="6" fill="var(--warning)" opacity="0.8" />
            <text x="315" y="26" textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--text-amber)">金箔</text>
            <path d="M612 48 Q645 174 612 302" fill="none" stroke="var(--border-color)" strokeWidth="6" strokeLinecap="round" />
            <text x="610" y="328" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-muted)">荧光屏</text>

            {hasRun ? (
              <g key={`${model}-${runKey}`}>
                {routeSets[model].map((route, index) => (
                  <path
                    key={`${route.kind}-${index}`}
                    d={route.d}
                    fill="none"
                    stroke={routeColor[route.kind]}
                    strokeWidth={route.kind === 'rebound' ? 4.5 : 3.5}
                    strokeLinecap="round"
                    opacity="0.9"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset="1"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="1"
                      to="0"
                      dur={reduceMotion ? '0.01s' : `${0.65 + index * 0.09}s`}
                      fill="freeze"
                    />
                  </path>
                ))}
              </g>
            ) : (
              <g>
                <text x="315" y="164" textAnchor="middle" fontSize="17" fontWeight="900" fill="var(--text-muted)">{info.prompt}</text>
                <text x="315" y="190" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text-muted)">右侧图先告诉你“模型假设”，第三次则把答案遮住。</text>
              </g>
            )}
          </svg>
        </div>

        <div className="h-72 overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] lg:h-[28rem]">
          <ModelDiagram model={model} revealed={revealed} />
        </div>
      </div>

      <div className="px-4 pt-3 lg:px-6" aria-live="polite">
        {hasRun && (
          <div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-black lg:text-sm">
              <div className="rounded-xl bg-[var(--bg-green-light)] px-2 py-3 text-teal-900">直穿<br /><span className="mt-1 block">{info.routeLabels[0]}</span></div>
              <div className="rounded-xl bg-[var(--bg-amber)] px-2 py-3 text-amber-900">偏转<br /><span className="mt-1 block">{info.routeLabels[1]}</span></div>
              <div className="rounded-xl bg-rose-50 px-2 py-3 text-rose-900">反弹<br /><span className="mt-1 block">{info.routeLabels[2]}</span></div>
            </div>
            <div className="mt-2 text-center text-xs font-bold text-[var(--text-muted)]">
              图中轨迹条数只用于展示三类现象，不代表实验中的真实统计比例。
            </div>
          </div>
        )}

        {hasRun && model !== 'mystery' && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-950 lg:text-base lg:leading-7">
            {info.verdict}
          </div>
        )}

        {hasRun && model === 'mystery' && !revealed && (
          <div className="mt-3 rounded-2xl border border-teal-200 bg-[var(--bg-card-bright)] p-4 lg:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-black tracking-wider text-teal-700 lg:text-sm">证据推理 · {inferenceStep + 1}/{inferenceSteps.length}</div>
              <div className="text-xs font-bold text-[var(--text-muted)]">第三种结构暂不揭晓</div>
            </div>
            <div className="mt-3 rounded-xl bg-[var(--bg-highlight)] px-4 py-3 text-sm font-black lg:text-base">
              观察：{inferenceSteps[inferenceStep].evidence}
            </div>
            <div className="mt-3 text-sm font-black lg:text-lg">{inferenceSteps[inferenceStep].question}</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {inferenceSteps[inferenceStep].choices.map((choice, index) => (
                <button
                  key={choice}
                  type="button"
                  disabled={inferenceResolved}
                  onClick={() => answerInference(index)}
                  className="rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-highlight)] px-4 py-3 text-left text-sm font-black transition hover:border-teal-400 disabled:opacity-65 lg:text-base"
                >
                  {choice}
                </button>
              ))}
            </div>
            {inferenceFeedback && (
              <div className={`mt-3 rounded-xl border px-4 py-3 text-sm font-bold leading-6 lg:text-base lg:leading-7 ${
                inferenceFeedback.kind === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                  : inferenceFeedback.kind === 'hint'
                  ? 'border-amber-200 bg-amber-50 text-amber-950'
                  : 'border-rose-200 bg-rose-50 text-rose-950'
              }`}>
                {inferenceFeedback.text}
              </div>
            )}
            {inferenceResolved && (
              <button
                type="button"
                onClick={continueInference}
                className="mt-3 w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-black text-white hover:bg-teal-600 lg:text-base"
              >
                {inferenceStep === inferenceSteps.length - 1 ? '合并四步证据，揭晓结构' : '继续看下一条证据'}
              </button>
            )}
          </div>
        )}

        {hasRun && revealed && (
          <div className="mt-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-4 py-4 text-center text-base font-black leading-7 text-emerald-950 lg:text-xl lg:leading-9">
            三类轨迹经过四步证据推理共同说明：原子内部大部分是空的；正电荷和原子的几乎全部质量集中在体积很小的原子核内。
            <span className="mt-1 block text-sm font-bold text-emerald-800 lg:text-base">这就是卢瑟福核式结构模型。</span>
          </div>
        )}
      </div>
    </div>
  );
}
