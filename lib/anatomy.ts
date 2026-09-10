// anatomy — the canonical muscle map + which muscles a movement pattern ACTIVATES.
// This is the data behind "when you do a movement, the working muscle highlights."
// Muscle regions match the human-anatomy-exact skill; the same ids drive both the
// 2D body diagram now and (later) the Blender/Z-Anatomy 3D mesh highlight.
//
// © Ankur Sinha. Anatomy after standard references + OpenSim muscle actions.

import type { Pattern } from "./movements";

// Canonical muscle regions we can highlight (front/back), with a display label.
export type MuscleId =
  | "chest" | "front-delt" | "side-delt" | "rear-delt" | "biceps" | "triceps"
  | "forearms" | "abs" | "obliques" | "quads" | "adductors" | "tibialis"
  | "traps" | "lats" | "rhomboids" | "lower-back" | "glutes" | "hamstrings"
  | "calves" | "rotator-cuff" | "hip-flexors";

export const MUSCLE_LABEL: Record<MuscleId, string> = {
  chest: "Chest (pectorals)", "front-delt": "Front delts", "side-delt": "Side delts",
  "rear-delt": "Rear delts", biceps: "Biceps", triceps: "Triceps", forearms: "Forearms",
  abs: "Abs (rectus)", obliques: "Obliques", quads: "Quads", adductors: "Adductors",
  tibialis: "Shins (tibialis)", traps: "Traps", lats: "Lats", rhomboids: "Rhomboids",
  "lower-back": "Lower back (erectors)", glutes: "Glutes", hamstrings: "Hamstrings",
  calves: "Calves", "rotator-cuff": "Rotator cuff", "hip-flexors": "Hip flexors",
};

// Which view each muscle is drawn on (front of body vs back).
export const MUSCLE_VIEW: Record<MuscleId, "front" | "back"> = {
  chest: "front", "front-delt": "front", "side-delt": "front", biceps: "front",
  forearms: "front", abs: "front", obliques: "front", quads: "front",
  adductors: "front", tibialis: "front", "hip-flexors": "front",
  "rear-delt": "back", triceps: "back", traps: "back", lats: "back",
  rhomboids: "back", "lower-back": "back", glutes: "back", hamstrings: "back",
  calves: "back", "rotator-cuff": "back",
};

// Movement pattern → activated muscles (primary = bright, secondary = dim).
// Straight from the skill's muscle→movement quick-map.
export const PATTERN_MUSCLES: Record<Pattern, { primary: MuscleId[]; secondary: MuscleId[] }> = {
  squat:   { primary: ["quads", "glutes"], secondary: ["adductors", "lower-back", "hamstrings", "calves"] },
  hinge:   { primary: ["glutes", "hamstrings", "lower-back"], secondary: ["lats", "traps", "forearms"] },
  push:    { primary: ["chest", "triceps", "side-delt"], secondary: ["front-delt", "rotator-cuff", "abs"] },
  pull:    { primary: ["lats", "biceps"], secondary: ["rhomboids", "traps", "rear-delt", "forearms"] },
  core:    { primary: ["abs"], secondary: ["obliques", "lower-back", "hip-flexors"] },
  carry:   { primary: ["traps", "forearms"], secondary: ["glutes", "abs", "calves"] },
  cardio:  { primary: ["quads", "calves"], secondary: ["hamstrings", "glutes", "abs"] },
  mobility:{ primary: [], secondary: ["hamstrings", "glutes", "lower-back"] },
};

export function musclesFor(pattern: Pattern) {
  return PATTERN_MUSCLES[pattern] ?? { primary: [], secondary: [] };
}
