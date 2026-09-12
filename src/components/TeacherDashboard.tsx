import { useState, useEffect } from 'react';
import type { DashboardData } from '../services/teacher';
import { getDashboard } from '../services/teacher';
import type { Chapter, Course } from '../types';
import {
  availableSummerLessonLines,
  summerLessonLines,
  summerLessonRecommendations,
  type SummerLessonLine,
  type SummerLessonRecommendation,
  type SummerLessonTarget,
} from '../data/summerLessonRecommendations';

interface TeacherDashboardProps {
  course: Course;
  accessToken: string;
  onClose: () => void;
}

function getTargetNodeIds(target: SummerLessonTarget, chapter: Chapter | undefined) {
  if (!chapter) return [];

  const sections = target.sectionIds?.length
    ? chapter.sections.filter((section) => target.sectionIds?.includes(section.id))
    : chapter.sections;

  return sections.flatMap((section) => section.nodes.map((node) => node.id));
}

function getLessonNodeIds(lesson: SummerLessonRecommendation, chapters: Chapter[]) {
  const chaptersById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
  return Array.from(new Set(lesson.targets.flatMap((target) => getTargetNodeIds(target, chaptersById.get(target.chapterId)))));
}

export function TeacherDashboard({ course, accessToken, onClose }: TeacherDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'funnel' | 'lessons' | 'classes' | 'wrongs' | 'students' | 'feedbacks'>('funnel');
  const [line, setLine] = useState<SummerLessonLine>(availableSummerLessonLines[0] ?? 'tengfei');
  const [classFilter, setClassFilter] = useState('all');

  useEffect(() => {
    getDashboard(accessToken).then(d => { setData(d); setLoading(false); });
  }, [accessToken]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="text-slate-400 text-sm">加载数据中...</div>
      </div>
    );
  }

  if (!data?.ok) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl p-6 text-center">
          <p className="text-red-400 mb-4">数据加载失败</p>
          <button onClick={onClose} className="text-slate-400">关闭</button>
        </div>
      </div>
    );
  }

  const analytics = data.analytics ?? {
    sevenDays: { days: 7, visitors: 0, visits: 0, starts: 0, completes: 0, startRate: 0, completionRate: 0, visitToCompleteRate: 0 },
    thirtyDays: { days: 30, visitors: 0, visits: 0, starts: 0, completes: 0, startRate: 0, completionRate: 0, visitToCompleteRate: 0 },
    sources: [],
    sampleLimitReached: false,
  };

  const classOptions = Array.from(new Set(data.students.map((student) => student.classCode))).filter(Boolean).sort();
  const filteredStudents = data.students.filter((student) => classFilter === 'all' || student.classCode === classFilter);
  const lessonStats = availableSummerLessonLines.includes(line) ? summerLessonRecommendations[line].map((lesson) => {
    const nodeIds = getLessonNodeIds(lesson, course.chapters);
    const nodeSet = new Set(nodeIds);
    const students = filteredStudents.map((student) => {
      const completedNodes = student.completedNodes ?? [];
      const done = nodeIds.filter((id) => completedNodes.includes(id)).length;
      const percent = nodeIds.length > 0 ? Math.round((done / nodeIds.length) * 100) : 0;
      const wrongs = (student.wrongList ?? []).filter((wrong) => nodeSet.has(wrong.nodeId));
      return { ...student, done, percent, isReady: percent >= 80, wrongs };
    });
    const readyCount = students.filter((student) => student.isReady).length;
    const avgPercent = students.length > 0
      ? Math.round(students.reduce((sum, student) => sum + student.percent, 0) / students.length)
      : 0;
    const wrongCount = students.reduce((sum, student) => sum + student.wrongs.length, 0);
    const wrongTopics = new Map<string, number>();
    for (const student of students) {
      for (const wrong of student.wrongs) {
        const key = wrong.nodeTopic || wrong.stem || '未知错题';
        wrongTopics.set(key, (wrongTopics.get(key) || 0) + 1);
      }
    }
    const topWrong = Array.from(wrongTopics.entries()).sort((a, b) => b[1] - a[1])[0];

    return {
      lesson,
      nodeCount: nodeIds.length,
      readyCount,
      avgPercent,
      wrongCount,
      topWrong: topWrong ? { topic: topWrong[0], count: topWrong[1] } : null,
    };
  }) : [];
  const lessonReadyTotal = lessonStats.reduce((sum, item) => sum + item.readyCount, 0);
  const lessonWrongTotal = lessonStats.reduce((sum, item) => sum + item.wrongCount, 0);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-slate-900 rounded-2xl p-5 max-w-2xl w-full max-h-[90vh] flex flex-col relative">
        <button onClick={onClose} className="absolute top-4 left-4 text-slate-400 hover:text-white text-2xl leading-none z-10">×</button>

        <div className="text-center mb-4 shrink-0">
          <div className="text-3xl mb-1">📊</div>
          <h2 className="text-lg font-bold text-white">教师看板</h2>
        </div>

        {/* 总览卡片 */}
        <div className="grid grid-cols-4 gap-2 mb-4 shrink-0">
          {[
            { label: '学生', value: data.overview.totalStudents, color: 'text-cyan-400' },
            { label: '活跃', value: data.overview.activeStudents, color: 'text-emerald-400' },
            { label: '完成', value: data.overview.totalCompleted, color: 'text-amber-400' },
            { label: '总XP', value: data.overview.totalXp, color: 'text-pink-400' },
          ].map(card => (
            <div key={card.label} className="bg-slate-800/50 rounded-xl p-2 text-center">
              <div className={`text-lg font-bold ${card.color}`}>{card.value}</div>
              <div className="text-[0.6rem] text-slate-500">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-1 mb-3 shrink-0 bg-slate-800/30 rounded-lg p-1">
          {[
            { key: 'funnel' as const, label: '漏斗' },
            { key: 'lessons' as const, label: '讲次' },
            { key: 'classes' as const, label: '班级' },
            { key: 'students' as const, label: '学生' },
            { key: 'feedbacks' as const, label: '反馈' },
            { key: 'wrongs' as const, label: '错题' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === t.key ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'funnel' && (
            <div className="space-y-3">
              {[analytics.sevenDays, analytics.thirtyDays].map(window => (
                <div key={window.days} className="rounded-xl border border-slate-700/30 bg-slate-800/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">最近 {window.days} 天</div>
                      <div className="mt-0.5 text-[10px] text-slate-500">匿名会话去重，不是页面刷新次数</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-cyan-300">{window.visitors}</div>
                      <div className="text-[10px] text-slate-500">匿名访客</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-slate-900/50 py-2">
                      <div className="text-lg font-bold text-cyan-400">{window.visits}</div>
                      <div className="text-[10px] text-slate-500">访问</div>
                    </div>
                    <div className="rounded-lg bg-slate-900/50 py-2">
                      <div className="text-lg font-bold text-amber-400">{window.starts}</div>
                      <div className="text-[10px] text-slate-500">开始 · {window.startRate}%</div>
                    </div>
                    <div className="rounded-lg bg-slate-900/50 py-2">
                      <div className="text-lg font-bold text-emerald-400">{window.completes}</div>
                      <div className="text-[10px] text-slate-500">完成 · {window.completionRate}%</div>
                    </div>
                  </div>
                  <div className="mt-2 text-center text-[10px] text-slate-500">
                    访问到完成 {window.visitToCompleteRate}% · 完成率按“完成 ÷ 开始”计算
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-slate-700/30 bg-slate-800/40 p-4">
                <div className="text-sm font-bold text-white">最近30天来源</div>
                <div className="mt-3 space-y-2">
                  {analytics.sources.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-500">埋点部署后才会开始采集；当前没有事件记录。</div>
                  ) : analytics.sources.map(source => (
                    <div key={source.source} className="grid grid-cols-[minmax(0,1fr)_repeat(3,3rem)] items-center gap-2 rounded-lg bg-slate-900/40 px-3 py-2 text-xs">
                      <div className="truncate font-bold text-slate-200">{source.source}</div>
                      <div className="text-center text-cyan-400">{source.visits}<span className="block text-[9px] text-slate-600">访问</span></div>
                      <div className="text-center text-amber-400">{source.starts}<span className="block text-[9px] text-slate-600">开始</span></div>
                      <div className="text-center text-emerald-400">{source.completes}<span className="block text-[9px] text-slate-600">完成</span></div>
                    </div>
                  ))}
                </div>
              </div>

              {analytics.sampleLimitReached && (
                <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 px-4 py-3 text-xs text-amber-300">
                  当前统计已达到1000条读取上限，需要分页后才能作为完整30天结果。
                </div>
              )}
              <div className="px-1 text-[10px] leading-4 text-slate-500">
                仅记录事件、时间、来源、练习和匿名哈希；不记录姓名、学号、手机号、密码或答题内容。
              </div>
            </div>
          )}

          {tab === 'lessons' && (
            <div className="space-y-3">
              {availableSummerLessonLines.length === 0 ? (
                <div className="bg-slate-800/40 rounded-xl border border-slate-700/20 p-5 text-center">
                  <div className="text-sm font-bold text-white">九阶课后推荐已下线</div>
                  <div className="mt-1 text-xs text-slate-500">腾飞 / 领航讲次统计当前不展示。</div>
                </div>
              ) : (
                <>
                  <div className={`grid gap-2 ${availableSummerLessonLines.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {availableSummerLessonLines.map(item => (
                      <button
                        key={item}
                        onClick={() => setLine(item)}
                        className={`rounded-xl px-3 py-2 text-left text-xs transition-colors ${line === item ? 'bg-cyan-600 text-white' : 'bg-slate-800/60 text-slate-400'}`}
                      >
                        <div className="font-bold">{summerLessonLines[item].name}</div>
                        <div className="mt-0.5 opacity-80">{summerLessonLines[item].desc}</div>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={classFilter}
                      onChange={(event) => setClassFilter(event.target.value)}
                      className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-slate-200 outline-none"
                    >
                      <option value="all">全部班级</option>
                      {classOptions.map(code => <option key={code} value={code}>{code}</option>)}
                    </select>
                    <div className="rounded-xl bg-slate-800/60 px-3 py-2 text-right">
                      <div className="text-xs font-bold text-cyan-300">{filteredStudents.length} 人</div>
                      <div className="text-[10px] text-slate-500">统计对象</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-800/40 rounded-xl p-2">
                      <div className="text-lg font-bold text-emerald-400">{lessonReadyTotal}</div>
                      <div className="text-[0.6rem] text-slate-500">讲次达标人次</div>
                    </div>
                    <div className="bg-slate-800/40 rounded-xl p-2">
                      <div className="text-lg font-bold text-amber-400">{lessonStats.length}</div>
                      <div className="text-[0.6rem] text-slate-500">讲次</div>
                    </div>
                    <div className="bg-slate-800/40 rounded-xl p-2">
                      <div className="text-lg font-bold text-red-400">{lessonWrongTotal}</div>
                      <div className="text-[0.6rem] text-slate-500">待清错</div>
                    </div>
                  </div>

                  {lessonStats.map(({ lesson, nodeCount, readyCount, avgPercent, wrongCount, topWrong }) => (
                    <div key={`${lesson.line}-${lesson.lessonNo}`} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/20">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-cyan-300">第 {lesson.lessonNo} 讲</div>
                          <div className="text-sm font-bold text-white mt-0.5">{lesson.title}</div>
                          <div className="text-xs text-slate-500 mt-1 leading-relaxed">{lesson.focus}</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-lg font-bold text-emerald-400">{readyCount}/{filteredStudents.length}</div>
                          <div className="text-[0.6rem] text-slate-500">达标</div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-900/40 rounded-lg py-2">
                          <div className="text-sm font-bold text-cyan-400">{avgPercent}%</div>
                          <div className="text-[0.6rem] text-slate-500">平均完成</div>
                        </div>
                        <div className="bg-slate-900/40 rounded-lg py-2">
                          <div className="text-sm font-bold text-amber-400">{nodeCount}</div>
                          <div className="text-[0.6rem] text-slate-500">推荐节点</div>
                        </div>
                        <div className="bg-slate-900/40 rounded-lg py-2">
                          <div className="text-sm font-bold text-red-400">{wrongCount}</div>
                          <div className="text-[0.6rem] text-slate-500">错题</div>
                        </div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-900/60 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: `${avgPercent}%` }} />
                      </div>
                      {topWrong && (
                        <div className="mt-3 rounded-lg bg-red-950/20 border border-red-900/30 px-3 py-2">
                          <div className="text-[10px] font-bold text-red-300">高频错点 · {topWrong.count} 次</div>
                          <div className="text-xs text-slate-300 mt-0.5 truncate">{topWrong.topic}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {tab === 'classes' && (
            <div className="space-y-3">
              {data.classes.map(cls => (
                <div key={cls.classCode} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/20">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-bold text-white">{cls.className}</span>
                      <span className="text-xs text-slate-500 ml-2">{cls.classCode}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">共 {cls.total} 人</span>
                      <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full">{cls.active} 人有进度</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-900/40 rounded-lg py-2">
                      <div className="text-lg font-bold text-cyan-400">{cls.active}</div>
                      <div className="text-[0.6rem] text-slate-500">已开始学习</div>
                    </div>
                    <div className="bg-slate-900/40 rounded-lg py-2">
                      <div className="text-lg font-bold text-emerald-400">{cls.totalCompleted}</div>
                      <div className="text-[0.6rem] text-slate-500">完成节点</div>
                    </div>
                    <div className="bg-slate-900/40 rounded-lg py-2">
                      <div className="text-lg font-bold text-amber-400">{cls.totalXp}</div>
                      <div className="text-[0.6rem] text-slate-500">总 XP</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'feedbacks' && (
            <div className="space-y-2">
              {data.feedbacks.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">暂无学生反馈</div>
              ) : (
                data.feedbacks.map((f, i) => (
                  <div key={i} className="bg-slate-800/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-amber-400">{f.studentName}</span>
                      <span className="text-xs text-slate-500">{f.nodeTopic}</span>
                      <span className="text-xs text-slate-600 ml-auto">{f.createdAt?.slice(0, 10)}</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-1.5 truncate">{f.stem}</div>
                    <div className="text-sm text-slate-200 bg-slate-900/40 rounded-lg p-2">{f.comment}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'students' && (
            <div className="space-y-1">
              {data.students.map((s, i) => (
                <div key={i} className="bg-slate-800/30 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-200">{s.name}</span>
                    <span className="text-xs text-slate-500 ml-2">{s.classCode} · {s.studentId}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-medium text-emerald-400">{s.xp} XP</div>
                    <div className="text-[0.6rem] text-slate-500">{s.completed}节点</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'wrongs' && (
            <div className="space-y-1.5">
              {data.topWrongs.map((w, i) => (
                <div key={i} className="bg-slate-800/30 rounded-lg px-3 py-2 flex items-start gap-2">
                  <span className="text-xs font-bold text-red-400 shrink-0 mt-0.5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500">{w.topic}</div>
                    <div className="text-sm text-slate-200 truncate">{w.stem}</div>
                  </div>
                  <span className="text-xs font-medium text-red-400 shrink-0">{w.count}次</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
