"use client";

import { useState } from "react";
import { MOVEMENTS, type Pattern } from "@/lib/movements";
import { SiteNav } from "@/components/site-nav";
import { CloserLook } from "@/components/closer-look";

// One representative movement per pattern for the "closer look" figure gallery,
// so the demonstrating figure covers every movement family.
const FEATURED = (() => {
  const seen = new Set<Pattern>();
  return MOVEMENTS.filter((m) => (seen.has(m.pattern) ? false : (seen.add(m.pattern), true)));
})();

// The movement library — every exercise with numbered form steps, its safety
// note, and an easier scale. Filterable by pattern. A real reference page.
// (The Blender 3D form view will slot into each card later.)

const PATTERNS: (Pattern | "all")[] = ["all", "squat", "hinge", "push", "pull", "core", "carry", "cardio", "mobility"];

export default function MovementsPage() {
  const [filter, setFilter] = useState<Pattern | "all">("all");
  const shown = filter === "all" ? MOVEMENTS : MOVEMENTS.filter((m) => m.pattern === filter);

  return (
    <main className="min-h-dvh">
      <SiteNav />

      {/* Apple-style "closer look" figure gallery */}
      <div className="py-8">
        <CloserLook movements={FEATURED} />
      </div>

      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="text-3xl font-bold">Movement library</h1>
        <p className="mt-2 text-[var(--fg)]/70">
          Every movement, broken into steps — with the one thing people get wrong (safety) and an
          easier version you can always drop to. Form first, always.
        </p>

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
              <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200">⚠ {m.safety}</p>
              <p className="mt-1.5 text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--fg)]/70">Easier:</span> {m.scale}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
