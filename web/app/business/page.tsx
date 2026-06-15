import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For Businesses",
  description:
    "List your marina, boat repair shop, fuel dock, or waterfront restaurant on VictoryRevConnect Boaters.",
};

const CATEGORIES = [
  "Marina",
  "Marine Retailer",
  "Boat Repair Shop",
  "Fuel Dock",
  "Waterfront Restaurant",
  "Watersports Rental",
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create your listing",
    body: "Add your business name, category, contact details, and location pin. Verified businesses get a badge visible to all users.",
  },
  {
    step: "02",
    title: "Create promotions",
    body: "Build time-limited offers — percentage discount, flat off, or a free item. Set a redemption limit or keep it unlimited.",
  },
  {
    step: "03",
    title: "Surface near meetups",
    body: "Your business and active promotions appear on the discover map when boaters plan meetups near your location.",
  },
  {
    step: "04",
    title: "Track performance",
    body: "See views, taps, saves, and redemptions per promotion. Understand which offers convert and which meetups bring traffic.",
  },
];

export default function BusinessPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#0A2240] text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#C8102E] font-semibold text-sm uppercase tracking-widest mb-3">For Businesses</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Reach boaters when it matters.
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl leading-relaxed">
            Get your marina, repair shop, fuel dock, or waterfront restaurant in front of active boaters planning meetups near you.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-500 font-semibold text-sm uppercase tracking-widest mb-5">Business categories</p>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <span
                key={cat}
                className="bg-[#0A2240] text-white text-sm font-medium px-4 py-2 rounded-full"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A2240] mb-14 text-center">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="text-4xl font-extrabold text-gray-100 mb-3">{item.step}</div>
                <h3 className="text-[#0A2240] font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing note */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0A2240] mb-4">
            Business listing plans
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Business listing plans are managed separately from the consumer app subscription. Pricing details and sign-up are available by contacting our team — we manually onboard businesses at launch to ensure listing quality.
          </p>
          <a
            href="mailto:hello@victoryrevconnect.com"
            className="bg-[#C8102E] hover:bg-red-700 text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-lg inline-block"
          >
            Contact Us to Get Listed
          </a>
          <p className="text-gray-400 text-sm mt-4">
            Or email us directly at{" "}
            <a href="mailto:hello@victoryrevconnect.com" className="text-[#C8102E] hover:underline">
              hello@victoryrevconnect.com
            </a>
          </p>
        </div>
      </section>

      {/* Analytics callout */}
      <section className="bg-[#0A2240] text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-extrabold text-[#C8102E] mb-2">Views</div>
              <p className="text-gray-300 text-sm">See how many boaters viewed your promotions</p>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-[#C8102E] mb-2">Taps</div>
              <p className="text-gray-300 text-sm">Track taps, saves, and shares on each offer</p>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-[#C8102E] mb-2">Redemptions</div>
              <p className="text-gray-300 text-sm">Measure actual in-dock promo redemptions</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 mb-6">
            Already a VictoryRevConnect Boaters user?{" "}
            <span className="text-[#0A2240] font-semibold">Business profiles are managed directly in the app.</span>
          </p>
          <Link href="/pricing" className="text-[#C8102E] font-semibold hover:underline">
            Download the app → Start a free trial
          </Link>
        </div>
      </section>
    </>
  );
}
