import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Full breakdown of VictoryRevConnect Boaters — meetup discovery, diagnostic questionnaire, AI mechanic agent, and offline knowledge base.",
};

const CONNECTIVITY = [
  {
    title: "Live Meetup Map",
    body: "A Mapbox-powered map shows every public meetup near you in real time. Filter by activity type — wake surfing, fishing, cruising, rafting up. Tap any pin to see details, who's attending, and RSVP.",
  },
  {
    title: "RSVP & Real-Time Chat",
    body: "Confirm your spot and join the meetup chat channel the moment you RSVP. Messages are delivered live via Supabase Realtime — no refresh required.",
  },
  {
    title: "Host Your Meetup",
    body: "Create meetups with title, activity type, location, date, max boat count, and visibility (public, followers only). Manage attendees, confirm or decline requests, and edit details any time.",
  },
  {
    title: "Followers & Following",
    body: "Follow other boaters to see followers-only meetups and keep up with their activity. Your followers can see meetups you restrict to your community.",
  },
  {
    title: "Business Promotions",
    body: "Marinas, repair shops, fuel docks, and waterfront restaurants surface contextually near your meetups. View active promos and redeem in-app at the dock.",
  },
];

const QUESTIONNAIRE = [
  {
    title: "Fault Narrowing",
    body: "The questionnaire walks you through a structured set of questions to isolate the most likely cause before you ever open a chat. You're not guessing — you're arriving with a clear picture.",
  },
  {
    title: "Context for the Agent",
    body: "Once complete, the questionnaire's results can be passed directly into an agent session. The agent starts the conversation already knowing your symptoms, conditions, and what you've already ruled out.",
  },
  {
    title: "Use It Independently",
    body: "The questionnaire is a standalone tool. Run it to understand what might be wrong without needing to go further — helpful for quick checks before a trip or when you just want a second opinion.",
  },
];

const AGENT = [
  {
    title: "Step-by-Step Responses",
    body: "Every agent answer is broken down into clear, sequential steps — not a wall of text. Each step is scoped to one action so you can work through a problem without losing your place.",
  },
  {
    title: "Context-Aware Accuracy",
    body: "When you bring questionnaire results into the chat, the agent already knows your boat, your symptoms, and what you've already tried. Answers are targeted — not generic troubleshooting that starts from zero.",
  },
  {
    title: "Voice Input",
    body: "Hold the mic button and describe the problem by voice. Transcription happens in seconds — useful when your hands are greasy or you're juggling a flashlight.",
  },
  {
    title: "Photo Input",
    body: "Take or upload a photo from your gallery. The agent reads the image alongside your question — useful for identifying a part, showing corrosion, or pointing at something you can't describe in words.",
  },
  {
    title: "Offline Emergency Cache",
    body: "Seven critical safety categories — engine overheating, fire, flooding, bilge pump failure, fuel emergencies, loss of steering, and battery failure — are pre-loaded and delivered instantly with no connection required. These responses are pre-validated and never auto-expire.",
  },
  {
    title: "Session Memory",
    body: "The agent maintains context across your entire conversation. Follow up, refine your question, or reference something from earlier in the same session without re-explaining anything.",
  },
];

