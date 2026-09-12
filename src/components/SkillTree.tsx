import { useEffect, useRef, useState } from 'react';
import type { Chapter } from '../types';

interface SkillTreeProps {
  chapters: Chapter[];
  gradeOrder: string[];
  mapTitle?: string;
  mapHint?: string;
  completedNodes: string[];
  availableNodes: Set<string>;
  completedChapters?: string[]; // 已毕业章节
  wrongList?: import('../types').WrongRecord[]; // 全局错题列表
  onNodeClick: (nodeId: string) => void;
  onJumpChapter?: (chapter: Chapter) => void;
  onSweepWrong?: (chapter: Chapter) => void; // 新增：清错回调
  focusChapterId?: string | null;
}

const CHAPTER_COLORS = [
  'from-violet-500 to-purple-500',
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-blue-500',
];

const GRADE_LABELS: Record<string, { label: string; gradient: string }> = {
  '八年级': { label: '八年级', gradient: 'from-sky-400 to-blue-500' },
  '九年级': { label: '九年级', gradient: 'from-amber-400 to-orange-500' },
  '必修第一册': { label: '必修第一册', gradient: 'from-sky-500 to-blue-600' },
  '必修第二册': { label: '必修第二册', gradient: 'from-cyan-500 to-teal-600' },
  '选择性必修1': { label: '选择性必修1 · 反应原理', gradient: 'from-amber-500 to-orange-500' },
  '选择性必修2': { label: '选择性必修2 · 结构性质', gradient: 'from-violet-500 to-indigo-600' },
  '选择性必修3': { label: '选择性必修3 · 有机基础', gradient: 'from-pink-500 to-rose-600' },
};

const CHAPTER_BADGES: Record<string, string> = {
  ch1: '🔬',
  ch2: '🌬️',
  ch3: '🔮',
  ch4: '💧',
  ch5: '⚖️',
  ch6: '💎',
  ch7: '🔥',
  ch9: '🛡️',
  ch10: '🧪',
  ch11: '🌋',
  ch12: '🌾',
  ch13: '🧮',
};

