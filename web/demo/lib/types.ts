// Shared types for the MarineMax partnership demo (static data).

export type Urgency = "critical" | "high" | "routine";

export interface DemoPart {
  id: string;
  name: string;
  partNumber: string;
  brand: string;
  category: string;
  description: string;
  compatibility: string;
  price: number;
  urgency: Urgency;
  marineMaxUrl: string;
  inStock: boolean;
  location: string;
  relatedInterval: string | null;
}

export interface DemoSlip {
  id: string;
  title: string;
  lengthFt: number;
  beamFt: number;
  draftFt: number;
  powerAmps: string;
  covered: boolean;
  monthlyPrice: number | null;
  nightlyPrice?: number;
  available: boolean;
  availableFrom: string;
  description: string;
}

export interface DemoMarina {
  id: string;
  name: string;
  operator: string;
  verified: boolean;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  amenities: string[];
  slips: DemoSlip[];
}

export interface DemoEvent {
  id: string;
  title: string;
  type: string;
  host: string;
  verified: boolean;
  date: string;
  endDate: string;
  location: string;
  lat: number;
  lng: number;
  venue: string;
  priceLabel: string;
  description: string;
  cta: string;
  featured: boolean;
}

export interface DemoServiceCenter {
  id: string;
  name: string;
  operator: string;
  verified: boolean;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  certifications: string[];
  services: string[];
  hours: string;
  nextAvailable: string;
  bookingCta: string;
  availablePartIds: string[];
}

export interface DemoBoat {
  id: string;
  year: number;
  make: string;
  model: string;
  nickname: string;
  engineType: string;
  engineHours: number;
  hullId: string;
  lengthFt: number;
  beamFt: number;
  homePort: string;
  knowledgeModelKey: string;
  photo: string;
  lastService: string;
  nextServiceDue: string;
}

export interface DemoServiceInterval {
  item: string;
  intervalHours?: number;
  intervalMonths?: number;
  priority: "low" | "medium" | "high";
  notes: string;
  partId: string;
}
