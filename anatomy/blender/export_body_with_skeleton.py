# export_body_with_skeleton.py — the anatomical body WITH its bones.
#
# The old anatomy-muscles.glb was muscles only (177 meshes, no skeleton), so it
# read as a shapeless red mass — "lacks bones," "points not good." This extracts
# BOTH the Skeletal system and the Muscular system from Z-Anatomy, decimates each
# for web, tags the highlight muscles, centers them together (shared origin so the
# bones sit correctly inside the muscles), and exports one combined GLB. Bones get
# a bone-white material and a `kelo_part=bone` tag so the runtime can shade them
# distinctly and keep them from stealing the muscle-glow.
#
#   blender -b -P export_body_with_skeleton.py
# © Ankur Sinha. Anatomy: Z-Anatomy — the libre 3D atlas — CC-BY-SA 4.0.

import bpy, json, os, mathutils

ROOT = "/Users/sinhaankur/Documents/crossfit/anatomy"
BLEND = os.path.join(ROOT, "z-anatomy", "Z-Anatomy", "Startup.blend")
MAP = json.load(open(os.path.join(ROOT, "muscle-ta2-map.json")))
OUT = "/Users/sinhaankur/Documents/crossfit/public/anatomy-body.glb"

MUSCLE_COLLECTIONS = ["4: Muscular system"]
SKELETON_COLLECTIONS = ["1: Skeletal system"]
MUSCLE_RATIO = 0.10   # keep muscle shape (they carry the worked-glow signal)
SKELETON_RATIO = 0.06 # bones can be leaner — lots of meshes, less visual load
# Drop sub-centimetre clutter (tendon sheaths, tiny sesamoids, foramina labels):
# a mesh whose largest bounding dimension is below this is skipped. Keeps the GLB
# web-light without losing any bone or muscle you can actually see.
MIN_MESH_SIZE = 0.012  # metres (~1.2 cm)


# Z-Anatomy places EXPLODED / isolated atlas copies of each mesh off to the side
# (suffixes .ol/.or/.el/.er = outer/exploded left-right, .i/.j = insertion/isolated,
# .e1l etc). Those extra copies at x≈-1.0 are why the naive export rendered three
# separate figures. We keep only the in-body meshes: unsuffixed, or ending .l/.r.
import re
_EXPLODED = re.compile(r"\.(ol|or|el|er|e\d+l|e\d+r|i|j|d)$", re.IGNORECASE)

def is_in_body(name):
    return not _EXPLODED.search(name)

def in_collections(names):
    keep = set()
    def walk(c):
        for o in c.objects:
            if o.type == 'MESH' and is_in_body(o.name):
                keep.add(o.name)
        for ch in c.children:
            walk(ch)
    for n in names:
        c = bpy.data.collections.get(n)
        if c:
            walk(c)
    return keep


def decimate(meshes, ratio):
    done = 0
    for o in meshes:
        if not o.data or len(o.data.polygons) < 16:
            continue
        o.data = o.data.copy()  # guarantee single-user before modifier apply
        m = o.modifiers.new("dec", 'DECIMATE')
        m.ratio = ratio
        with bpy.context.temp_override(object=o, active_object=o,
                                       selected_objects=[o], selected_editable_objects=[o]):
            try:
                bpy.ops.object.modifier_apply(modifier="dec"); done += 1
            except Exception:
                o.modifiers.remove(m)
    return done


