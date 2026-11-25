/**
 * Returns today's local date formatted as YYYY-MM-DD for HTML5 date inputs.
 * 
 * @param {Date} date - Optional reference date
 * @returns {string} - "YYYY-MM-DD"
 */
export function getTodayDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats an ISO or YYYY-MM-DD date string into a clean readable date (e.g., "Nov 24, 2026").
 * 
 * @param {string|Date} dateInput - Date string or object
 * @returns {string} - Formatted display string
 */
export function formatDisplayDate(dateInput) {
  if (!dateInput) return "";
  try {
    const date = typeof dateInput === "string" && !dateInput.includes("T")
      ? new Date(`${dateInput}T00:00:00`)
      : new Date(dateInput);

    if (isNaN(date.getTime())) return String(dateInput);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (err) {
    return String(dateInput);
  }
}

/**
 * Returns the weekday index where Monday = 0, ..., Sunday = 6.
 * As defined in the Scriptly database schema.
 * 
 * @param {Date} date - Reference date
 * @returns {number} - 0 to 6
 */
export function getWeekdayNumber(date = new Date()) {
  // getDay() gives Sunday = 0, Monday = 1, ..., Saturday = 6
  // Formula: (getDay() + 6) % 7 maps Monday to 0 and Sunday to 6
  return (date.getDay() + 6) % 7;
}
