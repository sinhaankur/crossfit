// movements — the exercise library. SAFETY-FIRST: every movement carries
// step-by-step form cues, a safety note (the thing people get wrong and hurt),
// and a SCALE (an easier version), because people injure themselves when a plan
// just says "do 20 pull-ups" with no form and no easier option.
//
// © Ankur Sinha. The first 14 are hand-written from standard coaching cues; the
// rest are curated from the free-exercise-db public-domain dataset
// (github.com/yuhonas/free-exercise-db), re-voiced with Kelo's safety/scale/gear
// framing and each carrying a `source` credit.

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
  /** The big muscles this movement builds (prime movers). */
  primary: string[];
  /** The small/supporting muscles that also work — the detail that completes the
   *  picture (rear delts, calves, forearms, rotator cuff, etc.). */
  secondary: string[];
  /** Gear: what you IDEALLY use, cheap/no-cost ALTERNATIVES so nobody is blocked,
   *  and the GYM MACHINE equivalent for those training in a full gym. */
  gear: { needed: string; alternatives: string[]; machine?: string };
  /** Attribution when the movement's base data came from an external source
   *  (our hand-written 14 have none; curated additions cite the public-domain DB). */
  source?: string;
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
    primary: ["Quads", "Glutes"], secondary: ["Hamstrings", "Core", "Calves", "Adductors"],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Hold a chair/rail for balance", "Add a backpack of books for load"], machine: "Leg press or hack-squat machine" },
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
    primary: ["Quads", "Glutes"], secondary: ["Hamstrings", "Calves", "Core (balance)"],
    gear: { needed: "A sturdy box or step (~knee height)", alternatives: ["Bottom stair", "A low sturdy bench", "A park ledge"], machine: "Leg press (single-leg) or step-mill" },
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
    primary: ["Glutes", "Hamstrings"], secondary: ["Erector spinae (lower back)", "Lats", "Forearms (grip)", "Core"],
    gear: { needed: "Dumbbells or a barbell", alternatives: ["A loaded backpack", "A heavy water jug / kettlebell", "Two grocery bags, evenly loaded"], machine: "Cable/trap-bar or seated back-extension machine" },
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
    primary: ["Glutes", "Hamstrings"], secondary: ["Core", "Shoulders", "Forearms (grip)", "Lower back"],
    gear: { needed: "A kettlebell", alternatives: ["A dumbbell held by one end", "A heavy backpack held by the top handle", "A water jug with a handle"], machine: "Cable pull-through (rope on low pulley)" },
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
    primary: ["Chest (pectorals)", "Triceps"], secondary: ["Front delts", "Core", "Serratus anterior"],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Hands on a wall (easier)", "Hands on a sturdy table/bench (incline)"], machine: "Chest-press or pec-deck machine" },
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
    primary: ["Shoulders (deltoids)", "Triceps"], secondary: ["Upper chest", "Core (anti-arch)", "Rotator cuff"],
    gear: { needed: "Dumbbells", alternatives: ["Water jugs / bottles", "A resistance band under your feet", "Any two even, grippable weights"], machine: "Shoulder-press machine" },
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
    primary: ["Upper back (rhomboids)", "Lats"], secondary: ["Biceps", "Rear delts", "Forearms (grip)", "Core"],
    gear: { needed: "Rings or a bar at chest height", alternatives: ["A sturdy table edge (row under it)", "A broomstick across two chairs", "A towel looped around a solid post"], machine: "Seated cable row or lat-pulldown machine" },
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
    primary: ["Core (rectus abdominis)"], secondary: ["Hip flexors", "Quads", "Deep core (transverse abdominis)"],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Bend knees to make it easier", "A mat for comfort"], machine: "Cable crunch / captain's chair" },
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
    primary: ["Core (transverse abdominis)"], secondary: ["Shoulders", "Glutes", "Erector spinae"],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Forearms on a bench (incline, easier)", "A mat for comfort"], machine: "Ab-roller or cable crunch" },
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
    primary: ["Forearms (grip)", "Traps"], secondary: ["Core", "Glutes", "Upper back", "Calves"],
    gear: { needed: "Two dumbbells or kettlebells", alternatives: ["Two loaded grocery bags", "Two water jugs", "A single heavy bag, switch sides"], machine: "Trap-bar carry or loaded sled push" },
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
    primary: ["Legs", "Heart & lungs (cardio)"], secondary: ["Back", "Arms", "Core"],
    gear: { needed: "A rower or bike", alternatives: ["A brisk walk or jog", "Marching / stairs at home", "A skipping rope"], machine: "Rower, assault bike, elliptical or treadmill" },
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
    primary: ["Calves", "Heart & lungs (cardio)"], secondary: ["Shoulders", "Forearms", "Core", "Feet & ankles"],
    gear: { needed: "A jump rope", alternatives: ["Line hops (no rope)", "Fast marching in place", "Small quick bounces on the spot"], machine: "Stair-climber or elliptical (low impact)" },
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
    primary: ["Spinal mobility"], secondary: ["Core", "Neck", "Shoulders"],
    gear: { needed: "Nothing — a mat helps", alternatives: ["Carpet or a folded towel", "Do it seated if kneeling hurts"] },
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
    primary: ["Hips", "Thoracic spine (mid-back)"], secondary: ["Hamstrings", "Glutes", "Shoulders"],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Hold a chair for balance", "Shorten the lunge if tight"] },
  },
  {
    id: "db-barbell-full-squat", name: "Barbell Full Squat", pattern: "squat", needs: ["none"], intensity: "moderate",
    steps: ["This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack just above shoulder level. Once the correct height is chosen and the bar is loaded, step under the bar and place the back of your shoulders (slightly below the neck) across it.", "Hold on to the bar using both arms at each side and lift it off the rack by first pushing with your legs and at the same time straightening your torso.", "Step away from the rack and position your legs using a shoulder-width medium stance with the toes slightly pointed out. Keep your head up at all times and maintain a straight back. This will be your starting position.", "Begin to slowly lower the bar by bending the knees and sitting back with your hips as you maintain a straight posture with the head up. Continue down until your hamstrings are on your calves. Inhale as you perform this portion of the movement.", "Begin to raise the bar as you exhale by pushing the floor with the heel or middle of your foot as you straighten the legs and extend the hips to go back to the starting position.", "Repeat for the recommended amount of repetitions."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Quads"], secondary: ["Calves", "Glutes", "Hamstrings", "Lower back"],
    gear: { needed: "A barbell", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-goblet-squat", name: "Goblet Squat", pattern: "squat", needs: ["none"], intensity: "gentle",
    steps: ["Stand holding a light kettlebell by the horns close to your chest. This will be your starting position.", "Squat down between your legs until your hamstrings are on your calves. Keep your chest and head up and your back straight.", "At the bottom position, pause and use your elbows to push your knees out. Return to the starting position, and repeat for 10-20 repetitions."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Quads"], secondary: ["Calves", "Glutes", "Hamstrings", "Shoulders"],
    gear: { needed: "A kettlebell", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-front-barbell-squat", name: "Front Barbell Squat", pattern: "squat", needs: ["none"], intensity: "spicy",
    steps: ["This exercise is best performed inside a squat rack for safety purposes. To begin, first set the bar on a rack that best matches your height. Once the correct height is chosen and the bar is loaded, bring your arms up under the bar while keeping the elbows high and the upper arm slightly above parallel to the floor. Rest the bar on top of the deltoids and cross your arms while grasping the bar for total control.", "Lift the bar off the rack by first pushing with your legs and at the same time straightening your torso.", "Step away from the rack and position your legs using a shoulder width medium stance with the toes slightly pointed out. Keep your head up at all times as looking down will get you off balance and also maintain a straight back. This will be your starting position. (Note: For the purposes of this discussion we will use the medium stance described above which targets overall development; however you can choose any of the three stances described in the foot positioning section).", "Begin to slowly lower the bar by bending the knees as you maintain a straight posture with the head up. Continue down until the angle between the upper leg and the calves becomes slightly less than 90-degrees (which is the point in which the upper legs are below parallel to the floor). Inhale as you perform this portion of the movement. Tip: If you performed the exercise correctly, the front of the knees should make an imaginary straight line with the toes that is perpendicular to the front. If your knees are past that imaginary line (if they are past your toes) then you are placing undue stress on the knee and the exercise has been performed incorrectly.", "Begin to raise the bar as you exhale by pushing the floor mainly with the middle of your foot as you straighten the legs again and go back to the starting position.", "Repeat for the recommended amount of repetitions."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Quads"], secondary: ["Calves", "Glutes", "Hamstrings"],
    gear: { needed: "A barbell", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-bodyweight-walking-lunge", name: "Bodyweight Walking Lunge", pattern: "squat", needs: ["none"], intensity: "gentle",
    steps: ["Begin standing with your feet shoulder width apart and your hands on your hips.", "Step forward with one leg, flexing the knees to drop your hips. Descend until your rear knee nearly touches the ground. Your posture should remain upright, and your front knee should stay above the front foot.", "Drive through the heel of your lead foot and extend both knees to raise yourself back up.", "Step forward with your rear foot, repeating the lunge on the opposite leg."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Quads"], secondary: ["Calves", "Glutes", "Hamstrings"],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-dumbbell-lunges", name: "Dumbbell Lunges", pattern: "squat", needs: ["none"], intensity: "gentle",
    steps: ["Stand with your torso upright holding two dumbbells in your hands by your sides. This will be your starting position.", "Step forward with your right leg around 2 feet or so from the foot being left stationary behind and lower your upper body down, while keeping the torso upright and maintaining balance. Inhale as you go down. Note: As in the other exercises, do not allow your knee to go forward beyond your toes as you come down, as this will put undue stress on the knee joint. Make sure that you keep your front shin perpendicular to the ground.", "Using mainly the heel of your foot, push up and go back to the starting position as you exhale.", "Repeat the movement for the recommended amount of repetitions and then perform with the left leg."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Quads"], secondary: ["Calves", "Glutes", "Hamstrings"],
    gear: { needed: "Dumbbells", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-barbell-deadlift", name: "Barbell Deadlift", pattern: "hinge", needs: ["none"], intensity: "moderate",
    steps: ["Stand in front of a loaded barbell.", "While keeping the back as straight as possible, bend your knees, bend forward and grasp the bar using a medium (shoulder width) overhand grip. This will be the starting position of the exercise. Tip: If it is difficult to hold on to the bar with this grip, alternate your grip or use wrist straps.", "While holding the bar, start the lift by pushing with your legs while simultaneously getting your torso to the upright position as you breathe out. In the upright position, stick your chest out and contract the back by bringing the shoulder blades back. Think of how the soldiers in the military look when they are in standing in attention.", "Go back to the starting position by bending at the knees while simultaneously leaning the torso forward at the waist while keeping the back straight. When the weights on the bar touch the floor you are back at the starting position and ready to perform another repetition.", "Perform the amount of repetitions prescribed in the program."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Lower back"], secondary: ["Calves", "Forearms", "Glutes", "Hamstrings", "Lats", "Mid back", "Quads", "Traps"],
    gear: { needed: "A barbell", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-romanian-deadlift", name: "Romanian Deadlift", pattern: "hinge", needs: ["none"], intensity: "moderate",
    steps: ["Put a barbell in front of you on the ground and grab it using a pronated (palms facing down) grip that a little wider than shoulder width. Tip: Depending on the weight used, you may need wrist wraps to perform the exercise and also a raised platform in order to allow for better range of motion.", "Bend the knees slightly and keep the shins vertical, hips back and back straight. This will be your starting position.", "Keeping your back and arms completely straight at all times, use your hips to lift the bar as you exhale. Tip: The movement should not be fast but steady and under control.", "Once you are standing completely straight up, lower the bar by pushing the hips back, only slightly bending the knees, unlike when squatting. Tip: Take a deep breath at the start of the movement and keep your chest up. Hold your breath as you lower and exhale as you complete the movement.", "Repeat for the recommended amount of repetitions."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Hamstrings"], secondary: ["Calves", "Glutes", "Lower back"],
    gear: { needed: "A barbell", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-sumo-deadlift", name: "Sumo Deadlift", pattern: "hinge", needs: ["none"], intensity: "moderate",
    steps: ["Begin with a bar loaded on the ground. Approach the bar so that the bar intersects the middle of the feet. The feet should be set very wide, near the collars. Bend at the hips to grip the bar. The arms should be directly below the shoulders, inside the legs, and you can use a pronated grip, a mixed grip, or hook grip. Relax the shoulders, which in effect lengthens your arms.", "Take a breath, and then lower your hips, looking forward with your head with your chest up. Drive through the floor, spreading your feet apart, with your weight on the back half of your feet. Extend through the hips and knees.", "As the bar passes through the knees, lean back and drive the hips into the bar, pulling your shoulder blades together.", "Return the weight to the ground by bending at the hips and controlling the weight on the way down."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Hamstrings"], secondary: ["Adductors", "Forearms", "Glutes", "Lower back", "Mid back", "Quads", "Traps"],
    gear: { needed: "A barbell", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-barbell-glute-bridge", name: "Barbell Glute Bridge", pattern: "hinge", needs: ["none"], intensity: "moderate",
    steps: ["Begin seated on the ground with a loaded barbell over your legs. Using a fat bar or having a pad on the bar can greatly reduce the discomfort caused by this exercise. Roll the bar so that it is directly above your hips, and lay down flat on the floor.", "Begin the movement by driving through with your heels, extending your hips vertically through the bar. Your weight should be supported by your upper back and the heels of your feet.", "Extend as far as possible, then reverse the motion to return to the starting position."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Glutes"], secondary: ["Calves", "Hamstrings"],
    gear: { needed: "A barbell", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-good-morning", name: "Good Morning", pattern: "hinge", needs: ["none"], intensity: "moderate",
    steps: ["Begin with a bar on a rack at shoulder height. Rack the bar across the rear of your shoulders as you would a power squat, not on top of your shoulders. Keep your back tight, shoulder blades pinched together, and your knees slightly bent. Step back from the rack.", "Begin by bending at the hips, moving them back as you bend over to near parallel. Keep your back arched and your cervical spine in proper alignment.", "Reverse the motion by extending through the hips with your glutes and hamstrings. Continue until you have returned to the starting position."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Hamstrings"], secondary: ["Core", "Glutes", "Lower back"],
    gear: { needed: "A barbell", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-one-arm-kettlebell-swings", name: "One-Arm Kettlebell Swings", pattern: "hinge", needs: ["none"], intensity: "moderate",
    steps: [],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Hamstrings"], secondary: ["Calves", "Glutes", "Lower back", "Shoulders"],
    gear: { needed: "A kettlebell", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-barbell-bench-press-medium-g", name: "Barbell Bench Press - Medium Grip", pattern: "push", needs: ["none"], intensity: "gentle",
    steps: ["Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked. This will be your starting position.", "From the starting position, breathe in and begin coming down slowly until the bar touches your middle chest.", "After a brief pause, push the bar back to the starting position as you breathe out. Focus on pushing the bar using your chest muscles. Lock your arms and squeeze your chest in the contracted position at the top of the motion, hold for a second and then start coming down slowly again. Tip: Ideally, lowering the weight should take about twice as long as raising it.", "Repeat the movement for the prescribed amount of repetitions.", "When you are done, place the bar back in the rack."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Chest"], secondary: ["Shoulders", "Triceps"],
    gear: { needed: "A barbell", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-standing-military-press", name: "Standing Military Press", pattern: "push", needs: ["none"], intensity: "gentle",
    steps: ["Start by placing a barbell that is about chest high on a squat rack. Once you have selected the weights, grab the barbell using a pronated (palms facing forward) grip. Make sure to grip the bar wider than shoulder width apart from each other.", "Slightly bend the knees and place the barbell on your collar bone. Lift the barbell up keeping it lying on your chest. Take a step back and position your feet shoulder width apart from each other.", "Once you pick up the barbell with the correct grip length, lift the bar up over your head by locking your arms. Hold at about shoulder level and slightly in front of your head. This is your starting position.", "Lower the bar down to the collarbone slowly as you inhale.", "Lift the bar back up to the starting position as you exhale.", "Repeat for the recommended amount of repetitions."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Shoulders"], secondary: ["Triceps"],
    gear: { needed: "A barbell", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-dips-triceps-version", name: "Dips - Triceps Version", pattern: "push", needs: ["none"], intensity: "gentle",
    steps: ["To get into the starting position, hold your body at arm's length with your arms nearly locked above the bars.", "Now, inhale and slowly lower yourself downward. Your torso should remain upright and your elbows should stay close to your body. This helps to better focus on tricep involvement. Lower yourself until there is a 90 degree angle formed between the upper arm and forearm.", "Then, exhale and push your torso back up using your triceps to bring your body back to the starting position.", "Repeat the movement for the prescribed amount of repetitions."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Triceps"], secondary: ["Chest", "Shoulders"],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-pushups", name: "Pushups", pattern: "push", needs: ["none"], intensity: "gentle",
    steps: ["Lie on the floor face down and place your hands about 36 inches apart while holding your torso up at arms length.", "Next, lower yourself downward until your chest almost touches the floor as you inhale.", "Now breathe out and press your upper body back up to the starting position while squeezing your chest.", "After a brief pause at the top contracted position, you can begin to lower yourself downward again for as many repetitions as needed."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Chest"], secondary: ["Shoulders", "Triceps"],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-dumbbell-bench-press", name: "Dumbbell Bench Press", pattern: "push", needs: ["none"], intensity: "gentle",
    steps: ["Lie down on a flat bench with a dumbbell in each hand resting on top of your thighs. The palms of your hands will be facing each other.", "Then, using your thighs to help raise the dumbbells up, lift the dumbbells one at a time so that you can hold them in front of you at shoulder width.", "Once at shoulder width, rotate your wrists forward so that the palms of your hands are facing away from you. The dumbbells should be just to the sides of your chest, with your upper arm and forearm creating a 90 degree angle. Be sure to maintain full control of the dumbbells at all times. This will be your starting position.", "Then, as you breathe out, use your chest to push the dumbbells up. Lock your arms at the top of the lift and squeeze your chest, hold for a second and then begin coming down slowly. Tip: Ideally, lowering the weight should take about twice as long as raising it.", "Repeat the movement for the prescribed amount of repetitions of your training program."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Chest"], secondary: ["Shoulders", "Triceps"],
    gear: { needed: "Dumbbells", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-pullups", name: "Pullups", pattern: "pull", needs: ["none"], intensity: "gentle",
    steps: ["Grab the pull-up bar with the palms facing forward using the prescribed grip. Note on grips: For a wide grip, your hands need to be spaced out at a distance wider than your shoulder width. For a medium grip, your hands need to be spaced out at a distance equal to your shoulder width and for a close grip at a distance smaller than your shoulder width.", "As you have both arms extended in front of you holding the bar at the chosen grip width, bring your torso back around 30 degrees or so while creating a curvature on your lower back and sticking your chest out. This is your starting position.", "Pull your torso up until the bar touches your upper chest by drawing the shoulders and the upper arms down and back. Exhale as you perform this portion of the movement. Tip: Concentrate on squeezing the back muscles once you reach the full contracted position. The upper torso should remain stationary as it moves through space and only the arms should move. The forearms should do no other work other than hold the bar.", "After a second on the contracted position, start to inhale and slowly lower your torso back to the starting position when your arms are fully extended and the lats are fully stretched.", "Repeat this motion for the prescribed amount of repetitions."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Lats"], secondary: ["Biceps", "Mid back"],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-chin-up", name: "Chin-Up", pattern: "pull", needs: ["none"], intensity: "gentle",
    steps: ["Grab the pull-up bar with the palms facing your torso and a grip closer than the shoulder width.", "As you have both arms extended in front of you holding the bar at the chosen grip width, keep your torso as straight as possible while creating a curvature on your lower back and sticking your chest out. This is your starting position. Tip: Keeping the torso as straight as possible maximizes biceps stimulation while minimizing back involvement.", "As you breathe out, pull your torso up until your head is around the level of the pull-up bar. Concentrate on using the biceps muscles in order to perform the movement. Keep the elbows close to your body. Tip: The upper torso should remain stationary as it moves through space and only the arms should move. The forearms should do no other work other than hold the bar.", "After a second of squeezing the biceps in the contracted position, slowly lower your torso back to the starting position; when your arms are fully extended. Breathe in as you perform this portion of the movement.", "Repeat this motion for the prescribed amount of repetitions."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Lats"], secondary: ["Biceps", "Forearms", "Mid back"],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-bent-over-barbell-row", name: "Bent Over Barbell Row", pattern: "pull", needs: ["none"], intensity: "gentle",
    steps: ["Holding a barbell with a pronated grip (palms facing down), bend your knees slightly and bring your torso forward, by bending at the waist, while keeping the back straight until it is almost parallel to the floor. Tip: Make sure that you keep the head up. The barbell should hang directly in front of you as your arms hang perpendicular to the floor and your torso. This is your starting position.", "Now, while keeping the torso stationary, breathe out and lift the barbell to you. Keep the elbows close to the body and only use the forearms to hold the weight. At the top contracted position, squeeze the back muscles and hold for a brief pause.", "Then inhale and slowly lower the barbell back to the starting position.", "Repeat for the recommended amount of repetitions."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Mid back"], secondary: ["Biceps", "Lats", "Shoulders"],
    gear: { needed: "A barbell", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-wide-grip-lat-pulldown", name: "Wide-Grip Lat Pulldown", pattern: "pull", needs: ["none"], intensity: "gentle",
    steps: ["Sit down on a pull-down machine with a wide bar attached to the top pulley. Make sure that you adjust the knee pad of the machine to fit your height. These pads will prevent your body from being raised by the resistance attached to the bar.", "Grab the bar with the palms facing forward using the prescribed grip. Note on grips: For a wide grip, your hands need to be spaced out at a distance wider than shoulder width. For a medium grip, your hands need to be spaced out at a distance equal to your shoulder width and for a close grip at a distance smaller than your shoulder width.", "As you have both arms extended in front of you holding the bar at the chosen grip width, bring your torso back around 30 degrees or so while creating a curvature on your lower back and sticking your chest out. This is your starting position.", "As you breathe out, bring the bar down until it touches your upper chest by drawing the shoulders and the upper arms down and back. Tip: Concentrate on squeezing the back muscles once you reach the full contracted position. The upper torso should remain stationary and only the arms should move. The forearms should do no other work except for holding the bar; therefore do not try to pull down the bar using the forearms.", "After a second at the contracted position squeezing your shoulder blades together, slowly raise the bar back to the starting position when your arms are fully extended and the lats are fully stretched. Inhale during this portion of the movement.", "Repeat this motion for the prescribed amount of repetitions."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Lats"], secondary: ["Biceps", "Mid back", "Shoulders"],
    gear: { needed: "A cable machine", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-face-pull", name: "Face Pull", pattern: "pull", needs: ["none"], intensity: "moderate",
    steps: ["Facing a high pulley with a rope or dual handles attached, pull the weight directly towards your face, separating your hands as you do so. Keep your upper arms parallel to the ground."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Shoulders"], secondary: ["Mid back"],
    gear: { needed: "A cable machine", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-plank", name: "Plank", pattern: "core", needs: ["none"], intensity: "gentle",
    steps: ["Get into a prone position on the floor, supporting your weight on your toes and your forearms. Your arms are bent and directly below the shoulder.", "Keep your body straight at all times, and hold this position as long as possible. To increase difficulty, an arm or leg can be raised."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Core"], secondary: [],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-hanging-leg-raise", name: "Hanging Leg Raise", pattern: "core", needs: ["none"], intensity: "spicy",
    steps: ["Hang from a chin-up bar with both arms extended at arms length in top of you using either a wide grip or a medium grip. The legs should be straight down with the pelvis rolled slightly backwards. This will be your starting position.", "Raise your legs until the torso makes a 90-degree angle with the legs. Exhale as you perform this movement and hold the contraction for a second or so.", "Go back slowly to the starting position as you breathe in.", "Repeat for the recommended amount of repetitions."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Core"], secondary: [],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-russian-twist", name: "Russian Twist", pattern: "core", needs: ["none"], intensity: "moderate",
    steps: ["Lie down on the floor placing your feet either under something that will not move or by having a partner hold them. Your legs should be bent at the knees.", "Elevate your upper body so that it creates an imaginary V-shape with your thighs. Your arms should be fully extended in front of you perpendicular to your torso and with the hands clasped. This is the starting position.", "Twist your torso to the right side until your arms are parallel with the floor while breathing out.", "Hold the contraction for a second and move back to the starting position while breathing out. Now move to the opposite side performing the same techniques you applied to the right side.", "Repeat for the recommended amount of repetitions."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Core"], secondary: ["Lower back"],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-cable-crunch", name: "Cable Crunch", pattern: "core", needs: ["none"], intensity: "gentle",
    steps: ["Kneel below a high pulley that contains a rope attachment.", "Grasp cable rope attachment and lower the rope until your hands are placed next to your face.", "Flex your hips slightly and allow the weight to hyperextend the lower back. This will be your starting position.", "With the hips stationary, flex the waist as you contract the abs so that the elbows travel towards the middle of the thighs. Exhale as you perform this portion of the movement and hold the contraction for a second.", "Slowly return to the starting position as you inhale. Tip: Make sure that you keep constant tension on the abs throughout the movement. Also, do not choose a weight so heavy that the lower back handles the brunt of the work.", "Repeat for the recommended amount of repetitions."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Core"], secondary: [],
    gear: { needed: "A cable machine", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-farmer-s-walk", name: "Farmer's Walk", pattern: "carry", needs: ["none"], intensity: "moderate",
    steps: ["There are various implements that can be used for the farmers walk. These can also be performed with heavy dumbbells or short bars if these implements aren't available. Begin by standing between the implements.", "After gripping the handles, lift them up by driving through your heels, keeping your back straight and your head up.", "Walk taking short, quick steps, and don't forget to breathe. Move for a given distance, typically 50-100 feet, as fast as possible."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Forearms"], secondary: ["Core", "Glutes", "Hamstrings", "Lower back", "Quads", "Traps"],
    gear: { needed: "Basic kit", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-rowing-stationary", name: "Rowing, Stationary", pattern: "cardio", needs: ["none"], intensity: "moderate",
    steps: ["To begin, seat yourself on the rower. Make sure that your heels are resting comfortably against the base of the foot pedals and that the straps are secured. Select the program that you wish to use, if applicable. Sit up straight and bend forward at the hips.", "There are three phases of movement when using a rower. The first phase is when you come forward on the rower. Your knees are bent and against your chest. Your upper body is leaning slightly forward while still maintaining good posture. Next, push against the foot pedals and extend your legs while bringing your hands to your upper abdominal area, squeezing your shoulders back as you do so. To avoid straining your back, use primarily your leg and hip muscles.", "The recovery phase simply involves straightening your arms, bending the knees, and bringing your body forward again as you transition back into the first phase."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Quads"], secondary: ["Biceps", "Calves", "Glutes", "Hamstrings", "Lower back", "Mid back"],
    gear: { needed: "A machine", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-mountain-climbers", name: "Mountain Climbers", pattern: "cardio", needs: ["none"], intensity: "gentle",
    steps: ["Begin in a pushup position, with your weight supported by your hands and toes. Flexing the knee and hip, bring one leg until the knee is approximately under the hip. This will be your starting position.", "Explosively reverse the positions of your legs, extending the bent leg until the leg is straight and supported by the toe, and bringing the other foot up with the hip and knee flexed. Repeat in an alternating fashion for 20-30 seconds."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Quads"], secondary: ["Chest", "Hamstrings", "Shoulders"],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-rope-jumping", name: "Rope Jumping", pattern: "cardio", needs: ["none"], intensity: "moderate",
    steps: ["Hold an end of the rope in each hand. Position the rope behind you on the ground. Raise your arms up and turn the rope over your head bringing it down in front of you. When it reaches the ground, jump over it. Find a good turning pace that can be maintained. Different speeds and techniques can be used to introduce variation.", "Rope jumping is exciting, challenges your coordination, and requires a lot of energy. A 150 lb person will burn about 350 calories jumping rope for 30 minutes, compared to over 450 calories running."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Quads"], secondary: ["Calves", "Hamstrings"],
    gear: { needed: "Basic kit", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-box-jump-multiple-response", name: "Box Jump (Multiple Response)", pattern: "cardio", needs: ["none"], intensity: "gentle",
    steps: ["Assume a relaxed stance facing the box or platform approximately an arm's length away. Arms should be down at the sides and legs slightly bent.", "Using the arms to aid in the initial burst, jump upward and forward, landing with feet simultaneously on top of the box or platform.", "Immediately drop or jump back down to the original starting place; then repeat the sequence."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Hamstrings"], secondary: ["Abductors", "Adductors", "Calves", "Glutes", "Quads"],
    gear: { needed: "Basic kit", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-hamstring-stretch", name: "Hamstring Stretch", pattern: "mobility", needs: ["none"], intensity: "gentle",
    steps: ["Lie on your back with one leg extended above you, with the hip at ninety degrees. Keep the other leg flat on the floor.", "Loop a belt, band, or rope over the ball of your foot. This will be your starting position.", "Pull on the belt to create tension in the calves and hamstrings. Hold this stretch for 10-30 seconds, and repeat with the other leg."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Hamstrings"], secondary: [],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
  {
    id: "db-kneeling-hip-flexor", name: "Kneeling Hip Flexor", pattern: "mobility", needs: ["none"], intensity: "gentle",
    steps: ["Kneel on a mat and bring your right knee up so the bottom of your foot is on the floor and extend your left leg out behind you so the top of your foot is on the floor.", "Shift your weight forward until you feel a stretch in your hip. Hold for 15 seconds, then repeat for your other side."],
    safety: "Move under control through a full range you can own. If a joint (not muscle) hurts, stop — reduce range or load.",
    scale: "Lighten the load or reduce range; slow the tempo. Master the pattern before adding weight.",
    primary: ["Quads"], secondary: ["Quads"],
    gear: { needed: "Nothing — bodyweight", alternatives: ["Bodyweight or a lighter household load", "Slow the tempo to make it harder without weight"] },
    source: "free-exercise-db (public domain)",
  },
];

export const MOVEMENT_BY_ID: Record<string, Movement> = Object.fromEntries(
  MOVEMENTS.map((m) => [m.id, m]),
);
