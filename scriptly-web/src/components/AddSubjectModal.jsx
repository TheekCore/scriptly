import React, { useState, useEffect } from "react";

// 8 curated student-friendly distinct subject colors
export const SUBJECT_COLORS = [
  { hex: "#4f46e5", label: "Indigo" },
  { hex: "#0284c7", label: "Sky Blue" },
  { hex: "#059669", label: "Emerald" },
  { hex: "#d97706", label: "Amber" },
  { hex: "#e11d48", label: "Rose" },
  { hex: "#7c3aed", label: "Violet" },
  { hex: "#db2777", label: "Pink" },
  { hex: "#0d9488", label: "Teal" },
];

export default function AddSubjectModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[0].hex);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setColor(SUBJECT_COLORS[0].hex);
      setErrorMsg("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg("Please enter a subject name.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg("");
      await onAdd({ name: trimmed, color });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to create subject. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-subject-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3
            id="add-subject-title"
            className="text-lg font-bold text-gray-900 flex items-center space-x-2"
          >
            <span>📚</span>
            <span>Add New Subject</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Subject Name Input */}
          <div>
            <label
              htmlFor="subject-name"
              className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
            >
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              id="subject-name"
              type="text"
              required
              autoFocus
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Software Engineering"
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Color Selection (8 colors) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
              Subject Color
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {SUBJECT_COLORS.map((c) => {
                const isSelected = color === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-indigo-600 scale-105 shadow-sm"
                        : "hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                    aria-label={`Select color ${c.label}`}
                    aria-pressed={isSelected}
                  >
                    {isSelected && (
                      <svg
                        className="w-5 h-5 text-white drop-shadow-sm"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Create Subject</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
