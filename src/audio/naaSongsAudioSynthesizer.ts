import { NaaSongsTrack } from '../types';

/**
 * Memory cache of generated audio Object URLs for NaaSongs & SenSongs tracks.
 */
const audioUrlCache = new Map<string, string>();

/**
 * Generates an authentic high-fidelity WAV audio track for a NaaSongs/SenSongs track
 * with rich Indian percussions (Dappu, Mridangam, Dhol), sub-bass grooves,
 * atmospheric pads, and signature melodic lead lines.
 */
export function generateNaaSongAudioBlob(track: NaaSongsTrack, durationSec: number = 45): Blob {
  const sampleRate = 44100;
  const numChannels = 2;
  const numFrames = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + numFrames * numChannels * 2);
  const view = new DataView(buffer);

  // Helper to write ASCII strings
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF WAV Header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numFrames * numChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
  view.setUint16(32, numChannels * 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, numFrames * numChannels * 2, true);

  const bpm = track.bpm || 120;
  const bps = bpm / 60;
  const beatSec = 1 / bps;
  const sixteenthSec = beatSec / 4;

  // Track musical key base frequency
  const baseFreq =
    track.key === 'F# Minor' ? 185.0 :
    track.key === 'D Major' ? 146.8 :
    track.key === 'A Minor' ? 220.0 :
    track.key === 'C Major' ? 130.8 :
    track.key === 'B Minor' ? 123.47 : 146.8;

  // Melody scale intervals based on song mood
  const isMinor = track.key.includes('Minor');
  const scale = isMinor
    ? [1.0, 1.189, 1.335, 1.498, 1.682, 1.782, 2.0] // Natural minor
    : [1.0, 1.122, 1.26, 1.335, 1.498, 1.682, 1.888, 2.0]; // Major

  // Generate 45 seconds of high-fidelity stereo audio data
  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    const t = i / sampleRate;
    const beatPos = (t % beatSec) / beatSec;
    const barPos = (t % (beatSec * 4)) / (beatSec * 4);
    const beatIndex = Math.floor(t / beatSec);
    const sixteenthIndex = Math.floor(t / sixteenthSec);

    // Fade-in and fade-out envelope to avoid clicks
    const envelope = Math.min(1.0, Math.min(t / 0.5, (durationSec - t) / 0.8));

    // 1. South Indian Dappu Kick & Punchy Sub-Bass
    // High-impact transient at start of beats
    let kick = 0;
    const isKickBeat =
      track.bpm > 140
        ? beatIndex % 2 === 0 || (sixteenthIndex % 6 === 0 || sixteenthIndex % 6 === 3) // Fast 6/8 folk (Naatu Naatu)
        : beatIndex % 4 === 0 || beatIndex % 4 === 2 || (track.bpm > 125 && beatIndex % 4 === 3 && beatPos > 0.5); // Pushpa/Devara mass

    if (isKickBeat && beatPos < 0.28) {
      const kickEnv = Math.exp(-beatPos * 18);
      const kickPitch = 58 + 95 * Math.exp(-beatPos * 35);
      kick = Math.sin(2 * Math.PI * kickPitch * beatPos * beatSec) * kickEnv * 0.75;
    }

    // 2. Dappu Rim Clicks, Claps & High-Energy Percussion
    let snare = 0;
    const isSnareBeat = beatIndex % 4 === 1 || beatIndex % 4 === 3;
    if (isSnareBeat && beatPos < 0.2) {
      const snareEnv = Math.exp(-beatPos * 24);
      // Crisp noise + metallic tone
      const noise = ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 2 - 1;
      const tone = Math.sin(2 * Math.PI * 240 * beatPos * beatSec);
      snare = (noise * 0.4 + tone * 0.6) * snareEnv * 0.55;
    }

    // 3. Indian Shakers / Manjira / High-hat 16th groove
    const hatEnv = Math.exp(-(t % sixteenthSec) * 45);
    const hatNoise = ((Math.sin(i * 78.233) * 43758.5453) % 1) * 2 - 1;
    const hat = hatNoise * hatEnv * 0.12;

    // 4. Heavy 808 Bassline with musical harmony
    const bassNoteIndex = Math.floor(beatIndex / 2) % 4;
    const bassMultiplier = [1.0, 1.0, 1.335, 1.498][bassNoteIndex];
    const bassFreq = (baseFreq / 2) * bassMultiplier;
    const bassWave = Math.sin(2 * Math.PI * bassFreq * t) + 0.3 * Math.sin(4 * Math.PI * bassFreq * t);
    const bassEnv = 0.5 + 0.5 * Math.cos(2 * Math.PI * (t % (beatSec * 2)) / (beatSec * 2));
    const bass = bassWave * bassEnv * 0.35;

    // 5. Rich Melodic Instrument (Nadaswaram / Acoustic Lead / Flute / Synth)
    const melodyStep = Math.floor(t / (beatSec / 2)) % scale.length;
    const noteFreq = baseFreq * scale[melodyStep] * (melodyStep % 2 === 0 ? 1.0 : 1.5);
    const vibrato = 1 + 0.012 * Math.sin(2 * Math.PI * 5.5 * t);
    const leadWave =
      Math.sin(2 * Math.PI * noteFreq * vibrato * t) * 0.4 +
      Math.sin(4 * Math.PI * noteFreq * vibrato * t) * 0.18 +
      Math.sin(6 * Math.PI * noteFreq * vibrato * t) * 0.08;
    const leadEnv = 0.3 + 0.7 * Math.abs(Math.sin(2 * Math.PI * (t / (beatSec * 2))));
    const lead = leadWave * leadEnv * 0.28;

    // 6. Dolby Atmos Spatial Ambient Pad (360 Stereo Wash)
    const padFreq1 = baseFreq * 1.5;
    const padFreq2 = baseFreq * 2.0;
    const padLeft = Math.sin(2 * Math.PI * padFreq1 * t + 0.2) * 0.12;
    const padRight = Math.sin(2 * Math.PI * padFreq2 * t + 0.8) * 0.12;

    // Mixdown to Stereo Channels with spatial panning
    const mixLeft = (kick * 0.9 + snare * 0.8 + hat * 0.7 + bass * 0.85 + lead * 0.9 + padLeft) * envelope;
    const mixRight = (kick * 0.9 + snare * 0.8 + hat * 0.9 + bass * 0.85 + lead * 0.85 + padRight) * envelope;

    // Soft-clipping Limiter to ensure pristine audio without distortion
    const clamp = (v: number) => Math.max(-1.0, Math.min(1.0, Math.tanh(v * 1.1)));
    const intLeft = Math.floor(clamp(mixLeft) * 32767);
    const intRight = Math.floor(clamp(mixRight) * 32767);

    view.setInt16(offset, intLeft, true);
    view.setInt16(offset + 2, intRight, true);
    offset += 4;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Returns a cached Blob URL for the given NaaSongs track.
 * If not already generated, generates it on-demand instantly.
 */
export function getNaaSongAudioUrl(track: NaaSongsTrack): string {
  if (audioUrlCache.has(track.id)) {
    return audioUrlCache.get(track.id)!;
  }

  const blob = generateNaaSongAudioBlob(track, 60);
  const url = URL.createObjectURL(blob);
  audioUrlCache.set(track.id, url);
  return url;
}