const CHAPTER_QUESTS: Record<string, { mission: string; target: string; tip: string }> = {
  ch1: {
    mission: '🔬 走进化学世界殿堂',
    target: '认识物理性质与化学性质的区别，掌握实验室基本安全与仪器操作技能。',
    tip: '坤哥提醒：量筒读数是实验易错点！视线要与凹液面最低处保持水平。',
  },
  ch2: {
    mission: '🌬️ 我们周围的空气奥秘',
    target: '测定空气中氧气的比例，分辨纯净物与混合物，探索氧气的化学性质与制法。',
    tip: '坤哥提醒：红磷测氧气含量要确保装置气密性良好、红磷过量，切忌使用木炭代替！',
  },
  ch3: {
    mission: '🔮 物质构成的微观造物主',
    target: '认识分子、原子与离子的微观结构，熟练拼写元素周期表元素和化学式。',
    tip: '坤哥提醒：微观粒子肉眼不可见，但其性质（运动、间隙、质量）解释了宏观变化。',
  },
  ch4: {
    mission: '💧 生命水源的净化大作战',
    target: '探究水的净化（沉降、过滤、吸附、蒸馏）及硬水与软水，解码电解水微观世界。',
    tip: '坤哥提醒：先别背电解水口诀。记录两侧气体体积和检验现象，再用证据判断它们是谁。',
  },
  ch5: {
    mission: '⚖️ 化学方程式的天平守恒',
    target: '探究质量守恒定律的微观本质，熟练书写与配平化学方程式并进行定量计算。',
    tip: '坤哥提醒：计算题的书写步骤要规范（设、写、找、列、解、答），注意单位不要漏掉！',
  },
  ch6: {
    mission: '💎 碳和碳的氧化物双重面孔',
    target: '研究金刚石、石墨与 C60 的结构决定性质，掌握二氧化碳实验室制法的核心要点。',
    tip: '坤哥提醒：二氧化碳能使澄清石灰水变浑浊，实验中要注意防止长颈漏斗未液封漏气！',
  },
  ch7: {
    mission: '🔥 薪火相传与灭火指挥官',
    target: '理解燃烧的三个必要条件与灭火原理，认识新能源的开发与环境保护。',
    tip: '坤哥提醒：灭火本质是破坏燃烧条件（清除可燃物、隔绝氧气、降温至着火点以下）。',
  },
  ch9: {
    mission: '🛡️ 金属和金属材料熔炼纪元',
    target: '认识合金与金属的性质，探究炼铁原理及金属活动性顺序的强弱规律。',
    tip: '坤哥提醒：金属活动性顺序中，排在前面的金属能把排在后面的金属从盐溶液中置换出来。',
  },
  ch10: {
    mission: '🧪 溶液与精密溶解曲线',
    target: '搞定饱和溶液与溶解度概念，解析溶解度曲线趋势，学会配制定浓度的溶液。',
    tip: '坤哥提醒：溶解度随温度改变而改变，配制溶液时若读数仰视会造成溶质质量分数偏小！',
  },
  ch11: {
    mission: '🌋 极化阴阳的酸和碱碰撞',
    target: '学习盐酸、浓硫酸、氢氧化钠及氢氧化钙的化学性质，认识中和反应的微观特征。',
    tip: '坤哥提醒：浓硫酸稀释切记“酸入水，沿器壁，不断搅”！强酸强碱都具有强腐蚀性。',
  },
  ch12: {
    mission: '🌾 盐和化学肥料的丰收格网',
    target: '理解常见盐（氯化钠、碳酸钠、碳酸氢钠）及化肥，掌握复分解反应发生的判定条件。',
    tip: '坤哥提醒：复分解反应必须生成沉淀、气体或水！粗盐提纯中过滤和蒸发要用玻璃棒搅拌。',
  },
  ch13: {
    mission: '🧮 九阶高中衔接计量桥',
    target: '在初中守恒与方程式基础上，建立物质的量、摩尔质量、气体体积和密度之间的计量关系。',
    tip: '坤哥提醒：先写清物理量和单位，再代入关系；不要把质量、物质的量和气体体积直接相加。',
  },
};

function nodeStatusText(isCompleted: boolean, isAvailable: boolean, hasPrereq: number | undefined) {
  if (isCompleted) return '已掌握';
  if (isAvailable) return '可挑战';
  if (hasPrereq) return '可跳关';
  return '未解锁';
}

function importanceInfo(rawLevel: number) {
  const level = Math.max(1, Math.min(5, Math.round(rawLevel || 1)));
  const labels = ['入门', '基础', '重点', '高频', '核心'];
  const colors = [
    'text-slate-500',
    'text-sky-600',
    'text-teal-700',
    'text-amber-600',
    'text-rose-600',
  ];
  return {
    level,
    label: labels[level - 1],
    color: colors[level - 1],
  };
}

