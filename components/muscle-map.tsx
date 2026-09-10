"use client";

import type { Pattern } from "@/lib/movements";
import { musclesFor, MUSCLE_LABEL, type MuscleId } from "@/lib/anatomy";

// MuscleMap — front + back anatomical body with the WORKED muscles highlighted for
// a movement (primary bright, secondary dim). This is the "see which muscle is
// active" view; the same muscle ids will drive the 3D Z-Anatomy mesh highlight.
// Pure SVG — light, mobile-perfect, works everywhere.

export function MuscleMap({ pattern }: { pattern: Pattern }) {
  const { primary, secondary } = musclesFor(pattern);
  const state = (id: MuscleId): "p" | "s" | "off" =>
    primary.includes(id) ? "p" : secondary.includes(id) ? "s" : "off";
  const fill = (id: MuscleId) => (state(id) === "p" ? "#f43f5e" : state(id) === "s" ? "rgba(244,63,94,0.4)" : "rgba(255,255,255,0.08)");

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <BodyFront fill={fill} />
        <BodyBack fill={fill} />
      </div>
      {/* legend of worked muscles */}
      <div className="mt-2 flex flex-wrap gap-1">
        {primary.map((m) => <span key={m} className="rounded-full bg-[var(--accent)]/25 px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">{MUSCLE_LABEL[m]}</span>)}
        {secondary.map((m) => <span key={m} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-[var(--muted)]">{MUSCLE_LABEL[m]}</span>)}
      </div>
      {/* anatomy attribution — muscle naming follows Terminologia Anatomica; the 3D
          anatomy layer derives from Z-Anatomy (CC-BY-SA 4.0). */}
      <p className="mt-1.5 text-[9px] text-[var(--muted)]/70">
        Anatomy per Terminologia Anatomica · 3D layer from{" "}
        <a href="https://github.com/Z-Anatomy" target="_blank" rel="noreferrer" className="underline">Z-Anatomy</a> (CC-BY-SA 4.0)
      </p>
    </div>
  );
}

// Simple anatomical body outlines with per-muscle regions. Not to-the-mm (that's
// the Blender build); this is a clear, readable schematic that lights up correctly.
function BodyFront({ fill }: { fill: (id: MuscleId) => string }) {
  return (
    <svg viewBox="0 0 100 200" className="w-full">
      <text x="50" y="10" textAnchor="middle" className="fill-[var(--muted)]" fontSize="7">FRONT</text>
      <Outline />
      {/* chest */}
      <path d="M38 48 h24 v14 q-12 6 -24 0 z" fill={fill("chest")} />
      {/* front delts */}
      <circle cx="33" cy="47" r="6" fill={fill("front-delt")} />
      <circle cx="67" cy="47" r="6" fill={fill("front-delt")} />
      {/* side delts (edge) */}
      <circle cx="28" cy="49" r="4" fill={fill("side-delt")} />
      <circle cx="72" cy="49" r="4" fill={fill("side-delt")} />
      {/* biceps */}
      <rect x="24" y="56" width="6" height="16" rx="3" fill={fill("biceps")} />
      <rect x="70" y="56" width="6" height="16" rx="3" fill={fill("biceps")} />
      {/* forearms */}
      <rect x="22" y="74" width="6" height="16" rx="3" fill={fill("forearms")} />
      <rect x="72" y="74" width="6" height="16" rx="3" fill={fill("forearms")} />
      {/* abs */}
      <rect x="42" y="66" width="16" height="24" rx="3" fill={fill("abs")} />
      {/* obliques */}
      <path d="M38 68 l4 20 -6 -2 z" fill={fill("obliques")} />
      <path d="M62 68 l-4 20 6 -2 z" fill={fill("obliques")} />
      {/* quads */}
      <path d="M40 96 q-4 26 -2 46 l8 0 q2 -24 2 -46 z" fill={fill("quads")} />
      <path d="M60 96 q4 26 2 46 l-8 0 q-2 -24 -2 -46 z" fill={fill("quads")} />
      {/* adductors */}
      <path d="M48 98 l4 0 -1 40 -2 0 z" fill={fill("adductors")} />
      {/* tibialis (shins) */}
      <rect x="40" y="150" width="6" height="30" rx="3" fill={fill("tibialis")} />
      <rect x="54" y="150" width="6" height="30" rx="3" fill={fill("tibialis")} />
    </svg>
  );
}
function BodyBack({ fill }: { fill: (id: MuscleId) => string }) {
  return (
    <svg viewBox="0 0 100 200" className="w-full">
      <text x="50" y="10" textAnchor="middle" className="fill-[var(--muted)]" fontSize="7">BACK</text>
      <Outline />
      {/* traps */}
      <path d="M40 38 h20 l-4 12 h-12 z" fill={fill("traps")} />
      {/* rear delts */}
      <circle cx="32" cy="47" r="6" fill={fill("rear-delt")} />
      <circle cx="68" cy="47" r="6" fill={fill("rear-delt")} />
      {/* rhomboids (upper mid-back) */}
      <rect x="42" y="50" width="16" height="10" rx="2" fill={fill("rhomboids")} />
      {/* lats */}
      <path d="M38 58 q-4 14 2 24 l6 -2 -2 -22 z" fill={fill("lats")} />
      <path d="M62 58 q4 14 -2 24 l-6 -2 2 -22 z" fill={fill("lats")} />
      {/* triceps */}
      <rect x="24" y="56" width="6" height="16" rx="3" fill={fill("triceps")} />
      <rect x="70" y="56" width="6" height="16" rx="3" fill={fill("triceps")} />
      {/* lower back */}
      <rect x="43" y="82" width="14" height="12" rx="2" fill={fill("lower-back")} />
      {/* glutes */}
      <path d="M40 96 q-3 10 0 16 q10 5 20 0 q3 -6 0 -16 z" fill={fill("glutes")} />
      {/* hamstrings */}
      <path d="M40 114 q-2 20 0 34 l8 0 q1 -18 0 -34 z" fill={fill("hamstrings")} />
      <path d="M60 114 q2 20 0 34 l-8 0 q-1 -18 0 -34 z" fill={fill("hamstrings")} />
      {/* calves */}
      <path d="M40 150 q-2 16 0 28 l7 0 q1 -14 0 -28 z" fill={fill("calves")} />
      <path d="M60 150 q2 16 0 28 l-7 0 q-1 -14 0 -28 z" fill={fill("calves")} />
    </svg>
  );
}

// Shared body outline (gender-neutral schematic).
function Outline() {
  return (
    <g fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1">
      <circle cx="50" cy="24" r="10" />
      <path d="M44 33 h12 v4 h6 l10 8 v10 l-6 2 v-2 l-4 34 h-2 l-2 44 h-2 l-2 34 h-8 l-2 -34 h-2 l-2 -44 h-2 l-4 -34 v2 l-6 -2 v-10 l10 -8 h6 z" />
    </g>
  );
}
