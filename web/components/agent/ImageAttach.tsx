"use client";

import React, { useRef, useState } from "react";
import { uploadAgentImage } from "@/lib/agent/media";

interface ImageAttachProps {
  userId: string;
  onAttach: (imageUrl: string, imageB64: string) => void;
  disabled?: boolean;
}

export function ImageAttach({ userId, onAttach, disabled }: ImageAttachProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const result = await uploadAgentImage(userId, file);
    setUploading(false);
    if (result) {
      onAttach(result.url, result.base64);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
        title="Attach photo"
      >
        {uploading ? (
          <svg className="w-4 h-4 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
        )}
      </button>
      {preview && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Attached" className="h-10 w-10 object-cover rounded-lg border border-gray-200" />
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="absolute -top-1 -right-1 bg-gray-700 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
          >×</button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
