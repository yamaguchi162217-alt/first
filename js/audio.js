/**
 * NEO INVADERS: Web Audio API Procedural Sound Engine
 * Synthesizes dynamic retro-modern sci-fi sound effects and adaptive bass march.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    
    // Dynamic invader march state
    this.marchInterval = null;
    this.marchNoteIndex = 0;
    this.marchNotes = [160, 146.83, 138.59, 130.81]; // D3, D3b, C3, B2
    this.marchSpeedMs = 900;
    this.isMarching = false;

    // UFO Siren state
    this.ufoOsc = null;
    this.ufoGain = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    } catch (e) {
      console.warn("Web Audio not supported:", e);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx?.currentTime || 0);
    }
    return this.isMuted;
  }

  // --- SOUND EFFECTS ---

  playLaser(isSpread = false) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isSpread ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isSpread ? 980 : 880, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  playEnemyLaser() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.18);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  playAlienExplode() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 0.25;

    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + dur);
    filter.Q.setValueAtTime(3, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  playPlayerHit() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 0.6;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + dur);
  }

  playShieldHit() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  playPowerup() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.16);
    });
  }

  playEmpBlast() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 1.2;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + dur);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2500, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + dur);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + dur);
  }

  playCombo(multiplier) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const baseFreq = 500 + Math.min(multiplier * 60, 600);
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.1);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  playWaveClear() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5 Major chord
    const t = this.ctx.currentTime;

    chord.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + i * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.3, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(st);
      osc.stop(st + 0.55);
    });
  }

  // --- DYNAMIC ADAPTIVE MARCH BGM ---

  startMarch() {
    if (this.isMarching) return;
    this.isMarching = true;
    this.marchNoteIndex = 0;
    this.scheduleNextMarchStep();
  }

  stopMarch() {
    this.isMarching = false;
    if (this.marchInterval) {
      clearTimeout(this.marchInterval);
      this.marchInterval = null;
    }
  }

  updateMarchSpeed(invaderRatio) {
    // ratio: 1.0 (all alive) -> 0.05 (1 left)
    // speedMs: 900ms -> 120ms
    this.marchSpeedMs = Math.max(120, Math.min(900, 100 + invaderRatio * 800));
  }

  scheduleNextMarchStep() {
    if (!this.isMarching) return;

    this.playMarchNote();
    this.marchInterval = setTimeout(() => {
      this.scheduleNextMarchStep();
    }, this.marchSpeedMs);
  }

  playMarchNote() {
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const freq = this.marchNotes[this.marchNoteIndex];
    this.marchNoteIndex = (this.marchNoteIndex + 1) % this.marchNotes.length;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 0.12);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // UFO Mystery Sound
  startUfoSound() {
    if (this.ufoOsc || this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      this.ufoOsc = this.ctx.createOscillator();
      this.ufoGain = this.ctx.createGain();

      this.ufoOsc.type = 'sine';
      this.ufoOsc.frequency.setValueAtTime(440, t);
      
      // LFO for pitch oscillation
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(6, t); // 6 Hz modulation
      lfoGain.gain.setValueAtTime(120, t); // +/- 120 Hz swing
      lfo.connect(this.ufoOsc.frequency);
      lfo.start(t);

      this.ufoGain.gain.setValueAtTime(0.18, t);

      this.ufoOsc.connect(this.ufoGain);
      this.ufoGain.connect(this.sfxGain);

      this.ufoOsc.start(t);
    } catch (e) {}
  }

  stopUfoSound() {
    if (this.ufoOsc) {
      try {
        this.ufoOsc.stop();
        this.ufoOsc.disconnect();
      } catch (e) {}
      this.ufoOsc = null;
      this.ufoGain = null;
    }
  }
}

window.soundEngine = new SoundEngine();
