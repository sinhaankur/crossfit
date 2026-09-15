# human_rig_build.py — the rigged, animated human for the movement gallery.
# © Ankur Sinha. Own work (no Mixamo): a clean athletic figure built, skinned,
# and keyframed procedurally, exported as ONE GLB PER MOVEMENT for
# components/human-3d.tsx (it HEAD-probes /models/<movement>.glb and plays the
# file's single clip).
#
# Run:  /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup \
#           -P anatomy/human_rig_build.py
#
# Design notes:
# - Proportions from standard anthropometry at H=1.75 (hip 0.95, knee 0.50,
#   ankle 0.07, shoulder 1.43, crown 1.75), feet at origin, facing -Y
#   (the glTF exporter's +Y-up conversion makes that face the R3F camera).
# - Legs are posed by an ANALYTIC 2-link solve (hip→knee→ankle) so squat and
#   hinge keep the feet planted instead of eyeballed angles.
# - Bone-local rotation SIGNS are AUTO-DETECTED at runtime (pose a test bone,
#   evaluate the depsgraph, measure which way the child moved) — headless-safe
#   against Blender roll conventions.
# - Mesh is one joined set of ellipsoids (smooth-shaded) skinned with
#   automatic weights + a nearest-bone safety pass for any missed verts.

import bpy
import math
from mathutils import Vector, Matrix

# ---------------------------------------------------------------- constants
H = 1.75
HIP_Z, KNEE_Z, ANKLE_Z = 0.95, 0.50, 0.07
SHOULDER_Z, NECK_Z, CROWN_Z = 1.43, 1.52, 1.75
HIP_X, SHOULDER_X = 0.10, 0.19
LT = HIP_Z - KNEE_Z          # thigh length 0.45
LS = KNEE_Z - ANKLE_Z        # shin length 0.43
LU = 0.33                    # upper arm
LF = 0.26                    # forearm
FPS = 24

SKIN = (0.910, 0.631, 0.498, 1.0)     # #e8a17f
SHORTS = (0.133, 0.149, 0.180, 1.0)   # dark graphite
SHOE = (0.086, 0.094, 0.113, 1.0)
ACCENT = (0.957, 0.247, 0.369, 1.0)   # #f43f5e

