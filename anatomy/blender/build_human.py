# build_human.py — build the EXACT anatomical human for Kelo, in Blender.
#
# Pipeline (per the human-anatomy-exact skill):
#   1. Clear the scene.
#   2. Build an armature at the REAL joint centres (mm → m), roll axes per the
#      joint table, with ROM limits so poses can't break the body.
#   3. Import the Z-Anatomy meshes (bones + muscles + nerves + ligaments, no skin),
#      parent each to the segment it belongs to so it deforms with the pose.
#   4. Tag the highlight muscles by their TA2 id (muscle-ta2-map.json) so the web
#      app can emissive-glow the "worked" muscles per movement.
#   5. Export glTF for the web (decimated) — one rigged body.
#
# Run via Blender MCP (execute_blender_code) or: blender -b -P build_human.py
# Z-Anatomy is CC-BY-SA 4.0 — attribution + ShareAlike required on any export.
#
# © Ankur Sinha. Anatomy: Z-Anatomy (CC-BY-SA 4.0) / BodyParts3D (CC-BY-SA 2.1 JP).

import bpy, math, json, os

MM = 0.001  # Blender unit = 1 m; table is in mm.

# ── Joint centres (mm), 50th-pct male @1750mm, from the anatomy skill ──────────
# origin = floor between feet; +Z up, +X right, +Y forward.
HIP_DX, SHOULDER_DX = 83, 180
JOINTS = {
    "root":       (0,    0,    928),   # pelvis / hip height
    "spine":      (0,    0,   1120),   # mid-trunk
    "chest":      (0,    0,   1400),
    "neck":       (0,    0,   1460),
    "head":       (0,    0,   1620),
    "shoulder.L": (-SHOULDER_DX, 0, 1432), "shoulder.R": (SHOULDER_DX, 0, 1432),
    "elbow.L":    (-SHOULDER_DX, 0, 1106), "elbow.R":    (SHOULDER_DX, 0, 1106),
    "wrist.L":    (-SHOULDER_DX, 0, 850),  "wrist.R":    (SHOULDER_DX, 0, 850),
    "hip.L":      (-HIP_DX, 0, 928),  "hip.R":      (HIP_DX, 0, 928),
    "knee.L":     (-HIP_DX, 0, 499),  "knee.R":     (HIP_DX, 0, 499),
    "ankle.L":    (-HIP_DX, 0, 68),   "ankle.R":    (HIP_DX, 0, 68),
    "toe.L":      (-HIP_DX, 198, 20), "toe.R":      (HIP_DX, 198, 20),
}
BONES = [  # (name, head_joint, tail_joint)
    ("pelvis","root","spine"), ("spine","spine","chest"), ("chest","chest","neck"),
    ("neck","neck","head"), ("head","head",None),
    ("upperarm.L","shoulder.L","elbow.L"), ("forearm.L","elbow.L","wrist.L"),
    ("upperarm.R","shoulder.R","elbow.R"), ("forearm.R","elbow.R","wrist.R"),
    ("thigh.L","hip.L","knee.L"), ("shin.L","knee.L","ankle.L"), ("foot.L","ankle.L","toe.L"),
    ("thigh.R","hip.R","knee.R"), ("shin.R","knee.R","ankle.R"), ("foot.R","ankle.R","toe.R"),
]
# Healthy ROM (deg) for the primary flexion axis — clamp so poses stay anatomical.
ROM = {"forearm":(0,145), "shin":(-140,0), "thigh":(-20,120), "upperarm":(-60,180)}

def clear_scene():
    # Remove all objects, but KEEP the scene master collection (we link into it).
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for coll in list(bpy.data.collections):  # extra user collections only
        bpy.data.collections.remove(coll)

def link_obj(obj):
    bpy.context.scene.collection.objects.link(obj)

def v(j):
    x, y, z = JOINTS[j]
    return (x*MM, y*MM, z*MM)

