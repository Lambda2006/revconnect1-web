import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/hub/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { data, error } = await supabaseAdmin
    .from("cached_responses")
    .select("id, layer, boat_make, boat_model, boat_year, engine_brand, query_category, query_summary, is_emergency, hit_count, cached_at, expires_at, response, source_urls")
    .order("is_emergency", { ascending: false })
    .order("layer")
    .order("query_category")
    .order("boat_make");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: data });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const body = await request.json();
  const {
    layer,
    boat_make,
    boat_model,
    boat_year,
    engine_brand,
    query_category,
    query_summary,
    query_hash,
    response,
    source_urls,
    is_emergency,
    expires_at,
  } = body;

  const resolvedLayer = layer ?? "boat_make";

  // Universal and engine layers don't require boat_make; boat_make layer does
  if (resolvedLayer === "boat_make" && !boat_make) {
    return NextResponse.json({ error: "boat_make is required for layer 'boat_make'." }, { status: 400 });
  }
  if (resolvedLayer === "engine" && !engine_brand) {
    return NextResponse.json({ error: "engine_brand is required for layer 'engine'." }, { status: 400 });
  }
  if (!query_category || !response) {
    return NextResponse.json({ error: "query_category and response are required." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("cached_responses")
    .insert({
      layer: resolvedLayer,
      boat_make: boat_make ?? null,
      boat_model: boat_model ?? null,
      boat_year: boat_year ?? null,
      engine_brand: engine_brand ?? null,
      query_category,
      query_summary: query_summary ?? null,
      query_hash: query_hash ?? `hub-${Date.now()}`,
      response,
      source_urls: source_urls ?? [],
      is_emergency: is_emergency ?? false,
      hit_count: 0,
      cached_at: new Date().toISOString(),
      expires_at: expires_at ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entry: data }, { status: 201 });
}
