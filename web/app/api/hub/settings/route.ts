import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/hub/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

// GET /api/hub/settings — returns the single blog_schedule_config row
export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { data, error } = await supabaseAdmin
    .from("blog_schedule_config")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return defaults if no row exists yet
  return NextResponse.json({
    config: data ?? {
      day_of_week: 1,
      auto_publish_if_idle: false,
      reminder_email: null,
      reminder_enabled: false,
      last_run_at: null,
    },
  });
}

// PATCH /api/hub/settings — upserts blog_schedule_config (single-row table)
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const body = await request.json();
  const allowed = [
    "day_of_week",
    "auto_publish_if_idle",
    "reminder_email",
    "reminder_enabled",
  ] as const;

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Upsert: update if row exists, insert if not
  const { data: existing } = await supabaseAdmin
    .from("blog_schedule_config")
    .select("id")
    .limit(1)
    .maybeSingle();

  let result;
  if (existing?.id) {
    result = await supabaseAdmin
      .from("blog_schedule_config")
      .update(updates)
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    result = await supabaseAdmin
      .from("blog_schedule_config")
      .insert({ day_of_week: 1, auto_publish_if_idle: false, ...updates })
      .select()
      .single();
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json({ config: result.data });
}