def build_armature():
    arm = bpy.data.armatures.new("KeloBody")
    obj = bpy.data.objects.new("KeloBody", arm)
    link_obj(obj)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='EDIT')
    made = {}
    for name, hj, tj in BONES:
        b = arm.edit_bones.new(name)
        b.head = v(hj)
        b.tail = v(tj) if tj else (v(hj)[0], v(hj)[1], v(hj)[2] + 0.13)  # head cap
        made[name] = b
    # parent chain
    par = {"spine":"pelvis","chest":"spine","neck":"chest","head":"neck",
           "upperarm.L":"chest","forearm.L":"upperarm.L","upperarm.R":"chest","forearm.R":"upperarm.R",
           "thigh.L":"pelvis","shin.L":"thigh.L","foot.L":"shin.L",
           "thigh.R":"pelvis","shin.R":"thigh.R","foot.R":"shin.R"}
    for child, parent in par.items():
        made[child].parent = made[parent]
    bpy.ops.object.mode_set(mode='OBJECT')
    print("armature: %d bones at real joint centres" % len(made))
    return obj

def add_rom_limits(obj):
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='POSE')
    for pb in obj.pose.bones:
        key = pb.name.split(".")[0]
        if key in ROM:
            c = pb.constraints.new('LIMIT_ROTATION')
            c.use_limit_x = True
            c.min_x = math.radians(ROM[key][0]); c.max_x = math.radians(ROM[key][1])
            c.owner_space = 'LOCAL'
    bpy.ops.object.mode_set(mode='OBJECT')
    print("ROM limits applied (knee/elbow/hip/shoulder)")

# ── Z-Anatomy import + muscle tagging ─────────────────────────────────────────
HERE = os.path.dirname(bpy.data.filepath) or os.path.dirname(__file__ if "__file__" in globals() else ".")
MAP_PATH = os.path.join(HERE, "..", "muscle-ta2-map.json")

def load_muscle_map():
    try:
        return json.load(open(MAP_PATH))
    except Exception as e:
        print("muscle map not found (%s) — tag muscles manually" % e); return {}

def tag_highlight_muscles():
    """Rename/flag the highlight muscles so the web app can find them. Expects the
    Z-Anatomy meshes to be imported already (their names contain the TA2 English
    term). Adds a custom property `kelo_muscle` = our MuscleId."""
    m = load_muscle_map()
    tagged = 0
    for mid, meta in m.items():
        term = (meta.get("en") or "").lower().replace(" muscle", "")
        for o in bpy.data.objects:
            if o.type == 'MESH' and term and term in o.name.lower():
                o["kelo_muscle"] = mid
                o["ta2_id"] = meta.get("ta2_id", "")
                tagged += 1
                break
    print("tagged %d highlight muscles for the web glow API" % tagged)

def verify_dimensions(arm):
    """Check bone lengths against the anatomy skill's mm table (±few mm)."""
    import mathutils
    expect = {"thigh.L": 429, "shin.L": 431, "upperarm.L": 326, "forearm.L": 256}
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='EDIT')
    ok = True
    for name, exp_mm in expect.items():
        b = arm.data.edit_bones.get(name)
        if not b: continue
        length_mm = (b.tail - b.head).length / MM
        good = abs(length_mm - exp_mm) < 6
        ok = ok and good
        print("  %-11s %6.1f mm  (expect %d)  %s" % (name, length_mm, exp_mm, "OK" if good else "OFF"))
    bpy.ops.object.mode_set(mode='OBJECT')
    total = (v("head")[2]) / MM
    print("  total height ~%.0f mm (target 1750)" % (JOINTS["head"][2] + 130))
    print("DIMENSION CHECK:", "PASS" if ok else "REVIEW")

def main():
    clear_scene()
    arm = build_armature()
    add_rom_limits(arm)
    print("\n=== dimension verification (mm table) ===")
    verify_dimensions(arm)
    # save the skeleton .blend so it's a real artifact
    out = os.path.join(HERE, "..", "out", "kelo-skeleton.blend")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=out)
    print("saved:", out)
    # NEXT (needs the Z-Anatomy .blend/.glb present locally):
    #   bpy.ops.import_scene.gltf(filepath=".../z-anatomy.glb")  OR append from .blend
    #   parent muscle/bone/nerve/ligament meshes to `arm` with automatic weights
    #   tag_highlight_muscles()
    #   decimate muscle meshes to a web budget (<150k tris total)
    #   bpy.ops.export_scene.gltf(filepath=".../anatomy/out/kelo-human.glb", ...)
    print("\nSKELETON READY. Import Z-Anatomy meshes, then parent + tag + export.")

if __name__ == "__main__":
    main()
