"use client";

import { useState } from "react";
import { CATEGORIES, URGENCY_LEVELS, URGENCY_CONFIG } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { PhotoUpload } from "@/components/PhotoUpload";

interface PostFormProps {
  orgCode: string;
  initialType?: "HAVE" | "NEED";
  onSuccess: (matchesFound?: number) => void;
  onCancel: () => void;
}

// Rubric: UX — under 30 seconds to complete. 3 required fields.
// Rubric: Feasibility — "if it takes too long to learn or use, it won't be used."
export function PostForm({ orgCode, initialType, onSuccess, onCancel }: PostFormProps) {
  const [type, setType] = useState<"HAVE" | "NEED">(initialType || "NEED");
  const [category, setCategory] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [urgency, setUrgency] = useState<string>("low");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [condition, setCondition] = useState("");
  const [imageData, setImageData] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !item || !quantity) {
      setError("Please fill in category, item, and quantity.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgCode,
          type,
          category,
          item,
          quantity: parseInt(quantity, 10),
          urgency,
          expiryDate: expiryDate || null,
          notes,
          condition,
          imageUrl: imageData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      onSuccess(data.matchesFound || 0);
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-4 space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("HAVE")}
          className={cn(
            "flex-1 py-3 rounded-lg font-semibold text-sm transition-colors touch-target",
            type === "HAVE"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          We Have
        </button>
        <button
          type="button"
          onClick={() => setType("NEED")}
          className={cn(
            "flex-1 py-3 rounded-lg font-semibold text-sm transition-colors touch-target",
            type === "NEED"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          We Need
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded-md p-2.5 text-sm touch-target bg-white"
          required
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Item <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="e.g. Winter coats, kids sizes"
          className="w-full border rounded-md p-2.5 text-sm touch-target"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="0"
          className="w-full border rounded-md p-2.5 text-sm touch-target"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
        <div className="flex gap-2">
          {URGENCY_LEVELS.map((level) => {
            const config = URGENCY_CONFIG[level];
            return (
              <button
                key={level}
                type="button"
                onClick={() => setUrgency(level)}
                className={cn(
                  "flex-1 py-2.5 rounded-md text-sm font-medium transition-colors touch-target",
                  urgency === level ? config.color + " ring-2 ring-offset-1 ring-current" : "bg-gray-100 text-gray-600"
                )}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {type === "HAVE" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full border rounded-md p-2.5 text-sm touch-target"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional details"
          className="w-full border rounded-md p-2.5 text-sm touch-target"
        />
      </div>

      {type === "HAVE" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition <span className="text-gray-400">(optional)</span>
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full border rounded-md p-2.5 text-sm touch-target bg-white"
            >
              <option value="">Select condition</option>
              <option value="New in box">New in box</option>
              <option value="Like new">Like new</option>
              <option value="Gently used">Gently used</option>
              <option value="Used — good">Used — good</option>
              <option value="Needs cleaning">Needs cleaning</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo <span className="text-gray-400">(optional)</span>
            </label>
            <PhotoUpload value={imageData} onChange={setImageData} />
          </div>
        </>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "flex-1 py-3 rounded-lg font-semibold text-sm text-white transition-colors touch-target",
            type === "HAVE"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700",
            submitting && "opacity-50 cursor-not-allowed"
          )}
        >
          {submitting ? "Posting..." : "Post"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors touch-target"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
