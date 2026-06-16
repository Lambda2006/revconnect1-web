import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/hub/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

type Params = { params: Promise<{ userId: string }> };

/** Maps hub-facing plan labels to the internal status+plan columns. */
const HUB_PLAN_MAP: Record<string, { status: string; plan: string }> = {
  free_trial: { status: "trialing", plan: "app_only" },
  connect:    { status: "active",   plan: "app_only" },
  subscribed: { status: "active",   plan: "app_and_agent" },
};

export async function PATCH(request: NextRequest, { params }: Params) {
  const admin = await requireAdmin(request);
  if (admin instanceof NextResponse) return admin;

  const { userId } = await params;
  const body = await request.json();
  const { action } = body;

  // Prevent destructive self-actions
  const selfDestructive = ["delete", "suspend", "demote_admin"];
  if (selfDestructive.includes(action) && userId === admin.userId) {
    return NextResponse.json({ error: "Cannot perform this action on your own account" }, { status: 400 });
  }

  switch (action) {

    case "update_subscription": {
      const { plan: hubPlan } = body;
      if (!hubPlan) return NextResponse.json({ error: "plan required" }, { status: 400 });

      const mapped = HUB_PLAN_MAP[hubPlan];
      if (!mapped) {
        return NextResponse.json({ error: `Unknown plan: ${hubPlan}` }, { status: 400 });
      }

      // Try UPDATE first; if no row exists yet, INSERT (requires users row to exist)
      const { data: existing } = await supabaseAdmin
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({ plan: mapped.plan, status: mapped.status })
          .eq("user_id", userId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      } else {
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .insert({ user_id: userId, plan: mapped.plan, status: mapped.status });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    case "promote_admin": {
      const { error } = await supabaseAdmin
        .from("admin_users")
        .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id", ignoreDuplicates: true });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "demote_admin": {
      const { error } = await supabaseAdmin
        .from("admin_users")
        .delete()
        .eq("user_id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "suspend": {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: "87600h",
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "unsuspend": {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: "none",
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "delete": {
      await Promise.all([
        supabaseAdmin.from("admin_users").delete().eq("user_id", userId),
        supabaseAdmin.from("subscriptions").delete().eq("user_id", userId),
      ]);
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
