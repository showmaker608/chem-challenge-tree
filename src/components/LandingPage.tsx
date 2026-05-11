interface LandingPageProps {
  onGuest: () => void;
  onLogin: () => void;
}

export function LandingPage({ onGuest, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 py-12">
      {/* 主视觉 */}
      <div className="text-center max-w-md mx-auto">
        <div className="text-6xl mb-6">🧪</div>
        <h1 className="text-3xl font-bold mb-3">
          <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
            化学知识挑战树
          </span>
        </h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          沪教版初中化学 · 游戏化闯关刷题<br />
          像打游戏一样学化学，解锁知识点、升级段位
        </p>

        {/* 亮点卡片 */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { icon: '🌳', title: '技能树', desc: '8章52节点\n闯关解锁' },
            { icon: '⚡', title: 'XP升级', desc: '10级段位\n连胜奖励' },
            { icon: '🔬', title: '实验题', desc: '60%实验\n紧扣考点' },
          ].map((item) => (
            <div key={item.title} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs font-medium text-slate-300 mb-0.5">{item.title}</div>
              <div className="text-[0.65rem] text-slate-500 leading-tight whitespace-pre-line">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* 按钮 */}
        <div className="space-y-3">
          <button
            onClick={onGuest}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-cyan-500/20"
          >
            🎮 免费体验
          </button>
          <button
            onClick={onLogin}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors border border-slate-700/50"
          >
            🔑 激活存档
          </button>
        </div>

        <p className="text-xs text-slate-600 mt-6">
          想保存闯关进度？找老师要激活码，点「激活存档」即可开启云端同步
        </p>
      </div>
    </div>
  );
}
