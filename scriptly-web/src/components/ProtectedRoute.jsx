import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// ProtectedRoute ensures that only logged-in students can view private pages
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-gray-500 font-medium">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect unauthenticated visitors to login
    return <Navigate to="/login" replace />;
  }

  return children;
}
