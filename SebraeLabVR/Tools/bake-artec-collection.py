import bpy,json,math
from pathlib import Path
from mathutils import Matrix
root=Path(__file__).resolve().parents[1]
output=root/'Assets/Mostruario/ArtecCollection/Textures';output.mkdir(parents=True,exist_ok=True)
models=[('decorative-vase',.4,4000),('houseplant',1.15,10000)]
result={}
for model,height,target in models:
 bpy.ops.wm.read_factory_settings(use_empty=True)
 source=root/'Tools/Downloads/Artec'/model
 obj=next(p for p in source.rglob('*.obj') if not p.name.startswith('._'))
 bpy.ops.wm.obj_import(filepath=str(obj))
 objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
 points=[o.matrix_world @ v.co for o in objects for v in o.data.vertices]
 lo=[min(v[i] for v in points) for i in range(3)];hi=[max(v[i] for v in points) for i in range(3)]
 longest=max(range(3),key=lambda i:hi[i]-lo[i])
 rotate=Matrix.Identity(4) if longest==2 else Matrix.Rotation(math.pi/2,4,'X') if longest==1 else Matrix.Rotation(-math.pi/2,4,'Y')
 for o in objects:o.matrix_world=rotate @ o.matrix_world
 original=sum(len(o.data.polygons) for o in objects)
 for o in objects:
  mesh=o.data;mesh.calc_loop_triangles();count=len(mesh.loop_triangles)
  wanted=max(100,int(target*len(mesh.polygons)/max(original,1)))
  if count>wanted:
   bpy.context.view_layer.objects.active=o;o.select_set(True)
   modifier=o.modifiers.new('Optimized for Vitrine Sebrae','DECIMATE');modifier.ratio=min(1,wanted/count);modifier.use_collapse_triangulate=True
   bpy.ops.object.modifier_apply(modifier=modifier.name)
 points=[o.matrix_world @ v.co for o in objects for v in o.data.vertices]
 lo=[min(v[i] for v in points) for i in range(3)];hi=[max(v[i] for v in points) for i in range(3)]
 scale=height/(hi[2]-lo[2]);cx=(lo[0]+hi[0])/2;cy=(lo[1]+hi[1])/2
 materials={};parts={}
 for o in objects:
  mesh=o.data;mesh.calc_loop_triangles();nm=o.matrix_world.to_3x3().inverted().transposed();uv=mesh.uv_layers.active
  for triangle in mesh.loop_triangles:
   material=o.material_slots[triangle.material_index].material if o.material_slots else None
   key=material.name if material else 'Default'
   if key not in materials:
    texture=None; color=list(material.diffuse_color[:3]) if material else [1,1,1]
    if material and material.use_nodes:
     node=next((n for n in material.node_tree.nodes if n.type=='TEX_IMAGE' and n.image),None)
     if node:
      image=node.image
      if image.size[0]==0:
       filename=Path(bpy.path.abspath(image.filepath)).name
       match=next((p for p in source.rglob(filename)),None)
       if match:image=bpy.data.images.load(str(match),check_existing=True)
      if image.size[0]>0:
       factor=min(1,1024/max(image.size));image.scale(max(1,round(image.size[0]*factor)),max(1,round(image.size[1]*factor)))
       filename=model+'-'+str(len(materials))+'.png';image.filepath_raw=str(output/filename);image.file_format='PNG';image.save()
       texture='Assets/Mostruario/ArtecCollection/Textures/'+filename;color=[1,1,1]
    materials[key]={'name':key,'texture':texture,'color':color}
    parts[key]=[]
   for li in [triangle.loops[0],triangle.loops[2],triangle.loops[1]]:
    loop=mesh.loops[li];v=o.matrix_world @ mesh.vertices[loop.vertex_index].co;n=nm @ mesh.corner_normals[li].vector;n.normalize();t=uv.data[li].uv if uv else [0,0]
    parts[key].append([-(v.x-cx)*scale,(v.z-lo[2])*scale,-(v.y-cy)*scale,-n.x,n.z,-n.y,float(t[0]),float(t[1])])
 allv=[v for vs in parts.values() for v in vs]
 result[model]={'height':height,'min':[min(v[i] for v in allv) for i in range(3)],'max':[max(v[i] for v in allv) for i in range(3)],'materials':materials,'parts':parts,'triangles':len(allv)//3}
 print('ARTEC_PREPARED',model,'source polygons',original,'optimized triangles',len(allv)//3,'textures',len(materials),flush=True)
(root/'Tools/artec-mesh-data.json').write_text(json.dumps(result))