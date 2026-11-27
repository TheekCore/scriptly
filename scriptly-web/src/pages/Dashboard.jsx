import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import SubjectCard from "../components/SubjectCard.jsx";
import NoteCard from "../components/NoteCard.jsx";
import AddSubjectModal from "../components/AddSubjectModal.jsx";
import DeleteConfirmModal from "../components/DeleteConfirmModal.jsx";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { sortSubjects, filterSubjects } from "../lib/subjectHelpers.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Global note search toggle state
  const [isNoteSearch, setIsNoteSearch] = useState(false);
  const [noteResults, setNoteResults] = useState([]);
  const [isSearchingNotes, setIsSearchingNotes] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  // Fetch subjects with note counts
  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // Query subjects joined with notes count
      // RLS ensures only this student's rows are returned!
      const { data, error } = await supabase
        .from("subjects")
        .select("*, notes(count)")
        .order("is_favourite", { ascending: false })
        .order("name", { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setErrorMsg(
        err.message || "Failed to load subjects. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSubjects();
    }
  }, [user, fetchSubjects]);

  // Global Note Search: Executes ilike search on search_text in Supabase
  useEffect(() => {
    if (!isNoteSearch) return;

    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) {
      setNoteResults([]);
      setIsSearchingNotes(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingNotes(true);
        // Supabase query using ilike on search_text, joined with subjects table for color & name
        const { data, error } = await supabase
          .from("notes")
          .select("*, subjects(name, color)")
          .ilike("search_text", `%${trimmedQuery}%`)
          .order("lecture_date", { ascending: false });

        if (error) throw error;
        setNoteResults(data || []);
      } catch (err) {
        console.error("Global note search failed:", err);
      } finally {
        setIsSearchingNotes(false);
      }
    }, 200); // 200ms debounce for smooth typing

    return () => clearTimeout(timer);
  }, [searchQuery, isNoteSearch]);

  // Handle adding a new subject
  const handleAddSubject = async ({ name, color }) => {
    const { data, error } = await supabase
      .from("subjects")
      .insert([
        {
          name,
          color,
          user_id: user.id,
        },
      ])
      .select("*, notes(count)")
      .single();

    if (error) throw error;

    // Append new subject and maintain sorting
    setSubjects((prev) => sortSubjects([data, ...prev]));
  };

  // Handle toggling favorite status
  const handleToggleFavorite = async (subjectId, currentStatus) => {
    const nextStatus = !currentStatus;

    // Optimistically update the UI immediately
    setSubjects((prev) =>
      sortSubjects(
        prev.map((s) =>
          s.id === subjectId ? { ...s, is_favourite: nextStatus } : s
        )
      )
    );

    const { error } = await supabase
      .from("subjects")
      .update({ is_favourite: nextStatus })
      .eq("id", subjectId);

    if (error) {
      console.error("Failed to update favorite status:", error);
      fetchSubjects();
    }
  };

  // Handle deleting a subject
  const handleDeleteSubject = async (subjectId) => {
    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", subjectId);

    if (error) throw error;

    // Remove from local state
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
  };

  // Filter and sort displayed subjects
  const filteredSubjects = filterSubjects(sortSubjects(subjects), searchQuery);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar with App title, Search Box, and Search Notes Toggle */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isNoteSearch={isNoteSearch}
        onToggleNoteSearch={() => {
          setIsNoteSearch((prev) => !prev);
          setSearchQuery("");
        }}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Controls: Page Title & Mode Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {isNoteSearch ? "Keyword Note Search" : "My Subjects"}
              </h1>
              {isNoteSearch && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                  Global Search Active
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {isNoteSearch
                ? "Searching across all lecture titles, summaries, and point texts in every subject."
                : "Organize your lecture notes by subject. Favourites are pinned to the top."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {/* Quick Toggle for Note Search */}
            <button
              type="button"
              onClick={() => {
                setIsNoteSearch((prev) => !prev);
                setSearchQuery("");
              }}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors flex items-center space-x-1.5 ${
                isNoteSearch
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-xs"
              }`}
            >
              <span>{isNoteSearch ? "📚 Switch to Subjects" : "🔍 Search Notes"}</span>
            </button>

            <Link
              to="/upload"
              className="min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 transition-colors flex items-center justify-center space-x-1.5"
              aria-label="Upload note"
            >
              <span>📸</span>
              <span>Upload Notes</span>
            </Link>

            {!isNoteSearch && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center space-x-1.5"
                aria-label="Add new subject"
              >
                <span className="text-base leading-none">+</span>
                <span>Add Subject</span>
              </button>
            )}
          </div>
        </div>

        {/* Error State with Retry Button */}
        {errorMsg && (
          <div
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-sm text-red-700"
            role="alert"
          >
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={fetchSubjects}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-red-200 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Retry
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: GLOBAL NOTE SEARCH RESULTS                            */}
        {/* ------------------------------------------------------------- */}
        {isNoteSearch ? (
          <div>
            {!searchQuery.trim() ? (
              /* Prompt user to type search term */
              <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-10 sm:p-14 text-center max-w-lg mx-auto my-8 shadow-xs">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  🔍
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Search all your lecture notes
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto mb-6">
                  Type any keyword (e.g. "dijkstra", "database", "agile", "testing") into the search bar to find matching notes across every subject.
                </p>
              </div>
            ) : isSearchingNotes ? (
              /* Searching Skeleton */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse flex flex-col justify-between h-40"
                  >
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : noteResults.length === 0 ? (
              /* No notes found matching query */
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md mx-auto my-8 shadow-xs">
                <span className="text-3xl block mb-2">🔍</span>
                <h2 className="text-base font-bold text-gray-900 mb-1">
                  No notes found
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  No lecture notes matched "<strong>{searchQuery}</strong>".
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-semibold px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
                >
                  Clear search
                </button>
              </div>
            ) : (
              /* Matching Notes Grid */
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-4">
                  Found {noteResults.length} {noteResults.length === 1 ? "matching note" : "matching notes"} for "{searchQuery}":
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {noteResults.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      subjectName={note.subjects?.name}
                      subjectColor={note.subjects?.color || "#6366f1"}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* VIEW 2: SUBJECTS DASHBOARD (DEFAULT)                          */
          /* ------------------------------------------------------------- */
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse flex flex-col justify-between h-36"
                  >
                    <div className="flex justify-between items-start">
                      <div className="h-5 bg-gray-200 rounded-md w-1/2"></div>
                      <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : subjects.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-10 sm:p-14 text-center max-w-lg mx-auto my-8 shadow-xs">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  📚
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  No subjects yet. Add your first one.
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                  Create subjects like "Software Engineering" or "Mathematics" to keep your lecture notes organized.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  + Add your first subject
                </button>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md mx-auto my-8">
                <span className="text-3xl block mb-2">🔍</span>
                <h2 className="text-base font-bold text-gray-900 mb-1">
                  No subjects found
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  No subjects matched "<strong>{searchQuery}</strong>".
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-semibold px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredSubjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onToggleFavorite={handleToggleFavorite}
                    onDelete={setSubjectToDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Subject Modal */}
      <AddSubjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddSubject}
      />

      {/* Delete Subject Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(subjectToDelete)}
        subject={subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={handleDeleteSubject}
      />
    </div>
  );
}
