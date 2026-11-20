import React from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 border border-indigo-100 text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <span className="text-3xl text-white">📝</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Scriptly
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Smart lecture notes from rough photos and quick keywords.
        </p>

        <div className="p-4 bg-indigo-50 rounded-xl text-left border border-indigo-100 mb-6">
          <div className="flex items-center space-x-2 text-indigo-700 font-medium text-xs mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Milestone 0: Baseline Setup Active</span>
          </div>
          <p className="text-xs text-gray-600">
            Frontend (Vite + React + Tailwind) & Backend (Express) are configured.
          </p>
        </div>

        <div className="text-xs text-gray-400">
          Module TICT3153 &bull; ICT Expo 5.0
        </div>
      </div>
    </div>
  );
}
