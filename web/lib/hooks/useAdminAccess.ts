import { createClient } from "@/lib/supabase/server";

export type AdminRole = "owner" | "editor";

export interface AdminAccess {
  isAdmin: boolean;
  role: AdminRole | null;
}

/**
 * Server-side check: returns whether the currently authenticated Supabase user
 * has a row in admin_users, and which role they hold.
 *
 * Must be called from a Server Component or Route Handler (uses cookie-based client).
 */
export async function getAdminAccess(): Promise<AdminAccess> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isAdmin: false, role: null };
  }

  // Use service-role client to bypass RLS on admin_users (which has no public read policy).
  const { supabaseAdmin } = await import("@/lib/supabase/server");

  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return { isAdmin: false, role: null };
  }

  return { isAdmin: true, role: data.role as AdminRole };
}
