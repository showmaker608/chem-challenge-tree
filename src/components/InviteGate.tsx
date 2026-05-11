import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { ClassAccess, PlayerState } from '../types';
import { cloudLogin } from '../services/cloudSync';
import { clearFailedLogins, getLoginBlockStatus, recordFailedLogin } from '../services/loginGuard';

interface InviteGateProps {
  onSignIn: (classAccess: ClassAccess, studentName: string, pin: string, cloudProgress?: PlayerState | null, studentId?: string) => void;
  onBack: () => void;
}

export function InviteGate({ onSignIn, onBack }: InviteGateProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [pin, setPin] = useState('');
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
    const cleanPin = pin.trim();

    if (isChecking) return;

    const blockStatus = getLoginBlockStatus();
    if (blockStatus.blocked) {
      setBlockedSeconds(blockStatus.remainingSeconds);
      setError(`登录尝试过多，请 ${blockStatus.remainingSeconds} 秒后再试`);
      return;
    }

    if (!inviteCode.trim() || !studentName.trim()) {
      setError('请填写激活码和姓名');
      return;
    }

    if (!/^\d{4}$/.test(cleanPin)) {
      setError('PIN 请输入 4 位数字');
      return;
    }

    setError('');
    setIsChecking(true);

    const result = await cloudLogin(inviteCode, studentName, cleanPin);
    setIsChecking(false);

    if (!result.ok) {
      const nextBlockStatus = recordFailedLogin();
      if (nextBlockStatus.blocked) {
        setBlockedSeconds(nextBlockStatus.remainingSeconds);
        setError(`登录尝试过多，请 ${nextBlockStatus.remainingSeconds} 秒后再试`);
      } else {
        setBlockedSeconds(0);
        setError(`${result.message ?? '登录失败'}。还可尝试 ${nextBlockStatus.attemptsRemaining} 次`);
      }
      return;
    }

    clearFailedLogins();
    setBlockedSeconds(0);
    onSignIn(
      { classCode: inviteCode.trim().toUpperCase(), className: result.profile?.className ?? '' },
      studentName,
      cleanPin,
      result.progress,
      result.profile?.studentId,
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-300 mb-4">← 返回首页</button>

        <div className="mb-6">
          <div className="text-4xl mb-3">🔑</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            激活账号
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            输入老师发给你的激活码，存档你的闯关进度
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <label className="block">
            <span className="text-xs text-slate-400">激活码</span>
            <input
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              placeholder="老师给你的激活码"
              autoCapitalize="characters"
              disabled={isChecking}
            />
          </label>

          <label className="block">
            <span className="text-xs text-slate-400">你的姓名</span>
            <input
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              placeholder="例如 王小明"
              disabled={isChecking}
            />
          </label>

          <label className="block">
            <span className="text-xs text-slate-400">4 位 PIN（自己设一个，别忘）</span>
            <input
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
              className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              placeholder="例如 4827"
              inputMode="numeric"
              type="password"
              disabled={isChecking}
            />
          </label>

          {error && <p className="text-xs text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={isChecking || blockedSeconds > 0}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:text-slate-300 text-white rounded-xl font-medium transition-colors"
          >
            {isChecking ? '验证中...' : blockedSeconds > 0 ? '暂时停止登录' : '登录'}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
          首次登录将自动创建账号。使用老师发给你的激活码。忘记 PIN 请联系老师重置。
        </p>
      </div>
    </div>
  );
}
