import { useState, useEffect, useRef } from 'react';

type ElectrolyteType = 'pure' | 'h2so4' | 'naoh' | 'nacl';
type WireConnection = 'normal' | 'reversed' | 'none';
type SplintTool = 'none' | 'glowing' | 'burning' | 'starch_ki';
type MissionChoice = 'look' | 'filter' | 'distill' | 'chemical-change';

interface ElectrolyteInfo {
  key: ElectrolyteType;
  name: string;
  formula: string;
  color: string;
  textColor: string;
  bgColor: string;
  glowColor: string;
  desc: string;
}

const electrolyteOptions: Record<ElectrolyteType, ElectrolyteInfo> = {
  pure: {
    key: 'pure',
    name: '纯水',
    formula: 'H₂O',
    color: '#06b6d4', // cyan
    textColor: 'text-cyan-400',
    bgColor: 'from-cyan-950/20 to-slate-900/30 border-cyan-800/40',
    glowColor: 'rgba(6, 182, 212, 0.2)',
    desc: '不额外加入溶质的水样。先通电观察，再判断它是否适合本实验。',
  },
  h2so4: {
    key: 'h2so4',
    name: '稀硫酸',
    formula: 'H₂SO₄',
    color: '#3b82f6', // blue
    textColor: 'text-blue-400',
    bgColor: 'from-blue-950/20 to-slate-900/30 border-blue-800/40',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    desc: '加入少量稀硫酸的水样。结果暂不揭示，请用气泡和检验现象判断。',
  },
  naoh: {
    key: 'naoh',
    name: '氢氧化钠溶液',
    formula: 'NaOH',
    color: '#a855f7', // purple
    textColor: 'text-purple-400',
    bgColor: 'from-purple-950/20 to-slate-900/30 border-purple-800/40',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    desc: '加入少量氢氧化钠的水样。结果暂不揭示，请用实验记录判断。',
  },
  nacl: {
    key: 'nacl',
    name: '食盐水 (NaCl)',
    formula: 'NaCl',
    color: '#10b981', // emerald (emerald neon indicates chlorine trap)
    textColor: 'text-emerald-400',
    bgColor: 'from-emerald-950/25 to-slate-900/30 border-emerald-800/40',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    desc: '加入少量氯化钠的水样。它是否符合“只研究水的组成”，要由产物检验决定。',
  },
};

