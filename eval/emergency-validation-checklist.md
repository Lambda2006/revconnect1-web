# VictoryRevConnect Boaters — Emergency Cache Validation Checklist

**Purpose:** This document is for review by a qualified marine mechanic / domain expert before the first EAS distribution build. Each of the 35 emergency cache entries in the Supabase `cached_responses` table must be validated for accuracy, completeness, and safety.

**Reviewer:** _____________________________________ (name, credentials)  
**Review date:** _____________________________________  
**Supabase project:** `zujotffowrlcckbgriry`

---

## How to Access Cache Entries

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
SELECT
  boat_make,
  boat_model,
  query_category,
  query_summary,
  response->>'answer' AS answer,
  response->>'steps' AS steps,
  is_emergency,
  cached_at
FROM cached_responses
WHERE is_emergency = true
ORDER BY boat_make, query_category;
```

---

## Validation Criteria

For each entry, the reviewer must confirm:

1. **Accuracy** — All factual claims are correct for the applicable boat make/engine type
2. **Completeness** — No critical safety step is missing
3. **Urgency sequencing** — Steps are ordered correctly (most critical first)
4. **Jurisdiction** — US USCG regulatory references (not international) where applicable
5. **Appropriate escalation** — Professional service recommendation is present where warranted
6. **No harmful information** — No advice that could increase danger (e.g., telling someone to restart after a fuel emergency)

---

## Entry Checklist (35 total)

Each make has 7 emergency categories. Entries are **brand-level** (boat_model = NULL) — they apply to all models of that make.

### Legend
- ✅ Approved — no changes needed
- ⚠️ Approved with notes — minor clarification added in comment column
- ❌ Rejected — rewrite required (describe issue)

---

### MasterCraft (Inboard / Closed-Loop Cooling)

| # | Category | Status | Reviewer Notes |
|---|---|---|---|
| 1 | `cooling` — Engine overheating | | |
| 2 | `emergency_flood` — Taking on water | | |
| 3 | `emergency_bilge` — Bilge pump failure | | |
| 4 | `emergency_fuel` — Fuel emergency shutoff | | |
| 5 | `emergency_fire` — Fire onboard | | |
| 6 | `steering` — Loss of steering | | |
| 7 | `emergency_battery` — Battery/no-start | | |

**Domain notes for MasterCraft review:**
- Inboard engines use closed-loop cooling — tell-tale stream is NOT present. Coolant level and thermostat are the primary checks for overheating.
- Indmar engines: verify oil references match Indmar spec (not MerCruiser or Yamaha).
- Steering is hydraulic ZF Teleflex — check that response references hydraulic fluid, not cable.

---

### Malibu Boats (Inboard / Closed-Loop Cooling)

| # | Category | Status | Reviewer Notes |
|---|---|---|---|
| 8 | `cooling` — Engine overheating | | |
| 9 | `emergency_flood` — Taking on water | | |
| 10 | `emergency_bilge` — Bilge pump failure | | |
| 11 | `emergency_fuel` — Fuel emergency shutoff | | |
| 12 | `emergency_fire` — Fire onboard | | |
| 13 | `steering` — Loss of steering | | |
| 14 | `emergency_battery` — Battery/no-start | | |

**Domain notes for Malibu review:**
- Some Response TXi models use ILMOR engines — verify cooling references are appropriate for both Indmar and ILMOR.
- Malibu wake boat inboards: large ballast tanks mean large amounts of water onboard by design — flooding vs. ballast fill must be distinguished in the response.
- Blower requirement for fuel emergencies: confirm "run blower for 4 minutes" is referenced for inboard applications.

---

### Boston Whaler (Outboard / Raw Water Cooling)

| # | Category | Status | Reviewer Notes |
|---|---|---|---|
| 15 | `cooling` — Engine overheating | | |
| 16 | `emergency_flood` — Taking on water | | |
| 17 | `emergency_bilge` — Bilge pump failure | | |
| 18 | `emergency_fuel` — Fuel emergency shutoff | | |
| 19 | `emergency_fire` — Fire onboard | | |
| 20 | `steering` — Loss of steering | | |
| 21 | `emergency_battery` — Battery/no-start | | |

**Domain notes for Boston Whaler review:**
- Outboards use raw water cooling — tell-tale stream must be referenced for overheating check.
- Boston Whaler hulls are unsinkable (UNIBOND construction) — flooding response should not suggest abandoning ship prematurely; verify the response is calibrated for this.
- 270 Dauntless and 330 Outrage often have twin/triple outboards — battery no-start should address which engine isolator switch may be the culprit.
- Montauk 170 is tiller or cable steering, not hydraulic — verify steering response is appropriate.

---

### Grady-White (Outboard / Raw Water Cooling)

| # | Category | Status | Reviewer Notes |
|---|---|---|---|
| 22 | `cooling` — Engine overheating | | |
| 23 | `emergency_flood` — Taking on water | | |
| 24 | `emergency_bilge` — Bilge pump failure | | |
| 25 | `emergency_fuel` — Fuel emergency shutoff | | |
| 26 | `emergency_fire` — Fire onboard | | |
| 27 | `steering` — Loss of steering | | |
| 28 | `emergency_battery` — Battery/no-start | | |

**Domain notes for Grady-White review:**
- Canyon 336 is offshore-capable — flood and fire responses should include Mayday/distress call emphasis.
- All supported Grady-White models use Yamaha outboards — verify responses do not reference Mercury or Evinrude.
- Grady-White hydraulic steering: Freedom 235 and Canyon 336 use Sea Star hydraulic — verify fluid spec reference.
- Fisherman 236: standard cable steering — verify response is different from hydraulic steering response for Canyon 336.

---

### Sea Ray (Sterndrive / MerCruiser)

| # | Category | Status | Reviewer Notes |
|---|---|---|---|
| 29 | `cooling` — Engine overheating | | |
| 30 | `emergency_flood` — Taking on water | | |
| 31 | `emergency_bilge` — Bilge pump failure | | |
| 32 | `emergency_fuel` — Fuel emergency shutoff | | |
| 33 | `emergency_fire` — Fire onboard | | |
| 34 | `steering` — Loss of steering | | |
| 35 | `emergency_battery` — Battery/no-start | | |

**Domain notes for Sea Ray review:**
- MerCruiser sterndrives use closed-loop cooling (no tell-tale stream) — verify cooling response matches.
- SPX 210 and SDX 270 use Alpha One drives; Sundancer 320 may use Bravo drives — verify response doesn't assume one drive type.
- Sea Ray boats have enclosed engine bays — fuel vapor emergency response should emphasize blower use and enclosed-space danger.
- Sundancer 320: larger cruiser with generator, AC, holding tank — fuel response should note ALL potential ignition sources (not just engine).

---

## Cross-Make Consistency Check

After reviewing individual entries, verify the following are consistent across all 5 makes:

| Check | Consistent? | Notes |
|---|---|---|
| VHF Ch 16 referenced for all flooding emergencies | | |
| "Run blower for 4 minutes" for inboard fuel emergencies | | |
| Fire extinguisher: Type B, base-of-flame technique, PASS method | | |
| Abandon ship criteria are present and accurate | | |
| Professional service recommendation on steering entries | | |
| Kill switch / neutral pre-check on all battery/no-start entries | | |
| No advice to restart engine after fuel vapor detected | | |
| Bilge pump fuse and float switch checks on all bilge entries | | |

---

## Regulatory References

Confirm that the following references are accurate and current:

| Reference | Used in | Accurate? |
|---|---|---|
| USCG VHF Ch 16 as distress channel | All flood/fire emergencies | |
| USCG approved Type B extinguisher for engine fires | Fire emergencies | |
| ABYC electrical standards for battery terminal safety | Battery/no-start | |
| Blower operation requirement before starting after fueling | Fuel emergencies | |

---

## Rewrite Tracking

Use this section to track entries that were rejected and need rewriting.

| Entry # | Category | Make | Issue Description | Rewrite Status |
|---|---|---|---|---|
| | | | | |
| | | | | |

---

## Sign-Off

After completing all 35 entries and the cross-make consistency check:

> I have reviewed all 35 emergency cache entries in the `cached_responses` table for the VictoryRevConnect Boaters application. To the best of my professional knowledge as a licensed marine mechanic, the entries that I have marked ✅ or ⚠️ provide accurate, safe, and appropriately sequenced guidance for the described emergency situations. Entries marked ❌ require revision before distribution.

**Reviewer signature:** _____________________________________  
**Date:** _____________________________________  
**Marine mechanic license / ABYC certification #:** _____________________________________

---

## Post-Review Actions

After sign-off:

- [ ] Update any rejected cache entries via Supabase SQL Editor
- [ ] Re-run `eval/runner.ts --category emergency` to confirm pass rate ≥ 80%
- [ ] Store signed copy of this checklist in project records
- [ ] Check off "Emergency cache validated by marine mechanic domain expert" in Pre-Launch Checklist (blueprint section 16)
