import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8').replaceAll('\r\n','\n');
const layout=JSON.parse(read('Tools/tech-expo-layout.json'));
function assert(condition,message) {
  if(!condition) throw Error(message);
}
for(const name of ['IA','Criacao','Imersao']){
  const file=path.join(root,'Assets/TechExpo/Textures',name+'.png');
  assert(fs.statSync(file).size>1000,'Screen texture missing: '+name);
}
for(const mesh of layout.nativeMeshes){
  const asset=read(mesh.path);
  const n=Number(asset.match(/m_VertexCount: (\d+)/)[1]);
  const bytes=Buffer.from(asset.match(/_typelessdata: (\w+)/)[1],'hex');
  assert(n===mesh.vertices&&bytes.length===n*32,'Invalid vertex buffer: '+mesh.path);
  for(let i=0;i<bytes.length;i+=4) assert(Number.isFinite(bytes.readFloatLE(i)),'Invalid vertex: '+mesh.path);
}
for(const model of ['computerScreen','computerKeyboard','computerMouse','laptop','Drone','Headset','Impressora']){
  const parts=layout.nativeMeshes.filter(m=>m.path.includes('/'+model+'-'));
  assert(parts.length>0&&Math.abs(Math.min(...parts.map(m=>m.min[1])))<.001,'Model base is not grounded: '+model);
}
for(const name of ['Sebrae','MostruarioSebrae']){
  const scene=read('Assets/Scenes/'+name+'.unity');
  const docs=[...scene.matchAll(/^--- !u!(\d+) &(\d+)[^\n]*\n([\s\S]*?)(?=^--- !u!|$(?![\s\S]))/gm)];
  const ids=new Set(docs.map(d=>d[2]));
  assert(ids.size===docs.length,'Duplicate scene IDs: '+name);
  for(const object of ['Exposicao Tech - Sebraelab','Drone','Headset','Impressora','Placa do SebraeLab']){
    assert(scene.includes('  m_Name: '+object+'\n'),'Missing object in '+name+': '+object);
  }
  for(const d of docs.filter(x=>Number(x[2])>=2400000000&&Number(x[2])<2500000000)){
    for(const ref of d[3].matchAll(/\{fileID: (\d+)\}/g)){
      assert(ref[1]==='0'||ids.has(ref[1]),'Broken scene reference '+ref[1]);
    }
  }
}
console.log('TECH_EXPO_OK: '+layout.nativeMeshes.length+' mesh parts verified in both scenes.');
