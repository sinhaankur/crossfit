"use client";

import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { ROUTINES, stepMovement, type Routine } from "@/lib/routines";
import { WorkoutTimer } from "@/components/workout-timer";

// /routines — standalone guided warm-up / cool-down / mobility flows you can run
// without a full plan. Injury prevention as its own destination. Pick a routine,
// step through it, each step linking real form + safety.

export default function RoutinesPage() {
  const [active, setActive] = useState<Routine>(ROUTINES[0]);
  return (
    <main className="min-h-dvh">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-5 py-8">
        <p className="font-mono-eyebrow text-[var(--muted)]">move well · stay healthy</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Warm up. Cool down. Loosen up.</h1>
        <p className="mt-2 text-[var(--fg)]/70">Two minutes of prep saves you from the injury that costs you months. Run any of these on their own.</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {ROUTINES.map((r) => (
            <button key={r.id} onClick={() => setActive(r)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${active.id === r.id ? "bg-[var(--accent)] text-white" : "bg-white/5 text-[var(--muted)] hover:text-[var(--fg)]"}`}>
              {r.name}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold">{active.name}</h2>
            <span className="shrink-0 text-xs text-[var(--muted)]">~{active.minutes} min</span>
          </div>
          <p className="mt-1 text-sm text-[var(--fg)]/70">{active.purpose}</p>

          <ol className="mt-4 space-y-3">
            {active.steps.map((s, i) => {
              const mv = stepMovement(s);
              return (
                <li key={i} className="rounded-xl border border-[var(--line)] bg-black/20 p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold"><span className="mr-2 text-[var(--accent)]">{i + 1}</span>{s.label}</p>
                    <span className="shrink-0 text-xs font-medium text-[var(--accent)]">{s.seconds ? `${s.seconds}s` : s.reps}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-[var(--fg)]/80">{s.cue}</p>
                  {mv && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)]">Show form steps</summary>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-[var(--fg)]/80">
                        {mv.steps.map((st, k) => <li key={k}>{st}</li>)}
                      </ol>
                      <p className="mt-1.5 rounded bg-amber-500/10 px-2 py-1 text-[11px] text-amber-200">⚠ {mv.safety}</p>
                    </details>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Timer to run the routine by */}
        <div className="mt-5"><WorkoutTimer /></div>

        <p className="mt-8 text-center text-xs text-[var(--muted)]">Do the warm-up before every session. Never skip it — cold muscles get hurt.</p>
      </div>
    </main>
  );
}
