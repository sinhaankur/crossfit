"use client";

import { useState } from "react";
import type { Plan, Session } from "@/lib/plan-engine";
import { LIFT_LABEL } from "@/lib/strength";
import { WorkoutTimer } from "./workout-timer";

// PlanView — presents the plan so a total beginner knows exactly what to do:
// week → session → warm-up → each movement with numbered STEPS + a safety note
// + an easier scale, then cool-down and a "what next" reminder. Attendance is a
// tap per session (saved locally). A workout timer sits on top for the session.

export function PlanView({ plan }: { plan: Plan }) {
  const [openWeek, setOpenWeek] = useState(1);
  const [done, setDone] = useState<Record<string, boolean>>(() => loadDone(plan));

  function toggle(week: number, day: number) {
    const key = `${week}.${day}`;
    setDone((d) => {
      const next = { ...d, [key]: !d[key] };
      saveDone(plan, next);
      return next;
    });
  }

  const totalSessions = plan.weeks.reduce((n, w) => n + w.sessions.length, 0);
  const doneCount = Object.values(done).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      {/* Summary */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">Your plan</p>
        <p className="mt-2 text-[15px] leading-relaxed">{plan.summary}</p>
        <p className="mt-3 text-sm text-[var(--accent)]">{plan.progressionNote}</p>
        {/* attendance progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Workouts done</span><span>{doneCount} / {totalSessions}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-[var(--accent)] transition-[width]" style={{ width: `${totalSessions ? (doneCount / totalSessions) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Safety — always shown, up top, because people injure themselves. */}
      <details open className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-5">
        <summary className="cursor-pointer text-sm font-bold text-amber-300">⚠ Read first — training safely</summary>
        <ul className="mt-3 space-y-1.5 text-sm text-amber-100/90">
          {plan.safety.map((s, i) => <li key={i}>· {s}</li>)}
        </ul>
      </details>

      {/* Timer */}
      <div className="mt-4"><WorkoutTimer /></div>

      {/* Weeks */}
      <div className="mt-6 space-y-3">
        {plan.weeks.map((wk) => {
          const open = openWeek === wk.week;
          const wkDone = wk.sessions.filter((s) => done[`${wk.week}.${s.day}`]).length;
          return (
            <div key={wk.week} className="rounded-2xl border border-[var(--line)] bg-[var(--card)]">
              <button
                onClick={() => setOpenWeek(open ? -1 : wk.week)}
                className="flex w-full items-center justify-between gap-3 p-5 text-left"
              >
                <div>
                  <p className="font-bold">Week {wk.week}</p>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">{wk.intent}</p>
                </div>
                <span className="shrink-0 text-xs text-[var(--muted)]">{wkDone}/{wk.sessions.length} · {open ? "▲" : "▼"}</span>
              </button>
              {open && (
                <div className="space-y-4 border-t border-[var(--line)] p-5">
                  {wk.sessions.map((s) => (
                    <SessionCard
                      key={s.day}
                      session={s}
                      done={!!done[`${wk.week}.${s.day}`]}
                      onToggle={() => toggle(wk.week, s.day)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nutrition */}
      <details className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
        <summary className="cursor-pointer font-bold">Eating to support it</summary>
        <ul className="mt-3 space-y-1.5 text-sm text-[var(--fg)]/85">
          {plan.nutrition.map((n, i) => <li key={i}>· {n}</li>)}
        </ul>
      </details>

      <p className="mt-8 text-center text-xs text-[var(--muted)]">
        Saved on this device only — no account. This is general fitness guidance, not medical advice.
      </p>
    </div>
  );
}

function SessionCard({ session, done, onToggle }: { session: Session; done: boolean; onToggle: () => void }) {
  return (
    <div className={`rounded-xl border p-4 transition-colors ${done ? "border-emerald-500/40 bg-emerald-500/[0.06]" : "border-[var(--line)] bg-black/20"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{session.label}</p>
          <p className="mt-0.5 text-sm text-[var(--muted)]">{session.focus} · ~{session.estMinutes} min</p>
        </div>
        <button
          onClick={onToggle}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${done ? "bg-emerald-500 text-white" : "border border-white/20 text-[var(--muted)] hover:text-white"}`}
        >
          {done ? "✓ Done" : "Mark done"}
        </button>
      </div>

      {/* Warm-up */}
      <Block title="Warm-up (don't skip)">
        <ul className="space-y-1 text-sm text-[var(--fg)]/85">{session.warmup.map((w, i) => <li key={i}>· {w}</li>)}</ul>
      </Block>

      {/* Strength block — real % of your 1RM, driven by your saved maxes. */}
      {session.strength && (
        <Block title="Strength — build the lift">
          <div className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/[0.06] p-3">
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-semibold">{LIFT_LABEL[session.strength.lift]}</p>
              <p className="shrink-0 text-xs font-bold text-[var(--accent)]">{session.strength.scheme}</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {session.strength.sets.map((set, i) => (
                <span key={i} className="rounded-md bg-black/30 px-2 py-1 text-xs tabular-nums">
                  {set.reps}{set.weight > 0 ? <> × <b>{set.weight}</b></> : <> reps</>}
                  {set.weight > 0 && <span className="text-[var(--muted)]"> · {Math.round(set.pct * 100)}%</span>}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--fg)]/70">{session.strength.note}</p>
            {session.strength.sets[0]?.weight === 0 && (
              <a href="/body" className="mt-2 inline-block text-xs font-semibold text-[var(--accent)] underline">Set your 1RM to get exact weights →</a>
            )}
          </div>
        </Block>
      )}

      {/* The work — each movement with STEPS + safety + scale */}
      <Block title="The workout">
        <div className="space-y-3">
          {session.work.map((pm) => (
            <div key={pm.movement.id} className="rounded-lg border border-[var(--line)] bg-black/20 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold">{pm.movement.name}</p>
                <p className="shrink-0 text-xs font-medium text-[var(--accent)]">{pm.prescription}</p>
              </div>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--fg)]/85">
                {pm.movement.steps.map((st, i) => <li key={i}>{st}</li>)}
              </ol>
              <p className="mt-2 rounded bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-200">⚠ {pm.movement.safety}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Easier: {pm.movement.scale}</p>
            </div>
          ))}
        </div>
      </Block>

      {/* Cool-down */}
      <Block title="Cool-down">
        <ul className="space-y-1 text-sm text-[var(--fg)]/85">{session.cooldown.map((c, i) => <li key={i}>· {c}</li>)}</ul>
      </Block>

      <p className="mt-3 rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-[var(--fg)]/80">🗓 {session.reminder}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{title}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/* attendance persistence (per-plan signature, localStorage) */
function planKey(plan: Plan) {
  const p = plan.profile;
  return `crossfit-done:${p.goal}:${p.bodyType}:${p.experience}:${p.daysPerWeek}x${p.weeks}`;
}
function loadDone(plan: Plan): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(planKey(plan)) || "{}"); } catch { return {}; }
}
function saveDone(plan: Plan, d: Record<string, boolean>) {
  try { localStorage.setItem(planKey(plan), JSON.stringify(d)); } catch { /* private mode */ }
}
