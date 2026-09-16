"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  recentSeries, moodTrend, averageMood, MOOD_FACE,
  type DaySeriesPoint,
} from "@/lib/wellbeing";

// MoodHistory — a calm 14-day strip of how you've been. Feelings become a
// picture, never a leaderboard. Logged days show their mood colour; gaps stay
// quiet. All local. Renders nothing until there's at least one check-in, so it
// never nags an empty state. Listens for "kelo-checkin" to refresh live.

const MOOD_COLOR: Record<number, string> = {
  1: "rgba(120,140,170,0.5)", 2: "rgba(120,160,210,0.6)",
  3: "rgba(90,170,230,0.7)", 4: "rgba(63,140,255,0.85)", 5: "rgba(63,140,255,1)",
};

export function MoodHistory() {
  const [series, setSeries] = useState<DaySeriesPoint[]>([]);
  const [trend, setTrend] = useState<ReturnType<typeof moodTrend>>("new");
  const [avg, setAvg] = useState<number | null>(null);

  function refresh() {
    setSeries(recentSeries(14));
    setTrend(moodTrend(14));
    setAvg(averageMood(14));
  }
  useEffect(() => {
    refresh();
    const on = () => refresh();
    window.addEventListener("kelo-checkin", on);
    return () => window.removeEventListener("kelo-checkin", on);
  }, []);

  const logged = series.filter((p) => p.checkin).length;
  if (logged === 0) return null;

  const trendLabel =
    trend === "up" ? "Lifting" : trend === "down" ? "Dipping" : trend === "steady" ? "Steady" : "Building a picture";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono-eyebrow text-[var(--muted)]">Last 14 days</p>
        <span className="flex items-center gap-1 text-xs font-semibold text-[var(--muted)]">
          <TrendIcon className="h-3.5 w-3.5 text-[var(--accent)]" /> {trendLabel}
          {avg != null && <span className="ml-1 text-[var(--fg)]/60">avg {MOOD_FACE[Math.round(avg) as 1 | 2 | 3 | 4 | 5]}</span>}
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-1">
        {series.map((p) => {
          const m = p.checkin?.mood ?? 0;
          const h = m ? 8 + m * 8 : 4; // 16–48px logged; 4px gap
          return (
            <div key={p.date} className="flex flex-1 flex-col items-center gap-1" title={p.date}>
              <div className="w-full rounded-md transition-all"
                style={{ height: h, background: m ? MOOD_COLOR[m] : "rgba(255,255,255,0.06)" }} />
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-[var(--muted)]">
        Showing up for yourself counts. Some days are lower — that's information, not failure.
      </p>
    </div>
  );
}
