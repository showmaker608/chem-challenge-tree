import { useCallback, useEffect, useState } from 'react';
import type { ClassProgressResult, RankEntry } from '../services/leaderboard';
import { getClassProgress, getLeaderboard, sendCheer } from '../services/leaderboard';
import { getLevel } from '../types';

interface LeaderboardProps {
  currentStudentId: string;
  classCode: string;
  className: string;
  socialToken: string;
  totalNodes: number;
  onClose: () => void;
  onRelogin: () => void;
}

const EMPTY_CLASS: ClassProgressResult = {
  ok: true,
  rankings: [],
  goal: { current: 0, target: 40, realStudents: 0 },
};

function Avatar({ entry, size = 'md' }: { entry: RankEntry; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-12 h-12 text-2xl' : size === 'sm' ? 'w-8 h-8 text-lg' : 'w-10 h-10 text-xl';
  return (
    <div className={`${sizeClass} rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0`}>
      {entry.avatar?.startsWith('/') ? (
        <img src={entry.avatar} alt="" className="w-full h-full object-cover" />
      ) : (
        <span>{entry.avatar || '🔬'}</span>
      )}
    </div>
  );
}

export function Leaderboard({ currentStudentId, classCode, className, socialToken, totalNodes, onClose, onRelogin }: LeaderboardProps) {
  const [tab, setTab] = useState<'class' | 'global'>('class');
  const [classData, setClassData] = useState<ClassProgressResult>(EMPTY_CLASS);
  const [globalRankings, setGlobalRankings] = useState<RankEntry[]>([]);
  const [loadingClass, setLoadingClass] = useState(true);
  const [loadingGlobal, setLoadingGlobal] = useState(false);
  const [globalLoaded, setGlobalLoaded] = useState(false);
  const [cheeringId, setCheeringId] = useState('');
  const [cheeredIds, setCheeredIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');

  const loadClass = useCallback(async () => {
    setLoadingClass(true);
    const data = await getClassProgress({ classCode, studentId: currentStudentId, socialToken });
    setClassData(data);
    setLoadingClass(false);
  }, [classCode, currentStudentId, socialToken]);

  useEffect(() => { void loadClass(); }, [loadClass]);

  const openGlobal = async () => {
    setTab('global');
    if (globalLoaded) return;
    setLoadingGlobal(true);
    const data = await getLeaderboard();
    setGlobalRankings(data.slice(0, 10));
    setGlobalLoaded(true);
    setLoadingGlobal(false);
  };

  const handleCheer = async (entry: RankEntry) => {
    if (entry.trainer || entry.isMe || cheeringId) return;
    setCheeringId(entry.studentId);
    const result = await sendCheer({
      classCode,
      studentId: currentStudentId,
      socialToken,
      targetStudentId: entry.studentId,
    });
    setCheeringId('');
    setToast(result.message || (result.ok ? '加油送达！' : '加油失败，请稍后再试'));
    window.setTimeout(() => setToast(''), 2200);
    if (result.ok) {
      setCheeredIds(previous => new Set(previous).add(entry.studentId));
      if (!result.already) {
        setClassData(previous => ({
          ...previous,
          rankings: previous.rankings.map(item => item.studentId === entry.studentId
            ? { ...item, cheersReceived: (item.cheersReceived || 0) + 1 }
            : item),
        }));
      }
    }
  };

  const goalPercent = Math.min(100, Math.round((classData.goal.current / Math.max(1, classData.goal.target)) * 100));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full h-[88vh] max-h-[760px] flex flex-col overflow-hidden relative shadow-2xl">
        <header className="px-5 pt-5 pb-3 shrink-0 bg-slate-950/95">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold tracking-[0.18em] text-cyan-400 mb-1">CHEM SQUAD</div>
              <h2 className="text-xl font-black text-white">同学一起闯关</h2>
              <p className="text-xs text-slate-500 mt-1">看见彼此的进步，不公开错题和成绩</p>
            </div>
            <button onClick={onClose} aria-label="关闭" className="w-9 h-9 rounded-full bg-slate-900 text-slate-400 hover:text-white text-xl">×</button>
          </div>

          <div className="grid grid-cols-2 gap-1 bg-slate-900 rounded-xl p-1 mt-4">
            <button
              onClick={() => setTab('class')}
              className={`py-2 rounded-lg text-sm font-bold transition-colors ${tab === 'class' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              同班进度
            </button>
            <button
              onClick={() => void openGlobal()}
              className={`py-2 rounded-lg text-sm font-bold transition-colors ${tab === 'global' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}`}
            >
              全服排行
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-5">
          {tab === 'class' ? (
            loadingClass ? (
              <div className="py-20 text-center text-sm text-slate-500">正在集合班级成员...</div>
            ) : !classData.ok ? (
              <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 text-center">
                <div className="text-3xl mb-3">🔐</div>
                <div className="font-bold text-amber-200">{classData.message || '同班进度暂时不可用'}</div>
                {classData.needsRelogin && (
                  <>
                    <p className="text-xs text-slate-400 mt-2">这是旧登录状态或登录凭证已过期。重新验证一次即可，已有学习进度不会丢失。</p>
                    <button
                      type="button"
                      onClick={onRelogin}
                      className="mt-4 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-amber-300"
                    >
                      现在重新登录
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                <section className="rounded-2xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-emerald-500/10 border border-cyan-400/20 p-4 mt-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-cyan-300 font-bold">{className || '我的班级'} · 共同探索</div>
                      <div className="text-lg font-black text-white mt-1">全班一起点亮知识树</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-black text-white">{classData.goal.current}<span className="text-sm text-slate-500">/{classData.goal.target}</span></div>
                      <div className="text-[0.65rem] text-slate-500">真实完成节点</div>
                    </div>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800 overflow-hidden mt-4">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all" style={{ width: `${goalPercent}%` }} />
                  </div>
                  <div className="flex justify-between text-[0.65rem] text-slate-500 mt-2">
                    <span>{classData.goal.realStudents} 位真实同学正在闯关</span>
                    <span>{goalPercent}%</span>
                  </div>
                </section>

                <div className="flex items-end justify-between mt-5 mb-2 px-1">
                  <div>
                    <h3 className="text-sm font-black text-white">班级探险队</h3>
                    <p className="text-[0.68rem] text-slate-500 mt-0.5">按进度展示，不设置倒数排名</p>
                  </div>
                  <span className="text-[0.65rem] text-slate-600">训练员不计入共同进度</span>
                </div>

                <div className="space-y-2">
                  {classData.rankings.map(entry => {
                    const progress = Math.min(100, Math.round((entry.completed / Math.max(1, totalNodes)) * 100));
                    const cheered = cheeredIds.has(entry.studentId);
                    return (
                      <article key={entry.studentId} className={`rounded-2xl border p-3 ${entry.isMe ? 'border-cyan-400/35 bg-cyan-400/10' : entry.trainer ? 'border-violet-400/15 bg-violet-400/5' : 'border-slate-800 bg-slate-900/70'}`}>
                        <div className="flex items-center gap-3">
                          <Avatar entry={entry} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold truncate ${entry.isMe ? 'text-cyan-300' : 'text-white'}`}>{entry.name}</span>
                              {entry.isMe && <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300">这是我</span>}
                              {entry.trainer && <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-violet-400/15 text-violet-300">挑战树训练员</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden flex-1">
                                <div className={`h-full rounded-full ${entry.trainer ? 'bg-violet-400' : 'bg-cyan-400'}`} style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-[0.65rem] text-slate-500 shrink-0">{entry.completed} 个节点</span>
                            </div>
                          </div>
                          {!entry.isMe && !entry.trainer ? (
                            <button
                              onClick={() => void handleCheer(entry)}
                              disabled={Boolean(cheeringId) || cheered}
                              className={`shrink-0 rounded-xl px-2.5 py-2 text-xs font-bold transition-colors ${cheered ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 disabled:opacity-50'}`}
                            >
                              {cheeringId === entry.studentId ? '发送中' : cheered ? '已加油' : '加油'}
                            </button>
                          ) : (
                            <div className="shrink-0 text-[0.65rem] text-slate-600 text-right">
                              {entry.trainer ? '带队中' : `${entry.cheersReceived || 0} 次加油`}
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )
          ) : (
            loadingGlobal ? (
              <div className="py-20 text-center text-sm text-slate-500">正在读取全服排行...</div>
            ) : globalRankings.length === 0 ? (
              <div className="py-20 text-center text-slate-500">暂无排行数据</div>
            ) : (
              <>
                <div className="text-center py-4">
                  <div className="text-3xl">🏆</div>
                  <div className="text-sm font-black text-white mt-1">全服 XP 前 10 名</div>
                  <div className="text-[0.68rem] text-slate-500 mt-1">训练员会明确标注，不冒充真实同学</div>
                </div>
                <div className="space-y-2">
                  {globalRankings.map((entry, index) => {
                    const level = getLevel(entry.xp);
                    return (
                      <div key={entry.studentId} className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${entry.trainer ? 'border-violet-400/15 bg-violet-400/5' : 'border-slate-800 bg-slate-900/70'}`}>
                        <div className={`w-7 text-center font-black ${index < 3 ? 'text-amber-300' : 'text-slate-600'}`}>#{index + 1}</div>
                        <Avatar entry={entry} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white truncate">{entry.name}</span>
                            {entry.trainer && <span className="text-[0.58rem] px-1.5 py-0.5 rounded-full bg-violet-400/15 text-violet-300">训练员</span>}
                          </div>
                          <div className="text-[0.65rem] text-slate-500 mt-0.5">{level.icon} {level.name} · {entry.completed} 节点</div>
                        </div>
                        <div className="text-sm font-black text-emerald-400">{entry.xp}<span className="text-[0.6rem] text-slate-600 ml-1">XP</span></div>
                      </div>
                    );
                  })}
                </div>
              </>
            )
          )}
        </main>

        {toast && <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white text-slate-900 px-4 py-2 text-xs font-bold shadow-xl">{toast}</div>}
      </div>
    </div>
  );
}
