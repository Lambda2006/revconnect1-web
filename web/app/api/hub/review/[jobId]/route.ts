import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/hub/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

type Params = { params: Promise<{ jobId: string }> };

// GET /api/hub/review/[jobId]
// Returns the generation job and its linked topic queue entry.
export async function GET(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { jobId } = await params;

  const { data: job, error: jobErr } = await supabaseAdmin
    .from("blog_generation_jobs")
    .select("*, blog_topic_queue(*)")
    .eq("id", jobId)
    .maybeSingle();

  if (jobErr || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}

// PATCH /api/hub/review/[jobId]
// action: 'approve' — writes blog_posts + approved_sources, updates topic + job
// action: 'reject'  — updates job + optionally reverts topic to 'approved'
export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { jobId } = await params;
  const body = await request.json();
  const { action } = body;

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
  }

  // Fetch the job to verify it exists and is in a reviewable state
  const { data: job, error: jobErr } = await supabaseAdmin
    .from("blog_generation_jobs")
    .select("*, blog_topic_queue(*)")
    .eq("id", jobId)
    .maybeSingle();

  if (jobErr || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (!["needs_review", "approved", "rejected"].includes(job.status)) {
    return NextResponse.json(
      { error: `Job is in '${job.status}' status — not reviewable` },
      { status: 409 }
    );
  }

  // ── APPROVE ────────────────────────────────────────────────────────────────
  if (action === "approve") {
    const {
      title,
      slug,
      excerpt,
      content_md,
      post_type,
      boat_make,
      boat_model,
    } = body;

    if (!title || !slug || !content_md || !post_type) {
      return NextResponse.json(
        { error: "title, slug, content_md, and post_type are required for approval" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // 1. Insert into blog_posts
    const { data: post, error: postErr } = await supabaseAdmin
      .from("blog_posts")
      .insert({
        title,
        slug,
        excerpt: excerpt || null,
        content_md,
        post_type,
        boat_make: boat_make || null,
        boat_model: boat_model || null,
        status: "published",
        source_urls: job.draft_source_urls ?? [],
        generated_at: job.created_at,
        published_at: now,
        approved_by: admin.userId,
      })
      .select("id")
      .single();

    if (postErr || !post) {
      return NextResponse.json(
        { error: `Failed to insert blog_post: ${postErr?.message}` },
        { status: 500 }
      );
    }

    // 2. Insert into approved_sources
    const sourceErr = await supabaseAdmin
      .from("approved_sources")
      .insert({
        source_name: title,
        base_url: `https://victoryrevconnect.com/blog/${slug}`,
        source_type: "blog_post",
        boat_make: boat_make || null,
        boat_model: boat_model || null,
        is_active: true,
        source_blog_post_id: post.id,
      })
      .then((r: any) => r.error);

    if (sourceErr) {
      // Non-fatal: log but don't roll back the published post
      console.error("[hub/review] approved_sources insert failed:", sourceErr.message);
    }

    // 3. Update blog_topic_queue.status → 'generated'
    await supabaseAdmin
      .from("blog_topic_queue")
      .update({ status: "generated" })
      .eq("id", job.topic_queue_id);

    // 4. Update blog_generation_jobs → 'approved'
    await supabaseAdmin
      .from("blog_generation_jobs")
      .update({ status: "approved", reviewed_at: now })
      .eq("id", jobId);

    return NextResponse.json({ postId: post.id, slug });
  }

  // ── REJECT ─────────────────────────────────────────────────────────────────
  if (action === "reject") {
    const { reviewer_notes, topic_disposition } = body;

    if (!reviewer_notes?.trim()) {
      return NextResponse.json(
        { error: "reviewer_notes is required when rejecting" },
        { status: 400 }
      );
    }

    // topic_disposition: 'regenerate' (default) reverts topic to 'approved'
    //                    'permanent'           sets topic to 'rejected'
    const topicStatus = topic_disposition === "permanent" ? "rejected" : "approved";

    await Promise.all([
      supabaseAdmin
        .from("blog_generation_jobs")
        .update({
          status: "rejected",
          reviewer_notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", jobId),

      supabaseAdmin
        .from("blog_topic_queue")
        .update({ status: topicStatus })
        .eq("id", job.topic_queue_id),
    ]);

    return NextResponse.json({ topicStatus });
  }
}
