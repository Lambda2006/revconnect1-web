"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const SUPPORTED_BOATS = [
  { make: "MasterCraft", models: ["X24", "NXT22", "XT23"] },
  { make: "Malibu", models: ["Wakesetter 23 LSV", "Response TXi", "21 MLX"] },
  { make: "Boston Whaler", models: ["270 Dauntless", "330 Outrage", "Montauk 170"] },
  { make: "Grady-White", models: ["Canyon 336", "Freedom 235", "Fisherman 236"] },
  { make: "Sea Ray", models: ["SPX 210", "SDX 270", "Sundancer 320"] },
];

type TopicStatus = "suggested" | "approved" | "rejected" | "generated";
interface Topic {
  id: string;
  topic: string;
  rationale: string | null;
  post_type: "general" | "model_specific";
  boat_make: string | null;
  boat_model: string | null;
  source: string;
  status: TopicStatus;
  scheduled_for: string | null;
  created_at: string;
}
interface Job {
  id: string;
  status: string;
  created_at: string;
  topic_queue_id: string;
  reviewer_notes: string | null;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    suggested: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    generated: "bg-blue-100 text-blue-700",
    running: "bg-purple-100 text-purple-700",
    needs_review: "bg-orange-100 text-orange-700",
    failed: "bg-red-100 text-red-700",
  };
  return `inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-500"}`;
}

const BLANK_FORM = {
  topic: "",
  post_type: "general" as "general" | "model_specific",
  boat_make: "",
  boat_model: "",
  scheduled_for: "",
};

