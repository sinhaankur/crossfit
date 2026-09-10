// plan-engine — the deterministic heart of the app. Takes an honest profile
// (body type, goal, diet, experience, equipment, days/week) and produces a SAFE,
// PROGRESSIVE, step-by-step plan. No AI, no server, no key — same input always
// gives the same plan, so it's honest and reproducible.
//
// Principles baked in (from Ankur's ethos + safety):
//  · Consistency over extremes — even 2 short days/week keeps you healthy.
//  · Safety first — conservative defaults, every movement carries form + a scale,
//    warm-up + cool-down every session, and clear "stop if…" guidance.
//  · Progressive overload — load/volume BUILD week over week, never jump.
//  · Always show the steps — the plan renders each movement's cues, not just names.
//
// © Ankur Sinha.

import { MOVEMENTS, MOVEMENT_BY_ID, type Movement, type Equipment, type Pattern } from "./movements";

export type BodyType = "ectomorph" | "mesomorph" | "endomorph" | "unsure";
export type Goal = "general-health" | "lose-fat" | "build-muscle" | "endurance" | "strength";
export type Diet = "balanced" | "high-protein" | "vegetarian" | "vegan" | "low-carb" | "unsure";
export type Experience = "brand-new" | "returning" | "regular";

export interface Profile {
  bodyType: BodyType;
  goal: Goal;
  diet: Diet;
  experience: Experience;
  equipment: Equipment[];
  /** Realistic days per week (1–6). We honour "8 workouts a month" = ~2/wk. */
  daysPerWeek: number;
  /** Weeks the plan runs (progressive overload across them). */
  weeks: number;
}

export interface PlannedMovement {
  movement: Movement;
  prescription: string; // e.g. "3 × 8–10" or "3 × 30s" — scales up over weeks
}

export interface Session {
  day: number;          // 1..7 within the week
  label: string;        // "Day 1 · Full body"
  focus: string;        // human focus line
  warmup: string[];     // 2–3 mobility/cardio primers
  work: PlannedMovement[];
  cooldown: string[];
  reminder: string;     // what to do next (rest / next session)
  estMinutes: number;
}

export interface WeekPlan {
  week: number;
  intent: string;       // how this week progresses on the last
  sessions: Session[];
}

