import { countCourseNodes } from '../data/courseUtils';
import type { Course } from '../types';
import { Mascot } from './Mascot';

interface LandingPageProps {
  course: Course;
  onGuest: () => void;
  onLogin: () => void;
}

export function LandingPage({ course, onGuest, onLogin }: LandingPageProps) {
  const chapterCount = course.chapters.length;
  const nodeCount = countCourseNodes(course);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden" style={{ background: `radial-gradient(circle at 20% 0%, var(--teal-glow), transparent 32rem), linear-gradient(180deg, var(--bg-page-start) 0%, var(--bg-page-mid) 100%)` }}>
      <div className="absolute inset-x-0 top-0 h-56 tiny-lab-dot opacity-60 pointer-events-none" />
      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="soft-panel rounded-[2rem] px-5 pt-6 pb-5 text-center">
          <div className="relative mx-auto mb-4 h-32 w-40 flex items-center justify-center">
            <div className="absolute inset-x-4 bottom-3 h-10 rounded-full bg-teal-900/10 blur-md" />
            <Mascot mood="idle" />
            <span className="absolute left-2 top-3 text-xl">⚗️</span>
            <span className="absolute right-3 top-8 text-lg">✨</span>
          </div>
        <h1 className="text-3xl font-black mb-3 tracking-tight">
          <span className="bg-gradient-to-r from-teal-700 via-emerald-600 to-amber-500 bg-clip-text text-transparent">
            化学知识挑战树
          </span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed">
          {course.description}<br />
          像打游戏一样学化学，解锁知识点、升级段位
        </p>

        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800">
          <span aria-hidden="true">✓</span>
          打开就能玩，不用先注册
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {[
            { icon: '🌳', title: '技能树', desc: `${chapterCount}章${nodeCount}节点\n闯关解锁` },
            { icon: '⚡', title: 'XP升级', desc: '10级段位\n连胜奖励' },
            { icon: '🔬', title: '实验题', desc: '名校汇编\n紧扣考点' },
          ].map((item) => (
            <div key={item.title} className="bg-[var(--bg-card)]/85 rounded-2xl p-3 border border-[var(--border-color)] shadow-sm">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs font-medium text-[var(--text-main)] mb-0.5">{item.title}</div>
              <div className="text-[0.65rem] text-[var(--text-muted)] leading-tight whitespace-pre-line">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={onGuest}
            className="w-full py-3.5 bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 text-white rounded-2xl font-black text-base transition-all shadow-lg shadow-teal-800/20 hover:-translate-y-0.5"
          >
            <span className="block text-lg">🎮 免注册试玩</span>
            <span className="mt-0.5 block text-xs font-bold text-emerald-50">先选择想体验的内容 · 进度保存在本机</span>
          </button>
          <button
            onClick={onLogin}
            className="w-full py-3 bg-[var(--bg-card)] hover:bg-[var(--bg-highlight)] text-[var(--text-muted)] rounded-2xl font-bold transition-colors border border-[var(--border-color)]"
          >
            🔑 已有账号？登录
          </button>
        </div>
        </div>

        <div className="soft-card rounded-2xl p-4 mt-4 text-left">
          <div className="text-xs text-teal-700 font-black mb-2 tracking-wide">⚡ 试玩怎么开始？</div>
          <div className="text-xs text-[var(--text-muted)] leading-relaxed space-y-1">
            <div>1️⃣ 点“免注册试玩”，先选择想体验的学习内容</div>
            <div>2️⃣ 可以体验<strong className="text-[var(--text-main)]">知识树、情景挑战或自由复习</strong></div>
            <div>3️⃣ 需要跨设备保存进度时，再注册开启云端存档</div>
          </div>
        </div>

        <footer className="mt-5 text-center text-xs text-[var(--text-muted)]">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-teal-700 hover:underline"
          >
            豫ICP备2026043361号-1
          </a>
        </footer>
      </div>
    </div>
  );
}
