import { useEffect, useRef, useState } from 'react';
import type { StudentProfile } from '../types';
import {
  submitViewerFeedback,
  VIEWER_ROLE_LABELS,
  type ViewerRole,
} from '../services/viewerFeedback';

interface ViewerFeedbackProps {
  profile: StudentProfile | null;
  sourcePage: string;
  withBottomNav?: boolean;
}

const roles = Object.entries(VIEWER_ROLE_LABELS) as [ViewerRole, string][];

export function ViewerFeedback({ profile, sourcePage, withBottomNav = false }: ViewerFeedbackProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<ViewerRole>('student');
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => textareaRef.current?.focus(), 120);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, submitting]);

  const close = () => {
    if (submitting) return;
    setOpen(false);
    setError('');
  };

  const submit = async () => {
    const trimmedComment = comment.trim();
    if (!trimmedComment || submitting) return;

    setSubmitting(true);
    setError('');
    try {
      await submitViewerFeedback({ role, name, comment: trimmedComment, sourcePage, profile });
      setSent(true);
      setComment('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '留言没有送达，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setError('');
            setOpen(true);
          }}
          className="fixed right-3 z-[45] flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/90 bg-gradient-to-r from-amber-500 to-orange-500 p-0 text-sm font-black text-white shadow-[0_10px_30px_rgba(234,88,12,0.35)] transition-all hover:-translate-y-0.5 hover:from-amber-400 hover:to-orange-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 sm:right-5 sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-3"
          style={{ bottom: withBottomNav ? 'calc(env(safe-area-inset-bottom) + 5.25rem)' : 'calc(env(safe-area-inset-bottom) + 1rem)' }}
          aria-label="给老师留言"
          aria-haspopup="dialog"
        >
          <span className="text-base sm:text-lg" aria-hidden="true">💬</span>
          <span className="hidden sm:inline">给老师留言</span>
          <span className="hidden rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold sm:inline-flex">想听你说</span>
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="viewer-feedback-title"
            className="w-full max-w-md rounded-t-[2rem] border border-amber-100 bg-[var(--bg-card)] px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-5 shadow-2xl sm:rounded-[2rem] sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="mb-1 text-xs font-black tracking-wide text-amber-700">你的真实感受很重要</div>
                <h2 id="viewer-feedback-title" className="text-xl font-black text-[var(--text-main)]">
                  给老师留句话 💬
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--bg-disabled)] text-lg font-bold text-[var(--text-muted)] hover:bg-amber-100 hover:text-amber-800"
                aria-label="关闭留言"
              >
                ×
              </button>
            </div>

            {sent ? (
              <div className="py-5 text-center" aria-live="polite">
                <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-3xl">✅</div>
                <div className="text-lg font-black text-[var(--text-main)]">留言已送到老师后台</div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">谢谢你认真告诉我。你的话会用来改好这个化学学习工具。</p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-600 py-3 font-black text-white shadow-md"
                >
                  好的
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="rounded-2xl bg-amber-50 px-3.5 py-3 text-sm leading-6 text-amber-900">
                  哪里好用、哪里看不懂，或你希望增加什么？一句话也可以，会直接送到老师后台。
                </p>

                <fieldset>
                  <legend className="mb-2 text-xs font-black text-[var(--text-main)]">我是</legend>
                  <div className="grid grid-cols-4 gap-2">
                    {roles.map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRole(value)}
                        className={`rounded-xl border px-2 py-2 text-xs font-bold transition-colors ${role === value
                          ? 'border-amber-400 bg-amber-50 text-amber-800 ring-2 ring-amber-100'
                          : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-amber-200'
                        }`}
                        aria-pressed={role === value}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="block">
                  <span className="mb-2 block text-xs font-black text-[var(--text-main)]">你想对老师说什么？</span>
                  <textarea
                    ref={textareaRef}
                    value={comment}
                    onChange={(event) => setComment(event.target.value.slice(0, 500))}
                    rows={5}
                    maxLength={500}
                    placeholder="例如：前20号元素配对很好玩，但第3组的按钮我没看懂……"
                    className="w-full resize-none rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-3 text-sm leading-6 text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)]/70 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                  />
                  <span className="mt-1 block text-right text-[10px] text-[var(--text-muted)]">{comment.length}/500</span>
                </label>

                {!profile && (
                  <label className="block">
                    <span className="mb-2 block text-xs font-black text-[var(--text-main)]">怎么称呼你（选填）</span>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value.slice(0, 30))}
                      maxLength={30}
                      placeholder="昵称即可，不用留电话"
                      className="w-full rounded-xl border-2 border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)]/70 focus:border-amber-400"
                    />
                  </label>
                )}

                {error && (
                  <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={submit}
                  disabled={!comment.trim() || submitting}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-base font-black text-white shadow-lg shadow-orange-500/20 transition-all hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {submitting ? '正在送给老师……' : '送出留言'}
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
