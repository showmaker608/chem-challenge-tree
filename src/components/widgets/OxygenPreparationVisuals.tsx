type OxygenRoutePreviewProps = {
  kind: 'peroxide' | 'heated';
};

export function OxygenRoutePreview({ kind }: OxygenRoutePreviewProps) {
  const isPeroxide = kind === 'peroxide';

  return (
    <div
      role="img"
      aria-label={isPeroxide
        ? '过氧化氢溶液和二氧化锰固体在常温下制取氧气的路线条件卡'
        : '高锰酸钾固体在加热条件下制取氧气的路线条件卡'}
      className={`flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br px-6 py-5 ${
        isPeroxide ? 'from-cyan-50 to-sky-100 text-cyan-950' : 'from-violet-50 to-fuchsia-100 text-violet-950'
      }`}
    >
      <div className="flex w-full max-w-sm items-center justify-center gap-2 sm:gap-4">
        <div className="min-w-0 flex-1 rounded-2xl border-2 border-current/20 bg-white/85 px-3 py-4 text-center shadow-sm">
          <div className="text-3xl">{isPeroxide ? '💧' : '🧂'}</div>
          <div className="mt-1 text-sm font-black">{isPeroxide ? 'H₂O₂ 溶液' : 'KMnO₄ 固体'}</div>
        </div>
        {isPeroxide && (
          <>
            <div className="text-xl font-black">＋</div>
            <div className="min-w-0 flex-1 rounded-2xl border-2 border-current/20 bg-white/85 px-3 py-4 text-center shadow-sm">
              <div className="text-3xl">⚫</div>
              <div className="mt-1 text-sm font-black">MnO₂ 固体</div>
            </div>
          </>
        )}
      </div>
      <div className={`rounded-full px-5 py-2 text-sm font-black ${isPeroxide ? 'bg-cyan-600 text-white' : 'bg-violet-600 text-white'}`}>
        {isPeroxide ? '常温 · 不加热' : '需要加热'}
      </div>
      <div className="text-xs font-bold opacity-65">先根据反应物状态和条件选择路线</div>
    </div>
  );
}

export function PeroxideGeneratorVisual() {
  return (
    <svg
      viewBox="0 0 620 330"
      role="img"
      aria-label="只显示分液漏斗、锥形瓶和导气管组成的空发生装置，不显示收集装置"
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id="generator-card-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#ecfeff" />
        </linearGradient>
      </defs>
      <rect width="620" height="330" rx="28" fill="url(#generator-card-bg)" />
      <rect x="24" y="22" width="180" height="34" rx="17" fill="#0e7490" />
      <text x="114" y="44" textAnchor="middle" fill="white" fontSize="14" fontWeight="800">本步骤只确认发生装置</text>

      <g transform="translate(116 20)">
        <path d="M154 26 h52 l-8 56 q-4 22-18 22 q-14 0-18-22z" fill="#dbeafe" stroke="#0369a1" strokeWidth="5" />
        <rect x="178" y="103" width="5" height="43" rx="2" fill="#bae6fd" stroke="#0369a1" strokeWidth="3" />
        <rect x="160" y="112" width="41" height="10" rx="5" fill="#334155" />
        <circle cx="180" cy="117" r="7" fill="#0891b2" />
        <path d="M180 146 v42" fill="none" stroke="#0369a1" strokeWidth="5" />

        <path d="M132 153 h96" stroke="#475569" strokeWidth="16" strokeLinecap="round" />
        <path d="M150 163 v34 l-62 82 q-10 15 8 15 h168 q18 0 8-15 l-62-82 v-34" fill="#e0f2fe" stroke="#334155" strokeWidth="6" strokeLinejoin="round" />
        <path d="M105 266 q75 24 150 0 l18 24 h-184z" fill="#bae6fd" fillOpacity="0.55" />
        <text x="180" y="250" textAnchor="middle" fill="#64748b" fontSize="14" fontWeight="800">空锥形瓶</text>

        <path d="M214 154 h34 q18 0 18 18 v12 h118 q20 0 20 20 v28" fill="none" stroke="#334155" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M214 154 h34 q18 0 18 18 v12 h118 q20 0 20 20 v28" fill="none" stroke="#bae6fd" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <g fill="#0f172a" fontSize="14" fontWeight="800">
        <text x="430" y="112">分液漏斗</text>
        <text x="430" y="132" fill="#0e7490" fontSize="12">有活塞，可控制滴速</text>
        <path d="M420 116 L326 130" stroke="#0e7490" strokeWidth="2" />
        <text x="400" y="296">导气管出口</text>
        <text x="400" y="316" fill="#64748b" fontSize="12">怎样收集，下一阶段再判断</text>
        <path d="M390 292 L516 253" stroke="#64748b" strokeWidth="2" strokeDasharray="6 5" />
      </g>
    </svg>
  );
}