export function WaterElectrolysisLab({ onComplete }: { onComplete?: () => void }) {
  const [missionChoice, setMissionChoice] = useState<MissionChoice | null>(null);
  const [missionAccepted, setMissionAccepted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Selections
  const [electrolyte, setElectrolyte] = useState<ElectrolyteType>('pure');
  const [wireConfig, setWireConfig] = useState<WireConnection>('none');
  const [showConfigAlert, setShowConfigAlert] = useState<boolean>(false);

  // Step 2: Reaction States
  const [isPowerOn, setIsPowerOn] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 100
  const [showChlorineWarning, setShowChlorineWarning] = useState<boolean>(false);

  // Step 3: Gas Testing States
  const [activeTool, setActiveTool] = useState<SplintTool>('none');
  const [leftTestedResult, setLeftTestedResult] = useState<'idle' | 'burning_pop' | 'glowing_reignite' | 'extinguished' | 'starch_blue' | 'burn_intense'>('idle');
  const [rightTestedResult, setRightTestedResult] = useState<'idle' | 'burning_pop' | 'glowing_reignite' | 'extinguished' | 'starch_blue' | 'burn_intense'>('idle');

  // Step 4: Summary States
  const [showExtraCard, setShowExtraCard] = useState<boolean>(false);

  // Micro-simulation canvas and particles Refs (high performance, no 60fps React re-renders!)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Array<{
    id: number;
    type: 'H2O' | 'H2' | 'O2' | 'Cl2';
    x: number;
    y: number;
    vx: number;
    vy: number;
    opacity: number;
    state: 'floating' | 'attracted_left' | 'attracted_right' | 'reacting' | 'rising';
    targetElectrode?: 'left' | 'right';
  }>>([]);

  const selectedElectrolyte = electrolyteOptions[electrolyte];

  // Helper reset when changing selections in Step 1
  const handleReset = () => {
    setIsPowerOn(false);
    setProgress(0);
    setLeftTestedResult('idle');
    setRightTestedResult('idle');
    setActiveTool('none');
    setShowChlorineWarning(false);
  };

  const handleSelectElectrolyte = (key: ElectrolyteType) => {
    setElectrolyte(key);
    handleReset();
  };

  const handleSelectWire = (config: WireConnection) => {
    setWireConfig(config);
    handleReset();
  };

  // Step 2 Simulation effect
  useEffect(() => {
    if (step === 2 && isPowerOn) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const stepSpeed = wireConfig === 'none'
            ? 0
            : electrolyte === 'pure'
              ? 0.05
              : 1.0;

          const next = prev + stepSpeed;
          if (next >= 100) {
            clearInterval(interval);
            setIsPowerOn(false);
            // Trigger chlorine warning immediately if NaCl was chosen
            if (electrolyte === 'nacl') {
              setShowChlorineWarning(true);
            }
            return 100;
          }
          return next;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [step, isPowerOn, electrolyte, wireConfig]);

  // Micro Particle simulation loop (Hardware-accelerated Canvas render - no React state lag!)
  useEffect(() => {
    if (step !== 2) return;

    // Seed particles if empty
    if (particlesRef.current.length === 0) {
      const initialParticles = [];
      // H2O molecules
      for (let i = 0; i < 22; i++) {
        initialParticles.push({
          id: i,
          type: 'H2O' as const,
          x: 40 + Math.random() * 220,
          y: 40 + Math.random() * 70,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 0.8,
          opacity: 1.0,
          state: 'floating' as const,
        });
      }
      particlesRef.current = initialParticles;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      // 1. Clear Canvas with high-end dark tone fill representing microscope lens
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Left and Right Electrodes with HSL matching details
      // Left electrode: x=30 to 40, y=30 to 120
      ctx.fillStyle = '#334155';
      ctx.fillRect(30, 30, 8, 90);
      ctx.fillStyle = '#94a3b8';
      ctx.save();
      ctx.translate(36, 75);
      ctx.rotate(-Math.PI / 2);
      ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(wireConfig === 'normal' ? '阳极(+)' : '阴极(-)', 0, 0);
      ctx.restore();

      // Right electrode: x=262 to 270, y=30 to 120
      ctx.fillStyle = '#334155';
      ctx.fillRect(262, 30, 8, 90);
      ctx.fillStyle = '#94a3b8';
      ctx.save();
      ctx.translate(268, 75);
      ctx.rotate(-Math.PI / 2);
      ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(wireConfig === 'normal' ? '阴极(-)' : '阳极(+)', 0, 0);
      ctx.restore();

      // 3. Update and Draw Particles
      particlesRef.current = particlesRef.current.map((p) => {
        let nextX = p.x + p.vx;
        let nextY = p.y + p.vy;
        let nextVx = p.vx;
        let nextVy = p.vy;
        let nextState = p.state;
        let nextType = p.type;
        const nextOpacity = p.opacity;

        // Micro chamber bounds constraint (canvas coordinates)
        if (nextX < 15 || nextX > 285) {
          nextVx = -nextVx;
          nextX = nextX < 15 ? 15 : 285;
        }
        if (nextY < 15 || nextY > 135) {
          nextVy = -nextVy;
          nextY = nextY < 15 ? 15 : 135;
        }

        if (isPowerOn && wireConfig !== 'none') {
          const leftPolarity = wireConfig === 'normal' ? 'positive' : 'negative';
          const rightPolarity = wireConfig === 'normal' ? 'negative' : 'positive';

          // H2O randomly getting drawn to electrodes
          if (p.state === 'floating' && p.type === 'H2O') {
            if (Math.random() < 0.02) {
              const target = Math.random() > 0.5 ? 'left' : 'right';
              nextState = target === 'left' ? 'attracted_left' : 'attracted_right';
              p.targetElectrode = target;
            }
          }

          // Move towards target electrode
          if (nextState === 'attracted_left') {
            const targetX = 35;
            const targetY = 75;
            nextVx = (targetX - p.x) * 0.08;
            nextVy = (targetY - p.y) * 0.08;

            if (Math.abs(p.x - targetX) < 10 && Math.abs(p.y - targetY) < 10) {
              nextState = 'reacting';
              nextVx = 0;
              nextVy = 0;
            }
          } else if (nextState === 'attracted_right') {
            const targetX = 265;
            const targetY = 75;
            nextVx = (targetX - p.x) * 0.08;
            nextVy = (targetY - p.y) * 0.08;

            if (Math.abs(p.x - targetX) < 10 && Math.abs(p.y - targetY) < 10) {
              nextState = 'reacting';
              nextVx = 0;
              nextVy = 0;
            }
          }

          // Electrochemical reaction dissociation & recombination
          if (nextState === 'reacting') {
            const electrode = p.targetElectrode;
            const isLeft = electrode === 'left';
            const pole = isLeft ? leftPolarity : rightPolarity;

            if (pole === 'negative') {
              // Neg electrode: H+ accepts electrons to form H2 gas
              nextType = 'H2';
              nextState = 'rising';
              nextVx = (Math.random() - 0.5) * 0.4;
              nextVy = -1.0 - Math.random() * 0.6;
            } else {
              // Pos electrode: OH- or Cl- loses electrons to form O2 or Cl2 gas
              nextType = electrolyte === 'nacl' ? 'Cl2' : 'O2';
              nextState = 'rising';
              nextVx = (Math.random() - 0.5) * 0.4;
              nextVy = -0.7 - Math.random() * 0.5;
            }
          }

          // Gas bubbles rising
          if (nextState === 'rising') {
            nextY += nextVy;
            nextX += nextVx;
            if (nextY < 15) {
              // Recycled back to the bottom as floating water
              nextType = 'H2O';
              nextState = 'floating';
              nextX = 40 + Math.random() * 220;
              nextY = 110 + Math.random() * 25;
              nextVx = (Math.random() - 0.5) * 1.2;
              nextVy = -0.3 - Math.random() * 0.3;
            }
          }
        } else {
          // If power is off or disconnected, drift neutrally
          if (nextState !== 'floating') {
            nextState = 'floating';
            nextVx = (Math.random() - 0.5) * 1.2;
            nextVy = (Math.random() - 0.5) * 0.8;
          }
        }

        // 4. Painting the Particle onto the Canvas
        ctx.save();
        ctx.globalAlpha = nextOpacity;
        ctx.translate(nextX, nextY);

        if (nextType === 'H2O') {
          // Central Oxygen (Red sphere)
          ctx.beginPath();
          ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#f87171'; // red-400
          ctx.fill();
          // Hydrogen ears (White spheres)
          ctx.beginPath();
          ctx.arc(-4.5, 3.5, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.beginPath();
          ctx.arc(4.5, 3.5, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        } else if (nextType === 'H2') {
          // Hydrogen gas bubble (Two bonded white/blue spheres)
          ctx.fillStyle = '#93c5fd'; // blue-300
          ctx.beginPath();
          ctx.arc(-2.8, 0, 2.8, 0, Math.PI * 2);
          ctx.arc(2.8, 0, 2.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#bfdbfe';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-2.8, 0);
          ctx.lineTo(2.8, 0);
          ctx.stroke();
        } else if (nextType === 'O2') {
          // Oxygen gas bubble (Two bonded red spheres, double bond)
          ctx.fillStyle = '#ef4444'; // red-500
          ctx.beginPath();
          ctx.arc(-3.8, 0, 4.2, 0, Math.PI * 2);
          ctx.arc(3.8, 0, 4.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(-3.8, -1); ctx.lineTo(3.8, -1);
          ctx.moveTo(-3.8, 1); ctx.lineTo(3.8, 1);
          ctx.stroke();
        } else if (nextType === 'Cl2') {
          // Chlorine gas bubble (Two bonded green spheres)
          ctx.fillStyle = '#10b981'; // emerald-500
          ctx.beginPath();
          ctx.arc(-4.2, 0, 4.8, 0, Math.PI * 2);
          ctx.arc(4.2, 0, 4.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#6ee7b7';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(-4.2, 0);
          ctx.lineTo(4.2, 0);
          ctx.stroke();
        }

        ctx.restore();

        return {
          ...p,
          x: nextX,
          y: nextY,
          vx: nextVx,
          vy: nextVy,
          state: nextState,
          type: nextType,
          opacity: nextOpacity,
        };
      });

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [step, isPowerOn, wireConfig, electrolyte]);

  // Derived state: Gas volume offsets for SVG霍夫曼电解器
  // Left and Right tube liquid level y coordinate (range: 50 [full water, 0 gas] to 220 [80% gas])
  // Left tube is connection side L, Right is R.
  // Neg electrode gets 2x gas, Pos gets 1x gas.
  // max displacement is 150px.
  const getGasDisplacement = () => {
    if (wireConfig === 'none') return { leftGas: 0, rightGas: 0, middleRise: 0 };
    const maxGasH2 = 140; // max displacement for Hydrogen (2 volume)
    const maxGasO2 = 70;  // max displacement for Oxygen (1 volume)

    const isLeftPos = wireConfig === 'normal'; // Left positive (O2 / Cl2), Right negative (H2)

    let leftGasVol = (isLeftPos ? maxGasO2 : maxGasH2) * (progress / 100);
    let rightGasVol = (isLeftPos ? maxGasH2 : maxGasO2) * (progress / 100);

    // Adjust for pure water speed block
    if (electrolyte === 'pure') {
      leftGasVol = leftGasVol * 0.02;
      rightGasVol = rightGasVol * 0.02;
    }

    // The water displaced rises in the middle open tube
    // Middle rise is proportional to left displacement + right displacement
    const middleRise = (leftGasVol + rightGasVol) * 0.45;

    return {
      leftGas: leftGasVol,
      rightGas: rightGasVol,
      middleRise: middleRise,
    };
  };

  const { leftGas, rightGas, middleRise } = getGasDisplacement();

  const handleStartElectrolysis = () => {
    if (wireConfig === 'none') {
      setShowConfigAlert(true);
      setTimeout(() => setShowConfigAlert(false), 3000);
      return;
    }
    setIsPowerOn(true);
  };

  // Step 3 Testing Interactions
  // Left tube has gas: LeftPos ? O2 (or Cl2) : H2
  // Right tube has gas: LeftPos ? H2 : O2 (or Cl2)
  const isLeftPos = wireConfig === 'normal';
  const leftGasType = isLeftPos ? (electrolyte === 'nacl' ? 'Cl2' : 'O2') : 'H2';
  const rightGasType = isLeftPos ? 'H2' : (electrolyte === 'nacl' ? 'Cl2' : 'O2');

  const testTube = (side: 'left' | 'right') => {
    if (activeTool === 'none') return;
    const gas = side === 'left' ? leftGasType : rightGasType;
    let result: typeof leftTestedResult = 'idle';

    if (activeTool === 'glowing') {
      if (gas === 'O2') {
        result = 'glowing_reignite'; // Reignites brilliantly
      } else if (gas === 'H2') {
        result = 'extinguished'; // Wood ember quenches
      } else if (gas === 'Cl2') {
        result = 'extinguished'; // Chlorine does not support wood glowing
      }
    } else if (activeTool === 'burning') {
      if (gas === 'H2') {
        result = 'burning_pop'; // Pops cleanly, burns with pale blue flame
      } else if (gas === 'O2') {
        result = 'burn_intense'; // Burns very intensely
      } else if (gas === 'Cl2') {
        result = 'extinguished'; // Extinguished
      }
    } else if (activeTool === 'starch_ki') {
      if (gas === 'Cl2') {
        result = 'starch_blue'; // Turns purple-blue
      } else {
        result = 'idle'; // No change
      }
    }

    if (side === 'left') {
      setLeftTestedResult(result);
    } else {
      setRightTestedResult(result);
    }
  };

  // Scoring in Step 4
  const getDiagnosticScore = () => {
    let feedback = '';

    if (wireConfig === 'none') {
      return { score: 0, title: '实验未成功', text: '未连接直流电极，电解槽没有电流通过。' };
    }

    if (electrolyte === 'pure') {
      return {
        score: 40,
        title: '效率极低',
        text: '虽然连接了电路，但使用纯水做电解液时，缺乏自由移动离子，导电性极差，反应几乎静止。',
      };
    }

    if (electrolyte === 'nacl') {
      return {
        score: 60,
        title: '踩中探究大坑',
        text: '加入食盐水虽然导电极快，但阳极却析出了有毒的氯气（Cl₂）而非氧气。不符合电解水的研究目的。',
      };
    }

    // normal or reversed + h2so4/naoh
    feedback += '成功组装了高效的电解装置。';

    const testedLeftO2 = leftGasType === 'O2' && (leftTestedResult === 'glowing_reignite');
    const testedRightO2 = rightGasType === 'O2' && (rightTestedResult === 'glowing_reignite');
    const testedLeftH2 = leftGasType === 'H2' && (leftTestedResult === 'burning_pop');
    const testedRightH2 = rightGasType === 'H2' && (rightTestedResult === 'burning_pop');

    const o2Correct = testedLeftO2 || testedRightO2;
    const h2Correct = testedLeftH2 || testedRightH2;

    if (o2Correct && h2Correct) {
      feedback += '并以最科学的检验方法，精准验证了氧气（带火星木条复燃）和氢气（燃着木条爆鸣）。满分通关！';
      return { score: 100, title: '卓越通关', text: feedback };
    } else {
      feedback += '完成了反应，但未完成全部气体的科学鉴定（氧气宜用带火星木条，氢气宜用点燃木条）。';
      return { score: 70, title: '操作未完备', text: feedback };
    }
  };

  const diag = getDiagnosticScore();

  if (!missionAccepted) {
    const missionOptions: Array<{
      key: MissionChoice;
      label: string;
      detail: string;
      feedback: string;
    }> = [
      {
        key: 'look',
        label: '观察水的颜色和气味',
        detail: '记录肉眼能看到的性质',
        feedback: '外观可以描述水，却不能证明组成水的元素。我们还缺少能指向“组成”的证据。',
      },
      {
        key: 'filter',
        label: '把水过滤一次',
        detail: '看看滤纸上留下什么',
        feedback: '过滤只能分离不溶性杂质，水本身没有变成新物质，因此仍不能回答水由哪些元素组成。',
      },
      {
        key: 'distill',
        label: '让水蒸发再冷凝',
        detail: '观察液态和气态的变化',
        feedback: '蒸发和冷凝只改变水的状态，水分子本身没有改变，仍不能产生可鉴定的新物质。',
      },
      {
        key: 'chemical-change',
        label: '让水发生可控的化学变化',
        detail: '收集并检验生成的新物质',
        feedback: '抓住了关键：把看不见的组成转化成可以收集、可以检验的产物证据。这正是要进行电解水实验的原因。',
      },
    ];
    const selectedMission = missionOptions.find(option => option.key === missionChoice);
    const missionReady = missionChoice === 'chemical-change';

    return (
      <div className="w-full bg-[#0a0f1d] text-gray-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 my-4 p-5 font-sans relative">
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full blur-[130px] pointer-events-none opacity-20 bg-cyan-500" />
        <div className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full blur-[130px] pointer-events-none opacity-15 bg-indigo-500" />

        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div>
              <div className="text-[10px] font-bold tracking-[0.22em] text-cyan-400 uppercase">MISSION 00 · 先找到实验理由</div>
              <h3 className="mt-2 text-lg md:text-2xl font-bold text-white">一杯无色透明的水，怎么证明它由什么组成？</h3>
              <p className="mt-2 text-xs md:text-sm text-slate-400 leading-relaxed max-w-3xl">
                只看外观，我们知道它是水，却看不见组成它的元素。要得到一个别人也能重复验证的结论，你需要选择哪一种研究策略？
              </p>
            </div>
            <div className="shrink-0 rounded-xl border border-cyan-800/50 bg-cyan-950/30 px-3 py-2 text-[11px] text-cyan-200">
              研究问题 → 证据策略 → 动手检验
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4 md:p-5">
            <p className="text-sm font-bold text-slate-100">你真正需要的证据是什么？</p>
            <p className="mt-1 text-[11px] text-slate-500">先作选择。气体身份和最终结论暂不揭示。</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {missionOptions.map((option, index) => {
                const isSelected = missionChoice === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setMissionChoice(option.key)}
                    className={`rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? missionReady
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_18px_rgba(16,185,129,0.16)]'
                          : 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-900/45 hover:border-cyan-700/70 hover:bg-slate-900/75'
                    }`}
                  >
                    <span className="flex items-start gap-3">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>
                        <span className="block text-xs md:text-sm font-bold text-slate-100">{option.label}</span>
                        <span className="mt-1 block text-[10px] md:text-[11px] text-slate-500">{option.detail}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedMission && (
              <div className={`mt-4 rounded-xl border p-4 ${missionReady ? 'border-emerald-700/60 bg-emerald-950/25' : 'border-amber-800/60 bg-amber-950/20'}`}>
                <div className={`text-xs font-bold ${missionReady ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {missionReady ? '✓ 找到了实验的必要性' : '还不能回答“水由什么组成”'}
                </div>
                <p className="mt-1.5 text-[11px] md:text-xs leading-relaxed text-slate-300">{selectedMission.feedback}</p>
              </div>
            )}
          </div>

          {missionReady && (
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-stretch rounded-2xl border border-blue-800/50 bg-gradient-to-r from-blue-950/35 to-cyan-950/20 p-4 md:p-5">
              <div>
                <div className="text-sm font-bold text-blue-200">为什么要电解水？</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  因为要让水发生可控的化学变化，把“看不见的元素组成”变成“能收集、能检验的新物质”，再依据化学反应前后元素种类不变反推水的组成。
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-300">
                  <div className="rounded-lg border border-slate-700/70 bg-slate-900/55 p-2"><span className="block text-base">👀</span>记录气泡与体积</div>
                  <div className="rounded-lg border border-slate-700/70 bg-slate-900/55 p-2"><span className="block text-base">🧪</span>检验气体性质</div>
                  <div className="rounded-lg border border-slate-700/70 bg-slate-900/55 p-2"><span className="block text-base">🧠</span>用证据反推组成</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMissionAccepted(true)}
                className="min-h-12 md:min-w-48 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-950/40 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                带着问题进入实验 →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0a0f1d] text-gray-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 my-4 flex flex-col p-5 font-sans relative">
      
      {/* Background Neon Glowing */}
      <div 
        className="absolute -top-10 -right-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-all duration-700 opacity-20"
        style={{ backgroundColor: selectedElectrolyte.color }}
      ></div>
      <div className="absolute -bottom-10 -left-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-10 bg-indigo-500"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/80 pb-4 mb-4 z-10">
        <div>
          <h3 className="text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-200 flex items-center gap-2">
            <span>🌊</span> 水的电解与微观重组虚拟实验室
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">上海中考高频压轴考点 · 探究宏观体积比与微观原子重组本质</p>
        </div>
        
        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 mt-3 md:mt-0 text-[10px] bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <span className={`px-2 py-0.5 rounded-lg transition-all ${step === 1 ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30' : 'text-gray-500'}`}>1. 盲盒装配</span>
          <span className="text-gray-700">➔</span>
          <span className={`px-2 py-0.5 rounded-lg transition-all ${step === 2 ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30' : 'text-gray-500'}`}>2. 通电电解</span>
          <span className="text-gray-700">➔</span>
          <span className={`px-2 py-0.5 rounded-lg transition-all ${step === 3 ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30' : 'text-gray-500'}`}>3. 气体检验</span>
          <span className="text-gray-700">➔</span>
          <span className={`px-2 py-0.5 rounded-lg transition-all ${step === 4 ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30' : 'text-gray-500'}`}>4. 实验报告</span>
        </div>
      </div>

      {/* Main Panel Layout (Split Screen) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 z-10">
        
        {/* Left Side: Macro Hofmann Electrolyzer SVG Drawing */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl relative min-h-[360px]">
          
          {/* Real-time parameters display panel (No graphic-overlap, cleanly floated) */}
          <div className="absolute top-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: isPowerOn ? '#10b981' : '#ef4444' }} />
              <span className="text-gray-400">状态:</span>
              <span className={isPowerOn ? "text-emerald-400 font-bold" : "text-gray-400"}>
                {isPowerOn ? '电解进行中...' : progress >= 100 ? '反应完毕' : '待机中'}
              </span>
            </div>
            <div className="flex gap-3 text-gray-300">
              <div>
                <span>L管: </span>
                <span className="text-blue-400 font-bold">
                  {wireConfig === 'none' ? '0.0' : isLeftPos ? (leftGas / 70).toFixed(1) : (leftGas / 140 * 2).toFixed(1)} 
                </span>
                <span className="text-gray-500 text-[10px]"> Vol</span>
              </div>
              <div>
                <span>R管: </span>
                <span className="text-purple-400 font-bold">
                  {wireConfig === 'none' ? '0.0' : isLeftPos ? (rightGas / 140 * 2).toFixed(1) : (rightGas / 70).toFixed(1)}
                </span>
                <span className="text-gray-500 text-[10px]"> Vol</span>
              </div>
            </div>
          </div>

          {/* SVG HOFMANN ELECTROLYZER */}
          <svg viewBox="0 0 280 270" className="w-full max-w-[280px] h-auto mt-6">
            <defs>
              {/* Glass reflex gradient */}
              <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                <stop offset="20%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="85%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
              </linearGradient>
              {/* Wire glow */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Circuit wiring background */}
            {wireConfig !== 'none' && (
              <g opacity={isPowerOn ? 1 : 0.4}>
                {/* Wires from battery to electrodes */}
                {/* Left wire */}
                <path 
                  d="M 50,260 L 80,260 L 80,230" 
                  fill="none" 
                  stroke={wireConfig === 'normal' ? '#ef4444' : '#6b7280'} 
                  strokeWidth="2.5" 
                  strokeDasharray={isPowerOn && wireConfig === 'normal' ? "4 2" : "none"}
                  className={isPowerOn && wireConfig === 'normal' ? "animate-[dash_1s_linear_infinite]" : ""}
                />
                {/* Right wire */}
                <path 
                  d="M 230,260 L 200,260 L 200,230" 
                  fill="none" 
                  stroke={wireConfig === 'normal' ? '#6b7280' : '#ef4444'} 
                  strokeWidth="2.5"
                  strokeDasharray={isPowerOn && wireConfig === 'reversed' ? "4 2" : "none"}
                  className={isPowerOn && wireConfig === 'reversed' ? "animate-[dash_1s_linear_infinite]" : ""}
                />

                {/* Terminals */}
                <circle cx="80" cy="230" r="4" fill="#ef4444" />
                <circle cx="200" cy="230" r="4" fill="#3b82f6" />
              </g>
            )}

            {/* 1. Inside Liquid Body */}
            {/* The liquid forms a continuous body connecting left, middle, right tubes at the bottom (y=200 to 220) */}
            {/* Left tube water top: 50 + leftGas. Height: 220 - (50 + leftGas) */}
            {/* Right tube water top: 50 + rightGas. Height: 220 - (50 + rightGas) */}
            {/* Middle tube water top: 70 - middleRise. Height: 220 - (70 - middleRise) */}
            <path
              d={`
                M 70,${50 + leftGas} 
                L 90,${50 + leftGas} 
                L 90,195
                L 125,195
                L 125,${Math.max(15, 75 - middleRise)}
                L 155,${Math.max(15, 75 - middleRise)}
                L 155,195
                L 190,195
                L 190,${50 + rightGas}
                L 210,${50 + rightGas}
                L 210,215
                L 70,215
                Z
              `}
              fill={electrolyte === 'nacl' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(30, 144, 255, 0.3)'}
              stroke="none"
              className="transition-all duration-300"
            />

            {/* Chlorine Gas accumulation in Positive Tube (NaCl mode) */}
            {electrolyte === 'nacl' && wireConfig !== 'none' && progress > 5 && (
              <rect
                x={isLeftPos ? 70 : 190}
                y="50"
                width="20"
                height={isLeftPos ? leftGas : rightGas}
                fill="rgba(217, 249, 157, 0.4)" // yellow-green chlorine gas representation
                className="transition-all duration-300"
              />
            )}

            {/* Bubbles ascending at the bottom electrodes */}
            {isPowerOn && wireConfig !== 'none' && (
              <g>
                {/* Left Tube Bubbles */}
                <circle cx="80" cy="205" r="1.5" fill="#fff" className="animate-[bob_1s_infinite_0s]" />
                <circle cx="76" cy="180" r="1.2" fill="#fff" className="animate-[bob_1.2s_infinite_0.3s]" />
                <circle cx="84" cy="150" r="1.8" fill="#fff" className="animate-[bob_0.8s_infinite_0.1s]" />
                <circle cx="79" cy="110" r="1.5" fill="#fff" className="animate-[bob_1.4s_infinite_0.5s]" />

                {/* Right Tube Bubbles */}
                <circle cx="200" cy="205" r="1.5" fill="#fff" className="animate-[bob_0.9s_infinite_0.2s]" />
                <circle cx="196" cy="180" r="1.8" fill="#fff" className="animate-[bob_1.3s_infinite_0.1s]" />
                <circle cx="204" cy="150" r="1.2" fill="#fff" className="animate-[bob_1.1s_infinite_0.4s]" />
                <circle cx="201" cy="110" r="1.5" fill="#fff" className="animate-[bob_0.7s_infinite_0.6s]" />
              </g>
            )}

            {/* 2. Glass Hofmann Outline Border */}
            {/* Left tube */}
            <rect x="70" y="48" width="20" height="170" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" rx="2" />
            <line x1="70" y1="48" x2="90" y2="48" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            
            {/* Right tube */}
            <rect x="190" y="48" width="20" height="170" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" rx="2" />
            <line x1="190" y1="48" x2="210" y2="48" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            
            {/* Middle tube with open funnel top */}
            <rect x="125" y="70" width="30" height="148" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            {/* Funnel structure at top */}
            <path d="M 115,15 L 165,15 L 155,70 L 125,70 Z" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            
            {/* Bridge connection bottom */}
            <rect x="90" y="195" width="100" height="20" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

            {/* 3. Scale Marks on Tubes */}
            <g opacity="0.3">
              {[60, 80, 100, 120, 140, 160, 180].map((y) => (
                <g key={y}>
                  {/* Left scale */}
                  <line x1="70" y1={y} x2="76" y2={y} stroke="#fff" strokeWidth="1" />
                  {/* Right scale */}
                  <line x1="204" y1={y} x2="210" y2={y} stroke="#fff" strokeWidth="1" />
                </g>
              ))}
            </g>

            {/* 4. Platinum Foil Electrodes inside tubes */}
            {/* Left electrode */}
            <rect x="76" y="200" width="8" height="12" fill="#4b5563" stroke="#1f2937" strokeWidth="1" />
            <line x1="80" y1="212" x2="80" y2="230" stroke="#9ca3af" strokeWidth="1.5" />

            {/* Right electrode */}
            <rect x="196" y="200" width="8" height="12" fill="#4b5563" stroke="#1f2937" strokeWidth="1" />
            <line x1="200" y1="212" x2="200" y2="230" stroke="#9ca3af" strokeWidth="1.5" />

            {/* Gas Testing Wood Wood animations if active in Step 3 */}
            {step === 3 && (
              <g>
                {/* Left Tube Test Overlay */}
                {leftTestedResult !== 'idle' && (
                  <g>
                    {/* Glowing wood ember / reignite fire */}
                    {leftTestedResult === 'glowing_reignite' && (
                      <g>
                        <path d="M 80,48 L 80,25" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                        <path d="M 80,35 Q 75,20 80,10 Q 85,20 80,35 Z" fill="#ef4444" className="animate-pulse" />
                        <circle cx="80" cy="25" r="12" fill="rgba(239, 68, 68, 0.4)" filter="url(#glow)" />
                      </g>
                    )}
                    {leftTestedResult === 'burn_intense' && (
                      <g>
                        <path d="M 80,48 L 80,25" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                        <path d="M 80,35 Q 70,10 80,-5 Q 90,10 80,35 Z" fill="#facc15" className="animate-pulse" />
                        <circle cx="80" cy="20" r="22" fill="rgba(250, 204, 21, 0.6)" filter="url(#glow)" />
                      </g>
                    )}
                    {leftTestedResult === 'burning_pop' && (
                      <g>
                        <circle cx="80" cy="40" r="10" fill="rgba(56, 189, 248, 0.5)" filter="url(#glow)" />
                        <path d="M 80,48 Q 78,35 80,30 Q 82,35 80,48 Z" fill="#0284c7" />
                        {/* Pop text bubble */}
                        <rect x="40" y="8" width="40" height="15" rx="5" fill="#f43f5e" />
                        <text x="60" y="19" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">噗! Pop</text>
                      </g>
                    )}
                    {leftTestedResult === 'extinguished' && (
                      <path d="M 80,48 L 80,25" stroke="#374151" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                    )}
                    {leftTestedResult === 'starch_blue' && (
                      <g>
                        <rect x="75" y="32" width="10" height="16" fill="#1e3a8a" stroke="#2563eb" strokeWidth="1" />
                        <text x="80" y="25" fill="#60a5fa" fontSize="7" textAnchor="middle" fontWeight="bold">淀粉KI试纸变蓝</text>
                      </g>
                    )}
                  </g>
                )}

                {/* Right Tube Test Overlay */}
                {rightTestedResult !== 'idle' && (
                  <g>
                    {/* Glowing wood ember / reignite fire */}
                    {rightTestedResult === 'glowing_reignite' && (
                      <g>
                        <path d="M 200,48 L 200,25" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                        <path d="M 200,35 Q 195,20 200,10 Q 205,20 200,35 Z" fill="#ef4444" className="animate-pulse" />
                        <circle cx="200" cy="25" r="12" fill="rgba(239, 68, 68, 0.4)" filter="url(#glow)" />
                      </g>
                    )}
                    {rightTestedResult === 'burn_intense' && (
                      <g>
                        <path d="M 200,48 L 200,25" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                        <path d="M 200,35 Q 190,10 200,-5 Q 210,10 200,35 Z" fill="#facc15" className="animate-pulse" />
                        <circle cx="200" cy="20" r="22" fill="rgba(250, 204, 21, 0.6)" filter="url(#glow)" />
                      </g>
                    )}
                    {rightTestedResult === 'burning_pop' && (
                      <g>
                        <circle cx="200" cy="40" r="10" fill="rgba(56, 189, 248, 0.5)" filter="url(#glow)" />
                        <path d="M 200,48 Q 198,35 200,30 Q 202,35 200,48 Z" fill="#0284c7" />
                        {/* Pop text bubble */}
                        <rect x="160" y="8" width="40" height="15" rx="5" fill="#f43f5e" />
                        <text x="180" y="19" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">噗! Pop</text>
                      </g>
                    )}
                    {rightTestedResult === 'extinguished' && (
                      <path d="M 200,48 L 200,25" stroke="#374151" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                    )}
                    {rightTestedResult === 'starch_blue' && (
                      <g>
                        <rect x="195" y="32" width="10" height="16" fill="#1e3a8a" stroke="#2563eb" strokeWidth="1" />
                        <text x="200" y="25" fill="#60a5fa" fontSize="7" textAnchor="middle" fontWeight="bold">淀粉KI试纸变蓝</text>
                      </g>
                    )}
                  </g>
                )}
              </g>
            )}
          </svg>

          {/* Liquid level dynamics helper definitions */}
          <style>{`
            @keyframes bob {
              0% { transform: translateY(0px) scale(0.8); opacity: 0; }
              50% { opacity: 0.8; }
              100% { transform: translateY(-110px) scale(1.1); opacity: 0; }
            }
            @keyframes dash {
              to {
                stroke-dashoffset: -18;
              }
            }
          `}</style>

          {/* Indicator for switch wiring */}
          <div className="mt-4 text-[10px] text-gray-400 font-sans text-center flex flex-col gap-1">
            <div>🔌 电极配置: {wireConfig === 'none' ? '❌ 未连线' : wireConfig === 'normal' ? '🔴 左正右负 (左红右蓝)' : '🔵 左负右正 (左蓝右红)'}</div>
            <div>💧 导电介质: <span className={selectedElectrolyte.textColor + " font-bold"}>{selectedElectrolyte.name} ({selectedElectrolyte.formula})</span></div>
          </div>
        </div>

        {/* Right Side: Control Panels & Dynamic micro visualization */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          
          {/* STEP 1: BLIND BOX PANEL */}
          {step === 1 && (
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
              <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">🔬 第一步: 装置与导电液装配（盲盒模式）</h4>
              
              {/* Select Wire Connection */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] text-gray-300">1. 连接直流电极线 (不暴露最终生成极):</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'normal' as const, label: '红线接左, 蓝线接右', desc: '正常接法' },
                    { key: 'reversed' as const, label: '蓝线接左, 红线接右', desc: '反向接法' },
                    { key: 'none' as const, label: '暂不连线', desc: '无电流' },
                  ].map((cfg) => (
                    <button
                      key={cfg.key}
                      onClick={() => handleSelectWire(cfg.key)}
                      className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all ${
                        wireConfig === cfg.key 
                          ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_0_12px_rgba(59,130,246,0.25)]' 
                          : 'border-slate-800 bg-slate-900/20 text-gray-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{cfg.label}</span>
                      <span className="text-[8px] text-gray-500 mt-1">{cfg.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Electrolyte */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[11px] text-gray-300">2. 添加导电介质 (不剧透电解快慢):</span>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(electrolyteOptions) as ElectrolyteType[]).map((key) => {
                    const opt = electrolyteOptions[key];
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectElectrolyte(key)}
                        className={`p-2.5 rounded-lg border text-left flex flex-col transition-all relative overflow-hidden ${
                          electrolyte === key 
                            ? `border-blue-500 bg-blue-500/10 text-white shadow-[0_0_12px_${opt.glowColor}]` 
                            : 'border-slate-800 bg-slate-900/20 text-gray-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[11px] font-bold">{opt.name}</span>
                          <span className="text-[9px] font-mono opacity-80">{opt.formula}</span>
                        </div>
                        <span className="text-[9px] text-gray-500 mt-1 line-clamp-1 leading-snug">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Confirm to Step 2 */}
              <button
                onClick={() => setStep(2)}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_16px_rgba(59,130,246,0.4)] mt-2"
              >
                装配完毕，进入通电车间 ➔
              </button>
            </div>
          )}

          {/* STEP 2: REACTION AND MICRO LINKAGE */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              
              {/* Macro Switch controls */}
              <div className="bg-slate-900/40 border border-slate-800 p-3.5 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">⚡ 第二步: 通电电解反应</h4>
                  <button 
                    onClick={() => { handleReset(); setStep(1); }} 
                    className="text-[9px] text-gray-400 hover:text-blue-400"
                  >
                    🛠️ 重新组装
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleStartElectrolysis}
                      disabled={isPowerOn || progress >= 100}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        isPowerOn 
                          ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 cursor-not-allowed'
                          : progress >= 100
                            ? 'bg-slate-800 text-gray-500 cursor-not-allowed border border-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)]'
                      }`}
                    >
                      {isPowerOn ? '⚡ 电解槽通电中' : progress >= 100 ? '✅ 电解已完成' : '🔌 闭合开关开始电解'}
                    </button>

                    <button
                      onClick={() => setIsPowerOn(false)}
                      disabled={!isPowerOn}
                      className="px-3 py-2 bg-red-950/40 border border-red-800/40 hover:bg-red-900/20 text-red-400 rounded-lg text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      📴 断开开关
                    </button>
                  </div>

                  {/* Reaction Speed alerts */}
                  {showConfigAlert && (
                    <div className="text-[10px] text-rose-400 border border-rose-950 bg-rose-950/20 p-2 rounded-lg text-center font-bold">
                      ⚠️ 电极线未连接！请先返回第一步组装电路电极。
                    </div>
                  )}

                  {isPowerOn && electrolyte === 'pure' && (
                    <div className="text-[10px] text-amber-400 border border-amber-950 bg-amber-950/20 p-2 rounded-lg text-center">
                      ⏳ 纯水导电度极低，没有添加电解质。气泡反应极度缓慢（接近静止），请点击上方重新组装，加入稀硫酸或烧碱。
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex justify-between text-[9px] text-gray-400">
                      <span>气柱收集进度</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Step 2 to Step 3 trigger */}
                  <button
                    onClick={() => {
                      setIsPowerOn(false);
                      setStep(3);
                    }}
                    disabled={progress < 10}
                    className="w-full py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-gray-500 text-white font-bold rounded-lg text-[10px] transition-all disabled:opacity-40 disabled:shadow-none shadow-[0_4px_10px_rgba(59,130,246,0.2)] mt-1"
                  >
                    气体证据已足够，开始气体检验 ➔
                  </button>
                </div>
              </div>

              {/* MICROSCOPIC WATER MOLECULE ANIMATION CONTAINER */}
              <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">⚛️ 微观线索记录区</span>
                  <span className="text-[9px] text-gray-500 font-mono">气体身份待检验</span>
                </div>
                
                {/* Micro viewport (Direct Canvas drawing for butter-smooth 60fps performance) */}
                <div className="w-full h-[150px] bg-[#020617] border border-slate-900 rounded-lg relative overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={150}
                    className="w-full h-full block"
                  />
                  
                  {/* Quench/Power-off Micro-Labels */}
                  {!isPowerOn && (
                    <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-[1px] flex items-center justify-center text-center p-4">
                      <span className="text-[10px] text-gray-500">
                        ⚡ 闭合上方开关通电后，水分子的微观运动解体过程在此实时显示
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-[9px] text-gray-400 mt-2 leading-relaxed flex items-center gap-1">
                  <span>💡</span>
                  <span>
                    先记录两侧气泡多少、液面怎样变化以及微粒种类是否改变。**不要仅凭左右位置给气体命名**，下一步要用性质检验确认身份。
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: GAS TESTING */}
          {step === 3 && (
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">🧪 第三步: 收集气体理化性质鉴定</h4>
                <button 
                  onClick={() => { handleReset(); setStep(1); }} 
                  className="text-[9px] text-gray-400 hover:text-blue-400"
                >
                  🛠️ 重新反应
                </button>
              </div>

              <span className="text-[11px] text-gray-300">
                左右收集管已有可用于虚拟检验的气体。请选择下方检测工具，再点击对应管口进行盲试：
              </span>

              {/* Tool selector buttons */}
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[
                  { key: 'glowing' as const, icon: '🔥', label: '带火星的木条', desc: '常用于检测助燃气体' },
                  { key: 'burning' as const, icon: '💥', label: '燃着的木条', desc: '用于测试气体可燃爆鸣' },
                  { key: 'starch_ki' as const, icon: '🧻', label: '淀粉KI试纸', desc: '测试强氧化性有毒卤素' },
                ].map((tool) => (
                  <button
                    key={tool.key}
                    onClick={() => setActiveTool(tool.key)}
                    className={`p-2.5 rounded-lg border text-center flex flex-col items-center justify-between transition-all ${
                      activeTool === tool.key 
                        ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]' 
                        : 'border-slate-800 bg-slate-900/20 text-gray-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-lg">{tool.icon}</span>
                    <span className="text-[10px] font-bold mt-1">{tool.label}</span>
                    <span className="text-[8px] text-gray-500 mt-1">{tool.desc}</span>
                  </button>
                ))}
              </div>

              {/* Click-to-Test Target areas representation */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => testTube('left')}
                  disabled={activeTool === 'none'}
                  className="py-2.5 px-3 bg-slate-900/80 hover:bg-slate-800 text-xs font-bold rounded-lg border border-slate-800 text-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {activeTool === 'none' ? '👈 请先选择检测工具' : '🔬 点击测试【左管】气体'}
                </button>
                <button
                  onClick={() => testTube('right')}
                  disabled={activeTool === 'none'}
                  className="py-2.5 px-3 bg-slate-900/80 hover:bg-slate-800 text-xs font-bold rounded-lg border border-slate-800 text-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {activeTool === 'none' ? '👉 请先选择检测工具' : '🔬 点击测试【右管】气体'}
                </button>
              </div>

              {/* Feedback messages based on tests */}
              <div className="flex flex-col gap-2 mt-1">
                {leftTestedResult !== 'idle' && (
                  <div className="text-[10.5px] p-2 bg-slate-950/60 border border-slate-900 rounded-lg flex items-start gap-2">
                    <span className="text-blue-400">【左管检测报告】</span>
                    <span className="text-gray-300">
                      {leftTestedResult === 'glowing_reignite' && '🔥 带火星木条瞬间复燃！产生极亮的白光，证明左管收集的是氧气 (O₂)。'}
                      {leftTestedResult === 'burn_intense' && '✨ 燃着木条燃烧得极度剧烈，耀眼白光，证明左管中富集助燃氧气 (O₂)。'}
                      {leftTestedResult === 'burning_pop' && '💥 触发了清脆的“噗”的一声爆鸣音！并伴随微弱淡蓝色火焰，证明左管收集的是高纯度氢气 (H₂)。'}
                      {leftTestedResult === 'extinguished' && '💨 放入木条后，木条火星瞬间熄灭。证明此极非氧气极。'}
                      {leftTestedResult === 'starch_blue' && '🧻 湿润的淀粉碘化钾试纸瞬间变蓝！左管充满了刺激性黄绿气体，生成了有毒氯气 (Cl₂)。踩中电解NaCl陷阱。'}
                    </span>
                  </div>
                )}

                {rightTestedResult !== 'idle' && (
                  <div className="text-[10.5px] p-2 bg-slate-950/60 border border-slate-900 rounded-lg flex items-start gap-2">
                    <span className="text-purple-400">【右管检测报告】</span>
                    <span className="text-gray-300">
                      {rightTestedResult === 'glowing_reignite' && '🔥 带火星木条瞬间复燃！产生极亮的白光，证明右管收集的是氧气 (O₂)。'}
                      {rightTestedResult === 'burn_intense' && '✨ 燃着木条燃烧得极度剧烈，耀眼白光，证明右管中富集助燃氧气 (O₂)。'}
                      {rightTestedResult === 'burning_pop' && '💥 触发了清脆的“噗”的一声爆鸣音！并伴随微弱淡蓝色火焰，证明右管收集的是高纯度氢气 (H₂)。'}
                      {rightTestedResult === 'extinguished' && '💨 放入木条后，木条火星瞬间熄灭。证明此极非氧气极。'}
                      {rightTestedResult === 'starch_blue' && '🧻 湿润的淀粉碘化钾试纸瞬间变蓝！右管充满了刺激性黄绿气体，生成了有毒氯气 (Cl₂)。踩中电解NaCl陷阱。'}
                    </span>
                  </div>
                )}
              </div>

              {/* Proceed to Step 4 */}
              <button
                onClick={() => setStep(4)}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-[0_4px_12px_rgba(59,130,246,0.3)] mt-1"
              >
                生成我的实验诊断报告 ➔
              </button>
            </div>
          )}

          {/* STEP 4: DIAGNOSTIC REPORT */}
          {step === 4 && (
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">🎓 第四步: 实验诊断与大纲梳理</h4>
                <button 
                  onClick={() => { handleReset(); setStep(1); }} 
                  className="text-[9px] text-gray-400 hover:text-blue-400"
                >
                  🔄 重做实验
                </button>
              </div>

              {/* Score card (High premium aesthetic) */}
              <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-xl flex items-center gap-4">
                <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-2 border-dashed border-blue-500/50 flex-shrink-0">
                  <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{diag.score}</span>
                  <span className="text-[7px] text-gray-500 absolute bottom-1 font-bold">SCORE</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-200">{diag.title}</span>
                  <span className="text-[10px] text-gray-400 mt-1 leading-relaxed">{diag.text}</span>
                </div>
              </div>

              {/* Core Syllabus Card */}
              <div className="border border-slate-800/80 bg-slate-900/20 p-3 rounded-lg flex flex-col gap-1.5">
                <span className="text-[10.5px] font-bold text-blue-400">💡 考前黄金背诵口诀与原理解读:</span>
                <div className="text-[10px] text-gray-300 leading-relaxed font-mono flex flex-col gap-1">
                  <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800 text-center font-bold text-amber-400 text-xs">
                    正氧负氢，氢二氧一！
                  </div>
                  <div className="mt-1">🧪 **反应原理**: 2H₂O ==通电== 2H₂↑ + O₂↑</div>
                  <div>📏 **体积比例**: V(H₂) : V(O₂) = 2 : 1</div>
                  <div>⚖️ **微观解释**: 电解时，水分子分裂为氢原子和氧原子，原子重新结合成氢分子(H₂)和氧分子(O₂)。生成两种新物质，属于化学变化。</div>
                  <div>✅ **物理压强**: 液面退缩证明生成了密闭气体；中间开路管液位上升说明被挤出水。</div>
                </div>
              </div>

              {/* Chlorine Special Tip if used NaCl */}
              {electrolyte === 'nacl' && (
                <div className="border border-emerald-950 bg-emerald-950/15 p-3 rounded-lg text-[10px] text-emerald-400 leading-relaxed">
                  ⚠️ **电解食盐水深度剖析 (中考压轴题)**: 食盐水导电性虽强，但阳极上氯离子(Cl⁻)失电子能力远强于水解出的氢氧根(OH⁻)。因此阳极不产生氧气，而是剧烈释放黄绿色的有毒氯气(Cl₂)，电解液中生成NaOH（工业氯碱工业）。本实验只能使用稀硫酸或烧碱！
                </div>
              )}

              {/* Advanced folded neon badge card */}
              <div className="relative">
                <button
                  onClick={() => setShowExtraCard(!showExtraCard)}
                  className="w-full py-1.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-gray-300 font-bold rounded-lg text-[10px] transition-all flex items-center justify-center gap-1"
                >
                  <span>💡</span> {showExtraCard ? '收起高中超纲拓展卡片' : '展开高中超纲拓展卡片 (该内容本阶段不要求掌握)'}
                </button>

                {showExtraCard && (
                  <div className="mt-2 p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-lg text-[9.5px] text-indigo-300 leading-relaxed flex flex-col gap-2 shadow-[0_4px_16px_rgba(99,102,241,0.15)]">
                    <span className="font-bold text-[10.5px] text-indigo-400">💡 进阶拓展卡片 (超纲分层学习)</span>
                    <div>
                      <span className="font-bold">1. 为什么纯水电离度极弱？</span>
                      <p className="mt-0.5 text-gray-400">水是极弱的电解质，自身电离极其有限 (2H₂O ⇌ H₃O⁺ + OH⁻)。常温下电离常数 Kw = 1.0 × 10⁻¹⁴，纯水中氢离子与氢氧根浓度仅为 1.0 × 10⁻⁷ mol/L。自由移动的电荷极少，所以纯水极难导电。</p>
                    </div>
                    <div>
                      <span className="font-bold">2. 工业氯碱工业的电极方程式：</span>
                      <p className="mt-0.5 text-gray-400">
                        阳极(正极)反应：2Cl⁻ - 2e⁻ ➔ Cl₂↑ (氯气) <br/>
                        阴极(负极)反应：2H⁺ + 2e⁻ ➔ H₂↑ (氢气) <br/>
                        总反应方程式：2NaCl + 2H₂O ➔(通电) 2NaOH + H₂↑ + Cl₂↑ (用于工业生产烧碱和氯气)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {diag.score === 100 ? (
                <button
                  type="button"
                  onClick={onComplete}
                  className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-black text-emerald-950 transition hover:bg-emerald-300"
                >
                  证据链完成，整理规律并进入迁移题 →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-black text-amber-200 transition hover:bg-amber-500/20"
                >
                  返回气体检验，补齐氧气与氢气证据
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Chlorine alert modal (floating warning) */}
      {showChlorineWarning && (
        <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-800 p-5 rounded-2xl max-w-sm flex flex-col items-center text-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
            <span className="text-4xl">☣️</span>
            <h4 className="text-sm font-bold text-emerald-400 mt-3">发生严重实验意外：阳极释放有毒氯气！</h4>
            <p className="text-[10px] text-gray-300 mt-2 leading-relaxed">
              由于您加入了 **食盐水 (NaCl)** 做为导电介质，电解通电后，带负电的氯离子(Cl⁻)在阳极(正极)极易失去电子，生成了**黄绿色、具有强烈刺激性气味的剧毒气体 —— 氯气 (Cl₂)**！
            </p>
            <p className="text-[9.5px] text-emerald-500 mt-2 font-bold bg-emerald-950/40 p-1.5 rounded border border-emerald-900/30">
              中考考点警示：电解水实验绝不能用食盐水！正确的导电介质应是稀硫酸(H₂SO₄)或氢氧化钠(NaOH)。
            </p>
            <button
              onClick={() => setShowChlorineWarning(false)}
              className="mt-4 px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[10px] transition-all"
            >
              我知道了，戴上防毒面具继续气体性质检测
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
