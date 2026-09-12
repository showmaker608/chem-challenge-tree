import { useState } from 'react';

type MistakeTag =
  | 'element-count'
  | 'coefficient-subscript'
  | 'atom-molecule'
  | 'composition-structure';

const mistakeLabels: Record<MistakeTag, string> = {
  'element-count': '元素和原子混淆',
  'coefficient-subscript': '系数和下标混淆',
  'atom-molecule': '原子和分子混淆',
  'composition-structure': '组成和构成错配',
};

interface ChoiceOption {
  id: string;
  label: string;
}

function ChoiceGroup({
  options,
  value,
  answer,
  hint,
  success,
  onChoose,
}: {
  options: ChoiceOption[];
  value: string | null;
  answer: string;
  hint: string;
  success: string;
  onChoose: (id: string) => void;
}) {
  const resolved = value === answer;

  return (
    <div className="space-y-2.5">
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const chosen = value === option.id;
          const classes = resolved && chosen
            ? 'border-emerald-300 bg-emerald-300 text-emerald-950 shadow-lg shadow-emerald-950/20'
            : chosen
              ? 'border-amber-300 bg-amber-300/15 text-amber-100'
              : 'border-white/15 bg-slate-950/60 text-slate-100 hover:border-cyan-300/70 hover:bg-slate-900';

          return (
            <button
              key={option.id}
              type="button"
              disabled={resolved}
              onClick={() => onChoose(option.id)}
              className={`min-h-12 rounded-2xl border-2 px-3 py-2.5 text-center text-sm font-black transition ${classes}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {value !== null && (
        <div
          role="status"
          className={`rounded-2xl border px-3 py-2.5 text-sm font-bold leading-6 ${
            resolved
              ? 'border-emerald-300/40 bg-emerald-300/10 text-emerald-100'
              : 'border-amber-300/40 bg-amber-300/10 text-amber-100'
          }`}
        >
          {resolved ? success : hint}
        </div>
      )}
    </div>
  );
}

function AtomBall({
  label,
  selected = false,
  compact = false,
  onClick,
}: {
  label?: string;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <span
      className={`grid place-items-center rounded-full border-[3px] font-black shadow-[inset_-8px_-10px_18px_rgba(127,29,29,0.28),0_8px_18px_rgba(15,23,42,0.28)] transition ${compact ? 'h-9 w-9 text-xs sm:h-10 sm:w-10 sm:text-sm' : 'h-14 w-14 text-lg sm:h-16 sm:w-16'} ${
        selected
          ? 'scale-110 border-cyan-200 bg-rose-400 text-white ring-4 ring-cyan-300/35'
          : 'border-rose-200/85 bg-rose-500 text-white'
      }`}
    >
      {label ?? ''}
    </span>
  );

  if (!onClick) return content;
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/60"
      aria-label="选择其中一个具体微粒"
    >
      {content}
    </button>
  );
}

function OxygenMolecule({ compact = false, dense = false }: { compact?: boolean; dense?: boolean }) {
  const atomClass = dense
    ? 'h-7 w-7 border-2 text-[9px]'
    : compact
      ? 'h-10 w-10 text-sm'
      : 'h-12 w-12 text-base sm:h-14 sm:w-14';
  const bondClass = dense ? 'h-1 w-2' : 'h-1.5 w-4';
  return (
    <div className="flex items-center" aria-label="一个由两个同种原子连接成的微粒">
      <span className={`grid place-items-center rounded-full border-[3px] border-rose-200 bg-rose-500 font-black text-white shadow-lg ${atomClass}`}>O</span>
      <span className={`${bondClass} bg-rose-200`} aria-hidden="true" />
      <span className={`grid place-items-center rounded-full border-[3px] border-rose-200 bg-rose-500 font-black text-white shadow-lg ${atomClass}`}>O</span>
    </div>
  );
}

function StageHeader({ step, title, lead }: { step: string; title: string; lead: string }) {
  return (
    <div>
      <div className="text-[11px] font-black tracking-[0.2em] text-cyan-300">{step}</div>
      <h3 className="mt-1.5 text-xl font-black leading-tight text-white sm:text-2xl">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-300 sm:text-base">{lead}</p>
    </div>
  );
}

function RelationSummary() {
  return (
    <div
      className="rounded-3xl border border-cyan-300/35 bg-slate-950/45 p-4 sm:p-5"
      aria-label="宏观与微观关系总结"
    >
      <div className="text-xs font-black tracking-[0.18em] text-cyan-200">最后收成一张关系图</div>
      <h4 className="mt-1.5 text-lg font-black text-white">先圈主语，再沿一条箭头回答</h4>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-violet-300/30 bg-violet-300/[0.08] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black tracking-wider text-violet-200">宏观 · 看整份物质</span>
            <span className="rounded-full bg-violet-300/15 px-2.5 py-1 text-[10px] font-black text-violet-100">只谈种类</span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-center font-black">
            <span className="rounded-xl bg-slate-950/60 px-3 py-2 text-white">物质</span>
            <span className="text-xs leading-4 text-violet-200">—组成→</span>
            <span className="rounded-xl bg-violet-300 px-3 py-2 text-violet-950">元素</span>
          </div>
          <p className="mt-3 text-xs font-semibold leading-5 text-slate-300">问“由哪些元素组成”，回答元素种类，不说几个元素。</p>
        </div>

        <div className="rounded-2xl border border-cyan-300/30 bg-cyan-300/[0.08] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black tracking-wider text-cyan-200">微观 · 看具体微粒</span>
            <span className="rounded-full bg-cyan-300/15 px-2.5 py-1 text-[10px] font-black text-cyan-100">谈种类，也谈个数</span>
          </div>
          <div className="mt-3 space-y-2 text-center font-black">
            <div className="flex items-center justify-center gap-2">
              <span className="rounded-xl bg-slate-950/60 px-3 py-2 text-white">物质</span>
              <span className="text-xs leading-4 text-cyan-200">—构成→</span>
              <span className="rounded-xl bg-cyan-300 px-3 py-2 text-cyan-950">分子／原子／离子</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="rounded-xl bg-slate-950/60 px-3 py-2 text-white">分子</span>
              <span className="text-xs leading-4 text-cyan-200">—构成→</span>
              <span className="rounded-xl bg-cyan-300 px-3 py-2 text-cyan-950">原子</span>
            </div>
          </div>
          <p className="mt-3 text-xs font-semibold leading-5 text-slate-300">先判断是哪一种微粒，再说明有几个或内部含几个原子。</p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-amber-300/30 bg-amber-300/[0.08] px-3 py-2.5 text-center text-xs font-black leading-5 text-amber-100">
        注意：不是所有物质都由分子构成；构成物质的微粒还可能是原子或离子。
      </div>
    </div>
  );
}

function ContinueButton({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl bg-cyan-400 px-4 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-300"
    >
      {children}
    </button>
  );
}

export function ChemicalSymbolMeaningLab({ onComplete }: { onComplete?: () => void }) {
  const [stage, setStage] = useState(0);
  const [groupChoice, setGroupChoice] = useState<string | null>(null);
  const [selectedAtom, setSelectedAtom] = useState<number | null>(null);
  const [atomCountChoice, setAtomCountChoice] = useState<string | null>(null);
  const [moleculeChoice, setMoleculeChoice] = useState<string | null>(null);
  const [moleculeCountChoice, setMoleculeCountChoice] = useState<string | null>(null);
  const [macroChoice, setMacroChoice] = useState<string | null>(null);
  const [microChoice, setMicroChoice] = useState<string | null>(null);
  const [transferChoice, setTransferChoice] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState<MistakeTag[]>([]);

  const recordMistake = (tag: MistakeTag) => {
    setMistakes((current) => current.includes(tag) ? current : [...current, tag]);
  };

  const choose = (
    value: string,
    answer: string,
    setter: (next: string) => void,
    tag: MistakeTag,
  ) => {
    setter(value);
    if (value !== answer) recordMistake(tag);
  };

  const stageTitles = ['从一类到一个', '三个氧原子', '从原子看到分子', '两副镜头'];

  return (
    <section
      className="min-h-[660px] bg-[radial-gradient(circle_at_top,_#164e63_0%,_#0f172a_42%,_#020617_100%)] px-4 pb-28 pt-5 text-white sm:px-6 sm:pt-6"
      aria-label="化学符号翻译机互动学习"
      data-testid="chemical-symbol-meaning-lab"
    >
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black tracking-[0.18em] text-cyan-300">化学符号翻译机 · 约3分钟</div>
            <h2 className="mt-1 text-lg font-black text-white sm:text-xl">O → 3O → O₂ → 3O₂</h2>
          </div>
          <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black text-cyan-100">
            {stage + 1}/4
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-1.5" aria-label={`当前进度：${stageTitles[stage]}`}>
          {stageTitles.map((title, index) => (
            <div key={title} className="space-y-1">
              <div className={`h-1.5 rounded-full ${index <= stage ? 'bg-cyan-400' : 'bg-white/15'}`} />
              <div className={`hidden text-center text-[10px] font-bold sm:block ${index === stage ? 'text-cyan-200' : 'text-slate-500'}`}>{title}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-slate-950/35 backdrop-blur sm:p-6">
          {stage === 0 && (
            <div className="space-y-5" data-testid="symbol-stage-element">
              <StageHeader
                step="第1屏 · 先分清类别和个体"
                title="这些同类微粒，共同属于什么？"
                lead="它们都是氧这一类的原子。先判断这一整类应该叫什么。"
              />

              <div className="rounded-3xl border-2 border-dashed border-violet-300/45 bg-violet-300/[0.07] p-4">
                <div className="mx-auto grid max-w-xl grid-cols-6 place-items-center gap-2 sm:grid-cols-8 sm:gap-3">
                  {Array.from({ length: 24 }, (_, index) => (
                    <AtomBall
                      key={index}
                      label={selectedAtom === index ? 'O' : undefined}
                      selected={selectedAtom === index}
                      compact
                      onClick={groupChoice === 'oxygen-element' ? () => setSelectedAtom(index) : undefined}
                    />
                  ))}
                </div>
                <div className="mt-3 text-center text-xs font-bold text-violet-100">一大片同类原子：数量很多，但仍然只是一种元素</div>
              </div>

              <ChoiceGroup
                options={[
                  { id: 'oxygen-element', label: '氧元素' },
                  { id: 'many-elements', label: '很多个氧元素' },
                  { id: 'oxygen-molecule', label: '氧分子' },
                ]}
                value={groupChoice}
                answer="oxygen-element"
                hint="元素说的是一类，不能把这一大片同类原子数成“很多个元素”。"
                success="对。元素是一类原子的总称，只谈种类，不谈几个。现在点出其中一个具体微粒。"
                onChoose={(value) => choose(value, 'oxygen-element', setGroupChoice, 'element-count')}
              />

              {selectedAtom !== null && (
                <div className="grid gap-3 sm:grid-cols-2" role="status">
                  <div className="rounded-2xl border border-violet-300/35 bg-violet-300/10 p-3">
                    <div className="text-3xl font-black text-violet-200">O</div>
                    <div className="mt-1 text-sm font-black">表示氧元素</div>
                    <div className="mt-1 text-xs font-semibold text-slate-300">宏观概念：表示这一类原子</div>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-3">
                    <div className="text-3xl font-black text-cyan-200">O</div>
                    <div className="mt-1 text-sm font-black">也表示一个氧原子</div>
                    <div className="mt-1 text-xs font-semibold text-slate-300">微观概念：一个具体微粒</div>
                  </div>
                </div>
              )}

              {selectedAtom !== null && <ContinueButton onClick={() => setStage(1)}>拿一个，会不会表示三个？ →</ContinueButton>}
            </div>
          )}

          {stage === 1 && (
            <div className="space-y-5" data-testid="symbol-stage-atoms">
              <StageHeader
                step="第2屏 · 数完整微粒"
                title="三个氧原子，数字写在哪里？"
                lead="图中是三个彼此独立的氧原子。根据你看到的微粒，把它翻译成化学符号。"
              />

              <div className="rounded-3xl border border-cyan-300/25 bg-cyan-300/[0.07] p-5">
                <div className="flex items-center justify-center gap-5 sm:gap-8">
                  <AtomBall label="O" />
                  <AtomBall label="O" />
                  <AtomBall label="O" />
                </div>
                <div className="mt-4 text-center text-sm font-black text-cyan-100">三个分开的氧原子</div>
              </div>

              <ChoiceGroup
                options={[
                  { id: '3O', label: '3O' },
                  { id: 'O3', label: 'O₃' },
                  { id: '3O2', label: '3O₂' },
                ]}
                value={atomCountChoice}
                answer="3O"
                hint="你正在数三个完整、分开的原子。表示微粒个数的数字放在元素符号前面。"
                success="推出来了：元素符号前面的3，表示3个完整的氧原子。"
                onChoose={(value) => choose(value, '3O', setAtomCountChoice, 'coefficient-subscript')}
              />

              {atomCountChoice === '3O' && (
                <div className="rounded-2xl bg-white/10 p-3 text-center text-sm font-black text-cyan-100">
                  前面的数字数“几个完整微粒”：3 × O = 3O
                </div>
              )}

              {atomCountChoice === '3O' && <ContinueButton onClick={() => setStage(2)}>原子组成分子后，数字会去哪？ →</ContinueButton>}
            </div>
          )}

          {stage === 2 && (
            <div className="space-y-5" data-testid="symbol-stage-molecule">
              <StageHeader
                step="第3屏 · 看一个微粒内部"
                title="一个氧分子里有两个氧原子"
                lead="这里的两个氧原子已经连接成一个完整微粒。它应该写成什么？"
              />

              <div className="flex justify-center rounded-3xl border border-rose-300/25 bg-rose-300/[0.07] p-5">
                <OxygenMolecule />
              </div>

              <ChoiceGroup
                options={[
                  { id: 'O2', label: 'O₂' },
                  { id: '2O', label: '2O' },
                  { id: 'O', label: 'O' },
                ]}
                value={moleculeChoice}
                answer="O2"
                hint="现在只有一个完整微粒，但这个微粒内部有两个氧原子。"
                success="对。右下角的2属于O，表示一个氧分子中含2个氧原子。"
                onChoose={(value) => choose(value, 'O2', setMoleculeChoice, 'atom-molecule')}
              />

              {moleculeChoice === 'O2' && (
                <div className="space-y-3 rounded-3xl border border-violet-300/25 bg-violet-300/[0.07] p-4">
                  <div className="flex flex-wrap justify-center gap-5">
                    <OxygenMolecule compact />
                    <OxygenMolecule compact />
                    <OxygenMolecule compact />
                  </div>
                  <div className="text-center text-sm font-black text-violet-100">现在有三个氧分子，怎么写？</div>
                  <ChoiceGroup
                    options={[
                      { id: '3O2', label: '3O₂' },
                      { id: 'O6', label: 'O₆' },
                      { id: '3O', label: '3O' },
                    ]}
                    value={moleculeCountChoice}
                    answer="3O2"
                    hint="先保留一个氧分子的符号O₂，再把分子个数写在整个符号前面。"
                    success="对：3O₂表示3个氧分子，每个分子含2个氧原子，共6个氧原子。"
                    onChoose={(value) => choose(value, '3O2', setMoleculeCountChoice, 'coefficient-subscript')}
                  />
                </div>
              )}

              {moleculeCountChoice === '3O2' && <ContinueButton onClick={() => setStage(3)}>最后用两副镜头读化学式 →</ContinueButton>}
            </div>
          )}

          {stage === 3 && (
            <div className="space-y-5" data-testid="symbol-stage-macro-micro">
              <StageHeader
                step="第4屏 · 主语决定后面接谁"
                title="整份物质和一个分子，不是一层"
                lead="先看氧气这种物质，再放大到一个氧分子。每次只走直接的一层。"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-violet-300/30 bg-violet-300/[0.08] p-4">
                  <div className="text-xs font-black tracking-wider text-violet-200">宏观镜头 · 氧气这种物质</div>
                  <div className="mt-3 grid grid-cols-4 place-items-center gap-2 opacity-85 sm:grid-cols-5">
                    {Array.from({ length: 20 }, (_, index) => (
                      <OxygenMolecule key={index} dense />
                    ))}
                  </div>
                  <div className="mt-2 text-center text-[10px] font-bold leading-4 text-violet-100">内部有大量氧分子，图中仅为局部示意</div>
                  <div className="mt-3 text-center text-2xl font-black">O₂</div>
                </div>
                <div className="rounded-3xl border border-cyan-300/30 bg-cyan-300/[0.08] p-4">
                  <div className="text-xs font-black tracking-wider text-cyan-200">微观镜头 · 一个氧分子</div>
                  <div className="mt-4 flex justify-center"><OxygenMolecule /></div>
                  <div className="mt-3 text-center text-2xl font-black">O₂</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-black text-white">氧气这种物质由什么组成？</div>
                <ChoiceGroup
                  options={[
                    { id: 'oxygen-element', label: '氧元素' },
                    { id: 'two-atoms', label: '2个氧原子' },
                    { id: 'two-elements', label: '2个氧元素' },
                  ]}
                  value={macroChoice}
                  answer="oxygen-element"
                  hint="主语是氧气这种物质，问“组成”时回答元素种类，而且元素不谈几个。"
                  success="氧气由氧元素组成。宏观只谈元素种类。"
                  onChoose={(value) => choose(value, 'oxygen-element', setMacroChoice, 'composition-structure')}
                />
              </div>

              {macroChoice === 'oxygen-element' && (
                <div className="space-y-2">
                  <div className="text-sm font-black text-white">一个氧分子由什么构成？</div>
                  <ChoiceGroup
                    options={[
                      { id: 'two-oxygen-atoms', label: '2个氧原子' },
                      { id: 'oxygen-element', label: '氧元素' },
                      { id: 'two-oxygen-elements', label: '2个氧元素' },
                    ]}
                    value={microChoice}
                    answer="two-oxygen-atoms"
                    hint="主语已经放大到一个具体分子，应该用具体原子说明它的内部结构。"
                    success="一个氧分子由2个氧原子构成。微观既谈种类，也谈个数。"
                    onChoose={(value) => choose(value, 'two-oxygen-atoms', setMicroChoice, 'composition-structure')}
                  />
                </div>
              )}

              {microChoice === 'two-oxygen-atoms' && (
                <div className="space-y-2 rounded-3xl border border-amber-300/30 bg-amber-300/[0.07] p-4">
                  <div className="text-xs font-black tracking-wider text-amber-200">迁移到上海常见文字题</div>
                  <div className="text-sm font-black leading-6 text-white">关于水的说法，哪一句层级正确？</div>
                  <ChoiceGroup
                    options={[
                      { id: 'water-atoms', label: '水由氢原子和氧原子组成' },
                      { id: 'molecule-atoms', label: '一个水分子由2个氢原子和1个氧原子构成' },
                      { id: 'molecule-elements', label: '一个水分子由氢、氧元素构成' },
                    ]}
                    value={transferChoice}
                    answer="molecule-atoms"
                    hint="先圈主语。“一个水分子”是具体微粒，应直接接构成它的原子。"
                    success="正确。物质—组成→元素；分子—构成→原子。"
                    onChoose={(value) => choose(value, 'molecule-atoms', setTransferChoice, 'composition-structure')}
                  />
                </div>
              )}

              {transferChoice === 'molecule-atoms' && (
                <div className="space-y-4">
                  <RelationSummary />

                  <div className="space-y-4 rounded-3xl border border-emerald-300/40 bg-emerald-300/[0.09] p-4 sm:p-5" role="status">
                    <div>
                      <div className="text-xs font-black tracking-[0.18em] text-emerald-200">四步推导完成</div>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                          ['O', '氧元素／1个氧原子'],
                          ['3O', '3个氧原子'],
                          ['O₂', '氧气／1个氧分子'],
                          ['3O₂', '3个氧分子'],
                        ].map(([formula, meaning]) => (
                          <div key={formula} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3 text-center">
                            <div className="text-2xl font-black text-white">{formula}</div>
                            <div className="mt-1 text-[11px] font-bold leading-4 text-slate-300">{meaning}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-100">本次需要留意</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {mistakes.length === 0 ? (
                          <span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-black text-emerald-950">一次推导通过</span>
                        ) : mistakes.map((tag) => (
                          <span key={tag} className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-100">
                            {mistakeLabels[tag]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onComplete}
                      className="w-full rounded-2xl bg-emerald-300 px-4 py-3.5 text-sm font-black text-emerald-950 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-200"
                    >
                      完成互动推导，整理规则 →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
