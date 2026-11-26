import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { supabase } from "../lib/supabase.js";
import { formatDisplayDate } from "../lib/dateHelpers.js";
import { buildSearchText } from "../lib/searchHelpers.js";
import { getNoteSignedImageUrls, deleteNoteImages } from "../lib/storageHelpers.js";

export default function NoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [subject, setSubject] = useState(null);
  const [signedImages, setSignedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSections, setEditSections] = useState([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Active enlarged photo preview modal
  const [enlargedPhoto, setEnlargedPhoto] = useState(null);

  const fetchNote = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // 1. Fetch Note from Supabase
      const { data: noteData, error: noteError } = await supabase
        .from("notes")
        .select("*")
        .eq("id", id)
        .single();

      if (noteError) throw noteError;
      setNote(noteData);

      // Initialize edit fields
      setEditTitle(noteData.title || "");
      setEditSections(JSON.parse(JSON.stringify(noteData.content?.sections || [])));

      // 2. Fetch Associated Subject Info
      if (noteData.subject_id) {
        const { data: subData } = await supabase
          .from("subjects")
          .select("*")
          .eq("id", noteData.subject_id)
          .single();
        setSubject(subData);
      }

      // 3. Fetch Signed URLs for Private Storage Photos (if any exist)
      if (Array.isArray(noteData.image_paths) && noteData.image_paths.length > 0) {
        const urls = await getNoteSignedImageUrls(noteData.image_paths, 3600);
        setSignedImages(urls);
      }
    } catch (err) {
      console.error("Failed to load note:", err);
      setErrorMsg(err.message || "Failed to load note.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchNote();
  }, [id, fetchNote]);

  // Start inline editing
  const handleStartEdit = () => {
    setEditTitle(note.title || "");
    setEditSections(JSON.parse(JSON.stringify(note.content?.sections || [])));
    setIsEditing(true);
  };

  // Cancel inline editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(note.title || "");
    setEditSections(JSON.parse(JSON.stringify(note.content?.sections || [])));
  };

  // Modify point text during edit
  const handlePointTextChange = (sectionIdx, pointIdx, newText) => {
    setEditSections((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (updated[sectionIdx]?.points?.[pointIdx]) {
        updated[sectionIdx].points[pointIdx].text = newText;
      }
      return updated;
    });
  };

  // Save edited note to Supabase
  const handleSaveEdit = async () => {
    try {
      setIsSavingEdit(true);

      const updatedContent = {
        ...note.content,
        title: editTitle,
        sections: editSections,
      };

      // Re-compute search_text with edited title and points
      const newSearchText = buildSearchText(
        editTitle,
        note.content?.summary || "",
        editSections
      );

      const { data, error } = await supabase
        .from("notes")
        .update({
          title: editTitle,
          content: updatedContent,
          search_text: newSearchText,
        })
        .eq("id", note.id)
        .select()
        .single();

      if (error) throw error;

      setNote(data);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update note:", err);
      alert(err.message || "Failed to save edits.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete note from Supabase DB and remove photos from storage
  const handleDeleteNote = async () => {
    try {
      setIsDeleting(true);

      // 1. Delete note row from database
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", note.id);

      if (error) throw error;

      // 2. Delete photos from private storage bucket
      if (Array.isArray(note.image_paths) && note.image_paths.length > 0) {
        await deleteNoteImages(note.image_paths);
      }

      // Navigate back to the subject page
      navigate(`/subjects/${note.subject_id}`);
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.message || "Failed to delete note.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-gray-500 font-medium">Loading lecture note...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !note) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
            <span className="text-3xl block mb-2">⚠️</span>
            <h2 className="text-lg font-bold text-red-900 mb-1">
              Could Not Open Note
            </h2>
            <p className="text-xs text-red-700 mb-4">{errorMsg || "Note not found."}</p>
            <Link
              to="/"
              className="inline-block px-4 py-2 bg-white border border-red-200 text-red-700 text-sm font-semibold rounded-xl hover:bg-red-50"
            >
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { content } = note;
  const sections = isEditing ? editSections : content?.sections || [];
  const unclear = content?.unclear || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link
            to={note.subject_id ? `/subjects/${note.subject_id}` : "/"}
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <span>←</span>
            <span>Back to {subject?.name || "Subject"}</span>
          </Link>
        </div>

        {/* Note Article Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 sm:p-8 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: subject?.color || "#ffffff" }}
                />
                <span>{subject?.name || "Subject"}</span>
              </span>
              <span className="text-xs text-indigo-100 font-medium">
                📅 {formatDisplayDate(note.lecture_date)}
              </span>
            </div>

            {/* Editable or Display Title */}
            {isEditing ? (
              <div className="space-y-1">
                <label className="text-xs text-indigo-200 uppercase font-semibold">
                  Edit Note Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xl font-bold bg-white text-gray-900 border-2 border-indigo-300 focus:outline-none focus:ring-2 focus:ring-white"
                  autoFocus
                />
              </div>
            ) : (
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {note.title || "Untitled Lecture Note"}
              </h1>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Top Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      disabled={isSavingEdit}
                      onClick={handleSaveEdit}
                      className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition shadow-sm flex items-center space-x-1.5"
                    >
                      <span>💾</span>
                      <span>{isSavingEdit ? "Saving..." : "Save Changes"}</span>
                    </button>
                    <button
                      type="button"
                      disabled={isSavingEdit}
                      onClick={handleCancelEdit}
                      className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition flex items-center space-x-1.5"
                    >
                      <span>✏️</span>
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => alert("PDF export will be activated in Milestone 8 with custom jsPDF formatting.")}
                      className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 transition flex items-center space-x-1.5"
                      title="Export note as clean PDF"
                    >
                      <span>📄</span>
                      <span>Export PDF</span>
                    </button>
                  </>
                )}
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition flex items-center space-x-1"
                  aria-label="Delete lecture note"
                >
                  <span>🗑️</span>
                  <span>Delete Note</span>
                </button>
              )}
            </div>

            {/* Summary Box */}
            {content?.summary && (
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 text-indigo-950">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1.5 flex items-center space-x-1.5">
                  <span>💡</span>
                  <span>Lecture Summary</span>
                </h3>
                <p className="text-sm leading-relaxed text-indigo-900">
                  {content.summary}
                </p>
              </div>
            )}

            {/* Attached Photos Strip (if student uploaded photos) */}
            {signedImages.length > 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2.5 flex items-center space-x-1.5">
                  <span>📸</span>
                  <span>Original Whiteboard / Class Photos ({signedImages.length})</span>
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {signedImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEnlargedPhoto(img.signedUrl)}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-300 hover:ring-2 hover:ring-indigo-500 transition-all focus:outline-none"
                      title="Click to view full photo"
                    >
                      <img
                        src={img.signedUrl}
                        alt={`Original photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Legend */}
            <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3.5 py-2 rounded-xl">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                AI
              </span>
              <span>
                Highlighted points tagged with <strong>AI</strong> were supplemented from textbook knowledge. Untagged points come directly from your class input.
              </span>
            </div>

            {/* Unclear Words Box (if any) */}
            {Array.isArray(unclear) && unclear.length > 0 && (
              <div
                className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900"
                role="alert"
              >
                <div className="flex items-start space-x-2.5">
                  <span className="text-xl">⚠️</span>
                  <div className="flex-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                      Unclear Handwriting / Text Flagged by AI
                    </h3>
                    <p className="text-xs text-amber-700 mb-2">
                      The AI could not decipher the following words or phrases with certainty and did not guess:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-xs font-medium text-amber-900">
                      {unclear.map((item, idx) => (
                        <li key={idx}>"{item}"</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Sections & Points */}
            <div className="space-y-6">
              {sections.map((section, sIdx) => (
                <div key={sIdx} className="border-t border-gray-100 pt-5 first:border-t-0 first:pt-0">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
                    <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
                    <span>{section.heading}</span>
                  </h2>

                  <ul className="space-y-2.5">
                    {(section.points || []).map((point, pIdx) => (
                      <li
                        key={pIdx}
                        className={`text-sm leading-relaxed p-3 rounded-xl border transition-colors ${
                          point.ai_added
                            ? "bg-indigo-50/50 border-indigo-200/80 text-gray-900"
                            : "bg-white border-transparent hover:bg-gray-50 text-gray-800"
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-gray-400">
                              <span>Point {pIdx + 1}</span>
                              {point.ai_added && (
                                <span className="text-indigo-600 font-bold">(AI Added)</span>
                              )}
                            </div>
                            <textarea
                              rows={2}
                              value={point.text}
                              onChange={(e) =>
                                handlePointTextChange(sIdx, pIdx, e.target.value)
                              }
                              className="w-full p-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        ) : (
                          <div className="flex items-start space-x-2.5">
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
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Note Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <div className="flex items-center space-x-3 text-red-600 mb-3">
              <span className="text-2xl">🗑️</span>
              <h3 className="text-lg font-bold text-gray-900">Delete Lecture Note</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Are you sure you want to delete <strong className="text-gray-900">"{note.title}"</strong>?
            </p>
            <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 mb-5">
              ⚠️ This note and any attached photos in cloud storage will be permanently removed.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteNote}
                className="min-h-[44px] px-5 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {enlargedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setEnlargedPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] p-2 bg-white rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setEnlargedPhoto(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center text-sm"
              aria-label="Close photo"
            >
              ✕
            </button>
            <img
              src={enlargedPhoto}
              alt="Enlarged whiteboard note"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
