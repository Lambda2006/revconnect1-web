import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import {
  sendPaymentFailedEmail,
  sendPaymentSucceededEmail,
} from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })

const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Stripe webhook handler — blueprint section 13.
 * POST /api/stripe-webhook
 *
 * All subscription state changes flow through here. The app reads subscription
 * status exclusively from Supabase — this handler keeps that table current.
 *
 * Events handled:
 * - customer.subscription.created  → write initial subscription record
 * - customer.subscription.updated  → update plan, status, period end (trial → active on day 8)
 * - invoice.payment_succeeded       → confirm active, clear past_due
 * - invoice.payment_failed          → set past_due, send Resend email
 * - customer.subscription.deleted  → set canceled, detach payment method
 * - payment_method.detached         → confirm payment_method_detached: true
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[stripe-webhook] signature verification failed:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.user_id
        if (!userId) break

        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: sub.customer as string,
          stripe_sub_id: sub.id,
          plan: sub.metadata?.plan ?? 'app_and_agent',
          status: sub.status === 'trialing' ? 'trialing' : 'active',
          trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          payment_method_detached: false,
        }, { onConflict: 'user_id' })
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan: sub.metadata?.plan ?? 'app_and_agent',
            status: mapStripeStatus(sub.status),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          })
          .eq('stripe_sub_id', sub.id)
        break
      }

      case 'invoice.payment_succeeded': {
        const inv = event.data.object as Stripe.Invoice
        if (inv.subscription) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'active' })
            .eq('stripe_sub_id', inv.subscription as string)

          // Send receipt email (non-blocking)
          if (inv.customer_email && inv.total > 0) {
            const stripeSub = await stripe.subscriptions.retrieve(inv.subscription as string)
            sendPaymentSucceededEmail({
              email: inv.customer_email,
              amount: inv.total,
              nextBillingDate: new Date(stripeSub.current_period_end * 1000),
            }).catch((err) => console.error('[stripe-webhook] receipt email failed:', err))
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice
        if (inv.subscription) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_sub_id', inv.subscription as string)

          // Send payment failed email with customer portal link
          if (inv.customer_email && typeof inv.customer === 'string') {
            try {
              const portalSession = await stripe.billingPortal.sessions.create({
                customer: inv.customer,
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
              })
              sendPaymentFailedEmail({
                email: inv.customer_email,
                customerPortalUrl: portalSession.url,
              }).catch((err) =>
                console.error('[stripe-webhook] payment failed email error:', err)
              )
            } catch (portalErr) {
              console.error('[stripe-webhook] could not create portal session:', portalErr)
            }
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        // Update Supabase — root layout detects isCanceled via Realtime and routes to welcome.
        // Trial-cancel and agent-removal emails are sent directly from their API routes
        // (cancel-trial+api.ts and remove-agent-addon+api.ts) for immediate feedback.
        // This handler covers webhook-driven cancellations (final payment failure, etc.).
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            payment_method_detached: true,
          })
          .eq('stripe_sub_id', sub.id)
        break
      }

      case 'payment_method.detached': {
        const pm = event.data.object as Stripe.PaymentMethod
        if (pm.customer) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ payment_method_detached: true })
            .eq('stripe_customer_id', pm.customer as string)
        }
        break
      }
    }
  } catch (err: any) {
    console.error('[stripe-webhook] handler error:', err)
    return new Response('Internal error', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): 'trialing' | 'active' | 'past_due' | 'canceled' {
  switch (stripeStatus) {
    case 'trialing': return 'trialing'
    case 'active': return 'active'
    case 'past_due': return 'past_due'
    case 'canceled':
    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
      return 'canceled'
    default: return 'canceled'
  }
}
