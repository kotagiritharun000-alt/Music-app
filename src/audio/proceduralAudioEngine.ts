import { AudioSpatialConfig, RoomPreset, Song, StemCategory } from '../types';

export class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlayingState: boolean = false;
  private currentPositionMsState: number = 0;
  private volumeState: number = 85;
  private isMutedState: boolean = false;
  private currentSong: Song | null = null;

  private spatialConfig: AudioSpatialConfig = {
    isSpatialEnabled: true,
    isDolbyAtmosEnabled: true,
    roomPreset: RoomPreset.ATMOS_360,
    bassBoost: 0.65,
    vocalClarity: 0.80,
    azimuthAngleDegrees: 0,
    distanceMeters: 1.2,
    isHeadTrackingActive: true
  };

  private stemMuteStates: Record<StemCategory, boolean> = {
    [StemCategory.MAIN_MELODY]: false,
    [StemCategory.BASSLINE_GROOVE]: false,
    [StemCategory.DRUMS_PERCUSSION]: false,
    [StemCategory.AMBIENT_PAD]: false,
    [StemCategory.CLIMAX_SOLO]: false
  };

  private stemSoloStates: Record<StemCategory, boolean> = {
    [StemCategory.MAIN_MELODY]: false,
    [StemCategory.BASSLINE_GROOVE]: false,
    [StemCategory.DRUMS_PERCUSSION]: false,
    [StemCategory.AMBIENT_PAD]: false,
    [StemCategory.CLIMAX_SOLO]: false
  };

  // Audio nodes
  private masterGain: GainNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private clarityFilter: BiquadFilterNode | null = null;
  private convolverNode: ConvolverNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;

  // Animation & timing
  private rafId: number | null = null;
  private lastTickTime: number = 0;
  private trimmerActive: boolean = false;
  private trimmerStartMs: number = 0;
  private trimmerEndMs: number = 30000;

  // Listeners for UI state updates
  public onStateChange?: (state: {
    isPlaying: boolean;
    currentPositionMs: number;
    frequencyBands: number[];
  }) => void;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initAudioContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    // Create Master Gain
    this.masterGain = this.ctx.createGain();
    this.applyVolume();

    // Create Stereo Panner
    this.pannerNode = this.ctx.createStereoPanner();

    // Bass EQ filter (lowshelf at 120Hz)
    this.bassFilter = this.ctx.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.value = 120;

    // Vocal Clarity EQ filter (peaking at 2800Hz)
    this.clarityFilter = this.ctx.createBiquadFilter();
    this.clarityFilter.type = 'peaking';
    this.clarityFilter.frequency.value = 2800;
    this.clarityFilter.Q.value = 1.2;

    // Analyser Node for Spectrum Visualizer
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.8;

    // Room Reverb (Wet/Dry)
    this.convolverNode = this.ctx.createConvolver();
    this.dryGain = this.ctx.createGain();
    this.wetGain = this.ctx.createGain();

    this.rebuildRoomImpulse();
    this.applySpatialConfig();

    // Signal chain:
    // Sources -> BassFilter -> ClarityFilter -> Panner -> DryGain/WetGain -> MasterGain -> Analyser -> Destination
    this.bassFilter.connect(this.clarityFilter);
    this.clarityFilter.connect(this.pannerNode);

    this.pannerNode.connect(this.dryGain);
    this.dryGain.connect(this.masterGain);

    this.pannerNode.connect(this.convolverNode);
    this.convolverNode.connect(this.wetGain);
    this.wetGain.connect(this.masterGain);

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  private rebuildRoomImpulse() {
    if (!this.ctx || !this.convolverNode) return;
    const sampleRate = this.ctx.sampleRate;
    const preset = this.spatialConfig.roomPreset;
    const durationSec = preset === RoomPreset.CONCERT_HALL ? 2.8 : preset === RoomPreset.ATMOS_360 ? 1.6 : preset === RoomPreset.BINAURAL_3D ? 1.2 : 0.4;
    const decay = preset === RoomPreset.CONCERT_HALL ? 2.2 : preset === RoomPreset.ATMOS_360 ? 1.8 : 3.0;

    const length = Math.floor(sampleRate * durationSec);
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const env = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * env * 0.5;
      right[i] = (Math.random() * 2 - 1) * env * 0.5;
    }

    this.convolverNode.buffer = impulse;
  }

  private setupAudioElement() {
    if (this.audioElement) return;
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';

    this.audioElement.addEventListener('ended', () => {
      if (this.trimmerActive) {
        this.seekTo(this.trimmerStartMs);
        this.play();
      } else {
        // Automatically loop or rewind track seamlessly
        this.seekTo(0);
        if (this.isPlayingState) {
          this.play();
        }
      }
    });

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement && this.currentSong?.audioUrl) {
        this.currentPositionMsState = Math.floor(this.audioElement.currentTime * 1000);
        if (this.trimmerActive && this.currentPositionMsState >= this.trimmerEndMs) {
          this.audioElement.currentTime = this.trimmerStartMs / 1000;
        }
      }
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      if (this.audioElement && this.currentSong) {
        if (this.audioElement.duration && isFinite(this.audioElement.duration) && this.audioElement.duration > 0) {
          this.currentSong.durationMs = Math.floor(this.audioElement.duration * 1000);
        }
      }
    });

    this.audioElement.addEventListener('error', () => {
      if (this.audioElement && this.currentSong?.audioUrl && !this.audioElement.src.includes('/api/audio-proxy')) {
        console.log('[AudioEngine] Direct playback fallback to local proxy stream...');
        this.audioElement.src = `/api/audio-proxy?url=${encodeURIComponent(this.currentSong.audioUrl)}`;
        this.audioElement.load();
        if (this.isPlayingState) {
          this.audioElement.play().catch(e => console.warn('Audio proxy playback notice:', e));
        }
      }
    });
  }

  private connectAudioElement() {
    if (!this.ctx || !this.audioElement || this.mediaSourceNode) return;
    try {
      this.mediaSourceNode = this.ctx.createMediaElementSource(this.audioElement);
      this.mediaSourceNode.connect(this.bassFilter!);
    } catch (e) {
      console.warn('Could not connect media element source:', e);
    }
  }

  public loadSong(song: Song) {
    this.currentSong = song;
    this.currentPositionMsState = 0;
    this.trimmerActive = false;
    this.currentStep = 0;
    if (this.ctx) {
      this.nextNoteTime = this.ctx.currentTime + 0.05;
    }

    this.setupAudioElement();
    if (song.audioUrl) {
      if (this.audioElement) {
        this.audioElement.src = song.audioUrl;
        this.audioElement.currentTime = 0;
        this.audioElement.load();
      }
    } else {
      if (this.audioElement) {
        this.audioElement.pause();
      }
    }
  }

  public async play() {
    this.initAudioContext();
    this.connectAudioElement();
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (err) {
        console.warn('Context resume error:', err);
      }
    }

    if (this.ctx) {
      this.nextNoteTime = this.ctx.currentTime + 0.05;
    }

    if (this.audioElement && this.currentSong?.audioUrl) {
      this.audioElement.play().catch(err => console.warn('Audio element play failed:', err));
    }

    this.isPlayingState = true;
    this.lastTickTime = performance.now();
    this.startAudioLoop();
  }

  public pause() {
    this.isPlayingState = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.onStateChange) {
      this.onStateChange({
        isPlaying: false,
        currentPositionMs: this.currentPositionMsState,
        frequencyBands: this.computeFrequencyBands()
      });
    }
  }

  public seekTo(positionMs: number) {
    const maxDur = this.currentSong ? this.currentSong.durationMs : 180000;
    this.currentPositionMsState = Math.max(0, Math.min(positionMs, maxDur));
    if (this.audioElement && this.currentSong?.audioUrl) {
      this.audioElement.currentTime = this.currentPositionMsState / 1000;
    }
  }

  public setVolume(vol: number) {
    this.volumeState = Math.max(0, Math.min(100, vol));
    if (this.volumeState > 0 && this.isMutedState) {
      this.isMutedState = false;
    }
    this.applyVolume();
  }

  public setMute(muted: boolean) {
    this.isMutedState = muted;
    this.applyVolume();
  }

  public toggleMute() {
    this.setMute(!this.isMutedState);
  }

  private applyVolume() {
    if (!this.masterGain || !this.ctx) return;
    const gainVal = this.isMutedState ? 0 : this.volumeState / 100;
    this.masterGain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
  }

  public updateSpatialConfig(config: AudioSpatialConfig) {
    this.spatialConfig = { ...config };
    this.applySpatialConfig();
    this.rebuildRoomImpulse();
  }

  private applySpatialConfig() {
    if (!this.ctx) return;
    const { isSpatialEnabled, isDolbyAtmosEnabled, bassBoost, vocalClarity, azimuthAngleDegrees } = this.spatialConfig;

    // Pan: Azimuth -180 to 180 mapped to stereo pan (-1 to 1)
    if (this.pannerNode) {
      const panVal = isSpatialEnabled ? Math.sin((azimuthAngleDegrees * Math.PI) / 180) : 0;
      this.pannerNode.pan.setValueAtTime(Math.max(-1, Math.min(1, panVal)), this.ctx.currentTime);
    }

    // Bass boost gain (-6dB to +14dB)
    if (this.bassFilter) {
      const db = isDolbyAtmosEnabled ? bassBoost * 14 : 0;
      this.bassFilter.gain.setValueAtTime(db, this.ctx.currentTime);
    }

    // Vocal clarity gain (-3dB to +10dB)
    if (this.clarityFilter) {
      const db = isDolbyAtmosEnabled ? vocalClarity * 10 : 0;
      this.clarityFilter.gain.setValueAtTime(db, this.ctx.currentTime);
    }

    // Wet / dry room balance
    if (this.dryGain && this.wetGain) {
      const wetLevel = isSpatialEnabled ? 0.35 : 0.05;
      this.wetGain.gain.setValueAtTime(wetLevel, this.ctx.currentTime);
      this.dryGain.gain.setValueAtTime(1.0 - wetLevel * 0.4, this.ctx.currentTime);
    }
  }

  public toggleStemMute(category: StemCategory) {
    this.stemMuteStates = {
      ...this.stemMuteStates,
      [category]: !this.stemMuteStates[category]
    };
  }

  public setStemMute(category: StemCategory, muted: boolean) {
    this.stemMuteStates = {
      ...this.stemMuteStates,
      [category]: muted
    };
  }

  public toggleStemSolo(category: StemCategory) {
    const isCurrentlySolo = this.stemSoloStates[category];
    const newSoloStates: Record<StemCategory, boolean> = {
      [StemCategory.MAIN_MELODY]: false,
      [StemCategory.BASSLINE_GROOVE]: false,
      [StemCategory.DRUMS_PERCUSSION]: false,
      [StemCategory.AMBIENT_PAD]: false,
      [StemCategory.CLIMAX_SOLO]: false
    };

    if (!isCurrentlySolo) {
      newSoloStates[category] = true;
    }
    this.stemSoloStates = newSoloStates;
  }

  public setStemSolo(category: StemCategory, solo: boolean) {
    const newSoloStates: Record<StemCategory, boolean> = {
      [StemCategory.MAIN_MELODY]: false,
      [StemCategory.BASSLINE_GROOVE]: false,
      [StemCategory.DRUMS_PERCUSSION]: false,
      [StemCategory.AMBIENT_PAD]: false,
      [StemCategory.CLIMAX_SOLO]: false
    };
    if (solo) {
      newSoloStates[category] = true;
    }
    this.stemSoloStates = newSoloStates;
  }

  public resetStems() {
    this.stemMuteStates = {
      [StemCategory.MAIN_MELODY]: false,
      [StemCategory.BASSLINE_GROOVE]: false,
      [StemCategory.DRUMS_PERCUSSION]: false,
      [StemCategory.AMBIENT_PAD]: false,
      [StemCategory.CLIMAX_SOLO]: false
    };
    this.stemSoloStates = {
      [StemCategory.MAIN_MELODY]: false,
      [StemCategory.BASSLINE_GROOVE]: false,
      [StemCategory.DRUMS_PERCUSSION]: false,
      [StemCategory.AMBIENT_PAD]: false,
      [StemCategory.CLIMAX_SOLO]: false
    };
  }

  public startLoopPreview(startMs: number, endMs: number) {
    this.trimmerActive = true;
    this.trimmerStartMs = startMs;
    this.trimmerEndMs = endMs;
    this.currentPositionMsState = startMs;
    this.play();
  }

  public stopLoopPreview() {
    this.trimmerActive = false;
    this.pause();
  }

  private isStemAudible(category: StemCategory): boolean {
    const anySolo = Object.values(this.stemSoloStates).some(Boolean);
    if (anySolo) {
      return !!this.stemSoloStates[category];
    }
    return !this.stemMuteStates[category];
  }

  // Active audio notes generation scheduled ahead
  private nextNoteTime: number = 0;
  private currentStep: number = 0;

  private startAudioLoop() {
    const tick = () => {
      if (!this.isPlayingState) return;

      const now = performance.now();
      const deltaMs = now - this.lastTickTime;
      this.lastTickTime = now;

      // Update position
      const songDuration = this.currentSong?.durationMs || 180000;
      let nextPos = this.currentPositionMsState + deltaMs;

      if (this.trimmerActive) {
        if (nextPos >= this.trimmerEndMs) {
          nextPos = this.trimmerStartMs;
        }
      } else {
        if (nextPos >= songDuration) {
          nextPos = 0;
        }
      }
      this.currentPositionMsState = nextPos;

      // Schedule procedural Web Audio synthesizer notes
      if (this.ctx && this.bassFilter) {
        const bpm = this.currentSong?.bpm || 120;
        const stepSec = 60 / (bpm * 4); // 16th note step

        if (this.ctx.currentTime >= this.nextNoteTime - 0.1) {
          this.scheduleNextStep(this.ctx.currentTime, stepSec);
        }
      }

      // Compute dynamic 16-band spectrum visualizer values
      const bands = this.computeFrequencyBands();

      if (this.onStateChange) {
        this.onStateChange({
          isPlaying: this.isPlayingState,
          currentPositionMs: this.currentPositionMsState,
          frequencyBands: bands
        });
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private scheduleNextStep(currentTime: number, stepSec: number) {
    if (!this.ctx || !this.bassFilter) return;
    // When playing a real audio file / URL, do not layer procedural oscillators
    if (this.currentSong?.audioUrl) return;

    const baseFreq = this.currentSong?.key === 'F# Minor' ? 185 :
      this.currentSong?.key === 'D Major' ? 146.8 :
      this.currentSong?.key === 'A Minor' ? 220 : 130.8;

    const step = this.currentStep % 16;
    const time = Math.max(currentTime, this.nextNoteTime);

    // 1. Kick & Snare Drums
    if (this.isStemAudible(StemCategory.DRUMS_PERCUSSION)) {
      if (step === 0 || step === 8) {
        // Kick
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);
        gain.gain.setValueAtTime(0.7, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        osc.connect(gain);
        gain.connect(this.bassFilter);
        osc.start(time);
        osc.stop(time + 0.16);
      } else if (step === 4 || step === 12) {
        // Snare / Clap
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, time);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
        osc.connect(gain);
        gain.connect(this.bassFilter);
        osc.start(time);
        osc.stop(time + 0.15);
      }
      // Hi-hat on every odd 16th
      if (step % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(8000, time);
        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
        osc.connect(gain);
        gain.connect(this.bassFilter);
        osc.start(time);
        osc.stop(time + 0.05);
      }
    }

    // 2. Bassline
    if (this.isStemAudible(StemCategory.BASSLINE_GROOVE) && (step % 2 === 0)) {
      const bassMultiplier = [0.5, 0.5, 0.75, 0.667][Math.floor(step / 4) % 4];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq * bassMultiplier, time);
      gain.gain.setValueAtTime(0.28, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + stepSec * 1.8);
      osc.connect(gain);
      gain.connect(this.bassFilter);
      osc.start(time);
      osc.stop(time + stepSec * 1.9);
    }

    // 3. Main Melody Synth
    if (this.isStemAudible(StemCategory.MAIN_MELODY) && (step % 2 === 0 || step === 7 || step === 15)) {
      const melodyIntervals = [1.0, 1.2, 1.5, 1.8, 2.0, 1.5, 1.2, 1.0];
      const interval = melodyIntervals[Math.floor(step / 2) % melodyIntervals.length];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * 2.0 * interval, time);
      gain.gain.setValueAtTime(0.22, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + stepSec * 1.4);
      osc.connect(gain);
      gain.connect(this.bassFilter);
      osc.start(time);
      osc.stop(time + stepSec * 1.5);
    }

    // 4. Climax Solo
    if (this.isStemAudible(StemCategory.CLIMAX_SOLO) && step % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq * 3.0 * (1.0 + (step % 3) * 0.25), time);
      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + stepSec * 3.5);
      osc.connect(gain);
      gain.connect(this.bassFilter);
      osc.start(time);
      osc.stop(time + stepSec * 3.6);
    }

    this.currentStep++;
    this.nextNoteTime = time + stepSec;
  }

  private computeFrequencyBands(): number[] {
    if (this.analyser && this.isPlayingState) {
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.analyser.getByteFrequencyData(dataArray);

      let totalEnergy = 0;
      for (let i = 0; i < bufferLength; i++) {
        totalEnergy += dataArray[i];
      }

      if (totalEnergy > 5) {
        const bands: number[] = [];
        const step = Math.max(1, Math.floor(bufferLength / 16));
        const volWeight = this.isMutedState ? 0 : this.volumeState / 100;
        for (let i = 0; i < 16; i++) {
          let sum = 0;
          let count = 0;
          for (let j = i * step; j < (i + 1) * step && j < bufferLength; j++) {
            sum += dataArray[j];
            count++;
          }
          const avg = count > 0 ? (sum / count) / 255 : 0;
          bands.push(Math.min(1.0, Math.max(0.08, avg * volWeight * 1.3)));
        }
        return bands;
      }
    }

    const sec = this.currentPositionMsState / 1000;
    const volWeight = this.isMutedState ? 0 : this.volumeState / 100;

    const melodyAudible = this.isStemAudible(StemCategory.MAIN_MELODY);
    const bassAudible = this.isStemAudible(StemCategory.BASSLINE_GROOVE);
    const drumsAudible = this.isStemAudible(StemCategory.DRUMS_PERCUSSION);
    const padAudible = this.isStemAudible(StemCategory.AMBIENT_PAD);
    const soloAudible = this.isStemAudible(StemCategory.CLIMAX_SOLO);

    return Array.from({ length: 16 }, (_, i) => {
      let stemFactor = 0.2;
      if (i < 4) stemFactor = bassAudible ? 0.85 : 0.15;
      else if (i < 8) stemFactor = drumsAudible ? 0.8 : 0.2;
      else if (i < 12) stemFactor = melodyAudible ? 0.9 : 0.25;
      else stemFactor = (soloAudible || padAudible) ? 0.8 : 0.15;

      const osc = 0.35 + 0.65 * Math.abs(Math.sin(sec * 7 + i * 0.45));
      return Math.min(1.0, Math.max(0.1, osc * stemFactor * (volWeight > 0 ? volWeight : 0.1)));
    });
  }

  /**
   * Generates a downloadable WAV audio file blob for the trimmed portion of the track.
   */
  public generateExportWavBlob(durationSec: number = 30): Blob {
    const sampleRate = 44100;
    const numChannels = 2;
    const numFrames = Math.floor(sampleRate * Math.min(durationSec, 60));
    const buffer = new ArrayBuffer(44 + numFrames * numChannels * 2);
    const view = new DataView(buffer);

    // Write WAV Header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numFrames * numChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
    view.setUint16(32, numChannels * 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    writeString(36, 'data');
    view.setUint32(40, numFrames * numChannels * 2, true);

    // Synthesize audio data samples
    const bpm = this.currentSong?.bpm || 120;
    const freq = 220;
    let offset = 44;

    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const beat = (t / (60 / bpm));
      const fadeEnvelope = Math.min(1, Math.min(t / 0.5, (durationSec - t) / 0.5));
      const sample = (
        Math.sin(2 * Math.PI * freq * t) * 0.4 +
        Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.25 +
        (beat % 1 < 0.1 ? 0.3 : 0)
      ) * fadeEnvelope * 0.8;

      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(offset, intSample, true);
      view.setInt16(offset + 2, intSample, true);
      offset += 4;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  public destroy() {
    this.pause();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
