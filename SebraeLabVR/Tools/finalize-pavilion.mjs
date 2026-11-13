import fs from 'node:fs';const p='SebraeLabVR/Tools/install-pavilion-interior.mjs';let s=fs.readFileSync(p,'utf8');
s=s.replace("points:[[-46.5,-9],[-21,-9],[-21,18]]","points:[[-46.5,-9],[-41.5,-9],[-41.5,-7.8],[-21,-7.8],[-21,18]]");
if(!s.includes('const navAreas=')){
 const insert=String.raw`const navAreas=[{name:'Entrada do Multicenter',p:[-46.5,.168,-12],s:[2,.008,1.5]},{name:'Corredor oeste',p:[-57,.168,7],s:[2.4,.008,32]},{name:'Plateia central',p:[-21,.168,5],s:[2.4,.008,25]},{name:'Galeria lateral leste',p:[-1.5,.168,6],s:[2,.008,24]},{name:'Travessia frontal oeste',p:[-49.3,.168,-9],s:[15.4,.008,1]},{name:'Travessia frontal leste',p:[-21,.168,-7.8],s:[38,.008,1]}],navIds=[];
for(const area of navAreas){const n=h.group('Teleporte - '+area.name,hall,area.p),id=h.alloc();navIds.push(id);n.components.push(id);h.docs.push('--- !u!65 &'+id+'\nBoxCollider:\n'+common+'  m_GameObject: {fileID: '+n.go+'}\n  m_Material: {fileID: 0}\n  m_IsTrigger: 0\n  m_Enabled: 1\n  serializedVersion: 3\n  m_Size: '+vec(area.s)+'\n  m_Center: {x: 0, y: 0, z: 0}\n');}
const navigation=h.alloc();hall.components.push(navigation);h.docs.push('--- !u!114 &'+navigation+'\nMonoBehaviour:\n'+common+'  m_GameObject: {fileID: '+hall.go+'}\n  m_Enabled: 1\n  m_EditorHideFlags: 0\n  m_Script: {fileID: 11500000, guid: 1fa384ce2e6440e394132133895468a0, type: 3}\n  m_Name: \n  m_EditorClassIdentifier: \n  destinations:\n'+navIds.map(id=>'  - {fileID: '+id+'}\n').join(''));
`;
 s=s.replace('const binding=h.alloc();',insert+'\nconst binding=h.alloc();');s=s.replace('JSON.stringify({chairs,conferenceChairs:240','JSON.stringify({navAreas,chairs,conferenceChairs:240');
}
s=s.replace("renderer=renderer.slice(0,calls)+", "renderer=renderer.replace('.53+.47*Math.max(0,dot(n,light))','.86+.14*Math.max(0,dot(n,light))').replace('shade*=.68','shade*=.88');renderer=renderer.slice(0,calls)+");
// Slicing must use the marker position after the lighting replacement, whose length changes.
s=s.replace("renderer=renderer.slice(0,calls)+", "renderer=renderer.slice(0,renderer.indexOf(\"render('campus-geometria'\"))+");
fs.writeFileSync(p,s);