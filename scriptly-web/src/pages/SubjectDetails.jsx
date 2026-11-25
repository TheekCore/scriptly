import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { supabase } from "../lib/supabase.js";

export default function SubjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSubject() {
      try {
        setLoading(true);
        setError("");
        const { data, error } = await supabase
          .from("subjects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setSubject(data);
      } catch (err) {
        setError(err.message || "Subject not found.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchSubject();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <span>←</span>
            <span>Back to Subjects</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-gray-500">Loading subject...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto">
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
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: subject?.color || "#6366f1" }}
                />
                <h1 className="text-2xl font-bold text-gray-900">
                  {subject?.name}
                </h1>
                {subject?.is_favourite && (
                  <span className="text-amber-400 text-lg" title="Favourite">
                    ★
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  to={`/upload?subjectId=${subject?.id}`}
                  className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm flex items-center space-x-1.5"
                >
                  <span>📷</span>
                  <span>Upload notes</span>
                </Link>
              </div>
            </div>

            {/* Empty state / placeholder for notes */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-white/50">
              <span className="text-4xl block mb-2">📝</span>
              <h3 className="text-base font-bold text-gray-900 mb-1">
                No notes uploaded yet
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5">
                Take photos of your handwritten class notes or type keywords. Scriptly will structure them into clean study notes!
              </p>
              <Link
                to={`/upload?subjectId=${subject?.id}`}
                className="inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
              >
                + Upload first note
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
