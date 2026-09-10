"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Movement } from "@/lib/movements";
import { ChevronLeft, ChevronRight, ShieldAlert, Check, Sparkles, Dumbbell } from "lucide-react";
import { award, loadGame, levelFor } from "@/lib/game";

// CloserLook — a SINGLE-SCREEN, gamified movement trainer. No long scroll: the 3D
// human fills the stage, form steps advance in a compact control, muscles show in
// a corner, and finishing every step "masters" the movement (XP + confetti). Fits
// in one viewport like an app screen.

const Human3D = dynamic(() => import("./human-3d").then((m) => m.Human3D), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-white/[0.04]" />,
});

export function CloserLook({ movements }: { movements: Movement[] }) {
  const [mi, setMi] = useState(0);
  const [step, setStep] = useState(0);
  const [xp, setXp] = useState(0);
  const [justMastered, setJustMastered] = useState(false);
  const seen = useRef<Set<number>>(new Set([0]));
  const m = movements[mi];
  const lvl = levelFor(xp);

  useEffect(() => { setXp(loadGame().xp); }, []);

  function go(i: number) {
    const next = Math.max(0, Math.min(m.steps.length - 1, i));
    setStep(next);
    seen.current.add(next);
    // Mastered when every step has been viewed.
    if (seen.current.size === m.steps.length) {
      const s = award("learnMovement", m.id);
      if (s.xp !== xp) { setXp(s.xp); setJustMastered(true); setTimeout(() => setJustMastered(false), 1800); }
    }
  }
  function chooseMovement(i: number) { setMi(i); setStep(0); seen.current = new Set([0]); }

  return (
    <section className="mx-auto flex h-[calc(100dvh-56px)] max-w-6xl flex-col px-4 pb-3 pt-3 sm:px-6">
      {/* top bar: title + XP */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-[var(--accent)]" />
          <h1 className="text-lg font-bold sm:text-xl">Learn the movement</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold">Lv {lvl.level} · {lvl.title}</span>
          <div className="hidden h-2 w-24 overflow-hidden rounded-full bg-white/10 sm:block">
            <div className="h-full bg-[var(--accent)] transition-[width]" style={{ width: `${lvl.pct * 100}%` }} />
          </div>
        </div>
      </div>

      {/* movement pills — horizontally scrollable, one line */}
      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {movements.map((mv, i) => (
          <button key={mv.id} onClick={() => chooseMovement(i)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition ${i === mi ? "bg-[var(--fg)] text-[var(--bg)]" : "bg-white/5 text-[var(--muted)] hover:text-[var(--fg)]"}`}>
            {mv.name}
          </button>
        ))}
      </div>

      {/* stage — fills remaining height */}
      <div className="relative mt-2 min-h-0 flex-1 overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--card)]">
        {/* the 3D human */}
        <div className="absolute inset-0"><Human3D pattern={m.pattern} /></div>

        {/* muscles — top-left overlay */}
        <div className="absolute left-3 top-3 max-w-[46%] rounded-2xl bg-black/45 p-3 backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">Muscles worked</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {m.primary.map((mu) => <span key={mu} className="rounded-full bg-[var(--accent)]/25 px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">{mu}</span>)}
            {m.secondary.slice(0, 3).map((mu) => <span key={mu} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-[var(--muted)]">{mu}</span>)}
          </div>
        </div>

        {/* mastered chip */}
        {seen.current.size === m.steps.length && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white">
            <Check className="h-3.5 w-3.5" /> Mastered
          </div>
        )}

        {/* gear — bottom-left: what you need, a no-cost alternative, the machine */}
        <details className="group absolute bottom-28 left-3 max-w-[70%] rounded-2xl bg-black/45 p-3 text-left backdrop-blur-sm">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">
            <Dumbbell className="h-3.5 w-3.5" /> Gear <span className="text-[9px] opacity-60 group-open:hidden">tap</span>
          </summary>
          <div className="mt-1.5 space-y-1 text-[12px]">
            <p><span className="text-[var(--accent)]">Use:</span> {m.gear.needed}</p>
            <p className="text-[var(--fg)]/80"><span className="text-[var(--muted)]">No kit?</span> {m.gear.alternatives[0]}</p>
            {m.gear.machine && <p className="text-[var(--fg)]/80"><span className="text-[var(--muted)]">Gym machine:</span> {m.gear.machine}</p>}
          </div>
        </details>

        {/* confetti-ish flash */}
        {justMastered && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="animate-bounce rounded-2xl bg-[var(--accent)] px-5 py-3 text-center text-white shadow-2xl">
              <Sparkles className="mx-auto h-6 w-6" />
              <p className="mt-1 font-bold">+25 XP · Movement mastered!</p>
            </div>
          </div>
        )}

        {/* step control — bottom overlay, single screen */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/55 to-transparent p-3 pt-10">
          {/* step dots */}
          <div className="mb-2 flex justify-center gap-1.5">
            {m.steps.map((_, i) => (
              <button key={i} onClick={() => go(i)} aria-label={`Step ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-[var(--accent)]" : seen.current.has(i) ? "w-1.5 bg-white/70" : "w-1.5 bg-white/25"}`} />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => go(step - 1)} disabled={step === 0}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Step {step + 1} of {m.steps.length}</p>
              <p className="mt-0.5 line-clamp-2 text-sm font-medium text-white sm:text-[15px]">{m.steps[step]}</p>
            </div>
            <button onClick={() => go(step + 1)} disabled={step === m.steps.length - 1}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-white transition hover:brightness-110 disabled:opacity-30">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          {/* safety line */}
          <p className="mx-auto mt-2 flex max-w-2xl items-start gap-1.5 rounded-lg bg-amber-500/15 px-2.5 py-1.5 text-[11px] leading-snug text-amber-200">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {m.safety}
          </p>
        </div>
      </div>
    </section>
  );
}