# Anchor output to THIS script's location (bpy's "//" is blend-file-relative
# and resolves to CWD-parent when the file is unsaved — it landed outside the
# repo on the first run).
import os as _os
OUT_DIR = _os.path.normpath(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..", "public", "models"))

# ---------------------------------------------------------------- scene reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.fps = FPS

# ---------------------------------------------------------------- mesh parts
def ellipsoid(name, center, rx, ry, rz, seg=16, rings=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=1.0, location=center)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (rx, ry, rz)
    bpy.ops.object.transform_apply(scale=True)
    return ob

parts, mats = [], {}

def mat(name, rgba, rough=0.55):
    if name in mats:
        return mats[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = rgba
    bsdf.inputs["Roughness"].default_value = rough
    mats[name] = m
    return m

def add(ob, m):
    ob.data.materials.append(m)
    parts.append(ob)

skin, shorts_m, shoe_m, accent_m = mat("skin", SKIN), mat("shorts", SHORTS), mat("shoe", SHOE, 0.7), mat("accent", ACCENT, 0.5)

# torso
add(ellipsoid("pelvis", (0, 0, 0.99), 0.155, 0.115, 0.13), shorts_m)
add(ellipsoid("abdomen", (0, 0, 1.16), 0.145, 0.105, 0.14), skin)
add(ellipsoid("chest", (0, 0, 1.36), 0.175, 0.115, 0.16), skin)
add(ellipsoid("neck", (0, 0, 1.50), 0.05, 0.05, 0.07), skin)
add(ellipsoid("head", (0, -0.01, 1.64), 0.095, 0.115, 0.115), skin)
for sx in (1, -1):
    s = "L" if sx > 0 else "R"
    # legs
    add(ellipsoid(f"thigh.{s}", (sx * HIP_X, 0, (HIP_Z + KNEE_Z) / 2), 0.075, 0.085, LT / 2 + 0.045), shorts_m if True else skin)
    add(ellipsoid(f"shin.{s}", (sx * HIP_X, 0, (KNEE_Z + ANKLE_Z) / 2), 0.055, 0.06, LS / 2 + 0.04), skin)
    add(ellipsoid(f"foot.{s}", (sx * HIP_X, -0.06, 0.045), 0.05, 0.115, 0.042), shoe_m)
    add(ellipsoid(f"lace.{s}", (sx * HIP_X, -0.10, 0.062), 0.032, 0.05, 0.02), accent_m)
    # arms (rest: hanging down, slight A-pose)
    add(ellipsoid(f"shoulderball.{s}", (sx * SHOULDER_X, 0, 1.41), 0.065, 0.065, 0.065), skin)
    add(ellipsoid(f"upperarm.{s}", (sx * (SHOULDER_X + 0.015), 0, 1.41 - LU / 2), 0.05, 0.055, LU / 2 + 0.035), skin)
    add(ellipsoid(f"forearm.{s}", (sx * (SHOULDER_X + 0.03), 0, 1.41 - LU - LF / 2), 0.04, 0.042, LF / 2 + 0.03), skin)
    add(ellipsoid(f"hand.{s}", (sx * (SHOULDER_X + 0.04), -0.01, 1.41 - LU - LF - 0.08), 0.035, 0.05, 0.075), skin)

for ob in parts:
    ob.select_set(False)
for ob in parts:
    ob.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
body = bpy.context.active_object
body.name = "Human"
bpy.ops.object.shade_smooth()
body.select_set(False)

# ---------------------------------------------------------------- armature
arm_data = bpy.data.armatures.new("HumanRig")
rig = bpy.data.objects.new("HumanRig", arm_data)
bpy.context.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode="EDIT")
eb = arm_data.edit_bones

def bone(name, head, tail, parent=None, connect=False):
    b = eb.new(name)
    b.head, b.tail = Vector(head), Vector(tail)
    if parent is not None:
        b.parent = eb[parent]
        b.use_connect = connect
    return b

bone("hips", (0, 0, HIP_Z), (0, 0, 1.10))
bone("spine", (0, 0, 1.10), (0, 0, 1.28), "hips", True)
bone("chest", (0, 0, 1.28), (0, 0, SHOULDER_Z), "spine", True)
bone("neck", (0, 0, SHOULDER_Z), (0, 0, 1.56), "chest", True)
bone("head", (0, 0, 1.56), (0, 0, CROWN_Z), "neck", True)
for sx in (1, -1):
    s = "L" if sx > 0 else "R"
    bone(f"shoulder.{s}", (sx * 0.03, 0, 1.42), (sx * SHOULDER_X, 0, 1.41), "chest")
    bone(f"upperarm.{s}", (sx * SHOULDER_X, 0, 1.41), (sx * (SHOULDER_X + 0.015), 0, 1.41 - LU), f"shoulder.{s}")
    bone(f"forearm.{s}", (sx * (SHOULDER_X + 0.015), 0, 1.41 - LU), (sx * (SHOULDER_X + 0.03), 0, 1.41 - LU - LF), f"upperarm.{s}", True)
    bone(f"hand.{s}", (sx * (SHOULDER_X + 0.03), 0, 1.41 - LU - LF), (sx * (SHOULDER_X + 0.04), -0.01, 1.41 - LU - LF - 0.15), f"forearm.{s}", True)
    bone(f"thigh.{s}", (sx * HIP_X, 0, HIP_Z), (sx * HIP_X, 0, KNEE_Z), "hips")
    bone(f"shin.{s}", (sx * HIP_X, 0, KNEE_Z), (sx * HIP_X, 0, ANKLE_Z), f"thigh.{s}", True)
    bone(f"foot.{s}", (sx * HIP_X, 0, ANKLE_Z), (sx * HIP_X, -0.16, 0.02), f"shin.{s}", True)
bpy.ops.object.mode_set(mode="OBJECT")

# ---------------------------------------------------------------- skinning
body.select_set(True)
rig.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.parent_set(type="ARMATURE_AUTO")

# Safety pass: any vertex the heat solve missed gets the nearest bone, weight 1.
bone_segs = []
for b in arm_data.bones:
    bone_segs.append((b.name, Vector(b.head_local), Vector(b.tail_local)))

def nearest_bone(p):
    best, bd = None, 1e9
    for name, h, t in bone_segs:
        ab = t - h
        tpar = max(0.0, min(1.0, (p - h).dot(ab) / max(ab.length_squared, 1e-9)))
        d = (h + ab * tpar - p).length
        if d < bd:
            best, bd = name, d
    return best

missed = 0
for v in body.data.vertices:
    if not v.groups or all(g.weight < 1e-4 for g in v.groups):
        gname = nearest_bone(Vector(v.co))
        vg = body.vertex_groups.get(gname) or body.vertex_groups.new(name=gname)
        vg.add([v.index], 1.0, "REPLACE")
        missed += 1
print(f"[rig] weight safety pass fixed {missed} verts")

# ---------------------------------------------------------------- pose helpers
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

# AUTO-DETECT: for each chain root, does +X local rotation move the child
# tip FORWARD (-Y) or BACKWARD (+Y)? Store a sign so `flex()` always means
# anatomical flexion regardless of Blender's roll convention.
def detect_sign(bone_name, probe_bone):
    reset_pose()
    before = world_head(probe_bone)
    pb[bone_name].rotation_euler = (math.radians(20), 0, 0)
    after = world_head(probe_bone)
    reset_pose()
    return -1.0 if (after.y - before.y) > 0 else 1.0   # want -Y (forward) on +flex

SIGN = {
    "thigh": detect_sign("thigh.L", "shin.L"),
    "shin": detect_sign("shin.L", "foot.L"),
    "upperarm": detect_sign("upperarm.L", "forearm.L"),
    "forearm": detect_sign("forearm.L", "hand.L"),
    "hips": detect_sign("hips", "head"),
    "foot": detect_sign("foot.L", "foot.L"),
}
print(f"[rig] flex signs: {SIGN}")

# hips world-offset → pose-local (pose location lives in the bone's rest space)
HIPS_REST_INV = (rig.matrix_world @ rig.data.bones["hips"].matrix_local).to_3x3().inverted()

def hips_offset(dy_world, dz_world):
    return HIPS_REST_INV @ Vector((0.0, dy_world, dz_world))

def flex(bone_base, deg):
    """Anatomical flexion in degrees for either side's bone (or axial bones)."""
    return math.radians(deg) * SIGN[bone_base]

def solve_leg(hip_back, hip_drop):
    """Analytic 2-link: hips move (back, down) in world; ankle stays planted.
    Returns (thigh_flex_deg, knee_flex_deg, foot_counter_deg)."""
    fwd = -(-hip_back)  # ankle forward-offset relative to displaced hip = +hip_back
    down = (HIP_Z - hip_drop) - ANKLE_Z
    D2 = fwd * fwd + down * down
    D = math.sqrt(D2)
    cos_k = max(-1.0, min(1.0, (LT * LT + LS * LS - D2) / (2 * LT * LS)))
    knee_inner = math.degrees(math.acos(cos_k))
    knee_flex = 180.0 - knee_inner
    alpha = math.degrees(math.atan2(fwd, down))
    beta = math.degrees(math.asin(max(-1.0, min(1.0, LS * math.sin(math.radians(knee_inner)) / D))))
    thigh_flex = alpha + beta
    shin_abs = thigh_flex - knee_flex   # from vertical, forward-positive
    return thigh_flex, knee_flex, -shin_abs  # foot counters shin to stay flat

def key(bone_name, frame, rx=None, loc=None):
    p = pb[bone_name]
    if rx is not None:
        p.rotation_euler = (rx, p.rotation_euler[1], p.rotation_euler[2])
        p.keyframe_insert("rotation_euler", frame=frame)
    if loc is not None:
        p.location = loc
        p.keyframe_insert("location", frame=frame)

def key_pose(frame, torso=(0, 0, 0), hip_move=(0, 0), legs=None, legs_r=None,
             shoulder=(0, 0), elbow=(0, 0), feet=None, feet_r=None, neck=0.0):
    """torso=(hips,spine,chest) flex°; hip_move=(back,down) world m;
    legs=(thigh,knee,foot)° L (legs_r for R, default mirror-same);
    shoulder/elbow=(L,R)° flexion; feet extra flex."""
    hips_deg, spine_deg, chest_deg = torso
    key("hips", frame, rx=flex("hips", hips_deg), loc=hips_offset(hip_move[0], -hip_move[1]))
    key("spine", frame, rx=flex("hips", spine_deg))
    key("chest", frame, rx=flex("hips", chest_deg))
    key("neck", frame, rx=flex("hips", neck))
    # WORLD-angle semantics with automatic parent compensation. Measured fact
    # (numeric verify pass): for a down-pointing child under a forward-pitched
    # parent, world = local − parent_pitch — the rest down-vector rotates
    # BACKWARD under a forward pelvis/torso pitch. So callers pass the
    # anatomical world angle and we add the parent pitch back in here:
    # thigh_local = world + hips; shoulder_local = world + (hips+spine+chest).
    torso_total = hips_deg + spine_deg + chest_deg
    L = legs or (0, 0, 0)
    R = legs_r if legs_r is not None else L
    for s, (t, k, f) in (("L", L), ("R", R)):
        key(f"thigh.{s}", frame, rx=flex("thigh", t + hips_deg))
        key(f"shin.{s}", frame, rx=flex("shin", -k))       # knee bends backward
        extra = (feet if s == "L" else (feet_r if feet_r is not None else feet)) or 0
        key(f"foot.{s}", frame, rx=flex("foot", f + extra))
    for s, sh, el in (("L", shoulder[0], elbow[0]), ("R", shoulder[1], elbow[1])):
        key(f"upperarm.{s}", frame, rx=flex("upperarm", sh + torso_total))
        key(f"forearm.{s}", frame, rx=flex("forearm", el))

# ---------------------------------------------------------------- movements
def new_action(name, last_frame):
    reset_pose()
    act = bpy.data.actions.new(name)
    if rig.animation_data is None:
        rig.animation_data_create()
    rig.animation_data.action = act
    scene.frame_start, scene.frame_end = 1, last_frame
    return act

ACTIONS = {}

# SQUAT — 72f: stand → parallel (analytic legs, torso 35°, arms out) → stand.
a = new_action("squat", 72)
t, k, f = solve_leg(0.06, HIP_Z - 0.53)
key_pose(1)
key_pose(36, torso=(15, 12, 8), hip_move=(0.06, HIP_Z - 0.53), legs=(t, k, f), shoulder=(75, 75), elbow=(12, 12))
key_pose(72)
ACTIONS["squat"] = a

# DEADLIFT (hinge) — 72f: hips back, flat 65° back, arms hang plumb (world 0).
a = new_action("deadlift", 72)
t, k, f = solve_leg(0.14, HIP_Z - 0.72)
key_pose(1)
key_pose(36, torso=(35, 18, 12), hip_move=(0.14, HIP_Z - 0.72), legs=(t, k, f), shoulder=(0, 0), elbow=(0, 0), neck=-10)
key_pose(72)
ACTIONS["deadlift"] = a

# PRESS — 64f: hands at shoulders → straight overhead lockout → down.
a = new_action("press", 64)
key_pose(1, shoulder=(20, 20), elbow=(140, 140))
key_pose(32, shoulder=(172, 172), elbow=(4, 4), torso=(-4, -2, 0))
key_pose(64, shoulder=(20, 20), elbow=(140, 140))
ACTIONS["press"] = a

# PULLUP — 64f: dead hang → chin-over → hang. Body rises, hands ~fixed.
a = new_action("pullup", 64)
key_pose(1, shoulder=(172, 172), elbow=(5, 5), hip_move=(0, -0.02), legs=(0, 12, 0))
key_pose(32, shoulder=(150, 150), elbow=(115, 115), hip_move=(0, -0.30), legs=(8, 28, 0))
key_pose(64, shoulder=(172, 172), elbow=(5, 5), hip_move=(0, -0.02), legs=(0, 12, 0))
ACTIONS["pullup"] = a
# pullup rises: hip_move down is negative → -(-0.30) puts body UP 0.28 vs hang.

# PLANK — 72f: horizontal hold on forearms, subtle breathing dip.
# Legs slope slightly (world −85°) so the ankles sit low with toes tucked;
# upper arms world-vertical (0) under the horizontal chest, elbows 88°.
a = new_action("plank", 72)
for fr, dip in ((1, 0.0), (36, 1.5), (72, 0.0)):
    key_pose(fr, torso=(88 + dip, 2, 0), hip_move=(0.0, HIP_Z - 0.42),
             legs=(-70, 2, 47), shoulder=(0, 0), elbow=(88, 88), neck=-18)
ACTIONS["plank"] = a

# WALK — 48f in-place cycle.
a = new_action("walk", 48)
for fr, lt, rt, lk, rk, sw, bob in (
    (1, 22, -22, 8, 30, 18, -0.012),
    (13, 0, 0, 4, 34, 0, 0.0),
    (25, -22, 22, 30, 8, -18, -0.012),
    (37, 0, 0, 34, 4, 0, 0.0),
    (48, 22, -22, 8, 30, 18, -0.012),
):
    key_pose(fr, hip_move=(0, -bob), legs=(lt, lk, 0), legs_r=(rt, rk, 0),
             shoulder=(-sw, sw), elbow=(18, 18), torso=(2, 1, 0))
ACTIONS["walk"] = a

# RUN — 32f in-place cycle, forward lean, 90° elbows.
a = new_action("run", 32)
for fr, lt, rt, lk, rk, sw, bob in (
    (1, 42, -30, 15, 85, 32, -0.02),
    (9, 6, 6, 30, 55, 0, 0.015),
    (17, -30, 42, 85, 15, -32, -0.02),
    (25, 6, 6, 55, 30, 0, 0.015),
    (32, 42, -30, 15, 85, 32, -0.02),
):
    key_pose(fr, hip_move=(0.0, -bob), legs=(lt, lk, 0), legs_r=(rt, rk, 0),
             shoulder=(-sw, sw), elbow=(92, 92), torso=(8, 3, 0))
ACTIONS["run"] = a

# IDLE — 96f: quiet breath.
a = new_action("idle", 96)
for fr, br in ((1, 0.0), (48, 1.0), (96, 0.0)):
    key_pose(fr, torso=(0, br * 1.2, br * 1.5), hip_move=(0, -br * 0.006),
             shoulder=(br * 2, br * 2), elbow=(6 + br * 2, 6 + br * 2))
ACTIONS["idle"] = a

bpy.ops.object.mode_set(mode="OBJECT")

# ---------------------------------------------------------------- verify
# Numbers, not pixels: at each movement's key frame, print the world height of
# the joints that MUST be planted/level, so a bad sign or compounding error is
# a printed number instead of a guess from a render. Then render each pose
# with EEVEE for the eyeball pass.
def joint_world(bone_name):
    dg2 = bpy.context.evaluated_depsgraph_get()
    ev = rig.evaluated_get(dg2)
    m = ev.matrix_world @ ev.pose.bones[bone_name].matrix
    return m.translation

VERIFY = [
    ("squat", 36, ["shin.L", "foot.L", "hips", "hand.L"]),
    ("deadlift", 36, ["shin.L", "foot.L", "hips", "hand.L", "upperarm.L"]),
    ("press", 32, ["hand.L", "forearm.L"]),
    ("pullup", 32, ["hand.L", "hips"]),
    ("plank", 36, ["hips", "chest", "hand.L", "foot.L"]),
]

# EEVEE render rig: camera on the model's front-right, soft key light.
cam_data = bpy.data.cameras.new("VerifyCam")
cam = bpy.data.objects.new("VerifyCam", cam_data)
bpy.context.collection.objects.link(cam)
cam.location = (2.0, -2.6, 1.35)
cam.rotation_euler = (math.radians(72), 0, math.radians(37))
sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN"))
bpy.context.collection.objects.link(sun)
sun.rotation_euler = (math.radians(50), math.radians(-15), 0)
sun.data.energy = 3.0
scene.camera = cam
try:
    scene.render.engine = "BLENDER_EEVEE"
except TypeError:
    scene.render.engine = "BLENDER_EEVEE_NEXT"
scene.render.resolution_x, scene.render.resolution_y = 640, 800
world = bpy.data.worlds.new("W")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.06, 0.065, 0.08, 1)
scene.world = world

