import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Course, WrongRecord, Chapter } from '../types';
import { useSound } from '../hooks/useSound';
import { Mascot } from './Mascot';

interface ChapterWrongSweeperProps {
  course: Course;
  chapter: Chapter;
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

export function ChapterWrongSweeper({
  course,
  chapter,
  wrongList,
  onClose,
  onRemoveWrong,
}: ChapterWrongSweeperProps) {
  const [redoing, setRedoing] = useState<{ nodeId: string; challengeIdx: number } | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [mascotMood, setMascotMood] = useState<'idle' | 'happy' | 'sad' | 'wow'>('idle');
  const [prevWrongCount, setPrevWrongCount] = useState<number | null>(null);

  const { playCorrect, playWrong, playLevelUp } = useSound();

  // 获取本章的所有节点 ID
  const chapterNodeIds = new Set<string>();
  for (const sec of chapter.sections) {
    for (const node of sec.nodes) {
      chapterNodeIds.add(node.id);
    }
  }

  // 过滤出本章的错题
  const chapterWrongs = wrongList.filter((w) => chapterNodeIds.has(w.nodeId));

  // 监听错题数量变化，触发通关特效
  useEffect(() => {
    if (prevWrongCount === null) {
      setPrevWrongCount(chapterWrongs.length);
      return;
    }

    if (chapterWrongs.length === 0 && prevWrongCount > 0) {
      // 触发本章错题清空的大胜利特效！
      setMascotMood('wow');
      playLevelUp();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#34d399', '#a78bfa', '#fbbf24', '#f472b6'],
      });
      // 循环喷洒一些气泡状彩带
      const end = Date.now() + 1500;
      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.8 },
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.8 },
        });
      }, 300);
      setPrevWrongCount(0);
      return () => clearInterval(interval);
    }

    setPrevWrongCount(chapterWrongs.length);
  }, [chapterWrongs.length, prevWrongCount, playLevelUp]);

  // 从错题记录或题库构建当前正在重做的题目信息
  const redoData = (() => {
    if (!redoing) return null;
    const w = chapterWrongs.find(
      (r) => r.nodeId === redoing.nodeId && r.challengeIdx === redoing.challengeIdx
    );
    if (!w) return null;

    const fromBank = findChallenge(course, w.nodeId, w.challengeIdx);
    if (fromBank && fromBank.options.length > 0) {
      return { ...fromBank, answer: fromBank.answer };
    }

    return {
      stem: w.stem,
      options: [w.correctAnswer, w.userAnswer].filter((v, i, a) => a.indexOf(v) === i),
      answer: 0,
      explanation: w.explanation,
    };
  })();

  const handleRedoOptionClick = (idx: number) => {
    if (showResult || !redoData || !redoing) return;
    setSelectedOption(idx);
    setShowResult(true);

    if (idx === redoData.answer) {
      playCorrect();
      setMascotMood('happy');
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#34d399', '#22d3ee', '#fbbf24', '#a78bfa'],
      });
      setTimeout(() => {
        onRemoveWrong(redoing.nodeId, redoing.challengeIdx);
        setRedoing(null);
        setSelectedOption(null);
        setShowResult(false);
        setMascotMood('idle');
      }, 1800);
    } else {
      playWrong();
      setMascotMood('sad');
      setTimeout(() => {
        setMascotMood('idle');
      }, 1500);
    }
  };

  const startRedo = (nodeId: string, challengeIdx: number) => {
    setRedoing({ nodeId, challengeIdx });
    setSelectedOption(null);
    setShowResult(false);
    setMascotMood('idle');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-6 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-white/10 rounded-[2rem] p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col space-y-6">
        
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xl transition-all"
        >
          ×
        </button>

        {/* 头部标题与 Mascot */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <Mascot mood={mascotMood} size="md" />
          <div className="space-y-1">
            <span className="text-[0.65rem] tracking-[0.2em] font-black text-cyan-400 uppercase">
              🎯 章节精准靶向清错 🎯
            </span>
            <h2 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              {chapter.name} · 清错仓
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {chapterWrongs.length === 0
                ? '太稳了！本章盲区已全部扫除！'
                : `当前本章待清扫错题: ${chapterWrongs.length} 道`}
            </p>
          </div>
        </div>

        {/* 错题全部清空 */}
        {chapterWrongs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-4">
            <div className="text-5xl animate-bounce">🏆</div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">本章无遗留错题！</h3>
              <p className="text-xs text-slate-500 max-w-[280px]">
                你已经彻底扫清了本章所有的知识盲区，完美的炼金术士！去征服下一章吧！
              </p>
            </div>
            <button
              onClick={onClose}
              className="py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-black text-xs tracking-wider transition-all shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              继续探索新章节 →
            </button>
          </div>
        ) : (
          <div className="flex-1 space-y-4">
            {/* 重做模式面板 */}
            {redoing && redoData ? (
              <div className="bg-slate-900/80 rounded-2xl p-5 border border-cyan-500/30 space-y-4 animate-bounce-in">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-cyan-400 tracking-wider flex items-center gap-1.5 animate-pulse">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
                    🔄 原位精准重做中
                  </span>
                  <button
                    onClick={() => {
                      setRedoing(null);
                      setSelectedOption(null);
                      setShowResult(false);
                      setMascotMood('idle');
                    }}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    取消重做
                  </button>
                </div>

                <div className="text-sm font-bold text-slate-100 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-white/5 shadow-inner">
                  {redoData.stem}
                </div>

                <div className="space-y-2.5">
                  {redoData.options.map((opt, i) => {
                    let btnStyle =
                      'w-full text-left px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-start gap-2 ';
                    if (showResult) {
                      if (i === redoData.answer) {
                        btnStyle += 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]';
                      } else if (i === selectedOption) {
                        btnStyle += 'bg-rose-950/30 border-rose-500 text-rose-300';
                      } else {
                        btnStyle += 'bg-slate-950/50 border-slate-800 text-slate-500';
                      }
                    } else {
                      btnStyle +=
                        'bg-slate-950/70 border-slate-700/60 text-slate-200 hover:border-cyan-500 hover:bg-slate-900 hover:shadow-lg hover:shadow-cyan-500/5';
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleRedoOptionClick(i)}
                        disabled={showResult}
                        className={btnStyle}
                      >
                        <span className="text-slate-500 font-black shrink-0">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {showResult && (
                  <div
                    className={`rounded-xl p-4 border text-[11px] leading-relaxed font-bold animate-bounce-in ${
                      selectedOption === redoData.answer
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-500/20 text-rose-300'
                    }`}
                  >
                    {selectedOption === redoData.answer ? (
                      <div className="space-y-1">
                        <div className="text-emerald-400 font-extrabold flex items-center gap-1">
                          🎉 答对啦！名师解析：
                        </div>
                        <div className="text-slate-300">{redoData.explanation}</div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-rose-400 font-extrabold flex items-center gap-1">
                          ⚠️ 别灰心，再看一眼考点点拨：
                        </div>
                        <div className="bg-slate-950/50 p-2.5 rounded-lg text-slate-300 font-medium">
                          <span className="text-emerald-400 font-black">正确答案：</span>
                          {redoData.options[redoData.answer]}
                        </div>
                        <div className="text-slate-400 font-medium">{redoData.explanation}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* 平铺的错题微型卡片列表 */
              <div className="grid grid-cols-1 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {chapterWrongs.map((w) => {
                  return (
                    <div
                      key={`${w.nodeId}-${w.challengeIdx}`}
                      className="bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/20 rounded-2xl p-4 transition-all duration-300 group flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-slate-800 text-cyan-400 px-2 py-0.5 rounded-full font-black">
                            {w.nodeTopic}
                          </span>
                          <span className="text-[9px] text-slate-500 font-bold">
                            第 {w.challengeIdx + 1} 题
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                          {w.stem}
                        </h4>
                        <div className="text-[10px] text-rose-400 font-medium bg-rose-950/15 py-1 px-2.5 rounded-lg border border-rose-900/20 inline-block">
                          ✗ 上次选了: {w.userAnswer}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1 border-t border-slate-800/40">
                        <button
                          onClick={() => startRedo(w.nodeId, w.challengeIdx)}
                          className="flex-1 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black text-xs tracking-wider rounded-xl transition-all shadow-md shadow-cyan-950/20 hover:-translate-y-0.5"
                        >
                          🔄 原地重做
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
