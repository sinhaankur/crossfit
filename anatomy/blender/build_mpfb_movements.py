# build_mpfb_movements.py — animate the REAL MPFB human through the 8 movement
# clips and export one GLB per movement, WITH equipment, for the CrossFit
# gallery. This replaces the ellipsoid-mannequin GLBs (human_rig_build.py) with
# the real body from build_mpfb_human.py.
#
# Reuses the proven pose approach from human_rig_build.py: local-X flexion,
# runtime-auto-detected flex signs, analytic 2-link leg solve, parent-pitch
# compensation — remapped onto MPFB's bone names (upperleg01.L etc.).
#
# Prereq: anatomy/out/mpfb-human.blend  (run build_mpfb_human.py first)
# Run: /Applications/Blender.app/Contents/MacOS/Blender -b -P build_mpfb_movements.py
# © Ankur Sinha. Human base: MakeHuman/MPFB2 (CC0).

import bpy, math, os
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else "."
ROOT = os.path.normpath(os.path.join(HERE, ".."))
HUMAN = os.path.join(ROOT, "out", "mpfb-human.blend")
OUT = os.path.normpath(os.path.join(ROOT, "..", "public", "models"))
os.makedirs(OUT, exist_ok=True)
FPS = 24

# ── load the real human ───────────────────────────────────────────────────────
bpy.ops.wm.open_mainfile(filepath=HUMAN)
scene = bpy.context.scene
scene.render.fps = FPS
rig = next(o for o in bpy.data.objects if o.type == "ARMATURE")
body = next(o for o in bpy.data.objects if o.type == "MESH")

# MPFB proportions (m), read from the rig.
B = rig.data.bones
HIP_Z = B["upperleg01.L"].head_local.z    # 0.962
KNEE_Z = B["lowerleg01.L"].head_local.z   # 0.519
ANKLE_Z = B["foot.L"].head_local.z        # 0.074
LT = HIP_Z - KNEE_Z
LS = KNEE_Z - ANKLE_Z

# ── bone-name map: our logical joints → MPFB rig bones ────────────────────────
# MPFB splits each limb into 2 segments; we drive the FIRST (proximal) segment
# of each — that's where flexion happens (hip, knee, shoulder, elbow). The
# distal segments (upperleg02, lowerarm02) just follow.
def BN(logical, side=None):
    m = {
        "hips": "spine05", "spine": "spine04", "chest": "spine02", "neck": "neck01",
        "thigh": "upperleg01", "shin": "lowerleg01", "foot": "foot",
        "upperarm": "upperarm01", "forearm": "lowerarm01",
    }[logical]
    return f"{m}.{side}" if side else m

# ── pose plumbing (mirrors human_rig_build.py) ────────────────────────────────
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode="POSE")
pb = rig.pose.bones
for p in pb:
    p.rotation_mode = "XYZ"
dg = bpy.context.evaluated_depsgraph_get()

def world_head(bone_name):
    dg.update()
    ev = rig.evaluated_get(dg)
    return (ev.matrix_world @ ev.pose.bones[bone_name].matrix).translation.copy()

def reset_pose():
    for p in pb:
        p.rotation_euler = (0, 0, 0)
        p.location = (0, 0, 0)

def detect_sign(bone_name, probe_bone):
    """Which local-X sign flexes the child FORWARD (-Y in MPFB rest = anatomical
    forward)? Auto-detected so we never trust roll conventions."""
    reset_pose()
    before = world_head(probe_bone)
    pb[bone_name].rotation_euler = (math.radians(20), 0, 0)
    after = world_head(probe_bone)
    reset_pose()
    return -1.0 if (after.y - before.y) > 0 else 1.0

SIGN = {
    "thigh": detect_sign(BN("thigh", "L"), BN("shin", "L")),
    "shin": detect_sign(BN("shin", "L"), BN("foot", "L")),
    "upperarm": detect_sign(BN("upperarm", "L"), BN("forearm", "L")),
    "forearm": detect_sign(BN("forearm", "L"), "wrist.L"),
    "hips": detect_sign(BN("hips"), "head"),
    "foot": detect_sign(BN("foot", "L"), BN("foot", "L")),
}
print("[mv] flex signs:", SIGN)

HIPS_REST_INV = (rig.matrix_world @ B[BN("hips")].matrix_local).to_3x3().inverted()

def hips_offset(dy_world, dz_world):
    return HIPS_REST_INV @ Vector((0.0, dy_world, dz_world))

def flex(base, deg):
    return math.radians(deg) * SIGN[base]

