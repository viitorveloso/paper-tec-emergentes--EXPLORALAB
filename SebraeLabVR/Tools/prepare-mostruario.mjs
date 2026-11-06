// Monta os arquivos Unity sem alterar a cena Sebrae ou os pacotes de terceiros.
// Executar na pasta SebraeLabVR: node Tools/prepare-mostruario.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const read = p => fs.readFile(path.join(root, p), 'utf8');
const guid = p => crypto.createHash('md5').update(`SebraeLab/Mostruario/${p}`).digest('hex');
const written = [];
if ((await fs.readFile(path.join(root, 'Assets/Scenes/Sebrae.unity'), 'utf8')).includes('&2000000000')) throw Error('A cena ja possui mostruario. Use refine-showroom.mjs para atualizar a cenografia sem duplicar IDs.');
async function write(p, text) {
  await fs.mkdir(path.dirname(path.join(root, p)), { recursive: true });
  await fs.writeFile(path.join(root, p), text, 'utf8');
  written.push(p);
}
async function meta(p, type = 'DefaultImporter', extra = '') {
  await write(p + '.meta', `fileFormatVersion: 2\nguid: ${guid(p)}\n${type}:\n  externalObjects: {}\n${extra}  userData: \n  assetBundleName: \n  assetBundleVariant: \n`);
  return guid(p);
}
async function walk(dir) {
  const entries = await fs.readdir(path.join(root, dir), { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : `${dir}/${e.name}`))).flat();
}
const vendor = 'Assets/nappin/OfficeEssentialsPack';
const guidPaths = new Map();
for (const p of (await walk(vendor)).filter(p => p.endsWith('.meta'))) {
  const match = (await read(p)).match(/^guid: (\w+)/m);
  if (match) guidPaths.set(match[1], p.slice(0, -5));
}
const mats = new Map();
async function copyMaterial(oldGuid) {
  if (mats.has(oldGuid)) return mats.get(oldGuid);
  const source = guidPaths.get(oldGuid);
  if (!source?.endsWith('.mat')) throw Error(`Material não encontrado: ${oldGuid}`);
  const target = `Assets/Mostruario/Materials/${path.basename(source)}`;
  const text = (await read(source)).replace(/m_Shader: \{[^\n]+\}/,
    'm_Shader: {fileID: 4800000, guid: 933532a4fcc9baf4fa0491de14d08ed7, type: 3}');
  await write(target, text);
  const newGuid = await meta(target, 'NativeFormatImporter', '  mainObjectFileID: 2100000\n');
  mats.set(oldGuid, newGuid);
  return newGuid;
}

