import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })

const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/create-subscription
 *
 * Step 1 of the onboarding payment flow. Called when the user reaches the
 * payment screen. Creates (or retrieves) a Stripe customer for this user,
 * then creates a SetupIntent so the PaymentSheet can collect and confirm
 * the card without charging it. The trial is 7 days — no charge until day 8.
 *
 * Returns:
 *   setupIntentClientSecret  — passed to PaymentSheet.initPaymentSheet()
 *   ephemeralKey             — allows the PaymentSheet to read the customer's PMs
 *   customerId               — stored in app state, sent to confirm-subscription
 *
 * Blueprint section 5 — Trial / billing model.
 */
export async function POST(request: Request): Promise<Response> {
  let body: { userId: string; email: string; plan: 'app_only' | 'app_and_agent' }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { userId, email, plan } = body
  if (!userId || !email || !plan) {
    return json({ error: 'userId, email, and plan are required' }, 400)
  }

  try {
    // Retrieve or create Stripe customer — avoid duplicates on retry
    let customerId: string | null = null

    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id, status')
      .eq('user_id', userId)
      .single()

    // Blueprint section 5: "No second trial for returning users — stripe_customer_id
    // persists on canceled record to identify returning users and route them to
    // direct purchase flow."
    if (existingSub?.status === 'canceled') {
      return json(
        { error: 'Your free trial has already been used.', returningUser: true },
        403
      )
    }

    if (existingSub?.stripe_customer_id) {
      customerId = existingSub.stripe_customer_id
    } else {
      // Check Stripe by metadata in case Supabase row wasn't written yet
      const existing = await stripe.customers.search({
        query: `metadata['user_id']:'${userId}'`,
        limit: 1,
      })
      if (existing.data.length > 0) {
        customerId = existing.data[0].id
      } else {
        const customer = await stripe.customers.create({
          email,
          metadata: { user_id: userId, plan },
        })
        customerId = customer.id
      }
    }

    // SetupIntent — usage: off_session so we can charge on day 8 without user present
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
      metadata: { user_id: userId, plan },
      payment_method_types: ['card'],
    })

    // Ephemeral key — scoped to this customer, lets PaymentSheet read their saved PMs
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: '2024-12-18.acacia' }
    )

    return json({
      setupIntentClientSecret: setupIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customerId,
    })
  } catch (err: any) {
    console.error('[create-subscription] error:', err)
    return json({ error: err?.message ?? 'Stripe error' }, 500)
  }
}

function json(data: object, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
