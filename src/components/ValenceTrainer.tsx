import { useEffect, useMemo, useState } from 'react';
import {
  formulaBuildExercises,
  formulaDifficultyGroups,
  oxidationExercises,
  oxidationDifficultyGroups,
  valenceChants,
  valenceItems,
  type FormulaBuildExercise,
  type ValenceItem,
} from '../data/valenceData';
import type { StudentProfile } from '../types';

type ValenceTab = 'cards' | 'match' | 'formula' | 'detective';

interface ValenceTrainerProps {
  courseId: string;
  profile: StudentProfile | null;
  onBack: () => void;
  backLabel?: string;
}

interface ValenceProgress {
  masteredIds: string[];
  matchRounds: number;
  formulaCorrect: number;
  formulaTotal: number;
  formulaBestScores: Record<string, number>;
  detectiveCorrect: number;
  detectiveTotal: number;
  detectiveBestScores: Record<string, number>;
  bestStreak: number;
  updatedAt?: string;
}

interface MatchRound {
  items: ValenceItem[];
  symbols: ValenceItem[];
  values: ValenceItem[];
}

const defaultProgress: ValenceProgress = {
  masteredIds: [],
  matchRounds: 0,
  formulaCorrect: 0,
  formulaTotal: 0,
  formulaBestScores: {},
  detectiveCorrect: 0,
  detectiveTotal: 0,
  detectiveBestScores: {},
  bestStreak: 0,
};

const tabConfig: Record<ValenceTab, { label: string; hint: string }> = {
  cards: { label: '速记', hint: '先背常见价' },
  match: { label: '配对', hint: '原子团找价' },
  formula: { label: '拼式', hint: '配平写化学式' },
  detective: { label: '侦探', hint: '反推未知价' },
};

const groupClass: Record<string, string> = {
  常见一价金属: 'border-sky-100 bg-sky-50 text-sky-800',
  常见二价金属: 'border-teal-100 bg-teal-50 text-teal-800',
  常见三价金属: 'border-amber-100 bg-amber-50 text-amber-800',
  常见非金属价: 'border-emerald-100 bg-emerald-50 text-emerald-800',
  常见变价金属: 'border-rose-100 bg-rose-50 text-rose-800',
  常见负一价原子团: 'border-indigo-100 bg-indigo-50 text-indigo-800',
  常见负二价原子团: 'border-cyan-100 bg-cyan-50 text-cyan-800',
  常见正一价原子团: 'border-violet-100 bg-violet-50 text-violet-800',
  拓展常见原子团: 'border-slate-200 bg-slate-50 text-slate-800',
};

function getProgressKey(profileId: string, courseId: string) {
  return `chem-tree-valence:${profileId}:${courseId}`;
}

function loadProgress(key: string): ValenceProgress {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<ValenceProgress>;
    return {
      masteredIds: Array.isArray(parsed.masteredIds) ? parsed.masteredIds : [],
      matchRounds: Number(parsed.matchRounds ?? 0),
      formulaCorrect: Number(parsed.formulaCorrect ?? 0),
      formulaTotal: Number(parsed.formulaTotal ?? 0),
      formulaBestScores: parsed.formulaBestScores && typeof parsed.formulaBestScores === 'object' ? parsed.formulaBestScores : {},
      detectiveCorrect: Number(parsed.detectiveCorrect ?? 0),
      detectiveTotal: Number(parsed.detectiveTotal ?? 0),
      detectiveBestScores: parsed.detectiveBestScores && typeof parsed.detectiveBestScores === 'object' ? parsed.detectiveBestScores : {},
      bestStreak: Number(parsed.bestStreak ?? 0),
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return defaultProgress;
  }
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sampleValenceItems(count: number) {
  const core = valenceItems.filter((item) => item.id !== 'po4');
  return shuffle(core).slice(0, count);
}

function makeMatchRound(): MatchRound {
  const items = sampleValenceItems(6);
  return {
    items,
    symbols: shuffle(items),
    values: shuffle(items),
  };
}

function addMastered(progress: ValenceProgress, id: string) {
  if (progress.masteredIds.includes(id)) return progress.masteredIds;
  return [...progress.masteredIds, id];
}

function formatAccuracy(correct: number, total: number) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

function itemChipClass(item: ValenceItem) {
  return groupClass[item.group] ?? 'border-[var(--border-color)] bg-[var(--bg-card-bright)] text-[var(--text-main)]';
}

function FormulaMiniBoard({ exercise }: { exercise: FormulaBuildExercise }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-[1.35rem] border border-[var(--border-color)] bg-[var(--bg-highlight)]/70 p-3">
      <div className="rounded-2xl border border-teal-100 bg-white/70 px-3 py-3 text-center">
        <div className="text-[10px] font-black text-[var(--text-muted)]">{exercise.cationName}</div>
        <div className="mt-1 font-mono text-2xl font-black text-teal-800">{exercise.cationSymbol}</div>
        <div className="mt-1 text-xs font-black text-teal-700">{exercise.cationCharge}</div>
      </div>
      <div className="text-xl font-black text-[var(--text-muted)]">+</div>
      <div className="rounded-2xl border border-amber-100 bg-white/70 px-3 py-3 text-center">
        <div className="text-[10px] font-black text-[var(--text-muted)]">{exercise.anionName}</div>
        <div className="mt-1 font-mono text-2xl font-black text-amber-800">{exercise.anionSymbol}</div>
        <div className="mt-1 text-xs font-black text-amber-700">{exercise.anionCharge}</div>
      </div>
    </div>
  );
}

