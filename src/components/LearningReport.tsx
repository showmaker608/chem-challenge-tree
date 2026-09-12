import { useMemo } from 'react';
import type { Chapter, KnowledgePoint, PlayerState, StudentProfile } from '../types';
import { getLevel, getNextLevel } from '../types';

interface LearningReportProps {
  profile: StudentProfile | null;
  state: PlayerState;
  chapters: Chapter[];
  courseName: string;
  totalNodes: number;
  allNodes: KnowledgePoint[];
  onClose: () => void;
  onOpenWrongBook: () => void;
}

export function LearningReport({ profile, state, chapters, courseName, totalNodes, allNodes, onClose, onOpenWrongBook }: LearningReportProps) {
  const currentLevel = getLevel(state.xp);
  const nextLevel = getNextLevel(state.xp);
  const xpProgress = nextLevel
    ? ((state.xp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100
    : 100;

  const completed = state.completedNodes.length;
  const completionPct = totalNodes > 0 ? Math.round((completed / totalNodes) * 100) : 0;

  // 各章节统计
  const chapterStats = useMemo(() => {
    return chapters.map(ch => {
      const chNodes = ch.sections.flatMap(s => s.nodes);
      const done = chNodes.filter(n => state.completedNodes.includes(n.id)).length;
      const total = chNodes.length;
      const bestScores = chNodes
        .map(n => state.nodeStates[n.id]?.bestScore ?? 0)
        .filter(s => s > 0);
      const avgScore = bestScores.length > 0
        ? Math.round(bestScores.reduce((a, b) => a + b, 0) / bestScores.length)
        : null;
      return { ...ch, done, total, avgScore };
    });
  }, [chapters, state.completedNodes, state.nodeStates]);

  // 薄弱知识点（已完成但正确率最低的 5 个）
  const weakNodes = useMemo(() => {
    return allNodes
      .filter(n => state.completedNodes.includes(n.id))
      .map(n => ({ node: n, bestScore: state.nodeStates[n.id]?.bestScore ?? 0 }))
      .sort((a, b) => a.bestScore - b.bestScore)
      .slice(0, 5)
      .filter(n => n.bestScore < 100);
  }, [allNodes, state.completedNodes, state.nodeStates]);

  // 错题统计
  const wrongByChapter = useMemo(() => {
    const nodesById = new Map(allNodes.map(n => [n.id, n]));
    const byChapter = new Map<string, { name: string; count: number }>();
    for (const w of state.wrongList) {
      const node = nodesById.get(w.nodeId);
      if (!node) continue;
      const ch = chapters.find(c => c.sections.some(s => s.nodes.some(n => n.id === node.id)));
      const key = ch?.id ?? 'unknown';
      const existing = byChapter.get(key);
      if (existing) existing.count++;
      else byChapter.set(key, { name: ch?.name ?? '未知章节', count: 1 });
    }
    return [...byChapter.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
  }, [state.wrongList, allNodes, chapters]);

  // 自动诊断只使用当前已有证据：未清错题、知识点最佳得分和尝试次数。
  // wrongList 会在清错后移除记录，因此这里描述“当前优先补缺”，不把它当作长期能力定论。
  const diagnosticFocuses = useMemo(() => {
    const nodesById = new Map(allNodes.map(n => [n.id, n]));
    const grouped = new Map<string, {
      nodeId: string;
      topic: string;
      wrongCount: number;
      misconceptionTags: Set<string>;
    }>();

    for (const wrong of state.wrongList) {
      const current = grouped.get(wrong.nodeId) ?? {
        nodeId: wrong.nodeId,
        topic: nodesById.get(wrong.nodeId)?.topic ?? wrong.nodeTopic,
        wrongCount: 0,
        misconceptionTags: new Set<string>(),
      };
      current.wrongCount += 1;
      if (wrong.misconceptionTag) current.misconceptionTags.add(wrong.misconceptionTag);
      grouped.set(wrong.nodeId, current);
    }

    return [...grouped.values()]
      .map((item) => {
        const nodeState = state.nodeStates[item.nodeId];
        const bestScore = nodeState?.bestScore ?? 0;
        const attempts = nodeState?.attempts ?? 0;
        const priority = item.wrongCount * 30
          + (bestScore > 0 ? Math.max(0, 100 - bestScore) : 20)
          + Math.max(0, attempts - 1) * 5;
        const needsRepair = item.wrongCount >= 2 || (bestScore > 0 && bestScore < 80);

        return {
          ...item,
          bestScore,
          attempts,
          priority,
          levelLabel: needsRepair ? '优先补缺' : '复测确认',
          nextStep: needsRepair
            ? '先看对应点拨，再清掉这一组错题。'
            : '先重做错题，再用一道变式确认是否稳定。',
          misconception: [...item.misconceptionTags][0] ?? null,
        };
      })
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
  }, [allNodes, state.nodeStates, state.wrongList]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-300">← 返回</button>
          <h1 className="text-lg font-bold text-white">学习报告</h1>
          <div className="w-12" />
        </div>

        {/* 个人信息卡片 */}
        <div className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-4">
            {(profile?.avatar?.startsWith('/')) ? (
              <img src={profile.avatar} alt="" className="w-14 h-14 object-cover rounded-xl" />
            ) : (
              <div className="text-4xl">{profile?.avatar ?? '🔬'}</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold text-white">{profile?.displayName ?? profile?.studentName ?? '学生'}</div>
              <div className="text-xs text-slate-400">{profile?.className ?? ''} · {courseName}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm font-bold ${xpProgress === 100 ? 'text-amber-400' : 'text-cyan-400'}`}>
                  Lv.{currentLevel.level}
                </span>
                <span className="text-xs text-slate-500">{currentLevel.name}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-400">{state.xp}</div>
              <div className="text-xs text-slate-500">总 XP</div>
            </div>
          </div>
          {/* XP 进度条 */}
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          {nextLevel && (
            <div className="text-xs text-slate-500 mt-1 text-right">
              距离 Lv.{nextLevel.level} 还需 {nextLevel.xp - state.xp} XP
            </div>
          )}
        </div>

        {/* 总览统计 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/20 text-center">
            <div className="text-2xl font-bold text-cyan-400">{completionPct}%</div>
            <div className="text-xs text-slate-500 mt-1">完成率</div>
            <div className="text-xs text-slate-600">{completed}/{totalNodes} 知识点</div>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/20 text-center">
            <div className="text-2xl font-bold text-orange-400">{state.maxStreak}</div>
            <div className="text-xs text-slate-500 mt-1">最长连胜</div>
            <div className="text-xs text-slate-600">当前 {state.streak}</div>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/20 text-center">
            <div className="text-2xl font-bold text-amber-400">{state.wrongList.length}</div>
            <div className="text-xs text-slate-500 mt-1">错题数</div>
            <button onClick={onOpenWrongBook} className="text-xs text-amber-500 hover:text-amber-400 underline mt-0.5">
              去复习 →
            </button>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/20 text-center">
            <div className="text-2xl font-bold text-emerald-400">{currentLevel.icon}</div>
            <div className="text-xs text-slate-500 mt-1">{currentLevel.name}</div>
            <div className="text-xs text-slate-600">{state.xp} XP</div>
          </div>
        </div>

        {diagnosticFocuses.length > 0 && (
          <section className="mb-6 rounded-2xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 to-cyan-500/5 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-lg">🧭</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold text-white">自动学习诊断</h2>
                  <span className="rounded-full border border-violet-400/25 bg-violet-400/10 px-2 py-0.5 text-[10px] font-bold text-violet-200">
                    初步判断
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  根据当前未清错题、知识点最佳得分和尝试次数，先排出最值得补的 3 个位置。
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {diagnosticFocuses.map((focus, index) => (
                <div key={focus.nodeId} className="rounded-xl border border-slate-700/50 bg-slate-900/55 p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-xs font-black text-violet-200">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-bold text-slate-100">{focus.topic}</div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          focus.levelLabel === '优先补缺'
                            ? 'bg-rose-500/15 text-rose-300'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}>
                          {focus.levelLabel}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] font-medium text-slate-400">
                        {focus.wrongCount} 道待清错
                        {focus.bestScore > 0 ? ` · 最佳 ${focus.bestScore} 分` : ''}
                        {focus.attempts > 0 ? ` · 已尝试 ${focus.attempts} 次` : ''}
                      </div>
                      {focus.misconception && (
                        <p className="mt-2 text-xs leading-5 text-slate-300">
                          <span className="font-bold text-violet-200">可能错因：</span>{focus.misconception}
                        </p>
                      )}
                      <p className="mt-1 text-xs leading-5 text-cyan-200">下一步：{focus.nextStep}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onOpenWrongBook}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-3 text-sm font-bold text-white transition hover:from-violet-500 hover:to-cyan-500"
            >
              按诊断顺序开始清错
            </button>
            <p className="mt-2 text-center text-[10px] leading-4 text-slate-500">
              已清除的错题不会计入本次判断；完成清错后还需要用变式或阶段复测确认。
            </p>
          </section>
        )}

        {/* 各章节进度 */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-white mb-3">📚 章节进度</h2>
          <div className="space-y-2">
            {chapterStats.map(ch => (
              <div key={ch.id} className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/20">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{ch.icon}</span>
                    <span className="text-sm text-slate-200">{ch.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {ch.avgScore !== null && (
                      <span className="text-xs text-cyan-400">{ch.avgScore}分</span>
                    )}
                    <span className="text-xs font-bold text-slate-300">{ch.done}/{ch.total}</span>
                  </div>
                </div>
                <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${ch.done === ch.total ? 'bg-emerald-400' : 'bg-cyan-500'}`}
                    style={{ width: `${ch.total > 0 ? (ch.done / ch.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 薄弱知识点 */}
        {weakNodes.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-white mb-3">🎯 需要加强</h2>
            <div className="space-y-2">
              {weakNodes.map(({ node, bestScore }) => (
                <div key={node.id} className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/20 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    bestScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                    bestScore >= 50 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {bestScore}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-200 truncate">{node.topic}</div>
                    <div className="text-xs text-slate-500">
                      {'⭐'.repeat(node.difficulty)} · {node.challenges.length || node.bigQuestion?.subQuestions.length || 0}题
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 错题分布 */}
        {wrongByChapter.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-white mb-3">📝 错题分布</h2>
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/20">
              {wrongByChapter.map(([chId, { name, count }]) => (
                <div key={chId} className="flex items-center justify-between py-2 border-b border-slate-700/20 last:border-0">
                  <span className="text-sm text-slate-300">{name}</span>
                  <span className="text-xs text-amber-400 font-medium">{count} 题</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {completed === 0 && (
          <div className="text-center py-12 text-slate-500">
            <div className="text-5xl mb-4">🌳</div>
            <p className="text-lg font-medium text-white mb-1">还没开始闯关呢！</p>
            <p className="text-sm">完成知识点后这里就会显示你的学习数据</p>
          </div>
        )}
      </div>
    </div>
  );
}
