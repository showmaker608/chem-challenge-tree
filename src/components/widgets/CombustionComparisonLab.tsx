import { useMemo, useState } from 'react';

type MaterialKey = 'carbon' | 'sulfur' | 'phosphorus' | 'iron' | 'magnesium';

interface CombustionMaterial {
  key: MaterialKey;
  name: string;
  formula: string;
  images: { src: string; alt: string; label: string }[];
  air: string;
  oxygen: string;
  product: string;
  bottle: string;
  expression: string;
  options: string[];
  answer: number;
  hint: string;
}

interface ReasoningQuestion {
  stem: string;
  options: string[];
  answer: number;
  hint: string;
  explanation: string;
}

const materials: CombustionMaterial[] = [
  {
    key: 'carbon',
    name: '木炭',
    formula: 'C',
    images: [
      {
        src: '/combustion/carbon-air.jpg',
        alt: '木炭在空气中红热燃烧',
        label: '空气中：木炭持续红热',
      },
    ],
    air: '持续红热，燃烧较慢',
    oxygen: '燃烧更旺，发出白光',
    product: '二氧化碳 CO₂',
    bottle: '不预先放水；反应后用澄清石灰水检验 CO₂',
    expression: '碳 + 氧气 → 二氧化碳',
    options: ['产生大量白烟', '燃烧更旺，发出白光', '火星四射，生成黑色固体'],
    answer: 1,
    hint: '木炭的关键词是“红热/白光”，产物还要用澄清石灰水检验。',
  },
  {
    key: 'sulfur',
    name: '硫黄',
    formula: 'S',
    images: [
      {
        src: '/combustion/sulfur-air.jpg',
        alt: '硫在空气中燃烧',
        label: '空气中：微弱的淡蓝色火焰',
      },
      {
        src: '/combustion/sulfur-oxygen.jpg',
        alt: '硫在氧气中燃烧',
        label: '氧气中：明亮的蓝紫色火焰',
      },
    ],
    air: '微弱的淡蓝色火焰',
    oxygen: '明亮的蓝紫色火焰',
    product: '二氧化硫 SO₂',
    bottle: '放少量水：吸收 SO₂，减少空气污染',
    expression: '硫 + 氧气 → 二氧化硫',
    options: ['微弱的淡蓝色火焰', '明亮的蓝紫色火焰', '耀眼白光，生成白色固体'],
    answer: 1,
    hint: '先比较火焰颜色：空气中淡蓝，氧气中蓝紫。',
  },
  {
    key: 'phosphorus',
    name: '红磷',
    formula: 'P',
    images: [
      {
        src: '/combustion/phosphorus-oxygen.jpg',
        alt: '红磷在氧气中燃烧并产生大量白烟',
        label: '氧气中：大量白烟充满装置',
      },
    ],
    air: '燃烧，产生白烟',
    oxygen: '燃烧更剧烈，产生大量白烟',
    product: '五氧化二磷 P₂O₅',
    bottle: '本实验通常不需要放水',
    expression: '红磷 + 氧气 → 五氧化二磷',
    options: ['产生大量白烟', '发出蓝紫色火焰', '火星四射，生成黑色固体'],
    answer: 0,
    hint: '“烟”是固体小颗粒；红磷的标志现象不是火焰颜色。',
  },
  {
    key: 'iron',
    name: '铁丝',
    formula: 'Fe',
    images: [
      {
        src: '/combustion/iron-oxygen.jpg',
        alt: '铁棉在氧气中燃烧并产生火星',
        label: '氧气中：火星四射',
      },
    ],
    air: '红热，通常不能持续燃烧',
    oxygen: '剧烈燃烧，火星四射，生成黑色固体',
    product: '四氧化三铁 Fe₃O₄',
    bottle: '放少量水或细沙：防高温熔融物溅落使瓶底炸裂',
    expression: '铁 + 氧气 → 四氧化三铁',
    options: ['发出耀眼白光，生成白色固体', '剧烈燃烧，火星四射，生成黑色固体', '产生大量白烟'],
    answer: 1,
    hint: '铁丝的标志是“火星四射 + 黑色固体”。',
  },
  {
    key: 'magnesium',
    name: '镁带',
    formula: 'Mg',
    images: [
      {
        src: '/combustion/magnesium-oxygen.jpg',
        alt: '镁在氧气中燃烧并发出耀眼白光',
        label: '氧气中：耀眼白光',
      },
    ],
    air: '剧烈燃烧，发出耀眼白光，生成白色固体',
    oxygen: '燃烧更剧烈，发出耀眼白光，生成白色固体',
    product: '氧化镁 MgO',
    bottle: '本实验通常不需要放水',
    expression: '镁 + 氧气 → 氧化镁',
    options: ['发出耀眼白光，生成白色固体', '发出淡蓝色火焰', '火星四射，生成黑色固体'],
    answer: 0,
    hint: '镁带的关键词是“耀眼白光 + 白色固体”。',
  },
];

