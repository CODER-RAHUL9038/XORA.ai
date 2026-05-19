
class SoundService {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  private hasPlayedStartup: boolean = false;

  private init() {
    if (!this.audioCtx) {
      const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.masterGain = this.audioCtx!.createGain();
      this.masterGain.connect(this.audioCtx!.destination);
      this.masterGain.gain.value = 0.3; // Default volume
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (!this.audioCtx) return;
    
    if (this.masterGain) {
      const targetVolume = muted ? 0 : 0.3;
      this.masterGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetVolume, this.audioCtx.currentTime + 0.1);
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 1) {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    
    // Explicitly resume on interaction-based calls
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  playMoveX() {
    this.playTone(440, 'sine', 0.2); // A4
  }

  playMoveO() {
    this.playTone(349.23, 'sine', 0.2); // F4
  }

  playClick() {
    this.playTone(880, 'sine', 0.05, 0.5);
  }

  playWin() {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
       setTimeout(() => this.playTone(freq, 'triangle', 0.4), i * 100);
    });
  }

  playDraw() {
    this.playTone(220, 'square', 0.5, 0.2);
  }

  playStrike() {
    if (this.isMuted) return;
    this.init();
    const now = this.audioCtx!.currentTime;
    
    // 1. The "Whoosh" (Air displacement)
    const noiseBuffer = this.audioCtx!.createBuffer(1, this.audioCtx!.sampleRate * 0.4, this.audioCtx!.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.audioCtx!.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const noiseFilter = this.audioCtx!.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(800, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(7000, now + 0.15);
    noiseFilter.Q.value = 8;

    const noiseGain = this.audioCtx!.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.7, now + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain!);

    // 2. The "Metallic Slash" (Cyberpunk texture)
    const osc1 = this.audioCtx!.createOscillator();
    const osc1Gain = this.audioCtx!.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(2500, now);
    osc1.frequency.exponentialRampToValueAtTime(200, now + 0.2);
    
    osc1Gain.gain.setValueAtTime(0.3, now);
    osc1Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    
    osc1.connect(osc1Gain);
    osc1Gain.connect(this.masterGain!);

    // 3. High-frequency "Energy" (The sharp edge)
    const osc2 = this.audioCtx!.createOscillator();
    const osc2Gain = this.audioCtx!.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(5000, now);
    osc2.frequency.exponentialRampToValueAtTime(14000, now + 0.05);
    
    osc2Gain.gain.setValueAtTime(0.2, now);
    osc2Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    
    osc2.connect(osc2Gain);
    osc2Gain.connect(this.masterGain!);

    // Start all components simultaneously
    noise.start(now);
    osc1.start(now);
    osc2.start(now);
    
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  playEpicStrike() {
    if (this.isMuted) return;
    this.init();
    const now = this.audioCtx!.currentTime;

    // A more intense explosive strike
    this.playStrike();
    
    // Add a lingering crystalline reverb / shimmer
    const osc = this.audioCtx!.createOscillator();
    const g = this.audioCtx!.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 1.0);
    
    g.gain.setValueAtTime(0.2, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    
    osc.connect(g);
    g.connect(this.masterGain!);
    osc.start(now);
    osc.stop(now + 1.5);
  }

  playStartup() {
    if (this.isMuted || this.hasPlayedStartup) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    
    // We try to resume, but browsers might block it until first interaction.
    // That's why we mark it as played to avoid it "waiting" until game start.
    this.hasPlayedStartup = true;
    
    const now = this.audioCtx.currentTime;
    const duration = 2.0;

    // 1. THE DEEP RUMBLE (Sub-bass swell)
    const sub = this.audioCtx.createOscillator();
    const subGain = this.audioCtx.createGain();
    const subFilter = this.audioCtx.createBiquadFilter();
    
    sub.type = 'sine';
    sub.frequency.setValueAtTime(32, now); // Low C
    sub.frequency.exponentialRampToValueAtTime(64, now + duration);
    
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(300, now);

    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.5, now + 0.5);
    subGain.gain.linearRampToValueAtTime(0.8, now + duration - 0.2);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.3);
    
    sub.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.masterGain!);

