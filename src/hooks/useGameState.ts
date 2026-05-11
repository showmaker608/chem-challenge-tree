import { useState, useEffect, useCallback, useRef } from 'react';
import type { ClassAccess, PlayerState, NodeState, StudentProfile } from '../types';
import { XP_PER_NODE, XP_BONUS_STREAK, getLevel } from '../types';
import { cloudSyncProgress } from '../services/cloudSync';

const ACTIVE_PROFILE_KEY = 'chem-tree-active-profile';
const PROGRESS_KEY_PREFIX = 'chem-tree-progress';

const defaultState: PlayerState = {
  xp: 0,
  level: 1,
  streak: 0,
  maxStreak: 0,
  completedNodes: [],
  unlockedNodes: [],
  nodeStates: {},
  achievements: [],
};

function makeProfileId(classCode: string, studentName: string, pin: string) {
  const cleanClass = classCode.trim().toUpperCase();
  const cleanName = studentName.trim();
  return `${cleanClass}:${cleanName}:${pin.trim()}`;
}

function getProgressKey(profileId: string) {
  return `${PROGRESS_KEY_PREFIX}:${profileId}`;
}

function loadProfile(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StudentProfile;
    return {
      ...parsed,
      className: parsed.className ?? parsed.classCode,
    };
  } catch {
    return null;
  }
}

function saveProfile(profile: StudentProfile | null) {
  try {
    if (profile) localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(ACTIVE_PROFILE_KEY);
  } catch {
    // Student identity persistence is best-effort until cloud sync is connected.
  }
}

function loadState(profileId: string | null): PlayerState {
  if (!profileId) return { ...defaultState };

  try {
    const raw = localStorage.getItem(getProgressKey(profileId));
    if (raw) {
      const parsed = JSON.parse(raw) as PlayerState;
      return { ...defaultState, ...parsed };
    }
  } catch {
    return { ...defaultState };
  }
  return { ...defaultState };
}

function saveState(profileId: string | null, state: PlayerState) {
  if (!profileId) return;

  try {
    localStorage.setItem(getProgressKey(profileId), JSON.stringify(state));
  } catch {
    // Progress persistence is best-effort; private browsing can disable storage.
  }
}

export function useGameState() {
  const [profile, setProfile] = useState<StudentProfile | null>(loadProfile);
  const [state, setState] = useState<PlayerState>(() => loadState(profile?.profileId ?? null));

  // 保存到本地
  useEffect(() => {
    saveState(profile?.profileId ?? null, state);
  }, [profile?.profileId, state]);

  // 同步到云端（防抖 3 秒）
  const syncTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!profile) return;
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      cloudSyncProgress(profile.classCode, profile.studentName, state);
    }, 3000);
    return () => clearTimeout(syncTimer.current);
  }, [profile, state]);

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
      if (state.unlockedNodes.includes(nodeId)) return true;
      const idx = allNodeIds.indexOf(nodeId);
      if (idx === 0) return true;
      const prevId = allNodeIds[idx - 1];
      return state.completedNodes.includes(prevId);
    },
    [state.completedNodes, state.unlockedNodes],
  );

  const completeNode = useCallback(
    (nodeId: string, score: number) => {
      setState((prev) => {
        const wasCompleted = prev.completedNodes.includes(nodeId);
        const newStreak = wasCompleted ? prev.streak : prev.streak + 1;
        const xpGain = wasCompleted
          ? 0
          : XP_PER_NODE + (newStreak > 1 ? XP_BONUS_STREAK : 0);

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

  const unlockNode = useCallback((nodeId: string) => {
    setState((prev) => {
      if (prev.unlockedNodes.includes(nodeId) || prev.completedNodes.includes(nodeId)) {
        return prev;
      }

      return {
        ...prev,
        unlockedNodes: [...prev.unlockedNodes, nodeId],
        nodeStates: {
          ...prev.nodeStates,
          [nodeId]: {
            status: 'available',
            bestScore: prev.nodeStates[nodeId]?.bestScore ?? 0,
            attempts: prev.nodeStates[nodeId]?.attempts ?? 0,
          },
        },
      };
    });
  }, []);

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
    if (profile?.profileId) {
      localStorage.removeItem(getProgressKey(profile.profileId));
    }
  }, [profile]);

  const signInProfile = useCallback((classAccess: ClassAccess, studentName: string, pin: string, cloudProgress?: PlayerState | null) => {
    const nextProfile: StudentProfile = {
      profileId: makeProfileId(classAccess.classCode, studentName, pin),
      classCode: classAccess.classCode.trim().toUpperCase(),
      className: classAccess.className,
      studentName: studentName.trim(),
      pin: pin.trim(),
      createdAt: new Date().toISOString(),
    };

    saveProfile(nextProfile);
    setProfile(nextProfile);

    // 优先用云端进度，其次用本地进度
    if (cloudProgress) {
      setState({ ...defaultState, ...cloudProgress });
    } else {
      setState(loadState(nextProfile.profileId));
    }
  }, []);

  const signOutProfile = useCallback(() => {
    saveProfile(null);
    setProfile(null);
    setState({ ...defaultState });
  }, []);

  return {
    profile,
    state,
    getNodeState,
    isNodeAvailable,
    completeNode,
    unlockNode,
    recordAttempt,
    resetProgress,
    signInProfile,
    signOutProfile,
  };
}
