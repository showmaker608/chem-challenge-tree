import { useState, useEffect, useCallback } from 'react';
import type { ForumPost } from '../services/forum';
import { getPosts, createPost, addReply, toggleLike } from '../services/forum';

interface ForumBoardProps {
  authorName: string;
  authorAvatar: string;
  studentId: string;
  onClose: () => void;
}

export function ForumBoard({ authorName, authorAvatar, studentId, onClose }: ForumBoardProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const load = useCallback(async () => {
    const data = await getPosts();
    setPosts(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePost = async () => {
    if (!text.trim()) return;
    setSending(true);
    const ok = await createPost(text, authorName, authorAvatar);
    setSending(false);
    if (ok) { setText(''); await load(); }
  };

  const handleReply = async (postId: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    const ok = await addReply(postId, replyText, authorName, authorAvatar);
    setSending(false);
    if (ok) { setReplyText(''); setReplyTo(null); await load(); }
  };

  const handleLike = async (postId: string, type: 'like' | 'dislike', replyIndex?: number) => {
    await toggleLike(postId, studentId, type, replyIndex);
    await load();
  };

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderAvatar = (avatar?: string, size = 'w-6 h-6') => {
    if (!avatar) return <span className={size + ' text-lg flex items-center justify-center'}>🔬</span>;
    if (avatar.startsWith('/')) return <img src={avatar} alt="" className={size + ' object-cover rounded-full'} />;
    return <span className={size + ' text-lg flex items-center justify-center'}>{avatar}</span>;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-slate-900 rounded-t-2xl sm:rounded-2xl p-5 max-w-lg w-full max-h-[85vh] flex flex-col relative">
        <button onClick={onClose} className="absolute top-4 left-4 text-slate-400 hover:text-white text-2xl leading-none z-10">×</button>

        <div className="text-center mb-4 shrink-0">
          <div className="text-3xl mb-2">💬</div>
          <h2 className="text-lg font-bold text-white">论坛</h2>
          <p className="text-xs text-slate-500">{posts.length} 个讨论</p>
        </div>

        {/* 发帖区 */}
        <div className="flex gap-2 mb-4 shrink-0">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className="flex-1 min-h-10 max-h-24 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400 resize-none"
            placeholder="发起讨论..."
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost(); } }}
          />
          <button
            onClick={handlePost}
            disabled={sending || !text.trim()}
            className="shrink-0 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            发布
          </button>
        </div>

        {/* 帖子列表 */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="text-center py-8 text-slate-500 text-sm">加载中...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-3xl mb-2">🍃</div>
              <p className="text-sm">还没有讨论，来发起第一个话题吧</p>
            </div>
          ) : (
            posts.map(post => {
              const isExpanded = expandedPost === post._id;
              const isReplying = replyTo === post._id;
              const likes = post.likes?.length || 0;
              const dislikes = post.dislikes?.length || 0;
              const liked = post.likes?.includes(studentId);
              const disliked = post.dislikes?.includes(studentId);

              return (
                <div key={post._id} className="bg-slate-800/40 rounded-xl border border-slate-700/30 overflow-hidden">
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="shrink-0">{renderAvatar(post.avatar, 'w-6 h-6')}</div>
                      <span className="text-xs font-medium text-cyan-400">{post.author}</span>
                      <span className="text-xs text-slate-600">{fmt(post.createdAt)}</span>
                      {post.replies.length > 0 && (
                        <span className="text-xs text-cyan-500 ml-auto">{post.replies.length} 回复</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{post.content}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => handleLike(post._id, 'like')} className={`text-xs flex items-center gap-1 ${liked ? 'text-cyan-400' : 'text-slate-500 hover:text-cyan-400'} transition-colors`}>
                        👍 {likes > 0 && likes}
                      </button>
                      <button onClick={() => handleLike(post._id, 'dislike')} className={`text-xs flex items-center gap-1 ${disliked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'} transition-colors`}>
                        👎 {dislikes > 0 && dislikes}
                      </button>
                      <button onClick={() => setExpandedPost(isExpanded ? null : post._id)} className="text-xs text-slate-500 hover:text-slate-300">
                        {isExpanded ? '收起回复' : post.replies.length > 0 ? `查看回复 (${post.replies.length})` : ''}
                      </button>
                      <button onClick={() => { setReplyTo(isReplying ? null : post._id); setReplyText(''); }} className="text-xs text-cyan-400 hover:text-cyan-300 ml-auto">
                        {isReplying ? '取消' : '💬'}
                      </button>
                    </div>
                  </div>

                  {isExpanded && post.replies.length > 0 && (
                    <div className="border-t border-slate-700/30 bg-slate-900/30 px-4 py-2 space-y-2">
                      {post.replies.map((reply, i) => {
                        const rLikes = reply.likes?.length || 0;
                        const rDislikes = reply.dislikes?.length || 0;
                        const rLiked = reply.likes?.includes(studentId);
                        const rDisliked = reply.dislikes?.includes(studentId);
                        return (
                          <div key={i} className="pl-3 border-l-2 border-cyan-500/20">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <div className="shrink-0">{renderAvatar(reply.avatar, 'w-4 h-4')}</div>
                              <span className="text-xs font-medium text-emerald-400">{reply.author}</span>
                              <span className="text-xs text-slate-600">{fmt(reply.createdAt)}</span>
                            </div>
                            <div className="text-sm text-slate-300 ml-5">{reply.content}</div>
                            <div className="flex items-center gap-2 mt-1 ml-5">
                              <button onClick={() => handleLike(post._id, 'like', i)} className={`text-[0.65rem] flex items-center gap-0.5 ${rLiked ? 'text-cyan-400' : 'text-slate-600 hover:text-cyan-400'} transition-colors`}>
                                👍 {rLikes > 0 && rLikes}
                              </button>
                              <button onClick={() => handleLike(post._id, 'dislike', i)} className={`text-[0.65rem] flex items-center gap-0.5 ${rDisliked ? 'text-red-400' : 'text-slate-600 hover:text-red-400'} transition-colors`}>
                                👎 {rDislikes > 0 && rDislikes}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isReplying && (
                    <div className="border-t border-cyan-500/20 bg-slate-900/30 px-4 py-3 flex gap-2">
                      <input
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                        placeholder="写下回复..."
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleReply(post._id); } }}
                      />
                      <button onClick={() => handleReply(post._id)} disabled={sending || !replyText.trim()}
                        className="shrink-0 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-xs font-medium transition-colors">
                        回复
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
