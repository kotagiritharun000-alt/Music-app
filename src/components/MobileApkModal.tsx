import React, { useState } from 'react';
import { Smartphone, Download, QrCode, CheckCircle2, Copy, ExternalLink, ShieldCheck, Terminal, X } from 'lucide-react';
import { ModernMusicLogo } from './ModernMusicLogo';

interface MobileApkModalProps {
  onDismiss: () => void;
}

export const MobileApkModal: React.FC<MobileApkModalProps> = ({ onDismiss }) => {
  const [copied, setCopied] = useState(false);
  const mobileUrl = 'https://ais-pre-3ipowkommdgysaho5woclz-904920973279.asia-southeast1.run.app';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-[#130905] border border-[#2C1910] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2C1910] pb-3">
          <div className="flex items-center gap-3">
            <ModernMusicLogo size="sm" isPlaying={true} />
            <div>
              <h2 className="text-base font-bold text-white">Mobile Access & Android APK</h2>
              <p className="text-xs text-[#8E9299]">Install Muse on phone with official app icon</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full bg-[#1A100B] text-[#8E9299] hover:text-white border border-[#2C1910] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Option 1: Instant Mobile PWA Installation (Recommended) */}
        <div className="p-4 rounded-2xl bg-[#1A100B] border border-[#22C55E]/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#22C55E]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Option 1: Instant Mobile App (PWA - Recommended)</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] text-[9px] font-bold">
              Instant
            </span>
          </div>
          <p className="text-xs text-[#E0D8D0] leading-relaxed">
            You can run Muse directly on your Android phone right now without sideloading or enabling unknown sources:
          </p>

          <ol className="space-y-2 text-xs text-[#8E9299] pl-2 list-decimal list-inside">
            <li>Open the link below on your phone in Chrome or Samsung Internet:</li>
            <div className="p-2.5 rounded-xl bg-[#0A0502] border border-[#2C1910] flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-[#FF7A45] truncate">{mobileUrl}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleCopyUrl}
                  className="px-2.5 py-1 rounded-lg bg-[#1A100B] hover:bg-[#24150D] text-xs text-white border border-[#2C1910] flex items-center gap-1"
                >
                  {copied ? <CheckCircle2 className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={mobileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-[#22C55E] text-black hover:brightness-110"
                  title="Open Mobile URL"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <li>Tap the browser menu (⋮) and select <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.</li>
            <li>Muse will install as a native standalone app icon with full 3D spatial audio, stem mixer, and voice assistant!</li>
          </ol>
        </div>

        {/* Option 2: Native Android APK Build via Capacitor */}
        <div className="p-4 rounded-2xl bg-[#1A100B] border border-[#2C1910] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF7A45]">
              <Terminal className="w-4 h-4" />
              <span>Option 2: Native Android APK Compilation</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#FF5014]/20 text-[#FF7A45] text-[9px] font-bold">
              Standalone APK
            </span>
          </div>
          <p className="text-xs text-[#8E9299] leading-relaxed">
            To generate a standalone <code className="text-white bg-[#0A0502] px-1.5 py-0.5 rounded">.apk</code> installer for manual sideloading or publishing to the Play Store:
          </p>

          <div className="p-3 rounded-xl bg-[#0A0502] border border-[#2C1910] font-mono text-[11px] text-[#22C55E] space-y-1 overflow-x-auto">
            <p># 1. Export repository via Settings -&gt; Export to ZIP / GitHub</p>
            <p># 2. In your local terminal, run Capacitor Android build:</p>
            <p className="text-white">npm install @capacitor/core @capacitor/cli @capacitor/android</p>
            <p className="text-white">npx cap add android</p>
            <p className="text-white">npx cap sync</p>
            <p className="text-white">npx cap build android</p>
            <p className="text-[#8E9299]"># Outputs: android/app/build/outputs/apk/debug/app-debug.apk</p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="w-full py-2.5 rounded-xl bg-[#1A100B] hover:bg-[#24150D] text-[#E0D8D0] font-semibold text-xs border border-[#2C1910] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
