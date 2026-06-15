/**
 * api/cron/blog-pipeline/route.ts
 *
 * Weekly cron — default Monday midnight UTC (configured in vercel.json).
 * Secured by CRON_SECRET header (same pattern as /api/trial-reminders).
 *
 * Step 1 — Suggest: Query agent_sessions from the last 14 days, extract
 *   topic signals (recurring questions, recommendProfessional flags), ask
 *   Claude to synthesize 3–5 blog topic suggestions, insert into
 *   blog_topic_queue (status: 'suggested', source: 'ai_suggested').
 *
 * Step 2 — Auto-fallback: If any topic has status='approved' and
 *   scheduled_for <= today, trigger generation for the earliest one.
 *
 * Step 3 — Idle promotion: If no approved topic is due AND
 *   blog_schedule_config.auto_publish_if_idle = true, promote the top
 *   ai_suggested topic from this run → status: 'approved', source:
 *   'auto_default', and trigger generation immediately.
 *
 * NOTE: Steps 2 and 3 never auto-publish. Generated drafts always land in
 * blog_generation_jobs.status = 'needs_review' and require human approval
 * via /hub/blog/review/[jobId]. This is non-negotiable per the blueprint.
 *
 * Step 4 — Update blog_schedule_config.last_run_at.
 */

import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase/server";
import { generateBlogPost } from "@/lib/blog/generate";

// ── Auth ─────────────────────────────────────────────────────────────────────

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  return !!(cronSecret && authHeader === `Bearer ${cronSecret}`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the YYYY-MM-DD of the next occurrence of a given weekday (0=Sun, 1=Mon …).
 *  If today is that weekday, returns next week's. */
function nextWeekday(dayOfWeek: number): string {
  const now = new Date();
  const currentDay = now.getDay();
  const daysUntil = ((dayOfWeek - currentDay + 7) % 7) || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntil);
  return next.toISOString().split("T")[0];
}

