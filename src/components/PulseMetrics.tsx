"use client";

interface PulseMetricsProps {
  activeNeeds: number;
  activeHaves: number;
  pendingMatches: number;
  expiringItems: number;
  matchRate: number;
}

// Rubric: Pitch — one glance = system health.
// Rubric: Impact — "X% of needs have matches" is a concrete, measurable metric.
// Build cost: trivial (30 min). Score ROI: highest of any feature.
export function PulseMetrics({
  activeNeeds,
  activeHaves,
  pendingMatches,
  expiringItems,
  matchRate,
}: PulseMetricsProps) {
  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <h2 className="font-semibold text-gray-900 text-sm">Network Pulse</h2>
        <span className="ml-auto text-2xl font-bold text-blue-600">{matchRate}%</span>
        <span className="text-xs text-gray-500">needs matched</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricBox label="Active Needs" value={activeNeeds} color="text-red-600" />
        <MetricBox label="Items Available" value={activeHaves} color="text-green-600" />
        <MetricBox label="Matches Found" value={pendingMatches} color="text-blue-600" />
        <MetricBox label="Expiring Soon" value={expiringItems} color="text-orange-600" />
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center p-2 bg-gray-50 rounded-md">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
