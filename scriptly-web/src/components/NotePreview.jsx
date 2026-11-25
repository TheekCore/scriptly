import React from "react";

export default function NotePreview({
  note,
  subjectName,
  lectureDate,
  onSave,
  onBack,
  isSaving = false,
}) {
  if (!note) return null;

  const { title, summary, sections = [], unclear = [] } = note;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs">
            📚 {subjectName || "Subject"}
          </span>
          <span className="text-xs text-indigo-100">
            📅 {lectureDate || "Today"}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {title || "Untitled Lecture Note"}
        </h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Card */}
        {summary && (
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 text-indigo-950">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1 flex items-center space-x-1.5">
              <span>💡</span>
              <span>Lecture Summary</span>
            </h3>
            <p className="text-sm leading-relaxed text-indigo-900">
              {summary}
            </p>
          </div>
        )}

        {/* Legend for AI-Added Points */}
        <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
            AI
          </span>
          <span>
            Highlighted points tagged with <strong>AI</strong> were supplemented from textbook knowledge. Untagged points come directly from your input.
          </span>
        </div>

        {/* Unclear Words Warning Box (if any) */}
        {Array.isArray(unclear) && unclear.length > 0 && (
          <div
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900"
            role="alert"
          >
            <div className="flex items-start space-x-2.5">
              <span className="text-lg">⚠️</span>
              <div className="flex-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                  Unclear Handwriting / Text Flagged by AI
                </h3>
                <p className="text-xs text-amber-700 mb-2">
                  The AI could not decipher the following words or phrases with certainty and did not guess:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-xs font-medium text-amber-900">
                  {unclear.map((item, idx) => (
                    <li key={idx} className="truncate">
                      "{item}"
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Sections and Points */}
        <div className="space-y-6">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="border-t border-gray-100 pt-5 first:border-t-0 first:pt-0">
              <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
                <span>{section.heading}</span>
              </h2>

              <ul className="space-y-2.5">
                {(section.points || []).map((point, pIdx) => (
                  <li
                    key={pIdx}
                    className={`text-sm leading-relaxed p-2.5 rounded-xl border transition-colors ${
                      point.ai_added
                        ? "bg-indigo-50/50 border-indigo-200/80 text-gray-900"
                        : "bg-white border-transparent hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-indigo-500 font-bold mt-0.5">•</span>
                      <span className="flex-1">{point.text}</span>
                      {point.ai_added && (
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 flex-shrink-0"
                          title="Point added by AI to complete textbook definition"
                        >
                          AI
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isSaving}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            ← Back to Input
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Saving Note...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Save Note</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
