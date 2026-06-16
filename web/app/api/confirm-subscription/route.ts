import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/server";

let _stripe: Stripe | undefined;
const getStripe = () => _stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan: rawPlan, voucherCode } = body as {
      userId: string;
      plan: "app_only" | "app_and_agent";
      voucherCode?: string;
    };

    if (!userId || !rawPlan) {
      return NextResponse.json({ error: "Missing userId or plan" }, { status: 400 });
    }

    // --- Resolve voucher (if provided) ---
    let voucher: Record<string, unknown> | null = null;
    if (voucherCode) {
      const upperCode = voucherCode.trim().toUpperCase();
      const { data } = await supabaseAdmin
        .from("vouchers")
        .select("*")
        .eq("code", upperCode)
        .eq("is_active", true)
        .maybeSingle();

      if (data) {
        const expired = data.expires_at && new Date(data.expires_at as string) < new Date();
        const maxed = data.max_uses !== null && (data.uses_count as number) >= (data.max_uses as number);
        if (!expired && !maxed) {
          const { data: existing } = await supabaseAdmin
            .from("voucher_redemptions")
            .select("id")
            .eq("voucher_id", data.id)
            .eq("user_id", userId)
            .maybeSingle();
          if (!existing) voucher = data;
        }
      }
    }

    // Determine final plan (voucher may upgrade)
    let plan = rawPlan;
    if (voucher?.upgrade_to_agent) plan = "app_and_agent";

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

    // Base trial: 7 days + any voucher extension
    const extraDays =
      ((voucher?.trial_extension_days as number) ?? 0) +
      ((voucher?.free_months as number) ?? 0) * 30;
    const trialEnd = Math.floor(Date.now() / 1000) + (7 + extraDays) * 24 * 60 * 60;

    // One-time $4.99 fee — skip if voucher says so
    const addInvoiceItems = voucher?.skip_one_time_fee
      ? []
      : [{ price: process.env.STRIPE_PRICE_APP_ONLY! }];

    // Create subscription
    const subscription = await getStripe().subscriptions.create({
      customer: customerId,
      items: [{ price: recurringPriceId }],
      trial_end: trialEnd,
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      ...(addInvoiceItems.length > 0 ? { add_invoice_items: addInvoiceItems } : {}),
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

    // Record voucher redemption
    if (voucher) {
      await supabaseAdmin.from("voucher_redemptions").insert({
        voucher_id: voucher.id,
        user_id: userId,
        effects_applied: {
          skipOneTimeFee: voucher.skip_one_time_fee,
          trialExtensionDays: voucher.trial_extension_days,
          freeMonths: voucher.free_months,
          upgradeToAgent: voucher.upgrade_to_agent,
          appliedPlan: plan,
        },
      });
      await supabaseAdmin
        .from("vouchers")
        .update({ uses_count: (voucher.uses_count as number) + 1 })
        .eq("id", voucher.id);
    }

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
