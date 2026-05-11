import { useMemo, useState } from 'react';
import type { Challenge, KnowledgePoint } from '../types';

interface UnlockChallengeModalProps {
  targetNode: KnowledgePoint;
  prerequisiteNodes: KnowledgePoint[];
  onClose: () => void;
  onPass: () => void;
}

export function UnlockChallengeModal({
  targetNode,
  prerequisiteNodes,
  onClose,
  onPass,
}: UnlockChallengeModalProps) {
  const challengeSet = useMemo<Challenge[]>(() => {
    const pool = prerequisiteNodes.flatMap((node) => node.challenges);
    return pool.slice(0, Math.min(3, pool.length));
  }, [prerequisiteNodes]);

  const [challengeIdx, setChallengeIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [isFinished, setIsFinished] = useState(challengeSet.length === 0);

  const challenge = challengeSet[challengeIdx];
  const requiredCorrect = Math.max(1, Math.ceil(challengeSet.length * 0.7));
  const passed = correct >= requiredCorrect;

  const handleSelect = (idx: number) => {
    if (showResult || !challenge) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === challenge.answer) setCorrect((value) => value + 1);
  };

  const handleNext = () => {
    if (challengeIdx < challengeSet.length - 1) {
      setChallengeIdx((value) => value + 1);
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
            {passed ? '跳关挑战通过' : '先补一下基础'}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {passed
              ? `你已经具备进入「${targetNode.topic}」的前置基础。`
              : `本次答对 ${correct}/${challengeSet.length}，建议先完成前置知识点再回来挑战。`}
          </p>
          {!passed && (
            <div className="text-left bg-slate-900/60 rounded-xl p-3 space-y-1">
              {prerequisiteNodes.map((node) => (
                <div key={node.id} className="text-xs text-slate-300">
                  · {node.topic}
                </div>
              ))}
            </div>
          )}
          <button
            onClick={passed ? onPass : onClose}
            className={`w-full py-3 text-white rounded-xl font-medium transition-colors ${
              passed ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            {passed ? '进入本节' : '返回技能树'}
          </button>
        </div>
      </div>
    );
  }

  if (!challenge) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-slate-800 rounded-t-2xl sm:rounded-2xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto relative border border-slate-700/50">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 text-slate-500 hover:text-slate-300 text-xl"
        >
          ×
        </button>

        <div className="text-center mb-4">
          <div className="text-xs text-amber-400 mb-1">跳关前置挑战</div>
          <h3 className="text-base font-bold text-white">{targetNode.topic}</h3>
          <p className="text-xs text-slate-500 mt-1">
            答对 {requiredCorrect}/{challengeSet.length} 题即可直接解锁
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          {challengeSet.map((_, i) => (
            <div
              key={i}
              className={`w-8 h-1.5 rounded-full transition-colors ${
                i < challengeIdx ? 'bg-emerald-500' : i === challengeIdx ? 'bg-amber-400' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        <div className="mb-6">
          <div className="text-xs text-slate-500 mb-1">前置知识</div>
          <h3 className="text-base text-white leading-relaxed">{challenge.stem}</h3>
        </div>

        <div className="space-y-2.5 mb-4">
          {challenge.options.map((opt, i) => {
            let btnClass = 'w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ';
            if (showResult) {
              if (i === challenge.answer) {
                btnClass += 'bg-emerald-900/40 border-emerald-500 text-emerald-300';
              } else if (i === selected) {
                btnClass += 'bg-red-900/30 border-red-500 text-red-300';
              } else {
                btnClass += 'bg-slate-800/50 border-slate-700 text-slate-500';
              }
            } else {
              btnClass += 'bg-slate-700/50 border-slate-600 hover:border-amber-400 hover:bg-slate-700 text-slate-200';
            }

            return (
              <button key={i} onClick={() => handleSelect(i)} className={btnClass} disabled={showResult}>
                <span className="text-slate-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="mb-4 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-xs text-amber-400 mb-1">解析</div>
            <p className="text-sm text-slate-300 leading-relaxed">{challenge.explanation}</p>
          </div>
        )}

        {showResult && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors"
          >
            {challengeIdx < challengeSet.length - 1 ? '下一题' : '查看结果'}
          </button>
        )}
      </div>
    </div>
  );
}
