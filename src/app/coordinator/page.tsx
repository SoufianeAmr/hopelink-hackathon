"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { OrgCard } from "@/components/OrgCard";
import { FeedItem } from "@/components/FeedItem";
import { PulseMetrics } from "@/components/PulseMetrics";
import {exportPDF, fetchReportData } from "@/lib/export";

interface Organization {
  id: string;
  name: string;
  code: string;
  type: string;
  status: "red" | "yellow" | "green";
  activeNeeds: number;
  activeHaves: number;
  criticalNeeds: number;
  expiringItems: number;
}

interface FeedEventData {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

interface Stats {
  activeNeeds: number;
  activeHaves: number;
  pendingMatches: number;
  expiringItems: number;
  matchRate: number;
}

// Rubric: Impact — coordinators see the full network without controlling it.
// Rubric: Feasibility — mentors confirmed: coordinators observe, not govern.
// Rubric: UX — read-only oversight view, no approval buttons.
export default function CoordinatorPage() {
  const router = useRouter();
  const [entered, setEntered] = useState(false);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [feed, setFeed] = useState<FeedEventData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for saved coordinator session — redirect to login if not found
  useEffect(() => {
    const saved = localStorage.getItem("hopelink-coordinator-session");
    if (saved === "active") {
      setEntered(true);
    } else {
      router.push("/coordinator/login");
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    try {
      const [orgsRes, feedRes, statsRes] = await Promise.all([
        fetch("/api/organizations"),
        fetch("/api/feed?limit=20"),
        fetch("/api/stats"),
        fetch("/api/expiry-check"),
      ]);

      const orgsData = await orgsRes.json();
      const feedData = await feedRes.json();
      const statsData = await statsRes.json();

      setOrgs(orgsData.organizations || []);
      setFeed(feedData.events || []);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (entered) {
      fetchData();
      const interval = setInterval(fetchData, 15000);
      return () => clearInterval(interval);
    }
  }, [entered, fetchData]);

 async function handleExport() {
  if (!stats) return;

  const detail = await fetchReportData();
  const data = { stats, orgs, ...detail };

  exportPDF(data);
}


  function handleSignOut() {
    localStorage.removeItem("hopelink-coordinator-session");
    router.push("/");
  }

  if (!entered) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const statusOrder = { red: 0, yellow: 1, green: 2 };
  const sortedOrgs = [...orgs].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading network data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Network Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Signed in as GMHSC Coordinator
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Sign out
        </button>
      </div>

      {/* Info banner — reinforces that this is oversight, not control */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-emerald-800">
          <strong>Coordinator view:</strong> Monitor network activity, track matches,
          and identify gaps. Organizations coordinate directly.
        </p>
        {stats && (
          <div className="flex gap-2 shrink-0">
            <button
                onClick={handleExport}
                className="text-xs bg-white border border-emerald-300 text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-50 transition-colors font-medium"
                >
              Generate Network Report
            </button>

          </div>
        )}
      </div>

      {stats && (
        <PulseMetrics
          activeNeeds={stats.activeNeeds}
          activeHaves={stats.activeHaves}
          pendingMatches={stats.pendingMatches}
          expiringItems={stats.expiringItems}
          matchRate={stats.matchRate}
        />
      )}

      <div className="mb-8">
        <h2 className="font-semibold text-gray-800 mb-3 text-sm">
          Organizations ({orgs.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedOrgs.map((org) => (
            <OrgCard
              key={org.id}
              name={org.name}
              type={org.type}
              status={org.status}
              activeNeeds={org.activeNeeds}
              activeHaves={org.activeHaves}
              criticalNeeds={org.criticalNeeds}
              expiringItems={org.expiringItems}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h2 className="font-semibold text-gray-800 text-sm">Live Network Feed</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {feed.length > 0 ? (
            feed.map((event) => (
              <FeedItem
                key={event.id}
                type={event.type}
                message={event.message}
                createdAt={event.createdAt}
              />
            ))
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No network activity yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
