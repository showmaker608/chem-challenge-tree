// Original procedural 8-bar instrumental: plucked melody, bass and soft arpeggios.
export class TableAudio {
  private context: AudioContext | null = null;
  private music: GainNode | null = null;
  private fx: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private beat = 0;
  private next = 0;
  async start(musicOn: boolean, fxOn: boolean, volume: number) {
    if (!this.context) { this.context = new AudioContext(); this.music = this.context.createGain(); this.music.connect(this.context.destination); this.fx = this.context.createGain(); this.fx.connect(this.context.destination); }
    await this.context.resume(); this.settings(musicOn, fxOn, volume);
    if (!this.timer) { this.next = this.context.currentTime + .08; this.timer = setInterval(() => this.schedule(), 100); this.schedule(); }
  }
  settings(musicOn: boolean, fxOn: boolean, volume: number) { if (!this.context) return; this.music!.gain.setTargetAtTime(musicOn ? volume * .2 : 0, this.context.currentTime, .08); this.fx!.gain.setTargetAtTime(fxOn ? .12 : 0, this.context.currentTime, .02); }
  private note(midi: number, time: number, duration: number, gain: number, output: GainNode, type: OscillatorType = 'triangle') {
    const ctx = this.context!; const oscillator = ctx.createOscillator(), envelope = ctx.createGain(); oscillator.type = type; oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12); envelope.gain.setValueAtTime(0, time); envelope.gain.linearRampToValueAtTime(gain, time + .015); envelope.gain.exponentialRampToValueAtTime(.0001, time + duration); oscillator.connect(envelope); envelope.connect(output); oscillator.start(time); oscillator.stop(time + duration + .03); oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }
  private schedule() {
    if (!this.context || this.context.state !== 'running') return;
    if (this.next < this.context.currentTime) this.next = this.context.currentTime + .05;
    const melody = [69,72,76,72,74,72,69,67,65,69,72,69,71,69,65,64,67,71,74,71,72,71,67,64,64,68,71,74,72,71,68,64];
    const roots = [45,41,43,40];
    while (this.next < this.context.currentTime + .3) { const n = this.beat % 32; this.note(melody[n], this.next, .6, .42, this.music!); if (n % 2 === 0) this.note(roots[Math.floor(n / 8)] + 12 + (n % 4 === 0 ? 0 : 7), this.next, .8, .22, this.music!); if (n % 4 === 0) this.note(roots[Math.floor(n / 8)], this.next, 1.2, .5, this.music!, 'sine'); this.beat++; this.next += .32; }
  }
  effect(kind: 'select' | 'play' | 'round') { if (!this.context || this.context.state !== 'running') return; const t = this.context.currentTime; const notes = kind === 'round' ? [60,64,67,72] : kind === 'play' ? [55,67] : [76]; notes.forEach((n,i) => this.note(n, t + i * .09, .3, .4, this.fx!)); }
  async pause() { await this.context?.suspend(); }
  dispose() { if (this.timer) clearInterval(this.timer); this.timer = null; void this.context?.close(); this.context = null; }
}
