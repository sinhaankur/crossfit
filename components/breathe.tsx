"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { speak, stopSpeaking, speechSupported } from "@/lib/speak";

// Breathe — a calm box-breathing guide (4-4-4-4): breathe in, hold, out, hold.
// An expanding/holding/contracting ring paces you; optional on-device voice
// says each phase. Everything on-device + deterministic. Respects reduced-motion
// (the ring still scales but without easing fuss). This is the "down-regulate"
// tool the stress-aware Today card points to.

type Phase = { label: string; secs: number; scale: number };
const CYCLE: Phase[] = [
  { label: "Breathe in", secs: 4, scale: 1.0 },
  { label: "Hold", secs: 4, scale: 1.0 },
  { label: "Breathe out", secs: 4, scale: 0.55 },
  { label: "Hold", secs: 4, scale: 0.55 },
];
const TOTAL_ROUNDS = 6; // ~1.5 min — a real reset without dragging

export function Breathe() {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [round, setRound] = useState(0);
  const [remaining, setRemaining] = useState(CYCLE[0].secs);
  const [voice, setVoice] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCanSpeak(speechSupported());
    try { if (localStorage.getItem("kelo-voice") === "1") setVoice(true); } catch {}
    return () => { stopSpeaking(); if (tick.current) clearInterval(tick.current); };
  }, []);

  const phase = CYCLE[phaseIdx];

  // Announce each phase when it starts (if voice on).
  useEffect(() => {
    if (running && voice) speak(phase.label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIdx, running]);

  useEffect(() => {
    if (!running) { if (tick.current) clearInterval(tick.current); return; }
    tick.current = setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        // advance phase
        setPhaseIdx((pi) => {
          const next = (pi + 1) % CYCLE.length;
          if (next === 0) {
            setRound((rd) => {
              const nr = rd + 1;
              if (nr >= TOTAL_ROUNDS) { setRunning(false); }
              return nr;
            });
          }
          return next;
        });
        return CYCLE[(phaseIdx + 1) % CYCLE.length].secs;
      });
    }, 1000);
    return () => { if (tick.current) clearInterval(tick.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIdx]);

  function toggle() {
    if (running) { setRunning(false); stopSpeaking(); return; }
    // (re)start from the top
    setPhaseIdx(0); setRound(0); setRemaining(CYCLE[0].secs); setRunning(true);
    if (voice) speak("Let's breathe. In.");
  }
  function toggleVoice() {
    const n = !voice; setVoice(n);
    try { localStorage.setItem("kelo-voice", n ? "1" : "0"); } catch {}
    if (!n) stopSpeaking();
  }

  const finished = !running && round >= TOTAL_ROUNDS;

  return (
    <div className="flex flex-col items-center">
      {/* the pacing ring */}
      <div className="relative grid h-72 w-72 place-items-center">
        <div
          className="absolute h-56 w-56 rounded-full bg-[var(--accent)]/20 transition-transform ease-in-out motion-reduce:transition-none"
          style={{ transform: `scale(${running ? phase.scale : 0.7})`, transitionDuration: `${phase.secs}s` }}
        />
        <div
          className="absolute h-40 w-40 rounded-full bg-[var(--accent)]/30 transition-transform ease-in-out motion-reduce:transition-none"
          style={{ transform: `scale(${running ? phase.scale : 0.7})`, transitionDuration: `${phase.secs}s` }}
        />
        <div className="relative z-10 text-center">
          <p className="font-display text-3xl font-light text-[var(--fg)]">
            {finished ? "Done" : running ? phase.label : "Ready"}
          </p>
          {running && <p className="mt-1 text-5xl font-bold tabular-nums text-[var(--accent)]">{remaining}</p>}
          {running && <p className="mt-1 text-xs text-[var(--muted)]">Round {Math.min(round + 1, TOTAL_ROUNDS)} of {TOTAL_ROUNDS}</p>}
          {finished && <p className="mt-1 text-sm text-[var(--muted)]">However you feel now is enough.</p>}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={toggle}
          className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-white transition hover:brightness-110">
          {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> {finished ? "Again" : "Begin"}</>}
        </button>
        {canSpeak && (
          <button onClick={toggleVoice} aria-pressed={voice}
            className={`flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-semibold transition ${voice ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-white/5 text-[var(--muted)] hover:text-white"}`}>
            {voice ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {voice ? "Voice on" : "Voice"}
          </button>
        )}
      </div>
      <p className="mt-4 max-w-sm text-center text-xs leading-relaxed text-[var(--muted)]">
        Box breathing — in for four, hold four, out for four, hold four. It gently steadies your
        nervous system. Nothing to achieve here; just follow the ring.
      </p>
    </div>
  );
}
