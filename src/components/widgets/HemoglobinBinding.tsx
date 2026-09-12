import { useState } from 'react';

export function HemoglobinBinding() {
  const [o2Bound, setO2Bound] = useState(false);
  const [coBound, setCoBound] = useState(false);

  return (
    <div className="w-full bg-[#1e1b4b] rounded-2xl overflow-hidden shadow-xl border border-indigo-900 my-4 p-5">
      <div className="text-center mb-4">
        <h4 className="text-indigo-200 font-bold text-sm">一氧化碳中毒机理演示</h4>
        <p className="text-xs text-indigo-400 mt-1">尝试分别让 O₂ 和 CO 结合血红蛋白</p>
      </div>
      
      <div className="relative h-48 flex items-center justify-center">
        {/* Hemoglobin */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className={`w-24 h-24 rounded-3xl transition-all duration-700 flex items-center justify-center ${coBound ? 'bg-rose-900/80 border-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.6)]' : o2Bound ? 'bg-emerald-900/80 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.6)]' : 'bg-indigo-900/50 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'} border-2`}>
            <div className="text-white font-black text-xl">Hb</div>
            <div className="text-[0.6rem] text-white/70 absolute bottom-2">血红蛋白</div>
          </div>
        </div>

        {/* O2 Molecule */}
        <div className={`absolute transition-all duration-700 cursor-pointer hover:scale-110 flex items-center ${o2Bound ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0' : coBound ? 'top-8 left-8 opacity-50' : 'top-1/2 left-8 -translate-y-1/2'}`}
             onClick={() => { if (!coBound) setO2Bound(true); }}>
          <div className="flex bg-sky-500 rounded-full px-2 py-1 text-white text-xs font-bold shadow-[0_0_10px_rgba(14,165,233,0.8)] z-20">O₂</div>
        </div>

        {/* CO Molecule */}
        <div className={`absolute transition-all duration-700 cursor-pointer hover:scale-110 flex items-center ${coBound ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0' : 'top-1/2 right-8 -translate-y-1/2'}`}
             onClick={() => { setCoBound(true); setO2Bound(false); }}>
          <div className="flex bg-rose-500 rounded-full px-2 py-1 text-white text-xs font-bold shadow-[0_0_10px_rgba(244,63,94,0.8)] z-20">CO</div>
        </div>

        {/* Effects */}
        {o2Bound && !coBound && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-emerald-400 font-bold text-sm absolute top-4 animate-bounce">正常运输氧气 ✓</div>
          </div>
        )}
        
        {coBound && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-rose-400 font-bold text-sm absolute top-4 animate-pulse">死死结合！结合力是O₂的200倍 ☠️</div>
            <div className="text-rose-300 text-xs absolute bottom-4">血红蛋白丧失运氧能力 → 组织缺氧</div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <button 
          onClick={() => { setO2Bound(false); setCoBound(false); }}
          className="px-4 py-1.5 bg-indigo-900/50 hover:bg-indigo-800 text-indigo-300 text-xs font-bold rounded-full transition-colors border border-indigo-700"
        >
          重置状态
        </button>
      </div>
    </div>
  );
}
