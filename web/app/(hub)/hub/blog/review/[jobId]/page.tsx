"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

// ── Slug helper ───────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Job {
  id: string;
  status: "running" | "needs_review" | "approved" | "rejected" | "failed";
  draft_content_md: string | null;
  draft_source_urls: string[];
  reviewer_notes: string | null;
  created_at: string;
  blog_topic_queue: {
    topic: string;
    post_type: "general" | "model_specific";
    boat_make: string | null;
    boat_model: string | null;
  } | null;
}

// ── Simple markdown preview (reuse same pattern as consumer blog) ─────────────
function Preview({ markdown }: { markdown: string }) {
  // Minimal preview — replace headings, bold, lists for readability
  const lines = markdown.split("\n");
  return (
    <div className="text-sm text-gray-700 space-y-2 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) return <h3 key={i} className="font-bold text-[#0A2240] text-base mt-3">{line.slice(4)}</h3>;
        if (line.startsWith("## ")) return <h2 key={i} className="font-bold text-[#0A2240] text-lg mt-4">{line.slice(3)}</h2>;
        if (line.startsWith("# ")) return <h1 key={i} className="font-bold text-[#0A2240] text-xl mt-4">{line.slice(2)}</h1>;
        if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
        if (line.match(/^\d+\.\s/)) return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\.\s/, "")}</li>;
        if (line.trim() === "") return <div key={i} className="h-2" />;
        return <p key={i}>{line.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
      })}
    </div>
  );
}

