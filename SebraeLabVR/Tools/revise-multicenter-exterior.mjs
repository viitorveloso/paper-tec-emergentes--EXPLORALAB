// Rebuilds this exterior revision in the current scenes, without using the older scene backups.
// Run from the project folder: node Tools/revise-multicenter-exterior.mjs [--preview] [--check]
import fs from 'node:fs';
import path from 'node:path';
import { assetFolder, common, decodeMesh, fields, folderMeta, guid, materialAsset, meshAsset, skyAsset, textureAsset, texturePath, worldUv } from './multicenter-exterior-assets.mjs';
import { buildExterior, teleportLandings, views } from './multicenter-exterior-layout.mjs';
import { box, front, quad } from './multicenter-exterior-geometry.mjs';
import { skyMap, sun, surfaceMaps } from './multicenter-exterior-surfaces.mjs';
import { pngPixels } from './campus-reference-detail.mjs';
import { pavilionSkin } from './multicenter-exterior-aerial.mjs';
import { avenueShiftZ } from './multicenter-exterior-visitor-parking.mjs';

const root=path.resolve(import.meta.dirname,'..');
const check=process.argv.includes('--check');
const preview=process.argv.includes('--preview');
const absolute=(p)=>path.join(root,p);
const read=(p)=>fs.readFileSync(absolute(p),'utf8').replaceAll('\r\n','\n');
const planned=new Map();
const write=(p,s)=>planned.set(p,s);
const metaGuid=(asset)=>read(asset+'.meta').match(/^guid: ([a-f0-9]{32})$/m)?.[1];

