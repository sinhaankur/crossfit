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
macro["gender"] = 1.0       # fully male (0.85 still read androgynous in render)
macro["age"] = 0.55         # adult (~25y)
macro["muscle"] = 0.82      # clearly athletic/muscular
macro["weight"] = 0.5       # solid, not skinny
macro["height"] = 0.62      # slightly above average
if "proportions" in macro:
    macro["proportions"] = 0.5
if "cupsize" in macro:
    macro["cupsize"] = 0.0
if "firmness" in macro:
    macro["firmness"] = 1.0
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
# Delete any vert that belongs to ANY helper-* / master-helper / joint-cube
# group (HelperGeometry misses a few stray helper verts — e.g. the genital
# helper chip that floated under the figure in the first movement render).
helper_idx = {vg.index for vg in basemesh.vertex_groups
              if vg.name == "HelperGeometry" or vg.name == "JointCubes"
              or vg.name.startswith("helper-") or vg.name.startswith("joint-")}
if helper_idx:
    bpy.context.view_layer.objects.active = basemesh
    bpy.ops.object.mode_set(mode="EDIT")
    bm = bmesh.from_edit_mesh(basemesh.data)
    dvl = bm.verts.layers.deform.active
    bm.verts.ensure_lookup_table()
    to_del = [v for v in bm.verts if dvl and any(gi in v[dvl] for gi in helper_idx)]
    bmesh.ops.delete(bm, geom=to_del, context="VERTS")
    bmesh.update_edit_mesh(basemesh.data)
    bpy.ops.object.mode_set(mode="OBJECT")
    print("[mpfb] stripped %d helper verts → body verts: %d"
          % (len(to_del), len(basemesh.data.vertices)))

# ── 3c. decimate to a web budget ─────────────────────────────────────────────
# 13k verts × full skinning per frame = ~6.8MB GLBs. The gallery views the
# figure at fitness-app scale, so halve the mesh with a collapse decimate — the
# silhouette holds, the file drops ~40%. MPFB carries facial shape keys we never
# use; a modifier can't apply over shape keys, so clear them first.
if basemesh.data.shape_keys:
    basemesh.shape_key_clear()
    print("[mpfb] cleared shape keys")
dec = basemesh.modifiers.new("web_decimate", "DECIMATE")
dec.decimate_type = "COLLAPSE"
dec.ratio = 0.5
bpy.context.view_layer.objects.active = basemesh
bpy.ops.object.modifier_apply(modifier="web_decimate")
print("[mpfb] decimated → body verts: %d" % len(basemesh.data.vertices))

# NOTE: bone pruning was tried and REVERTED — dissolving intermediate spine/arm
# bones mid-chain collapsed their skin weights onto distant kept bones, which
# stretched into spike artifacts under animation (deadlift) and broke the arm
# rest orientation (pull-up arms splayed sideways). The mesh decimation above is
# where the file weight actually comes from; the full 163-bone rig stays intact
# so every chain deforms cleanly. Animation size is trimmed by the exporter's
# optimize + sampling flags instead.
arm = next((o for o in bpy.data.objects if o.type == "ARMATURE"), None)

# ── 3e. clothe the figure (shorts + tank top) ────────────────────────────────
# The nude base reads wrong for a fitness app. Rather than depend on MPFB's
# separate clothing asset packs, paint gym wear directly: assign per-face
# materials by HEIGHT BAND — shorts across the hips + upper thighs, a tank top
# across the torso, skin everywhere else. Deterministic, no external assets, and
# it moves with the body since it's the body's own faces. Uses the front/back Z.
me = basemesh.data
zs = [(basemesh.matrix_world @ v.co).z for v in me.vertices]
z_min, z_max = min(zs), max(zs)               # feet ~0 → crown ~1.8
H = z_max - z_min

def add_mat(name, rgba, rough=0.6):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = rgba
    b.inputs["Roughness"].default_value = rough
    me.materials.append(m)
    return len(me.materials) - 1

# Material slots: 0 = skin (existing/first), then shorts, top.
skin_idx = 0 if me.materials else add_mat("skin", (0.80, 0.60, 0.48, 1.0), 0.55)
shorts_idx = add_mat("shorts", (0.11, 0.13, 0.18, 1.0), 0.7)   # dark graphite
top_idx = add_mat("top", (0.25, 0.55, 1.0, 1.0), 0.55)          # blue tank (theme)

# Clothe the TORSO CORE only: a face is clothing if it's in the right height
# band AND close to the body's vertical centerline (so the ARMS — which hang at
# torso height beside the trunk — stay bare skin). torso half-width ≈ 0.16 m at
# the chest; arms sit beyond ~0.20 m. Legs stay within the centerline so the
# shorts wrap both thighs.
CENTER_X = sum((basemesh.matrix_world @ v.co).x for v in me.vertices) / len(me.vertices)
TORSO_HALF = 0.19   # m from centerline that still counts as trunk (not arm)

def band(poly):
    c = basemesh.matrix_world @ poly.center
    f = (c.z - z_min) / H
    dx = abs(c.x - CENTER_X)
    if 0.44 <= f < 0.55:                 # shorts: hips + upper thigh (legs are central)
        return shorts_idx
    if 0.55 <= f < 0.73 and dx <= TORSO_HALF:   # tank: torso core only, not the arms
        return top_idx
    return skin_idx

for poly in me.polygons:
    poly.material_index = band(poly)
print("[mpfb] clothed: shorts + tank top (torso-core gated so arms stay bare)")

# ── 4. report the rig's bone names (so we can map our clips) ──────────────────
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
