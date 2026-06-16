import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/hub/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminError = await requireAdmin(request);
  if (adminError instanceof NextResponse) return adminError;

  const { id } = await params;
  const body = await request.json();

  // Only allow patching safe fields
  const allowed = [
    "description",
    "skip_one_time_fee",
    "trial_extension_days",
    "free_months",
    "upgrade_to_agent",
    "max_uses",
    "expires_at",
    "is_active",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await supabaseAdmin
    .from("vouchers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ voucher: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminError = await requireAdmin(request);
  if (adminError instanceof NextResponse) return adminError;

  const { id } = await params;

  const { error } = await supabaseAdmin.from("vouchers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