    // 2. STEREO SYNTH SAW (Aggressive texture)
    const createSaw = (detune: number, pan: number) => {
      const osc = this.audioCtx!.createOscillator();
      const g = this.audioCtx!.createGain();
      const p = this.audioCtx!.createStereoPanner();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(128, now);
      osc.detune.setValueAtTime(detune, now);
      osc.frequency.exponentialRampToValueAtTime(256, now + duration);
      
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.12, now + 0.3);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      p.pan.setValueAtTime(pan, now);
      
      osc.connect(g);
      g.connect(p);
      p.connect(this.masterGain!);
      return osc;
    };

    const saw1 = createSaw(-10, -0.8);
    const saw2 = createSaw(10, 0.8);

    // 3. CYBER PULSE (Pulsing high-tech synth)
    const pulse = this.audioCtx.createOscillator();
    const pulseGain = this.audioCtx.createGain();
    const pulseFilter = this.audioCtx.createBiquadFilter();
    
    pulse.type = 'square';
    pulse.frequency.setValueAtTime(64, now);
    pulse.frequency.exponentialRampToValueAtTime(128, now + duration);
    
    pulseFilter.type = 'lowpass';
    pulseFilter.frequency.setValueAtTime(200, now);
    pulseFilter.frequency.exponentialRampToValueAtTime(2000, now + duration);
    pulseFilter.Q.value = 20;

    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(4, now); 
    lfo.frequency.exponentialRampToValueAtTime(20, now + duration); 
    lfoGain.gain.setValueAtTime(0.2, now);
    lfo.connect(lfoGain.gain);

    pulseGain.gain.setValueAtTime(0, now);
    pulseGain.gain.linearRampToValueAtTime(0.15, now + 0.1);
    lfoGain.connect(pulseGain.gain); 

    pulse.connect(pulseFilter);
    pulseFilter.connect(pulseGain);
    pulseGain.connect(this.masterGain!);

    // 4. DIGITAL DATA STREAM (High-freq jitter)
    const data = this.audioCtx.createOscillator();
    const dataGain = this.audioCtx.createGain();
    data.type = 'sine';
    data.frequency.setValueAtTime(4000, now);
    
    const dataLFO = this.audioCtx.createOscillator();
    dataLFO.frequency.setValueAtTime(30, now);
    const dataLFOGain = this.audioCtx.createGain();
    dataLFOGain.gain.setValueAtTime(3000, now);
    dataLFO.connect(dataLFOGain);
    dataLFOGain.connect(data.frequency);

    dataGain.gain.setValueAtTime(0, now);
    dataGain.gain.linearRampToValueAtTime(0.05, now + 1.0);
    dataGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    data.connect(dataGain);
    dataGain.connect(this.masterGain!);

    // Start all
    sub.start(now);
    saw1.start(now);
    saw2.start(now);
    pulse.start(now);
    lfo.start(now);
    data.start(now);
    dataLFO.start(now);

    // Stop and cleanup
    const stopTime = now + duration + 0.5;
    sub.stop(stopTime);
    saw1.stop(stopTime);
    saw2.stop(stopTime);
    pulse.stop(stopTime);
    lfo.stop(stopTime);
    data.stop(stopTime);
    dataLFO.stop(stopTime);
  }

  playMatchStart() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx || !this.masterGain) return;
    
    // A clean, techy double-beep for match start
    const now = this.audioCtx.currentTime;
    
    const beep = (freq: number, startTime: number) => {
      const o = this.audioCtx!.createOscillator();
      const g = this.audioCtx!.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, startTime);
      g.gain.setValueAtTime(0, startTime);
      g.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
      o.connect(g);
      g.connect(this.masterGain!);
      o.start(startTime);
      o.stop(startTime + 0.12);
    };

    beep(880, now);
    beep(1320, now + 0.08);
  }
}

export const sounds = new SoundService();
