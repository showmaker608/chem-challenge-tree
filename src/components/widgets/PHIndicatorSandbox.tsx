import { useState } from 'react';

type IndicatorType = 'litmus' | 'phenolphthalein' | 'cabbage';
type SubstanceType = 'hcl' | 'lemon' | 'milk' | 'water' | 'soap' | 'naoh' | 'custom';

interface SubstanceInfo {
  name: string;
  ph: number;
  desc: string;
}

const substances: Record<SubstanceType, SubstanceInfo> = {
  hcl: { name: '稀盐酸 (HCl)', ph: 1, desc: '强酸性溶液，含有大量自由移动的氢离子 (H⁺)' },
  lemon: { name: '柠檬汁 (Citric Acid)', ph: 3, desc: '弱酸性生活物质，常用于书写隐形墨水暗号' },
  milk: { name: '鲜牛奶 (Milk)', ph: 6.5, desc: '极弱酸性，接近中性' },
  water: { name: '蒸馏水 (H₂O)', ph: 7.0, desc: '中性纯净物，H⁺ 与 OH⁻ 浓度相等' },
  soap: { name: '肥皂水 (Soap Water)', ph: 10, desc: '常见弱碱性生活物质，可用于观察指示剂在碱性环境中的颜色' },
  naoh: { name: '氢氧化钠 (NaOH)', ph: 13, desc: '强碱性溶液，含有大量自由移动的氢氧根离子 (OH⁻)' },
  custom: { name: '神秘溶液 (自定义 pH)', ph: 7.0, desc: '用滑块调节 pH，探索指示剂的渐变奥秘' },
};

