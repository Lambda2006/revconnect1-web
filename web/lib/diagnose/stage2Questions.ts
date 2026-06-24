import type { DiagnosticSystem, Stage2Question } from "./types";

const ENGINE_NO_START: Stage2Question[] = [
  {
    id: "crank_behavior",
    label: "What happens when you turn the key or press start?",
    type: "select",
    options: [
      { value: "cranks_no_start", label: "Engine cranks but won't fire" },
      { value: "starts_briefly_dies", label: "Fires briefly then immediately dies" },
      { value: "no_crank_click", label: "Nothing — single click from solenoid" },
      { value: "no_crank_no_click", label: "Nothing at all — no click, no crank" },
      { value: "slow_crank", label: "Cranks very slowly" },
    ],
    required: true,
  },
  {
    id: "battery_condition",
    label: "Battery condition?",
    type: "select",
    options: [
      { value: "tested_good", label: "Recently tested — confirmed good" },
      { value: "charged_unknown", label: "Charged but not tested" },
      { value: "weak_suspect", label: "Suspect it may be weak" },
      { value: "dead_confirmed", label: "Dead / no power at all" },
      { value: "unknown", label: "Unknown" },
    ],
    required: true,
  },
  {
    id: "fault_onset",
    label: "When did this fault first appear?",
    type: "select",
    options: [
      { value: "today_first", label: "Today — first time ever" },
      { value: "after_storage", label: "After sitting / end of storage" },
      { value: "after_fueling", label: "Immediately after refueling" },
      { value: "after_service", label: "After recent engine service" },
      { value: "recurring", label: "Has happened before intermittently" },
    ],
    required: true,
  },
  {
    id: "alarm_beeps",
    label: "Any alarm beeps or tones when key is turned?",
    type: "text",
    placeholder: "e.g. \"3 short beeps\", \"continuous tone\", \"none\"",
  },
  {
    id: "fault_codes",
    label: "Any fault codes or messages on the display?",
    type: "text",
    placeholder: "e.g. \"E-01\", \"Engine Fault\", \"Low Oil\", or \"none\"",
  },
  {
    id: "recent_changes",
    label: "What changed on the boat before this started?",
    type: "select",
    options: [
      { value: "nothing", label: "Nothing changed" },
      { value: "fresh_fuel", label: "Added fresh fuel" },
      { value: "battery_work", label: "Battery or electrical work" },
      { value: "engine_service", label: "Engine service or repair" },
      { value: "bilge_work", label: "Bilge or below-deck work" },
      { value: "other", label: "Other (describe in next field)" },
    ],
    required: true,
  },
];

const ENGINE_PERFORMANCE: Stage2Question[] = [
  {
    id: "primary_symptom",
    label: "Primary symptom?",
    type: "select",
    options: [
      { value: "rough_idle", label: "Rough or lumpy idle" },
      { value: "loss_of_power", label: "Loss of power / won't reach normal RPM" },
      { value: "stalling", label: "Stalling — engine cuts out" },
      { value: "misfiring", label: "Misfiring / popping" },
      { value: "hesitation", label: "Hesitation on acceleration" },
      { value: "surging_rpm", label: "RPM surging or hunting" },
      { value: "excessive_smoke", label: "Excessive smoke (specify color below)" },
    ],
    required: true,
  },
  {
    id: "rpm_range",
    label: "At what RPM or throttle position does the problem occur?",
    type: "select",
    options: [
      { value: "idle_only", label: "Idle only" },
      { value: "low_mid", label: "Low to mid range" },
      { value: "mid_high", label: "Mid to high range" },
      { value: "all_rpms", label: "All RPM ranges" },
      { value: "wot_only", label: "Wide open throttle only" },
      { value: "cold_start", label: "Only when cold, clears when warm" },
    ],
    required: true,
  },
  {
    id: "duration",
    label: "How long has this been happening?",
    type: "select",
    options: [
      { value: "sudden_today", label: "Started suddenly today" },
      { value: "few_days", label: "Past few days" },
      { value: "progressive", label: "Gradually getting worse over weeks" },
      { value: "intermittent", label: "Intermittent — comes and goes" },
    ],
    required: true,
  },
  {
    id: "fault_codes",
    label: "Any fault codes, warning lights, or check engine indicators?",
    type: "text",
    placeholder: "e.g. \"CE light on\", \"Code P0301\", \"none\"",
  },
  {
    id: "maintenance",
    label: "When were spark plugs and fuel filter last serviced?",
    type: "select",
    options: [
      { value: "this_season", label: "This season" },
      { value: "1_2_years", label: "1–2 years ago" },
      { value: "3_plus", label: "3+ years ago / unknown" },
      { value: "not_applicable", label: "Diesel — not applicable" },
    ],
    required: true,
  },
  {
    id: "recent_changes",
    label: "Any recent changes, work, or new fuel before this started?",
    type: "text",
    placeholder: "e.g. \"added fresh fuel\", \"oil change last week\", \"nothing\"",
  },
];