export function SkillTree({
  chapters,
  gradeOrder,
  mapTitle = '初中学习地图',
  mapHint = '全部知识点支持先判断、再点拨、练习与迁移测验',
  completedNodes,
  availableNodes,
  completedChapters = [],
  wrongList = [],
  onNodeClick,
  onJumpChapter,
  onSweepWrong,
  focusChapterId,
}: SkillTreeProps) {
  const defaultChapter = chapters.find((chapter) =>
    chapter.sections.some((section) =>
      section.nodes.some((node) => availableNodes.has(node.id) && !completedNodes.includes(node.id)),
    ),
  ) ?? chapters[0];
  const chapterRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(defaultChapter ? [defaultChapter.id] : []),
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(defaultChapter ? [defaultChapter.grade || ''] : []),
  );

  useEffect(() => {
    if (!focusChapterId) return;

    const chapter = chapters.find((item) => item.id === focusChapterId);
    let scrollTimer: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      setExpanded((prev) => new Set(prev).add(focusChapterId));
      if (chapter?.grade) {
        setExpandedGroups((prev) => new Set(prev).add(chapter.grade || ''));
      }

      scrollTimer = window.setTimeout(() => {
        chapterRefs.current[focusChapterId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (scrollTimer !== undefined) window.clearTimeout(scrollTimer);
    };
  }, [chapters, focusChapterId]);

  const completed = completedNodes.length;
  const total = chapters.reduce(
    (a, c) => a + c.sections.reduce((s, sec) => s + sec.nodes.length, 0),
    0
  );
  const totalInteractive = chapters.reduce(
    (a, c) =>
      a +
      c.sections.reduce(
        (s, sec) => s + sec.nodes.filter((n) => n.learningContent?.interactiveWidget || n.playModules?.length).length,
        0,
      ),
    0,
  );

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  // 按 grade 分组，组内按 sortOrder 排序
  const grouped = (() => {
    const groups: {
      grade: string;
      label: string;
      gradient: string;
      chapters: Chapter[];
      chapterStartIdx: number;
    }[] = [];
    let chapterIdx = 0;

    // 按年级分组
    const byGrade = new Map<string, Chapter[]>();
    for (const ch of chapters) {
      const g = ch.grade || '';
      if (!byGrade.has(g)) byGrade.set(g, []);
      byGrade.get(g)!.push(ch);
    }

    // 组内按 sortOrder 排序，然后按 gradeOrder 输出
    for (const g of gradeOrder) {
      const chs = byGrade.get(g);
      if (!chs || chs.length === 0) continue;
      chs.sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
      const info = GRADE_LABELS[g] || { label: g, gradient: 'from-slate-400 to-slate-500' };
      groups.push({
        grade: g,
        label: info.label,
        gradient: info.gradient,
        chapters: chs,
        chapterStartIdx: chapterIdx,
      });
      chapterIdx += chs.length;
    }

    // 兜底：不在 gradeOrder 中的年级
    for (const [g, chs] of byGrade) {
      if (gradeOrder.includes(g)) continue;
      const info = GRADE_LABELS[g] || { label: g, gradient: 'from-slate-400 to-slate-500' };
      groups.push({
        grade: g,
        label: info.label,
        gradient: info.gradient,
        chapters: chs,
        chapterStartIdx: chapterIdx,
      });
      chapterIdx += chs.length;
    }

    return groups;
  })();

  return (
    <div className="px-2 pb-24">
      {/* 总进度与模式提示 */}
      <div className="mb-3 mx-2 soft-panel rounded-[1.35rem] p-3.5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <div className="text-teal-900 font-black text-sm tracking-wide">
              {mapTitle}
            </div>
            <div className="text-[11px] font-bold text-[var(--text-muted)] mt-0.5">
              {mapHint}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-emerald-700 font-black text-sm">
              {total > 0 ? Math.round((completed / total) * 100) : 0}%
            </div>
            <div className="text-[10px] font-bold text-[var(--text-muted)]">
              {completed}/{total}
            </div>
          </div>
        </div>
        <div className="h-2.5 bg-[var(--bg-disabled)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10px] font-bold text-[var(--text-muted)]">
          <span>📖 先学再练 · ⚡ 会了直接挑战</span>
          {totalInteractive > 0 && (
            <span className="text-amber-800">🎮 {totalInteractive} 个互动/游戏点</span>
          )}
        </div>
      </div>

      {/* 按年级分组渲染章节 */}
      <div className="space-y-6">
        {grouped.map((group) => {
          const groupExpanded = expandedGroups.has(group.grade);
          const groupNodeCount = group.chapters.reduce(
            (a, c) => a + c.sections.reduce((s, sec) => s + sec.nodes.length, 0),
            0,
          );

          return (
          <div key={group.grade}>
            {/* 年级/教材大标题 */}
            {group.label && (
              <button
                type="button"
                onClick={() => toggleGroup(group.grade)}
                className={`mb-3 mx-2 w-[calc(100%-1rem)] bg-gradient-to-r ${group.gradient} rounded-2xl px-4 py-3 shadow-md relative overflow-hidden text-left transition-all hover:-translate-y-0.5`}
              >
                <div className="absolute inset-0 bg-white/10 tiny-lab-dot opacity-25" />
                <div className="relative flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white/95 text-sm font-black tracking-wider truncate">
                      {group.label}
                    </div>
                    <div className="mt-0.5 text-white/70 text-xs font-medium">
                      {group.chapters.length} 章 · {groupNodeCount} 个目录点
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/18 border border-white/30 px-3 py-1 text-[11px] font-black text-white shadow-sm">
                    {groupExpanded ? '收起 ▲' : '展开 ▼'}
                  </span>
                </div>
              </button>
            )}

            {/* 该年级下的章节列表 */}
            {groupExpanded && <div className="space-y-5">
              {group.chapters.map((chapter, ci) => {
                const isExpanded = expanded.has(chapter.id);
                const chDone = chapter.sections.reduce(
                  (a, s) => a + s.nodes.filter((n) => completedNodes.includes(n.id)).length,
                  0
                );
                const chTotal = chapter.sections.reduce((a, s) => a + s.nodes.length, 0);
                const chQuestionCount = chapter.sections.reduce(
                  (a, s) =>
                    a +
                    s.nodes.reduce(
                      (nodeSum, n) => nodeSum + (n.challenges.length || n.bigQuestion?.subQuestions.length || 0),
                      0,
                    ),
                  0,
                );
                const hasChapterQuestions = chQuestionCount > 0;
                const isDraftEmpty = chTotal === 0;
                const color = CHAPTER_COLORS[(group.chapterStartIdx + ci) % CHAPTER_COLORS.length];

                // 计算本章下的错题数量
                const chapterNodeIds = new Set(
                  chapter.sections.flatMap((s) => s.nodes.map((n) => n.id))
                );
                const chWrongCount = wrongList.filter((w) => chapterNodeIds.has(w.nodeId)).length;

                // 是否大满贯通关（完成了本章所有节点且节点数 > 0）
                const isGraduated =
                  completedChapters.includes(chapter.id) ||
                  (chDone === chTotal && chTotal > 0);

                const badgeEmoji = CHAPTER_BADGES[chapter.id] || '🏆';

                return (
                  <div
                    key={chapter.id}
                    ref={(element) => {
                      chapterRefs.current[chapter.id] = element;
                    }}
                    className={`scroll-mt-24 rounded-2xl transition-all ${
                      focusChapterId === chapter.id ? 'ring-2 ring-amber-300 ring-offset-2 ring-offset-transparent' : ''
                    }`}
                  >
                    {/* 章节标题按钮 */}
                    <div className="w-full flex items-center justify-between gap-2 px-3 py-3 rounded-2xl soft-card hover:border-teal-300 transition-all">
                      <button
                        onClick={() => toggle(chapter.id)}
                        className="min-w-0 flex-1 flex items-center gap-3 text-left"
                      >
                        <div className="relative shrink-0 select-none">
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-lg shadow-lg shrink-0`}
                          >
                            {chapter.icon}
                          </div>
                          {isGraduated && (
                            <div
                              className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-600 border border-white shadow-md flex items-center justify-center text-[10px] animate-[bounce-in_0.5s_ease-out] select-none"
                              title="本章通关大满贯！"
                            >
                              <span>{badgeEmoji}</span>
                              {/* 扫光扫射特效的边缘光 */}
                              <div className="absolute inset-0 rounded-full border border-amber-300 animate-ping opacity-25" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 text-left min-w-0">
                          <div className="text-sm font-bold text-[var(--text-main)] truncate flex items-center gap-1.5">
                            <span>{chapter.name}</span>
                            {isGraduated && (
                              <span className="text-[10px] text-amber-600 font-black tracking-widest bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shadow-sm animate-pulse">
                                🎓已毕业
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-medium text-teal-700">
                            {isDraftEmpty ? '待拆知识点' : hasChapterQuestions ? `${chDone}/${chTotal} 完成` : `${chTotal} 个目录点`}
                          </div>
                          {(chapter.badge || chapter.desc) && (
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              {chapter.badge && (
                                <span className="rounded-full bg-[var(--bg-highlight)] px-2 py-0.5 text-[10px] font-black text-teal-800 border border-[var(--border-color)]">
                                  {chapter.badge}
                                </span>
                              )}
                              {chapter.desc && (
                                <span className="text-[10px] font-bold text-[var(--text-muted)] leading-snug">
                                  {chapter.desc}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>

                      {/* 操作按钮区 */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {chWrongCount > 0 && onSweepWrong && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSweepWrong(chapter);
                            }}
                            className="text-[10px] px-2.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 font-black transition-all flex items-center gap-1 shadow-sm hover:-translate-y-0.5"
                          >
                            <span>🔍</span>
                            <span>清错 ({chWrongCount})</span>
                          </button>
                        )}
                        {onJumpChapter && hasChapterQuestions && !isDraftEmpty && chDone < chTotal && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onJumpChapter(chapter);
                            }}
                            className="text-[10px] px-2.5 py-1.5 rounded-full bg-[var(--bg-amber-dark)] text-amber-800 hover:bg-[var(--bg-amber-dark)] hover:-translate-y-0.5 font-bold transition-all shrink-0"
                          >
                            ⚡跳章
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => toggle(chapter.id)}
                          className="rounded-full border border-[var(--border-color)] bg-[var(--bg-highlight)] px-2.5 py-1.5 text-[10px] text-teal-800 font-black shrink-0 shadow-sm hover:border-teal-300 transition-all"
                          aria-label={isExpanded ? '收起章节' : '展开章节'}
                        >
                          {isDraftEmpty ? '' : isExpanded ? '收起 ▲' : '展开 ▼'}
                        </button>
                      </div>
                    </div>

                    {/* 展开的知识点网格 */}
                    {isExpanded && (
                      <div className="mt-2 ml-6 pl-4 border-l-2 border-[var(--border-color)] space-y-3 relative">
                        {(() => {
                          const nodes = chapter.sections.flatMap(s => s.nodes);
                          const totalNodes = nodes.length;
                          const completedInChapter = nodes.filter(n => completedNodes.includes(n.id)).length;
                          const totalLabs = nodes.filter(n => n.learningContent?.interactiveWidget).length;
                          const completedLabs = nodes.filter(n => completedNodes.includes(n.id) && n.learningContent?.interactiveWidget).length;
                          const isGraduated = completedInChapter === totalNodes && totalNodes > 0;

                          return CHAPTER_QUESTS[chapter.id] ? (
                            <div className="mb-4 -ml-2 mr-2 bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-indigo-50/30 border border-indigo-100/60 rounded-2xl p-3.5 shadow-sm relative overflow-hidden">
                              <div className="absolute inset-0 bg-white/10 opacity-20 pointer-events-none" />
                              <div className="relative z-10">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-black text-indigo-900 tracking-wider">
                                    {CHAPTER_QUESTS[chapter.id].mission}
                                  </span>
                                  <span className="text-[9px] font-black text-indigo-500 bg-indigo-100/50 px-1.5 py-0.5 rounded border border-indigo-200/40 uppercase tracking-widest">
                                    主线任务
                                  </span>
                                </div>
                                <p className="mt-1 text-[11px] font-medium text-indigo-950 leading-relaxed">
                                  <span className="font-bold text-indigo-700">🎯 章节目标：</span>
                                  {CHAPTER_QUESTS[chapter.id].target}
                                </p>
                                <div className="mt-2 border-t border-indigo-100/50 pt-2 flex items-start gap-1 text-[10px] text-amber-800 font-bold leading-normal">
                                  <span className="shrink-0 text-amber-500">💡</span>
                                  <span>{CHAPTER_QUESTS[chapter.id].tip}</span>
                                </div>

                                {/* 进度统计 */}
                                <div className="mt-3 flex items-center justify-between gap-4 text-[9px] font-black text-indigo-700 bg-indigo-100/30 px-2 py-1.5 rounded-xl border border-indigo-100/50">
                                  <div className="flex items-center gap-1">
                                    <span>🎯 关卡进度:</span>
                                    <span className="text-indigo-900">{completedInChapter}/{totalNodes}</span>
                                  </div>
                                  {totalLabs > 0 && (
                                    <div className="flex items-center gap-1">
                                      <span>🧪 实验探索:</span>
                                      <span className="text-indigo-900">{completedLabs}/{totalLabs}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-0.5">
                                    <span>状态:</span>
                                    <span className={isGraduated ? "text-emerald-600 animate-pulse" : "text-indigo-600"}>
                                      {isGraduated ? "🏆 已结业" : "⚔️ 攻克中"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })()}

                        {chapter.sections.map((section) => (
                          <div key={section.id}>
                            <div className="text-xs text-teal-800 font-black mb-2 -ml-4 pl-4 flex items-center justify-between gap-3">
                              <span>{section.title}</span>
                              <span className="shrink-0 text-[10px] text-[var(--text-muted)]">
                                {section.nodes.length} 点
                                {section.nodes.some((n) => n.learningContent?.interactiveWidget || n.playModules?.length)
                                  ? ` · ${section.nodes.filter((n) => n.learningContent?.interactiveWidget || n.playModules?.length).length} 个互动`
                                  : ''}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 gap-2.5">
                              {section.nodes.map((node) => {
                                const isCompleted = completedNodes.includes(node.id);
                                const isAvailable = availableNodes.has(node.id);
                                const hasPrereq = node.prerequisites?.length;
                                const hasWidget = Boolean(node.learningContent?.interactiveWidget);
                                const hasDesignedLearning = Boolean(node.learningContent);
                                const playModuleCount = node.playModules?.length ?? 0;
                                const hasPlayModule = playModuleCount > 0;
                                const questionCount =
                                  node.challenges.length ||
                                  node.bigQuestion?.subQuestions.length ||
                                  0;
                                const hasQuestions = questionCount > 0;
                                const importance = importanceInfo(node.difficulty);

                                return (
                                  <button
                                    key={node.id}
                                    onClick={() => onNodeClick(node.id)}
                                    disabled={!hasQuestions}
                                    className={`relative w-full text-left p-3.5 rounded-2xl border transition-all hover:-translate-y-0.5 ${
                                      !hasQuestions
                                        ? 'bg-[var(--bg-card)]/60 border-[var(--border-color)] opacity-70 cursor-not-allowed hover:translate-y-0'
                                        : isCompleted
                                        ? hasWidget
                                          ? 'bg-[var(--bg-green-light)] border-emerald-400 hover:border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                          : 'bg-[var(--bg-green-light)] border-emerald-200 hover:border-emerald-300'
                                        : isAvailable
                                        ? hasWidget
                                          ? 'bg-[var(--bg-card-bright)] border-teal-400 hover:border-teal-300 node-available shadow-[0_0_14px_rgba(20,184,166,0.35)] ring-1 ring-teal-400/25'
                                          : 'bg-[var(--bg-card-bright)] border-teal-300 hover:border-teal-400 node-available shadow-sm'
                                        : hasPrereq
                                        ? hasWidget
                                          ? 'bg-[var(--bg-amber)] border-amber-300 hover:border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                          : 'bg-[var(--bg-amber)] border-amber-200 hover:border-amber-300'
                                        : hasWidget
                                        ? 'bg-[var(--bg-card)]/60 border-slate-700/60 shadow-[0_0_8px_rgba(99,102,241,0.1)] opacity-70'
                                        : 'bg-[var(--bg-card)]/60 border-[var(--border-color)] opacity-70'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                          <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ${
                                              isCompleted
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : !hasQuestions
                                                ? 'bg-[var(--bg-disabled)] text-[var(--text-muted)]'
                                                : isAvailable
                                                ? 'bg-teal-100 text-teal-800'
                                                : hasPrereq
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-[var(--bg-disabled)] text-[var(--text-muted)]'
                                            }`}
                                          >
                                            <span
                                              className={`w-1.5 h-1.5 rounded-full ${
                                              isCompleted
                                                ? 'bg-emerald-600'
                                                : !hasQuestions
                                                ? 'bg-[var(--text-disabled)]'
                                                : isAvailable
                                                ? 'bg-teal-600'
                                                : hasPrereq
                                                ? 'bg-amber-500'
                                                : 'bg-[var(--text-disabled)]'
                                              }`}
                                            />
                                            {hasQuestions ? nodeStatusText(isCompleted, isAvailable, hasPrereq) : '待拆题库'}
                                          </span>
                                          {hasWidget && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-2 py-1 text-[10px] font-black text-white shadow-[0_2px_8px_rgba(20,184,166,0.35)]">
                                              ✨ 互动学习
                                            </span>
                                          )}
                                          {node.standaloneEntry && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-1 text-[10px] font-black text-sky-800">
                                              独立探究 · 无前置锁
                                            </span>
                                          )}
                                          {hasPlayModule && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2 py-1 text-[10px] font-black text-white shadow-[0_2px_8px_rgba(139,92,246,0.3)]">
                                              {node.playModules?.[0]?.icon} {playModuleCount > 1 ? `${playModuleCount} 个专项可游玩` : '专项可游玩'}
                                            </span>
                                          )}
                                        </div>
                                        <div
                                          className={`text-base leading-snug font-black ${
                                            isCompleted
                                              ? 'text-emerald-950'
                                              : isAvailable
                                              ? 'text-[var(--text-main)]'
                                              : 'text-teal-700'
                                          }`}
                                        >
                                          {node.topic}
                                        </div>
                                      </div>
                                      <div className="shrink-0 text-right">
                                        <div className={`text-[10px] font-black ${importance.color}`}>
                                          {importance.label}
                                        </div>
                                        <div className="mt-1 flex justify-end gap-0.5" aria-label={`重要度 ${importance.level}/5`}>
                                          {Array.from({ length: 5 }).map((_, i) => (
                                            <span
                                              key={i}
                                              className={`h-1.5 w-2 rounded-full ${
                                                i < importance.level ? 'bg-amber-500' : 'bg-[var(--bg-disabled)]'
                                              }`}
                                            />
                                          ))}
                                        </div>
                                        <div className="mt-1 text-[10px] font-bold text-[var(--text-muted)]">{hasQuestions ? `${questionCount} 题` : '规划中'}</div>
                                      </div>
                                    </div>

                                    {hasQuestions ? (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="rounded-full bg-teal-50 border border-teal-100 px-2.5 py-1 text-[10px] font-black text-teal-800">
                                          ⚡ 刷题模式
                                        </span>
                                        {hasDesignedLearning && (
                                          <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[10px] font-black text-indigo-800">
                                            📖 设计型学习
                                          </span>
                                        )}
                                        {hasWidget && (
                                          <span className="rounded-full bg-amber-50 border border-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-800">
                                            🧪 含互动实验
                                          </span>
                                        )}
                                        {hasPlayModule && (
                                          <span className="rounded-full bg-violet-50 border border-violet-100 px-2.5 py-1 text-[10px] font-black text-violet-800">
                                            🎮 {playModuleCount > 1 ? `${playModuleCount} 个游戏模块` : '游戏模块'}
                                          </span>
                                        )}
                                        {hasPrereq && <span className="rounded-full bg-amber-50 border border-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-800">可跳关</span>}
                                      </div>
                                    ) : (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="rounded-full bg-[var(--bg-disabled)] border border-[var(--border-color)] px-2.5 py-1 text-[10px] font-black text-[var(--text-muted)]">
                                          教材目录已收录 · 题库待拆
                                        </span>
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>}
          </div>
          );
        })}
      </div>
    </div>
  );
}
