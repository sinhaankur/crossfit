# build_mpfb_human.py — generate a REAL, rigged, skinned human via MPFB2
# (MakeHuman Plugin for Blender). MPFB's base mesh + assets are CC0, so the
# output is ours to use commercially with no attribution burden — unlike the
# Z-Anatomy muscle body (CC-BY-SA), which stays the "Muscles" view only.
#
# This replaces the ellipsoid-mannequin base in human_rig_build.py with an
# actual human silhouette (continuous skin, real proportions, real hands/feet).
#
# Output: anatomy/out/mpfb-human.blend  (mesh + rig, ready to pose/animate)
#         anatomy/out/mpfb-human.glb    (T-pose reference render)
#
# Run: /Applications/Blender.app/Contents/MacOS/Blender -b -P build_mpfb_human.py
# © Ankur Sinha. Human base: MakeHuman/MPFB2 (CC0).

import bpy, os

HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else "."
OUT = os.path.normpath(os.path.join(HERE, "..", "out"))
os.makedirs(OUT, exist_ok=True)

# MPFB is an extension in Blender 4.2+ — enable it before importing its services.
bpy.ops.preferences.addon_enable(module="bl_ext.user_default.mpfb")
from bl_ext.user_default.mpfb.services.humanservice import HumanService  # noqa: E402
from bl_ext.user_default.mpfb.services.targetservice import TargetService  # noqa: E402

# ── 1. reset scene ────────────────────────────────────────────────────────────
bpy.ops.wm.read_factory_settings(use_empty=True)

# ── 2. create the human ───────────────────────────────────────────────────────
# Start from MPFB's default macro dict (has the required nested "race" block),
# then override just the sliders we care about: an athletic adult male, lean-
# muscular, slightly above average height. Leave "race" at its neutral default.
macro = TargetService.get_default_macro_info_dict()
macro["gender"] = 0.85      # 0 female … 1 male
macro["age"] = 0.55         # adult (~25y)
macro["muscle"] = 0.72      # athletic
macro["weight"] = 0.45      # lean
macro["height"] = 0.6       # slightly above average
if "proportions" in macro:
    macro["proportions"] = 0.5
print("[mpfb] macro keys:", list(macro.keys()))
basemesh = HumanService.create_human(
    mask_helpers=True,
    detailed_helpers=True,
    extra_vertex_groups=True,
    feet_on_ground=True,
    scale=0.1,              # MPFB decimeter → meter
    macro_detail_dict=macro,
)
print("[mpfb] created human:", basemesh.name, "verts:", len(basemesh.data.vertices))

# ── 3. add a rig ──────────────────────────────────────────────────────────────
# "Default" is MPFB's clean deform skeleton with automatic weights — ideal for
# retargeting our movement clips onto (hips/spine/chest/upper+forearm/thigh+
# shin+foot mirror the names our key_pose uses).
try:
    HumanService.add_builtin_rig(basemesh, "default", import_weights=True)
    print("[mpfb] rig added: default")
except Exception as e:
    print("[mpfb] default rig failed, trying game_engine:", repr(e))
    HumanService.add_builtin_rig(basemesh, "game_engine", import_weights=True)
    print("[mpfb] rig added: game_engine")

# ── 3b. strip helper geometry ────────────────────────────────────────────────
# MPFB's base mesh carries non-body "helper" geometry (the skirt/tights/hair
# sheets + joint cubes used to fit clothes and place joints). mask_helpers only
# HIDES them in-viewport; for a clean body export we must DELETE the verts in
# the master "HelperGeometry" group, or they ship as a skirt + a sheet behind
# the head (exactly what the first render showed).
import bmesh  # noqa: E402
hg = basemesh.vertex_groups.get("HelperGeometry")
if hg:
    bpy.context.view_layer.objects.active = basemesh
    bpy.ops.object.mode_set(mode="EDIT")
    bm = bmesh.from_edit_mesh(basemesh.data)
    dvl = bm.verts.layers.deform.active
    bm.verts.ensure_lookup_table()
    to_del = [v for v in bm.verts if dvl and hg.index in v[dvl]]
    bmesh.ops.delete(bm, geom=to_del, context="VERTS")
    bmesh.update_edit_mesh(basemesh.data)
    bpy.ops.object.mode_set(mode="OBJECT")
    print("[mpfb] stripped %d helper verts → body verts: %d"
          % (len(to_del), len(basemesh.data.vertices)))

# ── 4. report the rig's bone names (so we can map our clips) ──────────────────
arm = None
for o in bpy.data.objects:
    if o.type == "ARMATURE":
        arm = o
        break
if arm:
    names = [b.name for b in arm.data.bones]
    print("[mpfb] rig bones (%d):" % len(names), names)

# ── 5. save the .blend + a reference GLB ─────────────────────────────────────
blend_path = os.path.join(OUT, "mpfb-human.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
print("[mpfb] saved", blend_path)

# select mesh + rig for a clean glb
for o in bpy.context.selected_objects:
    o.select_set(False)
basemesh.select_set(True)
if arm:
    arm.select_set(True)
glb_path = os.path.join(OUT, "mpfb-human.glb")
try:
    bpy.ops.export_scene.gltf(filepath=glb_path, export_format="GLB", use_selection=True)
    print("[mpfb] exported", glb_path)
except Exception as e:
    print("[mpfb] glb export note:", repr(e))

print("[done] MPFB human ready in", OUT)
