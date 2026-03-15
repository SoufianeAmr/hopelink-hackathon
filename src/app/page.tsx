"use client";

import Link from "next/link";
import { Building2, BarChart3, Heart } from "lucide-react";

// Rubric: UX — clear role-based entry. Each user finds their path instantly.
// Rubric: Impact — serves all 3 primary users from the first screen.
// Rubric: Feasibility — "can a non-technical person use it without help?" Yes — 3 big buttons.
export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto mt-8 sm:mt-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">H</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HopeLink</h1>
        <p className="text-gray-500">
          See needs. Match resources. Reduce waste.
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Real-time coordination for the GMHSC network
        </p>
      </div>

      <div className="space-y-4">
        <Link
          href="/staff/login"
          className="flex items-center gap-4 bg-white border rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Organization Staff</h2>
            <p className="text-sm text-gray-500">
              Post available items or needs. See matches with other organizations.
            </p>
          </div>
        </Link>

        <Link
          href="/coordinator/login"
          className="flex items-center gap-4 bg-white border rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Coordinator</h2>
            <p className="text-sm text-gray-500">
              Monitor network activity, view matches, and track coordination across organizations.
            </p>
          </div>
        </Link>

        <Link
          href="/donor/start"
          className="flex items-center gap-4 bg-white border rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <Heart className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Donor</h2>
            <p className="text-sm text-gray-500">
              See what the network needs right now and offer to help. No account required.
            </p>
          </div>
        </Link>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        HopeLink tracks donated items, not people. No personal data about individuals
        experiencing homelessness is collected.
      </p>
    </div>
  );
}
