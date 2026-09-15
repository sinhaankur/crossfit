// age-groups — "exercise for all" across a lifespan. A chosen age band reshapes
// the COACHING GUIDANCE for any movement (rep guidance, tempo, what to
// emphasise, what to avoid) without changing the movement itself. Pure data +
// deterministic logic — a tinyLLM would only voice it, nothing here needs a
// model. Guidance follows mainstream physical-activity guidelines (WHO / NHS /
// ACSM) framed in plain, encouraging language.
//
// © Ankur Sinha.

export type AgeGroup = "kids" | "teens" | "adults" | "older";

export interface AgeProfile {
  id: AgeGroup;
  label: string;
  range: string;            // shown on the chip, e.g. "6–12"
  /** One-line ethos for this age. */
  ethos: string;
  /** How to think about reps/effort at this age (plain guidance). */
  reps: string;
  /** The extra safety emphasis that matters most at this age. */
  emphasis: string;
}

export const AGE_PROFILES: Record<AgeGroup, AgeProfile> = {
  kids: {
    id: "kids", label: "Kids", range: "6–12",
    ethos: "Play, not training. Move often, keep it fun, master body-weight first.",
    reps: "Keep it light and playful — short bursts, lots of variety. No heavy loading; body-weight and games are plenty.",
    emphasis: "Focus on learning the shape of the movement, not effort. Stop the moment it stops being fun or something aches.",
  },
  teens: {
    id: "teens", label: "Teens", range: "13–17",
    ethos: "Build the skill and the habit. Technique before weight, always.",
    reps: "Sets of 8–15 with good form. Add light load only once the body-weight version is clean. Rest well; you're still growing.",
    emphasis: "Growing joints don't love max effort — leave 2–3 reps in the tank and never sacrifice form to chase a number.",
  },
  adults: {
    id: "adults", label: "Adults", range: "18–59",
    ethos: "Strength + conditioning for a strong, capable life.",
    reps: "Strength: 3–5 sets of 5–12. Conditioning: work-to-rest that leaves you breathless but in control. Progress gradually.",
    emphasis: "Warm up, progress load slowly, and prioritise sleep + recovery — consistency beats intensity over a lifetime.",
  },
  older: {
    id: "older", label: "Older adults", range: "60+",
    ethos: "Stay strong, steady, and independent. Every rep protects your future.",
    reps: "2–3 sets of 8–12 at a comfortable effort, most days. Balance + standing-up strength matter most — quality over load.",
    emphasis: "Have support nearby (a chair/rail), move within a pain-free range, and never rush. Breathing steady, never held.",
  },
};

export const AGE_ORDER: AgeGroup[] = ["kids", "teens", "adults", "older"];

/** For older adults, gently steer toward the seated/supported adaptive variant
 *  when a movement has one — safety-first, still their choice. */
export function suggestsAdaptive(group: AgeGroup): boolean {
  return group === "older";
}
