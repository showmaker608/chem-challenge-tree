import { useEffect, useMemo, useRef, useState } from 'react';
import { elements20, type BeginnerElement } from '../data/elements20';

type ArenaMode = 'discussion' | 'random' | 'buzzer' | 'sprint' | 'classify';

interface ElementQuestion {
  prompt: string;
  answer: string;
  note: string;
}

interface ElementGroupArenaProps {
  storageKey: string;
  compact?: boolean;
  scoreSignal?: number;
}

const arenaModes: Record<ArenaMode, { label: string; howto: string }> = {
  discussion: {
    label: '问题讨论',
    howto: '各组先独立思考，再合并答案。展示时说清“判断 + 理由”，老师按表现加分。',
  },
  random: {
    label: '随机抽题',
    howto: '抽到题后指定小组回答；答对的小组 +1，需要补充可以交给其他小组。',
  },
  buzzer: {
    label: '即时抢答',
    howto: '老师点出题后，各组抢答。先抢到的小组回答，答对 +1，答错可扣分或转给下一组。',
  },
  sprint: {
    label: '限时连击',
    howto: '选一个小组限时快答，答对立即加分并换下一题，适合课前热身。',
  },
  classify: {
    label: '协作归类',
    howto: '各组把元素材料归入对应类别，点“揭晓答案”核对要点，按正确数加分。',
  },
};

const discussionPrompts = [
  {
    prompt: '为什么前20号元素里，有些元素符号和中文名看起来不像？',
    answer: '元素符号来自拉丁文或英文，不是中文拼音，例如 Na 是钠，K 是钾。',
    note: '重点看学生能不能举例：Na、K、Fe 等。',
  },
  {
    prompt: '两个字母的元素符号，书写时最容易错在哪里？',
    answer: '第一个字母大写，第二个字母小写，如 He、Mg、Cl，不能写成 HE、MG、CL。',
    note: '这是八阶入门最常见低级失分点。',
  },
  {
    prompt: '看到元素符号时，应该先想到哪些信息？',
    answer: '元素名称、原子序数、常见物质或生活联系。',
    note: '鼓励学生从符号回到真实物质，如 C 对应碳、CO₂、石墨。',
  },
];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
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

function makeQuestion(): ElementQuestion {
  const element = elements20[Math.floor(Math.random() * elements20.length)];
  const kind = Math.floor(Math.random() * 4);

  if (kind === 0) {
    return {
      prompt: `${element.name} 的元素符号是什么？`,
      answer: element.symbol,
      note: element.symbol.length > 1 ? '两个字母的元素符号，第二个字母必须小写。' : element.beginnerTip,
    };
  }

  if (kind === 1) {
    return {
      prompt: `${element.symbol} 是什么元素？`,
      answer: element.name,
      note: element.beginnerTip,
    };
  }

  if (kind === 2) {
    return {
      prompt: `第 ${element.atomicNumber} 号元素是什么？`,
      answer: element.name,
      note: '原子序数要和名称、符号一起绑定记忆。',
    };
  }

  return {
    prompt: `${element.name} 常见的生活联想或物质联系是什么？`,
    answer: element.commonLinks.join('、'),
    note: '能说出一个准确联系即可加分，说出两个以上可酌情加分。',
  };
}

function makeClassifyRound() {
  return sampleElements(8);
}

function loadArenaState(key: string) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { groupCount?: number; scores?: number[]; duration?: number };
    const groupCount = Math.min(8, Math.max(2, Number(parsed.groupCount ?? 4)));
    const scores = Array.isArray(parsed.scores)
      ? parsed.scores.slice(0, groupCount).map((score) => Number(score ?? 0))
      : [];
    while (scores.length < groupCount) scores.push(0);
    return {
      groupCount,
      scores,
      duration: Math.min(600, Math.max(30, Number(parsed.duration ?? 180))),
    };
  } catch {
    return null;
  }
}

