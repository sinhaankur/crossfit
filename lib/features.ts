// features — the honest, living list of what Kelo has and what's coming. Shown on
// /features so anyone can see the plan; we keep testing and fixing, so this is the
// single place that tracks status. Edit here to update the roadmap page.
//
// © Ankur Sinha.

export type Status = "live" | "building" | "planned";

export interface Feature {
  title: string;
  desc: string;
  status: Status;
  area: "Plan" | "Train" | "Progress" | "Body" | "App" | "Account";
}

export const FEATURES: Feature[] = [
  // Plan
  { area: "Plan", status: "live", title: "Personal plan generator", desc: "Body type + goal + diet + experience → a safe, progressive, step-by-step plan." },
  { area: "Plan", status: "live", title: "Progressive overload", desc: "Volume then load build week over week — never a jump." },
  { area: "Plan", status: "live", title: "1RM-driven strength block", desc: "Barbell days program real % of your saved max." },
  { area: "Plan", status: "planned", title: "Download plan as PDF", desc: "Save or print your plan to take to the gym." },

  // Train
  { area: "Train", status: "live", title: "3D movement trainer", desc: "A 3D human demonstrates each rep with equipment; drag to orbit, step through the form." },
  { area: "Train", status: "live", title: "Muscles worked", desc: "Prime movers + the small supporting muscles for every movement." },
  { area: "Train", status: "live", title: "Gear: needed / alternative / machine", desc: "What to use, a no-cost alternative, and the gym-machine equivalent." },
  { area: "Train", status: "live", title: "Warm-up & mobility routines", desc: "Standalone guided flows so you never skip the prep." },
  { area: "Train", status: "live", title: "Workout timer", desc: "Stopwatch, countdown, and EMOM/Tabata intervals with beeps." },
  { area: "Train", status: "live", title: "Benchmark WODs", desc: "The Girls & Hero WODs with scaling." },
  { area: "Train", status: "building", title: "Real mocap human (Mixamo)", desc: "A real rigged human doing real exercise animations replaces the mannequin." },

  // Progress
  { area: "Progress", status: "live", title: "Workout log + PRs", desc: "Log every WOD, track personal records, export as JSON." },
  { area: "Progress", status: "live", title: "Consistency calendar + streaks", desc: "A month heatmap of trained days and your current streak." },
  { area: "Progress", status: "live", title: "Today dashboard", desc: "One glance: this week, streak, goals, PRs, maxes." },
  { area: "Progress", status: "live", title: "Gamification (XP, levels, badges)", desc: "Earn XP for learning movements, logging, and streaks." },
  { area: "Progress", status: "live", title: "Calories from your watch", desc: "Log calories burned from Garmin / Apple Watch as effort + motivation." },
  { area: "Progress", status: "planned", title: "Strava / activity import", desc: "Pull runs and rides in automatically." },

  // Body
  { area: "Body", status: "live", title: "1RM calculator + working weights", desc: "Estimate your max and get %-based working weights." },
  { area: "Body", status: "live", title: "Measurements over time", desc: "Weight + key measurements with a trend line." },
  { area: "Body", status: "live", title: "Goals with progress", desc: "Set a lift, bodyweight, measurement, or habit goal and track it." },
  { area: "Body", status: "building", title: "BMI + height/weight", desc: "Compute BMI (with honest caveats — it ignores muscle) and link helpful companion apps." },
  { area: "Body", status: "planned", title: "Body scan (LiDAR)", desc: "Scan yourself with an iPhone's LiDAR to gauge composition and tailor volume." },

  // Account
  { area: "Account", status: "live", title: "Guest-first, on-device", desc: "Everything works with no account; your data stays on your device." },
  { area: "Account", status: "live", title: "Export / erase your data", desc: "Full control — export a backup or wipe the device." },
  { area: "Account", status: "building", title: "Email-code sync", desc: "Optional 6-digit-code sign-in to sync history across your devices." },

  // App
  { area: "App", status: "live", title: "Installable web app (PWA)", desc: "Add to your home screen; works offline." },
  { area: "App", status: "building", title: "Android APK (free)", desc: "A downloadable Android build so anyone can install it free." },
  { area: "App", status: "planned", title: "Kelo iOS app", desc: "The deeper private companion — Health/watch data, diet logic, optional DNA." },
];

export const STATUS_META: Record<Status, { label: string; className: string }> = {
  live: { label: "Live", className: "bg-emerald-500/20 text-emerald-300" },
  building: { label: "Building", className: "bg-amber-500/20 text-amber-300" },
  planned: { label: "Planned", className: "bg-white/10 text-[var(--muted)]" },
};
