import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/hub/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { data, error } = await supabaseAdmin
    .from("approved_sources")
    .select("id, source_name, base_url, source_type, boat_make, boat_model, is_active, source_blog_post_id")
    .order("boat_make", { nullsFirst: true })
    .order("boat_model", { nullsFirst: true })
    .order("source_name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sources: data });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const body = await request.json();
  const { source_name, base_url, source_type, boat_make, boat_model, is_active } = body;

  if (!source_name || !base_url || !source_type) {
    return NextResponse.json(
      { error: "source_name, base_url, and source_type are required." },
      { status: 400 }
    );
  }

  const valid_types = ["support_site", "parts_catalog", "recall_db", "blog_post"];
  if (!valid_types.includes(source_type)) {
    return NextResponse.json({ error: `source_type must be one of: ${valid_types.join(", ")}` }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("approved_sources")
    .insert({
      source_name,
      base_url,
      source_type,
      boat_make: boat_make || null,
      boat_model: boat_model || null,
      is_active: is_active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ source: data }, { status: 201 });
}
