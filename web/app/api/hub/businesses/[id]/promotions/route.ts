import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/hub/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("promotions")
    .select("*")
    .eq("business_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promotions: data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { id: business_id } = await params;
  const body = await request.json();

  const {
    title, description, promo_code,
    discount_type, discount_value,
    image_url, is_active, requires_download,
    redemption_limit, starts_at, expires_at,
  } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("promotions")
    .insert({
      business_id,
      title,
      description: description ?? null,
      promo_code: promo_code ?? null,
      discount_type: discount_type ?? null,
      discount_value: discount_value ?? null,
      image_url: image_url ?? null,
      is_active: is_active ?? true,
      requires_download: requires_download ?? false,
      redemption_limit: redemption_limit ?? null,
      starts_at: starts_at ?? null,
      expires_at: expires_at ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promotion: data }, { status: 201 });
}
