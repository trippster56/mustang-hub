# Mustang Hub — Product Requirements Document

**Owner:** Tripp
**Status:** v1 built · redesigning hero → **state-based scan reveal**
**Last updated:** 2026-07-01
**Vehicle:** 2008 Ford Mustang V6 Deluxe · salvage/NAM title · ~110,623 mi

---

## 1. Overview

A personal web hub for one specific car. The centerpiece is an **interactive "exploded" diagram** of the Mustang: click a part to see its maintenance history, whether it's OEM / aftermarket / updated, what it cost, when it was last serviced, and the source documents (invoice, CARFAX, manual page).

It turns the static `2008 Mustang - HUB.xlsx` into a living, visual, clickable record of the car.

### Problem
Everything about the car currently lives in a spreadsheet + a folder of PDFs. It's complete but not *glanceable* — you can't see "what's on this car, what's due, and what's been swapped" in one visual. Provenance (OEM vs. 3rd-party vs. reman) is buried in notes.

### Vision
Open the site → see the car → tap **"Open Hood" / "Doors" / "Underside"** → the car cross-fades to that state, revealing the real parts underneath → tap any part → full story of that part. A garage/enthusiast dashboard for a single vehicle, built from the owner's own photos/scans.

**Explode approach (LOCKED):** not a geometric mesh-explode of a bought CAD model. Instead a **state-based reveal** — the owner captures his *actual car* in several states (exterior closed, hood up, doors open, undercarriage) via photos and/or iPhone LiDAR scans. Each state is a swappable hero layer with its own status-colored hotspots. This sidesteps the "separable internal meshes" problem entirely: a part is clickable in the state where it's physically exposed. It's also more honest and specific than a generic model — it shows *this* car's actual parts, wear, and aftermarket bits. See §9.

---

## 2. Goals & Non-Goals

### Goals
- Visual, clickable part-level record of the car.
- Surface **part provenance** (OEM / Aftermarket / Updated / Original) at a glance.
- Show **maintenance timeline** + due/overdue status per part.
- Link every part to its **source documents** (doc vault).
- Track **cost** — spent to date + estimated upcoming.
- Deployable, low/zero-cost hosting; usable on phone in the garage.

