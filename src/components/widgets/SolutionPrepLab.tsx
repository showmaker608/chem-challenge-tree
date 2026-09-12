import { useState, useEffect } from 'react';
import { GraduatedCylinderReader } from './GraduatedCylinderReader';

type SoluteKey = 'nacl' | 'naoh' | 'nh4no3';

interface SoluteInfo {
  key: SoluteKey;
  name: string;
  formula: string;
  nickName: string;
  targetPercent: number;
  totalWeight: number; // 50g
  correctSoluteMass: number; // 2.5g | 5.0g | 4.0g
  correctWaterVol: number; // 47.5mL | 45.0mL | 46.0mL
  finalTemp: number; // 25 | 65 | 5
  color: string;
  textColor: string;
  bgColor: string;
  glowColor: string;
  desc: string;
}

const soluteOptions: Record<SoluteKey, SoluteInfo> = {
  nacl: {
    key: 'nacl',
    name: '氯化钠',
    formula: 'NaCl',
    nickName: '食盐',
    targetPercent: 5,
    totalWeight: 50,
    correctSoluteMass: 2.5,
    correctWaterVol: 47.5,
    finalTemp: 25,
    color: '#06b6d4', // cyan-500
    textColor: 'text-cyan-400',
    bgColor: 'from-cyan-950/30 to-slate-900/30 border-cyan-800/50',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    desc: '化学实验室最基础的溶液配制，用于日常生理盐水等实验研究。',
  },
  naoh: {
    key: 'naoh',
    name: '氢氧化钠',
    formula: 'NaOH',
    nickName: '烧碱/火碱',
    targetPercent: 10,
    totalWeight: 50,
    correctSoluteMass: 5.0,
    correctWaterVol: 45.0,
    finalTemp: 65,
    color: '#f97316', // orange-500
    textColor: 'text-orange-400',
    bgColor: 'from-orange-950/30 to-slate-900/30 border-orange-800/50',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    desc: '工业上广泛使用的强碱固体，易潮解。让我们配制并观察它的特征。',
  },
  nh4no3: {
    key: 'nh4no3',
    name: '硝酸铵',
    formula: 'NH₄NO₃',
    nickName: '硝铵',
    targetPercent: 8,
    totalWeight: 50,
    correctSoluteMass: 4.0,
    correctWaterVol: 46.0,
    finalTemp: 5,
    color: '#3b82f6', // blue-500
    textColor: 'text-blue-400',
    bgColor: 'from-blue-950/30 to-slate-900/30 border-blue-800/50',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    desc: '常见氮肥的主要活性成分。让我们量取并探寻它溶于水的过程。',
  },
};

