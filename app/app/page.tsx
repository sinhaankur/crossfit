import { SiteNav } from "@/components/site-nav";

export const metadata = {
  title: "Get Kelo — on your phone, free",
  description: "Kelo is your strength & CrossFit coach: safe plans, 3D form, your lifts, body and streaks — free and on your device. Install the web app now; native iOS & Android on the way.",
};

// /app — one brand, everywhere. Kelo is the same product on web, iOS and Android:
// install the web app today (PWA), native apps coming. No public/private split.

const DOES = [
  { t: "Safe, progressive plans", d: "Built for your body and goal, with step-by-step form so you get stronger without getting hurt." },
  { t: "3D movement coach", d: "See every rep in 3D — the muscles it works, the gear you need, and an easier option." },
  { t: "Your lifts & body", d: "1RM calculator, working weights, measurements and goals — watch it change over time." },
  { t: "Streaks & life added", d: "Log workouts, keep streaks, and see the hours of life each session gives back." },
  { t: "Watch + Health", d: "Calories and effort from Apple Watch / Garmin flow in — real effort, real motivation." },
  { t: "Yours, private", d: "No account needed. Everything runs on your device, free forever." },
];

export default function AppTeaser() {
  return (
    <main className="min-h-dvh">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <p className="font-mono-eyebrow text-[var(--muted)]">Kelo · on every screen</p>
        <div className="mt-4 flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--accent-2)] to-[var(--accent)] text-2xl font-black text-white shadow-lg shadow-rose-500/30">K</span>
          <h1 className="text-4xl font-bold sm:text-5xl">Get Kelo</h1>
        </div>
        <p className="mt-4 max-w-xl text-lg text-[var(--fg)]/80 leading-relaxed">
          One coach, every screen. <span className="text-[var(--fg)]">Kelo</span> is your strength &amp; CrossFit trainer —
          safe plans, 3D form, your lifts and streaks — free and on your device.
        </p>

        {/* install now (PWA) + native soon */}
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/today" className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:brightness-110">
            Use Kelo now — free
          </a>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-3 text-sm">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
            <span className="font-semibold">iOS &amp; Android</span>
            <span className="text-[var(--muted)]">— coming soon</span>
          </span>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">Tip: on your phone, use <span className="text-[var(--fg)]/80">Share → Add to Home Screen</span> to install Kelo like an app today.</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {DOES.map((d) => (
            <div key={d.t} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
              <p className="font-semibold">{d.t}</p>
              <p className="mt-1 text-sm text-[var(--fg)]/70">{d.d}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-[var(--muted)]">
          Built by <a href="https://sinhaankur.com" className="underline">Ankur Sinha</a> · private &amp; on-device by design.
        </p>
      </div>
    </main>
  );
}
