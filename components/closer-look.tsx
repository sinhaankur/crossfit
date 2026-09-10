"use client";

import { useState } from "react";
import type { Movement } from "@/lib/movements";
import { FigureStage } from "./figure-stage";

// CloserLook — the Apple "Take a closer look" gallery, for a movement. Big
// demonstrating figure on the right (drag to rotate), the form STEPS as a
// vertical chip list on the left with up/down steppers, and a caption card that
// changes per step. One focused thing at a time, lots of calm space.

export function CloserLook({ movements }: { movements: Movement[] }) {
  const [mi, setMi] = useState(0);
  const [step, setStep] = useState(0);
  const m = movements[mi];

  function chooseMovement(i: number) { setMi(i); setStep(0); }
  const clampStep = (n: number) => Math.max(0, Math.min(m.steps.length - 1, n));

  return (
    <section className="mx-auto max-w-5xl px-5">
      <h2 className="text-2xl font-bold sm:text-3xl">Take a closer look.</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">Pick a movement, step through the form, and drag the figure to see it from any angle.</p>

      {/* movement selector — quiet pills */}
      <div className="mt-5 flex flex-wrap gap-2">
        {movements.map((mv, i) => (
          <button key={mv.id} onClick={() => chooseMovement(i)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${i === mi ? "bg-[var(--fg)] text-[var(--bg)]" : "bg-white/5 text-[var(--muted)] hover:text-[var(--fg)]"}`}>
            {mv.name}
          </button>
        ))}
      </div>

      <div className="mt-6 grid items-stretch gap-6 rounded-3xl border border-[var(--line)] bg-[var(--card)] p-5 sm:p-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Left — steps as chips + steppers + caption card */}
        <div className="flex flex-col">
          <div className="flex items-start gap-3">
            {/* up/down steppers, like Apple's */}
            <div className="mt-1 flex flex-col gap-1.5">
              <Stepper dir="up" onClick={() => setStep((s) => clampStep(s - 1))} disabled={step === 0} />
              <Stepper dir="down" onClick={() => setStep((s) => clampStep(s + 1))} disabled={step === m.steps.length - 1} />
            </div>
            <ol className="flex-1 space-y-2">
              {m.steps.map((s, i) => (
                <li key={i}>
                  <button onClick={() => setStep(i)}
                    className={`flex w-full items-center gap-2.5 rounded-full border px-4 py-2 text-left text-sm transition ${i === step ? "border-transparent bg-[var(--accent)]/15 font-semibold text-[var(--fg)]" : "border-white/10 text-[var(--muted)] hover:border-white/25"}`}>
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${i === step ? "bg-[var(--accent)] text-white" : "bg-white/10 text-[var(--muted)]"}`}>{i + 1}</span>
                    <span className="truncate">{shortLabel(s)}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* caption card — the full current step + the safety note */}
          <div className="mt-4 rounded-2xl bg-black/25 p-4">
            <p className="text-[13px] font-bold uppercase tracking-wide text-[var(--muted)]">Step {step + 1} of {m.steps.length}</p>
            <p className="mt-1.5 text-[15px] leading-relaxed">{m.steps[step]}</p>
            <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200">⚠ {m.safety}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">Easier: {m.scale}</p>
          </div>
        </div>

        {/* Right — the demonstrating figure */}
        <div className="min-w-0">
          <FigureStage pattern={m.pattern} />
        </div>
      </div>
    </section>
  );
}

function Stepper({ dir, onClick, disabled }: { dir: "up" | "down"; onClick: () => void; disabled: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={dir === "up" ? "Previous step" : "Next step"}
      className="grid h-7 w-7 place-items-center rounded-full border border-white/15 text-[var(--muted)] transition hover:border-white/40 hover:text-[var(--fg)] disabled:opacity-30">
      {dir === "up" ? "▲" : "▼"}
    </button>
  );
}

// A short chip label from a full step sentence (first clause, trimmed).
function shortLabel(s: string): string {
  const first = s.split(/[.,;]/)[0].trim();
  return first.length > 42 ? first.slice(0, 40) + "…" : first;
}
