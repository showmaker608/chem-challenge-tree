import type { PlayerState } from '../types';
import { getLevel, getNextLevel } from '../types';

interface StatusBarProps {
  state: PlayerState;
  totalNodes: number;
}

export function StatusBar({ state, totalNodes }: StatusBarProps) {
  const currentLevel = getLevel(state.xp);
  const nextLevel = getNextLevel(state.xp);
  const xpProgress = nextLevel
    ? ((state.xp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100
    : 100;

  return (
    <div className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50 px-4 py-3">
      <div className="flex items-center gap-3 max-w-lg mx-auto">
        {/* 等级徽章 */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-lg">
          {currentLevel.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Lv.{currentLevel.level}</span>
            <span className="text-xs text-slate-400">{currentLevel.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 flex-shrink-0">{state.xp} XP</span>
          </div>
        </div>
        {/* 右侧统计 */}
        <div className="flex-shrink-0 text-right">
          <div className="text-xs text-slate-400">
            🔥 <span className="text-orange-400 font-medium">{state.streak}</span>
          </div>
          <div className="text-xs text-slate-400">
            📖 <span className="text-emerald-400 font-medium">{state.completedNodes.length}</span>/{totalNodes}
          </div>
        </div>
      </div>
    </div>
  );
}
