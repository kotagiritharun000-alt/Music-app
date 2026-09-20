import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Film,
  Volume1,
  Radio,
  Sliders,
  CheckCircle2,
  Search,
  Disc
} from 'lucide-react';
import { Song, VoiceAssistantState } from '../types';

interface VoiceAssistantModalProps {
  state: VoiceAssistantState;
  currentSong?: Song;
  isPlaying?: boolean;
  volume?: number;
  onStartListening: () => void;
  onStopListening: () => void;
  onExecuteCommand: (command: string) => void;
  onTogglePlayPause?: () => void;
  onNextSong?: () => void;
  onPreviousSong?: () => void;
  onVolumeChange?: (vol: number) => void;
  onToggleAlwaysListening?: (enabled: boolean) => void;
  isSpeechOutputEnabled?: boolean;
  onToggleSpeechOutput?: (enabled: boolean) => void;
  onDismiss: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  state,
  currentSong,
  isPlaying = false,
  volume = 80,
  onStartListening,
  onStopListening,
  onExecuteCommand,
  onTogglePlayPause,
  onNextSong,
  onPreviousSong,
  onVolumeChange,
  onToggleAlwaysListening,
  isSpeechOutputEnabled = true,
  onToggleSpeechOutput,
  onDismiss
}) => {
  const [manualInput, setManualInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'playback' | 'volume' | 'stream'>('all');

  const playbackCommands = [
    { label: 'Pause Music', cmd: 'pause' },
    { label: 'Resume Playback', cmd: 'play' },
    { label: 'Next Song', cmd: 'next song' },
    { label: 'Previous Song', cmd: 'previous song' },
    { label: 'Restart Track', cmd: 'restart song' }
  ];

  const volumeCommands = [
    { label: 'Increase Volume (+15%)', cmd: 'increase volume' },
    { label: 'Decrease Volume (-15%)', cmd: 'decrease volume' },
    { label: 'Set Volume to 80%', cmd: 'set volume to 80%' },
    { label: 'Set Volume to 100%', cmd: 'set volume to 100%' },
    { label: 'Mute Audio', cmd: 'mute' },
    { label: 'Unmute Audio', cmd: 'unmute' }
  ];

  const streamCommands = [
    { label: '🎬 Play Pushpa 2', cmd: 'play Pushpa 2' },
    { label: '🎬 Play Devara', cmd: 'play Devara' },
    { label: '🎬 Play Tauba Tauba', cmd: 'play Tauba Tauba' },
    { label: '🎵 Play Sid Sriram', cmd: 'play Sid Sriram' },
    { label: '⚡ Open Muse Stream', cmd: 'open muse stream' },
    { label: '✨ Enable Dolby Atmos', cmd: 'enable dolby atmos' }
  ];

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onExecuteCommand(manualInput.trim());
      setManualInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-[#130905] border border-[#2C1910] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2C1910] pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5014] to-[#FF7A45] flex items-center justify-center text-white shadow-md shadow-[#FF5014]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Hey Muse AI Assistant</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#FF5014]/20 text-[#FF7A45] text-[10px] font-bold border border-[#FF5014]/30">
                  Voice Linked
                </span>
              </div>
              <p className="text-[11px] text-[#8E9299]">
                Control playback, volume & stream 80M+ songs with your voice
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full bg-[#1A100B] text-[#8E9299] hover:text-white border border-[#2C1910] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Main Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[300px]">
          {/* NOW PLAYING LINKED STRIP */}
          {currentSong && (
            <div className="p-3 rounded-2xl bg-[#180D07] border border-[#2C1910] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#0A0503] border border-[#2C1910] shrink-0">
                  <img
                    src={currentSong.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                    alt={currentSong.movieName || currentSong.title}
                    className={`w-full h-full object-cover ${isPlaying ? 'scale-105' : 'scale-100'} transition-transform`}
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-[#FF5014]/20 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-[#FF5014] animate-ping" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#FF7A45] uppercase flex items-center gap-1">
                      <Film className="w-3 h-3" /> {currentSong.movieName || currentSong.album}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                    {currentSong.title}
                  </h3>
                  <p className="text-[11px] text-[#8E9299] truncate">
                    {currentSong.artist} • <span className="font-mono text-emerald-400">{volume}% Vol</span>
                  </p>
                </div>
              </div>

              {/* Direct Transport Buttons in Voice Assistant */}
              <div className="flex items-center gap-1 shrink-0">
                {onPreviousSong && (
                  <button
                    onClick={onPreviousSong}
                    className="p-2 rounded-lg bg-[#24130A] hover:bg-[#FF5014]/20 text-[#E0D8D0] hover:text-[#FF7A45] border border-[#2C1910] transition-colors"
                    title="Previous Song"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                )}

                {onTogglePlayPause && (
                  <button
                    onClick={onTogglePlayPause}
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF5014] to-[#FF7A45] flex items-center justify-center text-white shadow-md shadow-[#FF5014]/30 hover:scale-105 active:scale-95 transition-all"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                  </button>
                )}

                {onNextSong && (
                  <button
                    onClick={onNextSong}
                    className="p-2 rounded-lg bg-[#24130A] hover:bg-[#FF5014]/20 text-[#E0D8D0] hover:text-[#FF7A45] border border-[#2C1910] transition-colors"
                    title="Next Song"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Center Glowing Voice Orb */}
          <div className="flex flex-col items-center justify-center py-2 space-y-3">
            <div className="relative flex items-center justify-center">
              {/* Outer Pulsing Wave Rings */}
              <div
                className={`absolute w-32 h-32 rounded-full bg-[#FF5014]/20 transition-transform duration-700 pointer-events-none ${
                  state.isListening ? 'animate-ping' : 'scale-90 opacity-20'
                }`}
              />
              <div
                className={`absolute w-24 h-24 rounded-full bg-gradient-to-r from-[#FF5014]/30 to-[#FF7A45]/30 blur-md pointer-events-none ${
                  state.isListening ? 'animate-pulse' : 'opacity-30'
                }`}
              />

              {/* Microphone Orb Button */}
              <button
                onClick={state.isListening ? onStopListening : onStartListening}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 ${
                  state.isListening
                    ? 'bg-gradient-to-tr from-[#FF453A] to-[#FF5014] scale-105 shadow-[#FF453A]/50 ring-4 ring-[#FF5014]/30'
                    : 'bg-gradient-to-tr from-[#FF5014] to-[#8B3010] hover:scale-105 shadow-[#FF5014]/40'
                }`}
                title={state.isListening ? 'Tap to Stop Listening' : 'Tap to Speak Command'}
              >
                {state.isListening ? (
                  <Mic className="w-9 h-9 animate-pulse" />
                ) : (
                  <MicOff className="w-8 h-8 opacity-90" />
                )}
              </button>
            </div>

            <div className="text-center space-y-0.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF7A45] flex items-center justify-center gap-1.5">
                {state.isListening ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#FF453A] animate-ping" />
                    Listening to your voice...
                  </>
                ) : (
                  'Tap Orb or Say "Hey Muse"'
                )}
              </span>
              <p className="text-xs text-[#8E9299]">
                Try saying: "Next song", "Increase volume", "Pause", or "Play Pushpa 2"
              </p>
            </div>
          </div>

          {/* Assistant Feedback Box */}
          <div className="p-3.5 rounded-2xl bg-[#1A100B] border border-[#2C1910] space-y-2">
            {state.recognizedText && (
              <div className="text-xs text-[#8E9299]">
                <span className="font-semibold text-white">Heard: </span>"{state.recognizedText}"
              </div>
            )}
            <div className="text-xs text-white flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5014] mt-1 shrink-0 animate-pulse" />
              <span className="font-medium">{state.assistantFeedback}</span>
            </div>
          </div>

          {/* Quick Voice Command Chips by Category */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#E0D8D0]">Tap to Test Voice Commands:</span>
              <div className="flex items-center gap-1">
                {(['all', 'playback', 'volume', 'stream'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-colors ${
                      activeCategory === cat
                        ? 'bg-[#FF5014] text-white'
                        : 'bg-[#1A100B] text-[#8E9299] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(activeCategory === 'all' || activeCategory === 'playback') &&
                playbackCommands.map((item) => (
                  <button
                    key={item.cmd}
                    onClick={() => onExecuteCommand(item.cmd)}
                    className="px-2.5 py-1 rounded-xl bg-[#1A100B] hover:bg-[#FF5014]/20 text-[#E0D8D0] hover:text-[#FF7A45] border border-[#2C1910] hover:border-[#FF5014]/40 text-[11px] font-medium transition-all"
                  >
                    {item.label}
                  </button>
                ))}

              {(activeCategory === 'all' || activeCategory === 'volume') &&
                volumeCommands.map((item) => (
                  <button
                    key={item.cmd}
                    onClick={() => onExecuteCommand(item.cmd)}
                    className="px-2.5 py-1 rounded-xl bg-[#1A100B] hover:bg-[#FF5014]/20 text-[#E0D8D0] hover:text-[#FF7A45] border border-[#2C1910] hover:border-[#FF5014]/40 text-[11px] font-medium transition-all"
                  >
                    {item.label}
                  </button>
                ))}

              {(activeCategory === 'all' || activeCategory === 'stream') &&
                streamCommands.map((item) => (
                  <button
                    key={item.cmd}
                    onClick={() => onExecuteCommand(item.cmd)}
                    className="px-2.5 py-1 rounded-xl bg-[#1A100B] hover:bg-[#FF5014]/20 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 text-[11px] font-medium transition-all"
                  >
                    {item.label}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls: Voice Options & Manual Input */}
        <div className="pt-2 border-t border-[#2C1910] space-y-2.5 shrink-0">
          {/* Quick Voice Settings Toggles */}
          <div className="flex items-center justify-between text-xs text-[#8E9299]">
            {onToggleSpeechOutput && (
              <button
                onClick={() => onToggleSpeechOutput(!isSpeechOutputEnabled)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                  isSpeechOutputEnabled
                    ? 'bg-[#FF5014]/15 text-[#FF7A45] border-[#FF5014]/30'
                    : 'bg-[#180D07] text-[#8E9299] border-[#2C1910]'
                }`}
                title="Toggle AI Spoken Speech Output"
              >
                {isSpeechOutputEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#FF5014]" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>AI Voice: {isSpeechOutputEnabled ? 'Spoken' : 'Muted'}</span>
              </button>
            )}

            {onToggleAlwaysListening && (
              <button
                onClick={() => onToggleAlwaysListening(!state.isAlwaysListeningEnabled)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                  state.isAlwaysListeningEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-[#180D07] text-[#8E9299] border-[#2C1910]'
                }`}
                title="Toggle Continuous Hands-free Wake Word Detection"
              >
                <Radio className={`w-3.5 h-3.5 ${state.isAlwaysListeningEnabled ? 'text-emerald-400 animate-pulse' : ''}`} />
                <span>Hands-free Wake Word: {state.isAlwaysListeningEnabled ? 'ON' : 'OFF'}</span>
              </button>
            )}
          </div>

          {/* Manual Input Bar */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Type voice command (e.g., 'next song', 'set volume to 90%', 'play Devara')..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#1A100B] border border-[#2C1910] text-xs text-white placeholder-[#8E9299] focus:outline-none focus:border-[#FF5014]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#FF5014] text-white hover:brightness-110 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#FF5014]/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
