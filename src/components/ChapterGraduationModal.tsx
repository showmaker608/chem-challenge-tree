import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { Chapter } from '../types';

interface ChapterGraduationModalProps {
  chapter: Chapter;
  onClose: () => void;
}

interface GraduationInfo {
  badgeName: string;
  badgeEmoji: string;
  badgeColor: string; // Tailwind css gradient class
  description: string;
  teacherNote: string;
}

const GRADUATION_DATABASE: Record<string, GraduationInfo> = {
  ch1: {
    badgeName: '走进化学世界殿堂徽章',
    badgeEmoji: '🔬',
    badgeColor: 'from-violet-500 via-purple-500 to-indigo-600',
    description: '恭喜你！成功迈入神奇的化学殿堂，并完美掌握了实验仪器操作、物理化学性质差异与实验室安全准则！',
    teacherNote: '“万物皆化学。每一次仔细的读数与严谨的操作，都是探索物质世界的起点。加油，未来的科学家！” —— 坤哥',
  },
  ch2: {
    badgeName: '元素御风者徽章',
    badgeEmoji: '🌬️',
    badgeColor: 'from-cyan-400 via-blue-500 to-indigo-500',
    description: '太棒了！你成功探索了空气的奥秘，攻克了红磷测氧体积分数、氧气制备及纯净物/混合物的核心考点！',
    teacherNote: '“空气无形，却蕴含无穷奥秘。分清纯净物与混合物是化学入门的第一道坎，你完成得非常漂亮！” —— 坤哥',
  },
  ch3: {
    badgeName: '微观造物主徽章',
    badgeEmoji: '🔮',
    badgeColor: 'from-purple-400 via-pink-500 to-rose-500',
    description: '解密物质构成的奥秘！你已经能够深入原子、分子、离子的微观世界，点亮了元素周期表和化学式书写技能！',
    teacherNote: '“从宏观现象走入微观世界，是化学思维的第一次飞跃。你已经拥有了一双透视物质微观结构的眼睛！” —— 坤哥',
  },
  ch4: {
    badgeName: '水之源治水者徽章',
    badgeEmoji: '💧',
    badgeColor: 'from-teal-400 via-emerald-500 to-cyan-500',
    description: '深入探究自然界的水，你成功攻克了水的电解微观图景、水的净化与硬水/软水判定，完成了宏微结合！',
    teacherNote: '“水善利万物而不争。电解水实验是中考高频压轴，你已经完美掌握了宏观现象与微观本质的化学联觉！” —— 坤哥',
  },
  ch5: {
    badgeName: '天平平衡律法徽章',
    badgeEmoji: '⚖️',
    badgeColor: 'from-amber-400 via-orange-500 to-rose-500',
    description: '征服质量守恒定律与化学方程式！你熟练掌握了化学变化的定量规律、化学方程式的配平与中考级综合计算！',
    teacherNote: '“质量守恒是化学定量的黄金定律。化学方程式是化学的特殊语言，配平与计算不仅需要细心，更需要逻辑！” —— 坤哥',
  },
  ch6: {
    badgeName: '金刚石之星徽章',
    badgeEmoji: '💎',
    badgeColor: 'from-slate-400 via-zinc-600 to-slate-800',
    description: '探索碳单质与碳的氧化物，你成功掌握了同素异形体的“结构决定性质”真理，以及二氧化碳的实验室制备！',
    teacherNote: '“碳是生命的基础。从最软的石墨到最硬的金刚石，同种元素的不同单质展现了结构决定性质的真理！” —— 坤哥',
  },
  ch7: {
    badgeName: '不灭薪火徽章',
    badgeEmoji: '🔥',
    badgeColor: 'from-rose-400 via-red-500 to-orange-600',
    description: '点燃燃料与燃烧的核心要领，熟练掌握了燃烧的三个要素、灭火原理以及新能源开发与环境保护！',
    teacherNote: '“野火烧不尽，春风吹又生。燃烧是剧烈的化学反应，能利用火并掌控火，是人类文明演进的里程碑！” —— 坤哥',
  },
  ch8: {
    badgeName: '熔炉钢印勋章',
    badgeEmoji: '🛡️',
    badgeColor: 'from-amber-500 via-yellow-600 to-orange-700',
    description: '征服金属材料章节！深入掌握了合金的优良物理性质、铁的冶炼原理以及金属活动性顺序的探究与判定！',
    teacherNote: '“真金不怕火炼。熟练运用金属活动性顺序表去探究酸盐反应，是中考金属探究大题拿高分的核心！” —— 坤哥',
  },
  ch9: {
    badgeName: '熔剂之王勋章',
    badgeEmoji: '🧪',
    badgeColor: 'from-teal-500 via-cyan-600 to-emerald-600',
    description: '完美通关溶液章节！攻克了溶解度的概念细节、溶解度曲线读数计算、溶液配制实验以及溶质质量分数换算！',
    teacherNote: '“溶液配制是高频实验。计算、量取和溶解，每一步都考验严谨性。你已经掌握了关键方法！” —— 坤哥',
  },
  ch10: {
    badgeName: '极化阴阳双子徽章',
    badgeEmoji: '🌋',
    badgeColor: 'from-purple-500 via-red-600 to-indigo-600',
    description: '征服酸和碱！深度搞定酸碱指示剂变化、常见酸碱（稀盐酸、浓硫酸、氢氧化钠、氢氧化钙）的特有性质与中和滴定！',
    teacherNote: '“酸碱电离释放的 $H^+$ 与 $OH^-$ 碰撞生成水。中和滴定是初中化学的集大成者，你已经踏上了化学高地！” —— 坤哥',
  },
  ch11: {
    badgeName: '晶格丰收勋章',
    badgeEmoji: '🌾',
    badgeColor: 'from-emerald-400 via-teal-500 to-lime-600',
    description: '完美通关盐和化肥！熟练掌握了常见盐的溶解性、复分解反应发生的条件判定、粗盐提纯实验与科学施肥！',
    teacherNote: '“盐不仅是食盐，更是千变万化的复分解反应舞台。理清沉淀生成的条件，你就能在化学迷宫中游刃有余！” —— 坤哥',
  },
};

