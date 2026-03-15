"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ShieldCheck, Clock, Eye, ArrowLeft } from "lucide-react";

export default function DonorStartPage() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Donor Board</h1>
          <p className="text-sm text-gray-500 mt-2">
            See what the GMHSC network needs right now and offer to help.
          </p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">No account required</p>
                <p className="text-xs text-gray-500">
                  The donor board is fully public. No login, no sign-up.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Eye className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">See real-time needs</p>
                <p className="text-xs text-gray-500">
                  View current needs across all 28 organizations, sorted by urgency.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Help in under 30 seconds</p>
                <p className="text-xs text-gray-500">
                  Tap "I Can Help" on any need and fill in a short form. That's it.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push("/donate")}
            className="w-full bg-purple-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-purple-700 transition-colors"
          >
            Continue to Donor Board
          </button>
        </div>

        <div className="mt-4 bg-purple-50 border border-purple-100 rounded-xl p-4">
          <p className="text-xs text-purple-700">
            <strong>Privacy note:</strong> HopeLink tracks donated items, not people.
            No personal information about individuals experiencing homelessness is
            collected or stored.
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
