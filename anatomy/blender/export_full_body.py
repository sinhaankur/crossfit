# export_full_body.py — a COMPLETE muscular body for the web (not just the 21
# highlight muscles). Keep the whole Muscular system + the skull/head so the figure
# reads as a full human, tag the highlight muscles for the glow, decimate hard,
# draco-compress. Fixes the "a lot is missing" (head/hands/feet/sparse legs) issue.
#
# blender -b -P export_full_body.py
# © Ankur Sinha. Anatomy: Z-Anatomy CC-BY-SA 4.0.

import bpy, json, os, mathutils

ROOT = "/Users/sinhaankur/Documents/crossfit/anatomy"
BLEND = os.path.join(ROOT, "z-anatomy", "Z-Anatomy", "Startup.blend")
MAP = json.load(open(os.path.join(ROOT, "muscle-ta2-map.json")))
OUT = "/Users/sinhaankur/Documents/crossfit/public/anatomy-muscles.glb"

# Keep the full muscular system + the cranium/mandible so there's a head. Skip
# viscera, vessels, nerves (too heavy / not wanted for the fitness figure).
KEEP_COLLECTIONS = ["4: Muscular system"]
KEEP_NAME_HINTS = ["skull", "cranium", "mandible", "cranial", "hyoid", "occipital", "frontal bone", "parietal", "temporal bone", "maxilla"]

def in_collections(names):
    keep = set()
    def walk(c):
        for o in c.objects:
            if o.type == 'MESH': keep.add(o.name)
        for ch in c.children: walk(ch)
    for n in names:
        c = bpy.data.collections.get(n)
        if c: walk(c)
    return keep

def by_name_hint(hints):
    keep = set()
    for o in bpy.data.objects:
        if o.type != 'MESH': continue
        nl = o.name.lower()
        if any(h in nl for h in hints): keep.add(o.name)
    return keep

def main():
    bpy.ops.wm.open_mainfile(filepath=BLEND)
    print("opened:", len(bpy.data.objects), "objects")

    keep = in_collections(KEEP_COLLECTIONS) | by_name_hint(KEEP_NAME_HINTS)
    print("keeping", len(keep), "meshes (full muscular system + head bones)")

    # prune everything else
    removed = 0
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.name not in keep:
            bpy.data.objects.remove(o, do_unlink=True); removed += 1
    print("pruned", removed)

    meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    tris0 = sum(len(o.data.polygons) for o in meshes if o.data)
    print("meshes:", len(meshes), "tris before:", tris0)

    # single-user + decimate hard (per object, headless-safe)
    for o in meshes:
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True); bpy.context.view_layer.objects.active = o
        try: bpy.ops.object.make_single_user(object=True, obdata=True)
        except: pass
        if o.data and len(o.data.polygons) > 24:
            m = o.modifiers.new("d", 'DECIMATE'); m.ratio = 0.12
            try: bpy.ops.object.modifier_apply(modifier="d")
            except: o.modifiers.remove(m)
    tris1 = sum(len(o.data.polygons) for o in meshes if o.data)
    print("tris after decimate:", tris1)

    # tag highlight muscles
    tagged = 0
    for mid, meta in MAP.items():
        term = (meta.get("en") or "").lower().replace(" muscle", "")
        for o in bpy.data.objects:
            if o.type == 'MESH' and term and term in o.name.lower():
                o["kelo_muscle"] = mid; tagged += 1; break
    print("tagged highlight muscles:", tagged)

    # center: feet at y(=z here, but Z-up)→ we export yup so recompute bounds in Z
    mn = mathutils.Vector((1e9,)*3); mx = mathutils.Vector((-1e9,)*3)
    for o in meshes:
        for c in o.bound_box:
            w = o.matrix_world @ mathutils.Vector(c)
            for i in range(3): mn[i]=min(mn[i],w[i]); mx[i]=max(mx[i],w[i])
    ctr = (mn+mx)/2
    for o in meshes:
        o.location.x -= ctr.x; o.location.y -= ctr.y; o.location.z -= mn.z
    print("height (m):", round(mx.z-mn.z,2))

    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', use_selection=True,
        export_extras=True, export_yup=True,
        export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6)
    print("EXPORTED", OUT, "%.2fMB" % (os.path.getsize(OUT)/1e6))

main()