const DEFAULT_GRADUATION_INFO: GraduationInfo = {
  badgeName: '化学避坑大师徽章',
  badgeEmoji: '🏆',
  badgeColor: 'from-amber-400 via-orange-500 to-teal-500',
  description: '恭喜你完成本章节的全部知识闯关！你在化学探索之旅中又迈出了坚实的一步！',
  teacherNote: '“优秀是一种习惯。恭喜你攻克本章难关，继续保持对化学的探索与好奇心，我们下一关见！” —— 坤哥',
};

// 胜利通关 Web Audio API 音效合成器
function playGraduationVictoryFanfare() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const t = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'triangle', volume = 0.1) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      
      gainNode.gain.setValueAtTime(volume, start);
      gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    // 演奏高大上的多声部升华琶音
    // C4 - E4 - G4 - C5 - E5 - G5 - C6
    const baseNotes = [261.63, 329.63, 392.00, 523.25, 659.25, 784.00, 1046.50];
    baseNotes.forEach((freq, idx) => {
      // 快速交错琶音
      playTone(freq, t + idx * 0.07, 0.5, 'triangle', 0.08);
      // 双声部伴奏：高八度超细微微晶音色
      if (idx >= 3) {
        playTone(freq * 1.5, t + idx * 0.07 + 0.02, 0.4, 'sine', 0.03);
      }
    });

    // 终局和弦 C5 (523.25) + E5 (659.25) + G5 (784.00) + C6 (1046.50) 
    const finalChordStart = t + baseNotes.length * 0.07 + 0.1;
    playTone(523.25, finalChordStart, 1.2, 'triangle', 0.07);
    playTone(659.25, finalChordStart, 1.2, 'triangle', 0.07);
    playTone(784.00, finalChordStart, 1.2, 'triangle', 0.07);
    playTone(1046.50, finalChordStart, 1.5, 'sine', 0.05);

    // 闭合
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 3000);
  } catch (e) {
    // 浏览器不支持或禁止了自动播放
  }
}