for aname, fr, joints in VERIFY:
    rig.animation_data.action = ACTIONS[aname]
    scene.frame_set(fr)
    parts_txt = "  ".join(f"{j}@z={joint_world(j).z:+.3f},y={joint_world(j).y:+.3f}" for j in joints)
    print(f"[verify] {aname} f{fr}: {parts_txt}")
    scene.render.filepath = f"/tmp/rigcheck-{aname}.png"
    try:
        bpy.ops.render.render(write_still=True)
    except Exception as e:
        print(f"[verify] render skipped: {e}")

# ---------------------------------------------------------------- equipment
# Render the GEAR too, so each movement READS at a glance ("build or render
# equipments too so that it is clear"): a loaded barbell for squat/deadlift/
# press, a pull-up bar for pull-up, a mat for the plank, the ground for
# walk/run/idle. Static meshes parented into the rig — the hand-held bars ride
# the hand bones (follow the rep), the floor/bar structures stay in the world.
#
# BUILT PER MOVEMENT at export time (each GLB carries only its own gear), and
# skinned/parented so the exporter includes them with use_selection.

STEEL = mat("steel", (0.62, 0.66, 0.72, 1.0), rough=0.35)
PLATE = mat("plate", (0.10, 0.11, 0.14, 1.0), rough=0.6)      # bumper plates
BAR_ACCENT = mat("bar_accent", ACCENT, rough=0.4)            # blue collars/grip
MAT_BLUE = mat("mat", (0.16, 0.32, 0.52, 1.0), rough=0.9)     # exercise mat
FLOOR = mat("floor", (0.09, 0.12, 0.18, 1.0), rough=0.95)     # platform