def solve_leg(hip_back, hip_drop):
    fwd = hip_back
    down = (HIP_Z - hip_drop) - ANKLE_Z
    D2 = fwd * fwd + down * down
    D = math.sqrt(D2)
    cos_k = max(-1.0, min(1.0, (LT * LT + LS * LS - D2) / (2 * LT * LS)))
    knee_inner = math.degrees(math.acos(cos_k))
    knee_flex = 180.0 - knee_inner
    alpha = math.degrees(math.atan2(fwd, down))
    beta = math.degrees(math.asin(max(-1.0, min(1.0, LS * math.sin(math.radians(knee_inner)) / D))))
    thigh_flex = alpha + beta
    shin_abs = thigh_flex - knee_flex
    return thigh_flex, knee_flex, -shin_abs

def key(bone_name, frame, rx=None, loc=None):
    p = pb[bone_name]
    if rx is not None:
        p.rotation_euler = (rx, p.rotation_euler[1], p.rotation_euler[2])
        p.keyframe_insert("rotation_euler", frame=frame)
    if loc is not None:
        p.location = loc
        p.keyframe_insert("location", frame=frame)

def key_pose(frame, torso=(0, 0, 0), hip_move=(0, 0), legs=None, legs_r=None,
             shoulder=(0, 0), elbow=(0, 0), feet=None, feet_r=None, neck=0.0,
             leg_no_compensate=False):
    hips_deg, spine_deg, chest_deg = torso
    torso_total = hips_deg + spine_deg + chest_deg
    key(BN("hips"), frame, rx=flex("hips", hips_deg), loc=hips_offset(hip_move[0], -hip_move[1]))
    key(BN("spine"), frame, rx=flex("hips", spine_deg))
    key(BN("chest"), frame, rx=flex("hips", chest_deg))
    key(BN("neck"), frame, rx=flex("hips", neck))
    L = legs or (0, 0, 0)
    R = legs_r if legs_r is not None else L
    # leg_no_compensate: the thigh angle is taken as the LOCAL flex directly (no
    # +hips_deg). For the plank the body is horizontal, so the legs must extend
    # along the pitched pelvis — the "keep legs vertical" compensation is wrong
    # there and folds them up.
    comp = 0 if leg_no_compensate else hips_deg
    for s, (t, k, f) in (("L", L), ("R", R)):
        key(BN("thigh", s), frame, rx=flex("thigh", t + comp))
        key(BN("shin", s), frame, rx=flex("shin", -k))
        extra = (feet if s == "L" else (feet_r if feet_r is not None else feet)) or 0
        key(BN("foot", s), frame, rx=flex("foot", f + extra))
    for s, sh, el in (("L", shoulder[0], elbow[0]), ("R", shoulder[1], elbow[1])):
        key(BN("upperarm", s), frame, rx=flex("upperarm", sh + torso_total))
        key(BN("forearm", s), frame, rx=flex("forearm", el))

def new_action(name, last):
    reset_pose()
    act = bpy.data.actions.new(name)
    if rig.animation_data is None:
        rig.animation_data_create()
    rig.animation_data.action = act
    scene.frame_start, scene.frame_end = 1, last
    return act

ACTIONS = {}

# ── the 8 movements (same designed poses as human_rig_build.py) ───────────────
# Squat — parallel depth. MPFB's legs sit a hair longer than the mannequin's, so
# the mannequin's 0.53 drop over-flexed into a ball; 0.42 hits a clean parallel.
# Front-rack arms: elbows high, hands to the front-delts (bar racked on shoulders).
a = new_action("squat", 72)
t, k, f = solve_leg(0.05, HIP_Z - 0.42)
key_pose(1)
# Upright torso (real squat leans only ~12° at the hip); front-rack arms use
# leg_no_compensate-style: keep the shoulder small so torso_total doesn't swing
# them overhead. shoulder ~55 = upper arms forward+up to rack the bar.
key_pose(36, torso=(10, 6, 4), hip_move=(0.05, HIP_Z - 0.42), legs=(t, k, f), shoulder=(55, 55), elbow=(125, 125))
key_pose(72)
ACTIONS["squat"] = a

a = new_action("deadlift", 72)
t, k, f = solve_leg(0.14, HIP_Z - 0.72)
key_pose(1)
key_pose(36, torso=(35, 18, 12), hip_move=(0.14, HIP_Z - 0.72), legs=(t, k, f), shoulder=(0, 0), elbow=(0, 0), neck=-10)
key_pose(72)
ACTIONS["deadlift"] = a

