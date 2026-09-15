"use client";

import { useEffect, useState } from "react";
import { HeartPulse, Check } from "lucide-react";
import {
  loadCheckins, saveCheckin, todayCheckin, todayKey, checkinStreak, adviseFor,
  MOOD_FACE, MOOD_WORD, ENERGY_WORD, STRESS_WORD,
  type Mood, type Energy, type Stress, type Checkin,
} from "@/lib/wellbeing";

// MoodCheckin — the daily mental check-in on Today. Gentle, one-tap, on-device.
// Shows the check-in if today's is missing; once done, shows a calm summary +
// the day's kind suggestion. Emits "kelo-checkin" so Today can react.

export function MoodCheckin() {
  const [done, setDone] = useState<Checkin | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [stress, setStress] = useState<Stress | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setDone(todayCheckin());
    setStreak(checkinStreak());
  }, []);

  function submit() {
    if (mood == null || energy == null || stress == null) return;
    const c: Checkin = { date: todayKey(), mood, energy, stress };
    const all = saveCheckin(c);
    setDone(c);
    setStreak(checkinStreak(all));
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("kelo-checkin", { detail: c }));
  }

  const advice = adviseFor(done);

  if (done) {
    const toneClass =
      advice.tone === "rest" ? "border-sky-400/40 bg-sky-400/[0.07]" :
      advice.tone === "go" ? "border-[var(--accent)]/40 bg-[var(--accent)]/[0.07]" :
      "border-[var(--line)] bg-[var(--card)]";
    return (
      <div className={`mt-3 rounded-2xl border p-4 ${toneClass}`}>
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-xl">{MOOD_FACE[done.mood]}</span>
            {MOOD_WORD[done.mood]} · {ENERGY_WORD[done.energy]} · {STRESS_WORD[done.stress]}
          </p>
          {streak > 1 && <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">{streak}-day check-in</span>}
        </div>
        <p className="mt-2 text-sm font-semibold">{advice.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--fg)]/75">{advice.body}</p>
        {advice.cta && (
          <a href={advice.cta.href} className="mt-3 inline-block rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-bold text-white transition hover:brightness-110">
            {advice.cta.label} →
          </a>
        )}
        <button onClick={() => setDone(null)} className="ml-2 text-xs text-[var(--muted)] underline hover:text-[var(--fg)]">
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
      <p className="flex items-center gap-2 font-mono-eyebrow text-[var(--muted)]">
        <HeartPulse className="h-3.5 w-3.5 text-[var(--accent)]" /> How are you today?
      </p>
      {/* mood */}
      <div className="mt-3 flex justify-between">
        {([1, 2, 3, 4, 5] as Mood[]).map((m) => (
          <button key={m} onClick={() => setMood(m)}
            aria-label={MOOD_WORD[m]}
            className={`grid h-11 w-11 place-items-center rounded-full text-2xl transition ${mood === m ? "bg-[var(--accent)]/25 ring-2 ring-[var(--accent)]" : "hover:bg-white/5"}`}>
            {MOOD_FACE[m]}
          </button>
        ))}
      </div>
      {/* energy + stress */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Segment label="Energy" value={energy} onChange={(v) => setEnergy(v as Energy)}
          opts={[[1, "Low"], [2, "Okay"], [3, "High"]]} />
        <Segment label="Stress" value={stress} onChange={(v) => setStress(v as Stress)}
          opts={[[1, "Calm"], [2, "Some"], [3, "High"]]} />
      </div>
      <button onClick={submit} disabled={mood == null || energy == null || stress == null}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-40">
        <Check className="h-4 w-4" /> Log how I feel
      </button>
      <p className="mt-2 text-center text-[10px] text-[var(--muted)]">Private, on your device. No account, never shared.</p>
    </div>
  );
}

function Segment({ label, value, onChange, opts }: {
  label: string; value: number | null; onChange: (v: number) => void; opts: [number, string][];
}) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <div className="flex gap-1">
        {opts.map(([v, l]) => (
          <button key={v} onClick={() => onChange(v)}
            className={`flex-1 rounded-lg px-1 py-1.5 text-xs font-semibold transition ${value === v ? "bg-[var(--accent)] text-white" : "bg-white/5 text-[var(--muted)] hover:text-white"}`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