const campus=JSON.parse(read('Tools/campus-layout.json'));
const pavilion=JSON.parse(read('Tools/pavilion-interior-layout.json'));
const roof=JSON.parse(read('Tools/roof-layout.json'));
const lit=read('Assets/CampusSebrae/Materials/Amarelo.mat');
const text=read('Assets/CampusSebrae/Materials/CentroConvencoes.mat');
const meshTemplate=read(campus.meshes[0].path);
const surfaces={
  BrancoPlacaLab: { color:[.97,.977,.974],smooth:.31,metal:.06 },
  PainelPlacaLab: { color:[.985,.987,.979],smooth:.37,metal:.035 },
  TextoPlacaLab: { tex:'SebraeLab',label:true,color:[.045,.094,.133] },
  AsfaltoRemendo: { tex:'Asfalto',normal:'AsfaltoNormal',tile:[2.28,2.74],color:[1.29,1.29,1.32],smooth:.07,bump:.71 },
  AsfaltoRecente: { tex:'Asfalto',normal:'AsfaltoNormal',tile:[2.13,3.41],color:[.78,.80,.81],smooth:.11,bump:.74 },
  PinturaVagas: { tex:'Pintura',tile:[.67,.92],color:[.92,.754,.382],smooth:.13 },
  MadeiraBanco: { tex:'Estrias',tile:[1.4,.35],color:[1.18,1.06,.88],smooth:.32 },
  PainelBrancoSebrae: { tex:'Concreto',normal:'ConcretoNormal',tile:[3.16,3.16],color:[1.34,1.34,1.33],smooth:.29,bump:.16 },
  PainelAzulSebrae: { color:[.11,.45,.82],smooth:.47,metal:.11 },
  JuntaPainelSebrae: { color:[.59,.61,.61],smooth:.23 },
  VidroCoberturaSebrae: { color:[.49,.58,.63],metal:.19,smooth:.77,doubleSided:true },
  ConcretoEscadaAzul: { tex:'Concreto',normal:'ConcretoNormal',tile:[5.8,5.8],color:[.22,.60,.81],smooth:.17,bump:.46 },
  SaibroServico: { tex:'SaibroServico',tile:[9.3,8.1],smooth:.08 },
  TelhaAzul: { tex:'Telha',normal:'TelhaNormal',tile:[4.35,5.6],uvAxis:'zx',color:[.48,.81,.92],smooth:.32,metal:.25,bump:.53 },
  CinzaCarro: { color:[.348,.366,.381],smooth:.76,metal:.48 },
  AzulCarro: { color:[.127,.235,.36],smooth:.72,metal:.48 },
  Pneu: { color:[.072,.070,.068],smooth:.13,specular:false },
  JuntaPavilhao: { color:[.40,.39,.36],smooth:.10 },
  PisoPortaria: { tex:'PisoPortaria',tile:[2.75,1.74],smooth:.13 },
  VidroEspelhadoPortaria: { color:[.426,.60,.54],metal:.83,smooth:.96,glass:true },
  PainelPortico: { tex:'Concreto',tile:[155,155],color:[1.26,1.25,1.24],smooth:.36 },
  FaixaMagenta: { color:[.642,.087,.304],smooth:.35 },
  BrancoPortico: { tex:'Concreto',normal:'ConcretoNormal',tile:[11,11],color:[1.16,1.14,1.1],smooth:.28,bump:.19 },
  VidroPortaria: { color:[.214,.328,.277],metal:.57,smooth:.91,glass:true },
  AzulSebrae: { tex:'Concreto',color:[.118,.47,.73],tile:[9,9],smooth:.32 },
  FaixaVermelha: { color:[.653,.071,.13],smooth:.34 },
  FaixaRoxa: { color:[.354,.194,.518],smooth:.34 },
  FaixaCiano: { color:[.109,.59,.82],smooth:.34 },
  FaixaVerde: { color:[.346,.663,.302],smooth:.34 },
  FaixaLaranja: { color:[.889,.333,.157],smooth:.34 },
  PastilhaPortaria: { tex:'Pedra',normal:'PedraNormal',tile:[.58,.42],color:[1.28,.655,.19],smooth:.42,bump:.38 },
  NomePortico: { tex:'NomePortico',label:true,color:[.069,.076,.103] },
  NomeSebraeAzul: { tex:'NomeSebrae',label:true,color:[.074,.337,.645] },
  NomeSebraeBranco: { tex:'NomeSebrae',label:true,color:[.972,.969,.928] },
  NomeOrientacao: { tex:'NomeOrientacao',label:true,color:[.95,.931,.882] },
  Amarelo: { tex:'Chapa',normal:'ChapaNormal',tile:[2.16,6],smooth:.36,metal:.18,bump:.7 },
  Telha: { tex:'Telha',normal:'TelhaNormal',tile:[5.2,4.32],smooth:.31,metal:.28,bump:.57 },
  Forro: { tex:'Forro',normal:'ForroNormal',tile:[5.2,4.32],smooth:.26,metal:.22,bump:.66 },
  ForroPavilhao: { tex:'Forro',normal:'ForroNormal',tile:[3.84,5.2],uvAxis:'zx',smooth:.29,metal:.22,bump:.6 },
  TelhaPrincipal: { tex:'Telha',normal:'TelhaNormal',tile:[3.84,5.2],uvAxis:'zx',smooth:.33,metal:.33,bump:.53 },
  AcoAzul: { color:[.073,.174,.285],metal:.19,smooth:.39 },
  Reboco: { tex:'Concreto',normal:'ConcretoNormal',tile:[5.4,4.2],color:[1,.985,.938],smooth:.15,bump:.35 },
  Concreto: { tex:'Concreto',normal:'ConcretoNormal',tile:[6.6,6.6],smooth:.25,bump:.67 },
  MeioFio: { tex:'Concreto',normal:'ConcretoNormal',tile:[5.4,4.45],color:[1.16,1.14,1.12],smooth:.18,bump:.58 },
  Pedra: { tex:'Pedra',normal:'PedraNormal',tile:[4.2,2.97],smooth:.28,bump:.78 },
  ForroLiso: { tex:'Concreto',normal:'ConcretoNormal',tile:[8,8],color:[.99,.985,.948],smooth:.28,bump:.37 },
  Verde: { tex:'Concreto',normal:'ConcretoNormal',tile:[8,8],color:[.67,.852,.283],smooth:.21,bump:.36 },
  Asfalto: { tex:'Asfalto',normal:'AsfaltoNormal',tile:[3.35,3.35],smooth:.083,bump:.82 },
  Grama: { tex:'Grama',normal:'GramaNormal',tile:[6.7,6.7],smooth:.04,bump:.68 },
  Pintura: { tex:'Pintura',tile:[.83,.83],smooth:.13 },
  PinturaAmarela: { tex:'Pintura',tile:[.83,.83],color:[1,.753,.217],smooth:.21 },
  AzulVaga: { tex:'Pintura',tile:[.83,.83],color:[.23,.44,.63],smooth:.15 },
  Corrimao: { color:[.062,.31,.57],metal:.28,smooth:.54 },
  Metal: { color:[.65,.671,.665],metal:.64,smooth:.61 },
  Caixilho: { color:[.094,.106,.105],metal:.16,smooth:.45 },
  Vidro: { color:[.085,.128,.158],metal:.23,smooth:.89,glass:true },
  Letreiro: { color:[.061,.095,.115],smooth:.39 },
  LetreiroConvencoes: { tex:'NomeCentroConvencoes',label:true,color:[.95,.931,.882] },
  LetreiroSecundario: { tex:'NegociosEventos',label:true,color:[.067,.073,.081] },
  Lente: { color:[.83,.823,.762],emission:[.28,.263,.223],smooth:.54 },
  Tronco: { tex:'Estrias',normal:'EstriasNormal',tile:[.64,.88],bump:.75 },
  FolhaClara: { color:[.331,.426,.145],doubleSided:true,specular:false },
  Folha: { color:[.215,.321,.133],doubleSided:true,specular:false },
  FolhaSombra: { color:[.171,.254,.106],doubleSided:true,specular:false },
  Capim: { color:[.369,.424,.183],doubleSided:true,specular:false },
  CopaClara: { color:[.285,.377,.157],specular:false },
  Copa: { color:[.215,.331,.124],specular:false },
  Galho: { color:[.294,.25,.174],specular:false },
  Terra: { tex:'Asfalto',tile:[1.89,1.89],color:[1.02,.83,.62],smooth:.02 },
  PisoInterno: { tex:'Concreto',normal:'ConcretoNormal',tile:[8.85,8.85],smooth:.34,bump:.43 },
  Carpete: { tex:'Asfalto',normal:'AsfaltoNormal',tile:[1.35,1.35],color:[.35,.398,.437],smooth:.04,bump:.28 },
};

