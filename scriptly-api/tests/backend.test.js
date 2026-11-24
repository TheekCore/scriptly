import { describe, it, expect, vi } from "vitest";
import { validateNoteInput, validateNoteJsonShape } from "../utils/validator.js";
import { withRetry } from "../utils/retry.js";
import { buildNotePrompt } from "../prompts.js";

describe("Input Validation (validateNoteInput)", () => {
  it("rejects when both files and text are empty", () => {
    const res = validateNoteInput([], "");
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/at least one photo or some notes/i);
  });

  it("accepts valid text without files", () => {
    const res = validateNoteInput([], "Brief lecture summary of relational algebra");
    expect(res.valid).toBe(true);
  });

  it("rejects text exceeding 5000 characters", () => {
    const longText = "a".repeat(5001);
    const res = validateNoteInput([], longText);
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/maximum allowed is 5000/i);
  });

  it("rejects more than 5 files", () => {
    const fakeFiles = Array(6).fill({
      mimetype: "image/jpeg",
      size: 1024,
      originalname: "note.jpg",
    });
    const res = validateNoteInput(fakeFiles, "");
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/maximum of 5 images/i);
  });

  it("rejects disallowed file mime types (e.g. PDF or GIF)", () => {
    const invalidFiles = [
      { mimetype: "application/pdf", size: 1024, originalname: "notes.pdf" },
    ];
    const res = validateNoteInput(invalidFiles, "");
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/allowed types: JPG, PNG, WEBP/i);
  });

  it("rejects individual files exceeding 8 MB", () => {
    const oversizedFile = [
      {
        mimetype: "image/jpeg",
        size: 9 * 1024 * 1024, // 9 MB
        originalname: "large_whiteboard.jpg",
      },
    ];
    const res = validateNoteInput(oversizedFile, "");
    expect(res.valid).toBe(false);
    expect(res.error).toMatch(/exceeds the 8 MB size limit/i);
  });

  it("accepts valid images under limits", () => {
    const validFiles = [
      { mimetype: "image/jpeg", size: 2 * 1024 * 1024, originalname: "page1.jpg" },
      { mimetype: "image/png", size: 1 * 1024 * 1024, originalname: "page2.png" },
    ];
    const res = validateNoteInput(validFiles, "Keywords here");
    expect(res.valid).toBe(true);
  });
});

describe("JSON Shape Checker (validateNoteJsonShape)", () => {
  it("accepts a perfectly structured note object", () => {
    const validNote = {
      title: "Introduction to Relational Databases",
      summary: "Overview of DBMS concepts, relations, and ACID transactions.",
      sections: [
        {
          heading: "ACID Properties",
          points: [
            { text: "Atomicity ensures all-or-nothing execution.", ai_added: false },
            { text: "Consistency preserves database invariants.", ai_added: true },
          ],
        },
      ],
      unclear: ["indecipherable scribbles on slide 3"],
    };
    expect(validateNoteJsonShape(validNote)).toBe(true);
  });

  it("rejects missing title or empty title", () => {
    const invalid = {
      summary: "Summary text",
      sections: [{ heading: "H1", points: [{ text: "P1", ai_added: false }] }],
      unclear: [],
    };
    expect(validateNoteJsonShape(invalid)).toBe(false);
  });

  it("rejects missing summary", () => {
    const invalid = {
      title: "My Title",
      sections: [{ heading: "H1", points: [{ text: "P1", ai_added: false }] }],
      unclear: [],
    };
    expect(validateNoteJsonShape(invalid)).toBe(false);
  });

  it("rejects missing sections array or empty sections", () => {
    const invalid = {
      title: "My Title",
      summary: "Summary",
      sections: [],
      unclear: [],
    };
    expect(validateNoteJsonShape(invalid)).toBe(false);
  });

  it("rejects points where ai_added is not a boolean", () => {
    const invalid = {
      title: "My Title",
      summary: "Summary",
      sections: [
        {
          heading: "H1",
          points: [{ text: "P1", ai_added: "yes" }], // invalid: string instead of boolean
        },
      ],
      unclear: [],
    };
    expect(validateNoteJsonShape(invalid)).toBe(false);
  });
});

describe("Retry Helper (withRetry)", () => {
  it("resolves immediately if the function succeeds on attempt 0", async () => {
    const mockFn = vi.fn().mockResolvedValue("SUCCESS");
    const result = await withRetry(mockFn, [10, 20]);
    expect(result).toBe("SUCCESS");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("retries and succeeds when failing twice then succeeding on attempt 3", async () => {
    let callCount = 0;
    const flakyFunction = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount < 3) {
        throw new Error(`Temporary AI timeout on attempt ${callCount}`);
      }
      return { title: "Success Note", summary: "Structured successfully" };
    });

    // Use small ms delays for fast unit tests
    const result = await withRetry(flakyFunction, [15, 30]);

    expect(callCount).toBe(3);
    expect(flakyFunction).toHaveBeenCalledTimes(3);
    expect(result.title).toBe("Success Note");
  });

  it("throws the final error if all retry attempts fail", async () => {
    const alwaysFails = vi.fn().mockRejectedValue(new Error("Gemini quota exhausted"));

    await expect(withRetry(alwaysFails, [10, 20])).rejects.toThrow("Gemini quota exhausted");
    expect(alwaysFails).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });
});

describe("Prompt Builder (buildNotePrompt)", () => {
  it("inserts the subject name into the prompt", () => {
    const prompt = buildNotePrompt("Software Engineering TICT3153", "Testing & QA");
    expect(prompt).toContain("Subject: Software Engineering TICT3153");
  });

  it("inserts raw text input into the prompt", () => {
    const prompt = buildNotePrompt("Math", "Matrix multiplication eigenvalues");
    expect(prompt).toContain('"""Matrix multiplication eigenvalues"""');
  });

  it("contains the strict JSON output schema and ai_added instructions", () => {
    const prompt = buildNotePrompt("Computer Networks", "OSI model");
    expect(prompt).toContain('Return ONLY valid JSON in exactly this shape');
    expect(prompt).toContain('"ai_added": true');
    expect(prompt).toContain('{"title": string, "summary": string, "sections":');
    expect(prompt).toContain('"unclear": [string]');
  });
});
