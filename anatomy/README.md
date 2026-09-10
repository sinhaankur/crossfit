# Kelo anatomy pipeline

The exact-anatomy foundation for Kelo's movement figure — so "which muscle is
active" is **real**, tied to official anatomy, not guessed.

## What's here (committed)
- **`muscle-ta2-map.json`** — Kelo's 21 highlight muscles mapped to their exact
  **Terminologia Anatomica (TA2)** IDs + Latin names (e.g. Gluteus maximus = TA2#2598).
  This is the single source of truth linking `lib/anatomy.ts` MuscleIds ↔ real anatomy
  ↔ Z-Anatomy mesh names.
- **`blender/build_human.py`** — builds an exact skeleton armature at the real joint
  centres (mm) from the `human-anatomy-exact` skill, with ROM limits. Verified: every
  long bone matches the anthropometry table to the mm (thigh 429 / shin 431 / etc.).
- **`blender/export_web_human.py`** / **`export_highlight_muscles.py`** — extract the
  muscular (+ skeletal) systems from Z-Anatomy, tag the highlight muscles by TA2 id,
  decimate, and export glTF for the web.

## Not committed (regenerate — heavy / licensed data)
- `z-anatomy.zip` (86MB) + `z-anatomy/` (303MB) — the full atlas. Re-fetch:
  `curl -L https://raw.githubusercontent.com/Z-Anatomy/Models-of-human-anatomy/master/Z-Anatomy.zip -o z-anatomy.zip && unzip z-anatomy.zip -d z-anatomy`
- `out/*.glb` / `out/*.blend` — build outputs (`kelo-muscles.glb` = 188 muscle meshes,
  21 groups, real Z-Anatomy). Rebuild: `blender -b -P blender/export_highlight_muscles.py`
- `TA2-terminologia-anatomica.csv` — the 7,315-structure TA2 terminology (re-fetch from the repo).

## Attribution (REQUIRED — ship with any anatomical asset)
> Anatomy: **Z-Anatomy — The libre 3D atlas of anatomy — CC-BY-SA 4.0**
> (github.com/Z-Anatomy), built on **BodyParts3D © DBCLS (CC-BY-SA 2.1 JP)**.
> Anthropometry after Winter / Drillis-Contini. Built by Ankur Sinha.

**Licence:** derivatives of Z-Anatomy must stay **CC-BY-SA 4.0** (ShareAlike).

## Status
- ✅ Exact skeleton armature (mm-verified) + exact TA2 muscle map.
- ✅ Real muscle glTF exported from Z-Anatomy (`kelo-muscles.glb`, 5.6MB, 21 groups).
- ⏳ Web: currently shipping the **2D muscle-highlight** (`components/muscle-map.tsx`) —
  instant, light, per-movement. The 3D anatomy glb is the next layer (needs web-budget
  decimation < ~2MB + per-muscle emissive glow wiring before it auto-loads).
