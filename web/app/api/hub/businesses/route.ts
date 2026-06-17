import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/hub/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { data, error } = await supabaseAdmin
    .from("businesses")
    .select(`
      id, business_name, category, description, website_url,
      phone, address, lat, lng, logo_url,
      is_verified, is_featured, is_active, created_at,
      promotions(id, title, description, promo_code, discount_type, discount_value,
                 is_active, expires_at, redemption_limit, redemption_count, created_at)
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ businesses: data });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const body = await request.json();
  const {
    business_name, category, description, website_url,
    phone, address, lat, lng, logo_url,
    is_verified, is_featured, is_active,
  } = body;

  if (!business_name) {
    return NextResponse.json({ error: "business_name is required." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("businesses")
    .insert({
      business_name,
      category: category ?? null,
      description: description ?? null,
      website_url: website_url ?? null,
      phone: phone ?? null,
      address: address ?? null,
      lat: lat ?? null,
      lng: lng ?? null,
      logo_url: logo_url ?? null,
      is_verified: is_verified ?? false,
      is_featured: is_featured ?? false,
      is_active: is_active ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ business: data }, { status: 201 });
}
