interface ChapterHeaderProps {
  icon: string;
  name: string;
  completed: number;
  total: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ChapterHeader({ icon, name, completed, total, isExpanded, onToggle }: ChapterHeaderProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl px-4 py-3 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 text-left">
        <div className="font-medium text-sm text-slate-200">{name}</div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-slate-500">{completed}/{total}</span>
        </div>
      </div>
      <span className={`text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
        ▼
      </span>
    </button>
  );
}
