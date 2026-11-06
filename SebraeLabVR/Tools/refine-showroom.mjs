import { placeArtecCollection } from './artec-collection.mjs';
import { buildInteriorLighting } from './interior-lighting.mjs';
import { placeLandscaping } from './landscaping.mjs';
import { placeDownloadedProducts } from './downloaded-products.mjs';
import { buildRooms } from './corridor-rooms.mjs';
import { buildExterior } from './exterior-pavilion.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve('SebraeLabVR');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replaceAll('\r\n','\n');
const write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const guid=s=>crypto.createHash('md5').update('SebraeShowroom/'+s).digest('hex');
const common='  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n';
const vec=(v,keys='xyz')=>'{'+v.map((x,i)=>`${keys[i]}: ${Number(x.toFixed(6))}`).join(', ')+'}';
const materials={};
for(const [name,color] of Object.entries({Azul:[.025,.16,.34],Branco:[.9,.92,.92],Dourado:[.67,.45,.16],Grafite:[.065,.085,.11],Areia:[.68,.60,.47],Tapete:[.13,.21,.28],PisoNeutro:[1,1,1],ParedeCreme:[.96,.93,.86],TetoBranco:[.99,.99,.99],LuzQuente:[.94,.77,.48],MetalLustre:[.48,.38,.23]})) {
 const p=`Assets/Mostruario/Materials/Showroom${name}.mat`; materials[name]=guid(p);
 let mat=read('Assets/Mostruario/Materials/AmbienteURP.mat').replace('m_Name: AmbienteURP',`m_Name: Showroom${name}`);
 for(const key of ['_BaseColor','_Color']) mat=mat.replace(new RegExp(`- ${key}: \\{[^}]+\\}`),`- ${key}: ${vec([...color,1],'rgba')}`);
 mat=mat.replace('- _Smoothness: 0','- _Smoothness: 0.28');
 write(p,mat); write(p+'.meta',`fileFormatVersion: 2\nguid: ${guid(p)}\nNativeFormatImporter:\n  externalObjects: {}\n  mainObjectFileID: 2100000\n  userData: \n  assetBundleName: \n  assetBundleVariant: \n`);
}

// Acabamentos baixados de ambientCG: preservados ao regenerar a cenografia.
const textureGuids=JSON.parse(read('Tools/downloaded-textures.json'));
function surfaceTexture(materialPath,asset,tint=[1,1,1],tiling=[1,1]){
 let material=read(materialPath).replace('m_ValidKeywords: []','m_ValidKeywords:\n  - _NORMALMAP');
 for(const [slot,key] of [['_BaseMap',asset+'_Color'],['_BumpMap',asset+'_NormalGL']])material=material.replace(new RegExp('(- '+slot+':\\n        m_Texture:) \\{[^}]+\\}'), '$1 {fileID: 2800000, guid: '+textureGuids[key]+', type: 3}');
 for(const key of ['_BaseColor','_Color'])material=material.replace(new RegExp('- '+key+': \\{[^}]+\\}'),'- '+key+': '+vec([...tint,1],'rgba'));
 material=material.replace('- _BumpScale: 1','- _BumpScale: 0.35');
 material=material.replace(/(- _BaseMap:\n[\s\S]*?m_Scale:) \{[^}]+\}/,'$1 {x: '+tiling[0]+', y: '+tiling[1]+'}');write(materialPath,material);
}
surfaceTexture('Assets/Mostruario/Materials/ShowroomAreia.mat','Wood051');
surfaceTexture('Assets/Mostruario/Materials/ShowroomTapete.mat','Fabric030',[.16,.24,.32],[3,3]);
surfaceTexture('Assets/Mostruario/Materials/(Mat)GradientBrown.mat','Wood051');


for(const name of ['GradientRed','GradientDarkRed']){
 const p='Assets/Mostruario/Materials/(Mat)'+name+'.mat';let material=read(p);
 material=material.replace(/m_Texture: \{fileID: 2800000, guid: \w+, type: 3\}/g,'m_Texture: {fileID: 0}');
 for(const key of ['_BaseColor','_Color'])material=material.replace(new RegExp('- '+key+': \\{[^}]+\\}'),'- '+key+': {r: 0.085, g: 0.13, b: 0.18, a: 1}');
 write(p,material);
}
// Luz quente discreta nas luminarias cenograficas.
let led=read('Assets/Mostruario/Materials/ShowroomLuzQuente.mat').replace('m_ValidKeywords: []','m_ValidKeywords:\n  - _EMISSION').replace(/- _EmissionColor: \{[^}]+\}/,'- _EmissionColor: {r: 1.5, g: 1.1, b: 0.65, a: 1}');
write('Assets/Mostruario/Materials/ShowroomLuzQuente.mat',led);

