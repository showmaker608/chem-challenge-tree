import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { ClassAccess } from '../types';
import { validateClassCode } from '../services/classAccess';
import { clearFailedLogins, getLoginBlockStatus, recordFailedLogin } from '../services/loginGuard';

interface StudentGateProps {
  onSignIn: (classAccess: ClassAccess, studentName: string, pin: string) => void;
}

export function StudentGate({ onSignIn }: StudentGateProps) {
  const [classCode, setClassCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [blockedSeconds, setBlockedSeconds] = useState(0);

  useEffect(() => {
    if (blockedSeconds <= 0) return;

    const timer = window.setInterval(() => {
      const status = getLoginBlockStatus();
      if (!status.blocked) {
        setBlockedSeconds(0);
        setError('');
        window.clearInterval(timer);
        return;
      }

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

    if (!classCode.trim() || !studentName.trim()) {
      setError('请填写班级码和姓名/学号');
      return;
    }

    if (!/^\d{4}$/.test(cleanPin)) {
      setError('PIN 请输入 4 位数字');
      return;
    }

    setError('');
    setIsChecking(true);

    const result = await validateClassCode(classCode);
    setIsChecking(false);

    if (!result.ok || !result.classAccess) {
      const nextBlockStatus = recordFailedLogin();
      if (nextBlockStatus.blocked) {
        setBlockedSeconds(nextBlockStatus.remainingSeconds);
        setError(`登录尝试过多，请 ${nextBlockStatus.remainingSeconds} 秒后再试`);
      } else {
        setBlockedSeconds(0);
        setError(
          `${result.message ?? '班级码不存在或已停用，请向老师确认'}。还可尝试 ${nextBlockStatus.attemptsRemaining} 次`,
        );
      }
      return;
    }

    clearFailedLogins();
    setBlockedSeconds(0);
    onSignIn(result.classAccess, studentName, cleanPin);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <div className="text-4xl mb-3">🔬</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            化学知识挑战树
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            输入老师发给你的班级码，继续保存你的闯关进度
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/70 border border-slate-700/50 rounded-2xl p-5 space-y-4">
          <label className="block">
            <span className="text-xs text-slate-400">班级码</span>
            <input
              value={classCode}
              onChange={(event) => setClassCode(event.target.value)}
              className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              placeholder="向老师索取"
              autoCapitalize="characters"
              disabled={isChecking}
            />
          </label>

          <label className="block">
            <span className="text-xs text-slate-400">姓名或学号</span>
            <input
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              placeholder="例如 王小明 / 23号"
              disabled={isChecking}
            />
          </label>

          <label className="block">
            <span className="text-xs text-slate-400">4 位 PIN</span>
            <input
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
              className="mt-1 w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              placeholder="用于防止同学误进"
              inputMode="numeric"
              type="password"
              disabled={isChecking}
            />
          </label>

          {error && <p className="text-xs text-red-300">{error}</p>}
          {import.meta.env.DEV && (
            <div className="text-xs text-slate-500 space-y-0.5">
              <p>本地可用班级码：</p>
              <p><code className="text-cyan-400 bg-slate-800 px-1 rounded">DK2026</code> 本地测试班</p>
              <p><code className="text-cyan-400 bg-slate-800 px-1 rounded">DK-CHEM-8B-7392</code> 八下化学冲刺班</p>
              <p><code className="text-cyan-400 bg-slate-800 px-1 rounded">DK-CHEM-9A-4816</code> 九上一模衔接班</p>
              <p><code className="text-cyan-400 bg-slate-800 px-1 rounded">DK-CHEM-DEMO-2605</code> 演示体验班</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isChecking || blockedSeconds > 0}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:text-slate-300 text-white rounded-xl font-medium transition-colors"
          >
            {isChecking ? '校验班级码中...' : blockedSeconds > 0 ? '暂时停止登录' : '开始学习'}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-4 leading-relaxed">
          班级码由老师统一发放。当前版本会按学生档案在本机保存进度，后续可接入云端同步。
        </p>
      </div>
    </div>
  );
}