const groups=new Map(), meshes=[], replacements=new Map(), disable=new Set(), hiddenRenderers=new Set();
const allocate = (section,name,material,params={}) => {
  const vertices=[];
  meshes.push({section,name,material,vertices,...params});
  return vertices;
};
const signPixels=pngPixels(absolute(texturePath('NomePortico')));
if(signPixels.channels!==4) throw new Error('O letreiro do portico precisa de alfa.');
const markWidth=342, markHeight=42;
const signMask={
  width:markWidth,height:markHeight,mainRows:28,
  at(x,y){
    if(x<0||x>=markWidth||y<0||y>=this.mainRows) return false;
    const col=Math.floor((x+.5)*signPixels.w/markWidth);
    const row=Math.floor((y+.5)*signPixels.h/markHeight);
    return signPixels.data[(row*signPixels.w+col)*4+3]>=119;
  }
};
buildExterior(allocate,signMask);

const campusMesh=(i)=>campus.meshes[i];
for(const i of [12,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,43,44]) disable.add(campusMesh(i).guid);
for(const i of [4,6]) hiddenRenderers.add(campusMesh(i).guid);

function patchAppearance(ref,material,name,source,previousName) {
  const faces=source||decodeMesh(read(ref.path));
  const vertices=allocate(null,name,material,{replace:ref.guid ?? metaGuid(ref.path),shadow:true,previousName});
  for(const face of faces) vertices.push(face);
}
for(const [i,material,name] of [
  [0,'Concreto','Laje multicenter'],[1,'Pedra','Arcada e alvenaria multicenter'],
  [2,'ForroLiso','Marquise e pedestal'],[3,'Amarelo','Platibanda do multicenter'],[5,'Amarelo','Reverso da marquise'],
  [8,'Vidro','Vidros do multicenter'],[11,'Caixilho','Arcada escura'],
  [14,'Verde','Revestimento verde do Sebraelab'],[16,'Vidro','Vidro do Sebraelab'],[17,'Concreto','Calcadas do Sebraelab'],
]) patchAppearance(campusMesh(i),material,name);
const fascia=allocate('Fachada e chegada','Chapa ondulada da fachada','Amarelo');
const brackets=allocate('Fachada e chegada','Frisos coloridos originais','FotoFrisos');
const glyphs=allocate('Fachada e chegada','Faces das letras em relevo','Letreiro');
const copyFaces=(geometry,split)=>{
  for(let i=0;i<geometry.length;i+=3) {
    const verts=geometry.slice(i,i+3);
    const target=split(verts[0]);
    if(target) target.push(...verts);
  }
};
const primary=decodeMesh(read(campusMesh(4).path));
const extras=decodeMesh(read(campusMesh(6).path));
copyFaces(primary,(p)=>p[2]<-17.65?brackets:fascia);
copyFaces(extras,(p)=>p[2]<-17.65?(p[1]>6.39?glyphs:null):fascia);
patchAppearance(campusMesh(7),'Letreiro','Laterais do letreiro',
  decodeMesh(read(campusMesh(7).path)).filter((_,i,vs)=>vs[i-i%3][1]>6.39));
