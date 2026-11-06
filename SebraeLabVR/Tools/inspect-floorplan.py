import bpy, json, math, struct, zlib
from mathutils import Vector
from pathlib import Path
root=Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(root/'Assets/Sebraelab3D/Sebrae Lab.fbx'))
segments=[]; objects=[]
for o in bpy.context.scene.objects:
 if o.type!='MESH': continue
 vs=[o.matrix_world @ Vector(c) for c in o.bound_box]
 lo=[min(-v.x for v in vs),min(v.z for v in vs),min(-v.y for v in vs)]; hi=[max(-v.x for v in vs),max(v.z for v in vs),max(-v.y for v in vs)]
 if lo[0]<4 or hi[0]>22 or lo[2]<-18 or hi[2]>18: continue
 objects.append(dict(name=o.name,min=lo,max=hi))
 if o.name not in ['Base','Entrada ','Backroom GlassDoor','Cube.017']: continue
 for poly in o.data.polygons:
  vv=[o.matrix_world @ o.data.vertices[i].co for i in poly.vertices]; hits=[]
  for a,b in zip(vv,vv[1:]+vv[:1]):
   if (a.z<1.2 and b.z>=1.2) or (b.z<1.2 and a.z>=1.2):
    c=a+(b-a)*((1.2-a.z)/(b.z-a.z)); hits.append([-c.x,-c.y])
  if len(hits)>=2: segments.append([hits[0],hits[1]])
(root/'Tools/building-floorplan.json').write_text(json.dumps(dict(objects=objects,wallSegments=segments),indent=2))
W,H=760,1440; pixels=bytearray([248]*(W*H*3))
def pix(x,y,c):
 if 0<=x<W and 0<=y<H: pixels[(y*W+x)*3:(y*W+x)*3+3]=bytes(c)
def point(x,z):return round((x-3)*36),round((18-z)*36+35)
def line(a,b,c,width=1):
 x1,y1=a;x2,y2=b;n=max(abs(x2-x1),abs(y2-y1),1)
 for i in range(n+1):
  x=round(x1+(x2-x1)*i/n);y=round(y1+(y2-y1)*i/n)
  for dx in range(-width,width+1):
   for dy in range(-width,width+1):pix(x+dx,y+dy,c)
font={'0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['111','001','111','100','111'],'3':['111','001','111','001','111'],'4':['101','101','111','001','001'],'5':['111','100','111','001','111'],'6':['111','100','111','101','111'],'7':['111','001','010','010','010'],'8':['111','101','111','101','111'],'9':['111','101','111','001','111'],'-':['000','000','111','000','000']}
def label(value,x,y):
 for ch in str(value):
  for row,bits in enumerate(font.get(ch,font['0'])):
   for col,b in enumerate(bits):
    if b=='1':
     for dx in range(2):
      for dy in range(2):pix(x+col*2+dx,y+row*2+dy,(30,30,30))
  x+=8
for x in range(4,23):
 line(point(x,-18),point(x,18),(225,225,225));a=point(x,18);label(x,a[0],10)
for z in range(-18,19):
 line(point(3,z),point(22,z),(225,225,225));a=point(3,z);label(z,0,a[1])
for obj in objects:
 if obj['name'] in ['Base','Teto','Entrada ']: continue
 lo=obj['min'];hi=obj['max']
 if hi[1]<.2 or lo[1]>2:continue
 a=point(lo[0],lo[2]);b=point(hi[0],hi[2]);
 for x in range(min(a[0],b[0]),max(a[0],b[0])+1):
  for y in range(min(a[1],b[1]),max(a[1],b[1])+1):pix(x,y,(193,209,224))
for a,b in segments:line(point(*a),point(*b),(20,35,55),2)
def chunk(t,d):return struct.pack('!I',len(d))+t+d+struct.pack('!I',zlib.crc32(t+d)&0xffffffff)
raw=b''.join(b'\0'+pixels[y*W*3:(y+1)*W*3] for y in range(H))
(root/'Tools/building-floorplan.png').write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',W,H,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw))+chunk(b'IEND',b''))
print('FLOORPLAN_OK',len(segments),'wall sections',len(objects),'objects')