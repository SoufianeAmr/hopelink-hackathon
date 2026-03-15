"use client";

import { cn } from "@/lib/utils";

interface OrgCardProps {
  name: string;
  type: string;
  status: "red" | "yellow" | "green";
  activeNeeds: number;
  activeHaves: number;
  criticalNeeds: number;
  expiringItems: number;
}

const statusConfig = {
  red: { bg: "bg-red-50 border-red-200", dot: "bg-red-500", label: "Critical Needs" },
  yellow: { bg: "bg-yellow-50 border-yellow-200", dot: "bg-yellow-500", label: "Active Needs" },
  green: { bg: "bg-green-50 border-green-200", dot: "bg-green-500", label: "Well Stocked" },
};

// Rubric: UX — status visible in under 3 seconds. Color-coded, no text needed.
// Rubric: Impact — "improving visibility of available resources" at a glance.
export function OrgCard({
  name,
  type,
  status,
  activeNeeds,
  activeHaves,
  criticalNeeds,
  expiringItems,
}: OrgCardProps) {
  const config = statusConfig[status];

  return (
    <div className={cn("rounded-lg border p-4 transition-shadow hover:shadow-md", config.bg)}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full animate-pulse", config.dot)} />
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{name}</h3>
        </div>
        <span className="text-xs text-gray-500 capitalize">{type}</span>
      </div>

      <div className="space-y-1 text-sm">
        {activeNeeds > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Needs:</span>
            <span className="font-medium">{activeNeeds}</span>
          </div>
        )}
        {activeHaves > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Available:</span>
            <span className="font-medium">{activeHaves}</span>
          </div>
        )}
        {criticalNeeds > 0 && (
          <div className="flex justify-between text-red-700">
            <span>Critical:</span>
            <span className="font-bold">{criticalNeeds}</span>
          </div>
        )}
        {expiringItems > 0 && (
          <div className="flex justify-between text-orange-700">
            <span>Expiring:</span>
            <span className="font-bold">{expiringItems}</span>
          </div>
        )}
        {activeNeeds === 0 && activeHaves === 0 && (
          <p className="text-gray-500 text-xs">{config.label}</p>
        )}
      </div>
    </div>
  );
}