def cylinder(name, r, depth, loc, axis="X", m=STEEL, verts=20):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, vertices=verts)
    ob = bpy.context.active_object
    ob.name = name
    if axis == "X":
        ob.rotation_euler = (0, math.radians(90), 0)
    elif axis == "Y":
        ob.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)
    ob.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return ob

def cube(name, sx, sy, sz, loc, m=STEEL):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(scale=True)
    ob.data.materials.append(m)
    return ob

def join_as(name, objs):
    for o in bpy.context.selected_objects:
        o.select_set(False)
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    g = bpy.context.active_object
    g.name = name
    g.select_set(False)
    return g

def make_barbell(name, grip_z, grip_y, bar_len=1.9):
    """Olympic bar + bumper plates, centered on the grip point."""
    parts = [cylinder(f"{name}_shaft", 0.014, bar_len, (0, grip_y, grip_z), "X", STEEL, 24)]
    # grip knurl marks (blue) + plates + collars on each side
    for sx in (1, -1):
        parts.append(cylinder(f"{name}_grip.{sx}", 0.016, 0.16, (sx * 0.20, grip_y, grip_z), "X", BAR_ACCENT, 16))
        for pi, (pr, px) in enumerate([(0.225, 0.62), (0.225, 0.68), (0.20, 0.735)]):
            parts.append(cylinder(f"{name}_plate.{sx}.{pi}", pr, 0.05, (sx * px, grip_y, grip_z), "X", PLATE, 28))
        parts.append(cylinder(f"{name}_collar.{sx}", 0.05, 0.05, (sx * 0.58, grip_y, grip_z), "X", BAR_ACCENT, 16))
    return join_as(name, parts)

