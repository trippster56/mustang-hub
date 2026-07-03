# Mustang Hub

Interactive parts & maintenance hub for a 2008 Ford Mustang V6. Design direction: **"Night Garage"** (see `PRD.md` and the design canvas in the car folder).

## Run it
```bash
npm install
npm run dev      # http://localhost:3000
```

## What's here (v2 — Night Garage)
- **Garage stage (hero)** — a cinematic near-black stage showing the car in three **reveal states**: `EXTERIOR · ENGINE BAY · UNDERSIDE`. The state switcher cross-fades between them; a **CINEMA / MECH** motion toggle changes the transition grammar. Status-colored **hotspots** sit on each state; tapping one **spotlights** it and slides in the part sheet.
  - States currently render as **schematic elevations** (the shipping default). Drop a photo/scan into a state's layer to replace the schematic — same layer contract.
- **Part sheet** — status lamp + provenance chip, the shop finding, a spec/torque table (mono, display-size numbers), est cost + DIY time.
- **Tabs** — `PARTS` (17, urgency-sorted), `TIMELINE` (CARFAX + Dunrite, title event as a break in the rail), `COSTS` (spent vs. upcoming, range bars), `DOCUMENTS` (real thumbnails + full salvage/NAM disclosure).
- **Salvage/NAM honesty** — riveted VIN plate in the header (gold), odometer `†` footnote, full disclosure card in Documents. Gold = title matters; red = physical danger. Never mixed.
- **Data** — `data/vehicle.ts` is the **canonical source of truth** (seeded from the hub spreadsheet + the design canvas). Edit it to update the site.

## Design system
- **Type** — Archivo (display, `font-stretch:125%`), IBM Plex Sans (body), IBM Plex Mono (data/numbers), via `next/font`.
- **Status = annunciator lamps** — SAFETY (pulses) · OVERDUE · DUE · MONITOR · DONE · OK (unlit) · COSMETIC (dashed). Defined in `lib/types.ts` (`ST`).
- **Provenance = typographic chips** — OEM · AFTERMARKET · REMAN (torch-tinted) · ORIGINAL. Status owns color; provenance never gets a colored dot.
- **Surfaces** — VOID / STAGE / PANEL / RAISED + torch red (≤2 uses/screen) + title-gold. Tokens in `app/globals.css`.

## Swapping in real photos/scans
Each hero state is a layer in `components/GarageStage.tsx`. Replace a state's `<Schematic…/>` with an `<img>` (or a react-three-fiber scene for a rotatable exterior scan) — hotspot `{ state, x, y }` coords in `data/vehicle.ts` stay the same.

## Stack
Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · TypeScript · `next/font`. Deploys on Vercel.

## Roadmap (from PRD)
- **Now** — capture the owner's photos/scans (exterior, hood-up, undercarriage) and swap them into the state layers.
- **Next** — wire the doc vault to actual files (viewing/upload, Vercel Blob); a full part-sheet route; deep-link a part from the list into the garage.
- **Stretch** — rotatable 3D exterior scan (r3f) as the exterior state.

## Notes
- The car is **salvage / not-actual-mileage titled** — surfaced honestly throughout; keep it that way if ever shared.
