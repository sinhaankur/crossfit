"use client";

import { useEffect, useRef, useState } from "react";
import type { Pattern } from "@/lib/movements";

// FigureStage — a calm, Apple-"closer-look"-style stage: a clean SVG human that
// DEMONSTRATES a movement (the joints move through the rep), and that you can
// DRAG left/right to rotate around it. No assets, works everywhere, on-device.
// Photoreal Blender turntables can replace the render later behind the same API.
//
// The figure is drawn from a small skeleton (hip, knee, ankle, shoulder, elbow,
// wrist, head) whose angles are a function of the rep phase `t` (0..1..0). We fake
// 3D rotation by scaling limb horizontal offsets by cos(yaw) — enough to read as
// "turning to see the side," in the spirit of Apple's turntable.
//
// © Ankur Sinha.

export function FigureStage({ pattern, playing = true }: { pattern: Pattern; playing?: boolean }) {
  const [t, setT] = useState(0);        // rep phase 0..1 (ping-pongs)
  const [yaw, setYaw] = useState(0.35); // radians; drag changes this
  const raf = useRef<number>(0);
  const drag = useRef<{ x: number; yaw: number } | null>(null);

  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    const period = 4800; // slow, calm rep — reads as a demonstration, not a twitch
    // Ease-in-out ping-pong + a hold at each end, so the figure settles into clean
    // top/bottom positions instead of frantically bouncing.
    const loop = (now: number) => {
      const phase = ((now - start) % period) / period;            // 0..1
      const tri = phase < 0.5 ? phase * 2 : (1 - phase) * 2;       // 0..1..0
      const held = tri < 0.15 ? 0 : tri > 0.85 ? 1 : (tri - 0.15) / 0.7; // dwell at ends
      const eased = held < 0.5 ? 2 * held * held : 1 - Math.pow(-2 * held + 2, 2) / 2; // easeInOut
      setT(eased);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);

  function onDown(e: React.PointerEvent) {
    drag.current = { x: e.clientX, yaw };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (!drag.current) return;
    setYaw(drag.current.yaw + (e.clientX - drag.current.x) * 0.012);
  }
  function onUp() { drag.current = null; }

  const j = skeleton(pattern, t, yaw);

  return (
    <div
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
      className="relative aspect-[4/5] w-full cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.06] to-black/20 active:cursor-grabbing"
      role="img" aria-label="Movement demonstration — drag to rotate"
    >
      <svg viewBox="0 0 200 250" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* ground shadow */}
        <ellipse cx="100" cy="230" rx={38 * (0.7 + 0.3 * Math.abs(Math.cos(yaw)))} ry="7" fill="rgba(0,0,0,0.35)" />
        {/* limbs */}
        <Bones j={j} />
      </svg>
      <div className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[10px] font-medium uppercase tracking-widest text-white/40">
        drag to rotate
      </div>
    </div>
  );
}

/* ── skeleton math ─────────────────────────────────────────────────────────── */

type P = { x: number; y: number };
interface Joints {
  head: P; neck: P; hip: P;
  kneeL: P; kneeR: P; ankleL: P; ankleR: P;
  shL: P; shR: P; elL: P; elR: P; wrL: P; wrR: P;
}

