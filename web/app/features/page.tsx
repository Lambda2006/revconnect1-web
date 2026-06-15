import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Full breakdown of VictoryRevConnect Boaters — meetup discovery, AI mechanic agent, voice input, and more.",
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

const AGENT = [
  {
    title: "Model-Specific Knowledge",
    body: "The agent is seeded with manufacturer documentation, support knowledge bases, and parts catalog data for each supported make and model. It doesn't answer from general knowledge — it cites its source on every response.",
  },
  {
    title: "Voice Input",
    body: "Hold the mic button and describe the problem by voice. OpenAI Whisper transcribes in seconds. Useful when your hands are greasy or you're trying to hold a flashlight at the same time.",
  },
  {
    title: "Photo Input",
    body: "Take or upload a photo from your gallery. Claude reads the image alongside your question — useful for identifying a part, showing corrosion, or pointing at something you can't describe.",
  },
  {
    title: "Emergency Cache",
    body: "Seven critical safety categories — engine overheating, fire, flooding, bilge pump failure, fuel emergencies, loss of steering, and battery failure — are pre-loaded and returned instantly with no live retrieval latency. These are pre-validated by domain experts and never auto-expire.",
  },
  {
    title: "Cited Responses",
    body: "Every agent answer includes a citation list — source name, URL, and section. Tap any citation to read the source material yourself in the in-app browser.",
  },
  {
    title: "Session Memory",
    body: "The agent maintains context across your entire conversation. You can follow up, refine the question, and reference earlier parts of the same session without re-explaining your boat.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#0A2240] text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#C8102E] font-semibold text-sm uppercase tracking-widest mb-3">Features</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Two tools. One boat.</h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            VictoryRevConnect Boaters combines a connectivity platform for meetup discovery with an
            AI-powered mechanic agent — both designed for the serious boater.
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

      {/* Agent */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="inline-block bg-[#C8102E] text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              AI Mechanic Agent
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2240]">
              Model-specific answers. Cited sources. No guessing.
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

      {/* Disclaimer note */}
      <section className="bg-amber-50 border-t border-amber-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-amber-800 text-sm leading-relaxed">
            <strong>Mechanical guidance disclaimer:</strong> AI-generated mechanic guidance is for
            reference only. Always consult a certified marine mechanic for safety-critical repairs
            involving fuel systems, electrical systems, and steering.{" "}
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