a = new_action("press", 64)
key_pose(1, shoulder=(20, 20), elbow=(140, 140))
key_pose(32, shoulder=(172, 172), elbow=(4, 4), torso=(-4, -2, 0))
key_pose(64, shoulder=(20, 20), elbow=(140, 140))
ACTIONS["press"] = a

a = new_action("pullup", 64)
key_pose(1, shoulder=(172, 172), elbow=(5, 5), hip_move=(0, -0.02), legs=(0, 12, 0))
key_pose(32, shoulder=(150, 150), elbow=(115, 115), hip_move=(0, -0.30), legs=(8, 28, 0))
key_pose(64, shoulder=(172, 172), elbow=(5, 5), hip_move=(0, -0.02), legs=(0, 12, 0))
ACTIONS["pullup"] = a

# Plank — body horizontal on forearms. Legs extend STRAIGHT BACK along the
# pitched body (leg_no_compensate: thigh local ≈ -90 points it back-level under
# an 88° pelvis pitch); tiny knee bend; toes tucked so the balls of the feet
# meet the mat. Forearms flat (elbow 88° under vertical upper arms).
a = new_action("plank", 72)
for fr, dip in ((1, 0.0), (36, 1.0), (72, 0.0)):
    # legs -78 → extend back and slightly DOWN so hips sit at plank height (not a
    # pike); hips a touch lower; toes tucked.
    key_pose(fr, torso=(90 + dip, 1, 0), hip_move=(0.0, HIP_Z - 0.30),
             legs=(-78, 2, 80), shoulder=(0, 0), elbow=(90, 90), neck=-20,
             leg_no_compensate=True)
ACTIONS["plank"] = a

a = new_action("walk", 48)
for fr, lt, rt, lk, rk, sw, bob in (
    (1, 22, -22, 8, 30, 18, -0.012), (13, 0, 0, 4, 34, 0, 0.0),
    (25, -22, 22, 30, 8, -18, -0.012), (37, 0, 0, 34, 4, 0, 0.0),
    (48, 22, -22, 8, 30, 18, -0.012),
):
    key_pose(fr, hip_move=(0, -bob), legs=(lt, lk, 0), legs_r=(rt, rk, 0),
             shoulder=(-sw, sw), elbow=(18, 18), torso=(2, 1, 0))
ACTIONS["walk"] = a

a = new_action("run", 32)
for fr, lt, rt, lk, rk, sw, bob in (
    (1, 42, -30, 15, 85, 32, -0.02), (9, 6, 6, 30, 55, 0, 0.015),
    (17, -30, 42, 85, 15, -32, -0.02), (25, 6, 6, 55, 30, 0, 0.015),
    (32, 42, -30, 15, 85, 32, -0.02),
):
    key_pose(fr, hip_move=(0.0, -bob), legs=(lt, lk, 0), legs_r=(rt, rk, 0),
             shoulder=(-sw, sw), elbow=(92, 92), torso=(8, 3, 0))
ACTIONS["run"] = a

a = new_action("idle", 96)
for fr, br in ((1, 0.0), (48, 1.0), (96, 0.0)):
    key_pose(fr, torso=(0, br * 1.2, br * 1.5), hip_move=(0, -br * 0.006),
             shoulder=(br * 2, br * 2), elbow=(6 + br * 2, 6 + br * 2))
ACTIONS["idle"] = a

bpy.ops.object.mode_set(mode="OBJECT")

# ── equipment (world-static bars at the hand grip; reused from human_rig_build)─
SKIN_MATS = {m.name: m for m in bpy.data.materials}
def mat(name, rgba, rough=0.55):
    if name in SKIN_MATS:
        return SKIN_MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = rgba
    b.inputs["Roughness"].default_value = rough
    SKIN_MATS[name] = m
    return m
STEEL = mat("steel", (0.62, 0.66, 0.72, 1.0), 0.35)
PLATE = mat("plate", (0.10, 0.11, 0.14, 1.0), 0.6)
ACC = mat("bar_accent", (0.247, 0.55, 1.0, 1.0), 0.4)
MATB = mat("matb", (0.16, 0.32, 0.52, 1.0), 0.9)
FLR = mat("flr", (0.09, 0.12, 0.18, 1.0), 0.95)

def cyl(name, r, d, loc, axis="X", m=STEEL, v=20):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=d, location=loc, vertices=v)
    o = bpy.context.active_object; o.name = name
    if axis == "X": o.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.transform_apply(rotation=True)
    o.data.materials.append(m); bpy.ops.object.shade_smooth(); return o

