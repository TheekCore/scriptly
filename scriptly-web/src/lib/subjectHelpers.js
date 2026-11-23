/**
 * Sorts subjects so that:
 * 1. Favourites (is_favourite = true) come first.
 * 2. Within each group (favourites and non-favourites), subjects are sorted alphabetically by name.
 * 
 * @param {Array} subjects - List of subject objects
 * @returns {Array} - New sorted array of subjects
 */
export function sortSubjects(subjects = []) {
  return [...subjects].sort((a, b) => {
    // 1. Check favourite status: true before false
    if (a.is_favourite && !b.is_favourite) return -1;
    if (!a.is_favourite && b.is_favourite) return 1;

    // 2. If both have the same favourite status, sort alphabetically by name (case-insensitive)
    const nameA = a.name || "";
    const nameB = b.name || "";
    return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
  });
}

/**
 * Filters subjects matching a keyword search query against subject name.
 * 
 * @param {Array} subjects - List of subject objects
 * @param {string} query - Search term
 * @returns {Array} - Filtered array of subjects
 */
export function filterSubjects(subjects = [], query = "") {
  if (!query || !query.trim()) return subjects;
  const cleanQuery = query.trim().toLowerCase();
  return subjects.filter((subject) =>
    (subject.name || "").toLowerCase().includes(cleanQuery)
  );
}
