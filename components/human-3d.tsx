"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { Pattern } from "@/lib/movements";
import { FigureStage } from "./figure-stage";
import { Mannequin3D } from "./mannequin-3d";

function hasWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

// Human3D — a real rigged 3D human on the stage: orbit to view from any angle,
// with the rep playing as an animation clip. This is a SHARED asset — the same
// fit human drives both the CrossFit movement demos here and the Mars One game.
//
// The model lives at /public/models/human.glb (a rigged glTF with named clips
// like "squat", "deadlift", "idle"). Until that file is present — or where WebGL
// isn't available — we fall back to the clean SVG FigureStage so the page never
// breaks. Author attribution for any CC-BY model goes in MODEL_CREDIT below.
//
// © Ankur Sinha. Model: see MODEL_CREDIT.

// Mixamo exports one .glb per animation (character + its clip). We map each
// movement pattern to its file in /public/models/. Drop the Mixamo glTF files
// there (squat.glb, deadlift.glb, …) and the 3D human lights up automatically.
const MODEL_FOR: Record<Pattern, string> = {
  squat: "/models/squat.glb",
  hinge: "/models/deadlift.glb",
  push: "/models/press.glb",
  pull: "/models/pullup.glb",
  core: "/models/plank.glb",
  carry: "/models/walk.glb",
  cardio: "/models/run.glb",
  mobility: "/models/idle.glb",
};

export const MODEL_CREDIT: { author: string; url: string; license: string } = {
  author: "Adobe Mixamo",
  url: "https://www.mixamo.com",
  license: "Adobe Mixamo license (free use)",
};

export function Human3D({ pattern }: { pattern: Pattern }) {
  const [ok, setOk] = useState<boolean | null>(null); // null=checking, true=model exists, false=fallback
  const modelPath = MODEL_FOR[pattern];

  // Probe for the model + WebGL before committing to a Canvas (avoids a hard crash
  // when the .glb hasn't been added yet). Re-checks when the movement changes.
  useEffect(() => {
    let alive = true;
    setOk(null);
    const gl = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } })();
    if (!gl) { setOk(false); return; }
    fetch(modelPath, { method: "HEAD" })
      .then((r) => { if (alive) setOk(r.ok); })
      .catch(() => { if (alive) setOk(false); });
    return () => { alive = false; };
  }, [modelPath]);

  if (ok === null) {
    // Still checking for a Mixamo file — show the 3D mannequin (never the blob).
    return <Mannequin3D pattern={pattern} />;
  }
  if (ok === false) {
    // No Mixamo file: the procedural 3D mannequin is the default. Only if WebGL is
    // entirely unavailable does the SVG figure carry the demo.
    return hasWebGL() ? <Mannequin3D pattern={pattern} /> : <FigureStage pattern={pattern} />;
  }

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.06] to-black/20">
      <Canvas camera={{ position: [0, 1.1, 3.2], fov: 40 }} dpr={[1, 2]} shadows>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 2]} intensity={1.1} castShadow />
        <Suspense fallback={null}>
          <Model path={modelPath} />
          <Environment preset="studio" />
          <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={6} blur={2.4} far={3} />
        </Suspense>
        <OrbitControls enablePan={false} minDistance={2} maxDistance={5} minPolarAngle={0.3} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>
      <div className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[10px] font-medium uppercase tracking-widest text-white/40">
        drag to orbit · scroll to zoom
      </div>
      <a href={MODEL_CREDIT.url} target="_blank" rel="noreferrer"
        className="absolute bottom-1.5 right-2 text-[9px] text-white/30 hover:text-white/60">
        {MODEL_CREDIT.author}
      </a>
    </div>
  );
}

function Model({ path }: { path: string }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(path);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    // Play whatever clip the file carries (Mixamo exports one clip per file).
    const name = names[0];
    if (!name || !actions[name]) return;
    const action = actions[name];
    action.reset().fadeIn(0.3).play();
    action.setLoop(THREE.LoopRepeat, Infinity);
    return () => { action.fadeOut(0.2); };
  }, [actions, names]);

  return <primitive ref={group} object={scene} scale={1} position={[0, -1, 0]} />;
}

// Preload only when a model is known to exist — guarded by the HEAD check above,
// so we don't error on a missing file. (drei preload is a no-op if never reached.)
