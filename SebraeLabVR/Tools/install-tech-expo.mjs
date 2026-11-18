import { readTechGlb } from './tech-static-glb.mjs';
import { exportTechReview } from './tech-review-helpers.mjs';
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8').replaceAll('\r\n','\n'),write=(p,s)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),s);},guid=p=>crypto.createHash('md5').update('SebraeTech/'+p).digest('hex');
const dir='Assets/TechExpo',vec=(v,k='xyz')=>'{'+v.map((x,i)=>`${k[i]}: ${Number(x.toFixed(6))}`).join(', ')+'}',common='  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n';
function meta(p,type='NativeFormatImporter',extra='  mainObjectFileID: 2100000\n'){write(p+'.meta',`fileFormatVersion: 2\nguid: ${guid(p)}\n${type}:\n  externalObjects: {}\n${extra}  userData: \n  assetBundleName: \n  assetBundleVariant: \n`);}
for(const p of [dir,dir+'/Materials',dir+'/Meshes',dir+'/Textures',dir+'/Editor']){fs.mkdirSync(path.join(root,p),{recursive:true});write(p+'.meta',`fileFormatVersion: 2\nguid: ${guid(p)}\nfolderAsset: yes\nDefaultImporter:\n  externalObjects: {}\n  userData: \n  assetBundleName: \n  assetBundleVariant: \n`);}
const specs={Grafite:{color:[.055,.065,.075],smooth:.40},Metal:{color:[.65,.69,.73],smooth:.65,metal:.75},Preto:{color:[.014,.019,.026],smooth:.24},Branco:{color:[.86,.87,.89],smooth:.3},Azul:{color:[.02,.18,.30],smooth:.4},Led:{color:[.015,.7,.8],smooth:.5},Vidro:{color:[.055,.12,.18],smooth:.9},Ciano:{color:[.03,.55,.68],smooth:.2},Madeira:{color:[.48,.35,.23],smooth:.2}};
const materials={};function material(name,spec){let s=read('Assets/Mostruario/Materials/ShowroomBranco.mat').replace('m_Name: ShowroomBranco','m_Name: Tech'+name);for(const key of ['_BaseColor','_Color'])s=s.replace(new RegExp('- '+key+': \\{[^}]+\\}'),'- '+key+': '+vec([...spec.color,1],'rgba'));s=s.replace(/- _Smoothness: [^\n]+/,'- _Smoothness: '+spec.smooth).replace(/- _Metallic: [^\n]+/,'- _Metallic: '+(spec.metal||0));if(name==='Led'||(spec.tex&&spec.emits!==false))s=s.replace('m_ValidKeywords: []','m_ValidKeywords:\n  - _EMISSION').replace(/- _EmissionColor: \{[^}]+\}/,'- _EmissionColor: '+vec([...spec.color.map(v=>v*.5),1],'rgba'));if(spec.tex)for(const key of ['_BaseMap','_EmissionMap'])s=s.replace(new RegExp('(- '+key+':\\n        m_Texture:) \\{[^}]+\\}'),'$1 {fileID: 2800000, guid: '+guid(spec.tex)+', type: 3}');const p=dir+'/Materials/'+name+'.mat';write(p,s);meta(p);materials[name]=guid(p);}
for(const [name,spec]of Object.entries(specs))material(name,spec);
for(const name of ['IA','Criacao','Imersao']){const p=dir+'/Textures/'+name+'.png';meta(p,'TextureImporter','  serializedVersion: 13\n  mipmaps:\n    enableMipMap: 1\n    sRGBTexture: 1\n  textureType: 0\n  maxTextureSize: 1024\n  textureSettings:\n    serializedVersion: 2\n    filterMode: 1\n    aniso: 2\n    wrapU: 1\n    wrapV: 1\n');specs[name]={color:[1,1,1],smooth:.5,tex:p,photoFace:true};material(name,specs[name]);}
const original=read('Tools/refine-showroom.mjs'),helpers=original.slice(original.indexOf('function group('),original.indexOf('const showroom=')),serializer=original.slice(original.indexOf('function serialize('),original.indexOf("for(const scenePath of")),prefabHelper=original.slice(original.indexOf('function prefab('),original.indexOf('const teleportParent='));
const h=new Function('common','vec','materials','prefabData','let id=2400000000;const nodes=[],docs=[];'+helpers+prefabHelper+serializer+'return {group,shape,text,renderer,prefab,serialize,nodes,docs,alloc:()=>id++};')(common,vec,materials,JSON.parse(read('Tools/mostruario-layout.json')).assets);
const sceneRoot=h.group('Exposicao Tech - Sebraelab',null),placements=[],objects=[],native=[];
function shape(name,parent,pos,size,mat='Grafite',mesh=10202){const n=h.shape(name,parent,pos,size,mat,mesh,name.startsWith("Balcao existente"));objects.push({node:n,mesh,material:mat});return n;}
const meshTemplate=read('Assets/Samples/XR Hands/1.7.3/HandVisualizer/Materials/AxisMesh.asset');
function nativeMesh(name,vertices){const n=vertices.length,buf=Buffer.alloc(n*32),index=Buffer.alloc(n*2),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];if(n>65535)throw Error('Mesh too large');vertices.forEach((v,i)=>{v.forEach((x,k)=>buf.writeFloatLE(x,i*32+k*4));index.writeUInt16LE(i,i*2);for(let k=0;k<3;k++){min[k]=Math.min(min[k],v[k]);max[k]=Math.max(max[k],v[k]);}});const center=min.map((v,i)=>(v+max[i])/2),extent=min.map((v,i)=>(max[i]-v)/2),channels=Array.from({length:14},(_,i)=>({offset:i===1?12:i===4?24:0,dim:i<2?3:i===4?2:0})).map(c=>`    - stream: 0\n      offset: ${c.offset}\n      format: 0\n      dimension: ${c.dim}\n`).join('');let s=meshTemplate.replace('m_Name: AxisMesh','m_Name: '+name).replace(/indexCount: \d+/,'indexCount: '+n).replace(/vertexCount: \d+/,'vertexCount: '+n).replace(/m_VertexCount: \d+/,'m_VertexCount: '+n).replace(/m_Center: \{[^}]+\}/g,'m_Center: '+vec(center)).replace(/m_Extent: \{[^}]+\}/g,'m_Extent: '+vec(extent)).replace(/m_IndexBuffer: [a-f0-9]+/,'m_IndexBuffer: '+index.toString('hex')).replace(/    m_Channels:\n[\s\S]*?    m_DataSize: \d+\n    _typelessdata: [a-f0-9]+\n/,'    m_Channels:\n'+channels+'    m_DataSize: '+buf.length+'\n    _typelessdata: '+buf.toString('hex')+'\n');const p=dir+'/Meshes/'+name+'.asset';write(p,s);meta(p,'NativeFormatImporter','  mainObjectFileID: 4300000\n');native.push({path:p,vertices:n,min,max});return {guid:guid(p),vertices};}
const models={};for(const name of ['computerScreen','computerKeyboard','computerMouse','laptop']){const lines=read('Assets/Models/OBJ format/'+name+'.obj').split('\n'),positions=[],normals=[],faces=[];let mat='metal';for(const line of lines){const p=line.trim().split(/\s+/);if(p[0]==='v')positions.push(p.slice(1).map(Number));if(p[0]==='vn')normals.push(p.slice(1).map(Number));if(p[0]==='usemtl')mat=p[1];if(p[0]==='f'){const verts=p.slice(1).map(v=>v.split('/').map(Number));for(let i=1;i<verts.length-1;i++)faces.push({mat,verts:[verts[0],verts[i],verts[i+1]]});}}const min=[0,1,2].map(k=>Math.min(...positions.map(p=>p[k]))),max=[0,1,2].map(k=>Math.max(...positions.map(p=>p[k]))),target={computerScreen:.65,computerKeyboard:.44,computerMouse:.075,laptop:.38}[name],scale=target/(max[0]-min[0]),byMat=new Map();for(const f of faces){if(!byMat.has(f.mat))byMat.set(f.mat,[]);for(const [v,,normal]of f.verts){const p=positions[v-1],n=normals[normal-1]||[0,1,0];byMat.get(f.mat).push([(p[0]-(min[0]+max[0])/2)*scale,(p[1]-min[1])*scale,(p[2]-(min[2]+max[2])/2)*scale,...n,0,0]);}}models[name]=[...byMat].map(([mat,v])=>({mesh:nativeMesh(name+'-'+mat,v),material:/dark/i.test(mat)?'Grafite':'Metal'}));}
for(const [name,width] of [['Drone',.64],['Headset',.27],['Impressora',.36]]){
  const source=fs.readFileSync(path.join(root,'Tools/TechModels',name+'.glb'));
  models[name]=readTechGlb(source,width).map(part=>{
    const key=name+'Importado'+part.index;
    const spec={color:part.color,smooth:part.smooth,metal:part.metal,emits:false};
    if(part.image){
      spec.tex=dir+'/Textures/'+key+'.'+part.image.format;
      write(spec.tex,part.image.bytes);
      meta(spec.tex,'TextureImporter','  serializedVersion: 13\n  mipmaps:\n    enableMipMap: 1\n    sRGBTexture: 1\n  maxTextureSize: 1024\n  textureType: 0\n');
    }
    specs[key]=spec;
    material(key,spec);
    return {mesh:nativeMesh(name+'-'+part.index,part.vertices),material:key};
  });
}
function model(name,parent,pos,yaw=0){const g=h.group(name,parent,pos,[1,1,1],yaw);for(const part of models[name]){const n=h.group(part.material,g),mf=h.alloc();n.components.push(mf);h.docs.push(`--- !u!33 &${mf}\nMeshFilter:\n${common}  m_GameObject: {fileID: ${n.go}}\n  m_Mesh: {fileID: 4300000, guid: ${part.mesh.guid}, type: 2}\n`);h.renderer(n,`{fileID: 2100000, guid: ${materials[part.material]}, type: 2}`);objects.push({node:n,vertices:part.mesh.vertices,material:part.material});}placements.push({name,position:pos,parent:parent.name});return g;}
const screenMesh=nativeMesh('TelaFrontal',[
  [-.5,-.3,0,0,0,-1,0,0],[-.5,.3,0,0,0,-1,0,1],[.5,.3,0,0,0,-1,1,1],
  [-.5,-.3,0,0,0,-1,0,0],[.5,.3,0,0,0,-1,1,1],[.5,-.3,0,0,0,-1,1,0],
]);
for(const theme of ['IA','Criacao','Imersao']){
  models['Tela demonstrativa - '+theme]=[{mesh:screenMesh,material:theme}];
}
function screen(parent,pos,w,theme){
  const display=model('Tela demonstrativa - '+theme,parent,pos);
  display.scale=[w,w,1];
}
const stations=[{name:'01 - Computacao e IA',position:[9.4,0,3.5],theme:'IA'},{name:'02 - Criacao digital',position:[9.4,0,7.8],theme:'Criacao'},{name:'03 - Experiencias imersivas',position:[14.2,0,7.8],theme:'Imersao'}];
for(const [index,s]of stations.entries()){const g=h.group(s.name,sceneRoot,s.position);shape('Base de apresentacao',g,[0,.914,0],[.93,.022,1.98],'Preto');shape('Filete ciano',g,[0,.929,-.99],[.93,.007,.012],'Led');
if(index<2){model('computerScreen',g,[0,.927,.50]);screen(g,[0,1.23,.439],.58,s.theme);model('computerKeyboard',g,[-.06,.927,.05]);model('computerMouse',g,[.31,.934,.05]);for(let row=0;row<4;row++)for(let col=0;col<12;col++)shape('Tecla',g,[-.25+col*.035,.955,-.015+row*.032],[.028,.007,.023],'Preto');
const pc=h.group('Workstation - gabinete',g,index===1?[-.23,0,-.64]:[-.03,.927,-.64]);shape('Chassi aluminio',pc,[0,.21,0],[.24,.42,.37],'Metal');shape('Painel frontal',pc,[0,.21,-.188],[.225,.40,.012],'Grafite');for(let n=0;n<14;n++)shape('Grade ventilacao',pc,[0,.10+n*.013,-.198],[.17,.004,.005],'Preto');shape('LED energia',pc,[.075,.37,-.201],[.009,.009,.004],'Led',10207);for(const x of [-.04,.015])shape('Porta USB',pc,[x,.36,-.201],[.026,.009,.004],'Preto');shape('Pe do gabinete',pc,[0,.009,0],[.25,.018,.36],'Preto');
}else{shape('Apoio para headset',g,[0,.958,-.38],[.19,.064,.13],'Preto');model('Headset',g,[0,.99,-.38],180);for(const side of [-1,1]){shape('Controle VR',g,[side*.28,.98,-.25],[.045,.10,.045],'Branco',10207);shape('Sensor do controle',g,[side*.28,1.05,-.25],[.065,.02,.065],'Grafite',10206);}h.prefab('Projector',g,[0,.927,.50],0,.85);}
if(index===1){const laptop=model('laptop',g,[0,.935,-.55]);}
shape('Placa tecnica',g,[0,1.04,-1.0],[.70,.18,.018],'Azul');h.text('Descricao',g,[0,1.04,-1.013],['IA / DADOS / COMPUTACAO','DESIGN / CRIACAO DIGITAL','VR / INTERACAO / PROJECAO'][index],.025);
}
// Fourth exhibit uses the existing fashion island footprint; no new floor furniture in walkways.
const wall=h.group('04 - Prototipagem e IoT',sceneRoot,[15.9,0,-.4],[1,1,1],90);shape('Balcao existente - acabamento tech',wall,[0,.45,0],[2.7,.90,1.40],'Azul');shape('Tampo de demonstracao',wall,[0,.92,0],[2.7,.04,1.40],'Madeira');shape('Painel de demonstracao',wall,[0,1.65,.62],[2.7,1.4,.06],'Grafite');screen(wall,[0,1.75,.58],1.9,'Criacao');
const printer=h.group('Impressora 3D - demonstracao',wall,[-.75,.94,0]);for(const x of [-.21,.21])for(const z of [-.20,.20])shape('Perfil de aluminio',printer,[x,.27,z],[.025,.54,.025],'Metal');for(const y of [.015,.54])for(const z of [-.2,.2])shape('Travessa',printer,[0,y,z],[.45,.025,.025],'Metal');shape('Mesa aquecida',printer,[0,.12,0],[.36,.025,.36],'Grafite');shape('Eixo do extrusor',printer,[0,.40,0],[.43,.025,.025],'Metal');shape('Cabeca extrusora',printer,[.03,.36,0],[.08,.08,.07],'Preto');shape('Peca em impressao',printer,[0,.205,0],[.13,.15,.13],'Ciano',10206);
model('Drone',wall,[.60,.94,.08],-18);model('Impressora',wall,[1.055,.94,-.46],-6);h.text('Titulo da ilha',wall,[0,2.42,.575],'PROTOTIPAGEM / IoT',.075);h.text('Legenda da ilha',wall,[0,.70,-.715],'Impressao 3D  |  Drone  |  Sensores',.035);
// Additional connected-device exhibits, fitted within the existing display surfaces.
const iot=h.group('Modulo IoT - demonstracao',wall,[0,.975,-.38]);
shape('Suporte acrilico',iot,[0,-.015,0],[.28,.03,.20],'Vidro');
shape('Placa de circuito',iot,[0,.008,0],[.20,.016,.12],'Ciano');
shape('Microcontrolador',iot,[0,.024,0],[.045,.018,.045],'Preto');
for(const side of [-1,1])for(let i=0;i<9;i++)shape('Pino de conexao',iot,[-.075+i*.018,.027,side*.05],[.005,.022,.005],'Metal');
shape('Conector USB do modulo',iot,[-.09,.023,0],[.035,.02,.026],'Metal');
h.text('Legenda IoT',wall,[0,1.045,-.50],'IoT / SENSORES',.018);
const vrStation=h.nodes.find(n=>n.name==='03 - Experiencias imersivas');
const router=h.group('Roteador de demonstracao',vrStation,[.28,.927,.10]);
shape('Corpo do roteador',router,[0,.025,0],[.24,.05,.15],'Branco');
for(const side of [-1,1])shape('Antena',router,[side*.08,.13,.055],[.012,.24,.012],'Grafite');
for(let i=0;i<4;i++)shape('Indicador de rede',router,[-.07+i*.025,.03,-.077],[.007,.007,.004],'Led');
for(const station of h.nodes.filter(n=>n.name==='01 - Computacao e IA'||n.name==='02 - Criacao digital'))shape('Mousepad',station,[.31,.929,.05],[.21,.004,.22],'Grafite');

