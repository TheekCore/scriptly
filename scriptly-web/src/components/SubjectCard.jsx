import React from "react";
import { useNavigate } from "react-router-dom";

export default function SubjectCard({ subject, onToggleFavorite, onDelete }) {
  const navigate = useNavigate();

  // Extract note count from Supabase relation or fallback to 0
  const noteCount =
    Array.isArray(subject.notes) && subject.notes.length > 0
      ? subject.notes[0]?.count ?? 0
      : 0;

  const handleCardClick = () => {
    navigate(`/subjects/${subject.id}`);
  };

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
      aria-label={`Subject ${subject.name}, ${noteCount} notes`}
    >
      {/* Top Color Stripe */}
      <div
        className="h-2.5 w-full"
        style={{ backgroundColor: subject.color || "#6366f1" }}
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Header: Name & Star */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span
              className="w-3.5 h-3.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: subject.color || "#6366f1" }}
              aria-hidden="true"
            />
            <h2 className="text-base font-bold text-gray-900 truncate tracking-tight group-hover:text-indigo-600 transition-colors">
              {subject.name}
            </h2>
          </div>

          {/* Star / Favourite button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card navigation
              onToggleFavorite(subject.id, subject.is_favourite);
            }}
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-gray-400 hover:text-amber-500 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            title={
              subject.is_favourite
                ? "Remove from favourites"
                : "Mark as favourite"
            }
            aria-label={
              subject.is_favourite
                ? `Remove ${subject.name} from favourites`
                : `Mark ${subject.name} as favourite`
            }
          >
            <svg
              className={`w-5 h-5 transition-transform active:scale-125 ${
                subject.is_favourite
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300 hover:text-gray-400 fill-none"
              }`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </div>

        {/* Footer: Note count & Delete button */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="inline-flex items-center font-medium bg-gray-50 px-2.5 py-1 rounded-md text-gray-600">
            📝 {noteCount} {noteCount === 1 ? "note" : "notes"}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card navigation
              onDelete(subject);
            }}
            className="min-h-[44px] min-w-[44px] -mr-2 -mb-2 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            title="Delete subject"
            aria-label={`Delete subject ${subject.name}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
