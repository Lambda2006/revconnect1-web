"use client";

import React, { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type WeekBucket = { label: string; count: number };

type Analytics = {
  revenue: {
    mrr: number;
    activeCount: number;
    trialingCount: number;
    canceledCount: number;
    byPlan: Record<string, number>;
  };
  users: {
    total: number;
    new30d: number;
    boats: number;
  };
  agent: {
    totalSessions: number;
    sessions30d: number;
    avgMessagesPerSession: number;
  };
  content: {
    publishedPosts: number;
    meetups: number;
  };
  trends: {
    weeklySignups: WeekBucket[];
    weeklySessions: WeekBucket[];
  };
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent ?? "text-[#0A2240]"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({ data, color }: { data: WeekBucket[]; color: string }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-24 w-full">
      {data.map((bucket, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
            <div
              className={`w-full rounded-t-sm transition-all ${color}`}
              style={{ height: `${Math.max((bucket.count / max) * 80, bucket.count > 0 ? 4 : 0)}px` }}
              title={`${bucket.count}`}
            />
          </div>
          <span className="text-[9px] text-gray-400 text-center leading-tight truncate w-full text-center">
            {bucket.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-lg">{icon}</span>
      <h2 className="text-base font-bold text-[#0A2240]">{title}</h2>
      <div className="flex-1 h-px bg-gray-200 ml-2" />
    </div>
  );
}

// ─── Plan Row ─────────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, string> = {
  app_and_agent: "App + AI Mechanic",
  app_only:      "App Only",
};

const PLAN_PRICE: Record<string, number> = {
  app_and_agent: 9.99,
  app_only:      0,
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [data, setData]       = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hub/analytics")
      .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(d.error ?? "Failed")))
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading analytics…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Failed to load analytics: {error}
        </div>
      </div>
    );
  }

  const { revenue, users, agent, content, trends } = data;

  return (
    <div className="p-6 max-w-5xl space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A2240]">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Last updated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* ── Top KPIs ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Monthly Recurring Revenue"
          value={`$${revenue.mrr.toFixed(2)}`}
          sub={`${revenue.activeCount} paying subscriber${revenue.activeCount !== 1 ? "s" : ""}`}
          accent="text-green-600"
        />
        <StatCard
          label="Total Users"
          value={users.total}
          sub={`+${users.new30d} in last 30 days`}
        />
        <StatCard
          label="Agent Sessions (30d)"
          value={agent.sessions30d}
          sub={`${agent.totalSessions} total`}
        />
        <StatCard
          label="Published Posts"
          value={content.publishedPosts}
          sub={`${content.meetups} meetup${content.meetups !== 1 ? "s" : ""} created`}
        />
      </div>

      {/* ── Revenue ───────────────────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Revenue" icon="💰" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Subscriber breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Subscribers by Plan</p>
            <div className="space-y-3">
              {Object.entries(revenue.byPlan).length === 0 ? (
                <p className="text-sm text-gray-400 italic">No active subscribers</p>
              ) : (
                Object.entries(revenue.byPlan).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#0A2240]">{PLAN_LABELS[plan] ?? plan}</p>
                      <p className="text-xs text-gray-400">${PLAN_PRICE[plan]?.toFixed(2) ?? "—"}/mo per user</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#0A2240]">{count}</p>
                      <p className="text-xs text-green-600 font-medium">
                        ${((PLAN_PRICE[plan] ?? 0) * count).toFixed(2)}/mo
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-600">Total MRR</span>
                <span className="text-xl font-bold text-green-600">${revenue.mrr.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Subscriber status */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Subscription Status</p>
            <div className="space-y-3">
              {[
                { label: "Active",   value: revenue.activeCount,   color: "bg-green-500" },
                { label: "Trialing", value: revenue.trialingCount, color: "bg-blue-400" },
                { label: "Canceled", value: revenue.canceledCount, color: "bg-red-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
                  <span className="text-sm text-gray-600 flex-1">{label}</span>
                  <span className="text-sm font-bold text-[#0A2240]">{value}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400">
                  ARR estimate:{" "}
                  <span className="font-semibold text-[#0A2240]">
                    ${(revenue.mrr * 12).toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Growth Trends ─────────────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Growth Trends (8 Weeks)" icon="📈" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Weekly Signups</p>
            <BarChart data={trends.weeklySignups} color="bg-[#0A2240]" />
            <p className="text-xs text-gray-400 mt-3 text-right">
              Total: <span className="font-semibold text-[#0A2240]">
                {trends.weeklySignups.reduce((s, b) => s + b.count, 0)}
              </span>
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Weekly Agent Sessions</p>
            <BarChart data={trends.weeklySessions} color="bg-[#C8102E]" />
            <p className="text-xs text-gray-400 mt-3 text-right">
              Total: <span className="font-semibold text-[#0A2240]">
                {trends.weeklySessions.reduce((s, b) => s + b.count, 0)}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Product Usage ─────────────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Product Usage" icon="⚙️" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Boats Registered"         value={users.boats} />
          <StatCard label="Boats per User"            value={users.total ? (users.boats / users.total).toFixed(1) : "—"} />
          <StatCard label="Avg Messages / AI Session" value={agent.avgMessagesPerSession} />
          <StatCard label="Meetups Created"           value={content.meetups} />
        </div>
      </section>

    </div>
  );
}
