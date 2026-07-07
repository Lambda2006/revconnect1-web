// Demo configuration — access gate + guided tour narrative.

export const DEMO_ACCESS_CODE =
  process.env.NEXT_PUBLIC_DEMO_ACCESS_CODE || "MARINEMAX2026";

export const DEMO_ACCESS_STORAGE_KEY = "vrc-demo-access";
export const DEMO_TOUR_STORAGE_KEY = "vrc-demo-tour-dismissed";

export interface TourStep {
  id: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}

/**
 * The guided demo narrative, in sequence. Emphasizes the MarineMax referral
 * touchpoints: parts, events, service locations, and boat slips.
 */
export const TOUR_STEPS: TourStep[] = [
  {
    id: "garage",
    title: "1 · The Garage",
    body: "Alex's demo account opens with a 2021 Boston Whaler 270 Dauntless already in the garage, twin Mercury Verado 300s and live engine hours. Everything downstream is personalized to this exact boat.",
    href: "/demo/garage",
    cta: "Open the boat",
  },
  {
    id: "knowledge",
    title: "2 · Knowledge Base",
    body: "Model-specific service intervals — and every maintenance item links straight to the exact MarineMax part that fulfills it. This is where routine ownership becomes MarineMax parts revenue.",
    href: "/demo/garage/demo-boat-bw270/knowledge",
    cta: "See the intervals",
  },
  {
    id: "diagnose",
    title: "3 · Diagnostic Questionnaire",
    body: "The owner reports a weak tell-tale and overheating. The guided questionnaire walks them through it and lands on a confident impeller diagnosis.",
    href: "/demo/garage/demo-boat-bw270/diagnose",
    cta: "Run the diagnosis",
  },
  {
    id: "parts",
    title: "4 · Parts Recommendation",
    body: "Under the diagnosis, MarineMax cooling parts appear instantly — impeller kit, intake screens, thermostat — in-stock at their nearest MarineMax location with a one-tap 'View at MarineMax'.",
    href: "/demo/garage/demo-boat-bw270/diagnose",
    cta: "See recommended parts",
  },
  {
    id: "service",
    title: "5 · Service Referral",
    body: "Prefer a pro? The owner is referred to a certified MarineMax service center — Mercury Verado specialists — with available parts and a one-tap Book Service.",
    href: "/demo/service/mm-service-clearwater",
    cta: "View a service center",
  },
  {
    id: "discover",
    title: "6 · Discover Map — Marinas & Slips",
    body: "The discover map surfaces four MarineMax marinas across Florida with real slip availability and specs — turning the app into a lead channel for MarineMax berths.",
    href: "/demo/discover",
    cta: "Explore the map",
  },
  {
    id: "event",
    title: "7 · Promotional Event",
    body: "Finally, MarineMax events land right on the map — a Getaways! rendezvous and a Verado service clinic — driving owners to MarineMax experiences. That's the full loop: parts, service, slips, and events.",
    href: "/demo/discover",
    cta: "Finish the tour",
  },
];
