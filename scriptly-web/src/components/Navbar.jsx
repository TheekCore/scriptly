import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 text-indigo-600 font-bold text-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
          aria-label="Scriptly Home"
        >
          <span className="text-2xl">📝</span>
          <span className="tracking-tight text-gray-900">
            Script<span className="text-indigo-600">ly</span>
          </span>
        </Link>

        {/* User profile & Logout */}
        {user && (
          <div className="flex items-center space-x-3">
            <span
              className="text-xs text-gray-600 hidden sm:inline-block max-w-[160px] truncate"
              title={user.email}
            >
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="min-h-[44px] min-w-[44px] px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
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
