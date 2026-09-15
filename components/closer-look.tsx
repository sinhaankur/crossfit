"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Movement } from "@/lib/movements";
import { ChevronLeft, ChevronRight, ShieldAlert, Check, Sparkles, Dumbbell, Activity, PersonStanding, Accessibility, Volume2, VolumeX, Users } from "lucide-react";
import { award, loadGame, levelFor } from "@/lib/game";
import { MuscleMap } from "./muscle-map";
import { musclesFor, MUSCLE_PLAIN, MUSCLE_LABEL, MUSCLE_DOES, type MuscleId } from "@/lib/anatomy";
import { speak, stopSpeaking, speechSupported } from "@/lib/speak";
import { AGE_PROFILES, AGE_ORDER, suggestsAdaptive, type AgeGroup } from "@/lib/age-groups";

// CloserLook — a SINGLE-SCREEN, gamified movement trainer. No long scroll: the 3D
// human fills the stage, form steps advance in a compact control, muscles show in
// a corner, and finishing every step "masters" the movement (XP + confetti). Fits
// in one viewport like an app screen.

// The real anatomical human (Z-Anatomy muscle body) — the default 3D view. Loaded
// client-only (WebGL/window). Falls back to the 2D map inside if it can't load.
const AnatomyHuman = dynamic(() => import("./anatomy-human").then((m) => m.AnatomyHuman), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-white/[0.04]" />,
});

// The rigged figure DOING the rep, with its equipment (barbell / pull-up bar /
// box / mat). Complements the anatomy view: muscles show WHAT's worked, this
// shows HOW it's done + the gear, so the movement reads at a glance.
const Human3D = dynamic(() => import("./human-3d").then((m) => m.Human3D), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-white/[0.04]" />,
});

