"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Pattern } from "@/lib/movements";
import { musclesFor, type MuscleId } from "@/lib/anatomy";

// AnatomyHuman — the REAL anatomical body (from Z-Anatomy, CC-BY-SA 4.0): a
// bone-white SKELETON with the muscle system layered over it. The muscle layer is
// semi-transparent so the skeleton reads through (the body has real structure, not
// a shapeless mass), and each muscle mesh carries a `kelo_muscle` tag (glTF extras)
// so we EMISSIVE-GLOW the muscles a movement works — those go solid + bright and
// pop forward. Drag to orbit. Draco-compressed, ~0.6MB.
//
// © Ankur Sinha. Anatomy: Z-Anatomy — the libre 3D atlas — CC-BY-SA 4.0.

const MODEL = "/anatomy-body.glb";

// Muscle colors stay ANATOMICAL (flesh is red — that's the truth of the
// tissue) and the worked signal stays hot: fire reads against the cool blue
// room. Base lifted a touch so resting muscle is legible, not liver-dark.
const BASE = new THREE.Color("#c25c56");     // resting muscle — visible, fleshy
const PRIMARY = new THREE.Color("#ff3b5c");  // worked hard (bright)
const SECONDARY = new THREE.Color("#e0596e");// assists (mid)
const EMIS_P = new THREE.Color("#ff3b5c");
const EMIS_S = new THREE.Color("#93283a");

export function AnatomyHuman({ pattern }: { pattern: Pattern }) {
  const { primary, secondary } = musclesFor(pattern);
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#0d1526] to-[#070b14]">
      {/* The model is ~1.7 m tall, feet at y=0, centered on x/z. We look at its
          mid-height (~0.85 m) from far enough to see the whole body.
          LIGHTING: cool navy studio — the old rig was red-on-red (warm ground
          bounce + red rim + red backdrop) and the body read as a muddy blob.
          Flesh stays warm; the ROOM is blue: bright neutral key, sky-blue rim
          from behind for sculptural edge separation, navy ground bounce, and a
          contact shadow so the figure stands on something. */}
      <Canvas camera={{ position: [0, 0.85, 3.0], fov: 45 }} dpr={[1, 2]}
        gl={{ toneMappingExposure: 1.2 }}>
        <hemisphereLight args={["#eaf2ff", "#16233c", 1.15]} />
        <directionalLight position={[3, 5, 4]} intensity={2.2} color="#fff4ea" />
        <directionalLight position={[-4, 2.5, -3]} intensity={1.1} color="#7cc0ff" />
        <directionalLight position={[0, 1.5, -4]} intensity={0.6} color="#9fd2ff" />
        <Suspense fallback={null}>
          <Body primary={primary} secondary={secondary} />
          <ContactShadows position={[0, 0.01, 0]} opacity={0.45} scale={4} blur={2.6} far={2} color="#020409" />
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

const BONE = new THREE.Color("#e8e0d0");     // bone-white skeleton

function Body({ primary, secondary }: { primary: MuscleId[]; secondary: MuscleId[] }) {
  const { scene } = useGLTF(MODEL);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const wrap = useRef<THREE.Group>(null);

  // Three material classes on the combined body:
  //   · SKELETON (kelo_part=bone) — solid bone-white, rendered first so muscle
  //     transparency reads over it.
  //   · WORKED muscle (tagged + in this movement) — solid, coloured, glowing;
  //     pops forward off the translucent body.
  //   · everything else muscle — semi-transparent flesh so the skeleton shows
  //     through and the body has depth instead of reading as a solid mass.
  const workedMats = useMemo(() => {
    const mats: { mat: THREE.MeshStandardMaterial; base: number }[] = [];
    cloned.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const part = (mesh.userData?.kelo_part ?? mesh.userData?.extras?.kelo_part) as string | undefined;
      if (part === "bone") {
        mesh.material = new THREE.MeshStandardMaterial({
          color: BONE, roughness: 0.8, metalness: 0.02,
        });
        mesh.renderOrder = 0;
        return;
      }
      const tag = (mesh.userData?.kelo_muscle ?? mesh.userData?.extras?.kelo_muscle) as MuscleId | undefined;
      const worked = tag && primary.includes(tag) ? "p" : tag && secondary.includes(tag) ? "s" : "off";
      const base = worked === "p" ? 0.6 : worked === "s" ? 0.25 : 0;
      const solid = worked !== "off"; // worked muscles go opaque + glow forward
      const mat = new THREE.MeshStandardMaterial({
        color: worked === "p" ? PRIMARY : worked === "s" ? SECONDARY : BASE,
        emissive: worked === "p" ? EMIS_P : worked === "s" ? EMIS_S : new THREE.Color("#000000"),
        emissiveIntensity: base, roughness: 0.55, metalness: 0.05,
        transparent: !solid, opacity: solid ? 1 : 0.55, depthWrite: solid,
      });
      mesh.material = mat;
      mesh.renderOrder = solid ? 2 : 1;
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