export default function ReviewPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Editable fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [postType, setPostType] = useState<"general" | "model_specific">("general");
  const [boatMake, setBoatMake] = useState("");
  const [boatModel, setBoatModel] = useState("");
  const [contentMd, setContentMd] = useState("");
  const [preview, setPreview] = useState(false);

  // Reject state
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejectDisposition, setRejectDisposition] = useState<"regenerate" | "permanent">("regenerate");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const fetchJob = useCallback(async () => {
    const res = await fetch(`/api/hub/review/${jobId}`);
    if (!res.ok) { setError("Job not found."); return; }
    const { job: data }: { job: Job } = await res.json();
    setJob(data);

    if (data.status === "needs_review" && !contentMd) {
      // Pre-fill editable fields from draft + topic
      const topic = data.blog_topic_queue;
      setContentMd(data.draft_content_md ?? "");
      setPostType(topic?.post_type ?? "general");
      setBoatMake(topic?.boat_make ?? "");
      setBoatModel(topic?.boat_model ?? "");
      // Extract first H1 from markdown as title suggestion
      const h1 = (data.draft_content_md ?? "").match(/^#\s+(.+)$/m)?.[1] ?? topic?.topic ?? "";
      setTitle(h1);
      if (!slugManual) setSlug(slugify(h1));
    }
  }, [jobId, contentMd, slugManual]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  // Poll while running
  useEffect(() => {
    if (job?.status === "running") {
      pollRef.current = setInterval(fetchJob, 4000);
    } else {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [job?.status, fetchJob]);

  // Auto-update slug from title unless manually overridden
  useEffect(() => {
    if (!slugManual) setSlug(slugify(title));
  }, [title, slugManual]);

  async function handleApprove() {
    if (!title.trim() || !slug.trim() || !contentMd.trim()) {
      alert("Title, slug, and content are required.");
      return;
    }
    setSubmitting(true);
    const res = await fetch(`/api/hub/review/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approve",
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content_md: contentMd,
        post_type: postType,
        boat_make: boatMake || null,
        boat_model: boatModel || null,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const err = await res.json();
      alert(err.error ?? "Approval failed.");
      return;
    }
    const { slug: finalSlug } = await res.json();
    router.push(`/blog/${finalSlug}`);
  }

  async function handleReject() {
    if (!rejectNotes.trim()) { alert("Rejection reason is required."); return; }
    setSubmitting(true);
    await fetch(`/api/hub/review/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reject",
        reviewer_notes: rejectNotes.trim(),
        topic_disposition: rejectDisposition,
      }),
    });
    setSubmitting(false);
    router.push("/hub/blog/queue");
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-center text-red-500">{error}</div>
  );

  if (!job) return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-center text-gray-400">Loading…</div>
  );

  // Running — show polling spinner
  if (job.status === "running") return (
    <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-[#0A2240] border-t-transparent rounded-full animate-spin" />
      <p className="font-semibold text-[#0A2240] text-lg">Generating article…</p>
      <p className="text-sm text-gray-500">
        Claude is researching and writing the draft. This usually takes 30–90 seconds.
      </p>
      <p className="text-xs text-gray-400">Topic: {job.blog_topic_queue?.topic}</p>
      <a href="/hub/blog/queue" className="text-xs text-gray-400 underline mt-4">
        ← Back to queue (you can return here later)
      </a>
    </div>
  );

  // Failed
  if (job.status === "failed") return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <p className="font-bold text-red-700">Generation failed</p>
        <p className="text-sm text-red-600 mt-1 font-mono whitespace-pre-wrap">
          {job.reviewer_notes ?? "Unknown error"}
        </p>
      </div>
      <a href="/hub/blog/queue" className="text-sm text-[#0A2240] underline">
        ← Back to queue
      </a>
    </div>
  );

  // Already approved/rejected
  if (job.status === "approved" || job.status === "rejected") return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      <div className={`rounded-xl border p-5 ${job.status === "approved" ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
        <p className={`font-bold ${job.status === "approved" ? "text-green-700" : "text-gray-600"}`}>
          This draft was {job.status}.
        </p>
        {job.reviewer_notes && (
          <p className="text-sm text-gray-500 mt-1">{job.reviewer_notes}</p>
        )}
      </div>
      <a href="/hub/blog/queue" className="text-sm text-[#0A2240] underline">← Back to queue</a>
    </div>
  );

  // needs_review — full editor
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <a href="/hub/blog/queue" className="text-xs text-gray-400 underline">← Queue</a>
          <h1 className="text-xl font-bold text-[#0A2240] mt-1">Review Draft</h1>
          <p className="text-sm text-gray-500">{job.blog_topic_queue?.topic}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreview((p) => !p)}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={handleApprove}
            disabled={submitting}
            className="px-5 py-2 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Saving…" : "✓ Approve & Publish"}
          </button>
          <button
            onClick={() => setShowRejectForm((v) => !v)}
            disabled={submitting}
            className="px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>

      {/* Reviewer notes from generation */}
      {job.reviewer_notes && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
          ⚠️ {job.reviewer_notes}
        </div>
      )}

      {/* Reject form */}
      {showRejectForm && (
        <div className="bg-white rounded-xl border border-red-200 p-5 space-y-3">
          <p className="font-semibold text-[#0A2240] text-sm">Reject this draft</p>
          <textarea
            rows={3}
            placeholder="Reason for rejection (required)…"
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <div className="flex gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                value="regenerate"
                checked={rejectDisposition === "regenerate"}
                onChange={() => setRejectDisposition("regenerate")}
              />
              Reject &amp; allow regeneration (topic stays approved)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                value="permanent"
                checked={rejectDisposition === "permanent"}
                onChange={() => setRejectDisposition("permanent")}
              />
              Reject permanently (removes topic from queue)
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={submitting || !rejectNotes.trim()}
              className="px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Confirm Reject
            </button>
            <button onClick={() => setShowRejectForm(false)} className="px-4 py-2 text-sm text-gray-500">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Meta fields */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Post Metadata</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Slug * <span className="font-normal text-gray-400">(auto from title)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Excerpt</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary shown in the blog list…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Post Type</label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as any)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
            >
              <option value="general">General</option>
              <option value="model_specific">Model-Specific</option>
            </select>
          </div>
          {postType === "model_specific" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Boat Make</label>
                <input
                  type="text"
                  value={boatMake}
                  onChange={(e) => setBoatMake(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Boat Model</label>
                <input
                  type="text"
                  value={boatModel}
                  onChange={(e) => setBoatModel(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content editor / preview */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {preview ? "Preview" : "Markdown Editor"}
          </span>
          <span className="text-xs text-gray-400">{contentMd.length} chars</span>
        </div>
        <div className="p-4">
          {preview ? (
            <Preview markdown={contentMd} />
          ) : (
            <textarea
              rows={24}
              value={contentMd}
              onChange={(e) => setContentMd(e.target.value)}
              className="w-full font-mono text-sm text-gray-700 focus:outline-none resize-y"
              spellCheck={false}
            />
          )}
        </div>
      </div>

      {/* Source URLs */}
      {job.draft_source_urls?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
            Sources ({job.draft_source_urls.length})
          </p>
          <div className="space-y-1.5">
            {job.draft_source_urls.map((url, i) => {
              let hostname = url;
              try { hostname = new URL(url).hostname.replace(/^www\./, ""); } catch {}
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#0A2240] w-20 flex-shrink-0">{hostname}</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 truncate hover:text-blue-600 transition-colors"
                    title={url}
                  >
                    {url}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
