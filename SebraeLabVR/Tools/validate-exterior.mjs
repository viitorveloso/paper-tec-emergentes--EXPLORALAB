import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('SebraeLabVR');
const vec=(s,k)=>{const m=s.match(new RegExp(k+': \\{([^}]+)\\}'));return m?[...m[1].matchAll(/[xyzw]: ([^,}]+)/g)].map(x=>Number(x[1])):null;};
const refs=new Set();
function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const q=path.join(p,e.name);if(e.isDirectory())walk(q);else if(q.endsWith('.meta')){const m=fs.readFileSync(q,'utf8').match(/^guid: (\w+)/m);if(m)refs.add(m[1]);}}}
for(const dir of ['Assets','Library/PackageCache'])walk(path.join(root,dir));
for(const name of ['Sebrae','MostruarioSebrae']){
 const s=fs.readFileSync(path.join(root,`Assets/Scenes/${name}.unity`),'utf8');
 const docs=[...s.matchAll(/^--- !u!(\d+) &(\d+)([^\n]*)\n([\s\S]*?)(?=^--- !u!|$(?![\s\S]))/gm)];
 const ids=new Set(docs.map(d=>d[2]));if(ids.size!==docs.length)throw Error('IDs repetidos');
 for(const m of s.matchAll(/guid: ([a-f0-9]{32})/g))if(!/^0{16}/.test(m[1])&&!refs.has(m[1]))throw Error('Asset ausente '+m[1]);
 const names=new Map(),transforms=new Map(),byGO=new Map();
 for(const [,type,id,,b] of docs){
  if(type==='1')names.set(id,b.match(/m_Name: (.*)/)?.[1]);
  if(type==='4'&&b.includes('m_LocalPosition:')){const t={id,go:b.match(/m_GameObject: \{fileID: (\d+)/)[1],parent:b.match(/m_Father: \{fileID: (\d+)/)[1],p:vec(b,'m_LocalPosition'),q:vec(b,'m_LocalRotation'),scale:vec(b,'m_LocalScale')};transforms.set(id,t);byGO.set(t.go,t);}
 }
 const stands=[...names.values()].filter(n=>/^Stand \d+ - Empreendedor/.test(n));if(stands.length!==8)throw Error('Esperados 8 stands');
 function point(p,t){if(!t)return p;const [x,y,z,w]=t.q;const v=p.map((n,i)=>n*t.scale[i]);const uv=[y*v[2]-z*v[1],z*v[0]-x*v[2],x*v[1]-y*v[0]],uuv=[y*uv[2]-z*uv[1],z*uv[0]-x*uv[2],x*uv[1]-y*uv[0]];return point(v.map((n,i)=>n+2*(w*uv[i]+uuv[i])+t.p[i]),transforms.get(t.parent));}
 const boxes=[];
 for(const [,type,id,,b] of docs){if(type!=='65'||!id.startsWith('210'))continue;const go=b.match(/m_GameObject: \{fileID: (\d+)/)[1],t=byGO.get(go);const size=vec(b,'m_Size'),center=vec(b,'m_Center');const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let mask=0;mask<8;mask++){const v=point(center.map((n,i)=>n+(((mask>>i)&1)?1:-1)*size[i]/2),t);v.forEach((n,i)=>{min[i]=Math.min(min[i],n);max[i]=Math.max(max[i],n);});}boxes.push({name:names.get(go),min,max,teleport:t.parent==='2000000066'});}
 const areas=boxes.filter(b=>b.teleport);if(areas.filter(a=>!a.name.startsWith('Chegada -')&&a.name!=='Circulacao do corredor interno').length!==6)throw Error('Esperadas 6 areas externas');
 for(const area of areas)for(const box of boxes){if(box.teleport||box.max[1]<.08||box.min[1]>1.85)continue;const hit=[0,2].every(i=>Math.min(area.max[i],box.max[i])-Math.max(area.min[i],box.min[i])>.01);if(hit)throw Error(`Teleporte ${area.name} cruza ${box.name}`);}
 console.log(`${name}: 8 stands, ${areas.length} areas de circulacao, referencias validas, IDs unicos; areas de teleporte livres dos novos volumes.`);
}