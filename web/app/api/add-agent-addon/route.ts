import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/server";

let _stripe: Stripe | undefined;
const getStripe = () => _stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });

/**
 * POST /api/add-agent-addon
 *
 * Adds the $9.99/month agent subscription to an active app_only subscriber.
 * Swaps the $0/month tracking price for the $9.99/month agent price.
 * Updates plan to 'app_and_agent' in both Stripe metadata and Supabase.
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
      .single() as { data: { stripe_sub_id: string; plan: string; status: string } | null; error: unknown };

    if (error || !sub) return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    if (sub.status !== "active" && sub.status !== "trialing") {
      return NextResponse.json({ error: "Subscription must be active or trialing to add agent" }, { status: 400 });
    }
    if (sub.plan === "app_and_agent") {
      return NextResponse.json({ error: "Already on app_and_agent plan" }, { status: 400 });
    }

    const stripeSub = await getStripe().subscriptions.retrieve(sub.stripe_sub_id);
    const trackingItem = stripeSub.items.data.find((item) => item.price.id === appOnlyRecurringPriceId);

    if (!trackingItem) {
      return NextResponse.json({ error: "App-only tracking item not found in subscription" }, { status: 400 });
    }

    // Swap $0/month tracking item to $9.99/month agent item
    await getStripe().subscriptions.update(sub.stripe_sub_id, {
      items: [{ id: trackingItem.id, price: agentPriceId }],
      metadata: { plan: "app_and_agent" },
      proration_behavior: "create_prorations",
    });

    // Update Supabase immediately
    await supabaseAdmin
      .from("subscriptions")
      .update({ plan: "app_and_agent" })
      .eq("user_id", userId);

    // Send confirmation email (non-blocking)
    try {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("email")
        .eq("id", userId)
        .single() as { data: { email: string } | null };
      if (user?.email) {
        const { sendAgentSubscriptionAddedEmail } = await import("@/lib/email");
        const nextBilling = new Date((stripeSub.current_period_end ?? 0) * 1000).toISOString();
        await sendAgentSubscriptionAddedEmail({ email: user.email, nextBillingDate: nextBilling });
      }
    } catch { /* email not critical */ }

    return NextResponse.json({ updated: true, plan: "app_and_agent" });
  } catch (err: unknown) {
    console.error("[add-agent-addon] error:", err);
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