function skeleton(pattern: Pattern, t: number, yaw: number): Joints {
  const cx = 100, top = 40;
  const c = Math.cos(yaw); // horizontal foreshortening (fake 3D)
  const dx = (v: number) => v * c; // widths shrink as we turn

  // Defaults (standing tall)
  let hipY = 150, kneeBend = 0, torsoLean = 0, armAngle = 0, armRaise = 0, footSpread = 22;

  switch (pattern) {
    case "squat":
      kneeBend = 46 * t; hipY = 150 + 30 * t; torsoLean = 12 * t; armRaise = 0.4 * t; break;
    case "hinge":
      torsoLean = 46 * t; hipY = 150 + 6 * t; kneeBend = 12 * t; armAngle = 42 * t; break;
    case "push":
      armRaise = 1; armAngle = -70 * t; footSpread = 16; break; // overhead press
    case "pull":
      armRaise = 0.2; armAngle = 60 * t; torsoLean = 6 * t; break;
    case "core":
      torsoLean = 20; hipY = 156; kneeBend = 30; armRaise = 0.9; break; // hollow-ish
    case "carry":
      armAngle = 6; footSpread = 14; hipY = 150 + 2 * Math.sin(t * Math.PI * 2); break; // walking bob
    case "cardio":
      hipY = 150 - 10 * t; kneeBend = 40 * t; armAngle = 40 * Math.sin(t * Math.PI * 2); footSpread = 16; break;
    case "mobility":
      torsoLean = 24 * t; armRaise = 0.8 * t; kneeBend = 20 * t; break;
  }

  const hip: P = { x: cx, y: hipY };
  const neck: P = { x: cx + dx(Math.sin(torsoLean * Math.PI / 180) * 40), y: hip.y - Math.cos(torsoLean * Math.PI / 180) * 46 };
  const head: P = { x: neck.x + dx(Math.sin(torsoLean * Math.PI / 180) * 12), y: neck.y - 16 };

  // legs
  const kb = kneeBend * Math.PI / 180;
  const kneeL: P = { x: cx - dx(footSpread * 0.6), y: hip.y + 34 * Math.cos(kb) };
  const kneeR: P = { x: cx + dx(footSpread * 0.6), y: hip.y + 34 * Math.cos(kb) };
  const ankleL: P = { x: cx - dx(footSpread), y: 214 };
  const ankleR: P = { x: cx + dx(footSpread), y: 214 };

  // arms
  const shL: P = { x: neck.x - dx(16), y: neck.y + 4 };
  const shR: P = { x: neck.x + dx(16), y: neck.y + 4 };
  const upLen = 26, foreLen = 24;
  const raise = armRaise * Math.PI; // 0 down .. π up
  const aa = armAngle * Math.PI / 180;
  const elL: P = { x: shL.x - dx(Math.sin(raise) * 10), y: shL.y + Math.cos(raise) * upLen };
  const elR: P = { x: shR.x + dx(Math.sin(raise) * 10), y: shR.y + Math.cos(raise) * upLen };
  const wrL: P = { x: elL.x - dx(Math.sin(raise + aa) * 8), y: elL.y + Math.cos(raise + aa) * foreLen };
  const wrR: P = { x: elR.x + dx(Math.sin(raise + aa) * 8), y: elR.y + Math.cos(raise + aa) * foreLen };

  return { head, neck, hip, kneeL, kneeR, ankleL, ankleR, shL, shR, elL, elR, wrL, wrR };
}

function Bones({ j }: { j: Joints }) {
  // Draw a filled, fit body: a torso polygon + tapered rounded limbs (capsules),
  // so it reads as a person rather than sticks. Rose accent, soft depth shading.
  const limb = (a: P, b: P, w1: number, w2: number, key: string) => {
    // A capsule from a→b with end radii w1,w2 (rounded via stroke caps in two passes).
    return (
      <g key={key}>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--fig)" strokeWidth={Math.max(w1, w2)} strokeLinecap="round" />
      </g>
    );
  };
  // torso as a tapered quad from hips to shoulders
  const hipW = 11, shW = 15;
  const torso = `M ${j.hip.x - hipW} ${j.hip.y}
    L ${j.hip.x + hipW} ${j.hip.y}
    L ${j.shR.x + 3} ${j.shR.y}
    L ${j.shL.x - 3} ${j.shL.y} Z`;
  return (
    <g style={{ ["--fig" as string]: "rgba(244,63,94,0.92)" }}>
      {/* legs behind torso */}
      {limb(j.hip, j.kneeL, 15, 11, "thighL")}{limb(j.kneeL, j.ankleL, 11, 8, "shinL")}
      {limb(j.hip, j.kneeR, 15, 11, "thighR")}{limb(j.kneeR, j.ankleR, 11, 8, "shinR")}
      {/* torso */}
      <path d={torso} fill="var(--fig)" />
      <circle cx={j.hip.x} cy={j.hip.y} r={hipW} fill="var(--fig)" />
      {/* arms */}
      {limb(j.shL, j.elL, 11, 8, "upperL")}{limb(j.elL, j.wrL, 8, 6, "foreL")}
      {limb(j.shR, j.elR, 11, 8, "upperR")}{limb(j.elR, j.wrR, 8, 6, "foreR")}
      {/* neck + head */}
      <line x1={j.neck.x} y1={j.neck.y} x2={j.head.x} y2={j.head.y} stroke="var(--fig)" strokeWidth="9" strokeLinecap="round" />
      <circle cx={j.head.x} cy={j.head.y} r="13" fill="var(--fig)" />
      {/* subtle highlight for depth */}
      <circle cx={j.head.x - 3} cy={j.head.y - 3} r="4" fill="rgba(255,255,255,0.18)" />
    </g>
  );
}
