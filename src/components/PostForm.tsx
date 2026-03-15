"use client";

import { useState, useRef, useCallback } from "react";
import { CATEGORIES, URGENCY_LEVELS, URGENCY_CONFIG } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { Camera, X, Upload } from "lucide-react";

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
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, etc.).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2 MB.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Resize to max 800px wide to keep base64 string reasonable
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = (h * maxW) / w;
          w = maxW;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        setImageData(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, []);

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
            {imageData ? (
              <div className="relative inline-block">
                <img
                  src={imageData}
                  alt="Preview"
                  className="w-full max-h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => setImageData("")}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) processFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  dragging
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processFile(file);
                  }}
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Camera className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      <span className="text-green-600">Upload a photo</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">JPG, PNG up to 2 MB</p>
                  </div>
                </div>
              </div>
            )}
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
