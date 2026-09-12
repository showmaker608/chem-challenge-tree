import { useState } from 'react';

type SoluteType = 'kno3' | 'nacl' | 'caoh2';

interface SoluteInfo {
  name: string;
  formula: string;
  typeText: string;
  addedWeight: number; // 模拟加入的总质量 (g)
  getSolubility: (t: number) => number;
  color: string;
  textColor: string;
  bgColor: string;
  curvePath: string; // 预先绘制曲线的 SVG 路径
  desc: string;
}

const solutes: Record<SoluteType, SoluteInfo> = {
  kno3: {
    name: '硝酸钾',
    formula: 'KNO₃',
    typeText: '陡升型 (极易受温度影响)',
    addedWeight: 80, // 加入 80g
    getSolubility: (t) => 13.3 + 0.57 * t + 0.011 * Math.pow(t, 2),
    color: '#06b6d4', // 蓝青色
    textColor: 'text-cyan-400',
    bgColor: 'bg-cyan-950/40 border-cyan-800',
    curvePath: 'M 10,90 Q 50,80 90,10', // 陡峭上升
    desc: '温度升高，溶解度急剧增大。适合用“降温结晶”法提纯。',
  },
  nacl: {
    name: '氯化钠',
    formula: 'NaCl',
    typeText: '缓升型 (几乎不受温度影响)',
    addedWeight: 45, // 加入 45g
    getSolubility: (t) => 35.7 + 0.003 * t,
    color: '#fbbf24', // 橙黄色
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-950/40 border-amber-800',
    curvePath: 'M 10,55 L 90,52', // 几乎水平
    desc: '溶解度受温度影响极小。要获得食盐晶体，只能通过“蒸发结晶”法。',
  },
  caoh2: {
    name: '氢氧化钙',
    formula: 'Ca(OH)₂',
    typeText: '逆向型 (随温度升高而减小)',
    addedWeight: 0.5, // 仅加入 0.5g（本身微溶）
    getSolubility: (t) => 0.18 - 0.001 * t,
    color: '#ef4444', // 红色
    textColor: 'text-red-400',
    bgColor: 'bg-red-950/40 border-red-800',
    curvePath: 'M 10,75 L 90,85', // 缓慢下降
    desc: '中考致命陷阱！温度升高溶解度变小，升温反而会析出固体变浑浊。',
  },
};

