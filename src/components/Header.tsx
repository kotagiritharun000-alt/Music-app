import React from 'react';
import { Layers, Library, Music, Sparkles, FolderOpen, Flame } from 'lucide-react';
import { Song } from '../types';
import { ModernMusicLogo } from './ModernMusicLogo';

interface HeaderProps {
  currentSong: Song;
  isPlaying?: boolean;
  activeView: 'player' | 'library';
  onToggleView: () => void;
  onOpenPrd: () => void;
  onOpenVoiceAssistant: () => void;
  onOpenNaaSongs: () => void;
  onOpenLocalFilePicker: () => void;
  onOpenMobileApk: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSong,
  isPlaying = false,
  activeView,
  onToggleView,
  onOpenPrd,
  onOpenVoiceAssistant,
  onOpenNaaSongs,
  onOpenLocalFilePicker,
  onOpenMobileApk
}) => {
  return (
    <header className="w-full bg-[#130905]/80 backdrop-blur-md border-b border-[#2C1910] sticky top-0 z-40 px-3 sm:px-4 py-2.5 sm:py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Latest Type Modern Music Logo & Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => activeView !== 'player' && onToggleView()}
          title="Return to Player"
        >
          <ModernMusicLogo size="md" isPlaying={isPlaying} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white group-hover:text-[#FF7A45] transition-colors">
                MUSE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                Ad-Free Tier
              </span>
            </div>
            <p className="text-[10px] text-[#8E9299] font-medium tracking-wide">
              Dolby Atmos • NaaSongs & Local Files
            </p>
          </div>
        </div>

        {/* Audio Quality Badges */}
        <div className="hidden md:flex items-center gap-2">
          {currentSong.isDolbyAtmos && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1A100B] border border-[#FF5014]/30 text-[11px] font-semibold text-[#FF7A45]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF5014]" />
              <span>Dolby Atmos 360</span>
            </div>
          )}
          {currentSong.sourcePortal && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1A100B] border border-[#2C1910] text-[11px] font-medium text-[#E0D8D0]">
              <span className="text-[#FF5014] font-bold">{currentSong.sourcePortal}</span>
              <span className="text-[#8E9299]">HD Master</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* NaaSongs & SenSongs Catalog Button */}
          <button
            onClick={onOpenNaaSongs}
            title="Browse Telugu & South Indian Songs from NaaSongs / SenSongs"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#FF5014]/20 to-[#E64009]/10 hover:from-[#FF5014]/30 hover:to-[#E64009]/20 text-[#FF7A45] border border-[#FF5014]/40 text-xs font-bold transition-all shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 text-[#FF5014]" />
            <span className="hidden sm:inline">NaaSongs</span>
            <span className="sm:hidden">Songs</span>
          </button>

          {/* Open Downloaded Songs / Local Audio Button */}
          <button
            onClick={onOpenLocalFilePicker}
            title="Open and play your downloaded songs (.mp3, .m4a, .wav) in Muse"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1A100B] hover:bg-[#24150D] text-[#E0D8D0] hover:text-white border border-[#2C1910] text-xs font-semibold transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#22C55E]" />
            <span className="hidden sm:inline">Open Song</span>
          </button>

          {/* Mobile Access & APK Button */}
          <button
            onClick={onOpenMobileApk}
            title="Install Mobile App / Android APK"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1A100B] hover:bg-[#24150D] text-[#E0D8D0] hover:text-white border border-[#2C1910] text-xs font-semibold transition-colors"
          >
            <span className="text-[#22C55E] font-bold">APK</span>
            <span className="hidden md:inline">/ Phone</span>
          </button>

          {/* Hey Muse Voice Assistant */}
          <button
            onClick={onOpenVoiceAssistant}
            title="Hey Muse Voice Assistant"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5014]/15 hover:bg-[#FF5014]/25 text-[#FF7A45] border border-[#FF5014]/30 text-xs font-semibold transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF5014] animate-ping" />
            <span className="hidden sm:inline">Hey Muse</span>
          </button>

          {/* PRD Spec */}
          <button
            onClick={onOpenPrd}
            title="PRD & Architecture Specifications"
            className="p-2 rounded-lg bg-[#1A100B] hover:bg-[#24150D] text-[#8E9299] hover:text-white border border-[#2C1910] transition-colors"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Library / Player Toggle */}
          <button
            onClick={onToggleView}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              activeView === 'library'
                ? 'bg-[#FF5014] text-white border-[#FF5014] shadow-md shadow-[#FF5014]/25'
                : 'bg-[#1A100B] hover:bg-[#24150D] text-[#E0D8D0] border-[#2C1910]'
            }`}
          >
            {activeView === 'library' ? (
              <>
                <Music className="w-3.5 h-3.5" />
                <span>Player</span>
              </>
            ) : (
              <>
                <Library className="w-3.5 h-3.5" />
                <span>Library</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
