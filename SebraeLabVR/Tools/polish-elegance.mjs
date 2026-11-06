import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';const root='SebraeLabVR/';
for(const n of ['Sebrae','MostruarioSebrae'])fs.copyFileSync(root+`Assets/Scenes/${n}.unity`,root+`Tools/${n}.before-elegance.bak`);
const p=root+'Tools/refine-showroom.mjs';let s=fs.readFileSync(p,'utf8');
if(!s.includes('PisoNeutro'))s=s.replace("Tapete:[.13,.21,.28]","Tapete:[.13,.21,.28],PisoNeutro:[.58,.57,.53],LuzQuente:[.94,.77,.48]");
// Ajustes persistentes nos materiais copiados do pacote; assets de terceiros preservados.
const finishes=String.raw`
for(const name of ['GradientRed','GradientDarkRed']){
 const p='Assets/Mostruario/Materials/(Mat)'+name+'.mat';let material=read(p);
 material=material.replace(/m_Texture: \{fileID: 2800000, guid: \w+, type: 3\}/g,'m_Texture: {fileID: 0}');
 for(const key of ['_BaseColor','_Color'])material=material.replace(new RegExp('- '+key+': \\{[^}]+\\}'),'- '+key+': {r: 0.085, g: 0.13, b: 0.18, a: 1}');
 write(p,material);
}
// Luz quente discreta nas luminarias cenograficas.
let led=read('Assets/Mostruario/Materials/ShowroomLuzQuente.mat').replace('m_ValidKeywords: []','m_ValidKeywords:\n  - _EMISSION').replace(/- _EmissionColor: \{[^}]+\}/,'- _EmissionColor: {r: 1.5, g: 1.1, b: 0.65, a: 1}');
write('Assets/Mostruario/Materials/ShowroomLuzQuente.mat',led);
`;
if(!s.includes('Luz quente discreta'))s=s.replace('let id=2100000000;',finishes+'\nlet id=2100000000;');
const lights=String.raw`
const lighting=group('Iluminacao - Galeria',showroom);
for(const [x,z] of [[9.5,-4.55],[9.5,-7.3],[9.7,-11.7],[14.2,-11.7]]){
 const n=group('Luz de exposicao',lighting,[x,2.43,z]),lid=id++;n.components.push(lid);
 docs.push('--- !u!108 &'+lid+'\nLight:\n'+common+'  m_GameObject: {fileID: '+n.go+'}\n  m_Enabled: 1\n  serializedVersion: 11\n  m_Type: 2\n  m_Shape: 0\n  m_Color: {r: 1, g: 0.93, b: 0.82, a: 1}\n  m_Intensity: 1.35\n  m_Range: 4.2\n  m_SpotAngle: 30\n  m_InnerSpotAngle: 21.8\n  m_CookieSize: 10\n  m_Shadows:\n    m_Type: 0\n  m_Cookie: {fileID: 0}\n  m_DrawHalo: 0\n  m_Flare: {fileID: 0}\n  m_RenderMode: 0\n  m_CullingMask:\n    serializedVersion: 2\n    m_Bits: 4294967295\n  m_RenderingLayerMask: 1\n  m_Lightmapping: 4\n  m_LightShadowCasterMode: 0\n  m_AreaSize: {x: 1, y: 1}\n  m_BounceIntensity: 1\n  m_ColorTemperature: 5000\n  m_UseColorTemperature: 0\n');
 shape('Luminaria de exposicao',lighting,[x,2.47,z],[.70,.025,.08],'LuzQuente',10202,false);
}
`;
if(!s.includes('Iluminacao - Galeria'))s=s.replace('// SebraeSignMaterials substitui',lights+'\n// SebraeSignMaterials substitui');
fs.writeFileSync(p,s);