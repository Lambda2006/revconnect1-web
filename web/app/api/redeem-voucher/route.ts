import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/server";

let _stripe: Stripe | undefined;
const getStripe = () =>
  (_stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  }));

export async function POST(request: NextRequest) {
  try {
    // Auth check via session cookie
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { code } = await request.json() as { code: string };
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

    const upperCode = code.trim().toUpperCase();

    // Fetch and validate voucher
    const { data: voucher } = await supabaseAdmin
      .from("vouchers")
      .select("*")
      .eq("code", upperCode)
      .eq("is_active", true)
      .maybeSingle();

    if (!voucher) return NextResponse.json({ error: "Invalid or inactive voucher code." }, { status: 404 });

    if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
      return NextResponse.json({ error: "This voucher has expired." }, { status: 410 });
    }

    if (voucher.max_uses !== null && voucher.uses_count >= voucher.max_uses) {
      return NextResponse.json({ error: "This voucher has reached its usage limit." }, { status: 410 });
    }

    const { data: existing } = await supabaseAdmin
      .from("voucher_redemptions")
      .select("id")
      .eq("voucher_id", voucher.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) return NextResponse.json({ error: "You have already used this voucher." }, { status: 409 });

    // Fetch user's active subscription
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["trialing", "active"])
      .maybeSingle();

    if (!sub) {
      return NextResponse.json({ error: "No active subscription found. Redeem during sign-up instead." }, { status: 400 });
    }

    const stripe = getStripe();
    const stripeSubId = sub.stripe_sub_id as string;
    const stripeCustomerId = sub.stripe_customer_id as string;
    const effectsApplied: Record<string, unknown> = {};

    // --- Apply effects ---

    // 1. Skip $4.99 one-time fee — delete pending invoice items
    if (voucher.skip_one_time_fee) {
      const invoiceItems = await stripe.invoiceItems.list({ customer: stripeCustomerId, pending: true, limit: 10 });
      for (const item of invoiceItems.data) {
        if (item.price?.id === process.env.STRIPE_PRICE_APP_ONLY) {
          await stripe.invoiceItems.del(item.id);
          effectsApplied.skippedOneTimeFee = true;
        }
      }
    }

    // 2. Extend trial (extension days + free months both extend trial_end)
    const extraDays = (voucher.trial_extension_days ?? 0) + (voucher.free_months ?? 0) * 30;
    if (extraDays > 0) {
      const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
      const currentTrialEnd = stripeSub.trial_end ?? Math.floor(Date.now() / 1000);
      const newTrialEnd = currentTrialEnd + extraDays * 24 * 60 * 60;
      await stripe.subscriptions.update(stripeSubId, { trial_end: newTrialEnd });
      const newTrialDate = new Date(newTrialEnd * 1000).toISOString();
      await supabaseAdmin.from("subscriptions").update({ trial_ends_at: newTrialDate }).eq("user_id", user.id);
      effectsApplied.newTrialEnd = newTrialDate;
    }

    // 3. Upgrade to agent — swap subscription item
    if (voucher.upgrade_to_agent && sub.plan !== "app_and_agent") {
      const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
      const currentItem = stripeSub.items.data[0];
      await stripe.subscriptions.update(stripeSubId, {
        items: [{ id: currentItem.id, price: process.env.STRIPE_PRICE_APP_AND_AGENT! }],
        proration_behavior: "none",
        metadata: { plan: "app_and_agent" },
      });
      await supabaseAdmin.from("subscriptions").update({ plan: "app_and_agent" }).eq("user_id", user.id);
      effectsApplied.upgradedToAgent = true;
    }

    // --- Record redemption and increment uses_count ---
    await supabaseAdmin.from("voucher_redemptions").insert({
      voucher_id: voucher.id,
      user_id: user.id,
      effects_applied: effectsApplied,
    });

    await supabaseAdmin
      .from("vouchers")
      .update({ uses_count: voucher.uses_count + 1 })
      .eq("id", voucher.id);

    return NextResponse.json({ success: true, effectsApplied });
  } catch (err) {
    console.error("redeem-voucher error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
