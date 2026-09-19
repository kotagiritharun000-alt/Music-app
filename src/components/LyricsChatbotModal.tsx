import React, { useState, useRef, useEffect } from 'react';
import { Bot, Download, Send, Sparkles, User, X } from 'lucide-react';
import { ChatMessage, LyricLine, MessageSender, Song } from '../types';

interface LyricsChatbotModalProps {
  currentSong: Song;
  currentLyric?: LyricLine | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onDownloadNotesSheet: () => void;
  onDismiss: () => void;
}

export const LyricsChatbotModal: React.FC<LyricsChatbotModalProps> = ({
  currentSong,
  currentLyric,
  messages,
  onSendMessage,
  onDownloadNotesSheet,
  onDismiss
}) => {
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Explain the hidden metaphors in this song',
    'What is the deeper story and meaning?',
    'Analyze the chord theory and spatial profile',
    'Download Lyric Study Sheet'
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#130905] border border-[#2C1910] rounded-3xl p-5 shadow-2xl space-y-4 flex flex-col h-[85vh] max-h-[700px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2C1910] pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF5014]/15 border border-[#FF5014]/30 flex items-center justify-center text-[#FF5014]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Muse Lyrics Intelligence</h2>
              <p className="text-xs text-[#8E9299]">AI Song Analysis & Study Sheet Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadNotesSheet}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1A100B] hover:bg-[#FF5014]/20 text-[#FF7A45] border border-[#2C1910] hover:border-[#FF5014]/40 text-xs font-semibold transition-all"
              title="Download Comprehensive Study Notes"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Notes</span>
            </button>

            <button
              onClick={onDismiss}
              className="p-1.5 rounded-full bg-[#1A100B] text-[#8E9299] hover:text-white border border-[#2C1910] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Focal Lyric Banner */}
        {currentLyric && (
          <div className="shrink-0 px-3 py-2 rounded-xl bg-[#1A100B] border border-[#FF5014]/20 flex items-center justify-between text-xs">
            <div className="truncate">
              <span className="text-[#8E9299]">Active Verse: </span>
              <span className="font-semibold text-white">"{currentLyric.text}"</span>
            </div>
            <span className="text-[10px] text-[#FF7A45] font-mono shrink-0 ml-2">
              {Math.floor(currentLyric.timestampMs / 1000)}s
            </span>
          </div>
        )}

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.sender === MessageSender.USER;
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#FF5014]/20 border border-[#FF5014]/30 flex items-center justify-center text-[#FF7A45] shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-[#FF5014] text-white rounded-br-none'
                      : 'bg-[#1A100B] border border-[#2C1910] text-[#E0D8D0] rounded-bl-none'
                  }`}
                >
                  {msg.text}

                  {msg.isNotesCard && (
                    <div className="mt-3 pt-2.5 border-t border-[#2C1910] flex justify-end">
                      <button
                        onClick={onDownloadNotesSheet}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5014] text-white text-xs font-bold shadow-md shadow-[#FF5014]/30 hover:brightness-110"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save Notes File (.txt)</span>
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-[#24150D] border border-[#2C1910] flex items-center justify-center text-[#E0D8D0] shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="shrink-0 space-y-1.5 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => onSendMessage(q)}
                className="px-2.5 py-1 rounded-full bg-[#1A100B] hover:bg-[#24150D] text-[#8E9299] hover:text-white border border-[#2C1910] text-[11px] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="shrink-0 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about themes, poetry, chords, or request notes..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#1A100B] border border-[#2C1910] text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF5014]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#FF5014] text-white font-bold text-xs hover:brightness-110 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
