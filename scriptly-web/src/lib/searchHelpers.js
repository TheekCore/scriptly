/**
 * Builds the search_text column string for a note.
 * Formula: title + summary + all headings + all point texts, joined by spaces, lowercase.
 * 
 * @param {string} title - Note title
 * @param {string} summary - Note summary
 * @param {Array<object>} sections - Array of sections [{ heading, points: [{ text }] }]
 * @returns {string} - Clean, lowercase search string
 */
export function buildSearchText(title = "", summary = "", sections = []) {
  const safeTitle = (title || "").trim();
  const safeSummary = (summary || "").trim();

  const headings = [];
  const points = [];

  if (Array.isArray(sections)) {
    for (const section of sections) {
      if (section?.heading) {
        headings.push(section.heading.trim());
      }
      if (Array.isArray(section?.points)) {
        for (const point of section.points) {
          if (point?.text) {
            points.push(point.text.trim());
          }
        }
      }
    }
  }

  const combined = [
    safeTitle,
    safeSummary,
    ...headings,
    ...points,
  ]
    .filter(Boolean)
    .join(" ");

  // Convert to lowercase and normalize multiple spaces into a single space
  return combined.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Filters an array of notes by a keyword query matching against search_text, title, or summary.
 * 
 * @param {Array<object>} notes - Array of note objects
 * @param {string} query - Search term
 * @returns {Array<object>} - Matching notes
 */
export function filterNotesByKeyword(notes = [], query = "") {
  if (!query || !query.trim()) return notes;
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

  return notes.filter((note) => {
    const targetText = [
      note.search_text || "",
      note.title || "",
      note.content?.summary || "",
      note.subject?.name || note.subjects?.name || "",
    ]
      .join(" ")
      .toLowerCase();

    // Must match all query words (AND search logic)
    return terms.every((term) => targetText.includes(term));
  });
}
