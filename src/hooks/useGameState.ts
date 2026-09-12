import { useState, useEffect, useCallback, useRef } from 'react';
import type { ClassAccess, PlayerState, NodeState, StudentProfile } from '../types';
import { XP_PER_NODE, XP_BONUS_STREAK, getLevel } from '../types';
import { cloudLoadProgress, cloudSyncProgress, cloudUpdateProfile } from '../services/cloudSync';
import { DEFAULT_COURSE_ID } from '../data/courseConstants';
import { MASTERY_THRESHOLD } from '../data/learningMode';

const ACTIVE_PROFILE_KEY = 'chem-tree-active-profile';
const PROGRESS_KEY_PREFIX = 'chem-tree-progress';
const LAST_CREDS_KEY = 'chem-tree-last-creds';

// 数据版本号：修改 PlayerState 结构时递增，配合 migrateState 自动迁移
const DATA_VERSION = 2; // v2：拆分第一章实验仪器节点，并保留旧学生的后续入口

const defaultState: PlayerState = {
  version: DATA_VERSION,
  xp: 0,
  level: 1,
  streak: 0,
  maxStreak: 0,
  completedNodes: [],
  unlockedNodes: [],
  nodeStates: {},
  achievements: [],
  wrongList: [],
  completedChapters: [],
};

// 数据迁移：处理旧版本数据，补全缺失字段
function migrateState(raw: Record<string, unknown>): PlayerState {
  const sourceVersion = typeof raw.version === 'number' ? raw.version : 1;
  const merged = { ...defaultState, ...raw } as PlayerState;
  // version 1: 确保所有字段都存在
  merged.completedNodes = merged.completedNodes ?? [];
  merged.unlockedNodes = merged.unlockedNodes ?? [];
  merged.nodeStates = merged.nodeStates ?? {};
  merged.wrongList = merged.wrongList ?? [];
  merged.achievements = merged.achievements ?? [];
  merged.completedChapters = merged.completedChapters ?? [];
  // v2 把旧 ch1-n3 拆成多个独立节点。旧学生若已经完成原节点，仍可进入原来的
  // 下一关 ch1-n4；新学生则按新节点顺序逐关完成。
  if (
    sourceVersion < 2
    && merged.completedNodes.includes('ch1-n3')
    && !merged.completedNodes.includes('ch1-n4')
    && !merged.unlockedNodes.includes('ch1-n4')
  ) {
    merged.unlockedNodes = [...merged.unlockedNodes, 'ch1-n4'];
    merged.nodeStates = {
      ...merged.nodeStates,
      'ch1-n4': {
        status: 'available',
        bestScore: merged.nodeStates['ch1-n4']?.bestScore ?? 0,
        attempts: merged.nodeStates['ch1-n4']?.attempts ?? 0,
      },
    };
  }
  merged.version = DATA_VERSION;
  // 旧数据可能 level 不准确，根据 xp 重新计算
  merged.level = getLevel(merged.xp).level;
  return merged;
}

function makeProfileId(classCode: string, studentId: string) {
  return `${classCode.trim().toUpperCase()}:${studentId.trim()}`;
}

function getProgressKey(profileId: string, courseId: string) {
  return `${PROGRESS_KEY_PREFIX}:${profileId}:${courseId}`;
}

function getLegacyProgressKey(profileId: string) {
  return `${PROGRESS_KEY_PREFIX}:${profileId}`;
}

function loadProfile(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StudentProfile;
    // 💡 Auto-heal: If studentId is missing in the saved profile, extract it from profileId
    if (!parsed.studentId && parsed.profileId && parsed.profileId.includes(':')) {
      const parts = parsed.profileId.split(':');
      if (parts.length >= 2) {
        parsed.studentId = parts[1];
        try {
          localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(parsed));
        } catch {}
      }
    }
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

function loadState(profileId: string | null, courseId: string): PlayerState {
  if (!profileId) return { ...defaultState };

  try {
    const raw = localStorage.getItem(getProgressKey(profileId, courseId));
    if (raw) {
      return migrateState(JSON.parse(raw));
    }
    if (courseId === DEFAULT_COURSE_ID) {
      const legacyRaw = localStorage.getItem(getLegacyProgressKey(profileId));
      if (legacyRaw) return migrateState(JSON.parse(legacyRaw));
    }
  } catch {
    // 数据损坏，返回默认
  }
  return { ...defaultState };
}

