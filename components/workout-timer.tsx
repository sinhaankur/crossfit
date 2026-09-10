"use client";

import { useEffect, useRef, useState } from "react";

// WorkoutTimer — the three timers CrossFit actually uses, on-device, no deps:
//  · Stopwatch — count up (for "for time" workouts).
//  · Countdown — set minutes:seconds and go (for a capped effort).
//  · Interval — work/rest rounds (EMOM / Tabata style), with a beep + colour flip.
// Kept simple and legible so it's usable mid-workout on a phone.

type Mode = "stopwatch" | "countdown" | "interval";

export function WorkoutTimer() {
  const [mode, setMode] = useState<Mode>("stopwatch");
  const [running, setRunning] = useState(false);
  const [ms, setMs] = useState(0);
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);

  // countdown target + interval config
  const [cdMin, setCdMin] = useState(10);
  const [work, setWork] = useState(30);
  const [rest, setRest] = useState(30);
  const [rounds, setRounds] = useState(8);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<"work" | "rest">("work");

  useEffect(() => {
    if (!running) return;
    last.current = performance.now();
    const tick = (now: number) => {
      const dt = now - last.current;
      last.current = now;
      setMs((m) => m + (mode === "stopwatch" ? dt : -dt));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [running, mode]);

  // handle countdown/interval hitting zero
  useEffect(() => {
    if (mode === "stopwatch" || ms > 0) return;
    if (mode === "countdown") { beep(); setRunning(false); setMs(0); return; }
    if (mode === "interval") {
      beep();
      if (phase === "work") { setPhase("rest"); setMs(rest * 1000); }
      else {
        if (round >= rounds) { setRunning(false); setMs(0); }
        else { setRound((r) => r + 1); setPhase("work"); setMs(work * 1000); }
      }
    }
  }, [ms, mode, phase, round, rounds, work, rest]);

  function start() {
    if (mode === "countdown" && ms <= 0) setMs(cdMin * 60 * 1000);
    if (mode === "interval" && ms <= 0) { setRound(1); setPhase("work"); setMs(work * 1000); }
    setRunning(true);
  }
  function reset() {
    setRunning(false); setMs(0); setRound(1); setPhase("work");
  }

  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  const intervalColor = mode === "interval" ? (phase === "work" ? "text-emerald-400" : "text-sky-400") : "text-[var(--fg)]";

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
      <div className="flex gap-1 rounded-full bg-white/5 p-1 text-xs">
        {(["stopwatch", "countdown", "interval"] as Mode[]).map((m) => (
          <button key={m} onClick={() => { setMode(m); reset(); }}
            className={`flex-1 rounded-full py-1.5 font-semibold capitalize transition ${mode === m ? "bg-[var(--accent)] text-white" : "text-[var(--muted)]"}`}>
            {m}
          </button>
        ))}
      </div>

      <div className={`mt-3 text-center font-mono text-5xl font-bold tabular-nums ${intervalColor}`}>
        {mm}:{ss}
      </div>
      {mode === "interval" && (
        <p className="text-center text-sm font-semibold text-[var(--muted)]">
          Round {round}/{rounds} · <span className={phase === "work" ? "text-emerald-400" : "text-sky-400"}>{phase === "work" ? "WORK" : "REST"}</span>
        </p>
      )}

      {/* config (only the relevant one) */}
      {mode === "countdown" && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm">
          <label className="text-[var(--muted)]">Minutes</label>
          <input type="number" min={1} max={60} value={cdMin} onChange={(e) => setCdMin(+e.target.value)}
            className="w-16 rounded-lg border border-white/15 bg-black/30 px-2 py-1 text-center" />
        </div>
      )}
      {mode === "interval" && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
          {[["Work s", work, setWork], ["Rest s", rest, setRest], ["Rounds", rounds, setRounds]].map(([lbl, val, set]) => (
            <label key={lbl as string} className="text-[var(--muted)]">
              {lbl as string}
              <input type="number" min={1} value={val as number} onChange={(e) => (set as (n: number) => void)(+e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-2 py-1 text-center text-[var(--fg)]" />
            </label>
          ))}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={running ? () => setRunning(false) : start}
          className="rounded-xl bg-[var(--accent)] py-2.5 font-bold text-white transition active:scale-95">
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={reset} className="rounded-xl bg-white/10 py-2.5 font-bold transition active:scale-95">Reset</button>
      </div>
    </div>
  );
}

function beep() {
  try {
    const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    const ctx = new Ctx();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.25, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o.start(); o.stop(ctx.currentTime + 0.35);
  } catch { /* audio may be blocked until interaction */ }
}
