// wod-log — logging workouts + personal records, on-device. Mirrors Kelo's
// CrossFit.swift vocabulary (WODScoring / WOD / PersonalRecord) so the web app
// and the iOS app speak the same language and data can move between them later.
//
// © Ankur Sinha.

export type WODScoring = "forTime" | "amrap" | "load" | "reps";

export const SCORING_LABEL: Record<WODScoring, string> = {
  forTime: "For time",
  amrap: "AMRAP",
  load: "Load",
  reps: "Reps",
};

export interface WOD {
  id: string;
  date: string;          // ISO YYYY-MM-DD
  name: string;          // "Fran", "Back Squat 5x5", "Row 2k"…
  scoring: WODScoring;
  result: string;        // "3:41", "12 rounds", "80 kg", "220 reps"
  rxd: boolean;          // as prescribed vs scaled
  caloriesBurned?: number; // from a watch (Garmin / Apple), optional
  note?: string;
}

export interface PersonalRecord {
  name: string;
  best: string;
  date: string;
  scoring: WODScoring;
}

const KEY = "crossfit-wodlog-v1";

export function loadLog(): WOD[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function saveLog(log: WOD[]) {
  try { localStorage.setItem(KEY, JSON.stringify(log)); } catch { /* private mode */ }
}

/** Lower-is-better for forTime; higher for the rest — turns a result into a
 *  comparable number so we can find PRs and trends (mirrors Kelo's numericResult). */
export function numericResult(w: WOD): number | null {
  const t = w.result.trim();
  if (w.scoring === "forTime" && t.includes(":")) {
    const [m, s] = t.split(":").map(Number);
    if (Number.isFinite(m) && Number.isFinite(s)) return m * 60 + s;
  }
  const n = parseFloat(t.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** Best result per movement/workout name → the PR board. */
export function personalRecords(log: WOD[]): PersonalRecord[] {
  const byName = new Map<string, WOD[]>();
  for (const w of log) {
    if (!byName.has(w.name)) byName.set(w.name, []);
    byName.get(w.name)!.push(w);
  }
  const prs: PersonalRecord[] = [];
  for (const [name, ws] of byName) {
    const scored = ws.map((w) => ({ w, n: numericResult(w) })).filter((x) => x.n != null) as { w: WOD; n: number }[];
    if (!scored.length) continue;
    const lowerBetter = ws[0].scoring === "forTime";
    scored.sort((a, b) => (lowerBetter ? a.n - b.n : b.n - a.n));
    const best = scored[0].w;
    prs.push({ name, best: best.result, date: best.date, scoring: best.scoring });
  }
  return prs.sort((a, b) => a.name.localeCompare(b.name));
}

export function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

/** Export the whole log as JSON — the file Kelo (or a backup) can re-import. */
export function exportLog(log: WOD[]): string {
  return JSON.stringify({ app: "crossfit.sinhaankur.com", version: 1, exportedAt: new Date().toISOString(), wods: log }, null, 2);
}
