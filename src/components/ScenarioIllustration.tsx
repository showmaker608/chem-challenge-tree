type SceneType =
  | 'tombChange'
  | 'propertyTest'
  | 'measuring'
  | 'mountainAir'
  | 'oxygenSpark'
  | 'oxygenGenerator'
  | 'diffusion'
  | 'symbolCode'
  | 'hardWater'
  | 'electrolysis'
  | 'massConservation'
  | 'carbonReaction'
  | 'co2Lab'
  | 'coPoisoning'
  | 'fireControl'
  | 'rustAnchor'
  | 'metalActivity'
  | 'saturation'
  | 'decompression'
  | 'salineDilution'
  | 'acidCarbon'
  | 'quicklimeHeat'
  | 'neutralization'
  | 'indicator'
  | 'carbonateCoin'
  | 'saltPurify';

interface SceneMeta {
  type: SceneType;
  title: string;
  caption: string;
  accent: string;
  accent2: string;
  bg: string;
}

const SCENES: Record<string, SceneMeta> = {
  'ch1-n1': {
    type: 'tombChange',
    title: '古墓记录',
    caption: '食物腐烂：生成新物质',
    accent: '#f59e0b',
    accent2: '#22c55e',
    bg: '#1f2937',
  },
  'ch1-n2': {
    type: 'propertyTest',
    title: '性质鉴定',
    caption: '可燃性要通过反应体现',
    accent: '#fb7185',
    accent2: '#38bdf8',
    bg: '#111827',
  },
  'ch1-n3': {
    type: 'measuring',
    title: '精密量取',
    caption: '量程略大，读数水平',
    accent: '#38bdf8',
    accent2: '#fbbf24',
    bg: '#0f172a',
  },
  'ch2-n1': {
    type: 'mountainAir',
    title: '高空空气',
    caption: '空气中氧气约占 1/5',
    accent: '#60a5fa',
    accent2: '#f97316',
    bg: '#172554',
  },
  'ch2-n3': {
    type: 'oxygenSpark',
    title: '纯氧燃烧',
    caption: '铁丝剧烈燃烧，火星四射',
    accent: '#f97316',
    accent2: '#facc15',
    bg: '#111827',
  },
  'ch2-n4': {
    type: 'oxygenGenerator',
    title: '备用制氧',
    caption: 'MnO2 催化 H2O2 分解',
    accent: '#2dd4bf',
    accent2: '#a78bfa',
    bg: '#0f172a',
  },
  'ch2-n5': {
    type: 'oxygenGenerator',
    title: '氧气综合',
    caption: '制取、性质与实验安全',
    accent: '#2dd4bf',
    accent2: '#f97316',
    bg: '#0f172a',
  },
  'ch3-n1': {
    type: 'diffusion',
    title: '气味扩散',
    caption: '分子在不断运动',
    accent: '#c084fc',
    accent2: '#22d3ee',
    bg: '#111827',
  },
  'ch3-n5': {
    type: 'symbolCode',
    title: '元素密码',
    caption: '系数表示粒子个数',
    accent: '#818cf8',
    accent2: '#fbbf24',
    bg: '#1e1b4b',
  },
  'ch4-n2': {
    type: 'hardWater',
    title: '水垢危机',
    caption: '肥皂水鉴别硬水软水',
    accent: '#94a3b8',
    accent2: '#38bdf8',
    bg: '#0f172a',
  },
  'ch4-n3': {
    type: 'electrolysis',
    title: '电解制氧',
    caption: '负极氢气，正极氧气',
    accent: '#22d3ee',
    accent2: '#f472b6',
    bg: '#111827',
  },
  'ch4-n4': {
    type: 'electrolysis',
    title: '水的综合实验',
    caption: '电解、蒸发与组成判断',
    accent: '#22d3ee',
    accent2: '#f472b6',
    bg: '#111827',
  },
  'ch5-n1': {
    type: 'massConservation',
    title: '燃烧称量',
    caption: '先画清体系边界',
    accent: '#f97316',
    accent2: '#fbbf24',
    bg: '#1f2937',
  },
  'ch6-n2': {
    type: 'carbonReaction',
    title: '碳的反应',
    caption: '可燃性、还原性与稳定性',
    accent: '#f97316',
    accent2: '#facc15',
    bg: '#1f2937',
  },
  'ch6-n3': {
    type: 'co2Lab',
    title: 'CO2 检验',
    caption: '澄清石灰水变浑浊',
    accent: '#38bdf8',
    accent2: '#f8fafc',
    bg: '#0f172a',
  },
  'ch6-n4': {
    type: 'coPoisoning',
    title: '煤炉取暖',
    caption: 'CO 无色无味且有毒',
    accent: '#f97316',
    accent2: '#ef4444',
    bg: '#111827',
  },
  'ch6-n5': {
    type: 'co2Lab',
    title: '碳氧化物综合',
    caption: 'CO 与 CO2 鉴别除杂',
    accent: '#38bdf8',
    accent2: '#f8fafc',
    bg: '#0f172a',
  },
  'ch7-n1': {
    type: 'fireControl',
    title: '水攻灭火',
    caption: '降温到着火点以下',
    accent: '#fb923c',
    accent2: '#38bdf8',
    bg: '#1f2937',
  },
  'ch9-n3': {
    type: 'rustAnchor',
    title: '铁锚锈蚀',
    caption: '铁与氧气反应生成氧化物',
    accent: '#b45309',
    accent2: '#60a5fa',
    bg: '#172554',
  },
  'ch9-n5': {
    type: 'metalActivity',
    title: '金属活动性',
    caption: '置换反应验证强弱',
    accent: '#f59e0b',
    accent2: '#38bdf8',
    bg: '#111827',
  },
  'ch10-n2': {
    type: 'saturation',
    title: '死海盐水',
    caption: '不能继续溶解：饱和',
    accent: '#38bdf8',
    accent2: '#f8fafc',
    bg: '#0f172a',
  },
  'ch10-n3': {
    type: 'decompression',
    title: '深海减压',
    caption: '压强降低，气体溶解度减小',
    accent: '#22d3ee',
    accent2: '#a5f3fc',
    bg: '#083344',
  },
  'ch10-n4': {
    type: 'salineDilution',
    title: '生理盐水',
    caption: '加水稀释，溶质质量不变',
    accent: '#38bdf8',
    accent2: '#f8fafc',
    bg: '#0f172a',
  },
  'ch11-n1': {
    type: 'acidCarbon',
    title: '浓硫酸脱水',
    caption: '纸张炭化变黑',
    accent: '#111827',
    accent2: '#f97316',
    bg: '#3f2f1f',
  },
  'ch11-n2': {
    type: 'quicklimeHeat',
    title: '生石灰遇水',
    caption: 'CaO + H2O 放热',
    accent: '#f59e0b',
    accent2: '#f8fafc',
    bg: '#1f2937',
  },
  'ch11-n3': {
    type: 'neutralization',
    title: '无色中和',
    caption: '用指示剂或pH寻找反应证据',
    accent: '#facc15',
    accent2: '#22c55e',
    bg: '#14532d',
  },
  'ch11-n4': {
    type: 'indicator',
    title: '酸碱密信',
    caption: '紫甘蓝遇酸显红色',
    accent: '#a855f7',
    accent2: '#fb7185',
    bg: '#1e1b4b',
  },
  'ch12-n1': {
    type: 'carbonateCoin',
    title: '假银币鉴别',
    caption: '碳酸盐遇酸放出 CO2',
    accent: '#d1d5db',
    accent2: '#22d3ee',
    bg: '#111827',
  },
  'ch12-n2': {
    type: 'saltPurify',
    title: '粗盐提纯',
    caption: '沉淀除杂，过滤分离',
    accent: '#38bdf8',
    accent2: '#fbbf24',
    bg: '#0f172a',
  },
};

