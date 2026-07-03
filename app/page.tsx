"use client";

import { useMemo, useState } from "react";
import { vehicle } from "@/data/vehicle";
import { ST, type Status } from "@/lib/types";
import GarageStage from "@/components/GarageStage";
import { PartsView, TimelineView, CostsView, DocsView, FullPartSheet } from "@/components/Views";

type Tab = "garage" | "parts" | "timeline" | "costs" | "documents";
const TABS: { key: Tab; label: string; short: string }[] = [
  { key: "garage", label: "GARAGE", short: "GARAGE" },
  { key: "parts", label: "PARTS", short: "PARTS" },
  { key: "timeline", label: "TIMELINE", short: "TIME" },
  { key: "costs", label: "COSTS", short: "COSTS" },
  { key: "documents", label: "DOCUMENTS", short: "DOCS" },
];

// Lamps shown in the header cluster (only non-trivial statuses, in rank order).
const LAMP_ORDER: Status[] = ["safety", "overdue", "due", "done"];

export default function Home() {
  const [tab, setTab] = useState<Tab>("garage");
  const [fullId, setFullId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of vehicle.parts) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, []);

  return (
    <main className="flex min-h-[100dvh] flex-col" style={{ background: "var(--void)" }}>
      {/* ===== top bar ===== */}
      <header className="flex flex-shrink-0 flex-wrap items-center gap-x-6 gap-y-3 border-b px-4 py-3 md:h-16 md:flex-nowrap md:py-0" style={{ borderColor: "var(--hairline)", background: "var(--stage)" }}>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-[17px]" style={{ letterSpacing: ".04em" }}>MUSTANG HUB</span>
          <span className="font-data hidden text-[9.5px] tracking-[.16em] sm:inline" style={{ color: "var(--ink-mute)" }}>
            {vehicle.engineCode}
          </span>
        </div>

        {/* desktop nav */}
        <nav className="ml-2 hidden gap-0.5 md:flex">
          {TABS.map((t) => {
            const on = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="font-data px-3.5 py-2 text-[10px] tracking-[.16em]"
                style={{ color: on ? "var(--ink)" : "var(--ink-mute)", borderBottom: on ? "2px solid var(--torch)" : "2px solid transparent" }}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="hidden flex-1 md:block" />

        {/* annunciator cluster */}
        <div className="flex gap-1.5">
          {LAMP_ORDER.map((k) => {
            const st = ST[k];
            return (
              <div key={k} className="flex items-center gap-1.5 rounded-[5px] px-2 py-1.5" style={{ background: "linear-gradient(180deg,#08080A,#0D0D0F)", border: "1px solid rgba(255,255,255,.09)" }}>
                <span className="h-2 w-2 rounded-full" style={{ background: st.c, boxShadow: `0 0 8px ${st.glow}`, animation: k === "safety" ? "safetyPulse 1.6s ease-in-out infinite" : "none" }} />
                <span className="font-data text-[9px] tracking-[.1em]" style={{ color: st.txt }}>
                  {counts[k] ?? 0} {st.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* salvage VIN plate */}
        <div className="relative flex flex-col gap-0.5 rounded px-3 py-1.5" style={{ background: "linear-gradient(180deg,#1E1E22,#141417)", border: "1px solid rgba(255,255,255,.14)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.08)" }}>
          <span className="absolute left-1 top-1/2 h-[3px] w-[3px] -translate-y-1/2 rounded-full" style={{ background: "var(--ink-faint)" }} />
          <span className="absolute right-1 top-1/2 h-[3px] w-[3px] -translate-y-1/2 rounded-full" style={{ background: "var(--ink-faint)" }} />
          <span className="font-data text-[8.5px] tracking-[.1em]" style={{ color: "var(--ink-mute)" }}>VIN {vehicle.vin}</span>
          <span className="font-data text-[8.5px] tracking-[.12em]" style={{ color: "var(--title-brand)" }}>TITLE: {vehicle.titleBrand}</span>
        </div>
      </header>

      {/* ===== body ===== */}
      {tab === "garage" ? (
        <GarageStage onOpenFull={setFullId} />
      ) : (
        <div className="flex-1 overflow-auto px-4 py-8 pb-24 md:pb-8">
          {tab === "parts" && <PartsView onSelect={setFullId} />}
          {tab === "timeline" && <TimelineView />}
          {tab === "costs" && <CostsView />}
          {tab === "documents" && <DocsView />}
        </div>
      )}

      {/* full part sheet (opened from the garage panel or the Parts list) */}
      <FullPartSheet partId={fullId} onClose={() => setFullId(null)} />

      {/* ===== mobile bottom tab bar ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t md:hidden" style={{ borderColor: "rgba(255,255,255,.08)", background: "#0D0D0F" }}>
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="font-data flex-1 py-3.5 text-center text-[8.5px] tracking-[.1em]"
              style={{ color: on ? "var(--ink)" : "var(--ink-faint)", borderTop: on ? "2px solid var(--torch)" : "2px solid transparent" }}
            >
              {t.short}
            </button>
          );
        })}
      </nav>
    </main>
  );
}
