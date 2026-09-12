import { useState } from 'react';

type Stage = 'generation' | 'preparation' | 'collection' | 'verification' | 'safety';

interface Decision {
  eyebrow: string;
  title: string;
  question: string;
  options: string[];
  answer: number;
  wrongFeedback: string[];
  conclusion: string;
}

const stages: Stage[] = ['generation', 'preparation', 'collection', 'verification', 'safety'];
const labels = ['选装置', '连接装药', '收集', '检验', '收尾'];

const preparationDecisions: Decision[] = [
  {
    eyebrow: '准备 1/3 · 连接与查漏',
    title: '装药之前，先连接装置并检查气密性',
    question: '哪项操作和现象能够说明气密性良好？',
    options: [
      '把导管口浸入水中，手握试管；导管口有气泡冒出',
      '先装入高锰酸钾并加热，看水槽里是否有气泡',
      '导管口留在空气中，用嘴向导管内吹气',
    ],
    answer: 0,
    wrongFeedback: [
      '',
      '加热后才发现漏气，已经不便安全拆装。气密性必须在装药前检查。',
      '导管口不浸入水中就没有清楚的观察现象，也不能用嘴直接吹实验装置。',
    ],
    conclusion: '先连接、再查漏、后装药。手握试管使内部空气受热膨胀，导管口出现气泡，说明装置不漏气。',
  },
  {
    eyebrow: '准备 2/3 · 装入固体',
    title: '装置不漏气，现在装入高锰酸钾',
    question: '怎样装药并处理试管口？',
    options: [
      '用药匙或纸槽把高锰酸钾送到试管底部，在试管口放一小团棉花',
      '从直立试管口直接把固体砸到底部，不放棉花',
      '把高锰酸钾装在试管口附近，让火焰直接接触药品',
    ],
    answer: 0,
    wrongFeedback: [
      '',
      '固体从高处落下可能击破试管底；加热高锰酸钾还需要棉花阻挡粉末进入导管。',
      '药品应放在试管底部，不能堆在橡皮塞和导管附近。',
    ],
    conclusion: '高锰酸钾放在试管底部；试管口放棉花，防止细小粉末随氧气流进入导管。',
  },
  {
    eyebrow: '准备 3/3 · 固定与加热',
    title: '装好药品，固定试管并开始加热',
    question: '哪套操作正确？',
    options: [
      '试管口略向下倾斜；先均匀预热，再用酒精灯外焰固定加热药品部位',
      '试管口向上倾斜；从一开始只猛烧一个位置',
      '试管保持竖直；用酒精灯内焰贴住试管加热',
    ],
    answer: 0,
    wrongFeedback: [
      '',
      '试管口向上时，冷凝水可能流回热的试管底部；突然集中加热也容易造成受热不均。',
      '固体加热装置应让试管口略向下，且使用酒精灯外焰加热。',
    ],
    conclusion: '管口略向下可防冷凝水回流使试管炸裂；先预热再固定加热，可避免试管受热不均。',
  },
];

function Progress({ stage }: { stage: Stage }) {
  const active = stages.indexOf(stage);
  return (
    <div className="grid grid-cols-5 gap-1.5" aria-label={`固体加热制氧进度：第${active + 1}阶段，共5阶段`}>
      {labels.map((label, index) => (
        <div key={label} className="min-w-0 text-center">
          <div className={`h-1.5 rounded-full ${index < active ? 'bg-emerald-400' : index === active ? 'bg-violet-400' : 'bg-slate-700'}`} />
          <div className={`mt-1 text-[9px] font-black sm:text-[10px] ${index === active ? 'text-violet-200' : index < active ? 'text-emerald-300' : 'text-slate-500'}`}>
            {index < active ? '✓ ' : ''}{label}
          </div>
        </div>
      ))}
    </div>
  );
}

function Choices({ options, selected, answer, resolved, onSelect }: { options: string[]; selected: number | null; answer: number; resolved: boolean; onSelect: (index: number) => void }) {
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
            className={`w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-black leading-6 transition ${correct ? 'border-emerald-300 bg-emerald-400/15 text-emerald-50' : incorrect ? 'border-rose-300 bg-rose-400/15 text-rose-50' : 'border-slate-700 bg-slate-950/70 text-slate-100 hover:border-violet-300'}`}
          >
            <span className="mr-2 text-xs text-slate-400">{String.fromCharCode(65 + index)}.</span>{option}
          </button>
        );
      })}
    </div>
  );
}

function ApparatusFigure() {
  return (
    <figure className="overflow-hidden rounded-3xl border border-slate-300 bg-white">
      <img src="/gas-labs/heated-oxygen-apparatus.png" alt="教材中加热高锰酸钾并用排水法收集氧气的正确完整装置图" className="h-auto w-full" />
      <figcaption className="border-t border-slate-100 px-4 py-2 text-center text-[11px] font-bold text-slate-500">教材图 3.23：固体加热发生装置＋排水收集装置</figcaption>
    </figure>
  );
}

