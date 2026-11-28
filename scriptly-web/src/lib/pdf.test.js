import { describe, it, expect, vi } from "vitest";
import { generatePdfFilename, exportNoteToPdf } from "./pdf.js";

describe("PDF Export Helper (generatePdfFilename)", () => {
  it("converts spaces to underscores and appends .pdf", () => {
    expect(generatePdfFilename("Computer Networks Lecture 1")).toBe(
      "Computer_Networks_Lecture_1.pdf"
    );
  });

  it("removes unsafe characters for file systems", () => {
    expect(generatePdfFilename("OS: Process / Threads & Sync?")).toBe(
      "OS_Process_Threads_Sync.pdf"
    );
  });

  it("caps long titles at 40 characters before extension", () => {
    const veryLongTitle = "A".repeat(80);
    const filename = generatePdfFilename(veryLongTitle);
    expect(filename).toBe(`${"A".repeat(40)}.pdf`);
  });

  it("falls back to Lecture_Note.pdf if title is empty or undefined", () => {
    expect(generatePdfFilename("")).toBe("Lecture_Note.pdf");
    expect(generatePdfFilename(null)).toBe("Lecture_Note.pdf");
    expect(generatePdfFilename(undefined)).toBe("Lecture_Note.pdf");
  });
});

describe("PDF Export Execution (exportNoteToPdf)", () => {
  it("handles null or undefined note safely without throwing", () => {
    expect(() => exportNoteToPdf({ note: null })).not.toThrow();
  });
});
