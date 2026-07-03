"use client";

import type { CSSProperties } from "react";
import { vehicle } from "@/data/vehicle";
import { ST, type Part, type Status } from "@/lib/types";

const partsById = new Map(vehicle.parts.map((p) => [p.id, p]));
const docHref = (id: string) => vehicle.docs.find((d) => d.id === id)?.href ?? "#";

/* -------- shared bits -------- */

export function StatusDot({ status, size = 8 }: { status: Status; size?: number }) {
  const st = ST[status];
  if (status === "ok") return <span className="flex-none rounded-full" style={{ width: size, height: size, border: "1px solid #6E6E66" }} />;
  if (status === "cosmetic") return <span className="flex-none" style={{ width: size, height: size, borderRadius: 2, border: "1px dashed #7A7A72" }} />;
  return <span className="flex-none rounded-full" style={{ width: size, height: size, background: st.c, boxShadow: `0 0 8px ${st.glow}`, animation: status === "safety" ? "safetyPulse 1.6s ease-in-out infinite" : "none" }} />;
}

export function ProvChip({ part }: { part: Part }) {
  const reman = part.provKind === "reman";
  const style: CSSProperties = {
    color: reman ? "#E8B4AF" : "var(--ink-mute)",
    border: reman ? "1px solid rgba(200,50,43,.5)" : "1px solid rgba(255,255,255,.14)",
    background: reman ? "rgba(200,50,43,.12)" : "transparent",
  };
  return (
    <span className="font-data justify-self-start rounded-[3px] px-[7px] py-[3px] text-[8.5px] tracking-[.08em]" style={style}>
      {part.prov}
    </span>
  );
}

function Sheet({ children, width = 700 }: { children: React.ReactNode; width?: number }) {
  return (
    <div className="mx-auto w-full rounded-xl p-8" style={{ maxWidth: width, background: "var(--stage)", border: "1px solid rgba(255,255,255,.09)", boxShadow: "0 24px 60px rgba(0,0,0,.4)" }}>
      {children}
    </div>
  );
}

function Title({ children, count }: { children: React.ReactNode; count?: string }) {
  return (
    <div className="font-display text-[26px]">
      {children} {count && <span className="text-[13px] font-semibold" style={{ color: "var(--ink-mute)" }}>{count}</span>}
    </div>
  );
}

/* -------- Full part sheet (modal) -------- */

