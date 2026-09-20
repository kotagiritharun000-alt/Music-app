import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Sparkles,
  Download,
  Disc,
  X,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Volume2,
  VolumeX,
  Mic,
  Film,
  Loader2,
  Headphones,
  Zap,
  Sliders,
  Layers,
  FileAudio,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Radio,
  ListMusic
} from 'lucide-react';
import {
  searchJioSaavn,
  fetchTrendingPlaylists,
  fetchPlaylistDetails,
  fetchLatestReleases,
  JioSaavnPlaylistMeta,
  JioSaavnPlaylistDetails
} from '../services/jioSaavnService';
import { Song, VoiceAssistantState } from '../types';

interface JioSaavnHubModalProps {
  currentSong?: Song;
  currentSongId?: string;
  isPlaying?: boolean;
  volume?: number;
  onSelectSong: (song: Song, contextQueue?: Song[]) => void;
  onTogglePlayPause?: () => void;
  onNextSong?: () => void;
  onPreviousSong?: () => void;
  onVolumeChange?: (vol: number) => void;
  onOpenVoiceAssistant?: () => void;
  onExecuteVoiceCommand?: (cmd: string) => void;
  voiceState?: VoiceAssistantState;
  onDismiss: () => void;
}

type TabType = 'trending_playlists' | 'latest_releases' | 'search';

const TRENDING_QUERIES = [
  'Pushpa 2',
  'Devara',
  'RRR',
  'Kalki 2898 AD',
  'Animal',
  'Guntur Kaaram',
  'Tauba Tauba',
  'Anirudh Ravichander',
  'Sid Sriram',
  'A.R. Rahman',
  'Thaman S',
  'Aavesham'
];

const LANGUAGE_FILTERS = [
  { id: 'all', label: 'All Languages' },
  { id: 'telugu', label: 'Telugu' },
  { id: 'hindi', label: 'Hindi' },
  { id: 'tamil', label: 'Tamil' },
  { id: 'punjabi', label: 'Punjabi' },
  { id: 'english', label: 'English' }
];

