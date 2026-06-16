import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/hub/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const adminError = await requireAdmin(request);
  if (adminError instanceof NextResponse) return adminError;

  const { data, error } = await supabaseAdmin
    .from("vouchers")
    .select("*, voucher_redemptions(count)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vouchers: data });
}

export async function POST(request: NextRequest) {
  const adminError = await requireAdmin(request);
  if (adminError instanceof NextResponse) return adminError;

  const body = await request.json();
  const {
    code,
    description,
    skip_one_time_fee,
    trial_extension_days,
    free_months,
    upgrade_to_agent,
    max_uses,
    expires_at,
  } = body;

  if (!code) return NextResponse.json({ error: "Code is required" }, { status: 400 });

  const upperCode = (code as string).trim().toUpperCase();

  // Check uniqueness
  const { data: existing } = await supabaseAdmin
    .from("vouchers")
    .select("id")
    .eq("code", upperCode)
    .maybeSingle();

  if (existing) return NextResponse.json({ error: "A voucher with this code already exists." }, { status: 409 });

  const { data, error } = await supabaseAdmin
    .from("vouchers")
    .insert({
      code: upperCode,
      description: description ?? null,
      skip_one_time_fee: skip_one_time_fee ?? false,
      trial_extension_days: trial_extension_days ?? 0,
      free_months: free_months ?? 0,
      upgrade_to_agent: upgrade_to_agent ?? false,
      max_uses: max_uses ?? null,
      expires_at: expires_at ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ voucher: data }, { status: 201 });
}
