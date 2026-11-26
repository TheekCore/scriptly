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