def parent_to_bone(ob, bone_name):
    """Rigidly attach a static mesh to a bone (rides that bone's motion). Use the
    data-API parent (no operator) so it's headless-robust: set the object's
    parent_type='BONE' + parent_bone, then correct matrix_parent_inverse so the
    mesh keeps its authored world position at the bone's rest pose."""
    bpy.ops.object.mode_set(mode="OBJECT")
    # Bone-parented children hang off the bone's TAIL in Blender; build the
    # rest-pose world matrix of that tail and invert it into the child.
    bone = rig.data.bones[bone_name]
    tail_world = rig.matrix_world @ Matrix.Translation(bone.tail_local) @ bone.matrix_local.to_3x3().to_4x4()
    ob.parent = rig
    ob.parent_type = "BONE"
    ob.parent_bone = bone_name
    ob.matrix_parent_inverse = tail_world.inverted()

def measure_hand(aname, fr):
    """World position of the L hand at a movement's working keyframe — so a
    world-static bar can be placed exactly where the hands grip it."""
    rig.animation_data.action = ACTIONS[aname]
    scene.frame_set(fr)
    dgh = bpy.context.evaluated_depsgraph_get()
    ev = rig.evaluated_get(dgh)
    return (ev.matrix_world @ ev.pose.bones["hand.L"].matrix).translation.copy()

