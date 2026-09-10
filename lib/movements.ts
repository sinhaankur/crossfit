// movements — the exercise library. SAFETY-FIRST: every movement carries
// step-by-step form cues, a safety note (the thing people get wrong and hurt),
// and a SCALE (an easier version), because people injure themselves when a plan
// just says "do 20 pull-ups" with no form and no easier option.
//
// © Ankur Sinha. No external data — hand-written from standard coaching cues.

export type Pattern =
  | "squat" | "hinge" | "push" | "pull" | "core" | "carry" | "cardio" | "mobility";

export type Equipment = "none" | "dumbbell" | "kettlebell" | "barbell" | "pullup-bar" | "box" | "rower-bike" | "jump-rope";

export interface Movement {
  id: string;
  name: string;
  pattern: Pattern;
  /** Equipment needed; "none" means bodyweight. */
  needs: Equipment[];
  /** How demanding on joints/skill — used to gate by experience. */
  intensity: "gentle" | "moderate" | "spicy";
  /** Numbered, do-this-then-that form cues. ALWAYS shown to the user. */
  steps: string[];
  /** The safety note — the common mistake that causes injury. ALWAYS shown. */
  safety: string;
  /** An easier version anyone can drop to (never leave someone stuck). */
  scale: string;
}

export const MOVEMENTS: Movement[] = [
  {
    id: "air-squat", name: "Air Squat", pattern: "squat", needs: ["none"], intensity: "gentle",
    steps: [
      "Stand tall, feet shoulder-width, toes slightly out.",
      "Send your hips back and down like sitting into a chair.",
      "Keep your chest up and your knees tracking over your toes (not caving in).",
      "Go as low as you can while keeping your heels flat.",
      "Drive through your heels to stand all the way up. Squeeze at the top.",
    ],
    safety: "Stop if your knees cave inward or your heels lift — reduce depth instead. Never bounce out of the bottom.",
    scale: "Squat to a chair/box and stand back up. Only go as low as you can control.",
  },
  {
    id: "box-step-up", name: "Box Step-Up", pattern: "squat", needs: ["box"], intensity: "gentle",
    steps: [
      "Place one full foot on a sturdy box or low step.",
      "Push through that heel to stand up on the box; bring the other foot up.",
      "Step back down with control, one foot at a time.",
      "Alternate the leading leg each rep.",
    ],
    safety: "Use a box you can step onto without straining. Watch the edge; step down slowly — most trips happen on the way down.",
    scale: "Use a lower step, or hold a wall/rail for balance.",
  },
  {
    id: "deadlift", name: "Deadlift (light)", pattern: "hinge", needs: ["dumbbell"], intensity: "moderate",
    steps: [
      "Stand with a dumbbell (or two) in front of your shins.",
      "Push your hips back, keep a long flat back, and hinge to grip the weight.",
      "Brace your belly (like about to be poked), then stand up by driving hips forward.",
      "Lower with the same flat-back hinge — control it down, don't drop.",
    ],
    safety: "A ROUNDED lower back is the #1 injury here. Keep the back flat and the weight LIGHT until the hinge feels natural. If your back rounds, the weight is too heavy.",
    scale: "Hinge with no weight (hands sliding down your thighs) to groove the pattern first.",
  },
  {
    id: "kb-swing", name: "Kettlebell Swing", pattern: "hinge", needs: ["kettlebell"], intensity: "moderate",
    steps: [
      "Stand feet shoulder-width, kettlebell a step in front of you.",
      "Hinge at the hips (not a squat), hike the bell back between your legs.",
      "Snap your hips forward to float the bell up to chest height — power comes from the HIPS, not the arms.",
      "Let it swing back down and hinge again. Keep a flat back throughout.",
    ],
    safety: "It's a hip snap, not an arm lift or a squat. Don't yank with your shoulders or over-arch your back at the top. Start light.",
    scale: "Do hip hinges with no weight, or a lighter bell to just eye level.",
  },
  {
    id: "pushup", name: "Push-Up", pattern: "push", needs: ["none"], intensity: "moderate",
    steps: [
      "Hands under shoulders, body in one straight line from head to heels.",
      "Brace your core and glutes so your hips don't sag.",
      "Lower your chest toward the floor, elbows at about 45° (not flared to 90°).",
      "Press back up to a straight-arm plank.",
    ],
    safety: "Keep your hips level — a sagging low back is the common strain. Elbows flared wide stresses the shoulders.",
    scale: "Push up from your knees, or hands on a wall/bench at an incline.",
  },
  {
    id: "db-press", name: "Dumbbell Shoulder Press", pattern: "push", needs: ["dumbbell"], intensity: "moderate",
    steps: [
      "Stand tall, dumbbells at your shoulders, palms facing forward.",
      "Brace your core; don't lean back.",
      "Press the weights straight overhead until your arms lock out.",
      "Lower back to your shoulders with control.",
    ],
    safety: "Don't arch your lower back to help the press — brace and press straight up. Lighter weight, full control.",
    scale: "Press one arm at a time, or use lighter weights / a resistance band.",
  },
  {
    id: "ring-row", name: "Ring / Bar Row", pattern: "pull", needs: ["pullup-bar"], intensity: "gentle",
    steps: [
      "Set a bar/rings at chest height; grip and lean back with straight arms, body straight.",
      "Squeeze your shoulder blades and pull your chest to the bar.",
      "Lower with control to straight arms.",
      "The more horizontal your body, the harder it is.",
    ],
    safety: "Keep your body in one line — don't let your hips sag. Move your feet forward to make it easier, not by cheating with a bent body.",
    scale: "Stand more upright (feet further back) so you pull less of your bodyweight.",
  },
  {
    id: "hollow-hold", name: "Hollow Hold", pattern: "core", needs: ["none"], intensity: "gentle",
    steps: [
      "Lie on your back, arms overhead, legs straight.",
      "Press your lower back FLAT into the floor.",
      "Lift your shoulders and legs a few inches, keeping that flat back.",
      "Hold and breathe. The lower your legs, the harder it is.",
    ],
    safety: "If your lower back arches off the floor, raise your legs higher or bend your knees — a gap under your back is the strain point.",
    scale: "Bend your knees, or hold with arms by your sides and legs higher.",
  },
  {
    id: "plank", name: "Plank", pattern: "core", needs: ["none"], intensity: "gentle",
    steps: [
      "Forearms on the floor under your shoulders, body in one straight line.",
      "Brace your belly and squeeze your glutes.",
      "Hold, breathing steadily. Don't let your hips rise or sag.",
    ],
    safety: "A sagging low back is the risk — keep hips level with shoulders. Stop the moment your form breaks; a short strong plank beats a long sloppy one.",
    scale: "Plank from your knees, or hands-on-a-bench incline plank.",
  },
  {
    id: "farmer-carry", name: "Farmer Carry", pattern: "carry", needs: ["dumbbell"], intensity: "gentle",
    steps: [
      "Hold a weight in each hand at your sides.",
      "Stand tall, shoulders back, core braced.",
      "Walk with short controlled steps for the set distance/time.",
      "Set the weights down with a flat-back hinge, not a rounded slump.",
    ],
    safety: "Don't lean to one side or let your shoulders round forward. Put the weights down safely — don't just drop from a hunched back.",
    scale: "Lighter weights, or carry one weight and switch hands halfway.",
  },
  {
    id: "row-bike", name: "Row / Bike / Brisk Walk", pattern: "cardio", needs: ["rower-bike"], intensity: "moderate",
    steps: [
      "Pick your engine: rower, bike, or a brisk walk/jog if you have none.",
      "Start easy for the first minute to warm up.",
      "Settle into a pace you could hold a short conversation at (conversational = sustainable).",
      "Ease off in the last minute rather than sprinting to a stop.",
    ],
    safety: "Build the pace gradually — don't sprint cold. If you feel chest pain, dizziness, or can't catch your breath, STOP.",
    scale: "A brisk walk counts. Go by effort, not speed.",
  },
  {
    id: "jump-rope", name: "Jump Rope / Line Hops", pattern: "cardio", needs: ["jump-rope"], intensity: "moderate",
    steps: [
      "Small bounces on the balls of your feet, elbows in, wrists turning the rope.",
      "Jump just high enough to clear the rope — a low, quiet, quick bounce.",
      "If you trip, reset and go again; smoothness beats speed.",
    ],
    safety: "Land softly through the balls of your feet — don't stomp on straight legs (that jars ankles/knees). Skip if you have knee/ankle issues.",
    scale: "No rope? Do quick small hops over a line on the floor, or fast marching in place.",
  },
  {
    id: "cat-cow", name: "Cat–Cow (mobility)", pattern: "mobility", needs: ["none"], intensity: "gentle",
    steps: [
      "On hands and knees, hands under shoulders, knees under hips.",
      "Inhale: drop your belly, lift your chest and tailbone (cow).",
      "Exhale: round your spine up toward the ceiling, tuck your chin (cat).",
      "Move slowly with your breath for the set reps.",
    ],
    safety: "Move gently within a comfortable range — this is a warm-up/cool-down, never force it.",
    scale: "Smaller range of motion; stop at any pinch.",
  },
  {
    id: "world-greatest", name: "World's Greatest Stretch (mobility)", pattern: "mobility", needs: ["none"], intensity: "gentle",
    steps: [
      "Step into a deep lunge with your right foot.",
      "Place both hands inside your front foot.",
      "Rotate your right arm up toward the ceiling, following it with your eyes.",
      "Return the hand down, switch sides. A few slow reps each side.",
    ],
    safety: "Ease into the range — never bounce. If a knee or hip complains, shorten the lunge.",
    scale: "Do it holding onto a chair, or a shallower lunge.",
  },
];

export const MOVEMENT_BY_ID: Record<string, Movement> = Object.fromEntries(
  MOVEMENTS.map((m) => [m.id, m]),
);