patchAppearance(campusMesh(9),'Caixilho','Caixilhos existentes da arcada',
  decodeMesh(read(campusMesh(9).path)).filter((_,i,vs)=>vs[i-i%3][0]>=-43.25));
const subtitle=allocate('Fachada e chegada','Negocios e eventos','LetreiroSecundario',{shadow:false});
quad(subtitle,[[-59.76,5.801,-17.70],[-51.12,5.801,-17.70],[-51.12,6.266,-17.70],[-59.76,6.266,-17.70]],front,[[0,0],[1,0],[1,1],[0,1]]);
for(const entry of roof.nativeMeshes){
  patchAppearance(entry,'TelhaPrincipal',path.basename(entry.path,'.asset'),pavilionSkin(entry.min[0],entry.max[0]));
}
for(const [index,material,name,previousName] of [
  [2,'PisoInterno','Lajes do piso do pavilhao'],
  [3,'JuntaPavilhao','Juntas do piso do pavilhao','Piso do pavilhao'],
  [4,'Carpete','Carpetes dos corredores'],
  [5,'ForroPavilhao','Forro oeste do pavilhao','Carpete do pavilhao'],
  [6,'ForroPavilhao','Forro leste do pavilhao','Forro do pavilhao 1'],
  [7,'AcoAzul','Estrutura do pavilhao','Forro do pavilhao 2'],
]){
  const entry=pavilion.nativeMeshes[index];
  const skin=material==='ForroPavilhao'?pavilionSkin(entry.min[0],entry.max[0],true):undefined;
  patchAppearance(entry,material,name,skin,previousName);
}

// Use the traced silhouette at a scale appropriate to the single-storey annex.
const signSection='Placa do SebraeLab';
const signWhite=allocate(signSection,'Chapas brancas dobradas','BrancoPlacaLab',{solid:true});
const signFeet=allocate(signSection,'Apoios da placa','Metal',{solid:true});
const signPanel=allocate(signSection,'Painel central branco','PainelPlacaLab',{solid:true});
const signText=allocate(signSection,'Letreiro sebraelab','TextoPlacaLab',{shadow:false});
for(const [indices,target] of [[[18,19,20],signWhite],[[25],signFeet]]){
  for(const index of indices){
    for(const [x,y,z,...attributes] of decodeMesh(read(campusMesh(index).path))){
      target.push([12.6+(x-12.6)*.5,y*.5,-19.78+(z+19.78)*.5,...attributes]);
    }
  }
}
box(signPanel,[11.685,.986,-20.036],[13.515,1.514,-19.895]);
quad(signText,[[11.805,1.066,-20.04],[13.395,1.066,-20.04],
  [13.395,1.434,-20.04],[11.805,1.434,-20.04]],front,[[0,0],[1,0],[1,1],[0,1]]);

const legacyMaterial=(key)=>campus.materials[key];
const materialIds={ FotoFrisos:legacyMaterial('FachadaFoto') };
for(const dir of [assetFolder,'/Textures','/Materials','/Meshes']) folderMeta(write,dir.startsWith('/')?assetFolder+dir:dir);
if(!fs.existsSync(absolute(texturePath('NomeCentroConvencoes')))) throw new Error('NomeCentroConvencoes.png ausente.');
for(const label of ['NomeCentroConvencoes','NomePortico','NomeSebrae','NomeOrientacao']) {
  if(!fs.existsSync(absolute(texturePath(label)))) throw new Error(label+'.png ausente.');
  textureAsset(write,label,0,0,null,{label:true});
}
write(texturePath('SebraeLab'),fs.readFileSync(absolute('Assets/CampusSebrae/Textures/SebraeLab.png')));
textureAsset(write,'SebraeLab',0,0,null,{label:true});
write(texturePath('NegociosEventos'),fs.readFileSync(absolute('Assets/CampusSebrae/Textures/NegociosEventos.png')));
textureAsset(write,'NegociosEventos',0,0,null,{label:true});
if(!check) {
  const makeTex=(...args)=>textureAsset(write,...args);
  surfaceMaps(makeTex);
  skyMap(makeTex);
}
for(const [material,spec] of Object.entries(surfaces)) materialIds[material]=materialAsset(write,spec.label?text:lit,material,spec);
const sky=skyAsset(write);

