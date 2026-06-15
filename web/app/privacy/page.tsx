import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "VictoryRevConnect Boaters Privacy Policy.",
};

export default function PrivacyPage() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-[#0A2240] mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: June 2026</p>

        <div className="text-gray-700 leading-relaxed space-y-8">

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">1. Information We Collect</h2>
            <p className="mb-3"><strong>Account information:</strong> Email address, display name, and optionally a home marina and bio when you create an account.</p>
            <p className="mb-3"><strong>Boat information:</strong> Make, model, year, engine type, engine hours, and hull ID for boats you add to your garage. This is used to power AI mechanic responses.</p>
            <p className="mb-3"><strong>Location data:</strong> You provide a location when creating a meetup. The app displays meetup pins on a map. We do not continuously track your device location.</p>
            <p className="mb-3"><strong>Payment information:</strong> Payment card details are collected and stored by Stripe. We do not store card numbers. We store your Stripe customer ID and subscription status.</p>
            <p><strong>Usage data:</strong> Agent session transcripts, voice transcriptions (text only — audio is not stored), and uploaded images are stored to support session continuity.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Provide, maintain, and improve the App</li>
              <li>Power the AI mechanic agent with your boat context</li>
              <li>Process billing and manage your subscription</li>
              <li>Send transactional emails (trial start, payment receipts, billing alerts)</li>
              <li>Display your profile, meetups, and follows to other users per your visibility settings</li>
              <li>Analytics on promotion impressions and redemptions (for businesses)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">3. Data Sharing</h2>
            <p className="mb-3">We do not sell your personal data. We share data only with service providers necessary to operate the App:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li><strong>Supabase</strong> — database and authentication (US-East-2)</li>
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>Anthropic (Claude)</strong> — AI mechanic agent inference</li>
              <li><strong>OpenAI (Whisper)</strong> — voice transcription</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
              <li><strong>Mapbox</strong> — map rendering</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">4. Data Retention</h2>
            <p>
              Account data is retained while your account is active. Agent session transcripts are retained for 12 months. If you cancel your subscription and request deletion, we will delete your personal data within 30 days, except where required for legal or financial record-keeping.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">5. Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data at any time by emailing{" "}
              <a href="mailto:privacy@victoryrevconnect.com" className="text-[#C8102E] hover:underline">privacy@victoryrevconnect.com</a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">6. Security</h2>
            <p>
              All data is encrypted in transit (TLS) and at rest. Authentication tokens are stored in encrypted device storage. Row-level security policies prevent users from accessing other users&apos; private data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">7. Children</h2>
            <p>
              The App is not directed to children under 13. We do not knowingly collect personal data from children under 13. If you believe a child has provided us with their data, contact us to have it removed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">8. Changes</h2>
            <p>
              We will notify active subscribers of material changes to this policy by email at least 14 days before they take effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">9. Contact</h2>
            <p>
              Privacy questions:{" "}
              <a href="mailto:privacy@victoryrevconnect.com" className="text-[#C8102E] hover:underline">
                privacy@victoryrevconnect.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
