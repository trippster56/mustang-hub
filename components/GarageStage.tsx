"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { vehicle } from "@/data/vehicle";
import { ST, STATE_META, MOTION, type HeroState, type MotionKey, type Part } from "@/lib/types";

const partsById = new Map(vehicle.parts.map((p) => [p.id, p]));

// Real photos of Tripp's car, per state. States without an entry fall back to the
// schematic. Hotspot coords for a photo state are % of the PHOTO (see data/vehicle.ts),
// so they track the image at any viewport since the image shrink-wraps its hotspot layer.
const PHOTOS: Partial<Record<HeroState, { src: string; alt: string }>> = {
  exterior: { src: "/car/exterior.jpg", alt: "2008 Mustang V6 — driver-side profile" },
  engine: { src: "/car/engine.jpg", alt: "4.0L V6 engine bay, top-down" },
};

/* -------- schematic elevations (shipping default; swap for photo/scan later) -------- */

function SchematicExterior() {
  return (
    <>
      <div className="font-display absolute left-1/2 top-[32%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(40px,7vw,76px)]" style={{ color: "rgba(255,255,255,.05)" }}>
        EXTERIOR
      </div>
      <div className="absolute left-[7%] right-[7%] bottom-[18%] h-px" style={{ background: "rgba(255,255,255,.13)" }} />
      {[19, 79].map((l, i) => (
        <div key={i} className="absolute bottom-[18%] flex h-[26%] w-[26%] items-center justify-center rounded-full" style={{ [i ? "right" : "left"]: "19%", border: "1px solid rgba(255,255,255,.16)", aspectRatio: "1" } as CSSProperties}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "rgba(255,255,255,.2)" }} />
        </div>
      ))}
      <SchematicCaption>SCHEMATIC ELEVATION — DROP PHOTO / SCAN TO REPLACE</SchematicCaption>
    </>
  );
}

function SchematicEngine() {
  return (
    <>
      <div className="font-display absolute left-1/2 top-[16%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(32px,5.5vw,60px)]" style={{ color: "rgba(255,255,255,.05)" }}>
        ENGINE BAY
      </div>
      <div className="absolute left-[26%] right-[26%] top-[30%] bottom-[20%] rounded-md" style={{ border: "1px solid rgba(255,255,255,.14)" }} />
      <div className="absolute left-1/2 top-[30%] bottom-[20%] w-px" style={{ background: "repeating-linear-gradient(180deg, rgba(255,255,255,.14) 0 4px, transparent 4px 9px)" }} />
      <div className="absolute left-[38%] top-[42%] h-5 w-5 rounded-full" style={{ border: "1px solid rgba(255,255,255,.16)" }} />
      <div className="absolute left-[58%] top-[42%] h-5 w-5 rounded-full" style={{ border: "1px solid rgba(255,255,255,.16)" }} />
      <SchematicCaption>SCHEMATIC PLAN — DROP PHOTO / SCAN TO REPLACE</SchematicCaption>
    </>
  );
}

function SchematicUnder() {
  return (
    <>
      <div className="font-display absolute left-1/2 top-[16%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(32px,5.5vw,60px)]" style={{ color: "rgba(255,255,255,.05)" }}>
        UNDERSIDE
      </div>
      {[
        { l: "16%", t: "28%" },
        { l: "16%", b: "16%" },
        { r: "16%", t: "28%" },
        { r: "16%", b: "16%" },
      ].map((pos, i) => (
        <div key={i} className="absolute h-[74px] w-8 rounded-[10px]" style={{ ...pos, border: "1px solid rgba(255,255,255,.16)" } as CSSProperties} />
      ))}
      <div className="absolute left-[36%] right-[26%] top-1/2 h-px" style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,.16) 0 5px, transparent 5px 11px)" }} />
      <div className="absolute left-[30%] top-[46%] h-[12%] w-11 rounded" style={{ border: "1px solid rgba(255,255,255,.14)" }} />
      <div className="absolute right-[22%] top-1/2 h-[26px] w-[26px] translate-x-1/2 -translate-y-1/2 rounded-full" style={{ border: "1px solid rgba(255,255,255,.16)" }} />
      <SchematicCaption>SCHEMATIC — FRONT AT LEFT · DROP PHOTO / SCAN TO REPLACE</SchematicCaption>
    </>
  );
}

