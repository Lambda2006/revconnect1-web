# MarineMax Partnership Demo — Deploy Guide

A **self-contained, static** demo living inside the existing Next.js app under the
`/demo` route tree. It touches **no production data, auth, or database** — all
content is seeded static JSON in `web/demo/data/`. Access is gated by a simple
code and the demo is meant to be shared by direct link only.

Goal: give MarineMax a guided, co-branded walkthrough that shows how the app
refers owners to MarineMax **parts, service, boat slips, and events** — to
encourage a partnership.

---

## What's included

| Piece | Path |
|---|---|
| Seeded data (parts, marinas/slips, events, service centers, garage, intervals) | `web/demo/data/*.json` |
| Typed loaders + config (access code, tour steps, brand colors) | `web/demo/lib/` |
| Shared components (MarineMax logo, `DemoPartCard`, co-brand navbar, guided tour, access gate) | `web/demo/components/` |
| Demo pages (garage, knowledge, diagnose, discover map, service center, MarineMax product placeholder) | `web/app/demo/**` |
| Host-based routing for the demo subdomain | `web/middleware.ts` (top block) |

### Demo narrative (guided tour, in order)
garage → knowledge base → diagnostic questionnaire → parts recommendation →
service referral → discover map with marina slips → promotional event.

### Where MarineMax parts cards appear
1. **Below the diagnosis synthesis** — 2–3 cooling parts for the impeller diagnosis.
2. **In the knowledge base** — the associated MarineMax part for each service interval.
3. **On each service center detail page** — parts available at that location.

The **View at MarineMax** button opens a realistic in-app placeholder product page
(`/demo/marinemax/[partId]`) — never a broken external link.

---

## Access

- URL (on the demo subdomain): `https://demo.victoryrevconnect.com/`
- URL (on the main domain, no DNS needed): `https://<your-app-domain>/demo`
- Access code: **`MARINEMAX2026`** (override with `NEXT_PUBLIC_DEMO_ACCESS_CODE`)

---

## Deploy: recommended path (add the subdomain to the existing Vercel project)

The demo ships with the existing app, so no separate build is required. The
`middleware.ts` host block rewrites the demo subdomain's root to `/demo`.

1. **Merge/push** these changes to the branch Vercel builds (e.g. `main`).
2. **Vercel → Project `victoryrevconnect-boaters` → Settings → Domains → Add**
   `demo.victoryrevconnect.com`.
3. **DNS at your registrar** — add a CNAME:
   `demo` → `cname.vercel-dns.com` (TTL auto). Wait for propagation.
4. **Vercel → Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_DEMO_ACCESS_CODE` = `MARINEMAX2026` (or your choice)
   - `NEXT_PUBLIC_DEMO_HOST` = `demo.victoryrevconnect.com`
5. **Redeploy.** Visit `https://demo.victoryrevconnect.com` → access gate → demo.

## Deploy: alternative (a truly separate Vercel project)

If MarineMax should have an isolated deployment (separate analytics/env):

1. **Vercel → Add New → Project → import the same GitHub repo**
   (`Lambda2006/revconnect1-web`). Root directory: `web`.
2. Name it e.g. `victoryrevconnect-marinemax-demo`.
3. Add the same two demo env vars above (Supabase/Stripe vars are **not**
   required — the demo is static; the app's other routes simply won't be used).
4. Add domain `demo.victoryrevconnect.com` to **this** project and point the
   CNAME here instead. The host block in `middleware.ts` still serves `/demo`
   at the root.

---

## Swapping in the real MarineMax logo

The current logo is a **text placeholder** in MarineMax blue (not their
trademarked asset). To use the licensed logo once terms are agreed: drop an SVG
at `web/public/demo/assets/marinemax-logo.svg` and replace the `<svg>` in
`web/demo/components/MarineMaxLogo.tsx` with an `<img src="/demo/assets/marinemax-logo.svg" />`.

## Notes
- All prices, part numbers, stock, and URLs are illustrative — not live commerce.
- The demo is marked `noindex` and is only reachable with the access code.
