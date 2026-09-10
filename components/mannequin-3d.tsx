"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { Pattern } from "@/lib/movements";

// Mannequin3D — a real 3D shaded human built procedurally from primitives (no
// external asset, no login): rounded body volumes with proper lighting, depth and
// materials, posed through each rep and freely orbitable. This is the default
// figure (looks genuinely 3D); a Mixamo glTF, when present, upgrades to mocap.
//
// The skeleton is a set of bones with per-pattern target angles; we ease a phase
// 0..1..0 and rotate limb groups accordingly. Anatomy is simplified but reads as
// a fit person, and you can orbit all the way around.
//
// © Ankur Sinha.

const SKIN = "#e8a17f"; // warm neutral
const ACCENT = "#f43f5e";

export function Mannequin3D({ pattern }: { pattern: Pattern }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.06] to-black/25">
      <Canvas camera={{ position: [0, 1.0, 4.2], fov: 38 }} dpr={[1, 2]} shadows>
        <hemisphereLight args={["#ffffff", "#20222b", 0.7]} />
        <directionalLight position={[3, 6, 4]} intensity={1.4} castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 2, -2]} intensity={0.4} color={ACCENT} />
        <Figure pattern={pattern} />
        <ContactShadows position={[0, -1.15, 0]} opacity={0.5} scale={5} blur={2.6} far={2} />
        <Environment preset="studio" />
        <OrbitControls enablePan={false} minDistance={2.6} maxDistance={7} minPolarAngle={0.4} maxPolarAngle={Math.PI / 1.7} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
      <div className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[10px] font-medium uppercase tracking-widest text-white/40">
        drag to orbit · scroll to zoom
      </div>
    </div>
  );
}

function Figure({ pattern }: { pattern: Pattern }) {
  const root = useRef<THREE.Group>(null);
  const hips = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const thighL = useRef<THREE.Group>(null);
  const thighR = useRef<THREE.Group>(null);
  const shinL = useRef<THREE.Group>(null);
  const shinR = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const foreL = useRef<THREE.Group>(null);
  const foreR = useRef<THREE.Group>(null);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.55, metalness: 0.05 }), []);
  const matAccent = useMemo(() => new THREE.MeshStandardMaterial({ color: ACCENT, roughness: 0.5 }), []);

  useFrame(({ clock }) => {
    const period = 4.2;
    const raw = (clock.elapsedTime % period) / period;      // 0..1
    const tri = raw < 0.5 ? raw * 2 : (1 - raw) * 2;         // 0..1..0
    const t = tri < 0.5 ? 2 * tri * tri : 1 - Math.pow(-2 * tri + 2, 2) / 2; // easeInOut
    pose(pattern, t, { hips, torso, thighL, thighR, shinL, shinR, armL, armR, foreL, foreR });
  });

  // Limb builder: a group positioned at its joint, with a capsule mesh offset down.
  const Bone = ({ len, r, joint, mref, material = mat, children }: {
    len: number; r: number; joint: [number, number, number]; mref: React.RefObject<THREE.Group | null>;
    material?: THREE.Material; children?: React.ReactNode;
  }) => (
    <group ref={mref} position={joint}>
      <mesh position={[0, -len / 2, 0]} castShadow material={material}>
        <capsuleGeometry args={[r, len - r * 2, 6, 12]} />
      </mesh>
      {children}
    </group>
  );

  return (
    <group ref={root} position={[0, 0.1, 0]} scale={1.05}>
      <group ref={hips} position={[0, -0.15, 0]}>
        {/* pelvis */}
        <mesh castShadow material={mat}><capsuleGeometry args={[0.2, 0.16, 6, 12]} /></mesh>

        {/* torso group (leans/rotates) */}
        <group ref={torso} position={[0, 0.16, 0]}>
          <mesh position={[0, 0.34, 0]} castShadow material={mat}>
            {/* chest — slightly tapered box for a fit torso */}
            <capsuleGeometry args={[0.24, 0.5, 6, 12]} />
          </mesh>
          {/* accent shirt band */}
          <mesh position={[0, 0.2, 0]} castShadow material={matAccent}>
            <capsuleGeometry args={[0.245, 0.18, 6, 12]} />
          </mesh>
          {/* neck + head */}
          <mesh position={[0, 0.72, 0]} castShadow material={mat}><cylinderGeometry args={[0.07, 0.08, 0.12, 12]} /></mesh>
          <mesh position={[0, 0.9, 0]} castShadow material={mat}><sphereGeometry args={[0.17, 20, 20]} /></mesh>

          {/* arms — from shoulders */}
          <Bone len={0.42} r={0.075} joint={[-0.3, 0.55, 0]} mref={armL} material={mat}>
            <Bone len={0.4} r={0.06} joint={[0, -0.42, 0]} mref={foreL} material={mat} />
          </Bone>
          <Bone len={0.42} r={0.075} joint={[0.3, 0.55, 0]} mref={armR} material={mat}>
            <Bone len={0.4} r={0.06} joint={[0, -0.42, 0]} mref={foreR} material={mat} />
          </Bone>
        </group>

        {/* legs — from hips */}
        <Bone len={0.52} r={0.1} joint={[-0.14, 0, 0]} mref={thighL} material={mat}>
          <Bone len={0.5} r={0.08} joint={[0, -0.52, 0]} mref={shinL} material={mat} />
        </Bone>
        <Bone len={0.52} r={0.1} joint={[0.14, 0, 0]} mref={thighR} material={mat}>
          <Bone len={0.5} r={0.08} joint={[0, -0.52, 0]} mref={shinR} material={mat} />
        </Bone>
      </group>
    </group>
  );
}

