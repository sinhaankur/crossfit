// benchmarks — the named CrossFit benchmark WODs ("The Girls" + Hero WODs).
// Public, well-known workouts. Each carries how it's scored + a scale note so a
// newcomer can attempt it safely (they're famously brutal RX'd).
//
// © Ankur Sinha. Standard published CrossFit benchmarks.

import type { WODScoring } from "./wod-log";

export interface Benchmark {
  name: string;
  kind: "girls" | "hero";
  scoring: WODScoring;
  description: string[];   // the movements/rounds
  scale: string;           // how to make it safe/doable
  timerHint: "stopwatch" | "countdown" | "interval";
}

export const BENCHMARKS: Benchmark[] = [
  {
    name: "Fran", kind: "girls", scoring: "forTime",
    description: ["21-15-9 reps, for time:", "Thrusters (barbell)", "Pull-ups"],
    scale: "Lighter thrusters (or dumbbells), ring rows instead of pull-ups. Aim to finish, not to match a time.",
    timerHint: "stopwatch",
  },
  {
    name: "Cindy", kind: "girls", scoring: "amrap",
    description: ["20-min AMRAP:", "5 pull-ups", "10 push-ups", "15 air squats"],
    scale: "Ring rows, knee push-ups, squat to a box. Great first benchmark — go steady.",
    timerHint: "countdown",
  },
  {
    name: "Annie", kind: "girls", scoring: "forTime",
    description: ["50-40-30-20-10 reps, for time:", "Double-unders", "Sit-ups"],
    scale: "Single-unders (or line hops) ×2, and an anchored/knee sit-up.",
    timerHint: "stopwatch",
  },
  {
    name: "Grace", kind: "girls", scoring: "forTime",
    description: ["30 clean & jerks, for time (barbell)"],
    scale: "Light barbell or dumbbells; break into small sets. Form over speed — this one tempts bad reps.",
    timerHint: "stopwatch",
  },
  {
    name: "Murph", kind: "hero", scoring: "forTime",
    description: ["For time:", "1-mile run", "100 pull-ups", "200 push-ups", "300 air squats", "1-mile run", "(partition the middle however you like)"],
    scale: "Half Murph, ring rows, knee push-ups, and jog/walk the runs. Build to it over weeks — do NOT attempt full Murph cold.",
    timerHint: "stopwatch",
  },
  {
    name: "Cindy XX", kind: "hero", scoring: "amrap",
    description: ["A gentler on-ramp to Cindy — 10-min AMRAP:", "5 ring rows", "10 knee push-ups", "15 box squats"],
    scale: "This IS the scale — a safe first taste of an AMRAP.",
    timerHint: "countdown",
  },
];
