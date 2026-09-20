import React, { useState, useEffect, useRef } from 'react';
import { Download, Music, Play, Pause, Sparkles, X, CheckCircle2, Sliders, Volume2, ShieldCheck, RefreshCw, Radio, Flame, Heart, Mic2, Disc3, Coffee, Zap, Layers, Check } from 'lucide-react';
import { Song, GeneratedBgmItem } from '../types';
import { generateMultipleBgmVariants, downloadBlob } from '../audio/bgmAudioGenerator';

interface BgmGeneratorModalProps {
  currentSong: Song;
  onApplyBgmToPlayer: (bgmUrl: string, bgmBlob: Blob) => void;
  onDismiss: () => void;
}

export const BgmGeneratorModal: React.FC<BgmGeneratorModalProps> = ({
  currentSong,
  onApplyBgmToPlayer,
  onDismiss
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Ready to generate multiple BGM versions from this track.');
  const [vocalCutDepth, setVocalCutDepth] = useState(92); // percentage
  const [generatedBgms, setGeneratedBgms] = useState<GeneratedBgmItem[]>([]);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [appliedBgmId, setAppliedBgmId] = useState<string | null>(null);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Auto-generate on open if not already generated
    handleStartMultiGeneration();

    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.removeAttribute('src');
      }
    };
  }, []);

  const handleStartMultiGeneration = async () => {
    setIsGenerating(true);
    setGenerationProgress(5);
    setStatusMessage('Analyzing audio multi-tracks & stem frequency channels...');

    // Stop currently playing preview if any
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setActivePlayingId(null);
    }

    try {
      const items = await generateMultipleBgmVariants(
        currentSong,
        vocalCutDepth,
        (progress, message) => {
          setGenerationProgress(progress);
          setStatusMessage(message);
        }
      );

      setGeneratedBgms(items);
      setStatusMessage(`Generated ${items.length} custom BGM arrangements ready for download.`);
    } catch (err) {
      console.error('Multi-BGM generation error:', err);
      setStatusMessage('Error during stem processing, please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePlayBgm = (item: GeneratedBgmItem) => {
    if (activePlayingId === item.id) {
      // Pause
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setActivePlayingId(null);
    } else {
      // Play new
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
        audioPlayerRef.current.onended = () => setActivePlayingId(null);
      }
      audioPlayerRef.current.src = item.url;
      audioPlayerRef.current.play().catch(e => console.warn('Preview play error:', e));
      setActivePlayingId(item.id);
    }
  };

  const handleDownloadSingle = (item: GeneratedBgmItem) => {
    const cleanSongTitle = currentSong.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${cleanSongTitle}_${item.styleKey.toUpperCase()}_BGM.wav`;
    downloadBlob(item.blob, filename);
  };

  const handleDownloadAll = () => {
    if (generatedBgms.length === 0) return;
    generatedBgms.forEach((item, index) => {
      setTimeout(() => {
        handleDownloadSingle(item);
      }, index * 400);
    });
  };

  const handleApplyToPlayer = (item: GeneratedBgmItem) => {
    setAppliedBgmId(item.id);
    onApplyBgmToPlayer(item.url, item.blob);
  };

  const getStyleIcon = (key: GeneratedBgmItem['styleKey']) => {
    switch (key) {
      case 'mass_action': return <Flame className="w-4 h-4 text-[#FF5014]" />;
      case 'emotional_melody': return <Heart className="w-4 h-4 text-[#EC4899]" />;
      case 'karaoke': return <Mic2 className="w-4 h-4 text-[#06B6D4]" />;
      case 'trap_bass': return <Disc3 className="w-4 h-4 text-[#8B5CF6]" />;
      case 'lofi_chill': return <Coffee className="w-4 h-4 text-[#10B981]" />;
      case 'teaser_climax': return <Zap className="w-4 h-4 text-[#F59E0B]" />;
      default: return <Music className="w-4 h-4 text-[#FF5014]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-[#120804] border border-[#2C1910] rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1F100A] text-[#8E9299] hover:text-white hover:bg-[#2C1910] transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pr-8 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5014]/15 border border-[#FF5014]/30 flex items-center justify-center shrink-0">
            <Radio className="w-6 h-6 text-[#FF5014]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF5014]/20 text-[#FF7A45] text-[10px] font-bold tracking-wide uppercase border border-[#FF5014]/30">
                Multi-BGM Stem Engine
              </span>
              <span className="text-xs text-[#8E9299] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#FF5014]" />
                Generates 6 Distinct BGM Versions
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
              Multi-BGM & Instrumental Suite
            </h2>
            <p className="text-xs text-[#8E9299]">
              Generate multiple customized BGM variations from <span className="text-[#FF7A45] font-semibold">"{currentSong.title}"</span> — listen to previews and download whichever ones you require.
            </p>
          </div>
        </div>

        {/* Song Info Strip & Strength Controls */}
        <div className="p-3.5 rounded-2xl bg-[#1A0E08] border border-[#2C1910] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#2C1910] shrink-0 border border-[#3A1F13]">
              {currentSong.coverImage ? (
                <img src={currentSong.coverImage} alt={currentSong.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#FF5014]">
                  <Music className="w-5 h-5" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white line-clamp-1">{currentSong.title}</h4>
              <p className="text-xs text-[#8E9299] line-clamp-1">
                {currentSong.artist} • {currentSong.album || currentSong.movieName || 'Muse Audio'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:border-l sm:border-[#2C1910] sm:pl-4">
            <div className="flex-1 sm:w-44 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white font-medium flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-[#FF5014]" />
                  Vocal Cut: {vocalCutDepth}%
                </span>
                <span className="text-[#8E9299]">{vocalCutDepth > 90 ? 'Max Isolation' : 'Balanced'}</span>
              </div>
              <input
                type="range"
                min="65"
                max="98"
                value={vocalCutDepth}
                onChange={(e) => setVocalCutDepth(Number(e.target.value))}
                className="w-full accent-[#FF5014] cursor-pointer h-1.5 bg-[#2C1910] rounded-lg"
                disabled={isGenerating}
              />
            </div>

            <button
              onClick={handleStartMultiGeneration}
              disabled={isGenerating}
              className="py-2 px-3.5 rounded-xl bg-[#24130A] hover:bg-[#FF5014]/20 border border-[#FF5014]/40 text-[#FF7A45] hover:text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Rendering...' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        {isGenerating && (
          <div className="p-3 rounded-xl bg-[#1F100A] border border-[#FF5014]/30 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#FF7A45] font-semibold flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF5014]" />
                {statusMessage}
              </span>
              <span className="text-[#8E9299] font-mono font-bold">{generationProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#2C1910] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF5014] to-[#FF7A45] rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Multiple BGMs List (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[220px]">
          <div className="flex items-center justify-between text-xs text-[#8E9299] px-1 pb-1">
            <span>Available BGM Variations ({generatedBgms.length})</span>
            {generatedBgms.length > 0 && (
              <button
                onClick={handleDownloadAll}
                className="text-[#FF7A45] hover:text-white font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All 6 BGMs (.WAV)</span>
              </button>
            )}
          </div>

          {generatedBgms.length === 0 && !isGenerating && (
            <div className="p-8 text-center border border-dashed border-[#2C1910] rounded-2xl space-y-3">
              <Music className="w-8 h-8 text-[#FF5014] mx-auto opacity-60" />
              <p className="text-sm text-[#8E9299]">
                Click below to generate all 6 custom BGM mixes for this track.
              </p>
              <button
                onClick={handleStartMultiGeneration}
                className="px-5 py-2.5 rounded-xl bg-[#FF5014] hover:bg-[#FF6530] text-white font-bold text-xs inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Multiple BGMs</span>
              </button>
            </div>
          )}

          {generatedBgms.map((item) => {
            const isPlayingThis = activePlayingId === item.id;
            const isAppliedThis = appliedBgmId === item.id;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isPlayingThis
                    ? 'bg-[#22120A] border-[#FF5014] shadow-lg shadow-[#FF5014]/10'
                    : 'bg-[#180C07] border-[#2C1910] hover:border-[#3E2316]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleTogglePlayBgm(item)}
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md mt-0.5"
                      style={{
                        backgroundColor: isPlayingThis ? item.themeColor : '#2A160D',
                        color: isPlayingThis ? '#FFFFFF' : item.themeColor,
                        border: `1px solid ${item.themeColor}55`
                      }}
                      title={isPlayingThis ? 'Pause Preview' : 'Play Preview'}
                    >
                      {isPlayingThis ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1"
                          style={{
                            backgroundColor: `${item.themeColor}15`,
                            color: item.themeColor,
                            borderColor: `${item.themeColor}40`
                          }}
                        >
                          {getStyleIcon(item.styleKey)}
                          {item.badge}
                        </span>
                        <span className="text-[11px] text-[#8E9299] font-mono">
                          {Math.floor(item.durationSec / 60)}:{(item.durationSec % 60).toString().padStart(2, '0')} • {item.bpm} BPM • 24-bit WAV
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1 truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#8E9299] line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
                    {/* Apply to player */}
                    <button
                      onClick={() => handleApplyToPlayer(item)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isAppliedThis
                          ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                          : 'bg-[#24130A] hover:bg-[#2C1910] text-[#8E9299] hover:text-white border-[#2C1910]'
                      }`}
                      title="Set this BGM as current playing track in Muse"
                    >
                      {isAppliedThis ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>Active</span>
                        </>
                      ) : (
                        <span>Apply</span>
                      )}
                    </button>

                    {/* Download single */}
                    <button
                      onClick={() => handleDownloadSingle(item)}
                      className="py-2 px-3.5 rounded-xl bg-[#FF5014] hover:bg-[#FF6530] text-white text-xs font-bold transition-all shadow-md shadow-[#FF5014]/20 flex items-center gap-1.5 active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Animated waveform bar when playing this item */}
                {isPlayingThis && (
                  <div className="mt-3 pt-2 border-t border-[#2C1910] flex items-center gap-2">
                    <span className="text-[10px] text-[#FF7A45] font-bold uppercase tracking-wider animate-pulse">
                      Playing Preview
                    </span>
                    <div className="flex items-center gap-1 flex-1 h-3">
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-[#FF5014] rounded-full animate-pulse"
                          style={{
                            height: `${20 + Math.sin(i * 0.4) * 60 + Math.random() * 20}%`,
                            animationDuration: `${0.3 + (i % 5) * 0.1}s`,
                            opacity: 0.6 + Math.random() * 0.4
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info & Done button */}
        <div className="pt-3 border-t border-[#2C1910] flex items-center justify-between shrink-0 flex-wrap gap-2">
          <p className="text-[11px] text-[#8E9299] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5014]" />
            <span>Lossless WAV format • Preserves 808 bass & spatial Dolby soundstage</span>
          </p>

          <button
            onClick={onDismiss}
            className="px-5 py-2 rounded-xl bg-[#24130A] hover:bg-[#2C1910] text-white text-xs font-bold border border-[#2C1910] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
