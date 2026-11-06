import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=path.resolve('SebraeLabVR'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const guid=p=>crypto.createHash('md5').update('SebraeFood/'+p).digest('hex');
function meta(p,type,extra=''){write(p+'.meta',`fileFormatVersion: 2\nguid: ${guid(p)}\n${type}:\n  externalObjects: {}\n${extra}  userData: \n  assetBundleName: \n  assetBundleVariant: \n`);return guid(p);}
const dir='Assets/Mostruario/FoodKit';fs.mkdirSync(path.join(root,dir+'/Meshes'),{recursive:true});
const tex=dir+'/colormap.png';fs.copyFileSync(path.join(root,'Tools/Downloads/kenney_food-kit/Models/FBX format/Textures/colormap.png'),path.join(root,tex));
const texGuid=meta(tex,'TextureImporter','  serializedVersion: 13\n  mipmaps:\n    enableMipMap: 1\n    sRGBTexture: 1\n  textureType: 0\n  maxTextureSize: 1024\n  textureSettings:\n    serializedVersion: 2\n    filterMode: 0\n    aniso: 1\n    mipBias: 0\n    wrapU: 1\n    wrapV: 1\n    wrapW: 1\n');
fs.copyFileSync(path.join(root,'Tools/Downloads/kenney_food-kit/License.txt'),path.join(root,dir+'/License.txt'));
let mat=read('Assets/Mostruario/Materials/AmbienteURP.mat').replace('m_Name: AmbienteURP','m_Name: KenneyFoodURP');
mat=mat.replace(/(- _BaseMap:\r?\n        m_Texture:) \{[^}]+\}/,`$1 {fileID: 2800000, guid: ${texGuid}, type: 3}`);
write(dir+'/KenneyFoodURP.mat',mat);const matGuid=meta(dir+'/KenneyFoodURP.mat','NativeFormatImporter','  mainObjectFileID: 2100000\n');
const source=JSON.parse(read('Tools/food-mesh-data.json')),manifest={materialGuid:matGuid,models:{},license:'CC0-1.0',source:'https://kenney.nl/assets/food-kit'};
const template=read('Assets/Samples/XR Hands/1.7.3/HandVisualizer/Materials/AxisMesh.asset').replaceAll('\r\n','\n');
const vec=v=>'{'+v.map((n,i)=>'xyz'[i]+': '+n.toFixed(7)).join(', ')+'}';
for(const [name,m] of Object.entries(source)){
 const n=m.vertices.length;if(n>65535||n%3)throw Error('Invalid mesh '+name);
 const vertex=Buffer.alloc(n*32),index=Buffer.alloc(n*2);m.vertices.forEach((v,i)=>{v.forEach((x,k)=>vertex.writeFloatLE(x,i*32+k*4));index.writeUInt16LE(i,i*2);});
 const center=m.min.map((v,i)=>(v+m.max[i])/2),extent=m.min.map((v,i)=>(m.max[i]-v)/2);
 const channels=Array.from({length:14},(_,i)=>({offset:i===1?12:i===4?24:0,dim:i===0||i===1?3:i===4?2:0})).map(c=>`    - stream: 0\n      offset: ${c.offset}\n      format: 0\n      dimension: ${c.dim}\n`).join('');
 let mesh=`%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!43 &4300000\nMesh:\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n  m_Name: ${name}\n  serializedVersion: 11\n  m_SubMeshes:\n  - serializedVersion: 2\n    firstByte: 0\n    indexCount: ${n}\n    topology: 0\n    baseVertex: 0\n    firstVertex: 0\n    vertexCount: ${n}\n    localAABB:\n      m_Center: ${vec(center)}\n      m_Extent: ${vec(extent)}\n  m_Shapes:\n    vertices: []\n    shapes: []\n    channels: []\n    fullWeights: []\n  m_BindPose: []\n  m_BoneNameHashes: \n  m_RootBoneNameHash: 0\n  m_BonesAABB: []\n  m_VariableBoneCountWeights:\n    m_Data: \n  m_MeshCompression: 0\n  m_IsReadable: 1\n  m_KeepVertices: 1\n  m_KeepIndices: 1\n  m_IndexFormat: 0\n  m_IndexBuffer: ${index.toString('hex')}\n  m_VertexData:\n    serializedVersion: 3\n    m_VertexCount: ${n}\n    m_Channels:\n${channels}    m_DataSize: ${vertex.length}\n    _typelessdata: ${vertex.toString('hex')}\n`;
 let tail=template.slice(template.indexOf('  m_CompressedMesh:')).replace(/m_Center: \{[^}]+\}/,'m_Center: '+vec(center)).replace(/m_Extent: \{[^}]+\}/,'m_Extent: '+vec(extent));
 const p=dir+'/Meshes/'+name+'.asset';write(p,mesh+tail);manifest.models[name]={guid:meta(p,'NativeFormatImporter','  mainObjectFileID: 4300000\n'),min:m.min,max:m.max,triangles:n/3};
}
write('Tools/food-assets.json',JSON.stringify(manifest,null,2));
const generator='Tools/refine-showroom.mjs';let s=read(generator);
if(!s.includes('placeDownloadedProducts')){
 s="import { placeDownloadedProducts } from './downloaded-products.mjs';\n"+s;
 const insertion=String.raw`
const foodAssets=JSON.parse(read('Tools/food-assets.json'));
function food(model,parent,position,yaw=0,scale=1){
 const source=foodAssets.models[model];if(!source)throw Error('Alimento desconhecido '+model);
 const n=group('Produto - '+model,parent,position,[scale,scale,scale],yaw),mf=id++;n.components.push(mf);
 docs.push('--- !u!33 &'+mf+'\nMeshFilter:\n'+common+'  m_GameObject: {fileID: '+n.go+'}\n  m_Mesh: {fileID: 4300000, guid: '+source.guid+', type: 2}\n');
 renderer(n,'{fileID: 2100000, guid: '+foodAssets.materialGuid+', type: 2}');return source.max[1]*scale+position[1];
}
placeDownloadedProducts({food,group,shape,text,showroom,nodes,foodAssets});
`;
 s=s.replace('// SebraeSignMaterials substitui',insertion+'\n// SebraeSignMaterials substitui');write(generator,s);
}
console.log('12 modelos Kenney convertidos para malhas Unity, com UVs, normais e material URP.');