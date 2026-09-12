import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { elements20, type BeginnerElement } from '../data/elements20';
import type { StudentProfile } from '../types';
import { ElementGroupArena } from './ElementGroupArena';

type ElementTab = 'cards' | 'quiz' | 'match';
type QuizKind = 'symbolToName' | 'nameToSymbol' | 'numberToName';

interface ElementFlashcardsProps {
  courseId: string;
  profile: StudentProfile | null;
  onBack: () => void;
  backLabel?: string;
  initialTab?: ElementTab;
  onRegister?: () => void;
  quickTrial?: boolean;
  onCompleteTrial?: () => void;
}

interface ElementProgress {
  masteredSymbols: string[];
  quizCorrect: number;
  quizTotal: number;
  matchRounds: number;
  updatedAt?: string;
}

interface QuizQuestion {
  element: BeginnerElement;
  kind: QuizKind;
  prompt: string;
  answer: string;
  choices: string[];
  helper: string;
}

interface MatchRound {
  elements: BeginnerElement[];
  symbols: BeginnerElement[];
  names: BeginnerElement[];
}

type MatchInsightTone = 'strong' | 'developing' | 'review';

interface MatchInsight {
  tone: MatchInsightTone;
  title: string;
  summary: string;
  nextStep: string;
}

const ELEMENT_SCENE_SPRITESHEET = '/elements/elements-life-spritesheet.png';

const defaultProgress: ElementProgress = {
  masteredSymbols: [],
  quizCorrect: 0,
  quizTotal: 0,
  matchRounds: 0,
};

const categoryClass: Record<BeginnerElement['category'], string> = {
  非金属: 'bg-sky-50 text-sky-800 border-sky-100',
  金属: 'bg-amber-50 text-amber-800 border-amber-100',
  稀有气体: 'bg-violet-50 text-violet-800 border-violet-100',
  类金属: 'bg-emerald-50 text-emerald-800 border-emerald-100',
};

const categoryVisualClass: Record<
  BeginnerElement['category'],
  { accent: string; surface: string; chip: string; text: string }
> = {
  非金属: {
    accent: 'from-sky-500 to-teal-500',
    surface: 'bg-sky-50/70',
    chip: 'border-sky-200 bg-sky-50 text-sky-800',
    text: 'text-sky-800',
  },
  金属: {
    accent: 'from-amber-500 to-orange-500',
    surface: 'bg-amber-50/75',
    chip: 'border-amber-200 bg-amber-50 text-amber-800',
    text: 'text-amber-800',
  },
  稀有气体: {
    accent: 'from-violet-500 to-indigo-500',
    surface: 'bg-violet-50/70',
    chip: 'border-violet-200 bg-violet-50 text-violet-800',
    text: 'text-violet-800',
  },
  类金属: {
    accent: 'from-emerald-500 to-lime-500',
    surface: 'bg-emerald-50/70',
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    text: 'text-emerald-800',
  },
};

const symbolDisplayClass = {
  overlay: {
    wrap: 'text-4xl',
    first: 'text-teal-900',
    second: 'text-rose-600',
    secondSubtle: 'text-rose-600',
  },
  icon: {
    wrap: 'text-3xl',
    first: 'text-teal-900',
    second: 'text-rose-600',
    secondSubtle: 'text-rose-600',
  },
  main: {
    wrap: 'text-5xl',
    first: 'text-teal-800',
    second: 'text-rose-600',
    secondSubtle: 'text-rose-600',
  },
  grid: {
    wrap: 'text-sm',
    first: 'text-current',
    second: 'text-rose-600',
    secondSubtle: 'text-rose-600',
  },
  quiz: {
    wrap: 'text-2xl',
    first: 'text-current',
    second: 'text-rose-600',
    secondSubtle: 'text-rose-600',
  },
  match: {
    wrap: 'text-2xl',
    first: 'text-current',
    second: 'text-rose-600',
    secondSubtle: 'text-rose-600',
  },
} as const;

type SymbolDisplaySize = keyof typeof symbolDisplayClass;

function isElementSymbol(value: string) {
  return elements20.some((element) => element.symbol === value);
}