const reasoningQuestions: ReasoningQuestion[] = [
  {
    stem: '哪组课堂证据最能支持“在本讲实验条件下，镁比铁更容易与氧气反应”？',
    options: [
      '镁带在空气中就能剧烈燃烧；铁丝在空气中通常不能持续燃烧',
      '镁和铁都是金属',
      '镁燃烧生成白色固体；铁燃烧生成黑色固体',
    ],
    answer: 0,
    hint: '比较“同样在空气中”能不能明显燃烧，不要拿产物颜色当活泼性证据。',
    explanation: '在本讲装置和材料形态下，镁带在空气中已能剧烈燃烧，而铁丝通常要在高浓度氧气中才明显燃烧。这是反应难易的课堂证据。',
  },
  {
    stem: '硫和铁的集气瓶底都可能放水，作用是否相同？',
    options: [
      '相同，都是为了溶解生成物',
      '不同：硫是吸收 SO₂；铁是防高温熔融物使瓶底炸裂',
      '不同：硫是防炸裂；铁是吸收污染物',
    ],
    answer: 1,
    hint: '先判断产物状态：SO₂ 是气体，Fe₃O₄ 是高温固体。',
    explanation: '硫燃烧放水是为了吸收 SO₂、减少污染；铁丝燃烧放水或铺细沙，是为了防止高温熔融物溅落使瓶底炸裂。',
  },
  {
    stem: '能不能只凭这张表，直接得出“红磷一定比硫和木炭都更活泼”？',
    options: [
      '能，红磷产生白烟，所以一定最活泼',
      '不能；材料形态、点燃温度、表面积和氧气浓度也会影响燃烧现象',
      '能，只要比较产物是固体还是气体',
    ],
    answer: 1,
    hint: '铁丝、铁粉、铁棉的燃烧现象就可能不同，说明现象还受实验条件影响。',
    explanation: '红磷、硫和木炭在空气中都能燃烧，在氧气中现象通常都会增强。仅凭这组现象，不能排除材料形态、点燃温度、表面积和氧气浓度的影响，因此不能严格推出“红磷一定更活泼”。',
  },
];

