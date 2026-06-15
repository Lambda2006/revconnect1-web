import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { make, model, year, email } = await req.json();

    if (!make || !model || !year) {
      return NextResponse.json({ error: "make, model, and year are required" }, { status: 400 });
    }

    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > new Date().getFullYear() + 1) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    // Check for existing request with same make/model/year — increment count if found
    const { data: existing } = await supabaseAdmin
      .from("boat_model_requests")
      .select("id, request_count")
      .ilike("make", make.trim())
      .ilike("model", model.trim())
      .eq("year", yearNum)
      .maybeSingle() as { data: { id: string; request_count: number | null } | null };

    if (existing) {
      await supabaseAdmin
        .from("boat_model_requests")
        .update({ request_count: (existing.request_count ?? 1) + 1 } as any)
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("boat_model_requests").insert({
        make: make.trim(),
        model: model.trim(),
        year: yearNum,
        request_count: 1,
        status: "pending",
        // email is not in the schema — we log it for ops purposes only
      });
    }

    // If email provided, optionally log it somewhere (not in schema — skip or add a separate table)
    // For now we just log server-side for ops visibility
    if (email) {
      console.log(`[boat-request] ${make} ${model} ${yearNum} — contact: ${email}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[boat-request] Error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
