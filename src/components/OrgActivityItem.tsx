"use client";

import { timeAgo } from "@/lib/utils";

interface OrgActivityItemProps {
  type: string;
  message: string;
  createdAt: string;
}

const labelConfig: Record<string, { label: string; bg: string; text: string }> = {
  post_need:           { label: "NEED",     bg: "bg-red-100",     text: "text-red-700" },
  post_have:           { label: "AVAILABLE", bg: "bg-green-100",  text: "text-green-700" },
  match_found:         { label: "MATCH",    bg: "bg-blue-100",    text: "text-blue-700" },
  transfer_requested:  { label: "REQUEST",  bg: "bg-amber-100",   text: "text-amber-700" },
  match_resolved:      { label: "TRANSFER", bg: "bg-emerald-100", text: "text-emerald-700" },
  donor_offer:         { label: "DONOR",    bg: "bg-purple-100",  text: "text-purple-700" },
  expiry_alert:        { label: "URGENT",   bg: "bg-orange-100",  text: "text-orange-700" },
};

const fallbackLabel = { label: "EVENT", bg: "bg-gray-100", text: "text-gray-700" };

/**
 * Strip verbose prefixes from feed messages to produce a short,
 * scannable description for the staff activity timeline.
 */
function cleanMessage(type: string, message: string): string {
  // Remove known leading prefixes
  const prefixes = [
    /^Available:\s*/,
    /^Need:\s*/,
    /^Match:\s*/,
    /^Transfer requested:\s*/,
    /^Resolved:\s*/,
    /^Fulfilled:\s*/,
    /^Donor offer:\s*/,
    /^URGENT:\s*/,
  ];

  let cleaned = message;
  for (const prefix of prefixes) {
    cleaned = cleaned.replace(prefix, "");
  }

  return cleaned;
}

export function OrgActivityItem({ type, message, createdAt }: OrgActivityItemProps) {
  const config = labelConfig[type] || fallbackLabel;
  const cleaned = cleanMessage(type, message);

  return (
    <div className="flex items-start gap-2.5 py-2.5">
      <span
        className={`shrink-0 mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 leading-snug">{cleaned}</p>
        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(createdAt)}</p>
      </div>
    </div>
  );
}