def cube(name, sx, sy, sz, loc, m=STEEL):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    o = bpy.context.active_object; o.name = name; o.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(scale=True); o.data.materials.append(m); return o

def join_as(name, objs):
    for o in bpy.context.selected_objects: o.select_set(False)
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]; bpy.ops.object.join()
    g = bpy.context.active_object; g.name = name; g.select_set(False); return g

def barbell(name, gz, gy):
    parts = [cyl(f"{name}_shaft", 0.014, 1.9, (0, gy, gz), "X", STEEL, 24)]
    for sx in (1, -1):
        parts.append(cyl(f"{name}_grip.{sx}", 0.016, 0.16, (sx*0.20, gy, gz), "X", ACC, 16))
        for pi, (pr, px) in enumerate([(0.225, 0.62), (0.225, 0.68), (0.20, 0.735)]):
            parts.append(cyl(f"{name}_pl.{sx}.{pi}", pr, 0.05, (sx*px, gy, gz), "X", PLATE, 28))
        parts.append(cyl(f"{name}_col.{sx}", 0.05, 0.05, (sx*0.58, gy, gz), "X", ACC, 16))
    return join_as(name, parts)

def measure_hand(aname, fr):
    rig.animation_data.action = ACTIONS[aname]; scene.frame_set(fr)
    d = bpy.context.evaluated_depsgraph_get(); ev = rig.evaluated_get(d)
    return (ev.matrix_world @ ev.pose.bones["wrist.L"].matrix).translation.copy()

def build_gear(mv):
    if mv == "squat":
        h = measure_hand("squat", 36); return [barbell("bar", h.z+0.02, h.y-0.06)]
    if mv == "press":
        h = measure_hand("press", 1); return [barbell("bar", h.z, h.y-0.04)]
    if mv == "deadlift":
        h = measure_hand("deadlift", 36); return [barbell("bar", max(0.22, h.z), h.y-0.02)]
    if mv == "pullup":
        bar = cyl("pu_bar", 0.02, 1.4, (0, 0.0, 2.06), "X", STEEL, 24)
        u1 = cube("pu_u1", 0.04, 0.04, 2.06, (0.66, 0.0, 1.03), STEEL)
        u2 = cube("pu_u2", 0.04, 0.04, 2.06, (-0.66, 0.0, 1.03), STEEL)
        base = cube("pu_base", 1.5, 0.5, 0.04, (0, 0.0, 0.02), FLR)
        return [join_as("pullup_rig", [bar, u1, u2, base])]
    if mv == "plank":
        return [cube("plank_mat", 0.7, 2.0, 0.02, (0, -0.35, 0.01), MATB)]
    if mv in ("walk", "run", "idle"):
        return [cube("floor", 2.4, 2.4, 0.03, (0, 0, -0.015), FLR)]
    return []

# ── export one GLB per movement ───────────────────────────────────────────────
frame_ends = {"squat": 72, "deadlift": 72, "press": 64, "pullup": 64,
              "plank": 72, "walk": 48, "run": 32, "idle": 96}
for mv in ["squat", "deadlift", "press", "pullup", "plank", "walk", "run", "idle"]:
    rig.animation_data.action = ACTIONS[mv]
    scene.frame_start, scene.frame_end = 1, frame_ends[mv]
    scene.frame_set(1)
    gear = build_gear(mv)
    rig.animation_data.action = ACTIONS[mv]; scene.frame_set(1)
    for o in bpy.context.selected_objects: o.select_set(False)
    body.select_set(True); rig.select_set(True)
    for o in gear: o.select_set(True)
    kwargs = dict(filepath=os.path.join(OUT, f"{mv}.glb"), export_format="GLB",
                  use_selection=True, export_animation_mode="ACTIVE_ACTIONS",
                  export_animations=True, export_frame_range=True,
                  export_force_sampling=True, export_optimize_animation_size=True)
    while True:
        try:
            bpy.ops.export_scene.gltf(**kwargs); break
        except TypeError as e:
            drop = next((k for k in list(kwargs) if k in str(e) and k != "filepath"), None)
            if not drop: raise
            kwargs.pop(drop)
    for o in gear: bpy.data.objects.remove(o, do_unlink=True)
    sz = os.path.getsize(os.path.join(OUT, f"{mv}.glb")) // 1024
    print(f"[export] {mv}.glb  ({sz} KB, gear: {len(gear)})")

print("[done] MPFB movement GLBs →", OUT)