export default function QueuePage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(BLANK_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null); // topic_queue_id being generated

  const load = useCallback(async () => {
    const res = await fetch("/api/hub/topics");
    if (!res.ok) { setError("Failed to load topics"); setLoading(false); return; }
    const data = await res.json();
    setTopics(data.topics ?? []);
    setJobs(data.recentJobs ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(id: string) {
    await fetch(`/api/hub/topics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    load();
  }

  async function handleReject(id: string) {
    await fetch(`/api/hub/topics/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });
    load();
  }

  async function handleGenerate(topicId: string) {
    setGenerating(topicId);
    const res = await fetch("/api/hub/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic_queue_id: topicId }),
    });
    if (!res.ok) {
      setGenerating(null);
      alert("Failed to start generation. Check console.");
      return;
    }
    const { jobId } = await res.json();
    router.push(`/hub/blog/review/${jobId}`);
  }

  async function handleAddTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!form.topic.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/hub/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: form.topic.trim(),
        post_type: form.post_type,
        boat_make: form.boat_make || null,
        boat_model: form.boat_model || null,
        scheduled_for: form.scheduled_for || null,
      }),
    });
    setSubmitting(false);
    if (res.ok) { setForm(BLANK_FORM); load(); }
    else alert("Failed to add topic.");
  }

  const availableModels =
    SUPPORTED_BOATS.find((b) => b.make === form.boat_make)?.models ?? [];

  const suggested = topics.filter((t) => t.status === "suggested");
  const approved = topics.filter((t) => t.status === "approved");

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2240]">Blog Topic Queue</h1>
          <p className="text-sm text-gray-500 mt-0.5">Management Hub</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/blog" className="text-xs text-gray-400 underline" target="_blank" rel="noopener noreferrer">
            View live blog →
          </a>
          <a href="/hub/blog/settings" className="text-xs text-gray-400 underline">
            Settings
          </a>
        </div>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* ── Suggested topics ─────────────────────────────────────── */}
      {suggested.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-[#0A2240] mb-3">
            Pending Approval ({suggested.length})
          </h2>
          <div className="space-y-2">
            {suggested.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0A2240] text-sm">{t.topic}</p>
                    {t.rationale && (
                      <p className="text-xs text-gray-500 mt-0.5 italic">{t.rationale}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={statusBadge(t.status)}>{t.status}</span>
                      <span className="text-xs text-gray-400">
                        {t.post_type === "model_specific"
                          ? `${t.boat_make ?? ""}${t.boat_model ? " · " + t.boat_model : ""}`
                          : "General"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(t.id)}
                      className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(t.id)}
                      className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Approved topics (ready to generate) ─────────────────── */}
      {approved.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-[#0A2240] mb-3">
            Ready to Generate ({approved.length})
          </h2>
          <div className="space-y-2">
            {approved.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0A2240] text-sm">{t.topic}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className={statusBadge("approved")}>approved</span>
                      <span className="text-xs text-gray-400">
                        {t.source === "custom" ? "Custom" : "AI suggested"}
                      </span>
                      {t.post_type === "model_specific" && t.boat_make && (
                        <span className="text-xs text-[#C8102E] font-medium">
                          {t.boat_make}{t.boat_model ? ` · ${t.boat_model}` : ""}
                        </span>
                      )}
                      {t.scheduled_for && (
                        <span className="text-xs text-gray-400">
                          Scheduled: {new Date(t.scheduled_for).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleGenerate(t.id)}
                    disabled={generating === t.id}
                    className="px-4 py-1.5 text-xs font-bold bg-[#0A2240] text-white rounded-lg hover:bg-[#0d2d55] disabled:opacity-50 transition-colors flex-shrink-0"
                  >
                    {generating === t.id ? "Starting…" : "Generate Article"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Recent generation jobs ───────────────────────────────── */}
      {jobs.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-[#0A2240] mb-3">Recent Jobs</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {jobs.map((j) => (
              <div key={j.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={statusBadge(j.status)}>{j.status}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(j.created_at).toLocaleString()}
                  </span>
                  {j.reviewer_notes && j.status === "failed" && (
                    <span className="text-xs text-red-500 truncate max-w-xs" title={j.reviewer_notes}>
                      {j.reviewer_notes}
                    </span>
                  )}
                </div>
                {["running", "needs_review"].includes(j.status) && (
                  <a
                    href={`/blog/review/${j.id}`}
                    className="text-xs font-semibold text-[#0A2240] underline flex-shrink-0"
                  >
                    {j.status === "running" ? "View progress →" : "Review →"}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Add custom topic form ────────────────────────────────── */}
      <section>
        <h2 className="text-base font-bold text-[#0A2240] mb-3">Add Custom Topic</h2>
        <form onSubmit={handleAddTopic} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Topic *</label>
            <input
              type="text"
              required
              value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              placeholder="e.g. MasterCraft X24 winterization guide"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Post Type *</label>
              <select
                value={form.post_type}
                onChange={(e) => setForm((f) => ({ ...f, post_type: e.target.value as any, boat_make: "", boat_model: "" }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
              >
                <option value="general">General</option>
                <option value="model_specific">Model-Specific</option>
              </select>
            </div>

            {form.post_type === "model_specific" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Make</label>
                  <select
                    value={form.boat_make}
                    onChange={(e) => setForm((f) => ({ ...f, boat_make: e.target.value, boat_model: "" }))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
                  >
                    <option value="">Select make</option>
                    {SUPPORTED_BOATS.map((b) => (
                      <option key={b.make} value={b.make}>{b.make}</option>
                    ))}
                  </select>
                </div>

                {form.boat_make && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Model</label>
                    <select
                      value={form.boat_model}
                      onChange={(e) => setForm((f) => ({ ...f, boat_model: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
                    >
                      <option value="">All models</option>
                      {availableModels.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Scheduled Date</label>
              <input
                type="date"
                value={form.scheduled_for}
                onChange={(e) => setForm((f) => ({ ...f, scheduled_for: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !form.topic.trim()}
            className="px-5 py-2 text-sm font-bold bg-[#C8102E] text-white rounded-lg hover:bg-[#a80e26] disabled:opacity-50 transition-colors"
          >
            {submitting ? "Adding…" : "Add Topic"}
          </button>
        </form>
      </section>

      {!loading && topics.length === 0 && jobs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium text-[#0A2240]">No topics in queue</p>
          <p className="text-sm mt-1">Add a custom topic above to get started.</p>
        </div>
      )}
    </div>
  );
}
