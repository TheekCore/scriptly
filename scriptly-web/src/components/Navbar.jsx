import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar({ searchQuery, onSearchChange }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 text-indigo-600 font-bold text-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 flex-shrink-0"
          aria-label="Scriptly Home"
        >
          <span className="text-2xl">📝</span>
          <span className="tracking-tight text-gray-900 hidden xs:inline-block">
            Script<span className="text-indigo-600">ly</span>
          </span>
        </Link>

        {/* Optional Search Box in Top Bar */}
        {onSearchChange !== undefined && (
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" strokeWidth="2"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"></line>
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Filter subjects..."
                className="w-full min-h-[44px] pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                aria-label="Filter subjects"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label="Clear filter"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* User profile & Logout */}
        {user && (
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <span
              className="text-xs text-gray-500 hidden md:inline-block max-w-[150px] truncate"
              title={user.email}
            >
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="min-h-[44px] min-w-[44px] px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              aria-label="Log out of Scriptly"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
