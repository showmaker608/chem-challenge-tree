import { useState } from 'react';
import confetti from 'canvas-confetti';
import type { Course, WrongRecord } from '../types';
import { useSound } from '../hooks/useSound';

interface WrongBookProps {
  course: Course;
  wrongList: WrongRecord[];
  onClose: () => void;
  onRemoveWrong: (nodeId: string, challengeIdx: number) => void;
}

function findChallenge(course: Course, nodeId: string, challengeIdx: number) {
  const allChapters = [...course.chapters, ...(course.reviewChapters ?? [])];
  for (const ch of allChapters) {
    for (const sec of ch.sections) {
      for (const node of sec.nodes) {
        if (node.id === nodeId) return node.challenges[challengeIdx] ?? null;
      }
    }
  }
  return null;
}

export function WrongBook({ course, wrongList, onClose, onRemoveWrong }: WrongBookProps) {
  const [redoing, setRedoing] = useState<{ nodeId: string; challengeIdx: number } | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [collapsedTopics, setCollapsedTopics] = useState<Set<string>>(new Set());
  const { playCorrect, playWrong } = useSound();

  const byTopic = new Map<string, WrongRecord[]>();
  for (const w of wrongList) {
    const list = byTopic.get(w.nodeTopic) ?? [];
    list.push(w);
    byTopic.set(w.nodeTopic, list);
  }

  // 从错题记录或题库构建重做题目
  const redoData = (() => {
    if (!redoing) return null;
    const w = wrongList.find(r => r.nodeId === redoing.nodeId && r.challengeIdx === redoing.challengeIdx);
    if (!w) return null;
    // 尝试从题库获取完整选项
    const fromBank = findChallenge(course, w.nodeId, w.challengeIdx);
    if (fromBank && fromBank.options.length > 0) {
      return { ...fromBank, answer: fromBank.answer };
    }
    // 题库找不到，用错题记录构造（正确选项为第0个，错误选项为第1个备用）
    return {
      stem: w.stem,
      options: [w.correctAnswer, w.userAnswer].filter((v, i, a) => a.indexOf(v) === i),
      answer: 0,
      explanation: w.explanation,
    };
  })();

  const handleRedoSelect = (idx: number) => {
    if (showResult || !redoData || !redoing) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === redoData.answer) {
      playCorrect();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 }, colors: ['#4ade80','#67e8f9','#fbbf24','#a78bfa'] });
      setTimeout(() => confetti({ particleCount: 30, spread: 80, origin: { y: 0.4, x: 0.3 }, colors: ['#f472b6','#fbbf24'] }), 200);
      setTimeout(() => {
        onRemoveWrong(redoing.nodeId, redoing.challengeIdx);
        setRedoing(null);
        setSelected(null);
        setShowResult(false);
      }, 2000);
    } else {
      playWrong();
    }
  };

  const toggleTopic = (topic: string) => {
    setCollapsedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic); else next.add(topic);
      return next;
    });
  };

  const startRedo = (nodeId: string, challengeIdx: number) => {
    setRedoing({ nodeId, challengeIdx });
    setSelected(null);
    setShowResult(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-slate-900 rounded-t-2xl sm:rounded-2xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 left-4 text-slate-400 hover:text-white text-2xl leading-none z-10">×</button>

        {/* 头部 */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">📝</div>
          <h2 className="text-xl font-bold text-white mb-1">错题本</h2>
          <p className="text-sm text-slate-500">
            {wrongList.length === 0 ? '还没有错题，继续保持！' : `${wrongList.length} 道错题 · ${byTopic.size} 个知识点`}
          </p>
        </div>

        {wrongList.length === 0 && !redoing ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-lg font-medium text-white mb-1">全部消灭！</p>
            <p className="text-sm text-slate-500">没有错题了，继续保持</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...byTopic.entries()].map(([topic, records]) => {
              const isCollapsed = collapsedTopics.has(topic);
              return (
                <div key={topic}>
                  <button
                    onClick={() => toggleTopic(topic)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/40 hover:border-cyan-500/30 transition-all"
                  >
                    <span className="text-base font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                      {topic}
                    </span>
                    <span className="ml-auto text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-400 font-medium">
                      {records.length} 题
                    </span>
                    <span className="text-slate-500 text-sm">{isCollapsed ? '▶' : '▼'}</span>
                  </button>

                  {!isCollapsed && (
                    <div className="mt-3 ml-2 space-y-3 border-l-2 border-slate-700/50 pl-4">
                      {records.map((w, j) => {
                        const key = `${w.nodeId}-${w.challengeIdx}`;
                        const showDetail = expanded.has(key);
                        const isRedoingThis = redoing?.nodeId === w.nodeId && redoing?.challengeIdx === w.challengeIdx;
                        const redoCorrect = isRedoingThis && showResult && selected === redoData?.answer;

                        return (
                          <div key={j} className={`bg-slate-800/40 rounded-2xl p-4 border transition-colors ${
                            isRedoingThis && redoCorrect ? 'border-emerald-500/40' :
                            isRedoingThis ? 'border-cyan-500/40' :
                            'border-slate-700/20'
                          }`}>
                            {/* 原地重做模式 */}
                            {isRedoingThis && redoData ? (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-bold">
                                  {redoCorrect ? (
                                    <span className="text-emerald-400">✅ 答对了！太棒了</span>
                                  ) : (
                                    <span className="text-cyan-400">🔄 重做中</span>
                                  )}
                                  <button
                                    onClick={() => { setRedoing(null); setSelected(null); setShowResult(false); }}
                                    className="ml-auto text-xs text-slate-400 hover:text-slate-200"
                                  >
                                    取消
                                  </button>
                                </div>
                                <div className="text-sm text-white leading-relaxed font-medium">{redoData.stem}</div>
                                <div className="space-y-2">
                                  {redoData.options.map((opt, i) => {
                                    let cls = 'w-full text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ';
                                    if (showResult) {
                                      cls += i === redoData.answer ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300'
                                        : i === selected ? 'bg-red-900/30 border-red-500 text-red-300'
                                        : 'bg-slate-900/50 border-slate-700 text-slate-500';
                                    } else cls += 'bg-slate-900/70 border-slate-600 hover:border-cyan-400 hover:bg-slate-800 text-slate-200';
                                    return (
                                      <button key={i} onClick={() => handleRedoSelect(i)} className={cls} disabled={showResult}>
                                        <span className="text-slate-500 mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                                      </button>
                                    );
                                  })}
                                </div>
                                {showResult && (
                                  <div className={`rounded-lg p-3 text-xs ${redoCorrect ? 'bg-emerald-900/20 border border-emerald-500/30' : 'bg-slate-900/50'}`}>
                                    {redoCorrect ? (
                                      <div className="space-y-1.5">
                                        <div className="text-emerald-400 font-medium">✓ 回答正确！</div>
                                        <div className="text-slate-300 leading-relaxed">{redoData.explanation}</div>
                                      </div>
                                    ) : (
                                      <div className="space-y-1.5">
                                        <div>
                                          <span className="text-emerald-400">✓ 正确答案：</span>
                                          <span className="text-slate-400">{redoData.options[redoData.answer]}</span>
                                        </div>
                                        <div className="text-amber-400/80 text-[0.7rem]">💡 {redoData.explanation}</div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <>
                                {/* 正常错题展示 */}
                                <div className="flex items-start gap-2 mb-3">
                                  <span className="text-xs font-bold text-slate-600 bg-slate-700/50 px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                                    Q{j + 1}
                                  </span>
                                  <div className="text-sm text-slate-100 leading-relaxed font-medium">{w.stem}</div>
                                </div>

                                <div className="text-xs text-red-400/80 mb-3 flex items-center gap-1">
                                  <span>✗</span> 你选了「{w.userAnswer}」
                                </div>

                                {w.misconceptionTag && (
                                  <div className="mb-3 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300">
                                    错因：{w.misconceptionTag}
                                  </div>
                                )}

                                {showDetail && (
                                  <div className="space-y-3 mb-4 bg-slate-900/50 rounded-xl p-4">
                                    <div className="flex items-start gap-2">
                                      <span className="text-emerald-400 font-bold text-sm shrink-0">✓</span>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-0.5">正确答案</div>
                                        <div className="text-sm text-emerald-300 font-medium">{w.correctAnswer}</div>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-amber-400 font-medium mb-1.5">💡 解析</div>
                                      <div className="text-sm text-slate-300 leading-relaxed">{w.explanation}</div>
                                    </div>
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => startRedo(w.nodeId, w.challengeIdx)}
                                    className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white rounded-xl text-sm font-bold transition-all"
                                  >
                                    🔄 重做
                                  </button>
                                  <button
                                    onClick={() => {
                                      setExpanded(prev => {
                                        const next = new Set(prev);
                                        if (next.has(key)) next.delete(key); else next.add(key);
                                        return next;
                                      });
                                    }}
                                    className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                                      showDetail
                                        ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                    }`}
                                  >
                                    {showDetail ? '✕ 收起' : '💡 解析'}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
