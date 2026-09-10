# export_full_body_v2.py — COMPLETE muscular body, reliably decimated for web.
# Fix: the previous run left 714/734 meshes multi-user so decimate was a no-op.
# Here we copy each mesh's data to a unique mesh (guaranteed single-user) BEFORE
# adding the DECIMATE modifier, then apply via a temp-override context.
#
# blender -b -P export_full_body_v2.py
# © Ankur Sinha. Anatomy: Z-Anatomy CC-BY-SA 4.0.

import bpy, json, os, mathutils

ROOT = "/Users/sinhaankur/Documents/crossfit/anatomy"
BLEND = os.path.join(ROOT, "z-anatomy", "Z-Anatomy", "Startup.blend")
MAP = json.load(open(os.path.join(ROOT, "muscle-ta2-map.json")))
OUT = "/Users/sinhaankur/Documents/crossfit/public/anatomy-muscles.glb"

KEEP_COLLECTIONS = ["4: Muscular system"]
KEEP_NAME_HINTS = ["skull", "cranium", "mandible", "cranial", "hyoid", "frontal bone", "parietal", "temporal bone", "maxilla", "occipital"]
RATIO = 0.4  # moderate — keep shape + all meshes

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

def by_hint(hints):
    return {o.name for o in bpy.data.objects if o.type == 'MESH' and any(h in o.name.lower() for h in hints)}

def main():
    bpy.ops.wm.open_mainfile(filepath=BLEND)
    keep = in_collections(KEEP_COLLECTIONS) | by_hint(KEEP_NAME_HINTS)
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.name not in keep:
            bpy.data.objects.remove(o, do_unlink=True)
    meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    print("meshes:", len(meshes), "tris before:", sum(len(o.data.polygons) for o in meshes if o.data))

    dec = 0
    for o in meshes:
        if not o.data or len(o.data.polygons) < 16:
            continue
        # GUARANTEE single-user: replace with a private copy of the mesh data.
        o.data = o.data.copy()
        m = o.modifiers.new("dec", 'DECIMATE')
        m.ratio = RATIO
        with bpy.context.temp_override(object=o, active_object=o, selected_objects=[o], selected_editable_objects=[o]):
            try:
                bpy.ops.object.modifier_apply(modifier="dec"); dec += 1
            except Exception as e:
                o.modifiers.remove(m)
    print("decimated:", dec, "tris after:", sum(len(o.data.polygons) for o in meshes if o.data))

    # tag highlight muscles
    tagged = 0
    for mid, meta in MAP.items():
        term = (meta.get("en") or "").lower().replace(" muscle", "")
        for o in bpy.data.objects:
            if o.type == 'MESH' and term and term in o.name.lower():
                o["kelo_muscle"] = mid; tagged += 1; break
    print("tagged:", tagged)

    # center feet at z=0, x/y centered
    mn = mathutils.Vector((1e9,)*3); mx = mathutils.Vector((-1e9,)*3)
    for o in meshes:
        for c in o.bound_box:
            w = o.matrix_world @ mathutils.Vector(c)
            for i in range(3): mn[i]=min(mn[i],w[i]); mx[i]=max(mx[i],w[i])
    ctr = (mn+mx)/2
    for o in meshes:
        o.location.x -= ctr.x; o.location.y -= ctr.y; o.location.z -= mn.z
    print("height m:", round(mx.z-mn.z, 2))

    # CRITICAL: muscle meshes live in nested collections not linked to the scene's
    # master collection, so select_all misses them and use_selection exports only
    # the head bones. Link every kept mesh into the scene collection first.
    scene_coll = bpy.context.scene.collection
    linked = 0
    for o in meshes:
        if o.name not in scene_coll.objects:
            try: scene_coll.objects.link(o); linked += 1
            except Exception: pass
    print("linked into scene collection:", linked)
    live = [o for o in bpy.data.objects if o.type == 'MESH' and o.data and len(o.data.polygons) > 0]
    print("meshes with geometry before export:", len(live))
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', use_selection=False,
        export_extras=True, export_yup=True,
        export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=5)
    print("EXPORTED %.2fMB" % (os.path.getsize(OUT)/1e6))

main()
