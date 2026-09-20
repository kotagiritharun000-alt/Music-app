import React, { useRef, useState, useMemo } from 'react';
import {
  HardDrive,
  FolderOpen,
  Smartphone,
  Laptop2,
  Upload,
  Music,
  Play,
  Trash2,
  CheckCircle2,
  Sparkles,
  X,
  Volume2,
  ShieldCheck,
  Download,
  FileText,
  Radio,
  Search,
  RefreshCw,
  Sliders,
  FileAudio,
  Plus
} from 'lucide-react';
import { DeviceTrackRecord } from '../services/deviceMusicStorage';
import {
  scanDirectoryHandle,
  processFilesToDeviceTracks,
  convertDeviceTrackToSong
} from '../services/deviceMusicService';
import { Song } from '../types';
import { generateBgmFromAudioUrl, downloadBlob } from '../audio/bgmAudioGenerator';
import { generateLyricsPdf } from '../utils/lyricsPdfGenerator';
import { getFullLyricsForTrack } from '../data/lyricsDatabase';

interface DeviceMusicHubModalProps {
  deviceTracks: DeviceTrackRecord[];
  currentSongId?: string;
  onSelectSong: (song: Song) => void;
  onAddTracks: (newTracks: DeviceTrackRecord[]) => void;
  onDeleteTrack: (id: string) => void;
  onClearAllTracks: () => void;
  onDismiss: () => void;
}