const KNOWLEDGE_BASE = [
  {
    title: "Personalized to Your Boat",
    body: "The Knowledge Base is built from the information you enter about your boat — make, model, year, and configuration. Everything in it is scoped to what's relevant to you.",
  },
  {
    title: "Maintenance",
    body: "Service intervals, fluid specs, seasonal checks, and upkeep tasks specific to your boat. A reference you can pull up at the dock or in the garage without searching.",
  },
  {
    title: "Safety & Legal",
    body: "Required safety equipment, registration requirements, navigation rules, and on-water legal obligations relevant to your vessel. Know what you're required to have before you launch.",
  },
  {
    title: "Engine & Systems",
    body: "Engine specs, system overviews, and common fault information for your specific make and model. Useful for understanding what you're looking at before calling a mechanic.",
  },
  {
    title: "Available Offline",
    body: "The entire Knowledge Base is cached to your device. No signal needed — whether you're out on the water or in a marina with no reception, it's always there.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#0A2240] text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#C8102E] font-semibold text-sm uppercase tracking-widest mb-3">Features</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Built for the serious boater.</h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            VictoryRevConnect Boaters combines a connectivity platform for meetup discovery with a
            subscription suite of intelligent tools — Diagnostic Questionnaire, AI Mechanic Agent,
            and an offline Knowledge Base — all in one app.
          </p>
        </div>
      </section>

      {/* Connectivity */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="inline-block bg-[#0A2240] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Connectivity
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2240]">
              Find your crew. Plan the day.
            </h2>
          </div>
          <div className="space-y-8">
            {CONNECTIVITY.map((item) => (
              <div key={item.title} className="flex gap-6 items-start">
                <div className="w-2 h-2 rounded-full bg-[#C8102E] mt-2.5 flex-shrink-0" />
                <div>
                  <h3 className="text-[#0A2240] font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Questionnaire */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="inline-block bg-[#C8102E] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Diagnostic Questionnaire — Subscription
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2240]">
              Narrow it down before you start guessing.
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl leading-relaxed">
              The questionnaire is a structured diagnostic tool that walks you through a fault-narrowing process specific to your boat. Use it independently or hand its results to the agent for a fully context-loaded conversation.
            </p>
          </div>
          <div className="space-y-8">
            {QUESTIONNAIRE.map((item) => (
              <div key={item.title} className="flex gap-6 items-start">
                <div className="w-2 h-2 rounded-full bg-[#C8102E] mt-2.5 flex-shrink-0" />
                <div>
                  <h3 className="text-[#0A2240] font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="inline-block bg-[#C8102E] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              AI Mechanic Agent — Subscription
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2240]">
              In-depth answers. Step by step. With context that matters.
            </h2>
          </div>
          <div className="space-y-8">
            {AGENT.map((item) => (
              <div key={item.title} className="flex gap-6 items-start">
                <div className="w-2 h-2 rounded-full bg-[#C8102E] mt-2.5 flex-shrink-0" />
                <div>
                  <h3 className="text-[#0A2240] font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Base */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="inline-block bg-[#C8102E] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Knowledge Base — Subscription
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2240]">
              Your boat&apos;s compendium. Offline, always available.
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl leading-relaxed">
              A personalized reference built around your specific boat — covering every dimension of ownership, cached to your device so you can access it without a connection.
            </p>
          </div>
          <div className="space-y-8">
            {KNOWLEDGE_BASE.map((item) => (
              <div key={item.title} className="flex gap-6 items-start">
                <div className="w-2 h-2 rounded-full bg-[#C8102E] mt-2.5 flex-shrink-0" />
                <div>
                  <h3 className="text-[#0A2240] font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Boater's Blog */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="inline-block bg-[#0A2240] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Boater&apos;s Blog
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2240]">
              Tips, guides, and stories — written for boaters.
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl leading-relaxed">
              The Boater&apos;s Blog is a curated editorial feed built into the app. Articles are AI-assisted and reviewed before publishing, covering maintenance tips, seasonal guides, meetup recaps, and waterway spotlights.
            </p>
          </div>
          <div className="space-y-8">
            {[
              {
                title: "In-App Reading Experience",
                body: "Articles are available directly inside the app under the Blog tab — no external browser required. Each post includes a cover image, estimated read time, and a clean reading layout.",
              },
              {
                title: "Curated & Reviewed",
                body: "Every article passes through an editorial review queue before it goes live. Topics are planned around the boating calendar — spring commissioning, summer safety, fall layup, and more.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-6 items-start">
                <div className="w-2 h-2 rounded-full bg-[#C8102E] mt-2.5 flex-shrink-0" />
                <div>
                  <h3 className="text-[#0A2240] font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer note */}
      <section className="bg-amber-50 border-t border-amber-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-amber-800 text-sm leading-relaxed">
            <strong>Mechanical guidance disclaimer:</strong> AI-generated guidance and Knowledge Base
            content are for reference only. Always consult a certified marine mechanic for
            safety-critical repairs involving fuel systems, electrical systems, and steering.{" "}
            <Link href="/disclaimer" className="underline">Read full disclaimer →</Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-[#0A2240] mb-6">
            Try everything free for 7 days.
          </h2>
          <Link
            href="/pricing"
            className="bg-[#C8102E] hover:bg-red-700 text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-lg inline-block"
          >
            See Pricing & Start Trial
          </Link>
        </div>
      </section>
    </>
  );
}