let metal=read('Assets/Mostruario/Materials/ShowroomMetalLustre.mat').replace('- _Metallic: 0','- _Metallic: 0.65').replace('- _Smoothness: 0.28','- _Smoothness: 0.5');
write('Assets/Mostruario/Materials/ShowroomMetalLustre.mat',metal);
let id=2100000000; const nodes=[]; const docs=[];
function group(name,parent,pos=[0,0,0],scale=[1,1,1],yaw=0){
 const n={go:id++,tr:id++,name,parent,pos,scale,yaw,components:[],children:[]};nodes.push(n);parent?.children.push(n.tr);return n;
}
function renderer(n,mat){ const rid=id++; n.components.push(rid);docs.push(`--- !u!23 &${rid}\nMeshRenderer:\n${common}  m_GameObject: {fileID: ${n.go}}\n  m_Enabled: 1\n  m_CastShadows: 1\n  m_ReceiveShadows: 1\n  m_DynamicOccludee: 1\n  m_MotionVectors: 1\n  m_LightProbeUsage: 1\n  m_ReflectionProbeUsage: 1\n  m_RenderingLayerMask: 1\n  m_RendererPriority: 0\n  m_Materials:\n  - ${mat}\n  m_StaticBatchInfo:\n    firstSubMesh: 0\n    subMeshCount: 0\n  m_StaticBatchRoot: {fileID: 0}\n  m_ProbeAnchor: {fileID: 0}\n  m_LightProbeVolumeOverride: {fileID: 0}\n  m_ScaleInLightmap: 1\n  m_ReceiveGI: 1\n  m_PreserveUVs: 0\n  m_IgnoreNormalsForChartDetection: 0\n  m_ImportantGI: 0\n  m_StitchLightmapSeams: 1\n  m_SelectedEditorRenderState: 3\n  m_MinimumChartSize: 4\n  m_AutoUVMaxDistance: 0.5\n  m_AutoUVMaxAngle: 89\n  m_LightmapParameters: {fileID: 0}\n  m_SortingLayerID: 0\n  m_SortingLayer: 0\n  m_SortingOrder: 0\n`); }
function shape(name,parent,pos,scale,material='Branco',mesh=10202,solid=true){
 const n=group(name,parent,pos,scale);const mf=id++;n.components.push(mf);
 docs.push(`--- !u!33 &${mf}\nMeshFilter:\n${common}  m_GameObject: {fileID: ${n.go}}\n  m_Mesh: {fileID: ${mesh}, guid: 0000000000000000e000000000000000, type: 0}\n`);
 renderer(n,`{fileID: 2100000, guid: ${materials[material]}, type: 2}`);
 if(solid){const c=id++;n.components.push(c);docs.push(`--- !u!65 &${c}\nBoxCollider:\n${common}  m_GameObject: {fileID: ${n.go}}\n  m_Material: {fileID: 0}\n  m_IsTrigger: 0\n  m_Enabled: 1\n  serializedVersion: 3\n  m_Size: {x: 1, y: 1, z: 1}\n  m_Center: {x: 0, y: 0, z: 0}\n`);}return n;
}
function text(name,parent,pos,value,size=.075,yaw=0){
 const n=group(name,parent,pos,[1,1,1],yaw),tid=id++;n.components.push(tid);
 renderer(n,'{fileID: 2100000, guid: c0a3d5cc2de0ad9439462cce3a46ca3f, type: 2}');
 docs.push(`--- !u!102 &${tid}\nTextMesh:\n${common}  m_GameObject: {fileID: ${n.go}}\n  m_Text: ${JSON.stringify(value)}\n  m_OffsetZ: 0\n  m_CharacterSize: ${Number((size*.32).toFixed(5))}\n  m_LineSpacing: 1.15\n  m_Anchor: 4\n  m_Alignment: 1\n  m_TabSize: 4\n  m_FontSize: 64\n  m_FontStyle: 0\n  m_RichText: 1\n  m_Font: {fileID: 12800000, guid: 0000000000000000e000000000000000, type: 0}\n  m_Color: {r: 1, g: 1, b: 1, a: 1}\n`);return n;
}
const showroom=group('Cenografia - Mostruario Sebrae',null);
// Os corredores x=11.05 e z=6.1 permanecem livres de novos volumes.
for(const [x,z,w,d,title,num] of [[9.4,3.5,2.5,3.3,'OBJETOS & DESIGN','01'],[9.4,7.8,2.5,3.3,'CRIACAO & SABERES','02'],[14.2,7.8,2.5,4.1,'IDEIAS & NEGOCIOS','03']]){
 const sector=group(`${num} - ${title}`,showroom,[x,0,z]);
 shape('Tapete de delimitacao',sector,[0,.006,0],[w,.012,d],'Tapete',10202,false);
 // Marcas discretas nas pontas do tapete.
 for(const side of [-1,1])shape('Filete dourado',sector,[0,.015,side*(d/2-.04)],[w,.006,.025],'Dourado',10202,false);
 const rear=d/2-.15;
 shape('Base do totem',sector,[-.87,.035,rear],[.3,.07,.3],'Grafite');
 shape('Totem azul',sector,[-.87,.835,rear],[.23,1.6,.07],'Azul');
 text('Numero do setor',sector,[-.87,1.44,rear-.055],num,.12);
 text('Nome do setor',sector,[-.87,1.05,rear-.055],title.replace(' & ','\n&\n'),.029);
 // Identificacao nas duas faces do expositor, legivel ao circular.
 for(const [offset,yaw] of [[-.60,0],[.60,180]]){
  shape('Placa da mesa',sector,[offset,.72,0],[.025,.22,.95],'Azul');
  text('Identificacao da mesa',sector,[offset+(offset<0?-.014:.014),.72,0],title,.032,offset<0?90:-90);
 }
}
const fashion=group('04 - Moda e identidade',showroom,[15.9,0,-.4],[1,1,1],-90);
shape('Ilha da vitrine',fashion,[0,.07,0],[2.8,.14,1.5],'Azul');
shape('Rodape dourado',fashion,[0,.145,0],[2.74,.015,1.44],'Dourado',10202,false);
shape('Painel da vitrine',fashion,[0,1.45,-.69],[2.8,2.6,.10],'Azul');
text('Titulo da vitrine',fashion,[0,2.48,-.625],'04  /  MODA & IDENTIDADE',.067,180);
text('Subtitulo da vitrine',fashion,[0,2.22,-.625],'Design que conta historias',.043,180);
for(const [x,tone] of [[-.7,'Areia'],[.7,'Branco']]){
 const bust=group('Manequim de vitrine',fashion,[x,.16,0]);
 shape('Pedestal',bust,[0,.16,0],[.55,.32,.55],'Branco');
 shape('Base circular',bust,[0,.34,0],[.38,.025,.38],'Grafite',10206);
 shape('Haste',bust,[0,.59,0],[.035,.24,.035],'Dourado',10206);
 // Busto de alfaiataria composto por volumes suaves, sem importar modelos externos.
 shape('Quadril',bust,[0,.86,0],[.34,.28,.23],tone,10207,false);
 shape('Cintura',bust,[0,1.06,0],[.25,.29,.20],tone,10207,false);
 shape('Torax',bust,[0,1.27,0],[.41,.39,.25],tone,10207,false);
 shape('Ombros',bust,[0,1.40,0],[.48,.15,.23],tone,10207,false);
 shape('Pescoco',bust,[0,1.55,0],[.105,.085,.105],tone,10206,false);
 shape('Acabamento superior',bust,[0,1.64,0],[.115,.025,.115],'Dourado',10206,false);
 shape('Cinto de destaque',bust,[0,1.04,0],[.26,.045,.21],'Azul',10207,false);
}
const welcome=group('Boas-vindas',showroom,[12.4,0,1.2]);
shape('Pe do painel',welcome,[0,.04,0],[1.1,.08,.45],'Grafite');
shape('Painel de boas-vindas',welcome,[0,1.18,0],[1.05,2.2,.09],'Azul');
shape('Detalhe dourado',welcome,[0,2.23,0],[1.05,.045,.10],'Dourado');
text('Marca de identificacao',welcome,[0,1.86,-.052],'SEBRAE',.12);
text('Titulo',welcome,[0,1.36,-.052],'MOSTRUARIO\nDIGITAL',.084);
text('Convite',welcome,[0,.79,-.052],'Explore. Conheca. Conecte.',.035);
text('Diretorio',welcome,[0,.44,-.052],'01 Design   /   02 Criacao\n03 Negocios   /   04 Moda',.03);

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
const roomDesign=buildRooms({group,shape,text,prefab,teleport,showroom,prefabData});
write('Tools/rooms-layout.json',JSON.stringify(roomDesign,null,2));