// An existing mesh keeps its Unity GUID when a new batch is inserted in a section.
const meshFolder=assetFolder+'/Meshes';
const existingOutputs=new Map();
let nextMeshIndex=0;
if(fs.existsSync(absolute(meshFolder))) {
  for(const entry of fs.readdirSync(absolute(meshFolder))) {
    const i=entry.match(/^Exterior(\d+)\.asset$/);
    if(!i) continue;
    const p=meshFolder+'/'+entry;
    const name=read(p).match(/^  m_Name: (.+)$/m)?.[1];
    if(name) existingOutputs.set(name,p);
    nextMeshIndex=Math.max(nextMeshIndex,Number(i[1])+1);
  }
}
for(const mesh of meshes) {
  const material=surfaces[mesh.material];
  const uv=material?.uvAxis==='zx'
    ? (v)=>[v[2]/material.tile[1],v[0]/material.tile[0]]
    : material?.tile ? (v)=>worldUv(v,material) : undefined;
  mesh.uv=uv;
  const output=existingOutputs.get(mesh.name) ?? existingOutputs.get(mesh.previousName) ?? meshFolder+'/Exterior'+String(nextMeshIndex++).padStart(2,'0')+'.asset';
  const result=meshAsset(write,meshTemplate,output,mesh.name,mesh.vertices,uv);
  Object.assign(mesh,result);
  if(mesh.replace) replacements.set(mesh.replace,mesh);
}

const firstId=2900000000, endId=2900001000, revisionName='Exterior Multicenter - acessos e fachada';
let nextId=firstId;
const nodes=[], components=[], newDestinations=[];
const allocateId=()=>nextId++;
function node(name,parent,position=[0,0,0]) {
  const n={game:allocateId(),transform:allocateId(),name,parent,position,children:[],components:[]};
  nodes.push(n);
  if(typeof parent==='object') parent.children.push(n.transform);
  return n;
}
const main=node(revisionName,2300000001);
function section(name) {
  if(!groups.has(name)) groups.set(name,node(name,main));
  return groups.get(name);
}
function serializedNode(n) {
  const refs=[n.transform,...n.components].map(c=>'  - component: {fileID: '+c+'}\n').join('');
  return `--- !u!1 &${n.game}
GameObject:
${common}
  serializedVersion: 6
  m_Component:
${refs}  m_Layer: 0
  m_Name: ${n.name}
  m_TagString: Untagged
  m_Icon: {fileID: 0}
  m_NavMeshLayer: 0
  m_StaticEditorFlags: 0
  m_IsActive: 1
--- !u!4 &${n.transform}
Transform:
${common}
  m_GameObject: {fileID: ${n.game}}
  serializedVersion: 2
  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}
  m_LocalPosition: ${fields(n.position)}
  m_LocalScale: {x: 1, y: 1, z: 1}
  m_ConstrainProportionsScale: 0
${n.children.length?'  m_Children:\n'+n.children.map(id=>'  - {fileID: '+id+'}\n').join(''):'  m_Children: []\n'}  m_Father: {fileID: ${n.parent.transform||n.parent}}
  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}
`;
}
function assetRef(id,guid) {return '{fileID: '+id+', guid: '+guid+', type: 2}';}
const prototypes=read('Assets/Scenes/Sebrae.unity').split(/(?=^--- !u!)/m);
const templateAt=(type,needle)=>{
  const result=prototypes.find(doc=>doc.startsWith('--- !u!'+type+' &')&&doc.includes(needle));
  if(!result) throw new Error('Scene component template '+type+' not present');
  return result;
};
const renderProto=templateAt(23,'m_GameObject: {fileID: 2300000004}');
const colliderProto=templateAt(64,'m_GameObject: {fileID: 2300000004}');
const boxProto=templateAt(65,'m_GameObject: {fileID: 2600000380}');
function component(n,template) {
  const id=allocateId();
  n.components.push(id);
  return template.replace(/^(--- !u!\d+ &)\d+/m,'$1'+id)
    .replace(/m_GameObject: \{fileID: \d+\}/,'m_GameObject: {fileID: '+n.game+'}');
}
function withMesh(doc,g) {return doc.replace(/m_Mesh: \{[^}]+\}/,'m_Mesh: '+assetRef(4300000,g));}
function withMaterial(doc,g) {
  if(!g) throw new Error('Material GUID not found');
  return doc.replace(/m_Materials:\n  - \{[^}]+\}/,'m_Materials:\n  - '+assetRef(2100000,g));
}
for(const mesh of meshes.filter(m=>m.section)) {
  const n=node(mesh.name,section(mesh.section)), filter=allocateId();
  n.components.push(filter);
  components.push(`--- !u!33 &${filter}
MeshFilter:
${common}
  m_GameObject: {fileID: ${n.game}}
  m_Mesh: ${assetRef(4300000,mesh.guid)}
`);
  const renderer=component(n,renderProto).replace(/m_CastShadows: \d+/,'m_CastShadows: '+Number(mesh.shadow!==false));
  components.push(withMaterial(renderer,materialIds[mesh.material]));
  if(mesh.solid) components.push(withMesh(component(n,colliderProto),mesh.guid));
}

