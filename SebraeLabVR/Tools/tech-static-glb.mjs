// Imports the static triangle meshes used by the Tech Expo models.
import { cross, unit } from './multicenter-exterior-geometry.mjs';

export function readTechGlb(file, width) {
  if (file.toString('ascii',0,4)!=='glTF' || file.readUInt32LE(4)!==2) throw Error('GLB 2.0 expected');
  const jsonSize=file.readUInt32LE(12);
  const data=JSON.parse(file.toString('utf8',20,20+jsonSize));
  const binary=20+jsonSize+8;
  const componentSizes={5121:1,5123:2,5125:4,5126:4};
  const componentReads={5121:'readUInt8',5123:'readUInt16LE',5125:'readUInt32LE',5126:'readFloatLE'};
  function accessor(index,components) {
    const a=data.accessors[index], v=data.bufferViews[a.bufferView];
    if (v.buffer!==0 || a.sparse || !componentSizes[a.componentType]) throw Error('Unsupported GLB accessor');
    const size=componentSizes[a.componentType], stride=v.byteStride??size*components;
    const first=binary+(a.byteOffset??0)+(v.byteOffset??0), method=componentReads[a.componentType];
    return i=>Array.from({length:components},(_,j)=>file[method](first+i*stride+j*size));
  }
  const parts=new Map();
  const min=[Infinity,Infinity,Infinity], max=[-Infinity,-Infinity,-Infinity];
  function visit(index,parentPoint,parentNormal) {
    const node=data.nodes[index];
    if (node.matrix) throw Error('Matrix node in static Tech Expo model');
    const [x,y,z,w]=node.rotation??[0,0,0,1], q=[x,y,z];
    const scale=node.scale??[1,1,1], move=node.translation??[0,0,0];
    function rotate(vector) {
      const twice=cross(q,vector).map(v=>2*v);
      const bend=cross(q,twice);
      return vector.map((v,i)=>v+w*twice[i]+bend[i]);
    }
    const point=v=>parentPoint(rotate(v.map((d,i)=>d*scale[i])).map((d,i)=>d+move[i]));
    const normal=v=>parentNormal(rotate(v.map((d,i)=>d/scale[i])));
    if (node.mesh!==undefined) for (const primitive of data.meshes[node.mesh].primitives) {
      if ((primitive.mode??4)!==4 || primitive.indices===undefined) throw Error('Indexed triangles expected');
      const {POSITION,NORMAL,TEXCOORD_0}=primitive.attributes;
      const at=accessor(POSITION,3), facing=accessor(NORMAL,3), uv=accessor(TEXCOORD_0,2), id=accessor(primitive.indices,1);
      const out=parts.get(primitive.material)??[];
      parts.set(primitive.material,out);
      for(let i=0;i<data.accessors[primitive.indices].count;i+=3) for(const offset of [0,2,1]){
        const [j]=id(i+offset), pos=point(at(j)), n=unit(normal(facing(j))), [u,v]=uv(j);
        pos[2]*=-1; n[2]*=-1;
        for(let k=0;k<3;k++){min[k]=Math.min(min[k],pos[k]);max[k]=Math.max(max[k],pos[k]);}
        out.push([...pos,...n,u,1-v]);
      }
    }
    for(const child of node.children??[]) visit(child,point,normal);
  }
  for(const node of data.scenes[data.scene??0].nodes) visit(node,v=>v,v=>v);
  const scale=width/(max[0]-min[0]);
  if(!Number.isFinite(scale)) throw Error('Invalid model bounds');
  return [...parts].map(([index,vertices])=>{
    const pbr=data.materials[index].pbrMetallicRoughness;
    const color=(pbr.baseColorFactor??[1,1,1]).slice(0,3);
    const texture=pbr.baseColorTexture
      ? data.images[data.textures[pbr.baseColorTexture.index].source] : null;
    let image;
    if (texture) {
      const v=data.bufferViews[texture.bufferView];
      const start=binary+(v.byteOffset??0);
      image={ format:texture.mimeType==='image/jpeg'?'jpg':'png', bytes:file.subarray(start,start+v.byteLength) };
    }
    const centred=vertices.map(([x,y,z,...rest])=>[
      (x-(min[0]+max[0])/2)*scale,(y-min[1])*scale,(z-(min[2]+max[2])/2)*scale,...rest
    ]);
    return {index, vertices:centred, color, image, smooth:1-(pbr.roughnessFactor??1), metal:pbr.metallicFactor??0};
  });
}