const foodAssets=JSON.parse(read('Tools/food-assets.json'));
function food(model,parent,position,yaw=0,scale=1){
 const source=foodAssets.models[model];if(!source)throw Error('Alimento desconhecido '+model);
 const n=group('Produto - '+model,parent,position,[scale,scale,scale],yaw),mf=id++;n.components.push(mf);
 docs.push('--- !u!33 &'+mf+'\nMeshFilter:\n'+common+'  m_GameObject: {fileID: '+n.go+'}\n  m_Mesh: {fileID: 4300000, guid: '+source.guid+', type: 2}\n');
 renderer(n,'{fileID: 2100000, guid: '+foodAssets.materialGuid+', type: 2}');return source.max[1]*scale+position[1];
}
placeDownloadedProducts({food,group,shape,text,showroom,nodes,foodAssets});
const landscaping=placeLandscaping({group,prefab,showroom});
write('Tools/landscaping-layout.json',JSON.stringify(landscaping,null,2));


const lighting=group('Iluminacao - Galeria',showroom);
for(const [x,z] of [[9.5,-4.55],[9.5,-7.3],[9.7,-11.7],[14.2,-11.7]]){
 const n=group('Luz de exposicao',lighting,[x,2.43,z]),lid=id++;n.components.push(lid);
 docs.push('--- !u!108 &'+lid+'\nLight:\n'+common+'  m_GameObject: {fileID: '+n.go+'}\n  m_Enabled: 1\n  serializedVersion: 11\n  m_Type: 2\n  m_Shape: 0\n  m_Color: {r: 1, g: 0.93, b: 0.82, a: 1}\n  m_Intensity: 0.45\n  m_Range: 4.2\n  m_SpotAngle: 30\n  m_InnerSpotAngle: 21.8\n  m_CookieSize: 10\n  m_Shadows:\n    m_Type: 0\n  m_Cookie: {fileID: 0}\n  m_DrawHalo: 0\n  m_Flare: {fileID: 0}\n  m_RenderMode: 0\n  m_CullingMask:\n    serializedVersion: 2\n    m_Bits: 4294967295\n  m_RenderingLayerMask: 1\n  m_Lightmapping: 4\n  m_LightShadowCasterMode: 0\n  m_AreaSize: {x: 1, y: 1}\n  m_BounceIntensity: 1\n  m_ColorTemperature: 5000\n  m_UseColorTemperature: 0\n');
 shape('Carcaca da luminaria',lighting,[x,2.615,z],[.74,.07,.12],'Grafite',10202,false);
 shape('Luminaria de exposicao',lighting,[x,2.574,z],[.70,.008,.08],'LuzQuente',10202,false);
}


