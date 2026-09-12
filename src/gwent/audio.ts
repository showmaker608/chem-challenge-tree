// Original procedural instrumental, v2: calmer lo-fi tavern loop.
// Pentatonic melody with rests, soft lowpass warmth, gentle arpeggios and slow bass.
export class TableAudio {
  private context: AudioContext | null = null;
  private music: GainNode | null = null;
  private fx: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private beat = 0;
  private next = 0;
  async start(musicOn: boolean, fxOn: boolean, volume: number) {
    if (!this.context) {
      this.context = new AudioContext();
      const warm = this.context.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 1500; warm.Q.value = .4;
      this.music = this.context.createGain(); this.music.connect(warm); warm.connect(this.context.destination);
      this.fx = this.context.createGain(); this.fx.connect(this.context.destination);
    }
    await this.context.resume(); this.settings(musicOn, fxOn, volume);
    if (!this.timer) { this.next = this.context.currentTime + .08; this.timer = setInterval(() => this.schedule(), 120); this.schedule(); }
  }
  settings(musicOn: boolean, fxOn: boolean, volume: number) { if (!this.context) return; this.music!.gain.setTargetAtTime(musicOn ? volume * .15 : 0, this.context.currentTime, .08); this.fx!.gain.setTargetAtTime(fxOn ? .12 : 0, this.context.currentTime, .02); }
  private note(midi: number, time: number, duration: number, gain: number, output: GainNode, type: OscillatorType = 'sine', attack = .03) {
    const ctx = this.context!; const oscillator = ctx.createOscillator(), envelope = ctx.createGain(); oscillator.type = type; oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12); envelope.gain.setValueAtTime(0, time); envelope.gain.linearRampToValueAtTime(gain, time + attack); envelope.gain.exponentialRampToValueAtTime(.0001, time + duration); oscillator.connect(envelope); envelope.connect(output); oscillator.start(time); oscillator.stop(time + duration + .05); oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }
  private schedule() {
    if (!this.context || this.context.state !== 'running') return;
    if (this.next < this.context.currentTime) this.next = this.context.currentTime + .05;
    // A-minor pentatonic, two 16-step phrases; -1 is a rest so the loop can breathe.
    const melody = [69,-1,72,-1,74,-1,76,-1,74,72,74,-1,69,-1,67,-1,64,-1,67,-1,69,-1,72,-1,76,-1,74,-1,72,-1,69,-1];
    const roots = [45, 43, 41, 43];
    while (this.next < this.context.currentTime + .4) {
      const n = this.beat % 32;
      const m = melody[n]; if (m > 0) this.note(m, this.next, 1.05, .3, this.music!, 'sine');
      if (n % 8 === 0) this.note(roots[Math.floor(n / 8)], this.next, 2.6, .42, this.music!, 'sine', .06);
      if (n % 4 === 2) this.note(roots[Math.floor(n / 8)] + 24 + (n % 8 === 2 ? 0 : 7), this.next, .9, .12, this.music!, 'triangle');
      this.beat++; this.next += .44;
    }
  }
  effect(kind: 'select' | 'play' | 'round' | 'reaction' | 'inspect') { if (!this.context || this.context.state !== 'running') return; const t = this.context.currentTime; const notes = kind === 'reaction' ? [48,60,67,72,79] : kind === 'inspect' ? [72,76,79,84] : kind === 'round' ? [60,64,67,72] : kind === 'play' ? [55,67] : [76]; notes.forEach((n,i) => this.note(n, t + i * .09, .3, .4, this.fx!)); }
  async pause() { await this.context?.suspend(); }
  dispose() { if (this.timer) clearInterval(this.timer); this.timer = null; void this.context?.close(); this.context = null; }
}
