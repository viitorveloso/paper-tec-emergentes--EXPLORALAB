import fs from 'node:fs';
const p='SebraeLabVR/Tools/refine-showroom.mjs';let s=fs.readFileSync(p,'utf8');
if(s.includes('buildExterior'))throw Error('Extensao ja instalada');
for(const name of ['Sebrae','MostruarioSebrae'])fs.copyFileSync(`SebraeLabVR/Assets/Scenes/${name}.unity`,`SebraeLabVR/Tools/${name}.before-exterior.bak`);
s="import { buildExterior } from './exterior-pavilion.mjs';\n"+s;
const insert=String.raw`
// Vidro URP transparente para divisorias da ala simetrica.
const glassPath='Assets/Mostruario/Materials/ShowroomVidro.mat';materials.Vidro=guid(glassPath);
let glass=read('Assets/Mostruario/Materials/ShowroomBranco.mat')
 .replace('m_Name: ShowroomBranco','m_Name: ShowroomVidro')
 .replace('m_ValidKeywords: []','m_ValidKeywords:\n  - _SURFACE_TYPE_TRANSPARENT')
 .replace('m_CustomRenderQueue: -1','m_CustomRenderQueue: 3000')
 .replace('RenderType: Opaque','RenderType: Transparent');
for(const [key,value] of [['_Surface',1],['_SrcBlend',5],['_DstBlend',10],['_ZWrite',0],['_Cull',0],['_Smoothness',.85],['_Metallic',.15]])glass=glass.replace(new RegExp('- '+key+': [^\n]+'),'- '+key+': '+value);
for(const key of ['_BaseColor','_Color'])glass=glass.replace(new RegExp('- '+key+': \\{[^}]+\\}'),'- '+key+': {r: 0.57, g: 0.78, b: 0.85, a: 0.22}');
write(glassPath,glass);write(glassPath+'.meta',read('Assets/Mostruario/Materials/ShowroomBranco.mat.meta').replace(materials.Branco,materials.Vidro));
const prefabData=JSON.parse(read('Tools/mostruario-layout.json')).assets;
function prefab(model,parent,position,yaw=0,scale=1){
 const source=prefabData[model];if(!source)throw Error('Modelo ausente '+model);
 const pi=id++,tr=id++;const a=yaw*Math.PI/360;
 const pos=[position[0],position[1]-source.min[1]*scale,position[2]];
 const props=[['m_Name',model,source.rootGameObject],...pos.map((v,i)=>['m_LocalPosition.'+'xyz'[i],v,source.rootTransform]),...[0,Math.sin(a),0,Math.cos(a)].map((v,i)=>['m_LocalRotation.'+'xyzw'[i],v,source.rootTransform]),...[scale,scale,scale].map((v,i)=>['m_LocalScale.'+'xyz'[i],v,source.rootTransform])];
 docs.push('--- !u!1001 &'+pi+'\nPrefabInstance:\n  m_ObjectHideFlags: 0\n  serializedVersion: 2\n  m_Modification:\n    serializedVersion: 3\n    m_TransformParent: {fileID: '+parent.tr+'}\n    m_Modifications:\n'+props.map(([k,v,target])=>'    - target: {fileID: '+target+', guid: '+source.guid+', type: 3}\n      propertyPath: '+k+'\n      value: '+v+'\n      objectReference: {fileID: 0}\n').join('')+'    m_RemovedComponents: []\n    m_RemovedGameObjects: []\n    m_AddedGameObjects: []\n    m_AddedComponents: []\n  m_SourcePrefab: {fileID: 100100000, guid: '+source.guid+', type: 3}\n--- !u!4 &'+tr+' stripped\nTransform:\n  m_CorrespondingSourceObject: {fileID: '+source.rootTransform+', guid: '+source.guid+', type: 3}\n  m_PrefabInstance: {fileID: '+pi+'}\n  m_PrefabAsset: {fileID: 0}\n');parent.children.push(tr);
}
const teleportParent={tr:2000000066,children:[]};
function teleport(name,position,size){
 const n=group(name,teleportParent,position),c=id++;n.components.push(c);
 docs.push('--- !u!65 &'+c+'\nBoxCollider:\n'+common+'  m_GameObject: {fileID: '+n.go+'}\n  m_Material: {fileID: 0}\n  m_IsTrigger: 0\n  m_Enabled: 1\n  serializedVersion: 3\n  m_Size: '+vec(size)+'\n  m_Center: {x: 0, y: 0, z: 0}\n');
}
const exteriorDesign=buildExterior({group,shape,text,prefab,teleport,showroom});
write('Tools/exterior-layout.json',JSON.stringify(exteriorDesign,null,2));
`;
s=s.replace('function serialize(n){',insert+'\nfunction serialize(n){');
// Registra as novas areas no mesmo root usado pelo preparador XR existente.
s=s.replace("const marker='--- !u!1660057539';",String.raw`scene=scene.replace(/(--- !u!4 &2000000066\n[\s\S]*?m_Children:\n)/,'$1'+teleportParent.children.map(t=>'  - {fileID: '+t+'}\n').join(''));
 const marker='--- !u!1660057539';`);
s=s.replace(".replace('Applied.v1','Applied.v2')",".replace(/Applied.v[123]/g,'Applied.v3')");
s=s.replace("write('Tools/showroom-design.json',JSON.stringify({scene:","write('Tools/showroom-design.json',JSON.stringify({exterior:exteriorDesign,scene:");
fs.writeFileSync(p,s);