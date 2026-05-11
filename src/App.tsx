import { useState, useMemo, useCallback } from 'react';
import type { KnowledgePoint } from './types';
import { chapters } from './data/quizData';
import { useGameState } from './hooks/useGameState';
import { SkillTree } from './components/SkillTree';
import { QuizModal } from './components/QuizModal';
import { StatusBar } from './components/StatusBar';
import { StudentGate } from './components/StudentGate';
import { UnlockChallengeModal } from './components/UnlockChallengeModal';

function App() {
  const {
    profile,
    state,
    isNodeAvailable,
    completeNode,
    unlockNode,
    recordAttempt,
    resetProgress,
    signInProfile,
    signOutProfile,
  } = useGameState();
  const [activeNode, setActiveNode] = useState<KnowledgePoint | null>(null);
  const [unlockTarget, setUnlockTarget] = useState<KnowledgePoint | null>(null);
  const [showReset, setShowReset] = useState(false);

  const allNodes = useMemo(
    () => chapters.flatMap(ch => ch.sections.flatMap(sec => sec.nodes)),
    [],
  );

  const allNodeIds = useMemo(() => allNodes.map(node => node.id), [allNodes]);

  const totalNodes = allNodeIds.length;

  const availableNodes = useMemo(() => {
    const set = new Set<string>();
    for (const id of allNodeIds) {
      if (isNodeAvailable(id, allNodeIds) || state.completedNodes.includes(id)) {
        set.add(id);
      }
    }
    return set;
  }, [allNodeIds, isNodeAvailable, state.completedNodes]);

  const getPrerequisiteIds = useCallback((node: KnowledgePoint) => {
    if (node.prerequisites?.length) return node.prerequisites;

    const idx = allNodeIds.indexOf(node.id);
    return idx > 0 ? [allNodeIds[idx - 1]] : [];
  }, [allNodeIds]);

  const handleNodeClick = useCallback((nodeId: string) => {
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return;

    if (availableNodes.has(nodeId)) {
      setActiveNode(node);
      return;
    }

    setUnlockTarget(node);
  }, [allNodes, availableNodes]);

  const handleComplete = useCallback((nodeId: string, score: number) => {
    completeNode(nodeId, score);
  }, [completeNode]);

  const handleClose = useCallback(() => {
    if (activeNode) {
      const ns = state.nodeStates[activeNode.id];
      if (ns?.status !== 'completed') {
        recordAttempt(activeNode.id);
      }
    }
    setActiveNode(null);
  }, [activeNode, state.nodeStates, recordAttempt]);

  const handleReset = useCallback(() => {
    resetProgress();
    setShowReset(false);
  }, [resetProgress]);

  const handleUnlockPass = useCallback(() => {
    if (!unlockTarget) return;
    unlockNode(unlockTarget.id);
    setActiveNode(unlockTarget);
    setUnlockTarget(null);
  }, [unlockNode, unlockTarget]);

  const prerequisiteNodes = useMemo(() => {
    if (!unlockTarget) return [];
    const ids = getPrerequisiteIds(unlockTarget);
    return ids
      .map(id => allNodes.find(node => node.id === id))
      .filter((node): node is KnowledgePoint => Boolean(node));
  }, [allNodes, getPrerequisiteIds, unlockTarget]);

  if (!profile) {
    return <StudentGate onSignIn={signInProfile} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <StatusBar state={state} totalNodes={totalNodes} />

      <div className="px-4 pt-4 pb-2 max-w-lg mx-auto">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          化学知识挑战树
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">沪教版初中化学 · 闯关解锁知识点</p>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span className="truncate">
            {profile.className} · {profile.classCode} · {profile.studentName}
          </span>
          <button onClick={signOutProfile} className="text-slate-500 hover:text-slate-300">
            切换学生
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        <SkillTree
          chapters={chapters}
          completedNodes={state.completedNodes}
          availableNodes={availableNodes}
          onNodeClick={handleNodeClick}
        />
      </div>

      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setShowReset(true)}
          className="text-xs text-slate-600 hover:text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg transition-colors"
        >
          重置进度
        </button>
      </div>

      {activeNode && (
        <QuizModal
          node={activeNode}
          onClose={handleClose}
          onComplete={handleComplete}
          currentStreak={state.streak}
          profile={profile}
        />
      )}

      {unlockTarget && (
        <UnlockChallengeModal
          targetNode={unlockTarget}
          prerequisiteNodes={prerequisiteNodes}
          onClose={() => setUnlockTarget(null)}
          onPass={handleUnlockPass}
        />
      )}

      {showReset && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-xs w-full text-center space-y-4 border border-slate-700/50">
            <h3 className="text-lg font-bold text-white">确认重置？</h3>
            <p className="text-sm text-slate-400">所有进度和成就将被清除，此操作不可恢复</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm transition-colors"
              >
                重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
