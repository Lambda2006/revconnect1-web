import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/server";

let _stripe: Stripe | undefined;
const getStripe = () => _stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });

/**
 * POST /api/cancel-trial
 *
 * Cancels a subscription during the 7-day trial period.
 * Blueprint section 6 — Trial Cancellation:
 * - Subscription canceled immediately — no charges
 * - All payment methods detached from Stripe customer
 * - status set to 'canceled' in Supabase
 * - stripe_customer_id is intentionally preserved (returning-user detection)
 * - Confirmation email sent via Resend
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

  try {
    const { data: sub, error } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_sub_id, stripe_customer_id")
      .eq("user_id", userId)
      .single() as { data: { stripe_sub_id: string; stripe_customer_id: string } | null; error: any };

    if (error || !sub) {
      return NextResponse.json({ error: "No subscription found for user" }, { status: 404 });
    }

    // Verify still in trial
    const stripeSub = await getStripe().subscriptions.retrieve(sub.stripe_sub_id);
    if (stripeSub.status !== "trialing") {
      return NextResponse.json(
        { error: "Subscription is not in trial — cannot cancel via this endpoint" },
        { status: 400 }
      );
    }

    // Cancel immediately — no proration, no invoice
    await getStripe().subscriptions.cancel(sub.stripe_sub_id, {
      prorate: false,
      invoice_now: false,
    } as Stripe.SubscriptionCancelParams);

    // Detach all payment methods from customer
    const paymentMethods = await getStripe().paymentMethods.list({
      customer: sub.stripe_customer_id,
      type: "card",
    });
    await Promise.all(paymentMethods.data.map((pm) => getStripe().paymentMethods.detach(pm.id)));

    // Update Supabase immediately (webhook will also fire, but we want instant UI response)
    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
        payment_method_detached: true,
      })
      .eq("user_id", userId);

    // Fire cancellation email (non-blocking)
    try {
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("email")
        .eq("id", userId)
        .single() as { data: { email: string } | null };
      if (user?.email) {
        const { sendTrialCanceledEmail } = await import("@/lib/email");
        await sendTrialCanceledEmail({ email: user.email });
      }
    } catch { /* email not critical */ }

    return NextResponse.json({ canceled: true });
  } catch (err: unknown) {
    console.error("[cancel-trial] error:", err);
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
