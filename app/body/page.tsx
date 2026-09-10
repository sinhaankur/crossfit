"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import {
  estimate1RM, workingWeight, loadOneRMs, saveOneRMs,
  LIFT_LABEL, type Lift, type OneRMs,
} from "@/lib/strength";
import {
  loadBody, saveBody, loadGoals, saveGoals, goalProgress, trend, newId,
  type BodyEntry, type Goal, type GoalKind,
} from "@/lib/body";

// /body — the "build the body" surface: your lifts (1RM + working weights),
// body measurements over time, and goals. On-device, no login (guest works).

const LIFTS: Lift[] = ["back-squat", "deadlift", "shoulder-press", "bench-press", "clean", "front-squat"];
const PCTS = [0.7, 0.75, 0.8, 0.85, 0.9];

export default function BodyPage() {
  const [tab, setTab] = useState<"lifts" | "measure" | "goals">("lifts");
  return (
    <main className="min-h-dvh">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="text-3xl font-bold">Build your body</h1>
        <p className="mt-2 text-[var(--fg)]/70">Your lifts, your measurements, your goals — this is where you actually build, and where you see it change.</p>
        <div className="mt-5 flex gap-1 rounded-full bg-white/5 p-1 text-sm">
          {(["lifts", "measure", "goals"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-full py-2 font-semibold capitalize transition ${tab === t ? "bg-[var(--accent)] text-white" : "text-[var(--muted)]"}`}>{t}</button>
          ))}
        </div>
        {tab === "lifts" && <Lifts />}
        {tab === "measure" && <Measure />}
        {tab === "goals" && <Goals />}
      </div>
    </main>
  );
}

function Lifts() {
  const [oneRMs, setOneRMs] = useState<OneRMs>({});
  useEffect(() => { setOneRMs(loadOneRMs()); }, []);
  const [lift, setLift] = useState<Lift>("back-squat");
  const [weight, setWeight] = useState(""); const [reps, setReps] = useState("");
  const est = weight && reps ? estimate1RM(+weight, +reps) : 0;

  function save1RM(v: number) {
    const next = { ...oneRMs, [lift]: v }; setOneRMs(next); saveOneRMs(next);
    setWeight(""); setReps("");
  }
  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">1-rep-max calculator</p>
        <p className="mt-1 text-sm text-[var(--fg)]/70">Lift a weight for a few reps, and we&rsquo;ll estimate your max + set your working weights.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <select value={lift} onChange={(e) => setLift(e.target.value as Lift)} className={inp}>
            {LIFTS.map((l) => <option key={l} value={l}>{LIFT_LABEL[l]}</option>)}
          </select>
          <div />
          <input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" placeholder="Weight" className={inp} />
          <input value={reps} onChange={(e) => setReps(e.target.value)} inputMode="numeric" placeholder="Reps" className={inp} />
        </div>
        {est > 0 && (
          <div className="mt-3 rounded-xl bg-[var(--accent)]/10 p-3">
            <p className="text-sm">Estimated 1RM: <span className="text-lg font-bold text-[var(--accent)]">{est}</span></p>
            <button onClick={() => save1RM(est)} className="mt-2 rounded-full bg-[var(--accent)] px-4 py-1.5 text-sm font-bold text-white">Save as my {LIFT_LABEL[lift]} max</button>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Your lifts & working weights</p>
        <div className="mt-3 space-y-3">
          {LIFTS.map((l) => {
            const rm = oneRMs[l];
            return (
              <div key={l} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold">{LIFT_LABEL[l]}</p>
                  <p className="text-sm text-[var(--muted)]">{rm ? <>1RM <span className="font-bold text-[var(--accent)]">{rm}</span></> : "not set"}</p>
                </div>
                {rm ? (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {PCTS.map((p) => (
                      <span key={p} className="rounded-full bg-white/5 px-2.5 py-1">{Math.round(p * 100)}% · <b>{workingWeight(rm, p)}</b></span>
                    ))}
                  </div>
                ) : <p className="mt-1 text-xs text-[var(--muted)]">Use the calculator above to set it.</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Measure() {
  const [entries, setEntries] = useState<BodyEntry[]>([]);
  useEffect(() => { setEntries(loadBody()); }, []);
  const [w, setW] = useState(""); const [waist, setWaist] = useState(""); const [chest, setChest] = useState(""); const [arms, setArms] = useState("");
  function add() {
    if (!w && !waist && !chest && !arms) return;
    const e: BodyEntry = { date: new Date().toISOString().slice(0, 10),
      weight: num(w), waist: num(waist), chest: num(chest), arms: num(arms) };
    const next = [...entries, e]; setEntries(next); saveBody(next);
    setW(""); setWaist(""); setChest(""); setArms("");
  }
  const weightTrend = useMemo(() => trend(entries, "weight"), [entries]);
  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">Log measurements</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Labeled l="Weight"><input value={w} onChange={(e) => setW(e.target.value)} inputMode="decimal" className={inp} /></Labeled>
          <Labeled l="Waist"><input value={waist} onChange={(e) => setWaist(e.target.value)} inputMode="decimal" className={inp} /></Labeled>
          <Labeled l="Chest"><input value={chest} onChange={(e) => setChest(e.target.value)} inputMode="decimal" className={inp} /></Labeled>
          <Labeled l="Arms"><input value={arms} onChange={(e) => setArms(e.target.value)} inputMode="decimal" className={inp} /></Labeled>
        </div>
        <button onClick={add} className="mt-3 w-full rounded-xl bg-[var(--accent)] py-2.5 font-bold text-white">+ Log today</button>
      </div>
      {weightTrend.length > 1 && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">Weight trend</p>
          <Sparkline values={weightTrend} />
          <p className="mt-1 text-xs text-[var(--muted)]">{weightTrend[0]} → {weightTrend[weightTrend.length - 1]}</p>
        </div>
      )}
      {entries.length > 0 && (
        <div className="space-y-2">
          {[...entries].reverse().map((e, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 text-sm">
              <span className="text-[var(--muted)]">{e.date}</span>
              <span>{[e.weight && `wt ${e.weight}`, e.waist && `waist ${e.waist}`, e.chest && `chest ${e.chest}`, e.arms && `arms ${e.arms}`].filter(Boolean).join(" · ")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  useEffect(() => { setGoals(loadGoals()); }, []);
  const [kind, setKind] = useState<GoalKind>("lift");
  const [label, setLabel] = useState(""); const [target, setTarget] = useState(""); const [current, setCurrent] = useState(""); const [unit, setUnit] = useState("");
  function add() {
    if (!label.trim() || !target) return;
    const g: Goal = { id: newId(), kind, label: label.trim(), target: +target, current: +current || 0, unit: unit.trim() || undefined, createdAt: new Date().toISOString().slice(0, 10), done: false };
    const next = [g, ...goals]; setGoals(next); saveGoals(next);
    setLabel(""); setTarget(""); setCurrent(""); setUnit("");
  }
  function update(id: string, patch: Partial<Goal>) {
    const next = goals.map((g) => g.id === id ? { ...g, ...patch } : g); setGoals(next); saveGoals(next);
  }
  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">Set a goal</p>
        <div className="mt-3 flex flex-wrap gap-1 rounded-full bg-white/5 p-1 text-xs">
          {(["lift", "weight", "measurement", "habit"] as GoalKind[]).map((k) => (
            <button key={k} onClick={() => setKind(k)} className={`flex-1 rounded-full py-1.5 font-semibold capitalize transition ${kind === k ? "bg-[var(--accent)] text-white" : "text-[var(--muted)]"}`}>{k}</button>
          ))}
        </div>
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder='Goal — "Back Squat 100", "Waist 32", "Train 3×/week"' className={`${inp} mt-2`} />
        <div className="mt-2 grid grid-cols-3 gap-2">
          <input value={current} onChange={(e) => setCurrent(e.target.value)} inputMode="decimal" placeholder="Now" className={inp} />
          <input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="decimal" placeholder="Target" className={inp} />
          <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit" className={inp} />
        </div>
        <button onClick={add} className="mt-3 w-full rounded-xl bg-[var(--accent)] py-2.5 font-bold text-white">+ Add goal</button>
      </div>
      <div className="space-y-3">
        {goals.map((g) => {
          const p = goalProgress(g);
          return (
            <div key={g.id} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold">{g.label}</p>
                <span className="text-xs text-[var(--muted)]">{g.current}{g.unit ? g.unit : ""} → {g.target}{g.unit ? g.unit : ""}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-[var(--accent)] transition-[width]" style={{ width: `${Math.round(p * 100)}%` }} />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input defaultValue={g.current} onBlur={(e) => update(g.id, { current: +e.target.value || 0 })} inputMode="decimal" className={`${inp} w-24 py-1`} />
                <span className="text-xs text-[var(--muted)]">update current</span>
                <button onClick={() => update(g.id, { done: !g.done })} className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${g.done ? "bg-emerald-500 text-white" : "border border-white/20 text-[var(--muted)]"}`}>{g.done ? "✓ Reached" : "Mark reached"}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const inp = "w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] focus:outline-none";
function Labeled({ l, children }: { l: string; children: React.ReactNode }) {
  return <label className="text-xs text-[var(--muted)]">{l}{children}</label>;
}
function num(s: string) { const n = parseFloat(s); return Number.isFinite(n) ? n : undefined; }
function Sparkline({ values }: { values: number[] }) {
  const w = 280, h = 44, min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / span) * h}`).join(" ");
  return <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full"><polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="2" /></svg>;
}
