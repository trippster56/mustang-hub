"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const from = params.get("from") || "/";
      router.replace(from.startsWith("/") ? from : "/");
      router.refresh();
    } else {
      setError(true);
      setBusy(false);
      setPassword("");
    }
  }

  return (
    <main
      className="flex min-h-[100dvh] items-center justify-center px-4"
      style={{ background: "radial-gradient(ellipse 70% 55% at 50% 40%, #141416 0%, #0B0B0C 55%, #060607 100%)" }}
    >
      <div
        className="w-full max-w-[380px] rounded-xl p-8"
        style={{ background: "var(--stage)", border: "1px solid rgba(255,255,255,.12)", borderTopColor: "rgba(255,255,255,.2)", boxShadow: "0 24px 60px rgba(0,0,0,.6)" }}
      >
        <div className="font-data text-[9px] tracking-[.22em]" style={{ color: "var(--ink-mute)" }}>
          2008 · 4.0L V6 · S197
        </div>
        <h1 className="font-display mt-2 text-[26px] leading-none" style={{ letterSpacing: ".04em" }}>
          MUSTANG HUB
        </h1>
        <p className="mt-3 text-[12.5px] leading-[1.6]" style={{ color: "var(--ink-mute)" }}>
          Private garage. Enter the password to continue.
        </p>

        <form onSubmit={submit} className="mt-6">
          <label className="font-data text-[8.5px] tracking-[.18em]" style={{ color: "var(--ink-faint)" }}>
            PASSWORD
          </label>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="font-data mt-1.5 w-full rounded-md px-3 py-2.5 text-[14px] outline-none"
            style={{
              background: "linear-gradient(180deg,#08080A,#0D0D0F)",
              border: `1px solid ${error ? "rgba(255,69,58,.5)" : "rgba(255,255,255,.12)"}`,
              color: "var(--ink)",
            }}
          />
          {error && (
            <div className="font-data mt-2 text-[10px] tracking-[.1em]" style={{ color: "#FFB4AE" }}>
              INCORRECT PASSWORD
            </div>
          )}
          <button
            type="submit"
            disabled={busy || !password}
            className="font-data mt-4 w-full cursor-pointer rounded-md py-3 text-[11px] tracking-[.16em] text-white disabled:opacity-50"
            style={{ background: "var(--torch)" }}
          >
            {busy ? "CHECKING…" : "ENTER GARAGE"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