export function SolubilitySimulator() {
  const [active, setActive] = useState<SoluteType>('kno3');
  const [temp, setTemp] = useState<number>(20);

  const solute = solutes[active];
  const solubility = solute.getSolubility(temp);
  const dissolved = Math.min(solute.addedWeight, solubility);
  const undissolved = Math.max(0, solute.addedWeight - solubility);
  const isSaturated = undissolved > 0;

  // 根据未溶解物质质量决定底部结晶物的外观
  const crystalCount = Math.min(25, Math.ceil((undissolved / solute.addedWeight) * 20));

  // 曲线图的坐标转换
  // 温度 T: 0 -> 100 对应 X: 20 -> 180
  // 溶解度 S: 0 -> 150 对应 Y: 130 -> 10
  const getGraphCoords = (t: number, s: number) => {
    const x = 30 + (t / 100) * 150;
    // 限制 Y 轴范围在 10 ~ 130 之间
    const y = 130 - (Math.min(s, 150) / 150) * 110;
    return { x, y };
  };

  const cursor = getGraphCoords(temp, solubility);

  return (
    <div className="w-full bg-[#111827] rounded-2xl overflow-hidden shadow-xl border border-gray-800 my-4 flex flex-col p-4">
      <div className="text-center mb-3">
        <h4 className="text-cyan-200 font-bold text-sm">溶解度与结晶交互演示仪</h4>
        <p className="text-xs text-gray-400 mt-1">切换溶质并调整温度，观察溶解与析出晶体的物理奇观</p>
      </div>

      {/* 溶质选择 Tab */}
      <div className="flex justify-center gap-1.5 mb-4">
        {(Object.keys(solutes) as SoluteType[]).map((key) => (
          <button
            key={key}
            onClick={() => {
              setActive(key);
              // Ca(OH)2 溶解度很小，做微调
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              active === key
                ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {solutes[key].name} ({solutes[key].formula})
          </button>
        ))}
      </div>

      {/* 主体演示区域：Beaker & Curve */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* 左侧：烧杯可视化 */}
        <div className="flex flex-col items-center justify-center bg-gray-950/60 rounded-xl p-4 border border-gray-800 min-h-[220px]">
          <span className="text-[10px] text-gray-500 font-mono mb-2">加入 {solute.addedWeight}g 溶质 / 100g 水</span>
          
          <div className="relative w-28 h-36 border-b-4 border-x-2 border-gray-400 rounded-b-lg flex items-end justify-center overflow-hidden">
            {/* 水面 (0g-100g) */}
            <div className="absolute bottom-0 w-full h-24 bg-sky-500/25 transition-all duration-300 border-t border-sky-400/50"></div>

            {/* Ca(OH)2 专属：浑浊度动画 (根据未溶解质量决定浑浊度) */}
            {active === 'caoh2' && undissolved > 0 && (
              <div 
                className="absolute bottom-0 w-full h-24 bg-white/70 transition-opacity duration-300 pointer-events-none"
                style={{ opacity: Math.min(0.85, 0.2 + (undissolved / solute.addedWeight) * 0.6) }}
              ></div>
            )}

            {/* 溶解中的粒子 (如果是饱和状态，渲染沉淀；如果不饱和，漂浮些微颗粒) */}
            {Array.from({ length: crystalCount }).map((_, i) => {
              const left = 10 + (i * 17) % 80;
              const bottom = 2 + (i * 3) % 12;
              return (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-sm rotate-45 transition-all duration-500 shadow-sm"
                  style={{
                    left: `${left}px`,
                    bottom: `${bottom}px`,
                    backgroundColor: solute.color,
                    opacity: 0.85,
                  }}
                ></div>
              );
            })}

            {/* 烧杯刻度 */}
            <div className="absolute top-14 left-1 w-2 border-t border-gray-500"></div>
            <div className="absolute top-20 left-1 w-3 border-t border-gray-500"></div>
            <div className="absolute top-26 left-1 w-2 border-t border-gray-500"></div>
            <div className="absolute top-20 left-4 text-[8px] text-gray-500 font-mono">100 mL</div>
          </div>

          {/* 实时状态文字 */}
          <div className="mt-4 text-center">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isSaturated ? 'bg-amber-900/50 text-amber-300 border border-amber-700/50' : 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50'
            }`}>
              {isSaturated ? '饱和溶液 (有固体析出)' : '不饱和溶液 (完全溶解)'}
            </span>
            <div className="text-xs text-gray-300 mt-2 font-mono">
              溶解: <span className="font-bold text-white">{dissolved.toFixed(active === 'caoh2' ? 3 : 1)}g</span>
              {isSaturated && (
                <> / 析出: <span className="font-bold text-amber-400">{undissolved.toFixed(active === 'caoh2' ? 3 : 1)}g</span></>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：溶解度曲线图 */}
        <div className="bg-gray-950/40 rounded-xl p-2 border border-gray-800 flex flex-col items-center">
          <span className="text-[10px] text-gray-400 font-bold mb-1">溶解度曲线 (g/100g水)</span>
          <svg className="w-full max-w-[200px] h-32 overflow-visible" viewBox="0 0 200 140">
            {/* 坐标轴 */}
            <line x1="30" y1="130" x2="190" y2="130" stroke="#4b5563" strokeWidth="1.5" />
            <line x1="30" y1="10" x2="30" y2="130" stroke="#4b5563" strokeWidth="1.5" />
            
            {/* 轴标签 */}
            <text x="190" y="138" fill="#9ca3af" fontSize="8" textAnchor="end">T/℃</text>
            <text x="25" y="10" fill="#9ca3af" fontSize="8" textAnchor="end">S/g</text>

            {/* 刻度值 */}
            <text x="30" y="138" fill="#6b7280" fontSize="7" textAnchor="middle">0</text>
            <text x="105" y="138" fill="#6b7280" fontSize="7" textAnchor="middle">50</text>
            <text x="180" y="138" fill="#6b7280" fontSize="7" textAnchor="middle">100</text>
            
            <text x="25" y="130" fill="#6b7280" fontSize="7" textAnchor="end">0</text>
            <text x="25" y="75" fill="#6b7280" fontSize="7" textAnchor="end">75</text>
            <text x="25" y="20" fill="#6b7280" fontSize="7" textAnchor="end">150</text>

            {/* 绘制三条参考曲线 */}
            {/* KNO3 */}
            <path
              d="M 30,120 Q 80,105 180,20"
              fill="none"
              stroke={active === 'kno3' ? solute.color : '#374151'}
              strokeWidth={active === 'kno3' ? '2.5' : '1.5'}
              strokeDasharray={active === 'kno3' ? '' : '2'}
              className="transition-all duration-300"
            />
            {/* NaCl */}
            <path
              d="M 30,104 L 180,103"
              fill="none"
              stroke={active === 'nacl' ? solute.color : '#374151'}
              strokeWidth={active === 'nacl' ? '2.5' : '1.5'}
              strokeDasharray={active === 'nacl' ? '' : '2'}
              className="transition-all duration-300"
            />
            {/* Ca(OH)2 */}
            <path
              d="M 30,129.5 L 180,129.9"
              fill="none"
              stroke={active === 'caoh2' ? solute.color : '#374151'}
              strokeWidth={active === 'caoh2' ? '2.5' : '1.5'}
              strokeDasharray={active === 'caoh2' ? '' : '2'}
              className="transition-all duration-300"
            />

            {/* 当前指针 */}
            <circle
              cx={cursor.x}
              cy={cursor.y}
              r="4.5"
              fill={solute.color}
              className="animate-ping"
            />
            <circle
              cx={cursor.x}
              cy={cursor.y}
              r="3.5"
              fill={solute.color}
              stroke="#ffffff"
              strokeWidth="1"
            />
          </svg>
          
          <div className="text-[10px] text-gray-400 font-mono mt-2">
            当前温度: <span className="text-white font-bold">{temp}℃</span> · 
            溶解度: <span className="font-bold text-white">{solubility.toFixed(active === 'caoh2' ? 3 : 1)}g</span>
          </div>
        </div>
      </div>

      {/* 温度滑块 */}
      <div className="mt-4 bg-gray-950/40 rounded-xl p-3 border border-gray-800">
        <div className="flex justify-between items-center text-xs font-medium text-gray-300 mb-2">
          <span>🌡️ 溶液温度调节</span>
          <span className="text-cyan-400 font-bold">{temp} °C</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={temp}
          onChange={(e) => setTemp(Number(e.target.value))}
          className="w-full accent-cyan-500 bg-gray-800 rounded-lg h-2 cursor-pointer focus:outline-none"
        />
        <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1">
          <span>0°C (冰水混合)</span>
          <span>50°C (温水)</span>
          <span>100°C (沸腾)</span>
        </div>
      </div>

      {/* 科普卡片 */}
      <div className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed transition-all duration-300 ${solute.bgColor}`}>
        <div className="font-bold mb-1 flex items-center gap-1.5">
          <span className={solute.textColor}>💡 {solute.name}考点特征：</span>
          <span className="text-gray-300 text-[10px]">{solute.typeText}</span>
        </div>
        <p className="text-gray-300 font-medium">{solute.desc}</p>
      </div>
    </div>
  );
}
