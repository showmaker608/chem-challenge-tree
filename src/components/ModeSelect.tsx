interface ModeSelectProps {
  onSkillTree: () => void;
  onReview: () => void;
}

export function ModeSelect({ onSkillTree, onReview }: ModeSelectProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="text-center max-w-sm mx-auto">
        <div className="text-5xl mb-6">⚗️</div>
        <h2 className="text-xl font-bold text-white mb-2">选择学习模式</h2>
        <p className="text-sm text-slate-400 mb-8">两种模式进度独立，错题都会收录</p>

        <div className="space-y-4">
          <button
            onClick={onSkillTree}
            className="w-full bg-slate-800/70 border border-slate-700/50 hover:border-cyan-500/50 rounded-2xl p-5 text-left transition-all"
          >
            <div className="text-3xl mb-2">🌳</div>
            <div className="text-base font-bold text-white mb-1">知识树闯关</div>
            <div className="text-xs text-slate-400 leading-relaxed">
              7章 · 30个知识点 · 顺序解锁<br />
              从物质变化到化学方程式，循序渐进
            </div>
          </button>

          <button
            onClick={onReview}
            className="w-full bg-slate-800/70 border border-slate-700/50 hover:border-amber-500/50 rounded-2xl p-5 text-left transition-all"
          >
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-base font-bold text-white mb-1">期末复习</div>
            <div className="text-xs text-slate-400 leading-relaxed">
              7个专题 · 22个知识点 · 自由选题<br />
              实验探究 + 方程式 + 微观本质，任意刷
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
