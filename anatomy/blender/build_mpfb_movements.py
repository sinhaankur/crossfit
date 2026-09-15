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

# ── IK helpers (for planted-foot poses: squat, plank) ─────────────────────────
# FK leg-posing can't pin the feet on MPFB's multi-segment legs (squat balled
# up, plank piked). IK does: pin each foot to a target at ground contact, then
# just move the hips — the legs solve with the feet staying put. Constraints are
# BAKED to keyframes before export, then removed, so the GLB is plain FK.
_ik_targets = []

def setup_leg_ik():
    """Create foot IK targets at the feet's rest positions + IK constraints on
    the lower-leg tips (chain up to the hip). Returns the two target objects."""
    bpy.ops.object.mode_set(mode="OBJECT")
    dgi = bpy.context.evaluated_depsgraph_get()
    ev = rig.evaluated_get(dgi)
    tgts = {}
    for s in ("L", "R"):
        foot_w = (ev.matrix_world @ ev.pose.bones[f"foot.{s}"].matrix).translation.copy()
        t = bpy.data.objects.new(f"ik_foot_{s}", None)
        scene.collection.objects.link(t)
        t.location = foot_w
        tgts[s] = t
        _ik_targets.append(t)
    bpy.ops.object.mode_set(mode="POSE")
    for s in ("L", "R"):
        tip = pb.get(f"lowerleg02.{s}") or pb[f"lowerleg01.{s}"]
        ik = tip.constraints.new("IK")
        ik.target = tgts[s]
        ik.chain_count = 3   # lowerleg02 → lowerleg01 → upperleg02 (knee+hip)
    return tgts

def clear_leg_ik():
    bpy.ops.object.mode_set(mode="POSE")
    for s in ("L", "R"):
        tip = pb.get(f"lowerleg02.{s}") or pb[f"lowerleg01.{s}"]
        for c in list(tip.constraints):
            if c.type == "IK":
                tip.constraints.remove(c)
    bpy.ops.object.mode_set(mode="OBJECT")
    for t in list(_ik_targets):
        bpy.data.objects.remove(t, do_unlink=True)
    _ik_targets.clear()

def bake_ik_to_fk(first, last):
    """Bake the IK-solved motion to plain FK keyframes on every bone, in place;
    clears the IK constraints AND the target empties, leaving a clean FK clip."""
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="POSE")
    bpy.ops.pose.select_all(action="SELECT")
    bpy.ops.nla.bake(frame_start=first, frame_end=last, only_selected=True,
                     visual_keying=True, clear_constraints=True,
                     use_current_action=True, bake_types={"POSE"})
    bpy.ops.object.mode_set(mode="OBJECT")
    for t in list(_ik_targets):
        bpy.data.objects.remove(t, do_unlink=True)
    _ik_targets.clear()
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="POSE")

ACTIONS = {}

# ── the 8 movements (same designed poses as human_rig_build.py) ───────────────
# Squat — parallel depth. MPFB's legs sit a hair longer than the mannequin's, so
# the mannequin's 0.53 drop over-flexed into a ball; 0.42 hits a clean parallel.
# Front-rack arms: elbows high, hands to the front-delts (bar racked on shoulders).
# SQUAT (IK) — pin the feet, sink the hips straight down (a touch back), let IK
# bend knees+hips with the feet planted. Front-rack arms. Then bake IK→FK.
a = new_action("squat", 72)
setup_leg_ik()
def squat_frame(frame, drop, back, arm_sh, arm_el, torso_lean):
    # hips move down `drop` and back `back` (world m); IK keeps feet planted.
    key(BN("hips"), frame, rx=flex("hips", torso_lean), loc=hips_offset(back, -drop))
    key(BN("spine"), frame, rx=flex("hips", torso_lean * 0.5))
    key(BN("chest"), frame, rx=flex("hips", torso_lean * 0.3))
    for s in ("L", "R"):
        key(BN("upperarm", s), frame, rx=flex("upperarm", arm_sh))
        key(BN("forearm", s), frame, rx=flex("forearm", arm_el))
