"use client";

import { BENCHMARKS } from "@/lib/benchmarks";
import { SCORING_LABEL } from "@/lib/wod-log";
import { SiteNav } from "@/components/site-nav";
import { WorkoutTimer } from "@/components/workout-timer";

// Benchmark WODs — the famous named workouts (The Girls + Hero WODs), each with
// how it's scored and a SAFE scale (they're brutal RX'd). The timer sits on top.
// Log a result on /log to track it over time.

export default function BenchmarksPage() {
  const girls = BENCHMARKS.filter((b) => b.kind === "girls");
  const heroes = BENCHMARKS.filter((b) => b.kind === "hero");

  return (
    <main className="min-h-dvh">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="text-3xl font-bold">Benchmark WODs</h1>
        <p className="mt-2 text-[var(--fg)]/70">
          The classic named workouts. They&rsquo;re famously hard as prescribed — every one has a
          scale so you can attempt it safely and beat your own time later. Log your result on the
          Log tab to track it.
        </p>

        <div className="mt-5"><WorkoutTimer /></div>

        <Section title="The Girls" list={girls} />
        <Section title="Hero WODs" list={heroes} />

        <p className="mt-8 text-center text-xs text-[var(--muted)]">
          Scale freely. Never attempt a full Hero WOD (like Murph) cold — build to it over weeks.
        </p>
      </div>
    </main>
  );
}

function Section({ title, list }: { title: string; list: typeof BENCHMARKS }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">{title}</h2>
      <div className="mt-3 space-y-4">
        {list.map((b) => (
          <div key={b.name} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-lg font-bold">{b.name}</h3>
              <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-[var(--muted)]">{SCORING_LABEL[b.scoring]}</span>
            </div>
            <div className="mt-2 space-y-0.5 text-sm text-[var(--fg)]/85">
              {b.description.map((d, i) => <p key={i}>{d}</p>)}
            </div>
            <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              <span className="font-semibold">Scale:</span> {b.scale}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
