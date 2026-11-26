import React from "react";
import { useNavigate } from "react-router-dom";
import { formatDisplayDate } from "../lib/dateHelpers.js";

export default function NoteCard({ note, subjectColor = "#6366f1" }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/notes/${note.id}`);
  };

  const photoCount = Array.isArray(note.image_paths) ? note.image_paths.length : 0;
  const sections = note.content?.sections || [];
  const pointsCount = sections.reduce(
    (acc, sec) => acc + (sec.points?.length || 0),
    0
  );

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between hover:border-gray-300"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Lecture note: ${note.title || "Untitled"}`}
    >
      {/* Top Color Accent Line */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: subjectColor }}
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Date & Photo Badge */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="font-medium text-gray-600">
              📅 {formatDisplayDate(note.lecture_date)}
            </span>
            {photoCount > 0 && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                <span>📷</span>
                <span>{photoCount}</span>
              </span>
            )}
          </div>

          {/* Note Title */}
          <h2 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
            {note.title || "Untitled Lecture Note"}
          </h2>

          {/* Short Summary */}
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {note.content?.summary || "No summary available."}
          </p>
        </div>

        {/* Footer info: sections and points */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>
            {sections.length} {sections.length === 1 ? "section" : "sections"} • {pointsCount} points
          </span>
          <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">
            View Note →
          </span>
        </div>
      </div>
    </div>
  );
}