function saveState(profileId: string | null, courseId: string, state: PlayerState) {
  if (!profileId) return;

  try {
    localStorage.setItem(getProgressKey(profileId, courseId), JSON.stringify(state));
  } catch {
    // Progress persistence is best-effort; private browsing can disable storage.
  }
}

function progressWeight(state: PlayerState) {
  return (state.completedNodes?.length ?? 0) + (state.unlockedNodes?.length ?? 0);
}

function isStateRicher(next: PlayerState, current: PlayerState) {
  const progressDelta = progressWeight(next) - progressWeight(current);
  if (progressDelta !== 0) return progressDelta > 0;
  return (next.xp ?? 0) > (current.xp ?? 0);
}

export function useGameState(courseId = DEFAULT_COURSE_ID) {
  const [profile, setProfile] = useState<StudentProfile | null>(loadProfile);
  const [state, setState] = useState<PlayerState>(() => loadState(profile?.profileId ?? null, courseId));
  const [cloudReady, setCloudReady] = useState(() => !profile);

  useEffect(() => {
    setState(loadState(profile?.profileId ?? null, courseId));
  }, [courseId, profile?.profileId]);

  // 已登录用户启动时主动从云端恢复，避免本地空缓存显示成“进度归零”
  useEffect(() => {
    if (!profile) {
      setCloudReady(true);
      return;
    }

    let cancelled = false;
    setCloudReady(false);

    cloudLoadProgress(profile.classCode, profile.studentId ?? profile.studentName, courseId)
      .then((cloudProgress) => {
        if (cancelled) return;
        const cloudState = cloudProgress
          ? migrateState(cloudProgress as unknown as Record<string, unknown>)
          : null;

        if (!cloudState) return;

        setState((current) => {
          if (isStateRicher(cloudState, current)) return cloudState;
          if (isStateRicher(current, cloudState)) {
            cloudSyncProgress(profile.classCode, profile.studentId ?? profile.studentName, current, courseId);
          }
          return current;
        });
      })
      .finally(() => {
        if (!cancelled) setCloudReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, profile?.classCode, profile?.profileId, profile?.studentId, profile?.studentName]);

  // 保存到本地
  useEffect(() => {
    saveState(profile?.profileId ?? null, courseId, state);
  }, [courseId, profile?.profileId, state]);

  // 同步到云端（防抖 3 秒，但解锁/完成节点立即同步）
  const syncTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevUnlockedLen = useRef(state.unlockedNodes.length);
  const prevCompletedLen = useRef(state.completedNodes.length);

  useEffect(() => {
    if (!profile) return;
    if (!cloudReady) return;

    const unlockedChanged = state.unlockedNodes.length !== prevUnlockedLen.current;
    const completedChanged = state.completedNodes.length !== prevCompletedLen.current;
    prevUnlockedLen.current = state.unlockedNodes.length;
    prevCompletedLen.current = state.completedNodes.length;

    // 解锁或完成节点时立即同步
    if (unlockedChanged || completedChanged) {
      cloudSyncProgress(profile.classCode, profile.studentId ?? profile.studentName, state, courseId);
      return;
    }

    // 其他变化：防抖
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      cloudSyncProgress(profile.classCode, profile.studentId ?? profile.studentName, state, courseId);
    }, 3000);
    return () => clearTimeout(syncTimer.current);
  }, [cloudReady, courseId, profile, state]);

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
        // 全站兜底：低于掌握线只记录本次成绩与次数，不授予完成状态或解锁资格。
        if (score < MASTERY_THRESHOLD && !wasCompleted) {
          return {
            ...prev,
            streak: 0,
            nodeStates: {
              ...prev.nodeStates,
              [nodeId]: {
                status: 'available',
                bestScore: Math.max(score, prev.nodeStates[nodeId]?.bestScore ?? 0),
                attempts: (prev.nodeStates[nodeId]?.attempts ?? 0) + 1,
              },
            },
          };
        }
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

  const recordWrong = useCallback((record: import('../types').WrongRecord) => {
    setState((prev) => {
      const scopedRecord = { ...record, courseId };
      // 避免重复记录同一道题
      const exists = prev.wrongList.some(
        w => w.nodeId === scopedRecord.nodeId && w.challengeIdx === scopedRecord.challengeIdx
      );
      if (exists) return prev;
      return { ...prev, wrongList: [scopedRecord, ...prev.wrongList] };
    });
  }, [courseId]);

  const removeWrong = useCallback((nodeId: string, challengeIdx: number) => {
    setState((prev) => {
      const remaining = prev.wrongList.filter(w => !(w.nodeId === nodeId && w.challengeIdx === challengeIdx));
      const nodeWrongsRemaining = remaining.filter(w => w.nodeId === nodeId).length;
      // 该知识点错题全部消灭 → 100 分；否则保持原分
      const oldScore = prev.nodeStates[nodeId]?.bestScore ?? 0;
      const newScore = nodeWrongsRemaining === 0 ? 100 : oldScore;
      return {
        ...prev,
        wrongList: remaining,
        nodeStates: {
          ...prev.nodeStates,
          [nodeId]: {
            ...prev.nodeStates[nodeId],
            status: prev.nodeStates[nodeId]?.status ?? 'available',
            bestScore: newScore,
            attempts: prev.nodeStates[nodeId]?.attempts ?? 0,
          },
        },
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setState({ ...defaultState });
    if (profile?.profileId) {
      localStorage.removeItem(getProgressKey(profile.profileId, courseId));
      if (courseId === DEFAULT_COURSE_ID) {
        localStorage.removeItem(getLegacyProgressKey(profile.profileId));
      }
    }
  }, [courseId, profile]);

  const signInProfile = useCallback((classAccess: ClassAccess, studentId: string, studentName: string, cloudProgress?: PlayerState | null, displayName?: string, avatar?: string, dashboardToken?: string, socialToken?: string) => {
    const nextProfile: StudentProfile = {
      profileId: makeProfileId(classAccess.classCode, studentId),
      classCode: classAccess.classCode.trim().toUpperCase(),
      className: classAccess.className,
      studentName: studentName.trim(),
      studentId: studentId.trim(),
      displayName: displayName || '',
      avatar: avatar || '',
      dashboardToken: dashboardToken || '',
      socialToken: socialToken || '',
      pin: '',
      createdAt: new Date().toISOString(),
    };

    saveProfile(nextProfile);
    setProfile(nextProfile);

    // 记住邀请码和学号，下次登录自动填入
    try {
      localStorage.setItem(LAST_CREDS_KEY, JSON.stringify({
        classCode: nextProfile.classCode,
        studentId: nextProfile.studentId,
      }));
    } catch {}

    // 合并云端和本地进度：取节点数更多的（防止同步延迟导致进度"回退"）
    const localState = loadState(nextProfile.profileId, courseId);
    const cloudState = cloudProgress ? migrateState(cloudProgress as unknown as Record<string, unknown>) : null;
    if (cloudState) {
      const cloudNodes = cloudState.completedNodes.length + cloudState.unlockedNodes.length;
      const localNodes = localState.completedNodes.length + localState.unlockedNodes.length;
      if (localNodes > cloudNodes) {
        // 本地进度更多（云端同步可能延迟了），用本地的并立刻上报云端
        setState(localState);
        cloudSyncProgress(nextProfile.classCode, nextProfile.studentId ?? nextProfile.studentName, localState, courseId);
      } else {
        setState(cloudState);
      }
    } else {
      setState(localState);
    }
  }, [courseId]);

  const updateProfile = useCallback((displayName: string, avatar: string) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, displayName, avatar };
      saveProfile(updated);
      // 同步昵称和头像到云端
      cloudUpdateProfile(updated.classCode, updated.studentId ?? updated.studentName, displayName, avatar);
      return updated;
    });
  }, []);

  const signOutProfile = useCallback(() => {
    saveProfile(null);
    setProfile(null);
    setState({ ...defaultState });
  }, []);

  const completeChapter = useCallback((chapterId: string) => {
    setState((prev) => {
      const completed = prev.completedChapters ?? [];
      if (completed.includes(chapterId)) return prev;
      return {
        ...prev,
        completedChapters: [...completed, chapterId],
      };
    });
  }, []);

  return {
    profile,
    state,
    getNodeState,
    isNodeAvailable,
    completeNode,
    unlockNode,
    recordAttempt,
    recordWrong,
    removeWrong,
    completeChapter,
    resetProgress,
    signInProfile,
    updateProfile,
    signOutProfile,
  };
}
