"use client";

import { useState } from "react";
import { buildPlan, type Profile, type BodyType, type Goal, type Diet, type Experience } from "@/lib/plan-engine";
import type { Equipment } from "@/lib/movements";
import { PlanView } from "@/components/plan-view";
import { SiteNav } from "@/components/site-nav";

// The front door: a short, honest form → a safe, progressive, step-by-step plan.
// Everything runs on-device (no account, no server, no key). Anyone can use it.

const BODY: { v: BodyType; label: string; hint: string }[] = [
  { v: "unsure", label: "Not sure", hint: "That's fine — pick this." },
  { v: "ectomorph", label: "Naturally lean", hint: "Slim, hard to gain." },
  { v: "mesomorph", label: "Athletic", hint: "Builds muscle readily." },
  { v: "endomorph", label: "Softer / stockier", hint: "Gains easily." },
];
const GOALS: { v: Goal; label: string }[] = [
  { v: "general-health", label: "General health" },
  { v: "lose-fat", label: "Lose fat" },
  { v: "build-muscle", label: "Build muscle" },
  { v: "strength", label: "Get stronger" },
  { v: "endurance", label: "Endurance" },
];
const DIETS: { v: Diet; label: string }[] = [
  { v: "balanced", label: "Balanced" }, { v: "high-protein", label: "High-protein" },
  { v: "vegetarian", label: "Vegetarian" }, { v: "vegan", label: "Vegan" },
  { v: "low-carb", label: "Low-carb" }, { v: "unsure", label: "Not sure" },
];
const EXP: { v: Experience; label: string; hint: string }[] = [
  { v: "brand-new", label: "Brand new", hint: "Never really trained." },
  { v: "returning", label: "Returning", hint: "Getting back into it." },
  { v: "regular", label: "Regular", hint: "Train consistently." },
];
const EQUIP: { v: Equipment; label: string }[] = [
  { v: "dumbbell", label: "Dumbbells" }, { v: "kettlebell", label: "Kettlebell" },
  { v: "barbell", label: "Barbell" }, { v: "pullup-bar", label: "Pull-up bar / rings" },
  { v: "box", label: "Box / step" }, { v: "rower-bike", label: "Rower / bike" },
  { v: "jump-rope", label: "Jump rope" },
];

export default function Home() {
  const [bodyType, setBodyType] = useState<BodyType>("unsure");
  const [goal, setGoal] = useState<Goal>("general-health");
  const [diet, setDiet] = useState<Diet>("balanced");
  const [experience, setExperience] = useState<Experience>("brand-new");
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [daysPerWeek, setDays] = useState(2);
  const [weeks, setWeeks] = useState(4);
  const [plan, setPlan] = useState<ReturnType<typeof buildPlan> | null>(null);

  function generate() {
    const profile: Profile = { bodyType, goal, diet, experience, equipment, daysPerWeek, weeks };
    setPlan(buildPlan(profile));
    setTimeout(() => document.getElementById("plan")?.scrollIntoView({ behavior: "smooth" }), 60);
  }
  function toggleEquip(e: Equipment) {
    setEquipment((cur) => cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e]);
  }

  return (
    <main className="min-h-dvh">
      <SiteNav />
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pt-14 pb-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--muted)]">CrossFit · a plan you can keep</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
          A workout plan built <span className="text-[var(--accent)]">for you</span> — safely.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--fg)]/75 leading-relaxed">
          Answer a few honest questions and get a step-by-step, progressive plan — every movement
          with real form cues and an easier option, so you build strength without getting hurt.
          Consistency beats extremes: even a couple of solid days a week keeps you healthy.
        </p>
      </section>

      {/* The form */}
      <section className="mx-auto max-w-3xl px-5 pb-4">
        <div className="space-y-5 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
          <Field label="Your body type">
            <Choices options={BODY.map((b) => ({ v: b.v, label: b.label, hint: b.hint }))} value={bodyType} onPick={(v) => setBodyType(v as BodyType)} />
          </Field>
          <Field label="Main goal">
            <Choices options={GOALS} value={goal} onPick={(v) => setGoal(v as Goal)} />
          </Field>
          <Field label="Experience">
            <Choices options={EXP.map((e) => ({ v: e.v, label: e.label, hint: e.hint }))} value={experience} onPick={(v) => setExperience(v as Experience)} />
          </Field>
          <Field label="How you eat">
            <Choices options={DIETS} value={diet} onPick={(v) => setDiet(v as Diet)} />
          </Field>
          <Field label="Equipment you have (optional — bodyweight works too)">
            <div className="flex flex-wrap gap-2">
              {EQUIP.map((e) => (
                <button key={e.v} onClick={() => toggleEquip(e.v)}
                  className={`rounded-full border px-3.5 py-2 text-sm transition ${equipment.includes(e.v) ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-white/15 text-[var(--fg)]/80 hover:border-white/40"}`}>
                  {e.label}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={`Days / week: ${daysPerWeek}`}>
              <input type="range" min={1} max={6} value={daysPerWeek} onChange={(e) => setDays(+e.target.value)} className="w-full accent-[var(--accent)]" />
              <p className="mt-1 text-xs text-[var(--muted)]">~{daysPerWeek * 4} workouts/month</p>
            </Field>
            <Field label={`Plan length: ${weeks} weeks`}>
              <input type="range" min={2} max={12} value={weeks} onChange={(e) => setWeeks(+e.target.value)} className="w-full accent-[var(--accent)]" />
              <p className="mt-1 text-xs text-[var(--muted)]">it builds week over week</p>
            </Field>
          </div>

          <button onClick={generate}
            className="w-full rounded-xl bg-[var(--accent)] py-3.5 text-lg font-bold text-white transition active:scale-[0.99]">
            Build my plan →
          </button>
          <p className="text-center text-xs text-[var(--muted)]">
            Free · no account · runs on your device. New to exercise or have a condition? Check with a doctor first.
          </p>
        </div>
      </section>

      {plan && (
        <section id="plan" className="scroll-mt-6">
          <PlanView plan={plan} />
        </section>
      )}

      <footer className="mx-auto max-w-3xl px-5 py-10 text-center text-xs text-[var(--muted)]">
        Built by <a href="https://sinhaankur.com" className="underline">Ankur Sinha</a> · consistency over extremes.
      </footer>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[var(--fg)]/90">{label}</p>
      {children}
    </div>
  );
}

function Choices({ options, value, onPick }: { options: { v: string; label: string; hint?: string }[]; value: string; onPick: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((o) => (
        <button key={o.v} onClick={() => onPick(o.v)}
          className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${value === o.v ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-white/15 hover:border-white/40"}`}>
          <span className="font-semibold">{o.label}</span>
          {o.hint && <span className="mt-0.5 block text-xs text-[var(--muted)]">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}
