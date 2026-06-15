/**
 * lib/email.ts — Resend transactional email functions.
 * All 8 email events from blueprint section 14.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@victoryrevconnect.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://victoryrevconnect.com";

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY || RESEND_API_KEY.startsWith("PASTE_")) {
    console.warn("[email] RESEND_API_KEY not set — email not sent to:", to, subject);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    console.error("[email] Resend error:", await res.text());
  }
}

// --- Trial start ---
export async function sendTrialStartEmail({
  email,
  plan,
  trialEndDate,
}: {
  email: string;
  plan: string;
  trialEndDate: string;
}): Promise<void> {
  await sendEmail(
    email,
    "Welcome to VictoryRevConnect Boaters — Your trial has started",
    `<h2>Welcome aboard!</h2>
     <p>Your 7-day free trial has started. You have full access to ${plan === "app_and_agent" ? "the app and AI Mechanic" : "the app"}.</p>
     <p><strong>Trial ends:</strong> ${trialEndDate}</p>
     <p>On day 8, your card will be charged $4.99${plan === "app_and_agent" ? " + $9.99/month for the AI Mechanic" : ""}.</p>
     <p><a href="${APP_URL}/garage/upgrade">Manage your plan</a></p>`
  );
}

// --- Day 4 reminder ---
export async function sendTrialDay4Email({ email }: { email: string }): Promise<void> {
  await sendEmail(
    email,
    "VictoryRevConnect Boaters — 3 days left in your trial",
    `<h2>3 days left in your free trial</h2>
     <p>Your trial ends in 3 days. After that, your card will be charged automatically.</p>
     <p><a href="${APP_URL}/garage/upgrade">Manage your plan →</a></p>`
  );
}

// --- Day 7 reminder ---
export async function sendTrialDay7Email({ email }: { email: string }): Promise<void> {
  await sendEmail(
    email,
    "VictoryRevConnect Boaters — Charges begin tomorrow",
    `<h2>Your trial ends tomorrow</h2>
     <p>Charges will apply starting tomorrow. No action needed to continue.</p>
     <p><a href="${APP_URL}/garage/upgrade">Manage or cancel →</a></p>`
  );
}

// --- Payment success ---
export async function sendPaymentSuccessEmail({
  email,
  amount,
}: {
  email: string;
  amount: number;
}): Promise<void> {
  await sendEmail(
    email,
    "VictoryRevConnect Boaters — Payment confirmed",
    `<h2>Payment confirmed</h2>
     <p>We successfully charged $${amount.toFixed(2)} to your card on file.</p>
     <p>Thank you for being a VictoryRevConnect Boaters member.</p>`
  );
}

// --- Payment failed ---
export async function sendPaymentFailedEmail({
  email,
  portalUrl,
}: {
  email: string;
  portalUrl: string;
}): Promise<void> {
  await sendEmail(
    email,
    "VictoryRevConnect Boaters — Payment failed",
    `<h2>We couldn't process your payment</h2>
     <p>Your payment failed. Please update your payment method to keep access.</p>
     <p><a href="${portalUrl}">Update payment method →</a></p>`
  );
}

// --- Trial canceled ---
export async function sendTrialCanceledEmail({ email }: { email: string }): Promise<void> {
  await sendEmail(
    email,
    "VictoryRevConnect Boaters — Trial canceled",
    `<h2>Trial canceled</h2>
     <p>Your trial has been canceled. No charges were made and your card has been removed.</p>
     <p>You can rejoin anytime at <a href="${APP_URL}">${APP_URL}</a>.</p>`
  );
}

// --- Agent subscription added ---
export async function sendAgentSubscriptionAddedEmail({
  email,
  nextBillingDate,
}: {
  email: string;
  nextBillingDate: string;
}): Promise<void> {
  await sendEmail(
    email,
    "VictoryRevConnect Boaters — AI Mechanic activated",
    `<h2>AI Mechanic activated</h2>
     <p>The AI Mechanic add-on is now active on your account.</p>
     <p><strong>Next billing date:</strong> ${nextBillingDate} ($9.99/month)</p>`
  );
}

// --- Agent subscription canceled ---
export async function sendAgentSubscriptionCanceledEmail({
  email,
  accessEndsAt,
}: {
  email: string;
  accessEndsAt: string;
}): Promise<void> {
  await sendEmail(
    email,
    "VictoryRevConnect Boaters — AI Mechanic removed",
    `<h2>AI Mechanic removed</h2>
     <p>The AI Mechanic add-on has been removed from your subscription.</p>
     <p>You will retain AI Mechanic access until: <strong>${accessEndsAt}</strong></p>
     <p>You still have full app access.</p>`
  );
}
