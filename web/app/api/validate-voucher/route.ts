import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json() as { code: string; userId: string };
    if (!code || !userId) {
      return NextResponse.json({ error: "Missing code or userId" }, { status: 400 });
    }

    const upperCode = code.trim().toUpperCase();

    // Fetch voucher
    const { data: voucher, error } = await supabaseAdmin
      .from("vouchers")
      .select("*")
      .eq("code", upperCode)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    if (!voucher) {
      return NextResponse.json({ error: "Invalid or inactive voucher code." }, { status: 404 });
    }

    // Check expiry
    if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
      return NextResponse.json({ error: "This voucher has expired." }, { status: 410 });
    }

    // Check usage limit
    if (voucher.max_uses !== null && voucher.uses_count >= voucher.max_uses) {
      return NextResponse.json({ error: "This voucher has reached its usage limit." }, { status: 410 });
    }

    // Check if user already redeemed this voucher
    const { data: existing } = await supabaseAdmin
      .from("voucher_redemptions")
      .select("id")
      .eq("voucher_id", voucher.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "You have already used this voucher." }, { status: 409 });
    }

    // Return the effects (so the UI can display what the voucher does)
    return NextResponse.json({
      valid: true,
      voucherId: voucher.id,
      effects: {
        skipOneTimeFee: voucher.skip_one_time_fee,
        trialExtensionDays: voucher.trial_extension_days,
        freeMonths: voucher.free_months,
        upgradeToAgent: voucher.upgrade_to_agent,
      },
    });
  } catch (err) {
    console.error("validate-voucher error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