const COOLING: Stage2Question[] = [
  {
    id: "symptom",
    label: "What is the cooling symptom?",
    type: "select",
    options: [
      { value: "overheat_alarm", label: "Overheat alarm sounding" },
      { value: "high_temp_gauge", label: "Temperature gauge reading high" },
      { value: "no_telltale", label: "No water from telltale / pee hole" },
      { value: "steam", label: "Steam from engine compartment" },
      { value: "coolant_leak", label: "Visible coolant or water leak" },
    ],
    required: true,
  },
  {
    id: "when_overheats",
    label: "When does overheating occur?",
    type: "select",
    options: [
      { value: "at_idle", label: "At idle / slow speed" },
      { value: "under_load", label: "Under load / higher RPM" },
      { value: "any_speed", label: "At any speed" },
      { value: "immediately", label: "Immediately on startup" },
      { value: "after_running", label: "Only after running for a while" },
    ],
    required: true,
  },
  {
    id: "telltale_flow",
    label: "Raw water telltale / tell-tale discharge (if visible)?",
    type: "select",
    options: [
      { value: "normal_flow", label: "Normal steady flow" },
      { value: "reduced_flow", label: "Reduced / intermittent flow" },
      { value: "no_flow", label: "No flow at all" },
      { value: "not_visible", label: "Can't observe / not applicable" },
    ],
    required: true,
  },
  {
    id: "impeller_age",
    label: "How long since the water pump impeller was last replaced?",
    type: "select",
    options: [
      { value: "this_season", label: "This season" },
      { value: "1_2_seasons", label: "1–2 seasons ago" },
      { value: "3_plus", label: "3+ years or unknown" },
    ],
    required: true,
  },
  {
    id: "engine_cooling_type",
    label: "Engine cooling system type?",
    type: "select",
    options: [
      { value: "raw_water", label: "Raw water cooled (outboard / basic inboard)" },
      { value: "fresh_water_closed", label: "Closed-loop freshwater cooled (heat exchanger)" },
      { value: "dont_know", label: "Don't know" },
    ],
    required: true,
  },
  {
    id: "recent_work",
    label: "Any recent work on the cooling system or engine?",
    type: "text",
    placeholder: "e.g. \"winterization last fall\", \"impeller replaced 2 years ago\", \"nothing\"",
  },
];

