"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SUPPORTED_BOATS = [
  { make: "MasterCraft", models: ["X24", "NXT22", "XT23"] },
  { make: "Malibu", models: ["Wakesetter 23 LSV", "Response TXi", "21 MLX"] },
  { make: "Boston Whaler", models: ["270 Dauntless", "330 Outrage", "Montauk 170"] },
  { make: "Grady-White", models: ["Canyon 336", "Freedom 235", "Fisherman 236"] },
  { make: "Sea Ray", models: ["SPX 210", "SDX 270", "Sundancer 320"] },
];

const FEATURES = [
  {
    icon: "🩺",
    title: "Diagnostic Questionnaire",
    desc: "Work through a guided fault-narrowing questionnaire before you ever type a message. Pinpoint the problem — then hand the agent full context to go deeper.",
    badge: "Subscription",
  },
  {
    icon: "🔧",
    title: "AI Mechanic Agent",
    desc: "Get in-depth, step-by-step guidance tailored to your boat. The agent uses your questionnaire context for accurate, focused answers — and keeps critical responses cached offline.",
    badge: "Subscription",
  },
  {
    icon: "📖",
    title: "Knowledge Base",
    desc: "An offline compendium built around your boat — maintenance schedules, safety and legal requirements, engine specifics, and general boat info. Personalized to what you've entered, available without a connection.",
    badge: "Subscription",
  },
  {
    icon: "🗺️",
    title: "Discover Meetups",
    desc: "Find boaters near you on the live map. RSVP, chat with attendees, and coordinate everything before you hit the water.",
  },
  {
    icon: "⚓",
    title: "Host Your Own",
    desc: "Create a meetup — set your location, activity type, max boats, and visibility. Public or followers only.",
  },
  {
    icon: "🏪",
    title: "Local Businesses",
    desc: "Marinas, repair shops, fuel docks, and waterfront restaurants surface contextually near your meetup.",
  },
];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace("/garage");
    });
  }, [router]);

  return (
    <>
      {/* Hero */}
      <section className="bg-[#0A2240] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="text-[#C8102E] font-semibold text-sm uppercase tracking-widest mb-4">
              For Serious Boat Owners
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Know your boat.
              <br />
              Fix it with <span className="text-[#C8102E]">confidence.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl">
              VictoryRevConnect Boaters puts a diagnostic questionnaire, an intelligent AI mechanic
              agent, and an offline knowledge base personalized to your boat right in your pocket —
              plus a community of boaters to connect with when you&apos;re ready to hit the water.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/discover"
                className="bg-[#C8102E] hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl text-lg text-center transition-colors shadow-lg"
              >
                Open App
              </Link>
              <Link
                href="/pricing"
                className="border border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded-xl text-lg text-center transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="/features"
                className="border border-white/30 hover:border-white text-white font-semibold px-8 py-4 rounded-xl text-lg text-center transition-colors"
              >
                See How It Works →
              </Link>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Card required. You won&apos;t be charged until day 8.
            </p>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2240] mb-4">
              Everything you need to own your boat
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              One app for keeping your boat running — and finding your crew when you&apos;re ready.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="text-3xl mb-4">{f.icon}</div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-[#0A2240] font-bold text-lg">{f.title}</h3>
                  {"badge" in f && f.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-[#C8102E] text-white px-2 py-0.5 rounded-full">
                      {f.badge}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/features"
              className="text-[#C8102E] font-semibold hover:underline"
            >
              Full feature breakdown →
            </Link>
          </div>
        </div>
      </section>

      {/* Supported boats strip */}
      <section className="bg-[#0A2240] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Supported makes &amp; models
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              The Knowledge Base and AI features are built around these boats.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {SUPPORTED_BOATS.map((brand) => (
              <div key={brand.make} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white font-bold text-sm mb-2">{brand.make}</p>
                <ul className="space-y-1">
                  {brand.models.map((m) => (
                    <li key={m} className="text-gray-400 text-xs">{m}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-gray-400 mb-4 text-sm">Don&apos;t see your boat?</p>
            <Link
              href="/boats"
              className="bg-white text-[#0A2240] font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors text-sm"
            >
              Request Your Model
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof / CTA */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2240] mb-6">
            Built for the boater who takes their time on the water seriously.
          </h2>
          <p className="text-gray-500 text-lg mb-10">
            7 days free. If you love it, continue with the full subscription — Questionnaire,
            AI Mechanic Agent, and Knowledge Base included. Cancel anytime before day 8 with zero charges.
          </p>
          <Link
            href="/pricing"
            className="bg-[#C8102E] hover:bg-red-700 text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-lg inline-block"
          >
            Start Your Free Trial
          </Link>
          <p className="text-gray-400 text-sm mt-4">
            App-only plan available — connectivity features only, no subscription required.
          </p>
        </div>
      </section>
    </>
  );
}