const lightingMeshes=JSON.parse(read('Tools/lighting-meshes.json'));
function lightingMesh(name,parent,pos,scale,model,material){
 const n=group(name,parent,pos,scale),mf=id++;n.components.push(mf);
 docs.push('--- !u!33 &'+mf+'\nMeshFilter:\n'+common+'  m_GameObject: {fileID: '+n.go+'}\n  m_Mesh: {fileID: 4300000, guid: '+lightingMeshes[model].guid+', type: 2}\n');
 renderer(n,'{fileID: 2100000, guid: '+materials[material]+', type: 2}');
}
function interiorLight(name,parent,pos,options){
 const n=group(name,parent,pos),lid=id++;n.components.push(lid);if(options.type===0)n.rotation=[Math.SQRT1_2,0,0,Math.SQRT1_2];
 const c=options.color;
 docs.push('--- !u!108 &'+lid+'\nLight:\n'+common+'  m_GameObject: {fileID: '+n.go+'}\n  m_Enabled: 1\n  serializedVersion: 11\n  m_Type: '+options.type+'\n  m_Shape: 0\n  m_Color: {r: '+c[0]+', g: '+c[1]+', b: '+c[2]+', a: 1}\n  m_Intensity: '+options.intensity+'\n  m_Range: '+options.range+'\n  m_SpotAngle: '+(options.angle||60)+'\n  m_InnerSpotAngle: '+((options.angle||60)*.65)+'\n  m_CookieSize: 10\n  m_Shadows:\n    m_Type: 0\n  m_Cookie: {fileID: 0}\n  m_DrawHalo: 0\n  m_Flare: {fileID: 0}\n  m_RenderMode: 0\n  m_CullingMask:\n    serializedVersion: 2\n    m_Bits: 4294967295\n  m_RenderingLayerMask: 1\n  m_Lightmapping: 4\n  m_LightShadowCasterMode: 0\n  m_AreaSize: {x: 1, y: 1}\n  m_BounceIntensity: 1\n  m_ColorTemperature: 4000\n  m_UseColorTemperature: 0\n');
}
const interiorLighting=buildInteriorLighting({group,shape,mesh:lightingMesh,light:interiorLight,showroom});
write('Tools/interior-lighting-layout.json',JSON.stringify(interiorLighting,null,2));


