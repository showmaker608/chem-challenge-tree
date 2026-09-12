import { useCallback, useRef } from 'react';

// 延迟创建 AudioContext，等用户首次交互后再初始化
function useAudioCtx(): (() => AudioContext | null) {
  const ref = useRef<AudioContext | null>(null);

  return useCallback(() => {
    if (ref.current) {
      if (ref.current.state === 'suspended') {
        ref.current.resume().catch(() => {});
      }
      return ref.current;
    }
    try {
      ref.current = new AudioContext();
      // 移动端 AudioContext 初始状态可能是 suspended
      if (ref.current.state === 'suspended') {
        ref.current.resume().catch(() => {});
      }
      return ref.current;
    } catch {
      return null;
    }
  }, []);
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.12,
) {
  try {
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    vol.gain.setValueAtTime(Math.min(gain, 0.15), startTime);
    vol.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch {
    // 某些移动浏览器可能限制 oscillator 数量
  }
}

function playMajorArp(ctx: AudioContext, time: number, baseFreq: number, count: number, interval: number) {
  const notes = [1, 5/4, 3/2, 2];
  for (let i = 0; i < count; i++) {
    const freq = baseFreq * (notes[i % notes.length] ?? 1) * (1 + Math.floor(i / notes.length));
    playTone(ctx, freq, time + i * interval, 0.18, 'triangle', 0.1);
  }
}

export function useSound() {
  const getCtx = useAudioCtx();

  const playCorrect = useCallback(() => {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;
    playTone(c, 880, t, 0.12, 'triangle', 0.1);
    playTone(c, 1100, t + 0.06, 0.15, 'triangle', 0.08);
    playTone(c, 1320, t + 0.12, 0.15, 'triangle', 0.06);
  }, [getCtx]);

  const playWrong = useCallback(() => {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;
    playTone(c, 300, t, 0.15, 'sine', 0.06);
    playTone(c, 250, t + 0.12, 0.25, 'sine', 0.05);
  }, [getCtx]);

  const playLevelUp = useCallback(() => {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;
    [523, 587, 659, 784, 880, 1047].forEach((f, i) => {
      playTone(c, f, t + i * 0.08, 0.16, 'triangle', 0.08);
    });
  }, [getCtx]);

  const playComplete = useCallback(() => {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;
    playMajorArp(c, t, 523, 6, 0.08);
  }, [getCtx]);

  return { playCorrect, playWrong, playLevelUp, playComplete };
}
