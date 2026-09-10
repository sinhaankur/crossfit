# export_web_human.py — from the full Z-Anatomy Startup.blend, produce a
# web-ready anatomical human for Kelo: muscular + skeletal systems, our highlight
# muscles tagged, decimated to a web budget, exported as glTF.
#
# Z-Anatomy is CC-BY-SA 4.0 — the export carries the attribution + stays CC-BY-SA.
#
# blender -b -P export_web_human.py
# © Ankur Sinha. Anatomy: Z-Anatomy (CC-BY-SA 4.0) / BodyParts3D (CC-BY-SA 2.1 JP).

import bpy, json, os

HERE = os.path.dirname(__file__) if "__file__" in globals() else "."
ROOT = os.path.abspath(os.path.join(HERE, ".."))
BLEND = os.path.join(ROOT, "z-anatomy", "Z-Anatomy", "Startup.blend")
MAP = json.load(open(os.path.join(ROOT, "muscle-ta2-map.json")))
OUT = os.path.join(ROOT, "out")
os.makedirs(OUT, exist_ok=True)

# Which Z-Anatomy top systems to keep for the web figure (no skin, no viscera).
# v1 = muscular system only (the highlight target); skeleton/nerves as later layers.
KEEP_SYSTEMS = ["4: Muscular system"]
TRI_BUDGET = 180_000  # total, decimate muscles down to this

def open_model():
    bpy.ops.wm.open_mainfile(filepath=BLEND)
    print("opened Z-Anatomy:", len(bpy.data.objects), "objects")

def objects_in_systems(system_names):
    """All mesh objects that live (recursively) under the named collections."""
    keep = set()
    def walk(coll):
        for o in coll.objects:
            if o.type == 'MESH': keep.add(o.name)
        for ch in coll.children:
            walk(ch)
    for name in system_names:
        c = bpy.data.collections.get(name)
        if c: walk(c)
    return keep

def prune_to(keep_names):
    removed = 0
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.name not in keep_names:
            bpy.data.objects.remove(o, do_unlink=True); removed += 1
    print("pruned %d meshes; kept %d" % (removed, len(keep_names)))

def tag_muscles():
    tagged = []
    for mid, meta in MAP.items():
        term = (meta.get("en") or "").lower().replace(" muscle", "")
        for o in bpy.data.objects:
            if o.type == 'MESH' and term and term in o.name.lower():
                o["kelo_muscle"] = mid
                o["ta2_id"] = meta.get("ta2_id", "")
                tagged.append((mid, o.name)); break
    print("tagged %d highlight muscles" % len(tagged))
    return tagged

def total_tris():
    return sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH' and o.data)

def decimate_all(ratio):
    # Z-Anatomy shares mesh data between left/right instances → make single-user
    # first, else modifier_apply fails on multi-user data.
    bpy.ops.object.select_all(action='SELECT')
    try:
        bpy.ops.object.make_single_user(object=True, obdata=True)
    except Exception as e:
        print("make_single_user:", e)
    done = 0
    for o in bpy.data.objects:
        if o.type == 'MESH' and o.data and len(o.data.polygons) > 400:
            m = o.modifiers.new("dec", 'DECIMATE'); m.ratio = ratio
            bpy.context.view_layer.objects.active = o
            try:
                bpy.ops.object.modifier_apply(modifier=m.name); done += 1
            except Exception:
                o.modifiers.remove(m)
    print("decimated %d meshes" % done)

def export_gltf():
    path = os.path.join(OUT, "kelo-human.glb")
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(
        filepath=path, export_format='GLB', use_selection=True,
        export_apply=True, export_extras=True,  # keep custom props (kelo_muscle)
        export_yup=True,
    )
    print("EXPORTED:", path, "(%.1f MB)" % (os.path.getsize(path)/1e6))

def main():
    open_model()
    keep = objects_in_systems(KEEP_SYSTEMS)
    if not keep:
        print("!! no meshes found in", KEEP_SYSTEMS, "— check collection names"); return
    prune_to(keep)
    tag_muscles()
    tris = total_tris(); print("tris after prune:", tris)
    if tris > TRI_BUDGET:
        ratio = max(0.05, TRI_BUDGET / tris)
        print("decimating to ratio %.3f" % ratio)
        decimate_all(ratio)
        print("tris after decimate:", total_tris())
    manifest = {"muscles": tag_muscles(), "source": "Z-Anatomy CC-BY-SA 4.0"}
    json.dump(manifest, open(os.path.join(OUT, "kelo-human.manifest.json"), "w"), indent=1)
    export_gltf()

if __name__ == "__main__":
    main()
