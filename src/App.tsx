import { lazy, Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import type { Chapter, Course, KnowledgePoint, PlayModuleId, StudentProfile } from './types';
import { DEFAULT_COURSE_ID } from './data/courseConstants';
import { useGameState } from './hooks/useGameState';
import { StatusBar } from './components/StatusBar';
import { LandingPage } from './components/LandingPage';
import { InviteGate } from './components/InviteGate';
import { ModeSelect } from './components/ModeSelect';
import { BottomNav } from './components/BottomNav';
import { ViewerFeedback } from './components/ViewerFeedback';
import { trackAnalyticsEvent } from './services/analytics';

const SkillTree = lazy(() => import('./components/SkillTree').then(module => ({ default: module.SkillTree })));
const QuizModal = lazy(() => import('./components/QuizModal').then(module => ({ default: module.QuizModal })));
const UnlockChallengeModal = lazy(() => import('./components/UnlockChallengeModal').then(module => ({ default: module.UnlockChallengeModal })));
const JumpChapterModal = lazy(() => import('./components/JumpChapterModal').then(module => ({ default: module.JumpChapterModal })));
const WrongBook = lazy(() => import('./components/WrongBook').then(module => ({ default: module.WrongBook })));
const ReviewMode = lazy(() => import('./components/ReviewMode').then(module => ({ default: module.ReviewMode })));
const ProfileEditor = lazy(() => import('./components/ProfileEditor').then(module => ({ default: module.ProfileEditor })));
const LearningReport = lazy(() => import('./components/LearningReport').then(module => ({ default: module.LearningReport })));
const ForumBoard = lazy(() => import('./components/ForumBoard').then(module => ({ default: module.ForumBoard })));
const Leaderboard = lazy(() => import('./components/Leaderboard').then(module => ({ default: module.Leaderboard })));
const ChapterGraduationModal = lazy(() => import('./components/ChapterGraduationModal').then(module => ({ default: module.ChapterGraduationModal })));
const ChapterWrongSweeper = lazy(() => import('./components/ChapterWrongSweeper').then(module => ({ default: module.ChapterWrongSweeper })));
const SummerLessonRecommendations = lazy(() => import('./components/SummerLessonRecommendations').then(module => ({ default: module.SummerLessonRecommendations })));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard').then(module => ({ default: module.TeacherDashboard })));
const StudyGuideModal = lazy(() => import('./components/StudyGuideModal').then(module => ({ default: module.StudyGuideModal })));
const ElementFlashcards = lazy(() => import('./components/ElementFlashcards').then(module => ({ default: module.ElementFlashcards })));
const ValenceTrainer = lazy(() => import('./components/ValenceTrainer').then(module => ({ default: module.ValenceTrainer })));
const ElectronShellModule = lazy(() => import('./components/ElectronShellModule').then(module => ({ default: module.ElectronShellModule })));
const ScenarioChallengeMode = lazy(() => import('./components/ScenarioChallengeMode').then(module => ({ default: module.ScenarioChallengeMode })));

const ChemGwent = lazy(() => import('./components/ChemGwent').then(module => ({ default: module.ChemGwent })));

type AppMode = 'chemGwent' | 'landing' | 'guest' | 'login' | 'modeSelect' | 'skillTree' | 'reviewMode' | 'summerLessons' | 'scenarioChallenges' | 'elements' | 'valence' | 'electronShell' | 'report';
type PracticeReturnMode = 'landing' | 'modeSelect' | 'skillTree' | 'scenarioChallenges';

const loadingCourse: Course = {
  id: DEFAULT_COURSE_ID,
  name: '上海初中化学',
  shortName: '上海中考化学',
  region: '上海',
  stage: 'junior',
  examSystem: '上海中考',
  textbook: '沪教版初中化学',
  description: '初中化学闯关练习正在准备中',
  modeSummary: '',
  gradeOrder: ['八年级', '九年级'],
  chapters: [],
  reviewChapters: [],
};

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page-start)] text-[var(--text-main)] px-4">
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-5 py-4 text-sm font-bold shadow-sm">
        化学树正在打开...
      </div>
    </div>
  );
}