const artecAssets=JSON.parse(read('Tools/artec-assets.json'));
function scannedObject(model,parent,pos,yaw=0,scale=1){
 const n=group('Artec - '+model,parent,pos,[scale,scale,scale],yaw);
 for(const [i,part] of artecAssets.models[model].parts.entries()){
  const child=group('Malha - '+model+' '+i,n),mf=id++;child.components.push(mf);
  docs.push('--- !u!33 &'+mf+'\nMeshFilter:\n'+common+'  m_GameObject: {fileID: '+child.go+'}\n  m_Mesh: {fileID: 4300000, guid: '+part.meshGuid+', type: 2}\n');
  renderer(child,'{fileID: 2100000, guid: '+part.materialGuid+', type: 2}');
 }
}
const artecLayout=placeArtecCollection({scan:scannedObject,group,shape,text,nodes,showroom,manifest:artecAssets});
write('Tools/artec-layout.json',JSON.stringify(artecLayout,null,2));

// SebraeSignMaterials substitui o material de texto antigo pelo shader URP com atlas da fonte.
const signBinding=id++;showroom.components.push(signBinding);
docs.push('--- !u!114 &'+signBinding+'\nMonoBehaviour:\n'+common+'  m_GameObject: {fileID: '+showroom.go+'}\n  m_Enabled: 1\n  m_EditorHideFlags: 0\n  m_Script: {fileID: 11500000, guid: b4df089730b5fe970a6c99ee92120ec3, type: 3}\n  m_Name: \n  m_EditorClassIdentifier: \n  materialTemplate: {fileID: 2100000, guid: c0a3d5cc2de0ad9439462cce3a46ca3f, type: 2}\n');

