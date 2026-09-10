# export_highlight_muscles.py — a WEB-VIABLE anatomical figure: just the ~20
# muscles Kelo highlights (not all 789), decimated + tagged + exported to glTF.
# This is the shippable v1 the app can glow per movement.
#
# blender -b -P export_highlight_muscles.py
# © Ankur Sinha. Anatomy: Z-Anatomy (CC-BY-SA 4.0).

import bpy, json, os

HERE = os.path.dirname(__file__) if "__file__" in globals() else "."
ROOT = os.path.abspath(os.path.join(HERE, ".."))
BLEND = os.path.join(ROOT, "z-anatomy", "Z-Anatomy", "Startup.blend")
MAP = json.load(open(os.path.join(ROOT, "muscle-ta2-map.json")))
OUT = os.path.join(ROOT, "out"); os.makedirs(OUT, exist_ok=True)

def keep_only_highlight_muscles():
    keep = {}
    for mid, meta in MAP.items():
        term = (meta.get("en") or "").lower().replace(" muscle", "")
        if not term: continue
        # collect all matching meshes (left+right+parts) for this muscle
        for o in bpy.data.objects:
            if o.type == 'MESH' and term in o.name.lower():
                keep.setdefault(mid, []).append(o.name)
    keepset = {n for names in keep.values() for n in names}
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.name not in keepset:
            bpy.data.objects.remove(o, do_unlink=True)
    print("kept %d muscle meshes across %d groups" % (len(keepset), len(keep)))
    return keep

def single_user_and_decimate(ratio):
    for o in bpy.data.objects:
        bpy.ops.object.select_all(action='DESELECT')
        if o.type != 'MESH': continue
        o.select_set(True); bpy.context.view_layer.objects.active = o
        try: bpy.ops.object.make_single_user(object=True, obdata=True)
        except Exception: pass
        if o.data and len(o.data.polygons) > 300:
            m = o.modifiers.new("dec", 'DECIMATE'); m.ratio = ratio
            try: bpy.ops.object.modifier_apply(modifier=m.name)
            except Exception: o.modifiers.remove(m)

def tag(keep):
    for mid, names in keep.items():
        for n in names:
            o = bpy.data.objects.get(n)
            if o: o["kelo_muscle"] = mid; o["ta2_id"] = MAP[mid].get("ta2_id","")

def tris():
    return sum(len(o.data.polygons) for o in bpy.data.objects if o.type=='MESH' and o.data)

def main():
    bpy.ops.wm.open_mainfile(filepath=BLEND)
    print("opened:", len(bpy.data.objects), "objects")
    keep = keep_only_highlight_muscles()
    print("tris before:", tris())
    single_user_and_decimate(0.25)
    print("tris after decimate:", tris())
    tag(keep)
    # center + export
    bpy.ops.object.select_all(action='SELECT')
    path = os.path.join(OUT, "kelo-muscles.glb")
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB',
                              use_selection=True, export_extras=True, export_yup=True)
    sz = os.path.getsize(path)/1e6 if os.path.exists(path) else 0
    print("EXPORTED %s (%.2f MB)" % (path, sz))
    json.dump({"groups": keep, "source":"Z-Anatomy CC-BY-SA 4.0", "tris": tris()},
              open(os.path.join(OUT,"kelo-muscles.manifest.json"),"w"), indent=1)

main()
