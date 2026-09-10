// game — lightweight on-device gamification. XP, levels, and "mastered" movements.
// You earn XP by stepping through a movement's form (learning it), logging
// workouts, and keeping streaks. No server, no accounts — just momentum you can
// see. Deterministic level curve.
//
// © Ankur Sinha.

const KEY = "crossfit-game-v1";

export interface GameState {
  xp: number;
  masteredMovements: string[];  // movement ids fully stepped-through
  lastActive: string;           // ISO date
}

export const XP = {
  learnMovement: 25,   // stepped through every form step of a movement
  logWorkout: 40,
  hitPR: 60,
  dailyStreak: 15,
} as const;

export function loadGame(): GameState {
  if (typeof window === "undefined") return { xp: 0, masteredMovements: [], lastActive: "" };
  try { return { xp: 0, masteredMovements: [], lastActive: "", ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { return { xp: 0, masteredMovements: [], lastActive: "" }; }
}
export function saveGame(s: GameState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* */ }
}

/** Award XP (idempotent for movement mastery — only counts a movement once). */
export function award(kind: keyof typeof XP, movementId?: string): GameState {
  const s = loadGame();
  if (kind === "learnMovement" && movementId) {
    if (s.masteredMovements.includes(movementId)) return s; // already counted
    s.masteredMovements.push(movementId);
  }
  s.xp += XP[kind];
  s.lastActive = new Date().toISOString().slice(0, 10);
  saveGame(s);
  return s;
}

// Level curve: level N needs 100*N*(N+1)/2 total XP (gentle ramp).
export function levelFor(xp: number): { level: number; into: number; span: number; pct: number; title: string } {
  let level = 1;
  const need = (l: number) => 100 * (l * (l + 1)) / 2;
  while (xp >= need(level)) level++;
  const floor = level === 1 ? 0 : need(level - 1);
  const ceil = need(level);
  const into = xp - floor, span = ceil - floor;
  return { level, into, span, pct: Math.max(0, Math.min(1, into / span)), title: TITLES[Math.min(level - 1, TITLES.length - 1)] };
}

const TITLES = ["Beginner", "Getting Fit", "Consistent", "Strong", "Athlete", "Beast", "Elite", "Legend"];

// "Each workout extends your life." Grounded estimate: large cohort studies
// (e.g. the well-known ~7 min-of-life-per-min-of-exercise finding, and studies
// showing ~150 min/week of activity adds years) put the return of a real session
// at roughly a few hours of life expectancy. We use a deliberately CONSERVATIVE,
// honest figure and label it as an estimate — never a promise.
export const LIFE_MINUTES_PER_WORKOUT = 180; // ~3 hours; conservative, illustrative
export function lifeAdded(workouts: number): { hours: number; days: number } {
  const mins = workouts * LIFE_MINUTES_PER_WORKOUT;
  return { hours: Math.round(mins / 60), days: Math.round((mins / 60 / 24) * 10) / 10 };
}

/** Simple badges derived from state — shown as earned/locked. */
export interface Badge { id: string; label: string; emoji: string; earned: (s: GameState, extra: BadgeCtx) => boolean; hint: string; }
export interface BadgeCtx { streak: number; workouts: number; prs: number; }
export const BADGES: Badge[] = [
  { id: "first-move", label: "First Form", emoji: "🎯", hint: "Learn your first movement", earned: (s) => s.masteredMovements.length >= 1 },
  { id: "five-moves", label: "Form Student", emoji: "📚", hint: "Learn 5 movements", earned: (s) => s.masteredMovements.length >= 5 },
  { id: "all-moves", label: "Movement Master", emoji: "🥋", hint: "Learn every movement", earned: (s) => s.masteredMovements.length >= 9 },
  { id: "first-log", label: "First Sweat", emoji: "💦", hint: "Log your first workout", earned: (_s, e) => e.workouts >= 1 },
  { id: "streak-3", label: "On a Roll", emoji: "🔥", hint: "3-day streak", earned: (_s, e) => e.streak >= 3 },
  { id: "streak-7", label: "Week Warrior", emoji: "⚡", hint: "7-day streak", earned: (_s, e) => e.streak >= 7 },
  { id: "pr", label: "New PR", emoji: "🏆", hint: "Set a personal record", earned: (_s, e) => e.prs >= 1 },
];
