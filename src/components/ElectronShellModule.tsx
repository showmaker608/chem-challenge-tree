import { ElectronShellTrainer } from './widgets/ElectronShellTrainer';

interface ElectronShellModuleProps {
  onBack: () => void;
  backLabel?: string;
}

export function ElectronShellModule({ onBack, backLabel = '返回知识树' }: ElectronShellModuleProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-page-start)] via-[var(--bg-page-mid)] to-[var(--bg-page-end)] text-[var(--text-main)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border-color)] bg-[var(--bg-card)]/95 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-3 lg:px-6">
          <button onClick={onBack} className="mb-2 text-xs font-black text-teal-700 hover:text-teal-900">
            ← {backLabel}
          </button>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-black tracking-[0.18em] text-violet-700">专项游玩模块</div>
              <h1 className="mt-0.5 text-xl font-black tracking-tight text-[var(--text-main)]">原子结构画图挑战</h1>
              <p className="mt-1 text-xs font-bold leading-relaxed text-[var(--text-muted)]">
                先逐层排电子，再亲手转移最外层电子，让原子变成离子，最后进入原子与离子挑战。
              </p>
            </div>
            <div className="shrink-0 rounded-2xl border border-violet-100 bg-violet-50 px-3 py-2 text-center">
              <div className="text-lg font-black text-violet-700">1–20</div>
              <div className="text-[10px] font-black text-violet-700">号元素</div>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl overflow-hidden sm:px-4 sm:py-4 lg:px-6">
        <div className="sm:rounded-[1.5rem] sm:border sm:border-[var(--border-color)] sm:shadow-sm">
          <ElectronShellTrainer />
        </div>
      </main>
    </div>
  );
}
