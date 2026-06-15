import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@victoryrevconnect.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://boat.victoryrevconnect.com'

/**
 * Transactional email helpers — blueprint section 14.
 * All functions are non-blocking fire-and-forget; callers should .catch() errors.
 */

export async function sendTrialStartEmail({
  email,
  plan,
  trialEnd,
}: {
  email: string
  plan: 'app_only' | 'app_and_agent'
  trialEnd: Date
}): Promise<void> {
  const dayEight = formatDate(trialEnd)
  const planLabel = plan === 'app_and_agent' ? 'App + AI Mechanic Agent' : 'App Only'
  const chargePreview =
    plan === 'app_and_agent'
      ? '$4.99 app purchase + $9.99/month agent subscription'
      : '$4.99 app purchase'

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Welcome to VictoryRevConnect Boaters — 7-day free trial started',
    html: `
      <p>Welcome aboard! Your 7-day free trial has started.</p>
      <p><strong>Plan:</strong> ${planLabel}</p>
      <p><strong>Trial ends:</strong> ${dayEight}</p>
      <p><strong>What happens on day 8:</strong> ${chargePreview} will be charged automatically.</p>
      <p>You have full access to the app${plan === 'app_and_agent' ? ' and the AI Mechanic Agent' : ''} for the next 7 days — no charge until day 8.</p>
      ${
        plan === 'app_and_agent'
          ? `<p>You can remove the agent subscription at any point before day 8 from your profile screen — the $4.99 app fee will still apply.</p>`
          : ''
      }
      <p>Questions? Reply to this email.</p>
      <p>— VictoryRevConnect Boaters Team</p>
    `,
  })
}

export async function sendPaymentFailedEmail({
  email,
  customerPortalUrl,
}: {
  email: string
  customerPortalUrl: string
}): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Action required — payment failed for VictoryRevConnect Boaters',
    html: `
      <p>We were unable to process your payment for VictoryRevConnect Boaters.</p>
      <p>Your access has been temporarily suspended. Please update your payment method to restore access.</p>
      <p><a href="${customerPortalUrl}" style="color:#C8102E;font-weight:bold;">Update payment method</a></p>
      <p>Stripe will retry your payment automatically. If all retries fail, your subscription will be canceled.</p>
      <p>— VictoryRevConnect Boaters Team</p>
    `,
  })
}

export async function sendPaymentSucceededEmail({
  email,
  amount,
  nextBillingDate,
}: {
  email: string
  amount: number
  nextBillingDate: Date
}): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Payment confirmed — VictoryRevConnect Boaters',
    html: `
      <p>Your payment of <strong>$${(amount / 100).toFixed(2)}</strong> was successful.</p>
      <p>Your VictoryRevConnect Boaters subscription is active.</p>
      <p><strong>Next billing date:</strong> ${formatDate(nextBillingDate)}</p>
      <p>— VictoryRevConnect Boaters Team</p>
    `,
  })
}

export async function sendTrialCanceledEmail({ email }: { email: string }): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Trial canceled — VictoryRevConnect Boaters',
    html: `
      <p>Your trial has been canceled. No charges have been made.</p>
      <p>Your payment method has been removed from our system.</p>
      <p>If you change your mind, you can sign up again at <a href="${APP_URL}/pricing">${APP_URL}/pricing</a>.</p>
      <p>— VictoryRevConnect Boaters Team</p>
    `,
  })
}

export async function sendAgentSubscriptionAddedEmail({
  email,
  nextBillingDate,
}: {
  email: string
  nextBillingDate: Date
}): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'AI Mechanic Agent added — VictoryRevConnect Boaters',
    html: `
      <p>The AI Mechanic Agent has been added to your subscription.</p>
      <p>You now have access to model-specific diagnostics, repair walkthroughs, and part numbers.</p>
      <p><strong>First billing date:</strong> ${formatDate(nextBillingDate)} ($9.99/month)</p>
      <p>— VictoryRevConnect Boaters Team</p>
    `,
  })
}

export async function sendAgentSubscriptionCanceledEmail({
  email,
  accessEndsAt,
}: {
  email: string
  accessEndsAt: Date
}): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Agent subscription canceled — VictoryRevConnect Boaters',
    html: `
      <p>Your AI Mechanic Agent subscription has been canceled.</p>
      <p>Agent access remains active until <strong>${formatDate(accessEndsAt)}</strong>.</p>
      <p>After that date your subscription reverts to App Only. You can re-add the agent at any time from the upgrade screen.</p>
      <p>— VictoryRevConnect Boaters Team</p>
    `,
  })
}

// Day 4 reminder — 3 days left
export async function sendTrialDay4ReminderEmail({ email }: { email: string }): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '3 days left in your VictoryRevConnect Boaters trial',
    html: `
      <p>Just a heads-up — your free trial ends in 3 days.</p>
      <p>Make sure your payment method is confirmed before day 8 to avoid any interruption in service.</p>
      <p>You can manage your subscription from the profile screen in the app.</p>
      <p>— VictoryRevConnect Boaters Team</p>
    `,
  })
}

// Day 7 reminder — charges tomorrow
export async function sendTrialDay7ReminderEmail({ email }: { email: string }): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Your trial ends tomorrow — charges apply on day 8',
    html: `
      <p>Your VictoryRevConnect Boaters trial ends tomorrow.</p>
      <p>Your card on file will be charged automatically. If you'd like to cancel or make changes, open the app and go to your profile before midnight tonight.</p>
      <p>— VictoryRevConnect Boaters Team</p>
    `,
  })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
