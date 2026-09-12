import { countCourseNodes } from '../data/courseUtils';
import { availableSummerLessonLines } from '../data/summerLessonRecommendations';
import type { Course, StudentProfile } from '../types';
import { Mascot } from './Mascot';

interface ModeSelectProps {
  course: Course;
  onSkillTree: () => void;
  onChemGwent: () => void;
  onReview: () => void;
  onSummerLessons: () => void;
  onScenarioChallenges: () => void;
  profile: StudentProfile | null;
  onSignOut: () => void;
  onOpenUserPanel?: () => void;
}

export function ModeSelect({ onChemGwent, course, onSkillTree, onReview, onSummerLessons, onScenarioChallenges, profile, onSignOut, onOpenUserPanel }: ModeSelectProps) {
  const nodeCount = countCourseNodes(course);
  const mainModeTitle = course.stage === 'senior' ? '高中学习' : '初中学习';
  const showSummerLessons = course.stage === 'junior' && availableSummerLessonLines.length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 relative overflow-x-hidden" style={{ background: `radial-gradient(circle at 20% 0%, var(--teal-glow), transparent 32rem), linear-gradient(180deg, var(--bg-page-start) 0%, var(--bg-page-mid) 100%)` }}>
      <div className="absolute inset-x-0 top-0 h-64 tiny-lab-dot opacity-50 pointer-events-none" />

      {/* Top Profile & Header Control Bar */}
      {profile && (
        <div className="absolute top-4 left-4 right-4 max-w-sm mx-auto flex items-center justify-between soft-panel px-4 py-2.5 rounded-2xl z-40">
          <div className="flex items-center gap-2">
            {onOpenUserPanel && (
              <button
                type="button"
                onClick={onOpenUserPanel}
                aria-label="打开用户面板"
                className="h-8 w-3 shrink-0 opacity-0"
              />
            )}
            <span className="text-2xl">{profile.avatar && profile.avatar.startsWith('/') ? '' : (profile.avatar || '🔬')}</span>
            {profile.avatar && profile.avatar.startsWith('/') && (
              <img src={profile.avatar} alt="" className="w-8 h-8 object-cover rounded-xl ring-2 ring-teal-300" />
            )}
            <div className="text-left">
              <div className="text-xs font-bold text-[var(--text-main)] truncate max-w-[120px]">
                {profile.displayName || profile.studentName}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] leading-none mt-0.5">
                {profile.className} · {profile.studentId}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (window.confirm('确定要退出当前账号吗？已保存的云端进度不会丢失。')) {
                  onSignOut();
                }
              }}
              className="px-2.5 py-1 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-800/30 rounded-xl font-medium transition-all text-[10px] flex items-center gap-1"
            >
              🚪 退出
            </button>
          </div>
        </div>
      )}

      <div className="text-center max-w-sm mx-auto mt-16 sm:mt-12 relative z-10">
        <div className="mx-auto mb-4 h-24 w-28 flex items-center justify-center">
          <Mascot mood="happy" size="sm" />
        </div>
        <h2 className="text-2xl font-black text-[var(--text-main)] mb-2 tracking-tight">今天怎么学？</h2>
        <p className="text-sm text-[var(--text-muted)] mb-7">按目标选择：系统学习、情景动手，或者自由复习</p>

        <div className="space-y-4">
          <button onClick={onChemGwent} className="w-full rounded-[1.35rem] border border-amber-600 bg-emerald-950 p-5 text-left text-amber-100"><div className="text-2xl">⚔</div><div className="font-black mt-2">化学对决 · 卡牌试玩</div><div className="text-xs mt-2 leading-relaxed">三排对战 · 有限手牌 · 留牌与停牌的博弈</div></button>
          <button
            onClick={onSkillTree}
            className="group w-full soft-card hover:border-teal-300 rounded-[1.35rem] p-5 text-left transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-3xl mb-2">🌳</div>
              <span className="text-[10px] font-black px-2 py-1 rounded-full bg-[var(--bg-highlight)] text-teal-800">学生入口</span>
            </div>
            <div className="text-base font-black text-[var(--text-main)] mb-1">{mainModeTitle}</div>
            <div className="text-xs text-[var(--text-muted)] leading-relaxed">
              {course.chapters.length}章 · {nodeCount}个知识点 · 设计型学习 / 闯关刷题<br />
              {course.stage === 'junior' ? '八、九年级全部知识点均已开放学习模式' : '只有经过教学设计的知识点才开放学习模式'}
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-[var(--bg-disabled)] overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 transition-all group-hover:w-5/6" />
            </div>
          </button>

          {course.stage === 'junior' && (
            <button
              onClick={onScenarioChallenges}
              className="group w-full overflow-hidden rounded-[1.35rem] border border-violet-200 bg-gradient-to-br from-violet-50 via-[var(--bg-card)] to-cyan-50 p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-3xl mb-2">🎮</div>
                <span className="text-[10px] font-black px-2 py-1 rounded-full bg-violet-100 text-violet-800 border border-violet-200">3 个挑战已开放</span>
              </div>
              <div className="text-base font-black text-[var(--text-main)] mb-1">情景挑战模式</div>
              <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                元素密码 · 化合价炼金 · 原子结构画图<br />
                不先灌知识，接到任务就动手
              </div>
              <div className="mt-4 h-1.5 rounded-full bg-violet-100 overflow-hidden">
                <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 transition-all group-hover:w-5/6" />
              </div>
            </button>
          )}

          <button
            onClick={onReview}
            className="group w-full soft-card hover:border-amber-300 rounded-[1.35rem] p-5 text-left transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-3xl mb-2">🎯</div>
              <span className="text-[10px] font-black px-2 py-1 rounded-full bg-[var(--bg-amber-dark)] text-amber-800">自由刷</span>
            </div>
            <div className="text-base font-black text-[var(--text-main)] mb-1">期末复习</div>
            <div className="text-xs text-[var(--text-muted)] leading-relaxed">
              自由选题 · 无需解锁<br />
              实验探究 + 方程式 + 微观本质，任意刷
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-[var(--bg-disabled)] overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all group-hover:w-3/4" />
            </div>
          </button>

          {showSummerLessons && (
            <button
              onClick={onSummerLessons}
              className="group w-full soft-card hover:border-rose-300 rounded-[1.35rem] p-5 text-left transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-3xl mb-2">📌</div>
                <span className="text-[10px] font-black px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">九阶暑假</span>
              </div>
              <div className="text-base font-black text-[var(--text-main)] mb-1">课后推荐</div>
              <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                腾飞 18讲路线<br />
                上完课后直接跳到该刷的章节
              </div>
              <div className="mt-4 h-1.5 rounded-full bg-[var(--bg-disabled)] overflow-hidden">
                <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all group-hover:w-4/5" />
              </div>
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
