import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import NoteCard from "../components/NoteCard.jsx";
import { supabase } from "../lib/supabase.js";

export default function SubjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Fetch Subject Info
      const { data: subData, error: subError } = await supabase
        .from("subjects")
        .select("*")
        .eq("id", id)
        .single();

      if (subError) throw subError;
      setSubject(subData);

      // 2. Fetch Notes for this Subject (Newest First)
      const { data: notesData, error: notesError } = await supabase
        .from("notes")
        .select("*")
        .eq("subject_id", id)
        .order("lecture_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (notesError) throw notesError;
      setNotes(notesData || []);
    } catch (err) {
      console.error("Failed to load subject details:", err);
      setError(err.message || "Could not load subject details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchData();
  }, [id, fetchData]);

  // Filter notes in-memory by search query (matching title or summary)
  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = (n.title || "").toLowerCase();
    const summary = (n.content?.summary || "").toLowerCase();
    const searchText = (n.search_text || "").toLowerCase();
    return title.includes(q) || summary.includes(q) || searchText.includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <span>←</span>
            <span>Back to Subjects</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-9 h-9 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-gray-500 font-medium">Loading subject and notes...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto my-8">
            <span className="text-3xl block mb-2">⚠️</span>
            <h2 className="text-base font-bold text-red-900 mb-1">
              Could Not Load Subject
            </h2>
            <p className="text-xs text-red-700 mb-4">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-white border border-red-200 text-red-700 text-sm font-medium rounded-xl hover:bg-red-50"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div>
            {/* Subject Banner */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3.5">
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: subject?.color || "#6366f1" }}
                  aria-hidden="true"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                      {subject?.name}
                    </h1>
                    {subject?.is_favourite && (
                      <span className="text-amber-400 text-lg" title="Favourite subject">
                        ★
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {notes.length} {notes.length === 1 ? "lecture note" : "lecture notes"} saved
                  </p>
                </div>
              </div>

              {/* Action Button: Upload notes */}
              <Link
                to={`/upload?subjectId=${subject?.id}`}
                className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm flex items-center justify-center space-x-2 self-start sm:self-auto"
              >
                <span>📸</span>
                <span>Upload Notes</span>
              </Link>
            </div>

            {/* Filter within Subject Bar */}
            {notes.length > 0 && (
              <div className="mb-6">
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" strokeWidth="2"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"></line>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search within ${subject?.name}...`}
                    className="w-full min-h-[44px] pl-10 pr-9 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Notes Grid or Empty States */}
            {notes.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-3xl p-10 sm:p-14 text-center bg-white/70 shadow-xs max-w-lg mx-auto my-6">
                <span className="text-4xl block mb-3">📝</span>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  No notes uploaded yet
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto mb-6">
                  Snap a photo of your whiteboard notes or type quick keywords. The AI will structure them into a complete lecture note!
                </p>
                <Link
                  to={`/upload?subjectId=${subject?.id}`}
                  className="inline-flex items-center min-h-[44px] px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
                >
                  + Upload first note
                </Link>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md mx-auto my-6 shadow-xs">
                <span className="text-3xl block mb-2">🔍</span>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  No matching notes
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  No notes inside this subject match "<strong>{searchQuery}</strong>".
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-semibold px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    subjectColor={subject?.color || "#6366f1"}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