export function ElementGroupArena({ storageKey, compact = false, scoreSignal }: ElementGroupArenaProps) {
  const saved = useMemo(() => loadArenaState(storageKey), [storageKey]);
  const lastScoreSignalRef = useRef(scoreSignal ?? 0);
  const [mode, setMode] = useState<ArenaMode>('random');
  const [groupCount, setGroupCount] = useState(saved?.groupCount ?? 4);
  const [scores, setScores] = useState<number[]>(saved?.scores ?? [0, 0, 0, 0]);
  const [duration, setDuration] = useState(saved?.duration ?? 180);
  const [remaining, setRemaining] = useState(saved?.duration ?? 180);
  const [running, setRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const [question, setQuestion] = useState<ElementQuestion>(() => makeQuestion());
  const [revealed, setRevealed] = useState(false);
  const [discussionIndex, setDiscussionIndex] = useState(0);
  const [classifyRound, setClassifyRound] = useState<BeginnerElement[]>(() => makeClassifyRound());
  const [showRanking, setShowRanking] = useState(false);
  const [sprintCorrect, setSprintCorrect] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ groupCount, scores, duration, updatedAt: new Date().toISOString() }));
    } catch {
      // Classroom scoring is local and best-effort.
    }
  }, [duration, groupCount, scores, storageKey]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          setTimerDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!compact || scoreSignal === undefined) return;
    const lastSignal = lastScoreSignalRef.current;
    if (scoreSignal > lastSignal) {
      const delta = scoreSignal - lastSignal;
      setScores((prev) => prev.map((score, index) => (index === activeGroup ? score + delta : score)));
    }
    lastScoreSignalRef.current = scoreSignal;
  }, [activeGroup, compact, scoreSignal]);

  const rankedGroups = useMemo(
    () => scores
      .map((score, index) => ({ index, score }))
      .sort((a, b) => b.score - a.score || a.index - b.index),
    [scores],
  );

  const currentDiscussion = discussionPrompts[discussionIndex];

  const adjustGroupCount = (delta: number) => {
    setGroupCount((prev) => {
      const next = Math.min(8, Math.max(2, prev + delta));
      setScores((oldScores) => {
        const copy = oldScores.slice(0, next);
        while (copy.length < next) copy.push(0);
        return copy;
      });
      setActiveGroup((oldActive) => Math.min(oldActive, next - 1));
      return next;
    });
  };

  const adjustScore = (index: number, delta: number) => {
    setScores((prev) => prev.map((score, i) => (i === index ? score + delta : score)));
  };

  const resetTimer = () => {
    setRunning(false);
    setTimerDone(false);
    setRemaining(duration);
  };

  const adjustDuration = (delta: number) => {
    const next = Math.min(600, Math.max(30, duration + delta));
    setDuration(next);
    setRunning(false);
    setTimerDone(false);
    setRemaining(next);
  };

  const toggleTimer = () => {
    if (running) {
      setRunning(false);
      return;
    }

    setTimerDone(false);
    if (remaining <= 0) {
      setRemaining(duration);
    }
    setRunning(true);
  };

  const nextQuestion = () => {
    setQuestion(makeQuestion());
    setRevealed(false);
  };

  const answerCorrect = (index = activeGroup) => {
    adjustScore(index, 1);
  };

  const sprintCorrectAnswer = () => {
    answerCorrect(activeGroup);
    setSprintCorrect((prev) => prev + 1);
    nextQuestion();
  };

  const resetScores = () => {
    if (!window.confirm('确定清空当前课堂小组积分吗？')) return;
    setScores(Array.from({ length: groupCount }, () => 0));
    setSprintCorrect(0);
    setShowRanking(false);
  };

  return (
    <section className={compact ? 'space-y-3' : 'space-y-4'}>
      {!compact && (
        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2">
            {(Object.keys(arenaModes) as ArenaMode[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={`rounded-full border px-4 py-2 text-xs font-black transition-all ${
                  mode === key
                    ? 'border-rose-600 bg-rose-600 text-white shadow-lg shadow-rose-700/10'
                    : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] text-[var(--text-main)] hover:border-teal-300'
                }`}
              >
                {arenaModes[key].label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-[1.35rem] border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3">
        <div className="border-l-4 border-teal-600 pl-3 text-sm font-bold leading-relaxed text-[var(--text-muted)]">
          {compact ? '课堂玩法：先点“组X上场”，学生每配成一对会自动给当前小组 +1；需要纠错时可直接扣分。' : arenaModes[mode].howto}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[auto_auto_1fr_auto]">
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-3 py-2">
          <div className="text-[10px] font-black text-[var(--text-muted)]">组数</div>
          <div className="mt-1 flex items-center gap-3">
            <button type="button" onClick={() => adjustGroupCount(-1)} className="h-9 w-9 rounded-xl border border-[var(--border-color)] text-xl font-black">−</button>
            <span className="w-6 text-center text-xl font-black">{groupCount}</span>
            <button type="button" onClick={() => adjustGroupCount(1)} className="h-9 w-9 rounded-xl border border-[var(--border-color)] text-xl font-black">+</button>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-3 py-2">
          <div className="text-[10px] font-black text-[var(--text-muted)]">计时</div>
          <div className="mt-1 flex items-center gap-3">
            <button type="button" onClick={() => adjustDuration(-30)} className="h-9 w-9 rounded-xl border border-[var(--border-color)] text-xl font-black">−</button>
            <span className={`w-16 text-center font-mono text-xl font-black ${remaining <= 10 ? 'text-rose-700' : 'text-amber-700'}`}>{formatTime(remaining)}</span>
            <button type="button" onClick={() => adjustDuration(30)} className="h-9 w-9 rounded-xl border border-[var(--border-color)] text-xl font-black">+</button>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <button
            type="button"
            onClick={toggleTimer}
            className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-black text-teal-800"
          >
            {running ? '暂停' : '开始'}
          </button>
          <button
            type="button"
            onClick={resetTimer}
            className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-4 py-3 text-sm font-black text-[var(--text-main)]"
          >
            重置计时
          </button>
          <button
            type="button"
            onClick={() => setShowRanking(true)}
            className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-black text-amber-800"
          >
            公布名次
          </button>
        </div>

        <button
          type="button"
          onClick={resetScores}
          className="self-end rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700"
        >
          清空积分
        </button>
      </div>

      {compact && (
        <div className="rounded-[1.35rem] border border-teal-100 bg-teal-50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-teal-900">当前计分：组{activeGroup + 1}</span>
            <button
              type="button"
              onClick={() => answerCorrect(activeGroup)}
              className="rounded-2xl bg-teal-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-teal-700/10"
            >
              手动给当前组 +1
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {scores.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveGroup(index)}
                className={`rounded-2xl border px-3 py-2.5 text-xs font-black ${
                  activeGroup === index
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : 'border-teal-200 bg-white text-teal-900'
                }`}
              >
                组{index + 1} 上场
              </button>
            ))}
          </div>
        </div>
      )}

      {!compact && mode === 'discussion' && (
        <div className="soft-card rounded-[1.75rem] p-5">
          <div className="text-[10px] font-black tracking-[0.2em] text-[var(--text-muted)]">DISCUSSION</div>
          <h2 className="mt-3 text-xl font-black leading-snug text-[var(--text-main)]">{currentDiscussion.prompt}</h2>
          {revealed && (
            <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3">
              <div className="text-xs font-black text-teal-800">参考要点</div>
              <p className="mt-1 text-sm font-bold leading-relaxed text-teal-950">{currentDiscussion.answer}</p>
              <p className="mt-1 text-xs font-bold leading-relaxed text-[var(--text-muted)]">{currentDiscussion.note}</p>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setRevealed((prev) => !prev)} className="rounded-2xl bg-teal-600 px-4 py-3 text-sm font-black text-white">
              {revealed ? '收起答案' : '揭晓答案'}
            </button>
            <button
              type="button"
              onClick={() => {
                setDiscussionIndex((prev) => (prev + 1) % discussionPrompts.length);
                setRevealed(false);
              }}
              className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-4 py-3 text-sm font-black"
            >
              换一个讨论题
            </button>
          </div>
        </div>
      )}

      {!compact && (mode === 'random' || mode === 'buzzer' || mode === 'sprint') && (
        <div className="soft-card rounded-[1.75rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] font-black text-sky-800">
              {arenaModes[mode].label}
            </span>
            {mode === 'sprint' && (
              <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-800">
                本轮答对 {sprintCorrect}
              </span>
            )}
          </div>
          <h2 className="mt-5 text-xl font-black leading-snug text-[var(--text-main)]">{question.prompt}</h2>

          {mode === 'buzzer' && (
            <div className="mt-4 flex flex-wrap gap-2">
              {scores.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveGroup(index)}
                  className={`rounded-full border px-3 py-2 text-xs font-black ${
                    activeGroup === index
                      ? 'border-rose-600 bg-rose-600 text-white'
                      : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] text-[var(--text-main)]'
                  }`}
                >
                  组{index + 1} 抢到
                </button>
              ))}
            </div>
          )}

          {mode === 'sprint' && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {scores.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setActiveGroup(index);
                    setSprintCorrect(0);
                  }}
                  className={`rounded-2xl border px-3 py-3 text-xs font-black ${
                    activeGroup === index
                      ? 'border-rose-600 bg-rose-50 text-rose-800'
                      : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] text-[var(--text-main)]'
                  }`}
                >
                  组{index + 1} 连击
                </button>
              ))}
            </div>
          )}

          {revealed && (
            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div className="text-xs font-black text-emerald-800">答案</div>
              <p className="mt-1 text-lg font-black leading-relaxed text-emerald-950">{question.answer}</p>
              <p className="mt-1 text-xs font-bold leading-relaxed text-[var(--text-muted)]">{question.note}</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={nextQuestion} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-4 py-3 text-sm font-black">
              出题 / 换题
            </button>
            <button type="button" onClick={() => setRevealed((prev) => !prev)} className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-black text-teal-800">
              {revealed ? '隐藏答案' : '揭晓答案'}
            </button>
            {mode === 'sprint' ? (
              <button type="button" onClick={sprintCorrectAnswer} className="rounded-2xl bg-teal-600 px-4 py-3 text-sm font-black text-white">
                组{activeGroup + 1} 答对 +1
              </button>
            ) : (
              <button type="button" onClick={() => answerCorrect(activeGroup)} className="rounded-2xl bg-teal-600 px-4 py-3 text-sm font-black text-white">
                当前组答对 +1
              </button>
            )}
          </div>
        </div>
      )}

      {!compact && mode === 'classify' && (
        <div className="soft-card rounded-[1.75rem] p-5">
          <div className="text-[10px] font-black tracking-[0.2em] text-[var(--text-muted)]">CLASSIFY</div>
          <h2 className="mt-3 text-xl font-black leading-snug text-[var(--text-main)]">把这些元素按类别归类</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {['金属', '非金属', '稀有气体', '类金属'].map((category) => (
              <div key={category} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-highlight)] px-3 py-2 text-center text-xs font-black text-teal-900">
                {category}
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {classifyRound.map((element) => (
              <div key={element.symbol} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-3 py-3 text-center">
                <div className="font-mono text-2xl font-black text-[var(--text-main)]">{element.symbol}</div>
                <div className="text-xs font-black text-[var(--text-muted)]">{element.name}</div>
                {revealed && (
                  <div className="mt-2 rounded-full bg-teal-50 px-2 py-1 text-[10px] font-black text-teal-800">{element.category}</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setRevealed((prev) => !prev)} className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-black text-teal-800">
              {revealed ? '隐藏答案' : '揭晓答案'}
            </button>
            <button
              type="button"
              onClick={() => {
                setClassifyRound(makeClassifyRound());
                setRevealed(false);
              }}
              className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-4 py-3 text-sm font-black"
            >
              换一组材料
            </button>
          </div>
        </div>
      )}

      <section className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black text-[var(--text-main)]">计分板</div>
            <div className="mt-1 text-[11px] font-bold text-[var(--text-muted)]">
              {compact ? '配对成功的小组 +1；需要纠错可 -1。' : '答对的小组 +1；需要纠错可 -1。'}
            </div>
          </div>
          <div className="rounded-full bg-[var(--bg-highlight)] px-3 py-1.5 text-[10px] font-black text-teal-800">
            领先：组{rankedGroups[0].index + 1}
          </div>
        </div>
        <div className="space-y-2">
          {scores.map((score, index) => {
            const isLeader = rankedGroups[0].index === index && score === rankedGroups[0].score;
            const isActive = activeGroup === index;
            return (
              <div
                key={index}
                className={`flex items-center gap-4 rounded-2xl border px-4 py-3 transition-all ${
                  isActive
                    ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-100'
                    : isLeader
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-[var(--border-color)] bg-[var(--bg-card-bright)]'
                }`}
              >
                <button
                  type="button"
                  aria-label={`设为当前小组：组${index + 1}`}
                  onClick={() => setActiveGroup(index)}
                  className="text-left text-sm font-black text-[var(--text-main)]"
                >
                  组{index + 1}
                </button>
                <div className="font-mono text-2xl font-black text-[var(--text-main)]">{score}</div>
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    aria-label={`组${index + 1}扣1分`}
                    onClick={() => adjustScore(index, -1)}
                    className="h-10 w-10 rounded-xl border border-[var(--border-color)] bg-white text-xl font-black"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label={`组${index + 1}加1分`}
                    onClick={() => adjustScore(index, 1)}
                    className="h-10 w-10 rounded-xl border border-[var(--border-color)] bg-white text-xl font-black"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {showRanking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-2xl">
            <div className="text-center">
              <div className="text-4xl">🏆</div>
              <h3 className="mt-2 text-xl font-black text-[var(--text-main)]">小组排名</h3>
            </div>
            <div className="mt-5 space-y-2">
              {rankedGroups.map((group, rank) => (
                <div key={group.index} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${rank === 0 ? 'bg-amber-50 text-amber-900' : 'bg-[var(--bg-card-bright)] text-[var(--text-main)]'}`}>
                  <div className="w-8 text-lg font-black">#{rank + 1}</div>
                  <div className="flex-1 text-sm font-black">组{group.index + 1}</div>
                  <div className="font-mono text-xl font-black">{group.score}</div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowRanking(false)}
              className="mt-5 w-full rounded-2xl bg-teal-600 px-4 py-3 text-sm font-black text-white"
            >
              继续上课
            </button>
          </div>
        </div>
      )}

      {timerDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="timer-done-title">
          <div className="w-full max-w-sm rounded-[1.75rem] border border-rose-100 bg-[var(--bg-card)] p-5 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-2xl font-black text-rose-700 ring-4 ring-rose-100">
              0:00
            </div>
            <h3 id="timer-done-title" className="mt-4 text-2xl font-black text-[var(--text-main)]">时间到</h3>
            <p className="mt-2 text-sm font-bold leading-relaxed text-[var(--text-muted)]">
              本轮配对计时结束，可以公布名次或再来一轮。
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={resetTimer}
                className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-black text-teal-800"
              >
                再来一轮
              </button>
              <button
                type="button"
                onClick={() => setTimerDone(false)}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-4 py-3 text-sm font-black text-[var(--text-main)]"
              >
                关闭提示
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
