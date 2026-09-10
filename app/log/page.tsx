"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteNav } from "@/components/site-nav";
import {
  loadLog, saveLog, personalRecords, newId, exportLog,
  SCORING_LABEL, type WOD, type WODScoring,
} from "@/lib/wod-log";

// The WOD log — record workouts (For Time / AMRAP / Load / Reps, mirroring Kelo),
// track personal records, log calories burned from a watch (effort + motivation),
// and export it all as JSON that Kelo can import. Everything on-device.

const SCORINGS: WODScoring[] = ["forTime", "amrap", "load", "reps"];

export default function LogPage() {
  const [log, setLog] = useState<WOD[]>([]);
  useEffect(() => { setLog(loadLog()); }, []);

  const [name, setName] = useState("");
  const [scoring, setScoring] = useState<WODScoring>("forTime");
  const [result, setResult] = useState("");
  const [rxd, setRxd] = useState(false);
  const [cals, setCals] = useState("");
  const [note, setNote] = useState("");

  function add() {
    if (!name.trim() || !result.trim()) return;
    const w: WOD = {
      id: newId(),
      date: new Date().toISOString().slice(0, 10),
      name: name.trim(), scoring, result: result.trim(), rxd,
      caloriesBurned: cals ? Math.max(0, parseInt(cals, 10)) : undefined,
      note: note.trim() || undefined,
    };
    const next = [w, ...log];
    setLog(next); saveLog(next);
    setName(""); setResult(""); setCals(""); setNote(""); setRxd(false);
  }
  function remove(id: string) {
    const next = log.filter((w) => w.id !== id);
    setLog(next); saveLog(next);
  }
  function download() {
    const blob = new Blob([exportLog(log)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "crossfit-log.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const prs = useMemo(() => personalRecords(log), [log]);
  const totalCals = log.reduce((s, w) => s + (w.caloriesBurned || 0), 0);
  const streak = useMemo(() => weekCount(log), [log]);

  return (
    <main className="min-h-dvh">
      <SiteNav />
      <div className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="text-3xl font-bold">Your log</h1>
        <p className="mt-2 text-[var(--fg)]/70">Log every workout. Track your PRs. See the effort add up — that&rsquo;s the motivation.</p>

        {/* At-a-glance */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat n={log.length} label="Workouts" />
          <Stat n={streak} label="This week" />
          <Stat n={totalCals} label="Cals burned" accent />
        </div>

        {/* Add a workout */}
        <div className="mt-6 space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--muted)]">Log a workout</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name — Fran, Back Squat 5x5, Row 2k…" className={inp} />
          <div className="flex flex-wrap gap-1 rounded-full bg-white/5 p-1 text-xs">
            {SCORINGS.map((s) => (
              <button key={s} onClick={() => setScoring(s)}
                className={`flex-1 rounded-full py-1.5 font-semibold transition ${scoring === s ? "bg-[var(--accent)] text-white" : "text-[var(--muted)]"}`}>
                {SCORING_LABEL[s]}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={result} onChange={(e) => setResult(e.target.value)} placeholder={resultHint(scoring)} className={inp} />
            <input value={cals} onChange={(e) => setCals(e.target.value)} inputMode="numeric" placeholder="Cals (watch, optional)" className={inp} />
          </div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (how it felt, scaling…)" className={inp} />
          <label className="flex items-center gap-2 text-sm text-[var(--fg)]/85">
            <input type="checkbox" checked={rxd} onChange={(e) => setRxd(e.target.checked)} /> As prescribed (RX&rsquo;d)
          </label>
          <button onClick={add} disabled={!name.trim() || !result.trim()}
            className="w-full rounded-xl bg-[var(--accent)] py-3 font-bold text-white transition active:scale-[0.99] disabled:opacity-40">
            + Log it
          </button>
        </div>

        {/* PRs */}
        {prs.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Personal records 🏆</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {prs.map((pr) => (
                <div key={pr.name} className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-3">
                  <p className="font-semibold">{pr.name}</p>
                  <p className="text-sm text-[var(--accent)]">{pr.best} <span className="text-[var(--muted)]">· {SCORING_LABEL[pr.scoring]} · {pr.date}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">History</h2>
            {log.length > 0 && <button onClick={download} className="text-xs text-[var(--muted)] underline hover:text-[var(--fg)]">Export JSON (for Kelo)</button>}
          </div>
          {log.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-[var(--muted)]">No workouts yet — log your first above.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {log.map((w) => (
                <div key={w.id} className="flex items-start justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--card)] p-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{w.name} {w.rxd && <span className="text-xs text-emerald-400">RX</span>}</p>
                    <p className="text-sm text-[var(--fg)]/80">{w.result} · {SCORING_LABEL[w.scoring]}{w.caloriesBurned ? ` · ${w.caloriesBurned} cal` : ""}</p>
                    <p className="text-xs text-[var(--muted)]">{w.date}{w.note ? ` · ${w.note}` : ""}</p>
                  </div>
                  <button onClick={() => remove(w.id)} aria-label="Delete" className="shrink-0 text-[var(--muted)] hover:text-rose-400">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-[var(--muted)]">Saved on this device only. Same WOD vocabulary as the Kelo app — export moves your log there.</p>
      </div>
    </main>
  );
}

const inp = "w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)] focus:outline-none";

function resultHint(s: WODScoring) {
  return s === "forTime" ? "Time — 3:41" : s === "amrap" ? "Rounds + reps — 12+5" : s === "load" ? "Weight — 80 kg" : "Total reps — 220";
}
function Stat({ n, label, accent }: { n: number; label: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-3 text-center">
      <p className={`text-2xl font-bold tabular-nums ${accent ? "text-[var(--accent)]" : ""}`}>{n}</p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
function weekCount(log: WOD[]): number {
  const now = new Date(); const day = now.getDay(); const mon = new Date(now); mon.setDate(now.getDate() - ((day + 6) % 7)); mon.setHours(0, 0, 0, 0);
  return log.filter((w) => { const d = new Date(w.date); return d >= mon; }).length;
}
