import { useState } from 'react';

type StructureType = 'diamond' | 'graphite' | 'c60';

export function CarbonStructure() {
  const [active, setActive] = useState<StructureType>('diamond');

  return (
    <div className="w-full bg-[#111827] rounded-2xl overflow-hidden shadow-xl border border-gray-800 my-4 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex justify-center gap-2">
        <button
          onClick={() => setActive('diamond')}
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
            active === 'diamond' ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          金刚石 (Diamond)
        </button>
        <button
          onClick={() => setActive('graphite')}
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
            active === 'graphite' ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          石墨 (Graphite)
        </button>
        <button
          onClick={() => setActive('c60')}
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
            active === 'c60' ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
        >
          C₆₀
        </button>
      </div>
      
      <div className="relative h-48 sm:h-64 flex items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black">
        {/* Diamond SVG Animation */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${active === 'diamond' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px] animate-[pulse_4s_ease-in-out_infinite]">
            <g stroke="#06b6d4" strokeWidth="3" fill="#22d3ee">
              <line x1="100" y1="40" x2="100" y2="100" />
              <line x1="100" y1="100" x2="40" y2="140" />
              <line x1="100" y1="100" x2="160" y2="140" />
              <line x1="100" y1="100" x2="100" y2="160" />
              
              <circle cx="100" cy="40" r="8" className="drop-shadow-[0_0_8px_#06b6d4]" />
              <circle cx="100" cy="100" r="10" className="drop-shadow-[0_0_8px_#06b6d4]" />
              <circle cx="40" cy="140" r="8" className="drop-shadow-[0_0_8px_#06b6d4]" />
              <circle cx="160" cy="140" r="8" className="drop-shadow-[0_0_8px_#06b6d4]" />
              <circle cx="100" cy="160" r="8" className="drop-shadow-[0_0_8px_#06b6d4]" />
            </g>
          </svg>
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p className="text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase">正四面体网状结构 → 极硬</p>
          </div>
        </div>

        {/* Graphite SVG Animation */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${active === 'graphite' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <div className="relative w-full h-full flex flex-col items-center justify-center space-y-6">
            <svg viewBox="0 0 200 60" className="w-48 h-auto animate-[bounce_3s_ease-in-out_infinite]">
              <g stroke="#f59e0b" strokeWidth="2" fill="none">
                <path d="M40,30 L60,15 L90,15 L110,30 L90,45 L60,45 Z" />
                <path d="M110,30 L130,15 L160,15 L180,30 L160,45 L130,45 Z" />
                <circle cx="40" cy="30" r="4" fill="#fbbf24" />
                <circle cx="60" cy="15" r="4" fill="#fbbf24" />
                <circle cx="90" cy="15" r="4" fill="#fbbf24" />
                <circle cx="110" cy="30" r="4" fill="#fbbf24" />
                <circle cx="90" cy="45" r="4" fill="#fbbf24" />
                <circle cx="60" cy="45" r="4" fill="#fbbf24" />
                <circle cx="130" cy="15" r="4" fill="#fbbf24" />
                <circle cx="160" cy="15" r="4" fill="#fbbf24" />
                <circle cx="180" cy="30" r="4" fill="#fbbf24" />
                <circle cx="160" cy="45" r="4" fill="#fbbf24" />
                <circle cx="130" cy="45" r="4" fill="#fbbf24" />
              </g>
            </svg>
            {/* Weak Van der Waals forces indicator */}
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-48 border-t-2 border-dashed border-gray-600 opacity-50"></div>
            
            <svg viewBox="0 0 200 60" className="w-48 h-auto animate-[bounce_3s_ease-in-out_infinite_reverse]">
              <g stroke="#f59e0b" strokeWidth="2" fill="none">
                <path d="M40,30 L60,15 L90,15 L110,30 L90,45 L60,45 Z" />
                <path d="M110,30 L130,15 L160,15 L180,30 L160,45 L130,45 Z" />
                <circle cx="40" cy="30" r="4" fill="#fbbf24" />
                <circle cx="60" cy="15" r="4" fill="#fbbf24" />
                <circle cx="90" cy="15" r="4" fill="#fbbf24" />
                <circle cx="110" cy="30" r="4" fill="#fbbf24" />
                <circle cx="90" cy="45" r="4" fill="#fbbf24" />
                <circle cx="60" cy="45" r="4" fill="#fbbf24" />
                <circle cx="130" cy="15" r="4" fill="#fbbf24" />
                <circle cx="160" cy="15" r="4" fill="#fbbf24" />
                <circle cx="180" cy="30" r="4" fill="#fbbf24" />
                <circle cx="160" cy="45" r="4" fill="#fbbf24" />
                <circle cx="130" cy="45" r="4" fill="#fbbf24" />
              </g>
            </svg>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p className="text-amber-400 text-xs font-mono font-bold tracking-widest uppercase">层状结构 (层间作用力弱) → 质软、滑腻</p>
          </div>
        </div>

        {/* C60 SVG Animation */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${active === 'c60' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <div className="relative w-32 h-32 rounded-full border-2 border-purple-500/30 flex items-center justify-center animate-[spin_10s_linear_infinite]">
            <svg viewBox="0 0 100 100" className="w-full h-full p-2">
              <g stroke="#a855f7" strokeWidth="1.5" fill="none">
                <circle cx="50" cy="50" r="40" />
                <path d="M50,10 L30,30 L30,70 L50,90 L70,70 L70,30 Z" />
                <path d="M10,50 L30,30 L70,30 L90,50 L70,70 L30,70 Z" />
                {/* Nodes */}
                <circle cx="50" cy="10" r="3" fill="#d8b4fe" />
                <circle cx="30" cy="30" r="3" fill="#d8b4fe" />
                <circle cx="70" cy="30" r="3" fill="#d8b4fe" />
                <circle cx="10" cy="50" r="3" fill="#d8b4fe" />
                <circle cx="90" cy="50" r="3" fill="#d8b4fe" />
                <circle cx="30" cy="70" r="3" fill="#d8b4fe" />
                <circle cx="70" cy="70" r="3" fill="#d8b4fe" />
                <circle cx="50" cy="90" r="3" fill="#d8b4fe" />
              </g>
            </svg>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p className="text-purple-400 text-xs font-mono font-bold tracking-widest uppercase">足球状分子 (由60个碳原子构成) → 分子晶体</p>
          </div>
        </div>
      </div>
    </div>
  );
}
