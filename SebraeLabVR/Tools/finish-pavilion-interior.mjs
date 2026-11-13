import fs from 'node:fs';const p='SebraeLabVR/Tools/install-pavilion-interior.mjs';let s=fs.readFileSync(p,'utf8');
if(!s.includes('const batchStarts=')){
 s=s.replace('const cz=-5+row*8,num=booths.length+1;','const cz=-5+row*8,num=booths.length+1,batchStarts=new Map([...batches].map(([k,v])=>[k,v.vertices.length])),physicalStart=physical.length,nodeStart=h.nodes.length;');
 const marker='booths.push({number:num,center:[cx,cz],min:[cx-3,.15,cz-2.5],max:[cx+3,3.21,cz+2.5]});';
 const rotate=String.raw`const angle=(column===0?-90:90)*Math.PI/180,co=Math.cos(angle),si=Math.sin(angle),turn=p=>[cx+(p[0]-cx)*co+(p[2]-cz)*si,p[1],cz-(p[0]-cx)*si+(p[2]-cz)*co];
 for(const [key,b]of batches)for(let i=batchStarts.get(key)||0;i<b.vertices.length;i++){const v=b.vertices[i],p=turn(v),nx=v[3]*co+v[5]*si,nz=-v[3]*si+v[5]*co;v[0]=p[0];v[2]=p[2];v[3]=nx;v[5]=nz;}
 for(let i=physicalStart;i<physical.length;i++){const b=physical[i],corners=[];for(let mask=0;mask<8;mask++)corners.push(turn(b.min.map((v,k)=>(mask>>k)&1?b.max[k]:v)));b.min=[0,1,2].map(k=>Math.min(...corners.map(p=>p[k])));b.max=[0,1,2].map(k=>Math.max(...corners.map(p=>p[k])));}
 for(let i=nodeStart;i<h.nodes.length;i++){h.nodes[i].pos=turn(h.nodes[i].pos);h.nodes[i].yaw+=column===0?-90:90;}
 booths.push({number:num,center:[cx,cz],min:[cx-2.5,.15,cz-3],max:[cx+2.5,3.21,cz+3],facesCentralAisle:true});`;
 if(!s.includes(marker))throw Error('Stand patch target absent');s=s.replace(marker,rotate);
}
if(!s.includes('Clerestorios laterais'))s=s.replace('// White moulded event chair',String.raw`// Clerestorios laterais between the masonry shell and the roof eaves.
for(const x of [-73.12,4.10]){box('Vidro',[x,7.13,6.3],[.075,1.95,40.4]);for(let z=-13.5;z<27;z+=3)box('EstruturaAzul',[x,7.13,z],[.11,1.98,.06]);for(const y of [6.16,8.10])box('EstruturaAzul',[x,y,6.3],[.12,.075,40.5]);}
box('Creme',[-34.5,4.03,27.54],[76,.43,.16]);box('Vidro',[-34.5,7.13,27.48],[76,1.95,.065]);for(let x=-72;x<3;x+=3)box('EstruturaAzul',[x,7.13,27.40],[.06,1.98,.10]);
// White moulded event chair`);
const reviewOld="write('Tools/pavilion-review-geometry.json',JSON.stringify([...batches.values()]));write('Tools/pavilion-review-specs.json',JSON.stringify(specs));";
if(s.includes(reviewOld))s=s.replace(reviewOld,"const reviewBatches=[...batches.values()];for(const b of geo.filter(b=>b.section==='Multicenter - edificio principal')){const key='Shell_'+b.material;specs[key]=campus.specs[b.material];reviewBatches.push({...b,material:key});}write('Tools/pavilion-review-geometry.json',JSON.stringify(reviewBatches));write('Tools/pavilion-review-specs.json',JSON.stringify(specs));");
fs.writeFileSync(p,s);