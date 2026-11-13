import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),m=JSON.parse(read('Tools/campus-layout.json')),geo=JSON.parse(read('Tools/campus-review-geometry.json'));
const assert=(v,msg)=>{if(!v)throw Error(msg);},dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
assert(m.arches.length===8,'Arcade count');assert(m.referenceSign.raisedLetterPixels>500,'Raised letters missing');
function hit(origin,dir,a,b,c){const e1=sub(b,a),e2=sub(c,a),h=cross(dir,e2),d=dot(e1,h);if(Math.abs(d)<1e-8)return null;const inv=1/d,s=sub(origin,a),u=inv*dot(s,h);if(u<0||u>1)return null;const q=cross(s,e1),v=inv*dot(dir,q);if(v<0||u+v>1)return null;const t=inv*dot(e2,q);return t>=0?t:null;}
const stone=geo.filter(g=>g.section==='Multicenter - edificio principal'&&g.material==='Pedra');
for(const arch of m.arches)for(const y of [1,2.5,3.7]){const origin=[arch.center,y,arch.front-.25];for(const b of stone)for(let i=0;i<b.vertices.length;i+=3){const t=hit(origin,[0,0,1],b.vertices[i],b.vertices[i+1],b.vertices[i+2]);assert(t===null||t>.8,'Stone obstructs opening at '+arch.center);}}
const H=m.referenceSign.toPlane,P=m.referenceSign.toPhoto,project=(h,p)=>{const d=h[6]*p[0]+h[7]*p[1]+1;return[(h[0]*p[0]+h[1]*p[1]+h[2])/d,(h[3]*p[0]+h[4]*p[1]+h[5])/d];};
for(const p of m.referenceSign.blackPanelPhotoCorners){const roundTrip=project(P,project(H,p));assert(Math.hypot(roundTrip[0]-p[0],roundTrip[1]-p[1])<.001,'Reference mapping round-trip');}
const main=m.meshes.filter(x=>x.section==='Multicenter - edificio principal'),annex=m.meshes.filter(x=>x.section==='SebraeLab - anexo existente verde'),lo=Math.min(...main.map(x=>x.min[0])),hi=Math.max(...main.map(x=>x.max[0]));assert(hi-lo>77,'Main building too small');assert(Math.max(...main.map(x=>x.max[0]))<Math.min(...annex.map(x=>x.min[0])),'Main building overlaps annex');
// Front photograph checks: reversible UV mapping, smooth silhouette, raised logo and an open last arch.
assert(m.referenceFront&&m.referenceFront.profile.length>150,'Curved front profile missing');
assert(m.referenceFront.bracketPixels.length===6&&m.referenceFront.letterCells>1000,'Reference logo relief missing');
const F=m.referenceFront.toPlane,G=m.referenceFront.toPhoto;
for(const p of m.referenceFront.sourceCorners){const r=project(G,project(F,p));assert(Math.hypot(r[0]-p[0],r[1]-p[1])<.001,'Front reference UV round-trip');}
const tip=(m.referenceFront.tipLeft[0]+m.referenceFront.tipRight[0])/2;
assert(Math.abs(tip-(-45.2))<2,'Canopy tip must sit under the logo, rather than at its right edge');
assert(m.streetDetails.crosswalkStripes===10&&m.streetDetails.parkingBays===3,'New street markings absent');
const last=m.arches.at(-1),start=[last.center,2.5,last.front-.25];
for(const b of geo.filter(g=>g.section==='Multicenter - edificio principal'&&['Vidro','Caixilho'].includes(g.material)))for(let i=0;i<b.vertices.length;i+=3){const t=hit(start,[0,0,1],b.vertices[i],b.vertices[i+1],b.vertices[i+2]);assert(t===null||t>3,'Last arch should be an open passage');}
// Resolve every generated asset GUID, including textures/materials and native meshes.
const refs=new Map();function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const q=path.join(p,e.name);if(e.isDirectory())walk(q);else if(q.endsWith('.meta')){const g=fs.readFileSync(q,'utf8').match(/^guid: (\w+)/m)?.[1];if(g)refs.set(g,q.slice(0,-5));}}}walk(path.join(root,'Assets'));
for(const [name,g]of Object.entries(m.materials))assert(refs.has(g),'Material GUID '+name);for(const mesh of m.meshes)assert(refs.has(mesh.guid),'Mesh GUID '+mesh.path);
for(const mesh of m.meshes){const pathMat=refs.get(m.materials[mesh.material]),s=fs.readFileSync(pathMat,'utf8');for(const ref of s.matchAll(/m_Texture: \{fileID: [^,]+, guid: (\w+)/g))assert(refs.has(ref[1])&&fs.existsSync(refs.get(ref[1])),'Missing texture '+ref[1]);}
console.log(`CAMPUS_REFERENCE_OK: eight arch openings unobstructed; main width ${(hi-lo).toFixed(1)} m; annex separate; photo UV round-trip <0.001 px; ${m.referenceSign.raisedLetterPixels} raised letter cells; all generated material/texture/mesh GUIDs resolved.`);