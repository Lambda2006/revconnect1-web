// Typed accessors over the static demo JSON.
import partsJson from "@/demo/data/parts.json";
import marinasJson from "@/demo/data/marinas.json";
import eventsJson from "@/demo/data/events.json";
import serviceCentersJson from "@/demo/data/serviceCenters.json";
import demoUserJson from "@/demo/data/demoUser.json";
import intervalsJson from "@/demo/data/serviceIntervals.json";
import type {
  DemoPart,
  DemoMarina,
  DemoEvent,
  DemoServiceCenter,
  DemoBoat,
  DemoServiceInterval,
} from "./types";

export const DEMO_PARTS = partsJson.parts as DemoPart[];
export const DEMO_MARINAS = marinasJson.marinas as DemoMarina[];
export const DEMO_EVENTS = eventsJson.events as DemoEvent[];
export const DEMO_SERVICE_CENTERS = serviceCentersJson.serviceCenters as DemoServiceCenter[];
export const DEMO_USER = demoUserJson.user;
export const DEMO_GARAGE = demoUserJson.garage as DemoBoat[];
export const DEMO_INTERVALS = intervalsJson.intervals as DemoServiceInterval[];

export function getPart(id: string): DemoPart | undefined {
  return DEMO_PARTS.find((p) => p.id === id);
}

export function getParts(ids: string[]): DemoPart[] {
  return ids.map((id) => getPart(id)).filter((p): p is DemoPart => Boolean(p));
}

export function getMarina(id: string): DemoMarina | undefined {
  return DEMO_MARINAS.find((m) => m.id === id);
}

export function getServiceCenter(id: string): DemoServiceCenter | undefined {
  return DEMO_SERVICE_CENTERS.find((s) => s.id === id);
}

export function getEvent(id: string): DemoEvent | undefined {
  return DEMO_EVENTS.find((e) => e.id === id);
}

// Cooling-system parts surfaced under the pre-scripted impeller diagnosis.
export const IMPELLER_DIAGNOSIS_PART_IDS = ["mm-impeller-kit", "mm-water-intake-screen", "mm-thermostat-kit"];

// MarineMax brand palette (placeholder co-branding, swappable).
export const MARINEMAX_BLUE = "#00337F";
export const MARINEMAX_BLUE_DARK = "#00265E";
export const MARINEMAX_ACCENT = "#0A66C2";
