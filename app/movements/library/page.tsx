"use client";

import { useState } from "react";
import { MOVEMENTS, type Pattern } from "@/lib/movements";
import { SiteNav } from "@/components/site-nav";
import { ShieldAlert } from "lucide-react";

// The full filterable reference — every movement with steps, safety, scale, and
// muscles. Lives off the single-screen trainer so that stays uncluttered.

const PATTERNS: (Pattern | "all")[] = ["all", "squat", "hinge", "push", "pull", "core", "carry", "cardio", "mobility"];

export default function MovementLibraryPage() {
  const [filter, setFilter] = useState<Pattern | "all">("all");
  const shown = filter === "all" ? MOVEMENTS : MOVEMENTS.filter((m) => m.pattern === filter);
  return (
    <main className="min-h-dvh">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-5 py-8">
        <p className="font-mono-eyebrow text-[var(--muted)]">reference</p>
        <h1 className="mt-2 text-3xl font-bold">Every movement.</h1>
        <p className="mt-2 text-[var(--fg)]/70">Steps, the one thing people get wrong, an easier version, and the muscles it builds. Form first, always.</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {PATTERNS.map((p) => (
            <button key={p} onClick={() => setFilter(p)}
              className={`rounded-full border px-3.5 py-1.5 text-sm capitalize transition ${filter === p ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/15 text-[var(--muted)] hover:border-white/40"}`}>
              {p}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {shown.map((m) => (
            <div key={m.id} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-bold">{m.name}</h2>
                <span className="shrink-0 text-xs uppercase tracking-wide text-[var(--muted)]">{m.pattern} · {m.intensity}</span>
              </div>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--fg)]/85">
                {m.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {m.primary.map((mu) => <span key={mu} className="rounded-full bg-[var(--accent)]/20 px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">{mu}</span>)}
                {m.secondary.map((mu) => <span key={mu} className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-[var(--muted)]">{mu}</span>)}
              </div>
              <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> {m.safety}</p>
              <p className="mt-1.5 text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--fg)]/70">Easier:</span> {m.scale}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
