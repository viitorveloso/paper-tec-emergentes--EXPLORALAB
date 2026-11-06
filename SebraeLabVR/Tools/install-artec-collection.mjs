import fs from 'node:fs';const root='SebraeLabVR/';
for(const scene of ['Sebrae','MostruarioSebrae'])fs.copyFileSync(root+`Assets/Scenes/${scene}.unity`,root+`Tools/${scene}.before-artec.bak`);
let s=fs.readFileSync(root+'Tools/refine-showroom.mjs','utf8');if(s.includes('placeArtecCollection'))throw Error('Colecao ja instalada');
s="import { placeArtecCollection } from './artec-collection.mjs';\n"+s;
const helpers=String.raw`
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
`;
s=s.replace('// SebraeSignMaterials substitui',helpers+'\n// SebraeSignMaterials substitui');fs.writeFileSync(root+'Tools/refine-showroom.mjs',s);
let landscape=fs.readFileSync(root+'Tools/landscaping.mjs','utf8').replace("  prefab('DeskPlant',pot,[0,0,0],p.yaw,p.scale);","  if(!p.name.startsWith('Vaso junto a porta principal'))prefab('DeskPlant',pot,[0,0,0],p.yaw,p.scale);");fs.writeFileSync(root+'Tools/landscaping.mjs',landscape);
let rooms=fs.readFileSync(root+'Tools/corridor-rooms.mjs','utf8').replace("prefab('CoffePot',station,[-.19,.951,-.58],-15,.95);",'');
rooms=rooms.replace("  prefab(x===0?'DeskPlant':x<0?'CoffePot':'Mug',display,[x,h+.025,0],0,x===0?1.3:1);","  if(x===0)prefab('DeskPlant',display,[x,h+.025,0],0,1.3);");fs.writeFileSync(root+'Tools/corridor-rooms.mjs',rooms);