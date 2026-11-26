import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import NotePreview from "../components/NotePreview.jsx";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import { resizeImage } from "../lib/imageResize.js";
import { getTodayDateString } from "../lib/dateHelpers.js";
import { buildSearchText } from "../lib/searchHelpers.js";
import { uploadNoteImages } from "../lib/storageHelpers.js";

const MAX_IMAGES = 5;
const MAX_TEXT_LENGTH = 5000;

export default function UploadNote() {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Route preselected subject ID
  const initialSubjectId = searchParams.get("subjectId") || "";

  // Form states
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId);
  const [lectureDate, setLectureDate] = useState(getTodayDateString());
  const [rawText, setRawText] = useState("");
  const [imageFiles, setImageFiles] = useState([]); // Array of { file, previewUrl }
  const [optimizedFiles, setOptimizedFiles] = useState([]); // Array of resized File objects for storage
  
  // Status states
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [aiNoteResult, setAiNoteResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // File input refs
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // 1. Fetch student's subjects on mount
  useEffect(() => {
    async function fetchSubjects() {
      try {
        setIsLoadingSubjects(true);
        const { data, error } = await supabase
          .from("subjects")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        setSubjects(data || []);

        // Preselect subject if provided or fallback to first subject
        if (data && data.length > 0) {
          if (initialSubjectId && data.some((s) => s.id === initialSubjectId)) {
            setSelectedSubjectId(initialSubjectId);
          } else {
            setSelectedSubjectId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load subjects:", err);
      } finally {
        setIsLoadingSubjects(false);
      }
    }

    fetchSubjects();
  }, [initialSubjectId]);

  // Clean up object URLs when images change or component unmounts
  useEffect(() => {
    return () => {
      imageFiles.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [imageFiles]);

  // Add files to state with client-side preview
  const handleAddFiles = (newFiles) => {
    if (!newFiles || newFiles.length === 0) return;
    setErrorMsg("");

    const remainingSlots = MAX_IMAGES - imageFiles.length;
    if (remainingSlots <= 0) {
      setErrorMsg(`You can upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const filesToAdd = Array.from(newFiles).slice(0, remainingSlots);
    const validImageFiles = [];

    for (const file of filesToAdd) {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Only image files (JPG, PNG, WEBP) are supported.");
        continue;
      }
      validImageFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setImageFiles((prev) => [...prev, ...validImageFiles]);
  };

  // Remove an image from the selection
  const handleRemoveImage = (indexToRemove) => {
    setImageFiles((prev) => {
      const removed = prev[indexToRemove];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  };

  // 2. Main handler: Resize images and send to backend AI
  const handleCompleteNote = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedSubjectId) {
      setErrorMsg("Please select a subject for this lecture note.");
      return;
    }

    const trimmedText = rawText.trim();
    if (imageFiles.length === 0 && !trimmedText) {
      setErrorMsg("Please provide at least one photo or some notes text.");
      return;
    }

    const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
    const subjectName = selectedSubject?.name || "General";

    try {
      setIsProcessing(true);

      // Step A: Client-side resize and compress each image
      const resizedFiles = [];
      if (imageFiles.length > 0) {
        setProcessingStatus(`Resizing ${imageFiles.length} ${imageFiles.length === 1 ? "image" : "images"}...`);
        for (let i = 0; i < imageFiles.length; i++) {
          setProcessingStatus(`Optimizing photo ${i + 1} of ${imageFiles.length}...`);
          const resized = await resizeImage(imageFiles[i].file, 1600, 0.85);
          resizedFiles.push(resized);
        }
      }

      // Step B: Send to backend
      setProcessingStatus("Sending to AI assistant for transcription & structuring...");
      const formData = new FormData();
      formData.append("subject", subjectName);
      formData.append("text", trimmedText);
      resizedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const token = session?.access_token;

      if (!token) {
        throw new Error("You must be logged in to generate structured notes.");
      }

      const response = await fetch(`${backendUrl}/api/notes/structure`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Daily AI limit reached (30 requests/day). Please try again tomorrow.");
        }
        throw new Error(responseData.message || "Failed to structure lecture note.");
      }

      // Step C: Successfully received structured note
      setOptimizedFiles(resizedFiles);
      setAiNoteResult(responseData);
    } catch (err) {
      console.error("AI Structuring Error:", err);
      // Crucial requirement: User input (imageFiles and rawText) remains intact!
      setErrorMsg(err.message || "Something went wrong while contacting the AI service. Your inputs have been kept.");
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  // 3. Save Note Handler (Save with images to Supabase Storage & DB)
  const handleSaveNote = async () => {
    if (!aiNoteResult) return;

    try {
      setIsSaving(true);
      setErrorMsg("");

      const title = aiNoteResult.title || "Untitled Note";

      // 1. Upload shrunk images to Supabase Storage 'uploads' bucket
      let uploadedImagePaths = [];
      if (optimizedFiles && optimizedFiles.length > 0) {
        uploadedImagePaths = await uploadNoteImages(session?.user?.id, optimizedFiles);
      }

      // 2. Build search_text using the official formula: title + summary + headings + points lowercase
      const combinedSearchText = buildSearchText(
        title,
        aiNoteResult.summary || "",
        aiNoteResult.sections || []
      );

      // 3. Insert note row into Supabase
      const { data, error } = await supabase
        .from("notes")
        .insert([
          {
            user_id: session?.user?.id,
            subject_id: selectedSubjectId,
            lecture_date: lectureDate,
            title,
            raw_text: rawText,
            content: aiNoteResult,
            search_text: combinedSearchText,
            image_paths: uploadedImagePaths,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Navigate to the note view page
      navigate(`/notes/${data.id}`);
    } catch (saveErr) {
      console.error("Failed to save note:", saveErr);
      setErrorMsg(saveErr.message || "Failed to save note to database.");
      setIsSaving(false);
    }
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <Link
            to={selectedSubjectId ? `/subjects/${selectedSubjectId}` : "/"}
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <span>←</span>
            <span>Back to {selectedSubject ? selectedSubject.name : "Subjects"}</span>
          </Link>
        </div>

        {/* If AI Note Preview is ready, display Preview View */}
        {aiNoteResult ? (
          <NotePreview
            note={aiNoteResult}
            subjectName={selectedSubject?.name || "Subject"}
            lectureDate={lectureDate}
            onSave={handleSaveNote}
            onBack={() => setAiNoteResult(null)}
            isSaving={isSaving}
          />
        ) : (
          /* Upload Form View */
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-2">
                <span>📸</span>
                <span>Upload Lecture Notes</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Take photos of rough class notes or type keywords. Scriptly will structure them into clean study notes.
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl flex items-start space-x-2.5"
                role="alert"
              >
                <span className="text-lg leading-none">⚠️</span>
                <div className="flex-1">
                  <p className="font-semibold">Notice</p>
                  <p className="mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* If user has no subjects created yet */}
            {!isLoadingSubjects && subjects.length === 0 ? (
              <div className="text-center py-10 bg-indigo-50/50 rounded-2xl border border-dashed border-indigo-200 p-6">
                <span className="text-3xl block mb-2">📚</span>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  You need a subject first!
                </h3>
                <p className="text-xs text-gray-600 mb-4 max-w-xs mx-auto">
                  Before uploading lecture notes, create at least one subject (like "Software Engineering").
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center min-h-[44px] px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Go to Dashboard & Add Subject
                </Link>
              </div>
            ) : (
              <form onSubmit={handleCompleteNote} className="space-y-6">
                {/* Subject Dropdown & Date Picker Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Subject Dropdown */}
                  <div>
                    <label
                      htmlFor="subject-select"
                      className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
                    >
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject-select"
                      required
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    >
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lecture Date Picker */}
                  <div>
                    <label
                      htmlFor="lecture-date"
                      className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5"
                    >
                      Lecture Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lecture-date"
                      type="date"
                      required
                      value={lectureDate}
                      onChange={(e) => setLectureDate(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Photo Capture Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                      Class Photos ({imageFiles.length}/{MAX_IMAGES})
                    </label>
                    <span className="text-xs text-gray-400">
                      Up to 5 photos (Auto-shrunk to 1600px)
                    </span>
                  </div>

                  {/* Hidden File Inputs */}
                  {/* Camera input with capture="environment" for back phone camera */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      handleAddFiles(e.target.files);
                      e.target.value = ""; // Reset input so same photo can be retaken if deleted
                    }}
                  />

                  {/* Gallery input with multiple images allowed */}
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      handleAddFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />

                  {/* Camera & Gallery Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={isProcessing || imageFiles.length >= MAX_IMAGES}
                      onClick={() => cameraInputRef.current?.click()}
                      className="min-h-[44px] flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <span className="text-lg">📷</span>
                      <span>Take Photo</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing || imageFiles.length >= MAX_IMAGES}
                      onClick={() => galleryInputRef.current?.click()}
                      className="min-h-[44px] flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <span className="text-lg">🖼️</span>
                      <span>Choose from Gallery</span>
                    </button>
                  </div>

                  {/* Thumbnail Previews Strip */}
                  {imageFiles.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                      {imageFiles.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-square shadow-xs"
                        >
                          <img
                            src={img.previewUrl}
                            alt={`Class note page ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 w-7 h-7 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                            aria-label={`Remove photo ${idx + 1}`}
                          >
                            ✕
                          </button>
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Optional Typed Text Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="raw-text"
                      className="block text-xs font-semibold uppercase tracking-wider text-gray-700"
                    >
                      Optional Typed Keywords or Shorthand
                    </label>
                    <span className="text-[11px] text-gray-400">
                      {rawText.length} / {MAX_TEXT_LENGTH} chars
                    </span>
                  </div>
                  <textarea
                    id="raw-text"
                    rows={4}
                    maxLength={MAX_TEXT_LENGTH}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="e.g. Lecturer mentioned 3 core algorithms: Dijkstra, Bellman-Ford, Floyd-Warshall. Dijkstra uses priority queue..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />
                </div>

                {/* Processing Status Banner */}
                {isProcessing && (
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center space-x-3 text-sm text-indigo-900">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-indigo-700">
                        Structuring your lecture note...
                      </p>
                      <p className="text-xs text-indigo-600">
                        {processingStatus || "Please wait while Gemini processes handwriting and definitions."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing || (imageFiles.length === 0 && !rawText.trim())}
                    className="w-full min-h-[48px] py-3 px-6 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Processing with AI...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Complete my note</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