const ELECTRICAL: Stage2Question[] = [
  {
    id: "affected_system",
    label: "Which electrical system is affected?",
    type: "select",
    options: [
      { value: "not_charging", label: "Battery not charging while running" },
      { value: "dead_battery", label: "Battery going dead repeatedly" },
      { value: "fuse_blowing", label: "Fuse or breaker repeatedly blowing" },
      { value: "instruments_dead", label: "Instruments / gauges not working" },
      { value: "bilge_pump", label: "Bilge pump not operating" },
      { value: "lights", label: "Navigation or interior lights" },
      { value: "trim_tilt", label: "Trim / tilt not functioning" },
      { value: "ignition_switch", label: "Ignition switch / start circuit" },
    ],
    required: true,
  },
  {
    id: "problem_timing",
    label: "When does the fault occur?",
    type: "select",
    options: [
      { value: "immediately", label: "Immediately on power-up" },
      { value: "after_running", label: "After running for a while" },
      { value: "intermittent", label: "Intermittent — random" },
      { value: "after_sitting", label: "Only after sitting overnight / unused" },
    ],
    required: true,
  },
  {
    id: "corrosion_smell",
    label: "Any burning smell or visible corrosion?",
    type: "select",
    options: [
      { value: "burning_smell", label: "Yes — burning smell" },
      { value: "visible_corrosion", label: "Yes — visible corrosion on terminals" },
      { value: "both", label: "Both" },
      { value: "none", label: "Neither" },
    ],
    required: true,
  },
  {
    id: "battery_age",
    label: "Battery age?",
    type: "select",
    options: [
      { value: "less_1_year", label: "Less than 1 year" },
      { value: "1_3_years", label: "1–3 years" },
      { value: "3_plus", label: "3+ years" },
      { value: "unknown", label: "Unknown" },
    ],
    required: true,
  },
  {
    id: "recent_changes",
    label: "Any recent changes to wiring, accessories, or electrical systems?",
    type: "text",
    placeholder: "e.g. \"added fish finder\", \"ran aground\", \"nothing\"",
  },
];

const STEERING: Stage2Question[] = [
  {
    id: "symptom",
    label: "Describe the steering symptom?",
    type: "select",
    options: [
      { value: "hard_to_turn", label: "Very hard to turn / high effort" },
      { value: "vibration", label: "Vibration or shudder through wheel" },
      { value: "pulling", label: "Pulling to one side" },
      { value: "excessive_play", label: "Excessive play / looseness in wheel" },
      { value: "grinding_noise", label: "Grinding or clunking noise when turning" },
      { value: "jerky", label: "Jerky / not smooth movement" },
    ],
    required: true,
  },
  {
    id: "steering_type",
    label: "Type of steering system?",
    type: "select",
    options: [
      { value: "hydraulic", label: "Hydraulic (SeaStar or similar)" },
      { value: "mechanical_cable", label: "Mechanical cable / rack and pinion" },
      { value: "electric_power", label: "Electric power assist (EPS)" },
      { value: "dont_know", label: "Don't know" },
    ],
    required: true,
  },
  {
    id: "directionality",
    label: "Does the problem affect both directions equally?",
    type: "select",
    options: [
      { value: "both_equal", label: "Both directions equally" },
      { value: "worse_left", label: "Worse turning left / port" },
      { value: "worse_right", label: "Worse turning right / starboard" },
      { value: "only_center", label: "Only at or near center" },
    ],
    required: true,
  },
  {
    id: "onset",
    label: "When did it start?",
    type: "select",
    options: [
      { value: "sudden", label: "Sudden onset" },
      { value: "gradual", label: "Gradually over time" },
      { value: "after_impact", label: "After an impact or hitting something" },
      { value: "after_service", label: "After recent steering service" },
    ],
    required: true,
  },
  {
    id: "fluid_level",
    label: "Hydraulic fluid reservoir level (if hydraulic)?",
    type: "select",
    options: [
      { value: "normal", label: "Normal level" },
      { value: "low", label: "Low — needed topping up" },
      { value: "empty", label: "Very low or empty" },
      { value: "not_applicable", label: "Not applicable / no reservoir" },
    ],
    required: true,
  },
];

