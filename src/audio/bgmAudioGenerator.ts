import { Song, StemCategory } from '../types';

/**
 * Converts an AudioBuffer to an uncompressed 16-bit PCM stereo WAV Blob.
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const numFrames = buffer.length;
  const dataByteCount = numFrames * blockAlign;
  const totalByteCount = 44 + dataByteCount;

  const arrayBuffer = new ArrayBuffer(totalByteCount);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF identifier
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataByteCount, true);
  writeString(8, 'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataByteCount, true);

  // Interleave channels & write PCM samples
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channels[c][i];
      // Hard clamp to [-1, 1]
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Intelligent Center-Vocal Cancellation & Instrumental BGM Extractor.
 * Removes center-panned vocal frequencies (200Hz - 4.5kHz) while preserving stereo width,
 * reverb tails, synthesizers, and low-end bass frequencies (sub-120Hz).
 */
export async function generateBgmFromAudioUrl(
  audioUrl: string,
  onProgress?: (progress: number, status: string) => void
): Promise<{ bgmBlob: Blob; bgmUrl: string; durationSec: number }> {
  if (onProgress) onProgress(15, 'Downloading audio stream for stem extraction...');

  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();

  if (onProgress) onProgress(40, 'Decoding stereo audio frequencies...');
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const durationSec = decodedBuffer.duration;
  const sampleRate = decodedBuffer.sampleRate;
  const numFrames = decodedBuffer.length;

  if (onProgress) onProgress(65, 'Isolating center vocal channel & preserving 808 sub-bass...');

  // Setup Offline Audio Context for accelerated vocal cancellation
  const offlineCtx = new OfflineAudioContext(2, numFrames, sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = decodedBuffer;

  // Vocal remover node network using channel difference and low-frequency recovery:
  // 1. Channel Splitter
  const splitter = offlineCtx.createChannelSplitter(2);
  const merger = offlineCtx.createChannelMerger(2);

  // Left channel: Left - (Right * vocalCut)
  // Right channel: Right - (Left * vocalCut)
  const leftGain = offlineCtx.createGain();
  const rightGain = offlineCtx.createGain();
  const rightInvertGain = offlineCtx.createGain();
  const leftInvertGain = offlineCtx.createGain();

  rightInvertGain.gain.value = -0.92;
  leftInvertGain.gain.value = -0.92;
  leftGain.gain.value = 1.0;
  rightGain.gain.value = 1.0;

  // Highpass filter for the cancellation path so bass is NEVER cancelled
  const highPassForCancellation = offlineCtx.createBiquadFilter();
  highPassForCancellation.type = 'highpass';
  highPassForCancellation.frequency.value = 160; // Vocals start above 160Hz

  // Lowpass filter to retain solid sub-bass kick & 808 foundation
  const lowPassBassRecovery = offlineCtx.createBiquadFilter();
  lowPassBassRecovery.type = 'lowpass';
  lowPassBassRecovery.frequency.value = 160;
  lowPassBassRecovery.gain.value = 2.0;

  // Connect source
  source.connect(splitter);
  source.connect(lowPassBassRecovery);

  // Left channel processing
  splitter.connect(leftGain, 0);
  splitter.connect(highPassForCancellation, 1);
  highPassForCancellation.connect(rightInvertGain);

  // Right channel processing
  splitter.connect(rightGain, 1);
  splitter.connect(highPassForCancellation, 0);
  highPassForCancellation.connect(leftInvertGain);

  // Mix to left
  leftGain.connect(merger, 0, 0);
  rightInvertGain.connect(merger, 0, 0);
  lowPassBassRecovery.connect(merger, 0, 0);

  // Mix to right
  rightGain.connect(merger, 0, 1);
  leftInvertGain.connect(merger, 0, 1);
  lowPassBassRecovery.connect(merger, 0, 1);

  // Output to offline destination
  merger.connect(offlineCtx.destination);

  source.start(0);

  if (onProgress) onProgress(85, 'Rendering high-definition BGM instrumental buffer...');
  const renderedBuffer = await offlineCtx.startRendering();

  if (onProgress) onProgress(95, 'Encoding uncompressed master WAV file...');
  const bgmBlob = audioBufferToWavBlob(renderedBuffer);
  const bgmUrl = URL.createObjectURL(bgmBlob);

  if (onProgress) onProgress(100, 'BGM generation complete!');
  audioCtx.close();

  return { bgmBlob, bgmUrl, durationSec };
}

/**
 * Procedural BGM synthesizer for tracks without audioUrl.
 * Synthesizes 100% instrumental background track (sub-bass, drums/dappu, ambient pad, solo hook)
 * without the lead vocal oscillators.
 */
export function generateProceduralBgmWav(song: Song, durationSec: number = 60): Blob {
  const sampleRate = 44100;
  const numChannels = 2;
  const numFrames = Math.floor(sampleRate * Math.min(durationSec, 90));
  const buffer = new ArrayBuffer(44 + numFrames * numChannels * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numFrames * numChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numFrames * numChannels * 2, true);

  const bpm = song.bpm || 120;
  const baseFreq = song.key === 'F# Minor' ? 185 :
    song.key === 'D Major' ? 146.8 :
    song.key === 'A Minor' ? 220 : 130.8;

  let offset = 44;

  for (let i = 0; i < numFrames; i++) {
    const t = i / sampleRate;
    const beat = t * (bpm / 60);
    const subBeat = (beat * 4) % 1;
    const beatIndex = Math.floor(beat);

    // Kick on 0 and 2
    const isKickBeat = Math.floor(beat % 4) === 0 || Math.floor(beat % 4) === 2;
    const kickEnv = isKickBeat && (beat % 1) < 0.18 ? Math.exp(-(beat % 1) * 22) : 0;
    const kickSample = kickEnv * Math.sin(2 * Math.PI * (130 - (beat % 1) * 85) * t);

    // Snare / Dappu slap on 1 and 3
    const isSnareBeat = Math.floor(beat % 4) === 1 || Math.floor(beat % 4) === 3;
    const snareEnv = isSnareBeat && (beat % 1) < 0.16 ? Math.exp(-(beat % 1) * 25) : 0;
    const snareSample = snareEnv * (Math.random() * 2 - 1) * 0.7;

    // Sub-bass line
    const bassNoteFreq = baseFreq * (beatIndex % 2 === 0 ? 0.5 : 0.667);
    const bassEnv = Math.max(0, 1 - (beat % 0.5) * 1.8);
    const bassSample = Math.sin(2 * Math.PI * bassNoteFreq * t) * bassEnv * 0.45;

    // Ambient Synth Pad (Stereo Chorus)
    const padSampleLeft = Math.sin(2 * Math.PI * (baseFreq * 1.5) * t) * 0.2 + Math.sin(2 * Math.PI * (baseFreq * 2.0) * t) * 0.15;
    const padSampleRight = Math.sin(2 * Math.PI * (baseFreq * 1.503) * t) * 0.2 + Math.sin(2 * Math.PI * (baseFreq * 2.006) * t) * 0.15;

    // Percussion High-hat
    const hiHatEnv = subBeat < 0.05 ? Math.exp(-subBeat * 40) : 0;
    const hiHat = hiHatEnv * (Math.random() * 2 - 1) * 0.12;

    const fade = Math.min(1, Math.min(t / 0.8, (durationSec - t) / 0.8));

    // Combine left and right
    const left = (kickSample * 0.6 + snareSample * 0.4 + bassSample * 0.5 + padSampleLeft * 0.35 + hiHat) * fade * 0.85;
    const right = (kickSample * 0.6 + snareSample * 0.4 + bassSample * 0.5 + padSampleRight * 0.35 + hiHat * 0.8) * fade * 0.85;

    const intLeft = Math.max(-32768, Math.min(32767, Math.floor(left * 32767)));
    const intRight = Math.max(-32768, Math.min(32767, Math.floor(right * 32767)));

    view.setInt16(offset, intLeft, true);
    view.setInt16(offset + 2, intRight, true);
    offset += 4;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Downloads any Blob with the specified filename in the browser.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
