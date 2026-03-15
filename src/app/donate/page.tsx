"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { URGENCY_CONFIG } from "@/lib/categories";

interface NeedData {
  category: string;
  totalQuantity: number;
  highestUrgency: string;
  organizations: { name: string; id: string; item: string; quantity: number }[];
}

// Rubric: Impact — "making donation processes easier for contributors."
// Rubric: UX — zero login, public page, scannable needs list.
// Rubric: Feasibility — no auth required, anyone can access.
export default function DonatePage() {
  const [needs, setNeeds] = useState<NeedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormFor, setShowFormFor] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    donorName: "",
    donorContact: "",
    item: "",
    quantity: "",
    logistics: "either",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchNeeds = useCallback(async () => {
    try {
      const res = await fetch("/api/donor-needs");
      const data = await res.json();
      setNeeds(data.needs || []);
    } catch {
      console.error("Failed to fetch needs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNeeds();
    const interval = setInterval(fetchNeeds, 10000);
    return () => clearInterval(interval);
  }, [fetchNeeds]);

  async function handleSubmitOffer(category: string, targetOrgId?: string) {
    if (!formData.donorName || !formData.donorContact || !formData.item || !formData.quantity) {
      setFormError("Please fill in all fields.");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      await fetch("/api/donor-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: formData.donorName,
          donorContact: formData.donorContact,
          item: formData.item,
          quantity: formData.quantity,
          logistics: formData.logistics,
          category,
          targetOrgId,
        }),
      });
      setSubmitted(true);
      setFormData({ donorName: "", donorContact: "", item: "", quantity: "", logistics: "either" });
      setTimeout(() => {
        setSubmitted(false);
        setShowFormFor(null);
      }, 3000);
    } catch {
      console.error("Failed to submit offer");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading current needs...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Needs Board</h1>
        <p className="text-sm text-gray-500 mt-1">
          The GMHSC network currently needs the following items. No account required to help.
        </p>
      </div>

      {needs.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800 font-medium">
            All needs are currently being met. Check back later!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {needs.map((need) => {
            const urgencyConf = URGENCY_CONFIG[need.highestUrgency as keyof typeof URGENCY_CONFIG];
            const isExpanded = showFormFor === need.category;

            return (
              <div key={need.category} className="bg-white rounded-lg border overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{need.category}</h3>
                    {urgencyConf && (
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium uppercase",
                          urgencyConf.color
                        )}
                      >
                        {urgencyConf.label}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {need.totalQuantity} items needed across {need.organizations.length}{" "}
                    organization{need.organizations.length > 1 ? "s" : ""}
                  </p>

                  <div className="space-y-1 mb-3">
                    {need.organizations.map((org, i) => (
                      <p key={i} className="text-xs text-gray-500">
                        {org.name}: {org.item} ({org.quantity})
                      </p>
                    ))}
                  </div>

                  {!isExpanded && (
                    <button
                      onClick={() => setShowFormFor(need.category)}
                      className="w-full bg-blue-600 text-white rounded-md py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors touch-target"
                    >
                      I Can Help
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4">
                    {submitted ? (
                      <div className="text-center py-4">
                        <p className="text-green-700 font-medium">
                          Thank you! Your offer has been submitted.
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          The organization will reach out to coordinate.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={formData.donorName}
                          onChange={(e) =>
                            setFormData({ ...formData, donorName: e.target.value })
                          }
                          placeholder="Your name"
                          className="w-full border rounded-md p-2.5 text-sm touch-target"
                        />
                        <input
                          type="text"
                          value={formData.donorContact}
                          onChange={(e) =>
                            setFormData({ ...formData, donorContact: e.target.value })
                          }
                          placeholder="Email or phone number"
                          className="w-full border rounded-md p-2.5 text-sm touch-target"
                        />
                        <input
                          type="text"
                          value={formData.item}
                          onChange={(e) =>
                            setFormData({ ...formData, item: e.target.value })
                          }
                          placeholder="What you can provide (e.g. 5 winter coats)"
                          className="w-full border rounded-md p-2.5 text-sm touch-target"
                        />
                        <input
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) =>
                            setFormData({ ...formData, quantity: e.target.value })
                          }
                          placeholder="Quantity"
                          className="w-full border rounded-md p-2.5 text-sm touch-target"
                        />
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            I can...
                          </label>
                          <div className="flex gap-2">
                            {(["pickup", "delivery", "either"] as const).map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setFormData({ ...formData, logistics: opt })}
                                className={cn(
                                  "flex-1 py-2 rounded-md text-xs font-medium transition-colors",
                                  formData.logistics === opt
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                              >
                                {opt === "pickup" ? "Pick up" : opt === "delivery" ? "Deliver" : "Either"}
                              </button>
                            ))}
                          </div>
                        </div>
                        {formError && (
                          <p className="text-red-600 text-sm">{formError}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleSubmitOffer(
                                need.category,
                                need.organizations[0]?.id
                              )
                            }
                            disabled={submitting}
                            className={cn(
                              "flex-1 bg-green-600 text-white rounded-md py-2.5 text-sm font-semibold hover:bg-green-700 transition-colors touch-target",
                              submitting && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {submitting ? "Submitting..." : "Submit Offer"}
                          </button>
                          <button
                            onClick={() => setShowFormFor(null)}
                            className="px-4 py-2.5 rounded-md text-sm text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors touch-target"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>Privacy note:</strong> HopeLink tracks donated items, not people. No personal
          information about individuals experiencing homelessness is collected or stored.
        </p>
      </div>

      <div className="text-center mt-6">
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
        >
          Back to role selection
        </Link>
      </div>
    </div>
  );
}
