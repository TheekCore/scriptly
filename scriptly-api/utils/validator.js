const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB per file
const MAX_FILES = 5;
const MAX_TEXT_LENGTH = 5000;

/**
 * Validates uploaded files and input text.
 * 
 * @param {Array} files - Files received from multer (req.files)
 * @param {string} text - Raw student text input
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateNoteInput(files = [], text = "") {
  const safeFiles = Array.isArray(files) ? files : [];
  const safeText = typeof text === "string" ? text.trim() : "";

  // 1. Must have at least one image or some text
  if (safeFiles.length === 0 && safeText.length === 0) {
    return {
      valid: false,
      error: "Please provide at least one photo or some notes text.",
    };
  }

  // 2. Max 5 files
  if (safeFiles.length > MAX_FILES) {
    return {
      valid: false,
      error: `Too many files. You can upload a maximum of ${MAX_FILES} images.`,
    };
  }

  // 3. File types and sizes
  for (const file of safeFiles) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return {
        valid: false,
        error: `Invalid file type (${file.mimetype}). Allowed types: JPG, PNG, WEBP.`,
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File "${file.originalname || "image"}" exceeds the 8 MB size limit.`,
      };
    }
  }

  // 4. Text length
  if (safeText.length > MAX_TEXT_LENGTH) {
    return {
      valid: false,
      error: `Text is too long (${safeText.length} characters). Maximum allowed is ${MAX_TEXT_LENGTH} characters.`,
    };
  }

  return { valid: true };
}

/**
 * Validates that an object conforms to the expected structured note JSON shape.
 * 
 * @param {any} data - Parsed JSON object from Gemini
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateNoteJsonShape(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }

  // Check title & summary
  if (typeof data.title !== "string" || !data.title.trim()) return false;
  if (typeof data.summary !== "string" || !data.summary.trim()) return false;

  // Check unclear array
  if (!Array.isArray(data.unclear)) return false;

  // Check sections array
  if (!Array.isArray(data.sections) || data.sections.length === 0) return false;

  for (const section of data.sections) {
    if (!section || typeof section !== "object") return false;
    if (typeof section.heading !== "string") return false;
    if (!Array.isArray(section.points)) return false;

    for (const point of section.points) {
      if (!point || typeof point !== "object") return false;
      if (typeof point.text !== "string") return false;
      if (typeof point.ai_added !== "boolean") return false;
    }
  }

  return true;
}
