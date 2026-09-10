// strength — the body-BUILDING engine: 1-rep-max estimation, percentage-based
// working weights, and progressive strength cycles. This is what makes the app
// "build the body," not just general fitness. All on-device, deterministic.
//
// © Ankur Sinha.

/** The core barbell lifts we program percentages against. */
export type Lift = "back-squat" | "deadlift" | "shoulder-press" | "bench-press" | "clean" | "front-squat";

export const LIFT_LABEL: Record<Lift, string> = {
  "back-squat": "Back Squat",
  "deadlift": "Deadlift",
  "shoulder-press": "Shoulder Press",
  "bench-press": "Bench Press",
  "clean": "Power Clean",
  "front-squat": "Front Squat",
};

/** Estimate a 1-rep-max from a weight lifted for N reps (Epley formula — the
 *  standard). Reps beyond ~10 get unreliable, so we cap the estimate window. */
export function estimate1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  if (reps === 1) return weight;
  const r = Math.min(reps, 12);
  return Math.round(weight * (1 + r / 30));
}

/** Working weight = a percentage of the 1RM, rounded to the nearest 2.5 (kg or
 *  lb plate math). */
export function workingWeight(oneRM: number, pct: number, round = 2.5): number {
  return Math.round((oneRM * pct) / round) * round;
}

export interface StrengthSet {
  reps: number;
  pct: number;      // of 1RM
  weight: number;   // computed working weight
}

export interface LiftDay {
  lift: Lift;
  scheme: string;               // "5×5", "5/3/1"…
  sets: StrengthSet[];
  note: string;
}

/** A classic linear 5×5 wave that RISES week to week — real progressive
 *  overload. Week 1 sits ~75% and climbs; deload isn't needed in a short block.
 *  If no 1RM is known, returns rep targets with an "add weight when smooth" note. */
export function fiveByFive(lift: Lift, oneRM: number | null, week: number, weeks: number): LiftDay {
  const t = weeks <= 1 ? 0 : (week - 1) / (weeks - 1);
  const pct = 0.72 + t * 0.13; // 72% → 85% across the block
  if (!oneRM || oneRM <= 0) {
    return {
      lift, scheme: "5 × 5",
      sets: Array.from({ length: 5 }, () => ({ reps: 5, pct, weight: 0 })),
      note: "No 1RM logged yet — pick a weight you can do 5×5 with 2 reps in reserve, and add a little each week. Log a lift on the Log tab to get exact weights.",
    };
  }
  const w = workingWeight(oneRM, pct);
  return {
    lift, scheme: "5 × 5",
    sets: Array.from({ length: 5 }, () => ({ reps: 5, pct: Math.round(pct * 100) / 100, weight: w })),
    note: `Work sets at ${Math.round(pct * 100)}% of your ${oneRM} 1RM. Only go up next week if all 5×5 were clean. Rest 2–3 min between heavy sets.`,
  };
}

/** A hypertrophy day for a body part — moderate %, higher reps, more volume:
 *  the "build muscle" stimulus. */
export function hypertrophy(lift: Lift, oneRM: number | null, week: number, weeks: number): LiftDay {
  const t = weeks <= 1 ? 0 : (week - 1) / (weeks - 1);
  const pct = 0.62 + t * 0.08; // 62% → 70%, higher reps
  const sets = 4;
  const reps = 10;
  const w = oneRM ? workingWeight(oneRM, pct) : 0;
  return {
    lift, scheme: `${sets} × ${reps}`,
    sets: Array.from({ length: sets }, () => ({ reps, pct: Math.round(pct * 100) / 100, weight: w })),
    note: oneRM
      ? `${sets}×${reps} at ~${Math.round(pct * 100)}% — chase the muscle pump with controlled reps, ~90s rest. Add weight when ${reps} feels easy.`
      : `${sets}×${reps} at a weight that's hard by the last 2 reps but keeps good form.`,
  };
}

/** Store of the user's known 1RMs (on-device), keyed by lift. */
const KEY = "crossfit-1rm-v1";
export type OneRMs = Partial<Record<Lift, number>>;
export function loadOneRMs(): OneRMs {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
export function saveOneRMs(v: OneRMs) {
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* private mode */ }
}
