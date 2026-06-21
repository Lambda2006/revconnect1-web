import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/hub/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const body = await request.json();
  const { source_name, base_url, source_type, boat_make, boat_model, is_active } = body;

  const updates: Record<string, unknown> = {};
  if (source_name  !== undefined) updates.source_name  = source_name;
  if (base_url     !== undefined) updates.base_url     = base_url;
  if (source_type  !== undefined) updates.source_type  = source_type;
  if (boat_make    !== undefined) updates.boat_make    = boat_make  || null;
  if (boat_model   !== undefined) updates.boat_model   = boat_model || null;
  if (is_active    !== undefined) updates.is_active    = is_active;

  const { data, error } = await supabaseAdmin
    .from("approved_sources")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ source: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const { error } = await supabaseAdmin
    .from("approved_sources")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
