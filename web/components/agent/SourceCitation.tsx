"use client";

import React from "react";

interface Citation {
  title: string;
  url: string;
  section: string;
}

interface SourceCitationProps {
  citations: Citation[];
}

export function SourceCitation({ citations }: SourceCitationProps) {
  if (!citations.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {citations.map((c, i) => (
        <a
          key={i}
          href={c.url}
          target="_blank"
          rel="noopener noreferrer"
          title={`${c.title} — ${c.section}`}
          className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-2.5 py-0.5 text-xs font-medium hover:bg-blue-100 transition-colors"
        >
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          {c.title}
        </a>
      ))}
    </div>
  );
}
