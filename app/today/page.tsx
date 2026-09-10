"use client";

import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { trainedDates, currentStreak, daysThisWeek, daysThisMonth, planSessionsDone } from "@/lib/activity";
import { loadLog, personalRecords, SCORING_LABEL } from "@/lib/wod-log";
import { loadGoals, goalProgress, type Goal } from "@/lib/body";
import { loadOneRMs, LIFT_LABEL, type OneRMs } from "@/lib/strength";

// /today — the dashboard home for someone who's using the app: one glance at
// where you stand. This week's training, your streak, active goals, top PRs, and
// what to do next. The connective tissue between Plan, Build, and Log.

export default function TodayPage() {
  const [ready, setReady] = useState(false);
  const [streak, setStreak] = useState(0);
  const [week, setWeek] = useState(0);
  const [month, setMonth] = useState(0);
  const [workouts, setWorkouts] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [prs, setPrs] = useState<ReturnType<typeof personalRecords>>([]);
  const [rms, setRms] = useState<OneRMs>({});

  useEffect(() => {
    const dates = trainedDates();
    setStreak(currentStreak(dates));
    setWeek(daysThisWeek(dates));
    setMonth(daysThisMonth(dates));
    const log = loadLog();
    setWorkouts(log.length + planSessionsDone());
    setPrs(personalRecords(log).slice(0, 4));
    setGoals(loadGoals().filter((g) => !g.done).slice(0, 3));
    setRms(loadOneRMs());
    setReady(true);
  }, []);

  const empty = ready && workouts === 0 && goals.length === 0 && prs.length === 0;

  return (
    <main className="min-h-dvh">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-5 py-8">
        <p className="font-mono-eyebrow text-[var(--muted)]">{greeting()} · today</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Where you stand.</h1>

        {empty ? (
          <div className="mt-8 rounded-3xl border border-dashed border-white/15 p-8 text-center">
            <p className="text-[var(--fg)]/80">Nothing logged yet. Build a plan and log your first session — this page fills in as you train.</p>
            <a href="/#build" className="mt-4 inline-block rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white">Build my plan →</a>
          </div>
        ) : (
          <>
            {/* rings row */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Ring value={week} of={7} label="This week" />
              <Big n={streak} label="Day streak" accent unit="🔥" />
              <Big n={month} label="This month" />
            </div>

            {/* goals */}
            {goals.length > 0 && (
              <Section title="Active goals" href="/body" cta="All goals">
                <div className="space-y-2.5">
                  {goals.map((g) => {
                    const p = goalProgress(g);
                    return (
                      <div key={g.id} className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-3">
                        <div className="flex items-baseline justify-between text-sm">
                          <span className="font-semibold">{g.label}</span>
                          <span className="text-xs text-[var(--muted)]">{Math.round(p * 100)}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full bg-[var(--accent)]" style={{ width: `${Math.round(p * 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* PRs */}
            {prs.length > 0 && (
              <Section title="Recent PRs 🏆" href="/log" cta="Full log">
                <div className="grid gap-2 sm:grid-cols-2">
                  {prs.map((pr) => (
                    <div key={pr.name} className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-3">
                      <p className="text-sm font-semibold">{pr.name}</p>
                      <p className="text-sm text-[var(--accent)]">{pr.best} <span className="text-xs text-[var(--muted)]">· {SCORING_LABEL[pr.scoring]}</span></p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* lifts */}
            {Object.keys(rms).length > 0 && (
              <Section title="Your maxes" href="/body" cta="Update">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(rms).map(([lift, v]) => (
                    <span key={lift} className="rounded-full bg-white/5 px-3 py-1.5 text-sm">
                      {LIFT_LABEL[lift as keyof typeof LIFT_LABEL]} <b className="text-[var(--accent)]">{v}</b>
                    </span>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {/* quick actions — always available */}
        <Section title="Jump in">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Quick href="/#build" label="Build a plan" emoji="📋" />
            <Quick href="/routines" label="Warm up" emoji="🧘" />
            <Quick href="/log" label="Log a workout" emoji="✍️" />
            <Quick href="/calendar" label="Calendar" emoji="🗓" />
          </div>
        </Section>
      </div>
    </main>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Ring({ value, of, label }: { value: number; of: number; label: string }) {
  const pct = Math.min(1, value / of);
  const r = 26, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}<span className="text-xs text-[var(--muted)]">/{of}</span></p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
function Big({ n, label, accent, unit }: { n: number; label: string; accent?: boolean; unit?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
      <p className={`text-3xl font-bold tabular-nums ${accent ? "text-[var(--accent)]" : ""}`}>{n}{unit && <span className="ml-1 text-lg">{unit}</span>}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
function Section({ title, href, cta, children }: { title: string; href?: string; cta?: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">{title}</h2>
        {href && cta && <a href={href} className="text-xs text-[var(--muted)] underline hover:text-[var(--fg)]">{cta}</a>}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
function Quick({ href, label, emoji }: { href: string; label: string; emoji: string }) {
  return (
    <a href={href} className="flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 text-center transition hover:border-white/30">
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs font-semibold">{label}</span>
    </a>
  );
}
