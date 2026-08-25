// Web Audio API Chime Synthesizer for Medical Alerts
class MedicalAudioAlert {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Play sound for critical risk (high-urgency medical alert)
  playCriticalAlert(volume = 0.8) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(Math.min(volume, 1.0), now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      gainNode.connect(ctx.destination);

      // Dual tone pulse (High urgency: 880Hz -> 1174Hz)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.setValueAtTime(1174.66, now + 0.15);
      osc1.frequency.setValueAtTime(880, now + 0.3);
      osc1.frequency.setValueAtTime(1174.66, now + 0.45);
      osc1.connect(gainNode);

      osc1.start(now);
      osc1.stop(now + 0.65);
    } catch (e) {
      console.warn('Audio alert could not be played:', e);
    }
  }

  // Play sound for warning / high risk (soft cautionary chime)
  playWarningAlert(volume = 0.6) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(Math.min(volume, 1.0), now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      gainNode.connect(ctx.destination);

      // Warning triad chime
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(739.99, now + 0.12); // F#5
      osc1.frequency.setValueAtTime(880.00, now + 0.24); // A5
      osc1.connect(gainNode);

      osc1.start(now);
      osc1.stop(now + 0.45);
    } catch (e) {
      console.warn('Warning audio alert error:', e);
    }
  }

  // Play gentle confirmation tone for safe synergy or test
  playSafeTone(volume = 0.5) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(Math.min(volume, 1.0), now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      gainNode.connect(ctx.destination);

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc.connect(gainNode);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn('Safe audio tone error:', e);
    }
  }
}

export const medicalAudio = new MedicalAudioAlert();
