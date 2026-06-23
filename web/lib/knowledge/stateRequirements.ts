import type { StateRequirementData } from "./types";

/**
 * State-specific boating requirements.
 * Covers the top boating states by registered vessel count.
 * Always recommend users verify current requirements with their state agency —
 * regulations change and this data reflects general rules as of 2024.
 */
export const STATE_REQUIREMENTS: Record<string, StateRequirementData> = {
  FL: {
    state: "Florida",
    abbreviation: "FL",
    requirements: [
      {
        id: "fl-1",
        label: "Boater Education Card required for operators born on or after January 1, 1988",
        details:
          "Must pass a NASBLA-approved boater safety course and carry the card. Operators born before this date are exempt, but education is strongly encouraged.",
        required: true,
      },
      {
        id: "fl-2",
        label: "Registration renewed annually; decals must be current",
        details:
          "Florida requires annual renewal. Registration decals must be displayed 3 inches aft of the registration number on both sides.",
        required: true,
      },
      {
        id: "fl-3",
        label: "All children under 6 must wear a USCG-approved PFD at all times while on a vessel under 26 ft",
        details:
          "Children under 6 on a vessel under 26 ft must wear a PFD whenever the boat is moving.",
        required: true,
      },
      {
        id: "fl-4",
        label: "No wake / idle speed zones strictly enforced in many waterways",
        details:
          "Florida has extensive manatee protection zones, residential idle-speed zones, and no-wake areas. Violators face significant fines.",
        required: true,
      },
      {
        id: "fl-5",
        label: "Vessel operator must have a valid ID and vessel registration onboard",
        details:
          "FWC officers can stop and board vessels at any time. Have registration certificate and operator ID available.",
        required: true,
      },
    ],
    boaterEducationInfo:
      "Complete an approved course at MyFWC.com. Free online option available. Card is free and required for born-after-1987 operators.",
    registrationInfo:
      "Register at a county tax collector office or online at MyFWC.com. Annual renewal.",
    resourceUrl: "https://myfwc.com/boating/",
  },

  TX: {
    state: "Texas",
    abbreviation: "TX",
    requirements: [
      {
        id: "tx-1",
        label: "Boater Education Certificate required for operators born on or after September 1, 1993",
        details:
          "Must complete a NASBLA-approved course before operating a vessel over 15 hp or a personal watercraft on Texas public water. Certificate must be carried onboard.",
        required: true,
      },
      {
        id: "tx-2",
        label: "Registration renewed every 2 years",
        details:
          "Texas vessel registration is valid for 2 years. Certificates must be onboard while operating.",
        required: true,
      },
      {
        id: "tx-3",
        label: "Children under 13 must wear a USCG-approved PFD while underway on a vessel under 26 ft",
        details:
          "Exception: children in an enclosed cabin. All children on PWC must wear a PFD.",
        required: true,
      },
      {
        id: "tx-4",
        label: "Boating under the influence (BUI) limit: 0.08% BAC",
        details:
          "Texas BUI is treated similarly to DUI. Open container of alcohol is also restricted on Texas public waters.",
        required: true,
      },
    ],
    boaterEducationInfo:
      "Online course available through Texas Parks & Wildlife (TPWD). Must be passed before operating a vessel over 15 hp if born after Sept 1, 1993.",
    registrationInfo:
      "Register with Texas Parks & Wildlife. 2-year renewal. Online renewal available at tpwd.texas.gov.",
    resourceUrl: "https://tpwd.texas.gov/fish-and-wildlife/boating",
  },

  CA: {
    state: "California",
    abbreviation: "CA",
    requirements: [
      {
        id: "ca-1",
        label: "Boater Card required for operators born on or after January 1, 1960",
        details:
          "Mandatory Boater Card phased in by age. As of 2025, ALL operators must have one regardless of birth year. Complete a NASBLA-approved California Boater Card course.",
        required: true,
      },
      {
        id: "ca-2",
        label: "Children under 13 must wear a USCG-approved Type I, II, or III PFD",
        details:
          "Required at all times when on a moving vessel, including on the deck or in an open area.",
        required: true,
      },
      {
        id: "ca-3",
        label: "Registration renewed annually; current decals required",
        details:
          "DMV handles California boat registration. Annual renewal. Decals expire each year.",
        required: true,
      },
      {
        id: "ca-4",
        label: "Invasive species inspection may be required at freshwater lakes",
        details:
          "Many California reservoirs require quagga/zebra mussel inspection and decontamination. Check lake-specific rules before launching.",
        required: true,
      },
      {
        id: "ca-5",
        label: "No alcohol or drugs while operating — BUI limit 0.08% BAC",
        details:
          "California BUI penalties mirror DUI. Law enforcement can require sobriety testing on the water.",
        required: true,
      },
    ],
    boaterEducationInfo:
      "California Boater Card required for ALL operators (phased in fully by 2025). Complete a state-approved course online or in person.",
    registrationInfo:
      "Register through the CA DMV. Annual renewal. Certificate must be kept onboard.",
    resourceUrl: "https://www.dbw.ca.gov/",
  },

  MI: {
    state: "Michigan",
    abbreviation: "MI",
    requirements: [
      {
        id: "mi-1",
        label: "Boater Safety Certificate required for operators born after December 31, 1978",
        details:
          "Must complete an approved boater education course. Certificate must be carried when operating a motorized vessel on Michigan waters.",
        required: true,
      },
      {
        id: "mi-2",
        label: "Children under 6 must wear a Type I, II, or III USCG-approved PFD",
        details:
          "Required at all times while on a motorized vessel in motion or at anchor. Vessel operator is responsible for enforcement.",
        required: true,
      },
      {
        id: "mi-3",
        label: "Registration renewed every 3 years",
        details:
          "Michigan vessel registration is valid for 3 years. Register through the Michigan Secretary of State.",
        required: true,
      },
      {
        id: "mi-4",
        label: "Wake boat / large wake restrictions in some areas",
        details:
          "Many Michigan lake associations and some municipalities restrict large wake production in congested areas. Check local ordinances.",
        required: true,
      },
    ],
    boaterEducationInfo:
      "Michigan DNR course available online or in-person. Free for those under 17.",
    registrationInfo:
      "Register at Michigan Secretary of State office or online at michigan.gov/sos.",
    resourceUrl: "https://www.michigan.gov/dnr/managing-resources/watercraft",
  },

  MN: {
    state: "Minnesota",
    abbreviation: "MN",
    requirements: [
      {
        id: "mn-1",
        label: "Watercraft Operator's Permit required for those born after December 31, 1986 (ages 13–17 operating alone)",
        details:
          "Operators age 13–17 must have completed an approved safety course to operate a motorboat alone. Those 12 and under may operate only with a licensed adult onboard.",
        required: true,
      },
      {
        id: "mn-2",
        label: "Children under 10 must wear a Type I, II, or III USCG-approved PFD",
        details:
          "Required at all times when the vessel is underway. Children 10 and older must have a PFD accessible — not necessarily worn.",
        required: true,
      },
      {
        id: "mn-3",
        label: "Drain all water from bait containers, livewells, and bilge before leaving water access",
        details:
          "Minnesota's Aquatic Invasive Species (AIS) law requires draining all water before leaving any water access. Violation carries significant fines.",
        required: true,
      },
      {
        id: "mn-4",
        label: "Registration renewed every 3 years",
        details:
          "Register at a DNR license center or online. Three-year renewal cycle.",
        required: true,
      },
    ],
    boaterEducationInfo:
      "Complete the MN DNR online or classroom course to receive the Watercraft Operator's Permit.",
    registrationInfo:
      "Register with Minnesota DNR. 3-year renewal.",
    resourceUrl: "https://www.dnr.state.mn.us/boatwater/index.html",
  },

  WI: {
    state: "Wisconsin",
    abbreviation: "WI",
    requirements: [
      {
        id: "wi-1",
        label: "Safety certificate required for operators born on or after January 1, 1989",
        details:
          "Must complete a DNR-approved course. Certificate required to operate a motorized vessel alone if born after this date.",
        required: true,
      },
      {
        id: "wi-2",
        label: "Children under 13 must wear a USCG-approved Type I, II, III, or V PFD",
        details:
          "Required at all times while the vessel is underway. The PFD must be the appropriate size for the child.",
        required: true,
      },
      {
        id: "wi-3",
        label: "Remove aquatic plants and drain water before leaving any boat launch",
        details:
          "Wisconsin's invasive species law prohibits transporting aquatic plants or water. Inspect and remove before leaving the launch.",
        required: true,
      },
      {
        id: "wi-4",
        label: "Registration renewed every 2 years",
        details:
          "Register through the DNR. Two-year renewal cycle.",
        required: true,
      },
    ],
    boaterEducationInfo:
      "Wisconsin DNR safety course available online or in person. Required for operators born after 1989.",
    registrationInfo:
      "Register online at dnr.wi.gov or at a DNR license center. 2-year renewal.",
    resourceUrl: "https://dnr.wisconsin.gov/topic/boat",
  },

  NY: {
    state: "New York",
    abbreviation: "NY",
    requirements: [
      {
        id: "ny-1",
        label: "Boating Safety Certificate required for operators born on or after May 1, 1996",
        details:
          "Must complete an approved course through NYS Parks, Recreation & Historic Preservation. Certificate must be onboard when operating.",
        required: true,
      },
      {
        id: "ny-2",
        label: "Children under 12 must wear a USCG-approved PFD",
        details:
          "Required at all times when underway. Vessels over 65 ft are exempt.",
        required: true,
      },
      {
        id: "ny-3",
        label: "Registration renewed every 3 years",
        details:
          "Register with NYS DMV. Three-year registration cycle.",
        required: true,
      },
      {
        id: "ny-4",
        label: "No wake within 100 ft of shore, dock, anchored vessel, or swimmer",
        details:
          "Statewide rule — vessels must operate at minimal wake near these areas. Additional local ordinances may apply.",
        required: true,
      },
    ],
    boaterEducationInfo:
      "Free online course available through NYS Parks. Certificate is permanent once earned.",
    registrationInfo:
      "Register through NYS DMV online or in person.",
    resourceUrl: "https://parks.ny.gov/recreation/boating/",
  },

  SC: {
    state: "South Carolina",
    abbreviation: "SC",
    requirements: [
      {
        id: "sc-1",
        label: "Boating Safety Certificate required for operators born on or after January 1, 1998",
        details:
          "Required to legally operate a motorized vessel in SC. Course must be NASBLA-approved.",
        required: true,
      },
      {
        id: "sc-2",
        label: "Children 12 and under must wear a USCG-approved PFD",
        details:
          "Required at all times while underway. Operators must ensure compliance.",
        required: true,
      },
      {
        id: "sc-3",
        label: "Registration renewed every 3 years",
        details:
          "Register through SC Department of Natural Resources (SCDNR).",
        required: true,
      },
    ],
    boaterEducationInfo:
      "SC DNR offers online and in-person courses. Free for SC residents under 16.",
    registrationInfo:
      "Register online at scdnr.sc.gov or at a SCDNR office.",
    resourceUrl: "https://www.dnr.sc.gov/boating.html",
  },

  OH: {
    state: "Ohio",
    abbreviation: "OH",
    requirements: [
      {
        id: "oh-1",
        label: "Boater education certificate required for operators born on or after January 1, 1982",
        details:
          "Required to operate a motorized vessel over 10 hp alone. Ohio boater education cards are recognized nationally.",
        required: true,
      },
      {
        id: "oh-2",
        label: "Children under 10 must wear a USCG-approved PFD while on a vessel under 18 ft",
        details:
          "Required at all times when underway. On vessels 18 ft or longer, children under 10 must have a PFD immediately available.",
        required: true,
      },
      {
        id: "oh-3",
        label: "Registration renewed annually",
        details:
          "Register through the Ohio BMV. Annual renewal. Decals expire each year.",
        required: true,
      },
    ],
    boaterEducationInfo:
      "Ohio DNR boater education courses available in person and online.",
    registrationInfo:
      "Register at an Ohio BMV office or online at bmv.ohio.gov.",
    resourceUrl: "https://watercraft.ohiodnr.gov/",
  },

  WA: {
    state: "Washington",
    abbreviation: "WA",
    requirements: [
      {
        id: "wa-1",
        label: "Boater Education Card required for operators born on or after January 1, 1955",
        details:
          "WA Boater Education Card must be carried when operating a motorized vessel. Takes effect based on birth year — check current phase-in schedule.",
        required: true,
      },
      {
        id: "wa-2",
        label: "Children under 12 must wear a USCG-approved PFD while on a vessel underway",
        details:
          "Responsibility falls on the vessel operator to ensure children are wearing properly fitted PFDs.",
        required: true,
      },
      {
        id: "wa-3",
        label: "Registration renewed annually",
        details:
          "Register through WA Department of Licensing. Annual renewal.",
        required: true,
      },
      {
        id: "wa-4",
        label: "Invasive species: Clean, Drain, Dry before moving to another water body",
        details:
          "It is unlawful to transport aquatic invasive species between water bodies. Clean hull, drain all water, dry for required time before relaunching.",
        required: true,
      },
    ],
    boaterEducationInfo:
      "WA Boater Education Card issued after completing an approved course. Online and in-person options available.",
    registrationInfo:
      "Register through WA Department of Licensing (dol.wa.gov). Annual renewal.",
    resourceUrl: "https://parks.wa.gov/boating",
  },

  GA: {
    state: "Georgia",
    abbreviation: "GA",
    requirements: [
      {
        id: "ga-1",
        label: "Boating Safety Certificate required for operators born on or after January 1, 1998",
        details:
          "Must complete a NASBLA-approved boater safety course before operating a motorized vessel or PWC.",
        required: true,
      },
      {
        id: "ga-2",
        label: "Children under 13 must wear a USCG-approved PFD while underway",
        details:
          "Required at all times while the vessel is in motion.",
        required: true,
      },
      {
        id: "ga-3",
        label: "Registration renewed every 3 years",
        details:
          "Register through Georgia Department of Natural Resources Wildlife Resources Division.",
        required: true,
      },
    ],
    boaterEducationInfo:
      "Georgia DNR offers online courses. Certificate is required for born-after-1997 operators.",
    registrationInfo:
      "Register at a county tag office or through GA DNR.",
    resourceUrl: "https://georgiawildlife.com/boating",
  },

  NC: {
    state: "North Carolina",
    abbreviation: "NC",
    requirements: [
      {
        id: "nc-1",
        label: "Boater Safety Education Certificate required for operators born on or after January 1, 1988",
        details:
          "Must carry the certificate when operating a vessel. Course must be NASBLA-approved.",
        required: true,
      },
      {
        id: "nc-2",
        label: "Children under 13 must wear a USCG-approved Type I, II, or III PFD",
        details:
          "Required at all times on a vessel underway, not anchored. Applies to all vessel types including PWC.",
        required: true,
      },
      {
        id: "nc-3",
        label: "Registration renewed annually",
        details:
          "Register through NC Wildlife Resources Commission. Annual renewal.",
        required: true,
      },
    ],
    boaterEducationInfo:
      "NC Wildlife offers free online and classroom courses.",
    registrationInfo:
      "Register at an NCWRC license agent or online at ncwildlife.org.",
    resourceUrl: "https://www.ncwildlife.org/boating",
  },
};

/** Returns the state requirement data or null if not found. */
export function getStateRequirements(abbreviation: string): StateRequirementData | null {
  return STATE_REQUIREMENTS[abbreviation.toUpperCase()] ?? null;
}

/** Returns a list of states that have data in this knowledge base. */
export function getCoveredStates(): string[] {
  return Object.keys(STATE_REQUIREMENTS).sort();
}