/** Returns today's date as YYYY-MM-DD (UTC). */
function todayUTC(): string {
  return new Date().toISOString().split("T")[0];
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Load config (single-row table; defaults if missing)
  const { data: config } = await supabaseAdmin
    .from("blog_schedule_config")
    .select("*")
    .limit(1)
    .maybeSingle();

  const dayOfWeek: number = config?.day_of_week ?? 1; // default Monday
  const autoPublishIfIdle: boolean = config?.auto_publish_if_idle ?? false;

  const results = {
    suggestionsInserted: 0,
    autoFallback: false,
    idlePromotion: false,
    errors: [] as string[],
  };

  // ── Step 1: Suggest topics from agent session signals ──────────────────────
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);

    // Fetch recent sessions with boat context
    const { data: sessions, error: sessErr } = await supabaseAdmin
      .from("agent_sessions")
      .select("id, boat_id, messages, started_at, boats(make, model, year)")
      .gte("started_at", cutoff.toISOString())
      .order("started_at", { ascending: false })
      .limit(200);

    if (sessErr) {
      throw new Error(`agent_sessions query failed: ${sessErr.message}`);
    }

    // Extract signals from each session
    type Signal = {
      make: string;
      model: string;
      userQuestion: string;
      recommendProfessional: boolean;
    };

    const signals: Signal[] = [];

    for (const session of sessions ?? []) {
      // boats may come back as object or array depending on join type
      const boat = Array.isArray(session.boats)
        ? session.boats[0]
        : session.boats;
      if (!boat) continue;

      const messages: Array<{ role: string; content: string }> =
        Array.isArray(session.messages) ? session.messages : [];

      let lastUserQuestion = "";
      let hadRecommendProfessional = false;

      for (const msg of messages) {
        if (msg.role === "user") {
          lastUserQuestion = msg.content ?? "";
        }
        if (msg.role === "assistant") {
          try {
            const parsed = JSON.parse(msg.content ?? "{}");
            if (parsed?.recommendProfessional === true) {
              hadRecommendProfessional = true;
            }
          } catch {
            // Non-JSON assistant message; skip
          }
        }
      }

      if (lastUserQuestion.trim()) {
        signals.push({
          make: boat.make ?? "",
          model: boat.model ?? "",
          userQuestion: lastUserQuestion.slice(0, 300),
          recommendProfessional: hadRecommendProfessional,
        });
      }
    }

    if (signals.length > 0) {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

      const signalSummary = signals
        .map(
          (s) =>
            `- ${s.make} ${s.model}: "${s.userQuestion}"${
              s.recommendProfessional ? " [AI recommended professional service]" : ""
            }`
        )
        .join("\n");

      const synthesis = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        system: `You are a content strategist for VictoryRevConnect Boaters, a platform for owners of MasterCraft, Malibu, Boston Whaler, Grady-White, and Sea Ray vessels. You analyze user questions from an AI Mechanic chat feature to identify high-value blog post opportunities — topics where a comprehensive guide would help users self-serve without needing to ask the AI each time.`,
        messages: [
          {
            role: "user",
            content: `Based on these recent user questions from the AI Mechanic (last 14 days), identify 3–5 high-value blog post topics. Prioritize:
1. Recurring question patterns (multiple users asked similar things)
2. Topics where the AI recommended professional service — these deserve a comprehensive guide
3. Make/model-specific issues that affect a particular boat line

User questions:
${signalSummary}

Respond with ONLY a JSON array (no explanation, no markdown):
[
  {
    "topic": "Descriptive blog post title",
    "post_type": "general" or "model_specific",
    "boat_make": null or make name (e.g. "MasterCraft"),
    "boat_model": null or model name (e.g. "X24"),
    "rationale": "One sentence: why this topic is valuable based on the session signals"
  }
]`,
          },
        ],
      });

      // Parse Claude's JSON response
      let suggestions: Array<{
        topic: string;
        post_type: "general" | "model_specific";
        boat_make: string | null;
        boat_model: string | null;
        rationale: string;
      }> = [];

      for (const block of synthesis.content) {
        if (block.type === "text") {
          const jsonMatch = block.text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            try {
              suggestions = JSON.parse(jsonMatch[0]);
            } catch {
              console.error("[blog-pipeline] failed to parse Claude suggestion JSON:", block.text.slice(0, 200));
            }
          }
        }
      }

      if (suggestions.length > 0) {
        const scheduledFor = nextWeekday(dayOfWeek);

        const rows = suggestions
          .filter((s) => s.topic?.trim())
          .map((s) => ({
            topic: s.topic.trim(),
            post_type: s.post_type === "model_specific" ? "model_specific" : "general",
            boat_make: s.boat_make ?? null,
            boat_model: s.boat_model ?? null,
            rationale: s.rationale ?? null,
            source: "ai_suggested",
            status: "suggested",
            scheduled_for: scheduledFor,
          }));

        const { error: insertErr } = await supabaseAdmin
          .from("blog_topic_queue")
          .insert(rows);

        if (insertErr) {
          throw new Error(`topic queue insert: ${insertErr.message}`);
        }

        results.suggestionsInserted = rows.length;
        console.log(`[blog-pipeline] inserted ${rows.length} topic suggestions for ${scheduledFor}`);
      }
    } else {
      console.log("[blog-pipeline] no agent session signals found in last 14 days");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.errors.push(`suggest step: ${msg}`);
    console.error("[blog-pipeline] suggestion step failed:", msg);
  }

  // ── Step 2: Auto-fallback — generate earliest approved topic due today ──────
  try {
    const today = todayUTC();

    const { data: dueTopics } = await supabaseAdmin
      .from("blog_topic_queue")
      .select("*")
      .eq("status", "approved")
      .lte("scheduled_for", today)
      .order("scheduled_for", { ascending: true })
      .limit(1);

    if (dueTopics && dueTopics.length > 0) {
      const topic = dueTopics[0];

      const { data: job, error: jobErr } = await supabaseAdmin
        .from("blog_generation_jobs")
        .insert({
          topic_queue_id: topic.id,
          status: "running",
        })
        .select("id")
        .single();

      if (jobErr || !job) {
        throw new Error(`auto-fallback job insert: ${jobErr?.message ?? "no job returned"}`);
      }

      // Fire generation after HTTP response is sent — draft lands in needs_review
      after(() =>
        generateBlogPost({
          jobId: job.id,
          topic: topic.topic,
          postType: topic.post_type,
          boatMake: topic.boat_make,
          boatModel: topic.boat_model,
        })
      );

      results.autoFallback = true;
      console.log(`[blog-pipeline] auto-fallback triggered for topic "${topic.topic}" (job ${job.id})`);
    } else if (autoPublishIfIdle && results.suggestionsInserted > 0) {
      // ── Step 3: Idle promotion ───────────────────────────────────────────────
      // No approved topic due today. If idle promotion is enabled, take the
      // most recently inserted ai_suggested topic from this run and promote it.
      // The generated draft STILL lands in needs_review — this never auto-publishes.

      const { data: idleTopics } = await supabaseAdmin
        .from("blog_topic_queue")
        .select("*")
        .eq("status", "suggested")
        .eq("source", "ai_suggested")
        .order("created_at", { ascending: false })
        .limit(1);

      if (idleTopics && idleTopics.length > 0) {
        const topic = idleTopics[0];

        // Promote to approved
        await supabaseAdmin
          .from("blog_topic_queue")
          .update({
            status: "approved",
            source: "auto_default",
            scheduled_for: today,
          })
          .eq("id", topic.id);

        const { data: job, error: jobErr } = await supabaseAdmin
          .from("blog_generation_jobs")
          .insert({
            topic_queue_id: topic.id,
            status: "running",
          })
          .select("id")
          .single();

        if (jobErr || !job) {
          throw new Error(`idle promotion job insert: ${jobErr?.message ?? "no job returned"}`);
        }

        after(() =>
          generateBlogPost({
            jobId: job.id,
            topic: topic.topic,
            postType: topic.post_type,
            boatMake: topic.boat_make,
            boatModel: topic.boat_model,
          })
        );

        results.idlePromotion = true;
        console.log(`[blog-pipeline] idle promotion triggered for topic "${topic.topic}" (job ${job.id})`);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.errors.push(`auto-fallback step: ${msg}`);
    console.error("[blog-pipeline] auto-fallback step failed:", msg);
  }

  // ── Step 4: Update last_run_at ────────────────────────────────────────────
  await supabaseAdmin
    .from("blog_schedule_config")
    .update({ last_run_at: new Date().toISOString() })
    .not("id", "is", null);

  console.log("[blog-pipeline] run complete:", results);

  return NextResponse.json({ ok: true, ...results });
}
