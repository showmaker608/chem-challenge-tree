import type { PlayModuleId } from '../types';

interface ScenarioChallengeModeProps {
  onBack: () => void;
  onOpenModule: (moduleId: PlayModuleId) => void;
}

const challenges: Array<{
  id: PlayModuleId;
  icon: string;
  eyebrow: string;
  title: string;
  mission: string;
  actions: string[];
  cardClass: string;
  buttonClass: string;
}> = [
  {
    id: 'elements',
    icon: '🧩',
    eyebrow: '元素密码局',
    title: '破解前20号元素',
    mission: '元素名称和符号被打乱了。用闪卡建立印象，再通过双向配对把密码全部复原。',
    actions: ['生活图像闪卡', '名称⇄符号配对', '掌握进度'],
    cardClass: 'border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50',
    buttonClass: 'bg-sky-700 hover:bg-sky-600',
  },
  {
    id: 'valence',
    icon: '⚖️',
    eyebrow: '炼金配方室',
    title: '修复化合价配方',
    mission: '错误的化学配方无法保持电荷平衡。记常见价、找原子团、拼化学式，再反推未知价。',
    actions: ['常见价速记', '原子团配对', '拼式与侦探'],
    cardClass: 'border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50',
    buttonClass: 'bg-amber-600 hover:bg-amber-500',
  },
  {
    id: 'electronShell',
    icon: '⚛️',
    eyebrow: '原子绘图站',
    title: '重建原子结构',
    mission: '根据原子序数判断核外电子总数，把电子逐层放回正确位置，并完成结构示意图。',
    actions: ['核外电子数', '逐层排电子', '原子与离子'],
    cardClass: 'border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50',
    buttonClass: 'bg-violet-700 hover:bg-violet-600',
  },
];

export function ScenarioChallengeMode({ onBack, onOpenModule }: ScenarioChallengeModeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-page-start)] via-[var(--bg-page-mid)] to-[var(--bg-page-end)] text-[var(--text-main)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border-color)] bg-[var(--bg-card)]/95 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <button onClick={onBack} className="text-xs font-black text-teal-700 hover:text-teal-900">
            ← 返回模式选择
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5 pb-12">
        <section className="relative overflow-hidden rounded-[1.75rem] border border-violet-200 bg-gradient-to-br from-slate-950 via-violet-950 to-teal-950 p-5 text-white shadow-xl sm:p-7">
          <div className="absolute inset-0 tiny-lab-dot opacity-10" />
          <div className="relative">
            <div className="text-[10px] font-black tracking-[0.24em] text-cyan-200">SCENARIO CHALLENGE</div>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">情景挑战模式</h1>
                <p className="mt-2 max-w-xl text-sm font-bold leading-6 text-white/75">
                  不先读一大段知识。先接任务、动手尝试、看到结果，再根据反馈修正。
                </p>
              </div>
              <div className="shrink-0 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
                <div className="text-xl font-black text-cyan-100">3</div>
                <div className="text-[10px] font-black text-white/65">个挑战</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 space-y-4" aria-label="已开放的情景挑战">
          {challenges.map((challenge, index) => (
            <article key={challenge.id} className={`rounded-[1.5rem] border p-4 shadow-sm sm:p-5 ${challenge.cardClass}`}>
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/70 bg-white/80 text-2xl shadow-sm">
                  {challenge.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[10px] font-black tracking-[0.18em] text-[var(--text-muted)]">任务 {index + 1} · {challenge.eyebrow}</div>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700">已开放</span>
                  </div>
                  <h2 className="mt-1 text-lg font-black text-[var(--text-main)]">{challenge.title}</h2>
                  <p className="mt-2 text-xs font-bold leading-5 text-[var(--text-muted)]">{challenge.mission}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {challenge.actions.map((action) => (
                  <span key={action} className="rounded-full border border-[var(--border-color)] bg-white/75 px-2.5 py-1 text-[10px] font-black text-teal-900">
                    {action}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onOpenModule(challenge.id)}
                aria-label={`开始${challenge.title}`}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 ${challenge.buttonClass}`}
              >
                接受任务，开始挑战 →
              </button>
            </article>
          ))}
        </section>

        <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-xs font-bold leading-5 text-teal-900">
          这里的挑战不会冒充系统讲课：先操作、再反馈、最后才归纳规则。后续只把真正有操作价值的内容加入这里。
        </div>
      </main>
    </div>
  );
}
