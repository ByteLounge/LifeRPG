// 8-bit NES / Retro Chiptune Synthesizer using Web Audio API
// Produces authentic square-wave tones (Mario coin, 1-UP fanfare, stage clear, jump)

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true; // Enabled by default for rich retro arcade feel

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("life_rpg_sound_enabled");
      this.enabled = stored !== "false";
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("life_rpg_sound_enabled", String(enabled));
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private initContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Classic 8-bit Coin Sound (Square wave B5 -> E6)
  public playCoin() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "square";
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.07); // E6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.setValueAtTime(0.15, now + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Iconic 8-bit 1-UP / Level-Up Jingle
  public playLevelUp() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [
      { freq: 330, dur: 0.1 }, // E4
      { freq: 392, dur: 0.1 }, // G4
      { freq: 659, dur: 0.1 }, // E5
      { freq: 523, dur: 0.1 }, // C5
      { freq: 587, dur: 0.1 }, // D5
      { freq: 784, dur: 0.3 }, // G5
    ];

    let offset = 0;
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + offset;

      osc.type = "square";
      osc.frequency.setValueAtTime(n.freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + n.dur);

      offset += n.dur;
    });
  }

  // Quest Complete: Stage Clear Chiptune fanfare
  public playQuestComplete() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [
      { freq: 523.25, dur: 0.08 }, // C5
      { freq: 659.25, dur: 0.08 }, // E5
      { freq: 783.99, dur: 0.08 }, // G5
      { freq: 1046.5, dur: 0.25 }, // C6
    ];

    let offset = 0;
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + offset;

      osc.type = "square";
      osc.frequency.setValueAtTime(n.freq, startTime);

      gain.gain.setValueAtTime(0.14, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + n.dur);

      offset += n.dur;
    });
  }

  // Classic Jump Blip
  public playJump() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "square";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Power-Up / Achievement fanfare
  public playAchievement() {
    this.playLevelUp();
  }

  // Classic Power-Up Mushroom Rising Arpeggio
  public playPowerUp() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [330, 392, 659, 523, 587, 784, 1046];
    let offset = 0;
    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + offset;

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.08);

      offset += 0.06;
    });
  }

  // Warp Pipe Sound (Hollow downward slide)
  public playPipe() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Pause / Menu Blip
  public playPause() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "square";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.setValueAtTime(800, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Power-Down / Bump / Error Sound
  public playPowerDown() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }
}

export const soundEngine = new SoundEngine();