export function ValenceTrainer({ courseId, profile, onBack, backLabel = '返回模式选择' }: ValenceTrainerProps) {
  const profileId = profile?.profileId ?? 'guest';
  const storageKey = useMemo(() => getProgressKey(profileId, courseId), [courseId, profileId]);
  const [tab, setTab] = useState<ValenceTab>('cards');
  const [progress, setProgress] = useState<ValenceProgress>(() => loadProgress(storageKey));
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [matchRound, setMatchRound] = useState<MatchRound>(() => makeMatchRound());
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ symbol: string; value: string } | null>(null);
  const [formulaGroupId, setFormulaGroupId] = useState(formulaDifficultyGroups[0].id);
  const [formulaQuestionIndex, setFormulaQuestionIndex] = useState(0);
  const [formulaRoundCorrect, setFormulaRoundCorrect] = useState(0);
  const [formulaRoundComplete, setFormulaRoundComplete] = useState(false);
  const [formulaAnswer, setFormulaAnswer] = useState<string | null>(null);
  const [detectiveGroupId, setDetectiveGroupId] = useState(oxidationDifficultyGroups[0].id);
  const [detectiveQuestionIndex, setDetectiveQuestionIndex] = useState(0);
  const [detectiveRoundCorrect, setDetectiveRoundCorrect] = useState(0);
  const [detectiveRoundComplete, setDetectiveRoundComplete] = useState(false);
  const [oxidationAnswer, setOxidationAnswer] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  const activeFormulaGroup = formulaDifficultyGroups.find((group) => group.id === formulaGroupId) ?? formulaDifficultyGroups[0];
  const formulaRoundExercises = formulaBuildExercises.filter((exercise) => exercise.difficulty === activeFormulaGroup.difficulty);
  const formulaExercise = formulaRoundExercises[formulaQuestionIndex] ?? formulaRoundExercises[0];
  const activeDetectiveGroup = oxidationDifficultyGroups.find((group) => group.id === detectiveGroupId) ?? oxidationDifficultyGroups[0];
  const detectiveRoundExercises = oxidationExercises.filter((exercise) => exercise.difficulty === activeDetectiveGroup.difficulty);
  const oxidationExercise = detectiveRoundExercises[detectiveQuestionIndex] ?? detectiveRoundExercises[0];

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ ...progress, updatedAt: new Date().toISOString() }));
    } catch {
      // Valence practice progress is local and best-effort.
    }
  }, [progress, storageKey]);

  const activeItem = valenceItems[activeIndex];
  const masteredSet = useMemo(() => new Set(progress.masteredIds), [progress.masteredIds]);
  const masteredPercent = Math.round((progress.masteredIds.length / valenceItems.length) * 100);
  const matchComplete = matchedIds.length === matchRound.items.length;
  const formulaIsCorrect = formulaAnswer === formulaExercise.answer;
  const detectiveIsCorrect = oxidationAnswer === oxidationExercise.answer;
  const formulaAccuracy = formatAccuracy(progress.formulaCorrect, progress.formulaTotal);
  const detectiveAccuracy = formatAccuracy(progress.detectiveCorrect, progress.detectiveTotal);

  const updateProgress = (updater: (prev: ValenceProgress) => ValenceProgress) => {
    setProgress((prev) => updater(prev));
  };

  const bumpStreak = (isCorrect: boolean) => {
    if (!isCorrect) {
      setStreak(0);
      return 0;
    }
    const next = streak + 1;
    setStreak(next);
    updateProgress((prev) => ({ ...prev, bestStreak: Math.max(prev.bestStreak, next) }));
    return next;
  };

  const jumpToItem = (idx: number) => {
    setActiveIndex(idx);
    setFlipped(false);
  };

  const moveCard = (delta: number) => {
    const next = (activeIndex + delta + valenceItems.length) % valenceItems.length;
    jumpToItem(next);
  };

  const toggleMastered = (id: string) => {
    updateProgress((prev) => ({
      ...prev,
      masteredIds: prev.masteredIds.includes(id)
        ? prev.masteredIds.filter((item) => item !== id)
        : [...prev.masteredIds, id],
    }));
  };

  const startNewMatchRound = () => {
    setMatchRound(makeMatchRound());
    setSelectedSymbol(null);
    setSelectedValue(null);
    setMatchedIds([]);
    setWrongPair(null);
  };

  const tryMatch = (symbolId: string | null, valueId: string | null) => {
    if (!symbolId || !valueId) return;

    if (symbolId === valueId) {
      const nextMatched = matchedIds.includes(symbolId) ? matchedIds : [...matchedIds, symbolId];
      setMatchedIds(nextMatched);
      setSelectedSymbol(null);
      setSelectedValue(null);
      bumpStreak(true);
      updateProgress((prev) => ({
        ...prev,
        masteredIds: addMastered(prev, symbolId),
        matchRounds: nextMatched.length === matchRound.items.length ? prev.matchRounds + 1 : prev.matchRounds,
      }));
      return;
    }

    bumpStreak(false);
    setWrongPair({ symbol: symbolId, value: valueId });
    setSelectedSymbol(null);
    setSelectedValue(null);
    window.setTimeout(() => setWrongPair(null), 650);
  };

  const chooseSymbol = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedSymbol(id);
    tryMatch(id, selectedValue);
  };

  const chooseValue = (id: string) => {
    if (matchedIds.includes(id)) return;
    setSelectedValue(id);
    tryMatch(selectedSymbol, id);
  };

  const chooseFormulaAnswer = (choice: string) => {
    if (formulaAnswer) return;
    const isCorrect = choice === formulaExercise.answer;
    setFormulaAnswer(choice);
    bumpStreak(isCorrect);
    if (isCorrect) setFormulaRoundCorrect((prev) => prev + 1);
    updateProgress((prev) => ({
      ...prev,
      formulaCorrect: prev.formulaCorrect + (isCorrect ? 1 : 0),
      formulaTotal: prev.formulaTotal + 1,
    }));
  };

  const nextFormula = () => {
    if (formulaQuestionIndex === formulaRoundExercises.length - 1) {
      setFormulaRoundComplete(true);
      updateProgress((prev) => ({
        ...prev,
        formulaBestScores: {
          ...prev.formulaBestScores,
          [formulaGroupId]: Math.max(prev.formulaBestScores[formulaGroupId] ?? 0, formulaRoundCorrect),
        },
      }));
      return;
    }
    setFormulaQuestionIndex((prev) => prev + 1);
    setFormulaAnswer(null);
  };

  const startFormulaGroup = (groupId: string) => {
    setFormulaGroupId(groupId);
    setFormulaQuestionIndex(0);
    setFormulaRoundCorrect(0);
    setFormulaRoundComplete(false);
    setFormulaAnswer(null);
  };

  const openNextFormulaGroup = () => {
    const currentIndex = formulaDifficultyGroups.findIndex((group) => group.id === formulaGroupId);
    const nextGroup = formulaDifficultyGroups[currentIndex + 1] ?? formulaDifficultyGroups[0];
    startFormulaGroup(nextGroup.id);
  };

  const chooseOxidationAnswer = (choice: string) => {
    if (oxidationAnswer) return;
    const isCorrect = choice === oxidationExercise.answer;
    setOxidationAnswer(choice);
    bumpStreak(isCorrect);
    if (isCorrect) setDetectiveRoundCorrect((prev) => prev + 1);
    updateProgress((prev) => ({
      ...prev,
      detectiveCorrect: prev.detectiveCorrect + (isCorrect ? 1 : 0),
      detectiveTotal: prev.detectiveTotal + 1,
    }));
  };

  const nextOxidation = () => {
    if (detectiveQuestionIndex === detectiveRoundExercises.length - 1) {
      setDetectiveRoundComplete(true);
      updateProgress((prev) => ({
        ...prev,
        detectiveBestScores: {
          ...prev.detectiveBestScores,
          [detectiveGroupId]: Math.max(prev.detectiveBestScores[detectiveGroupId] ?? 0, detectiveRoundCorrect),
        },
      }));
      return;
    }
    setDetectiveQuestionIndex((prev) => prev + 1);
    setOxidationAnswer(null);
  };

  const startDetectiveGroup = (groupId: string) => {
    setDetectiveGroupId(groupId);
    setDetectiveQuestionIndex(0);
    setDetectiveRoundCorrect(0);
    setDetectiveRoundComplete(false);
    setOxidationAnswer(null);
  };

  const openNextDetectiveGroup = () => {
    const currentIndex = oxidationDifficultyGroups.findIndex((group) => group.id === detectiveGroupId);
    const nextGroup = oxidationDifficultyGroups[currentIndex + 1] ?? oxidationDifficultyGroups[0];
    startDetectiveGroup(nextGroup.id);
  };

  const resetProgress = () => {
    if (!window.confirm('确定清空化合价训练营的本地练习记录吗？主线学习进度不会受影响。')) return;
    setProgress(defaultProgress);
    setStreak(0);
    startFormulaGroup(formulaDifficultyGroups[0].id);
    startDetectiveGroup(oxidationDifficultyGroups[0].id);
    startNewMatchRound();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-page-start)] via-[var(--bg-page-mid)] to-[var(--bg-page-end)] text-[var(--text-main)]">
      <div className="sticky top-0 z-30 border-b border-[var(--border-color)] bg-[var(--bg-card)]/95 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <button onClick={onBack} className="mb-2 text-xs font-black text-teal-700 hover:text-teal-900">
            ← {backLabel}
          </button>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight text-[var(--text-main)]">化合价与原子团训练营</h1>
              <p className="mt-1 text-xs font-bold leading-relaxed text-[var(--text-muted)]">
                八阶基础版：先记常见价，再拼化学式，最后反推变价元素。
              </p>
            </div>
            <div className="shrink-0 rounded-2xl border border-amber-100 bg-amber-50 px-3 py-2 text-right">
              <div className="text-sm font-black text-amber-700">{progress.masteredIds.length}/{valenceItems.length}</div>
              <div className="text-[10px] font-black text-amber-700">已记住</div>
            </div>
          </div>

          <div className="mt-3 h-2 rounded-full bg-[var(--bg-disabled)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-teal-500 to-sky-500 transition-all"
              style={{ width: `${masteredPercent}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1.5 rounded-2xl bg-[var(--bg-disabled)] p-1">
            {(Object.keys(tabConfig) as ValenceTab[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-xl px-2 py-2 text-center transition-all ${
                  tab === key ? 'bg-[var(--bg-card-bright)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'
                }`}
              >
                <div className="text-xs font-black">{tabConfig[key].label}</div>
                <div className="mt-0.5 hidden text-[9px] font-bold sm:block">{tabConfig[key].hint}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-4 pb-10">
        <section className="mb-4 grid grid-cols-4 gap-2">
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-2 py-2 text-center">
            <div className="text-base font-black text-teal-800">{streak}</div>
            <div className="text-[10px] font-black text-[var(--text-muted)]">当前连击</div>
          </div>
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-2 py-2 text-center">
            <div className="text-base font-black text-amber-700">{progress.bestStreak}</div>
            <div className="text-[10px] font-black text-[var(--text-muted)]">最高连击</div>
          </div>
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-2 py-2 text-center">
            <div className="text-base font-black text-sky-700">{formulaAccuracy}%</div>
            <div className="text-[10px] font-black text-[var(--text-muted)]">拼式正确</div>
          </div>
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-2 py-2 text-center">
            <div className="text-base font-black text-rose-700">{detectiveAccuracy}%</div>
            <div className="text-[10px] font-black text-[var(--text-muted)]">求价正确</div>
          </div>
        </section>

        {tab === 'cards' && (
          <section className="space-y-4">
            <div className="rounded-[1.35rem] border border-amber-100 bg-[var(--bg-amber)] px-4 py-3">
              <div className="text-xs font-black text-amber-800">必背口诀</div>
              <div className="mt-2 grid gap-1.5">
                {valenceChants.map((line) => (
                  <div key={line} className="rounded-xl bg-white/55 px-3 py-2 text-xs font-black leading-relaxed text-amber-900">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFlipped((prev) => !prev)}
              className={`relative w-full overflow-hidden rounded-[1.75rem] border text-left shadow-xl transition-all hover:-translate-y-0.5 ${
                flipped
                  ? 'border-[var(--border-color)] bg-[var(--bg-card-bright)] p-5'
                  : 'border-white/10 bg-gradient-to-br from-slate-950 via-teal-900 to-amber-900 p-5 text-white'
              }`}
            >
              {!flipped ? (
                <div className="relative min-h-[330px]">
                  <div className="absolute inset-0 tiny-lab-dot opacity-10" />
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${itemChipClass(activeItem)}`}>
                      {activeItem.group}
                    </span>
                    {masteredSet.has(activeItem.id) && (
                      <span className="rounded-full border border-emerald-200/35 bg-emerald-300/15 px-2.5 py-1 text-[10px] font-black text-emerald-50">
                        已记住
                      </span>
                    )}
                  </div>
                  <div className="relative z-10 mt-8 rounded-[1.45rem] border border-white/18 bg-black/18 px-5 py-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-md">
                    <div className="text-[10px] font-black tracking-[0.22em] text-white/55">
                      {activeItem.kind === 'group' ? 'ATOMIC GROUP' : 'COMMON VALENCE'}
                    </div>
                    <div className="mt-4 font-mono text-6xl font-black leading-none text-white">{activeItem.symbol}</div>
                    <div className="mt-3 text-2xl font-black text-amber-100">{activeItem.label}</div>
                    <div className="mx-auto mt-4 inline-flex rounded-full border border-white/20 bg-white/12 px-5 py-2 text-lg font-black text-white">
                      {activeItem.valenceLabel}
                    </div>
                  </div>
                  <div className="relative z-10 mt-4 rounded-[1.25rem] border border-white/18 bg-black/18 px-4 py-3 backdrop-blur-md">
                    <div className="text-[10px] font-black tracking-[0.2em] text-white/55">常见例子</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activeItem.examples.map((example) => (
                        <span key={example} className="rounded-full border border-white/18 bg-white/12 px-3 py-1.5 font-mono text-xs font-black text-white">
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="relative z-10 mt-4 text-center">
                    <div className="inline-flex rounded-full border border-white/18 bg-white/12 px-4 py-2 text-xs font-black text-white/85 shadow-lg backdrop-blur-md">
                      点一下翻面，看考试提醒
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${itemChipClass(activeItem)}`}>
                      {activeItem.group}
                    </span>
                    <div className="rounded-2xl border border-teal-100 bg-teal-50 px-3 py-2 text-center">
                      <div className="font-mono text-2xl font-black text-teal-900">{activeItem.symbol}</div>
                      <div className="text-[10px] font-black text-teal-700">{activeItem.valenceLabel}</div>
                    </div>
                  </div>
                  <div className="mt-5 rounded-[1.35rem] border border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-highlight)] to-white px-4 py-4 text-center">
                    <div className="text-3xl font-black text-[var(--text-main)]">{activeItem.label}</div>
                    <div className="mt-2 text-sm font-black text-teal-800">{activeItem.memoryHint}</div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-amber-100 bg-[var(--bg-amber)] px-4 py-3">
                    <div className="text-xs font-black text-amber-800">考试提醒</div>
                    <p className="mt-1 text-sm font-bold leading-relaxed text-amber-900">{activeItem.examTip}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeItem.examples.map((example) => (
                      <span key={example} className="rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 font-mono text-xs font-black text-teal-900">
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => moveCard(-1)}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-3 text-xs font-black text-teal-800 transition-all hover:-translate-y-0.5"
              >
                ← 上一张
              </button>
              <button
                type="button"
                onClick={() => toggleMastered(activeItem.id)}
                className={`rounded-2xl px-3 py-3 text-xs font-black transition-all hover:-translate-y-0.5 ${
                  masteredSet.has(activeItem.id)
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border border-teal-200 bg-teal-50 text-teal-800'
                }`}
              >
                {masteredSet.has(activeItem.id) ? '已记住 ✓' : '标记会了'}
              </button>
              <button
                type="button"
                onClick={() => moveCard(1)}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-3 text-xs font-black text-teal-800 transition-all hover:-translate-y-0.5"
              >
                下一张 →
              </button>
            </div>

            <div className="rounded-[1.35rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-3">
              <div className="mb-2 text-xs font-black text-[var(--text-muted)]">快速跳卡</div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {valenceItems.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => jumpToItem(idx)}
                    className={`rounded-xl border px-2 py-2 text-center transition-all ${
                      idx === activeIndex
                        ? 'border-teal-400 bg-teal-50 text-teal-900'
                        : masteredSet.has(item.id)
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
                        : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] text-[var(--text-main)]'
                    }`}
                  >
                    <div className="font-mono text-sm font-black">{item.symbol}</div>
                    <div className="mt-0.5 text-[10px] font-bold">{item.valenceLabel}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === 'match' && (
          <section className="space-y-4">
            <div className="rounded-[1.35rem] border border-[var(--border-color)] bg-[var(--bg-highlight)]/80 px-4 py-3">
              <div className="text-xs font-black text-teal-900">左边点符号或原子团，右边点对应化合价。</div>
              <div className="mt-1 text-[11px] font-bold leading-relaxed text-[var(--text-muted)]">
                配对成功会计入“已记住”，适合课前 1 分钟热身。
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-xs font-black text-[var(--text-muted)]">符号 / 原子团</div>
                {matchRound.symbols.map((item) => {
                  const isMatched = matchedIds.includes(item.id);
                  const isSelected = selectedSymbol === item.id;
                  const isWrong = wrongPair?.symbol === item.id;

                  return (
                    <button
                      key={`symbol-${item.id}`}
                      type="button"
                      onClick={() => chooseSymbol(item.id)}
                      disabled={isMatched}
                      className={`w-full rounded-2xl border px-3 py-3 text-center transition-all ${
                        isMatched
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : isWrong
                          ? 'border-rose-300 bg-rose-50 text-rose-800'
                          : isSelected
                          ? 'border-teal-400 bg-teal-50 text-teal-900'
                          : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] hover:border-teal-300 hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="font-mono text-2xl font-black">{item.symbol}</div>
                      <div className="text-[10px] font-bold text-[var(--text-muted)]">{item.label}</div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black text-[var(--text-muted)]">化合价</div>
                {matchRound.values.map((item) => {
                  const isMatched = matchedIds.includes(item.id);
                  const isSelected = selectedValue === item.id;
                  const isWrong = wrongPair?.value === item.id;

                  return (
                    <button
                      key={`value-${item.id}`}
                      type="button"
                      onClick={() => chooseValue(item.id)}
                      disabled={isMatched}
                      className={`w-full rounded-2xl border px-3 py-3 text-center transition-all ${
                        isMatched
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : isWrong
                          ? 'border-rose-300 bg-rose-50 text-rose-800'
                          : isSelected
                          ? 'border-teal-400 bg-teal-50 text-teal-900'
                          : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] hover:border-teal-300 hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="text-xl font-black">{item.valenceLabel}</div>
                      <div className="text-[10px] font-bold text-[var(--text-muted)]">{item.examples[0]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {matchComplete && (
              <div className="rounded-[1.35rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-center">
                <div className="text-base font-black text-emerald-800">本组全配对成功！</div>
                <div className="mt-1 text-xs font-bold text-emerald-700">换一组继续冲连击。</div>
              </div>
            )}

            <button
              type="button"
              onClick={startNewMatchRound}
              className="w-full rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-black text-teal-800 transition-all hover:-translate-y-0.5 hover:border-teal-300"
            >
              换一组配对
            </button>
          </section>
        )}

        {tab === 'formula' && (
          <section className="space-y-4">
            <div className="rounded-[1.35rem] border border-sky-100 bg-sky-50/80 px-4 py-3">
              <div className="text-xs font-black text-sky-900">每组 4 题，建议按组号练习</div>
              <div className="mt-1 text-[11px] font-bold leading-relaxed text-sky-800">从单原子配平，逐步过渡到原子团、最小公倍数和括号。</div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {formulaDifficultyGroups.map((group) => {
                const isActive = group.id === formulaGroupId;
                const best = progress.formulaBestScores[group.id] ?? 0;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => startFormulaGroup(group.id)}
                    className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                      isActive
                        ? 'border-sky-400 bg-sky-50 shadow-sm'
                        : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] hover:-translate-y-0.5 hover:border-sky-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-sky-700">第 {group.difficulty} 组 · {'★'.repeat(group.difficulty)}</span>
                      {best > 0 && <span className="text-[9px] font-black text-emerald-700">最高 {best}/4</span>}
                    </div>
                    <div className="mt-1 text-sm font-black text-[var(--text-main)]">{group.title}</div>
                    <div className="mt-1 text-[10px] font-bold leading-snug text-[var(--text-muted)]">{group.focus}</div>
                  </button>
                );
              })}
            </div>

            {formulaRoundComplete ? (
              <div className="soft-card rounded-[1.75rem] p-5 text-center">
                <div className="text-xs font-black text-sky-700">第 {activeFormulaGroup.difficulty} 组 · {activeFormulaGroup.title}</div>
                <div className="mt-3 text-5xl font-black text-[var(--text-main)]">{formulaRoundCorrect}<span className="text-xl text-[var(--text-muted)]"> / {formulaRoundExercises.length}</span></div>
                <div className="mt-3 text-sm font-bold text-[var(--text-muted)]">
                  {formulaRoundCorrect === formulaRoundExercises.length ? '全对！这一组的书写规则已经很稳。' : formulaRoundCorrect >= 3 ? '基本过关，重练一次可以把易错点清掉。' : '先看刚才的解析，再重练本组更有效。'}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => startFormulaGroup(formulaGroupId)}
                    className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-black text-sky-800"
                  >
                    重练本组
                  </button>
                  <button
                    type="button"
                    onClick={openNextFormulaGroup}
                    className="rounded-2xl bg-teal-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-teal-700/15"
                  >
                    {activeFormulaGroup.difficulty === formulaDifficultyGroups.length ? '回到第 1 组' : '进入下一组 →'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="soft-card rounded-[1.75rem] p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] font-black text-sky-800">
                    第 {activeFormulaGroup.difficulty} 组 · {activeFormulaGroup.title}
                  </span>
                  <span className="text-[10px] font-black text-[var(--text-muted)]">
                    第 {formulaQuestionIndex + 1}/{formulaRoundExercises.length} 题
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-black leading-snug text-[var(--text-main)]">这两个离子/原子团能拼成哪个化学式？</h2>
                <div className="mt-4">
                  <FormulaMiniBoard exercise={formulaExercise} />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2.5">
                  {formulaExercise.choices.map((choice) => {
                    const isChosen = formulaAnswer === choice;
                    const isAnswer = choice === formulaExercise.answer;
                    const resultClass = !formulaAnswer
                      ? 'border-[var(--border-color)] bg-[var(--bg-card-bright)] hover:border-teal-300 hover:-translate-y-0.5'
                      : isAnswer
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : isChosen
                      ? 'border-rose-300 bg-rose-50 text-rose-900'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] opacity-70';

                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => chooseFormulaAnswer(choice)}
                        disabled={Boolean(formulaAnswer)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left font-mono text-2xl font-black transition-all ${resultClass}`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>

                {formulaAnswer && (
                  <div className={`mt-4 rounded-2xl border px-4 py-3 ${formulaIsCorrect ? 'border-emerald-100 bg-emerald-50' : 'border-amber-100 bg-[var(--bg-amber)]'}`}>
                    <div className={`text-xs font-black ${formulaIsCorrect ? 'text-emerald-800' : 'text-amber-800'}`}>
                      {formulaIsCorrect ? '配平成功，连击 +1' : `正确答案：${formulaExercise.answer}`}
                    </div>
                    <p className="mt-1 text-sm font-bold leading-relaxed text-[var(--text-main)]">{formulaExercise.explanation}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={nextFormula}
                  disabled={!formulaAnswer}
                  className="mt-4 w-full rounded-2xl bg-teal-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-teal-700/15 transition-all hover:-translate-y-0.5 hover:bg-teal-500 disabled:bg-[var(--bg-disabled)] disabled:text-[var(--text-muted)] disabled:shadow-none disabled:hover:translate-y-0"
                >
                  {!formulaAnswer ? '先选择一个化学式' : formulaQuestionIndex === formulaRoundExercises.length - 1 ? '查看本组成绩 →' : '下一题 →'}
                </button>
              </div>
            )}
          </section>
        )}

        {tab === 'detective' && (
          <section className="space-y-4">
            <div className="rounded-[1.35rem] border border-rose-100 bg-rose-50/80 px-4 py-3">
              <div className="text-xs font-black text-rose-900">每组 4 题，难点逐层增加</div>
              <div className="mt-1 text-[11px] font-bold leading-relaxed text-rose-800">先看单质和二元化合物，再处理下标、多元素，最后挑战带电原子团。</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {oxidationDifficultyGroups.map((group) => {
                const isActive = group.id === detectiveGroupId;
                const best = progress.detectiveBestScores[group.id] ?? 0;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => startDetectiveGroup(group.id)}
                    className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                      isActive
                        ? 'border-rose-400 bg-rose-50 shadow-sm'
                        : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] hover:-translate-y-0.5 hover:border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-rose-700">第 {group.difficulty} 组 · {'★'.repeat(group.difficulty)}</span>
                      {best > 0 && <span className="text-[9px] font-black text-emerald-700">最高 {best}/4</span>}
                    </div>
                    <div className="mt-1 text-sm font-black text-[var(--text-main)]">{group.title}</div>
                    <div className="mt-1 text-[10px] font-bold leading-snug text-[var(--text-muted)]">{group.focus}</div>
                  </button>
                );
              })}
            </div>

            {detectiveRoundComplete ? (
              <div className="soft-card rounded-[1.75rem] p-5 text-center">
                <div className="text-xs font-black text-rose-700">第 {activeDetectiveGroup.difficulty} 组 · {activeDetectiveGroup.title}</div>
                <div className="mt-3 text-5xl font-black text-[var(--text-main)]">{detectiveRoundCorrect}<span className="text-xl text-[var(--text-muted)]"> / {detectiveRoundExercises.length}</span></div>
                <div className="mt-3 text-sm font-bold text-[var(--text-muted)]">
                  {detectiveRoundCorrect === detectiveRoundExercises.length ? '全对！这一层的化合价守恒已经掌握。' : detectiveRoundCorrect >= 3 ? '基本过关，重练一次可以把计算做得更稳。' : '先按解析逐项列式，再重练本组。'}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => startDetectiveGroup(detectiveGroupId)}
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-800"
                  >
                    重练本组
                  </button>
                  <button
                    type="button"
                    onClick={openNextDetectiveGroup}
                    className="rounded-2xl bg-teal-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-teal-700/15"
                  >
                    {activeDetectiveGroup.difficulty === oxidationDifficultyGroups.length ? '回到第 1 组' : '进入下一组 →'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="soft-card rounded-[1.75rem] p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-800">
                    第 {activeDetectiveGroup.difficulty} 组 · {activeDetectiveGroup.title}
                  </span>
                  <span className="text-[10px] font-black text-[var(--text-muted)]">
                    第 {detectiveQuestionIndex + 1}/{detectiveRoundExercises.length} 题
                  </span>
                </div>
                <div className="mt-5 rounded-[1.35rem] border border-[var(--border-color)] bg-gradient-to-br from-slate-950 via-teal-900 to-rose-900 px-5 py-6 text-white">
                  <div className="text-[10px] font-black tracking-[0.22em] text-white/55">UNKNOWN VALENCE</div>
                  <div className="mt-4 text-center font-mono text-6xl font-black leading-none">{oxidationExercise.formula}</div>
                  <div className="mt-4 text-center text-sm font-black text-white/80">
                    求 {oxidationExercise.target} 的化合价
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-highlight)] px-4 py-3 text-sm font-bold leading-relaxed text-teal-900">
                  已知：{oxidationExercise.known}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {oxidationExercise.choices.map((choice) => {
                    const isChosen = oxidationAnswer === choice;
                    const isAnswer = choice === oxidationExercise.answer;
                    const resultClass = !oxidationAnswer
                      ? 'border-[var(--border-color)] bg-[var(--bg-card-bright)] hover:border-teal-300 hover:-translate-y-0.5'
                      : isAnswer
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : isChosen
                      ? 'border-rose-300 bg-rose-50 text-rose-900'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] opacity-70';

                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => chooseOxidationAnswer(choice)}
                        disabled={Boolean(oxidationAnswer)}
                        className={`rounded-2xl border px-4 py-4 text-center text-lg font-black transition-all ${resultClass}`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>

                {oxidationAnswer && (
                  <div className={`mt-4 rounded-2xl border px-4 py-3 ${detectiveIsCorrect ? 'border-emerald-100 bg-emerald-50' : 'border-amber-100 bg-[var(--bg-amber)]'}`}>
                    <div className={`text-xs font-black ${detectiveIsCorrect ? 'text-emerald-800' : 'text-amber-800'}`}>
                      {detectiveIsCorrect ? '推理正确，连击 +1' : `正确答案：${oxidationExercise.answer}`}
                    </div>
                    <div className="mt-2 rounded-xl bg-white/60 px-3 py-2 font-mono text-sm font-black text-[var(--text-main)]">
                      {oxidationExercise.equation}
                    </div>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-[var(--text-main)]">{oxidationExercise.explanation}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={nextOxidation}
                  disabled={!oxidationAnswer}
                  className="mt-4 w-full rounded-2xl bg-teal-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-teal-700/15 transition-all hover:-translate-y-0.5 hover:bg-teal-500 disabled:bg-[var(--bg-disabled)] disabled:text-[var(--text-muted)] disabled:shadow-none disabled:hover:translate-y-0"
                >
                  {!oxidationAnswer ? '先选择一个化合价' : detectiveQuestionIndex === detectiveRoundExercises.length - 1 ? '查看本组成绩 →' : '下一题 →'}
                </button>
              </div>
            )}
          </section>
        )}

        <section className="mt-5 rounded-[1.35rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black text-[var(--text-main)]">学习记录只保存在本功能</div>
              <div className="mt-1 text-[11px] font-bold text-[var(--text-muted)]">
                不影响知识树 XP，也不会改云端主线进度。
              </div>
            </div>
            <button
              type="button"
              onClick={resetProgress}
              className="shrink-0 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-[10px] font-black text-rose-700"
            >
              清空记录
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