squat_frame(1, 0.0, 0.0, 12, 18, 2)
squat_frame(36, 0.44, 0.04, 40, 120, 14)   # parallel
squat_frame(72, 0.0, 0.0, 12, 18, 2)
bake_ik_to_fk(1, 72)
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
# PLANK — body horizontal on the forearms, legs extended straight back. Built
# in FK with leg_no_compensate (the body IS the reference line here, so the
# "keep legs vertical" compensation is wrong): thigh −82 world extends the leg
# back-and-slightly-down to the planted toes; knee near-straight; toes tucked.
a = new_action("plank", 72)
for fr, dip in ((1, 0.0), (36, 0.8), (72, 0.0)):
    key_pose(fr, torso=(90 + dip, 1, 0), hip_move=(0.0, HIP_Z - 0.32),
             legs=(-82, 3, 84), shoulder=(0, 0), elbow=(92, 92), neck=-22,
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

# ── SEATED variants (exercise for all) ────────────────────────────────────────
# A real seated figure on a chair, then the seated rep for each pattern. Built
# with IK: pin the feet flat on the floor, drop + flex the hips to sitting so
# the thighs go horizontal and the shins stay vertical (knees ~90°). Chair seat
# height ≈ 0.46 m, so the hips (rest 0.96) drop ~0.50 to sit. Bake IK→FK.
SEAT_Z = 0.46                       # chair seat height (m)
SEAT_DROP = HIP_Z - SEAT_Z          # how far the hips sink to sit (~0.50)

def seated_hold(frame, torso_lean=4, arm_sh=8, arm_el=12, neck=0.0,
                back=0.02, drop=SEAT_DROP):
    """One seated keyframe: hips dropped to the seat + flexed so thighs are
    horizontal; IK keeps the feet planted → knees bend to ~90°. Arms/torso on
    top. `drop`/`back` let a sit-to-stand rep rise out of the chair."""
    # Hips flex forward a lot to sit (thigh horizontal) minus the upright lean.
    key(BN("hips"), frame, rx=flex("hips", 82 + torso_lean),
        loc=hips_offset(-back, -drop))
    key(BN("spine"), frame, rx=flex("hips", -40 + torso_lean * 0.5))   # counter so torso stays upright
    key(BN("chest"), frame, rx=flex("hips", -34 + torso_lean * 0.3))
    key(BN("neck"), frame, rx=flex("hips", neck))
    for s in ("L", "R"):
        key(BN("upperarm", s), frame, rx=flex("upperarm", arm_sh))
        key(BN("forearm", s), frame, rx=flex("forearm", arm_el))

def make_seated(name, last, frames, seed_thigh=-82):
    """Build a seated action: seed the legs bent, pin feet with IK at the seated
    stance, run `frames` (list of dicts for seated_hold), bake."""
    a = new_action(name, last)
    reset_pose()
    # Seed: thighs forward-horizontal + knees bent so IK targets land at a
    # natural seated foot position (feet ahead of the hips, flat on floor).
    for s in ("L", "R"):
        pb[BN("thigh", s)].rotation_euler = (flex("thigh", 82), 0, 0)
        pb[BN("shin", s)].rotation_euler = (flex("shin", -85), 0, 0)
    tgts = setup_leg_ik()
    # Move the pinned feet to a flat seated stance: forward of the hips, on floor.
    for s, t in tgts.items():
        t.location.z = 0.05
        t.location.y = -0.34   # feet ahead (−Y is forward here)
    for fr in frames:
        seated_hold(fr.get("frame"), **{k: v for k, v in fr.items() if k != "frame"})
    bake_ik_to_fk(1, last)
    ACTIONS[name] = a
    return a

# seated-squat = sit-to-stand: rise out of the chair and back down.
make_seated("seated-squat", 72, [
    {"frame": 1,  "drop": SEAT_DROP, "back": 0.02, "arm_sh": 55, "arm_el": 20, "torso_lean": 10},
    {"frame": 30, "drop": 0.04,      "back": 0.0,  "arm_sh": 60, "arm_el": 15, "torso_lean": 4},   # stood up
    {"frame": 72, "drop": SEAT_DROP, "back": 0.02, "arm_sh": 55, "arm_el": 20, "torso_lean": 10},
])

# seated-deadlift = seated hinge: chest toward knees, back flat, then tall.
make_seated("seated-deadlift", 72, [
    {"frame": 1,  "torso_lean": 4,  "arm_sh": 0, "arm_el": 5, "neck": -6},
    {"frame": 36, "torso_lean": 34, "arm_sh": 0, "arm_el": 0, "neck": -10},   # hinge forward
    {"frame": 72, "torso_lean": 4,  "arm_sh": 0, "arm_el": 5, "neck": -6},
])

# seated-press = seated press-out / overhead-ish: arms drive up and forward.
make_seated("seated-press", 64, [
    {"frame": 1,  "arm_sh": 25, "arm_el": 130},
    {"frame": 32, "arm_sh": 150, "arm_el": 10, "torso_lean": 0},   # pressed up
    {"frame": 64, "arm_sh": 25, "arm_el": 130},
])

# seated-row = seated band row: elbows drive back, squeeze the back.
make_seated("seated-row", 64, [
    {"frame": 1,  "arm_sh": 55, "arm_el": 5},
    {"frame": 32, "arm_sh": 8,  "arm_el": 95, "torso_lean": 6},   # pulled in
    {"frame": 64, "arm_sh": 55, "arm_el": 5},
])

# seated-core = seated brace + slow knee lift (subtle, safe).
make_seated("seated-core", 72, [
    {"frame": 1,  "torso_lean": 4, "arm_sh": 10, "arm_el": 90},
    {"frame": 36, "torso_lean": 6, "arm_sh": 10, "arm_el": 90},
    {"frame": 72, "torso_lean": 4, "arm_sh": 10, "arm_el": 90},
])

# seated-cardio = seated arm pumps (heart-rate up, seated).
make_seated("seated-cardio", 40, [
    {"frame": 1,  "arm_sh": 150, "arm_el": 20},
    {"frame": 10, "arm_sh": 20,  "arm_el": 20},
    {"frame": 20, "arm_sh": 150, "arm_el": 20},
    {"frame": 30, "arm_sh": 20,  "arm_el": 20},
    {"frame": 40, "arm_sh": 150, "arm_el": 20},
])

# seated-catcow = seated spine mobility: gentle arch ↔ round.
make_seated("seated-catcow", 96, [
    {"frame": 1,  "torso_lean": -8, "neck": -12, "arm_sh": 6, "arm_el": 30},   # cow (arch, look up)
    {"frame": 48, "torso_lean": 18, "neck": 14,  "arm_sh": 6, "arm_el": 30},   # cat (round, chin down)
    {"frame": 96, "torso_lean": -8, "neck": -12, "arm_sh": 6, "arm_el": 30},
])

# seated-carry = seated hold: weights at the sides, braced.
make_seated("seated-carry", 72, [
    {"frame": 1,  "torso_lean": 3, "arm_sh": 4, "arm_el": 6},
    {"frame": 36, "torso_lean": 4, "arm_sh": 4, "arm_el": 6},
    {"frame": 72, "torso_lean": 3, "arm_sh": 4, "arm_el": 6},
])

# ── CHAIR-SUPPORTED squat — standing behind a chair, hands on its back for
# balance, a SHALLOWER partial squat. Feet planted (IK), hips sink less than the
# full squat, arms reach forward-down to rest on the chair back. Only air-squat
# has a chair-supported variant (see lib/movements.ts). ─────────────────────────
a = new_action("supported-squat", 72)
setup_leg_ik()
def supported_frame(frame, drop, torso_lean, arm_sh, arm_el):
    key(BN("hips"), frame, rx=flex("hips", torso_lean), loc=hips_offset(0.02, -drop))
    key(BN("spine"), frame, rx=flex("hips", torso_lean * 0.5))
    key(BN("chest"), frame, rx=flex("hips", torso_lean * 0.3))
    for s in ("L", "R"):
        key(BN("upperarm", s), frame, rx=flex("upperarm", arm_sh))
        key(BN("forearm", s), frame, rx=flex("forearm", arm_el))
# Hands reach forward-down (arm_sh ~70, elbow slightly bent) to the chair back;
# partial depth (0.26 vs the full squat's 0.44).
supported_frame(1,  0.02, 6,  70, 25)
supported_frame(36, 0.26, 16, 68, 22)   # partial squat, hands still on the back
supported_frame(72, 0.02, 6,  70, 25)
bake_ik_to_fk(1, 72)
ACTIONS["supported-squat"] = a

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

def make_chair():
    """A simple sturdy chair: seat at SEAT_Z, four legs, a low back. The seated
    figure rests on this so the pose reads unmistakably as 'seated'."""
    WOOD = mat("chair", (0.30, 0.34, 0.42, 1.0), 0.7)
    parts = [cube("seat", 0.42, 0.42, 0.04, (0, -0.30, SEAT_Z), WOOD)]
    for lx, ly in ((0.18, -0.10), (-0.18, -0.10), (0.18, -0.50), (-0.18, -0.50)):
        parts.append(cube(f"leg_{lx}_{ly}", 0.04, 0.04, SEAT_Z, (lx, ly, SEAT_Z / 2), WOOD))
    parts.append(cube("back", 0.42, 0.04, 0.42, (0, -0.10, SEAT_Z + 0.23), WOOD))
    return join_as("chair", parts)

def make_support_chair():
    """A chair placed in FRONT of a standing figure, its back toward them, so
    hands rest on the back for balance (the chair-supported variant)."""
    WOOD = mat("chair", (0.30, 0.34, 0.42, 1.0), 0.7)
    # seat centered ~0.42 m forward (−Y), back edge nearest the figure.
    parts = [cube("s_seat", 0.42, 0.42, 0.04, (0, -0.42, SEAT_Z), WOOD)]
    for lx, ly in ((0.18, -0.24), (-0.18, -0.24), (0.18, -0.62), (-0.18, -0.62)):
        parts.append(cube(f"s_leg_{lx}_{ly}", 0.04, 0.04, SEAT_Z, (lx, ly, SEAT_Z / 2), WOOD))
    # back at the near edge (−Y ~ -0.24), rising to hand height (~0.90).
    parts.append(cube("s_back", 0.42, 0.04, 0.42, (0, -0.24, SEAT_Z + 0.23), WOOD))
    return join_as("support_chair", parts)

def build_gear(mv):
    if mv == "supported-squat":
        return [make_support_chair()]
    if mv.startswith("seated-"):
        return [make_chair()]
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
              "plank": 72, "walk": 48, "run": 32, "idle": 96,
              "seated-squat": 72, "seated-deadlift": 72, "seated-press": 64,
              "seated-row": 64, "seated-core": 72, "seated-cardio": 40,
              "seated-catcow": 96, "seated-carry": 72, "supported-squat": 72}
for mv in ["squat", "deadlift", "press", "pullup", "plank", "walk", "run", "idle",
           "seated-squat", "seated-deadlift", "seated-press", "seated-row",
           "seated-core", "seated-cardio", "seated-catcow", "seated-carry",
           "supported-squat"]:
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
