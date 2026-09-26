class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('stepdsa_muted');
        this.isMuted = saved === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('stepdsa_muted', String(muted));
      }
    } catch {
      // Ignored in test/sandboxed env
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playTone(freq: number, type: OscillatorType = 'sine', durationSec: number = 0.08, volume: number = 0.08) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Envelope: soft attack & decay to prevent audio pops
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume, this.ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + durationSec);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + durationSec);
    } catch {
      // Audio playback errors are non-fatal
    }
  }

  /**
   * Maps a number (e.g. array value) to a quantized frequency in pentatonic scale
   */
  public playValueTone(value: number, minVal: number = 1, maxVal: number = 100) {
    const pentatonicFreqs = [
      261.63, 293.66, 329.63, 392.00, 440.00, // C4 - A4
      523.25, 587.33, 659.25, 783.99, 880.00, // C5 - A5
      1046.50, 1174.66, 1318.51, 1567.98       // C6 - G6
    ];

    const range = Math.max(1, maxVal - minVal);
    const ratio = Math.max(0, Math.min(1, (value - minVal) / range));
    const index = Math.min(pentatonicFreqs.length - 1, Math.floor(ratio * pentatonicFreqs.length));
    
    this.playTone(pentatonicFreqs[index], 'triangle', 0.06, 0.05);
  }

  public playSwapSound() {
    this.playTone(320, 'square', 0.05, 0.03);
  }

  public playCompleteSound() {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.15, 0.08);
      }, i * 60);
    });
  }
}

export const soundEngine = new SoundEngine();
