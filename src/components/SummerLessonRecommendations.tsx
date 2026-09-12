import { useMemo, useState } from 'react';
import type { Chapter, WrongRecord } from '../types';
import {
  availableSummerLessonLines,
  summerLessonLines,
  summerLessonRecommendations,
  type SummerLessonLine,
  type SummerLessonRecommendation,
  type SummerLessonTarget,
} from '../data/summerLessonRecommendations';

interface SummerLessonRecommendationsProps {
  chapters: Chapter[];
  completedNodes: string[];
  wrongList: WrongRecord[];
  onBack: () => void;
  onOpenChapter: (chapterId: string) => void;
}

function buildChapterIndex(chapters: Chapter[]) {
  const chaptersById = new Map<string, Chapter>();
  const sectionsById = new Map<string, string>();

  for (const chapter of chapters) {
    chaptersById.set(chapter.id, chapter);
    for (const section of chapter.sections) {
      sectionsById.set(section.id, section.title);
    }
  }

  return { chaptersById, sectionsById };
}

function getTargetNodeIds(target: SummerLessonTarget, chapter: Chapter | undefined) {
  if (!chapter) return [];

  const sections = target.sectionIds?.length
    ? chapter.sections.filter((section) => target.sectionIds?.includes(section.id))
    : chapter.sections;

  return sections.flatMap((section) => section.nodes.map((node) => node.id));
}

function getNodeProgress(nodeIds: string[], completedNodes: string[], wrongList: WrongRecord[]) {
  const nodeSet = new Set(nodeIds);
  const done = nodeIds.filter((id) => completedNodes.includes(id)).length;
  const wrongCount = wrongList.filter((record) => nodeSet.has(record.nodeId)).length;
  const total = nodeIds.length;

  return {
    done,
    total,
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
    isReady: total > 0 && Math.round((done / total) * 100) >= 80,
    wrongCount,
  };
}

function getLessonNodeIds(lesson: SummerLessonRecommendation, chaptersById: Map<string, Chapter>) {
  return Array.from(new Set(lesson.targets.flatMap((target) => getTargetNodeIds(target, chaptersById.get(target.chapterId)))));
}