def main():
    bpy.ops.wm.open_mainfile(filepath=BLEND)

    # Drop Blender's default startup cube if the file carries one.
    for junk in ("Cube",):
        o = bpy.data.objects.get(junk)
        if o:
            bpy.data.objects.remove(o, do_unlink=True)

    muscle_names = in_collections(MUSCLE_COLLECTIONS)
    skeleton_names = in_collections(SKELETON_COLLECTIONS)
    # A mesh could sit in both trees (insertions etc.) — muscles win the tag.
    skeleton_names -= muscle_names
    keep = muscle_names | skeleton_names

    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.name not in keep:
            bpy.data.objects.remove(o, do_unlink=True)

    # Drop tiny meshes (clutter that only bloats the file, never reads on screen).
    def too_small(o):
        if not o.data:
            return True
        bb = [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
        dx = max(v.x for v in bb) - min(v.x for v in bb)
        dy = max(v.y for v in bb) - min(v.y for v in bb)
        dz = max(v.z for v in bb) - min(v.z for v in bb)
        return max(dx, dy, dz) < MIN_MESH_SIZE
    # Also drop anything sitting off to the side (exploded atlas copy the regex
    # missed): the real body is centred near x≈0; isolated copies live out at x≈-1.
    def off_body(o):
        bb = [o.matrix_world @ mathutils.Vector(c) for c in o.bound_box]
        cx = (max(v.x for v in bb) + min(v.x for v in bb)) / 2
        return abs(cx) > 0.45
    dropped = 0
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.name in keep and (too_small(o) or off_body(o)):
            keep.discard(o.name); muscle_names.discard(o.name); skeleton_names.discard(o.name)
            bpy.data.objects.remove(o, do_unlink=True); dropped += 1
    print("dropped tiny/off-body meshes:", dropped)

    muscles = [o for o in bpy.data.objects if o.type == 'MESH' and o.name in muscle_names]
    bones = [o for o in bpy.data.objects if o.type == 'MESH' and o.name in skeleton_names]
    all_meshes = muscles + bones
    print("muscles:", len(muscles), "bones:", len(bones))
    print("tris before:", sum(len(o.data.polygons) for o in all_meshes if o.data))

    print("decimated muscles:", decimate(muscles, MUSCLE_RATIO))
    print("decimated bones:", decimate(bones, SKELETON_RATIO))
    print("tris after:", sum(len(o.data.polygons) for o in all_meshes if o.data))

    # Bone material — warm bone-white, matte. One shared material for all bones so
    # the runtime can also recolor by name if it wants.
    bone_mat = bpy.data.materials.new("kelo_bone"); bone_mat.use_nodes = True
    bsdf = bone_mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.90, 0.87, 0.80, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.75
    for o in bones:
        o["kelo_part"] = "bone"
        o.data.materials.clear()
        o.data.materials.append(bone_mat)

    # ONE shared material for all plain muscle, ONE for bone. Without this the join
    # keeps every source mesh's material → glTF emits a separate primitive per
    # material (1700+ primitives, draco overhead each) and the file balloons.
    muscle_mat = bpy.data.materials.new("kelo_muscle_base"); muscle_mat.use_nodes = True
    mb = muscle_mat.node_tree.nodes.get("Principled BSDF")
    if mb:
        mb.inputs["Base Color"].default_value = (0.76, 0.36, 0.34, 1.0)  # flesh
        mb.inputs["Roughness"].default_value = 0.55

    # Tag highlight muscles (same matching as the muscles-only export).
    tagged = 0
    for mid, meta in MAP.items():
        term = (meta.get("en") or "").lower().replace(" muscle", "")
        for o in muscles:
            if term and term in o.name.lower():
                o["kelo_muscle"] = mid; tagged += 1; break
    print("tagged muscles:", tagged)

    # Center feet at z=0, x/y centered — computed over the WHOLE body (bones +
    # muscles together) so the skeleton stays registered inside the muscles.
    mn = mathutils.Vector((1e9,) * 3); mx = mathutils.Vector((-1e9,) * 3)
    for o in all_meshes:
        for c in o.bound_box:
            w = o.matrix_world @ mathutils.Vector(c)
            for i in range(3):
                mn[i] = min(mn[i], w[i]); mx[i] = max(mx[i], w[i])
    ctr = (mn + mx) / 2
    for o in all_meshes:
        o.location.x -= ctr.x; o.location.y -= ctr.y; o.location.z -= mn.z
    print("height m:", round(mx.z - mn.z, 2))

    # Link every kept mesh into the scene master collection (nested-collection
    # meshes are otherwise skipped by the exporter).
    scene_coll = bpy.context.scene.collection
    for o in all_meshes:
        if o.name not in scene_coll.objects:
            try:
                scene_coll.objects.link(o)
            except Exception:
                pass

    # COLLAPSE object count — this is what actually shrinks the GLB. 900+ separate
    # objects = 900 draco streams + node overhead (~18MB). We join into a handful:
    #   · all bones          → one "skeleton" mesh
    #   · untagged muscles   → one "muscle_body" mesh
    #   · each tagged muscle stays its OWN object (so its glow can be toggled).
    def join(objs, name):
        objs = [o for o in objs if o.name in bpy.data.objects and o.data and len(o.data.polygons) > 0]
        if not objs:
            return None
        for o in bpy.context.selected_objects:
            o.select_set(False)
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        bpy.ops.object.join()
        g = bpy.context.active_object; g.name = name
        g.select_set(False)
        return g

    tagged_muscles = [o for o in muscles if o.get("kelo_muscle")]
    plain_muscles = [o for o in muscles if not o.get("kelo_muscle")]
    tagged_names = {o.name for o in tagged_muscles}
    # Collapse to a single material per group BEFORE joining (see note above).
    for o in plain_muscles:
        o.data.materials.clear(); o.data.materials.append(muscle_mat)
    for o in bones:
        o.data.materials.clear(); o.data.materials.append(bone_mat)
    skel = join(bones, "skeleton")
    body = join(plain_muscles, "muscle_body")
    # tagged muscles left as-is (only ~20 objects, each glow-able)

    # STRICT: keep ONLY the two joined meshes + the tagged muscles. Everything else
    # (join leftovers, shared-mesh atlas objects the walk dragged in) is removed so
    # the exporter can't re-add them.
    final_names = tagged_names | {n for n in ("skeleton", "muscle_body") if bpy.data.objects.get(n)}
    for o in list(bpy.data.objects):
        if o.type == 'MESH' and o.name not in final_names:
            bpy.data.objects.remove(o, do_unlink=True)
    final = [o for o in bpy.data.objects if o.type == 'MESH']
    print("pre-budget tris:", sum(len(o.data.polygons) for o in final if o.data))

    # Hard triangle budget on the big joined meshes — a small on-screen figure
    # doesn't need surgical density. Second decimate pass gets the file web-light.
    BUDGET = {"muscle_body": 90000, "skeleton": 55000}
    for o in final:
        cap = BUDGET.get(o.name)
        if cap and o.data and len(o.data.polygons) > cap:
            r = cap / len(o.data.polygons)
            m = o.modifiers.new("dec2", 'DECIMATE'); m.ratio = r
            with bpy.context.temp_override(object=o, active_object=o,
                                           selected_objects=[o], selected_editable_objects=[o]):
                try:
                    bpy.ops.object.modifier_apply(modifier="dec2")
                except Exception:
                    o.modifiers.remove(m)
    print("final objects:", len(final), "tris:", sum(len(o.data.polygons) for o in final if o.data))

    # STRIP the Z-Anatomy MeasureItArch/StyleGenerator custom-property junk — with
    # export_extras=True it dumps that whole tree into the glTF JSON (megabytes of
    # bloat). Keep ONLY our kelo_* tags. Also clean the scene's own extras.
    KEEP_KEYS = {"kelo_muscle", "kelo_part"}
    for o in bpy.data.objects:
        for k in [k for k in o.keys() if k not in KEEP_KEYS]:
            del o[k]
    for c in list(bpy.data.collections) + [bpy.context.scene]:
        for k in list(c.keys()):
            del c[k]
    for m in bpy.data.materials:
        for k in list(m.keys()):
            del m[k]

    # Export ONLY the final objects. Select them explicitly and use_selection=True,
    # so nothing lingering in nested collections / shared datablocks sneaks back in
    # (that was inflating the file to 1700+ meshes / 15MB).
    for o in bpy.data.objects:
        o.select_set(False)
    for o in final:
        if o.name not in scene_coll.objects:
            try:
                scene_coll.objects.link(o)
            except Exception:
                pass
        o.select_set(True)
    bpy.context.view_layer.objects.active = final[0] if final else None

    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', use_selection=True,
        export_extras=True, export_yup=True,
        export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6)
    print("EXPORTED %.2fMB" % (os.path.getsize(OUT) / 1e6))


main()
