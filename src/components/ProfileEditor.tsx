import { useState } from 'react';
import type { StudentProfile } from '../types';
import { AVATAR_POOL } from '../types';

interface ProfileEditorProps {
  profile: StudentProfile;
  onSave: (displayName: string, avatar: string) => void;
  onClose: () => void;
  onSignOut?: () => void;
}

export function ProfileEditor({ profile, onSave, onClose, onSignOut }: ProfileEditorProps) {
  const [displayName, setDisplayName] = useState(profile.displayName ?? profile.studentName);
  const [avatar, setAvatar] = useState(profile.avatar || '🔬');

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-card)] rounded-2xl p-6 max-w-sm w-full max-h-[85vh] overflow-y-auto shadow-xl border border-[var(--border-color)]">
        <button onClick={onClose} className="absolute top-4 left-4 text-[var(--text-muted)] hover:text-[var(--text-main)] text-2xl leading-none">×</button>

        <div className="text-center mb-6 mt-2">
          <div className="mb-3">
            {avatar.startsWith('/') ? (
              <img src={avatar} alt="" className="w-16 h-16 object-cover rounded-xl mx-auto ring-2 ring-teal-300" />
            ) : (
              <span className="text-5xl">{avatar}</span>
            )}
          </div>
          <h2 className="text-lg font-bold text-[var(--text-main)]">编辑个人资料</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">设置你的昵称和头像，排行榜和论坛显示这些</p>
        </div>

        <label className="block mb-4">
          <span className="text-xs text-[var(--text-muted)]">显示名称（不超过12个字）</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-xl bg-white border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-main)] outline-none focus:border-teal-400"
            maxLength={12}
          />
        </label>

        <div className="mb-4">
          <div className="text-xs text-[var(--text-muted)] mb-2">选择头像</div>
          <div className="grid grid-cols-5 gap-2">
            {AVATAR_POOL.map((a) => {
              const isImage = a.src.startsWith('/');
              return (
                <button
                  key={a.src}
                  onClick={() => setAvatar(a.src)}
                  title={a.name}
                  className={`p-1.5 rounded-xl transition-all flex flex-col items-center gap-0.5 ${
                    avatar === a.src
                      ? 'bg-teal-100 border-2 border-teal-400 scale-110 shadow-sm'
                      : 'bg-white border border-[var(--border-color)] hover:border-teal-300'
                  }`}
                >
                  {isImage ? (
                    <img src={a.src} alt={a.name} className="w-10 h-10 object-cover rounded-lg" />
                  ) : (
                    <span className="text-2xl">{a.src}</span>
                  )}
                  <span className="text-[0.55em] text-[var(--text-muted)] leading-none truncate w-full text-center">{a.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => { onSave(displayName.trim() || profile.studentName, avatar); onClose(); }}
          className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition-colors"
        >
          保存
        </button>

        {onSignOut && (
          <button
            onClick={() => {
              if (window.confirm('确定要退出当前账号吗？已保存的云端进度不会丢失。')) {
                onSignOut();
              }
            }}
            className="w-full mt-3 py-2.5 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-800/30 rounded-xl font-medium transition-all text-xs flex items-center justify-center gap-1.5"
          >
            <span>🚪</span> 退出登录
          </button>
        )}
      </div>
    </div>
  );
}
