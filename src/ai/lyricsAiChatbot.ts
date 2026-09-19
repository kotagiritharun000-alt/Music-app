import { ChatMessage, LyricLine, MessageSender, Song } from '../types';

export class LyricsAiChatbot {
  private messages: ChatMessage[] = [];
  public onMessagesUpdated?: (messages: ChatMessage[]) => void;

  public initializeForSong(song: Song) {
    const initialIntro = `✨ Welcome to Muse Lyrics Intelligence for **"${song.title}"** by ${song.artist}.

I can break down the hidden metaphors, explain the lyrical meaning verse-by-verse, analyze the vocal harmony techniques, or compile a complete **Downloadable Lyric Notes Sheet**.

What would you like to explore?`;

    this.messages = [
      {
        id: `init_${song.id}`,
        sender: MessageSender.MUSE_AI,
        text: initialIntro,
        timestamp: Date.now()
      }
    ];

    if (this.onMessagesUpdated) {
      this.onMessagesUpdated([...this.messages]);
    }
  }

  public sendMessage(query: string, currentSong: Song, currentLyric?: LyricLine | null) {
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: MessageSender.USER,
      text: query,
      timestamp: Date.now()
    };
    this.messages.push(userMsg);

    const q = query.toLowerCase();
    let reply = '';
    let isNotesCard = false;

    if (q.includes('note') || q.includes('download') || q.includes('sheet') || q.includes('summary')) {
      reply = this.generateLyricsNotesSheet(currentSong);
      isNotesCard = true;
    } else if (q.includes('meaning') || q.includes('theme') || q.includes('story')) {
      reply = this.generateSongMeaning(currentSong);
    } else if (q.includes('metaphor') || q.includes('verse') || q.includes('line')) {
      reply = this.generateMetaphorBreakdown(currentSong, currentLyric);
    } else if (q.includes('chord') || q.includes('harmony') || q.includes('bpm') || q.includes('key')) {
      reply = this.generateMusicTheoryBreakdown(currentSong);
    } else {
      reply = `💡 **Analysis for "${currentSong.title}":**

Regarding "${query}": The track employs a rich blend of ${currentSong.genre} textures with evocative lyrical imagery. Notice how the rhythmic cadence in ${currentSong.key} at ${currentSong.bpm} BPM reinforces the emotional tension between acoustic vulnerability and spatial depth.

You can tap **"Download Lyric Notes"** to export the comprehensive annotated analysis!`;
    }

    const aiMsg: ChatMessage = {
      id: `ai_${Date.now()}`,
      sender: MessageSender.MUSE_AI,
      text: reply,
      timestamp: Date.now(),
      isNotesCard
    };
    this.messages.push(aiMsg);

    if (this.onMessagesUpdated) {
      this.onMessagesUpdated([...this.messages]);
    }
  }

  private generateSongMeaning(song: Song): string {
    return `📜 **Theme & Narrative Meaning for "${song.title}":**

**Core Concept:**
The narrative delves into the dichotomy between digital detachment and intimate emotional resonance.

**Lyrical Highlights:**
- **Verse Progression:** Begins in quiet observation before exploding into atmospheric spatial harmonies during the chorus.
- **Emotional Arc:** The transition from wandering alone to rediscovering a grounding heartbeat.
- **Vocal Production:** Recorded with binaural proximity effect, placing the lead vocal directly in front of the listener's headstage.`;
  }

  private generateMetaphorBreakdown(song: Song, activeLyric?: LyricLine | null): string {
    const focusLine = activeLyric?.text || song.lyrics[0]?.text || 'Echoes in the electric midnight sky';
    return `🔍 **Metaphor & Verse Breakdown:**

**Focal Line:** *"${focusLine}"*

- **Poetic Device:** Synesthesia & Contrast (Audio-Visual mapping).
- **Subtext:** The soundscape uses high-frequency synthesizers to emulate electrical signals that mirror emotional longing.
- **Spatial Dimension:** Notice how this specific verse is panned with wider stereo expansion in Dolby Atmos to signify mental expanse.`;
  }

  private generateMusicTheoryBreakdown(song: Song): string {
    return `🎵 **Music Theory & Spatial Sound Profile:**

- **Key Signature:** ${song.key} (Elicits introspective yet determined emotional tone)
- **Tempo:** ${song.bpm} BPM (Ideal for synchronized heart-rate entrainment)
- **Audio Precision:** Lossless Master (${song.bitDepth}-bit / ${song.sampleRateKhz}kHz)
- **Dolby Atmos Objects:** 12 independent spatialized audio objects across the 3D dome.`;
  }

  public generateLyricsNotesSheet(song: Song): string {
    const lyricsText = song.lyrics
      .map(it => `[${Math.floor(it.timestampMs / 1000)}s] ${it.text} (${it.translation})`)
      .join('\n');

    return `📄 **MUSE AI — COMPREHENSIVE LYRICS & MUSICAL STUDY SHEET**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**Track:** ${song.title}
**Artist:** ${song.artist}
**Album:** ${song.album}
**Master Format:** ${song.isDolbyAtmos ? 'Dolby Atmos Spatial Audio' : 'Stereo'} (${song.bitDepth}b/${song.sampleRateKhz}kHz)
**Tempo / Key:** ${song.bpm} BPM | ${song.key}

**Annotated Lyrics & Timestamps:**
${lyricsText}

**Key Thematic Annotations:**
1. **Primary Motif:** Harmonic synthesis of acoustic warmth and digital horizons.
2. **BGM Stems Available:** ${song.stems.map(s => s.name).join(', ')}
3. **Acoustic Signature:** Engineered for ultra-low latency headphone spatialization and millisecond-accurate ringtone extraction.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Status: Formatted & Ready for One-Tap Export.*`;
  }
}