export function SolutionPrepLab() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [soluteKey, setSoluteKey] = useState<SoluteKey>('nacl');

  // Step 2 Calculations & Measurements State
  const [inputSolute, setInputSolute] = useState<string>('');
  const [inputWater, setInputWater] = useState<string>('');
  const [showCalcCheck, setShowCalcCheck] = useState<boolean>(false);

  const [eyeAngle, setEyeAngle] = useState<'normal' | 'up' | 'down'>('normal');

  // Step 3 Dissolution State
  const [isStirring, setIsStirring] = useState<boolean>(false);
  const [stirProgress, setStirProgress] = useState<number>(0);
  const [currentTemp, setCurrentTemp] = useState<number>(25);

  // Step 4 Label State
  const [customLabel, setCustomLabel] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [showExtraCard, setShowExtraCard] = useState<boolean>(false);
  const [hasConfirmedMeasurements, setHasConfirmedMeasurements] = useState<boolean>(false);

  // Global variables based on selections
  const solute = soluteOptions[soluteKey];

  // Logic Reset when changing solute
  const handleSelectSolute = (key: SoluteKey) => {
    setSoluteKey(key);
    setInputSolute('');
    setInputWater('');
    setShowCalcCheck(false);
    setEyeAngle('normal');
    setHasConfirmedMeasurements(false);
    setIsStirring(false);
    setStirProgress(0);
    setCurrentTemp(25);
    setCustomLabel('');
    setIsSaved(false);
    setStep(2);
  };

  // Step 2 Validation
  const soluteInputVal = parseFloat(inputSolute);
  const waterInputVal = parseFloat(inputWater);
  const isCalcCorrect =
    Math.abs(soluteInputVal - solute.correctSoluteMass) < 0.05 &&
    Math.abs(waterInputVal - solute.correctWaterVol) < 0.05;

  // Calculation of Actual physics parameters after Step 2 decisions
  const getActualWaterVolume = () => {
    const base = isCalcCorrect ? solute.correctWaterVol : (waterInputVal || solute.correctWaterVol);
    if (eyeAngle === 'up') {
      return base + 4.5; // 仰视量取的水偏多
    }
    if (eyeAngle === 'down') {
      return Math.max(5.0, base - 4.5); // 俯视量取的水偏少
    }
    return base;
  };

  const actualSolute = isCalcCorrect ? solute.correctSoluteMass : (soluteInputVal || solute.correctSoluteMass);
  const actualWater = getActualWaterVolume();
  const actualMassPercent = (actualSolute / (actualSolute + actualWater)) * 100;

  const activeEyeAngle = hasConfirmedMeasurements ? eyeAngle : 'normal';

  // Step 3 simulation effect
  useEffect(() => {
    if (step === 3 && isStirring) {
      const interval = setInterval(() => {
        setStirProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsStirring(false);
            return 100;
          }
          return prev + 2.5;
        });

        setCurrentTemp((prev) => {
          const diff = solute.finalTemp - prev;
          if (Math.abs(diff) < 0.5) return solute.finalTemp;
          return prev + diff * 0.08;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step, isStirring, solute.finalTemp]);

  const handleStartStirring = () => {
    setIsStirring(true);
    setStirProgress(0);
    setCurrentTemp(25);
  };

  return (
    <div className="w-full bg-[#0a0f1d] text-gray-100 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 my-4 flex flex-col p-5 font-sans relative">
      
      {/* Glow Effects */}
      <div 
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none transition-all duration-700 opacity-20"
        style={{ backgroundColor: solute.color }}
      ></div>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/80 pb-4 mb-4">
        <div>
          <h3 className="text-base md:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-indigo-200 flex items-center gap-2">
            <span>🧪</span> 溶液配制与热效应模拟实验室
          </h3>
          <p className="text-[11px] text-gray-400 mt-1">上海中考核心大考点 · 溶液配制步骤、溶解温变与读数误差探究</p>
        </div>
        
        {/* Navigation Indicator */}
        <div className="flex items-center gap-1.5 mt-3 md:mt-0 text-[10px] bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <span className={`px-2 py-0.5 rounded-lg font-medium transition-all ${step === 1 ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-gray-500'}`}>1. 选择溶质</span>
          <span className="text-gray-700">➔</span>
          <span className={`px-2 py-0.5 rounded-lg font-medium transition-all ${step === 2 ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-gray-500'}`}>2. 计算与称量</span>
          <span className="text-gray-700">➔</span>
          <span className={`px-2 py-0.5 rounded-lg font-medium transition-all ${step === 3 ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-gray-500'}`}>3. 溶解与热效应</span>
          <span className="text-gray-700">➔</span>
          <span className={`px-2 py-0.5 rounded-lg font-medium transition-all ${step === 4 ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-gray-500'}`}>4. 质检贴签</span>
        </div>
      </div>

      {/* ------------------ STEP 1: SELECT SOLUTE ------------------ */}
      {step === 1 && (
        <div className="flex flex-col gap-4 py-3">
          <div className="text-center max-w-lg mx-auto mb-2">
            <h4 className="text-sm font-bold text-cyan-200">请选择你要配制的化学溶质任务：</h4>
            <p className="text-xs text-gray-400 mt-1">自主探究：点击倾倒溶解，亲身体验不同固体的热效应变化吧！</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(soluteOptions) as SoluteKey[]).map((key) => {
              const opt = soluteOptions[key];
              const isSelected = soluteKey === key;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectSolute(key)}
                  className={`relative p-4 rounded-xl border text-left flex flex-col justify-between transition-all duration-300 group overflow-hidden ${
                    isSelected 
                      ? 'bg-slate-900 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] scale-[1.02]' 
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/20'
                  }`}
                >
                  {/* Decorative bottle background glow */}
                  <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-2xl opacity-5 group-hover:opacity-15 transition-opacity duration-300" style={{ backgroundColor: opt.color }}></div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-gray-300">{opt.formula}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">配制 50g 目标: {opt.targetPercent}%</span>
                    </div>

                    <h5 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">{opt.name} <span className="text-xs text-gray-400 font-normal">({opt.nickName})</span></h5>
                    <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">{opt.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[10px]">
                    <span className="text-gray-500">溶解温度表现：</span>
                    {/* SPOILER REMOVED: No more spoiling of exothermic/endothermic outcomes. Tell them to explore! */}
                    <span className="font-mono text-cyan-400 font-bold">
                      ❓ 等待实验探索
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------ STEP 2: CALCULATE & MEASURE ------------------ */}
      {step === 2 && (
        <div className="flex flex-col gap-5 py-2">
          {/* Top description */}
          <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
            <span className="text-xl">💡</span>
            <div>
              <span className="font-bold text-cyan-300">本阶段任务：</span>
              <span>配制 <strong className="text-white">{solute.totalWeight}g {solute.targetPercent}% 的 {solute.name} 溶液</strong>。请先在实验台上计算并量取对应的溶质与溶剂！</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left: Input & Calculators (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              <div>
                <h4 className="text-xs font-bold text-gray-300 mb-3 flex items-center gap-1.5">
                  <span className="text-cyan-400">①</span> 第一步：化学定量计算
                </h4>
                
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                    <span className="text-gray-400">目标溶质质量 ({solute.name})：</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="计算质量..."
                        value={inputSolute}
                        onChange={(e) => setInputSolute(e.target.value)}
                        className="w-20 px-2 py-0.5 text-center font-mono font-bold text-white bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-cyan-500 text-xs"
                      />
                      <span className="text-gray-400">g</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px]">
                    <span className="text-gray-400">目标溶剂体积 (水, 1g/mL)：</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="计算体积..."
                        value={inputWater}
                        onChange={(e) => setInputWater(e.target.value)}
                        className="w-20 px-2 py-0.5 text-center font-mono font-bold text-white bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-cyan-500 text-xs"
                      />
                      <span className="text-gray-400">mL</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-between gap-2">
                  <button
                    onClick={() => {
                      setInputSolute(solute.correctSoluteMass.toString());
                      setInputWater(solute.correctWaterVol.toString());
                      setShowCalcCheck(true);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 text-[10px] font-medium transition-all"
                  >
                    一键填入答案
                  </button>

                  <button
                    onClick={() => setShowCalcCheck(!showCalcCheck)}
                    className="px-3 py-1 rounded bg-cyan-950/40 text-cyan-300 hover:text-cyan-200 border border-cyan-800/80 hover:border-cyan-700 text-[10px] font-bold transition-all"
                  >
                    {showCalcCheck ? '隐藏解析' : '验证算式'}
                  </button>
                </div>

                {showCalcCheck && (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[10px] leading-relaxed transition-all">
                    {isCalcCorrect ? (
                      <span className="text-emerald-400 font-bold">🎉 计算完全正确！</span>
                    ) : (
                      <span className="text-amber-400 font-bold">⚠️ 计算有偏差，建议使用正确量配制：</span>
                    )}
                    <p className="text-gray-400 mt-1">
                      公式：溶质质量 = 溶液质量 × 溶质质量分数。
                      因此需 {solute.name} = <strong className="text-white">{solute.totalWeight}g × {solute.targetPercent}% = {solute.correctSoluteMass}g</strong>。
                      需要水（溶剂质量 = 溶液 - 溶质） = <strong className="text-white">{solute.totalWeight}g - {solute.correctSoluteMass}g = {solute.correctWaterVol}g</strong>（即 <strong className="text-white">{solute.correctWaterVol}mL</strong>）。
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                <h4 className="text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
                  <span className="text-cyan-400">②</span> 第二步：量筒视线角度调节
                </h4>
                <div className="flex flex-col gap-1.5">
                  {[
                    { key: 'up', title: '选项 A', desc: '从下往上斜看（仰视凹液面最低处）' },
                    { key: 'normal', title: '选项 B', desc: '视线水平平视（平视凹液面最低处）' },
                    { key: 'down', title: '选项 C', desc: '从上往下斜看（俯视凹液面最低处）' },
                  ].map((angle) => (
                    <button
                      key={angle.key}
                      onClick={() => !hasConfirmedMeasurements && setEyeAngle(angle.key as any)}
                      disabled={hasConfirmedMeasurements}
                      className={`p-2 rounded-lg border text-left flex justify-between items-center transition-all ${
                        hasConfirmedMeasurements ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                      } ${
                        eyeAngle === angle.key
                          ? 'bg-slate-900 border-indigo-500/80 shadow-[0_0_8px_rgba(99,102,241,0.15)] text-white'
                          : 'bg-slate-950/20 border-slate-800 text-gray-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold ${eyeAngle === angle.key ? 'text-indigo-300' : ''}`}>{angle.title}</span>
                        <span className="text-[9px] text-gray-300 mt-0.5">{angle.desc}</span>
                      </div>
                      {eyeAngle === angle.key && <span className="text-indigo-400 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirmation and dynamic explanation panel */}
              <div className="border-t border-slate-800/80 pt-3 flex flex-col gap-2">
                {!hasConfirmedMeasurements ? (
                  <button
                    onClick={() => setHasConfirmedMeasurements(true)}
                    className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black rounded-lg text-xs shadow-md shadow-cyan-500/10 cursor-pointer animate-pulse text-center"
                  >
                    确定用量与视线角度，开始量取
                  </button>
                ) : (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] leading-relaxed transition-all">
                    <span className="font-bold text-cyan-300 block mb-1">📢 操作评定与解析：</span>
                    <p className="text-gray-300">
                      {eyeAngle === 'normal' ? (
                        <span className="text-emerald-400 font-bold">🎉 读数正确！操作零误差，完全匹配设计量。</span>
                      ) : (
                        <span className="text-amber-400 font-bold">⚠️ 操作存在物理偏差！</span>
                      )}
                    </p>
                    <ul className="list-disc pl-4 mt-1.5 space-y-1 text-gray-400 text-[9.5px]">
                      {eyeAngle === 'up' && (
                        <li>
                          <strong className="text-white">量筒仰视读数</strong>：视线低于凹液面，由于视线折射，你以为读数到了刻度线，但实际上凹液面早已超出。**实际量取的水量偏多**（溶液被稀释）！
                        </li>
                      )}
                      {eyeAngle === 'down' && (
                        <li>
                          <strong className="text-white">量筒俯视读数</strong>：视线高于凹液面，折射导致你以为读数到了刻度线，但实际上凹液面还低于刻度。**实际量取的水量偏少**（溶液被浓缩）！
                        </li>
                      )}
                      {eyeAngle === 'normal' && (
                        <li className="text-emerald-400/90 font-medium">✓ 量筒读数无误（视线与凹液面最低处平视）！</li>
                      )}
                    </ul>
                    <button
                      onClick={() => setHasConfirmedMeasurements(false)}
                      className="mt-2 block text-[9.5px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer text-left font-bold"
                    >
                      🔄 重新调整参数再次试验
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: graduated-cylinder visualizer */}
            <div className="lg:col-span-7 flex flex-col bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 min-h-[300px]">
              {/* Reusable graduated cylinder visualizer */}
              <div className="flex flex-col items-center justify-between border border-slate-800 bg-slate-950/30 rounded-xl p-3 relative">
                <span className="text-[9px] font-bold text-gray-400 mb-1">【量筒视线测量器】</span>
                <GraduatedCylinderReader
                  variant="compact"
                  angle={activeEyeAngle}
                  targetVolume={isCalcCorrect ? solute.correctWaterVol : (waterInputVal || solute.correctWaterVol)}
                  actualVolume={actualWater}
                  revealed={hasConfirmedMeasurements}
                />
              </div>

            </div>
          </div>

          {/* Action button to continue */}
          <div className="mt-4 flex justify-between items-center border-t border-slate-800/80 pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-gray-300 border border-slate-800 transition-all text-xs"
            >
              ➔ 返回重选溶质
            </button>
            <button
              onClick={() => {
                setStep(3);
                setIsStirring(true);
                setStirProgress(0);
                setCurrentTemp(25);
              }}
              disabled={!hasConfirmedMeasurements}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                hasConfirmedMeasurements
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer'
                  : 'bg-slate-800 text-gray-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              ➔ 进入溶解实验室
            </button>
          </div>
        </div>
      )}

      {/* ------------------ STEP 3: DISSOLVE & THERMAL EFFECTS ------------------ */}
      {step === 3 && (
        <div className="flex flex-col gap-5 py-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            
            {/* Left Beaker Animation */}
            <div className="flex flex-col items-center justify-center bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 min-h-[300px] relative">
              <span className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">【溶解反应器与温度计】</span>

              {/* Steam Overlay for NaOH */}
              {soluteKey === 'naoh' && stirProgress > 20 && (
                <div className="absolute top-10 flex flex-col items-center pointer-events-none animate-pulse">
                  <svg className="w-32 h-16 opacity-40 overflow-visible" viewBox="0 0 100 50">
                    <path d="M 10 30 Q 30 10 50 30 T 90 30" fill="none" stroke="#ffffff" strokeWidth="3" className="animate-[bounce_2s_infinite]" />
                    <path d="M 20 20 Q 45 -5 70 20" fill="none" stroke="#ffffff" strokeWidth="2.5" className="animate-[bounce_3s_infinite]" />
                  </svg>
                  <span className="text-[9px] font-bold text-orange-400 animate-bounce tracking-widest mt-1">⚠️ 产生大量热蒸汽</span>
                </div>
              )}

              {/* Frost Overlay for NH4NO3 */}
              {soluteKey === 'nh4no3' && stirProgress > 20 && (
                <div className="absolute inset-x-12 bottom-12 top-20 border-2 border-cyan-400/40 rounded-b-lg pointer-events-none bg-sky-500/10 backdrop-blur-[1px] animate-[pulse_3s_infinite]">
                  <svg className="absolute inset-0 w-full h-full text-cyan-300/60" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M 0 10 L 5 15 L 0 20 L 8 25 M 100 30 L 92 35 L 100 40 L 95 45" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path d="M 10 95 L 15 90 L 20 100 L 25 88 M 80 95 L 85 85 L 90 98" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                  <div className="absolute bottom-2 inset-x-0 text-center">
                    <span className="text-[8px] font-extrabold text-blue-400 tracking-wider">❄️ 外壁冰晶结霜</span>
                  </div>
                </div>
              )}

              <div className="relative w-44 h-48 flex items-end justify-center">
                
                {/* 100mL Beaker Glass Outline */}
                <rect x="20" y="20" width="90" height="110" rx="4" fill="none" stroke="#e2e8f0" strokeWidth="3" opacity="0.8" />
                <line x1="16" y1="20" x2="24" y2="20" stroke="#e2e8f0" strokeWidth="3" />
                <line x1="106" y1="20" x2="114" y2="20" stroke="#e2e8f0" strokeWidth="3" />

                {/* Beaker scale marks */}
                <div className="absolute left-7 top-10 w-2.5 border-t border-gray-400/60"></div>
                <div className="absolute left-7 top-16 w-4 border-t border-gray-400/60"></div>
                <span className="absolute left-12 top-14 text-[8px] text-gray-400 font-mono">50mL</span>
                <div className="absolute left-7 top-22 w-2.5 border-t border-gray-400/60"></div>

                {/* Liquid Inside Beaker */}
                <rect 
                  x="22" 
                  y="60" 
                  width="86" 
                  height="68" 
                  fill={soluteKey === 'naoh' ? 'url(#liquidHot)' : soluteKey === 'nh4no3' ? 'url(#liquidCold)' : '#0284c7'} 
                  opacity="0.3"
                  rx="1"
                />

                {/* Liquid surface line */}
                <ellipse cx="65" cy="60" rx="43" ry="5" fill={soluteKey === 'naoh' ? '#f97316' : soluteKey === 'nh4no3' ? '#38bdf8' : '#0ea5e9'} opacity="0.4" />

                {/* Rotating Glass Rod Stirring Animation */}
                <line
                  x1={isStirring ? "60" : "65"}
                  y1="10"
                  x2={isStirring ? "70" : "65"}
                  y2="110"
                  stroke="#e2e8f0"
                  strokeWidth="3.5"
                  opacity="0.75"
                  className={isStirring ? "animate-[bounce_0.8s_infinite_alternate]" : ""}
                  style={{
                    transformOrigin: '65px 60px',
                    transform: isStirring ? `rotate(${stirProgress * 30}deg)` : 'rotate(-10deg)',
                    transition: 'transform 0.1s ease'
                  }}
                />

                {/* Dispersing Particle/Crystal effect inside the solution */}
                {stirProgress < 100 && (
                  <div className="absolute inset-x-6 bottom-4 top-16 overflow-hidden pointer-events-none">
                    {Array.from({ length: Math.max(10, Math.floor((100 - stirProgress) / 3)) }).map((_, i) => {
                      const randX = 20 + (i * 27) % 70;
                      const randY = 10 + (i * 13) % 40;
                      const rotation = (i * 45) % 360;
                      return (
                        <div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-sm transition-all duration-300 shadow-sm"
                          style={{
                            left: `${randX}px`,
                            bottom: `${randY}px`,
                            transform: `rotate(${rotation + stirProgress * 5}deg)`,
                            backgroundColor: solute.color,
                            opacity: (100 - stirProgress) / 100,
                          }}
                        ></div>
                      );
                    })}
                  </div>
                )}

                {/* Vertical Digital Thermometer */}
                <g className="absolute -right-4 bottom-2 h-44 w-12 flex flex-col items-center">
                  <div className="w-3.5 h-36 bg-slate-900 border border-slate-700 rounded-full flex flex-col justify-end p-0.5 relative overflow-hidden">
                    <div 
                      className="w-full rounded-full transition-all duration-300"
                      style={{ 
                        height: `${Math.min(100, Math.max(8, (currentTemp / 80) * 100))}%`,
                        backgroundColor: currentTemp > 25 ? '#f97316' : currentTemp < 25 ? '#3b82f6' : '#0ea5e9',
                        boxShadow: `0 0 10px ${solute.glowColor}`
                      }}
                    ></div>
                    
                    <div className="absolute inset-y-2 left-1 flex flex-col justify-between text-[6px] text-gray-500 font-mono pointer-events-none">
                      <span>75℃</span>
                      <span>50℃</span>
                      <span>25℃</span>
                      <span>0℃</span>
                    </div>
                  </div>

                  <div className="mt-1 bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-[9px] font-mono font-bold text-white flex items-center gap-0.5">
                    <span>🌡️</span>
                    <span style={{ color: currentTemp > 25 ? '#f97316' : currentTemp < 25 ? '#3b82f6' : '#22d3ee' }}>
                      {currentTemp.toFixed(1)}°C
                    </span>
                  </div>
                </g>

              </div>

              {/* Control panel */}
              <div className="mt-8 flex flex-col items-center w-full max-w-[200px]">
                {stirProgress < 100 ? (
                  <button
                    onClick={handleStartStirring}
                    disabled={isStirring}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                      isStirring 
                        ? 'bg-slate-800 text-gray-500 border border-slate-700 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/30'
                    }`}
                  >
                    {isStirring ? `正在搅拌溶解 (${Math.floor(stirProgress)}%)...` : '🌀 点击玻璃棒搅拌'}
                  </button>
                ) : (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    🎉 溶解完成！温度达到平衡。
                  </span>
                )}
              </div>
            </div>

            {/* Right: Interactive U-tube & Balloon Gas Pressure Apparatus Reacting in Real-Time */}
            <div className="flex flex-col justify-between bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 min-h-[300px]">
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                    🧪 {solute.name}：密闭瓶气压与双经典装置联动模拟
                  </h4>
                  
                  {/* Floating Knowledge Card Bubble Trigger */}
                  <button 
                    onClick={() => setShowExtraCard(true)}
                    className="flex-shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-purple-300 bg-purple-950/50 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-900/40 cursor-pointer transition-all duration-300 animate-pulse"
                  >
                    <span>💡</span> 拓展卡片
                  </button>
                </div>

                <p className="text-[10.5px] text-gray-400 leading-relaxed mb-3">
                  在密闭锥形瓶的水中溶解 **{solute.name} ({solute.formula})**，溶解引起的气温剧变将瞬间改变瓶内气压，联动以下两个中考经典探究装置：
                </p>

                {/* GORGEOUS SVG VISUALIZATION OF THE GAS APPARATUS */}
                <div className="grid grid-cols-2 gap-4 bg-slate-950/50 border border-slate-900 rounded-xl p-3 my-2.5 relative">
                  {/* Real-time Indicator Badge */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-bold border transition-all z-10"
                       style={{
                         color: soluteKey === 'naoh' ? '#f97316' : soluteKey === 'nh4no3' ? '#3b82f6' : '#22d3ee',
                         backgroundColor: soluteKey === 'naoh' ? 'rgba(249,115,22,0.1)' : soluteKey === 'nh4no3' ? 'rgba(59,130,246,0.1)' : 'rgba(34,211,238,0.1)',
                         borderColor: soluteKey === 'naoh' ? '#ea580c' : soluteKey === 'nh4no3' ? '#2563eb' : '#0891b2'
                       }}>
                    {soluteKey === 'naoh' ? '🔥 气温升高，气压膨胀' : soluteKey === 'nh4no3' ? '❄️ 气温降低，气压收缩' : '⚖️ 对照组：气压恒定'}
                  </div>

                  {/* 装置一：U型管红墨水压强计 */}
                  <div className="flex flex-col items-center justify-between border border-slate-800/40 bg-slate-950/20 rounded-lg p-2 relative h-[145px]">
                    <span className="text-[7.5px] font-bold text-cyan-400 mb-1 uppercase tracking-wider">【装置一：U型管红墨水压强计】</span>
                    <svg className="w-full h-28" viewBox="0 0 120 120">
                      {/* Background base decoration */}
                      <line x1="5" y1="110" x2="115" y2="110" stroke="#334155" strokeWidth="1" strokeDasharray="2" />
                      
                      {/* Conical Flask Stopper */}
                      <ellipse cx="40" cy="40" rx="9" ry="3.5" fill="#475569" />

                      {/* Glass tube from Stopper to U-tube */}
                      <path 
                        d="M 37 40 L 37 20 L 85 20 L 85 55" 
                        fill="none" 
                        stroke="#cbd5e1" 
                        strokeWidth="2.0" 
                        opacity="0.8" 
                      />

                      {/* Stopper holes/tubes */}
                      <line x1="37" y1="36" x2="37" y2="44" stroke="#1e293b" strokeWidth="1.5" />
                      
                      {/* Conical Flask Body (左侧) */}
                      <path 
                        d="M 31 40 L 15 95 A 5 5 0 0 0 20 100 L 60 100 A 5 5 0 0 0 65 95 L 49 40 Z" 
                        fill="none" 
                        stroke="#64748b" 
                        strokeWidth="1.8" 
                      />

                      {/* Test Tube inside Conical Flask */}
                      <path 
                        d="M 35 44 L 35 85 A 5 5 0 0 0 45 85 L 45 44 Z" 
                        fill="#1e293b" 
                        stroke="#cbd5e1" 
                        strokeWidth="1" 
                        opacity="0.9"
                      />

                      {/* Liquid in Conical Flask Test tube */}
                      <path 
                        d="M 36 52 L 36 85 A 4 4 0 0 0 44 85 L 44 52 Z" 
                        fill={soluteKey === 'naoh' ? 'url(#liquidHot)' : soluteKey === 'nh4no3' ? 'url(#liquidCold)' : '#0ea5e9'} 
                        opacity="0.4"
                      />

                      {/* Thermal/Cold waves inside Flask */}
                      {stirProgress > 10 && soluteKey === 'naoh' && (
                        <g className="animate-pulse">
                          <circle cx="24" cy="75" r="1" fill="#ef4444" opacity="0.6" />
                          <circle cx="56" cy="70" r="1.5" fill="#f97316" opacity="0.4" />
                          <path d="M 20 88 Q 25 85 30 88" fill="none" stroke="#ef4444" strokeWidth="0.8" opacity="0.4" />
                          <path d="M 50 85 Q 55 82 60 85" fill="none" stroke="#f97316" strokeWidth="0.8" opacity="0.4" />
                        </g>
                      )}
                      {stirProgress > 10 && soluteKey === 'nh4no3' && (
                        <g className="animate-pulse">
                          <circle cx="24" cy="75" r="1" fill="#38bdf8" opacity="0.6" />
                          <circle cx="56" cy="70" r="1.5" fill="#3b82f6" opacity="0.4" />
                          <path d="M 20 88 Q 25 90 30 88" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.4" />
                          <path d="M 50 85 Q 55 87 60 85" fill="none" stroke="#3b82f6" strokeWidth="0.8" opacity="0.4" />
                        </g>
                      )}

                      {/* U-Tube Glass Outline (右侧) */}
                      <path 
                        d="M 80 50 L 80 90 A 8 8 0 0 0 96 90 L 96 50" 
                        fill="none" 
                        stroke="#64748b" 
                        strokeWidth="2.0" 
                        strokeLinecap="round"
                      />

                      {/* RED INK inside U-tube reacting to stirProgress and soluteKey */}
                      {(() => {
                        const shift = soluteKey === 'naoh' 
                          ? (stirProgress / 100) * 15 
                          : soluteKey === 'nh4no3'
                            ? - (stirProgress / 100) * 15 
                            : 0;

                        const leftY = 70 + shift;
                        const rightY = 70 - shift;

                        return (
                          <g>
                            {/* Left Red Column */}
                            <line x1="80" y1={leftY} x2="80" y2="90" stroke="#ef4444" strokeWidth="1.5" className="transition-all duration-300" />
                            {/* Right Red Column */}
                            <line x1="96" y1={rightY} x2="96" y2="90" stroke="#ef4444" strokeWidth="1.5" className="transition-all duration-300" />
                            {/* Bottom U Curve Red */}
                            <path d="M 80 89.5 A 8 8 0 0 0 96 89.5" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                            
                            {/* Level Ticks */}
                            <line x1="72" y1={leftY} x2="78" y2={leftY} stroke="#f87171" strokeWidth="0.8" />
                            <line x1="98" y1={rightY} x2="104" y2={rightY} stroke="#f87171" strokeWidth="0.8" />
                            
                            {/* Tiny level indicator text */}
                            <text x="88" y="112" fill="#94a3b8" fontSize="6.5" textAnchor="middle" className="font-mono">
                              {soluteKey === 'naoh' ? '左低右高' : soluteKey === 'nh4no3' ? '左高右低' : '两侧平齐'}
                            </text>
                          </g>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* 装置二：密闭导管红气球 */}
                  <div className="flex flex-col items-center justify-between border border-slate-800/40 bg-slate-950/20 rounded-lg p-2 relative h-[145px]">
                    <span className="text-[7.5px] font-bold text-cyan-400 mb-1 uppercase tracking-wider">【装置二：密闭导管红气球】</span>
                    <svg className="w-full h-28" viewBox="0 0 120 120">
                      {/* Background base decoration */}
                      <line x1="5" y1="110" x2="115" y2="110" stroke="#334155" strokeWidth="1" strokeDasharray="2" />
                      
                      {/* Conical Flask Stopper */}
                      <ellipse cx="60" cy="60" rx="9" ry="3.5" fill="#475569" />

                      {/* Glass tube going straight up from Stopper */}
                      <line x1="60" y1="60" x2="60" y2="40" stroke="#cbd5e1" strokeWidth="2.0" opacity="0.8" />
                      <line x1="60" y1="56" x2="60" y2="64" stroke="#1e293b" strokeWidth="1.5" />
                      
                      {/* Conical Flask Body */}
                      <path 
                        d="M 51 60 L 35 105 A 5 5 0 0 0 40 110 L 80 110 A 5 5 0 0 0 85 105 L 69 60 Z" 
                        fill="none" 
                        stroke="#64748b" 
                        strokeWidth="1.8" 
                      />

                      {/* Test Tube inside Conical Flask */}
                      <path 
                        d="M 55 64 L 55 98 A 5 5 0 0 0 65 98 L 65 64 Z" 
                        fill="#1e293b" 
                        stroke="#cbd5e1" 
                        strokeWidth="1" 
                        opacity="0.9"
                      />

                      {/* Liquid in Conical Flask Test tube */}
                      <path 
                        d="M 56 72 L 56 98 A 4 4 0 0 0 64 98 L 64 72 Z" 
                        fill={soluteKey === 'naoh' ? 'url(#liquidHot)' : soluteKey === 'nh4no3' ? 'url(#liquidCold)' : '#0ea5e9'} 
                        opacity="0.4"
                      />

                      {/* Thermal/Cold waves inside Flask */}
                      {stirProgress > 10 && soluteKey === 'naoh' && (
                        <g className="animate-pulse">
                          <circle cx="44" cy="90" r="1" fill="#ef4444" opacity="0.6" />
                          <circle cx="76" cy="85" r="1.5" fill="#f97316" opacity="0.4" />
                        </g>
                      )}
                      {stirProgress > 10 && soluteKey === 'nh4no3' && (
                        <g className="animate-pulse">
                          <circle cx="44" cy="90" r="1" fill="#38bdf8" opacity="0.6" />
                          <circle cx="76" cy="85" r="1.5" fill="#3b82f6" opacity="0.4" />
                        </g>
                      )}

                      {/* BALLOON THAT RESPONDS TO PRESSURE */}
                      {(() => {
                        const balloonScaleX = soluteKey === 'naoh' 
                          ? 1 + (stirProgress / 100) * 0.4
                          : soluteKey === 'nh4no3'
                            ? Math.max(0.35, 1 - (stirProgress / 100) * 0.75)
                            : 1.0;

                        const balloonScaleY = soluteKey === 'naoh' 
                          ? 1 + (stirProgress / 100) * 0.45
                          : soluteKey === 'nh4no3'
                            ? Math.max(0.3, 1 - (stirProgress / 100) * 0.8)
                            : 1.0;

                        const balloonColor = soluteKey === 'naoh' 
                          ? '#ef4444' 
                          : soluteKey === 'nh4no3' 
                            ? '#60a5fa' 
                            : '#ec4899'; // base pink

                        const balloonGlow = soluteKey === 'naoh'
                          ? 'rgba(239, 68, 68, 0.4)'
                          : soluteKey === 'nh4no3'
                            ? 'rgba(96, 165, 250, 0.2)'
                            : 'rgba(236, 72, 153, 0.3)';

                        return (
                          <g transform={`translate(60, 40) scale(${balloonScaleX}, ${balloonScaleY})`}>
                            {/* Balloon body */}
                            <path 
                              d="M 0 0 C -10 -3, -13 -20, 0 -22 C 13 -22, 10 -3, 0 0 Z" 
                              fill={balloonColor} 
                              opacity="0.85" 
                              style={{ 
                                filter: `drop-shadow(0 0 2px ${balloonGlow})`,
                                transition: 'all 0.3s ease'
                              }} 
                            />
                            {/* Balloon neck knot */}
                            <polygon points="-2,0 2,0 0,2" fill={balloonColor} opacity="0.9" />
                            {/* Balloon gloss highlight */}
                            <ellipse cx="-3" cy="-14" rx="1.8" ry="3.5" fill="#ffffff" opacity="0.3" transform="rotate(-15, -3, -14)" />
                            
                            {/* Wrinkle lines for shriveled balloon when cold */}
                            {soluteKey === 'nh4no3' && stirProgress > 40 && (
                              <g opacity="0.5" stroke="#1d4ed8" strokeWidth="0.5" fill="none">
                                <path d="M -3 -10 Q 0 -8 3 -10" />
                                <path d="M -2 -5 Q 0 -3 2 -5" />
                              </g>
                            )}

                            {/* Text label indicating status */}
                            <text x="0" y="22" fill="#94a3b8" fontSize="6.5" textAnchor="middle" transform={`scale(${1/balloonScaleX}, ${1/balloonScaleY})`} className="font-mono">
                              {soluteKey === 'naoh' ? '膨胀鼓起' : soluteKey === 'nh4no3' ? '瘪缩皱缩' : '保持原样'}
                            </text>
                          </g>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* SPECIFIC SUBSTANCE PRESSURE ANALYSIS DETAILED EXPLANATION */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[10.5px] leading-relaxed">
                  <strong className="text-cyan-300 flex items-center gap-1 mb-1.5">
                    <span>💡</span> 中考物理联觉核心考点解析：
                  </strong>
                  
                  {soluteKey === 'naoh' && (
                    <div className="text-gray-300 space-y-1">
                      <p><strong className="text-orange-400">NaOH (氢氧化钠) 固体溶于水显著放热</strong>：</p>
                      <p>这使得密闭锥形瓶内的空气分子受热，运动加剧，气体发生**热膨胀**。由于瓶子是密闭的，**瓶内气体压强瞬间增大**，大于外界大气压，从而导致：</p>
                      <p className="font-medium text-white">1. 将压强计红墨水向外推，液面呈现 <span className="text-orange-300 font-mono">“左低右高”</span>！</p>
                      <p className="font-medium text-white">2. 瓶内空气推挤密闭导管上的气球，使其 <span className="text-orange-300 font-mono">“明显膨胀鼓起”</span>！</p>
                    </div>
                  )}

                  {soluteKey === 'nh4no3' && (
                    <div className="text-gray-300 space-y-1">
                      <p><strong className="text-blue-400">NH₄NO₃ (硝酸铵) 固体溶于水显著吸热</strong>：</p>
                      <p>这使得密闭锥形瓶内的空气分子受冷，运动减慢，气体发生**收缩**。因此**瓶内气体压强随之减小**，小于外界大气压，从而导致：</p>
                      <p className="font-medium text-white">1. 外界大气压将红墨水向瓶内推，液面呈现 <span className="text-blue-300 font-mono">“左高右低”</span> 的极强回吸效果！</p>
                      <p className="font-medium text-white">2. 外界大气压强推挤气球，使其被压缩并 <span className="text-blue-300 font-mono">“收缩瘪缩”</span>，甚至产生微弱皱褶！</p>
                    </div>
                  )}

                  {soluteKey === 'nacl' && (
                    <div className="text-gray-300 space-y-1">
                      <p><strong className="text-cyan-400">NaCl (氯化钠) 固体溶于水溶液温度基本恒定</strong>：</p>
                      <p>瓶内空气的温度、体积和压力保持稳定，外界与内部气压维持均衡，因此压强计和气球**均维持原状**。</p>
                      <p className="p-1.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-[10px] text-cyan-300 mt-2 font-medium">
                        🎯 **中考必背点**：NaCl 溶解实验在整个探究体系中充当唯一的**『空白对照组』**。中考填空常考其作用——<strong className="text-white">“作对比，证明并非所有固体溶解都会引起显著的温度变化”</strong>，是绝对的得分重难点！
                      </p>
                    </div>
                  )}
                </div>

                {/* Real-time wiggling live diagnostics overlay */}
                {stirProgress > 0 && (
                  <div className="mt-2.5 p-2 bg-slate-950/80 border border-slate-900 rounded-lg text-[9.5px] text-center font-mono animate-pulse">
                    🧪 实时气压传感器数据：
                    <span style={{ color: currentTemp > 25 ? '#f97316' : currentTemp < 25 ? '#3b82f6' : '#22d3ee' }} className="font-bold ml-1">
                      {soluteKey === 'naoh' && `溶解进度 ${Math.floor(stirProgress)}%：温度攀升至 ${currentTemp.toFixed(1)}℃，U型管红墨水高度差持续扩增 (左低右高)！`}
                      {soluteKey === 'nh4no3' && `溶解进度 ${Math.floor(stirProgress)}%：温度降至 ${currentTemp.toFixed(1)}℃，U型管红墨水产生强力内吸 (左高右低)！`}
                      {soluteKey === 'nacl' && `溶解进度 ${Math.floor(stirProgress)}%：温度微幅波动至 ${currentTemp.toFixed(1)}℃，红墨水液面维持水平静止！`}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-gray-400">
                <span>溶解结束，U型管液面已稳定。</span>
                <span className="text-cyan-400 animate-pulse font-bold">➔ 请点击下方按钮进入最终质检评估！</span>
              </div>
            </div>

          </div>

          {/* Action button to continue */}
          <div className="mt-4 flex justify-between items-center border-t border-slate-800/80 pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-gray-300 border border-slate-800 transition-all text-xs"
            >
              ➔ 返回量取与称量
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={isStirring}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                isStirring
                  ? 'bg-slate-800 text-gray-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }`}
            >
              ➔ 最终质量分数质检与贴签
            </button>
          </div>

          <defs>
            <linearGradient id="liquidHot" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="liquidCold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </div>
      )}

      {/* ------------------ STEP 4: QUALITY CHECK & BOTTLING ------------------ */}
      {step === 4 && (
        <div className="flex flex-col gap-5 py-2">
          
          <div className="text-center max-w-lg mx-auto mb-1">
            <h4 className="text-sm font-bold text-emerald-400">🔬 配制溶液品质检测控制台</h4>
            <p className="text-xs text-gray-400 mt-1">这里会根据您称量溶质和量取水的每一步真实操作，评估并诊断您的溶液最终指标</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            
            {/* Left: Interactive Bottle & Label Generation (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <span className="text-[9px] font-bold text-gray-500 mb-4 uppercase tracking-wider">【产出的试剂瓶与标签】</span>

              <div className="relative w-36 h-48 flex items-center justify-center mb-4">
                <svg className="w-32 h-44" viewBox="0 0 100 130">
                  {/* Bottle body */}
                  <path d="M 35 15 L 65 15 L 65 30 L 85 45 L 85 120 L 15 120 L 15 45 L 35 30 Z" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />
                  {/* Bottle Cap */}
                  <rect x="32.5" y="5" width="35" height="10" rx="1.5" fill="#475569" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Water liquid inside (drawn as level) */}
                  <path d="M 16.5 60 L 83.5 60 L 83.5 118.5 L 16.5 118.5 Z" fill="url(#bottleLiquid)" opacity="0.4" />
                  
                  {/* Custom Label Area */}
                  <rect x="23" y="65" width="54" height="40" fill="#ffffff" rx="2" stroke="#cbd5e1" strokeWidth="1" />
                  
                  {/* Text on label */}
                  <text x="50" y="76" fill="#0f172a" fontSize="7.5" fontWeight="bold" textAnchor="middle">{solute.name}溶液</text>
                  <text x="50" y="86" fill="#3b82f6" fontSize="6.5" fontWeight="bold" textAnchor="middle" className="font-mono">
                    {actualMassPercent.toFixed(2)}%
                  </text>
                  <text x="50" y="96" fill="#64748b" fontSize="5" textAnchor="middle">
                    {customLabel ? `编: ${customLabel}` : '未归档'}
                  </text>
                </svg>
              </div>

              {/* Input for custom labels */}
              {!isSaved ? (
                <div className="w-full flex gap-1.5 max-w-[200px]">
                  <input
                    type="text"
                    placeholder="输入贴签标签(如:001)..."
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    className="w-full px-2 py-1 text-center font-mono text-white bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:border-emerald-500 text-[11px]"
                  />
                  <button
                    onClick={() => {
                      if (customLabel.trim()) setIsSaved(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all"
                  >
                    贴上
                  </button>
                </div>
              ) : (
                <div className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800 px-3 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                  <span>🏷️</span> 已贴标签并存入试剂展示柜！
                </div>
              )}
            </div>

            {/* Right: Detailed Diagnostic report explaining error factors */}
            <div className="md:col-span-7 flex flex-col justify-between bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              <div>
                <h4 className="text-xs font-bold text-emerald-400 mb-3 flex items-center gap-1.5">
                  📋 上海中考·配制溶液诊断书 (Diagnostic Sheet)
                </h4>

                {/* Parameters compared */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[10px]">
                    <span className="text-gray-400 block mb-0.5">目标设计指标：</span>
                    <span>溶液质量: <strong className="text-white">50.0g</strong></span>
                    <span className="block mt-0.5">目标溶质质量分数: <strong className="text-cyan-400 font-mono">{solute.targetPercent}.0%</strong></span>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[10px]">
                    <span className="text-gray-400 block mb-0.5">您的实际操作数值：</span>
                    <span>实际溶质: <strong className="text-white">{actualSolute.toFixed(2)}g</strong> (设计 {solute.correctSoluteMass}g)</span>
                    <span className="block mt-0.5">实际溶剂(水): <strong className="text-white">{actualWater.toFixed(1)}mL</strong> (设计 {solute.correctWaterVol}mL)</span>
                  </div>
                </div>

                {/* Score and result summary */}
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-start gap-3">
                  <div className="text-2xl mt-0.5">
                    {Math.abs(actualMassPercent - solute.targetPercent) < 0.1 ? '🏆' : '⚠️'}
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-white">
                      实际配得溶质质量分数：
                      <span className="text-lg font-mono font-black ml-1.5" style={{ color: Math.abs(actualMassPercent - solute.targetPercent) < 0.1 ? '#10b981' : '#f59e0b' }}>
                        {actualMassPercent.toFixed(2)}%
                      </span>
                    </h5>
                    
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                      {Math.abs(actualMassPercent - solute.targetPercent) < 0.1 ? (
                        <span className="text-emerald-400 font-semibold">诊断：完美配制！没有产生任何物理量误差，完美契合设计目标，中考实验高分保底！</span>
                      ) : actualMassPercent < solute.targetPercent ? (
                        <span className="text-amber-400 font-semibold">诊断：实际配得的溶质质量分数【偏低】。</span>
                      ) : (
                        <span className="text-amber-400 font-semibold">诊断：实际配得的溶质质量分数【偏高】。</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Detailed analysis of errors */}
                {eyeAngle !== 'normal' ? (
                  <div className="mt-3 p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-[10px] leading-relaxed">
                    <span className="font-bold text-amber-300 block mb-1">🔍 误差因子详细拆解（中考必背考点）：</span>
                    <ul className="list-disc pl-4 space-y-1 text-gray-300">
                      {eyeAngle === 'up' && (
                        <li>
                          <strong className="text-white">量筒仰视读数</strong>：
                          仰视量筒时，视线斜向上。由于折射，液面的凹液面最低处其实已经高于刻度线。
                          这导致**实际倒入的水量偏多**（溶液被稀释），最终**溶质质量分数偏低**！
                        </li>
                      )}
                      {eyeAngle === 'down' && (
                        <li>
                          <strong className="text-white">量筒俯视读数</strong>：
                          俯视量筒时，视线斜向下。由于折射，液面的凹液面最低处其实还没到达设定刻度线。
                          这导致**实际倒入的水量偏少**（溶液被浓缩），最终**溶质质量分数偏高**！
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-3 p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-[10px] leading-relaxed">
                    <span className="font-bold text-emerald-400 block mb-1">🎉 完美操作记录：</span>
                    <p className="text-gray-300">
                      您使用量筒<strong className="text-emerald-300">平视凹液面最低处</strong>读数，
                      避免了仰视或俯视造成的体积误差。遇到“判断质量分数偏大偏小”的题目时，也要先判断实际加水量的变化。
                    </p>
                  </div>
                )}
              </div>

              {/* Interactive rack for finished bottles */}
              <div className="border-t border-slate-800/60 pt-3 mt-3 flex justify-between items-center text-[10px] text-gray-400">
                <span>配制完成！你可以随时重新配制，挑战不同的溶质！</span>
                <span className="text-emerald-400 font-bold">快来试试氢氧化钠(NaOH)的高温和硝酸铵(NH₄NO₃)的冰霜吧！</span>
              </div>
            </div>

          </div>

          {/* Action button to continue */}
          <div className="mt-4 flex justify-between items-center border-t border-slate-800/80 pt-4">
            <button
              onClick={() => {
                setStep(3);
                setIsStirring(false);
                setStirProgress(100);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-gray-300 border border-slate-800 transition-all text-xs"
            >
              ➔ 返回查看溶解过程
            </button>
            
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all text-xs"
            >
              🔄 重新挑战其他溶质配制
            </button>
          </div>

          <defs>
            <linearGradient id="bottleLiquid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={solute.color} />
              <stop offset="100%" stopColor={solute.color} stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </div>
      )}

      {/* ------------------ KNOWLEDGE CARD MODAL (超纲内容拓展) ------------------ */}
      {showExtraCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-md bg-[#0f172a] border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(168,85,247,0.2)] flex flex-col gap-4 text-left border-t-purple-500"
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowExtraCard(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Title & Badge */}
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2.5 py-0.5 rounded-full self-start">
                🧠 高中超纲拓展知识卡片
              </span>
              <h4 className="text-sm md:text-base font-extrabold text-white flex items-center gap-2 mt-1">
                <span>⚡</span> 溶解过程的微观热力学机制
              </h4>
              <p className="text-[10px] text-amber-400 font-semibold bg-amber-950/30 border border-amber-800/30 px-2 py-1.5 rounded-lg mt-1">
                ⚠️ 该内容本阶段不要求掌握，仅供拓展探秘！
              </p>
            </div>

            {/* Content Details */}
            <div className="flex flex-col gap-3 text-xs leading-relaxed text-gray-300">
              <p>
                物质在水中的溶解过程，在微观上其实包含了两个**同时发生**、**方向相反**的过程：
              </p>

              {/* Process 1 */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10.5px]">
                  <strong className="text-sky-300 font-bold">1. 扩散过程（物理变化）</strong>
                  <span className="text-[9px] font-mono text-sky-400 font-semibold">吸热 (ΔH₁ &gt; 0)</span>
                </div>
                <p className="text-[10px] text-gray-400">
                  溶质分子或离子克服彼此间的作用力，向水中**扩散**的过程。这需要吸收能量来破坏化学键或晶格力。
                </p>
                {/* Visual meter */}
                <div className="w-full bg-slate-950 rounded-full h-1 mt-1 overflow-hidden">
                  <div className="bg-sky-400 h-full w-[60%]"></div>
                </div>
              </div>

              {/* Process 2 */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10.5px]">
                  <strong className="text-orange-300 font-bold">2. 水合过程（化学变化）</strong>
                  <span className="text-[9px] font-mono text-orange-400 font-semibold">放热 (ΔH₂ &lt; 0)</span>
                </div>
                <p className="text-[10px] text-gray-400">
                  溶质分子或离子与水分子相互吸引结合，形成**水合离子/水合分子**的过程。这会释放大量能量。
                </p>
                {/* Visual meter */}
                <div className="w-full bg-slate-950 rounded-full h-1 mt-1 overflow-hidden">
                  <div className="bg-orange-400 h-full w-[80%]"></div>
                </div>
              </div>

              {/* Formula & Explanations */}
              <div className="p-3 bg-purple-950/20 rounded-xl border border-purple-900/30 text-[10.5px]">
                <strong className="text-purple-300 block mb-1">⚖️ 最终温度结果是由什么决定的？</strong>
                <p className="text-gray-400">
                  溶解的最终热量变化（Q）为上述两者的代数和：
                </p>
                <ul className="list-disc pl-4 mt-1 space-y-1 text-gray-300 text-[10px]">
                  <li>
                    若 <strong className="text-white">扩散吸热 &gt; 水合放热</strong>：溶液温度降低（例如：<strong className="text-blue-400">NH₄NO₃ 硝酸铵</strong>）。
                  </li>
                  <li>
                    若 <strong className="text-white">扩散吸热 &lt; 水合放热</strong>：溶液温度升高（例如：<strong className="text-orange-400">NaOH 氢氧化钠</strong>、浓硫酸）。
                  </li>
                  <li>
                    若 <strong className="text-white">扩散吸热 ≈ 水合放热</strong>：溶液温度几乎不变（例如：<strong className="text-cyan-400">NaCl 氯化钠</strong>）。
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Footer Button */}
            <button
              onClick={() => setShowExtraCard(false)}
              className="mt-1 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer"
            >
              我知道了，返回实验台
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