// Attach the existing dynamic font material binder to new labels.
const binding=h.alloc();sceneRoot.components.push(binding);h.docs.push(`--- !u!114 &${binding}\nMonoBehaviour:\n${common}  m_GameObject: {fileID: ${sceneRoot.go}}\n  m_Enabled: 1\n  m_EditorHideFlags: 0\n  m_Script: {fileID: 11500000, guid: b4df089730b5fe970a6c99ee92120ec3, type: 3}\n  m_Name: \n  m_EditorClassIdentifier: \n  materialTemplate: {fileID: 2100000, guid: c0a3d5cc2de0ad9439462cce3a46ca3f, type: 2}\n`);
const hidden=[];
for(const name of ['Sebrae','MostruarioSebrae']){const p='Assets/Scenes/'+name+'.unity';let scene=read(p);const backup='Tools/TechBackup/'+name+'.unity.bak';if(!fs.existsSync(path.join(root,backup)))write(backup,scene);scene=scene.replace(/--- !u!\d+ &(240\d+)(?: stripped)?\n[\s\S]*?(?=--- !u!|$)/g,'').replace(/  - \{fileID: 240\d+\}\n/g,'');
const docs=[...scene.matchAll(/^--- !u!(\d+) &(\d+)[^\n]*\n([\s\S]*?)(?=^--- !u!|$(?![\s\S]))/gm)],gos=new Map(docs.filter(d=>d[1]==='1').map(d=>[d[2],d[3].match(/m_Name: (.*)/)?.[1]]));
for(const d of docs){if(d[1]!=='4')continue;const go=d[3].match(/m_GameObject: \{fileID: (\d+)/)?.[1],parent=d[3].match(/m_Father: \{fileID: (\d+)/)?.[1];if((gos.get(go)==='Produtos'&&['2000000006','2000000026','2000000046'].includes(parent))||gos.get(go)==='04 - Moda e identidade'){const re=new RegExp('(--- !u!1 &'+go+'\\n[\\s\\S]*?m_IsActive:) [01]');scene=scene.replace(re,'$1 0');hidden.push(go);}}
for(const [from,to]of [['OBJETOS & DESIGN','COMPUTACAO & IA'],['CRIACAO & SABERES','CRIACAO DIGITAL'],['IDEIAS & NEGOCIOS','EXPERIENCIAS IMERSIVAS']])scene=scene.replaceAll(from,to).replaceAll(from.replace(' & ','\\n&\\n'),to);
const at=scene.indexOf('--- !u!1660057539');if(at<0)throw Error('Missing SceneRoots');const roots=scene.slice(at).trimEnd()+`\n  - {fileID: ${sceneRoot.tr}}\n`;scene=scene.slice(0,at)+h.nodes.map(h.serialize).join('')+h.docs.join('')+roots;const ids=[...scene.matchAll(/^--- !u!\d+ &(\d+)/gm)].map(m=>m[1]);if(new Set(ids).size!==ids.length)throw Error('Duplicate IDs');write(p,scene);}
write('Tools/tech-expo-layout.json',JSON.stringify({stations,placements,objects:h.nodes.length,nativeMeshes:native,hiddenOriginalObjects:[...new Set(hidden)],rootId:sceneRoot.tr,source:'https://kenney.nl/assets/furniture-kit',license:'CC0',notes:'Local OBJ and downloaded static GLB hardware. See Assets/TechExpo/CREDITS.md. Screens are static.'},null,2));
exportTechReview({objects,stations,specs,write,read});
console.log(`TECH_EXPO_INSTALLED: ${h.nodes.length} objects, ${native.length} native mesh parts, ${placements.length} reused local computer models; both scenes saved and backed up.`);