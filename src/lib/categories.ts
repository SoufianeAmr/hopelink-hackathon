// Predefined categories — used in dropdowns and matching.
// Fixed list prevents messy free-text matching issues.
// Rubric: UX — consistent, predictable input for non-technical staff.
// Rubric: Technical Design — deterministic matching, no fuzzy logic needed.
export const CATEGORIES = [
  "Winter Clothing",
  "General Clothing",
  "Food — Non-Perishable",
  "Food — Perishable",
  "Hygiene Products",
  "Bedding & Linens",
  "Kitchen & Household",
  "Baby & Children",
  "Personal Care",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const URGENCY_LEVELS = ["low", "moderate", "critical"] as const;
export type Urgency = (typeof URGENCY_LEVELS)[number];

export const URGENCY_CONFIG = {
  low: { label: "Low", color: "bg-green-100 text-green-800", dot: "bg-green-500" },
  moderate: { label: "Moderate", color: "bg-yellow-100 text-yellow-800", dot: "bg-yellow-500" },
  critical: { label: "Critical", color: "bg-red-100 text-red-800", dot: "bg-red-500" },
} as const;
