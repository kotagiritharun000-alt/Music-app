import { VoiceAction, VoiceAssistantState } from '../types';

// SpeechRecognition type declarations for browser support
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class VoiceAiAssistant {
  private recognition: any = null;
  private isListening: boolean = false;
  private onActionDispatched?: (action: VoiceAction) => void;
  private onStateUpdated?: (state: VoiceAssistantState) => void;
  private isSpeechOutputEnabled: boolean = true;
  private isWakeWordActive: boolean = false;

  private state: VoiceAssistantState = {
    isListening: false,
    isAlwaysListeningEnabled: false,
    isSpeaking: false,
    recognizedText: '',
    assistantFeedback: "Listening for 'Hey Muse' or your command...",
    lastAction: null,
    confidence: 0.95
  };

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.updateState({
            isListening: true,
            assistantFeedback: "Hey Muse is listening..."
          });
        };

        this.recognition.onresult = (event: any) => {
          const results = event.results;
          if (!results || results.length === 0) return;

          const transcript = results[0][0].transcript;
          const isFinal = results[0].isFinal;

          this.updateState({ recognizedText: transcript });

          if (isFinal) {
            this.parseAndExecute(transcript);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition notice:', event.error);
          this.isListening = false;
          this.updateState({
            isListening: false,
            assistantFeedback: event.error === 'not-allowed'
              ? 'Microphone access blocked. Click chips or type commands below.'
              : 'Tap microphone orb or pick a quick command chip.'
          });
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.updateState({ isListening: false });

          // Auto-restart if wake-word / always-listening mode is active
          if (this.state.isAlwaysListeningEnabled && this.isWakeWordActive) {
            setTimeout(() => {
              if (this.state.isAlwaysListeningEnabled) {
                this.startListening();
              }
            }, 800);
          }
        };
      } catch (err) {
        console.warn('Speech recognition could not be initialized:', err);
      }
    }
  }

  public setCallbacks(
    onAction: (action: VoiceAction) => void,
    onState: (state: VoiceAssistantState) => void
  ) {
    this.onActionDispatched = onAction;
    this.onStateUpdated = onState;
    onState(this.state);
  }

  public setSpeechOutput(enabled: boolean) {
    this.isSpeechOutputEnabled = enabled;
  }

  public getSpeechOutput(): boolean {
    return this.isSpeechOutputEnabled;
  }

  public toggleAlwaysListening(enabled: boolean) {
    this.isWakeWordActive = enabled;
    this.updateState({ isAlwaysListeningEnabled: enabled });
    if (enabled && !this.isListening) {
      this.startListening();
    } else if (!enabled && this.isListening) {
      this.stopListening();
    }
  }

  public startListening() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // ignore
      }
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (e) {
        this.updateState({ isListening: true });
      }
    } else {
      this.updateState({
        isListening: true,
        recognizedText: '',
        assistantFeedback: "Web Speech API ready. Speak command or tap chip below..."
      });
      // Emulate listening window timeout if no native mic recognition
      setTimeout(() => {
        if (this.state.isListening && !this.state.recognizedText) {
          this.updateState({
            isListening: false,
            assistantFeedback: "Tap microphone or choose a voice command chip below."
          });
        }
      }, 4000);
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.isListening = false;
    this.updateState({ isListening: false });
  }

  /**
   * Spoken speech output via Web Speech Synthesis API
   */
  public speak(text: string) {
    if (!this.isSpeechOutputEnabled) return;
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        v =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Victoria') ||
            v.name.includes('Karen') ||
            v.name.includes('David'))
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        this.updateState({ isSpeaking: true });
      };
      utterance.onend = () => {
        this.updateState({ isSpeaking: false });
      };
      utterance.onerror = () => {
        this.updateState({ isSpeaking: false });
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis playback error:', err);
    }
  }

  public parseCommand(rawInput: string): VoiceAction {
    const cleanInput = rawInput.trim().toLowerCase();
    const normalized = cleanInput
      .replace(/^hey muse[, ]*/i, '')
      .replace(/^ok muse[, ]*/i, '')
      .replace(/^hi muse[, ]*/i, '')
      .replace(/^muse[, ]*/i, '')
      .replace(/^can you[, ]*/i, '')
      .replace(/^please[, ]*/i, '')
      .trim();

    const text = normalized.length > 0 ? normalized : cleanInput;

    // 1. Explicit Volume 0 - 100
    const volumeMatch = text.match(/(?:volume|sound|level|master)\s*(?:to|at|is|=)?\s*(\d{1,3})%?/);
    if (volumeMatch && volumeMatch[1]) {
      const vol = parseInt(volumeMatch[1], 10);
      if (!isNaN(vol)) {
        return { type: 'SET_VOLUME', targetVolume: Math.max(0, Math.min(100, vol)) };
      }
    }

    // 2. Relative Volume
    if (
      text.includes('volume down') ||
      text.includes('decrease volume') ||
      text.includes('lower volume') ||
      text.includes('turn it down') ||
      text.includes('turn down') ||
      text.includes('quieter') ||
      text.includes('softer') ||
      text.includes('reduce sound')
    ) {
      const numMatch = text.match(/(\d{1,2})/);
      const delta = numMatch ? -parseInt(numMatch[1], 10) : -15;
      return { type: 'ADJUST_VOLUME_RELATIVE', delta };
    }

    if (
      text.includes('volume up') ||
      text.includes('increase volume') ||
      text.includes('raise volume') ||
      text.includes('turn it up') ||
      text.includes('turn up') ||
      text.includes('louder') ||
      text.includes('boost volume') ||
      text.includes('higher sound')
    ) {
      const numMatch = text.match(/(\d{1,2})/);
      const delta = numMatch ? parseInt(numMatch[1], 10) : 15;
      return { type: 'ADJUST_VOLUME_RELATIVE', delta };
    }

    // 3. Mute / Unmute
    if (text === 'unmute' || text.includes('sound on') || text.includes('un-mute')) {
      return { type: 'UNMUTE' };
    }
    if (text === 'mute' || text.includes('silence') || text.includes('mute music') || text.includes('shut up')) {
      return { type: 'MUTE' };
    }

    // 4. Playback Navigation: Next, Previous, Restart
    if (
      text === 'next' ||
      text.includes('next song') ||
      text.includes('next track') ||
      text.includes('skip') ||
      text.includes('skip song') ||
      text.includes('play next') ||
      text.includes('switch song') ||
      text.includes('change song')
    ) {
      return { type: 'NEXT_SONG' };
    }

    if (
      text === 'previous' ||
      text === 'prev' ||
      text.includes('previous song') ||
      text.includes('prev song') ||
      text.includes('previous track') ||
      text.includes('go back') ||
      text.includes('last song') ||
      text.includes('play previous')
    ) {
      return { type: 'PREVIOUS_SONG' };
    }

    if (text.includes('restart') || text.includes('replay') || text.includes('start over') || text.includes('play again')) {
      return { type: 'RESTART_SONG' };
    }

    // 5. Pause / Stop
    if (
      text === 'pause' ||
      text === 'stop' ||
      text.includes('pause song') ||
      text.includes('pause music') ||
      text.includes('stop playing') ||
      text.includes('hold on') ||
      text.includes('freeze')
    ) {
      return { type: 'PAUSE' };
    }

    // 6. Play / Resume
    if (
      text === 'play' ||
      text === 'resume' ||
      text === 'continue' ||
      text === 'start' ||
      text === 'unpause' ||
      text === 'play music' ||
      text.includes('start playing') ||
      text.includes('keep playing')
    ) {
      return { type: 'PLAY' };
    }

    // 7. Muse Stream Navigation
    if (
      text.includes('open muse stream') ||
      text.includes('open stream') ||
      text.includes('muse stream') ||
      text.includes('streaming') ||
      text.includes('trending playlists') ||
      text.includes('browse stream')
    ) {
      return { type: 'OPEN_MUSE_STREAM' };
    }

    // 8. Search & Play on Muse Stream
    if (
      text.startsWith('play ') ||
      text.startsWith('stream ') ||
      text.startsWith('search and play ') ||
      text.startsWith('find and play ') ||
      text.includes('play song ') ||
      text.includes('play track ') ||
      text.includes('search for ')
    ) {
      const query = text
        .replace(/^play song /i, '')
        .replace(/^play track /i, '')
        .replace(/^play /i, '')
        .replace(/^stream /i, '')
        .replace(/^search and play /i, '')
        .replace(/^find and play /i, '')
        .replace(/^search for /i, '')
        .trim();

      if (query.length > 0) {
        return { type: 'SEARCH_AND_PLAY', query };
      }
    }

    // 9. Spatial Audio & Dolby Atmos
    if (text.includes('spatial audio') || text.includes('3d audio') || text.includes('spatial 3d')) {
      const enable = !text.includes('off') && !text.includes('disable') && !text.includes('bypass');
      return { type: 'SET_SPATIAL_AUDIO', enabled: enable };
    }
    if (text.includes('dolby atmos') || text.includes('dolby audio') || text.includes('dolby')) {
      const enable = !text.includes('off') && !text.includes('disable') && !text.includes('bypass');
      return { type: 'SET_DOLBY_ATMOS', enabled: enable };
    }

    // 10. Modals & Audio Tools
    if (text.includes('stem') || text.includes('bgm') || text.includes('isolate vocal') || text.includes('instrumental')) {
      return { type: 'OPEN_STEM_EXTRACTOR' };
    }
    if (text.includes('trim') || text.includes('crop') || text.includes('ringtone') || text.includes('alarm')) {
      return { type: 'OPEN_AUDIO_TRIMMER' };
    }
    if (text.includes('lyrics') || text.includes('words') || text.includes('meaning') || text.includes('sing along')) {
      return { type: 'OPEN_LYRICS_CHAT' };
    }

    return { type: 'GENERAL_INFO', response: `Executing voice command: "${rawInput}"` };
  }

  public parseAndExecute(rawInput: string) {
    const action = this.parseCommand(rawInput);
    const feedback = this.generateFeedback(action);

    this.updateState({
      recognizedText: rawInput,
      assistantFeedback: feedback,
      lastAction: action.type,
      isListening: false
    });

    // Speak audio feedback response aloud
    this.speak(feedback);

    if (this.onActionDispatched) {
      this.onActionDispatched(action);
    }
  }

  public generateFeedback(action: VoiceAction): string {
    switch (action.type) {
      case 'SET_VOLUME':
        return `Adjusted volume to ${action.targetVolume} percent.`;
      case 'ADJUST_VOLUME_RELATIVE':
        return action.delta > 0 ? 'Increasing volume.' : 'Lowering volume.';
      case 'MUTE':
        return 'Audio muted.';
      case 'UNMUTE':
        return 'Audio unmuted.';
      case 'NEXT_SONG':
        return 'Skipping to next track.';
      case 'PREVIOUS_SONG':
        return 'Playing previous track.';
      case 'RESTART_SONG':
        return 'Restarting track from the beginning.';
      case 'PLAY':
        return 'Resuming playback.';
      case 'PAUSE':
        return 'Playback paused.';
      case 'SEARCH_AND_PLAY':
        return `Searching and playing "${action.query}" on Muse Stream.`;
      case 'SET_SPATIAL_AUDIO':
        return action.enabled ? 'Spatial 3D Audio enabled.' : 'Spatial Audio bypassed.';
      case 'SET_DOLBY_ATMOS':
        return action.enabled ? 'Dolby Atmos 360 enabled.' : 'Dolby Atmos bypassed.';
      case 'OPEN_STEM_EXTRACTOR':
        return 'Opening BGM and Stem Studio.';
      case 'OPEN_AUDIO_TRIMMER':
        return 'Opening Ringtone and Audio Trimmer.';
      case 'OPEN_LYRICS_CHAT':
        return 'Opening Muse Lyrics Intelligence.';
      case 'OPEN_MUSE_STREAM':
        return 'Opening Muse Online Streaming Engine.';
      case 'GENERAL_INFO':
        return action.response;
    }
  }

  private updateState(partial: Partial<VoiceAssistantState>) {
    this.state = { ...this.state, ...partial };
    if (this.onStateUpdated) {
      this.onStateUpdated(this.state);
    }
  }
}
