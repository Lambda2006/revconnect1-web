import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "VictoryRevConnect Boaters Terms of Service.",
};

export default function TermsPage() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-[#0A2240] mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: June 2026</p>

        <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed space-y-8">

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">1. Acceptance of Terms</h2>
            <p>
              By downloading, accessing, or using VictoryRevConnect Boaters (the &ldquo;App&rdquo;) or this website, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use the App or this website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">2. Description of Service</h2>
            <p>
              VictoryRevConnect Boaters is a mobile application that provides (a) a social connectivity platform for recreational boaters to discover and organize meetups, and (b) an AI-powered mechanic assistant that provides guidance based on manufacturer documentation for supported boat models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">3. Billing & Subscriptions</h2>
            <p>
              The App offers a 7-day free trial requiring a valid payment method at sign-up. You will not be charged during the trial period. On day 8, the following charges apply automatically:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
              <li>$4.99 one-time app purchase fee (all plans)</li>
              <li>$9.99/month recurring agent subscription (App + Agent plan only)</li>
            </ul>
            <p className="mt-3">
              You may cancel the trial before day 8 at no charge. After day 8, the $4.99 app fee is non-refundable. Monthly agent subscription charges may be canceled at any time; access continues through the end of the current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">4. Mechanical Guidance Disclaimer</h2>
            <p>
              The AI mechanic agent provides guidance for informational purposes only. It is not a substitute for professional advice from a certified marine mechanic. By using the agent, you acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
              <li>All guidance should be verified by a qualified marine professional before implementation</li>
              <li>Safety-critical repairs (fuel systems, electrical systems, steering) must be performed by a certified marine mechanic</li>
              <li>VictoryRevConnect Boaters assumes no liability for any damage, injury, or loss arising from reliance on AI-generated mechanical guidance</li>
            </ul>
            <p className="mt-3">
              See our full <a href="/disclaimer" className="text-[#C8102E] hover:underline">Mechanical Guidance Disclaimer</a> for complete terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">5. User Conduct</h2>
            <p>You agree not to use the App to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-gray-600">
              <li>Harass, abuse, or harm other users</li>
              <li>Post false, misleading, or defamatory content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to any system or data</li>
              <li>Use automated tools to scrape or collect data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">6. Intellectual Property</h2>
            <p>
              All content, software, and materials in the App and on this website are owned by or licensed to VictoryRevConnect Boaters. You may not reproduce, distribute, or create derivative works without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, VictoryRevConnect Boaters and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the App or reliance on any content therein.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify active subscribers of material changes via email. Continued use of the App after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0A2240] mb-3">9. Contact</h2>
            <p>
              Questions about these Terms? Contact us at{" "}
              <a href="mailto:hello@victoryrevconnect.com" className="text-[#C8102E] hover:underline">
                hello@victoryrevconnect.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
