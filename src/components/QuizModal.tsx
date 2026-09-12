import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import type {
  GuidedLessonMolecularModel,
  GuidedLessonVisual,
  GuidedLessonVisualIcon,
  KnowledgePoint,
  PlayModuleId,
  StudentProfile,
} from '../types';
import { XP_PER_NODE, XP_BONUS_STREAK } from '../types';
import { saveQuestionFeedback } from '../services/questionFeedback';
import { useSound } from '../hooks/useSound';
import { Mascot } from './Mascot';
import { createPost } from '../services/forum';
import { WidgetRegistry } from './widgets/WidgetRegistry';
import { ScenarioIllustration, hasScenarioIllustration } from './ScenarioIllustration';
import {
  getChallengeMisconceptionTag,
  getLearningModeProfile,
  MASTERY_THRESHOLD,
} from '../data/learningMode';
/** 将 [条件]= 渲染为条件在等号上方的 React 元素 */
function renderEq(text: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\](?:=|→))/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    const m = part.match(/^\[([^\]]+)\](=|→)$/);
    if (m) {
      return (
        <span key={i} style={{ display: 'inline-grid', gridTemplateRows: 'auto auto', justifyItems: 'center', verticalAlign: 'middle', lineHeight: 1, margin: '0 0.125em' }}>
          <span style={{ fontSize: '0.55em', color: '#b45309', fontWeight: 800, lineHeight: 1 }}>
            {m[1]}
          </span>
          <span style={{ fontFamily: 'monospace', color: '#0e7490', fontSize: '1.3em', fontWeight: 900, letterSpacing: '0.08em', lineHeight: 1 }}>
            {m[2]}
          </span>
        </span>
      );
    }
    // 普通化学式等宽
    return part.split(/([A-Z][a-z]?[₀₁₂₃₄₅₆₇₈₉⁺²⁻³↑↓]+)/g).map((sp, j) =>
      /[A-Z]/.test(sp) ? <code key={j} className="font-mono text-[0.9em] not-italic text-[var(--text-main)]">{sp}</code> : sp
    );
  });
}

interface QuizModalProps {
  node: KnowledgePoint;
  canChallenge?: boolean;
  onUnlockRequest?: () => void;
  entryContext?: 'default' | 'stageReview';
  initialMode?: 'challenge' | 'learn';
  onClose: () => void;
  onComplete: (nodeId: string, score: number) => void;
  onRecordWrong: (record: import('../types').WrongRecord) => void;
  currentStreak: number;
  profile: StudentProfile;
  attempts?: number;
  nextNode?: KnowledgePoint | null;
  onNextNode?: (nodeId: string) => void;
  onPlayModule?: (moduleId: PlayModuleId) => void;
}

// 根据题目在节点位置推断难度
function getDifficulty(all: import('../types').Challenge[], idx: number): number {
  if (all.length <= 3) return 2;
  const r = idx / (all.length - 1);
  if (r < 0.33) return 1;
  if (r > 0.66) return 3;
  return 2;
}
const DOTS: Record<number, string> = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐' };

type GameMode = 'challenge' | 'learn';
type LearnPhase = 'guided' | 'card' | 'checkpoint' | 'example' | 'practice' | 'test' | 'review';