function App() {
  const [loadedCourse, setLoadedCourse] = useState<Course | null>(null);
  const activeCourse = loadedCourse ?? loadingCourse;
  const directNodeId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('node');
  }, []);
  const [hasHandledDirectNode, setHasHandledDirectNode] = useState(false);

  useEffect(() => {
    trackAnalyticsEvent('visit', { experienceId: directNodeId || 'site' });
  }, [directNodeId]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('course');
    const allowDraftPreview = import.meta.env.DEV && (
      params.get('preview') === 'draft' || params.get('draft') === '1'
    );

    import('./data/courses').then(({ defaultCourse, findCourseById }) => {
      if (cancelled) return;
      setLoadedCourse(findCourseById(courseId, { includeDrafts: allowDraftPreview }) ?? defaultCourse);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const {
    profile,
    state,
    isNodeAvailable,
    completeNode,
    unlockNode,
    recordWrong,
    removeWrong,
    recordAttempt,
    completeChapter,
    resetProgress,
    signInProfile,
    updateProfile,
    signOutProfile,
  } = useGameState(activeCourse.id);
  // 如果已登录，跳过首页直接到模式选择
  const [mode, setMode] = useState<AppMode>(() => {
    if (new URLSearchParams(window.location.search).get('play') === 'chem-gwent') { window.location.replace('/games/chem-gwent/'); }
    try {
      const saved = localStorage.getItem('chem-tree-active-profile');
      if (saved && JSON.parse(saved)) return 'modeSelect';
    } catch {
      // Ignore damaged login cache and show the landing page.
    }
    return 'landing';
  });
  const [activeNode, setActiveNode] = useState<KnowledgePoint | null>(null);
  const [unlockTarget, setUnlockTarget] = useState<KnowledgePoint | null>(null);
  const [jumpChapter, setJumpChapter] = useState<Chapter | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [showWrongBook, setShowWrongBook] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showForum, setShowForum] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showTeacherDashboard, setShowTeacherDashboard] = useState(false);
  const [showStudyGuide, setShowStudyGuide] = useState(false);
  const [graduatingChapter, setGraduatingChapter] = useState<Chapter | null>(null);
  const [sweepingChapter, setSweepingChapter] = useState<Chapter | null>(null);
  const [focusedChapterId, setFocusedChapterId] = useState<string | null>(null);
  const [practiceReturnMode, setPracticeReturnMode] = useState<PracticeReturnMode>('modeSelect');
  const [isQuickTrial, setIsQuickTrial] = useState(false);
  const [authIntent, setAuthIntent] = useState<'login' | 'register'>('login');
  const practiceBackLabel = practiceReturnMode === 'skillTree'
    ? '返回知识树'
    : practiceReturnMode === 'scenarioChallenges'
      ? '返回情景挑战'
      : practiceReturnMode === 'landing'
        ? '返回首页'
      : '返回模式选择';

  const guestProfile: StudentProfile = useMemo(() => ({
    profileId: 'guest', classCode: '', className: '游客模式', studentName: '游客', pin: '', createdAt: '',
  }), []);

  const canOpenUserPanel = profile?.classCode === 'CHEM莲花'
    && profile.studentId === '0815'
    && Boolean(profile.dashboardToken);

  const allNodes = useMemo(
    () => activeCourse.chapters.flatMap(ch => ch.sections.flatMap(sec => sec.nodes)),
    [activeCourse.chapters],
  );

  const allNodeIds = useMemo(() => allNodes.map(node => node.id), [allNodes]);
  const progressionNodeIds = useMemo(
    () => allNodes.filter(node => !node.standaloneEntry).map(node => node.id),
    [allNodes],
  );
  const chapterEntryNodeIds = useMemo(
    () => activeCourse.chapters
      .map(ch => ch.sections[0]?.nodes[0]?.id)
      .filter((id): id is string => Boolean(id)),
    [activeCourse.chapters],
  );

  const totalNodes = allNodeIds.length;

  const availableNodes = useMemo(() => {
    const set = new Set<string>();
    for (const node of allNodes) {
      if (
        node.standaloneEntry
        || isNodeAvailable(node.id, progressionNodeIds)
        || state.completedNodes.includes(node.id)
      ) {
        set.add(node.id);
      }
    }
    if (activeCourse.status === 'draft') {
      for (const id of chapterEntryNodeIds) set.add(id);
    }
    return set;
  }, [activeCourse.status, allNodes, chapterEntryNodeIds, isNodeAvailable, progressionNodeIds, state.completedNodes]);

  const getPrerequisiteIds = useCallback((node: KnowledgePoint) => {
    if (node.standaloneEntry) return [];
    if (node.prerequisites?.length) return node.prerequisites;

    const idx = progressionNodeIds.indexOf(node.id);
    return idx > 0 ? [progressionNodeIds[idx - 1]] : [];
  }, [progressionNodeIds]);

  const handleNodeClick = useCallback((nodeId: string) => {
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return;

    const hasQuestions = node.challenges.length > 0 || Boolean(node.bigQuestion?.subQuestions.length);
    if (!hasQuestions) return;

    trackAnalyticsEvent('start_experience', { experienceId: nodeId });

    if (availableNodes.has(nodeId) || node.prerequisites?.length) {
      setActiveNode(node);
      return;
    }

    setActiveNode(node);
  }, [allNodes, availableNodes]);

  useEffect(() => {
    if (!loadedCourse || hasHandledDirectNode || !directNodeId) return;

    const directNode = allNodes.find((node) => node.id === directNodeId);
    if (!directNode) {
      setHasHandledDirectNode(true);
      return;
    }

    const hasQuestions = directNode.challenges.length > 0
      || Boolean(directNode.bigQuestion?.subQuestions.length);
    if (!hasQuestions) {
      setHasHandledDirectNode(true);
      return;
    }

    const sourceChapter = activeCourse.chapters.find((chapter) =>
      chapter.sections.some((section) => section.nodes.some((node) => node.id === directNode.id)),
    );
    if (sourceChapter) setFocusedChapterId(sourceChapter.id);

    setPracticeReturnMode('skillTree');
    setMode('skillTree');
    trackAnalyticsEvent('start_experience', { experienceId: directNode.id });
    setActiveNode(directNode);
    setHasHandledDirectNode(true);
  }, [
    activeCourse.chapters,
    allNodes,
    directNodeId,
    hasHandledDirectNode,
    loadedCourse,
  ]);

  const handleComplete = useCallback((nodeId: string, score: number) => {
    trackAnalyticsEvent('complete', { experienceId: nodeId });
    completeNode(nodeId, score);

    // 检查该节点所属的章节是否全部完成
    const ch = activeCourse.chapters.find(c =>
      c.sections.some(s => s.nodes.some(n => n.id === nodeId))
    );
    if (ch) {
      const chNodes = ch.sections.flatMap(s => s.nodes.map(n => n.id));
      const completedSet = new Set(state.completedNodes);
      completedSet.add(nodeId);

      const allDone = chNodes.every(id => completedSet.has(id));
      const isAlreadyCompleted = state.completedChapters?.includes(ch.id);

      if (allDone && !isAlreadyCompleted) {
        completeChapter(ch.id);
        setGraduatingChapter(ch);
      }
    }
  }, [completeNode, activeCourse.chapters, state.completedNodes, state.completedChapters, completeChapter]);

  const handleClose = useCallback(() => {
    if (activeNode) {
      const ns = state.nodeStates[activeNode.id];
      if (availableNodes.has(activeNode.id) && ns?.status !== 'completed') {
        recordAttempt(activeNode.id);
      }
    }
    setActiveNode(null);
  }, [activeNode, availableNodes, state.nodeStates, recordAttempt]);

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

  const handleJumpChapterPass = useCallback((nodeIds: string[]) => {
    for (const id of nodeIds) {
      unlockNode(id);
    }
    setJumpChapter(null);
  }, [unlockNode]);

  const prerequisiteNodes = useMemo(() => {
    if (!unlockTarget) return [];
    const ids = getPrerequisiteIds(unlockTarget);
    return ids
      .map(id => allNodes.find(node => node.id === id))
      .filter((node): node is KnowledgePoint => Boolean(node));
  }, [allNodes, getPrerequisiteIds, unlockTarget]);

  const nextNode = useMemo(() => {
    if (!activeNode) return null;
    const activeChapter = activeCourse.chapters.find(c =>
      c.sections.some(s => s.nodes.some(n => n.id === activeNode.id))
    );
    if (!activeChapter) return null;

    const chapterNodes = activeChapter.sections.flatMap(s => s.nodes);
    const currentIndex = chapterNodes.findIndex(n => n.id === activeNode.id);

    if (currentIndex !== -1 && currentIndex < chapterNodes.length - 1) {
      const candidate = chapterNodes[currentIndex + 1];
      const hasQuestions = candidate.challenges.length > 0 || Boolean(candidate.bigQuestion?.subQuestions.length);
      return hasQuestions ? candidate : null;
    }
    return null;
  }, [activeNode, activeCourse.chapters]);

  const handleNextNode = useCallback((nextNodeId: string) => {
    const node = allNodes.find(n => n.id === nextNodeId);
    if (node) {
      setActiveNode(node);
    }
  }, [allNodes]);

  const openPlayModule = useCallback((moduleId: PlayModuleId, returnMode: PracticeReturnMode) => {
    if (returnMode === 'skillTree' && activeNode) {
      const sourceChapter = activeCourse.chapters.find((chapter) =>
        chapter.sections.some((section) => section.nodes.some((node) => node.id === activeNode.id)),
      );
      if (sourceChapter) setFocusedChapterId(sourceChapter.id);
    }
    setPracticeReturnMode(returnMode);
    setIsQuickTrial(false);
    setActiveNode(null);
    trackAnalyticsEvent('start_experience', { experienceId: moduleId });
    setMode(moduleId);
  }, [activeCourse.chapters, activeNode]);

  const openAuth = useCallback((intent: 'login' | 'register' = 'login') => {
    setAuthIntent(intent);
    setIsQuickTrial(false);
    setMode('login');
  }, []);

  useEffect(() => {
    if (mode !== 'scenarioChallenges' && mode !== 'elements' && mode !== 'valence' && mode !== 'electronShell') return;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mode]);

  // ---- 路由分流 ----

  if (!loadedCourse) {
    return <RouteFallback />;
  }

  if (mode === 'chemGwent') {
    return <Suspense fallback={<RouteFallback />}><ChemGwent onBack={() => { window.history.replaceState(null, '', window.location.pathname); setMode(profile ? 'modeSelect' : 'landing'); }} /></Suspense>;
  }

  if (mode === 'landing') {
    return (
      <>
        <LandingPage
          course={activeCourse}
          onGuest={() => {
            setIsQuickTrial(false);
            trackAnalyticsEvent('start_experience', { experienceId: 'guest-trial' });
            setMode('modeSelect');
          }}
          onLogin={() => openAuth('login')}
        />
        <ViewerFeedback profile={profile} sourcePage="网站首页" />
      </>
    );
  }

  if (mode === 'login') {
    return (
      <>
        <InviteGate
          courseId={activeCourse.id}
          initialMode={authIntent}
          onSignIn={(access, studentId, studentName, progress, displayName, avatar, dashboardToken, socialToken) => {
            signInProfile(access, studentId, studentName, progress, displayName, avatar, dashboardToken, socialToken);
            setIsQuickTrial(false);
            setMode('modeSelect');
          }}
          onBack={() => setMode('landing')}
        />
        <ViewerFeedback profile={profile} sourcePage="邀请码登录页" />
      </>
    );
  }

  if (mode === 'modeSelect') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <ModeSelect
          course={activeCourse}
          onSkillTree={() => setMode('skillTree')}
          onReview={() => setMode('reviewMode')}
          onSummerLessons={() => setMode('summerLessons')}
          onScenarioChallenges={() => setMode('scenarioChallenges')}
          onChemGwent={() => { window.location.href = '/games/chem-gwent/'; }}
          profile={profile}
          onSignOut={() => {
            signOutProfile();
            setMode('landing');
          }}
          onOpenUserPanel={canOpenUserPanel ? () => setShowTeacherDashboard(true) : undefined}
        />
        {showTeacherDashboard && (
          <TeacherDashboard
            course={activeCourse}
            accessToken={profile?.dashboardToken ?? ''}
            onClose={() => setShowTeacherDashboard(false)}
          />
        )}
        <ViewerFeedback profile={profile} sourcePage="学习内容选择页" />
      </Suspense>
    );
  }

  if (mode === 'summerLessons') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <SummerLessonRecommendations
          chapters={activeCourse.chapters}
          completedNodes={state.completedNodes}
          wrongList={state.wrongList}
          onBack={() => setMode('modeSelect')}
          onOpenChapter={(chapterId) => {
            setFocusedChapterId(chapterId);
            setMode('skillTree');
          }}
        />
        <ViewerFeedback profile={profile} sourcePage="课后推荐页" />
      </Suspense>
    );
  }

  if (mode === 'scenarioChallenges') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <ScenarioChallengeMode
          onBack={() => setMode('modeSelect')}
          onOpenModule={(moduleId) => openPlayModule(moduleId, 'scenarioChallenges')}
        />
        <ViewerFeedback profile={profile} sourcePage="情景挑战模式" />
      </Suspense>
    );
  }

  if (mode === 'elements') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <ElementFlashcards
          courseId={activeCourse.id}
          profile={profile}
          onBack={() => {
            setIsQuickTrial(false);
            setMode(practiceReturnMode);
          }}
          backLabel={practiceBackLabel}
          initialTab={isQuickTrial ? 'match' : 'cards'}
          quickTrial={isQuickTrial}
          onCompleteTrial={isQuickTrial
            ? () => trackAnalyticsEvent('complete', { experienceId: 'elements20-trial' })
            : undefined}
          onRegister={!profile ? () => openAuth('register') : undefined}
        />
        <ViewerFeedback profile={profile} sourcePage="前20号元素训练" />
      </Suspense>
    );
  }

  if (mode === 'valence') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <ValenceTrainer
          courseId={activeCourse.id}
          profile={profile}
          onBack={() => setMode(practiceReturnMode)}
          backLabel={practiceBackLabel}
        />
        <ViewerFeedback profile={profile} sourcePage="化合价与原子团训练" />
      </Suspense>
    );
  }

  if (mode === 'electronShell') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <ElectronShellModule
          onBack={() => setMode(practiceReturnMode)}
          backLabel={practiceBackLabel}
        />
        <ViewerFeedback profile={profile} sourcePage="原子结构画图挑战" />
      </Suspense>
    );
  }

  if (mode === 'reviewMode') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <ReviewMode
          course={activeCourse}
          profile={profile}
          currentStreak={state.streak}
          onComplete={(nodeId, score) => {
            trackAnalyticsEvent('complete', { experienceId: nodeId });
            completeNode(nodeId, score);
          }}
          onRecordWrong={recordWrong}
          onBack={() => setMode('modeSelect')}
        />
        <ViewerFeedback profile={profile} sourcePage="期末复习" />
      </Suspense>
    );
  }

  if (mode === 'report') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <LearningReport
          profile={profile}
          state={state}
          chapters={activeCourse.chapters}
          courseName={activeCourse.shortName}
          totalNodes={totalNodes}
          allNodes={allNodes}
          onClose={() => setMode('skillTree')}
          onOpenWrongBook={() => { setMode('skillTree'); setShowWrongBook(true); }}
        />
        <ViewerFeedback profile={profile} sourcePage="学习报告" />
      </Suspense>
    );
  }

  const isGuest = !profile;
  const hasBlockingOverlay = Boolean(
    activeNode
    || unlockTarget
    || jumpChapter
    || showReset
    || showWrongBook
    || showProfileEdit
    || showForum
    || showLeaderboard
    || showMoreMenu
    || showTeacherDashboard
    || showStudyGuide
    || graduatingChapter
    || sweepingChapter,
  );

  return (
    <Suspense fallback={<RouteFallback />}>
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-page-start)] via-[var(--bg-page-mid)] to-[var(--bg-page-end)] text-[var(--text-main)]">
      <StatusBar state={state} totalNodes={totalNodes} />

      {/* 游客横幅 */}
      {isGuest && (
        <div className="bg-[var(--bg-amber)] border-b border-[var(--border-amber)] px-4 py-2 text-center">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => setMode('modeSelect')} className="text-xs font-medium text-teal-700 hover:text-teal-950">
              ← 切换模式
            </button>
            <span className="text-xs font-bold text-amber-800">
              🎮 游客模式 · 进度不会保存
            </span>
            <button
              onClick={() => openAuth('login')}
              className="text-xs font-bold text-amber-800 hover:text-amber-700 underline"
            >
              登录保存进度
            </button>
          </div>
        </div>
      )}

      <div className="px-4 pt-3 pb-1 max-w-lg mx-auto flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1
              className="shrink-0 whitespace-nowrap text-lg font-black bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent select-none"
            >
              化学知识挑战树
            </h1>
            {profile && (
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-medium leading-none truncate max-w-[280px]">
                🏫 {profile.className} · 🆔 {profile.studentId} · 👤 {profile.studentName}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          <button
            onClick={() => setShowStudyGuide(true)}
            className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-black text-teal-800 shadow-sm hover:border-teal-300 hover:bg-teal-100 transition-colors"
          >
            🧭 引导
          </button>
          {profile ? (
            <div className="flex items-center gap-0.5">
              {canOpenUserPanel && (
                <button
                  type="button"
                  onClick={() => setShowTeacherDashboard(true)}
                  aria-label="打开用户面板"
                  className="h-8 w-3 opacity-0"
                />
              )}
              <button onClick={() => setShowProfileEdit(true)} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <div className="relative">
                <span className="text-xl">{profile.avatar && profile.avatar.startsWith('/') ? '' : (profile.avatar || '🔬')}</span>
                {profile.avatar && profile.avatar.startsWith('/') && (
                  <img src={profile.avatar} alt="" className="w-8 h-8 object-cover rounded-full ring-2 ring-teal-300" />
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-teal-500 text-white rounded-full flex items-center justify-center text-[0.5rem] shadow-sm">✎</span>
              </div>
              <span className="text-xs font-medium text-[var(--text-main)] underline decoration-dotted underline-offset-2">
                编辑
              </span>
              </button>
            </div>
          ) : (
            <button onClick={() => openAuth('login')} className="text-xs font-bold text-teal-700 hover:text-teal-600">
              登录
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto pb-20">
        <SkillTree
          chapters={activeCourse.chapters}
          gradeOrder={activeCourse.gradeOrder}
          mapTitle={activeCourse.stage === 'senior' ? '高中教材地图' : '初中学习地图'}
          mapHint={
            activeCourse.stage === 'senior'
              ? '按教材正门进入；标清全国必修、全国选考必修和上海等级考必学'
              : '八、九年级全部知识点支持：先判断、再点拨、练习与迁移测验'
          }
          completedNodes={state.completedNodes}
          availableNodes={availableNodes}
          completedChapters={state.completedChapters}
          wrongList={state.wrongList}
          onNodeClick={handleNodeClick}
          onJumpChapter={setJumpChapter}
          onSweepWrong={setSweepingChapter}
          focusChapterId={focusedChapterId}
        />
      </div>

      {/* 底部导航 */}
      <BottomNav
        items={[
          { key: 'tree', icon: '🌳', label: '知识树' },
          { key: 'wrong', icon: '📝', label: '错题', badge: state.wrongList.length },
          { key: 'report', icon: '📊', label: '报告' },
          { key: 'more', icon: '•••', label: '更多' },
        ]}
        active="tree"
        onSelect={(key) => {
          switch (key) {
            case 'wrong': setShowWrongBook(true); break;
            case 'report': setMode('report'); break;
            case 'more': setShowMoreMenu(true); break;
          }
        }}
      />

      {showMoreMenu && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowMoreMenu(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="more-menu-title"
            className="w-full max-w-sm rounded-t-[2rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-2xl sm:rounded-[2rem]"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-black tracking-widest text-teal-700">次要功能</div>
                <h2 id="more-menu-title" className="text-lg font-black text-[var(--text-main)]">更多</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-[var(--bg-disabled)] text-lg font-bold text-[var(--text-muted)]"
                aria-label="关闭更多功能"
              >
                ×
              </button>
            </div>
            <div className="grid gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setShowForum(true);
                }}
                className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-left text-sm font-black text-indigo-800"
              >
                <span>💬 问答讨论</span>
                <span aria-hidden="true">›</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  if (profile) setShowLeaderboard(true);
                  else openAuth('login');
                }}
                className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-left text-sm font-black text-amber-800"
              >
                <span>{profile ? '🏆 同班排行' : '🔐 登录后查看同班排行'}</span>
                <span aria-hidden="true">›</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  setShowReset(true);
                }}
                className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-left text-sm font-black text-rose-700"
              >
                <span>↻ 重置学习进度</span>
                <span aria-hidden="true">›</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {activeNode && (
        <QuizModal
          key={activeNode.id}
          node={activeNode}
          canChallenge={directNodeId === activeNode.id || availableNodes.has(activeNode.id)}
          initialMode={directNodeId === activeNode.id ? 'learn' : undefined}
          onUnlockRequest={directNodeId !== activeNode.id && activeNode.prerequisites?.length ? () => {
            setUnlockTarget(activeNode);
            setActiveNode(null);
          } : undefined}
          onClose={handleClose}
          onComplete={handleComplete}
          onRecordWrong={recordWrong}
          currentStreak={state.streak}
          profile={profile ?? guestProfile}
          attempts={state.nodeStates[activeNode.id]?.attempts ?? 0}
          nextNode={nextNode}
          onNextNode={handleNextNode}
          onPlayModule={(moduleId) => openPlayModule(moduleId, 'skillTree')}
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

      {jumpChapter && (
        <JumpChapterModal
          chapter={jumpChapter}
          onClose={() => setJumpChapter(null)}
          onPass={handleJumpChapterPass}
        />
      )}

      {showProfileEdit && profile && (
        <ProfileEditor
          profile={profile}
          onSave={(displayName, avatar) => updateProfile(displayName, avatar)}
          onClose={() => setShowProfileEdit(false)}
          onSignOut={() => {
            signOutProfile();
            setMode('landing');
            setShowProfileEdit(false);
          }}
        />
      )}

      {showLeaderboard && profile && (
        <Leaderboard
          currentStudentId={profile.studentId ?? profile.studentName}
          classCode={profile.classCode}
          className={profile.className}
          socialToken={profile.socialToken ?? ''}
          totalNodes={allNodeIds.length}
          onClose={() => setShowLeaderboard(false)}
          onRelogin={() => {
            setShowLeaderboard(false);
            signOutProfile();
            openAuth('login');
          }}
        />
      )}

      {showForum && (
        <ForumBoard
          authorName={profile?.displayName ?? profile?.studentName ?? '游客'}
          authorAvatar={profile?.avatar ?? '🔬'}
          studentId={profile?.studentId ?? profile?.studentName ?? 'guest'}
          onClose={() => setShowForum(false)}
        />
      )}

      {showTeacherDashboard && (
        <TeacherDashboard
          course={activeCourse}
          accessToken={profile?.dashboardToken ?? ''}
          onClose={() => setShowTeacherDashboard(false)}
        />
      )}

      {showStudyGuide && (
        <StudyGuideModal
          chapters={activeCourse.chapters}
          gradeOrder={activeCourse.gradeOrder}
          onClose={() => setShowStudyGuide(false)}
          onOpenChapter={(chapterId) => {
            setFocusedChapterId(chapterId);
            setShowStudyGuide(false);
          }}
        />
      )}

      {showWrongBook && (
        <WrongBook course={activeCourse} wrongList={state.wrongList} onClose={() => setShowWrongBook(false)} onRemoveWrong={removeWrong} />
      )}

      {graduatingChapter && (
        <ChapterGraduationModal
          chapter={graduatingChapter}
          onClose={() => setGraduatingChapter(null)}
        />
      )}

      {sweepingChapter && (
        <ChapterWrongSweeper
          course={activeCourse}
          chapter={sweepingChapter}
          wrongList={state.wrongList}
          onClose={() => setSweepingChapter(null)}
          onRemoveWrong={removeWrong}
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
      {!hasBlockingOverlay && (
        <ViewerFeedback profile={profile} sourcePage="化学知识挑战树" withBottomNav />
      )}
    </div>
    </Suspense>
  );
}

export default App;
