import { useState, useEffect, useCallback } from 'react';
import type { PlayerState, NodeState } from '../types';
import { XP_PER_NODE, XP_BONUS_STREAK, getLevel } from '../types';

const STORAGE_KEY = 'chem-tree-progress';

const defaultState: PlayerState = {
  xp: 0,
  level: 1,
  streak: 0,
  maxStreak: 0,
  completedNodes: [],
  nodeStates: {},
  achievements: [],
};

function loadState(): PlayerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PlayerState;
      return { ...defaultState, ...parsed };
    }
  } catch {}
  return { ...defaultState };
}

function saveState(state: PlayerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useGameState() {
  const [state, setState] = useState<PlayerState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const getNodeState = useCallback(
    (nodeId: string): NodeState => {
      return (
        state.nodeStates[nodeId] ?? {
          status: 'locked',
          bestScore: 0,
          attempts: 0,
        }
      );
    },
    [state.nodeStates],
  );

  const isNodeAvailable = useCallback(
    (nodeId: string, allNodeIds: string[]): boolean => {
      const idx = allNodeIds.indexOf(nodeId);
      if (idx === 0) return true;
      const prevId = allNodeIds[idx - 1];
      return state.completedNodes.includes(prevId);
    },
    [state.completedNodes],
  );

  const completeNode = useCallback(
    (nodeId: string, score: number) => {
      setState((prev) => {
        const wasCompleted = prev.completedNodes.includes(nodeId);
        const newStreak = wasCompleted ? prev.streak : prev.streak + 1;
        const xpGain = XP_PER_NODE + (newStreak > 1 ? XP_BONUS_STREAK : 0);

        const newXp = prev.xp + xpGain;
        const newLevel = getLevel(newXp).level;

        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          streak: newStreak,
          maxStreak: Math.max(prev.maxStreak, newStreak),
          completedNodes: wasCompleted
            ? prev.completedNodes
            : [...prev.completedNodes, nodeId],
          nodeStates: {
            ...prev.nodeStates,
            [nodeId]: {
              status: 'completed',
              bestScore: Math.max(
                score,
                prev.nodeStates[nodeId]?.bestScore ?? 0,
              ),
              attempts: (prev.nodeStates[nodeId]?.attempts ?? 0) + 1,
            },
          },
        };
      });
    },
    [],
  );

  const recordAttempt = useCallback((nodeId: string) => {
    setState((prev) => ({
      ...prev,
      streak: 0,
      nodeStates: {
        ...prev.nodeStates,
        [nodeId]: {
          status:
            prev.nodeStates[nodeId]?.status === 'completed'
              ? 'completed'
              : 'available',
          bestScore: prev.nodeStates[nodeId]?.bestScore ?? 0,
          attempts: (prev.nodeStates[nodeId]?.attempts ?? 0) + 1,
        },
      },
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setState({ ...defaultState });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    state,
    getNodeState,
    isNodeAvailable,
    completeNode,
    recordAttempt,
    resetProgress,
  };
}
