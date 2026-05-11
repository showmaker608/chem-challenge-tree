import type { WrongRecord } from '../types';

interface WrongBookProps {
  wrongList: WrongRecord[];
  onClose: () => void;
}

export function WrongBook({ wrongList, onClose }: WrongBookProps) {
  const byTopic = new Map<string, WrongRecord[]>();
  for (const w of wrongList) {
    const list = byTopic.get(w.nodeTopic) ?? [];
    list.push(w);
    byTopic.set(w.nodeTopic, list);
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-slate-800 rounded-t-2xl sm:rounded-2xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-3 left-3 text-slate-500 hover:text-slate-300 text-xl">×</button>

        <div className="text-center mb-6 mt-2">
          <div className="text-3xl mb-2">📝</div>
          <h2 className="text-lg font-bold text-white">我的错题本</h2>
          <p className="text-xs text-slate-400 mt-1">
            {wrongList.length === 0 ? '还没有错题，继续保持！' : `共 ${wrongList.length} 道错题`}
          </p>
        </div>

        {wrongList.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            🎉 全部答对了，真棒！
          </div>
        ) : (
          <div className="space-y-6">
            {[...byTopic.entries()].map(([topic, records]) => (
              <div key={topic}>
                <div className="text-xs text-cyan-400 mb-2 font-medium">{topic} · {records.length}题</div>
                {records.map((w, i) => (
                  <div key={i} className="bg-slate-900/50 rounded-xl p-4 mb-3 border border-slate-700/30">
                    <div className="text-sm text-white leading-relaxed mb-3">{w.stem}</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex gap-2">
                        <span className="text-red-400 shrink-0">✗ 你的答案：</span>
                        <span className="text-red-300">{w.userAnswer}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-emerald-400 shrink-0">✓ 正确答案：</span>
                        <span className="text-emerald-300">{w.correctAnswer}</span>
                      </div>
                    </div>
                    <div className="mt-3 bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                      <div className="text-xs text-amber-400 mb-1">解析</div>
                      <div className="text-xs text-slate-300 leading-relaxed">{w.explanation}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
