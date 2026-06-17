import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/server";

/** Haversine distance in km between two lat/lng pairs */
function distanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Lower score = more relevant. Returns Infinity if no reference point. */
function minDistance(
  bizLat: number, bizLng: number,
  points: Array<{ lat: number; lng: number }>
): number {
  if (points.length === 0) return Infinity;
  return Math.min(...points.map((p) => distanceKm(bizLat, bizLng, p.lat, p.lng)));
}

export async function GET(request: NextRequest) {
  // Auth via session cookie
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch user profile for home coords (not strictly required)
  let homePoint: { lat: number; lng: number } | null = null;
  let eventPoints: Array<{ lat: number; lng: number }> = [];

  if (user) {
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("home_lat, home_lng")
      .eq("id", user.id)
      .single();

    if (profile?.home_lat && profile?.home_lng) {
      homePoint = { lat: profile.home_lat, lng: profile.home_lng };
    }

    // Upcoming meetups user is attending
    const now = new Date().toISOString();
    const { data: attendances } = await supabaseAdmin
      .from("meetup_attendees")
      .select("meetups(lat, lng, event_date)")
      .eq("user_id", user.id)
      .in("status", ["confirmed", "pending"]);

    if (attendances) {
      for (const row of attendances) {
        const m = row.meetups as { lat: number | null; lng: number | null; event_date: string | null } | null;
        if (m?.lat && m?.lng && m?.event_date && m.event_date > now) {
          eventPoints.push({ lat: m.lat, lng: m.lng });
        }
      }
    }
  }

  // Fetch all active businesses with their active promotions
  const now = new Date().toISOString();
  const { data: businesses, error } = await supabaseAdmin
    .from("businesses")
    .select(`
      id, business_name, category, description, website_url,
      phone, address, lat, lng, logo_url, is_verified, is_featured, is_active,
      promotions(id, title, description, promo_code, discount_type, discount_value,
                 image_url, is_active, expires_at, redemption_limit, redemption_count)
    `)
    .eq("is_active", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter only active, non-expired promotions
  const withPromos = (businesses ?? []).map((b) => ({
    ...b,
    promotions: (b.promotions as Array<{
      is_active: boolean;
      expires_at: string | null;
      [key: string]: unknown;
    }> ?? []).filter(
      (p) => p.is_active && (!p.expires_at || p.expires_at > now)
    ),
  }));

  // Reference points for proximity: home first, then event locations
  const refPoints = [
    ...(homePoint ? [homePoint] : []),
    ...eventPoints,
  ];

  // Score: featured → 0, then distance in km (Infinity if no coords/ref)
  const scored = withPromos.map((b) => {
    let score = b.is_featured ? 0 : 1;
    if (!b.is_featured && b.lat && b.lng && refPoints.length > 0) {
      score = minDistance(b.lat, b.lng, refPoints);
    } else if (!b.is_featured) {
      score = 99999; // no coordinates — deprioritise
    }
    return { ...b, _score: score };
  });

  scored.sort((a, b) => a._score - b._score);

  const result = scored.map(({ _score: _, ...rest }) => rest);

  return NextResponse.json({ businesses: result });
}
