import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

const HIT_THRESHOLD = 5; // Promote to cache after this many hits

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { boatMake, boatModel, boatYear, queryCategory, queryHash, querySummary, response, sourceUrls } = body;

    if (!queryHash || !boatMake) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Block emergency queries from auto-promotion (pre-loaded manually)
    if (queryCategory?.startsWith("emergency_") || queryCategory === "cooling" || queryCategory === "steering") {
      return NextResponse.json({ skipped: true, reason: "emergency_category" });
    }

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    // Try to find existing non-emergency entry
    const { data: existing } = await supabaseAdmin
      .from("cached_responses")
      .select("id, hit_count")
      .eq("query_hash", queryHash)
      .eq("is_emergency", false)
      .maybeSingle() as { data: { id: string; hit_count: number | null } | null };

    if (existing) {
      const newCount = (existing.hit_count ?? 0) + 1;
      await supabaseAdmin
        .from("cached_responses")
        .update({ hit_count: newCount, expires_at: expiresAt })
        .eq("id", existing.id);
    } else if (response) {
      // Only insert if we have a response (i.e., this was a live agent response, not cached)
      await supabaseAdmin.from("cached_responses").insert({
        boat_make: boatMake,
        boat_model: boatModel,
        boat_year: boatYear,
        query_category: queryCategory,
        query_hash: queryHash,
        query_summary: querySummary,
        response,
        source_urls: sourceUrls ?? [],
        is_emergency: false,
        hit_count: 1,
        cached_at: now,
        expires_at: expiresAt,
      });
    }

    return NextResponse.json({ promoted: true });
  } catch (err) {
    console.error("cache-promo error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
