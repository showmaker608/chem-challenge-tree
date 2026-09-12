import type { Chapter } from '../types';

interface StudyGuideModalProps {
  chapters: Chapter[];
  gradeOrder: string[];
  onClose: () => void;
  onOpenChapter: (chapterId: string) => void;
}

export function StudyGuideModal({ chapters, gradeOrder, onClose, onOpenChapter }: StudyGuideModalProps) {
  const grouped = (() => {
    const byGrade = new Map<string, Chapter[]>();
    for (const chapter of chapters) {
      const grade = chapter.grade || '学习地图';
      if (!byGrade.has(grade)) byGrade.set(grade, []);
      byGrade.get(grade)!.push(chapter);
    }

    const orderedGrades = [
      ...gradeOrder.filter((grade) => byGrade.has(grade)),
      ...Array.from(byGrade.keys()).filter((grade) => !gradeOrder.includes(grade)),
    ];

    return orderedGrades.map((grade) => ({
      grade,
      chapters: [...(byGrade.get(grade) ?? [])].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99)),
    }));
  })();

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-card)] rounded-2xl max-w-md w-full max-h-[86vh] overflow-hidden border border-[var(--border-color)] shadow-2xl">
        <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-[var(--text-main)]">学习引导</h3>
            <p className="mt-0.5 text-xs font-bold text-[var(--text-muted)]">选章节，直接跳到对应学习位置</p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-[var(--bg-highlight)] border border-[var(--border-color)] text-teal-800 text-xl leading-none"
            aria-label="关闭学习引导"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {grouped.map((group) => (
            <section key={group.grade} className="space-y-2">
              <div className="px-1 text-xs font-black text-teal-800">{group.grade}</div>
              <div className="grid grid-cols-1 gap-2">
                {group.chapters.map((chapter) => {
                  const nodeCount = chapter.sections.reduce((sum, section) => sum + section.nodes.length, 0);
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => onOpenChapter(chapter.id)}
                      className="w-full text-left rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-bright)] px-4 py-3 hover:border-teal-300 hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-black text-[var(--text-main)] truncate">
                            {chapter.icon} {chapter.name}
                          </div>
                          <div className="mt-1 text-[11px] font-bold text-[var(--text-muted)]">
                            {nodeCount} 个知识点{chapter.desc ? ` · ${chapter.desc}` : ''}
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-teal-50 border border-teal-100 px-2.5 py-1 text-[10px] font-black text-teal-800">
                          去学习
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
