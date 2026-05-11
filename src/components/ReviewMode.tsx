import { useState, useMemo } from 'react';
import type { KnowledgePoint, StudentProfile, WrongRecord } from '../types';
import { reviewChapters } from '../data/quizData';
import { QuizModal } from './QuizModal';

interface ReviewModeProps {
  profile: StudentProfile | null;
  currentStreak: number;
  onComplete: (nodeId: string, score: number) => void;
  onRecordWrong: (record: WrongRecord) => void;
  onBack: () => void;
}

export function ReviewMode({ profile, currentStreak, onComplete, onRecordWrong, onBack }: ReviewModeProps) {
  const [activeNode, setActiveNode] = useState<KnowledgePoint | null>(null);

  const allSections = useMemo(
    () => reviewChapters.flatMap(ch => ch.sections),
    [],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="px-4 pt-4 pb-2 max-w-lg mx-auto">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-300 mb-2">← 返回模式选择</button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
          🎯 期末复习
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">点击任意知识点直接刷题，无需解锁</p>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-8">
        {allSections.map(section => (
          <div key={section.id} className="mb-6">
            <h3 className="text-sm font-medium text-slate-300 mb-3 px-1">{section.title}</h3>
            <div className="grid grid-cols-2 gap-2">
              {section.nodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => setActiveNode(node)}
                  className="bg-slate-800/70 border border-slate-700/50 hover:border-amber-500/50 rounded-xl p-3 text-left transition-all"
                >
                  <div className="text-xs text-amber-400 mb-1">
                    {'⭐'.repeat(node.difficulty)}
                  </div>
                  <div className="text-sm text-slate-200 leading-snug">{node.topic}</div>
                  <div className="text-xs text-slate-500 mt-1">{node.challenges.length} 题</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeNode && (
        <QuizModal
          node={activeNode}
          onClose={() => setActiveNode(null)}
          onComplete={(id, score) => { onComplete(id, score); setActiveNode(null); }}
          onRecordWrong={onRecordWrong}
          currentStreak={currentStreak}
          profile={profile ?? { profileId: 'guest', classCode: '', className: '复习模式', studentName: '学生', pin: '', createdAt: '' }}
        />
      )}
    </div>
  );
}