// 渲染 **加粗文本**
function renderMarkdown(text: string): React.ReactNode {
  return text.split(/(\*\*[^*]+\*\*|\n)/).map((part, i) => {
    if (part === '\n') {
      return <div key={i} className="h-2"></div>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-indigo-800 bg-indigo-100/60 px-1.5 py-0.5 rounded shadow-sm mx-0.5">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function MoleculeAtom({
  cx,
  cy,
  label,
  kind,
  radius = 11,
}: {
  cx: number;
  cy: number;
  label: 'H' | 'O' | 'C' | 'N' | 'Ar';
  kind: 'hydrogen' | 'oxygen' | 'carbon' | 'nitrogen' | 'argon';
  radius?: number;
}) {
  const palette = {
    hydrogen: { fill: '#f8fafc', stroke: '#64748b', text: '#334155' },
    oxygen: { fill: '#f87171', stroke: '#991b1b', text: '#ffffff' },
    carbon: { fill: '#475569', stroke: '#0f172a', text: '#ffffff' },
    nitrogen: { fill: '#60a5fa', stroke: '#1d4ed8', text: '#ffffff' },
    argon: { fill: '#c4b5fd', stroke: '#6d28d9', text: '#4c1d95' },
  }[kind];
  return (
    <g>
      <circle cx={cx} cy={cy} r={radius} fill={palette.fill} stroke={palette.stroke} strokeWidth="2.5" />
      <circle cx={cx - radius * 0.28} cy={cy - radius * 0.3} r={Math.max(1.5, radius * 0.17)} fill="#ffffff" opacity=".55" />
      <text x={cx} y={cy + (radius < 8 ? 2.5 : 4)} textAnchor="middle" fill={palette.text} fontSize={radius < 8 ? (label === 'Ar' ? 5.5 : 7) : 11} fontWeight="900">{label}</text>
    </g>
  );
}

function MiniWaterMolecule({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-4 2-11 8M4 2l11 6" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="0" cy="0" r="6" fill="#f87171" stroke="#991b1b" strokeWidth="1.5" />
      <circle cx="-12" cy="9" r="4" fill="#f8fafc" stroke="#64748b" strokeWidth="1.3" />
      <circle cx="12" cy="9" r="4" fill="#f8fafc" stroke="#64748b" strokeWidth="1.3" />
      <text x="0" y="2.4" textAnchor="middle" fill="#fff" fontSize="5.5" fontWeight="900">O</text>
      <text x="-12" y="10.6" textAnchor="middle" fill="#334155" fontSize="4" fontWeight="900">H</text>
      <text x="12" y="10.6" textAnchor="middle" fill="#334155" fontSize="4" fontWeight="900">H</text>
    </g>
  );
}

function WaterPhaseMotionModel({ phase }: { phase: 'liquid' | 'vapor' }) {
  const isLiquid = phase === 'liquid';
  const particles = isLiquid
    ? [
        [24, 52], [53, 49], [82, 53], [111, 49], [140, 53], [169, 49], [198, 53],
        [38, 91], [67, 88], [96, 92], [125, 88], [154, 92], [183, 88],
      ]
    : [
        [24, 31], [109, 26], [184, 38],
        [57, 104], [162, 96],
      ];

  return (
    <svg
      viewBox="0 0 220 130"
      className="h-36 w-full max-w-[300px]"
      role="img"
      aria-label={isLiquid
        ? '液态水微观示意：水分子彼此较近，在近邻之间做较短程的无规则运动'
        : '受热形成的水蒸气微观示意：水分子间隔很大，运动路径更长更快'}
    >
      {particles.map(([x, y], index) => (
        <g key={`${phase}-${x}-${y}`}>
          <MiniWaterMolecule x={x} y={y} scale={isLiquid ? 0.62 : 0.72} />
          <animateTransform
            attributeName="transform"
            type="translate"
            values={isLiquid ? '0 0;2 -1;0 0;-2 1;0 0' : '0 0;14 -7;0 0;-10 6;0 0'}
            dur={isLiquid ? `${2.1 + index * 0.08}s` : `${0.7 + index * 0.05}s`}
            begin={`${-index * 0.12}s`}
            repeatCount="indefinite"
          />
        </g>
      ))}
    </svg>
  );
}

function WaterPhaseChangeModel() {
  return (
    <svg
      viewBox="0 0 150 72"
      className="h-16 w-full max-w-40"
      role="img"
      aria-label="水蒸发微观示意：液态水分子彼此较近，变成水蒸气后分子本身不变、间隔和运动范围增大"
    >
      <rect x="2" y="11" width="55" height="57" rx="9" fill="#cffafe" stroke="#22d3ee" strokeWidth="1.6" />
      <rect x="91" y="11" width="57" height="57" rx="9" fill="#f5f3ff" stroke="#a78bfa" strokeWidth="1.6" strokeDasharray="4 4" />
      <path d="M61 38h22m0 0-6-5m6 5-6 5" fill="none" stroke="#64748b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />

      {[[15, 27], [39, 24], [25, 52], [47, 49]].map(([x, y], index) => (
        <g key={`liquid-${x}-${y}`}>
          <MiniWaterMolecule x={x} y={y} scale={0.46} />
          <animateTransform attributeName="transform" type="translate" values="0 0;2 -1;0 0;-1 1;0 0" dur={`${1.7 + index * 0.1}s`} repeatCount="indefinite" />
        </g>
      ))}
      <path d="m8 40 6-3-2-2m2 2-1 3M34 38l6 2-2-3m2 3-3 2" fill="none" stroke="#0891b2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

      {[[103, 23], [135, 18], [116, 55], [140, 50]].map(([x, y], index) => (
        <g key={`vapor-${x}-${y}`}>
          <MiniWaterMolecule x={x} y={y} scale={0.46} />
          <animateTransform attributeName="transform" type="translate" values="0 0;6 -3;0 0;-4 3;0 0" dur={`${0.8 + index * 0.08}s`} repeatCount="indefinite" />
        </g>
      ))}
      <path d="m95 40 18-8m0 0-4-1m4 1-2 4m10 12 19-10m0 0-4 0m4 0-2 4" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GuidedMoleculeIcon({ model = 'h2o' }: { model?: GuidedLessonMolecularModel }) {
  if (model === 'liquid-water' || model === 'water-vapor') {
    return <WaterPhaseMotionModel phase={model === 'liquid-water' ? 'liquid' : 'vapor'} />;
  }
  if (model === 'water-phase-change') {
    return <WaterPhaseChangeModel />;
  }
  if (model === 'air') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M14 15h3M14 18h3M14 21h3M45 15h3M45 18h3M45 21h3M78 16h3M78 20h3" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round" />
        <MoleculeAtom cx={8} cy={18} label="N" kind="nitrogen" radius={6} />
        <MoleculeAtom cx={23} cy={18} label="N" kind="nitrogen" radius={6} />
        <MoleculeAtom cx={39} cy={18} label="N" kind="nitrogen" radius={6} />
        <MoleculeAtom cx={54} cy={18} label="N" kind="nitrogen" radius={6} />
        <MoleculeAtom cx={72} cy={18} label="O" kind="oxygen" radius={6} />
        <MoleculeAtom cx={87} cy={18} label="O" kind="oxygen" radius={6} />
        <MoleculeAtom cx={13} cy={50} label="Ar" kind="argon" radius={8} />
        <path d="M45 48h4M45 52h4M63 48h4M63 52h4" stroke="#64748b" strokeWidth="1.3" strokeLinecap="round" />
        <MoleculeAtom cx={38} cy={50} label="O" kind="oxygen" radius={7} />
        <MoleculeAtom cx={56} cy={50} label="C" kind="carbon" radius={7} />
        <MoleculeAtom cx={74} cy={50} label="O" kind="oxygen" radius={7} />
      </svg>
    );
  }
  if (model === 'oxygen-element-group') {
    return (
      <svg
        viewBox="0 0 96 72"
        className="h-16 w-24"
        role="img"
        aria-label="许多个同类氧原子归为氧元素这一类"
      >
        <path d="M14 19v-7h68v7" fill="none" stroke="#7c3aed" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="48" y="9" textAnchor="middle" fill="#6d28d9" fontSize="8" fontWeight="900">同一类</text>
        {[
          [20, 34],
          [48, 34],
          [76, 34],
          [29, 57],
          [58, 57],
        ].map(([cx, cy]) => (
          <MoleculeAtom key={`${cx}-${cy}`} cx={cx} cy={cy} label="O" kind="oxygen" radius={8} />
        ))}
      </svg>
    );
  }
  if (model === 'water-sample-zoom') {
    return (
      <svg
        viewBox="0 0 320 150"
        className="h-36 w-full max-w-xl"
        role="img"
        aria-label="一杯水中圈出一小部分，放大后可以看到许多个水分子"
      >
        <defs>
          <clipPath id="water-micro-window">
            <circle cx="237" cy="70" r="55" />
          </clipPath>
        </defs>

        <path d="M24 30h77l-7 90H31L24 30Z" fill="#f8fafc" stroke="#0e7490" strokeWidth="3" strokeLinejoin="round" />
        <path d="M29 65h67l-4 52H33l-4-52Z" fill="#67e8f9" opacity=".8" />
        <path d="M29 65c16-5 49 5 67 0" fill="none" stroke="#0891b2" strokeWidth="2.5" />
        <circle cx="67" cy="83" r="10" fill="#ecfeff" fillOpacity=".45" stroke="#0e7490" strokeWidth="2.5" strokeDasharray="4 3" />

        <path d="M77 76 181 37M77 90l104 23" fill="none" stroke="#0891b2" strokeWidth="2" strokeDasharray="5 5" />
        <circle cx="237" cy="70" r="58" fill="#ecfeff" stroke="#0891b2" strokeWidth="3" />
        <g clipPath="url(#water-micro-window)">
          <MiniWaterMolecule x={205} y={31} scale={0.85} />
          <MiniWaterMolecule x={239} y={27} scale={0.78} />
          <MiniWaterMolecule x={269} y={42} scale={0.8} />
          <MiniWaterMolecule x={193} y={66} scale={0.78} />
          <MiniWaterMolecule x={231} y={61} scale={0.95} />
          <MiniWaterMolecule x={275} y={72} scale={0.82} />
          <MiniWaterMolecule x={207} y={99} scale={0.82} />
          <MiniWaterMolecule x={250} y={98} scale={0.88} />
          <MiniWaterMolecule x={281} y={108} scale={0.72} />
        </g>

        <rect x="163" y="2" width="148" height="20" rx="10" fill="#cffafe" stroke="#67e8f9" />
        <text x="237" y="15" textAnchor="middle" fill="#155e75" fontSize="9" fontWeight="900">把水中的一小部分放大</text>
        <text x="63" y="139" textAnchor="middle" fill="#164e63" fontSize="10" fontWeight="900">一杯水（宏观）</text>
        <text x="237" y="139" textAnchor="middle" fill="#164e63" fontSize="10" fontWeight="900">许多水分子（微观）</text>
      </svg>
    );
  }
  if (model === 'o-atom') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <MoleculeAtom cx={48} cy={34} label="O" kind="oxygen" radius={17} />
        <text x="48" y="65" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="800">1个氧原子</text>
      </svg>
    );
  }
  if (model === 'co2') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M27 32h16M27 40h16M53 32h16M53 40h16" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
        <MoleculeAtom cx={17} cy={36} label="O" kind="oxygen" />
        <MoleculeAtom cx={48} cy={36} label="C" kind="carbon" />
        <MoleculeAtom cx={79} cy={36} label="O" kind="oxygen" />
      </svg>
    );
  }
  if (model === 'h2o2') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="m19 48 18-13m19 2 20-13M43 35l11 2" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
        <MoleculeAtom cx={13} cy={53} label="H" kind="hydrogen" radius={8} />
        <MoleculeAtom cx={42} cy={34} label="O" kind="oxygen" radius={11} />
        <MoleculeAtom cx={57} cy={38} label="O" kind="oxygen" radius={11} />
        <MoleculeAtom cx={82} cy={19} label="H" kind="hydrogen" radius={8} />
      </svg>
    );
  }
  if (model === 'o2') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M43 32h10M43 40h10" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
        <MoleculeAtom cx={32} cy={36} label="O" kind="oxygen" radius={14} />
        <MoleculeAtom cx={64} cy={36} label="O" kind="oxygen" radius={14} />
      </svg>
    );
  }
  if (model === 'h2') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M43 36h10" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
        <MoleculeAtom cx={31} cy={36} label="H" kind="hydrogen" radius={13} />
        <MoleculeAtom cx={65} cy={36} label="H" kind="hydrogen" radius={13} />
      </svg>
    );
  }
  if (model === '2h-atoms') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <MoleculeAtom cx={25} cy={36} label="H" kind="hydrogen" radius={13} />
        <MoleculeAtom cx={71} cy={36} label="H" kind="hydrogen" radius={13} />
        <path d="M43 36h10" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 4" />
        <text x="48" y="62" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="800">彼此分开</text>
      </svg>
    );
  }
  if (model === '2h2') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M38 23h9M49 49h9" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
        <MoleculeAtom cx={28} cy={23} label="H" kind="hydrogen" radius={9} />
        <MoleculeAtom cx={57} cy={23} label="H" kind="hydrogen" radius={9} />
        <MoleculeAtom cx={39} cy={49} label="H" kind="hydrogen" radius={9} />
        <MoleculeAtom cx={68} cy={49} label="H" kind="hydrogen" radius={9} />
      </svg>
    );
  }
  if (model === '2h2o') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="m11 43 12-9m15 9-11-9m31 9 11-9m15 9-11-9" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
        <MoleculeAtom cx={25} cy={31} label="O" kind="oxygen" radius={9} />
        <MoleculeAtom cx={8} cy={47} label="H" kind="hydrogen" radius={7} />
        <MoleculeAtom cx={41} cy={47} label="H" kind="hydrogen" radius={7} />
        <MoleculeAtom cx={71} cy={31} label="O" kind="oxygen" radius={9} />
        <MoleculeAtom cx={55} cy={47} label="H" kind="hydrogen" radius={7} />
        <MoleculeAtom cx={88} cy={47} label="H" kind="hydrogen" radius={7} />
      </svg>
    );
  }
  if (model === '2h2-plus-o2') {
    return (
      <svg
        viewBox="0 0 120 72"
        className="h-16 w-28"
        role="img"
        aria-label="两个氢分子和一个氧分子，含四个氢原子和两个氧原子"
      >
        <path d="M22 23h8M22 49h8" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
        <MoleculeAtom cx={13} cy={23} label="H" kind="hydrogen" radius={7} />
        <MoleculeAtom cx={39} cy={23} label="H" kind="hydrogen" radius={7} />
        <MoleculeAtom cx={13} cy={49} label="H" kind="hydrogen" radius={7} />
        <MoleculeAtom cx={39} cy={49} label="H" kind="hydrogen" radius={7} />
        <text x="55" y="39" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="900">＋</text>
        <path d="M79 32h9M79 40h9" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
        <MoleculeAtom cx={70} cy={36} label="O" kind="oxygen" radius={9} />
        <MoleculeAtom cx={97} cy={36} label="O" kind="oxygen" radius={9} />
        <text x="26" y="68" textAnchor="middle" fill="#475569" fontSize="7" fontWeight="900">2H₂</text>
        <text x="84" y="68" textAnchor="middle" fill="#475569" fontSize="7" fontWeight="900">O₂</text>
      </svg>
    );
  }
  if (model === '3co2') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        {[16, 36, 56].map((cy) => (
          <g key={cy}>
            <path d={`M28 ${cy - 2}h12M28 ${cy + 2}h12M56 ${cy - 2}h12M56 ${cy + 2}h12`} stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
            <MoleculeAtom cx={21} cy={cy} label="O" kind="oxygen" radius={7} />
            <MoleculeAtom cx={48} cy={cy} label="C" kind="carbon" radius={7} />
            <MoleculeAtom cx={75} cy={cy} label="O" kind="oxygen" radius={7} />
          </g>
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
      <path d="M26 39 47 28M50 28l22 12" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
      <MoleculeAtom cx={48} cy={28} label="O" kind="oxygen" radius={15} />
      <MoleculeAtom cx={22} cy={43} label="H" kind="hydrogen" />
      <MoleculeAtom cx={75} cy={43} label="H" kind="hydrogen" />
    </svg>
  );
}

function GuidedVisualIcon({ icon, model }: { icon: GuidedLessonVisualIcon; model?: GuidedLessonMolecularModel }) {
  if (icon === 'test-tube') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M37 8h23M41 8v40c0 10 5 16 12 16s12-6 12-16V8" fill="#ecfeff" stroke="#0e7490" strokeWidth="3" strokeLinecap="round" />
        <path d="M43 41h20v8c0 8-4 13-10 13s-10-5-10-13v-8Z" fill="#67e8f9" opacity=".8" />
        <path d="M38 8h26" stroke="#164e63" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === 'beaker') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M25 12h39l8 5-8 3v37c0 5-4 8-9 8H34c-5 0-9-3-9-8V12Z" fill="#ecfeff" stroke="#0e7490" strokeWidth="3" strokeLinejoin="round" />
        <path d="M28 40h33v17c0 3-2 5-6 5H34c-4 0-6-2-6-5V40Z" fill="#67e8f9" opacity=".78" />
        <path d="M52 25h10M52 32h10M52 39h10" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === 'evaporating-dish') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M15 29h66c-4 22-15 34-33 34S19 51 15 29Z" fill="#f8fafc" stroke="#0e7490" strokeWidth="3" strokeLinejoin="round" />
        <path d="M14 28c11 7 57 7 68 0" fill="none" stroke="#0891b2" strokeWidth="3" />
        <path d="M22 34c12 5 40 6 53 0" fill="none" stroke="#67e8f9" strokeWidth="3" opacity=".8" />
      </svg>
    );
  }
  if (icon === 'combustion-spoon') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M20 58 70 15" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        <path d="M12 57c7-4 16-2 19 4-6 8-18 8-22 2-1-2 0-4 3-6Z" fill="#cbd5e1" stroke="#475569" strokeWidth="2.5" />
        <circle cx="20" cy="58" r="4" fill="#f59e0b" />
      </svg>
    );
  }
  if (icon === 'round-flask') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M40 6h17M43 6v22c-10 3-17 11-17 21 0 11 10 18 22 18s22-7 22-18c0-10-7-18-16-21V6" fill="#ecfeff" stroke="#0e7490" strokeWidth="3" strokeLinejoin="round" />
        <path d="M29 48c11 5 27 5 38 0 0 10-8 16-19 16S29 58 29 48Z" fill="#67e8f9" opacity=".78" />
      </svg>
    );
  }
  if (icon === 'graduated-cylinder') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M39 7h22M42 7v52h16V7" fill="#ecfeff" stroke="#0e7490" strokeWidth="3" strokeLinecap="round" />
        <path d="M44 36h12v22H44V36Z" fill="#67e8f9" opacity=".8" />
        <path d="M58 15h-7M58 22h-5M58 29h-7M58 36h-5M58 43h-7" stroke="#0891b2" strokeWidth="1.8" />
        <path d="M34 65h32M48 59v6" stroke="#164e63" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === 'conical-flask') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M40 7h20M43 7v21L24 57c-3 5 1 9 7 9h38c6 0 10-4 7-9L57 28V7" fill="#ecfeff" stroke="#0e7490" strokeWidth="3" strokeLinejoin="round" />
        <path d="M30 51h40l5 8c2 3-1 5-6 5H31c-5 0-8-2-6-5l5-8Z" fill="#67e8f9" opacity=".78" />
        <path d="M42 18h16" stroke="#0891b2" strokeWidth="2" />
      </svg>
    );
  }
  if (icon === 'dropper') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="m26 16 13-9 10 10-10 12-13-13Z" fill="#64748b" stroke="#334155" strokeWidth="2.5" />
        <path d="m41 24 30 30" stroke="#0e7490" strokeWidth="6" strokeLinecap="round" />
        <path d="m68 51 8 8" stroke="#164e63" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M77 62c0 4-3 7-7 7s-7-3-7-7c0-3 4-8 7-12 3 4 7 9 7 12Z" fill="#38bdf8" className="animate-pulse" />
      </svg>
    );
  }
  if (icon === 'reagent-bottle') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M37 8h22l5 8-5 7v35c0 5-4 8-9 8h-8c-5 0-9-3-9-8V23l-5-7 5-8Z" fill="#f8fafc" stroke="#0e7490" strokeWidth="3" strokeLinejoin="round" />
        <path d="M35 41h26v17c0 3-2 5-6 5H41c-4 0-6-2-6-5V41Z" fill="#7dd3fc" opacity=".7" />
        <path d="M33 24h30M37 8h22" stroke="#164e63" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === 'spatula') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M18 54 67 17" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
        <path d="m64 20 11-10c4-3 9 2 6 6L70 27l-6-7Z" fill="#cbd5e1" stroke="#475569" strokeWidth="2.5" />
        <path d="m18 54-7 7" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === 'alcohol-lamp') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M31 31h34l7 27c1 5-2 8-7 8H31c-5 0-8-3-7-8l7-27Z" fill="#e0f2fe" stroke="#0e7490" strokeWidth="3" />
        <path d="M35 48h29l4 13H31l4-13Z" fill="#67e8f9" opacity=".8" />
        <path d="M40 31V20h16v11M48 20V12" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        <path d="M48 4c8 8 7 14 0 18-7-4-8-10 0-18Z" fill="#fb923c" stroke="#c2410c" strokeWidth="2" className="animate-pulse" />
      </svg>
    );
  }
  if (icon === 'gas-jar') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M29 12h38v45c0 5-4 8-9 8H38c-5 0-9-3-9-8V12Z" fill="#f8fafc" stroke="#0e7490" strokeWidth="3" />
        <path d="M25 10h46" stroke="#164e63" strokeWidth="4" strokeLinecap="round" />
        <path d="M34 20c10 6 19 0 28 6M34 34c10 6 19 0 28 6M34 48c10 6 19 0 28 6" fill="none" stroke="#7dd3fc" strokeWidth="2" strokeDasharray="3 4" />
      </svg>
    );
  }
  if (icon === 'funnel') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M18 10h60L56 38v23l-8 7V38L18 10Z" fill="#ecfeff" stroke="#0e7490" strokeWidth="3" strokeLinejoin="round" />
        <path d="M27 17h42L55 34H45L27 17Z" fill="#bae6fd" opacity=".75" />
        <path d="M48 44h8" stroke="#0891b2" strokeWidth="2" />
      </svg>
    );
  }
  if (icon === 'balance') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <rect x="19" y="41" width="58" height="23" rx="5" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
        <ellipse cx="48" cy="25" rx="23" ry="7" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
        <path d="M48 32v9" stroke="#475569" strokeWidth="4" />
        <rect x="32" y="48" width="32" height="9" rx="2" fill="#cffafe" stroke="#0e7490" strokeWidth="2" />
        <text x="48" y="55" textAnchor="middle" fill="#0e7490" fontSize="7" fontWeight="900">0.00 g</text>
      </svg>
    );
  }
  if (icon === 'separatory-funnel') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M38 7h20l-2 9c11 8 12 22 2 33l-7 7v8h-6v-8l-7-7c-10-11-9-25 2-33l-2-9Z" fill="#ecfeff" stroke="#0e7490" strokeWidth="3" strokeLinejoin="round" />
        <path d="M35 33h26c0 8-3 13-9 18l-4 4-5-4c-5-5-8-10-8-18Z" fill="#67e8f9" opacity=".75" />
        <path d="M36 58h24M48 55v10" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === 'stand') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M29 8v55M17 64h51" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
        <path d="M29 22h39M29 43h31" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
        <circle cx="70" cy="22" r="7" fill="none" stroke="#0e7490" strokeWidth="3" />
        <path d="M60 38v10M53 43h14" stroke="#0e7490" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === 'mortar') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M19 34h54c-2 20-11 29-27 29S21 54 19 34Z" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
        <path d="M53 39 76 12" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
        <path d="M28 64h38" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === 'direct-heat' || icon === 'mesh-heat' || icon === 'no-heat') {
    const isDirect = icon === 'direct-heat';
    const isMesh = icon === 'mesh-heat';
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        {isDirect ? (
          <path d="M39 6h18M42 6v29c0 8 4 12 9 12s9-4 9-12V6" fill="#ecfeff" stroke="#0e7490" strokeWidth="3" strokeLinecap="round" />
        ) : (
          <path d="M25 8h40l6 4-6 3v25H25V8Z" fill="#ecfeff" stroke="#0e7490" strokeWidth="3" strokeLinejoin="round" />
        )}
        {isMesh && <path d="M18 44h60M23 40l10 8m5-8 10 8m5-8 10 8" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />}
        {!isDirect && !isMesh && <path d="M17 12 79 62M79 12 17 62" stroke="#e11d48" strokeWidth="6" strokeLinecap="round" opacity=".9" />}
        {(isDirect || isMesh) && (
          <path d="M48 48c8 7 10 12 7 17-2 4-5 6-9 6s-8-3-8-7c0-5 4-9 8-14 0 4 1 6 2 8 2-3 1-6 0-10Z" fill="#fb923c" stroke="#c2410c" strokeWidth="1.8" className="animate-pulse" />
        )}
      </svg>
    );
  }
  if (icon === 'bottle') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M38 8h20v10l8 10v28c0 5-4 8-9 8H39c-5 0-9-3-9-8V28l8-10V8Z" fill="#e0f2fe" stroke="#0e7490" strokeWidth="3" />
        <path d="M32 43h32v13c0 4-3 6-7 6H39c-4 0-7-2-7-6V43Z" fill="#67e8f9" className="animate-pulse" />
        <path d="M38 18h20" stroke="#0e7490" strokeWidth="3" strokeLinecap="round" />
        <circle cx="42" cy="50" r="2" fill="#fff" />
        <circle cx="53" cy="55" r="2.5" fill="#fff" />
      </svg>
    );
  }
  if (icon === 'flame') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M49 6c4 14-9 17-5 29 5-5 9-9 10-16 12 12 20 23 15 35-4 10-13 15-23 15S27 62 26 52c-2-13 8-22 18-33 0 8 1 12 5 16 3-9-2-17 0-29Z" fill="#fb923c" stroke="#c2410c" strokeWidth="2.5" className="animate-pulse" />
        <path d="M48 39c6 7 9 11 7 17-1 5-5 8-10 8s-9-4-9-9c0-6 5-10 10-16 0 5 0 7 2 9 2-3 1-6 0-9Z" fill="#fde68a" />
      </svg>
    );
  }
  if (icon === 'wire') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M8 45c18-25 30 20 48-7 10-15 20-12 31-2" fill="none" stroke="#b45309" strokeWidth="7" strokeLinecap="round" />
        <path d="m52 8-10 20h11l-7 18 20-25H54l8-13Z" fill="#facc15" stroke="#a16207" strokeWidth="2" />
        <circle cx="58" cy="22" r="13" fill="#fde047" opacity=".28" className="animate-ping" />
      </svg>
    );
  }
  if (icon === 'diamond') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="M18 27 33 9h31l15 18-31 38L18 27Z" fill="#dbeafe" stroke="#2563eb" strokeWidth="3" />
        <path d="m18 27 30 38 31-38M33 9l15 56L64 9M18 27h61" fill="none" stroke="#60a5fa" strokeWidth="2" />
      </svg>
    );
  }
  if (icon === 'ice') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <path d="m26 19 31-9 16 15-31 10-16-16Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
        <path d="m26 19 16 16v28L26 47V19Z" fill="#bae6fd" stroke="#0284c7" strokeWidth="2.5" />
        <path d="M42 35 73 25v28L42 63V35Z" fill="#7dd3fc" stroke="#0284c7" strokeWidth="2.5" />
        <path d="M62 59c8 0 14 2 14 5s-8 5-18 4c3-3 4-6 4-9Z" fill="#38bdf8" opacity=".7" className="animate-pulse" />
      </svg>
    );
  }
  if (icon === 'pure') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        {[22, 48, 74].map((cx, index) => (
          <g key={cx} className={index === 1 ? 'animate-pulse' : undefined}>
            <circle cx={cx} cy="36" r="11" fill="#67e8f9" stroke="#0e7490" strokeWidth="2.5" />
            <circle cx={cx - 3} cy="32" r="2.5" fill="#ecfeff" />
          </g>
        ))}
        <path d="M12 58h72" stroke="#a5f3fc" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === 'mixture') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <circle cx="23" cy="37" r="11" fill="#67e8f9" stroke="#0e7490" strokeWidth="2.5" />
        <rect x="39" y="25" width="22" height="22" rx="5" fill="#fde68a" stroke="#b45309" strokeWidth="2.5" />
        <path d="m75 24 12 22H63l12-22Z" fill="#c4b5fd" stroke="#6d28d9" strokeWidth="2.5" />
        <path d="M12 58h75" stroke="#ddd6fe" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === 'element') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <rect x="27" y="6" width="42" height="60" rx="9" fill="#ede9fe" stroke="#6d28d9" strokeWidth="3" />
        <text x="35" y="21" fill="#7c3aed" fontSize="10" fontWeight="800">8</text>
        <text x="48" y="49" textAnchor="middle" fill="#4c1d95" fontSize="32" fontWeight="900">O</text>
        <circle cx="73" cy="14" r="5" fill="#c4b5fd" className="animate-pulse" />
      </svg>
    );
  }
  if (icon === 'atom') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <ellipse cx="48" cy="36" rx="33" ry="13" fill="none" stroke="#0e7490" strokeWidth="2.5" />
        <ellipse cx="48" cy="36" rx="33" ry="13" transform="rotate(60 48 36)" fill="none" stroke="#0891b2" strokeWidth="2.5" />
        <ellipse cx="48" cy="36" rx="33" ry="13" transform="rotate(120 48 36)" fill="none" stroke="#06b6d4" strokeWidth="2.5" />
        <circle cx="48" cy="36" r="8" fill="#fbbf24" stroke="#b45309" strokeWidth="2" className="animate-pulse" />
        <circle cx="79" cy="32" r="4" fill="#2563eb" />
        <circle cx="29" cy="12" r="4" fill="#2563eb" />
        <circle cx="34" cy="59" r="4" fill="#2563eb" />
      </svg>
    );
  }
  if (icon === 'molecule') {
    return <GuidedMoleculeIcon model={model} />;
  }
  if (icon === 'formula') {
    return (
      <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
        <rect x="8" y="10" width="80" height="52" rx="12" fill="#ecfeff" stroke="#0891b2" strokeWidth="2.5" />
        <text x="48" y="44" textAnchor="middle" fill="#164e63" fontSize="20" fontWeight="900">化学式</text>
        <path d="M16 18h16" stroke="#67e8f9" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 96 72" className="h-16 w-24" aria-hidden="true">
      <path d="M13 45h63" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
      <path d="m69 37 14 8-14 8" fill="none" stroke="#64748b" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="29" cy="44" r="6" fill="#c2410c" />
      <circle cx="46" cy="47" r="5" fill="#ea580c" />
      <circle cx="60" cy="42" r="4" fill="#9a3412" />
      <path d="M24 24c9-7 25-8 39 0" fill="none" stroke="#fb923c" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
    </svg>
  );
}

