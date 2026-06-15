import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/server";

let _stripe: Stripe | undefined;
const getStripe = () => _stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });

/**
 * POST /api/remove-agent-addon
 *
 * Removes the $9.99/month agent subscription item during the trial period.
 * Blueprint: "User can remove agent subscription at any point during days 1–7
 * from profile screen — $4.99 app fee still charges on day 8."
 *
 * Swaps the agent price item to the $0/month app-only tracking price.
 * Updates plan to 'app_only' in both Stripe metadata and Supabase.
 */
export async function POST(request: NextRequest) {
  let body: { userId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId } = body;
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  const agentPriceId = process.env.STRIPE_PRICE_APP_AND_AGENT!;
  const appOnlyRecurringPriceId = process.env.STRIPE_PRICE_APP_ONLY_RECURRING!;

  try {
    const { data: sub, error } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_sub_id, plan, status")
      .eq("user_id", userId)
      .single() as { data: { stripe_sub_id: string; plan: string; status: string } | null; error: any };

    if (error || !sub) return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    if (sub.status !== "trialing") {
      return NextResponse.json({ error: "Can only remove agent add-on during trial" }, { status: 400 });
    }
    if (sub.plan === "app_only") {
      return NextResponse.json({ error: "Already on app_only plan" }, { status: 400 });
    }

    const stripeSub = await getStripe().subscriptions.retrieve(sub.stripe_sub_id);
    const agentItem = stripeSub.items.data.find((item) => item.price.id === agentPriceId);

    if (!agentItem) {
      return NextResponse.json({ error: "Agent subscription item not found" }, { status: 400 });
    }

    // Swap agent item to $0/month tracking item — no proration
    await getStripe().subscriptions.update(sub.stripe_sub_id, {
      items: [{ id: agentItem.id, price: appOnlyRecurringPriceId }],
      metadata: { plan: "app_only" },
      proration_behavior: "none",
    });

    // Update Supabase immediately
    await supabaseAdmin
      .from("subscriptions")
      .update({ plan: "app_only" })
      .eq("user_id", userId);

    // Send confirmation email (non-blocking)
    try {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("email")
        .eq("id", userId)
        .single() as { data: { email: string } | null };
      if (user?.email && stripeSub.trial_end) {
        const { sendAgentSubscriptionCanceledEmail } = await import("@/lib/email");
        await sendAgentSubscriptionCanceledEmail({
          email: user.email,
          accessEndsAt: new Date(stripeSub.trial_end * 1000).toISOString(),
        });
      }
    } catch { /* email not critical */ }

    return NextResponse.json({ updated: true, plan: "app_only" });
  } catch (err: unknown) {
    console.error("[remove-agent-addon] error:", err);
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
