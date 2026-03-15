"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  value: string;
  onChange: (dataUrl: string) => void;
  accentColor?: string;
}

export function PhotoUpload({ value, onChange, accentColor = "green" }: PhotoUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
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
          onChange(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const activeBorder = accentColor === "purple" ? "border-purple-400 bg-purple-50" : "border-green-400 bg-green-50";
  const activeText = accentColor === "purple" ? "text-purple-600" : "text-green-600";

  if (value) {
    return (
      <div className="relative inline-block w-full">
        <img
          src={value}
          alt="Preview"
          className="w-full max-h-48 object-cover rounded-lg border"
        />
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <>
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
            ? activeBorder
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
              <span className={activeText}>Upload a photo</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG up to 2 MB</p>
          </div>
        </div>
      </div>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </>
  );
}