const WATER_INGRESS: Stage2Question[] = [
  {
    id: "location",
    label: "Where is water appearing?",
    type: "select",
    options: [
      { value: "bilge", label: "Bilge — accumulating below decks" },
      { value: "cabin_floor", label: "Cabin floor or interior" },
      { value: "transom", label: "Around the transom or stern" },
      { value: "deck_fittings", label: "Around deck fittings or hatches" },
      { value: "hull_fittings", label: "Around through-hull fittings or seacocks" },
      { value: "not_sure", label: "Not sure of source" },
    ],
    required: true,
  },
  {
    id: "rate",
    label: "Rate of water ingress?",
    type: "select",
    options: [
      { value: "slow_seep", label: "Slow seep — takes hours to accumulate" },
      { value: "moderate", label: "Moderate — bilge runs every hour or two" },
      { value: "fast", label: "Fast — bilge running constantly" },
      { value: "underway_only", label: "Only occurs when underway / at speed" },
      { value: "rain_only", label: "Only during or after heavy rain" },
    ],
    required: true,
  },
  {
    id: "onset",
    label: "When did you first notice it?",
    type: "select",
    options: [
      { value: "today", label: "Today — sudden appearance" },
      { value: "this_week", label: "This week" },
      { value: "getting_worse", label: "Been there a while, getting worse" },
      { value: "after_event", label: "After a specific event (describe below)" },
    ],
    required: true,
  },
  {
    id: "recent_work_impact",
    label: "Any recent through-hull work, repairs, or impacts?",
    type: "text",
    placeholder: "e.g. \"replaced seacock last month\", \"grounded in marina\", \"nothing\"",
  },
  {
    id: "storage_type",
    label: "How is the boat stored?",
    type: "select",
    options: [
      { value: "slip_water", label: "In-water slip or mooring" },
      { value: "trailer", label: "Trailered" },
      { value: "lift_dry_stack", label: "Lift / dry stack storage" },
    ],
    required: true,
  },
];

const FUEL: Stage2Question[] = [
  {
    id: "primary_symptom",
    label: "Primary fuel-related symptom?",
    type: "select",
    options: [
      { value: "not_priming", label: "Engine won't prime / build fuel pressure" },
      { value: "fuel_smell", label: "Strong fuel smell without visible leak" },
      { value: "wont_start_after_fueling", label: "Won't start after refueling (vapor lock / flooding)" },
      { value: "starving_at_speed", label: "Engine starves or cuts out at high speed" },
      { value: "visible_leak", label: "Visible fuel leak" },
      { value: "rough_on_fuel", label: "Running rough — fuel delivery suspected" },
    ],
    required: true,
  },
  {
    id: "fuel_type",
    label: "Fuel type?",
    type: "select",
    options: [
      { value: "regular_gas", label: "Regular gasoline (87)" },
      { value: "premium_gas", label: "Premium gasoline (91/93)" },
      { value: "ethanol_blend", label: "Ethanol blend (E10 / E15)" },
      { value: "diesel", label: "Diesel" },
      { value: "dont_know", label: "Don't know" },
    ],
    required: true,
  },
  {
    id: "fuel_age",
    label: "Age of fuel currently in tank?",
    type: "select",
    options: [
      { value: "fresh_this_week", label: "Fresh — filled this week" },
      { value: "this_month", label: "This month" },
      { value: "30_plus_days", label: "30+ days old" },
      { value: "over_wintered", label: "Over-wintered / storage fuel" },
    ],
    required: true,
  },
  {
    id: "primer_bulb",
    label: "Primer bulb behavior (outboard / portable tank)?",
    type: "select",
    options: [
      { value: "firms_stays", label: "Firms up and stays firm" },
      { value: "firms_then_collapses", label: "Firms then collapses after running" },
      { value: "stays_soft", label: "Stays soft — won't firm up" },
      { value: "no_bulb", label: "No primer bulb / not applicable" },
    ],
    required: true,
  },
  {
    id: "fuel_smell_location",
    label: "Where is the fuel smell or any visible leak?",
    type: "text",
    placeholder: "e.g. \"around the carb\", \"fuel line near engine\", \"in bilge\", \"none\"",
  },
  {
    id: "recent_fuel_work",
    label: "Any recent fuel system work?",
    type: "text",
    placeholder: "e.g. \"replaced fuel filter last month\", \"carb cleaned this season\", \"nothing\"",
  },
];

// ─── Exported map ─────────────────────────────────────────────────────────────

export const STAGE2_QUESTIONS: Record<DiagnosticSystem, Stage2Question[]> = {
  engine_no_start: ENGINE_NO_START,
  engine_performance: ENGINE_PERFORMANCE,
  cooling: COOLING,
  electrical: ELECTRICAL,
  steering: STEERING,
  water_ingress: WATER_INGRESS,
  fuel: FUEL,
};
