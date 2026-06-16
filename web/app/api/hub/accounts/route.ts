import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/hub/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: subs } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id, plan, status, trial_ends_at");
  const subMap = new Map((subs ?? []).map((s) => [s.user_id, s]));

  const { data: admins } = await supabaseAdmin.from("admin_users").select("user_id");
  const adminSet = new Set((admins ?? []).map((a: any) => a.user_id));

  const result = users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
    banned: u.banned_until ? new Date(u.banned_until as string) > new Date() : false,
    subscription: subMap.get(u.id) ?? null,
    is_admin: adminSet.has(u.id),
  }));

  // Sort by created_at descending
  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json({ users: result });
}