### Non-Goals (v1)
- Not a multi-vehicle fleet app (single car; keep the data model multi-vehicle-*friendly* but don't build the UI).
- Not a geometrically-exploding real-time 3D CAD model with separable internal meshes (deliberately dropped — the state-based scan reveal replaces it; a rotatable 3D *exterior* scan is optional polish).
- No user accounts / auth (private, single-user).
- Not a maintenance *reminder/notification* system (nice-to-have later).
- No live OBD-II / telematics integration.

---

## 3. Users & Use Cases

**Primary user:** the owner (Tripp).

- "What's overdue right now?" → open site, scan status colors.
- "Is the transmission OEM or a reman?" → click transmission → provenance badge + warranty.
- "When did I last touch the diff?" → click diff → timeline says "never / no history."
- "Pull up the invoice for the transmission job." → click transmission → doc vault → invoice #6459.
- "How much have I sunk into this car?" → cost tracker running total.
- (Future) Hand the site to a buyer as a transparent history — *note the salvage title.*

---

## 4. Locked Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **"Explode" model** | **State-based scan reveal** — owner's own photos/LiDAR of his car in multiple states (exterior / hood up / doors / underside), cross-faded, each with its own hotspots | Achieves the "car opens up, shows the part" vision for ~$0; avoids the unsolved & costly per-part mesh-segmentation problem; shows the *actual* car |
| Bought/segmented 3D CAD model | **Rejected** | No affordable S197 model separates fine serviceable parts (belt, ball joint) as named meshes; studio/custom = $300–1500+ and still wrong-trim risk (investigated 2026-07-01) |
| Detail states | **Photos preferred** for engine bay & underside; **3D scan optional** for a rotatable exterior | iPhone LiDAR scans reflective/dark/cluttered engine bays poorly; crisp photos read better there |
| Scope pillars | **Provenance + Timeline + Doc Vault + Cost** (all four) | Owner-selected |
| Data source | `data/vehicle.ts` (seeded from `2008 Mustang - HUB.xlsx`) — **canonical** | Data already exists & is verified; site is now source of truth |
| Hosting | Vercel | Free tier; existing tooling |
| Art strategy | Swappable per-state hero layers | Drop in new/better scans without touching app logic |

---

## 5. Functional Requirements

### 5.1 State-Based Reveal (hero)
- The car is shown via the owner's **own photos / LiDAR scans**, captured in multiple **states**:
  - **Exterior (closed)** — body, wheels, bumper, tires. Optionally a rotatable 3D scan.
  - **Hood up** — engine bay: serpentine belt, spark plugs, valve covers, coolant, air filter, PCV, oil.
  - **Doors open** — cabin (optional): VIN placard, odometer.
  - **Undercarriage** — ball joints, control arms, transmission, rear diff, brake lines.
- **State control**: a segmented control / toggle ("Exterior · Open Hood · Doors · Underside") **cross-fades** between states with cinematic motion (Framer Motion) — the "hood opens" transition is the signature moment.
- Each state carries its own **hotspots** at the exposed parts, **color-coded by status** (OK / Due / Overdue / Safety / Done). Hotspots should feel refined and status-aware, not default map pins.
- Tap a hotspot → the part is **spotlighted** (rest dims/recedes) → **part detail panel** slides in (does not navigate away).
- Filter/legend: toggle by system (Engine, Suspension, Drivetrain, Brakes, Body) and by status.
- Mobile: states swipeable; on a 3D exterior scan, slow rotate; hotspots remain tappable.

**Data impact:** a part's `hotspot` gains a **state** it belongs to (which reveal shows it). The old single explode-slider + connector-line pins are retired.

### 5.2 Part Detail Panel
For a selected part, show:
- Name, system, **provenance badge** (🟦 OEM · 🟧 Aftermarket · 🟩 Updated/Reman · ⬜ Original).
- Status chip (OK / Due / Overdue / Safety / Done).
- Brand + part number + spec (e.g., "Motorcraft SP-432, gap 0.052–0.056"").
- **Torque/fluid specs** where relevant (from the DIY Parts & Torque tab).
- **Last serviced**: date + mileage (or "no record").
- **History**: chronological list of work on this part.
- **Cost**: spent + estimated upcoming.
- **Docs**: links to invoice / CARFAX / manual page.

### 5.3 Maintenance Timeline
- Vehicle-wide chronological view (the Service History tab, visualized).
- Milestone markers: total loss (2021), salvage title, transmission replacement (2026).
- Each entry links back to the relevant part(s).
- Due/overdue items surfaced against current mileage (~110,623).

### 5.4 Provenance View
- Filter the whole car by provenance: "show me everything aftermarket / reman / still-original."
- Summary counts (e.g., "1 reman, 3 aftermarket, N original").

### 5.5 Cost Tracker
- Running total spent (from invoices).
- Estimated upcoming (from the DIY parts estimates + pending shop work).
- Optional breakdown by system.

### 5.6 Doc Vault
- Central list of source documents (invoice #6459, CARFAX report, owner's manual, placards, belt-routing diagram).
- Each doc viewable/downloadable; deep-linked from parts (e.g., manual p275 for belt routing).

---

## 6. Data Model

Single typed source (`parts.json` for v1; migratable to Neon Postgres later).

```ts
type Provenance = "OEM" | "Aftermarket" | "Updated" | "Original";
type Status = "OK" | "Due" | "Overdue" | "Safety" | "Done" | "Cosmetic";

interface ServiceEvent {
  date: string;          // ISO
  mileage: number | null;
  work: string;
  shop?: string;
  cost?: number;
  docRef?: string;       // -> Doc.id
}

interface Part {
  id: string;
  name: string;
  system: "Engine" | "Suspension" | "Drivetrain" | "Brakes" | "Body" | "Other";
  provenance: Provenance;
  status: Status;
  brand?: string;
  partNumber?: string;
  spec?: string;         // "75W-140 synthetic, 3.25 pt" / torque values
  lastServiced?: { date: string; mileage: number } | null;
  history: ServiceEvent[];
  cost: { spent: number; estimatedUpcoming?: number };
  docs: string[];        // -> Doc.id[]
  hotspot: {             // where the part is clickable, and in which reveal state
    state: "exterior" | "hood" | "doors" | "underside";
    x: number; y: number;  // % coords within that state's image
  };
  notes?: string;
}

interface Doc { id: string; label: string; file: string; page?: number; }

interface Vehicle {
  year: number; make: string; model: string; vin: string;
  engine: string; mileage: number; titleBrand?: string;  // "Salvage / NAM"
  parts: Part[]; docs: Doc[];
}
```

---

## 7. Information Architecture

- **/** — Exploded diagram (hero) + status summary + legend.
- **Part panel** — overlay/drawer (not a route change).
- **/timeline** — full maintenance timeline.
- **/parts** — filterable table (provenance, system, status) — the power-user view / spreadsheet parity.
- **/costs** — cost dashboard.
- **/docs** — doc vault.

---

## 8. Tech Stack

- **Next.js (App Router)** + TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **Framer Motion** (state cross-fades, hood-open transition, panel transitions)
- Hero: cross-faded per-state images + absolutely-positioned hotspots (SVG overlay for crisp scaling). **react-three-fiber only if** a rotatable 3D exterior scan is added (v3).
- **Data:** `data/vehicle.ts` (canonical). Optional migration to **Neon Postgres** (MCP already connected) if in-app editing is added.
- **Deploy:** Vercel.
- Assets (images, PDFs) served from `/public` or Vercel Blob.

---

## 9. Assets & Capture Plan (LOCKED: state-based scans)

The hero needs **one image per reveal state**, captured from the owner's actual car. Each state is a swappable layer; hotspots are positioned in % coords over it.

### States to capture
| State | Reveals | Hotspots |
|---|---|---|
| Exterior (closed) | Body, wheels, bumper, tires | front bumper, tires, exhaust tip |
| **Hood up** | Engine bay | serpentine belt, spark plugs, valve covers, coolant, air filter, PCV, oil cap |
| **Doors open** (optional) | Cabin | VIN placard, odometer |
| **Undercarriage** (ramps/lift) | Underside | ball joints, control arms, transmission, rear diff, brake lines |

### Capture guidance
- **Photos preferred** for hood-up and undercarriage — crisp, robust, $0, and read better than a rough scan in cluttered/dark/reflective engine bays.
- **iPhone LiDAR (Polycam / Scaniverse, free tier) optional** for a rotatable *exterior* hero "wow." A surface scan is a single skinned shell — it does **not** separate internal parts, which is exactly why we use the state-based reveal instead of relying on mesh separation.
- Shoot in even/shade light; hood fully up; car on ramps for the underside; consistent framing per state so cross-fades align.

### Why not a bought/segmented 3D model (investigated 2026-07-01)
- Free S197 models (e.g. Sketchfab 2005 V6, ~82k tris, CC-Attribution) are exterior shells split by material, not component — no engine bay, no separable serviceable parts.
- Premium beauty models (e.g. 2008 GT500, 4.5M tris) are far too heavy for real-time web, often wrong trim.
- Mid-tier "detailed" models ($80–300) separate *major assemblies* (panels/doors/hood/wheels/engine block) but **not** fine serviceable parts (belt, ball joint, plugs, diff) as named meshes.
- True per-serviceable-part separation = studio/rigged model ($300–1500+) or manual Blender splitting. Not worth it vs. the owner's own scans.
- Ford has a TurboSquid exclusive for Ford-branded models (low risk for a private hub, noted for completeness).

---

## 10. Roadmap

### v1 — Data hub + placeholder diagram ✅ (BUILT 2026-07-01)
- Seeded `data/vehicle.ts` from the hub spreadsheet (canonical).
- Placeholder silhouette + hotspots + explode slider + part panel.
- Provenance badges + status colors; timeline, cost tracker, doc vault, parts table.
- Runs & verified via Playwright.
- *Verdict:* data layer solid; hero looks crude ("preschool drawing") — being replaced.

### v2 — State-based reveal + "Night Garage" redesign ✅ (BUILT 2026-07-01)
- **Design done in Claude/Fable 5** — direction "Night Garage" (canvas + `SPEC.md` in the car folder).
- Retired explode slider + connector-line pins + placeholder silhouette.
- **Built:** Garage stage with `exterior / engine / under` reveal states, cross-fade + CINEMA/MECH motion toggle, status-aware hotspots, spotlight-on-select, sliding part sheet.
- States render as **schematic elevations** (shipping default) — photo/scan drops into the same layer contract.
- Annunciator-lamp status system + typographic provenance chips; Archivo/Plex fonts via `next/font`.
- Parts / Timeline / Costs / Documents views rebuilt; riveted VIN plate + salvage/NAM honesty pattern.
- Mobile bottom-tab layout; verified via Playwright DOM checks. Runs on :3000.
- **Pending:** owner's photos/scans to swap into the state layers; deploy to Vercel; (optional) Neon-backed editing.

### v3 — Polish (stretch)
- Rotatable 3D exterior scan (react-three-fiber) as the exterior state.
- Doc vault wired to actual files (Vercel Blob).
- Per-system filtering, richer transitions.

---

## 11. Non-Functional Requirements
- **Performance:** hero interactive < 2s on mobile; images optimized (Next/Image).
- **Responsive:** works phone → desktop (garage use is phone-first).
- **Maintainable data entry:** editing a part = editing JSON (v1); consider a simple admin/Neon later.
- **Private:** single-user; no auth needed but not publicly indexed.
- **Portable data model:** multi-vehicle-friendly schema even though UI is single-car.

---

## 12. Success Criteria
- Every part in the hub spreadsheet is represented and clickable.
- Provenance is visible at a glance for the whole car.
- Overdue/safety items are obvious on load.
- Any source document is reachable in ≤ 2 clicks from its part.
- Owner prefers opening the site over opening the spreadsheet.

---

## 13. Open Questions / Risks
- **Illustration accuracy vs. effort** — how "real" does the hero need to look for v1? (Leaning: not very; pins carry the value.)
- **Hotspot authoring** — placing ~20 pins by hand; need a quick way to capture x/y coords (a dev-mode "click to log coord" helper).
- **Data drift** — spreadsheet vs. `parts.json` will diverge once the site is the source of truth; pick one canonical source early (recommend: site becomes canonical after v1 seed).
- **Salvage-title framing** — if ever shared with a buyer, present title brand honestly and prominently.
- **Scope creep** toward multi-vehicle / reminders — keep out of v1.

---

## 14. Appendix — Seed Parts (from HUB.xlsx)

| Part | System | Provenance | Status |
|---|---|---|---|
| Front lower ball joints / control arms | Suspension | Original → (planned Aftermarket) | Safety |
| Struts / sway-bar links | Suspension | Original | Monitor (knock diag) |
| Serpentine belt | Engine | Original | Overdue |
| Spark plugs (SP-432) | Engine | Original | Overdue |
| Valve cover gaskets | Engine | Original | Monitor (leak) |
| Engine air filter | Engine | Unknown | Due |
| PCV valve | Engine | Unknown | Due |
| Engine coolant | Engine | Original | Overdue |
| Engine oil + filter | Engine | Service item | OK/ongoing |
| Transmission (5R55S) | Drivetrain | **Updated / Reman (WO #6459)** | Done |
| Rear differential fluid (7.5") | Drivetrain | Original | Optional |
| Front brake pads | Brakes | Aftermarket (2024) | OK |
| Brake fluid | Brakes | Original | Overdue |
| Front bumper | Body | Damaged | Cosmetic |
| Exhaust | Other | Repaired (2023) | OK |
| A/C system | Other | Serviced (2022) | OK |
| Tires (P235/55R17) | Other | Aftermarket | OK |

*Provenance/status to be confirmed per part during v1 seeding.*