function renderElementSymbol(symbol: string, size: SymbolDisplaySize = 'main', showCaseHint = false) {
  const first = symbol.slice(0, 1);
  const second = symbol.slice(1);
  const classes = symbolDisplayClass[size];

  return (
    <span
      aria-label={symbol}
      className={`inline-flex items-baseline justify-center font-serif font-black leading-none ${classes.wrap}`}
    >
      <span className={classes.first}>{first}</span>
      {second && (
        <span className={`lowercase ${showCaseHint ? classes.second : classes.secondSubtle}`}>
          {second.toLowerCase()}
        </span>
      )}
    </span>
  );
}

function getProgressKey(profileId: string, courseId: string) {
  return `chem-tree-elements:${profileId}:${courseId}`;
}

function loadElementProgress(key: string): ElementProgress {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as Partial<ElementProgress>;
    return {
      masteredSymbols: Array.isArray(parsed.masteredSymbols) ? parsed.masteredSymbols : [],
      quizCorrect: Number(parsed.quizCorrect ?? 0),
      quizTotal: Number(parsed.quizTotal ?? 0),
      matchRounds: Number(parsed.matchRounds ?? 0),
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

function sampleElements(count: number) {
  return shuffle(elements20).slice(0, count);
}

function makeChoices(answer: string, pool: string[], count = 4) {
  const wrong = shuffle(pool.filter((item) => item !== answer)).slice(0, count - 1);
  return shuffle([answer, ...wrong]);
}

function makeQuizQuestion(): QuizQuestion {
  const element = elements20[Math.floor(Math.random() * elements20.length)];
  const kinds: QuizKind[] = ['symbolToName', 'nameToSymbol', 'numberToName'];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];

  if (kind === 'nameToSymbol') {
    return {
      element,
      kind,
      prompt: `${element.name} 的元素符号是？`,
      answer: element.symbol,
      choices: makeChoices(element.symbol, elements20.map((item) => item.symbol)),
      helper: '元素符号要注意大小写：第一个字母大写，第二个字母小写。',
    };
  }

  if (kind === 'numberToName') {
    return {
      element,
      kind,
      prompt: `第 ${element.atomicNumber} 号元素是？`,
      answer: element.name,
      choices: makeChoices(element.name, elements20.map((item) => item.name)),
      helper: '前20号元素先按序号背熟，后面学化学式会轻松很多。',
    };
  }

  return {
    element,
    kind,
    prompt: `${element.symbol} 是什么元素？`,
    answer: element.name,
    choices: makeChoices(element.name, elements20.map((item) => item.name)),
    helper: '看到符号先读成元素名称，再联想常见物质。',
  };
}

function makeMatchRound(): MatchRound {
  const elements = sampleElements(6);
  return {
    elements,
    symbols: shuffle(elements),
    names: shuffle(elements),
  };
}

function buildMatchInsight(wrongAttempts: number, confusedElements: BeginnerElement[]): MatchInsight {
  const confusedLabels = confusedElements
    .slice(0, 3)
    .map((element) => `${element.name}（${element.symbol}）`)
    .join('、');

  if (wrongAttempts === 0) {
    return {
      tone: 'strong',
      title: '这一组匹配稳定',
      summary: '6 个元素一次配对成功，说明这一组的名称和符号已经能快速对应。',
      nextStep: '再换一组验证，连续两组稳定才更接近真正记住。',
    };
  }

  if (wrongAttempts <= 2) {
    return {
      tone: 'developing',
      title: '基本掌握，还有少量易混',
      summary: confusedLabels
        ? `本轮曾在 ${confusedLabels} 附近出现错配，先把这些符号单独看一遍。`
        : '本轮出现了少量错配，说明名称和符号的对应还不够稳定。',
      nextStep: '先看易混元素，再换一组验证能否一次完成。',
    };
  }

  return {
    tone: 'review',
    title: '这一组还需要巩固',
    summary: confusedLabels
      ? `错配主要集中在 ${confusedLabels} 附近，现在继续盲猜效果不大。`
      : '本轮多次出现错配，名称和符号之间还没有形成稳定对应。',
    nextStep: '先回到闪卡逐个记画面和符号，再重新挑战这一类配对。',
  };
}

function addMastered(progress: ElementProgress, symbol: string) {
  if (progress.masteredSymbols.includes(symbol)) return progress.masteredSymbols;
  return [...progress.masteredSymbols, symbol];
}

function getSceneStyle(activeIndex: number): CSSProperties {
  const col = activeIndex % 5;
  const row = Math.floor(activeIndex / 5);

  return {
    backgroundImage: `url(${ELEMENT_SCENE_SPRITESHEET})`,
    backgroundSize: '500% 400%',
    backgroundPosition: `${col * 25}% ${row * (100 / 3)}%`,
  };
}

export function ElementFlashcards({
  courseId,
  profile,
  onBack,
  backLabel = '返回模式选择',
  initialTab = 'cards',
  onRegister,
  quickTrial = false,
  onCompleteTrial,
}: ElementFlashcardsProps) {
  const profileId = profile?.profileId ?? 'guest';
  const storageKey = useMemo(() => getProgressKey(profileId, courseId), [courseId, profileId]);
  const [tab, setTab] = useState<ElementTab>(initialTab);
  const [progress, setProgress] = useState<ElementProgress>(() => loadElementProgress(storageKey));
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion>(() => makeQuizQuestion());
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [matchRound, setMatchRound] = useState<MatchRound>(() => makeMatchRound());
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [matchedSymbols, setMatchedSymbols] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ symbol: string; name: string } | null>(null);
  const [matchScoreSignal, setMatchScoreSignal] = useState(0);
  const [matchIncorrectAttempts, setMatchIncorrectAttempts] = useState(0);
  const [matchConfusedSymbols, setMatchConfusedSymbols] = useState<string[]>([]);
  const [matchStartedAt, setMatchStartedAt] = useState<number | null>(null);
  const [matchCompletedAt, setMatchCompletedAt] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ ...progress, updatedAt: new Date().toISOString() }));
    } catch {
      // Element practice progress is local and best-effort.
    }
  }, [progress, storageKey]);

  const activeElement = elements20[activeIndex];
  const activeVisual = categoryVisualClass[activeElement.category];
  const sceneStyle = getSceneStyle(activeIndex);
  const masteredSet = useMemo(() => new Set(progress.masteredSymbols), [progress.masteredSymbols]);
  const masteredCount = progress.masteredSymbols.length;
  const overallPercent = Math.round((masteredCount / elements20.length) * 100);
  const quizAccuracy = progress.quizTotal > 0 ? Math.round((progress.quizCorrect / progress.quizTotal) * 100) : 0;
  const selectedIsCorrect = selectedAnswer === quizQuestion.answer;
  const matchComplete = matchedSymbols.length === matchRound.elements.length;
  const confusedElements = useMemo(
    () => matchRound.elements.filter((element) => matchConfusedSymbols.includes(element.symbol)),
    [matchConfusedSymbols, matchRound.elements],
  );
  const matchInsight = useMemo(
    () => buildMatchInsight(matchIncorrectAttempts, confusedElements),
    [confusedElements, matchIncorrectAttempts],
  );
  const matchElapsedSeconds = matchStartedAt && matchCompletedAt
    ? Math.max(1, Math.round((matchCompletedAt - matchStartedAt) / 1000))
    : null;

  useEffect(() => {
    if (quickTrial && matchComplete) onCompleteTrial?.();
  }, [matchComplete, onCompleteTrial, quickTrial]);

  const updateProgress = (updater: (prev: ElementProgress) => ElementProgress) => {
    setProgress((prev) => updater(prev));
  };

  const jumpToElement = (idx: number) => {
    setActiveIndex(idx);
    setFlipped(false);
  };

  const moveCard = (delta: number) => {
    const next = (activeIndex + delta + elements20.length) % elements20.length;
    jumpToElement(next);
  };

  const toggleMastered = (symbol: string) => {
    updateProgress((prev) => ({
      ...prev,
      masteredSymbols: prev.masteredSymbols.includes(symbol)
        ? prev.masteredSymbols.filter((item) => item !== symbol)
        : [...prev.masteredSymbols, symbol],
    }));
  };

  const chooseAnswer = (choice: string) => {
    if (selectedAnswer) return;

    const isCorrect = choice === quizQuestion.answer;
    setSelectedAnswer(choice);
    setSessionTotal((prev) => prev + 1);
    setSessionCorrect((prev) => prev + (isCorrect ? 1 : 0));
    updateProgress((prev) => ({
      ...prev,
      quizCorrect: prev.quizCorrect + (isCorrect ? 1 : 0),
      quizTotal: prev.quizTotal + 1,
      masteredSymbols: isCorrect ? addMastered(prev, quizQuestion.element.symbol) : prev.masteredSymbols,
    }));
  };

  const nextQuestion = () => {
    setQuizQuestion(makeQuizQuestion());
    setSelectedAnswer(null);
  };

  const startNewMatchRound = () => {
    setMatchRound(makeMatchRound());
    setSelectedSymbol(null);
    setSelectedName(null);
    setMatchedSymbols([]);
    setWrongPair(null);
    setMatchIncorrectAttempts(0);
    setMatchConfusedSymbols([]);
    setMatchStartedAt(null);
    setMatchCompletedAt(null);
  };

  const tryMatch = (symbol: string | null, name: string | null, interactionAt: number) => {
    if (!symbol || !name) return;

    const isCorrect = symbol === name;
    if (isCorrect) {
      const isNewMatch = !matchedSymbols.includes(symbol);
      const nextMatched = isNewMatch ? [...matchedSymbols, symbol] : matchedSymbols;
      setMatchedSymbols(nextMatched);
      setSelectedSymbol(null);
      setSelectedName(null);
      if (isNewMatch) {
        setMatchScoreSignal((prev) => prev + 1);
      }
      if (nextMatched.length === matchRound.elements.length) {
        setMatchCompletedAt(interactionAt);
      }
      updateProgress((prev) => ({
        ...prev,
        masteredSymbols: addMastered(prev, symbol),
        matchRounds: nextMatched.length === matchRound.elements.length ? prev.matchRounds + 1 : prev.matchRounds,
      }));
      return;
    }

    setWrongPair({ symbol, name });
    setMatchIncorrectAttempts((prev) => prev + 1);
    setMatchConfusedSymbols((prev) => Array.from(new Set([...prev, symbol, name])));
    setSelectedSymbol(null);
    setSelectedName(null);
    window.setTimeout(() => setWrongPair(null), 650);
  };

  const chooseSymbol = (symbol: string, interactionAt: number) => {
    if (matchedSymbols.includes(symbol)) return;
    setMatchStartedAt((prev) => prev ?? interactionAt);
    setSelectedSymbol(symbol);
    tryMatch(symbol, selectedName, interactionAt);
  };

  const chooseName = (symbol: string, interactionAt: number) => {
    if (matchedSymbols.includes(symbol)) return;
    setMatchStartedAt((prev) => prev ?? interactionAt);
    setSelectedName(symbol);
    tryMatch(selectedSymbol, symbol, interactionAt);
  };

  const resetProgress = () => {
    if (!window.confirm('确定清空前20号元素的本地练习记录吗？主线学习进度不会受影响。')) return;
    setProgress(defaultProgress);
    setSessionCorrect(0);
    setSessionTotal(0);
    startNewMatchRound();
    setSelectedAnswer(null);
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
              <h1 className="text-xl font-black tracking-tight text-[var(--text-main)]">前20号元素训练营</h1>
              <p className="mt-1 text-xs font-bold leading-relaxed text-[var(--text-muted)]">
                八年级入门版：先看生活画面，再记序号、名称和符号。
              </p>
            </div>
            <div className="shrink-0 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-right">
              <div className="text-sm font-black text-emerald-700">{masteredCount}/20</div>
              <div className="text-[10px] font-black text-emerald-700">已记住</div>
            </div>
          </div>

          <div className="mt-3 h-2 rounded-full bg-[var(--bg-disabled)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
              style={{ width: `${overallPercent}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-2xl bg-[var(--bg-disabled)] p-1">
            {([
              ['cards', '闪卡'],
              ['match', '配对'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-xl px-3 py-2 text-center text-xs font-black transition-all ${
                  tab === key ? 'bg-[var(--bg-card-bright)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-4 pb-10">
        {tab === 'cards' && (
          <section className="space-y-4">
            <div
              className={`relative w-full overflow-hidden rounded-[1.75rem] border text-left shadow-xl transition-all ${
                flipped
                  ? 'border-[var(--border-color)] bg-[var(--bg-card-bright)] p-5'
                  : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] text-[var(--text-main)]'
              }`}
            >
              {!flipped ? (
                <div className="relative min-h-[500px] p-4">
                  <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${activeVisual.accent}`} />
                  <div className="absolute inset-0 tiny-lab-dot opacity-30" />

                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className={`rounded-2xl border px-3 py-2 text-center shadow-sm ${activeVisual.surface} border-[var(--border-color)]`}>
                      <div className="text-[10px] font-black tracking-widest text-[var(--text-muted)]">ATOMIC NO.</div>
                      <div className={`text-2xl font-black ${activeVisual.text}`}>{activeElement.atomicNumber}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${activeVisual.chip}`}>
                        {activeElement.category}
                      </span>
                      {masteredSet.has(activeElement.symbol) && (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-800">
                          已记住
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 mt-4 overflow-hidden rounded-[1.45rem] border border-[var(--border-color)] bg-white shadow-sm">
                    <div
                      className="h-72 w-full bg-cover bg-no-repeat"
                      style={sceneStyle}
                      aria-label={`${activeElement.name}的生活联想图：${activeElement.sceneCue}`}
                      role="img"
                    />
                  </div>

                  <div className="relative z-10 mt-3 flex justify-center">
                    <div className={`w-full rounded-2xl border px-5 py-4 text-center shadow-sm ${activeVisual.surface} border-[var(--border-color)]`}>
                      <div>
                        {renderElementSymbol(activeElement.symbol, 'overlay', true)}
                      </div>
                      <div className="mt-1 text-2xl font-black text-[var(--text-main)]">
                        {activeElement.name}
                      </div>
                      <div className="mt-2 inline-flex rounded-full border border-[var(--border-color)] bg-white/70 px-3 py-1 text-[11px] font-black text-[var(--text-muted)]">
                        生活图像：{activeElement.sceneCue}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-4 rounded-[1.35rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-black tracking-[0.18em] text-[var(--text-muted)]">先记画面，再记符号</div>
                        <div className="mt-1 text-sm font-black text-[var(--text-main)]">{activeElement.commonLinks[0]}</div>
                      </div>
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)]">
                        {renderElementSymbol(activeElement.symbol, 'icon', activeElement.symbol.length > 1)}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeElement.commonLinks.slice(0, 3).map((item) => (
                        <span key={item} className={`rounded-full border px-3 py-1.5 text-[11px] font-black ${activeVisual.chip}`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-2xl bg-teal-50 px-3 py-2 text-center border border-teal-100">
                      <div className="text-[10px] font-black text-teal-700">原子序数</div>
                      <div className="text-2xl font-black text-teal-900">{activeElement.atomicNumber}</div>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${categoryClass[activeElement.category]}`}>
                      {activeElement.category}
                    </span>
                  </div>
                  <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-[var(--border-color)] bg-slate-900">
                    <div
                      className="h-44 w-full bg-cover bg-no-repeat"
                      style={sceneStyle}
                      aria-label={`${activeElement.name}的生活联想图：${activeElement.sceneCue}`}
                      role="img"
                    />
                  </div>
                  <div className="mt-4 rounded-[1.35rem] border border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-highlight)] to-white px-4 py-4 text-center">
                    <div>{renderElementSymbol(activeElement.symbol, 'main', activeElement.symbol.length > 1)}</div>
                    {activeElement.symbol.length > 1 && (
                      <div className="mt-2 text-[11px] font-black text-amber-700">
                        元素符号规则：第一个字母大写，第二个字母小写。
                      </div>
                    )}
                    <div className="mt-1 text-2xl font-black text-[var(--text-main)]">{activeElement.name}</div>
                    <div className="mt-2 text-xs font-black text-[var(--text-muted)]">生活记忆点：{activeElement.sceneCue}</div>
                  </div>
                  <div className="mt-5 text-xs font-black tracking-widest text-teal-700">常见关联</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeElement.commonLinks.map((item) => (
                      <span key={item} className="rounded-full border border-[var(--border-color)] bg-[var(--bg-highlight)] px-3 py-1.5 text-xs font-black text-teal-900">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl border border-amber-100 bg-[var(--bg-amber)] px-4 py-3">
                    <div className="text-xs font-black text-amber-800">坤哥提醒</div>
                    <p className="mt-1 text-sm font-bold leading-relaxed text-amber-900">{activeElement.beginnerTip}</p>
                  </div>
                  <div className="mt-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-bold leading-relaxed text-indigo-900">
                    {activeElement.memoryHint}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => moveCard(-1)}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-3 text-xs font-black text-teal-800 transition-all hover:-translate-y-0.5"
              >
                ← 上一张
              </button>
              <button
                type="button"
                onClick={() => setFlipped((prev) => !prev)}
                className="rounded-2xl border border-amber-200 bg-[var(--bg-amber)] px-3 py-3 text-xs font-black text-amber-800 transition-all hover:-translate-y-0.5"
              >
                {flipped ? '看画面' : '看提醒'}
              </button>
              <button
                type="button"
                onClick={() => toggleMastered(activeElement.symbol)}
                className={`rounded-2xl px-3 py-3 text-xs font-black transition-all hover:-translate-y-0.5 ${
                  masteredSet.has(activeElement.symbol)
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border border-teal-200 bg-teal-50 text-teal-800'
                }`}
              >
                {masteredSet.has(activeElement.symbol) ? '已记住 ✓' : '标记会了'}
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
              <div className="grid grid-cols-5 gap-2">
                {elements20.map((element, idx) => (
                  <button
                    key={element.symbol}
                    type="button"
                    onClick={() => jumpToElement(idx)}
                    className={`rounded-xl border px-2 py-2 text-center transition-all ${
                      idx === activeIndex
                        ? 'border-teal-400 bg-teal-50 text-teal-900'
                        : masteredSet.has(element.symbol)
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
                        : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] text-[var(--text-main)]'
                    }`}
                  >
                    <div>{renderElementSymbol(element.symbol, 'grid')}</div>
                    <div className="text-[10px] font-bold">{element.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === 'quiz' && (
          <section className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-3 py-2 text-center">
                <div className="text-base font-black text-teal-800">{sessionCorrect}/{sessionTotal}</div>
                <div className="text-[10px] font-black text-[var(--text-muted)]">本次挑战</div>
              </div>
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-3 py-2 text-center">
                <div className="text-base font-black text-amber-700">{quizAccuracy}%</div>
                <div className="text-[10px] font-black text-[var(--text-muted)]">累计正确率</div>
              </div>
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-3 py-2 text-center">
                <div className="text-base font-black text-emerald-700">{progress.matchRounds}</div>
                <div className="text-[10px] font-black text-[var(--text-muted)]">配对通关</div>
              </div>
            </div>

            <div className="soft-card rounded-[1.75rem] p-5">
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${categoryClass[quizQuestion.element.category]}`}>
                  {quizQuestion.element.category}
                </span>
                <span className="text-[10px] font-black text-[var(--text-muted)]">
                  第 {quizQuestion.element.atomicNumber} 号
                </span>
              </div>
              <h2 className="mt-5 text-xl font-black leading-snug text-[var(--text-main)]">{quizQuestion.prompt}</h2>
              <div className="mt-4 grid grid-cols-1 gap-2.5">
                {quizQuestion.choices.map((choice) => {
                  const isChosen = selectedAnswer === choice;
                  const isAnswer = choice === quizQuestion.answer;
                  const resultClass = !selectedAnswer
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
                      onClick={() => chooseAnswer(choice)}
                      disabled={Boolean(selectedAnswer)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-black transition-all ${resultClass}`}
                    >
                      {isElementSymbol(choice) ? renderElementSymbol(choice, 'quiz', choice.length > 1) : choice}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer && (
                <div className={`mt-4 rounded-2xl border px-4 py-3 ${selectedIsCorrect ? 'border-emerald-100 bg-emerald-50' : 'border-amber-100 bg-[var(--bg-amber)]'}`}>
                  <div className={`text-xs font-black ${selectedIsCorrect ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {selectedIsCorrect ? '答对了，记忆 +1' : '正确答案：'}
                    {!selectedIsCorrect && (
                      <span className="ml-1 align-middle">
                        {isElementSymbol(quizQuestion.answer)
                          ? renderElementSymbol(quizQuestion.answer, 'grid', quizQuestion.answer.length > 1)
                          : quizQuestion.answer}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-bold leading-relaxed text-[var(--text-main)]">
                    {quizQuestion.element.beginnerTip}
                  </p>
                  <p className="mt-1 text-xs font-bold leading-relaxed text-[var(--text-muted)]">
                    {quizQuestion.helper}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={nextQuestion}
                disabled={!selectedAnswer}
                className="mt-4 w-full rounded-2xl bg-teal-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-teal-700/15 transition-all hover:-translate-y-0.5 hover:bg-teal-500 disabled:bg-[var(--bg-disabled)] disabled:text-[var(--text-muted)] disabled:shadow-none disabled:hover:translate-y-0"
              >
                {selectedAnswer ? '下一题 →' : '先选择一个答案'}
              </button>
            </div>
          </section>
        )}

        {tab === 'match' && (
          <section className="space-y-4">
            <div className="rounded-[1.35rem] border border-[var(--border-color)] bg-[var(--bg-highlight)]/80 px-4 py-3">
              <div className="text-xs font-black text-teal-900">
                点击左边符号，再点右边元素名，配成一组。
              </div>
              <div className="mt-1 text-[11px] font-bold leading-relaxed text-[var(--text-muted)]">
                这一组完成后会自动计入“已记住”，适合手机上快速练。
              </div>
            </div>

            {!quickTrial && (
              <ElementGroupArena storageKey={`${storageKey}:arena`} compact scoreSignal={matchScoreSignal} />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-xs font-black text-[var(--text-muted)]">元素符号</div>
                {matchRound.symbols.map((element) => {
                  const isMatched = matchedSymbols.includes(element.symbol);
                  const isSelected = selectedSymbol === element.symbol;
                  const isWrong = wrongPair?.symbol === element.symbol;

                  return (
                    <button
                      key={`symbol-${element.symbol}`}
                      type="button"
                      onClick={(event) => chooseSymbol(element.symbol, event.timeStamp)}
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
                      <div>{renderElementSymbol(element.symbol, 'match', element.symbol.length > 1)}</div>
                      <div className="text-[10px] font-bold text-[var(--text-muted)]">第 {element.atomicNumber} 号</div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black text-[var(--text-muted)]">元素名称</div>
                {matchRound.names.map((element) => {
                  const isMatched = matchedSymbols.includes(element.symbol);
                  const isSelected = selectedName === element.symbol;
                  const isWrong = wrongPair?.name === element.symbol;

                  return (
                    <button
                      key={`name-${element.symbol}`}
                      type="button"
                      onClick={(event) => chooseName(element.symbol, event.timeStamp)}
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
                      <div className="text-xl font-black">{element.name}</div>
                      <div className="text-[10px] font-bold text-[var(--text-muted)]">{element.commonLinks[0]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {matchComplete && (
              <div className="space-y-3">
                {quickTrial ? (
                  <div className="rounded-[1.6rem] border border-teal-100 bg-[var(--bg-card)] p-4 shadow-lg shadow-teal-900/5" aria-live="polite">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-black tracking-[0.18em] text-teal-700">你的试玩结果</div>
                        <h2 className="mt-1 text-xl font-black text-[var(--text-main)]">6 个元素已完成</h2>
                      </div>
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-2xl">✓</div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-2xl bg-emerald-50 px-2 py-2.5 text-center">
                        <div className="text-lg font-black text-emerald-800">6/6</div>
                        <div className="text-[9px] font-black text-emerald-700">完成配对</div>
                      </div>
                      <div className="rounded-2xl bg-amber-50 px-2 py-2.5 text-center">
                        <div className="text-lg font-black text-amber-800">{matchIncorrectAttempts}</div>
                        <div className="text-[9px] font-black text-amber-700">错配次数</div>
                      </div>
                      <div className="rounded-2xl bg-sky-50 px-2 py-2.5 text-center">
                        <div className="text-lg font-black text-sky-800">{matchElapsedSeconds ? `${matchElapsedSeconds}s` : '完成'}</div>
                        <div className="text-[9px] font-black text-sky-700">本轮用时</div>
                      </div>
                    </div>

                    <div className={`mt-3 rounded-[1.35rem] border px-4 py-3 ${
                      matchInsight.tone === 'strong'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                        : matchInsight.tone === 'developing'
                        ? 'border-amber-200 bg-amber-50 text-amber-950'
                        : 'border-rose-200 bg-rose-50 text-rose-950'
                    }`}>
                      <div className="text-[10px] font-black tracking-wide opacity-70">基于这一轮的初步判断</div>
                      <div className="mt-1 text-base font-black">{matchInsight.title}</div>
                      <p className="mt-1 text-xs font-bold leading-5 opacity-85">{matchInsight.summary}</p>
                    </div>

                    <div className="mt-3 rounded-[1.35rem] border border-indigo-100 bg-indigo-50 px-4 py-3">
                      <div className="text-[10px] font-black tracking-wide text-indigo-700">下一步建议</div>
                      <p className="mt-1 text-sm font-black leading-6 text-indigo-950">{matchInsight.nextStep}</p>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={startNewMatchRound}
                        className="rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-600 px-4 py-3 text-sm font-black text-white shadow-md shadow-teal-800/15 transition-all hover:-translate-y-0.5"
                      >
                        继续下一组验证
                      </button>
                      <button
                        type="button"
                        onClick={() => setTab('cards')}
                        className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-black text-teal-800 transition-all hover:-translate-y-0.5"
                      >
                        先看闪卡巩固
                      </button>
                    </div>

                    <p className="mt-3 text-center text-[10px] font-bold leading-4 text-[var(--text-muted)]">
                      这一轮只检查了 6 个元素，结果用于安排下一步，不代表全部 20 个元素都已掌握。
                    </p>
                  </div>
                ) : (
                  <div className="rounded-[1.35rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-center">
                    <div className="text-base font-black text-emerald-800">🎉 6 个元素全配对成功！</div>
                    <div className="mt-1 text-xs font-bold text-emerald-700">第一轮挑战完成，可以继续巩固。</div>
                  </div>
                )}

                {!profile && onRegister && (
                  <div className="rounded-[1.35rem] border border-amber-200 bg-[var(--bg-amber)] px-4 py-4 text-center shadow-sm">
                    <div className="text-sm font-black text-amber-900">想保存这次结果并继续训练？</div>
                    <p className="mt-1 text-xs font-bold leading-relaxed text-amber-800">
                      注册后可开启云端存档、完整知识树和阶段学习报告。
                    </p>
                    <button
                      type="button"
                      onClick={onRegister}
                      className="mt-3 w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-black text-white shadow-md shadow-amber-700/15 transition-all hover:-translate-y-0.5 hover:bg-amber-400"
                    >
                      🔑 保存结果并开启完整训练
                    </button>
                    <div className="mt-2 text-[10px] font-bold text-amber-700">需要老师提供的邀请码；也可以先继续免注册试玩</div>
                  </div>
                )}
              </div>
            )}

            {!matchComplete && (
              <button
                type="button"
                onClick={startNewMatchRound}
                className="w-full rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-black text-teal-800 transition-all hover:-translate-y-0.5 hover:border-teal-300"
              >
                换一组配对
              </button>
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
