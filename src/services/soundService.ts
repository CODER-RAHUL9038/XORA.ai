
import dogSound from '../assets/dog.mp3';

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

  private async playBuffer(url: string, duration?: number, volume: number = 1) {
    if (this.isMuted) return;
    this.init();
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioCtx!.decodeAudioData(arrayBuffer);
      
      const source = this.audioCtx!.createBufferSource();
      const boostGain = this.audioCtx!.createGain();
      
      source.buffer = audioBuffer;
      boostGain.gain.setValueAtTime(volume, this.audioCtx!.currentTime);
      
      source.connect(boostGain);
      boostGain.connect(this.masterGain!);
      source.start();

      if (duration) {
        source.stop(this.audioCtx!.currentTime + duration);
      }
    } catch (e) {
      console.error("Failed to play sound buffer", e);
    }
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
    this.playBuffer(dogSound, 2, 2.5); // Limit to 2 seconds and boost volume by 2.5x
  }

  playDraw() {
    this.playTone(220, 'square', 0.5, 0.2);
  }

  playStrike() {
    if (this.isMuted) return;
    this.init();
    const now = this.audioCtx!.currentTime;
    
    // 1. THE PRECISION "SNAP" (Ultra-fast transient)
    const snapOsc = this.audioCtx!.createOscillator();
    const snapGain = this.audioCtx!.createGain();
    snapOsc.type = 'square';
    snapOsc.frequency.setValueAtTime(15000, now);
    snapOsc.frequency.exponentialRampToValueAtTime(5000, now + 0.01);
    snapGain.gain.setValueAtTime(0.3, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
    snapOsc.connect(snapGain);
    snapGain.connect(this.masterGain!);

    // 2. THE CYBER SLASH (Resonant Filter Sweep)
    const slash1 = this.audioCtx!.createOscillator();
    const slash2 = this.audioCtx!.createOscillator();
    const slashGain = this.audioCtx!.createGain();
    const slashFilter = this.audioCtx!.createBiquadFilter();

    slash1.type = 'sawtooth';
    slash2.type = 'sawtooth';
    slash1.frequency.setValueAtTime(1200, now);
    slash2.frequency.setValueAtTime(1215, now); // Detuned for thickness
    slash1.frequency.exponentialRampToValueAtTime(80, now + 0.15);
    slash2.frequency.exponentialRampToValueAtTime(82, now + 0.15);

    slashFilter.type = 'lowpass';
    slashFilter.frequency.setValueAtTime(8000, now);
    slashFilter.frequency.exponentialRampToValueAtTime(400, now + 0.12);
    slashFilter.Q.setValueAtTime(15, now); // High resonance for "laser" character

    slashGain.gain.setValueAtTime(0.3, now);
    slashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    slash1.connect(slashFilter);
    slash2.connect(slashFilter);
    slashFilter.connect(slashGain);
    slashGain.connect(this.masterGain!);

    // 3. METALLIC EDGE (Inharmonic pings)
    const edge = (freq: number, dur: number) => {
      const o = this.audioCtx!.createOscillator();
      const g = this.audioCtx!.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.08, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      o.connect(g);
      g.connect(this.masterGain!);
      o.start(now);
      o.stop(now + dur + 0.1);
    };
    edge(2200, 0.08);
    edge(3150, 0.1);
    edge(4400, 0.06);

    // 4. ENERGY TAIL / BLOOM
    const noiseBuffer = this.audioCtx!.createBuffer(1, this.audioCtx!.sampleRate * 0.5, this.audioCtx!.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) output[i] = Math.random() * 2 - 1;
    const noise = this.audioCtx!.createBufferSource();
    noise.buffer = noiseBuffer;

    const nFilter = this.audioCtx!.createBiquadFilter();
    nFilter.type = 'highpass';
    nFilter.frequency.setValueAtTime(4000, now);
    nFilter.frequency.exponentialRampToValueAtTime(12000, now + 0.4);

    const nGain = this.audioCtx!.createGain();
    nGain.gain.setValueAtTime(0, now);
    nGain.gain.linearRampToValueAtTime(0.12, now + 0.02);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    noise.connect(nFilter);
    nFilter.connect(nGain);
    nGain.connect(this.masterGain!);

    snapOsc.start(now);
    slash1.start(now);
    slash2.start(now);
    noise.start(now);

    snapOsc.stop(now + 0.02);
    slash1.stop(now + 0.2);
    slash2.stop(now + 0.2);
    noise.stop(now + 0.6);
  }

  playEpicStrike() {
    if (this.isMuted) return;
    this.init();
    const now = this.audioCtx!.currentTime;

    // More powerful version of the strike
    this.playStrike();
    
    // Add a huge sub-drop
    const dropOsc = this.audioCtx!.createOscillator();
    const dropGain = this.audioCtx!.createGain();
    dropOsc.type = 'sine';
    dropOsc.frequency.setValueAtTime(100, now);
    dropOsc.frequency.exponentialRampToValueAtTime(20, now + 0.8);
    dropGain.gain.setValueAtTime(1.0, now);
    dropGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    dropOsc.connect(dropGain);
    dropGain.connect(this.masterGain!);

    // Add a high-frequency "shimmer"
    const shimmerOsc = this.audioCtx!.createOscillator();
    const shimmerGain = this.audioCtx!.createGain();
    shimmerOsc.type = 'triangle';
    shimmerOsc.frequency.setValueAtTime(3000, now);
    shimmerOsc.frequency.exponentialRampToValueAtTime(8000, now + 0.5);
    shimmerGain.gain.setValueAtTime(0.1, now);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(this.masterGain!);

    dropOsc.start(now);
    shimmerOsc.start(now);
    dropOsc.stop(now + 1.0);
    shimmerOsc.stop(now + 0.6);
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