function serialize(n){const a=n.yaw*Math.PI/360;return `--- !u!1 &${n.go}\nGameObject:\n${common}  serializedVersion: 6\n  m_Component:\n${[n.tr,...n.components].map(i=>`  - component: {fileID: ${i}}\n`).join('')}  m_Layer: 0\n  m_Name: ${n.name}\n  m_TagString: Untagged\n  m_Icon: {fileID: 0}\n  m_NavMeshLayer: 0\n  m_StaticEditorFlags: 0\n  m_IsActive: 1\n--- !u!4 &${n.tr}\nTransform:\n${common}  m_GameObject: {fileID: ${n.go}}\n  serializedVersion: 2\n  m_LocalRotation: ${vec(n.rotation??[0,Math.sin(a),0,Math.cos(a)],'xyzw')}\n  m_LocalPosition: ${vec(n.pos)}\n  m_LocalScale: ${vec(n.scale)}\n  m_ConstrainProportionsScale: 0\n${n.children.length?'  m_Children:\n'+n.children.map(i=>`  - {fileID: ${i}}\n`).join(''):'  m_Children: []\n'}  m_Father: {fileID: ${n.parent?.tr??0}}\n  m_LocalEulerAnglesHint: {x: 0, y: ${n.yaw}, z: 0}\n`;}
for(const scenePath of ['Assets/Scenes/Sebrae.unity','Assets/Scenes/MostruarioSebrae.unity']){
 let scene=read(scenePath); const backup=`Tools/${path.basename(scenePath)}.before-showroom.bak`;if(!fs.existsSync(path.join(root,backup)))write(backup,scene);
 // Reexecutavel: remove apenas os documentos desta cenografia.
 scene=scene.replace(/--- !u!\d+ &(210\d+)(?: stripped)?\n[\s\S]*?(?=--- !u!|$)/g,'').replace(/  - \{fileID: 210\d+\}\n/g,'');
 // Duas mesas de exposicao ficam livres de cadeiras; atendimento conserva seus assentos.
 for(const go of [2000000009,2000000029])scene=scene.replace(new RegExp(`(--- !u!1 &${go}\\n[\\s\\S]*?m_IsActive:) [01]`),'$1 0');

 const mainAlignedStations=[{id:2000000006,position:[9.4,0,3.5]},{id:2000000026,position:[9.4,0,7.8]},{id:2000000046,position:[14.2,0,7.8]}];
 for(const station of mainAlignedStations){
  const expression=new RegExp('(--- !u!4 &'+station.id+'\\n[\\s\\S]*?m_LocalPosition:) \\{[^}]+\\}');
  if(!expression.test(scene))throw Error('Estacao principal ausente: '+station.id);
  scene=scene.replace(expression,'$1 '+vec(station.position));
 }

 // Usa os ajustes de entrada e iluminacao da cena dedicada tambem na cena Sebrae.
 const template=read('Assets/Scenes/MostruarioSebrae.unity');
 if(scenePath.endsWith('/Sebrae.unity')){
  for(const blockId of [1061270401,1740320802]){
   const re=new RegExp(`--- !u!\\d+ &${blockId}\\n[\\s\\S]*?(?=--- !u!|$)`);const block=template.match(re)?.[0];if(block)scene=scene.replace(re,block);
  }
  scene=scene.replace('m_AmbientMode: 0','m_AmbientMode: 3').replace(/m_AmbientSkyColor: \{[^}]+\}/,'m_AmbientSkyColor: {r: 0.65, g: 0.68, b: 0.72, a: 1}');
 }
 scene=scene.replace(/(--- !u!4 &2000000066\n[\s\S]*?m_Children:\n)/,'$1'+teleportParent.children.map(t=>'  - {fileID: '+t+'}\n').join(''));
 const marker='--- !u!1660057539';const at=scene.indexOf(marker);if(at<0)throw Error('SceneRoots ausente');
 const roots=scene.slice(at).trimEnd()+`\n  - {fileID: ${showroom.tr}}\n`;
 scene=scene.slice(0,at)+nodes.map(serialize).join('')+docs.join('')+roots;
 const ids=[...scene.matchAll(/^--- !u!\d+ &(\d+)/gm)].map(m=>m[1]);if(new Set(ids).size!==ids.length)throw Error('IDs duplicados');
 write(scenePath,scene);
 console.log(`${scenePath}: ${nodes.length} elementos de cenografia; IDs unicos; cena salva.`);
}
let view=read('Assets/Mostruario/Editor/SebraeMostruarioView.cs').replace(/Applied.v[123]/g,'Applied.v3').replace('var root = GameObject.Find("Mostruario/Exposicao");','var root = GameObject.Find("Cenografia - Mostruario Sebrae");').replace('3 mesas, 6 cadeiras e 12 amostras','3 mesas, vitrine com 2 manequins e sinalizacao');
write('Assets/Mostruario/Editor/SebraeMostruarioView.cs',view);
let validation=read('Assets/Mostruario/Editor/MostruarioValidation.cs').replace('public const string ScenePath = "Assets/Scenes/MostruarioSebrae.unity";','public const string ScenePath = "Assets/Scenes/Sebrae.unity";').replace('3 mesas, 6 cadeiras, 12 objetos','3 mesas, 2 cadeiras de atendimento, 12 objetos');
write('Assets/Mostruario/Editor/MostruarioValidation.cs',validation);
let build=read('ProjectSettings/EditorBuildSettings.asset');const sceneGuid=read('Assets/Scenes/Sebrae.unity.meta').match(/^guid: (\w+)/m)[1];
build=build.replace(/path: Assets\/Scenes\/MostruarioSebrae.unity\n    guid: \w+/,`path: Assets/Scenes/Sebrae.unity\n    guid: ${sceneGuid}`);write('ProjectSettings/EditorBuildSettings.asset',build);
write('Tools/showroom-design.json',JSON.stringify({landscaping,rooms:roomDesign,exterior:exteriorDesign,scene:'Assets/Scenes/Sebrae.unity',sectors:4,mannequins:2,activeChairs:2,palette:Object.keys(materials),notes:'Bustos estilizados de alfaiataria. Corredores x=11.05 e z=6.1 preservados. Cenas Sebrae e MostruarioSebrae sincronizadas.'},null,2));