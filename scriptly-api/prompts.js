/**
 * Constructs the prompt sent to Google Gemini to structure raw lecture notes.
 * 
 * @param {string} subject - Name of the academic subject (e.g. "Software Engineering")
 * @param {string} text - Raw keyword or lecture text typed by the student
 * @returns {string} - Complete prompt instruction
 */
export function buildNotePrompt(subject, text = "") {
  return `You are a careful university note-taking assistant.
Subject: ${subject || "General"}
The student's rough input is the attached image(s) of handwritten notes and/or this text: """${text || ""}"""
TASK:
1. Read any handwriting carefully. If you cannot read a word, add a short description to "unclear" and do NOT guess it.
2. Write a complete, well-structured lecture note. Keep EVERY point the student wrote.
3. Add missing definitions, explanations and short examples that standard textbooks for this subject agree on.
4. Do NOT invent course-specific facts (dates, marks, lecturer statements, custom formulas).
5. Set "ai_added": true for every point that did not come from the student, otherwise false.
6. Write a summary of 3 to 5 simple sentences.
7. Use simple English. Keep technical terms in English.
Return ONLY valid JSON in exactly this shape, with no extra text:
{"title": string, "summary": string, "sections": [{"heading": string, "points": [{"text": string, "ai_added": boolean}]}], "unclear": [string]}`;
}