function vector(text, key, fallback) {
  const match = text.match(new RegExp(`${key}: \\{([^}]+)\\}`));
  return match ? [...match[1].matchAll(/[xyzw]: ([^,}]+)/g)].map(m => Number(m[1])) : fallback;
}
function rotate(v, q) {
  const [x,y,z,w] = q;
  const uv = [y*v[2]-z*v[1],z*v[0]-x*v[2],x*v[1]-y*v[0]];
  const uuv = [y*uv[2]-z*uv[1],z*uv[0]-x*uv[2],x*uv[1]-y*uv[0]];
  return v.map((n,i) => n+2*(w*uv[i]+uuv[i]));
}
function prefabBounds(text) {
  const docs = [...text.matchAll(/--- !u!(\d+) &(-?\d+)\n([\s\S]*?)(?=--- !u!|$)/g)];
  const transforms = new Map(), byGameObject = new Map();
  for (const [,type,id,body] of docs) if (type === '4') {
    const transform = { parent: body.match(/m_Father: \{fileID: (-?\d+)/)[1],
      position: vector(body,'m_LocalPosition',[0,0,0]), scale: vector(body,'m_LocalScale',[1,1,1]),
      rotation: vector(body,'m_LocalRotation',[0,0,0,1]) };
    transforms.set(id, transform);
    byGameObject.set(body.match(/m_GameObject: \{fileID: (-?\d+)/)[1], id);
  }
  function worldPoint(point, id) {
    if (id === '0') return point;
    const t = transforms.get(id);
    return worldPoint(rotate(point.map((n,i) => n*t.scale[i]),t.rotation).map((n,i)=>n+t.position[i]), t.parent);
  }
  const min=[Infinity,Infinity,Infinity], max=[-Infinity,-Infinity,-Infinity];
  for (const [,type,,body] of docs) if (type === '65') {
    const id=byGameObject.get(body.match(/m_GameObject: \{fileID: (-?\d+)/)[1]);
    const center=vector(body,'m_Center',[0,0,0]), size=vector(body,'m_Size',[0,0,0]);
    for(let mask=0;mask<8;mask++) {
      const v=worldPoint(center.map((n,i)=>n+((mask>>i)&1 ? 1:-1)*size[i]/2),id);
      for(let i=0;i<3;i++){min[i]=Math.min(min[i],v[i]);max[i]=Math.max(max[i],v[i]);}
    }
  }
  if (!min.every(Number.isFinite)) throw Error('Prefab sem BoxCollider para medir o apoio.');
  const rootTransform=[...transforms].find(([,t])=>t.parent==='0')[0];
  const rootGameObject=[...byGameObject].find(([,t])=>t===rootTransform)[0];
  return {min,max,rootTransform,rootGameObject};
}

const prefabs = new Map();
for (const name of ['ConferenceTable','OfficeChair','Mug','CoffePot','DeskPlant','BookOpen','BookPile1','PenHolder','Projector']) {
  let text=await read(`${vendor}/Prefabs/(Prb)${name}.prefab`);
  const bounds=prefabBounds(text);
  const materialGuids=[...new Set([...text.matchAll(/guid: (\w+)/g)].map(m=>m[1]).filter(g=>guidPaths.get(g)?.endsWith('.mat')))];
  for (const old of materialGuids) text=text.replaceAll(old,await copyMaterial(old));
  const target=`Assets/Mostruario/Prefabs/${name}.prefab`;
  await write(target,text);
  prefabs.set(name,{...bounds,guid:await meta(target,'PrefabImporter')});
}

// Material explícito mantém o shader URP incluído também no build.
const templatePath='Assets/Mostruario/Materials/AmbienteURP.mat';
let template=await read([...guidPaths.values()].find(p=>p.endsWith('(Mat)GradientDarkBrown.mat')));
template=template.replace(/m_Name: [^\n]*/, 'm_Name: AmbienteURP')
  .replace(/m_Shader: \{[^\n]+\}/,'m_Shader: {fileID: 4800000, guid: 933532a4fcc9baf4fa0491de14d08ed7, type: 3}')
  .replace(/m_Texture: \{fileID: 2800000, guid: \w+, type: 3\}/g,'m_Texture: {fileID: 0}');
await write(templatePath,template);
const templateGuid=await meta(templatePath,'NativeFormatImporter','  mainObjectFileID: 2100000\n');
const scriptPath='Assets/Mostruario/Scripts/MostruarioEnvironment.cs';
const scriptGuid=await meta(scriptPath,'MonoImporter','  serializedVersion: 2\n  defaultReferences: []\n  executionOrder: -100\n  icon: {instanceID: 0}\n');
await meta('Assets/Mostruario/Editor/MostruarioValidation.cs','MonoImporter','  serializedVersion: 2\n  defaultReferences: []\n  executionOrder: 0\n  icon: {instanceID: 0}\n');

let nextId=2000000000;
const nodes=[];
function group(name,parent=null,position=[0,0,0],extras=[]) {
  const go=nextId++, tr=nextId++;
  const node={go,tr,name,parent,position,extras,children:[]}; nodes.push(node);
  parent?.children.push(tr);
  return node;
}
const layout=group('Mostruario');
const environmentId=nextId++;
layout.extras.push(environmentId);
const exposition=group('Exposicao',layout);
const additions=[], placements=[];
const round=n=>Number(n.toFixed(7));
function instance(model,name,parent,position,yaw=0,scale=1,supportHeight=0) {
  const source=prefabs.get(model), pi=nextId++, tr=nextId++;
  const y=round(supportHeight-source.min[1]*scale);
  const pos=[position[0],y,position[2]];
  const angle=yaw*Math.PI/360;
  const properties=[['m_Name',name,source.rootGameObject],
    ...pos.map((v,i)=>[`m_LocalPosition.${'xyz'[i]}`,round(v),source.rootTransform]),
    ...[0,Math.sin(angle),0,Math.cos(angle)].map((v,i)=>[`m_LocalRotation.${'xyzw'[i]}`,round(v),source.rootTransform]),
    ...[scale,scale,scale].map((v,i)=>[`m_LocalScale.${'xyz'[i]}`,round(v),source.rootTransform]),
    ['m_LocalEulerAnglesHint.y',yaw,source.rootTransform]];
  additions.push(`--- !u!1001 &${pi}\nPrefabInstance:\n  m_ObjectHideFlags: 0\n  serializedVersion: 2\n  m_Modification:\n    serializedVersion: 3\n    m_TransformParent: {fileID: ${parent.tr}}\n    m_Modifications:\n${properties.map(([key,v,id])=>`    - target: {fileID: ${id}, guid: ${source.guid}, type: 3}\n      propertyPath: ${key}\n      value: ${v}\n      objectReference: {fileID: 0}\n`).join('')}    m_RemovedComponents: []\n    m_RemovedGameObjects: []\n    m_AddedGameObjects: []\n    m_AddedComponents: []\n  m_SourcePrefab: {fileID: 100100000, guid: ${source.guid}, type: 3}\n--- !u!4 &${tr} stripped\nTransform:\n  m_CorrespondingSourceObject: {fileID: ${source.rootTransform}, guid: ${source.guid}, type: 3}\n  m_PrefabInstance: {fileID: ${pi}}\n  m_PrefabAsset: {fileID: 0}\n`);
  parent.children.push(tr);
  let station=parent;
  const worldOrigin=[...pos];
  for(let p=parent;p;p=p.parent) {
    for(let i=0;i<3;i++) worldOrigin[i]+=p.position[i];
    if(p.parent===exposition) station=p;
  }
  placements.push({model,name,station:station.name,position:pos,worldOrigin,supportHeight,scale,yaw});
}
const stations=[
  ['01 - Objetos e decoracao',[9.4,0,3.5],['Mug','CoffePot','DeskPlant','Mug']],
  ['02 - Livros e criacao',[9.4,0,8],['BookOpen','BookPile1','PenHolder','DeskPlant']],
  ['03 - Demonstracao e atendimento',[14.6,0,7],['Projector','Mug','BookOpen','PenHolder']],
];
const productNames={Mug:'Caneca',CoffePot:'Jarra',DeskPlant:'Planta',BookOpen:'Livro aberto',BookPile1:'Livros',PenHolder:'Porta-lapis',Projector:'Projetor'};
const table=prefabs.get('ConferenceTable'), tableScale=.9/(table.max[1]-table.min[1]);
for(const [name,pos,products] of stations) {
  const station=group(name,exposition,pos);
  instance('ConferenceTable','Mesa',station,[0,0,0],0,tableScale);
  const chairs=group('Cadeiras',station);
  instance('OfficeChair','Cadeira - lado A',chairs,[0,0,-1.75],0);
  instance('OfficeChair','Cadeira - lado B',chairs,[0,0,1.75],180);
  const items=group('Produtos',station);
  products.forEach((model,i)=>instance(model,`${String(i+1).padStart(2,'0')} - ${productNames[model]}`,items,[i%2 ? .22:-.22,0,i<2 ? -.55:.55],i%2 ? 20:-15,1,.903));
}

const teleport=group('Circulacao VR',layout);
const boxes=[];
for(const [name,pos,size] of [
  ['Entrada',[11.15,.01,1.8],[.7,.02,.7]],
  ['Corredor das mesas',[11.05,.01,6.7],[.8,.02,7.8]],
  ['Passagem central',[12.5,.01,6.1],[2,.02,.8]],
  ['Lateral do atendimento',[16,.01,7],[.7,.02,2.6]],
  ['Frente do atendimento',[14.65,.01,4.3],[1,.02,.6]],
]) {
  const collider=nextId++, node=group(name,teleport,pos,[collider]);
  boxes.push(`--- !u!65 &${collider}\nBoxCollider:\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n  m_GameObject: {fileID: ${node.go}}\n  m_Material: {fileID: 0}\n  m_IsTrigger: 0\n  m_Enabled: 1\n  serializedVersion: 2\n  m_Size: {x: ${size[0]}, y: ${size[1]}, z: ${size[2]}}\n  m_Center: {x: 0, y: 0, z: 0}\n`);
}
function serializeGroup(n) {
  return `--- !u!1 &${n.go}\nGameObject:\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n  serializedVersion: 6\n  m_Component:\n${[n.tr,...n.extras].map(id=>`  - component: {fileID: ${id}}\n`).join('')}  m_Layer: 0\n  m_Name: ${n.name}\n  m_TagString: Untagged\n  m_Icon: {fileID: 0}\n  m_NavMeshLayer: 0\n  m_StaticEditorFlags: 0\n  m_IsActive: 1\n--- !u!4 &${n.tr}\nTransform:\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n  m_GameObject: {fileID: ${n.go}}\n  serializedVersion: 2\n  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}\n  m_LocalPosition: {x: ${n.position[0]}, y: ${n.position[1]}, z: ${n.position[2]}}\n  m_LocalScale: {x: 1, y: 1, z: 1}\n  m_ConstrainProportionsScale: 0\n${n.children.length ? '  m_Children:\n'+n.children.map(id=>`  - {fileID: ${id}}\n`).join('') : '  m_Children: []\n'}  m_Father: {fileID: ${n.parent?.tr??0}}\n  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}\n`;
}
let scene=await read('Assets/Scenes/Sebrae.unity');
scene=scene.replace(/(--- !u!1 &1061270401\n[\s\S]*?m_IsActive:) 1/,'$1 0');
scene=scene.replace('m_AmbientMode: 0','m_AmbientMode: 3')
  .replace(/m_AmbientSkyColor: \{[^}]+\}/,'m_AmbientSkyColor: {r: 0.65, g: 0.68, b: 0.72, a: 1}');
const rigStart=scene.indexOf('--- !u!1001 &1740320802'), rigEnd=scene.indexOf('--- !u!4 &1740320803');
let rig=scene.slice(rigStart,rigEnd);
for(const [key,value] of [['m_LocalPosition.x',11.15],['m_LocalPosition.y',.04],['m_LocalPosition.z',1.8],['m_LocalRotation.w',1],['m_LocalRotation.x',0],['m_LocalRotation.y',0],['m_LocalRotation.z',0],['m_LocalEulerAnglesHint.y',0]]) {
  const escaped=key.replaceAll('.','\\.');
  rig=rig.replace(new RegExp(`(propertyPath: ${escaped}\\n      value: )[^\\n]*`),`$1${value}`);
}
scene=scene.slice(0,rigStart)+rig+scene.slice(rigEnd);
const sceneRoot=scene.indexOf('--- !u!1660057539');
const rootBlock=scene.slice(sceneRoot)+`  - {fileID: ${layout.tr}}\n`;
scene=scene.slice(0,sceneRoot)+nodes.map(serializeGroup).join('')+additions.join('')+boxes.join('');
const buildingTr=nextId++;
scene+=`--- !u!4 &${buildingTr} stripped\nTransform:\n  m_CorrespondingSourceObject: {fileID: -8679921383154817045, guid: cc8e826513751af478d270d59cb01291, type: 3}\n  m_PrefabInstance: {fileID: 1156880317}\n  m_PrefabAsset: {fileID: 0}\n`;
scene+=`--- !u!114 &${environmentId}\nMonoBehaviour:\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n  m_GameObject: {fileID: ${layout.go}}\n  m_Enabled: 1\n  m_EditorHideFlags: 0\n  m_Script: {fileID: 11500000, guid: ${scriptGuid}, type: 3}\n  m_Name: \n  m_EditorClassIdentifier: \n  buildingRoot: {fileID: ${buildingTr}}\n  teleportRoot: {fileID: ${teleport.tr}}\n  materialTemplate: {fileID: 2100000, guid: ${templateGuid}, type: 2}\n`;
const scenePath='Assets/Scenes/MostruarioSebrae.unity';
await write(scenePath,scene+rootBlock);
await meta(scenePath);
let build=await read('ProjectSettings/EditorBuildSettings.asset');
if(!build.includes(scenePath)) build=build.replace('  m_Scenes:\n',`  m_Scenes:\n  - enabled: 1\n    path: ${scenePath}\n    guid: ${guid(scenePath)}\n`);
await write('ProjectSettings/EditorBuildSettings.asset',build);
await write('Tools/mostruario-layout.json',JSON.stringify({scene:scenePath,tableHeight:.9,stations:stations.map(([name,position])=>({name,position})),assets:Object.fromEntries(prefabs),placements},null,2)+'\n');
console.log(`Cena preparada: ${stations.length} mesas, 6 cadeiras, 12 objetos, 5 áreas de teleporte. ${written.length} arquivos gravados.`);
