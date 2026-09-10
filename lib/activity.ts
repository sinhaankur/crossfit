// activity — the single source of truth for "when did I train?". It unifies the
// two places training gets recorded: WOD log entries (lib/wod-log) and plan
// attendance ticks (localStorage keys "crossfit-done:*"). Everything on-device.
// Powers the Today dashboard, the streak counter, and the consistency calendar.
//
// © Ankur Sinha.

import { loadLog } from "./wod-log";

/** All ISO dates (YYYY-MM-DD) on which any training was recorded. */
export function trainedDates(): Set<string> {
  const dates = new Set<string>();
  if (typeof window === "undefined") return dates;

  // 1. WOD log — each entry carries a date.
  for (const w of loadLog()) if (w.date) dates.add(w.date);

  // 2. Plan attendance — keys look like "crossfit-done:goal:body:exp:2x4" whose
  //    value is { "1.2": true, ... }. Those are week.day within a plan, not real
  //    calendar dates, so we can't map them to a day precisely — instead we count
  //    them toward "sessions done" but only the WOD log gives true dates. To still
  //    reflect plan use, we stamp today when the attendance store was last touched
  //    is not reliable; so calendar uses WOD-log dates (real), and totals below
  //    include attendance counts.
  return dates;
}

/** Count of plan sessions marked done across all saved plans (real attendance). */
export function planSessionsDone(): number {
  if (typeof window === "undefined") return 0;
  let n = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith("crossfit-done:")) continue;
    try {
      const v = JSON.parse(localStorage.getItem(k) || "{}");
      n += Object.values(v).filter(Boolean).length;
    } catch { /* skip */ }
  }
  return n;
}

const DAY = 86400000;
function iso(d: Date) { return d.toISOString().slice(0, 10); }

/** Current consecutive-day streak counting back from today (or yesterday, so a
 *  rest day today doesn't break a real streak until it's actually missed). */
export function currentStreak(dates = trainedDates()): number {
  if (dates.size === 0) return 0;
  let streak = 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  // Allow the streak to "hold" if you trained today OR yesterday.
  let cursor = dates.has(iso(today)) ? today : new Date(today.getTime() - DAY);
  while (dates.has(iso(cursor))) { streak++; cursor = new Date(cursor.getTime() - DAY); }
  return streak;
}

/** Days trained in the current calendar month. */
export function daysThisMonth(dates = trainedDates()): number {
  const now = new Date(); const pre = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return [...dates].filter((d) => d.startsWith(pre)).length;
}

/** Days trained in the current week (Mon–Sun). */
export function daysThisWeek(dates = trainedDates()): number {
  const now = new Date(); const day = now.getDay();
  const mon = new Date(now); mon.setDate(now.getDate() - ((day + 6) % 7)); mon.setHours(0, 0, 0, 0);
  return [...dates].filter((d) => new Date(d) >= mon).length;
}

/** A month grid (weeks × 7) of {date, trained, inMonth} for the calendar heatmap. */
export interface CalCell { date: string; trained: boolean; inMonth: boolean; today: boolean; }
export function monthGrid(year: number, month: number, dates = trainedDates()): CalCell[][] {
  const first = new Date(year, month, 1);
  const start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7)); // back to Monday
  const todayIso = iso(new Date());
  const weeks: CalCell[][] = [];
  const cur = new Date(start);
  for (let w = 0; w < 6; w++) {
    const row: CalCell[] = [];
    for (let d = 0; d < 7; d++) {
      const di = iso(cur);
      row.push({ date: di, trained: dates.has(di), inMonth: cur.getMonth() === month, today: di === todayIso });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(row);
    if (cur.getMonth() !== month && w >= 3) break; // stop once we've left the month
  }
  return weeks;
}
