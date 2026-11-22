import React from "react";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 mb-2">
                ● Authenticated
              </span>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome to Scriptly!
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Logged in as: <strong className="text-gray-900">{user?.email}</strong>
              </p>
            </div>

            <div className="text-xs text-gray-500 bg-indigo-50 border border-indigo-100 p-3 rounded-xl max-w-sm">
              <span className="font-semibold text-indigo-700 block mb-0.5">
                Milestone 2 Verified:
              </span>
              Supabase Authentication, Session Persistence, and Route Protection are active.
            </div>
          </div>
        </div>

        {/* Milestone 3 preview placeholder */}
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-white/50">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl">
            📚
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Subject Dashboard (Coming in M3)
          </h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            In the next milestone, you will add your subjects with custom colors, toggle favorites, and organize your lecture notes!
          </p>
        </div>
      </main>
    </div>
  );
}
