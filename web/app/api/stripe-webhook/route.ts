import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/server";

let _stripe: Stripe | undefined;
const getStripe = () => _stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: skip already-processed events
  const { data: existing } = await supabaseAdmin
    .from("webhook_events")
    .select("id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ skipped: true });
  }

  // Log event
  await supabaseAdmin.from("webhook_events").insert({ event_id: event.id, event_type: event.type });

  try {
    switch (event.type) {
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpsert(sub, "created");
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpsert(sub, "updated");
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;
        if (subId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "active" })
            .eq("stripe_sub_id", subId);
        }

        // Send payment receipt email
        try {
          const { data: subRow } = await supabaseAdmin
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_sub_id", subId)
            .single() as { data: { user_id: string } | null };
          if (subRow?.user_id) {
            const { data: userRow } = await supabaseAdmin.from("users").select("email").eq("id", subRow.user_id).single() as { data: { email: string } | null };
            if (userRow?.email) {
              const { sendPaymentSuccessEmail } = await import("@/lib/email");
              await sendPaymentSuccessEmail({ email: userRow.email, amount: (invoice.amount_paid ?? 0) / 100 });
            }
          }
        } catch { /* email not critical */ }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;
        if (subId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_sub_id", subId);
        }

        // Send payment failed email with billing portal link
        try {
          const { data: subRow } = await supabaseAdmin
            .from("subscriptions")
            .select("user_id, stripe_customer_id")
            .eq("stripe_sub_id", subId)
            .single() as { data: { user_id: string; stripe_customer_id: string } | null };
          if (subRow?.user_id && subRow.stripe_customer_id) {
            const { data: userRow } = await supabaseAdmin.from("users").select("email").eq("id", subRow.user_id).single() as { data: { email: string } | null };
            if (userRow?.email) {
              const portalSession = await getStripe().billingPortal.sessions.create({
                customer: subRow.stripe_customer_id,
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
              });
              const { sendPaymentFailedEmail } = await import("@/lib/email");
              await sendPaymentFailedEmail({ email: userRow.email, portalUrl: portalSession.url });
            }
          }
        } catch { /* email not critical */ }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
          })
          .eq("stripe_sub_id", sub.id);
        break;
      }
      case "payment_method.detached": {
        const pm = event.data.object as Stripe.PaymentMethod;
        const customerId = pm.customer as string;
        if (customerId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ payment_method_detached: true })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionUpsert(sub: Stripe.Subscription, _action: string) {
  const userId = sub.metadata?.user_id;
  const plan = (sub.metadata?.plan ?? "app_only") as "app_only" | "app_and_agent";
  if (!userId) return;

  const statusMap: Record<string, string> = {
    trialing: "trialing",
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    incomplete: "past_due",
    incomplete_expired: "canceled",
    unpaid: "past_due",
  };

  await supabaseAdmin.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: sub.customer as string,
    stripe_sub_id: sub.id,
    plan,
    status: statusMap[sub.status] ?? sub.status,
    trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
  });
}
