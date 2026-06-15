import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/server";

let _stripe: Stripe | undefined;
const getStripe = () => _stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan } = body as { userId: string; plan: "app_only" | "app_and_agent" };

    if (!userId || !plan) {
      return NextResponse.json({ error: "Missing userId or plan" }, { status: 400 });
    }

    // Resolve Stripe customer server-side — never trust client-supplied customerId
    const customers = await getStripe().customers.search({
      query: `metadata['user_id']:'${userId}'`,
    });
    const customer = customers.data[0];
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const customerId = customer.id;

    // Get the default payment method from the SetupIntent
    const setupIntents = await getStripe().setupIntents.list({ customer: customerId, limit: 1 });
    const latestSetupIntent = setupIntents.data[0];
    if (!latestSetupIntent?.payment_method) {
      return NextResponse.json({ error: "No payment method found" }, { status: 400 });
    }

    const paymentMethodId = latestSetupIntent.payment_method as string;

    // Set default payment method on customer
    await getStripe().customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Determine recurring price
    const recurringPriceId =
      plan === "app_and_agent"
        ? process.env.STRIPE_PRICE_APP_AND_AGENT!
        : process.env.STRIPE_PRICE_APP_ONLY_RECURRING!;

    const trialEnd = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days

    // Create subscription
    const subscription = await getStripe().subscriptions.create({
      customer: customerId,
      items: [{ price: recurringPriceId }],
      trial_end: trialEnd,
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      add_invoice_items: [
        { price: process.env.STRIPE_PRICE_APP_ONLY! }, // $4.99 one-time at trial end for ALL plans
      ],
      metadata: { user_id: userId, plan },
    });

    // Write subscription record to Supabase
    await supabaseAdmin.from("subscriptions").upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_sub_id: subscription.id,
      plan,
      status: "trialing",
      trial_ends_at: new Date(trialEnd * 1000).toISOString(),
      current_period_end: new Date((subscription.current_period_end ?? trialEnd) * 1000).toISOString(),
      created_at: new Date().toISOString(),
    });

    // Send welcome email (fire-and-forget)
    try {
      const { data: userRow } = await supabaseAdmin.from("users").select("email").eq("id", userId).single() as { data: { email: string } | null };
      if (userRow?.email) {
        const { sendTrialStartEmail } = await import("@/lib/email");
        await sendTrialStartEmail({
          email: userRow.email,
          plan,
          trialEndDate: new Date(trialEnd * 1000).toLocaleDateString(),
        });
      }
    } catch { /* email not critical */ }

    return NextResponse.json({ success: true, subscriptionId: subscription.id });
  } catch (err) {
    console.error("confirm-subscription error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
