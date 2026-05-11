import { useState } from 'react';
import type { KnowledgePoint, StudentProfile } from '../types';
import { XP_PER_NODE, XP_BONUS_STREAK } from '../types';
import { saveQuestionFeedback } from '../services/questionFeedback';
/** 将 [条件]= 渲染为条件在等号上方的 React 元素 */
function renderEq(text: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\](?:=|→))/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    const m = part.match(/^\[([^\]]+)\](=|→)$/);
    if (m) {
      return (
        <span key={i} style={{ display: 'inline-grid', gridTemplateRows: 'auto auto', justifyItems: 'center', verticalAlign: 'middle', lineHeight: 1, margin: '0 0.125em' }}>
          <span style={{ fontSize: '0.55em', color: '#fbbf24', fontWeight: 600, lineHeight: 1 }}>
            {m[1]}
          </span>
          <span style={{ fontFamily: 'monospace', color: '#67e8f9', fontSize: '1.3em', fontWeight: 900, letterSpacing: '0.08em', lineHeight: 1 }}>
            {m[2]}
          </span>
        </span>
      );
    }
    // 普通化学式等宽
    return part.split(/([A-Z][a-z]?[₀₁₂₃₄₅₆₇₈₉⁺²⁻³↑↓]+)/g).map((sp, j) =>
      /[A-Z]/.test(sp) ? <code key={j} className="font-mono text-[0.9em] not-italic text-slate-200">{sp}</code> : sp
    );
  });
}

interface QuizModalProps {
  node: KnowledgePoint;
  onClose: () => void;
  onComplete: (nodeId: string, score: number) => void;
  currentStreak: number;
  profile: StudentProfile;
}

export function QuizModal({ node, onClose, onComplete, currentStreak, profile }: QuizModalProps) {
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(0);
  const total = node.challenges.length;
  const [xpGained, setXpGained] = useState(0);
  const [showXpFloat, setShowXpFloat] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  const challenge = node.challenges[challengeIdx];

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    const isCorrect = idx === challenge.answer;
    if (isCorrect) {
      setCorrect(c => c + 1);
      const xp = XP_PER_NODE + (currentStreak >= 3 ? XP_BONUS_STREAK : 0);
      setXpGained(prev => prev + xp);
      setShowXpFloat(true);
      setTimeout(() => setShowXpFloat(false), 1200);
    }
  };

  const handleNext = () => {
    if (challengeIdx < node.challenges.length - 1) {
      setChallengeIdx(i => i + 1);
      setSelected(null);
      setShowResult(false);
      setShowFeedback(false);
      setFeedbackText('');
      setFeedbackSaved(false);
    } else {
      // 全部答完
      const score = Math.round((correct + (selected === challenge.answer ? 1 : 0)) / total * 100);
      onComplete(node.id, score);
      setIsComplete(true);
    }
  };

  const finalScore = isComplete ? Math.round(((correct) / total) * 100) : 0;

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) return;

    saveQuestionFeedback({
      profile,
      nodeId: node.id,
      nodeTopic: node.topic,
      challenge,
      challengeIndex: challengeIdx,
      selectedAnswer: selected,
      comment: feedbackText,
    });
    setFeedbackSaved(true);
    setShowFeedback(false);
    setFeedbackText('');
  };

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
          <div className="text-5xl">{finalScore >= 80 ? '🎉' : finalScore >= 50 ? '👍' : '💪'}</div>
          <h3 className="text-xl font-bold text-white">
            {finalScore >= 80 ? '太棒了！' : finalScore >= 50 ? '不错哦！' : '继续加油！'}
          </h3>
          <div className="text-3xl font-bold text-emerald-400">+{xpGained} XP</div>
          <p className="text-slate-400">
            正确 {correct}/{total} · 正确率 {finalScore}%
          </p>
          {currentStreak >= 3 && (
            <p className="text-amber-400 text-sm">🔥 连胜奖励 +{XP_BONUS_STREAK} XP</p>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors"
          >
            继续挑战 →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-slate-800 rounded-t-2xl sm:rounded-2xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto relative">
        {showXpFloat && (
          <div className="absolute top-4 right-4 text-emerald-400 font-bold text-xl xp-float">
            +{XP_PER_NODE + (currentStreak >= 3 ? XP_BONUS_STREAK : 0)} XP
          </div>
        )}

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 text-slate-500 hover:text-slate-300 text-xl"
        >
          ×
        </button>

        {/* 进度 */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {node.challenges.map((_, i) => (
            <div
              key={i}
              className={`w-8 h-1.5 rounded-full transition-colors ${
                i < challengeIdx ? 'bg-emerald-500' : i === challengeIdx ? 'bg-cyan-400' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* 题目 */}
        <div className="mb-6">
          <div className="text-xs text-cyan-400 mb-1">💡 {node.topic}</div>
          <h3 className="text-base text-white leading-relaxed">{renderEq(challenge.stem)}</h3>
        </div>

        {/* 选项 */}
        <div className="space-y-2.5 mb-4">
          {challenge.options.map((opt, i) => {
            let btnClass = "w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ";
            if (showResult) {
              if (i === challenge.answer) {
                btnClass += "bg-emerald-900/40 border-emerald-500 text-emerald-300";
              } else if (i === selected) {
                btnClass += "bg-red-900/30 border-red-500 text-red-300";
              } else {
                btnClass += "bg-slate-800/50 border-slate-700 text-slate-500";
              }
            } else {
              btnClass += "bg-slate-700/50 border-slate-600 hover:border-cyan-400 hover:bg-slate-700 text-slate-200";
            }

            return (
              <button key={i} onClick={() => handleSelect(i)} className={btnClass} disabled={showResult}>
                <span className="text-slate-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                {renderEq(opt)}
              </button>
            );
          })}
        </div>

        {/* 解析 */}
        {showResult && (
          <div className="mb-4 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-xs text-amber-400 mb-1">📖 解析</div>
            <div className="text-sm text-slate-300 leading-relaxed">{renderEq(challenge.explanation)}</div>
          </div>
        )}

        <div className="mb-4">
          {!showFeedback ? (
            <button
              onClick={() => setShowFeedback(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-400/60 text-amber-300/80 hover:text-amber-200 text-sm font-medium transition-all"
            >
              <span className="text-base">💬</span> 这题有问题？点此反馈
            </button>
          ) : (
            <div className="bg-slate-900/50 rounded-xl p-3 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-amber-400/80 mb-1">
                <span>💬</span> 反馈错题
              </div>
              <textarea
                value={feedbackText}
                onChange={(event) => setFeedbackText(event.target.value)}
                className="w-full min-h-20 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber-400"
                placeholder="例如：题干不清楚、答案可能有误、解析看不懂..."
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowFeedback(false);
                    setFeedbackText('');
                  }}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedbackText.trim()}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  提交反馈
                </button>
              </div>
            </div>
          )}
          {feedbackSaved && (
            <div className="mt-2 flex items-center gap-1 text-sm text-emerald-400">
              <span>✅</span> 反馈已提交，老师会统一查看
            </div>
          )}
        </div>

        {/* 下一题按钮 */}
        {showResult && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors"
          >
            {challengeIdx < node.challenges.length - 1 ? '下一题 →' : '查看结果 →'}
          </button>
        )}

        {/* 状态栏 */}
        <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
          <span>✅ {correct} 正确</span>
          <span>🔥 连胜 {currentStreak}</span>
        </div>
      </div>
    </div>
  );
}
