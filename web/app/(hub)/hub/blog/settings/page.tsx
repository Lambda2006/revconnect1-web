"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface Config {
  day_of_week: number;
  auto_publish_if_idle: boolean;
  reminder_email: string | null;
  reminder_enabled: boolean;
  last_run_at: string | null;
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A2240] focus:ring-offset-2 ${
        checked ? "bg-[#0A2240]" : "bg-gray-200"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function BlogSettingsPage() {
  const [config, setConfig] = useState<Config>({
    day_of_week: 1,
    auto_publish_if_idle: false,
    reminder_email: "",
    reminder_enabled: false,
    last_run_at: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/hub/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setConfig({
            ...data.config,
            reminder_email: data.config.reminder_email ?? "",
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load settings.");
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/hub/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        day_of_week: config.day_of_week,
        auto_publish_if_idle: config.auto_publish_if_idle,
        reminder_email: config.reminder_email || null,
        reminder_enabled: config.reminder_enabled,
      }),
    });

    setSaving(false);

    if (res.ok) {
      setSavedAt(new Date());
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save settings.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/hub/blog/queue"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Queue
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0A2240]">Blog Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Management Hub</p>
        </div>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}

      {!loading && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* ── Cron schedule ──────────────────────────────────────────── */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-[#0A2240] uppercase tracking-wide">
              Weekly Cron Schedule
            </h2>
            <p className="text-xs text-gray-500">
              The blog-pipeline cron runs weekly. Select which day topic
              suggestions are scheduled for. Note: the Vercel cron itself is
              fixed to Monday midnight UTC in{" "}
              <code className="text-xs bg-gray-100 px-1 rounded">vercel.json</code>
              {" "}— changing this setting adjusts the{" "}
              <code className="text-xs bg-gray-100 px-1 rounded">scheduled_for</code>{" "}
              date on new suggestions, but does not change when the cron fires.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Suggestion target day
              </label>
              <select
                value={config.day_of_week}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    day_of_week: Number(e.target.value),
                  }))
                }
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
              >
                {DAY_NAMES.map((name, i) => (
                  <option key={i} value={i}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {config.last_run_at && (
              <p className="text-xs text-gray-400">
                Last cron run:{" "}
                {new Date(config.last_run_at).toLocaleString()}
              </p>
            )}
          </section>

          {/* ── Auto-publish if idle ────────────────────────────────────── */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-sm font-bold text-[#0A2240] uppercase tracking-wide">
              Idle Promotion
            </h2>
            <p className="text-xs text-gray-500">
              If no approved topic is due on the scheduled day, automatically
              promote the top AI-suggested topic from that run and trigger
              article generation.{" "}
              <span className="font-semibold text-gray-600">
                Drafts still land in needs_review — nothing is ever
                auto-published.
              </span>
            </p>
            <div className="flex items-center gap-3">
              <Toggle
                checked={config.auto_publish_if_idle}
                onChange={(v) =>
                  setConfig((c) => ({ ...c, auto_publish_if_idle: v }))
                }
              />
              <span className="text-sm text-gray-700">
                {config.auto_publish_if_idle
                  ? "Enabled — promote and generate when idle"
                  : "Disabled — skip generation if no approved topic"}
              </span>
            </div>
          </section>

          {/* ── Email reminders ─────────────────────────────────────────── */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <h2 className="text-sm font-bold text-[#0A2240] uppercase tracking-wide">
                Email Reminders
              </h2>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                Requires Resend setup
              </span>
            </div>
            <p className="text-xs text-gray-500">
              When Resend is configured, the cron can send reminders when topics
              need review and when a draft is ready for approval.{" "}
              <code className="text-xs bg-gray-100 px-1 rounded">
                RESEND_API_KEY
              </code>{" "}
              is currently a placeholder — set it in Vercel environment
              variables to activate emails.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Reminder email address
              </label>
              <input
                type="email"
                value={config.reminder_email ?? ""}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, reminder_email: e.target.value }))
                }
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
              />
            </div>

            <div className="flex items-center gap-3">
              <Toggle
                checked={config.reminder_enabled}
                onChange={(v) =>
                  setConfig((c) => ({ ...c, reminder_enabled: v }))
                }
              />
              <span className="text-sm text-gray-700">
                {config.reminder_enabled
                  ? "Reminders enabled (no-op until Resend is set up)"
                  : "Reminders disabled"}
              </span>
            </div>
          </section>

          {/* ── Actions ─────────────────────────────────────────────────── */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {savedAt && !error && (
            <p className="text-sm text-green-600">
              Settings saved at {savedAt.toLocaleTimeString()}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-bold bg-[#0A2240] text-white rounded-lg hover:bg-[#0d2d55] disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Save Settings"}
            </button>
            <Link
              href="/hub/blog/queue"
              className="px-5 py-2 text-sm font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