export function CombustionComparisonLab({ onComplete }: { onComplete?: () => void }) {
  const [activeKey, setActiveKey] = useState<MaterialKey>('carbon');
  const [completed, setCompleted] = useState<Partial<Record<MaterialKey, boolean>>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'hint' | 'success'; text: string } | null>(null);
  const [reasoningStep, setReasoningStep] = useState(0);
  const [reasoningSelected, setReasoningSelected] = useState<number | null>(null);
  const [reasoningResolved, setReasoningResolved] = useState(false);

  const active = materials.find((material) => material.key === activeKey) ?? materials[0];
  const completedCount = materials.filter((material) => completed[material.key]).length;
  const tableComplete = completedCount === materials.length;
  const reasoningComplete = reasoningStep >= reasoningQuestions.length;
  const currentReasoning = reasoningQuestions[reasoningStep];

  const nextIncomplete = useMemo(
    () => materials.find((material) => !completed[material.key]),
    [completed],
  );

  const chooseMaterial = (key: MaterialKey) => {
    setActiveKey(key);
    setSelectedOption(null);
    setFeedback(null);
  };

  const answerObservation = (index: number) => {
    setSelectedOption(index);
    if (index === active.answer) {
      setCompleted((value) => ({ ...value, [active.key]: true }));
      setFeedback({ kind: 'success', text: `答对了。${active.oxygen}` });
      return;
    }
    setFeedback({ kind: 'hint', text: active.hint });
  };

  const goToNextMaterial = () => {
    const next = materials.find((material) => !completed[material.key] && material.key !== active.key);
    if (next) chooseMaterial(next.key);
  };

  const answerReasoning = (index: number) => {
    if (!currentReasoning || reasoningResolved) return;
    setReasoningSelected(index);
    if (index === currentReasoning.answer) setReasoningResolved(true);
  };

  const continueReasoning = () => {
    if (reasoningStep === reasoningQuestions.length - 1) onComplete?.();
    setReasoningStep((value) => value + 1);
    setReasoningSelected(null);
    setReasoningResolved(false);
  };

  const reset = () => {
    setActiveKey('carbon');
    setCompleted({});
    setSelectedOption(null);
    setFeedback(null);
    setReasoningStep(0);
    setReasoningSelected(null);
    setReasoningResolved(false);
  };

  return (
    <div className="w-full border-b border-[var(--border-color)] bg-[var(--bg-card)] pb-24 text-[var(--text-main)]">
      <div className="px-4 pt-4 lg:px-6 lg:pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-black tracking-[0.18em] text-orange-600">第9讲 · 表格挑战</div>
            <h3 className="mt-1 text-lg font-black sm:text-xl lg:text-2xl">五种单质在空气 / 氧气中的燃烧对比</h3>
            <p className="mt-1 max-w-3xl text-xs font-bold leading-5 text-[var(--text-muted)] sm:text-sm">
              先认图片和关键现象，再把整张表补齐；最后用证据解释反应难易与集气瓶放水的不同作用。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-orange-100 px-3 py-1.5 text-xs font-black text-orange-800">
              表格 {completedCount}/{materials.length}
            </div>
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-3 py-1.5 text-xs font-black text-[var(--text-muted)] hover:border-orange-300"
            >
              重新挑战
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-1.5" role="group" aria-label="选择一种单质完成表格">
          {materials.map((material) => {
            const isActive = active.key === material.key;
            const isDone = Boolean(completed[material.key]);
            return (
              <button
                key={material.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => chooseMaterial(material.key)}
                className={`rounded-xl border px-1.5 py-2 text-center text-xs font-black transition sm:px-3 sm:text-sm ${
                  isActive
                    ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
                    : isDone
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] text-[var(--text-muted)] hover:border-orange-300'
                }`}
              >
                <span className="block sm:inline">{isDone ? '✓ ' : ''}{material.name}</span>
                <span className={`ml-0 text-[10px] sm:ml-1 sm:text-xs ${isActive ? 'text-orange-100' : 'text-[var(--text-muted)]'}`}>{material.formula}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 hidden overflow-x-auto px-6 lg:block">
        <table className="w-full min-w-[980px] overflow-hidden rounded-2xl border border-[var(--border-color)] text-left text-xs">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-3 py-3">反应物</th>
              <th className="px-3 py-3">实验图</th>
              <th className="px-3 py-3">空气中</th>
              <th className="px-3 py-3">氧气中</th>
              <th className="px-3 py-3">产物</th>
              <th className="px-3 py-3">瓶底处理</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material) => {
              const isDone = Boolean(completed[material.key]);
              return (
                <tr key={material.key} className={`border-t border-[var(--border-color)] ${active.key === material.key ? 'bg-orange-50' : 'bg-[var(--bg-card-bright)]'}`}>
                  <td className="px-3 py-3 font-black">{material.name} <span className="text-[var(--text-muted)]">{material.formula}</span></td>
                  <td className="px-3 py-2">
                    <img
                      className="h-14 w-24 rounded-lg object-cover"
                      src={material.images[material.images.length - 1].src}
                      alt={material.images[material.images.length - 1].alt}
                    />
                  </td>
                  {isDone ? (
                    <>
                      <td className="max-w-[180px] px-3 py-3 font-bold leading-5">{material.air}</td>
                      <td className="max-w-[190px] px-3 py-3 font-bold leading-5 text-orange-800">{material.oxygen}</td>
                      <td className="px-3 py-3 font-bold">{material.product}</td>
                      <td className="max-w-[230px] px-3 py-3 font-bold leading-5">{material.bottle}</td>
                    </>
                  ) : (
                    <td colSpan={4} className="px-3 py-3 text-center">
                      <button type="button" onClick={() => chooseMaterial(material.key)} className="rounded-full border border-dashed border-orange-300 bg-white px-4 py-2 font-black text-orange-700 hover:bg-orange-50">
                        待完成：点我补这一行
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 px-4 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:px-6">
        <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-slate-950">
          <div className={`grid h-52 ${active.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} sm:h-64 lg:h-full lg:min-h-[330px]`}>
            {active.images.map((image) => (
              <figure key={image.src} className="relative min-h-0 overflow-hidden">
                <img className="h-full w-full object-cover" src={image.src} alt={image.alt} />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-10 text-xs font-black text-white sm:text-sm">
                  {image.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black tracking-widest text-orange-600">补表 · {active.name}</div>
              <div className="mt-1 text-base font-black text-slate-950 sm:text-lg">它在氧气中的关键现象是？</div>
            </div>
            {completed[active.key] && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">本行完成</span>}
          </div>

          <div className="mt-3 grid gap-2">
            {active.options.map((option, index) => {
              const isCorrect = index === active.answer;
              const isPicked = selectedOption === index;
              const showCorrect = Boolean(completed[active.key]) && isCorrect;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={Boolean(completed[active.key])}
                  onClick={() => answerObservation(index)}
                  className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm font-black transition ${
                    showCorrect
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                      : isPicked
                      ? 'border-amber-400 bg-amber-50 text-amber-900'
                      : 'border-white bg-white text-slate-800 hover:border-orange-300'
                  }`}
                >
                  <span className="mr-2 text-xs text-slate-500">{String.fromCharCode(65 + index)}.</span>{option}
                </button>
              );
            })}
          </div>

          {feedback && (
            <div aria-live="polite" className={`mt-3 rounded-xl border px-3 py-2.5 text-sm font-bold leading-6 ${
              feedback.kind === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}>
              {feedback.text}
            </div>
          )}

          {completed[active.key] && (
            <div className="mt-3 rounded-xl border border-white bg-white p-3 text-xs font-bold leading-5 text-slate-700 sm:text-sm">
              <div><span className="text-slate-500">空气中：</span>{active.air}</div>
              <div><span className="text-slate-500">文字表达式：</span>{active.expression}</div>
              <div><span className="text-slate-500">瓶底处理：</span>{active.bottle}</div>
            </div>
          )}

          {completed[active.key] && nextIncomplete && (
            <button type="button" onClick={goToNextMaterial} className="mt-3 w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-orange-500">
              补下一行 →
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 px-4 lg:px-6">
        {!tableComplete ? (
          <div className="rounded-2xl border border-dashed border-orange-300 bg-orange-50/60 px-4 py-3 text-center text-sm font-black text-orange-900">
            先补齐五行，再解锁“证据归纳挑战”。
          </div>
        ) : !reasoningComplete && currentReasoning ? (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 sm:p-5">
            <div className="text-xs font-black tracking-widest text-indigo-700">证据归纳 · {reasoningStep + 1}/{reasoningQuestions.length}</div>
            <div className="mt-2 text-base font-black leading-7 text-slate-950 sm:text-lg">{currentReasoning.stem}</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {currentReasoning.options.map((option, index) => {
                const isPicked = reasoningSelected === index;
                const isCorrect = index === currentReasoning.answer;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={reasoningResolved}
                    onClick={() => answerReasoning(index)}
                    className={`rounded-xl border-2 px-3 py-3 text-left text-sm font-black transition ${
                      reasoningResolved && isCorrect
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                        : isPicked
                        ? 'border-amber-400 bg-amber-50 text-amber-900'
                        : 'border-white bg-white text-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {reasoningSelected !== null && (
              <div className={`mt-3 rounded-xl border px-3 py-2.5 text-sm font-bold leading-6 ${
                reasoningResolved ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}>
                {reasoningResolved ? currentReasoning.explanation : currentReasoning.hint}
              </div>
            )}
            {reasoningResolved && (
              <button type="button" onClick={continueReasoning} className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white hover:bg-indigo-500">
                {reasoningStep === reasoningQuestions.length - 1 ? '完成归纳' : '下一题'}
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-emerald-950 sm:p-5">
            <div className="text-center text-lg font-black">表格挑战完成 ✓</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-3 text-sm font-bold leading-6">
                <span className="block text-xs font-black tracking-widest text-emerald-700">课堂可得的比较</span>
                镁在空气中就能剧烈燃烧，铁丝通常要在高浓度氧气中才明显；红磷、硫和木炭在空气中都能燃烧，在氧气中现象通常都会增强。
              </div>
              <div className="rounded-xl bg-white p-3 text-sm font-bold leading-6">
                <span className="block text-xs font-black tracking-widest text-amber-700">科学边界</span>
                这比较的是本实验条件下的反应难易。材料形态、表面积、点燃方式和氧气浓度不同，不能只凭火焰亮度排出严格的“活泼性总顺序”。
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 px-4 text-center text-[10px] font-bold text-[var(--text-muted)] lg:px-6">
        实验图片来自 Wikimedia Commons，完整作者与授权见 <a className="underline hover:text-orange-700" href="/combustion/ATTRIBUTION.txt" target="_blank" rel="noreferrer">图片来源说明</a>。
      </div>
    </div>
  );
}