export function CloserLook({ movements }: { movements: Movement[] }) {
  const [mi, setMi] = useState(0);
  const [step, setStep] = useState(0);
  const [xp, setXp] = useState(0);
  const [justMastered, setJustMastered] = useState(false);
  // Three views: the rigged figure doing the rep with gear (default — clearest
  // "how"), the anatomical muscle body (what's worked), the flat 2D map.
  const [view, setView] = useState<"action" | "anatomy" | "map">("action");
  // Which muscle chip is expanded (plain name → proper name + what it does).
  const [openMuscle, setOpenMuscle] = useState<MuscleId | null>(null);
  // Adaptive variant index: -1 = the standard movement; 0..n = m.adaptive[i]
  // (seated / chair-supported / low-impact). "Exercise for all" — the same rep,
  // a dignified way to do it from a chair or with support.
  const [variant, setVariant] = useState(-1);
  // Voice coaching (on-device speech): reads the current step aloud, hands-free
  // + accessible. Opt-in, off by default; persists the choice.
  const [voice, setVoice] = useState(false);
  // Client-only "can we speak?" — checked after mount so the button's presence
  // matches between server and client (no hydration mismatch).
  const [canSpeak, setCanSpeak] = useState(false);
  // Age group — reshapes the coaching guidance (reps/tempo/safety) for whoever's
  // training. "adults" default; persisted. Deterministic data, no model.
  const [age, setAge] = useState<AgeGroup>("adults");
  const [ageOpen, setAgeOpen] = useState(false);
  const seen = useRef<Set<number>>(new Set([0]));
  const m = movements[mi];
  // Canonical worked-muscles for this movement (drives the plain-language chips
  // + the tap-to-learn card; same source as the glowing 3D muscle + the map).
  const muscles = musclesFor(m.pattern);
  const lvl = levelFor(xp);

  // The ACTIVE cues — standard movement, or the selected adaptive variant. Every
  // step/safety read below uses these so switching to "Seated" reflows the whole
  // trainer to the adapted version.
  const av = variant >= 0 ? m.adaptive?.[variant] : undefined;
  const activeSteps = av ? av.steps : m.steps;
  const activeSafety = av ? av.safety : m.safety;

  useEffect(() => { setXp(loadGame().xp); }, []);
  // Restore the voice preference; stop any speech when the trainer unmounts.
  useEffect(() => {
    setCanSpeak(speechSupported());
    try { if (localStorage.getItem("kelo-voice") === "1") setVoice(true); } catch {}
    try { const a = localStorage.getItem("kelo-age") as AgeGroup | null; if (a && AGE_PROFILES[a]) setAge(a); } catch {}
    return () => stopSpeaking();
  }, []);
  function chooseAge(a: AgeGroup) {
    setAge(a); setAgeOpen(false);
    try { localStorage.setItem("kelo-age", a); } catch {}
  }
  const ageProfile = AGE_PROFILES[age];
  // Read the current step aloud whenever voice is on and the step / movement /
  // variant changes. On-device speech; silent no-op where unsupported.
  useEffect(() => {
    if (voice) speak(activeSteps[step]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice, step, mi, variant]);
  function toggleVoice() {
    const next = !voice;
    setVoice(next);
    try { localStorage.setItem("kelo-voice", next ? "1" : "0"); } catch {}
    if (next) speak(activeSteps[step]); else stopSpeaking();
  }

  function go(i: number) {
    const next = Math.max(0, Math.min(activeSteps.length - 1, i));
    setStep(next);
    seen.current.add(next);
    // Mastered when every step has been viewed. (Standard version only — the
    // adaptive variants are alternatives, not a separate mastery track.)
    if (!av && seen.current.size === m.steps.length) {
      const s = award("learnMovement", m.id);
      if (s.xp !== xp) { setXp(s.xp); setJustMastered(true); setTimeout(() => setJustMastered(false), 1800); }
    }
  }
  function chooseMovement(i: number) { setMi(i); setStep(0); seen.current = new Set([0]); setOpenMuscle(null); setVariant(-1); }
  function chooseVariant(v: number) { setVariant(v); setStep(0); seen.current = new Set([0]); }
  // Open a muscle's learn card; if voice is on, also read it aloud (plain name +
  // what it does) — pairs with the plain-language names for accessibility.
  function tapMuscle(id: MuscleId) {
    const next = openMuscle === id ? null : id;
    setOpenMuscle(next);
    if (next && voice) speak(`${MUSCLE_PLAIN[next]}. ${MUSCLE_DOES[next]}`);
  }

  return (
    <section className="mx-auto flex h-[calc(100dvh-56px)] max-w-6xl flex-col px-4 pb-3 pt-3 sm:px-6">
      {/* top bar: title + XP */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-[var(--accent)]" />
          <h1 className="text-lg font-bold sm:text-xl">Learn the movement</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice coaching toggle — reads each step aloud, on-device. Hands-free
              + accessibility. Hidden entirely where the browser has no speech.
              (canSpeak is set after mount → no SSR/client hydration mismatch.) */}
          {canSpeak && (
            <button onClick={toggleVoice} aria-pressed={voice}
              aria-label={voice ? "Turn off voice coaching" : "Turn on voice coaching"}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${voice ? "bg-[var(--accent)] text-white" : "bg-white/5 text-[var(--muted)] hover:text-white"}`}>
              {voice ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{voice ? "Voice on" : "Voice"}</span>
            </button>
          )}
          {/* Age group — reshapes the coaching guidance below for whoever's
              training (kids → older adults). Small dropdown; persisted. */}
          <div className="relative">
            <button onClick={() => setAgeOpen((v) => !v)} aria-expanded={ageOpen}
              className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-[var(--muted)] hover:text-white transition">
              <Users className="h-3.5 w-3.5" /> {ageProfile.label}
            </button>
            {ageOpen && (
              <div className="absolute right-0 z-30 mt-1 w-44 rounded-xl border border-[var(--line)] bg-[var(--card)] p-1 shadow-2xl">
                {AGE_ORDER.map((a) => (
                  <button key={a} onClick={() => chooseAge(a)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${a === age ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "text-[var(--fg)] hover:bg-white/5"}`}>
                    <span className="font-semibold">{AGE_PROFILES[a].label}</span>
                    <span className="text-[10px] text-[var(--muted)]">{AGE_PROFILES[a].range}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
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
        {/* Three synced views of the same movement: the rigged figure doing the
            rep WITH its equipment (default — clearest "how"), the anatomical
            muscle body (what's worked, glowing), the flat 2D map. */}
        <div className="absolute inset-0">
          {view === "map"
            ? <div className="grid h-full place-items-center overflow-auto p-4"><div className="w-full max-w-md"><MuscleMap pattern={m.pattern} /></div></div>
            : view === "anatomy"
              ? <AnatomyHuman pattern={m.pattern} />
              : <Human3D pattern={m.pattern} variant={av?.kind === "seated" ? "seated" : av?.kind === "supported" ? "supported" : undefined} />}
        </div>

        {/* view switch: Action (rep + gear) · Muscles · Map — a 3-segment pill */}
        <div className="absolute right-3 top-3 flex items-center gap-0.5 rounded-full bg-black/55 p-0.5 backdrop-blur-sm">
          {([
            ["action", PersonStanding, "Action"],
            ["anatomy", Activity, "Muscles"],
            ["map", Dumbbell, "Map"],
          ] as const).map(([key, Icon, label]) => (
            <button key={key} onClick={() => setView(key)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${view === key ? "bg-[var(--accent)] text-white" : "text-white/70 hover:text-white"}`}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* quick muscle chips (over the figure views, not the flat map) —
            PLAIN-LANGUAGE + tap to learn. Beginners don't know muscle names
            ("erector spinae"?), so each chip shows the everyday body-part name
            and, on tap, reveals the proper name + what it does + where it is.
            Driven by the pattern's canonical muscles so the label, the glowing
            3D muscle, and the map all agree. */}
        {view !== "map" && (
          <div className="absolute left-3 top-3 max-w-[52%] rounded-2xl bg-black/45 p-3 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">Muscles worked · tap to learn</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {muscles.primary.map((id) => (
                <button key={id} onClick={() => tapMuscle(id)}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition ${openMuscle === id ? "bg-[var(--accent)] text-white" : "bg-[var(--accent)]/25 text-[var(--accent)] hover:bg-[var(--accent)]/40"}`}>
                  {MUSCLE_PLAIN[id]}
                </button>
              ))}
              {muscles.secondary.slice(0, 4).map((id) => (
                <button key={id} onClick={() => tapMuscle(id)}
                  className={`rounded-full px-2 py-0.5 text-[11px] transition ${openMuscle === id ? "bg-white/25 text-white" : "bg-white/10 text-[var(--muted)] hover:bg-white/20 hover:text-white"}`}>
                  {MUSCLE_PLAIN[id]}
                </button>
              ))}
            </div>
            {openMuscle && (
              <div className="mt-2 border-t border-white/10 pt-2">
                <p className="text-[12px] font-bold text-[var(--fg)]">{MUSCLE_PLAIN[openMuscle]}
                  <span className="ml-1.5 text-[10px] font-normal text-[var(--muted)]">{MUSCLE_LABEL[openMuscle]}</span>
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-[var(--fg)]/80">{MUSCLE_DOES[openMuscle]}</p>
              </div>
            )}
          </div>
        )}

        {/* mastered chip — top-center so it never collides with the toggle */}
        {!av && seen.current.size === m.steps.length && (
          <div className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold text-white">
            <Check className="h-3.5 w-3.5" /> Mastered
          </div>
        )}

        {/* gear — bottom-left: what you need, a no-cost alternative, the machine */}
        <details className="group absolute bottom-28 left-3 max-w-[70%] rounded-2xl bg-black/45 p-3 text-left backdrop-blur-sm">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">
            <Dumbbell className="h-3.5 w-3.5" /> Gear <span className="text-[9px] opacity-60 group-open:hidden">tap</span>
          </summary>
          <div className="mt-1.5 space-y-1 text-[12px]">
            {av ? (
              <p><span className="text-[var(--accent)]">Use:</span> {av.gear}</p>
            ) : (
              <>
                <p><span className="text-[var(--accent)]">Use:</span> {m.gear.needed}</p>
                <p className="text-[var(--fg)]/80"><span className="text-[var(--muted)]">No kit?</span> {m.gear.alternatives[0]}</p>
                {m.gear.machine && <p className="text-[var(--fg)]/80"><span className="text-[var(--muted)]">Gym machine:</span> {m.gear.machine}</p>}
              </>
            )}
          </div>
        </details>

        {/* age-appropriate guidance — bottom-left, above the gear. Reps + the
            safety emphasis that matters most at the chosen age. For older adults,
            a gentle nudge toward the seated/supported variant when one exists. */}
        <details className="group absolute bottom-[10.5rem] left-3 max-w-[70%] rounded-2xl bg-black/45 p-3 text-left backdrop-blur-sm">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">
            <Users className="h-3.5 w-3.5" /> {ageProfile.label} · {ageProfile.range}
            <span className="text-[9px] opacity-60 group-open:hidden">tap</span>
          </summary>
          <div className="mt-1.5 space-y-1 text-[12px]">
            <p className="text-[var(--fg)]/90">{ageProfile.reps}</p>
            <p className="text-[var(--fg)]/70"><span className="text-[var(--muted)]">Watch:</span> {ageProfile.emphasis}</p>
            {suggestsAdaptive(age) && m.adaptive && m.adaptive.length > 0 && variant === -1 && (
              <p className="text-[var(--accent)]">Tip: try the {m.adaptive[0].label} version below for extra safety.</p>
            )}
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
          {/* ADAPTIVE variant selector — "exercise for all". Standard + a seated /
              chair-supported way to train the same pattern. Only shown when the
              movement has variants. The forWhom line reassures it's for you. */}
          {m.adaptive && m.adaptive.length > 0 && (
            <div className="mb-2 flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <button onClick={() => chooseVariant(-1)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold transition ${variant === -1 ? "bg-[var(--fg)] text-[var(--bg)]" : "bg-white/10 text-[var(--muted)] hover:text-white"}`}>
                  <Accessibility className="h-3.5 w-3.5" /> Standard
                </button>
                {m.adaptive.map((v, i) => (
                  <button key={v.kind + i} onClick={() => chooseVariant(i)}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${variant === i ? "bg-[var(--accent)] text-white" : "bg-white/10 text-[var(--muted)] hover:text-white"}`}>
                    {v.label}
                  </button>
                ))}
              </div>
              {av && <p className="text-[10px] text-[var(--muted)]">For: {av.forWhom}</p>}
            </div>
          )}
          {/* step dots */}
          <div className="mb-2 flex justify-center gap-1.5">
            {activeSteps.map((_, i) => (
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
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">Step {step + 1} of {activeSteps.length}</p>
              <p className="mt-0.5 line-clamp-2 text-sm font-medium text-white sm:text-[15px]">{activeSteps[step]}</p>
            </div>
            <button onClick={() => go(step + 1)} disabled={step === activeSteps.length - 1}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-white transition hover:brightness-110 disabled:opacity-30">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          {/* safety line */}
          <p className="mx-auto mt-2 flex max-w-2xl items-start gap-1.5 rounded-lg bg-amber-500/15 px-2.5 py-1.5 text-[11px] leading-snug text-amber-200">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {activeSafety}
          </p>
        </div>
      </div>
    </section>
  );
}
