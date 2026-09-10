// body — measure & track the body over time, and SET GOALS. On-device. This is
// the "see the body change" layer: bodyweight + key measurements logged with
// dates, plus goals (a target lift, a target weight, a target measurement) with
// progress. Deterministic; no server.
//
// © Ankur Sinha.

export interface BodyEntry {
  date: string;          // ISO YYYY-MM-DD
  weight?: number;       // kg or lb (user's unit, unlabelled — their call)
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  note?: string;
}

export type GoalKind = "lift" | "weight" | "measurement" | "habit";

export interface Goal {
  id: string;
  kind: GoalKind;
  label: string;         // "Back Squat 100kg", "Waist 32in", "Train 3×/week"
  target: number;
  current: number;
  unit?: string;         // "kg", "in", "×/week"
  createdAt: string;
  done: boolean;
}

const BODY_KEY = "crossfit-body-v1";
const GOAL_KEY = "crossfit-goals-v1";

export function loadBody(): BodyEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(BODY_KEY) || "[]"); } catch { return []; }
}
export function saveBody(v: BodyEntry[]) {
  try { localStorage.setItem(BODY_KEY, JSON.stringify(v)); } catch { /* */ }
}
export function loadGoals(): Goal[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(GOAL_KEY) || "[]"); } catch { return []; }
}
export function saveGoals(v: Goal[]) {
  try { localStorage.setItem(GOAL_KEY, JSON.stringify(v)); } catch { /* */ }
}

/** Progress 0..1 toward a goal — direction-aware (a waist goal counts DOWN,
 *  a squat goal counts UP). We infer direction from target vs the first current. */
export function goalProgress(g: Goal): number {
  if (g.target === g.current) return g.done ? 1 : 0;
  // For "lose" goals (target < a higher current) progress rises as current falls.
  // Simplest honest model: fraction of the way from a sensible start to target.
  const p = g.kind === "measurement" || (g.kind === "weight" && g.target < g.current)
    ? clamp01((startFor(g) - g.current) / (startFor(g) - g.target))
    : clamp01(g.current / g.target);
  return Number.isFinite(p) ? p : 0;
}
function startFor(g: Goal) {
  // A reasonable baseline so a fresh goal shows some progress room.
  return g.kind === "measurement" || (g.kind === "weight" && g.target < g.current)
    ? g.current * 1.15
    : 0;
}
function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }

export function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

/** Trend for a numeric field across entries (oldest→newest), for a sparkline. */
export function trend(entries: BodyEntry[], field: keyof BodyEntry): number[] {
  return entries
    .filter((e) => typeof e[field] === "number")
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => e[field] as number);
}