export function HeatedOxygenPreparationLab({ onComplete }: { onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('generation');
  const [apparatusAnswer, setApparatusAnswer] = useState<number | null>(null);
  const [preparationStep, setPreparationStep] = useState(0);
  const [preparationAnswer, setPreparationAnswer] = useState<number | null>(null);
  const [collectionAnswer, setCollectionAnswer] = useState<number | null>(null);
  const [verificationAnswer, setVerificationAnswer] = useState<number | null>(null);
  const [safetyAnswer, setSafetyAnswer] = useState<number | null>(null);

  const apparatusResolved = apparatusAnswer === 0;
  const preparation = preparationDecisions[preparationStep];
  const preparationResolved = preparationAnswer === preparation.answer;
  const collectionResolved = collectionAnswer === 1;
  const verificationResolved = verificationAnswer === 0;
  const safetyResolved = safetyAnswer === 1;

  const nextPreparation = () => {
    if (!preparationResolved) return;
    if (preparationStep < preparationDecisions.length - 1) {
      setPreparationStep((value) => value + 1);
      setPreparationAnswer(null);
      return;
    }
    setStage('collection');
  };

  if (stage === 'generation') {
    return (
      <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="heated-o2-generation-title">
        <div className="mx-auto max-w-5xl">
          <div className="pr-12">
            <div className="text-[11px] font-black tracking-[0.18em] text-violet-300">实验方案与操作决策型 · 固体加热制氧 · 第1/5阶段</div>
            <h2 id="heated-o2-generation-title" className="mt-1 text-xl font-black sm:text-2xl">用高锰酸钾制取氧气：选择发生装置</h2>
          </div>
          <div className="mt-4"><Progress stage={stage} /></div>
          <div className="mt-4 rounded-3xl border border-violet-300/30 bg-violet-400/10 p-4 sm:p-5">
            <div className="grid grid-cols-3 gap-2">
              {[
                ['反应物状态', '一种固体'],
                ['反应条件', '需要加热'],
                ['操作目标', '导出气体＋排水收集'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/65 px-3 py-3 text-center"><div className="text-[9px] font-black tracking-widest text-slate-400">{label}</div><div className="mt-1 text-xs font-black sm:text-sm">{value}</div></div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-violet-300/30 bg-slate-950/55 px-4 py-3 text-sm font-black text-violet-50">根据这三点，选择发生装置。</div>
          </div>
          <img src="/oxygen/generation-apparatus-abc.png" alt="A为固体加热装置，B和C为固液常温装置" className="mt-4 w-full rounded-3xl bg-white p-3 sm:p-5" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            {['装置 A', '装置 B', '装置 C'].map((option, index) => (
              <button key={option} type="button" disabled={apparatusResolved} onClick={() => setApparatusAnswer(index)} className={`rounded-2xl border-2 px-3 py-3 text-sm font-black transition ${apparatusResolved && index === 0 ? 'border-emerald-300 bg-emerald-400/15' : apparatusAnswer === index && !apparatusResolved ? 'border-rose-300 bg-rose-400/15' : 'border-slate-700 bg-slate-900 hover:border-violet-300'}`}>{option}</button>
            ))}
          </div>
          {apparatusAnswer !== null && !apparatusResolved && <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-400/10 p-4 text-sm font-semibold leading-6 text-rose-100" aria-live="polite">装置B、C都是固体与液体在常温下制气；本任务只有固体，并且必须加热。</div>}
          {apparatusResolved && (
            <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]" aria-live="polite">
              <ApparatusFigure />
              <div className="space-y-3">
                <div className="rounded-3xl border border-emerald-300/40 bg-emerald-400/10 p-5"><div className="text-xs font-black text-emerald-200">选择成立</div><p className="mt-2 text-sm font-semibold leading-6 text-emerald-50">一种固体受热分解，应选择试管＋酒精灯组成的固体加热型装置A。</p></div>
                <div className="rounded-3xl border border-violet-300/30 bg-slate-900 p-5"><div className="text-xs font-black text-violet-200">符号表达式</div><div className="mt-3 rounded-2xl bg-slate-950 px-3 py-3 text-center text-sm font-black">KMnO₄ <span className="text-violet-300">—加热→</span> K₂MnO₄＋MnO₂＋O₂</div><p className="mt-2 text-xs font-bold leading-5 text-slate-400">本阶段写符号表达式，不配平、不写气体符号“↑”。</p></div>
              </div>
            </div>
          )}
          {apparatusResolved && <button type="button" onClick={() => setStage('preparation')} className="mt-5 w-full rounded-2xl bg-violet-400 px-5 py-4 text-base font-black text-violet-950 transition hover:bg-violet-300">装置选定，开始连接与准备 →</button>}
        </div>
      </section>
    );
  }

  if (stage === 'preparation') {
    return (
      <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="heated-o2-preparation-title">
        <div className="mx-auto max-w-5xl">
          <div className="pr-12"><div className="text-[11px] font-black tracking-[0.18em] text-violet-300">实验方案与操作决策型 · 第2/5阶段 · {preparation.eyebrow}</div><h2 id="heated-o2-preparation-title" className="mt-1 text-xl font-black sm:text-2xl">连接查漏 → 装入固体 → 固定加热</h2></div>
          <div className="mt-4"><Progress stage={stage} /></div>
          <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)]">
            <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
              <div className="text-[11px] font-black tracking-widest text-violet-300">{preparation.eyebrow}</div><h3 className="mt-2 text-lg font-black">{preparation.title}</h3>
              <div className="mt-3 rounded-2xl border border-violet-300/30 bg-violet-400/10 px-4 py-3 text-sm font-black leading-6 text-violet-50">{preparation.question}</div>
              <div className="mt-4"><Choices options={preparation.options} selected={preparationAnswer} answer={preparation.answer} resolved={preparationResolved} onSelect={setPreparationAnswer} /></div>
              {preparationAnswer !== null && !preparationResolved && <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-400/10 p-4 text-sm font-semibold leading-6 text-rose-100" aria-live="polite">{preparation.wrongFeedback[preparationAnswer]}</div>}
              {preparationResolved && <div className="mt-4 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4 text-sm font-semibold leading-6 text-emerald-50" aria-live="polite">{preparation.conclusion}</div>}
            </div>
            <figure className="overflow-hidden rounded-3xl border border-slate-300 bg-white">
              <img src={preparationStep === 1 ? '/gas-labs/potassium-permanganate.jpg' : '/gas-labs/heated-oxygen-apparatus.png'} alt={preparationStep === 1 ? '高锰酸钾紫黑色固体实物照片' : '教材中正确的固体加热制氧气完整装置图'} className="aspect-[4/3] w-full object-contain" />
              <figcaption className="px-4 py-2 text-center text-[11px] font-bold text-slate-500">{preparationStep === 1 ? '高锰酸钾：紫黑色固体' : '对照教材正确装置：试管口略低于试管底部'}</figcaption>
            </figure>
          </div>
          {preparationResolved && <button type="button" onClick={nextPreparation} className="mt-5 w-full rounded-2xl bg-violet-400 px-5 py-4 text-base font-black text-violet-950 transition hover:bg-violet-300">{preparationStep === preparationDecisions.length - 1 ? '准备完成，判断收集时机 →' : '继续下一项准备 →'}</button>}
        </div>
      </section>
    );
  }

  if (stage === 'collection') {
    const options = ['导管口刚冒出第一个气泡，就立即用向上排空气法收集', '导管口气泡连续、均匀冒出后，再用排水法收集', '加热前先把空集气瓶倒扣在水中，始终不观察气泡'];
    return (
      <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="heated-o2-collection-title">
        <div className="mx-auto max-w-5xl">
          <div className="pr-12"><div className="text-[11px] font-black tracking-[0.18em] text-violet-300">实验方案与操作决策型 · 第3/5阶段</div><h2 id="heated-o2-collection-title" className="mt-1 text-xl font-black sm:text-2xl">什么时候开始收集，才能得到较纯氧气？</h2></div>
          <div className="mt-4"><Progress stage={stage} /></div>
          <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.82fr)]">
            <div className="rounded-3xl border border-slate-700 bg-slate-900 p-5">
              <div className="grid grid-cols-2 gap-2"><div className="rounded-2xl bg-slate-950 p-4"><div className="text-[10px] font-black text-slate-400">刚开始逸出的气体</div><div className="mt-1 text-sm font-black">主要是装置内原有空气</div></div><div className="rounded-2xl bg-slate-950 p-4"><div className="text-[10px] font-black text-slate-400">氧气与水</div><div className="mt-1 text-sm font-black">不易溶于水</div></div></div>
              <div className="mt-4"><Choices options={options} selected={collectionAnswer} answer={1} resolved={collectionResolved} onSelect={setCollectionAnswer} /></div>
              {collectionAnswer !== null && !collectionResolved && <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-400/10 p-4 text-sm font-semibold leading-6 text-rose-100" aria-live="polite">刚开始排出的是装置内原有空气。必须先排尽空气，不能一见气泡就收集。</div>}
              {collectionResolved && <div className="mt-4 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4 text-sm font-semibold leading-6 text-emerald-50" aria-live="polite">气泡连续、均匀冒出，说明空气基本排尽；再用排水法收集，可得到较纯的氧气。</div>}
            </div>
            <ApparatusFigure />
          </div>
          {collectionResolved && <button type="button" onClick={() => setStage('verification')} className="mt-5 w-full rounded-2xl bg-violet-400 px-5 py-4 text-base font-black text-violet-950 transition hover:bg-violet-300">氧气收集完成，进入检验 →</button>}
        </div>
      </section>
    );
  }

  if (stage === 'verification') {
    const options = ['把带火星木条伸入瓶内，木条复燃', '把燃着木条放在瓶口，木条熄灭', '向集气瓶内倒入澄清石灰水，石灰水变浑浊'];
    return (
      <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="heated-o2-verification-title">
        <div className="mx-auto max-w-4xl"><div className="pr-12"><div className="text-[11px] font-black tracking-[0.18em] text-violet-300">实验方案与操作决策型 · 第4/5阶段</div><h2 id="heated-o2-verification-title" className="mt-1 text-xl font-black sm:text-2xl">怎样证明收集到的是氧气？</h2></div><div className="mt-4"><Progress stage={stage} /></div>
          <div className="mt-4 rounded-3xl border border-slate-700 bg-slate-900 p-5"><Choices options={options} selected={verificationAnswer} answer={0} resolved={verificationResolved} onSelect={setVerificationAnswer} />
            {verificationAnswer !== null && !verificationResolved && <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-400/10 p-4 text-sm font-semibold leading-6 text-rose-100" aria-live="polite">氧气的专属检验现象是“带火星木条复燃”；燃着木条熄灭和石灰水变浑浊都对应二氧化碳。</div>}
            {verificationResolved && <div className="mt-4 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4 text-sm font-semibold leading-6 text-emerald-50" aria-live="polite">检验正确：带火星木条伸入集气瓶内，木条复燃，证明瓶内气体是氧气。</div>}
          </div>
          {verificationResolved && <button type="button" onClick={() => setStage('safety')} className="mt-5 w-full rounded-2xl bg-violet-400 px-5 py-4 text-base font-black text-violet-950 transition hover:bg-violet-300">气体确认无误，进入安全收尾 →</button>}
        </div>
      </section>
    );
  }

  const safetyOptions = ['先熄灭酒精灯，再将导管移出水面', '先将导管移出水面，再熄灭酒精灯'];
  return (
    <section className="bg-slate-950 px-3 pb-24 pt-4 text-white sm:px-5 sm:pt-5" aria-labelledby="heated-o2-safety-title">
      <div className="mx-auto max-w-4xl"><div className="pr-12"><div className="text-[11px] font-black tracking-[0.18em] text-emerald-300">实验方案与操作决策型 · 第5/5阶段</div><h2 id="heated-o2-safety-title" className="mt-1 text-xl font-black sm:text-2xl">最后判断：先移导管，还是先熄灯？</h2></div><div className="mt-4"><Progress stage={stage} /></div>
        <div className="mt-4 grid items-start gap-4 lg:grid-cols-2"><div className="rounded-3xl border border-slate-700 bg-slate-900 p-5"><Choices options={safetyOptions} selected={safetyAnswer} answer={1} resolved={safetyResolved} onSelect={setSafetyAnswer} />
          {safetyAnswer === 0 && <div className="mt-4 rounded-2xl border border-rose-300/40 bg-rose-400/10 p-4 text-sm font-semibold leading-6 text-rose-100" aria-live="polite">先熄灯后试管冷却，内部气压减小，水可能沿导管倒吸进热试管，导致试管炸裂。</div>}
          {safetyResolved && <div className="mt-4 rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4 text-sm font-semibold leading-6 text-emerald-50" aria-live="polite">先把导管移出水面，切断倒吸通道；随后再熄灭酒精灯。</div>}
        </div><div className="rounded-3xl border border-violet-300/30 bg-violet-400/10 p-5"><div className="text-xs font-black text-violet-200">后果链</div>{safetyAnswer === null ? <div className="mt-4 flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-violet-300/40 px-5 text-center text-sm font-bold leading-6 text-violet-100">先判断操作顺序，选择后再揭示水为什么会倒吸。</div> : <div className="mt-4 space-y-2 text-center text-sm font-black"><div className="rounded-xl bg-slate-900 px-3 py-2">先熄灯</div><div className="text-violet-300">↓</div><div className="rounded-xl bg-slate-900 px-3 py-2">试管冷却，内部气压降低</div><div className="text-violet-300">↓</div><div className="rounded-xl border border-rose-300/40 bg-rose-400/10 px-3 py-2 text-rose-100">水倒吸，热试管可能炸裂</div></div>}</div></div>
        {safetyResolved && <button type="button" onClick={onComplete} className="mt-5 w-full rounded-2xl bg-emerald-400 px-5 py-4 text-base font-black text-emerald-950 transition hover:bg-emerald-300">固体加热制氧决策完成，整理完整知识 →</button>}
      </div>
    </section>
  );
}
