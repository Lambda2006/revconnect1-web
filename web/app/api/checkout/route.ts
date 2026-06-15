import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

let _stripe: Stripe | undefined;
const getStripe = () => _stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: "2025-02-24.acacia" as any,
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Stripe price IDs — same as the mobile app
const PRICES: Record<string, { subscriptionPrice: string }> = {
  app_only: {
    subscriptionPrice: process.env.STRIPE_PRICE_APP_ONLY_RECURRING!, // $0/mo tracking price
  },
  app_and_agent: {
    subscriptionPrice: process.env.STRIPE_PRICE_APP_AND_AGENT!,      // $9.99/mo
  },
};

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();

    if (!plan || !PRICES[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const { subscriptionPrice } = PRICES[plan];

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: subscriptionPrice,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          plan,
          source: "web",
        },
      },
      success_url: `${APP_URL}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pricing`,
    } as any);

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("[checkout] Error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
