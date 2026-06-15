/**
 * api/trial-reminders/route.ts
 *
 * Cron endpoint — runs daily at midnight UTC (configured in vercel.json).
 * Secured by CRON_SECRET header.
 *
 * Queries all trialing subscriptions and sends:
 *   - Day-4 reminder: trial_ends_at is 60–84 hours from now
 *   - Day-7 reminder: trial_ends_at is 0–36 hours from now
 *
 * Uses lib/email.ts for all sends — gracefully no-ops if RESEND_API_KEY is
 * a placeholder.
 */

import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendTrialDay4Email, sendTrialDay7Email } from "@/lib/email";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Fetch all trialing subscriptions with user email
  const { data: subs, error } = await supabaseAdmin
    .from("subscriptions")
    .select("id, user_id, trial_ends_at")
    .eq("status", "trialing")
    .not("trial_ends_at", "is", null);

  if (error) {
    console.error("[trial-reminders] Failed to fetch subscriptions:", error.message);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (!subs || subs.length === 0) {
    return NextResponse.json({ sent: 0, message: "No trialing subscriptions" });
  }

  // Fetch user emails for matched subscriptions
  const userIds = subs.map((s) => s.user_id);
  const { data: users, error: usersError } = await supabaseAdmin
    .from("users")
    .select("id, email")
    .in("id", userIds);

  if (usersError) {
    console.error("[trial-reminders] Failed to fetch users:", usersError.message);
    return NextResponse.json({ error: "DB error fetching users" }, { status: 500 });
  }

  const emailMap: Record<string, string> = {};
  for (const u of users ?? []) {
    if (u.email) emailMap[u.id] = u.email;
  }

  let day4Sent = 0;
  let day7Sent = 0;
  const errors: string[] = [];

  for (const sub of subs) {
    const trialEnd = new Date(sub.trial_ends_at);
    const hoursRemaining = (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60);
    const email = emailMap[sub.user_id];

    if (!email) continue;

    try {
      if (hoursRemaining >= 60 && hoursRemaining < 84) {
        // Day 4 reminder window
        await sendTrialDay4Email({ email });
        day4Sent++;
      } else if (hoursRemaining >= 0 && hoursRemaining < 36) {
        // Day 7 reminder window
        await sendTrialDay7Email({ email });
        day7Sent++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`user ${sub.user_id}: ${msg}`);
      console.error("[trial-reminders] Email error:", msg);
    }
  }

  console.log(`[trial-reminders] day4=${day4Sent} day7=${day7Sent} errors=${errors.length}`);

  return NextResponse.json({
    day4Sent,
    day7Sent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