function SchematicCaption({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-data absolute bottom-3 left-4 text-[8.5px] tracking-[.16em]" style={{ color: "var(--ink-faint)" }}>
      {children}
    </div>
  );
}

const SCHEMATICS: Record<HeroState, React.ReactNode> = {
  exterior: <SchematicExterior />,
  engine: <SchematicEngine />,
  under: <SchematicUnder />,
};

/* -------- hotspot -------- */

function Hotspot({ part, x, y, selected, motion, index, onSelect, zoom = 1 }: { part: Part; x: number; y: number; selected: boolean; motion: MotionKey; index: number; onSelect: () => void; zoom?: number }) {
  const st = ST[part.status];
  const flip = x > 55;
  return (
    <div
      className="absolute cursor-pointer"
      // counter-scale by 1/zoom so the dot + label keep a constant screen size while the photo scales
      style={{ left: `${x}%`, top: `${y}%`, zIndex: selected ? 30 : 5, transform: `translate(-50%,-50%) scale(${1 / zoom})`, transition: "transform .12s ease-out", transitionDelay: motion === "cinema" ? `${index * 60}ms` : "0ms" }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        className="relative flex h-[26px] w-[26px] items-center justify-center rounded-full"
        style={{
          border: `1px solid ${selected ? st.c : "rgba(255,255,255,.3)"}`,
          background: "rgba(8,8,9,.4)",
          backdropFilter: "blur(2px)",
          boxShadow: selected ? `0 0 0 5px rgba(8,8,9,.4), 0 0 22px ${st.glow}` : "0 0 0 4px rgba(8,8,9,.25)",
          transition: "box-shadow .3s, border-color .3s",
        }}
      >
        {part.status === "safety" && (
          <span className="absolute rounded-full" style={{ inset: "-1px", border: "1px solid rgba(255,69,58,.6)", animation: "spotPing 2s ease-out infinite" }} />
        )}
        <span className="h-2 w-2 rounded-full" style={{ background: st.c, boxShadow: `0 0 10px ${st.glow}` }} />
      </div>
      <div className="absolute top-1/2 hidden -translate-y-1/2 items-center sm:flex" style={flip ? { right: "34px", flexDirection: "row-reverse" } : { left: "34px" }}>
        <span className="h-px w-[18px] flex-none" style={{ background: "rgba(255,255,255,.25)" }} />
        <span className="font-data whitespace-nowrap rounded-[3px] px-2 py-1 text-[9px] tracking-[.12em]" style={{ color: "#d9d9d4", background: "rgba(10,10,11,.88)", border: "1px solid rgba(255,255,255,.12)" }}>
          {part.name.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

/* -------- part panel -------- */

function PartPanel({ part, onClose, onOpenFull }: { part: Part; onClose: () => void; onOpenFull: (id: string) => void }) {
  const st = ST[part.status];
  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100%" }}>
      <div className="flex items-center justify-between px-6 pt-5">
        <span className="font-data text-[9px] tracking-[.2em]" style={{ color: "var(--ink-mute)" }}>
          {part.system} — PART SHEET
        </span>
        <button className="font-data cursor-pointer px-2 py-1.5 text-[12px]" style={{ color: "var(--ink-mute)" }} onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-auto px-6 pb-6 pt-2">
        <div className="font-display mt-1.5 text-[24px] leading-[1.1]">{part.name.toUpperCase()}</div>
        <div className="mt-3 flex items-center gap-2">
          <span className="h-[9px] w-[9px] rounded-full" style={{ background: st.c, boxShadow: `0 0 10px ${st.glow}`, animation: part.status === "safety" ? "safetyPulse 1.6s ease-in-out infinite" : "none" }} />
          <span className="font-data text-[10px] tracking-[.14em]" style={{ color: st.txt }}>
            {st.label}
          </span>
          <span className="font-data rounded-[3px] px-1.5 py-0.5 text-[8.5px] tracking-[.1em]" style={{ color: "var(--ink-mute)", border: "1px solid rgba(255,255,255,.18)" }}>
            {part.prov}
          </span>
        </div>
        <p className="mt-3.5 pl-3 text-[12.5px] leading-[1.6]" style={{ color: "var(--ink-dim)", borderLeft: "2px solid rgba(255,255,255,.12)" }}>
          {part.finding}
        </p>
        <div className="mt-[18px] rounded-md px-3.5 py-1" style={{ background: "linear-gradient(180deg,#08080A,#0D0D0F)", border: "1px solid rgba(255,255,255,.08)" }}>
          {part.specs.map((r, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4 py-[9px]" style={{ borderBottom: i < part.specs.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none" }}>
              <span className="font-data text-[9.5px] tracking-[.1em]" style={{ color: "var(--ink-mute)" }}>
                {r.k}
              </span>
              <span className="font-data text-right text-[12px]" style={{ color: "var(--ink)" }}>
                {r.v}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between">
          <div>
            <div className="font-data text-[8.5px] tracking-[.16em]" style={{ color: "var(--ink-mute)" }}>
              EST COST
            </div>
            <div className="font-data mt-1 text-[16px]">{part.cost}</div>
          </div>
          <div className="text-right">
            <div className="font-data text-[8.5px] tracking-[.16em]" style={{ color: "var(--ink-mute)" }}>
              DIY TIME
            </div>
            <div className="font-data mt-1 text-[16px]">{part.time}</div>
          </div>
        </div>
        <div className="mt-5 flex gap-2.5">
          <button className="font-data cursor-pointer rounded-[5px] px-4 py-2.5 text-[10px] tracking-[.14em] text-white" style={{ background: "var(--torch)" }} onClick={() => onOpenFull(part.id)}>
            OPEN FULL SHEET
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------- photo stage (scroll/pinch zoom + drag pan) -------- */

type View = { zoom: number; x: number; y: number };
const ZMAX = 5;

function PhotoStage({
  photo,
  spots,
  sel,
  spotHere,
  motion,
  onSelect,
}: {
  photo: { src: string; alt: string };
  spots: { part: Part; x: number; y: number }[];
  sel: string | null;
  spotHere: { x: number; y: number } | null;
  motion: MotionKey;
  onSelect: (id: string) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ zoom: 1, x: 0, y: 0 });
  const [animate, setAnimate] = useState(false);
  const drag = useRef({ active: false, id: -1, sx: 0, sy: 0, lx: 0, ly: 0, moved: false });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef({ prevDist: 0 });

  // keep the scaled image covering the frame; never let it be dragged off-screen
  const clampView = (cand: View, v: View): View => {
    const wrapEl = wrapRef.current, boxEl = boxRef.current;
    if (!wrapEl || !boxEl) return cand;
    const r = wrapEl.getBoundingClientRect();
    const b = boxEl.getBoundingClientRect();
    const layoutLeft = r.left - v.x, layoutTop = r.top - v.y; // wrapper's untransformed top-left
    const ww = r.width / v.zoom, wh = r.height / v.zoom;
    const sw = cand.zoom * ww, sh = cand.zoom * wh;
    let { x, y } = cand;
    if (sw <= b.width + 0.5) x = b.left + (b.width - sw) / 2 - layoutLeft;
    else x = Math.min(b.left - layoutLeft, Math.max(b.right - layoutLeft - sw, x));
    if (sh <= b.height + 0.5) y = b.top + (b.height - sh) / 2 - layoutTop;
    else y = Math.min(b.top - layoutTop, Math.max(b.bottom - layoutTop - sh, y));
    return { zoom: cand.zoom, x, y };
  };

  const zoomTo = (nextZoom: number, focalX: number, focalY: number) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setAnimate(true);
    setView((v) => {
      const z1 = Math.min(ZMAX, Math.max(1, nextZoom));
      if (z1 === v.zoom) return v;
      const x = v.x + ((v.zoom - z1) * (focalX - r.left)) / v.zoom;
      const y = v.y + ((v.zoom - z1) * (focalY - r.top)) / v.zoom;
      return clampView({ zoom: z1, x, y }, v);
    });
  };

  // wheel must be a non-passive native listener to preventDefault the page scroll
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = wrapRef.current?.getBoundingClientRect();
      if (!r) return;
      setAnimate(true);
      setView((v) => {
        const z1 = Math.min(ZMAX, Math.max(1, v.zoom * Math.exp(-e.deltaY * 0.0015)));
        if (z1 === v.zoom) return v;
        const x = v.x + ((v.zoom - z1) * (e.clientX - r.left)) / v.zoom;
        const y = v.y + ((v.zoom - z1) * (e.clientY - r.top)) / v.zoom;
        return clampView({ zoom: z1, x, y }, v);
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      pinch.current.prevDist = 0;
      drag.current.active = false;
      return;
    }
    drag.current = { active: true, id: e.pointerId, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      if (pinch.current.prevDist) {
        const r = wrapRef.current?.getBoundingClientRect();
        if (r) {
          const factor = dist / pinch.current.prevDist;
          setAnimate(false);
          setView((v) => {
            const z1 = Math.min(ZMAX, Math.max(1, v.zoom * factor));
            const x = v.x + ((v.zoom - z1) * (mid.x - r.left)) / v.zoom;
            const y = v.y + ((v.zoom - z1) * (mid.y - r.top)) / v.zoom;
            return clampView({ zoom: z1, x, y }, v);
          });
        }
      }
      pinch.current.prevDist = dist;
      return;
    }

    const d = drag.current;
    if (!d.active || e.pointerId !== d.id) return;
    const dx = e.clientX - d.lx, dy = e.clientY - d.ly;
    d.lx = e.clientX; d.ly = e.clientY;
    if (!d.moved && Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 4) {
      d.moved = true;
      try { boxRef.current?.setPointerCapture(e.pointerId); } catch {}
    }
    if (!d.moved) return;
    setAnimate(false);
    setView((v) => (v.zoom <= 1 ? v : clampView({ zoom: v.zoom, x: v.x + dx, y: v.y + dy }, v)));
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current.prevDist = 0;
    if (drag.current.id === e.pointerId) drag.current.active = false;
  };

  const onDoubleClick = (e: React.MouseEvent) => zoomTo(view.zoom > 1 ? 1 : 2.6, e.clientX, e.clientY);

  const btnZoom = (mult: number) => {
    const b = boxRef.current?.getBoundingClientRect();
    if (!b) return;
    zoomTo(view.zoom * mult, b.left + b.width / 2, b.top + b.height / 2);
  };
  const reset = () => { setAnimate(true); setView({ zoom: 1, x: 0, y: 0 }); };

  const zoomed = view.zoom > 1.01;

  return (
    <div
      ref={boxRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg"
      style={{ touchAction: "none", cursor: zoomed ? "grab" : "default" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onDoubleClick={onDoubleClick}
    >
      <div
        ref={wrapRef}
        data-zoomwrap
        className="relative h-full"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`, transformOrigin: "0 0", transition: animate ? "transform .14s ease-out" : "none", willChange: "transform" }}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          draggable={false}
          className="block h-full max-w-full select-none rounded-lg object-contain"
          style={{ border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 20px 50px rgba(0,0,0,.55)" }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-lg"
          style={{
            zIndex: 10,
            background: spotHere ? `radial-gradient(circle 220px at ${spotHere.x}% ${spotHere.y}%, rgba(6,6,7,0) 0 66px, rgba(6,6,7,.82) 210px)` : "rgba(6,6,7,0)",
            opacity: spotHere ? 1 : 0,
            transition: "opacity .45s ease",
          }}
        />
        {spots.map((s, i) => (
          <Hotspot key={s.part.id} part={s.part} x={s.x} y={s.y} selected={sel === s.part.id} motion={motion} index={i} zoom={view.zoom} onSelect={() => onSelect(s.part.id)} />
        ))}
      </div>

      {/* zoom controls */}
      <div className="absolute bottom-2.5 right-2.5 flex flex-col items-stretch gap-1" style={{ zIndex: 25 }} onPointerDown={(e) => e.stopPropagation()}>
        {zoomed && (
          <span className="font-data mb-0.5 text-center text-[8px] tracking-[.1em]" style={{ color: "var(--ink-mute)" }}>
            {view.zoom.toFixed(1)}×
          </span>
        )}
        <ZoomBtn label="+" onClick={() => btnZoom(1.5)} />
        <ZoomBtn label="−" onClick={() => btnZoom(1 / 1.5)} />
        <ZoomBtn label="⤢" onClick={reset} title="Fit" />
      </div>
    </div>
  );
}

function ZoomBtn({ label, onClick, title }: { label: string; onClick: () => void; title?: string }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="font-data flex h-[26px] w-[26px] cursor-pointer items-center justify-center rounded-[5px] text-[13px] leading-none"
      style={{ color: "var(--ink)", background: "rgba(10,10,11,.82)", border: "1px solid rgba(255,255,255,.14)", backdropFilter: "blur(6px)" }}
    >
      {label}
    </button>
  );
}

/* -------- garage stage -------- */

export default function GarageStage({ onOpenFull }: { onOpenFull: (id: string) => void }) {
  const [hero, setHero] = useState<HeroState>("engine");
  const [sel, setSel] = useState<string | null>(null);
  const [motion, setMotion] = useState<MotionKey>("cinema");

  const M = MOTION[motion];
  const selPart = sel ? partsById.get(sel) ?? null : null;
  const selSpot = useMemo(() => (selPart ? selPart.hotspots[0] : null), [selPart]);
  const selState = selSpot?.state ?? null;
  const selIsPhoto = selState ? !!PHOTOS[selState] : false;
  const stateName = STATE_META.find((s) => s.key === hero)!.label;

  const spotsByState = useMemo(() => {
    const map: Record<HeroState, { part: Part; x: number; y: number }[]> = { exterior: [], engine: [], under: [] };
    for (const p of vehicle.parts) for (const h of p.hotspots) map[h.state].push({ part: p, x: h.x, y: h.y });
    return map;
  }, []);

  const layerStyle = (key: HeroState): CSSProperties => {
    const on = hero === key;
    return {
      position: "absolute",
      inset: 0,
      opacity: on ? 1 : 0,
      transform: on ? "none" : M.off,
      filter: on ? "blur(0px)" : M.blur,
      transition: `opacity ${M.dur} ${M.ease}, transform ${M.dur} ${M.ease}, filter ${M.dur} ${M.ease}`,
      pointerEvents: on ? "auto" : "none",
    };
  };

  return (
    <div
      className="relative flex-1 overflow-hidden"
      style={{
        minHeight: 420,
        background: "radial-gradient(ellipse 70% 55% at 50% 78%, #141416 0%, #0B0B0C 55%, #060607 100%)",
      }}
    >
      {/* floor line */}
      <div className="absolute left-[8%] right-[8%] top-[78%] h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.10),transparent)" }} />

      {/* state layers */}
      {STATE_META.map(({ key }) => {
        const photo = PHOTOS[key];
        const spotHere = sel && selState === key ? selSpot : null;
        return (
          <div key={key} style={layerStyle(key)}>
            <div className="absolute left-[4%] top-[8%] flex h-[58%] w-[92%] items-center justify-center md:left-[11%] md:top-[9%] md:h-[66%] md:w-[60%]">
              {photo ? (
                // shrink-wrapped photo w/ scroll-pinch zoom + drag pan; hotspots live in the
                // image's own coordinate space so they track features at any zoom/viewport.
                <PhotoStage photo={photo} spots={spotsByState[key]} sel={sel} spotHere={spotHere} motion={motion} onSelect={setSel} />
              ) : (
                <div
                  className="absolute inset-0 overflow-hidden rounded-lg"
                  style={{
                    border: "1px solid rgba(255,255,255,.07)",
                    background: "repeating-linear-gradient(45deg, rgba(255,255,255,.018) 0 1px, transparent 1px 14px), radial-gradient(ellipse 80% 60% at 50% 64%, #101012, #0A0A0B)",
                  }}
                >
                  {SCHEMATICS[key]}
                </div>
              )}
            </div>
            {/* schematic states place hotspots at stage scale (unchanged) */}
            {!photo &&
              spotsByState[key].map((s, i) => (
                <Hotspot key={s.part.id} part={s.part} x={s.x} y={s.y} selected={sel === s.part.id} motion={motion} index={i} onSelect={() => setSel(s.part.id)} />
              ))}
          </div>
        );
      })}

      {/* deselect click-catcher; dims the whole stage only for schematic states
          (photo states get a precise spotlight painted on the image itself) */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 20,
          background: sel && !selIsPhoto && selSpot ? `radial-gradient(circle 300px at ${selSpot.x}% ${selSpot.y}%, rgba(6,6,7,0) 0 90px, rgba(6,6,7,.78) 240px)` : "rgba(6,6,7,0)",
          opacity: sel ? 1 : 0,
          pointerEvents: sel ? "auto" : "none",
          transition: "opacity .45s ease",
          cursor: "pointer",
        }}
        onClick={() => setSel(null)}
      />

      {/* state label, top-left */}
      <div className="pointer-events-none absolute left-7 top-5">
        <span className="font-data text-[9px] tracking-[.2em]" style={{ color: "var(--ink-mute)" }}>
          STATE /{" "}
        </span>
        <span className="font-data text-[9px] tracking-[.2em]" style={{ color: "var(--ink)" }}>
          {stateName}
        </span>
      </div>

      {/* odometer readout, bottom-left (hidden on mobile to avoid crowding the switcher) */}
      <div className="pointer-events-none absolute bottom-6 left-7 hidden flex-col gap-1.5 sm:flex">
        <span className="font-data text-[9px] tracking-[.2em]" style={{ color: "var(--ink-mute)" }}>
          ODOMETER
        </span>
        <span className="font-data text-[30px] tracking-[.02em]" style={{ color: "var(--ink)" }}>
          {vehicle.mileage.toLocaleString()} <span className="text-[13px]" style={{ color: "var(--ink-mute)" }}>mi †</span>
        </span>
        <span className="font-data text-[9px] tracking-[.08em]" style={{ color: "var(--ink-faint)" }}>
          † BRANDED NOT-ACTUAL-MILEAGE 01/2022 — TRACKED CONSISTENTLY SINCE
        </span>
      </div>

      {/* state switcher, bottom-center (lifted above the mobile tab bar) */}
      <div className="absolute bottom-[64px] left-1/2 flex -translate-x-1/2 gap-1 rounded-lg p-[5px] sm:bottom-[22px]" style={{ background: "rgba(10,10,11,.8)", border: "1px solid rgba(255,255,255,.1)", backdropFilter: "blur(8px)" }}>
        {STATE_META.map(({ key, label, num }) => {
          const on = hero === key;
          return (
            <button
              key={key}
              className="relative flex cursor-pointer items-baseline gap-1.5 whitespace-nowrap rounded-[5px] px-3 pb-[13px] pt-[11px] sm:gap-[7px] sm:px-[18px]"
              style={{ color: on ? "var(--ink)" : "var(--ink-mute)", background: on ? "rgba(255,255,255,.06)" : "transparent", transition: "color .25s, background .25s" }}
              onClick={() => {
                setHero(key);
                setSel(null);
              }}
            >
              <span className="font-data text-[8.5px] tracking-[.1em]" style={{ color: on ? "var(--torch)" : "var(--ink-faint)" }}>
                {num}
              </span>
              <span className="font-display text-[10px] sm:text-[11px]" style={{ fontWeight: 700, letterSpacing: ".06em" }}>
                {label}
              </span>
              <span className="absolute bottom-[7px] left-3.5 right-3.5 h-0.5 rounded-[1px]" style={{ background: on ? "var(--torch)" : "transparent", boxShadow: on ? "0 0 8px rgba(200,50,43,.6)" : "none", transition: "background .25s" }} />
            </button>
          );
        })}
      </div>

      {/* motion toggle, bottom-right (desktop only) */}
      <div className="absolute bottom-[26px] right-7 hidden items-center gap-2 sm:flex">
        <span className="font-data text-[8.5px] tracking-[.16em]" style={{ color: "var(--ink-faint)" }}>
          MOTION
        </span>
        <div className="flex overflow-hidden rounded-[5px]" style={{ border: "1px solid rgba(255,255,255,.12)" }}>
          {(["cinema", "mech"] as MotionKey[]).map((k) => (
            <button
              key={k}
              className="font-data cursor-pointer px-3 py-2 text-[8.5px] tracking-[.12em]"
              style={{ color: motion === k ? "var(--ink)" : "var(--ink-faint)", background: motion === k ? "rgba(255,255,255,.09)" : "transparent", transition: "all .2s" }}
              onClick={() => setMotion(k)}
            >
              {k === "cinema" ? "CINEMA" : "MECH"}
            </button>
          ))}
        </div>
      </div>

      {/* part panel */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          bottom: 16,
          width: 392,
          maxWidth: "calc(100% - 32px)",
          zIndex: 40,
          background: "linear-gradient(180deg, rgba(26,26,29,.97), rgba(18,18,20,.97))",
          border: "1px solid rgba(255,255,255,.12)",
          borderTopColor: "rgba(255,255,255,.2)",
          borderRadius: 10,
          boxShadow: "0 24px 60px rgba(0,0,0,.6)",
          backdropFilter: "blur(12px)",
          transform: sel ? "translateX(0)" : "translateX(112%)",
          transition: `transform ${M.panel}`,
        }}
      >
        {selPart && <PartPanel part={selPart} onClose={() => setSel(null)} onOpenFull={onOpenFull} />}
      </div>
    </div>
  );
}
