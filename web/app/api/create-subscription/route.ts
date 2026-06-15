import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/server";

let _stripe: Stripe | undefined;
const getStripe = () => _stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });

/**
 * POST /api/create-subscription
 *
 * Step 1 of the onboarding payment flow. Creates (or retrieves) a Stripe
 * customer for this user, then creates a SetupIntent so the Payment Element
 * can collect and confirm a card without charging it.
 *
 * Returns: { setupIntentClientSecret, ephemeralKey }
 * The client does NOT receive customerId — it is resolved server-side in
 * confirm-subscription via getStripe().customers.search(metadata.user_id).
 *
 * Blueprint section 6 — Billing Model / Trial Flow.
 */
export async function POST(request: NextRequest) {
  let body: { userId: string; email: string; plan: "app_only" | "app_and_agent" };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId, email, plan } = body;
  if (!userId || !email || !plan) {
    return NextResponse.json({ error: "userId, email, and plan are required" }, { status: 400 });
  }

  try {
    // Check for existing canceled subscription — block second trials
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id, status")
      .eq("user_id", userId)
      .single() as { data: { stripe_customer_id: string; status: string } | null };

    if (existingSub?.status === "canceled") {
      return NextResponse.json(
        { error: "Your free trial has already been used.", returningUser: true },
        { status: 403 }
      );
    }

    let customerId: string;

    if (existingSub?.stripe_customer_id) {
      customerId = existingSub.stripe_customer_id;
    } else {
      // Check Stripe by metadata in case Supabase row wasn't written yet
      const existing = await getStripe().customers.search({
        query: `metadata['user_id']:'${userId}'`,
        limit: 1,
      });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const customer = await getStripe().customers.create({
          email,
          metadata: { user_id: userId, plan },
        });
        customerId = customer.id;
      }
    }

    // SetupIntent — usage: off_session so we can charge on day 8 without user present
    const setupIntent = await getStripe().setupIntents.create({
      customer: customerId,
      usage: "off_session",
      metadata: { user_id: userId, plan },
      payment_method_types: ["card"],
    });

    // Ephemeral key — allows Payment Element to read the customer's saved payment methods
    const ephemeralKey = await getStripe().ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: "2025-02-24.acacia" }
    );

    return NextResponse.json({
      setupIntentClientSecret: setupIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
    });
  } catch (err: unknown) {
    console.error("[create-subscription] error:", err);
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