export const DeviceMusicHubModal: React.FC<DeviceMusicHubModalProps> = ({
  deviceTracks,
  currentSongId,
  onSelectSong,
  onAddTracks,
  onDeleteTrack,
  onClearAllTracks,
  onDismiss
}) => {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFormatFilter, setActiveFormatFilter] = useState<string>('ALL');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingBgmId, setProcessingBgmId] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Available format tags
  const formatBadges = useMemo(() => {
    const formats = new Set<string>();
    deviceTracks.forEach((t) => {
      if (t.format) formats.add(t.format.toUpperCase());
    });
    return Array.from(formats);
  }, [deviceTracks]);

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return deviceTracks.filter((track) => {
      const matchesSearch =
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFormat =
        activeFormatFilter === 'ALL' ||
        track.format.toUpperCase() === activeFormatFilter.toUpperCase();

      return matchesSearch && matchesFormat;
    });
  }, [deviceTracks, searchQuery, activeFormatFilter]);

  // Scan folder via File System Access API (Laptop/PC) or folder input fallback
  const handleScanFolderWithPermission = async () => {
    setIsScanning(true);
    setScanStatus('Waiting for folder selection & permission...');

    try {
      if (typeof window !== 'undefined' && (window as any).showDirectoryPicker) {
        setScanStatus('Scanning audio files in selected folder...');
        const tracks = await scanDirectoryHandle((count, path) => {
          setScanStatus(`Found ${count} tracks in ${path}...`);
        });

        if (tracks.length > 0) {
          onAddTracks(tracks);
          setNoticeMessage(`Successfully scanned ${tracks.length} device songs!`);
          setTimeout(() => setNoticeMessage(null), 4000);
        } else {
          setNoticeMessage('No audio files (.mp3, .wav, .m4a, .flac) found in selected folder.');
          setTimeout(() => setNoticeMessage(null), 4000);
        }
      } else {
        // Fallback for browsers without FSA API
        folderInputRef.current?.click();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Directory scan fallback to input:', err);
        folderInputRef.current?.click();
      }
    } finally {
      setIsScanning(false);
      setScanStatus(null);
    }
  };

  // Process files from file input or drag-drop
  const handleProcessIncomingFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsScanning(true);
    setScanStatus(`Processing ${files.length} audio file(s)...`);

    try {
      const tracks = await processFilesToDeviceTracks(files, (processed, total) => {
        setScanStatus(`Extracting metadata: ${processed} of ${total}...`);
      });

      if (tracks.length > 0) {
        onAddTracks(tracks);
        setNoticeMessage(`Added ${tracks.length} song(s) from your device!`);
        setTimeout(() => setNoticeMessage(null), 4000);
      } else {
        setNoticeMessage('No supported audio files found (.mp3, .wav, .m4a, .flac, .aac, .ogg).');
        setTimeout(() => setNoticeMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error processing files:', err);
      setNoticeMessage('Failed to read some audio files.');
      setTimeout(() => setNoticeMessage(null), 4000);
    } finally {
      setIsScanning(false);
      setScanStatus(null);
    }
  };

  const handlePlayTrack = (track: DeviceTrackRecord) => {
    const song = convertDeviceTrackToSong(track);
    onSelectSong(song);
    onDismiss();
  };

  const handleDownloadBgm = async (track: DeviceTrackRecord) => {
    const url = track.objectUrl || (track.blob ? URL.createObjectURL(track.blob) : '');
    if (!url) return;

    setProcessingBgmId(track.id);
    setNoticeMessage(`Generating 5-stem BGM instrumental for "${track.title}"...`);

    try {
      const result = await generateBgmFromAudioUrl(url);
      const cleanName = track.title.replace(/[^a-zA-Z0-9_-]/g, '_');
      downloadBlob(result.bgmBlob, `${cleanName}_BGM_Instrumental.wav`);
      setNoticeMessage(`Downloaded BGM instrumental for "${track.title}"!`);
      setTimeout(() => setNoticeMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setNoticeMessage('BGM generation error. Try playing the track first.');
      setTimeout(() => setNoticeMessage(null), 3000);
    } finally {
      setProcessingBgmId(null);
    }
  };

  const handleDownloadLyricsPdf = (track: DeviceTrackRecord) => {
    const song = convertDeviceTrackToSong(track);
    generateLyricsPdf(song);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#0B0F19] border border-[#1E293B] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Hidden inputs for folder and multi-file selection */}
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleProcessIncomingFiles(e.target.files);
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.flac,.aac,.ogg,.opus,.wma"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleProcessIncomingFiles(e.target.files);
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
              <HardDrive className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">Device Music Library</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  {deviceTracks.length} {deviceTracks.length === 1 ? 'Track' : 'Tracks'} Visible
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Grant permission to scan music from your laptop, mobile phone, or local folders
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full bg-[#131C2E] text-[#94A3B8] hover:text-white border border-[#1E293B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Permission & Scan Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Laptop / PC: Scan Folder with Permission */}
          <button
            onClick={handleScanFolderWithPermission}
            disabled={isScanning}
            className="p-3.5 rounded-2xl bg-[#131C2E] hover:bg-[#1A263D] border border-emerald-500/40 hover:border-emerald-400 flex items-center gap-3 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Laptop2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Scan Music Folder (Laptop/PC)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  Auto-Scan
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] truncate">
                Select your Music folder to grant permission and scan all subfolders
              </p>
            </div>
          </button>

          {/* Mobile Phone / Files Picker */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="p-3.5 rounded-2xl bg-[#131C2E] hover:bg-[#1A263D] border border-teal-500/40 hover:border-teal-400 flex items-center gap-3 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Select Music (Phone / Files)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
                  Select All
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] truncate">
                Choose audio files from your mobile storage (.mp3, .m4a, .wav, .flac)
              </p>
            </div>
          </button>
        </div>

        {/* Drag & Drop Quick Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleProcessIncomingFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`py-3 px-4 rounded-xl border border-dashed transition-all cursor-pointer flex items-center justify-between gap-3 ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/15'
              : 'border-[#1E293B] hover:border-emerald-500/50 bg-[#0E1524] hover:bg-[#131E33]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-white">
              Drop songs or click here to add more audio files
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8]">
            <span className="px-1.5 py-0.5 rounded bg-[#131C2E] border border-[#1E293B] text-[#CBD5E1]">MP3</span>
            <span className="px-1.5 py-0.5 rounded bg-[#131C2E] border border-[#1E293B] text-[#CBD5E1]">M4A</span>
            <span className="px-1.5 py-0.5 rounded bg-[#131C2E] border border-[#1E293B] text-[#CBD5E1]">WAV</span>
            <span className="px-1.5 py-0.5 rounded bg-[#131C2E] border border-[#1E293B] text-[#CBD5E1]">FLAC</span>
          </div>
        </div>

        {/* Status / Notice Messages */}
        {scanStatus && (
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-xs text-cyan-300 flex items-center justify-center gap-2 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{scanStatus}</span>
          </div>
        )}

        {noticeMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 text-center font-medium">
            {noticeMessage}
          </div>
        )}

        {/* Search & Format Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, artist, or file name..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#131C2E] border border-[#1E293B] text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveFormatFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                activeFormatFilter === 'ALL'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'bg-[#131C2E] text-[#94A3B8] hover:text-white border border-[#1E293B]'
              }`}
            >
              All ({deviceTracks.length})
            </button>
            {formatBadges.map((fmt) => (
              <button
                key={fmt}
                onClick={() => setActiveFormatFilter(fmt)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                  activeFormatFilter === fmt
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-[#131C2E] text-[#94A3B8] hover:text-white border border-[#1E293B]'
                }`}
              >
                {fmt}
              </button>
            ))}

            {deviceTracks.length > 0 && (
              <button
                onClick={onClearAllTracks}
                title="Clear scanned library from browser"
                className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-semibold transition-colors shrink-0 ml-auto sm:ml-2 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-[250px]">
          {deviceTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[#94A3B8] space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#131C2E] border border-[#1E293B] flex items-center justify-center text-emerald-400">
                <FolderOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-sm font-bold text-white">No device songs loaded yet</h3>
                <p className="text-xs text-[#94A3B8]">
                  Click "Scan Music Folder" on your laptop, or "Select Music" on your phone to give permission and see all your local tracks here.
                </p>
              </div>
              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleScanFolderWithPermission}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Grant Permission & Scan</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-[#131C2E] hover:bg-[#1A263D] text-white font-semibold text-xs border border-[#1E293B] flex items-center gap-1.5 transition-all"
                >
                  <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                  <span>Select Audio Files</span>
                </button>
              </div>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[#94A3B8] space-y-2">
              <Search className="w-8 h-8 text-[#64748B]" />
              <p className="text-sm font-semibold text-white">No matching songs found</p>
              <p className="text-xs">Try a different search term or reset format filter.</p>
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isCurrentlyPlaying = currentSongId === track.id;
              const durationMin = Math.floor(track.durationMs / 60000);
              const durationSec = Math.floor((track.durationMs % 60000) / 1000)
                .toString()
                .padStart(2, '0');

              return (
                <div
                  key={track.id}
                  className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                    isCurrentlyPlaying
                      ? 'bg-[#10221A] border-emerald-500 shadow-lg shadow-emerald-500/15'
                      : 'bg-[#101726] hover:bg-[#141E33] border-[#1E293B] hover:border-emerald-500/40'
                  }`}
                >
                  {/* Track Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      onClick={() => handlePlayTrack(track)}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all border ${
                        isCurrentlyPlaying
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30'
                          : 'bg-[#131C2E] text-emerald-400 border-[#1E293B] group-hover:bg-emerald-500 group-hover:text-black group-hover:border-emerald-400'
                      }`}
                    >
                      {isCurrentlyPlaying ? (
                        <Volume2 className="w-5 h-5 animate-pulse" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                          {track.title}
                        </h4>
                        {isCurrentlyPlaying && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-black text-[9px] font-extrabold tracking-wider animate-pulse">
                            PLAYING
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold">
                          {track.format}
                        </span>
                        <span className="text-[10px] text-[#64748B] font-mono">
                          {durationMin}:{durationSec}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                        Artist: <span className="text-[#CBD5E1]">{track.artist}</span> • File: {track.name} ({track.sizeFormatted})
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1E293B]/60">
                    <button
                      onClick={() => handleDownloadBgm(track)}
                      disabled={processingBgmId === track.id}
                      title="Isolate BGM instrumental (.WAV)"
                      className="px-2 py-1.5 rounded-lg bg-[#131C2E] hover:bg-[#1E2A40] text-emerald-400 border border-[#1E293B] text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Radio className={`w-3.5 h-3.5 ${processingBgmId === track.id ? 'animate-spin' : ''}`} />
                      <span className="text-[11px]">BGM</span>
                    </button>

                    <button
                      onClick={() => handleDownloadLyricsPdf(track)}
                      title="Export Lyrics PDF"
                      className="p-1.5 rounded-lg bg-[#131C2E] hover:bg-[#1E2A40] text-[#94A3B8] hover:text-white border border-[#1E293B] transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handlePlayTrack(track)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                        isCurrentlyPlaying
                          ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                          : 'bg-emerald-500/20 hover:bg-emerald-500 hover:text-black text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isCurrentlyPlaying ? 'Now Playing' : 'Play in Muse'}</span>
                    </button>

                    <button
                      onClick={() => onDeleteTrack(track.id)}
                      title="Remove from device music list"
                      className="p-1.5 rounded-lg bg-[#131C2E] hover:bg-red-500/20 text-[#64748B] hover:text-red-400 border border-[#1E293B] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Private local playback. Songs are stored securely in your browser IndexedDB.</span>
          </div>
          <span className="font-mono text-emerald-400">
            {filteredTracks.length} of {deviceTracks.length} tracks shown
          </span>
        </div>
      </div>
    </div>
  );
};