interface ScenarioIllustrationProps {
  nodeId: string;
  topic: string;
}

export function hasScenarioIllustration(nodeId: string): boolean {
  return Boolean(SCENES[nodeId]);
}

export function ScenarioIllustration({ nodeId, topic }: ScenarioIllustrationProps) {
  const scene = SCENES[nodeId];
  if (!scene) return null;

  return (
    <div className="relative h-40 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-lg">
      <svg viewBox="0 0 640 320" className="h-full w-full" role="img" aria-label={`${topic}场景插图`}>
        <defs>
          <linearGradient id={`bg-${nodeId}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={scene.bg} />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <radialGradient id={`glow-${nodeId}`} cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor={scene.accent} stopOpacity="0.45" />
            <stop offset="100%" stopColor={scene.accent} stopOpacity="0" />
          </radialGradient>
          <filter id={`soft-${nodeId}`}>
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <rect width="640" height="320" fill={`url(#bg-${nodeId})`} />
        <circle cx="430" cy="95" r="155" fill={`url(#glow-${nodeId})`} />
        <path d="M0 270 C130 230 230 292 360 250 C465 216 552 236 640 198 L640 320 L0 320 Z" fill="#020617" opacity="0.45" />
        <Artwork scene={scene} />
        <rect x="22" y="22" width="214" height="76" rx="16" fill="#020617" opacity="0.72" />
        <text x="42" y="54" fill="#f8fafc" fontSize="22" fontWeight="800" fontFamily="system-ui, sans-serif">
          {scene.title}
        </text>
        <text x="42" y="82" fill="#cbd5e1" fontSize="15" fontWeight="600" fontFamily="system-ui, sans-serif">
          {scene.caption}
        </text>
      </svg>
    </div>
  );
}

function Artwork({ scene }: { scene: SceneMeta }) {
  switch (scene.type) {
    case 'tombChange':
      return (
        <g>
          <path d="M320 250 L365 120 L410 250 Z" fill="#475569" />
          <rect x="365" y="150" width="110" height="100" rx="8" fill="#334155" />
          <circle cx="445" cy="186" r="18" fill="#64748b" />
          <ellipse cx="480" cy="250" rx="86" ry="18" fill="#0f172a" />
          <circle cx="488" cy="218" r="26" fill={scene.accent2} opacity="0.8" />
          <path d="M470 214 C490 190 516 210 500 235 C482 240 462 232 470 214 Z" fill="#84cc16" opacity="0.75" />
          <circle cx="525" cy="209" r="6" fill="#bef264" />
          <circle cx="538" cy="232" r="4" fill="#bef264" />
        </g>
      );
    case 'propertyTest':
      return (
        <g>
          <rect x="330" y="132" width="54" height="110" rx="10" fill="#38bdf8" opacity="0.5" />
          <rect x="410" y="122" width="54" height="120" rx="10" fill="#f8fafc" opacity="0.58" />
          <rect x="490" y="126" width="54" height="116" rx="10" fill="#fef3c7" opacity="0.72" />
          <path d="M515 132 C490 168 556 171 522 238 C568 202 565 160 515 132 Z" fill={scene.accent} />
          <path d="M521 165 C505 190 542 195 522 226 C548 203 548 180 521 165 Z" fill="#facc15" />
          <line x1="320" y1="246" x2="565" y2="246" stroke="#94a3b8" strokeWidth="6" />
        </g>
      );
    case 'measuring':
      return (
        <g>
          <rect x="390" y="72" width="88" height="188" rx="18" fill="#dbeafe" opacity="0.25" stroke="#e0f2fe" strokeWidth="4" />
          <rect x="402" y="166" width="64" height="82" rx="10" fill={scene.accent} opacity="0.72" />
          {[0, 1, 2, 3, 4, 5].map(i => (
            <line key={i} x1={466} y1={92 + i * 28} x2={446} y2={92 + i * 28} stroke="#e0f2fe" strokeWidth="3" />
          ))}
          <line x1="378" y1="166" x2="500" y2="166" stroke={scene.accent2} strokeWidth="4" strokeDasharray="8 8" />
          <circle cx="434" cy="255" r="18" fill="#e0f2fe" opacity="0.8" />
        </g>
      );
    case 'mountainAir':
      return (
        <g>
          <path d="M280 255 L390 80 L500 255 Z" fill="#64748b" />
          <path d="M360 255 L460 110 L590 255 Z" fill="#475569" />
          <path d="M390 80 L414 120 L370 118 Z" fill="#f8fafc" />
          <circle cx="500" cy="96" r="38" fill={scene.accent2} opacity="0.88" />
          <rect x="505" y="190" width="34" height="62" rx="14" fill="#e0f2fe" />
          <path d="M330 118 C405 100 452 105 530 86" stroke={scene.accent} strokeWidth="4" fill="none" strokeDasharray="10 12" />
        </g>
      );
    case 'oxygenSpark':
      return (
        <g>
          <rect x="310" y="210" width="180" height="28" rx="12" fill="#475569" />
          <path d="M405 208 L478 118" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round" />
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <path key={i} d={`M480 122 L${430 + i * 22} ${55 + (i % 3) * 34}`} stroke={i % 2 ? scene.accent : scene.accent2} strokeWidth="5" strokeLinecap="round" />
          ))}
          <circle cx="480" cy="122" r="22" fill={scene.accent2} opacity="0.78" />
          <circle cx="480" cy="122" r="12" fill="#fff7ed" />
        </g>
      );
    case 'oxygenGenerator':
      return (
        <g>
          <path d="M318 240 C310 170 358 124 400 154 C445 188 500 124 540 178 C568 216 536 252 474 254 Z" fill="#0f766e" opacity="0.75" />
          <rect x="360" y="126" width="94" height="122" rx="28" fill="#ccfbf1" opacity="0.28" stroke="#99f6e4" strokeWidth="4" />
          <circle cx="405" cy="214" r="20" fill={scene.accent} />
          <circle cx="440" cy="190" r="10" fill="#f8fafc" opacity="0.9" />
          <circle cx="462" cy="160" r="8" fill="#f8fafc" opacity="0.75" />
          <path d="M454 132 C520 118 548 142 560 92" stroke={scene.accent2} strokeWidth="7" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'diffusion':
      return (
        <g>
          <rect x="320" y="82" width="130" height="172" rx="10" fill="#334155" />
          <rect x="350" y="118" width="70" height="84" rx="8" fill="#0f172a" stroke="#64748b" strokeWidth="4" />
          <circle cx="438" cy="170" r="5" fill="#f8fafc" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <circle key={i} cx={470 + i * 14} cy={120 + (i % 4) * 34} r={6 - (i % 3)} fill={i % 2 ? scene.accent : scene.accent2} opacity="0.8" />
          ))}
          <path d="M450 152 C505 132 545 142 594 105" stroke={scene.accent2} strokeWidth="3" fill="none" strokeDasharray="6 9" />
        </g>
      );
    case 'symbolCode':
      return (
        <g>
          {['H', '2H', 'H2'].map((label, i) => (
            <g key={label} transform={`translate(${318 + i * 88},118)`}>
              <rect width="68" height="86" rx="12" fill="#312e81" stroke={i === 1 ? scene.accent2 : scene.accent} strokeWidth="4" />
              <text x="34" y="54" fill="#f8fafc" textAnchor="middle" fontSize="26" fontWeight="900" fontFamily="ui-monospace, monospace">
                {label}
              </text>
            </g>
          ))}
          <path d="M336 230 L560 230" stroke="#818cf8" strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case 'hardWater':
      return (
        <g>
          <path d="M335 115 H480 L460 245 H360 Z" fill="#cbd5e1" opacity="0.34" stroke="#e2e8f0" strokeWidth="4" />
          <path d="M360 210 C390 185 430 230 460 202 L455 240 H365 Z" fill={scene.accent} opacity="0.6" />
          <path d="M382 126 C430 144 450 116 492 136" stroke="#f8fafc" strokeWidth="7" fill="none" strokeLinecap="round" />
          <circle cx="510" cy="154" r="20" fill="#e2e8f0" opacity="0.68" />
          <circle cx="540" cy="126" r="12" fill="#f8fafc" opacity="0.62" />
          <circle cx="523" cy="105" r="8" fill="#f8fafc" opacity="0.62" />
        </g>
      );
    case 'electrolysis':
      return (
        <g>
          <rect x="324" y="114" width="202" height="122" rx="20" fill="#0e7490" opacity="0.45" stroke="#67e8f9" strokeWidth="4" />
          <line x1="376" y1="92" x2="376" y2="224" stroke="#f472b6" strokeWidth="8" />
          <line x1="474" y1="92" x2="474" y2="224" stroke="#38bdf8" strokeWidth="8" />
          {[0, 1, 2].map(i => <circle key={`h-${i}`} cx={356 + i * 17} cy={96 - i * 15} r="8" fill="#f8fafc" opacity="0.82" />)}
          {[0, 1].map(i => <circle key={`o-${i}`} cx={466 + i * 18} cy={98 - i * 19} r="8" fill="#f8fafc" opacity="0.82" />)}
          <path d="M352 245 H500" stroke="#a5f3fc" strokeWidth="6" strokeLinecap="round" />
        </g>
      );
    case 'massConservation':
      return (
        <g>
          <line x1="420" y1="92" x2="420" y2="246" stroke="#94a3b8" strokeWidth="8" />
          <path d="M334 145 H506" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />
          <path d="M342 145 L308 220 H378 Z" fill="#1f2937" stroke="#cbd5e1" strokeWidth="4" />
          <path d="M498 145 L464 220 H534 Z" fill="#1f2937" stroke="#cbd5e1" strokeWidth="4" />
          <path d="M498 180 C478 204 523 208 502 232 C538 207 540 185 498 180 Z" fill={scene.accent} />
          <path d="M285 150 C316 136 342 136 376 150" stroke={scene.accent2} strokeWidth="5" fill="none" strokeDasharray="8 8" />
        </g>
      );
    case 'carbonReaction':
      return (
        <g>
          <rect x="316" y="208" width="230" height="30" rx="12" fill="#334155" />
          <path d="M372 180 C344 220 414 224 376 258 C430 226 430 196 372 180 Z" fill={scene.accent} />
          <path d="M420 160 C392 216 486 222 430 270 C500 228 498 184 420 160 Z" fill={scene.accent2} />
          <rect x="470" y="114" width="82" height="118" rx="18" fill="#dbeafe" opacity="0.22" stroke="#e2e8f0" strokeWidth="4" />
          <rect x="486" y="178" width="48" height="34" rx="6" fill="#020617" opacity="0.88" />
          <circle cx="502" cy="162" r="14" fill="#b45309" opacity="0.9" />
          <circle cx="522" cy="162" r="14" fill="#b45309" opacity="0.9" />
          <path d="M455 92 C500 78 542 90 572 62" stroke="#f8fafc" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.62" />
        </g>
      );
    case 'co2Lab':
      return (
        <g>
          <path d="M330 218 H474 L456 258 H348 Z" fill="#dbeafe" opacity="0.24" stroke="#e0f2fe" strokeWidth="4" />
          <path d="M346 214 C386 190 420 232 458 202 L454 250 H350 Z" fill={scene.accent2} opacity="0.78" />
          <path d="M484 100 C454 142 524 142 492 196 C545 160 536 122 484 100 Z" fill={scene.accent} opacity="0.85" />
          <path d="M446 196 C498 186 542 196 572 224" stroke="#e0f2fe" strokeWidth="8" fill="none" strokeLinecap="round" />
          {[0, 1, 2, 3, 4].map(i => (
            <circle key={i} cx={374 + i * 22} cy={220 + (i % 2) * 14} r="7" fill="#94a3b8" opacity="0.85" />
          ))}
          <path d="M330 118 H442" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
          <text x="386" y="150" fill="#e0f2fe" textAnchor="middle" fontSize="18" fontWeight="800" fontFamily="system-ui, sans-serif">CO2</text>
        </g>
      );
    case 'coPoisoning':
      return (
        <g>
          <ellipse cx="430" cy="240" rx="88" ry="22" fill="#020617" opacity="0.7" />
          <path d="M362 180 H500 L478 244 H384 Z" fill="#292524" stroke="#78716c" strokeWidth="5" />
          <path d="M410 184 C390 214 438 215 412 244 C454 220 457 198 410 184 Z" fill={scene.accent} />
          <path d="M455 176 C438 204 482 210 456 238 C500 212 496 190 455 176 Z" fill="#facc15" />
          <path d="M385 116 C420 90 454 126 486 94" stroke="#94a3b8" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.7" />
          <circle cx="538" cy="126" r="24" fill={scene.accent2} opacity="0.82" />
        </g>
      );
    case 'fireControl':
      return (
        <g>
          <path d="M356 180 C326 220 390 225 358 260 C414 226 410 194 356 180 Z" fill={scene.accent} />
          <path d="M424 160 C386 220 472 224 430 268 C500 224 492 186 424 160 Z" fill="#facc15" />
          <path d="M308 84 C400 118 470 130 570 108" stroke={scene.accent2} strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.9" />
          <path d="M310 108 C405 142 466 150 558 132" stroke="#e0f2fe" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'rustAnchor':
      return (
        <g>
          <path d="M420 70 V216" stroke="#94a3b8" strokeWidth="18" strokeLinecap="round" />
          <path d="M342 180 C352 252 488 252 498 180" stroke="#94a3b8" strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d="M366 178 L330 176 M474 178 L510 176" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round" />
          {[0, 1, 2, 3, 4, 5].map(i => <circle key={i} cx={374 + i * 25} cy={145 + (i % 3) * 34} r="9" fill={scene.accent} opacity="0.9" />)}
          <path d="M302 238 C385 218 460 264 548 230" stroke={scene.accent2} strokeWidth="8" fill="none" opacity="0.65" />
        </g>
      );
    case 'metalActivity':
      return (
        <g>
          <rect x="312" y="110" width="98" height="150" rx="16" fill="#dbeafe" opacity="0.24" stroke="#e0f2fe" strokeWidth="4" />
          <rect x="444" y="110" width="98" height="150" rx="16" fill="#dbeafe" opacity="0.24" stroke="#e0f2fe" strokeWidth="4" />
          <path d="M326 205 C356 182 386 216 398 194 L398 248 H326 Z" fill={scene.accent2} opacity="0.68" />
          <path d="M458 205 C488 182 518 216 530 194 L530 248 H458 Z" fill="#60a5fa" opacity="0.62" />
          <path d="M358 74 L358 224" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
          <path d="M490 74 L490 224" stroke="#b45309" strokeWidth="12" strokeLinecap="round" />
          <circle cx="352" cy="186" r="8" fill="#f8fafc" opacity="0.82" />
          <circle cx="376" cy="172" r="6" fill="#f8fafc" opacity="0.72" />
          <rect x="474" y="190" width="42" height="20" rx="5" fill={scene.accent} opacity="0.9" />
          <path d="M300 82 H552" stroke="#64748b" strokeWidth="5" strokeDasharray="10 10" opacity="0.65" />
        </g>
      );
    case 'saturation':
      return (
        <g>
          <rect x="348" y="82" width="150" height="178" rx="20" fill="#bae6fd" opacity="0.25" stroke="#e0f2fe" strokeWidth="4" />
          <path d="M365 180 C400 160 430 195 480 175 L480 242 H365 Z" fill={scene.accent} opacity="0.72" />
          {[0, 1, 2, 3, 4].map(i => (
            <rect key={i} x={370 + i * 25} y={229 - (i % 2) * 15} width="22" height="22" rx="4" fill={scene.accent2} opacity="0.9" />
          ))}
          <path d="M520 100 L564 132 L536 172 L492 140 Z" fill="#f8fafc" opacity="0.82" />
        </g>
      );
    case 'decompression':
      return (
        <g>
          <path d="M330 230 C380 210 442 252 548 214" stroke={scene.accent2} strokeWidth="9" fill="none" opacity="0.7" />
          <circle cx="430" cy="150" r="38" fill="#0f172a" stroke="#a5f3fc" strokeWidth="7" />
          <rect x="400" y="188" width="62" height="66" rx="22" fill="#164e63" stroke="#67e8f9" strokeWidth="5" />
          {[0, 1, 2, 3, 4, 5].map(i => <circle key={i} cx={495 + i * 18} cy={190 - i * 22} r={9 - (i % 3)} fill="#f8fafc" opacity="0.78" />)}
          <path d="M300 100 H548" stroke="#38bdf8" strokeWidth="4" strokeDasharray="10 10" opacity="0.6" />
        </g>
      );
    case 'salineDilution':
      return (
        <g>
          <rect x="342" y="84" width="92" height="150" rx="18" fill="#dbeafe" opacity="0.3" stroke="#e0f2fe" strokeWidth="4" />
          <rect x="356" y="158" width="64" height="64" rx="10" fill={scene.accent} opacity="0.65" />
          <path d="M468 92 C520 126 530 174 496 220 C462 174 476 126 468 92 Z" fill="#e0f2fe" opacity="0.85" />
          <path d="M474 204 L398 162" stroke="#e0f2fe" strokeWidth="8" strokeLinecap="round" />
          <circle cx="388" cy="242" r="13" fill="#f8fafc" opacity="0.85" />
        </g>
      );
    case 'acidCarbon':
      return (
        <g>
          <rect x="332" y="92" width="165" height="140" rx="12" fill="#fde68a" opacity="0.82" />
          <path d="M370 130 C434 106 458 150 430 194 C392 216 344 184 370 130 Z" fill="#020617" opacity="0.86" />
          <path d="M516 92 C486 132 548 132 520 184 C565 148 558 116 516 92 Z" fill={scene.accent2} />
          <path d="M316 248 H535" stroke="#92400e" strokeWidth="8" strokeLinecap="round" />
        </g>
      );
    case 'quicklimeHeat':
      return (
        <g>
          <path d="M338 198 H456 L476 258 H318 Z" fill="#d6d3d1" stroke="#f8fafc" strokeWidth="4" />
          <path d="M344 198 L366 116 H432 L456 198 Z" fill="#f5f5f4" opacity="0.9" />
          <path d="M430 120 C470 96 492 132 472 164" stroke="#e5e7eb" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.9" />
          <path d="M392 168 C378 198 424 202 398 236 C438 208 440 184 392 168 Z" fill={scene.accent} />
          <rect x="504" y="168" width="56" height="72" rx="8" fill="#78350f" stroke="#fbbf24" strokeWidth="4" />
        </g>
      );
    case 'neutralization':
      return (
        <g>
          <path d="M320 210 C374 164 448 166 520 206 L500 248 H344 Z" fill="#f9a8d4" opacity="0.85" />
          <path d="M454 96 L482 142 L426 142 Z" fill={scene.accent} />
          <path d="M462 142 L438 204" stroke="#111827" strokeWidth="5" strokeLinecap="round" />
          <circle cx="430" cy="188" r="15" fill="#ef4444" opacity="0.8" />
          <path d="M360 112 C400 126 422 144 440 180" stroke={scene.accent2} strokeWidth="9" fill="none" strokeLinecap="round" />
          <circle cx="350" cy="108" r="18" fill="#bbf7d0" opacity="0.9" />
        </g>
      );
    case 'indicator':
      return (
        <g>
          <rect x="330" y="92" width="165" height="126" rx="10" fill="#f8fafc" opacity="0.9" />
          <path d="M362 142 C392 124 430 158 468 136" stroke={scene.accent2} strokeWidth="10" fill="none" strokeLinecap="round" />
          <path d="M500 92 L560 118 L530 162 L470 136 Z" fill={scene.accent} opacity="0.88" />
          {[0, 1, 2, 3].map(i => <circle key={i} cx={456 + i * 18} cy={158 + i * 12} r="7" fill={i % 2 ? scene.accent2 : scene.accent} opacity="0.9" />)}
          <path d="M328 232 H500" stroke="#c4b5fd" strokeWidth="6" strokeLinecap="round" />
        </g>
      );
    case 'carbonateCoin':
      return (
        <g>
          <circle cx="404" cy="174" r="68" fill={scene.accent} opacity="0.84" stroke="#f8fafc" strokeWidth="5" />
          <circle cx="404" cy="174" r="42" fill="#94a3b8" opacity="0.5" />
          <path d="M500 98 C474 142 542 142 510 196 C562 160 552 122 500 98 Z" fill="#38bdf8" opacity="0.82" />
          {[0, 1, 2, 3].map(i => <circle key={i} cx={470 + i * 22} cy={202 - i * 20} r={10 - i} fill="#f8fafc" opacity="0.78" />)}
          <path d="M340 246 H530" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
        </g>
      );
    case 'saltPurify':
      return (
        <g>
          <path d="M342 82 H500 L440 166 V244 H402 V166 Z" fill="#dbeafe" opacity="0.3" stroke="#e0f2fe" strokeWidth="4" />
          <path d="M366 110 H478 L430 154 H414 Z" fill={scene.accent2} opacity="0.7" />
          <rect x="382" y="220" width="82" height="34" rx="8" fill={scene.accent} opacity="0.7" />
          {[0, 1, 2, 3].map(i => <circle key={i} cx={376 + i * 36} cy={134 + (i % 2) * 16} r="8" fill="#f8fafc" opacity="0.78" />)}
          <path d="M500 112 C540 138 544 196 508 230" stroke="#94a3b8" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="9 10" />
        </g>
      );
    default:
      return null;
  }
}
