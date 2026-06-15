import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { requireAdmin } from "@/lib/hub/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { generateBlogPost } from "@/lib/blog/generate";

// POST /api/hub/generate
// Creates a blog_generation_jobs row (status: 'running'), returns the jobId
// immediately, then fires the Claude generation in the background via after().
export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const body = await request.json();
  const { topic_queue_id } = body;

  if (!topic_queue_id) {
    return NextResponse.json({ error: "topic_queue_id is required" }, { status: 400 });
  }

  // Verify the topic exists and is in 'approved' status
  const { data: topic, error: topicErr } = await supabaseAdmin
    .from("blog_topic_queue")
    .select("*")
    .eq("id", topic_queue_id)
    .eq("status", "approved")
    .maybeSingle();

  if (topicErr || !topic) {
    return NextResponse.json(
      { error: "Topic not found or not in approved status" },
      { status: 404 }
    );
  }

  // Create the generation job row
  const { data: job, error: jobErr } = await supabaseAdmin
    .from("blog_generation_jobs")
    .insert({ topic_queue_id, status: "running" })
    .select("id")
    .single();

  if (jobErr || !job) {
    return NextResponse.json({ error: jobErr?.message ?? "Failed to create job" }, { status: 500 });
  }

  // Fire generation after response is sent (async — survives Vercel serverless timeout)
  after(async () => {
    await generateBlogPost({
      jobId: job.id,
      topic: topic.topic,
      postType: topic.post_type,
      boatMake: topic.boat_make,
      boatModel: topic.boat_model,
    });
  });

  return NextResponse.json({ jobId: job.id }, { status: 202 });
}
