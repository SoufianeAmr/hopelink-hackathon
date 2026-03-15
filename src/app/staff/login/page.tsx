"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";

const SESSION_KEY = "hopelink-staff-session";

export default function StaffLoginPage() {
  const router = useRouter();
  const [orgCode, setOrgCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedOrg, setSavedOrg] = useState<{ code: string; name: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const session = JSON.parse(saved);
        if (session.code && session.name) {
          setSavedOrg(session);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  async function handleLogin() {
    const code = orgCode.trim().toLowerCase();
    if (!code) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/organizations");
      const data = await res.json();
      const org = data.organizations?.find(
        (o: { code: string; name: string }) => o.code === code
      );
      if (org) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ code, name: org.name }));
        router.push("/staff");
      } else {
        setError("Organization code not found. Please check and try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleContinueSaved() {
    router.push("/staff");
  }

  function handleSignOutSaved() {
    localStorage.removeItem(SESSION_KEY);
    setSavedOrg(null);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-hope-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Portal</h1>
          <p className="text-sm text-gray-500 mt-2">
            Access your organization's workspace to manage donations and needs.
          </p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          {savedOrg && (
            <div className="mb-5">
              <button
                onClick={handleContinueSaved}
                className="w-full flex items-center gap-3 bg-hope-blue-light border border-hope-blue/20 rounded-lg p-4 hover:bg-hope-blue/10 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-hope-blue rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">
                    {savedOrg.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-hope-blue-dark">
                    Signed in as {savedOrg.name}
                  </p>
                  <p className="text-xs text-hope-blue">Continue to Staff Workspace</p>
                </div>
              </button>
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={handleSignOutSaved}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Sign out
                </button>
              </div>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs text-gray-400">or sign in with another code</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Organization Code
              </label>
              <input
                type="text"
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="e.g. hou-naz"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-hope-blue focus:border-hope-blue outline-none transition-all"
                autoFocus={!savedOrg}
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Enter the code provided by your organization administrator.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !orgCode.trim()}
              className="w-full bg-hope-blue text-white rounded-lg py-3 text-sm font-semibold hover:bg-hope-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>

        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Demo organization codes</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <p className="text-xs text-gray-400">hou-naz</p>
            <p className="text-xs text-gray-400">ymca-gm</p>
            <p className="text-xs text-gray-400">cross-wo</p>
            <p className="text-xs text-gray-400">harv-atl</p>
            <p className="text-xs text-gray-400">rise-tid</p>
            <p className="text-xs text-gray-400">salvus</p>
          </div>
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
