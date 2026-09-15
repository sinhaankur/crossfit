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

// EVERYDAY name — where it is on YOUR body, in words anyone knows. The gym name
// is hard to remember ("erector spinae"?); this is the label a beginner reads
// first, with the proper name kept as the secondary. Fixes "I don't remember
// the names of muscles — it's hard": learn by body-part + what it does.
export const MUSCLE_PLAIN: Record<MuscleId, string> = {
  chest: "Chest", "front-delt": "Front of shoulder", "side-delt": "Top of shoulder",
  "rear-delt": "Back of shoulder", biceps: "Front of upper arm",
  triceps: "Back of upper arm", forearms: "Forearm / grip",
  abs: "Front of stomach", obliques: "Sides of waist", quads: "Front of thigh",
  adductors: "Inner thigh", tibialis: "Front of shin", traps: "Top of back / neck",
  lats: "Sides of back", rhomboids: "Between shoulder blades",
  "lower-back": "Lower back", glutes: "Butt", hamstrings: "Back of thigh",
  calves: "Back of lower leg", "rotator-cuff": "Deep shoulder",
  "hip-flexors": "Front of hip",
};

// One plain line on what the muscle DOES — you remember a muscle by its job.
export const MUSCLE_DOES: Record<MuscleId, string> = {
  chest: "Pushes things away from you", "front-delt": "Raises your arm forward",
  "side-delt": "Lifts your arm out to the side", "rear-delt": "Pulls your arm backward",
  biceps: "Bends your elbow", triceps: "Straightens your elbow",
  forearms: "Grips and holds", abs: "Curls you forward, braces your core",
  obliques: "Twists and side-bends you", quads: "Straightens your knee",
  adductors: "Pulls your legs together", tibialis: "Lifts your foot up",
  traps: "Shrugs and steadies your shoulders", lats: "Pulls your arms down and in",
  rhomboids: "Squeezes your shoulder blades together",
  "lower-back": "Keeps your spine tall and braced", glutes: "Drives your hips forward",
  hamstrings: "Bends your knee, extends your hip",
  calves: "Points your toes, drives each step",
  "rotator-cuff": "Keeps the shoulder joint stable",
  "hip-flexors": "Lifts your knee toward your chest",
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