for(const landing of teleportLandings) {
  const n=node('Teleporte - '+landing.name,section('Pontos de teleporte exterior'),landing.at);
  const doc=component(n,boxProto).replace(/m_Size: \{[^}]+\}/,'m_Size: '+fields(landing.size));
  components.push(doc);
  newDestinations.push(n.components[0]);
}
if(nextId>=endId) throw new Error('Generated scene ID range exhausted.');
const gateProbe=node('Reflexo local da guarita',section('Portaria e acesso pela avenida'),[-39.96,3.10,-79.32+avenueShiftZ]);
const probeTemplate=read('Assets/Scenes/SampleScene.unity').match(/^--- !u!215 &\d+\n[\s\S]*?(?=^--- !u!)/m)?.[0];
if(!probeTemplate) throw new Error('ReflectionProbe template missing.');
const reflectionFile=assetFolder+'/Textures/ReflexoPortaria.exr';
const customReflection=fs.existsSync(absolute(reflectionFile+'.meta'))&&fs.existsSync(absolute(reflectionFile));
const probeFields={
  m_Mode:customReflection?2:0, m_BoxSize:fields([5.1,4.55,5.9]), m_BoxOffset:fields([0,-1.98,1.1]),
  m_NearClip:.12, m_FarClip:155, m_ShadowDistance:48, m_IntensityMultiplier:1.15, m_BlendDistance:0,
  m_UseOcclusionCulling:0, m_Importance:2,
  m_CustomBakedTexture:customReflection?
    '{fileID: 8900000, guid: '+metaGuid(reflectionFile)+', type: 3}':'{fileID: 0}'
};
let probe=component(gateProbe,probeTemplate);
for(const [key,value] of Object.entries(probeFields)) {
  probe=probe.replace(new RegExp('^  '+key+': .*$','m'),'  '+key+': '+value);
}
components.push(probe);
const newDocs=nodes.flatMap(n=>serializedNode(n).split(/(?=^--- !u!)/m)).concat(components);

const docId=(s)=>Number(s.match(/^--- !u!\d+ &(\d+)/)?.[1]);
const gameId=(s)=>Number(s.match(/m_GameObject: \{fileID: (\d+)\}/)?.[1]);
const meshGuid=(s)=>s.match(/m_Mesh: \{fileID: 4300000, guid: ([a-f0-9]+), type: 2\}/)?.[1];
const generated=(id)=>id>=firstId&&id<endId;
const clearChildren=(doc)=>doc.replace(/^  - \{fileID: (29\d{8})\}\n/gm,(line,id)=>generated(Number(id))?'':line);
const remapped=new Map([...replacements.values()].map(m=>[m.guid,m]));
const lightEuler=[Math.asin(sun[1]),Math.atan2(-sun[0],-sun[2])];
const [p,y]=lightEuler.map(x=>x*.5);
const sunRotation=[Math.sin(p)*Math.cos(y),Math.cos(p)*Math.sin(y),-Math.sin(p)*Math.sin(y),Math.cos(p)*Math.cos(y)];

