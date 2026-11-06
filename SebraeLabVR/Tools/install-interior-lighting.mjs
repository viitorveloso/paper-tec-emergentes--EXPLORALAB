import fs from 'node:fs';const root='SebraeLabVR/';
for(const scene of ['Sebrae','MostruarioSebrae'])fs.copyFileSync(root+`Assets/Scenes/${scene}.unity`,root+`Tools/${scene}.before-chandelier.bak`);
let s=fs.readFileSync(root+'Tools/refine-showroom.mjs','utf8');
if(s.includes('buildInteriorLighting'))throw Error('Lustre ja instalado');
s="import { buildInteriorLighting } from './interior-lighting.mjs';\n"+s;
s=s.replace('LuzQuente:[.94,.77,.48]','LuzQuente:[.94,.77,.48],MetalLustre:[.48,.38,.23]');
s=s.replace("let id=2100000000;", "let metal=read('Assets/Mostruario/Materials/ShowroomMetalLustre.mat').replace('- _Metallic: 0','- _Metallic: 0.65').replace('- _Smoothness: 0.28','- _Smoothness: 0.5');\nwrite('Assets/Mostruario/Materials/ShowroomMetalLustre.mat',metal);\nlet id=2100000000;");
s=s.replace("m_LocalRotation: ${vec([0,Math.sin(a),0,Math.cos(a)],'xyzw')}","m_LocalRotation: ${vec(n.rotation??[0,Math.sin(a),0,Math.cos(a)],'xyzw')}");
s=s.replace('m_Intensity: 1.35','m_Intensity: 0.45');
const helpers=String.raw`
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
`;
s=s.replace('// SebraeSignMaterials substitui',helpers+'\n// SebraeSignMaterials substitui');
fs.writeFileSync(root+'Tools/refine-showroom.mjs',s);
let finish=fs.readFileSync(root+'Assets/Mostruario/Editor/SebraeSceneFinishing.cs','utf8');
finish=finish.replace('        private static void OrganizeBuilding(GameObject root)\n        {','        private static void OrganizeBuilding(GameObject root)\n        {\n            foreach(var light in root.GetComponentsInChildren<Light>(true))\n            {\n                light.enabled=false;\n                PrefabUtility.RecordPrefabInstancePropertyModifications(light);\n            }');
fs.writeFileSync(root+'Assets/Mostruario/Editor/SebraeSceneFinishing.cs',finish);
const perf=root+'Assets/Settings/Project Configuration/Performance URP Config.asset';let config=fs.readFileSync(perf,'utf8').replace('m_AdditionalLightsRenderingMode: 0','m_AdditionalLightsRenderingMode: 1').replace('m_AdditionalLightsPerObjectLimit: 1','m_AdditionalLightsPerObjectLimit: 4');fs.writeFileSync(perf,config);