import { jsPDF } from 'jspdf';
import { Song } from '../types';

/**
 * Generates and triggers the download of a high-quality formatted PDF of the song's full lyrics.
 */
export function generateLyricsPdf(song: Song): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  let currentY = 18;

  // Header Banner
  doc.setFillColor(18, 10, 6); // Dark chocolate theme matching Muse UI
  doc.roundedRect(margin, currentY, contentWidth, 26, 3, 3, 'F');

  // Brand Name
  doc.setTextColor(255, 80, 20); // Accent Orange #FF5014
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('MUSE AUDIO PLAYER', margin + 6, currentY + 8);

  doc.setFontSize(8);
  doc.setTextColor(255, 170, 130);
  doc.setFont('helvetica', 'normal');
  doc.text('DOLBY ATMOS 360 • HIGH FIDELITY 24-BIT 96KHZ LOSSLESS', margin + 6, currentY + 13);

  // Source Portal Tag
  const portalBadge = song.sourcePortal ? `${song.sourcePortal} Master` : 'Dolby Atmos Master';
  doc.setFillColor(255, 80, 20);
  doc.roundedRect(pageWidth - margin - 42, currentY + 5, 36, 6, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(portalBadge.toUpperCase(), pageWidth - margin - 24, currentY + 9.2, { align: 'center' });

  // Song Title & Metadata in Banner
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  const safeTitle = song.title.length > 32 ? song.title.substring(0, 30) + '...' : song.title;
  doc.text(`"${safeTitle}"`, margin + 6, currentY + 21);

  doc.setFontSize(8);
  doc.setTextColor(180, 170, 165);
  doc.setFont('helvetica', 'normal');
  const artistText = `Artist: ${song.artist} | ${song.album || song.movieName || 'Muse Catalog'}`;
  doc.text(artistText.length > 55 ? artistText.substring(0, 52) + '...' : artistText, margin + 60, currentY + 21);

  currentY += 32;

  // Metadata Strip
  doc.setFillColor(245, 240, 235);
  doc.rect(margin, currentY, contentWidth, 9, 'F');
  doc.setDrawColor(220, 210, 200);
  doc.rect(margin, currentY, contentWidth, 9, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 45, 40);
  const metadataStr = `Tempo: ${song.bpm} BPM   •   Key: ${song.key}   •   Format: Dolby Atmos 360 Binaural   •   Stems: Isolated BGM & Vocals Available`;
  doc.text(metadataStr, margin + 4, currentY + 6);

  currentY += 15;

  // Title Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text('FULL SYNCHRONIZED SONG LYRICS & TRANSLATION', margin, currentY);

  currentY += 3;
  doc.setDrawColor(255, 80, 20);
  doc.setLineWidth(0.7);
  doc.line(margin, currentY, margin + 40, currentY);

  currentY += 7;

  // Lyrics Loop
  const lyricsList = song.lyrics && song.lyrics.length > 0 ? song.lyrics : [
    {
      timestampMs: 0,
      text: `Playing ${song.title}`,
      translation: 'Instrumental & Vocal Master in Muse',
      aiNote: 'Dolby Atmos 360 Audio Simulation active.'
    }
  ];

  lyricsList.forEach((lyric, index) => {
    // Check if new page is needed
    if (currentY > pageHeight - 25) {
      doc.addPage();
      currentY = 20;

      // Repeat mini header on subsequent pages
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 80, 20);
      doc.text(`MUSE • ${song.title} (Full Lyrics Continued)`, margin, currentY - 5);
      doc.setDrawColor(230, 220, 215);
      doc.setLineWidth(0.3);
      doc.line(margin, currentY - 3, pageWidth - margin, currentY - 3);
    }

    const seconds = Math.floor(lyric.timestampMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remSec = seconds % 60;
    const timeFormatted = `[${minutes}:${remSec < 10 ? '0' : ''}${remSec}]`;

    // Timestamp badge
    doc.setFillColor(index % 2 === 0 ? 250 : 255, index % 2 === 0 ? 245 : 255, index % 2 === 0 ? 242 : 255);
    doc.roundedRect(margin, currentY - 3, contentWidth, 14, 1.5, 1.5, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 80, 20);
    doc.text(timeFormatted, margin + 2, currentY + 2);

    // Original Lyric Line
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    const splitText = doc.splitTextToSize(lyric.text, contentWidth - 30);
    doc.text(splitText, margin + 18, currentY + 2);

    // English Translation
    let offsetAfterText = (splitText.length - 1) * 4;
    if (lyric.translation) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(110, 100, 95);
      const splitTrans = doc.splitTextToSize(`Meaning: ${lyric.translation}`, contentWidth - 30);
      doc.text(splitTrans, margin + 18, currentY + 6.5 + offsetAfterText);
      offsetAfterText += splitTrans.length * 3.5;
    }

    // AI note or Vocal context
    if (lyric.aiNote) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 90, 40);
      doc.text(`Note: ${lyric.aiNote}`, margin + 18, currentY + 9.5 + offsetAfterText);
      offsetAfterText += 3.5;
    }

    currentY += Math.max(16, 12 + offsetAfterText);
  });

  // Footer on last page
  if (currentY > pageHeight - 15) {
    doc.addPage();
    currentY = 20;
  }

  currentY = pageHeight - 12;
  doc.setDrawColor(220, 215, 210);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY - 3, pageWidth - margin, currentY - 3);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(140, 130, 125);
  doc.text(
    `Exported from Muse High-Fidelity Music Player • Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} • Dolby Atmos 360 Audio`,
    margin,
    currentY + 2
  );
  doc.text('Page 1', pageWidth - margin, currentY + 2, { align: 'right' });

  // Trigger download
  const cleanFilename = `${song.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Lyrics_DolbyAtmos.pdf`;
  doc.save(cleanFilename);
}
