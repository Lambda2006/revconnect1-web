import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendTrialCanceledEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })

const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/cancel-trial
 *
 * Called when a user cancels their trial during days 1–7.
 * Blueprint section 5 — Trial Cancellation:
 * - Subscription canceled immediately
 * - No charges made
 * - Payment method detached from Stripe customer
 * - `status` set to `canceled` in Supabase
 * - All access revoked
 * - User routed to welcome screen (handled by root layout via isCanceled check)
 *
 * Note: For canceling just the agent add-on (keeping app_only), use
 * POST /api/remove-agent-addon instead.
 */
export async function POST(request: Request): Promise<Response> {
  let body: { userId: string }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { userId } = body
  if (!userId) return json({ error: 'userId is required' }, 400)

  try {
    const { data: sub, error } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_sub_id, stripe_customer_id, user_id')
      .eq('user_id', userId)
      .single()

    if (error || !sub) {
      return json({ error: 'No subscription found for user' }, 404)
    }

    // Verify still in trial
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_sub_id)
    if (stripeSub.status !== 'trialing') {
      return json({ error: 'Subscription is not in trial — cannot cancel via this endpoint' }, 400)
    }

    // Cancel subscription immediately — no charges made
    await stripe.subscriptions.cancel(sub.stripe_sub_id, {
      prorate: false,
      invoice_now: false,
    })

    // Detach all payment methods from customer (blueprint: payment method detached)
    const paymentMethods = await stripe.paymentMethods.list({
      customer: sub.stripe_customer_id,
      type: 'card',
    })
    await Promise.all(
      paymentMethods.data.map((pm) => stripe.paymentMethods.detach(pm.id))
    )

    // Update Supabase immediately (webhook will also fire but we want instant UI response)
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        payment_method_detached: true,
      })
      .eq('user_id', userId)

    // Get user email for confirmation email
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (user?.email) {
      sendTrialCanceledEmail({ email: user.email }).catch(
        (err) => console.error('[cancel-trial] email failed:', err)
      )
    }

    return json({ canceled: true })
  } catch (err: any) {
    console.error('[cancel-trial] error:', err)
    return json({ error: err?.message ?? 'Stripe error' }, 500)
  }
}

function json(data: object, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
