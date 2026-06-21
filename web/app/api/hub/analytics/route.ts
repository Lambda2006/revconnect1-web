import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/hub/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

// Known plan pricing
const PLAN_PRICE: Record<string, number> = {
  app_and_agent: 9.99,
  app_only: 0,
};

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const [
    subsResult,
    usersResult,
    boatsResult,
    postsResult,
    meetupsResult,
    agentResult,
    weeklySignupsResult,
    weeklySessionsResult,
    avgMessagesResult,
  ] = await Promise.all([
    // Subscription breakdown
    supabaseAdmin
      .from("subscriptions")
      .select("plan, status, canceled_at, created_at"),

    // Total users + new last 30d
    supabaseAdmin.rpc("get_analytics_users" as never).then(() => null).catch(() => null)
      .then(() =>
        supabaseAdmin
          .from("users")
          .select("id, created_at")
      ),

    // Boats
    supabaseAdmin.from("boats").select("id", { count: "exact", head: true }),

    // Published posts
    supabaseAdmin
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),

    // Meetups
    supabaseAdmin.from("meetups").select("id", { count: "exact", head: true }),

    // Agent sessions
    supabaseAdmin.from("agent_sessions").select("id, started_at"),

    // Weekly signups (last 8 weeks)
    supabaseAdmin.rpc("weekly_user_signups" as never).catch(() => ({ data: null })).then(() =>
      supabaseAdmin
        .from("users")
        .select("created_at")
        .gte("created_at", new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString())
    ),

    // Weekly agent sessions (last 8 weeks)
    supabaseAdmin
      .from("agent_sessions")
      .select("started_at")
      .gte("started_at", new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString()),

    // Avg messages per session
    supabaseAdmin
      .from("agent_sessions")
      .select("messages"),
  ]);

  // ── Subscription metrics ───────────────────────────────────────────────────
  const subs = (subsResult.data ?? []) as Array<{
    plan: string; status: string; canceled_at: string | null; created_at: string;
  }>;
  const active      = subs.filter(s => s.status === "active");
  const trialing    = subs.filter(s => s.status === "trialing");
  const canceled    = subs.filter(s => s.canceled_at !== null);
  const mrr         = active.reduce((sum, s) => sum + (PLAN_PRICE[s.plan] ?? 0), 0);
  const subsByPlan  = active.reduce<Record<string, number>>((acc, s) => {
    acc[s.plan] = (acc[s.plan] ?? 0) + 1;
    return acc;
  }, {});

  // ── User metrics ───────────────────────────────────────────────────────────
  const users      = (usersResult?.data ?? []) as Array<{ id: string; created_at: string }>;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const newUsers30d   = users.filter(u => u.created_at >= thirtyDaysAgo).length;

  // ── Agent session metrics ──────────────────────────────────────────────────
  const sessions     = (agentResult.data ?? []) as Array<{ id: string; started_at: string }>;
  const sessions30d  = sessions.filter(s => s.started_at >= thirtyDaysAgo).length;

  const allMessages = (avgMessagesResult.data ?? []) as Array<{ messages: unknown[] | null }>;
  const avgMessages = allMessages.length
    ? Math.round(
        allMessages.reduce((sum, s) => sum + (Array.isArray(s.messages) ? s.messages.length : 0), 0) /
        allMessages.length
      )
    : 0;

  // ── Weekly trend helpers ───────────────────────────────────────────────────
  const buildWeeklyBuckets = (dates: string[]) => {
    const now = Date.now();
    const buckets: { label: string; count: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd   = new Date(now - (i - 1) * 7 * 24 * 60 * 60 * 1000);
      const label = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const count = dates.filter(d => d >= weekStart.toISOString() && d < weekEnd.toISOString()).length;
      buckets.push({ label, count });
    }
    return buckets;
  };

  const signupDates  = (weeklySignupsResult?.data ?? []).map((u: { created_at: string }) => u.created_at);
  const sessionDates = (weeklySessionsResult.data ?? []).map((s: { started_at: string }) => s.started_at);

  return NextResponse.json({
    revenue: {
      mrr: Math.round(mrr * 100) / 100,
      activeCount:   active.length,
      trialingCount: trialing.length,
      canceledCount: canceled.length,
      byPlan: subsByPlan,
    },
    users: {
      total:    users.length,
      new30d:   newUsers30d,
      boats:    boatsResult.count ?? 0,
    },
    agent: {
      totalSessions:  sessions.length,
      sessions30d,
      avgMessagesPerSession: avgMessages,
    },
    content: {
      publishedPosts: postsResult.count ?? 0,
      meetups:        meetupsResult.count ?? 0,
    },
    trends: {
      weeklySignups:  buildWeeklyBuckets(signupDates),
      weeklySessions: buildWeeklyBuckets(sessionDates),
    },
  });
}
