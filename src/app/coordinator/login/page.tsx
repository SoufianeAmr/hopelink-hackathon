"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, ArrowLeft } from "lucide-react";

const COORDINATOR_CODE = "gmhsc-coord";
const SESSION_KEY = "hopelink-coordinator-session";

export default function CoordinatorLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved === "active") {
      setHasSaved(true);
    }
  }, []);

  function handleLogin() {
    if (code.trim().toLowerCase() === COORDINATOR_CODE) {
      localStorage.setItem(SESSION_KEY, "active");
      router.push("/coordinator");
    } else {
      setError("Invalid access code. Please check and try again.");
    }
  }

  function handleContinue() {
    router.push("/coordinator");
  }

  function handleSignOut() {
    localStorage.removeItem(SESSION_KEY);
    setHasSaved(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Coordinator Portal</h1>
          <p className="text-sm text-gray-500 mt-2">
            Monitor network activity, view matches, and track coordination
            across all GMHSC organizations.
          </p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          {hasSaved && (
            <div className="mb-5">
              <button
                onClick={handleContinue}
                className="w-full flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4 hover:bg-emerald-100 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-900">
                    Signed in as GMHSC Coordinator
                  </p>
                  <p className="text-xs text-emerald-600">Continue to Coordinator Dashboard</p>
                </div>
              </button>
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={handleSignOut}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Sign out
                </button>
              </div>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs text-gray-400">or sign in again</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Access Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter coordinator code"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                autoFocus={!hasSaved}
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Provided by GMHSC to authorized coordinators.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={!code.trim()}
              className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 mb-1">Demo code</p>
          <p className="text-xs text-gray-400">gmhsc-coord</p>
        </div>

        <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <p className="text-xs text-emerald-700">
            <strong>Read-only access.</strong> Coordinators can monitor all network activity
            but cannot modify posts or approve transfers. Organizations coordinate directly.
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center justify-center gap-1.5 mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to role selection
        </Link>
      </div>
    </div>
  );
}