function ConnectionVisual() {
  return (
    <svg viewBox="0 0 520 300" role="img" aria-label="玻璃导管和带孔橡皮塞尚未连接的局部图" className="h-auto w-full">
      <rect width="520" height="300" fill="#f8fafc" />
      <rect x="22" y="20" width="168" height="34" rx="17" fill="#0e7490" />
      <text x="106" y="42" textAnchor="middle" fill="white" fontSize="14" fontWeight="800">准备 1：部件尚未连接</text>
      <g transform="translate(62 92)">
        <rect x="0" y="38" width="170" height="26" rx="13" fill="#bae6fd" stroke="#0369a1" strokeWidth="5" />
        <rect x="15" y="44" width="135" height="8" rx="4" fill="white" fillOpacity="0.75" />
        <text x="84" y="96" textAnchor="middle" fill="#334155" fontSize="16" fontWeight="800">玻璃导管</text>
      </g>
      <path d="M300 110 h112 l30 94 h-172z" fill="#475569" stroke="#1e293b" strokeWidth="5" strokeLinejoin="round" />
      <ellipse cx="356" cy="134" rx="18" ry="11" fill="#f8fafc" stroke="#0f172a" strokeWidth="4" />
      <text x="356" y="238" textAnchor="middle" fill="#334155" fontSize="16" fontWeight="800">带孔橡皮塞</text>
      <path d="M235 143 H284" stroke="#0891b2" strokeWidth="4" strokeDasharray="7 7" />
      <text x="260" y="128" textAnchor="middle" fill="#0e7490" fontSize="24" fontWeight="900">?</text>
      <text x="260" y="278" textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="700">只观察待连接部件：怎样操作才省力又安全？</text>
    </svg>
  );
}

function LeakTestVisual() {
  return (
    <svg viewBox="0 0 520 300" role="img" aria-label="装药前的空发生装置和一杯水，尚未执行气密性检查" className="h-auto w-full">
      <rect width="520" height="300" fill="#f8fafc" />
      <rect x="22" y="20" width="166" height="34" rx="17" fill="#0e7490" />
      <text x="105" y="42" textAnchor="middle" fill="white" fontSize="14" fontWeight="800">准备 2：装药前检查</text>
      <g transform="translate(48 55)">
        <path d="M116 25 h42 l-7 45 q-3 18-14 18 q-11 0-14-18z" fill="#dbeafe" stroke="#0369a1" strokeWidth="4" />
        <path d="M137 88 v45" stroke="#0369a1" strokeWidth="4" />
        <path d="M100 119 h74" stroke="#475569" strokeWidth="13" strokeLinecap="round" />
        <path d="M112 128 v26 l-42 63 q-8 12 8 12 h120 q16 0 8-12 l-42-63 v-26" fill="#e0f2fe" stroke="#334155" strokeWidth="5" />
        <text x="138" y="197" textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="800">空装置</text>
        <path d="M166 120 h35 q16 0 16 16 v12 h126 q18 0 18 18 v24" fill="none" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
      </g>
      <g transform="translate(382 190)">
        <path d="M0 0 h92 l-9 68 h-74z" fill="#dbeafe" stroke="#0369a1" strokeWidth="4" />
        <path d="M6 25 h80 l-5 40 h-70z" fill="#7dd3fc" fillOpacity="0.58" />
        <text x="46" y="91" textAnchor="middle" fill="#334155" fontSize="14" fontWeight="800">一杯水</text>
      </g>
      <text x="424" y="125" textAnchor="middle" fill="#0e7490" fontSize="30" fontWeight="900">?</text>
      <text x="260" y="281" textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="700">现有材料已经摆出，但没有展示操作顺序和实验现象</text>
    </svg>
  );
}