export function ChapterGraduationModal({ chapter, onClose }: ChapterGraduationModalProps) {
  const info = GRADUATION_DATABASE[chapter.id] || {
    ...DEFAULT_GRADUATION_INFO,
    badgeEmoji: chapter.icon || DEFAULT_GRADUATION_INFO.badgeEmoji,
    badgeName: `${chapter.name}探索之星勋章`,
  };

  const badgeRef = useRef<HTMLDivElement>(null);

  // 1. canvas-confetti 爆燃多巴胺粒子喷洒
  useEffect(() => {
    // 立即释放一波
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#a78bfa', '#38bdf8', '#fbbf24', '#f472b6', '#34d399'],
    });

    // 间隔释放：化学气泡上升感
    const end = Date.now() + 2500;
    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#67e8f9', '#a78bfa', '#f472b6'],
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#4ade80', '#fbbf24', '#f472b6'],
      });
    }, 450);

    // 播放胜利通关琶音音效
    playGraduationVictoryFanfare();

    return () => clearInterval(interval);
  }, []);

  // 3D 鼠标互动悬停倾斜效果
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = badgeRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    card.style.transform = `perspective(1000px) rotateY(${x * 0.12}deg) rotateX(${-y * 0.12}deg) scale(1.05)`;
  };

  const handleMouseLeave = () => {
    const card = badgeRef.current;
    if (!card) return;
    card.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="relative bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-white/10 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full text-center space-y-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] animate-bounce-in">
        
        {/* 光束背景扫过 */}
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
          <div className="absolute -inset-[50%] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12)_0,transparent_60%)] animate-pulse" />
          <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 transform animate-[shimmer_3s_infinite_linear]" />
        </div>

        {/* 顶部标题栏 */}
        <div className="space-y-1">
          <span className="text-[0.65rem] tracking-[0.2em] font-black text-cyan-400 uppercase drop-shadow-[0_2px_8px_rgba(34,211,238,0.3)]">
            🏆 CHAPTER GRADUATION 🏆
          </span>
          <h2 className="text-2xl font-black bg-gradient-to-r from-teal-300 via-emerald-300 to-indigo-300 bg-clip-text text-transparent tracking-tight">
            章节大满贯通关！
          </h2>
        </div>

        {/* 3D 徽章容器 */}
        <div className="flex justify-center py-4">
          <div
            ref={badgeRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-36 h-36 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 p-1 cursor-grab active:cursor-grabbing shadow-2xl transition-all duration-200 ease-out flex items-center justify-center relative group"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* 徽章背景环发光 */}
            <div className={`absolute inset-1 rounded-full bg-gradient-to-tr ${info.badgeColor} opacity-70 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-300`} />
            
            {/* 内部圆盘 */}
            <div 
              className={`w-full h-full rounded-full bg-gradient-to-br ${info.badgeColor} flex flex-col items-center justify-center text-white border border-white/20 shadow-inner`}
              style={{ transform: 'translateZ(20px)' }}
            >
              <span className="text-5xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-300 animate-float select-none">
                {info.badgeEmoji}
              </span>
            </div>
            
            {/* 悬浮微光扫过 */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <div className="absolute top-0 -left-[100%] w-[30%] h-full bg-white/25 skew-x-12 transform animate-[shimmer_2s_infinite_linear]" />
            </div>
          </div>
        </div>

        {/* 徽章名称 */}
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-100 drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]">
            【 {info.badgeName} 】
          </h3>
          <p className="text-[10px] text-slate-500 font-bold tracking-wider">已解锁并永久收纳进你的炼金阁</p>
        </div>

        {/* 学习里程碑描述 */}
        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium shadow-inner">
          {info.description}
        </div>

        {/* 坤哥寄语避坑黑板 */}
        <div className="relative bg-gradient-to-br from-teal-950/80 to-emerald-950/80 rounded-2xl p-4 border border-teal-900/60 text-left">
          <div className="absolute -top-2.5 left-4 bg-teal-800 text-teal-100 px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase">
            💡 坤哥名师点拨与寄语
          </div>
          <p className="text-xs text-teal-200/90 leading-relaxed italic font-bold pt-1">
            {info.teacherNote}
          </p>
        </div>

        {/* 底部关闭/继续按钮 */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-black text-sm tracking-widest transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-0.5 active:translate-y-0 uppercase"
        >
          收下徽章，探索新航路 →
        </button>

      </div>
    </div>
  );
}
