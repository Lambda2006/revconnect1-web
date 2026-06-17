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

  const allowed = [
    "business_name", "category", "description", "website_url",
    "phone", "address", "lat", "lng", "logo_url",
    "is_verified", "is_featured", "is_active",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await supabaseAdmin
    .from("businesses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ business: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from("businesses")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
