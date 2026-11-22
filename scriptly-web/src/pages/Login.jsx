import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, send directly to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Handle Log In
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      await signIn(email, password);
      navigate("/");
    } catch (err) {
      // Provide simple, helpful error explanations
      if (err.message.includes("Invalid login credentials")) {
        setErrorMsg("Incorrect email or password. Please try again.");
      } else {
        setErrorMsg(err.message || "Failed to log in. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!email || !password) {
      setErrorMsg("Please provide an email and password to register.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsLoading(true);
      const data = await signUp(email, password, displayName);

      // Check if Supabase requires email confirmation
      if (data?.user && !data?.session) {
        setInfoMsg(
          "Registration successful! Please check your email inbox to confirm your account before logging in."
        );
      } else {
        navigate("/");
      }
    } catch (err) {
      if (err.message.includes("User already registered")) {
        setErrorMsg("An account with this email already exists. Try logging in.");
      } else {
        setErrorMsg(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* App Logo & Header */}
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-3xl text-white">📝</span>
          </div>
        </div>
        <h1 className="text-center text-2xl font-bold tracking-tight text-gray-900">
          Scriptly
        </h1>
        <p className="mt-1 text-center text-sm text-gray-600">
          Smart lecture notes from rough photos and quick keywords.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-5 shadow-sm rounded-2xl border border-gray-200 sm:px-10">
          {/* Notification Messages */}
          {errorMsg && (
            <div
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start space-x-2"
              role="alert"
            >
              <span className="font-bold">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div
              className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-start space-x-2"
              role="status"
            >
              <span>ℹ️</span>
              <span>{infoMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={isRegistering ? handleRegister : handleLogin}>
            {/* Optional Display Name on Registration */}
            {isRegistering && (
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
                >
                  Your Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Silva"
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isRegistering ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            {/* Action Buttons: Log in and Register */}
            <div className="pt-2 flex flex-col space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[44px] flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <span className="inline-flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing...</span>
                  </span>
                ) : isRegistering ? (
                  "Create Account"
                ) : (
                  "Log in"
                )}
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setErrorMsg("");
                  setInfoMsg("");
                  setIsRegistering(!isRegistering);
                }}
                className="w-full min-h-[44px] flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {isRegistering
                  ? "Already have an account? Log in"
                  : "Need an account? Register"}
              </button>
            </div>
          </form>

          {/* Module & Academic Footer */}
          <div className="mt-6 border-t border-gray-100 pt-4 text-center">
            <p className="text-xs text-gray-400">
              Module TICT3153 &bull; ICT Expo 5.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