function revisionScene(scenePath) {
  const old=read(scenePath).split(/(?=^--- !u!)/m);
  const previous=old.find(doc=>docId(doc)===firstId);
  if(old.some(d=>generated(docId(d)))&&!previous?.includes('m_Name: '+revisionName)) throw new Error('Scene IDs conflict: '+scenePath);
  const docs=old.filter(d=>!generated(docId(d)));
  const sourceByGame = new Map(docs.filter(d=>d.startsWith('--- !u!33 ')).map(d=>[gameId(d),meshGuid(d)]));
  const mapping=new Map([...sourceByGame.values()].map(g=>[g,replacements.get(g)||remapped.get(g)]));
  for(const [g,mesh] of replacements) if(!mapping.has(g)&&!mapping.has(mesh.guid)) throw new Error('Expected mesh missing in '+scenePath+': '+mesh.name);
  for(const g of [...disable,...hiddenRenderers]) if(!mapping.has(g)) throw new Error('Expected original object missing in '+scenePath+': '+g);
  let sunId, sunTransform;
  const sunObject=docs.find(d=>/^  m_Name: Directional Light$/m.test(d));
  if(!sunObject) throw new Error('Missing scene directional light in '+scenePath);
  const sunGame=docId(sunObject);
  sunId=docId(docs.find(d=>d.startsWith('--- !u!108 ')&&gameId(d)===sunGame));
  sunTransform=docId(docs.find(d=>d.startsWith('--- !u!4 ')&&gameId(d)===sunGame));
  const index=docs.findIndex(d=>d.startsWith('--- !u!1660057539 '));
  if(index<0||!Number.isInteger(sunId)||!Number.isInteger(sunTransform)) throw new Error('Incomplete scene: '+scenePath);
  const result=docs.map(doc=>{
    const id=docId(doc), owner=gameId(doc);
    const original=doc.startsWith('--- !u!1 ')?sourceByGame.get(id):sourceByGame.get(owner);
    const mesh=mapping.get(original);
    if(id===main.parent) return clearChildren(doc).replace('\n  m_Father:', '\n  - {fileID: '+main.transform+'}\n  m_Father:');
    if(doc.includes('  destinations:\n')&&owner===2600000000) {
      return clearChildren(doc).trimEnd()+'\n'+newDestinations.map(k=>'  - {fileID: '+k+'}\n').join('');
    }
    if(disable.has(original)&&doc.startsWith('--- !u!1 ')) return doc.replace('m_IsActive: 1','m_IsActive: 0');
    if(doc.startsWith('--- !u!23 ')) {
      if(hiddenRenderers.has(original)) return doc.replace('m_Enabled: 1','m_Enabled: 0');
      if(mesh) return withMaterial(doc,materialIds[mesh.material]);
    }
    if(mesh&&doc.startsWith('--- !u!33 ')) return withMesh(doc,mesh.guid);
    if(doc.startsWith('--- !u!104 ')) {
      const values={
        m_SkyboxMaterial:assetRef(2100000,sky),m_Sun:'{fileID: '+sunId+'}',
        m_Fog:1,m_FogMode:1,m_LinearFogStart:155,m_LinearFogEnd:300,
        m_FogColor:fields([.727,.8,.862,1],'rgba'),m_AmbientMode:1,
        m_AmbientSkyColor:fields([.61,.655,.727,1],'rgba'),
        m_AmbientEquatorColor:fields([.424,.444,.473,1],'rgba'),
        m_AmbientGroundColor:fields([.267,.242,.206,1],'rgba'),m_ReflectionIntensity:.83
      };
      for(const [key,v] of Object.entries(values)) doc=doc.replace(new RegExp('^  '+key+': .*$', 'm'),'  '+key+': '+v);
      return doc;
    }
    if(id===sunId) return doc.replace(/m_Color: \{[^}]+\}/,'m_Color: '+fields([1,.975,.92,1],'rgba'))
      .replace(/m_Intensity: [^\n]+/,'m_Intensity: 1.16').replace(/m_Strength: [^\n]+/,'m_Strength: 0.92');
    if(id===sunTransform) return doc.replace(/m_LocalRotation: \{[^}]+\}/,'m_LocalRotation: '+fields(sunRotation,'xyzw'))
      .replace(/m_LocalEulerAnglesHint: \{[^}]+\}/,'m_LocalEulerAnglesHint: '+fields([...lightEuler.map(a=>a*180/Math.PI),0]));
    return doc;
  });
  result.splice(index,0,...newDocs);
  const ids=result.map(docId).filter(Number.isInteger);
  if(ids.length!==new Set(ids).size) throw new Error('Scene document ID collision in '+scenePath);
  for(const d of newDocs) {
    for(const m of d.matchAll(/\{fileID: (\d+)\}/g)) {
      const id=Number(m[1]); if(id&&!ids.includes(id)) throw new Error('Unresolved scene object '+id);
    }
  }
  const s=result.join('');
  if(!s.includes('  - {fileID: '+main.transform+'}\n  m_Father:')||!s.includes('  - {fileID: '+newDestinations.at(-1)+'}\n')) {
    throw new Error('Exterior or XR destinations were not attached.');
  }
  write(scenePath,s);
}

