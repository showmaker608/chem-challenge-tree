import { useEffect, useRef, useState } from 'react';
import type { PlayerState } from '../types';
import { getLevel, getNextLevel } from '../types';

interface StatusBarProps {
  state: PlayerState;
  totalNodes: number;
}

const encouragements = [
  '冲！你是最棒的！',
  '刷题使我快乐🧪',
  '今天也是满分的一天',
  '元素之主就是你',
  '化学，拿捏了',
  '下一个拉瓦锡！',
  '冲冲冲！',
];

export function StatusBar({ state, totalNodes }: StatusBarProps) {
  const currentLevel = getLevel(state.xp);
  const nextLevel = getNextLevel(state.xp);
  const xpProgress = nextLevel
    ? ((state.xp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100
    : 100;

  const prevLevelRef = useRef(currentLevel.level);
  const [justLeveled, setJustLeveled] = useState(false);
  useEffect(() => {
    let showTimer: number | undefined;
    let hideTimer: number | undefined;

    if (currentLevel.level > prevLevelRef.current) {
      showTimer = window.setTimeout(() => setJustLeveled(true), 0);
      hideTimer = window.setTimeout(() => setJustLeveled(false), 2000);
    }
    prevLevelRef.current = currentLevel.level;

    return () => {
      if (showTimer) window.clearTimeout(showTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [currentLevel.level]);

  const showFire = state.streak >= 5;

  // 随机鼓励文案
  const [tip] = useState(() => encouragements[Math.floor(Math.random() * encouragements.length)]);

  return (
    <div className="sticky top-0 z-40 bg-[var(--bg-card)]/95 backdrop-blur-md border-b border-[var(--border-color)] shadow-sm shadow-emerald-950/5">
      {/* 吉祥物鼓励条 */}
      <div className={`px-4 py-1.5 text-center text-xs font-bold transition-colors flex items-center justify-center gap-2 ${justLeveled ? 'bg-[var(--bg-amber-dark)] text-amber-800' : showFire ? 'bg-[var(--bg-orange)] text-orange-800' : 'bg-[var(--bg-highlight)] text-teal-800'}`}>
        <img
          src={`/avatars/flask-${justLeveled ? 'wow' : showFire ? 'fire' : 'idle'}.svg`}
          alt=""
          className={`h-12 w-12 object-contain drop-shadow-sm ${justLeveled ? 'animate-bounce-in' : 'animate-float'}`}
        />
        <span>
          {justLeveled ? `升级了！！Lv.${currentLevel.level} ${currentLevel.name}！！` : showFire ? `连胜 ${state.streak} 题！势不可挡！` : tip}
        </span>
      </div>

      {/* 状态栏 */}
      <div className="flex items-center gap-3 max-w-lg mx-auto px-4 py-2">
        {/* 等级徽章 */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-lg transition-all shadow-md ${justLeveled ? 'from-amber-300 to-orange-400 scale-110' : 'from-teal-500 to-emerald-500'}`}>
          {currentLevel.icon}
        </div>

        {/* 等级信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold transition-colors ${justLeveled ? 'text-amber-700' : 'text-[var(--text-main)]'}`}>
              Lv.{currentLevel.level}
            </span>
            <span className="text-xs font-medium text-teal-800">{currentLevel.name}</span>
          </div>
          <div className="h-2 bg-[var(--bg-disabled)] rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-700 ${justLeveled ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-teal-500 to-emerald-500'}`}
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>

        {/* 统计 */}
        <div className="flex-shrink-0 flex items-center gap-3 text-xs">
          <div className={`text-center ${showFire ? 'animate-pulse' : ''}`}>
            <span className={showFire ? 'text-amber-400 font-bold' : 'text-orange-400'}>
              {showFire ? '🔥🔥' : '🔥'}
            </span>
            <span className="text-teal-800 font-bold ml-0.5">{state.streak}</span>
          </div>
          <div className="text-center">
            <span className="text-emerald-700 font-bold">{state.completedNodes.length}</span>
            <span className="text-teal-800 font-medium">/{totalNodes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