export function FullPartSheet({ partId, onClose }: { partId: string | null; onClose: () => void }) {
  const part = partId ? partsById.get(partId) ?? null : null;
  if (!part) return null;
  const st = ST[part.status];
  const safety = part.status === "safety";
  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-auto p-4 py-10 md:items-center"
      style={{ background: "rgba(6,6,7,.72)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full rounded-xl p-8 md:p-9"
        style={{ maxWidth: 560, background: "var(--stage)", border: "1px solid rgba(255,255,255,.12)", borderTopColor: "rgba(255,255,255,.2)", boxShadow: "0 24px 60px rgba(0,0,0,.6)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <span className="font-data text-[9px] tracking-[.2em]" style={{ color: "var(--ink-mute)" }}>{part.system} · PART SHEET</span>
          <button className="font-data cursor-pointer text-[12px]" style={{ color: "var(--ink-mute)" }} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="font-display mt-3.5 text-[30px] leading-[1.08]">{part.name.toUpperCase()}</div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-[5px] px-3 py-2" style={{ background: "linear-gradient(180deg,#08080A,#0D0D0F)", border: `1px solid ${safety ? "rgba(255,69,58,.35)" : "rgba(255,255,255,.09)"}` }}>
            <StatusDot status={part.status} size={9} />
            <span className="font-data text-[10px] tracking-[.14em]" style={{ color: st.txt }}>
              {safety ? "SAFETY — FIX BEFORE MORE DRIVING" : st.label}
            </span>
          </div>
          <ProvChip part={part} />
        </div>

        <div className="mt-6 font-data text-[9px] tracking-[.2em]" style={{ color: "var(--ink-mute)" }}>01 · FINDING</div>
        <p className="mt-2 pl-3.5 text-[13px] leading-[1.65]" style={{ color: "var(--ink-dim)", borderLeft: `2px solid ${safety ? "rgba(255,69,58,.4)" : "rgba(255,255,255,.14)"}` }}>
          {part.finding}
        </p>

        <div className="mt-5 font-data text-[9px] tracking-[.2em]" style={{ color: "var(--ink-mute)" }}>02 · SPECS &amp; TORQUE</div>
        <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {part.specs.map((s, i) => (
            <div key={i} className="rounded-md px-3.5 py-3" style={{ background: "linear-gradient(180deg,#08080A,#0D0D0F)", border: "1px solid rgba(255,255,255,.08)" }}>
              <div className="font-data text-[9px] tracking-[.08em]" style={{ color: "var(--ink-mute)" }}>{s.k}</div>
              <div className="font-data mt-1 text-[17px] leading-tight">{s.v}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-end justify-between border-t pt-4" style={{ borderColor: "rgba(255,255,255,.07)" }}>
          <div>
            <div className="font-data text-[8.5px] tracking-[.16em]" style={{ color: "var(--ink-mute)" }}>EST COST</div>
            <div className="font-data mt-1 text-[20px]">{part.cost}</div>
          </div>
          <div className="text-right">
            <div className="font-data text-[8.5px] tracking-[.16em]" style={{ color: "var(--ink-mute)" }}>DIY TIME</div>
            <div className="font-data mt-1 text-[20px]">{part.time}</div>
          </div>
        </div>

        <div className="mt-5 font-data text-[9px] tracking-[.2em]" style={{ color: "var(--ink-mute)" }}>03 · SOURCES</div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          <a href={docHref("invoice-6459")} target="_blank" rel="noreferrer" className="font-data rounded px-2.5 py-1.5 text-[10px]" style={{ color: "var(--ink-dim)", border: "1px solid rgba(255,255,255,.14)" }}>⌗ Dunrite inspection · #6459</a>
          <a href={docHref("manual")} target="_blank" rel="noreferrer" className="font-data rounded px-2.5 py-1.5 text-[10px]" style={{ color: "var(--ink-dim)", border: "1px solid rgba(255,255,255,.14)" }}>⌗ Owner's manual</a>
        </div>
      </div>
    </div>
  );
}

/* -------- Parts -------- */

export function PartsView({ onSelect }: { onSelect: (id: string) => void }) {
  const sorted = [...vehicle.parts].sort((a, b) => ST[a.status].rank - ST[b.status].rank);
  const cols = "30px minmax(180px,265px) 1fr 130px 108px 100px";
  return (
    <Sheet width={1180}>
      <div className="flex items-baseline justify-between">
        <Title count={`${vehicle.parts.length} TRACKED`}>PARTS</Title>
        <div className="font-data text-[10px] tracking-[.12em]" style={{ color: "var(--ink-mute)" }}>
          SORT: URGENCY ▾ · FILTER: ALL SYSTEMS ▾
        </div>
      </div>
      <div className="mt-[22px] hidden gap-3.5 border-b px-3 pb-2.5 md:grid" style={{ gridTemplateColumns: cols, alignItems: "center", borderColor: "rgba(255,255,255,.1)" }}>
        {["", "PART / SYSTEM", "FINDING", "PROVENANCE", "STATUS", "EST / PAID"].map((h, i) => (
          <span key={i} className="font-data text-[8.5px] tracking-[.18em]" style={{ color: "var(--ink-faint)", textAlign: i === 5 ? "right" : "left" }}>
            {h}
          </span>
        ))}
      </div>
      {sorted.map((p) => {
        const st = ST[p.status];
        const quiet = p.status === "done" || p.status === "ok";
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className="grid w-full cursor-pointer grid-cols-[24px_1fr] items-center gap-3.5 rounded-md border-b px-3 py-3 text-left transition-colors hover:bg-white/[0.03] md:grid-cols-[30px_minmax(180px,265px)_1fr_130px_108px_100px]"
            style={{ borderColor: "rgba(255,255,255,.05)", opacity: quiet ? 0.5 : 1 }}
          >
            <StatusDot status={p.status} />
            <span>
              <span className="text-[13.5px] font-semibold" style={{ color: "var(--ink)" }}>
                {p.name}
              </span>
              <br />
              <span className="font-data text-[9px] tracking-[.14em]" style={{ color: "var(--ink-faint)" }}>
                {p.system}
              </span>
            </span>
            <span className="hidden text-[11.5px] leading-[1.45] md:block" style={{ color: "var(--ink-mute)" }}>
              {p.finding.split(". ")[0]}.
            </span>
            <span className="hidden md:block">
              <ProvChip part={p} />
            </span>
            <span className="font-data hidden text-[9.5px] tracking-[.1em] md:block" style={{ color: st.txt }}>
              {st.label}
            </span>
            <span className="font-data hidden text-right text-[11.5px] md:block" style={{ color: "var(--ink-dim)" }}>
              {p.cost}
            </span>
          </button>
        );
      })}
    </Sheet>
  );
}

/* -------- Timeline -------- */

export function TimelineView() {
  const tl = vehicle.timeline;
  return (
    <Sheet width={700}>
      <Title>TIMELINE</Title>
      <div className="font-data mt-1.5 text-[10px] tracking-[.12em]" style={{ color: "var(--ink-mute)" }}>
        {vehicle.totalRecords} RECORDS · CARFAX + DUNRITE · NEWEST FIRST
      </div>
      <div className="relative mt-6">
        {tl.map((e, i) => {
          const last = i === tl.length - 1;
          const dot: CSSProperties =
            e.kind === "major"
              ? { width: 11, height: 11, borderRadius: "50%", background: "var(--torch)", boxShadow: "0 0 12px rgba(200,50,43,.6)", marginTop: 3 }
              : e.kind === "brand"
                ? { width: 9, height: 9, borderRadius: 2, background: "transparent", border: "1px solid var(--title-brand)", transform: "rotate(45deg)", marginTop: 4 }
                : { width: 7, height: 7, borderRadius: "50%", background: "#3A3A3E", border: "1px solid #55554F", marginTop: 5 };
          return (
            <div key={i} className="flex">
              <div className="w-[86px] flex-none text-right">
                <div className="font-data text-[10.5px]" style={{ color: "var(--ink-dim)" }}>{e.date}</div>
                <div className="font-data mt-0.5 text-[9.5px]" style={{ color: "var(--ink-faint)" }}>{e.mi ? `${e.mi} mi` : ""}</div>
              </div>
              <div className="flex w-[34px] flex-none flex-col items-center self-stretch">
                <span className="flex-none" style={dot} />
                {!last && <span className="mt-1 w-px flex-1" style={{ background: e.kind === "brand" ? "repeating-linear-gradient(180deg, rgba(199,162,74,.4) 0 3px, transparent 3px 7px)" : "rgba(255,255,255,.08)" }} />}
              </div>
              <div className="flex-1 pb-[22px]">
                <div style={{ color: e.kind === "brand" ? "var(--title-brand)" : e.kind === "major" ? "var(--ink)" : "var(--ink-dim)", fontWeight: e.kind === "minor" ? 400 : 600, fontSize: e.kind === "major" ? "13.5px" : "12.5px", lineHeight: 1.45 }}>
                  {e.work}
                </div>
                <div className="font-data mt-[3px] text-[9.5px] tracking-[.08em]" style={{ color: "var(--ink-faint)" }}>
                  {e.place.toUpperCase()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="font-data border-t pt-3.5 text-[10px] tracking-[.1em]" style={{ color: "var(--ink-faint)", borderColor: "rgba(255,255,255,.07)" }}>
        ▸ {vehicle.earlierRecords} EARLIER RECORDS (2007–2021) — FULL CARFAX IN DOCUMENTS
      </div>
    </Sheet>
  );
}

/* -------- Costs -------- */

export function CostsView() {
  return (
    <Sheet width={700}>
      <Title>COSTS</Title>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg p-5" style={{ background: "linear-gradient(180deg,#08080A,#0D0D0F)", border: "1px solid rgba(255,255,255,.08)" }}>
          <div className="font-data text-[8.5px] tracking-[.18em]" style={{ color: "var(--ink-mute)" }}>SPENT · 2026</div>
          <div className="font-data mt-2 text-[32px]">
            $4,439<span className="text-[16px]" style={{ color: "var(--ink-mute)" }}>.84</span>
          </div>
          <div className="mt-1.5 text-[10.5px]" style={{ color: "var(--ink-mute)" }}>Reman transmission, WO #6459 · under 2 yr / 24 k warranty</div>
        </div>
        <div className="rounded-lg p-5" style={{ background: "linear-gradient(180deg,#08080A,#0D0D0F)", border: "1px solid rgba(255,255,255,.08)" }}>
          <div className="font-data text-[8.5px] tracking-[.18em]" style={{ color: "var(--ink-mute)" }}>UPCOMING · EST (DIY PARTS + SHOP)</div>
          <div className="font-data mt-2 text-[32px]" style={{ color: "#F5A83C" }}>{vehicle.upcomingDisplay}</div>
          <div className="mt-1.5 text-[10.5px]" style={{ color: "var(--ink-mute)" }}>9 open items · shop labor extra where noted</div>
        </div>
      </div>
      <div className="mt-6">
        {vehicle.costs.map((c, i) => (
          <div key={i} className="grid items-center gap-3.5 border-b py-[9px]" style={{ gridTemplateColumns: "150px 1fr 92px", borderColor: "rgba(255,255,255,.05)" }}>
            <span className="text-[12px]" style={{ color: c.paid ? "var(--ink-faint)" : "var(--ink-dim)" }}>{c.name}</span>
            <span className="relative block h-2 rounded-[2px]" style={{ background: "rgba(255,255,255,.05)" }}>
              <span className="absolute bottom-0 left-0 top-0 rounded-[2px]" style={{ width: `${Math.min(100, (c.bar / 260) * 100)}%`, background: c.paid ? "rgba(93,187,126,.4)" : "linear-gradient(90deg, rgba(245,168,60,.7), rgba(245,168,60,.35))" }} />
            </span>
            <span className="font-data text-right text-[11px]" style={{ color: c.paid ? "#5DBB7E" : "var(--ink)" }}>{c.range}</span>
          </div>
        ))}
      </div>
      <div className="mt-3.5 text-[10.5px] leading-[1.5]" style={{ color: "var(--ink-faint)" }}>
        Ranges are DIY-parts estimates from the inspection sheet; alignment and knock diagnosis are shop line items. Bars show range midpoints.
      </div>
    </Sheet>
  );
}

/* -------- Documents -------- */

export function DocsView() {
  return (
    <Sheet width={760}>
      <Title>DOCUMENTS</Title>
      <div className="mt-[22px] grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {vehicle.docs.map((d) => (
          <a
            key={d.id}
            href={d.href ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="group block overflow-hidden rounded-lg transition-colors hover:border-white/25"
            style={{ background: "#0E0E10", border: "1px solid rgba(255,255,255,.09)" }}
          >
            {d.image ? (
              <img src={d.image} alt={d.title} className="block h-[110px] w-full object-cover transition-[filter]" style={{ filter: "brightness(.9)" }} />
            ) : (
              <div className="flex items-start justify-between p-3.5" style={{ minHeight: 110 }}>
                <div className="font-data text-[20px]" style={{ color: "var(--ink-faint)" }}>PDF</div>
              </div>
            )}
            <div className="flex items-end justify-between px-3.5 py-3">
              <div>
                <div className="text-[11.5px] font-semibold">{d.title}</div>
                <div className="font-data mt-1 text-[9px] tracking-[.1em]" style={{ color: d.warranty ? "var(--title-brand)" : "var(--ink-faint)" }}>{d.meta}</div>
              </div>
              <span className="font-data text-[11px] opacity-0 transition-opacity group-hover:opacity-100" style={{ color: "var(--ink-mute)" }}>OPEN ↗</span>
            </div>
          </a>
        ))}
      </div>
      <div className="mt-3.5 rounded-lg p-4" style={{ border: "1px solid rgba(199,162,74,.3)", background: "rgba(199,162,74,.05)" }}>
        <div className="font-data text-[9.5px] tracking-[.16em]" style={{ color: "var(--title-brand)" }}>
          TITLE DISCLOSURE — SALVAGE · NOT ACTUAL MILEAGE
        </div>
        <div className="mt-2 text-[12px] leading-[1.65]" style={{ color: "var(--ink-dim)" }}>
          Declared a total loss (collision) 12/08/2021; salvage/NAM title issued 01/05/2022 at a reported 56,000 mi. Odometer readings since have tracked consistently (63k → 110k). Affects resale, insurance and financing — not day-to-day driving. Manufacturer warranty void; no CARFAX buyback.
        </div>
      </div>
      <p className="mt-3 text-[10.5px]" style={{ color: "var(--ink-faint)" }}>
        v2 lists the source docs from the car folder; wiring in-app viewing/upload is next.
      </p>
    </Sheet>
  );
}
