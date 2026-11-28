import { jsPDF } from "jspdf";
import { formatDisplayDate } from "./dateHelpers.js";

/**
 * Generates a clean, safe filename for the downloaded PDF.
 * Strips special characters, converts spaces to underscores, and caps at 40 chars.
 * 
 * @param {string} title
 * @returns {string} e.g. "Software_Architecture_Patterns.pdf"
 */
export function generatePdfFilename(title) {
  const cleanTitle = (title || "Lecture_Note")
    .replace(/[^a-zA-Z0-9_\- ]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 40);

  return `${cleanTitle || "Lecture_Note"}.pdf`;
}

/**
 * Generates and downloads a clean, beautifully formatted academic PDF lecture note.
 * Points with ai_added: true are clearly marked with "(AI)" as required by course guidelines.
 * 
 * @param {{
 *   note: object,
 *   subjectName?: string,
 *   subjectColor?: string
 * }} params
 */
export function exportNoteToPdf({ note, subjectName = "General", subjectColor = "#4f46e5" }) {
  if (!note) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper to add a new page with proper header space
  const checkPageBreak = (neededSpace = 15) => {
    if (y + neededSpace > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeaderWatermark();
      return true;
    }
    return false;
  };

  // Light header banner on each page
  const drawHeaderWatermark = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Scriptly • Smart Lecture Notes", margin, 10);
    doc.text(
      `${subjectName} • ${formatDisplayDate(note.lecture_date)}`,
      pageWidth - margin,
      10,
      { align: "right" }
    );
  };

  drawHeaderWatermark();

  // 1. Top Subject & Date Bar
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text(subjectName.toUpperCase(), margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Lecture Date: ${formatDisplayDate(note.lecture_date)}`, pageWidth - margin, y, {
    align: "right",
  });
  y += 6;

  // Accent line
  doc.setDrawColor(220, 225, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // 2. Note Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20, 25, 40);
  const titleLines = doc.splitTextToSize(note.title || "Untitled Lecture Note", contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7 + 4;

  // 3. Summary Box (if present)
  const summary = note.content?.summary;
  if (summary) {
    checkPageBreak(30);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229);
    doc.text("SUMMARY", margin, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(45, 55, 72);

    const summaryLines = doc.splitTextToSize(summary, contentWidth - 8);
    const boxHeight = summaryLines.length * 5 + 6;

    // Draw light background card
    doc.setFillColor(245, 247, 255);
    doc.setDrawColor(220, 225, 245);
    doc.roundedRect(margin, y - 2, contentWidth, boxHeight, 2, 2, "FD");

    doc.text(summaryLines, margin + 4, y + 3);
    y += boxHeight + 8;
  }

  // 4. Sections & Points
  const sections = note.content?.sections || [];
  for (const section of sections) {
    checkPageBreak(20);

    // Section Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 40, 60);

    // Small colored bar before heading
    doc.setFillColor(79, 70, 229);
    doc.rect(margin, y - 4, 2, 5, "F");

    doc.text(section.heading || "Section", margin + 4, y);
    y += 6;

    // Bullet Points
    const points = section.points || [];
    for (const point of points) {
      checkPageBreak(12);

      const isAi = Boolean(point.ai_added);
      const pointText = isAi ? `${point.text} (AI)` : point.text;

      // Bullet dot
      doc.setFillColor(isAi ? 79 : 100, isAi ? 70 : 110, isAi ? 229 : 130);
      doc.circle(margin + 3, y - 1, 0.9, "F");

      // Point text (AI points rendered with subtle indicator)
      doc.setFont("helvetica", isAi ? "italic" : "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(isAi ? 40 : 50, isAi ? 45 : 55, isAi ? 65 : 70);

      const lines = doc.splitTextToSize(pointText, contentWidth - 8);
      doc.text(lines, margin + 7, y);
      y += lines.length * 4.8 + 2;
    }

    y += 4;
  }

  // 5. Unclear Words / Handwriting (if present)
  const unclear = note.content?.unclear || [];
  if (Array.isArray(unclear) && unclear.length > 0) {
    checkPageBreak(25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(180, 83, 9); // Amber
    doc.text("UNCLEAR HANDWRITING (FLAGGED BY AI)", margin, y);
    y += 5;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 53, 15);

    const unclearText = `The AI could not decipher the following phrases with certainty: ${unclear
      .map((w) => `"${w}"`)
      .join(", ")}`;
    const unclearLines = doc.splitTextToSize(unclearText, contentWidth - 8);
    const boxHeight = unclearLines.length * 5 + 6;

    doc.setFillColor(254, 243, 199); // Amber 100
    doc.setDrawColor(251, 191, 36);  // Amber 300
    doc.roundedRect(margin, y - 2, contentWidth, boxHeight, 2, 2, "FD");

    doc.text(unclearLines, margin + 4, y + 3);
    y += boxHeight + 8;
  }

  // 6. Legend at bottom of document
  checkPageBreak(15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "* (AI) denotes concepts, definitions, or textbook examples supplemented by the AI assistant.",
    margin,
    y
  );

  // 7. Page numbering on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages} • Module TICT3153`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  // Save the PDF
  const filename = generatePdfFilename(note.title);
  doc.save(filename);
}
