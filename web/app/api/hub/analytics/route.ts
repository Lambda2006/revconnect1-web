import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/hub/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

const PLAN_PRICE: Record<string, number> = {
  app_and_agent: 9.99,
  app_only: 0,
};

// Safe wrapper — returns data or [] / 0 on any error
async function safeQuery<T>(
  promise: Promise<{ data: T | null; error: unknown; count?: number | null }>
): Promise<{ data: T; count: number }> {
  try {
    const result = await promise;
    return { data: (result.data ?? []) as T, count: result.count ?? 0 };
  } catch {
    return { data: [] as unknown as T, count: 0 };
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (admin instanceof NextResponse) return admin;

    const cutoff56d = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString();
    const cutoff30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      subs,
      users,
      boatsCount,
      postsCount,
      meetupsCount,
      sessions,
      recentSignups,
      recentSessions,
      sessionMessages,
    ] = await Promise.all([
      safeQuery(supabaseAdmin.from("subscriptions").select("plan, status, canceled_at, created_at")),
      safeQuery(supabaseAdmin.from("users").select("id, created_at")),
      safeQuery(supabaseAdmin.from("boats").select("id", { count: "exact", head: true })),
      safeQuery(supabaseAdmin.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published")),
      safeQuery(supabaseAdmin.from("meetups").select("id", { count: "exact", head: true })),
      safeQuery(supabaseAdmin.from("agent_sessions").select("id, started_at")),
      safeQuery(supabaseAdmin.from("users").select("created_at").gte("created_at", cutoff56d)),
      safeQuery(supabaseAdmin.from("agent_sessions").select("started_at").gte("started_at", cutoff56d)),
      safeQuery(supabaseAdmin.from("agent_sessions").select("messages")),
    ]);

    // ── Subscription metrics ─────────────────────────────────────────────────
    type Sub = { plan: string; status: string; canceled_at: string | null };
    const subRows  = subs.data as Sub[];
    const active   = subRows.filter(s => s.status === "active");
    const trialing = subRows.filter(s => s.status === "trialing");
    const canceled = subRows.filter(s => s.canceled_at !== null);
    const mrr      = active.reduce((sum, s) => sum + (PLAN_PRICE[s.plan] ?? 0), 0);
    const byPlan   = active.reduce<Record<string, number>>((acc, s) => {
      acc[s.plan] = (acc[s.plan] ?? 0) + 1;
      return acc;
    }, {});

    // ── User metrics ─────────────────────────────────────────────────────────
    type User = { id: string; created_at: string };
    const userRows = users.data as User[];
    const new30d   = userRows.filter(u => u.created_at >= cutoff30d).length;

    // ── Agent metrics ────────────────────────────────────────────────────────
    type Session = { id: string; started_at: string };
    const sessionRows = sessions.data as Session[];
    const sessions30d = sessionRows.filter(s => s.started_at >= cutoff30d).length;

    type MsgRow = { messages: unknown[] | null };
    const msgRows     = sessionMessages.data as MsgRow[];
    const avgMessages = msgRows.length
      ? Math.round(
          msgRows.reduce((sum, s) => sum + (Array.isArray(s.messages) ? s.messages.length : 0), 0) /
          msgRows.length
        )
      : 0;

    // ── Weekly buckets ───────────────────────────────────────────────────────
    const buildWeeklyBuckets = (dates: string[]) => {
      const now = Date.now();
      return Array.from({ length: 8 }, (_, idx) => {
        const i         = 7 - idx;
        const weekStart = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
        const weekEnd   = new Date(now - (i - 1) * 7 * 24 * 60 * 60 * 1000);
        const label     = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const count     = dates.filter(d => d >= weekStart.toISOString() && d < weekEnd.toISOString()).length;
        return { label, count };
      });
    };

    const signupDates  = (recentSignups.data  as { created_at: string }[]).map(u => u.created_at);
    const sessionDates = (recentSessions.data as { started_at: string }[]).map(s => s.started_at);

    return NextResponse.json({
      revenue: {
        mrr:           Math.round(mrr * 100) / 100,
        activeCount:   active.length,
        trialingCount: trialing.length,
        canceledCount: canceled.length,
        byPlan,
      },
      users: {
        total:  userRows.length,
        new30d,
        boats:  boatsCount.count,
      },
      agent: {
        totalSessions:         sessionRows.length,
        sessions30d,
        avgMessagesPerSession: avgMessages,
      },
      content: {
        publishedPosts: postsCount.count,
        meetups:        meetupsCount.count,
      },
      trends: {
        weeklySignups:  buildWeeklyBuckets(signupDates),
        weeklySessions: buildWeeklyBuckets(sessionDates),
      },
    });
  } catch (err) {
    console.error("[analytics] Unhandled error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
