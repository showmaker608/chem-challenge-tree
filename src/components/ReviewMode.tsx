import { useMemo, useState } from 'react';
import type { Chapter, Course, KnowledgePoint, ReviewMaterial, Section, StudentProfile, WrongRecord } from '../types';
import { QuizModal } from './QuizModal';

interface ReviewModeProps {
  course: Course;
  profile: StudentProfile | null;
  currentStreak: number;
  onComplete: (nodeId: string, score: number) => void;
  onRecordWrong: (record: WrongRecord) => void;
  onBack: () => void;
}

type ReviewView = 'home' | 'topic' | 'stage';
type ReviewEntryContext = 'default' | 'stageReview';

function countQuestions(node: KnowledgePoint) {
  return node.challenges.length || node.bigQuestion?.subQuestions.length || 0;
}

function countChapterNodes(chapter: Chapter) {
  return chapter.sections.reduce((sum, section) => sum + section.nodes.length, 0);
}

function countChapterQuestions(chapter: Chapter) {
  return chapter.sections.reduce(
    (sum, section) => sum + section.nodes.reduce((nodeSum, node) => nodeSum + countQuestions(node), 0),
    0,
  );
}

export function ReviewMode({ course, profile, currentStreak, onComplete, onRecordWrong, onBack }: ReviewModeProps) {
  const [activeNode, setActiveNode] = useState<{ node: KnowledgePoint; entryContext: ReviewEntryContext } | null>(null);
  const [activeMaterial, setActiveMaterial] = useState<{ chapter: Chapter; material: ReviewMaterial } | null>(null);
  const [view, setView] = useState<ReviewView>('home');
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const reviewChapters = useMemo(
    () => course.reviewChapters ?? course.chapters,
    [course],
  );

  const topicSections = useMemo(
    () => reviewChapters.flatMap(chapter => chapter.sections.map(section => ({ chapter, section }))),
    [reviewChapters],
  );

  const selectedStage = selectedStageId
    ? reviewChapters.find(chapter => chapter.id === selectedStageId) ?? null
    : null;

  const totalTopicNodes = topicSections.reduce((sum, item) => sum + item.section.nodes.length, 0);
  const totalMaterials = reviewChapters.reduce((sum, chapter) => sum + (chapter.materials?.length ?? 0), 0);

  const getChapterNodes = (chapter: Chapter) => chapter.sections.flatMap(section => section.nodes);

  const getRelatedNodes = (chapter: Chapter, material: ReviewMaterial) => {
    const nodes = getChapterNodes(chapter);
    if (!material.relatedNodeIds?.length) return nodes.slice(0, 4);
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    return material.relatedNodeIds
      .map(id => nodeMap.get(id))
      .filter((node): node is KnowledgePoint => Boolean(node));
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const goHome = () => {
    setView('home');
    setSelectedStageId(null);
    setActiveMaterial(null);
    setExpandedSections({});
  };

  const renderSourceBadge = (node: KnowledgePoint) => (
    node.source ? (
      <div className="mb-1.5 inline-flex rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-black text-cyan-300">
        {node.source}
      </div>
    ) : null
  );

  const renderNodeCard = (node: KnowledgePoint, entryContext: ReviewEntryContext = 'default') => (
    <button
      key={node.id}
      onClick={() => setActiveNode({ node, entryContext })}
      className="bg-slate-800/70 border border-slate-700/50 hover:border-amber-500/50 rounded-xl p-3 text-left transition-all"
    >
      <div className="text-xs text-amber-400 mb-1">
        {'⭐'.repeat(node.difficulty)}
      </div>
      {renderSourceBadge(node)}
      <div className="text-sm text-slate-200 leading-snug">{node.topic}</div>
      <div className="text-xs text-slate-500 mt-1">{countQuestions(node)} 题</div>
    </button>
  );

  const renderSectionAccordion = (chapter: Chapter, section: Section, context: 'topic' | 'stage') => {
    const key = `${context}:${chapter.id}:${section.id}`;
    const isOpen = Boolean(expandedSections[key]);

    return (
      <div key={key} className="rounded-2xl border border-slate-800 bg-slate-900/55 overflow-hidden">
        <button
          onClick={() => toggleSection(key)}
          className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 hover:bg-slate-800/60 transition-colors"
        >
          <div>
            <div className="text-sm font-black text-slate-100">{section.title}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {chapter.name} · {section.nodes.length} 个专题 · {section.nodes.reduce((sum, node) => sum + countQuestions(node), 0)} 题
            </div>
          </div>
          <span className="text-slate-500 text-lg">{isOpen ? '−' : '+'}</span>
        </button>
        {isOpen && (
          <div className="grid grid-cols-2 gap-2 px-3 pb-3">
            {section.nodes.map(node => renderNodeCard(node, context === 'stage' ? 'stageReview' : 'default'))}
          </div>
        )}
      </div>
    );
  };

  const renderMaterialCard = (chapter: Chapter, material: ReviewMaterial) => (
    <button
      key={material.href}
      onClick={() => setActiveMaterial({ chapter, material })}
      className="block w-full rounded-xl border border-slate-700/70 bg-slate-900/80 p-3 text-left transition-all hover:border-cyan-400/60 hover:bg-slate-800/90"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-bold text-slate-100 leading-snug">{material.title}</div>
        <span className="shrink-0 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-black text-cyan-300">
          互动卷
        </span>
      </div>
      {material.source && <div className="text-[11px] text-slate-500 mt-1">{material.source}</div>}
      {material.note && <div className="text-[11px] text-slate-400 mt-2 leading-relaxed">{material.note}</div>}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(material.highlights ?? []).slice(0, 3).map(item => (
          <span key={item} className="rounded-full bg-slate-950/50 px-2 py-0.5 text-[10px] font-bold text-slate-300">
            {item}
          </span>
        ))}
      </div>
    </button>
  );

  const renderHeader = () => (
    <div className="px-4 pt-4 pb-2 max-w-lg mx-auto">
      <button
        onClick={activeMaterial ? () => setActiveMaterial(null) : view === 'home' ? onBack : goHome}
        className="text-sm text-slate-500 hover:text-slate-300 mb-2"
      >
        {activeMaterial ? '← 返回真卷列表' : view === 'home' ? '← 返回模式选择' : '← 返回复习首页'}
      </button>
      <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
        🎯 复习模式
      </h1>
      <p className="text-xs text-slate-500 mt-0.5">
        先选复习路线，再进入刷题或阶段卷资料
      </p>
    </div>
  );

  const renderHome = () => (
    <div className="max-w-lg mx-auto px-4 pb-8 space-y-4">
      <button
        onClick={() => setView('topic')}
        className="w-full rounded-2xl border border-amber-400/35 bg-gradient-to-br from-amber-500/15 to-orange-500/10 p-4 text-left shadow-lg shadow-amber-950/20 hover:border-amber-300/70 transition-all"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-black text-amber-300 tracking-wider">按考点查漏补缺</div>
            <div className="text-lg font-black text-slate-50 mt-1">专题复习</div>
            <div className="text-xs text-slate-400 mt-1 leading-relaxed">
              水、空气、碳、化合价、实验操作这些专题，想补哪块就点哪块。
            </div>
          </div>
          <span className="text-3xl">🧪</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-950/45 px-2.5 py-1 text-[11px] font-bold text-slate-300">{topicSections.length} 组考点</span>
          <span className="rounded-full bg-slate-950/45 px-2.5 py-1 text-[11px] font-bold text-slate-300">{totalTopicNodes} 个专题</span>
        </div>
      </button>

      <button
        onClick={() => setView('stage')}
        className="w-full rounded-2xl border border-cyan-400/35 bg-gradient-to-br from-cyan-500/15 to-blue-500/10 p-4 text-left shadow-lg shadow-cyan-950/20 hover:border-cyan-300/70 transition-all"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-black text-cyan-300 tracking-wider">按考试阶段推进</div>
            <div className="text-lg font-black text-slate-50 mt-1">阶段复习</div>
            <div className="text-xs text-slate-400 mt-1 leading-relaxed">
              八阶段期末、八下期中这类阶段卷放这里，先看阶段，再进原卷或训练。
            </div>
          </div>
          <span className="text-3xl">🧭</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-950/45 px-2.5 py-1 text-[11px] font-bold text-slate-300">{reviewChapters.length} 个阶段</span>
          <span className="rounded-full bg-slate-950/45 px-2.5 py-1 text-[11px] font-bold text-slate-300">{totalMaterials} 份原卷</span>
        </div>
      </button>
    </div>
  );

  const renderTopicReview = () => (
    <div className="max-w-lg mx-auto px-4 pb-8">
      <div className="mb-4 rounded-2xl bg-slate-900/75 border border-slate-800 p-4">
        <div className="text-base font-black text-slate-50">专题复习</div>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          先点开一个考点组，再选择具体专题。题卡上的蓝色标签表示真题来源年份。
        </p>
      </div>
      <div className="space-y-2.5">
        {topicSections.map(({ chapter, section }) => renderSectionAccordion(chapter, section, 'topic'))}
      </div>
    </div>
  );

  const renderStageList = () => (
    <div className="max-w-lg mx-auto px-4 pb-8 space-y-3">
      <div className="mb-4 rounded-2xl bg-slate-900/75 border border-slate-800 p-4">
        <div className="text-base font-black text-slate-50">阶段复习</div>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          先选一个考试阶段。进去以后再看原卷资料和对应训练，不会一打开就铺满所有专题。
        </p>
      </div>
      {reviewChapters.map(chapter => (
        <button
          key={chapter.id}
          onClick={() => {
            setSelectedStageId(chapter.id);
            setExpandedSections({});
          }}
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-left hover:border-cyan-400/55 hover:bg-slate-800/80 transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg">{chapter.icon}</span>
                <span className="text-base font-black text-slate-100">{chapter.name}</span>
                {chapter.badge && (
                  <span className="rounded-full border border-cyan-400/35 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                    {chapter.badge}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-2 leading-relaxed">
                {chapter.desc ?? '按一个阶段集中刷题，适合考前整块复盘。'}
              </div>
            </div>
            <span className="text-slate-500 text-lg">›</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-950/45 px-2.5 py-1 text-[11px] font-bold text-slate-300">{chapter.materials?.length ?? 0} 份原卷</span>
            <span className="rounded-full bg-slate-950/45 px-2.5 py-1 text-[11px] font-bold text-slate-300">{countChapterNodes(chapter)} 个专题</span>
            <span className="rounded-full bg-slate-950/45 px-2.5 py-1 text-[11px] font-bold text-slate-300">{countChapterQuestions(chapter)} 题</span>
          </div>
        </button>
      ))}
    </div>
  );

  const renderStageDetail = (chapter: Chapter) => (
    <div className="max-w-lg mx-auto px-4 pb-8 space-y-5">
      <div className="rounded-2xl bg-slate-900/75 border border-slate-800 p-4">
        <button
          onClick={() => {
            setSelectedStageId(null);
            setExpandedSections({});
          }}
          className="text-xs font-bold text-cyan-300 hover:text-cyan-200 mb-2"
        >
          ← 换一个阶段
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl">{chapter.icon}</span>
          <div className="text-base font-black text-slate-50">{chapter.name}</div>
          {chapter.badge && (
            <span className="rounded-full border border-cyan-400/35 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
              {chapter.badge}
            </span>
          )}
        </div>
        {chapter.desc && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{chapter.desc}</p>}
      </div>

      {chapter.materials && chapter.materials.length > 0 && (
        <div>
          <h3 className="text-sm font-black text-slate-200 mb-2 px-1">真卷互动</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {chapter.materials.map(material => renderMaterialCard(chapter, material))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-black text-slate-200 mb-2 px-1">阶段训练</h3>
        <div className="space-y-2.5">
          {chapter.sections.map(section => renderSectionAccordion(chapter, section, 'stage'))}
        </div>
      </div>
    </div>
  );

  const renderMaterialExperience = (chapter: Chapter, material: ReviewMaterial) => {
    const relatedNodes = getRelatedNodes(chapter, material);
    const highlights = material.highlights?.length
      ? material.highlights
      : chapter.sections.map(section => section.title);
    const strategies = material.strategy?.length
      ? material.strategy
      : ['先看考点地图，圈出自己最不稳的部分。', '完成配套训练，再回原卷限时做。', '错题回到专题复习里二刷。'];

    return (
      <div className="max-w-lg mx-auto px-4 pb-8 space-y-5">
        <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/15 via-slate-900 to-blue-500/10 p-4 shadow-lg shadow-cyan-950/20">
          <button
            onClick={() => setActiveMaterial(null)}
            className="text-xs font-bold text-cyan-300 hover:text-cyan-200 mb-3"
          >
            ← 返回真卷列表
          </button>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-black text-cyan-300 tracking-wider">真卷互动页</div>
              <h2 className="text-xl font-black text-slate-50 mt-1 leading-snug">{material.title}</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{material.note}</p>
            </div>
            <span className="text-3xl">📄</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-950/45 px-3 py-2 text-center">
              <div className="text-lg font-black text-cyan-200">{highlights.length}</div>
              <div className="text-[10px] font-bold text-slate-500">核心情境</div>
            </div>
            <div className="rounded-xl bg-slate-950/45 px-3 py-2 text-center">
              <div className="text-lg font-black text-cyan-200">{relatedNodes.length}</div>
              <div className="text-[10px] font-bold text-slate-500">配套训练</div>
            </div>
            <div className="rounded-xl bg-slate-950/45 px-3 py-2 text-center">
              <div className="text-lg font-black text-cyan-200">{countChapterQuestions(chapter)}</div>
              <div className="text-[10px] font-bold text-slate-500">阶段题量</div>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-sm font-black text-slate-100 mb-3">考点地图</h3>
          <div className="flex flex-wrap gap-2">
            {highlights.map(item => (
              <span key={item} className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-200">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="text-sm font-black text-slate-100 mb-3">建议打法</h3>
          <div className="space-y-2.5">
            {strategies.map((item, index) => (
              <div key={item} className="flex gap-3 rounded-xl bg-slate-950/35 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-black text-cyan-200">
                  {index + 1}
                </span>
                <div className="text-xs font-bold leading-relaxed text-slate-300">{item}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-black text-slate-200 mb-2 px-1">配套训练</h3>
          <div className="grid grid-cols-2 gap-2">
            {relatedNodes.map(node => renderNodeCard(node, 'stageReview'))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-sm font-black text-slate-100">需要看完整原卷？</div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            网页互动页用于导学和刷题，PDF 只作为完整排版原卷备用。
          </p>
          <a
            href={material.href}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm font-black text-slate-200 hover:border-cyan-400/60 hover:text-cyan-200 transition-colors"
          >
            查看 PDF 原卷
          </a>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {renderHeader()}
      {activeMaterial
        ? renderMaterialExperience(activeMaterial.chapter, activeMaterial.material)
        : (
            <>
              {view === 'home' && renderHome()}
              {view === 'topic' && renderTopicReview()}
              {view === 'stage' && (selectedStage ? renderStageDetail(selectedStage) : renderStageList())}
            </>
          )}

      {activeNode && (
        <QuizModal
          node={activeNode.node}
          entryContext={activeNode.entryContext === 'stageReview' ? 'stageReview' : 'default'}
          onClose={() => setActiveNode(null)}
          onComplete={(id, score) => { onComplete(id, score); }}
          onRecordWrong={onRecordWrong}
          currentStreak={currentStreak}
          profile={profile ?? { profileId: 'guest', classCode: '', className: '复习模式', studentName: '学生', pin: '', createdAt: '' }}
        />
      )}
    </div>
  );
}