function LoadingVisual() {
  return (
    <svg viewBox="0 0 520 300" role="img" aria-label="空发生装置旁放着过氧化氢溶液和二氧化锰固体，两种药品尚未接触" className="h-auto w-full">
      <rect width="520" height="300" fill="#f8fafc" />
      <rect x="22" y="20" width="176" height="34" rx="17" fill="#0e7490" />
      <text x="110" y="42" textAnchor="middle" fill="white" fontSize="14" fontWeight="800">准备 3：两种药品待装</text>
      <g transform="translate(48 57)">
        <path d="M96 20 h42 l-7 45 q-3 18-14 18 q-11 0-14-18z" fill="#dbeafe" stroke="#0369a1" strokeWidth="4" />
        <path d="M117 83 v49" stroke="#0369a1" strokeWidth="4" />
        <text x="117" y="48" textAnchor="middle" fill="#0e7490" fontSize="23" fontWeight="900">?</text>
        <path d="M80 118 h74" stroke="#475569" strokeWidth="13" strokeLinecap="round" />
        <path d="M92 127 v26 l-42 63 q-8 12 8 12 h120 q16 0 8-12 l-42-63 v-26" fill="#e0f2fe" stroke="#334155" strokeWidth="5" />
        <text x="117" y="197" textAnchor="middle" fill="#0e7490" fontSize="23" fontWeight="900">?</text>
        <path d="M146 119 h31 q16 0 16 16 v12 h79" fill="none" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
      </g>
      <g transform="translate(342 80)">
        <rect width="142" height="70" rx="16" fill="#e0f2fe" stroke="#0284c7" strokeWidth="3" />
        <text x="71" y="30" textAnchor="middle" fill="#0369a1" fontSize="18" fontWeight="900">H₂O₂ 溶液</text>
        <text x="71" y="52" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="700">液体</text>
        <rect y="90" width="142" height="70" rx="16" fill="#f1f5f9" stroke="#475569" strokeWidth="3" />
        <circle cx="54" cy="122" r="8" fill="#334155" />
        <circle cx="72" cy="116" r="7" fill="#0f172a" />
        <circle cx="88" cy="126" r="9" fill="#475569" />
        <text x="71" y="146" textAnchor="middle" fill="#334155" fontSize="16" fontWeight="900">MnO₂ 固体</text>
      </g>
      <text x="260" y="281" textAnchor="middle" fill="#64748b" fontSize="13" fontWeight="700">先判断分别装在哪里、何时让它们接触</text>
    </svg>
  );
}

const preparationCaptions = [
  '只显示玻璃导管和带孔橡皮塞的待连接状态，不展示操作答案。',
  '只提供装药前的空装置和可用材料，不提前画出气泡现象。',
  '两种药品仍在装置外，漏斗和锥形瓶中的位置等待你判断。',
];

export function PreparationEvidenceVisual({ step }: { step: number }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-sky-200 bg-white">
      {step === 0 ? <ConnectionVisual /> : step === 1 ? <LeakTestVisual /> : <LoadingVisual />}
      <div className="border-t border-slate-100 px-4 py-3 text-xs font-bold leading-5 text-slate-600">
        {preparationCaptions[step] ?? preparationCaptions[0]}
      </div>
    </div>
  );
}