type Refs = Record<string, React.RefObject<THREE.Group | null>>;

// Pose the bones for a pattern at phase t (0=start, 1=end of rep).
function pose(pattern: Pattern, t: number, r: Refs) {
  const set = (ref: React.RefObject<THREE.Group | null>, x = 0, y = 0, z = 0) => { if (ref.current) ref.current.rotation.set(x, y, z); };
  const dip = (ref: React.RefObject<THREE.Group | null>, y: number) => { if (ref.current) ref.current.position.y = y; };

  // reset to a neutral standing pose each frame, then apply
  set(r.torso); set(r.thighL); set(r.thighR); set(r.shinL); set(r.shinR);
  set(r.armL, 0.1); set(r.armR, 0.1); set(r.foreL); set(r.foreR);
  dip(r.hips, -0.15);

  switch (pattern) {
    case "squat": {
      const a = t * 1.5;
      set(r.thighL, a); set(r.thighR, a);
      set(r.shinL, -a * 1.1); set(r.shinR, -a * 1.1);
      set(r.torso, a * 0.35);
      dip(r.hips, -0.15 - t * 0.55);
      set(r.armL, -t * 1.3); set(r.armR, -t * 1.3); // arms reach forward for balance
      break;
    }
    case "hinge": {
      set(r.torso, t * 1.15);
      set(r.thighL, t * 0.3); set(r.thighR, t * 0.3);
      set(r.armL, t * 1.15); set(r.armR, t * 1.15);
      dip(r.hips, -0.15 - t * 0.08);
      break;
    }
    case "push": { // overhead press
      set(r.armL, -Math.PI * (0.15 + 0.85 * t)); set(r.armR, -Math.PI * (0.15 + 0.85 * t));
      break;
    }
    case "pull": { // row/pull
      set(r.armL, 0.2 + t * 1.3); set(r.armR, 0.2 + t * 1.3);
      set(r.foreL, t * 1.2); set(r.foreR, t * 1.2);
      set(r.torso, 0.15);
      break;
    }
    case "core": { // plank-ish hold, subtle
      set(r.torso, 0.05 + t * 0.04);
      set(r.armL, -0.3); set(r.armR, -0.3);
      break;
    }
    case "carry": { // walk bob
      const s = Math.sin(t * Math.PI * 2);
      set(r.thighL, s * 0.4); set(r.thighR, -s * 0.4);
      set(r.armL, -s * 0.3 + 0.1); set(r.armR, s * 0.3 + 0.1);
      dip(r.hips, -0.15 + Math.abs(s) * 0.03);
      break;
    }
    case "cardio": { // run
      const s = Math.sin(t * Math.PI * 2);
      set(r.thighL, s * 0.8); set(r.thighR, -s * 0.8);
      set(r.shinL, -Math.max(0, s) * 0.9); set(r.shinR, -Math.max(0, -s) * 0.9);
      set(r.armL, -s * 0.7 + 0.3); set(r.armR, s * 0.7 + 0.3);
      set(r.foreL, 1.1); set(r.foreR, 1.1);
      dip(r.hips, -0.13 + Math.abs(s) * 0.05);
      break;
    }
    case "mobility": { // gentle reach
      set(r.torso, t * 0.5);
      set(r.armL, -t * 1.6); set(r.armR, -t * 1.6);
      set(r.thighL, t * 0.2); set(r.thighR, t * 0.2);
      break;
    }
  }
}
