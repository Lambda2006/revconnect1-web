import { createClient } from '@supabase/supabase-js'
import { sendTrialDay4ReminderEmail, sendTrialDay7ReminderEmail } from '@/lib/email'

const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/trial-reminders
 *
 * Cron endpoint — called daily at midnight UTC by Vercel (see vercel.json).
 *
 * Queries all trialing subscriptions and sends reminder emails at the right
 * points in the trial window (blueprint section 14):
 *   - Day 4 reminder: ~3 days remaining  (trial_ends_at is 2.5 – 3.5 days away)
 *   - Day 7 reminder: ~0 days remaining  (trial_ends_at is 0 – 1.5 days away)
 *
 * Secured with CRON_SECRET — Vercel passes this automatically via the
 * Authorization header when triggering cron jobs.
 */
export async function GET(request: Request): Promise<Response> {
  // Verify the request is from Vercel cron (or our own tooling)
  const auth = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = Date.now()

  // Fetch all trialing subscriptions with their user emails
  const { data: subs, error } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, trial_ends_at')
    .eq('status', 'trialing')
    .not('trial_ends_at', 'is', null)

  if (error) {
    console.error('[trial-reminders] fetch error:', error)
    return new Response('Internal error', { status: 500 })
  }

  let day4Sent = 0
  let day7Sent = 0

  for (const sub of subs ?? []) {
    const trialEndsAt = new Date(sub.trial_ends_at).getTime()
    const hoursRemaining = (trialEndsAt - now) / (1000 * 60 * 60)

    // Fetch user email
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', sub.user_id)
      .single()

    if (!user?.email) continue

    if (hoursRemaining >= 60 && hoursRemaining <= 84) {
      // 2.5 – 3.5 days remaining → Day 4 reminder (3 days left)
      await sendTrialDay4ReminderEmail({ email: user.email })
        .catch((err) => console.error('[trial-reminders] day4 email failed:', err))
      day4Sent++
    } else if (hoursRemaining >= 0 && hoursRemaining <= 36) {
      // 0 – 1.5 days remaining → Day 7 reminder (charges tomorrow)
      await sendTrialDay7ReminderEmail({ email: user.email })
        .catch((err) => console.error('[trial-reminders] day7 email failed:', err))
      day7Sent++
    }
  }

  console.log(`[trial-reminders] day4=${day4Sent} day7=${day7Sent} of ${subs?.length ?? 0} trialing`)
  return new Response(
    JSON.stringify({ day4Sent, day7Sent, total: subs?.length ?? 0 }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
