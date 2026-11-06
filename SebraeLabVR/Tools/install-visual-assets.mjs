import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root=path.resolve('SebraeLabVR');const read=p=>fs.readFileSync(path.join(root,p),'utf8');const write=(p,s)=>fs.writeFileSync(path.join(root,p),s);const guid=p=>crypto.createHash('md5').update('SebraeVisual/'+p).digest('hex');
function meta(p,importer,extra=''){write(p+'.meta',`fileFormatVersion: 2\nguid: ${guid(p)}\n${importer}:\n  externalObjects: {}\n${extra}  userData: \n  assetBundleName: \n  assetBundleVariant: \n`);return guid(p);}
const shader='Assets/Mostruario/Shaders/SebraeSignText.shader';const shaderGuid=meta(shader,'ShaderImporter');
const script='Assets/Mostruario/Scripts/SebraeSignMaterials.cs';const scriptGuid=meta(script,'MonoImporter','  serializedVersion: 2\n  defaultReferences: []\n  executionOrder: 0\n');
const sign='Assets/Mostruario/Materials/SebraeSignText.mat';write(sign,`%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!21 &2100000\nMaterial:\n  serializedVersion: 8\n  m_ObjectHideFlags: 0\n  m_Name: SebraeSignText\n  m_Shader: {fileID: 4800000, guid: ${shaderGuid}, type: 3}\n  m_ValidKeywords: []\n  m_InvalidKeywords: []\n  m_LightmapFlags: 4\n  m_EnableInstancingVariants: 0\n  m_DoubleSidedGI: 1\n  m_CustomRenderQueue: 3000\n  stringTagMap:\n    RenderType: Transparent\n  disabledShaderPasses: []\n  m_SavedProperties:\n    serializedVersion: 3\n    m_TexEnvs:\n    - _MainTex:\n        m_Texture: {fileID: 0}\n        m_Scale: {x: 1, y: 1}\n        m_Offset: {x: 0, y: 0}\n    m_Ints: []\n    m_Floats: []\n    m_Colors:\n    - _Color: {r: 1, g: 1, b: 1, a: 1}\n`);const signGuid=meta(sign,'NativeFormatImporter','  mainObjectFileID: 2100000\n');
const texRoot='Assets/Mostruario/Textures';fs.mkdirSync(path.join(root,texRoot),{recursive:true});
const textureGuids={};
for(const asset of ['Wood051','Fabric030'])for(const suffix of ['Color','NormalGL']){
 const name=`${asset}_1K-JPG_${suffix}.jpg`,target=`${texRoot}/${name}`;fs.copyFileSync(path.join(root,`Tools/Downloads/${asset}_1K-JPG/${name}`),path.join(root,target));
 textureGuids[`${asset}_${suffix}`]=meta(target,'TextureImporter',`  serializedVersion: 13\n  mipmaps:\n    enableMipMap: 1\n    sRGBTexture: ${suffix==='Color'?1:0}\n  isReadable: 0\n  textureType: ${suffix==='Color'?0:1}\n  maxTextureSize: 1024\n  textureSettings:\n    serializedVersion: 2\n    filterMode: 1\n    aniso: 2\n    mipBias: 0\n    wrapU: 0\n    wrapV: 0\n    wrapW: 0\n`);
}
write('Tools/downloaded-textures.json',JSON.stringify(textureGuids,null,2));
let s=read('Tools/refine-showroom.mjs');
if(!s.includes('SebraeSignMaterials')){
 s=s.replace("renderer(n,'{fileID: 10302, guid: 0000000000000000e000000000000000, type: 0}');",`renderer(n,'{fileID: 2100000, guid: ${signGuid}, type: 2}');`);
 const binder=`\n// SebraeSignMaterials substitui o material de texto antigo pelo shader URP com atlas da fonte.\nconst signBinding=id++;showroom.components.push(signBinding);\ndocs.push('--- !u!114 &'+signBinding+'\\nMonoBehaviour:\\n'+common+'  m_GameObject: {fileID: '+showroom.go+'}\\n  m_Enabled: 1\\n  m_EditorHideFlags: 0\\n  m_Script: {fileID: 11500000, guid: ${scriptGuid}, type: 3}\\n  m_Name: \\n  m_EditorClassIdentifier: \\n  materialTemplate: {fileID: 2100000, guid: ${signGuid}, type: 2}\\n');\n`;
 s=s.replace('function serialize(n){',binder+'\nfunction serialize(n){');
 const textureCode=String.raw`
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
`;
 s=s.replace('let id=2100000000;',textureCode+'\nlet id=2100000000;');
 write('Tools/refine-showroom.mjs',s);
}
console.log('Shader URP, material de sinalizacao, controlador da fonte e quatro mapas 1K instalados.');