export function PHIndicatorSandbox() {
  const [substance, setSubstance] = useState<SubstanceType>('hcl');
  const [indicator, setIndicator] = useState<IndicatorType>('litmus');
  const [customPh, setCustomPh] = useState<number>(7.0);

  const activePh = substance === 'custom' ? customPh : substances[substance].ph;

  // 根据 pH 和指示剂计算液体颜色
  const getLiquidColor = (ind: IndicatorType, ph: number) => {
    if (ind === 'litmus') {
      // 石蕊：酸红碱蓝中性紫
      if (ph < 5) return 'rgba(239, 68, 68, 0.85)'; // 红色
      if (ph > 8) return 'rgba(59, 130, 246, 0.85)'; // 蓝色
      return 'rgba(168, 85, 247, 0.85)'; // 紫色
    } else if (ind === 'phenolphthalein') {
      // 酚酞：碱红酸/中无色
      if (ph >= 8.2) {
        // 随碱性增强红色加深
        const opacity = Math.min(0.9, 0.4 + ((ph - 8.2) / 5.8) * 0.5);
        return `rgba(236, 72, 153, ${opacity})`; // 玫红色
      }
      return 'rgba(243, 244, 246, 0.25)'; // 无色透明（淡灰）
    } else {
      // 紫甘蓝：神奇渐变指示剂
      // 酸(红) -> 弱酸/中(紫) -> 弱碱(蓝/绿) -> 强碱(黄)
      if (ph <= 2.5) return 'rgba(244, 63, 94, 0.85)'; // 玫瑰红
      if (ph <= 5.5) return 'rgba(217, 70, 239, 0.85)'; // 粉紫
      if (ph <= 7.5) return 'rgba(139, 92, 246, 0.85)'; // 紫色
      if (ph <= 9.5) return 'rgba(6, 182, 212, 0.85)'; // 青蓝
      if (ph <= 11.5) return 'rgba(34, 197, 94, 0.85)'; // 绿色
      return 'rgba(234, 179, 8, 0.85)'; // 黄色
    }
  };

  const getIndicatorNote = (ind: IndicatorType, ph: number) => {
    if (ind === 'litmus') {
      if (ph < 5) return '石蕊遇酸变【红】';
      if (ph > 8) return '石蕊遇碱变【蓝】';
      return '中性，石蕊呈原始【紫色】';
    } else if (ind === 'phenolphthalein') {
      if (ph >= 8.2) return '酚酞遇碱变【红色】';
      return '酸性/中性，酚酞【无色】';
    } else {
      if (ph <= 2.5) return '强酸：紫甘蓝呈【玫瑰红】';
      if (ph <= 5.5) return '弱酸：紫甘蓝呈【粉紫色】';
      if (ph <= 7.5) return '中性：紫甘蓝呈原色【紫色】';
      if (ph <= 9.5) return '弱碱：紫甘蓝呈【青蓝色】';
      if (ph <= 11.5) return '强碱：紫甘蓝呈【绿色】';
      return '极强碱：紫甘蓝呈【黄色】';
    }
  };

  const liquidColor = getLiquidColor(indicator, activePh);
  const indicatorNote = getIndicatorNote(indicator, activePh);

  return (
    <div className="w-full bg-[#111827] rounded-2xl overflow-hidden shadow-xl border border-gray-800 my-4 p-4 flex flex-col">
      <div className="text-center mb-3">
        <h4 className="text-pink-200 font-bold text-sm">pH 酸碱度与指示剂变色沙盒</h4>
        <p className="text-xs text-gray-400 mt-1">滴加不同化学指示剂，在试管中见证大自然变色的魔法</p>
      </div>

      {/* 待测液选择 Grid */}
      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {(Object.keys(substances) as SubstanceType[]).map((key) => (
          <button
            key={key}
            onClick={() => setSubstance(key)}
            className={`px-2 py-2 rounded-xl text-[10px] font-bold transition-all truncate ${
              substance === key
                ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {substances[key].name.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* 中间区：试管与指示剂选择 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* 左侧：精美试管可视化 */}
        <div className="flex flex-col items-center justify-center bg-gray-950/60 rounded-xl p-4 border border-gray-800 min-h-[220px]">
          <div className="relative w-12 h-36 border-2 border-gray-500 rounded-b-full flex items-end justify-center overflow-hidden bg-gray-900/40">
            {/* 试管口沿 */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-500 rounded-t-full"></div>
            
            {/* 试管内液体 */}
            <div
              className="w-full h-24 transition-all duration-700 rounded-b-full border-t border-white/20"
              style={{ backgroundColor: liquidColor }}
            >
              {/* 液面反光效果 */}
              <div className="absolute top-12 left-2 w-1.5 h-16 bg-white/10 rounded-full"></div>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="text-[10px] text-gray-400 font-mono">溶液 pH 值</span>
            <div className={`text-xl font-black font-mono mt-0.5 ${
              activePh < 7 ? 'text-red-400' : activePh > 7 ? 'text-blue-400' : 'text-purple-400'
            }`}>
              {activePh.toFixed(substance === 'custom' ? 1 : 0)}
            </div>
            <div className="text-[10px] text-gray-300 font-bold mt-1.5">{indicatorNote}</div>
          </div>
        </div>

        {/* 右侧：指示剂选择与 pH 表 */}
        <div className="bg-gray-950/40 rounded-xl p-3 border border-gray-800 flex flex-col justify-between h-full">
          <div>
            <span className="text-[10px] text-gray-400 font-bold block mb-2">🧪 选择化学指示剂：</span>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIndicator('litmus')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                  indicator === 'litmus'
                    ? 'border-purple-500 bg-purple-950/30 text-purple-300'
                    : 'border-gray-800 bg-gray-900 text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>紫色石蕊试液</span>
                <span className="text-[9px] font-normal">酸红碱蓝中紫</span>
              </button>
              
              <button
                onClick={() => setIndicator('phenolphthalein')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                  indicator === 'phenolphthalein'
                    ? 'border-pink-500 bg-pink-950/30 text-pink-300'
                    : 'border-gray-800 bg-gray-900 text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>无色酚酞试液</span>
                <span className="text-[9px] font-normal">碱红酸中无色</span>
              </button>

              <button
                onClick={() => setIndicator('cabbage')}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                  indicator === 'cabbage'
                    ? 'border-green-500 bg-green-950/30 text-green-300'
                    : 'border-gray-800 bg-gray-900 text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>自制紫甘蓝汁 🌟</span>
                <span className="text-[9px] font-normal">彩虹多段色</span>
              </button>
            </div>
          </div>

          {/* pH 轴条 */}
          <div className="mt-4">
            <span className="text-[9px] text-gray-500 font-mono block mb-1">0 ——— 酸性强 ——— 7 ——— 碱性强 ——— 14</span>
            <div className="h-2 w-full rounded-full bg-gradient-to-r from-red-500 via-purple-500 via-cyan-500 via-green-500 to-yellow-500 relative">
              {/* 指针 */}
              <div
                className="absolute -top-1 w-2.5 h-4 bg-white border border-gray-800 rounded shadow transition-all duration-300"
                style={{ left: `calc(${(activePh / 14) * 100}% - 5px)` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 自定义滑块 */}
      {substance === 'custom' && (
        <div className="mt-4 bg-gray-950/40 rounded-xl p-3 border border-gray-800 animate-in fade-in slide-in-from-top-1">
          <div className="flex justify-between items-center text-xs font-medium text-gray-300 mb-2">
            <span>🎚️ 连续调节 pH 值</span>
            <span className="text-indigo-400 font-bold font-mono">pH = {customPh.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="14"
            step="0.1"
            value={customPh}
            onChange={(e) => setCustomPh(Number(e.target.value))}
            className="w-full accent-indigo-500 bg-gray-800 rounded-lg h-2 cursor-pointer focus:outline-none"
          />
        </div>
      )}

      {/* 考点与规则 */}
      <div className="mt-3 p-3 rounded-xl border bg-slate-950/40 border-slate-800 text-xs leading-relaxed text-gray-300">
        <div className="font-bold text-amber-400 mb-1">⚠️ 中考 pH 试纸检测铁律：</div>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>绝对不能沾水！</strong> 沾水会稀释溶液，导致测出的酸性偏大（pH偏高），碱性偏小（pH偏低）。</li>
          <li><strong>绝对不能浸入溶液中！</strong> 这样会污染整瓶待测液。只能用干净玻璃棒蘸取，滴在试纸上。</li>
          <li><strong>读数必须是整数！</strong> pH 试纸属于粗略测量，比色只能得出 1~14 的整数读数。</li>
        </ul>
      </div>
    </div>
  );
}
