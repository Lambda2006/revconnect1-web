import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export type AdminRole = "owner" | "editor";

export interface AdminContext {
  userId: string;
  role: AdminRole;
}

/**
 * requireAdmin — call this at the top of every /api/hub/* route handler.
 *
 * Returns { userId, role } if the request is from a valid admin, or a
 * NextResponse (401/403/404) if access should be denied.
 *
 * Route handlers must check whether the return value is a NextResponse:
 *
 *   const admin = await requireAdmin(request);
 *   if (admin instanceof NextResponse) return admin;
 *   // safe to use admin.userId, admin.role
 *
 * Never rely on middleware alone for mutating hub routes.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<AdminContext | NextResponse> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  // Build a response object to carry cookie updates
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Return 401 — no session
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin_users with service role key to bypass RLS
  const { createClient } = await import("@supabase/supabase-js");
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { data, error } = await adminClient
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    // Return 404 — don't reveal the route exists to non-admins
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return { userId: user.id, role: data.role as AdminRole };
}