export interface Plan {
  profile: Profile;
  summary: string;
  safety: string[];     // always-shown safety rules
  nutrition: string[];  // diet-aware, non-prescriptive guidance
  weeks: WeekPlan[];
  progressionNote: string;
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

function has(profile: Profile, eq: Equipment) {
  return eq === "none" || profile.equipment.includes(eq);
}

/** Movements the user can actually do (equipment + experience-appropriate). */
function availableByPattern(profile: Profile, pattern: Pattern): Movement[] {
  const maxIntensity =
    profile.experience === "brand-new" ? 1 :
    profile.experience === "returning" ? 2 : 3;
  const rank = { gentle: 1, moderate: 2, spicy: 3 } as const;
  return MOVEMENTS.filter(
    (m) => m.pattern === pattern &&
      m.needs.every((n) => has(profile, n)) &&
      rank[m.intensity] <= maxIntensity,
  );
}

function pick(list: Movement[], seed: number): Movement | null {
  if (list.length === 0) return null;
  return list[seed % list.length];
}

/** Rep/time prescription that BUILDS over the weeks (progressive overload). */
function prescribe(m: Movement, week: number, weeks: number, goal: Goal): string {
  const isHold = m.id === "plank" || m.id === "hollow-hold";
  const isCardio = m.pattern === "cardio";
  // progression factor 0..1 across the plan
  const t = weeks <= 1 ? 0 : (week - 1) / (weeks - 1);
  if (isCardio) {
    const mins = Math.round(6 + t * 6); // 6 → 12 min
    return `${mins} min, easy–moderate (build the pace, don't sprint cold)`;
  }
  if (isHold) {
    const secs = Math.round(20 + t * 25); // 20s → 45s
    return `3 sets × ${secs}s hold (stop early if form breaks)`;
  }
  // strength/hypertrophy rep ranges by goal, with volume creeping up weekly
  const base =
    goal === "strength" ? { sets: 3, lo: 4, hi: 6 } :
    goal === "build-muscle" ? { sets: 3, lo: 8, hi: 12 } :
    goal === "endurance" ? { sets: 3, lo: 12, hi: 15 } :
    { sets: 3, lo: 8, hi: 10 };
  const extraSet = t > 0.6 ? 1 : 0; // add a set in the back half of the plan
  return `${base.sets + extraSet} sets × ${base.lo}–${base.hi} reps (add a little weight only when all reps feel controlled)`;
}

const WARMUPS = [
  "2 min easy movement — march in place, arm circles, get warm.",
  "Cat–Cow × 8 slow reps (see steps).",
  "World's Greatest Stretch × 3 each side (see steps).",
  "10 slow air squats to open the hips.",
];
const COOLDOWNS = [
  "2–3 min easy walk to bring your heart rate down.",
  "Cat–Cow × 6, breathing slowly.",
  "Gentle full-body stretch for anything that worked hard today. Hydrate.",
];

/* ── the plan builder ────────────────────────────────────────────────────── */

export function buildPlan(profile: Profile): Plan {
  const days = Math.max(1, Math.min(6, profile.daysPerWeek));
  const weeks = Math.max(1, Math.min(12, profile.weeks));

  // Session templates rotate the movement patterns so nothing is overworked and
  // there's built-in recovery between hard days.
  const dayPatterns: Pattern[][] =
    days <= 2 ? [["squat", "push", "core"], ["hinge", "pull", "cardio"]] :
    days === 3 ? [["squat", "push", "core"], ["hinge", "pull", "cardio"], ["squat", "carry", "core"]] :
    [["squat", "push", "core"], ["hinge", "pull", "cardio"], ["push", "core", "carry"], ["squat", "hinge", "cardio"], ["pull", "core", "mobility"], ["cardio", "carry", "mobility"]];

  const weekPlans: WeekPlan[] = [];
  for (let w = 1; w <= weeks; w++) {
    const sessions: Session[] = [];
    for (let d = 0; d < days; d++) {
      const patterns = dayPatterns[d % dayPatterns.length];
      const work: PlannedMovement[] = [];
      patterns.forEach((pat, i) => {
        const options = availableByPattern(profile, pat);
        const m = pick(options, w + d + i);
        if (m) work.push({ movement: m, prescription: prescribe(m, w, weeks, profile.goal) });
      });
      const est = 20 + work.length * 6; // warm-up + work + cool-down, minutes
      sessions.push({
        day: d + 1,
        label: `Day ${d + 1} · ${patterns.map(cap).join(" · ")}`,
        focus: focusLine(patterns, profile.goal),
        warmup: WARMUPS.slice(0, 3),
        work,
        cooldown: COOLDOWNS,
        reminder: d + 1 < days
          ? "Next session in 1–2 days. Rest days are when you get stronger — don't skip them."
          : "That's the week. Take 1–2 easy days, sleep well, eat enough protein — then next week builds on this.",
        estMinutes: est,
      });
    }
    weekPlans.push({
      week: w,
      intent: weekIntent(w, weeks),
      sessions,
    });
  }

  return {
    profile,
    summary: summaryLine(profile, days, weeks),
    safety: SAFETY_RULES,
    nutrition: nutritionFor(profile),
    weeks: weekPlans,
    progressionNote:
      "This plan gets a little harder each week — a touch more volume, then slightly more weight. Only add load when every rep of the current weight feels smooth and painless. Slow and steady beats hurt.",
  };
}

/* ── copy generators ─────────────────────────────────────────────────────── */

const SAFETY_RULES = [
  "Warm up every session and cool down after — never skip it. Cold muscles get hurt.",
  "Form before weight, always. If your form breaks, the weight is too heavy or you're too tired — stop the set.",
  "Start lighter than you think. You can always add next week; you can't un-tweak a back.",
  "Sharp pain (not muscle burn) = stop. Never train through joint or back pain.",
  "New to this, pregnant, or have a health condition/injury? Talk to a doctor or a coach before starting.",
  "Every movement here has a SCALE — an easier version. Use it freely; scaling is smart, not weak.",
];

function summaryLine(p: Profile, days: number, weeks: number) {
  const perMonth = days * 4;
  return `A ${weeks}-week plan, ${days} day${days === 1 ? "" : "s"}/week (~${perMonth} workouts/month) built for ${goalWord(p.goal)}. Consistency is the whole game — even a couple of solid days a week keeps you healthy. It builds gradually so you get stronger without getting hurt.`;
}

function weekIntent(w: number, weeks: number) {
  if (w === 1) return "Week 1 — learn the movements, keep it light, groove the form. This is your baseline.";
  if (w === weeks) return `Week ${w} — the peak of this block. Slightly more volume/weight than week 1, but only if it stays smooth.`;
  return `Week ${w} — a small step up from last week. Add a rep or a touch of weight only where it feels controlled.`;
}

function focusLine(patterns: Pattern[], goal: Goal) {
  return `${patterns.map(cap).join(", ")} — aimed at ${goalWord(goal)}.`;
}

function goalWord(g: Goal) {
  return g === "general-health" ? "everyday health & energy" :
    g === "lose-fat" ? "leaning out & conditioning" :
    g === "build-muscle" ? "building muscle" :
    g === "endurance" ? "your engine (endurance)" :
    "getting stronger";
}

function nutritionFor(p: Profile): string[] {
  const base = [
    "Eat mostly whole foods — protein, vegetables, some carbs, healthy fats. Nothing extreme.",
    "Protein matters most for recovery: aim for a palm of protein at each meal.",
    "Drink water through the day, especially around training.",
  ];
  const byGoal =
    p.goal === "lose-fat" ? "For fat loss: a small, sustainable calorie deficit — not starvation. Keep protein high so you keep muscle." :
    p.goal === "build-muscle" ? "To build muscle: eat a little MORE than maintenance, with plenty of protein. Under-eating stalls gains." :
    p.goal === "endurance" ? "For endurance: don't fear carbs — they fuel the engine. Eat around your longer sessions." :
    p.goal === "strength" ? "For strength: eat enough overall and prioritise protein; strength is built on recovery." :
    "For general health: regular, balanced meals beat any fad.";
  const byDiet =
    p.diet === "vegetarian" ? "Vegetarian: hit protein with dairy, eggs, legumes, tofu, paneer, Greek yogurt." :
    p.diet === "vegan" ? "Vegan: combine legumes, tofu/tempeh, soy, seitan, and consider a B12 source." :
    p.diet === "low-carb" ? "Low-carb: fine — just make sure you have enough energy to train; add carbs around workouts if you feel flat." :
    p.diet === "high-protein" ? "High-protein: you're set for recovery — round it out with veg and enough carbs to train hard." :
    "";
  const byBody =
    p.bodyType === "ectomorph" ? "Naturally lean? You likely need to eat more than you think to build." :
    p.bodyType === "endomorph" ? "Gain easily? Focus on protein + veg volume and steady portions." :
    "";
  return [...base, byGoal, byDiet, byBody].filter(Boolean).concat(
    "This is general guidance, not medical or dietary advice — see a professional for anything specific.",
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export { MOVEMENT_BY_ID };
