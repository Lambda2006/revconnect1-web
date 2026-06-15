import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendTrialStartEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })

const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/confirm-subscription
 *
 * Step 2 of the onboarding payment flow. Called after the PaymentSheet
 * confirms the card (SetupIntent succeeded). Creates the Stripe subscription
 * with a 7-day trial, charging the $4.99 app fee as a one-time invoice item
 * on top of the recurring agent subscription (for app_and_agent plan).
 *
 * Billing model (blueprint section 5):
 * - Card collected via SetupIntent — no charge at collection time
 * - Day 8: $4.99 one-time app fee charged for ALL plans
 * - Day 8: $9.99/month agent subscription charged for app_and_agent plan only
 * - app_only plan: $0/month recurring subscription used purely for status tracking
 *
 * The stripe-webhook+api.ts handler fires on customer.subscription.created and
 * writes the subscription record to Supabase, completing the onboarding flow.
 */
export async function POST(request: Request): Promise<Response> {
  let body: {
    userId: string
    email: string
    plan: 'app_only' | 'app_and_agent'
  }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { userId, email, plan } = body
  if (!userId || !email || !plan) {
    return json({ error: 'userId, email, and plan are required' }, 400)
  }

  const appOnlyPriceId = process.env.STRIPE_PRICE_APP_ONLY!       // $4.99 one-time
  const agentPriceId = process.env.STRIPE_PRICE_APP_AND_AGENT!    // $9.99/month recurring
  const appOnlyRecurringPriceId = process.env.STRIPE_PRICE_APP_ONLY_RECURRING! // $0/month tracking

  try {
    // Resolve customer ID server-side — never trust client-supplied IDs
    const customerSearch = await stripe.customers.search({
      query: `metadata['user_id']:'${userId}'`,
      limit: 1,
    })
    if (customerSearch.data.length === 0) {
      return json({ error: 'Stripe customer not found. Please restart onboarding.' }, 404)
    }
    const customerId = customerSearch.data[0].id

    // Retrieve the payment method that was confirmed via SetupIntent
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
      limit: 1,
    })
    const paymentMethodId = paymentMethods.data[0]?.id
    if (!paymentMethodId) {
      return json({ error: 'No confirmed payment method found for customer' }, 400)
    }

    // Set as default payment method on customer
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    })

    // Trial end = 7 days from now (day 8 charge)
    const trialEnd = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60

    // Recurring subscription item — app_and_agent gets $9.99/month, app_only gets $0/month
    const recurringPriceId = plan === 'app_and_agent' ? agentPriceId : appOnlyRecurringPriceId

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: recurringPriceId }],
      trial_end: trialEnd,
      default_payment_method: paymentMethodId,
      // $4.99 one-time app fee — billed at trial end (day 8) for ALL plans
      add_invoice_items: [{ price: appOnlyPriceId }],
      metadata: { user_id: userId, plan },
      // Send initial invoice immediately after trial ends rather than waiting for cycle
      billing_cycle_anchor_config: undefined,
    })

    // Send trial-start welcome email (non-blocking)
    sendTrialStartEmail({ email, plan, trialEnd: new Date(trialEnd * 1000) }).catch(
      (err) => console.error('[confirm-subscription] trial start email failed:', err)
    )

    return json({ subscriptionId: subscription.id, status: subscription.status })
  } catch (err: any) {
    console.error('[confirm-subscription] error:', err)
    return json({ error: err?.message ?? 'Stripe error' }, 500)
  }
}

function json(data: object, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
