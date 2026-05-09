import { useState, useEffect } from 'react';
import type { Chapter } from '../types';
import { TreeNode } from './TreeNode';
import { ChapterHeader } from './ChapterHeader';

interface SkillTreeProps {
  chapters: Chapter[];
  completedNodes: string[];
  availableNodes: Set<string>;
  onNodeClick: (nodeId: string) => void;
}

export function SkillTree({ chapters, completedNodes, availableNodes, onNodeClick }: SkillTreeProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const completed = completedNodes.length;
  const total = chapters.reduce(
    (a, c) => a + c.sections.reduce((s, sec) => s + sec.nodes.length, 0), 0);

  useEffect(() => {
    if (expandedChapters.size === 0 && chapters[0]) {
      setExpandedChapters(new Set([chapters[0].id]));
    }
  }, []);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  return (
    <div className="px-4 pb-24">
      {/* 总进度 */}
      <div className="mb-6 bg-slate-800/50 rounded-xl p-4 backdrop-blur border border-slate-700/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">知识掌握进度</span>
          <span className="text-emerald-400 font-bold">{completed}/{total}</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-700"
            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* 章节列表 */}
      {chapters.map(chapter => {
        const isExpanded = expandedChapters.has(chapter.id);
        const chapterCompleted = chapter.sections.reduce(
          (acc, s) => acc + s.nodes.filter(n => completedNodes.includes(n.id)).length, 0);
        const chapterTotal = chapter.sections.reduce((acc, s) => acc + s.nodes.length, 0);

        return (
          <div key={chapter.id} className="mb-3">
            <ChapterHeader
              icon={chapter.icon}
              name={chapter.name}
              completed={chapterCompleted}
              total={chapterTotal}
              isExpanded={isExpanded}
              onToggle={() => toggleChapter(chapter.id)}
            />

            {isExpanded && (
              <div className="ml-2 mt-2 space-y-1">
                {chapter.sections.map(section => (
                  <div key={section.id}>
                    <div className="text-xs text-slate-500 px-3 py-1 font-medium">
                      {section.title}
                    </div>
                    <div className="space-y-1.5">
                      {section.nodes.map(node => {
                        const isCompleted = completedNodes.includes(node.id);
                        const isAvailable = availableNodes.has(node.id);
                        return (
                          <TreeNode
                            key={node.id}
                            id={node.id}
                            topic={node.topic}
                            difficulty={node.difficulty}
                            status={isCompleted ? 'completed' : isAvailable ? 'available' : 'locked'}
                            onClick={() => onNodeClick(node.id)}
                          />
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
    </div>
  );
}