def build_gear(movement):
    """Return the list of gear objects for a movement (fresh each export).
    Bars are WORLD-STATIC at the grip height the hands reach on the working
    keyframe (bone-parenting made the bar inherit the hand's twist + tail
    offset — it floated and tilted). The rep's hands meet the fixed bar, which
    is exactly how a form diagram reads."""
    if movement == "squat":
        h = measure_hand("squat", 36)   # front-rack: hands near shoulders
        hb = make_barbell("bar", grip_z=h.z + 0.02, grip_y=h.y - 0.06)
        return [(hb, None)]
    if movement == "press":
        h = measure_hand("press", 1)    # rack height at the start (hands at shoulders)
        hb = make_barbell("bar", grip_z=h.z, grip_y=h.y - 0.04)
        return [(hb, None)]
    if movement == "deadlift":
        h = measure_hand("deadlift", 36)  # bottom of the hinge, arms plumb
        hb = make_barbell("bar", grip_z=max(0.22, h.z), grip_y=h.y - 0.02)
        return [(hb, None)]
    if movement == "pullup":
        # Fixed overhead bar + two uprights — world-static (not hand-parented).
        bar = cylinder("pu_bar", 0.02, 1.4, (0, 0.0, 2.06), "X", STEEL, 24)
        u1 = cube("pu_u1", 0.04, 0.04, 2.06, (0.66, 0.0, 1.03), STEEL)
        u2 = cube("pu_u2", 0.04, 0.04, 2.06, (-0.66, 0.0, 1.03), STEEL)
        base = cube("pu_base", 1.5, 0.5, 0.04, (0, 0.0, 0.02), FLOOR)
        return [(join_as("pullup_rig", [bar, u1, u2, base]), None)]
    if movement == "plank":
        mat_ob = cube("plank_mat", 0.7, 2.0, 0.02, (0, -0.35, 0.01), MAT_BLUE)
        return [(mat_ob, None)]
    if movement in ("walk", "run", "idle"):
        floor = cube("floor", 2.4, 2.4, 0.03, (0, 0, -0.015), FLOOR)
        return [(floor, None)]
    return []