export const JioSaavnHubModal: React.FC<JioSaavnHubModalProps> = ({
  currentSong,
  currentSongId,
  isPlaying = false,
  volume = 80,
  onSelectSong,
  onTogglePlayPause,
  onNextSong,
  onPreviousSong,
  onVolumeChange,
  onOpenVoiceAssistant,
  onExecuteVoiceCommand,
  voiceState,
  onDismiss
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('trending_playlists');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [activeQueryTag, setActiveQueryTag] = useState('Pushpa 2');
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  // Trending Playlists state
  const [playlists, setPlaylists] = useState<JioSaavnPlaylistMeta[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<JioSaavnPlaylistDetails | null>(null);
  const [isLoadingPlaylistSongs, setIsLoadingPlaylistSongs] = useState(false);
  const [playlistSearchFilter, setPlaylistSearchFilter] = useState('');

  // Latest Releases state
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [latestSongs, setLatestSongs] = useState<Song[]>([]);
  const [isLoadingLatest, setIsLoadingLatest] = useState(false);

  // Download feedback
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Voice Search within Muse Stream
  const handleVoiceSearch = () => {
    const win = typeof window !== 'undefined' ? (window as any) : null;
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        const rec = new SpeechRecognitionClass();
        rec.lang = 'en-US';
        rec.interimResults = false;
        rec.onstart = () => setIsVoiceSearching(true);
        rec.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript;
          if (transcript) {
            setSearchQuery(transcript);
            setActiveTab('search');
            setIsSearching(true);
            searchJioSaavn(transcript, true)
              .then((results) => {
                setSearchResults(results);
                setIsSearching(false);
              })
              .catch(() => setIsSearching(false));
          }
        };
        rec.onerror = () => setIsVoiceSearching(false);
        rec.onend = () => setIsVoiceSearching(false);
        rec.start();
      } catch (err) {
        setIsVoiceSearching(false);
        if (onOpenVoiceAssistant) onOpenVoiceAssistant();
      }
    } else if (onOpenVoiceAssistant) {
      onOpenVoiceAssistant();
    }
  };

  // 1. Initial Load of Trending Playlists
  useEffect(() => {
    let isMounted = true;
    const loadPlaylists = async () => {
      setIsLoadingPlaylists(true);
      try {
        const list = await fetchTrendingPlaylists();
        if (isMounted) {
          setPlaylists(list);
        }
      } catch (err) {
        console.warn('Failed to load trending playlists:', err);
      } finally {
        if (isMounted) setIsLoadingPlaylists(false);
      }
    };
    loadPlaylists();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Load Latest Releases when activeTab is latest_releases or language changes
  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'latest_releases' && latestSongs.length === 0) {
      const loadReleases = async () => {
        setIsLoadingLatest(true);
        try {
          const songs = await fetchLatestReleases(selectedLanguage);
          if (isMounted) {
            setLatestSongs(songs);
          }
        } catch (err) {
          console.warn('Failed to load latest releases:', err);
        } finally {
          if (isMounted) setIsLoadingLatest(false);
        }
      };
      loadReleases();
    }
    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedLanguage, latestSongs.length]);

  // Handle language filter change for latest releases
  const handleSelectLanguage = async (langId: string) => {
    setSelectedLanguage(langId);
    setIsLoadingLatest(true);
    try {
      const songs = await fetchLatestReleases(langId);
      setLatestSongs(songs);
    } catch (err) {
      console.warn('Failed to fetch latest releases for language:', err);
    } finally {
      setIsLoadingLatest(false);
    }
  };

  // Open a Trending Playlist to view and play songs
  const handleOpenPlaylist = async (playlist: JioSaavnPlaylistMeta) => {
    setIsLoadingPlaylistSongs(true);
    setSelectedPlaylist({
      id: playlist.id,
      title: playlist.title,
      subtitle: playlist.subtitle,
      image: playlist.image,
      songs: []
    });

    try {
      const details = await fetchPlaylistDetails(playlist.id);
      if (details) {
        setSelectedPlaylist(details);
      }
    } catch (err) {
      console.warn('Error loading playlist details:', err);
    } finally {
      setIsLoadingPlaylistSongs(false);
    }
  };

  // Search handler
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim() || activeQueryTag;
    if (!q) return;

    setIsSearching(true);
    try {
      const results = await searchJioSaavn(q, true);
      setSearchResults(results);
    } catch (err) {
      console.warn('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectQueryTag = async (tag: string) => {
    setActiveQueryTag(tag);
    setSearchQuery(tag);
    setIsSearching(true);
    try {
      const results = await searchJioSaavn(tag, true);
      setSearchResults(results);
    } catch (err) {
      console.warn('Tag search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlaySong = (song: Song) => {
    let queue: Song[] | undefined = undefined;
    if (selectedPlaylist && selectedPlaylist.songs.length > 0) {
      queue = selectedPlaylist.songs;
    } else if (searchResults.length > 0) {
      queue = searchResults;
    } else if (latestSongs.length > 0) {
      queue = latestSongs;
    }
    onSelectSong(song, queue);
    onDismiss();
  };

  const handlePlayAllFromPlaylist = () => {
    if (selectedPlaylist && selectedPlaylist.songs.length > 0) {
      onSelectSong(selectedPlaylist.songs[0], selectedPlaylist.songs);
      onDismiss();
    }
  };

  const handleDownloadSong = async (song: Song) => {
    if (!song.audioUrl) return;
    setDownloadSuccess(song.id);

    try {
      const a = document.createElement('a');
      a.href = song.audioUrl;
      a.target = '_blank';
      a.download = `${song.title.replace(/\s+/g, '_')}_[Muse_320Kbps_HD].mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        setDownloadSuccess(null);
      }, 2500);
    } catch (err) {
      console.warn('Download error:', err);
      setDownloadSuccess(null);
    }
  };

  // Filter songs inside the opened playlist
  const filteredPlaylistSongs = useMemo(() => {
    if (!selectedPlaylist) return [];
    if (!playlistSearchFilter.trim()) return selectedPlaylist.songs;
    const q = playlistSearchFilter.toLowerCase();
    return selectedPlaylist.songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        (s.movieName && s.movieName.toLowerCase().includes(q))
    );
  }, [selectedPlaylist, playlistSearchFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#090D16] border border-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#2563EB] flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30 shrink-0">
              <Disc className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Muse Stream Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold border border-cyan-500/30 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> 320 Kbps HD
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                  Dolby Atmos 360
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Stream trending playlists, new releases, and 80M+ tracks with real-time 5-stem isolation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenVoiceAssistant && (
              <button
                onClick={onOpenVoiceAssistant}
                title="Hey Muse Voice Assistant - Speak to control player and search songs"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5014]/20 to-[#FF7A45]/15 hover:from-[#FF5014]/30 hover:to-[#FF7A45]/25 text-[#FF7A45] border border-[#FF5014]/40 text-xs font-bold transition-all shadow-sm group"
              >
                <Mic className="w-3.5 h-3.5 text-[#FF5014] group-hover:scale-110 transition-transform animate-pulse" />
                <span className="hidden sm:inline">Hey Muse AI</span>
              </button>
            )}

            <button
              onClick={onDismiss}
              className="p-1.5 rounded-full bg-[#131C2E] text-[#94A3B8] hover:text-white border border-[#1E293B] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex items-center gap-2 bg-[#0D1525] p-1 rounded-2xl border border-[#1E293B]">
          <button
            onClick={() => {
              setActiveTab('trending_playlists');
              setSelectedPlaylist(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'trending_playlists'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#131C2E]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#F97316]" />
            <span>Trending Playlists</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('latest_releases');
              setSelectedPlaylist(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'latest_releases'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#131C2E]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Latest Released Songs</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('search');
              setSelectedPlaylist(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'search'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#131C2E]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search All Songs</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: TRENDING PLAYLISTS */}
        {/* ========================================================================= */}
        {activeTab === 'trending_playlists' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[320px]">
            {selectedPlaylist ? (
              // SUBVIEW: Opened Playlist with Songs
              <div className="space-y-3 animate-in fade-in">
                {/* Playlist Banner Header */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#101C30] via-[#0E1726] to-[#0A101C] border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => setSelectedPlaylist(null)}
                      className="p-2 rounded-xl bg-[#131C2E] text-[#94A3B8] hover:text-white border border-[#1E293B] hover:border-cyan-500/40 transition-colors shrink-0"
                      title="Back to all Trending Playlists"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#070A11] shrink-0 border border-cyan-500/40 shadow-md">
                      <img
                        src={selectedPlaylist.image}
                        alt={selectedPlaylist.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white tracking-wide">
                          {selectedPlaylist.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                          {selectedPlaylist.songs.length} Tracks
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8]">{selectedPlaylist.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={handlePlayAllFromPlaylist}
                      disabled={selectedPlaylist.songs.length === 0}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Top Track</span>
                    </button>
                  </div>
                </div>

                {/* Filter inside Playlist */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={playlistSearchFilter}
                    onChange={(e) => setPlaylistSearchFilter(e.target.value)}
                    placeholder="Filter songs inside this trending playlist..."
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-[#10192A] border border-[#1E293B] text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                {/* Playlist Songs List */}
                {isLoadingPlaylistSongs ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-[#94A3B8] space-y-3">
                    <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
                    <p className="text-xs font-semibold text-white">Loading playlist songs & decrypting streams...</p>
                  </div>
                ) : filteredPlaylistSongs.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#94A3B8]">
                    No matching songs found in this playlist.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPlaylistSongs.map((song, index) => {
                      const isCurrentlyPlaying = currentSongId === song.id;

                      return (
                        <div
                          key={song.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                            isCurrentlyPlaying
                              ? 'bg-[#132238] border-cyan-500 shadow-lg shadow-cyan-500/15'
                              : 'bg-[#10192A] hover:bg-[#15233B] border-[#1E293B] hover:border-cyan-500/40'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="w-5 text-center font-mono text-xs font-bold text-[#64748B] shrink-0">
                              {index + 1}
                            </span>
                            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-[#0A0E17] shrink-0 border border-[#1E293B]">
                              <img
                                src={song.coverImage}
                                alt={song.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                              <div
                                onClick={() => handlePlaySong(song)}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity"
                              >
                                {isCurrentlyPlaying ? (
                                  <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
                                ) : (
                                  <Play className="w-4 h-4 text-white fill-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                )}
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                                  {song.title}
                                </h4>
                                {isCurrentlyPlaying && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-black text-[9px] font-extrabold tracking-wider animate-pulse flex items-center gap-1">
                                    PLAYING
                                  </span>
                                )}
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-semibold">
                                  320 Kbps
                                </span>
                              </div>
                              <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                                <span className="text-cyan-400">{song.album}</span> • {song.artist}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handlePlaySong(song)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                                isCurrentlyPlaying
                                  ? 'bg-emerald-500 text-black shadow-sm'
                                  : 'bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-white border border-cyan-500/40'
                              }`}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span className="hidden sm:inline">
                                {isCurrentlyPlaying ? 'Playing' : 'Play'}
                              </span>
                            </button>

                            {song.audioUrl && (
                              <button
                                onClick={() => handleDownloadSong(song)}
                                title="Download 320 Kbps HD Master Audio"
                                className="p-1.5 rounded-xl bg-[#090D16] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white border border-[#1E293B] transition-colors"
                              >
                                {downloadSuccess === song.id ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              // MAIN VIEW: Grid of Trending Playlists
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#F97316]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Official Muse Top Charts & Trending Playlists
                    </span>
                  </div>
                  <span className="text-[11px] text-[#94A3B8]">Select any playlist to explore songs</span>
                </div>

                {isLoadingPlaylists ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-[#94A3B8] space-y-3">
                    <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
                    <p className="text-xs font-semibold text-white">Loading trending charts from Muse...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        onClick={() => handleOpenPlaylist(playlist)}
                        className="p-3.5 rounded-2xl bg-[#10192A] hover:bg-[#15233B] border border-[#1E293B] hover:border-cyan-500/50 cursor-pointer transition-all shadow-md group flex flex-col justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#0A0E17] shrink-0 border border-[#1E293B] group-hover:border-cyan-500/40">
                            <img
                              src={playlist.image}
                              alt={playlist.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                              <Play className="w-4 h-4 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {playlist.language && (
                                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">
                                  {playlist.language}
                                </span>
                              )}
                              <span className="px-1.5 py-0.2 rounded bg-[#131C2E] text-[#94A3B8] text-[9px] font-mono">
                                {playlist.songCount} Songs
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate mt-1">
                              {playlist.title}
                            </h4>
                            <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                              {playlist.subtitle || 'Muse Editorial'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-cyan-400 group-hover:text-cyan-300">
                          <span className="font-semibold flex items-center gap-1">
                            <Disc className="w-3 h-3 text-cyan-400" />
                            Explore Top 50 Songs
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LATEST RELEASED SONGS */}
        {/* ========================================================================= */}
        {activeTab === 'latest_releases' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[320px]">
            {/* Language Selection Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-[10px] uppercase font-bold text-[#64748B] flex items-center gap-1 shrink-0 mr-1">
                <Radio className="w-3 h-3 text-amber-400" /> Language:
              </span>
              {LANGUAGE_FILTERS.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleSelectLanguage(lang.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 border ${
                    selectedLanguage === lang.id
                      ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-300 border-amber-500/50 shadow-sm'
                      : 'bg-[#131C2E] text-[#94A3B8] border-[#1E293B] hover:text-white hover:border-[#334155]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Latest Songs List */}
            {isLoadingLatest ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-[#94A3B8] space-y-3">
                <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
                <p className="text-xs font-semibold text-white">
                  Loading freshly released songs for {LANGUAGE_FILTERS.find((l) => l.id === selectedLanguage)?.label}...
                </p>
                <p className="text-[11px] text-[#64748B]">Fetching 2026/2025 singles and album tracks</p>
              </div>
            ) : latestSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-[#94A3B8] space-y-2">
                <Calendar className="w-8 h-8 text-amber-400/40" />
                <p className="text-xs font-semibold text-white">No releases found for this filter</p>
                <p className="text-[11px]">Select another language or search directly.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {latestSongs.map((song) => {
                  const isCurrentlyPlaying = currentSongId === song.id;

                  return (
                    <div
                      key={song.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                        isCurrentlyPlaying
                          ? 'bg-[#1D1712] border-amber-500 shadow-lg shadow-amber-500/15'
                          : 'bg-[#10192A] hover:bg-[#15233B] border-[#1E293B] hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#0A0E17] shrink-0 border border-[#1E293B]">
                          <img
                            src={song.coverImage}
                            alt={song.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <div
                            onClick={() => handlePlaySong(song)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity"
                          >
                            {isCurrentlyPlaying ? (
                              <Volume2 className="w-5 h-5 text-amber-400 animate-pulse" />
                            ) : (
                              <Play className="w-5 h-5 text-white fill-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-white truncate">{song.title}</h3>
                            {isCurrentlyPlaying && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-extrabold tracking-wider animate-pulse flex items-center gap-1">
                                PLAYING
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                              {song.year ? `${song.year} RELEASE` : 'NEW'}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-semibold">
                              320 Kbps HD
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-semibold">
                              Dolby Atmos
                            </span>
                          </div>

                          <p className="text-xs text-amber-300/90 font-medium truncate mt-0.5">
                            {song.album} {song.year ? `(${song.year})` : ''}
                          </p>
                          <p className="text-[11px] text-[#94A3B8] truncate">
                            Singers: <span className="text-[#E2E8F0]">{song.artist}</span>
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1E293B]/60">
                        <button
                          onClick={() => handlePlaySong(song)}
                          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            isCurrentlyPlaying
                              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                              : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-white shadow-md shadow-amber-500/20'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isCurrentlyPlaying ? 'Replay in Muse' : 'Play in Muse'}</span>
                        </button>

                        {song.audioUrl && (
                          <button
                            onClick={() => handleDownloadSong(song)}
                            title="Download 320 Kbps HD Master Audio"
                            className="p-2 rounded-xl bg-[#090D16] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white border border-[#1E293B] transition-colors"
                          >
                            {downloadSuccess === song.id ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SEARCH ALL SONGS */}
        {/* ========================================================================= */}
        {activeTab === 'search' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[320px]">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any song, movie, album, or singer (e.g. Pushpa, Devara, RRR, Animal, Anirudh, Sid Sriram)..."
                  className="w-full pl-9 pr-11 py-2.5 rounded-xl bg-[#131C2E] border border-[#1E293B] text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <button
                      type="button"
                      onClick={handleVoiceSearch}
                      title="Speak to Search (Voice Recognition)"
                      className={`p-1 rounded-lg transition-colors ${
                        isVoiceSearching
                          ? 'bg-rose-500/30 text-rose-400 animate-pulse'
                          : 'text-[#94A3B8] hover:text-cyan-400 hover:bg-cyan-500/20'
                      }`}
                    >
                      <Mic className={`w-4 h-4 ${isVoiceSearching ? 'animate-bounce' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>

            {/* Trending Quick Search Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-[10px] uppercase font-bold text-[#64748B] flex items-center gap-1 shrink-0 mr-1">
                <Flame className="w-3 h-3 text-[#F97316]" /> Popular:
              </span>
              {TRENDING_QUERIES.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleSelectQueryTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 border ${
                    activeQueryTag === tag
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-[#131C2E] text-[#94A3B8] border-[#1E293B] hover:text-white hover:border-[#334155]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Results List */}
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-[#94A3B8] space-y-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-sm font-semibold text-white">Searching Muse master database...</p>
                <p className="text-xs text-[#64748B]">Decrypting 320 Kbps stream endpoints and spatial stems</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-[#94A3B8] space-y-2">
                <Disc className="w-10 h-10 text-cyan-500/40 animate-spin" />
                <p className="text-sm font-semibold text-white">Enter a search query</p>
                <p className="text-xs text-[#94A3B8]">
                  Try searching for Pushpa 2, Devara, RRR, Kalki, Anirudh, or Sid Sriram.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {searchResults.map((song) => {
                  const isCurrentlyPlaying = currentSongId === song.id;

                  return (
                    <div
                      key={song.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                        isCurrentlyPlaying
                          ? 'bg-[#132238] border-cyan-500 shadow-lg shadow-cyan-500/15'
                          : 'bg-[#10192A] hover:bg-[#15233B] border-[#1E293B] hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#0A0E17] shrink-0 border border-[#1E293B]">
                          <img
                            src={song.coverImage}
                            alt={song.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <div
                            onClick={() => handlePlaySong(song)}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-opacity"
                          >
                            {isCurrentlyPlaying ? (
                              <Volume2 className="w-5 h-5 text-cyan-400 animate-pulse" />
                            ) : (
                              <Play className="w-5 h-5 text-white fill-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-white truncate">{song.title}</h3>
                            {isCurrentlyPlaying && (
                              <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-black text-[9px] font-extrabold tracking-wider animate-pulse flex items-center gap-1">
                                PLAYING
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold">
                              Muse HD
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-semibold">
                              320 Kbps HD
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-semibold">
                              Dolby Atmos
                            </span>
                          </div>

                          <p className="text-xs text-cyan-400 font-medium truncate mt-0.5">
                            {song.album} {song.year ? `(${song.year})` : ''}
                          </p>
                          <p className="text-[11px] text-[#94A3B8] truncate">
                            Singers: <span className="text-[#E2E8F0]">{song.artist}</span>
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1E293B]/60">
                        <button
                          onClick={() => handlePlaySong(song)}
                          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                            isCurrentlyPlaying
                              ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                              : 'bg-gradient-to-r from-[#06B6D4] to-[#2563EB] hover:brightness-110 text-white shadow-md shadow-cyan-500/20'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isCurrentlyPlaying ? 'Replay in Muse' : 'Play in Muse'}</span>
                        </button>

                        {song.audioUrl && (
                          <button
                            onClick={() => handleDownloadSong(song)}
                            title="Download 320 Kbps HD Master Audio"
                            className="p-2 rounded-xl bg-[#090D16] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white border border-[#1E293B] transition-colors"
                          >
                            {downloadSuccess === song.id ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MUSE STREAM LINKED PLAYER DOCK */}
        {currentSong && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#10192A] via-[#0E1524] to-[#0A0F1B] border border-cyan-500/35 shadow-lg space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-3">
              {/* Song Info & Movie Poster */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-black/50 border border-cyan-500/40 shrink-0 shadow-md">
                  <img
                    src={currentSong.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                    alt={currentSong.movieName || currentSong.title}
                    className={`w-full h-full object-cover ${isPlaying ? 'scale-105' : 'scale-100'} transition-transform`}
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase truncate">
                      🎬 {currentSong.movieName || currentSong.album}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">
                      STREAMING
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {currentSong.title}
                  </h4>
                  <p className="text-[11px] text-[#94A3B8] truncate">
                    {currentSong.artist}
                  </p>
                </div>
              </div>

              {/* Transport buttons: Previous, Play/Pause, Next */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {onPreviousSong && (
                  <button
                    onClick={onPreviousSong}
                    className="p-2 rounded-lg bg-[#142036] hover:bg-cyan-500/20 text-[#94A3B8] hover:text-cyan-300 border border-[#1E293B] transition-colors"
                    title="Previous Song (Voice: 'previous song')"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                )}

                {onTogglePlayPause && (
                  <button
                    onClick={onTogglePlayPause}
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all"
                    title={isPlaying ? 'Pause (Voice: \'pause\')' : 'Play (Voice: \'play\')'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                    )}
                  </button>
                )}

                {onNextSong && (
                  <button
                    onClick={onNextSong}
                    className="p-2 rounded-lg bg-[#142036] hover:bg-cyan-500/20 text-[#94A3B8] hover:text-cyan-300 border border-[#1E293B] transition-colors"
                    title="Next Song (Voice: 'next song')"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                )}

                {/* Volume slider */}
                {onVolumeChange && (
                  <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#1E293B]">
                    <Volume2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => onVolumeChange(Number(e.target.value))}
                      className="w-16 md:w-20 h-1 bg-[#1A253D] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <span className="text-[10px] font-mono text-[#94A3B8] w-7">{volume}%</span>
                  </div>
                )}

                {/* Hey Muse AI voice button */}
                {onOpenVoiceAssistant && (
                  <button
                    onClick={onOpenVoiceAssistant}
                    title="Hey Muse Voice Assistant"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5014]/20 to-[#FF7A45]/20 hover:from-[#FF5014]/30 hover:to-[#FF7A45]/30 text-[#FF7A45] border border-[#FF5014]/40 text-xs font-bold transition-all shadow-sm"
                  >
                    <Mic className="w-3.5 h-3.5 text-[#FF5014] animate-pulse" />
                    <span className="hidden md:inline">Hey Muse</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Voice Command Chips */}
            {onExecuteVoiceCommand && (
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-[10px]">
                <span className="text-[#64748B] font-bold uppercase shrink-0 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#FF5014]" /> Hey Muse AI:
                </span>
                <button
                  onClick={() => onExecuteVoiceCommand('next song')}
                  className="px-2 py-0.5 rounded-lg bg-[#142036] hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 shrink-0 transition-colors"
                >
                  ⏭ Next Song
                </button>
                <button
                  onClick={() => onExecuteVoiceCommand(isPlaying ? 'pause' : 'play')}
                  className="px-2 py-0.5 rounded-lg bg-[#142036] hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 shrink-0 transition-colors"
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button
                  onClick={() => onExecuteVoiceCommand('increase volume')}
                  className="px-2 py-0.5 rounded-lg bg-[#142036] hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 shrink-0 transition-colors"
                >
                  🔊 Volume Up
                </button>
                <button
                  onClick={() => onExecuteVoiceCommand('decrease volume')}
                  className="px-2 py-0.5 rounded-lg bg-[#142036] hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 shrink-0 transition-colors"
                >
                  🔉 Volume Down
                </button>
                <button
                  onClick={() => onExecuteVoiceCommand('play Devara')}
                  className="px-2 py-0.5 rounded-lg bg-[#142036] hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 shrink-0 transition-colors"
                >
                  🎬 Play Devara
                </button>
                <button
                  onClick={() => onExecuteVoiceCommand('play Pushpa 2')}
                  className="px-2 py-0.5 rounded-lg bg-[#142036] hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 shrink-0 transition-colors"
                >
                  🎬 Play Pushpa 2
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feature Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0D1525] p-2 rounded-xl border border-[#1E293B] text-[11px] text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate">Dolby Atmos 360</span>
          </div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">5-Stem Separation</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400 shrink-0" />
            <span className="truncate">Real-time Lyrics</span>
          </div>
          <div className="flex items-center gap-2">
            <FileAudio className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">320 Kbps HD Master</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ad-free high-bitrate streaming with real-time 360 Dolby Atmos & Stem processing</span>
          </div>
          <span className="font-mono text-cyan-400">
            {activeTab === 'trending_playlists'
              ? selectedPlaylist
                ? `${filteredPlaylistSongs.length} tracks in playlist`
                : `${playlists.length} trending playlists`
              : activeTab === 'latest_releases'
              ? `${latestSongs.length} latest releases`
              : `${searchResults.length} tracks found`}
          </span>
        </div>
      </div>
    </div>
  );
};
