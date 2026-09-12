import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { ClassAccess, PlayerState } from '../types';
import { cloudLogin, cloudRegister } from '../services/cloudSync';
import { clearFailedLogins, getLoginBlockStatus, recordFailedLogin } from '../services/loginGuard';

interface InviteGateProps {
  courseId: string;
  onSignIn: (classAccess: ClassAccess, studentId: string, studentName: string, cloudProgress?: PlayerState | null, displayName?: string, avatar?: string, dashboardToken?: string, socialToken?: string) => void;
  onBack: () => void;
  initialMode?: 'login' | 'register';
}

function loadSavedCreds(): { classCode: string; studentId: string } {
  try {
    const raw = localStorage.getItem('chem-tree-last-creds');
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore damaged saved credentials and show empty fields.
  }
  return { classCode: '', studentId: '' };
}

export function InviteGate({ courseId, onSignIn, onBack, initialMode = 'login' }: InviteGateProps) {
  const saved = loadSavedCreds();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [inviteCode, setInviteCode] = useState(saved.classCode);
  const [studentId, setStudentId] = useState(saved.studentId);
  const [studentName, setStudentName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [blockedSeconds, setBlockedSeconds] = useState(0);

  useEffect(() => {
    if (blockedSeconds <= 0) return;
    const timer = window.setInterval(() => {
      const status = getLoginBlockStatus();
      if (!status.blocked) { setBlockedSeconds(0); setError(''); window.clearInterval(timer); return; }
      setBlockedSeconds(status.remainingSeconds);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [blockedSeconds]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isChecking) return;
    const blockStatus = getLoginBlockStatus();
    if (blockStatus.blocked) {
      setBlockedSeconds(blockStatus.remainingSeconds);
      setError(`尝试过多，请 ${blockStatus.remainingSeconds} 秒后再试`);
      return;
    }
    if (!inviteCode.trim()) { setError('请填写邀请码'); return; }
    if (!studentId.trim()) { setError('请填写学号'); return; }
    if (!password.trim()) { setError('请设置密码'); return; }
    if (isRegister && !studentName.trim()) { setError('请填写姓名'); return; }
    setError('');
    setIsChecking(true);
    const result = isRegister
      ? await cloudRegister(inviteCode, studentId, studentName, password, courseId)
      : await cloudLogin(inviteCode, studentId, password, courseId);
    setIsChecking(false);
    if (!result.ok) {
      const nextBlockStatus = recordFailedLogin();
      if (nextBlockStatus.blocked) {
        setBlockedSeconds(nextBlockStatus.remainingSeconds);
        setError(`尝试过多，请 ${nextBlockStatus.remainingSeconds} 秒后再试`);
      } else {
        setBlockedSeconds(0);
        setError(`${result.message ?? '操作失败'}。还可尝试 ${nextBlockStatus.attemptsRemaining} 次`);
      }
      return;
    }
    clearFailedLogins();
    setBlockedSeconds(0);
    onSignIn(
      { classCode: inviteCode.trim().toUpperCase(), className: result.profile?.className ?? '' },
      studentId.trim(),
      result.profile?.studentName ?? studentName.trim(),
      result.progress,
      result.profile?.displayName || '',
      result.profile?.avatar || '',
      result.profile?.dashboardToken || '',
      result.profile?.socialToken || '',
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: `radial-gradient(circle at 20% 0%, var(--teal-glow), transparent 32rem), linear-gradient(180deg, var(--bg-page-start) 0%, var(--bg-page-mid) 100%)` }}>
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="text-sm text-teal-600 hover:text-[var(--text-main)] mb-4">← 返回首页</button>

        <div className="mb-6">
          <div className="text-4xl mb-3">{isRegister ? '📝' : '🔑'}</div>
          <h1 className="text-2xl font-bold text-[var(--text-main)]">
            {isRegister ? '注册账号' : '登录'}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            {isRegister ? '首次使用，输入老师给的邀请码并创建账号' : '已有账号，输入信息登录'}
          </p>
        </div>

        <div className="flex mb-4 bg-[var(--bg-disabled)] rounded-xl p-1">
          <button onClick={() => setIsRegister(true)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${isRegister ? 'bg-teal-600 text-white' : 'text-[var(--text-muted)]'}`}>注册</button>
          <button onClick={() => setIsRegister(false)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${!isRegister ? 'bg-teal-600 text-white' : 'text-[var(--text-muted)]'}`}>登录</button>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 space-y-4 shadow-sm">
          <label className="block">
            <span className="text-xs text-[var(--text-muted)]">邀请码</span>
            <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} className="mt-1 w-full rounded-xl bg-white border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-main)] outline-none focus:border-teal-400 placeholder:text-[var(--text-disabled)]" placeholder="老师给你的邀请码" autoCapitalize="characters" disabled={isChecking} />
          </label>
          <label className="block">
            <span className="text-xs text-[var(--text-muted)]">学号</span>
            <input value={studentId} onChange={e => setStudentId(e.target.value)} className="mt-1 w-full rounded-xl bg-white border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-main)] outline-none focus:border-teal-400 placeholder:text-[var(--text-disabled)]" placeholder={isRegister ? '自己设一个学号，如 01、02' : '输入你的学号'} disabled={isChecking} />
          </label>
          {isRegister && (
            <label className="block">
              <span className="text-xs text-[var(--text-muted)]">姓名</span>
              <input value={studentName} onChange={e => setStudentName(e.target.value)} className="mt-1 w-full rounded-xl bg-white border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-main)] outline-none focus:border-teal-400 placeholder:text-[var(--text-disabled)]" placeholder="你的真实姓名" disabled={isChecking} />
            </label>
          )}
          <label className="block">
            <span className="text-xs text-[var(--text-muted)]">{isRegister ? '设置密码' : '密码'}</span>
            <input value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-xl bg-white border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-main)] outline-none focus:border-teal-400 placeholder:text-[var(--text-disabled)]" placeholder={isRegister ? '自己设一个密码，别太简单' : '输入你的密码'} type="password" disabled={isChecking} />
          </label>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" disabled={isChecking || blockedSeconds > 0} className="w-full py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-[var(--bg-disabled)] disabled:text-[var(--text-disabled)] text-white rounded-xl font-medium transition-colors">
            {isChecking ? '验证中...' : blockedSeconds > 0 ? '暂时无法操作' : isRegister ? '注册' : '登录'}
          </button>
        </form>

        <p className="text-xs text-[var(--text-muted)] mt-4 leading-relaxed">
          {isRegister ? '注册后学号和密码请记好，下次登录要用。每个邀请码有名额限制。' : '忘记密码？联系老师重置。'}
        </p>
      </div>
    </div>
  );
}
