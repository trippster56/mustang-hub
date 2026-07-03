// "Night Garage" data model — see PRD.md and the design canvas (Mustang Hub.dc.html).

export type Status = "safety" | "overdue" | "due" | "monitor" | "cosmetic" | "ok" | "done";
export type HeroState = "exterior" | "engine" | "under";
export type System = "ENGINE" | "SUSPENSION" | "DRIVETRAIN" | "BRAKES" | "BODY";
export type ProvKind = "oem" | "aftermarket" | "reman" | "original" | "none";

export interface Spec {
  k: string;
  v: string;
}

export interface Hotspot {
  state: HeroState;
  x: number; // % of stage
  y: number;
  flip?: boolean;
}

export interface Part {
  id: string;
  system: System;
  name: string;
  status: Status;
  prov: string; // display label, e.g. "ORIGINAL", "AFTMKT · INBOUND", "REMAN"
  provKind: ProvKind; // drives chip styling
  finding: string;
  specs: Spec[];
  cost: string; // display, e.g. "$120–260", "—", "$4,439.84"
  time: string; // display, e.g. "3–5 h", "PAID"
  hotspots: Hotspot[]; // where the part is clickable, and in which reveal state
}

export interface TimelineEvent {
  date: string;
  mi: string; // "" when unknown
  place: string;
  work: string;
  kind: "major" | "brand" | "minor";
}

export interface CostRow {
  name: string;
  range: string;
  bar: number; // relative to a 260 scale
  paid: boolean;
}

export interface DocCard {
  id: string;
  title: string;
  meta: string;
  image?: string; // /docs/*.jpg thumbnail
  kind: "photo" | "pdf";
  warranty?: boolean; // renders meta in title-gold
  href?: string; // servable path under /public — opens on click
  file: string; // real path in the car folder (reference)
}

export interface Vehicle {
  year: number;
  make: string;
  model: string;
  vin: string;
  plate: string;
  engineCode: string; // "4.0L V6 · S197 · <PLATE>" style eyebrow
  engineFull: string;
  mileage: number;
  titleBrand: string;
  parts: Part[];
  timeline: TimelineEvent[];
  earlierRecords: number; // "28 earlier records" note
  totalRecords: number;
  costs: CostRow[];
  spentDisplay: string;
  upcomingDisplay: string;
  docs: DocCard[];
}

// Status = annunciator lamps (color + rank). Ported from the design canvas.
export const ST: Record<Status, { label: string; c: string; txt: string; glow: string; rank: number }> = {
  safety: { label: "SAFETY", c: "#FF453A", txt: "#FFB4AE", glow: "rgba(255,69,58,.8)", rank: 0 },
  overdue: { label: "OVERDUE", c: "#F5A83C", txt: "#F0CD9E", glow: "rgba(245,168,60,.7)", rank: 1 },
  due: { label: "DUE", c: "#E3CF5C", txt: "#E5DCA8", glow: "rgba(227,207,92,.55)", rank: 2 },
  monitor: { label: "MONITOR", c: "#6FA8DC", txt: "#B7CFE4", glow: "rgba(111,168,220,.5)", rank: 3 },
  cosmetic: { label: "COSMETIC", c: "#9A9A90", txt: "#9A9A90", glow: "rgba(154,154,144,.3)", rank: 4 },
  ok: { label: "OK", c: "#7A7A72", txt: "#8E8E88", glow: "rgba(122,122,114,.25)", rank: 5 },
  done: { label: "DONE", c: "#5DBB7E", txt: "#AFD8BE", glow: "rgba(93,187,126,.5)", rank: 6 },
};

export const STATE_META: { key: HeroState; label: string; num: string }[] = [
  { key: "exterior", label: "EXTERIOR", num: "01" },
  { key: "engine", label: "ENGINE BAY", num: "02" },
  { key: "under", label: "UNDERSIDE", num: "03" },
];

// Motion grammars (CINEMA / MECHANICAL) — ported from the canvas.
export const MOTION = {
  cinema: { dur: "900ms", ease: "cubic-bezier(.16,1,.3,1)", off: "scale(1.035)", blur: "blur(10px)", panel: ".6s cubic-bezier(.16,1,.3,1)" },
  mech: { dur: "280ms", ease: "cubic-bezier(.7,0,.2,1)", off: "translateY(6px)", blur: "blur(0px)", panel: ".3s cubic-bezier(.7,0,.2,1)" },
} as const;

export type MotionKey = keyof typeof MOTION;
