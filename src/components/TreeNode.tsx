interface TreeNodeProps {
  id: string;
  topic: string;
  difficulty: number;
  status: 'locked' | 'available' | 'completed';
  lockedReason?: string;
  onClick: () => void;
}

const diffStars = (d: number) => '⭐'.repeat(d);

export function TreeNode({ topic, difficulty, status, lockedReason, onClick }: TreeNodeProps) {
  const baseClass = "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer border";

  if (status === 'locked') {
    return (
      <div
        onClick={onClick}
        className={`${baseClass} bg-slate-800/30 border-slate-700/30 hover:border-amber-400/50 opacity-75`}
      >
        <span className="text-lg">🧪</span>
        <div className="flex-1">
          <div className="text-sm text-slate-400">{topic}</div>
          {lockedReason && <div className="text-[11px] text-amber-400/80 mt-0.5">{lockedReason}</div>}
        </div>
        <span className="text-xs text-slate-700">{diffStars(difficulty)}</span>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div
        onClick={onClick}
        className={`${baseClass} bg-emerald-900/20 border-emerald-500/30 hover:border-emerald-400/50`}
      >
        <span className="text-lg">✅</span>
        <div className="flex-1">
          <div className="text-sm text-emerald-300">{topic}</div>
        </div>
        <span className="text-xs text-emerald-600">{diffStars(difficulty)}</span>
      </div>
    );
  }

  // available
  return (
    <div
      onClick={onClick}
      className={`${baseClass} bg-slate-800/60 border-cyan-500/40 hover:border-cyan-400/70 node-available`}
    >
      <span className="text-lg">⚡</span>
      <div className="flex-1">
        <div className="text-sm text-cyan-300 font-medium">{topic}</div>
      </div>
      <span className="text-xs text-amber-500">{diffStars(difficulty)}</span>
    </div>
  );
}
