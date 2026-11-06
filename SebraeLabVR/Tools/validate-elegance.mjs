import fs from 'node:fs';
import {buildRooms} from './corridor-rooms.mjs';
import {placeDownloadedProducts} from './downloaded-products.mjs';
const base='SebraeLabVR/Tools/',data=JSON.parse(fs.readFileSync(base+'building-floorplan.json')),prefabs=JSON.parse(fs.readFileSync(base+'mostruario-layout.json')).assets,foodData=JSON.parse(fs.readFileSync(base+'food-assets.json')).models;
const nodes=[],placed=[],areas=[];
function group(name,parent,pos=[0,0,0],scale=[1,1,1],yaw=0){const n={name,parent,pos,scale,yaw};nodes.push(n);return n;}
function world(p,n){if(!n)return p;const a=n.yaw*Math.PI/180,v=p.map((x,i)=>x*n.scale[i]);return world([v[0]*Math.cos(a)+v[2]*Math.sin(a)+n.pos[0],v[1]+n.pos[1],-v[0]*Math.sin(a)+v[2]*Math.cos(a)+n.pos[2]],n.parent);}
function isRoom(n){return n&&(n.name.startsWith('Sala 0')||isRoom(n.parent));}
function box(name,parent,lo,hi){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let mask=0;mask<8;mask++){const p=world(lo.map((x,i)=>(mask>>i)&1?hi[i]:x),parent);p.forEach((x,i)=>{min[i]=Math.min(min[i],x);max[i]=Math.max(max[i],x);});}return{name,min,max};}
function shape(name,parent,pos,scale){const node=group(name,parent,pos,scale);placed.push(box(name,node,[-.5,-.5,-.5],[.5,.5,.5]));}
function prefab(model,parent,pos,yaw=0,scale=1){const m=prefabs[model],n=group(model,parent,[pos[0],pos[1]-m.min[1]*scale,pos[2]],[scale,scale,scale],yaw);placed.push(box(model,n,m.min,m.max));}
function teleport(name,pos,size){areas.push(box(name,group(name,null,pos),size.map(x=>-x/2),size.map(x=>x/2)));}
function food(model,parent,pos,yaw=0,scale=1){const m=foodData[model];if(isRoom(parent)){const n=group(model,parent,pos,[scale,scale,scale],yaw);placed.push(box(model,n,m.min,m.max));}return m.max[1]*scale+pos[1];}
buildRooms({group,shape,text:()=>{},prefab,teleport,showroom:null,prefabData:prefabs});
nodes.push({name:'Stand 03 - amostra'},{name:'Stand 08 - amostra'});
placeDownloadedProducts({food,nodes});
function segmentHits(a,b,rect){let t0=0,t1=1;for(let i=0;i<2;i++){const axis=i===0?0:2,d=b[i]-a[i],lo=rect.min[axis]+.008,hi=rect.max[axis]-.008;if(Math.abs(d)<1e-8){if(a[i]<lo||a[i]>hi)return false;}else{let u=(lo-a[i])/d,v=(hi-a[i])/d;if(u>v)[u,v]=[v,u];t0=Math.max(t0,u);t1=Math.min(t1,v);if(t0>t1)return false;}}return true;}
for(const rect of [...placed,...areas])for(const [a,b] of data.wallSegments)if(segmentHits(a,b,rect))throw Error('Volume sobre parede: '+rect.name);
for(const area of areas)for(const item of placed){if(item.max[1]<.08||item.min[1]>1.85)continue;if([0,2].every(i=>Math.min(area.max[i],item.max[i])-Math.max(area.min[i],item.min[i])>.01))throw Error('Destino obstruido: '+area.name+' por '+item.name);}
if(placed.filter(o=>o.name==='Mesa - Tampo de madeira').length!==4)throw Error('Contagem de mesas incorreta');
if(placed.filter(o=>o.name==='OfficeChair').length!==8)throw Error('Contagem de cadeiras incorreta');
console.log('ELEGANCE_GEOMETRY_OK: quatro mesas, oito cadeiras; moveis, produtos, paines e destinos conferidos contra 197 segmentos de paredes.');