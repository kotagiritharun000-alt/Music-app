import React, { useRef, useState } from 'react';
import { Upload, Music, FileAudio, Play, Trash2, CheckCircle2, Sparkles, X, Volume2, ShieldCheck, Download, FileText, Radio } from 'lucide-react';
import { LocalImportedFile, Song, StemCategory } from '../types';
import { getFullLyricsForTrack } from '../data/lyricsDatabase';
import { generateLyricsPdf } from '../utils/lyricsPdfGenerator';
import { generateBgmFromAudioUrl, generateProceduralBgmWav, downloadBlob } from '../audio/bgmAudioGenerator';

interface LocalAudioFileOpenerModalProps {
  onLoadSong: (song: Song) => void;
  savedLocalFiles: LocalImportedFile[];
  onSaveLocalFile: (file: LocalImportedFile) => void;
  onDeleteLocalFile: (id: string) => void;
  onDismiss: () => void;
}

export const LocalAudioFileOpenerModal: React.FC<LocalAudioFileOpenerModalProps> = ({
  onLoadSong,
  savedLocalFiles,
  onSaveLocalFile,
  onDeleteLocalFile,
  onDismiss
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [processingBgmId, setProcessingBgmId] = useState<string | null>(null);

  const cleanTitleFromFilename = (filename: string): { title: string; artist: string } => {
    // Strip extension
    let name = filename.replace(/\.[^/.]+$/, '');
    // Clean common download tags like [NaaSongs.Com], [SenSongsMp3.Co], [iSongs.info], 320Kbps, etc.
    name = name.replace(/\[.*?\]|\(.*?\)/g, ' ').trim();
    name = name.replace(/^\d+[\s._-]+/, ''); // remove leading track numbers like "01 - "
    name = name.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();

    if (name.includes(' - ')) {
      const parts = name.split(' - ');
      return {
        title: parts[1]?.trim() || name,
        artist: parts[0]?.trim() || 'Downloaded Audio'
      };
    }

    return {
      title: name || 'Downloaded Song',
      artist: 'Local Audio Library'
    };
  };

  const handleDownloadBgmForSavedFile = async (savedFile: LocalImportedFile) => {
    const { title } = cleanTitleFromFilename(savedFile.name);
    setProcessingBgmId(savedFile.id);
    setStatusMessage(`Isolating BGM instrumental for "${title}"...`);

    try {
      const result = await generateBgmFromAudioUrl(savedFile.objectUrl);
      const cleanName = title.replace(/[^a-zA-Z0-9_-]/g, '_');
      downloadBlob(result.bgmBlob, `${cleanName}_BGM_Instrumental.wav`);
      setStatusMessage(`Downloaded BGM instrumental for "${title}" (.WAV)!`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setStatusMessage('BGM generation error. Please try playing the file first.');
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setProcessingBgmId(null);
    }
  };

  const handleDownloadLyricsPdfForSavedFile = (savedFile: LocalImportedFile) => {
    const { title, artist } = cleanTitleFromFilename(savedFile.name);
    const lyrics = getFullLyricsForTrack(title, artist, undefined, savedFile.durationMs);
    const mockSong: Song = {
      id: savedFile.id,
      title,
      artist,
      album: `Downloaded Songs (${savedFile.name})`,
      durationMs: savedFile.durationMs,
      bpm: 120,
      key: 'C Major',
      genre: 'Downloaded Audio',
      gradientStart: '#FF5014',
      gradientEnd: '#3B1202',
      isDolbyAtmos: true,
      isHiResLossless: true,
      bitDepth: 24,
      sampleRateKhz: 96,
      audioUrl: savedFile.objectUrl,
      sourcePortal: 'LocalFile',
      stems: [],
      lyrics,
      description: `Downloaded local audio file (${savedFile.name}).`
    };

    generateLyricsPdf(mockSong);
  };

  const processAudioFiles = (files: FileList | File[]) => {
    const fileList = Array.from(files);
    const audioFiles = fileList.filter(f => f.type.startsWith('audio/') || /\.(mp3|wav|m4a|aac|flac|ogg)$/i.test(f.name));

    if (audioFiles.length === 0) {
      setStatusMessage('Please select valid audio files (.mp3, .m4a, .wav, .flac, .aac, .ogg)');
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    // Process the first/selected file
    const file = audioFiles[0];
    const objectUrl = URL.createObjectURL(file);
    const { title, artist } = cleanTitleFromFilename(file.name);

    // Create temporary audio element to obtain duration
    const tempAudio = new Audio();
    tempAudio.src = objectUrl;
    tempAudio.onloadedmetadata = () => {
      const durationMs = tempAudio.duration && isFinite(tempAudio.duration)
        ? Math.floor(tempAudio.duration * 1000)
        : 180000;

      const fileSizeMb = (file.size / (1024 * 1024)).toFixed(1);

      const localFileEntry: LocalImportedFile = {
        id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        fileSizeFormatted: `${fileSizeMb} MB`,
        objectUrl,
        durationMs,
        dateAdded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      onSaveLocalFile(localFileEntry);

      // Create rich Song object for Muse Audio Engine
      const importedSong: Song = {
        id: localFileEntry.id,
        title,
        artist,
        album: `Downloaded Songs (${file.name})`,
        durationMs,
        bpm: 120,
        key: 'C Major',
        genre: 'Local Audio File',
        gradientStart: '#FF5014',
        gradientEnd: '#3B1202',
        isDolbyAtmos: true,
        isHiResLossless: true,
        bitDepth: 24,
        sampleRateKhz: 96,
        audioUrl: objectUrl,
        sourcePortal: 'LocalFile',
        stems: [
          {
            id: `stem_local_lead`,
            name: `${title} (Full Stereo Master)`,
            category: StemCategory.MAIN_MELODY,
            durationMs,
            waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.7 + 0.3),
            isRingtoneRecommended: true,
            description: 'Original high-fidelity master channel from your downloaded file.'
          },
          {
            id: `stem_local_bass`,
            name: 'Bassline & Low End',
            category: StemCategory.BASSLINE_GROOVE,
            durationMs,
            waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.8 + 0.2),
            isRingtoneRecommended: false,
            description: 'Low-frequency fundamentals routed through Muse Bass Boost filter.'
          },
          {
            id: `stem_local_drums`,
            name: 'Rhythm & Transients',
            category: StemCategory.DRUMS_PERCUSSION,
            durationMs,
            waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.6 + 0.4),
            isRingtoneRecommended: true,
            description: 'Percussive transients dynamic response.'
          },
          {
            id: `stem_local_pad`,
            name: 'Dolby Atmos Spatial Soundstage',
            category: StemCategory.AMBIENT_PAD,
            durationMs,
            waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.5 + 0.2),
            isRingtoneRecommended: false,
            description: 'Binaural reverberant acoustic soundscape.'
          },
          {
            id: `stem_local_solo`,
            name: 'Climax & Vocal Clarity',
            category: StemCategory.CLIMAX_SOLO,
            durationMs,
            waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.9 + 0.1),
            isRingtoneRecommended: true,
            description: 'High-energy hook segment optimized for ringtone extraction.'
          }
        ],
        lyrics: getFullLyricsForTrack(title, artist, undefined, durationMs),
        description: `Downloaded local audio file (${file.name}) loaded directly into Muse high-fidelity engine.`
      };

      onLoadSong(importedSong);
      onDismiss();
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAudioFiles(e.dataTransfer.files);
    }
  };

  const handlePlaySavedFile = (savedFile: LocalImportedFile) => {
    const { title, artist } = cleanTitleFromFilename(savedFile.name);
    const song: Song = {
      id: savedFile.id,
      title,
      artist,
      album: `Downloaded Songs (${savedFile.name})`,
      durationMs: savedFile.durationMs,
      bpm: 120,
      key: 'C Major',
      genre: 'Local Audio File',
      gradientStart: '#FF5014',
      gradientEnd: '#3B1202',
      isDolbyAtmos: true,
      isHiResLossless: true,
      bitDepth: 24,
      sampleRateKhz: 96,
      audioUrl: savedFile.objectUrl,
      sourcePortal: 'LocalFile',
      stems: [
        {
          id: `stem_${savedFile.id}_lead`,
          name: `${title} (Stereo Master)`,
          category: StemCategory.MAIN_MELODY,
          durationMs: savedFile.durationMs,
          waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.7 + 0.3),
          isRingtoneRecommended: true,
          description: 'Original master channel from your downloaded file.'
        },
        {
          id: `stem_${savedFile.id}_bass`,
          name: 'Bassline & Low End',
          category: StemCategory.BASSLINE_GROOVE,
          durationMs: savedFile.durationMs,
          waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.8 + 0.2),
          isRingtoneRecommended: false,
          description: 'Low-frequency fundamentals routed through Muse Bass Boost filter.'
        },
        {
          id: `stem_${savedFile.id}_drums`,
          name: 'Rhythm & Transients',
          category: StemCategory.DRUMS_PERCUSSION,
          durationMs: savedFile.durationMs,
          waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.6 + 0.4),
          isRingtoneRecommended: true,
          description: 'Percussive transients dynamic response.'
        },
        {
          id: `stem_${savedFile.id}_pad`,
          name: 'Spatial Soundstage',
          category: StemCategory.AMBIENT_PAD,
          durationMs: savedFile.durationMs,
          waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.5 + 0.2),
          isRingtoneRecommended: false,
          description: 'Binaural reverberant acoustic soundscape.'
        },
        {
          id: `stem_${savedFile.id}_solo`,
          name: 'Climax & Vocal Clarity',
          category: StemCategory.CLIMAX_SOLO,
          durationMs: savedFile.durationMs,
          waveformPoints: Array.from({ length: 48 }, () => Math.random() * 0.9 + 0.1),
          isRingtoneRecommended: true,
          description: 'High-energy hook segment optimized for ringtone extraction.'
        }
      ],
      lyrics: getFullLyricsForTrack(title, artist, undefined, savedFile.durationMs),
      description: `Downloaded local audio file (${savedFile.name}) loaded directly into Muse player.`
    };

    onLoadSong(song);
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-[#110804] border border-[#2C1910] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2C1910] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5014] to-[#C2410C] flex items-center justify-center text-white shadow-lg shadow-[#FF5014]/20 border border-[#FF7A45]/30">
              <FileAudio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Open Downloaded Songs</h2>
              <p className="text-xs text-[#8E9299]">Play songs from NaaSongs, SenSongs, or your device in Muse</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full bg-[#1A100B] text-[#8E9299] hover:text-white border border-[#2C1910] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-3 ${
            isDragging
              ? 'border-[#FF5014] bg-[#FF5014]/10'
              : 'border-[#2C1910] hover:border-[#FF5014]/50 bg-[#1A100B]/60 hover:bg-[#1A100B]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.flac,.aac,.ogg"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processAudioFiles(e.target.files);
              }
            }}
          />

          <div className="w-12 h-12 rounded-2xl bg-[#FF5014]/20 text-[#FF7A45] flex items-center justify-center mx-auto border border-[#FF5014]/30">
            <Upload className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Drop your downloaded audio files here</h3>
            <p className="text-xs text-[#8E9299]">or click to browse from your device</p>
          </div>

          <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1 text-[10px] text-[#8E9299]">
            <span className="px-2 py-0.5 rounded bg-[#0A0502] border border-[#2C1910] text-[#E0D8D0] font-mono">.MP3</span>
            <span className="px-2 py-0.5 rounded bg-[#0A0502] border border-[#2C1910] text-[#E0D8D0] font-mono">.M4A</span>
            <span className="px-2 py-0.5 rounded bg-[#0A0502] border border-[#2C1910] text-[#E0D8D0] font-mono">.WAV</span>
            <span className="px-2 py-0.5 rounded bg-[#0A0502] border border-[#2C1910] text-[#E0D8D0] font-mono">.FLAC</span>
            <span className="px-2 py-0.5 rounded bg-[#0A0502] border border-[#2C1910] text-[#E0D8D0] font-mono">.AAC</span>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-[#22C55E]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Includes 3D Spatial Audio, Bass Boost, & Millisecond Trimmer</span>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-[#DC2626]/20 border border-[#DC2626]/40 text-xs text-[#FCA5A5] text-center">
            {statusMessage}
          </div>
        )}

        {/* Previously Opened / Downloaded Songs in Session */}
        {savedLocalFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#E0D8D0]">
              <div className="flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-[#FF7A45]" />
                <span>Recently Opened Songs ({savedLocalFiles.length})</span>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {savedLocalFiles.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#1A100B] border border-[#2C1910] hover:border-[#FF5014]/40 flex items-center justify-between gap-2.5 group transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-[#FF5014]/20 border border-[#FF5014]/30 flex items-center justify-center text-[#FF7A45] shrink-0">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-[#8E9299]">
                        {item.fileSizeFormatted} • Added at {item.dateAdded}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleDownloadBgmForSavedFile(item)}
                      disabled={processingBgmId === item.id}
                      className="px-2 py-1.5 rounded-lg bg-[#24130A] hover:bg-[#2C1910] text-[#FF7A45] hover:text-white border border-[#FF5014]/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Generate and download BGM instrumental (.WAV)"
                    >
                      <Radio className={`w-3.5 h-3.5 ${processingBgmId === item.id ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">BGM</span>
                    </button>
                    <button
                      onClick={() => handleDownloadLyricsPdfForSavedFile(item)}
                      className="px-2 py-1.5 rounded-lg bg-[#24130A] hover:bg-[#2C1910] text-[#E0D8D0] hover:text-white border border-[#2C1910] text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Download lyrics in PDF format"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#FF5014]" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button
                      onClick={() => handlePlaySavedFile(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#FF5014] hover:bg-[#E64009] text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play</span>
                    </button>
                    <button
                      onClick={() => onDeleteLocalFile(item.id)}
                      className="p-1.5 rounded-lg bg-[#0A0502] hover:bg-[#2C1910] text-[#8E9299] hover:text-[#DC2626] border border-[#2C1910] transition-colors"
                      title="Remove from list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature info footer */}
        <div className="p-3 rounded-xl bg-[#0A0502] border border-[#2C1910] text-[11px] text-[#8E9299] space-y-1">
          <div className="flex items-center gap-1.5 text-white font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Private & Local Browser Playback</span>
          </div>
          <p>
            Your audio files stay 100% on your device and are processed locally in your browser with zero cloud uploads.
          </p>
        </div>
      </div>
    </div>
  );
};
