// wellbeing — the MENTAL side of "health AND mental". A gentle daily check-in
// (mood · energy · stress), stored ON-DEVICE, that feeds a simple day-state and
// a kind, deterministic suggestion (rest / breathe / train). No account, no
// server, no model — a tinyLLM would only voice it. Tone is spacious and
// non-judgmental (Vera-adjacent): this is a companion, not a scold.
//
// © Ankur Sinha.

export type Mood = 1 | 2 | 3 | 4 | 5;       // 1 low … 5 great
export type Energy = 1 | 2 | 3;             // low · okay · high
export type Stress = 1 | 2 | 3;            // calm · some · high

export interface Checkin {
  date: string;      // YYYY-MM-DD (local)
  mood: Mood;
  energy: Energy;
  stress: Stress;
  note?: string;
}

const KEY = "kelo-wellbeing-v1";

export const MOOD_FACE: Record<Mood, string> = { 1: "😔", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };
export const MOOD_WORD: Record<Mood, string> = { 1: "Low", 2: "Meh", 3: "Okay", 4: "Good", 5: "Great" };
export const ENERGY_WORD: Record<Energy, string> = { 1: "Low energy", 2: "Okay", 3: "High energy" };
export const STRESS_WORD: Record<Stress, string> = { 1: "Calm", 2: "Some stress", 3: "Stressed" };

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function loadCheckins(): Checkin[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function saveCheckin(c: Checkin): Checkin[] {
  const all = loadCheckins().filter((x) => x.date !== c.date); // one per day (latest wins)
  all.push(c);
  all.sort((a, b) => a.date.localeCompare(b.date));
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* private mode — in-memory only */ }
  return all;
}

export function todayCheckin(): Checkin | null {
  const t = todayKey();
  return loadCheckins().find((c) => c.date === t) ?? null;
}

// How many days in a row the person has checked in (a gentle streak, separate
// from the training streak — showing up for yourself counts too).
export function checkinStreak(all = loadCheckins()): number {
  if (all.length === 0) return 0;
  const set = new Set(all.map((c) => c.date));
  let n = 0;
  const d = new Date();
  // allow today OR yesterday as the anchor so an evening check-in still counts.
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1);
  while (set.has(todayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export type DayAdvice = {
  tone: "rest" | "gentle" | "go";
  title: string;
  body: string;
  cta: { label: string; href: string } | null;
};

// The kind, deterministic read of today's check-in → what would serve you.
// High stress or very low mood/energy → breathe + move gently, not a hard WOD.
// Solid across the board → you're clear to train. Always encouraging, never a
// diagnosis; movement is offered, never demanded.
export function adviseFor(c: Checkin | null): DayAdvice {
  if (!c) {
    return {
      tone: "gentle",
      title: "How are you, really?",
      body: "A quick check-in helps the day fit you — some days are for pushing, some for breathing.",
      cta: null,
    };
  }
  if (c.stress >= 3 || c.mood <= 2 || c.energy <= 1) {
    return {
      tone: "rest",
      title: "Go gently today",
      body: "You're carrying a lot. A few slow breaths and some easy movement will do more than a hard session — and that's not falling behind, it's training smart.",
      cta: { label: "Breathe for a minute", href: "/breathe" },
    };
  }
  if (c.stress === 2 || c.mood === 3 || c.energy === 2) {
    return {
      tone: "gentle",
      title: "Ease in",
      body: "A middling day. Start with a warm-up and see how you feel — permission to keep it light, or to build if the body wakes up.",
      cta: { label: "Warm up & mobilise", href: "/routines" },
    };
  }
  return {
    tone: "go",
    title: "Good to go",
    body: "Mood up, stress low, energy there. A strong day to train — enjoy it, and still leave a rep or two in the tank.",
    cta: { label: "Today's movements", href: "/movements" },
  };
}