# ---------------------------------------------------------------- export
import os
os.makedirs(OUT_DIR, exist_ok=True)
# Pattern → action mapping mirrors MODEL_FOR in components/human-3d.tsx.
FILES = {
    "squat": "squat", "deadlift": "deadlift", "press": "press", "pullup": "pullup",
    "plank": "plank", "walk": "walk", "run": "run", "idle": "idle",
}
frame_ends = {"squat": 72, "deadlift": 72, "press": 64, "pullup": 64,
              "plank": 72, "walk": 48, "run": 32, "idle": 96}

for fname, aname in FILES.items():
    rig.animation_data.action = ACTIONS[aname]
    scene.frame_start, scene.frame_end = 1, frame_ends[aname]
    scene.frame_set(1)
    # Build this movement's gear, parent it in, and remember the objects so we
    # can delete them after export (next movement gets its OWN gear only).
    gear = build_gear(fname)
    # build_gear may sample OTHER frames to place a bar; restore this export's
    # action + start frame before writing the file.
    rig.animation_data.action = ACTIONS[aname]
    scene.frame_set(1)
    gear_objs = []
    for ob, bone_name in gear:
        if bone_name:
            parent_to_bone(ob, bone_name)
        gear_objs.append(ob)
    for ob in bpy.context.selected_objects:
        ob.select_set(False)
    body.select_set(True)
    rig.select_set(True)
    for ob in gear_objs:
        ob.select_set(True)
    kwargs = dict(
        filepath=os.path.join(OUT_DIR, f"{fname}.glb"),
        export_format="GLB",
        use_selection=True,
        export_animation_mode="ACTIVE_ACTIONS",
        export_animations=True,
        export_frame_range=True,
        export_force_sampling=True,
        export_optimize_animation_size=True,
    )
    while True:
        try:
            bpy.ops.export_scene.gltf(**kwargs)
            break
        except TypeError as e:  # drop any param this exporter version lacks
            msg = str(e)
            dropped = next((kk for kk in list(kwargs) if kk in msg and kk != "filepath"), None)
            if not dropped:
                raise
            kwargs.pop(dropped)
    # Remove this movement's gear so the next export starts clean.
    for ob in gear_objs:
        bpy.data.objects.remove(ob, do_unlink=True)
    print(f"[export] {fname}.glb  (clip: {aname}, gear: {len(gear_objs)} obj)")

print("[done] all movement GLBs exported to", OUT_DIR)
