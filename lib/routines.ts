// routines — standalone guided flows you can run WITHOUT a full plan: a warm-up,
// a cool-down, and a "stiff today?" mobility reset. Injury prevention as its own
// destination. Each step references a real movement (with its form + safety) or a
// simple timed cue. Deterministic, on-device.
//
// © Ankur Sinha.

import { MOVEMENT_BY_ID } from "./movements";

export interface RoutineStep {
  /** Optional movement id — pulls in its steps/safety/scale. */
  movementId?: string;
  label: string;
  /** Seconds to hold/perform, or reps as text. */
  seconds?: number;
  reps?: string;
  cue: string;
}

export interface Routine {
  id: string;
  name: string;
  minutes: number;
  purpose: string;
  steps: RoutineStep[];
}

export const ROUTINES: Routine[] = [
  {
    id: "warmup",
    name: "5-minute warm-up",
    minutes: 5,
    purpose: "Do this before every session — warm muscles move safely and perform better.",
    steps: [
      { label: "Easy movement", seconds: 60, cue: "March in place, big arm circles — just get warm and breathing." },
      { movementId: "cat-cow", label: "Cat–Cow", reps: "8 slow reps", cue: "Move with your breath to wake up the spine." },
      { movementId: "world-greatest", label: "World's Greatest Stretch", reps: "3 each side", cue: "Open the hips and mid-back." },
      { movementId: "air-squat", label: "Air Squats", reps: "10 slow reps", cue: "Groove the pattern, no weight." },
      { label: "Build the pace", seconds: 60, cue: "10 easy jumping jacks or a brisk walk to lift the heart rate." },
    ],
  },
  {
    id: "cooldown",
    name: "Cool-down",
    minutes: 4,
    purpose: "After training — bring the heart rate down and stretch what worked hard.",
    steps: [
      { label: "Easy walk", seconds: 120, cue: "Slow walk until your breathing settles." },
      { movementId: "cat-cow", label: "Cat–Cow", reps: "6 slow reps", cue: "Breathe slowly, unwind the spine." },
      { label: "Full-body stretch", seconds: 90, cue: "Gently stretch anything that worked hard today. Hydrate." },
    ],
  },
  {
    id: "mobility",
    name: "Stiff today? Mobility reset",
    minutes: 6,
    purpose: "No workout needed — a gentle flow for a stiff back, hips or shoulders.",
    steps: [
      { movementId: "cat-cow", label: "Cat–Cow", reps: "10 reps", cue: "Ease into the range, never force." },
      { movementId: "world-greatest", label: "World's Greatest Stretch", reps: "4 each side", cue: "The big one for hips + thoracic spine." },
      { label: "Hip circles", seconds: 45, cue: "On all fours, slow circles each direction." },
      { label: "Shoulder rolls", seconds: 45, cue: "Big slow rolls back, then forward." },
      { label: "Deep breathing", seconds: 60, cue: "Lie down, 5 slow belly breaths to finish." },
    ],
  },
];

export const ROUTINE_BY_ID: Record<string, Routine> = Object.fromEntries(ROUTINES.map((r) => [r.id, r]));

/** Resolve a step's linked movement (if any) for its form steps + safety. */
export function stepMovement(step: RoutineStep) {
  return step.movementId ? MOVEMENT_BY_ID[step.movementId] : undefined;
}
