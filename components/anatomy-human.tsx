"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Pattern } from "@/lib/movements";
import { musclesFor, type MuscleId } from "@/lib/anatomy";

// AnatomyHuman — the REAL anatomical body (from Z-Anatomy, CC-BY-SA 4.0): actual
// muscle meshes, no skin. Each mesh carries a `kelo_muscle` tag (glTF extras) so
// we can EMISSIVE-GLOW the muscles a movement works — primary bright, secondary
// dim, the rest a quiet muscle-red. Drag to orbit. Draco-compressed, ~1MB.
//
// © Ankur Sinha. Anatomy: Z-Anatomy — the libre 3D atlas — CC-BY-SA 4.0.

const MODEL = "/anatomy-muscles.glb";

const BASE = new THREE.Color("#b04a4a");     // resting muscle — visible, fleshy
const PRIMARY = new THREE.Color("#ff2d55");  // worked hard (bright)
const SECONDARY = new THREE.Color("#d84a63");// assists (mid)
const EMIS_P = new THREE.Color("#ff2d55");
const EMIS_S = new THREE.Color("#8a2333");

export function AnatomyHuman({ pattern }: { pattern: Pattern }) {
  const { primary, secondary } = musclesFor(pattern);
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#241318] to-[#0c0709]">
      {/* The model is ~1.53 m tall, feet at y=0, centered on x/z. We look at its
          mid-height (~0.8 m) from far enough to see the whole body. */}
      <Canvas camera={{ position: [0, 0.85, 3.0], fov: 45 }} dpr={[1, 2]}>
        <hemisphereLight args={["#ffffff", "#3a2025", 1.1]} />
        <directionalLight position={[3, 5, 4]} intensity={1.6} />
        <directionalLight position={[-3, 2, -2]} intensity={0.7} color="#ff8a9a" />
        <directionalLight position={[0, 2, -4]} intensity={0.5} color="#ffffff" />
        <Suspense fallback={null}>
          <Body primary={primary} secondary={secondary} />
        </Suspense>
        <OrbitControls
          enablePan={false} target={[0, 0.8, 0]}
          minDistance={2} maxDistance={5}
          autoRotate autoRotateSpeed={0.5}
          minPolarAngle={0.5} maxPolarAngle={Math.PI / 1.9}
        />
      </Canvas>
      <div className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[10px] font-medium uppercase tracking-widest text-white/40">
        drag to orbit · muscles worked glow
      </div>
      <a href="https://github.com/Z-Anatomy" target="_blank" rel="noreferrer"
        className="absolute bottom-1.5 right-2 text-[9px] text-white/25 hover:text-white/50">Z-Anatomy · CC-BY-SA</a>
    </div>
  );
}

function Body({ primary, secondary }: { primary: MuscleId[]; secondary: MuscleId[] }) {
  const { scene } = useGLTF(MODEL);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const wrap = useRef<THREE.Group>(null);

  // Track the worked-muscle materials so we can PULSE their glow (the "muscle
  // firing" feel) without ever moving/dismembering the mesh — safe animation.
  const workedMats = useMemo(() => {
    const mats: { mat: THREE.MeshStandardMaterial; base: number }[] = [];
    cloned.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const tag = (mesh.userData?.kelo_muscle ?? mesh.userData?.extras?.kelo_muscle) as MuscleId | undefined;
      const worked = tag && primary.includes(tag) ? "p" : tag && secondary.includes(tag) ? "s" : "off";
      const base = worked === "p" ? 0.6 : worked === "s" ? 0.25 : 0;
      const mat = new THREE.MeshStandardMaterial({
        color: worked === "p" ? PRIMARY : worked === "s" ? SECONDARY : BASE,
        emissive: worked === "p" ? EMIS_P : worked === "s" ? EMIS_S : new THREE.Color("#000000"),
        emissiveIntensity: base, roughness: 0.55, metalness: 0.05,
      });
      mesh.material = mat;
      if (base > 0) mats.push({ mat, base });
    });
    return mats;
  }, [cloned, primary, secondary]);

  // Safe motion: a slow breathing bob + gentle sway on the WHOLE body (never
  // tears the mesh), and a pulse on the worked muscles so they look like they're
  // firing. (Full rep-articulation needs a rigged glTF — baked in Blender.)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (wrap.current) {
      wrap.current.position.y = Math.sin(t * 1.4) * 0.012;          // breathe
      wrap.current.rotation.z = Math.sin(t * 0.7) * 0.015;          // subtle sway
    }
    const pulse = 0.75 + 0.25 * Math.sin(t * 2.4);                  // muscle firing
    for (const { mat, base } of workedMats) mat.emissiveIntensity = base * pulse;
  });

  return <group ref={wrap}><primitive object={cloned} /></group>;
}

useGLTF.preload(MODEL);
