"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

// Supported launch models — matches blueprint Section 10
const SUPPORTED_BOATS: { make: string; models: string[] }[] = [
  { make: "MasterCraft", models: ["X24", "NXT22", "XT23"] },
  { make: "Malibu", models: ["Wakesetter 23 LSV", "Response TXi", "21 MLX"] },
  { make: "Boston Whaler", models: ["270 Dauntless", "330 Outrage", "Montauk 170"] },
  { make: "Grady-White", models: ["Canyon 336", "Freedom 235", "Fisherman 236"] },
  { make: "Sea Ray", models: ["SPX 210", "SDX 270", "Sundancer 320"] },
];

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  post_type: "general" | "model_specific";
  boat_make: string | null;
  boat_model: string | null;
  published_at: string | null;
}

interface BlogListProps {
  posts: BlogPost[];
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function BlogList({ posts }: BlogListProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | "general" | "model_specific">("all");
  const [makeFilter, setMakeFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");

  const availableModels = useMemo(
    () => SUPPORTED_BOATS.find((b) => b.make === makeFilter)?.models ?? [],
    [makeFilter]
  );

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (typeFilter !== "all" && p.post_type !== typeFilter) return false;
      if (makeFilter && p.boat_make !== makeFilter) return false;
      if (modelFilter && p.boat_model !== modelFilter) return false;
      return true;
    });
  }, [posts, typeFilter, makeFilter, modelFilter]);

  const clearFilters = () => {
    setTypeFilter("all");
    setMakeFilter("");
    setModelFilter("");
  };

  const hasFilters = typeFilter !== "all" || makeFilter || modelFilter;

  return (
    <div>
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-3">
        {/* Type toggle */}
        <div className="flex gap-2">
          {(["all", "general", "model_specific"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setMakeFilter(""); setModelFilter(""); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                typeFilter === t
                  ? "bg-brand-navy text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t === "all" ? "All Posts" : t === "general" ? "General" : "Model-Specific"}
            </button>
          ))}
        </div>

        {/* Make / model dropdowns — only shown when model_specific selected */}
        {typeFilter === "model_specific" && (
          <div className="flex gap-3 flex-wrap">
            <select
              value={makeFilter}
              onChange={(e) => { setMakeFilter(e.target.value); setModelFilter(""); }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-navy"
            >
              <option value="">All Makes</option>
              {SUPPORTED_BOATS.map((b) => (
                <option key={b.make} value={b.make}>{b.make}</option>
              ))}
            </select>

            {makeFilter && (
              <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-navy"
              >
                <option value="">All Models</option>
                {availableModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            )}

            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-gray-400 underline">
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📝</p>
          <p className="font-medium text-brand-navy">No posts yet</p>
          <p className="text-sm mt-1">Check back soon — new guides are published weekly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-brand-navy/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                    post.post_type === "model_specific"
                      ? "bg-brand-navy/10 text-brand-navy"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {post.post_type === "model_specific" ? "Model-Specific" : "General"}
                </span>
                {post.published_at && (
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(post.published_at)}</span>
                )}
              </div>

              <h2 className="font-bold text-brand-navy text-base leading-snug mb-1 group-hover:text-brand-red transition-colors">
                {post.title}
              </h2>

              {post.post_type === "model_specific" && post.boat_make && (
                <p className="text-xs text-brand-red font-medium mb-1">
                  {post.boat_make}{post.boat_model ? ` · ${post.boat_model}` : ""}
                </p>
              )}

              {post.excerpt && (
                <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
              )}

              <p className="text-xs text-brand-navy font-semibold mt-3 group-hover:underline">
                Read more →
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
