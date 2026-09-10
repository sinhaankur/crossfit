import { SiteNav } from "@/components/site-nav";

export const metadata = {
  title: "Kelo — the app · coming to the App Store",
  description: "Kelo is the private, on-device companion app: your CrossFit log, diet logic, body tracking and (for those who want it) DNA — all in one place. Coming to the App Store.",
};

// /app — the Kelo teaser. The web app is the open, public planner; Kelo is the
// deeper private companion (health + diet + body + optional DNA), on-device.
// Not on the store yet — this page sets the expectation honestly, no dead link.

const DOES = [
  { t: "Your whole log, one place", d: "Every WOD, PR, and session syncs from the web log — import the JSON you export here." },
  { t: "Diet logic", d: "Macros and meals matched to how you train, not a generic calorie counter." },
  { t: "See your body change", d: "Weight, measurements and lifts over time — the same Build view, on your phone." },
  { t: "DNA (optional, private)", d: "For those who go deep: genetics read entirely on-device, never uploaded. You choose to turn it on." },
  { t: "Watch + Health", d: "Calories and effort from Apple Watch / Garmin flow in — real effort, real motivation." },
];

export default function AppTeaser() {
  return (
    <main className="min-h-dvh">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--muted)]">The companion app</p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Kelo</h1>
        <p className="mt-4 max-w-xl text-lg text-[var(--fg)]/80 leading-relaxed">
          The web planner is open to everyone. <span className="text-[var(--fg)]">Kelo</span> is the private companion —
          your training, diet, body and (if you want it) DNA, all in one place, all on your device.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2 text-sm">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
          <span className="font-semibold">Coming to the App Store</span>
          <span className="text-[var(--muted)]">— in the works</span>
        </div>

        <div className="mt-10 space-y-4">
          {DOES.map((d) => (
            <div key={d.t} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
              <p className="font-semibold">{d.t}</p>
              <p className="mt-1 text-sm text-[var(--fg)]/70">{d.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-white/15 p-6 text-center">
          <p className="text-sm text-[var(--muted)]">
            Until it lands on the App Store, everything you need is right here on the web —
            free, no account, on your device.
          </p>
          <a href="/" className="mt-3 inline-block rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white">
            Build my plan →
          </a>
        </div>

        <p className="mt-8 text-center text-xs text-[var(--muted)]">
          Built by <a href="https://sinhaankur.com" className="underline">Ankur Sinha</a> · private &amp; on-device by design.
        </p>
      </div>
    </main>
  );
}