function LessonTargetButton({
  target,
  chapter,
  sectionNames,
  completedNodes,
  wrongList,
  onOpenChapter,
}: {
  target: SummerLessonTarget;
  chapter: Chapter | undefined;
  sectionNames: string[];
  completedNodes: string[];
  wrongList: WrongRecord[];
  onOpenChapter: (chapterId: string) => void;
}) {
  const progress = getNodeProgress(getTargetNodeIds(target, chapter), completedNodes, wrongList);

  return (
    <button
      type="button"
      onClick={() => onOpenChapter(target.chapterId)}
      className={`w-full rounded-2xl border px-3.5 py-3 text-left transition-all hover:-translate-y-0.5 ${
        target.isPrimary
          ? 'border-teal-200 bg-teal-50/80 hover:border-teal-400'
          : 'border-[var(--border-color)] bg-[var(--bg-card-bright)] hover:border-amber-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${target.isPrimary ? 'bg-teal-600 text-white' : 'bg-[var(--bg-amber-dark)] text-amber-800'}`}>
              {target.isPrimary ? '主刷' : '补刷'}
            </span>
            <span className="text-sm font-black text-[var(--text-main)]">{target.chapterName}</span>
          </div>
          <div className="mt-1 text-xs font-bold leading-relaxed text-[var(--text-muted)]">
            {target.detail}
          </div>
          {sectionNames.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {sectionNames.map((name) => (
                <span key={name} className="rounded-full border border-[var(--border-color)] bg-[var(--bg-highlight)] px-2 py-0.5 text-[10px] font-black text-teal-800">
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[10px] font-black text-emerald-700">{progress.percent}%</div>
          <div className="mt-1 text-[10px] font-bold text-[var(--text-muted)]">
            {progress.done}/{progress.total}
          </div>
          {progress.wrongCount > 0 && (
            <div className="mt-1 text-[10px] font-black text-rose-600">
              错 {progress.wrongCount}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function LessonCard({
  lesson,
  chaptersById,
  sectionsById,
  completedNodes,
  wrongList,
  onOpenChapter,
}: {
  lesson: SummerLessonRecommendation;
  chaptersById: Map<string, Chapter>;
  sectionsById: Map<string, string>;
  completedNodes: string[];
  wrongList: WrongRecord[];
  onOpenChapter: (chapterId: string) => void;
}) {
  const progress = getNodeProgress(getLessonNodeIds(lesson, chaptersById), completedNodes, wrongList);

  return (
    <article className="soft-card rounded-[1.35rem] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--bg-highlight)] px-2.5 py-1 text-[10px] font-black text-teal-800">
              第 {lesson.lessonNo} 讲
            </span>
            {lesson.gapNote && (
              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-700 border border-rose-100">
                待补专题
              </span>
            )}
          </div>
          <h3 className="mt-2 text-base font-black leading-snug text-[var(--text-main)]">
            {lesson.title}
          </h3>
          <p className="mt-1 text-xs font-bold leading-relaxed text-[var(--text-muted)]">
            {lesson.focus}
          </p>
        </div>
        <div className={`shrink-0 rounded-2xl border px-3 py-2 text-right ${progress.isReady ? 'border-emerald-100 bg-emerald-50' : 'border-amber-100 bg-[var(--bg-amber)]'}`}>
          <div className={`text-base font-black ${progress.isReady ? 'text-emerald-700' : 'text-amber-700'}`}>
            {progress.percent}%
          </div>
          <div className={`text-[10px] font-black ${progress.isReady ? 'text-emerald-700' : 'text-amber-700'}`}>
            {progress.isReady ? '已达标' : '未达标'}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] font-black text-[var(--text-muted)]">
          <span>课后完成 {progress.done}/{progress.total}</span>
          <span className={progress.wrongCount > 0 ? 'text-rose-600' : 'text-emerald-700'}>
            待清错 {progress.wrongCount}
          </span>
        </div>
        <div className="mt-1.5 h-2 rounded-full bg-[var(--bg-disabled)] overflow-hidden">
          <div
            className={`h-full rounded-full ${progress.isReady ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-orange-400'}`}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {lesson.targets.length > 0 ? (
        <div className="mt-3 space-y-2.5">
          {lesson.targets.map((target) => (
            <LessonTargetButton
              key={`${lesson.line}-${lesson.lessonNo}-${target.chapterId}-${target.detail}`}
              target={target}
              chapter={chaptersById.get(target.chapterId)}
              sectionNames={(target.sectionIds ?? []).map((id) => sectionsById.get(id)).filter((name): name is string => Boolean(name))}
              completedNodes={completedNodes}
              wrongList={wrongList}
              onOpenChapter={onOpenChapter}
            />
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-bold leading-relaxed text-rose-700">
          当前题库不硬塞入口，先标记为九阶专题课包缺口。
        </div>
      )}

      {(lesson.gapNote || lesson.reviewNote) && (
        <div className="mt-3 space-y-2">
          {lesson.gapNote && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-3 py-2 text-[11px] font-bold leading-relaxed text-rose-700">
              {lesson.gapNote}
            </div>
          )}
          {lesson.reviewNote && (
            <div className="rounded-2xl border border-amber-100 bg-[var(--bg-amber)] px-3 py-2 text-[11px] font-bold leading-relaxed text-amber-800">
              {lesson.reviewNote}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function SummerLessonRecommendations({
  chapters,
  completedNodes,
  wrongList,
  onBack,
  onOpenChapter,
}: SummerLessonRecommendationsProps) {
  const [activeLine, setActiveLine] = useState<SummerLessonLine>('tengfei');
  const { chaptersById, sectionsById } = useMemo(() => buildChapterIndex(chapters), [chapters]);

  if (availableSummerLessonLines.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[var(--bg-page-start)] via-[var(--bg-page-mid)] to-[var(--bg-page-end)] px-4 py-6 text-[var(--text-main)]">
        <div className="mx-auto max-w-2xl">
          <button onClick={onBack} className="mb-4 text-xs font-black text-teal-700 hover:text-teal-900">
            ← 返回模式选择
          </button>
          <div className="soft-card rounded-[1.35rem] p-5 text-center">
            <h1 className="text-lg font-black text-[var(--text-main)]">九阶课后推荐已下线</h1>
            <p className="mt-2 text-xs font-bold leading-relaxed text-[var(--text-muted)]">
              当前不开放腾飞 / 领航课后路线，请先从初中学习或期末复习进入。
            </p>
          </div>
        </div>
      </div>
    );
  }

  const lessons = summerLessonRecommendations[activeLine];
  const lessonProgress = lessons.map((lesson) => getNodeProgress(getLessonNodeIds(lesson, chaptersById), completedNodes, wrongList));
  const readyCount = lessonProgress.filter((progress) => progress.isReady).length;
  const wrongCount = lessonProgress.reduce((sum, progress) => sum + progress.wrongCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--bg-page-start)] via-[var(--bg-page-mid)] to-[var(--bg-page-end)] text-[var(--text-main)]">
      <div className="sticky top-0 z-30 border-b border-[var(--border-color)] bg-[var(--bg-card)]/95 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <button onClick={onBack} className="mb-2 text-xs font-black text-teal-700 hover:text-teal-900">
            ← 返回模式选择
          </button>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight text-[var(--text-main)]">九阶课后推荐</h1>
              <p className="mt-1 text-xs font-bold leading-relaxed text-[var(--text-muted)]">
                按暑假每讲课后闭环，直接跳到该刷的章节。
              </p>
            </div>
            <div className="shrink-0 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-right">
              <div className="text-sm font-black text-emerald-700">{readyCount}/{lessons.length}</div>
              <div className="text-[10px] font-black text-emerald-700">讲次达标</div>
            </div>
          </div>

          <div className={`mt-3 grid gap-2 rounded-2xl bg-[var(--bg-disabled)] p-1 ${availableSummerLessonLines.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {availableSummerLessonLines.map((line) => {
              const isActive = activeLine === line;
              const meta = summerLessonLines[line];

              return (
                <button
                  key={line}
                  type="button"
                  onClick={() => setActiveLine(line)}
                  className={`rounded-xl px-3 py-2 text-left transition-all ${
                    isActive ? 'bg-[var(--bg-card-bright)] shadow-sm' : 'hover:bg-[var(--bg-card)]/50'
                  }`}
                >
                  <div className={`text-sm font-black ${isActive ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                    {meta.name}
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold leading-snug text-[var(--text-muted)]">
                    {meta.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-4 pb-10">
        <div className="mb-4 rounded-[1.35rem] border border-[var(--border-color)] bg-[var(--bg-highlight)]/80 px-4 py-3">
          <div className="text-xs font-black text-teal-900">
            {summerLessonLines[activeLine].shortName}路线 · {lessons.length} 讲 · 待清错 {wrongCount}
          </div>
          <div className="mt-1 text-[11px] font-bold leading-relaxed text-[var(--text-muted)]">
            每讲按推荐节点计算达标，完成 80% 即课后达标；待清错来自本讲推荐范围内的错题。
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {lessons.map((lesson) => (
            <LessonCard
              key={`${lesson.line}-${lesson.lessonNo}`}
              lesson={lesson}
              chaptersById={chaptersById}
              sectionsById={sectionsById}
              completedNodes={completedNodes}
              wrongList={wrongList}
              onOpenChapter={onOpenChapter}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
