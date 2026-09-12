import { useState, useEffect, useRef } from 'react';

export function NeutralizationTitrator() {
  const [drops, setDrops] = useState<number>(0);
  const [isDripping, setIsDripping] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // 模拟中和滴定 pH 突跃曲线
  // 滴数范围: 0 ~ 30
  // 第 20 滴为 HCl 与 NaOH 的理论恰好中和点 (pH = 7.0)
  // 酚酞在 pH = 7 时仍无色；第 21 滴模拟出现持久淡粉色的指示剂终点。
  const getPhAndColor = (d: number) => {
    let ph = 1.0;
    let color = 'rgba(243, 244, 246, 0.2)'; // 无色透明
    let statusText = '酸性过量，含有大量 H⁺，无色酚酞不显色';
    
    if (d === 0) { ph = 1.0; }
    else if (d <= 5) { ph = 1.0 + d * 0.05; }
    else if (d <= 15) { ph = 1.25 + (d - 5) * 0.1; } // pH ~ 2.25
    else if (d <= 18) { ph = 2.25 + (d - 15) * 0.45; } // pH ~ 3.6
    else if (d === 19) { ph = 5.0; statusText = '接近中和点，酸仍有少量剩余'; }
    else if (d === 20) { 
      ph = 7.0; 
      color = 'rgba(243, 244, 246, 0.2)';
      statusText = '理论恰好中和：pH = 7，酚酞仍然无色';
    }
    else if (d === 21) { 
      ph = 9.0; 
      color = 'rgba(244, 63, 94, 0.35)';
      statusText = '酚酞终点：OH⁻ 略微过量，出现持久淡粉色';
    }
    else if (d <= 25) { 
      ph = 9.0 + (d - 21) * 0.6; 
      color = 'rgba(236, 72, 153, 0.85)';
      statusText = '强碱性过量，含有过剩氢氧根离子 (OH⁻)';
    }
    else { 
      ph = 11.4 + Math.min(0.6, (d - 25) * 0.1); 
      color = 'rgba(219, 39, 119, 0.95)';
      statusText = '强碱性过量，含有过剩氢氧根离子 (OH⁻)';
    }

    return { ph, color, statusText };
  };

  const { ph, color, statusText } = getPhAndColor(drops);

  // 添加滴液动画控制
  const triggerDrip = () => {
    if (drops >= 30) {
      setIsPlaying(false);
      return;
    }
    setIsDripping(true);
    setTimeout(() => {
      setIsDripping(false);
      setDrops((prev) => Math.min(30, prev + 1));
    }, 400); // 400ms 滴落动画时间
  };

  // 自动滴加控制
  useEffect(() => {
    if (isPlaying) {
      playInterval.current = setInterval(() => {
        triggerDrip();
      }, 700); // 每 700ms 滴一滴
    } else {
      if (playInterval.current) clearInterval(playInterval.current);
    }
    return () => {
      if (playInterval.current) clearInterval(playInterval.current);
    };
  }, [isPlaying, drops]);

  const handleSingleDrip = () => {
    if (!isDripping) {
      triggerDrip();
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setDrops(0);
    setIsDripping(false);
  };

  // 绘图坐标计算：
  // 滴数 X: 0 -> 30 映射 30 -> 180
  // pH Y: 1 -> 14 映射 120 -> 10
  const getGraphCoords = (d: number, p: number) => {
    const x = 30 + (d / 30) * 150;
    const y = 120 - ((p - 1) / 13) * 110;
    return { x, y };
  };

  // 绘制折线图的 Path
  let graphPath = 'M 30,120';
  for (let i = 1; i <= drops; i++) {
    const pt = getPhAndColor(i);
    const coords = getGraphCoords(i, pt.ph);
    graphPath += ` L ${coords.x},${coords.y}`;
  }

  const cursor = getGraphCoords(drops, ph);

  return (
    <div className="w-full bg-[#111827] rounded-2xl overflow-hidden shadow-xl border border-gray-800 my-4 p-4 pb-20 flex flex-col">
      <div className="text-center mb-3">
        <h4 className="text-indigo-200 font-bold text-sm">中和反应 pH 突跃滴定探究仪</h4>
        <p className="text-xs text-gray-400 mt-1">向盐酸中滴加NaOH，比较理论中和点与酚酞终点</p>
      </div>

      {/* 控制台按钮组 */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={handleSingleDrip}
          disabled={drops >= 30 || isDripping}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-gray-800 disabled:text-gray-600 transition-all flex items-center gap-1 shadow-md shadow-indigo-600/25"
        >
          💧 滴加 1 滴 NaOH
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={drops >= 30}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          } disabled:bg-gray-800 disabled:text-gray-600`}
        >
          {isPlaying ? '⏸ 暂停滴加' : '▶ 连续滴加'}
        </button>
        <button
          onClick={handleReset}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all"
        >
          🔄 重置反应
        </button>
      </div>

      {/* 主展示区 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        
        {/* 左侧：滴定管与烧杯动画 */}
        <div className="relative flex flex-col items-center justify-center bg-gray-950/60 rounded-xl p-4 border border-gray-800 min-h-[220px] overflow-hidden">
          
          <div className="flex gap-8 items-end justify-center w-full h-36 relative">
            {/* 滴定管 */}
            <div className="absolute top-0 left-12 w-2.5 h-16 border-x border-gray-400 bg-gray-700/30 flex flex-col justify-end items-center">
              {/* 滴定刻度 */}
              <div className="w-full h-0.5 bg-gray-500 absolute top-4"></div>
              <div className="w-full h-0.5 bg-gray-500 absolute top-8"></div>
              <div className="w-full h-0.5 bg-gray-500 absolute top-12"></div>
              {/* 活塞 */}
              <div className="w-5 h-3 bg-red-600 rounded-sm absolute -bottom-1 cursor-pointer flex items-center justify-center text-[6px] text-white font-mono">
                {isDripping ? '●' : '—'}
              </div>
            </div>

            {/* 下落的液滴 */}
            {isDripping && (
              <div className="absolute top-16 left-[53px] w-2 h-2.5 bg-sky-300 rounded-full animate-[drip_0.4s_ease-in-out_infinite]"></div>
            )}

            {/* 烧杯 (锥形瓶效果) */}
            <div className="relative w-20 h-20 flex items-end justify-center">
              {/* 锥形瓶外壁 (SVG) */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full stroke-gray-400 stroke-2 fill-none overflow-visible">
                {/* 锥形瓶瓶口与斜壁 */}
                <path d="M 35,10 L 65,10 L 65,25 L 90,90 L 10,90 L 35,25 Z" />
              </svg>

              {/* 瓶内液体 (根据 drops 增加稍微上涨高度，并展现平滑变色) */}
              <div 
                className="w-full transition-all duration-500 border-t border-white/20"
                style={{
                  height: `${30 + (drops * 0.4)}%`,
                  backgroundColor: color,
                  clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                }}
              >
                {/* 液体涟漪特效 */}
                {isDripping && (
                  <div className="w-full h-full bg-white/10 animate-pulse"></div>
                )}
              </div>
            </div>
          </div>

          {/* 实时参数展示 */}
          <div className="mt-3 text-center z-10">
            <span className="text-[9px] text-gray-500 font-mono">滴加碱液: {drops} 滴 / 实时 pH 值</span>
            <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">
              pH = {ph.toFixed(2)}
            </div>
            <div className="text-[10px] leading-4 text-gray-300 font-medium px-2 py-1 rounded bg-gray-900 border border-gray-800 mt-1 max-w-[220px] min-h-7 text-center" title={statusText}>
              {statusText}
            </div>
          </div>
        </div>

        {/* 右侧：pH 突跃滴定曲线图 */}
        <div className="bg-gray-950/40 rounded-xl p-3 border border-gray-800 flex flex-col items-center">
          <span className="text-[10px] text-gray-400 font-bold mb-1">pH 滴定突跃曲线</span>
          <svg className="w-full max-w-[200px] h-32 overflow-visible" viewBox="0 0 200 130">
            {/* 网格线 (pH = 7) */}
            <line x1="30" y1="69" x2="180" y2="69" stroke="#374151" strokeWidth="1" strokeDasharray="3" />
            <text x="185" y="72" fill="#ef4444" fontSize="6">pH=7</text>

            {/* 坐标轴 */}
            <line x1="30" y1="120" x2="180" y2="120" stroke="#4b5563" strokeWidth="1.5" />
            <line x1="30" y1="10" x2="30" y2="120" stroke="#4b5563" strokeWidth="1.5" />
            
            {/* 轴标签 */}
            <text x="180" y="128" fill="#9ca3af" fontSize="8" textAnchor="end">滴数(NaOH)</text>
            <text x="25" y="10" fill="#9ca3af" fontSize="8" textAnchor="end">pH</text>

            {/* 刻度 */}
            <text x="30" y="128" fill="#6b7280" fontSize="7" textAnchor="middle">0</text>
            <text x="130" y="128" fill="#6b7280" fontSize="7" textAnchor="middle">20</text>
            <text x="180" y="128" fill="#6b7280" fontSize="7" textAnchor="middle">30</text>
            
            <text x="25" y="120" fill="#6b7280" fontSize="7" textAnchor="end">1</text>
            <text x="25" y="69" fill="#6b7280" fontSize="7" textAnchor="end">7</text>
            <text x="25" y="14" fill="#6b7280" fontSize="7" textAnchor="end">14</text>

            {/* 绘制已走过的突跃折线 */}
            {drops > 0 && (
              <path
                d={graphPath}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                className="transition-all duration-300"
              />
            )}

            {/* 理论中和点标记 */}
            {drops >= 20 && (
              <g>
                <circle cx={getGraphCoords(20, 7.0).x} cy={getGraphCoords(20, 7.0).y} r="5" fill="#22d3ee" className="animate-ping" />
                <circle cx={getGraphCoords(20, 7.0).x} cy={getGraphCoords(20, 7.0).y} r="3" fill="#22d3ee" />
              </g>
            )}

            {/* 酚酞出现持久淡粉色的实验终点 */}
            {drops >= 21 && (
              <circle
                cx={getGraphCoords(21, 9.0).x}
                cy={getGraphCoords(21, 9.0).y}
                r="3"
                fill="#f472b6"
                stroke="#ffffff"
                strokeWidth="1"
              />
            )}

            {/* 当前浮动指针 */}
            {drops > 0 && (
              <circle
                cx={cursor.x}
                cy={cursor.y}
                r="3"
                fill="#818cf8"
                stroke="#ffffff"
                strokeWidth="1"
              />
            )}
          </svg>
          
          <div className="text-[9px] text-gray-400 font-mono mt-2 text-center">
            {drops < 20 ? (
              <span>🔴 离滴定突跃中和点还差 <span className="text-white font-bold">{20 - drops}</span> 滴</span>
            ) : drops === 20 ? (
              <span className="text-cyan-300 font-bold">理论中和点：pH = 7，酚酞仍无色</span>
            ) : drops === 21 ? (
              <span className="text-pink-400 font-bold">酚酞终点：略过量，出现持久淡粉色</span>
            ) : (
              <span className="text-rose-400">⚠️ 已过头！强碱过量</span>
            )}
          </div>
        </div>
      </div>

      {/* 化学方程式特效 */}
      <div className="mt-3 p-3 rounded-xl border bg-indigo-950/40 border-indigo-900 text-xs text-center flex flex-col justify-center gap-1.5">
        <div className="text-gray-400 text-[10px] font-bold">🧪 反应化学方程式</div>
        <div className="font-mono text-cyan-300 font-bold text-sm tracking-wide">
          HCl + NaOH → NaCl + H₂O
        </div>
        <div className="text-gray-400 text-[9px] font-mono border-t border-indigo-950 pt-1">
          微观本质：H⁺ + OH⁻ → H₂O（水溶液中的反应通常放热）
        </div>
      </div>

      <style>{`
        @keyframes drip {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          90% { transform: translateY(60px) scale(0.9); opacity: 1; }
          100% { transform: translateY(64px) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
