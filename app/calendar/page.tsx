"use client";

import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { trainedDates, currentStreak, daysThisMonth, monthGrid, type CalCell } from "@/lib/activity";

// /calendar — the consistency view. A month heatmap of days trained + a streak
// counter. Serves the ethos: consistency over extremes, made visible.

const DOW = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function CalendarPage() {
  const [ref, setRef] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [grid, setGrid] = useState<CalCell[][]>([]);
  const [streak, setStreak] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    const dates = trainedDates();
    setGrid(monthGrid(ref.y, ref.m, dates));
    setStreak(currentStreak(dates));
    setMonthCount([...dates].filter((d) => d.startsWith(`${ref.y}-${String(ref.m + 1).padStart(2, "0")}`)).length);
    setTotalDays(dates.size);
    // refresh "this month" only when viewing the real current month
    setMonthCount((c) => (ref.y === new Date().getFullYear() && ref.m === new Date().getMonth()) ? daysThisMonth(dates) : c);
  }, [ref]);

  function shift(delta: number) {
    setRef((r) => { const d = new Date(r.y, r.m + delta, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  }

  return (
    <main className="min-h-dvh">
      <SiteNav />
      <div className="mx-auto max-w-2xl px-5 py-8">
        <p className="font-mono-eyebrow text-[var(--muted)]">consistency</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Show up. It adds up.</h1>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat n={streak} label="Day streak" unit="🔥" accent />
          <Stat n={monthCount} label="This month" />
          <Stat n={totalDays} label="All-time days" />
        </div>

        <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
          <div className="flex items-center justify-between">
            <button onClick={() => shift(-1)} className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-[var(--muted)] hover:text-[var(--fg)]">‹</button>
            <p className="font-bold">{MONTHS[ref.m]} {ref.y}</p>
            <button onClick={() => shift(1)} className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-[var(--muted)] hover:text-[var(--fg)]">›</button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
            {DOW.map((d, i) => <div key={i} className="text-[11px] font-semibold text-[var(--muted)]">{d}</div>)}
            {grid.flat().map((c, i) => (
              <div key={i}
                title={c.date}
                className={`aspect-square rounded-md text-[11px] font-medium leading-[2.2] transition
                  ${!c.inMonth ? "opacity-25" : ""}
                  ${c.trained ? "bg-[var(--accent)] text-white" : "bg-white/[0.05] text-[var(--muted)]"}
                  ${c.today ? "ring-2 ring-white/60" : ""}`}>
                {new Date(c.date).getDate()}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[var(--muted)]">
            <span className="inline-block h-3 w-3 rounded bg-white/[0.05]" /> rest
            <span className="ml-3 inline-block h-3 w-3 rounded bg-[var(--accent)]" /> trained
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[var(--muted)]">
          Trained days come from your logged workouts. Even a couple of solid days a week keeps you healthy — that&rsquo;s the whole game.
        </p>
      </div>
    </main>
  );
}

function Stat({ n, label, unit, accent }: { n: number; label: string; unit?: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
      <p className={`text-3xl font-bold tabular-nums ${accent ? "text-[var(--accent)]" : ""}`}>{n}{unit && <span className="ml-1 text-lg">{unit}</span>}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