for(const name of ['Sebrae','MostruarioSebrae']) revisionScene('Assets/Scenes/'+name+'.unity');
const pipelineFolder='Assets/Settings/Project Configuration/';
for(const [name,distance,cascades] of [['Quality',85,3],['Performance',34,2]]) {
  const p=pipelineFolder+name+' URP Config.asset';
  write(p,read(p).replace(/^  m_ShadowDistance: .*$/m,'  m_ShadowDistance: '+distance)
    .replace(/^  m_ShadowCascadeCount: .*$/m,'  m_ShadowCascadeCount: '+cascades)
    .replace(/^  m_Cascade2Split: .*$/m,'  m_Cascade2Split: 0.32')
    .replace(/^  m_Cascade3Split: .*$/m,'  m_Cascade3Split: {x: 0.13, y: 0.37}'));
}

const stats=meshes.reduce((sum,m)=>sum+m.triangles,0);
if(check) {
  const matches=(p,data)=>{
    if(!fs.existsSync(absolute(p))) return false;
    const saved=fs.readFileSync(absolute(p));
    if(!p.endsWith('.mat')) return saved.equals(Buffer.from(data));
    // URP reserializes derived material keywords, GI flags and the legacy colour alias on import.
    const compare=(value)=>value.toString('utf8').replaceAll('\r\n','\n')
      .replace(/^  m_ValidKeywords:[^\n]*\n(?:  - \S+\n)*/m,(block)=>
        block.split('\n').filter(line=>/^  - /.test(line)&&!/^  - _(?:EMISSION|ENVIRONMENTREFLECTIONS_OFF|SPECULARHIGHLIGHTS_OFF)$/.test(line)).sort().join('\n'))
      .replace(/^  m_DoubleSidedGI: .*\n/m,'')
      .replace(/(^    - _BaseMap:\n        m_Texture: \{[^}]+\})([\s\S]*?^    - _MainTex:\n        m_Texture:) \{[^}]+\}/m,
        (_,base,alias)=>base+alias+' '+base.slice(base.indexOf('{')))
      .replace(/^    - _Color: \{[^\n]+\}/m,(color)=>color.replace(/-?\d+\.\d+/g,(n)=>Number(n).toFixed(6)));
    return compare(saved)===compare(data);
  };
  const changes=[...planned].filter(([p,data])=>!matches(p,data));
  if(changes.length) throw new Error('Saved revision differs: '+changes.map(([p])=>p).join(', '));
  console.log('EXTERIOR_VERIFICADO: '+meshes.length+' malhas; '+stats+' triangulos; '+newDestinations.length+' destinos XR; ambas as cenas.');
} else {
  for(const [p,data] of planned) {
    fs.mkdirSync(path.dirname(absolute(p)),{recursive:true});
    fs.writeFileSync(absolute(p),data);
  }
  console.log('EXTERIOR_SALVO: '+meshes.length+' malhas; '+stats+' triangulos; '+newDestinations.length+' destinos XR; ambas as cenas.');
}

if(preview) {
  const { renderExterior } = await import('./review-multicenter-exterior.mjs');
  const staged=meshes.map(m=>({
    vertices:decodeMesh(read(m.path)), spec:surfaces[m.material]||campus.specs.FachadaFoto, shadow:m.shadow!==false,
    generated:!!surfaces[m.material],
  }));
  const filtered=new Set([...disable,...hiddenRenderers,...replacements.keys()]);
  for(const m of campus.meshes.filter(m=>!filtered.has(m.guid))) {
    staged.push({vertices:decodeMesh(read(m.path)),spec:campus.specs[m.material],shadow:!campus.specs[m.material].label});
  }
  await renderExterior({absolute,staged,views});
}
