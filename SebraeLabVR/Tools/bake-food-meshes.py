import bpy,json
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
source=root/'Tools/Downloads/kenney_food-kit/Models/FBX format'
selected={'apple':.18,'bread':.40,'croissant':.26,'donut-chocolate':.22,'cheese':.24,'bottle-oil':.33,'bag':.32,'bowl':.26,'cup-coffee':.20,'cupcake':.18,'pie':.30,'plate':.30}
result={}
for name,size in selected.items():
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.ops.import_scene.fbx(filepath=str(source/(name+'.fbx')))
 vertices=[]
 for o in bpy.context.scene.objects:
  if o.type!='MESH':continue
  mesh=o.data;mesh.calc_loop_triangles();normalmatrix=o.matrix_world.to_3x3().inverted().transposed()
  uv=mesh.uv_layers.active
  for tri in mesh.loop_triangles:
   for loopindex in [tri.loops[0],tri.loops[2],tri.loops[1]]:
    loop=mesh.loops[loopindex];v=o.matrix_world @ mesh.vertices[loop.vertex_index].co
    n=normalmatrix @ mesh.corner_normals[loopindex].vector;n.normalize();t=uv.data[loopindex].uv if uv else [0,0]
    vertices.append([-v.x,v.z,-v.y,-n.x,n.z,-n.y,t[0],t[1]])
 lo=[min(v[i] for v in vertices) for i in range(3)];hi=[max(v[i] for v in vertices) for i in range(3)]
 scale=size/max(hi[i]-lo[i] for i in range(3));offset=[(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2]
 for v in vertices:
  for i in range(3):v[i]=(v[i]-offset[i])*scale
 result[name]={'vertices':vertices,'min':[min(v[i] for v in vertices) for i in range(3)],'max':[max(v[i] for v in vertices) for i in range(3)]}
 print('FOOD_MESH',name,len(vertices)//3,'triangles')
(root/'Tools/food-mesh-data.json').write_text(json.dumps(result))