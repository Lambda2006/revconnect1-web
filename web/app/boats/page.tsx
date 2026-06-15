"use client";

import { useState } from "react";

const SUPPORTED_BOATS = [
  {
    make: "MasterCraft",
    models: [
      { name: "X24", year: "2018–2024", type: "Wake surf / wake board" },
      { name: "NXT22", year: "2018–2024", type: "Wake surf / recreational" },
      { name: "XT23", year: "2018–2024", type: "Wake surf / wake board" },
    ],
  },
  {
    make: "Malibu Boats",
    models: [
      { name: "Wakesetter 23 LSV", year: "2018–2024", type: "Wake surf / wake board" },
      { name: "Response TXi", year: "2018–2024", type: "Slalom / recreational" },
      { name: "21 MLX", year: "2018–2024", type: "Wake surf / wake board" },
    ],
  },
  {
    make: "Boston Whaler",
    models: [
      { name: "270 Dauntless", year: "2018–2024", type: "Center console / offshore" },
      { name: "330 Outrage", year: "2018–2024", type: "Center console / offshore" },
      { name: "Montauk 170", year: "2018–2024", type: "Center console / bay" },
    ],
  },
  {
    make: "Grady-White",
    models: [
      { name: "Canyon 336", year: "2018–2024", type: "Express / offshore" },
      { name: "Freedom 235", year: "2018–2024", type: "Dual console / bay" },
      { name: "Fisherman 236", year: "2018–2024", type: "Walkaround / bay" },
    ],
  },
  {
    make: "Sea Ray",
    models: [
      { name: "SPX 210", year: "2018–2024", type: "Bowrider / recreational" },
      { name: "SDX 270", year: "2018–2024", type: "Bowrider / day cruiser" },
      { name: "Sundancer 320", year: "2018–2024", type: "Express cruiser" },
    ],
  },
];

export default function BoatsPage() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!make.trim() || !model.trim() || !year.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/boat-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ make: make.trim(), model: model.trim(), year: parseInt(year, 10), email: email.trim() || null }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Request failed");
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-[#0A2240] text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#C8102E] font-semibold text-sm uppercase tracking-widest mb-3">Supported Boats</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">15 models at launch.</h1>
          <p className="text-gray-300 text-xl max-w-xl">
            Model-specific AI mechanic support for 5 premium makes. More makes and models added based on community requests.
          </p>
        </div>
      </section>

      {/* Boats table */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {SUPPORTED_BOATS.map((brand) => (
              <div key={brand.make}>
                <h2 className="text-2xl font-extrabold text-[#0A2240] mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#C8102E] inline-block" />
                  {brand.make}
                </h2>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-[#0A2240]">Model</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#0A2240]">Years</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#0A2240]">Type</th>
                        <th className="text-left px-4 py-3 font-semibold text-[#0A2240]">Agent Support</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {brand.models.map((m) => (
                        <tr key={m.name} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                          <td className="px-4 py-3 text-gray-500">{m.year}</td>
                          <td className="px-4 py-3 text-gray-500">{m.type}</td>
                          <td className="px-4 py-3">
                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                              Supported
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request form */}
      <section className="bg-gray-50 py-20" id="request">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-[#0A2240] mb-2">Don&apos;t see your boat?</h2>
          <p className="text-gray-500 mb-8">
            Submit a request. Boats with the most requests are prioritized for the next support update.
          </p>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🙏</div>
              <h3 className="font-bold text-lg mb-2">Request received!</h3>
              <p className="text-sm">We track all submissions and prioritize by community demand. You&apos;ll hear from us if your model moves to the top of the list.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 space-y-5 shadow-sm">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-[#0A2240] mb-1">Make *</label>
                <input
                  required
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="e.g. Cobalt"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0A2240] mb-1">Model *</label>
                <input
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. R5"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0A2240] mb-1">Year *</label>
                <input
                  required
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 2021"
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0A2240] mb-1">
                  Email <span className="text-gray-400 font-normal">(optional — for update notifications)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2240]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C8102E] hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit Request"}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
