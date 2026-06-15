import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/hub/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

// GET /api/hub/topics
// Returns suggested + approved topics, plus the 10 most recent generation jobs.
export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const [topicsResult, jobsResult] = await Promise.all([
    supabaseAdmin
      .from("blog_topic_queue")
      .select("*")
      .in("status", ["suggested", "approved"])
      .order("created_at", { ascending: false }),

    supabaseAdmin
      .from("blog_generation_jobs")
      .select("id, status, created_at, reviewed_at, topic_queue_id, reviewer_notes")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (topicsResult.error) {
    return NextResponse.json({ error: topicsResult.error.message }, { status: 500 });
  }

  return NextResponse.json({
    topics: topicsResult.data ?? [],
    recentJobs: jobsResult.data ?? [],
  });
}

// POST /api/hub/topics
// Admin adds a custom topic; immediately approved and ready to generate.
export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const body = await request.json();
  const { topic, post_type, boat_make, boat_model, scheduled_for } = body;

  if (!topic || !post_type) {
    return NextResponse.json({ error: "topic and post_type are required" }, { status: 400 });
  }
  if (!["general", "model_specific"].includes(post_type)) {
    return NextResponse.json({ error: "Invalid post_type" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("blog_topic_queue")
    .insert({
      topic,
      post_type,
      boat_make: boat_make || null,
      boat_model: boat_model || null,
      scheduled_for: scheduled_for || null,
      source: "custom",
      status: "approved",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ topic: data }, { status: 201 });
}