function GuidedStepVisual({ visual, revealed }: { visual: GuidedLessonVisual; revealed: boolean }) {
  const toneClasses = {
    cyan: 'border-cyan-200 bg-cyan-50/80 text-cyan-950',
    amber: 'border-amber-200 bg-amber-50/80 text-amber-950',
    emerald: 'border-emerald-200 bg-emerald-50/80 text-emerald-950',
    violet: 'border-violet-200 bg-violet-50/80 text-violet-950',
  };
  const answerClasses = {
    cyan: 'border-cyan-300 bg-cyan-100 text-cyan-900',
    amber: 'border-amber-300 bg-amber-100 text-amber-900',
    emerald: 'border-emerald-300 bg-emerald-100 text-emerald-900',
    violet: 'border-violet-300 bg-violet-100 text-violet-900',
  };

  return (
    <div className="space-y-2">
      <div className={`grid gap-3 ${
        visual.layout === 'wide'
          ? 'grid-cols-1'
          : visual.layout === 'grid'
            ? 'grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2'
      }`}>
        {visual.items.map((item, index) => {
          const tone = item.tone ?? 'cyan';
          const isPhaseVisual = item.model === 'liquid-water' || item.model === 'water-vapor';
          return (
            <div
              key={`${item.title}-${index}`}
              className={`relative overflow-hidden rounded-2xl border p-3 text-center ${toneClasses[tone]} ${
                visual.layout === 'wide' ? 'mx-auto w-full max-w-2xl' : ''
              }`}
            >
              <div className={`mx-auto flex items-center justify-center ${
                visual.layout === 'wide' ? 'min-h-36' : isPhaseVisual ? 'h-36' : 'h-16'
              }`}>
                {item.imageSrc ? (
                  <img
                    src={item.imageSrc}
                    alt={item.imageAlt ?? item.title}
                    className={`w-full object-contain ${visual.layout === 'wide' ? 'max-h-36' : 'h-16'}`}
                    loading="lazy"
                  />
                ) : (
                  <GuidedVisualIcon icon={item.icon} model={item.model} />
                )}
              </div>
              <div className="mt-1 text-sm font-black leading-snug">{item.title}</div>
              {item.note && <div className="mt-1 text-[11px] font-bold opacity-70">{item.note}</div>}
              {revealed && item.answerLabel && (
                <div className={`mt-2 rounded-full border px-2 py-1 text-[11px] font-black ${answerClasses[tone]}`}>
                  {item.answerLabel}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {visual.caption && <p className="text-center text-[11px] font-bold text-slate-500">{visual.caption}</p>}
    </div>
  );
}

// 获取章节封面 fallback 路径
function getChapterCover(nodeId: string): string {
  const match = nodeId.match(/^ch(\d+)/);
  if (match) {
    const chNum = parseInt(match[1]);
    if (chNum >= 1 && chNum <= 12) {
      return `/covers/ch${chNum}.png`;
    }
  }
  return '/covers/ch1.png';
}

// 获取学习内容
function getLearningContent(node: import('../types').KnowledgePoint) {
  if (node.learningContent) return node.learningContent;
  const sourceChallenges = node.challenges.length > 0
    ? node.challenges
    : (node.bigQuestion?.subQuestions ?? []);
  const tips: string[] = [];
  for (const c of sourceChallenges.slice(0, 4)) {
    const s = c.explanation.split(/[。！]/)[0];
    if (s.length > 15 && s.length < 100 && !tips.includes(s)) tips.push(s);
  }
  const fallbackTips = node.bigQuestion
    ? [
        '先圈出题干中的实验目的、现象和待判断物质，再选对应规律。',
        '综合题常把多个知识点放在同一情境里，逐小问拆开处理。',
        '遇到实验操作顺序题，优先检查防倒吸、防污染、防炸裂这三类风险。',
      ]
    : [
        '先抓关键词，再判断它考的是概念、现象、操作还是计算。',
        '把选项逐个代回题干，排除与核心规律矛盾的说法。',
        '做错后优先复盘解析第一句话，通常就是本题考点。',
      ];
  return {
    concept: node.bigQuestion
      ? `**${node.topic}**属于综合应用题。关键不是背单个结论，而是把题干情境拆成“物质/实验目的/现象/结论”四步。\n\n${node.bigQuestion.context}`
      : node.topic + '是初中化学的重要知识点。',
    tips: (tips.length > 0 ? tips : fallbackTips).slice(0, 4),
    summary: node.bigQuestion ? '综合题先拆情境，再按每个小问调用对应规律，避免被长题干带偏。' : undefined,
    examWeight: node.difficulty,
  } as import('../types').LearningContent;
}

export function QuizModal({
  node,
  canChallenge = true,
  onUnlockRequest,
  entryContext = 'default',
  initialMode,
  onClose,
  onComplete,
  onRecordWrong,
  currentStreak,
  profile,
  attempts,
  nextNode = null,
  onNextNode,
  onPlayModule,
}: QuizModalProps) {
  const isBig = Boolean(node.bigQuestion);
  const isSeniorMicroLearn = node.id.startsWith('g10-');
  const isStageReview = entryContext === 'stageReview';
  const challenges = isBig ? (node.bigQuestion!.subQuestions) : node.challenges;
  const learnContent = getLearningContent(node);
  const learningProfile = getLearningModeProfile(node);
  const hasDesignedLearning = Boolean(node.learningContent);
  const isGatedInteractive = Boolean(learnContent.interactiveWidget) && learnContent.interactiveWidgetMode === 'gated';
  const isSymbolMeaningLab = learnContent.interactiveWidget === 'ChemicalSymbolMeaningLab';
  const isCandleInquiryLab = learnContent.interactiveWidget === 'CandleInquiryLab';
  const isClassroomWideWidget = ['AtomicModelComparison', 'ElectronShellTrainer', 'CombustionComparisonLab', 'OxygenCollectionLab', 'CarbonDioxidePreparationLab', 'WaterElectrolysisLab', 'ElementMassLab', 'ChemicalSymbolMeaningLab', 'CandleInquiryLab']
    .includes(learnContent.interactiveWidget ?? '');
  const hasGuidedLesson = Boolean(learnContent.guidedSteps?.length) && !isGatedInteractive;
  const [gameMode, setGameMode] = useState<GameMode | null>(() => (
    initialMode ?? (isStageReview && !node.learningContent?.interactiveWidget ? 'challenge' : null)
  ));
  const [learnPhase, setLearnPhase] = useState<LearnPhase>(() => (
    initialMode === 'learn' && hasGuidedLesson
      ? 'guided'
      : initialMode === 'learn' && !isGatedInteractive && learnContent.example
        ? 'example'
        : 'card'
  ));
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [exampleAnswered, setExampleAnswered] = useState<number | null>(null);
  const [guidedStepIdx, setGuidedStepIdx] = useState(0);
  const [guidedChoice, setGuidedChoice] = useState<number | null>(null);
  const [guidedChoiceAnswers, setGuidedChoiceAnswers] = useState<Record<number, number>>({});
  const [guidedCheckSelected, setGuidedCheckSelected] = useState<number | null>(null);
  const [guidedCheckAnswers, setGuidedCheckAnswers] = useState<Record<number, number>>({});
  const [showRelatedPlayModules, setShowRelatedPlayModules] = useState(false);
  const [interactiveCompleted, setInteractiveCompleted] = useState(false);
  const guidedScrollRef = useRef<HTMLDivElement>(null);
  const guidedOptionFeedbackRef = useRef<HTMLDivElement>(null);
  const guidedCheckFeedbackRef = useRef<HTMLDivElement>(null);
  const learningCheckpointScrollRef = useRef<HTMLDivElement>(null);
  const learningCardScrollRef = useRef<HTMLDivElement>(null);
  // 学习模式：去除例题，然后前2道基础练习，其余独立测验
  let displayChallenges = challenges;
  if (gameMode === 'learn' && learnContent?.example) {
    displayChallenges = challenges.filter(c => c.stem !== learnContent.example.stem);
  }

  const practiceCount = displayChallenges.length === 0
    ? 0
    : hasGuidedLesson
      ? 0
    : isSeniorMicroLearn
      ? Math.min(displayChallenges.length, Math.max(1, Math.ceil(displayChallenges.length * 0.5)))
      : Math.min(2, Math.max(1, Math.floor(displayChallenges.length * 0.4)));
  const practiceChallenges = displayChallenges.slice(0, practiceCount);
  const testChallenges = displayChallenges.slice(practiceCount);
  const currentChallenges = gameMode === 'learn'
    ? (learnPhase === 'practice' ? practiceChallenges : testChallenges)
    : challenges;

  const [challengeIdx, setChallengeIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [fillCorrect, setFillCorrect] = useState(false);
  const total = currentChallenges.length;
  const [, setXpGained] = useState(0);
  const [showXpFloat, setShowXpFloat] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [completionScore, setCompletionScore] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [showDiscuss, setShowDiscuss] = useState(false);
  const [discussText, setDiscussText] = useState('');
  const [discussSent, setDiscussSent] = useState(false);
  const [mascotMood, setMascotMood] = useState<'idle' | 'happy' | 'sad' | 'fire' | 'wow'>('idle');
  const { playCorrect, playWrong, playComplete } = useSound();

  const fireConfetti = useCallback(() => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#4ade80','#67e8f9','#fbbf24','#a78bfa'] });
    setTimeout(() => confetti({ particleCount: 40, spread: 100, origin: { y: 0.5, x: 0.3 }, colors: ['#f472b6','#fbbf24'] }), 200);
    setTimeout(() => confetti({ particleCount: 40, spread: 100, origin: { y: 0.5, x: 0.7 }, colors: ['#67e8f9','#4ade80'] }), 400);
  }, []);

  useEffect(() => {
    if (isComplete && (completionScore ?? 0) >= MASTERY_THRESHOLD) {
      fireConfetti();
      playComplete();
    }
  }, [isComplete, completionScore, fireConfetti, playComplete]);

  useEffect(() => {
    if (gameMode === 'learn' && learnPhase === 'guided') {
      guidedScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [gameMode, learnPhase, guidedStepIdx]);

  useEffect(() => {
    if (gameMode !== 'learn' || learnPhase !== 'guided' || guidedChoice === null) return;
    const frame = window.requestAnimationFrame(() => {
      guidedOptionFeedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [gameMode, guidedChoice, learnPhase]);

  useEffect(() => {
    if (gameMode !== 'learn' || learnPhase !== 'guided' || guidedCheckSelected === null) return;
    const frame = window.requestAnimationFrame(() => {
      guidedCheckFeedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [gameMode, guidedCheckSelected, learnPhase]);

  useEffect(() => {
    if (gameMode !== 'learn' || learnPhase !== 'checkpoint') return;
    const frame = window.requestAnimationFrame(() => {
      learningCheckpointScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [gameMode, learnPhase]);

  useEffect(() => {
    if (gameMode === 'learn' && learnPhase === 'card' && interactiveCompleted) {
      learningCardScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [gameMode, learnPhase, interactiveCompleted]);

  const challenge = currentChallenges[challengeIdx];
  const isFill = challenge?.type === 'fill';
  const sourceLabel = challenge?.source ?? node.source;
  const answerIsCorrect = Boolean(
    showResult && challenge && (isFill ? fillCorrect : selected === challenge.answer),
  );

  const handleSelect = (idx: number) => {
    if (showResult || isFill) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === challenge.answer) {
      setCorrect(c => c + 1);
      addXp();
      playCorrect();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 }, colors: ['#4ade80','#67e8f9','#fbbf24'], gravity: 0.8 });
      setMascotMood(currentStreak >= 5 ? 'fire' : 'happy');
      setTimeout(() => setMascotMood('idle'), 1500);
    } else {
      playWrong();
      setMascotMood('sad');
      setTimeout(() => setMascotMood('idle'), 1500);
      onRecordWrong({
        nodeId: node.id, nodeTopic: node.topic, challengeIdx,
        stem: challenge.stem,
        userAnswer: challenge.options[idx],
        correctAnswer: challenge.options[challenge.answer],
        explanation: challenge.explanation,
        misconceptionTag: getChallengeMisconceptionTag(node, challenge.misconceptionTag),
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleFillSubmit = () => {
    if (showResult || !isFill || !fillAnswer.trim()) return;
    const answers = challenge.fillAnswers ?? [];
    const isCorrect = answers.some(a => a.toLowerCase() === fillAnswer.trim().toLowerCase());
    setFillCorrect(isCorrect);
    setShowResult(true);
    if (isCorrect) {
      setCorrect(c => c + 1);
      addXp();
      playCorrect();
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 }, colors: ['#4ade80','#67e8f9','#fbbf24'], gravity: 0.8 });
      setMascotMood(currentStreak >= 5 ? 'fire' : 'happy');
      setTimeout(() => setMascotMood('idle'), 1500);
    } else {
      setMascotMood('sad');
      setTimeout(() => setMascotMood('idle'), 1500);
      onRecordWrong({
        nodeId: node.id, nodeTopic: node.topic, challengeIdx,
        stem: challenge.stem,
        userAnswer: fillAnswer.trim(),
        correctAnswer: answers.join(' 或 '),
        explanation: challenge.explanation,
        misconceptionTag: getChallengeMisconceptionTag(node, challenge.misconceptionTag),
        timestamp: new Date().toISOString(),
      });
    }
  };

  const addXp = () => {
    if (!canChallenge) return;
    const xp = XP_PER_NODE + (currentStreak >= 3 ? XP_BONUS_STREAK : 0);
    setXpGained(prev => prev + xp);
    setShowXpFloat(true);
    setTimeout(() => setShowXpFloat(false), 1200);
  };

  const handleNext = () => {
    if (challengeIdx < currentChallenges.length - 1) {
      setChallengeIdx(i => i + 1);
      setSelected(null);
      setFillAnswer('');
      setFillCorrect(false);
      setShowResult(false);
      setShowFeedback(false);
      setFeedbackText('');
      setFeedbackSaved(false);
      setShowDiscuss(false);
      setDiscussSent(false);
      setDiscussText('');
    } else {
      // 学习模式：基础练习完成→进入独立测验
      if (gameMode === 'learn' && learnPhase === 'practice') {
        setPracticeCorrect(correct);
        if (testChallenges.length === 0) {
          setLearnPhase('review');
          return;
        }
        setLearnPhase('test');
        setChallengeIdx(0);
        setCorrect(0);
        setSelected(null);
        setShowResult(false);
        return;
      }
      // 学习模式：测验完成→回顾总结
      if (gameMode === 'learn') {
        setLearnPhase('review');
        return;
      }
      if (!canChallenge) {
        setLearnPhase('review');
        return;
      }
      const score = Math.round(correct / total * 100);
      setMascotMood('wow');
      if (score >= MASTERY_THRESHOLD) onComplete(node.id, score);
      setCompletionScore(score);
      setIsComplete(true);
    }
  };

  const guidedSteps = learnContent.guidedSteps ?? [];
  const guidedChoiceCount = guidedSteps.filter(step => Boolean(step.options?.length)).length;
  const guidedChoiceCorrect = guidedSteps.reduce((count, step, index) => {
    if (!step.options?.length) return count;
    const correctIndex = step.options.findIndex(option => option.correct);
    return count + (guidedChoiceAnswers[index] === correctIndex ? 1 : 0);
  }, 0);
  const guidedCheckCount = guidedSteps.filter(step => Boolean(step.quickCheck)).length;
  const guidedCheckCorrect = guidedSteps.reduce((count, step, index) => {
    if (!step.quickCheck) return count;
    return count + (guidedCheckAnswers[index] === step.quickCheck.answer ? 1 : 0);
  }, 0);
  const guidedDecisionCount = guidedChoiceCount + guidedCheckCount;
  const guidedDecisionCorrect = guidedChoiceCorrect + guidedCheckCorrect;
  const guidedTakeaways = guidedSteps
    .map(step => step.keyPoint)
    .filter((point): point is string => Boolean(point))
    .slice(-3);
  const checkpointPoints = guidedTakeaways.length > 0
    ? guidedTakeaways
    : learnContent.tips.slice(0, 3);
  const guidedAssessmentCount = guidedDecisionCount + testChallenges.length;
  const guidedAssessmentCorrect = guidedDecisionCorrect + correct;
  const guidedOutcomeScore = guidedAssessmentCount > 0
    ? Math.round(guidedAssessmentCorrect / guidedAssessmentCount * 100)
    : 100;
  const finalScore = completionScore ?? (isComplete
    ? gameMode === 'learn' && hasGuidedLesson
      ? guidedOutcomeScore
      : Math.round((correct / total) * 100)
    : 0);

  const handleFeedbackSubmit = () => {
    if (!feedbackText.trim()) return;

    saveQuestionFeedback({
      profile,
      nodeId: node.id,
      nodeTopic: node.topic,
      challenge,
      challengeIndex: challengeIdx,
      selectedAnswer: selected,
      comment: feedbackText,
    });
    setFeedbackSaved(true);
    setShowFeedback(false);
    setFeedbackText('');
  };

  const resetQuizState = () => {
    setChallengeIdx(0);
    setSelected(null);
    setFillAnswer('');
    setFillCorrect(false);
    setShowResult(false);
    setCorrect(0);
    setPracticeCorrect(0);
    setXpGained(0);
    setShowXpFloat(false);
    setIsComplete(false);
    setCompletionScore(null);
    setShowFeedback(false);
    setFeedbackText('');
    setFeedbackSaved(false);
    setShowDiscuss(false);
    setDiscussText('');
    setDiscussSent(false);
    setMascotMood('idle');
    setGuidedStepIdx(0);
    setGuidedChoice(null);
    setGuidedChoiceAnswers({});
    setGuidedCheckSelected(null);
    setGuidedCheckAnswers({});
    setInteractiveCompleted(false);
  };

  const startLearningMode = () => {
    resetQuizState();
    setGameMode('learn');
    setLearnPhase(hasGuidedLesson ? 'guided' : (!isGatedInteractive && learnContent.example ? 'example' : 'card'));
    setFlashcardFlipped(false);
    setExampleAnswered(null);
    setGuidedStepIdx(0);
    setGuidedChoice(null);
    setGuidedChoiceAnswers({});
    setGuidedCheckSelected(null);
    setGuidedCheckAnswers({});
  };

  const moveGuidedStep = (direction: 1 | -1) => {
    const steps = learnContent.guidedSteps ?? [];
    const next = guidedStepIdx + direction;
    if (next < 0) return;
    if (next >= steps.length) {
      setLearnPhase(learnContent.interactiveWidget ? 'card' : 'checkpoint');
      setChallengeIdx(0);
      setCorrect(0);
      setSelected(null);
      setShowResult(false);
      return;
    }
    setGuidedStepIdx(next);
    setGuidedChoice(guidedChoiceAnswers[next] ?? null);
    setGuidedCheckSelected(guidedCheckAnswers[next] ?? null);
  };

  // 模式选择
  if (isComplete) {
    const passed = finalScore >= MASTERY_THRESHOLD;
    const needsReview = !passed;
    return (
      <div className={`fixed inset-0 ${passed ? 'bg-emerald-950/35' : 'bg-amber-950/35'} backdrop-blur-sm flex items-center justify-center z-50 p-4`}>
        <div className="bg-[var(--bg-card)] rounded-[1.75rem] p-6 max-w-sm w-full text-center space-y-4 border-2 border-[var(--border-color)] shadow-2xl shadow-sky-900/20">
          <div className="text-5xl">{passed ? '🎉' : '🧭'}</div>
          <h3 className="text-xl font-bold text-[var(--text-main)]">
            {passed ? '达到掌握线！' : '这关还没真正掌握'}
          </h3>
          <div className={`text-2xl font-bold ${passed ? 'text-emerald-600' : 'text-amber-700'}`}>
            {passed ? '已掌握' : `还差 ${MASTERY_THRESHOLD - finalScore} 分`}
          </div>
          <p className="text-teal-800">
            正确率 {finalScore}% · 掌握线 {MASTERY_THRESHOLD}%
          </p>
          {needsReview && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-left">
              <div className="text-sm font-black text-amber-900">先修正错因，再做迁移测验</div>
              <p className="mt-1 text-xs font-bold leading-relaxed text-amber-800/80">
                本次结果已保留，但不会标记“已掌握”或解锁下一关。当前高频错因：{learningProfile.misconceptionTag}。
              </p>
            </div>
          )}
          {passed && currentStreak >= 3 && (
            <p className="text-amber-600 text-sm font-medium">🔥 连胜奖励 +{XP_BONUS_STREAK} XP</p>
          )}
          {needsReview ? (
            <div className="space-y-2.5">
              <button
                onClick={startLearningMode}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-600/25"
              >
                回学习模式补错因
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-2xl font-bold text-xs transition-all border border-slate-200"
              >
                {isStageReview ? '先回真卷页' : '先回关卡地图'}
              </button>
            </div>
          ) : nextNode ? (
            <div className="space-y-2.5">
              <button
                onClick={() => onNextNode?.(nextNode.id)}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white rounded-2xl font-black transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-1.5 hover:-translate-y-0.5"
              >
                <span>🚀 进入下一关：{nextNode.topic}</span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-2xl font-bold text-xs transition-all border border-slate-200"
              >
                🗺️ 返回关卡地图
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold transition-colors shadow-lg shadow-emerald-500/25"
            >
              {isStageReview ? '回真卷页' : '继续学习下一个 →'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!gameMode) {
    const hasInteractiveWidget = Boolean(learnContent.interactiveWidget);
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 max-h-[calc(100vh-2rem)] max-w-sm w-full overflow-y-auto text-center space-y-4 shadow-xl border border-[var(--border-color)]">
          <div className="text-4xl">{'📚'}</div>
          <h3 className="text-lg font-bold text-[var(--text-main)]">{node.topic}</h3>
          <p className="text-xs text-[var(--text-muted)]">
            {hasDesignedLearning ? '可以先学再练，也可以直接刷题。' : '这个知识点暂未设计学习模式，只开放刷题挑战。'}
          </p>
          {hasDesignedLearning && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 px-3 py-3 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-black text-white">
                  {learningProfile.pathType}
                </span>
                <span className="text-[10px] font-black text-indigo-800">{MASTERY_THRESHOLD} 分才算掌握</span>
              </div>
              <p className="mt-2 text-[11px] font-bold leading-relaxed text-indigo-900/80">
                本关目标：{learningProfile.goal}
              </p>
            </div>
          )}
          {!canChallenge && hasDesignedLearning && (
            <div className="rounded-2xl bg-amber-50 border border-amber-100 px-3 py-2 text-left">
              <div className="text-xs font-black text-amber-900">先学习，不计进度</div>
              <div className="text-[11px] font-bold text-amber-800/75 mt-0.5">
                这个知识点还没解锁，学习模式可以先看；刷题拿 XP 需要按路径解锁。
              </div>
            </div>
          )}
          {hasInteractiveWidget && (
            <div className="rounded-2xl bg-amber-50 border border-amber-100 px-3 py-2 text-left">
              <div className="text-xs font-black text-amber-900">
                {isSymbolMeaningLab ? '🧩 这是一套符号推导训练' : isGatedInteractive ? '🧭 这是一套操作决策训练' : '✨ 这个知识点有互动实验'}
              </div>
              <div className="text-[11px] font-bold text-amber-800/75 mt-0.5">
                {isSymbolMeaningLab ? '先看微粒、自己拼出符号，再用一道上海常见文字题完成迁移。' : isGatedInteractive ? '必须先做选择、观察后果并说出理由，再进入知识整理。' : '点“学习模式”可以先看互动演示，再进入练习。'}
              </div>
            </div>
          )}
          <div className="space-y-2.5">
            {hasDesignedLearning && (
              <button onClick={startLearningMode} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                hasInteractiveWidget
                  ? 'border-amber-300 bg-amber-50 hover:border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.18)]'
                  : 'border-indigo-200 bg-indigo-50 hover:border-indigo-300'
              }`}>
                <span className="text-2xl">{hasInteractiveWidget ? '🧪' : isSeniorMicroLearn ? '🎯' : '📖'}</span>
                <div className="text-left">
                  <div className="text-sm font-bold text-[var(--text-main)]">
                    {hasGuidedLesson ? '开始学习' : isSymbolMeaningLab ? '开始3分钟符号推导' : isGatedInteractive ? '开始操作决策训练' : isSeniorMicroLearn ? '点拨训练' : hasInteractiveWidget ? '学习模式 · 互动演示' : '设计型学习模式'}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {hasGuidedLesson
                      ? '自学导引 · 像课件一样，一步一问地学'
                      : isSymbolMeaningLab
                      ? 'O → 3O → O₂ → 3O₂，先推导再总结'
                      : isGatedInteractive
                      ? '先选择，再看后果，最后进入正式题'
                      : isSeniorMicroLearn
                      ? '不会做？先看 30 秒点拨'
                      : hasInteractiveWidget
                        ? '先判断或操作，再看点拨并完成迁移题'
                        : '先判断，再看点拨、练习和迁移测验'}
                  </div>
                </div>
              </button>
            )}
            <button
              onClick={() => {
                if (canChallenge) setGameMode('challenge');
              }}
              disabled={!canChallenge}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                canChallenge
                  ? 'border-teal-300 bg-teal-50 hover:border-teal-400 shadow-[0_0_16px_rgba(20,184,166,0.16)]'
                  : 'border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed'
              }`}
            >
              <span className="text-2xl">⚡</span>
              <div className="text-left">
                <div className="text-sm font-bold text-[var(--text-main)]">直接刷题</div>
                <div className="text-xs text-[var(--text-muted)]">
                  {canChallenge ? '直接做题，答对加 XP' : '解锁后开放 XP 挑战'}
                </div>
              </div>
            </button>
            {onPlayModule && Boolean(node.playModules?.length) && (
              <div className="rounded-xl border border-violet-100 bg-violet-50/45 p-2">
                <button
                  type="button"
                  onClick={() => setShowRelatedPlayModules(open => !open)}
                  aria-expanded={showRelatedPlayModules}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-black text-violet-800 transition-colors hover:bg-violet-100/70"
                >
                  <span>🎮 相关专项训练（{node.playModules!.length}）</span>
                  <span aria-hidden="true" className="text-sm">{showRelatedPlayModules ? '收起 ▲' : '展开 ▼'}</span>
                </button>
                {showRelatedPlayModules && (
                  <div className="mt-2 space-y-2 border-t border-violet-100 pt-2">
                    {node.playModules!.map((playModule) => (
                      <button
                        key={playModule.id}
                        onClick={() => onPlayModule(playModule.id)}
                        className="flex w-full items-center gap-2.5 rounded-lg border border-violet-200 bg-white/85 px-3 py-2 text-left transition-colors hover:border-violet-300 hover:bg-white"
                      >
                        <span className="text-lg">{playModule.icon}</span>
                        <span className="min-w-0">
                          <span className="block text-xs font-bold text-[var(--text-main)]">{playModule.title}</span>
                          <span className="mt-0.5 block text-[11px] leading-snug text-[var(--text-muted)]">{playModule.description}</span>
                        </span>
                      </button>
                    ))}
                    <p className="px-2 pb-0.5 text-left text-[10px] font-bold text-violet-700/70">
                      专项训练可单独游玩，不影响主线闯关进度。
                    </p>
                  </div>
                )}
              </div>
            )}
            {!canChallenge && onUnlockRequest && (
              <button
                onClick={onUnlockRequest}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-amber-300 bg-amber-50 hover:border-amber-400 transition-all text-left"
              >
                <span className="text-2xl">🔓</span>
                <div>
                  <div className="text-sm font-bold text-[var(--text-main)]">挑战解锁</div>
                  <div className="text-xs text-[var(--text-muted)]">先做前置测试，过了再刷题拿 XP</div>
                </div>
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]">返回</button>
        </div>
      </div>
    );
  }

  // 学习模式·自学导引
  if (gameMode === 'learn' && learnPhase === 'guided' && learnContent.guidedSteps?.length) {
    const steps = learnContent.guidedSteps;
    const step = steps[guidedStepIdx];
    const optionChosen = !step.options?.length || guidedChoice !== null;
    const checkAnswered = !step.quickCheck || guidedCheckSelected !== null;
    const revealReady = step.options?.length
      ? guidedChoice !== null
      : step.quickCheck
        ? guidedCheckSelected !== null
        : true;
    const canContinue = optionChosen && checkAnswered;
    const selectedGuidedOption = guidedChoice !== null ? step.options?.[guidedChoice] : null;
    const quickCheck = step.quickCheck;

    return (
      <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
        <div ref={guidedScrollRef} className="bg-white rounded-[1.75rem] max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-black text-cyan-700 tracking-wider">自学模式 · {guidedStepIdx + 1}/{steps.length}</div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">{node.topic}</h3>
              </div>
              <button
                onClick={onClose}
                className="h-9 w-9 rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 text-xl leading-none"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <div className="mt-3 grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full ${index < guidedStepIdx ? 'bg-emerald-400' : index === guidedStepIdx ? 'bg-cyan-500' : 'bg-slate-200'}`}
                />
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            <div className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-5">
              <div className="text-xs font-black text-cyan-700 tracking-widest">{step.eyebrow ?? '先想一想'}</div>
              <h4 className="mt-2 text-xl sm:text-2xl font-black text-slate-950 leading-tight">{step.title}</h4>
              {step.lead && <p className="mt-3 text-sm sm:text-base leading-7 text-slate-700 font-medium">{renderMarkdown(step.lead)}</p>}
              {step.visual && <div className="mt-4"><GuidedStepVisual visual={step.visual} revealed={revealReady} /></div>}
              <div className="mt-4 rounded-2xl bg-white border border-cyan-100 p-4 text-base sm:text-lg font-black text-slate-900 leading-relaxed">
                {renderEq(step.question)}
              </div>
            </div>

            {step.options?.length ? (
              <div className="space-y-2.5">
                {step.options.map((option, index) => {
                  const isPicked = guidedChoice === index;
                  const showState = guidedChoice !== null;
                  const isCorrect = Boolean(option.correct);
                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={guidedChoice !== null}
                      onClick={() => {
                        setGuidedChoice(index);
                        setGuidedChoiceAnswers(prev => ({ ...prev, [guidedStepIdx]: index }));
                        if (isCorrect) {
                          playCorrect();
                        } else {
                          playWrong();
                        }
                      }}
                      className={`w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition ${
                        !showState
                          ? 'border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50 text-slate-800'
                          : isCorrect
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                          : isPicked
                          ? 'border-rose-300 bg-rose-50 text-rose-900'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-600">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {renderEq(option.text)}
                      {showState && isPicked && (
                        <span className={`ml-2 text-xs font-black ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isCorrect ? '✓ 答对了' : '✗ 再想想'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {selectedGuidedOption && (
              <div ref={guidedOptionFeedbackRef} role="status" aria-live="polite" className={`rounded-2xl border p-4 text-sm leading-7 font-medium ${
                selectedGuidedOption.correct ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}>
                <div className="mb-1 text-xs font-black tracking-wider">
                  {selectedGuidedOption.correct ? '✓ 答对了 · 依据成立' : '再想一步 · 看清错因'}
                </div>
                <div>{renderMarkdown(selectedGuidedOption.feedback)}</div>
              </div>
            )}

            {revealReady && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs font-black text-slate-500 tracking-widest">{step.revealTitle ?? '关键点拨'}</div>
                <p className="mt-2 text-sm sm:text-base leading-7 text-slate-800 font-medium">{renderMarkdown(step.reveal)}</p>
                {step.keyPoint && (
                  <div className="mt-4 rounded-2xl border border-cyan-200 bg-white p-3 text-sm font-black text-cyan-900">
                    {renderMarkdown(step.keyPoint)}
                  </div>
                )}
              </div>
            )}

            {optionChosen && quickCheck && (
              <div className="rounded-3xl border border-indigo-100 bg-indigo-50/70 p-5">
                <div className="text-xs font-black text-indigo-700 tracking-widest">即时核对</div>
                <div className="mt-2 text-base font-black text-slate-900 leading-relaxed">{renderEq(quickCheck.stem)}</div>
                <div className="mt-3 space-y-2">
                  {quickCheck.options.map((option, index) => {
                    const isPicked = guidedCheckSelected === index;
                    const showState = guidedCheckSelected !== null;
                    const isCorrect = index === quickCheck.answer;
                    return (
                      <button
                        key={index}
                        type="button"
                        disabled={showState}
                        onClick={() => {
                          setGuidedCheckSelected(index);
                          setGuidedCheckAnswers(prev => ({ ...prev, [guidedStepIdx]: index }));
                          if (isCorrect) {
                            playCorrect();
                          } else {
                            playWrong();
                          }
                        }}
                        className={`w-full rounded-2xl border px-3 py-2.5 text-left text-sm font-bold transition ${
                          !showState
                            ? 'border-indigo-100 bg-white hover:border-indigo-300'
                            : isCorrect
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                            : isPicked
                            ? 'border-rose-300 bg-rose-50 text-rose-900'
                            : 'border-slate-200 bg-white/60 text-slate-400'
                        }`}
                      >
                        <span className="mr-2 text-xs text-slate-500">{String.fromCharCode(65 + index)}.</span>
                        {renderEq(option)}
                        {showState && isPicked && (
                          <span className={`ml-2 text-xs font-black ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {isCorrect ? '✓ 答对了' : '✗ 再想想'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {guidedCheckSelected !== null && (
                  <div ref={guidedCheckFeedbackRef} role="status" aria-live="polite" className="mt-3 rounded-2xl border border-white bg-white p-3 text-sm leading-6 text-slate-700">
                    <div className={`mb-1 text-xs font-black ${guidedCheckSelected === quickCheck.answer ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {guidedCheckSelected === quickCheck.answer ? '✓ 核对正确 · 你用对了这条规律' : '再核对一次 · 正确思路在这里'}
                    </div>
                    <div>{renderMarkdown(quickCheck.explanation)}</div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => moveGuidedStep(-1)}
                disabled={guidedStepIdx === 0}
                className="w-24 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-500 disabled:opacity-40"
              >
                上一步
              </button>
              <button
                type="button"
                onClick={() => moveGuidedStep(1)}
                disabled={!canContinue}
                className="flex-1 rounded-2xl bg-cyan-600 py-3 text-sm font-black text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-500 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
              >
                {guidedStepIdx === steps.length - 1
                  ? '整理一下，再去练习'
                  : canContinue
                  ? '我理解了，下一步'
                  : '先完成本屏判断'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 学习模式·完成缓冲：先整理刚学到的依据，再进入正式练习。
  if (gameMode === 'learn' && learnPhase === 'checkpoint' && hasGuidedLesson) {
    const beginAssessment = () => {
      setLearnPhase(testChallenges.length > 0 ? 'test' : 'review');
      setChallengeIdx(0);
      setCorrect(0);
      setSelected(null);
      setFillAnswer('');
      setFillCorrect(false);
      setShowResult(false);
    };
    const returnToLearning = () => {
      if (learnContent.interactiveWidget) {
        setLearnPhase('card');
        return;
      }
      const lastStepIndex = Math.max(0, guidedSteps.length - 1);
      setGuidedStepIdx(lastStepIndex);
      setGuidedChoice(guidedChoiceAnswers[lastStepIndex] ?? null);
      setGuidedCheckSelected(guidedCheckAnswers[lastStepIndex] ?? null);
      setLearnPhase('guided');
    };

    return (
      <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
        <div ref={learningCheckpointScrollRef} className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-emerald-700">✓ 导学完成</div>
              <h3 className="mt-1 text-2xl font-black text-slate-950">先停一下，把思路装进口袋</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                不急着马上刷题。试着用自己的话说出下面任意一条，再进入迁移练习。
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="关闭"
            >
              ×
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-3 text-center">
              <div className="text-lg font-black text-cyan-800">{guidedSteps.length} 步</div>
              <div className="text-[11px] font-bold text-cyan-700">已经完整走完</div>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-center">
              <div className="text-lg font-black text-emerald-800">
                {guidedDecisionCount > 0 ? `${guidedDecisionCorrect}/${guidedDecisionCount}` : '已整理'}
              </div>
              <div className="text-[11px] font-bold text-emerald-700">
                {guidedDecisionCount > 0 ? '途中判断' : '核心依据'}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-indigo-100 bg-indigo-50/70 p-4">
            <div className="text-xs font-black tracking-widest text-indigo-700">刚才最该带走的依据</div>
            <ul className="mt-3 space-y-2.5">
              {checkpointPoints.map((point, index) => (
                <li key={`${index}-${point}`} className="flex items-start gap-2.5 rounded-2xl border border-white bg-white px-3 py-2.5 text-sm font-bold leading-6 text-slate-800">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-black text-indigo-700">
                    {index + 1}
                  </span>
                  <span>{renderMarkdown(point)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-900">
            接下来的题会换一种问法。能把这些依据迁移过去，才算真正学会。
          </div>

          <div className="mt-5 space-y-2.5">
            <button
              type="button"
              onClick={beginAssessment}
              className="w-full rounded-2xl bg-teal-600 py-3.5 text-sm font-black text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-500"
            >
              我能说出理由，开始迁移练习 →
            </button>
            <button
              type="button"
              onClick={returnToLearning}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              回看刚才的学习内容
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 学习模式·知识卡片
  if (gameMode === 'learn' && learnPhase === 'card') {
    const hasFlashcard = Boolean(learnContent.flashcard);
    const coverSrc = learnContent.conceptImage || getChapterCover(node.id);
    const hasNodeIllustration = hasScenarioIllustration(node.id);

    return (
      <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 ${isClassroomWideWidget ? 'p-2 sm:p-3' : 'p-4'}`}>
        <div ref={learningCardScrollRef} className={`bg-[var(--bg-card)] rounded-[2rem] overflow-hidden w-full overflow-y-auto shadow-2xl border border-white/50 relative flex flex-col ${
          isClassroomWideWidget ? 'max-w-6xl max-h-[96vh]' : 'max-w-lg max-h-[90vh]'
        }`}>

          {/* Cover Banner: fixed height for images, auto for interactive widgets */}
          {isGatedInteractive && !interactiveCompleted ? (
            <div className="relative w-full flex-shrink-0 bg-slate-950 border-b border-slate-200">
              <WidgetRegistry name={learnContent.interactiveWidget!} onComplete={() => setInteractiveCompleted(true)} />
              {/* Topic overlay for widget */}
              {!isCandleInquiryLab && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-4 flex flex-col justify-end pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/25 border border-cyan-400/40 text-[0.65rem] text-cyan-200 font-extrabold tracking-wider uppercase">
                    {node.id.split('-')[0].toUpperCase()} · 核心要点
                  </span>
                  <span className="flex items-center text-amber-400 text-[0.65rem] font-bold">
                    难度 {'⭐'.repeat(node.difficulty)}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1.5 tracking-tight drop-shadow-md">
                  {node.topic}
                </h3>
              </div>
              )}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all text-lg font-bold z-10"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
          ) : isGatedInteractive && interactiveCompleted ? (
            <div className="relative w-full flex-shrink-0 border-b border-emerald-200 bg-gradient-to-br from-emerald-600 to-teal-700 px-5 py-6 text-white">
              <div className="text-[11px] font-black tracking-[0.18em] text-emerald-100">✓ {isSymbolMeaningLab ? '互动推导已完成' : '操作决策链已完成'}</div>
              <h3 className="mt-1 text-xl font-black">{isSymbolMeaningLab ? '四个符号已串通，整理规则再做题' : '整理完整知识，再去做正式题'}</h3>
              <p className="mt-1.5 max-w-2xl text-sm font-semibold leading-6 text-emerald-50">
                {isSymbolMeaningLab
                  ? '你已经从氧元素推到氧原子、氧分子和化学式含义；下面把刚才的发现压成考试可用的规则。'
                  : '你已经根据反应物状态、反应条件、气体性质和操作后果完成了选择；下面整理成可迁移的实验判据。'}
              </p>
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/20 text-lg font-bold text-white transition hover:bg-black/35"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
          ) : learnContent.interactiveWidget ? (
            <div className="relative w-full flex-shrink-0 bg-slate-950 border-b border-slate-200">
              <WidgetRegistry name={learnContent.interactiveWidget} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-4 flex flex-col justify-end pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/25 border border-cyan-400/40 text-[0.65rem] text-cyan-200 font-extrabold tracking-wider uppercase">
                    {node.id.split('-')[0].toUpperCase()} · 核心要点
                  </span>
                  <span className="flex items-center text-amber-400 text-[0.65rem] font-bold">
                    难度 {'⭐'.repeat(node.difficulty)}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1.5 tracking-tight drop-shadow-md">
                  {node.topic}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all text-lg font-bold z-10"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
          ) : hasNodeIllustration ? (
            <div className="relative w-full flex-shrink-0 overflow-hidden bg-slate-950 border-b border-slate-200 p-3">
              <ScenarioIllustration nodeId={node.id} topic={node.topic} />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all text-lg font-bold"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="relative w-full h-56 sm:h-72 flex-shrink-0 overflow-hidden bg-slate-950 border-b border-slate-200">
              <img
                src={coverSrc}
                alt={node.topic}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {/* Topic overlay for image */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-4 flex flex-col justify-end">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all text-lg font-bold"
                  aria-label="关闭"
                >
                  ×
                </button>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/25 border border-cyan-400/40 text-[0.65rem] text-cyan-200 font-extrabold tracking-wider uppercase">
                    {node.id.split('-')[0].toUpperCase()} · 核心要点
                  </span>
                  <span className="flex items-center text-amber-400 text-[0.65rem] font-bold">
                    难度 {'⭐'.repeat(node.difficulty)}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mt-1.5 tracking-tight drop-shadow-md">
                  {node.topic}
                </h3>
              </div>
            </div>
          )}

          {/* Scrollable Content Container */}
          {(!isGatedInteractive || interactiveCompleted) && (
          <div className={`p-5 sm:p-6 space-y-5 ${isClassroomWideWidget ? 'mx-auto w-full max-w-3xl' : ''}`}>
            {/* 1. 知识点检验 (Flashcard Diagnostic Check) */}
            {hasFlashcard && (
              <div className="space-y-2">
                <div className="text-xs font-black text-indigo-700 tracking-wider flex items-center gap-1.5">
                  <span>🧪</span> 化学直觉自测：可以先猜一猜，也可以直接继续
                </div>
                <div
                  onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                  className={`relative w-full h-28 rounded-2xl cursor-pointer transition-all duration-500 preserve-3d shadow-md hover:shadow-lg ${flashcardFlipped ? '[transform:rotateX(180deg)]' : ''}`}
                >
                  {/* 正面 */}
                  <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex flex-col items-center justify-center p-4 text-center border border-indigo-400 shadow-inner">
                    <span className="text-[0.65rem] text-cyan-100 font-black mb-1.5 tracking-widest uppercase">点一下可翻看答案</span>
                    <p className="text-white font-bold text-[0.9rem] sm:text-sm leading-relaxed">{learnContent.flashcard!.front}</p>
                  </div>
                  {/* 背面 */}
                  <div className="absolute inset-0 backface-hidden [transform:rotateX(180deg)] bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex flex-col items-center justify-center p-4 text-center border-2 border-emerald-400">
                    <span className="text-[0.65rem] text-emerald-600 font-black mb-1 tracking-wider">诊断答案</span>
                    <p className="text-emerald-900 font-bold text-xs sm:text-sm leading-relaxed">{learnContent.flashcard!.back}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. 核心概念 (Core Concepts) */}
            <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-2xl p-4.5 border border-indigo-100/50 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.06)]">
              <div className="text-xs font-black text-indigo-800 mb-2 tracking-widest uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> 核心概念
              </div>
              <div className="text-[0.92rem] text-slate-700 leading-relaxed font-medium">{renderMarkdown(learnContent.concept)}</div>
            </div>

            {/* 3. 关键词 (🔑 Keywords) */}
            {learnContent.keywords && learnContent.keywords.length > 0 && (
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-2">
                <div className="text-[0.65rem] text-slate-400 font-bold tracking-wider uppercase">🔑 核心词汇（悬停查看释义）</div>
                <div className="flex flex-wrap gap-2">
                  {learnContent.keywords.map((kw, i) => (
                    <div key={i} className="group relative inline-block">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/95 border border-amber-200/60 text-xs font-bold text-amber-800 cursor-help transition-all hover:bg-amber-100 hover:shadow-md">
                        🔑 {kw.word}
                      </span>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl pointer-events-none text-center">
                        {kw.note}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. 记忆要诀 */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="text-xs font-black text-slate-600 mb-3 tracking-widest uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> 记忆要诀
              </div>
              <ul className="space-y-2.5">
                {learnContent.tips.map((tip, i) => (
                  <li key={i} className="text-[0.88rem] text-slate-700 leading-relaxed flex gap-2.5 items-start">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                    <span className="font-medium">{renderMarkdown(tip)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. 底部操作按钮 */}
            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => {
                  setLearnPhase(hasGuidedLesson ? 'checkpoint' : practiceChallenges.length > 0 ? 'practice' : testChallenges.length > 0 ? 'test' : 'review');
                  setChallengeIdx(0);
                  setCorrect(0);
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5"
              >
                {hasGuidedLesson
                  ? '整理一下，再去练习 →'
                  : practiceChallenges.length > 0
                  ? '开始基础练习 →'
                  : testChallenges.length > 0
                  ? '开始迁移测验 →'
                  : '查看学习总结 →'}
              </button>
              {hasFlashcard && !flashcardFlipped && (
                <p className="text-center text-[11px] font-bold text-slate-400">
                  小卡片只是自测，不会挡住学习进度。
                </p>
              )}
              <button onClick={onClose} className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                {isStageReview ? '返回真卷页' : '返回关卡地图'}
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
    );
  }

  // 学习模式·例题演示
  if (gameMode === 'learn' && learnPhase === 'example' && learnContent.example) {
    const ex = learnContent.example;
    const isAnswered = exampleAnswered !== null;
    const isScenario = Boolean(ex.scenario);

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-colors duration-700">
        <div className="rounded-3xl bg-[var(--bg-card)] p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl border border-[var(--border-color)] relative transition-colors duration-700">
          <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4 transition-colors duration-700">
            <span className="text-3xl bg-amber-100 p-2 rounded-xl">{isScenario ? '🕵️‍♂️' : '💡'}</span>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-[var(--text-main)] transition-colors duration-700">
                挑战前测
              </h3>
              <div className="mt-1 text-xs font-bold text-amber-700 transition-colors duration-700">
                先独立判断，再看针对性点拨
              </div>
            </div>
          </div>

          {isScenario && (
            <div className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-highlight)]/70 p-4 shadow-inner">
              {hasScenarioIllustration(node.id) ? (
                <div className="mb-3">
                  <ScenarioIllustration nodeId={node.id} topic={node.topic} />
                </div>
              ) : ex.scenarioImage && (
                <div className="mb-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-lg">
                  <img src={ex.scenarioImage} alt={`${node.topic}场景`} className="h-40 w-full object-cover" />
                </div>
              )}
              <div className="absolute right-0 top-0 p-3 text-4xl opacity-10">🎬</div>
              <p className="relative z-10 text-sm font-medium leading-relaxed text-[var(--text-main)]">{renderMarkdown(ex.scenario!)}</p>
            </div>
          )}

          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] p-4 text-[0.95rem] font-bold leading-relaxed text-[var(--text-main)] shadow-sm transition-colors duration-700">
            {renderEq(ex.stem)}
          </div>

          <div className="space-y-2.5">
            {ex.options.map((opt, i) => {
              let btnClass = "w-full text-left px-4 py-3 rounded-2xl border-2 transition-all text-sm font-medium shadow-sm flex items-start gap-3 ";
              const isCorrect = i === ex.answer;

              if (!isAnswered) {
                btnClass += "bg-[var(--bg-card-bright)] border-[var(--border-color)] hover:border-indigo-300 hover:bg-indigo-50 text-[var(--text-main)] hover:-translate-y-0.5";
              } else {
                if (isCorrect) {
                  btnClass += "bg-emerald-50 border-emerald-300 text-emerald-800";
                } else if (exampleAnswered === i) {
                  btnClass += "bg-rose-50 border-rose-300 text-rose-800";
                } else {
                  btnClass += "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                }
              }

              const whyWrongText = !isCorrect && node.learningContent?.whyWrong ? node.learningContent.whyWrong[i < ex.answer ? i : i - 1] : null;

              return (
                <button
                  key={i}
                  onClick={() => { if (!isAnswered) setExampleAnswered(i); }}
                  className={btnClass}
                  disabled={isAnswered}
                >
                  <span className={`shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors duration-700 ${
                    isAnswered && isCorrect ? 'bg-emerald-200 text-emerald-800' :
                    isAnswered && exampleAnswered === i ? 'bg-rose-200 text-rose-800' :
                    'bg-[var(--bg-tag)] text-[var(--text-muted)]'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <div className="flex-1 mt-0.5">
                    <span>{renderEq(opt)}</span>
                    {isAnswered && isCorrect && <div className="text-emerald-600 text-xs font-bold mt-1">✓ 这是正确答案</div>}
                    {isAnswered && exampleAnswered === i && !isCorrect && <div className="text-rose-600 text-xs font-bold mt-1">✗ 回答错误</div>}
                    {isAnswered && whyWrongText && <div className="text-rose-500 text-xs mt-1.5 p-2 bg-rose-100/50 rounded-lg">💬 {whyWrongText}</div>}
                  </div>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm transition-colors duration-700">
              <div className="mb-2 flex items-center gap-1 text-xs font-black uppercase tracking-widest text-amber-800 transition-colors duration-700">
                <span className="text-lg">{isScenario ? '📂' : '👩‍🏫'}</span> {isScenario ? '案情复盘（考点解析）' : '老师解析'}
              </div>
              <div className="text-[0.9rem] font-medium leading-relaxed text-slate-700 transition-colors duration-700">
                {renderMarkdown(ex.explanation)}
              </div>
            </div>
          )}
          {isAnswered && exampleAnswered !== ex.answer && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-800">
              错因方向：{getChallengeMisconceptionTag(node, ex.misconceptionTag)}
            </div>
          )}

          <div className="pt-2">
            {!isAnswered ? (
              <div className="text-center text-xs text-slate-400 font-bold animate-pulse">请选择一个你认为正确的选项</div>
            ) : (
              <button
                onClick={() => { setLearnPhase('card'); setChallengeIdx(0); setCorrect(0); }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5"
              >
                查看针对性点拨 →
              </button>
            )}
            <button onClick={onClose} className="w-full mt-3 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
              {isStageReview ? '返回真卷页' : '退出'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 学习模式·回顾总结
  if (gameMode === 'learn' && learnPhase === 'review') {
    // 基础练习有即时反馈，不计入掌握分；优先用学后迁移题判定是否掌握。
    const score = testChallenges.length > 0
      ? Math.round(correct / testChallenges.length * 100)
      : hasGuidedLesson
        ? guidedOutcomeScore
        : 100;
    const passed = score >= MASTERY_THRESHOLD;
    const guidedStepCount = learnContent.guidedSteps?.length ?? 0;
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[var(--bg-card)] rounded-2xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-xl border border-[var(--border-color)]">
          <div className="text-center">
            <div className="text-5xl mb-2">{passed ? '🎉' : '🧭'}</div>
            <h3 className="text-xl font-bold text-[var(--text-main)]">{passed ? '迁移测验通过！' : '还没有达到掌握线'}</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-indigo-50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-indigo-700">{hasGuidedLesson ? `${guidedStepCount}步` : `${practiceCorrect}/${practiceChallenges.length}`}</div>
              <div className="text-xs text-indigo-600">{hasGuidedLesson ? '导学流程' : '基础练习'}</div>
            </div>
            <div className="bg-teal-50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-teal-700">
                {hasGuidedLesson && testChallenges.length > 0
                  ? `${correct}/${testChallenges.length}`
                  : hasGuidedLesson
                  ? `${guidedDecisionCorrect}/${guidedDecisionCount}`
                  : `${correct}/${testChallenges.length}`}
              </div>
              <div className="text-xs text-teal-600">{testChallenges.length > 0 ? '迁移测验' : '导学判断'}</div>
            </div>
          </div>
          {hasGuidedLesson && guidedDecisionCount > 0 && testChallenges.length > 0 && (
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-center text-xs font-bold text-cyan-800">
              导学判断：{guidedDecisionCorrect}/{guidedDecisionCount} · 掌握分只看学后迁移题
            </div>
          )}
          <div className={`rounded-xl p-4 border ${passed ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-200'}`}>
            <div className={`text-xs font-bold mb-2 ${passed ? 'text-emerald-700' : 'text-amber-800'}`}>
              迁移成绩：{score}% · 掌握线 {MASTERY_THRESHOLD}% · {passed ? '已达到' : '尚未达到'}
            </div>
            {learnContent.summary && (
              <p className="text-sm text-[var(--text-main)] leading-relaxed">{learnContent.summary}</p>
            )}
          </div>
          {!passed ? (
            <div className="space-y-2.5">
              <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-bold leading-relaxed text-rose-800">
                错因方向：{learningProfile.misconceptionTag}。本次结果会保留，但不会解锁下一关。
              </div>
              <button
                onClick={() => {
                  setLearnPhase(testChallenges.length > 0 ? 'test' : hasGuidedLesson ? 'guided' : 'card');
                  setChallengeIdx(0);
                  setCorrect(0);
                  setSelected(null);
                  setFillAnswer('');
                  setFillCorrect(false);
                  setShowResult(false);
                }}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black transition-colors"
              >
                修正错因，再测一次
              </button>
              <button
                onClick={() => setLearnPhase('card')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-colors"
              >
                重新查看针对性点拨
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-bold text-slate-500 transition-colors hover:text-slate-700"
              >
                先回关卡地图，查看错题本
              </button>
            </div>
          ) : nextNode && !canChallenge ? (
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  onNextNode?.(nextNode.id);
                }}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>下一关：{nextNode.topic} →</span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-colors"
              >
                {isStageReview ? '回真卷页' : '回地图'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (canChallenge) {
                  onComplete(node.id, score);
                  setCompletionScore(score);
                  setIsComplete(true);
                } else {
                  onClose();
                }
                setLearnPhase('card');
              }}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold transition-colors"
            >
              {isStageReview ? '确认掌握' : hasGuidedLesson ? '确认掌握' : canChallenge ? '确认掌握并完成本关' : '学完了，回地图'}
            </button>
          )}
        </div>
      </div>
    );
  }



  return (
    <div className="fixed inset-0 bg-emerald-950/35 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-[var(--bg-quiz)] rounded-[1.75rem] p-4 sm:p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto relative border-2 border-[var(--border-color)] shadow-2xl shadow-sky-950/20">
        {showXpFloat && (
          <div className="absolute top-4 right-4 text-emerald-600 font-bold text-xl xp-float z-20">
            +{XP_PER_NODE + (currentStreak >= 3 ? XP_BONUS_STREAK : 0)} XP
          </div>
        )}

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 h-9 w-9 rounded-full bg-[var(--bg-card)] text-teal-800 hover:text-[var(--text-main)] border border-[var(--border-color)] text-xl leading-none shadow-sm"
          aria-label="关闭"
        >
          ×
        </button>

        {/* 进度 */}
        <div className="flex items-center justify-center gap-2 mb-5 mt-9 pr-20">
          {currentChallenges.map((_, i) => (
            <div
              key={i}
              className={`h-2.5 rounded-full transition-all ${
                i < challengeIdx ? 'w-8 bg-emerald-400' : i === challengeIdx ? 'w-10 bg-teal-500 shadow-sm shadow-teal-300' : 'w-6 bg-[var(--bg-disabled)]'
              }`}
            />
          ))}
        </div>

        {/* 吉祥物 */}
        <div className="absolute top-2 right-5">
          <Mascot mood={mascotMood} />
        </div>

        {/* 大题场景 */}
        {isBig && node.bigQuestion && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-3">
            <div className="text-xs text-amber-700 font-bold mb-1.5">📋 综合大题</div>
            <div className="text-sm text-slate-800 leading-relaxed">{renderEq(node.bigQuestion.context)}</div>
          </div>
        )}

        {/* 题目 */}
        {challenge ? (
          <>
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-teal-800 mb-2">
              <span className="font-medium">{isBig ? `子题 ${challengeIdx + 1}/${total}` : node.topic}</span>
              <span className="text-amber-500 text-[0.65rem]" title={`难度: ${'⭐'.repeat(getDifficulty(currentChallenges, challengeIdx))}`}>
                {DOTS[getDifficulty(currentChallenges, challengeIdx)]}
              </span>
              {sourceLabel && (
                <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[0.65rem] font-black text-cyan-700 border border-cyan-100">
                  {sourceLabel}
                </span>
              )}
              {isStageReview && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[0.65rem] font-black text-amber-700 border border-amber-100">
                  阶段复习 · 先测后补
                </span>
              )}
              {(attempts ?? 0) > 0 && <span className="text-amber-600 text-[0.65rem]">第{attempts! + 1}次</span>}
            </div>
            <h3 className="text-lg font-bold text-[var(--text-main)] leading-relaxed pr-2">{renderEq(challenge.stem)}</h3>
          </div>

          {/* 选项 / 填空 */}
          <div className="space-y-2.5 mb-4">
          {isFill ? (
            <div className="space-y-3">
              <input
                value={fillAnswer}
                onChange={(event) => setFillAnswer(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') handleFillSubmit(); }}
                disabled={showResult}
                className="w-full rounded-2xl bg-[var(--bg-card)] border-2 border-teal-200 px-4 py-3 text-sm text-[var(--text-main)] outline-none focus:border-teal-500 placeholder-teal-400 shadow-sm"
                placeholder="输入你的答案..."
                autoFocus
              />
              {!showResult && (
                <button
                  onClick={handleFillSubmit}
                  disabled={!fillAnswer.trim()}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-[var(--bg-disabled)] disabled:text-teal-500 text-white rounded-2xl font-bold transition-colors shadow-lg shadow-teal-700/15"
                >
                  确认答案
                </button>
              )}
              {showResult && (
                <div className={`rounded-2xl p-3 border-2 ${fillCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-rose-50 border-rose-300 text-rose-700'}`}>
                  <span className="text-sm">
                    {fillCorrect ? '✅ 正确！' : `❌ 错误，正确答案：${(challenge.fillAnswers ?? []).join(' 或 ')}`}
                  </span>
                </div>
              )}
            </div>
          ) : (
            challenge.options.map((opt, i) => {
            let btnClass = "w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all text-sm font-medium shadow-sm ";
            if (showResult) {
              if (i === challenge.answer) {
                btnClass += "bg-emerald-50 border-emerald-300 text-emerald-800";
              } else if (i === selected) {
                btnClass += "bg-rose-50 border-rose-300 text-rose-800";
              } else {
                btnClass += "bg-[var(--bg-card)]/70 border-[var(--border-color)] text-teal-700";
              }
            } else {
              btnClass += "bg-[var(--bg-card)] border-[var(--border-color)] hover:border-teal-300 hover:bg-[var(--bg-highlight)] text-[var(--text-main)] hover:-translate-y-0.5";
            }

            return (
              <button key={i} onClick={() => handleSelect(i)} className={btnClass} disabled={showResult}>
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
                  {String.fromCharCode(65 + i)}
                </span>
                {renderEq(opt)}
              </button>
            );
          }))}
          </div>
          </>
        ) : (
          <div className="my-8 rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 text-sm text-slate-800">
            这个训练环节暂时没有可用题目，请返回知识树或刷新后重试。
          </div>
        )}

        {/* 解析 */}
        {showResult && (
          <div aria-live="polite" className={`mb-4 rounded-2xl border-2 p-4 ${answerIsCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className={`text-xs font-black tracking-wider ${answerIsCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
              {answerIsCorrect ? '✓ 答对了 · 这条依据用对了' : '再看一步 · 把错因变成依据'}
            </div>
            <div className={`mb-1 mt-2 text-xs font-black ${answerIsCorrect ? 'text-emerald-800' : 'text-amber-800'}`}>
              {answerIsCorrect ? '为什么对' : '正确思路'}
            </div>
            <div className="text-sm text-slate-800 leading-relaxed">{renderEq(challenge.explanation)}</div>
            {(isFill ? !fillCorrect : selected !== challenge.answer) && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800">
                错因方向：{getChallengeMisconceptionTag(node, challenge.misconceptionTag)}
              </div>
            )}
          </div>
        )}

        {/* 下一题按钮 */}
        {showResult && (
          <button
            onClick={handleNext}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold transition-colors shadow-lg shadow-teal-700/15"
          >
            {challengeIdx < currentChallenges.length - 1
              ? answerIsCorrect
                ? '我理解了，下一题 →'
                : '带着这个理由，下一题 →'
              : '查看结果 →'}
          </button>
        )}

        {/* 次要操作默认收起，避免和主按钮抢注意力 */}
        {showResult && (
          <details className="mt-3 overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/75">
            <summary className="cursor-pointer list-none px-4 py-3 text-center text-sm font-black text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-highlight)] [&::-webkit-details-marker]:hidden">
              更多：讨论这题 / 反馈题目
            </summary>
            <div className="border-t border-[var(--border-color)] p-3 pt-0">
          <div className="mt-3">
            {!showDiscuss ? (
              <button
                onClick={() => setShowDiscuss(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 text-indigo-700 text-sm font-bold transition-all"
              >
                <span>💬</span> 去论坛讨论这题
              </button>
            ) : discussSent ? (
              <div className="text-center text-sm text-emerald-600 font-medium py-2">已发到论坛，一会记得去论坛看看</div>
            ) : (
              <div className="bg-[var(--bg-card)] rounded-2xl p-3 border-2 border-indigo-100 space-y-2">
                <div className="text-xs text-indigo-700 font-bold">💬 发到论坛讨论</div>
                <div className="text-xs text-teal-800 bg-sky-50 rounded-xl p-2 max-h-20 overflow-y-auto">
                  {challenge.stem}
                </div>
                <textarea
                  value={discussText}
                  onChange={e => setDiscussText(e.target.value)}
                  className="w-full min-h-14 rounded-xl bg-[var(--bg-card)] border-2 border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-indigo-300 placeholder-teal-400"
                  placeholder="说说你的疑问或想法..."
                />
                <div className="flex gap-2">
                  <button onClick={() => { setShowDiscuss(false); setDiscussText(''); }} className="flex-1 py-2 bg-[var(--bg-disabled)] hover:bg-sky-200 text-teal-800 rounded-xl text-xs font-medium transition-colors">取消</button>
                  <button
                    onClick={async () => {
                      if (!discussText.trim()) return;
                      const postContent = `[题目讨论] ${node.topic}\n\n📝 ${challenge.stem}\n\n💬 ${discussText.trim()}`;
                      const ok = await createPost(postContent, profile?.displayName || profile?.studentName || '同学', profile?.avatar || '');
                      if (ok) { setDiscussSent(true); setDiscussText(''); }
                    }}
                    className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-[var(--bg-disabled)] disabled:text-teal-500 text-white rounded-xl text-xs font-bold transition-colors"
                    disabled={!discussText.trim()}
                  >
                    发布讨论
                  </button>
                </div>
              </div>
            )}
          </div>

        <div className="mt-3">
          {!showFeedback ? (
            <button
              onClick={() => setShowFeedback(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 text-amber-700 text-sm font-bold transition-all"
            >
              这题有问题？点此反馈
            </button>
          ) : (
            <div className="bg-[var(--bg-card)] rounded-2xl p-3 border-2 border-amber-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold mb-1">
                <span>💬</span> 反馈错题
              </div>
              <textarea
                value={feedbackText}
                onChange={(event) => setFeedbackText(event.target.value)}
                className="w-full min-h-20 rounded-xl bg-[var(--bg-card)] border-2 border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-amber-300 placeholder-teal-400"
                placeholder="例如：题干不清楚、答案可能有误、解析看不懂..."
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowFeedback(false);
                    setFeedbackText('');
                  }}
                  className="flex-1 py-2 bg-[var(--bg-disabled)] hover:bg-sky-200 text-teal-800 rounded-xl text-xs font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedbackText.trim()}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-[var(--bg-disabled)] disabled:text-teal-500 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  提交反馈
                </button>
              </div>
            </div>
          )}
          {feedbackSaved && (
            <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600 font-medium">
              <span>✅</span> 反馈已提交，老师会统一查看
            </div>
          )}
        </div>
            </div>
          </details>
        )}

        {/* 状态栏 */}
        <div className="flex items-center justify-between mt-4 text-xs text-teal-800">
          <span>本轮答对 {correct} 题</span>
          {currentStreak > 0 ? (
            <span className={currentStreak >= 5 ? 'text-amber-600 font-bold animate-pulse' : 'font-medium'}>
              {currentStreak >= 5 ? '🔥🔥' : '🔥'} 连续掌握 {currentStreak} 关
            </span>
          ) : (
            <span className="font-medium text-slate-500">先专注当前题</span>
          )}
        </div>
      </div>
    </div>
  );
}
