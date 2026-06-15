import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendAgentSubscriptionCanceledEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })

const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/remove-agent-addon
 *
 * Called when a user removes the agent subscription during days 1–7.
 * Blueprint: "User can remove the agent subscription at any point during days 1–7
 * from the profile screen — app fee still charges on day 8."
 *
 * Switches the subscription item from the $9.99/month agent price to the
 * $0/month app-only tracking price. The $4.99 app fee invoice item at trial
 * end is unaffected.
 *
 * Updates subscription metadata.plan to 'app_only' — webhook picks this up.
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

  const agentPriceId = process.env.STRIPE_PRICE_APP_AND_AGENT!
  const appOnlyRecurringPriceId = process.env.STRIPE_PRICE_APP_ONLY_RECURRING!

  try {
    const { data: sub, error } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_sub_id, plan, status')
      .eq('user_id', userId)
      .single()

    if (error || !sub) return json({ error: 'No subscription found' }, 404)
    if (sub.status !== 'trialing') {
      return json({ error: 'Can only remove agent add-on during trial' }, 400)
    }
    if (sub.plan === 'app_only') {
      return json({ error: 'Already on app_only plan' }, 400)
    }

    // Find and replace the agent subscription item with the $0 app-only tracking item
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_sub_id)
    const agentItem = stripeSub.items.data.find((item) => item.price.id === agentPriceId)

    if (!agentItem) {
      return json({ error: 'Agent subscription item not found' }, 400)
    }

    await stripe.subscriptions.update(sub.stripe_sub_id, {
      items: [{ id: agentItem.id, price: appOnlyRecurringPriceId }],
      metadata: { plan: 'app_only' },
      proration_behavior: 'none',
    })

    // Update Supabase immediately
    await supabaseAdmin
      .from('subscriptions')
      .update({ plan: 'app_only' })
      .eq('user_id', userId)

    // Send agent-canceled confirmation email (blueprint section 14)
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (user?.email && stripeSub.trial_end) {
      sendAgentSubscriptionCanceledEmail({
        email: user.email,
        // Agent access ends at trial_end — after that the user is on app_only
        accessEndsAt: new Date(stripeSub.trial_end * 1000),
      }).catch((err) => console.error('[remove-agent-addon] email failed:', err))
    }

    return json({ updated: true, plan: 'app_only' })
  } catch (err: any) {
    console.error('[remove-agent-addon] error:', err)
    return json({ error: err?.message ?? 'Stripe error' }, 500)
  }
}

function json(data: object, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
