import { useMemo, useState } from 'react';
import type { Chapter, Challenge } from '../types';

interface JumpChapterModalProps {
  chapter: Chapter;
  onClose: () => void;
  onPass: (nodeIds: string[]) => void;
}

export function JumpChapterModal({ chapter, onClose, onPass }: JumpChapterModalProps) {
  // 从每个知识点随机抽一题（跳过第1题）
  const challenges = useMemo<{ nodeId: string; challenge: Challenge }[]>(() => {
    const result: { nodeId: string; challenge: Challenge }[] = [];
    for (const sec of chapter.sections) {
      for (const node of sec.nodes) {
        const pool = node.challenges.length > 0 ? node.challenges : (node.bigQuestion?.subQuestions ?? []);
        if (pool.length === 0) continue;
        const start = pool.length > 1 ? 1 : 0;
        const idx = start + Math.floor(Math.random() * (pool.length - start));
        result.push({ nodeId: node.id, challenge: pool[idx] });
      }
    }
    return result;
  }, [chapter]);

  const total = challenges.length;
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [isFinished, setIsFinished] = useState(total === 0);

  const challenge = challenges[challengeIdx];
  const requiredCorrect = Math.max(1, Math.ceil(total * 0.7));
  const passed = correct >= requiredCorrect;

  const handleSelect = (idx: number) => {
    if (showResult || !challenge) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === challenge.challenge.answer) setCorrect(c => c + 1);
  };

  const handleNext = () => {
    if (challengeIdx < total - 1) {
      setChallengeIdx(v => v + 1);
      setSelected(null);
      setShowResult(false);
      return;
    }
    setIsFinished(true);
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 border border-slate-700/50">
          <div className="text-5xl">{passed ? '⚡' : '📘'}</div>
          <h3 className="text-xl font-bold text-white">
            {passed ? `跳章成功！「${chapter.name}」已解锁` : '还需要再学一下'}
          </h3>
          <p className="text-sm text-slate-400">
            {passed
              ? `答对 ${correct}/${total} 题，达到 ${requiredCorrect}/${total} 通过线，章节内所有知识点已解锁`
              : `答对 ${correct}/${total} 题，未达到 ${requiredCorrect}/${total} 通过线，建议按顺序学习后再试`}
          </p>
          <button
            onClick={passed ? () => onPass(challenges.map(c => c.nodeId)) : onClose}
            className={`w-full py-3 text-white rounded-xl font-medium transition-colors ${passed ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            {passed ? '开始闯关' : '返回技能树'}
          </button>
        </div>
      </div>
    );
  }

  if (!challenge) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-slate-800 rounded-t-2xl sm:rounded-2xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto relative border border-slate-700/50">
        <button onClick={onClose} className="absolute top-3 left-3 text-slate-500 hover:text-slate-300 text-xl">×</button>

        <div className="text-center mb-4">
          <div className="text-xs text-amber-400 mb-1">⚡ 跳章测试</div>
          <h3 className="text-base font-bold text-white">{chapter.icon} {chapter.name}</h3>
          <p className="text-xs text-slate-500 mt-1">
            共 {total} 题 · 答对 {requiredCorrect} 题即可跳过本章
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          {challenges.map((_, i) => (
            <div key={i} className={`w-6 h-1.5 rounded-full transition-colors ${
              i < challengeIdx ? 'bg-emerald-500' : i === challengeIdx ? 'bg-amber-400' : 'bg-slate-600'
            }`} />
          ))}
        </div>

        <div className="mb-6">
          <div className="text-xs text-slate-500 mb-1">第 {challengeIdx + 1}/{total} 题</div>
          <h3 className="text-base text-white leading-relaxed">{challenge.challenge.stem}</h3>
        </div>

        <div className="space-y-2.5 mb-4">
          {challenge.challenge.options.map((opt, i) => {
            let cls = 'w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ';
            if (showResult) {
              if (i === challenge.challenge.answer) cls += 'bg-emerald-900/40 border-emerald-500 text-emerald-300';
              else if (i === selected) cls += 'bg-red-900/30 border-red-500 text-red-300';
              else cls += 'bg-slate-800/50 border-slate-700 text-slate-500';
            } else {
              cls += 'bg-slate-700/50 border-slate-600 hover:border-amber-400 hover:bg-slate-700 text-slate-200';
            }
            return (
              <button key={i} onClick={() => handleSelect(i)} className={cls} disabled={showResult}>
                <span className="text-slate-500 mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="mb-4 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-xs text-amber-400 mb-1">解析</div>
            <p className="text-sm text-slate-300 leading-relaxed">{challenge.challenge.explanation}</p>
          </div>
        )}

        {showResult && (
          <button onClick={handleNext} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors">
            {challengeIdx < total - 1 ? '下一题' : '查看结果'}
          </button>
        )}
      </div>
    </div>
  );
}
