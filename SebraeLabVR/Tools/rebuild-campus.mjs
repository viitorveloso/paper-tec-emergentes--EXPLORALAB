import { buildFrontReference, addFrontStreet } from './campus-front-reference.mjs';
import { detailedSign } from './campus-reference-detail.mjs';
// Rebuilds only the campus exterior; the existing lab, interiors and XR rig are retained.
// Node 22+, run from repository root. Backups are created once in Tools/CampusBackup.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replaceAll('\r\n','\n');
const write=(p,s)=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),s);};
const guid=p=>crypto.createHash('md5').update('SebraeCampus2026/'+p).digest('hex');
const num=x=>Number(x.toFixed(6));
const vec=(v,keys='xyz')=>'{'+v.map((x,i)=>`${keys[i]}: ${num(x)}`).join(', ')+'}';
const meta=(p,type='NativeFormatImporter',extra='  mainObjectFileID: 4300000\n')=>write(p+'.meta',`fileFormatVersion: 2\nguid: ${guid(p)}\n${type}:\n  externalObjects: {}\n${extra}  userData: \n  assetBundleName: \n  assetBundleVariant: \n`);
const assetDir='Assets/CampusSebrae';
for(const dir of [assetDir,assetDir+'/Meshes',assetDir+'/Materials',assetDir+'/Textures',assetDir+'/Editor']){fs.mkdirSync(path.join(root,dir),{recursive:true});write(dir+'.meta',`fileFormatVersion: 2\nguid: ${guid(dir)}\nfolderAsset: yes\nDefaultImporter:\n  externalObjects: {}\n  userData: \n  assetBundleName: \n  assetBundleVariant: \n`);}
// A small deterministic PNG encoder keeps this tool dependency-free.
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
const crc=b=>{let c=0xffffffff;for(const x of b)c=crcTable[(c^x)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
function png(w,h,pixels){const chunk=(name,b)=>{const tag=Buffer.from(name),v=Buffer.alloc(b.length+12);v.writeUInt32BE(b.length);tag.copy(v,4);b.copy(v,8);v.writeUInt32BE(crc(Buffer.concat([tag,b])),b.length+8);return v;};const ih=Buffer.alloc(13);ih.writeUInt32BE(w);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;const raw=Buffer.alloc(h*(w*4+1));for(let y=0;y<h;y++)pixels.copy(raw,y*(w*4+1)+1,y*w*4,(y+1)*w*4);return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);}
let seed=32186;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const textureInfo={};
function texture(name,kind){const w=512,h=512,b=Buffer.alloc(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let value=1;const grain=(rand()-.5);if(kind==='stone'){value=.95+grain*.045+Math.sin(x*.095+y*.032)*.025;if(x%128<1||y%128<1)value=.71;}if(kind==='stucco')value=.97+grain*.04;if(kind==='asphalt')value=.86+grain*.10+(rand()>.986?.21:0);if(kind==='grass')value=.88+grain*.10+Math.sin(x*.7+y*.6)*.06;if(kind==='rib')value=.98+grain*.022;const v=Math.max(0,Math.min(255,Math.round(value*255))),i=(y*w+x)*4;b[i]=b[i+1]=b[i+2]=v;b[i+3]=255;}const p=`${assetDir}/Textures/${name}.png`;write(p,png(w,h,b));textureMeta(p);textureInfo[name]={path:p,width:w,height:h};return p;}
function textureMeta(p,alpha=false){write(p+'.meta',`fileFormatVersion: 2\nguid: ${guid(p)}\nTextureImporter:\n  externalObjects: {}\n  serializedVersion: 13\n  mipmaps:\n    enableMipMap: 1\n    sRGBTexture: 1\n  isReadable: 0\n  textureType: 0\n  alphaIsTransparency: ${alpha?1:0}\n  maxTextureSize: 2048\n  textureSettings:\n    serializedVersion: 2\n    filterMode: 1\n    aniso: 4\n    mipBias: 0\n    wrapU: ${alpha?1:0}\n    wrapV: ${alpha?1:0}\n    wrapW: 0\n  userData: \n  assetBundleName: \n  assetBundleVariant: \n`);}
const tex={stone:texture('PedraCinza','stone'),green:texture('Reboco','stucco'),asphalt:texture('Asfalto','asphalt'),grass:texture('Grama','grass'),yellow:texture('ChapaAmarela','rib')};
const specs={
 Pedra:{color:[.76,.72,.68],tex:tex.stone,smooth:.12}, Amarelo:{color:[1,.76,.19],tex:tex.yellow,smooth:.24}, VerdeLab:{color:[.48,.65,.09],tex:tex.green,smooth:.07},
 Concreto:{color:[.71,.70,.67],tex:tex.stone,smooth:.12}, Branco:{color:[.93,.94,.92],smooth:.38}, CinzaDobras:{color:[.54,.57,.56],smooth:.4},
 Vidro:{color:[.14,.25,.30],smooth:.88,metal:.35}, Caixilho:{color:[.07,.085,.08],smooth:.45,metal:.5}, Azulejo:{color:[.22,.27,.27],tex:tex.stone,smooth:.5},
 Asfalto:{color:[.22,.23,.235],tex:tex.asphalt,smooth:.02}, Grama:{color:[.35,.46,.15],tex:tex.grass,smooth:.02}, Terra:{color:[.29,.23,.15],smooth:.02},
 Folhas:{color:[.20,.34,.10],smooth:.12}, FolhasClaras:{color:[.33,.43,.12],smooth:.15}, Tronco:{color:[.42,.36,.26],smooth:.03},
 Flores:{color:[.82,.19,.07],smooth:.15}, AzulCorrimao:{color:[.025,.22,.43],smooth:.45,metal:.38}, PretoPlaca:{color:[.018,.023,.02],smooth:.84,metal:.25},
 FaixaAmarela:{color:[.95,.64,.08],smooth:.05}, Aco:{color:[.34,.36,.35],smooth:.6,metal:.85}, Madeira:{color:[.24,.15,.08],smooth:.12},
 AzulVaga:{color:[.025,.27,.48],smooth:.08}, Terracota:{color:[.65,.30,.12],smooth:.12}, Luz:{color:[.95,.92,.78],smooth:.4}, LetrasAzuis:{color:[.045,.09,.18],smooth:.2}
};
const materials={};const materialTemplate=read('Assets/Mostruario/Materials/ShowroomBranco.mat');
for(const [name,spec] of Object.entries(specs)){
 const p=`${assetDir}/Materials/${name}.mat`;let s=materialTemplate.replace('m_Name: ShowroomBranco','m_Name: Campus'+name);
 for(const key of ['_BaseColor','_Color'])s=s.replace(new RegExp(`- ${key}: \\{[^}]+\\}`),`- ${key}: ${vec([...spec.color,1],'rgba')}`);
 for(const [key,value] of [['_Smoothness',spec.smooth],['_Metallic',spec.metal||0],['_Cull',2]])s=s.replace(new RegExp(`- ${key}: [^\n]+`),`- ${key}: ${value}`);
 if(spec.tex)s=s.replace(/(- _BaseMap:\n        m_Texture:) \{[^}]+\}/,`$1 {fileID: 2800000, guid: ${guid(spec.tex)}, type: 3}`);
 write(p,s);meta(p,'NativeFormatImporter','  mainObjectFileID: 2100000\n');materials[name]=guid(p);
}
// Meshes use metre coordinates and baked UVs. Geometry is grouped by material to reduce draw calls.
const batches=new Map();const assemblies=new Map();
function batch(section,material,solid=false){const key=section+'/'+material+'/'+solid;if(!batches.has(key))batches.set(key,{key,section,material,solid,vertices:[]});return batches.get(key);}
const sub=(a,b)=>a.map((x,i)=>x-b[i]);const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);const unit=a=>{const l=Math.hypot(...a)||1;return a.map(x=>x/l);};
function tri(b,p,n=null,uv=null){n=n||unit(cross(sub(p[1],p[0]),sub(p[2],p[0])));if(dot(cross(sub(p[1],p[0]),sub(p[2],p[0])),n)<0){p=[p[0],p[2],p[1]];if(uv)uv=[uv[0],uv[2],uv[1]];}for(let i=0;i<3;i++){const q=p[i],a=Math.abs(n[1])>.6?[q[0],q[2]]:Math.abs(n[0])>.6?[q[2],q[1]]:[q[0],q[1]];b.vertices.push([...q,...n,1,1,1,1,...(uv?uv[i]:a)]);}}
function quad(b,p,n=null,uv=null){tri(b,[p[0],p[1],p[2]],n,uv?[uv[0],uv[1],uv[2]]:null);tri(b,[p[0],p[2],p[3]],n,uv?[uv[0],uv[2],uv[3]]:null);}
function box(section,mat,c,size,solid=false){const b=batch(section,mat,solid),[x,y,z]=c,[w,h,d]=size.map(v=>v/2);for(const [p,n] of [[[[x-w,y-h,z-d],[x+w,y-h,z-d],[x+w,y+h,z-d],[x-w,y+h,z-d]],[0,0,-1]],[[[x+w,y-h,z+d],[x-w,y-h,z+d],[x-w,y+h,z+d],[x+w,y+h,z+d]],[0,0,1]],[[[x-w,y-h,z+d],[x-w,y-h,z-d],[x-w,y+h,z-d],[x-w,y+h,z+d]],[-1,0,0]],[[[x+w,y-h,z-d],[x+w,y-h,z+d],[x+w,y+h,z+d],[x+w,y+h,z-d]],[1,0,0]],[[[x-w,y+h,z-d],[x+w,y+h,z-d],[x+w,y+h,z+d],[x-w,y+h,z+d]],[0,1,0]],[[[x-w,y-h,z+d],[x+w,y-h,z+d],[x+w,y-h,z-d],[x-w,y-h,z-d]],[0,-1,0]]])quad(b,p,n);}
function tube(section,mat,a,c,r=.04,segments=10,solid=false){const b=batch(section,mat,solid),axis=unit(sub(c,a)),u=unit(cross(axis,Math.abs(axis[1])<.9?[0,1,0]:[1,0,0])),v=cross(axis,u),p=(o,t)=>o.map((x,j)=>x+r*(u[j]*Math.cos(t)+v[j]*Math.sin(t)));for(let i=0;i<segments;i++){const t=i*Math.PI*2/segments,t1=(i+1)*Math.PI*2/segments,n=u.map((x,j)=>x*Math.cos((t+t1)/2)+v[j]*Math.sin((t+t1)/2));quad(b,[p(a,t),p(c,t),p(c,t1),p(a,t1)],n);tri(b,[a,p(a,t1),p(a,t)],axis.map(x=>-x));tri(b,[c,p(c,t),p(c,t1)],axis);}}
function triangulate(points){
 let area=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];area+=a[0]*b[1]-b[0]*a[1];}
 const orientation=area>0?1:-1,indices=points.map((_,i)=>i),result=[],cross2=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const inside=(p,a,b,c)=>{const aa=cross2(a,b,p)*orientation,bb=cross2(b,c,p)*orientation,cc=cross2(c,a,p)*orientation;return aa>1e-8&&bb>1e-8&&cc>1e-8;};
 while(indices.length>3){let clipped=false;for(let j=0;j<indices.length;j++){const a=indices[(j+indices.length-1)%indices.length],b=indices[j],c=indices[(j+1)%indices.length];if(cross2(points[a],points[b],points[c])*orientation<1e-9)continue;if(indices.some(k=>k!==a&&k!==b&&k!==c&&inside(points[k],points[a],points[b],points[c])))continue;result.push([a,b,c]);indices.splice(j,1);clipped=true;break;}if(!clipped)throw Error('Self-intersecting or degenerate polygon');}
 result.push(indices);return {triangles:result,orientation};
}
function polygon(section,mat,points,z,depth,solid=true){const b=batch(section,mat,solid),front=points.map(p=>[p[0],p[1],z]),back=points.map(p=>[p[0],p[1],z+depth]),t=triangulate(points);
 for(const [i,j,k] of t.triangles){tri(b,[front[i],front[j],front[k]],[0,0,-1]);tri(b,[back[i],back[k],back[j]],[0,0,1]);}
 for(let i=0;i<points.length;i++){const j=(i+1)%points.length,n=unit([(points[j][1]-points[i][1])*t.orientation,(points[i][0]-points[j][0])*t.orientation,0]);quad(b,[front[i],back[i],back[j],front[j]],n);}
}
function ellipsoid(section,mat,c,r,seg=9,rings=5){const b=batch(section,mat),p=(a,t)=>[c[0]+Math.cos(a)*Math.sin(t)*r[0],c[1]+Math.cos(t)*r[1],c[2]+Math.sin(a)*Math.sin(t)*r[2]];for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){const a=i*2*Math.PI/seg,a1=(i+1)*2*Math.PI/seg,t=j*Math.PI/rings,t1=(j+1)*Math.PI/rings;quad(b,[p(a,t),p(a,t1),p(a1,t1),p(a1,t)],unit([Math.cos((a+a1)/2)*Math.sin((t+t1)/2),Math.cos((t+t1)/2),Math.sin((a+a1)/2)*Math.sin((t+t1)/2)]));}}
// Main building: yellow corrugated fascia, deep shaded entrance, eight real round arch openings.
const main='Multicenter - edificio principal';
box(main,'Concreto',[-28,.0,3],[65,.22,36],true);
box(main,'Pedra',[-60,2.75,3],[.5,5.5,36],true);box(main,'Pedra',[-28,2.75,21],[65,5.5,.5],true);box(main,'Pedra',[4.2,2.75,3],[.5,5.5,36],true);
// Low provisional ceiling removed: the event pavilion uses its exposed corrugated roof.
box(main,'Amarelo',[-28,6.52,21.18],[65,2.1,.14]);box(main,'Amarelo',[-60.25,6.52,3],[.14,2.1,36]);box(main,'Amarelo',[4.45,6.52,2.7],[.14,2.1,36.6]);
// Photo-guided V silhouette, including the rising right return. Concave faces are ear-clipped.
const referenceFront=buildFrontReference({root,write,guid,meta,textureMeta,assetDir,specs,materials,materialTemplate,batch,tri,quad,polygon,box});
box(main,'Branco',[-48,5.0,-14.7],[25,.2,5],true);
box(main,'Vidro',[-47,2.2,-11.55],[24,4.35,.12],true);
for(let x=-58.5;x<-35.6;x+=2.2)box(main,'Caixilho',[x,2.2,-11.66],[.055,4.4,.09]);
for(const y of [.25,2.2,4.35])box(main,'Caixilho',[-47,y,-11.67],[24,.065,.09]);
for(const x of [-54.2,-32.3,-25.45])box(main,'Pedra',[x,2.5,-15.2],[.45,5,.6],true);
// Golden header over the arcade, stone piers, tessellated spandrels, dark tile reveals and glass doors.
box(main,'Amarelo',[-10.35,6.52,-15.5],[29.7,2.16,.22]);
const archCount=8,archStart=-23.3,pitch=3.55,radius=1.24,spring=3.2,top=5.48,front=-15.25,back=-14.55;
const arches=[];
for(let i=0;i<archCount;i++){
 const cx=archStart+i*pitch;arches.push({center:cx,radius,spring,front});
 for(const side of [-1,1])box(main,'Pedra',[cx+side*(radius+(pitch/2-radius)/2),top/2,front+.35],[pitch/2-radius,top,.70],true);
 const stone=batch(main,'Pedra',true),reveal=batch(main,'Azulejo',true);
 for(let s=0;s<36;s++){
  const a=Math.PI*s/36,a1=Math.PI*(s+1)/36,x0=cx+Math.cos(a)*radius,y0=spring+Math.sin(a)*radius,x1=cx+Math.cos(a1)*radius,y1=spring+Math.sin(a1)*radius;
  quad(stone,[[x0,y0,front],[x1,y1,front],[x1,top,front],[x0,top,front]],[0,0,-1]);
  quad(stone,[[x1,y1,back],[x0,y0,back],[x0,top,back],[x1,top,back]],[0,0,1]);
  quad(reveal,[[x0,y0,front],[x0,y0,back],[x1,y1,back],[x1,y1,front]],[-Math.cos((a+a1)/2),-Math.sin((a+a1)/2),0]);
 }
 for(const side of [-1,1])quad(reveal,[[cx+side*radius,0,front],[cx+side*radius,spring,front],[cx+side*radius,spring,back],[cx+side*radius,0,back]],[-side,0,0]);
 // A fan fills the glazing behind the opening, with a rectangular lower door.
 if(i<archCount-1){const glass=batch(main,i===archCount-2?'Caixilho':'Vidro',true);box(main,i===archCount-2?'Caixilho':'Vidro',[cx,spring/2,-14.12],[radius*2,spring,.08],true);
 for(let s=0;s<36;s++){const a=Math.PI*s/36,a1=Math.PI*(s+1)/36;tri(glass,[[cx,spring,-14.16],[cx+Math.cos(a)*radius,spring+Math.sin(a)*radius,-14.16],[cx+Math.cos(a1)*radius,spring+Math.sin(a1)*radius,-14.16]],[0,0,-1]);}
 for(const offset of [-.6,.6])box(main,'Caixilho',[cx+offset,1.6,-14.20],[.04,3.2,.07]);for(const y of [1.05,2.10,3.2])box(main,'Caixilho',[cx,y,-14.21],[2.48,.045,.07]);}

 // Masonry joints are confined to the stone texture, keeping the arch openings clear.
}
// Closing stone pier at the right corner, without closing the last arch.
box(main,'Pedra',[3.8875,2.74,-14.9],[1.125,5.48,.70],true);
// Recessed entrance signs and downlights underneath the canopy.
for(const x of [-54,-37.5]){box(main,'AzulCorrimao',[x,4.25,-15.45],[6,.42,.10]);for(const a of [-1,1])box(main,'Luz',[x+a*2,4.84,-15.3],[.23,.03,.23]);}
// Recessed central entrance under the short white canopy.
box(main,'Vidro',[-30.2,2.15,-12.1],[10.0,4.3,.10],true);
box(main,'Branco',[-30.25,4.82,-14.4],[10.4,.24,4.8],true);
box(main,'AzulCorrimao',[-37.5,4.4,-16.8],[10.0,.42,.10]);
for(const x of [-34.95,-25.45])box(main,'Pedra',[x,2.35,-15.2],[.35,4.7,.5],true);
for(let x=-34.5;x<-25.5;x+=1.5)box(main,'Caixilho',[x,2.15,-12.18],[.06,4.3,.08]);
// Fine vertical ribs on metal cladding; geometrical detail at silhouette and close range.
// Corrugation and bracket colours now use the high-resolution front photograph.
// Existing lab: thin outside cladding only, retaining the FBX, footprint, entrances, interior cream walls and XR.
const lab='SebraeLab - anexo existente verde';
box(lab,'VerdeLab',[12,2.4,-15.055],[9.8,4.8,.08]);
box(lab,'VerdeLab',[7.155,2.4,-.5],[.08,4.8,29]);
box(lab,'VerdeLab',[16.84,2.4,-5.6],[.08,4.8,18.5]);
box(lab,'VerdeLab',[12,4.87,-15.055],[9.8,.14,.12]);
box(lab,'VerdeLab',[12,3.12,-.5],[9.8,.28,29]);
for(const x of [9.2,13.55]){box(lab,'Caixilho',[x,3.85,-15.12],[3.65,.70,.055]);box(lab,'Vidro',[x,3.85,-15.16],[3.51,.57,.035]);}
box(lab,'Concreto',[12,.05,-17.35],[10.6,.10,4.4],true);
// Side approach to the existing east entrance stays free.
box(lab,'Concreto',[19.2,-.01,-4],[3.8,.12,22],true);
const referenceSign=detailedSign({root,write,guid,meta,textureMeta,assetDir,specs,materials,materialTemplate,batch,tri,quad,polygon,box,tube});
// Sign alpha textures are rasterized from installed Arial by make-campus-labels.ps1.
const labels=[
 {key:'CentroConvencoes',text:'CENTRO DE CONVENÇÕES',section:main,c:[-54,4.25,-15.512],size:[5.7,.25],color:[.95,.96,.95]},
 {key:'Entrada',text:'PEDRO NEIVA DE SANTANA',section:main,c:[-37.5,4.4,-16.87],size:[9.2,.30],color:[.95,.96,.95]},
];
for(const label of labels){const texPath=`${assetDir}/Textures/${label.key}.png`;textureMeta(texPath,true);label.texture=texPath;specs[label.key]={color:label.color,label:true,tex:texPath};let s=read('Assets/Mostruario/Materials/SebraeSignText.mat').replace('m_Name: SebraeSignText','m_Name: Campus'+label.key).replace('m_Texture: {fileID: 0}',`m_Texture: {fileID: 2800000, guid: ${guid(texPath)}, type: 3}`).replace(/- _Color: \{[^}]+\}/,'- _Color: '+vec([...label.color,1],'rgba'));const p=`${assetDir}/Materials/${label.key}.mat`;write(p,s);meta(p,'NativeFormatImporter','  mainObjectFileID: 2100000\n');materials[label.key]=guid(p);const [x,y,z]=label.c,[w,h]=label.size.map(x=>x/2);quad(batch(label.section,label.key),[[x-w,y-h,z],[x+w,y-h,z],[x+w,y+h,z],[x-w,y+h,z]],[0,0,-1],[[0,0],[1,0],[1,1],[0,1]]);}
write('Tools/campus-labels.json',JSON.stringify(labels,null,2));
// Blue handrails, broad steps, accessible ramp and double yellow road markings.
const access='Acessos - rampas escadas e corrimaos';
box(access,'Concreto',[-28,-.15,-17.7],[65,.3,5.4],true);
box(access,'Grama',[-15,-1.54,-10],[240,.7,180],true);
function roadCenter(x){return -29.3-6.9*(Math.tanh((x+22)/18)+1)/2;}
const road=batch(access,'Asfalto',true);
for(let i=0;i<200;i++){const x0=-90+i*.8,x1=x0+.8,z0=roadCenter(x0),z1=roadCenter(x1),derivative=(z1-z0)/.8,n=unit([-derivative,0,1]),w=6.2;
 quad(road,[[x0-n[0]*w,-1.15,z0-n[2]*w],[x1-n[0]*w,-1.15,z1-n[2]*w],[x1+n[0]*w,-1.15,z1+n[2]*w],[x0+n[0]*w,-1.15,z0+n[2]*w]],[0,1,0]);}

function slope(x0,x1,z,w,y0,y1){const b=batch(access,'Concreto',true);quad(b,[[x0,y0,z-w/2],[x1,y1,z-w/2],[x1,y1,z+w/2],[x0,y0,z+w/2]],[0,1,0]);for(const side of [-1,1])quad(b,[[x0,y0,z+side*w/2],[x1,y1,z+side*w/2],[x1,-1.2,z+side*w/2],[x0,-1.2,z+side*w/2]],[0,0,side]);}
// Two return runs stay to the left of the canopy pedestal, instead of obscuring its base.
slope(-60,-50.4,-23.4,1.9,-1.16,-.58);
slope(-50.4,-60,-21.05,1.9,-.58,0);
for(const run of [{a:-60,b:-50.4,z:-23.4,y0:-1.16,y1:-.58},{a:-50.4,b:-60,z:-21.05,y0:-.58,y1:0}]){
 for(const side of [-1,1]){const z=run.z+side*.91;for(let i=0;i<=6;i++){const t=i/6,x=run.a+(run.b-run.a)*t,y=run.y0+(run.y1-run.y0)*t;tube(access,'AzulCorrimao',[x,y,z],[x,y+.94,z],.035,8);}for(const h of [.59,.94])tube(access,'AzulCorrimao',[run.a,run.y0+h,z],[run.b,run.y1+h,z],.038,10);}
}
box(access,'Concreto',[-50.4,-.64,-22.2],[1.95,.12,4.3],true);
box(access,'Concreto',[-60,-.06,-19.8],[2,.12,2.8],true);
for(let i=0;i<12;i++){const z=-25.4+i*.44,y=-1.16+(i+1)*1.16/12;box(access,'Concreto',[6.8,y/2-.63,z],[7.1,y+1.26,.44],true);box(access,'Branco',[6.8,y+.007,z-.14],[7.1,.014,.045]);}
for(const x of [3.35,10.25]){for(let i=0;i<7;i++){const z=-25.9+i*.82,y=-1.16+(z+25.9)/5.0*1.16;tube(access,'AzulCorrimao',[x,y,z],[x,y+.94,z],.035,8);}for(const h of [.59,.94])tube(access,'AzulCorrimao',[x,-1.16+h,-25.9],[x,h,-20.9],.038,10);}
box(access,'Concreto',[-59,-1.21,-24.7],[2.5,.12,4.0],true);
// A planted oval island separates the entrance forecourt from the approach road.
function ellipse(section,mat,c,rx,rz,h){const b=batch(section,mat,true);for(let i=0;i<96;i++){const a=i*Math.PI/48,a1=(i+1)*Math.PI/48,p=t=>[c[0]+rx*Math.cos(t),c[1],c[2]+rz*Math.sin(t)],p0=p(a),p1=p(a1);tri(b,[c,p0,p1],[0,1,0]);quad(b,[p0,p1,[p1[0],c[1]-h,p1[2]],[p0[0],c[1]-h,p0[2]]],unit([Math.cos((a+a1)/2),0,Math.sin((a+a1)/2)]));}}
ellipse(access,'Branco',[-15,-.98,-26.45],16.8,3.1,.25);ellipse(access,'Grama',[-15,-.96,-26.45],16.55,2.89,.1);
for(const dz of [-.14,.14]){const b=batch(access,'FaixaAmarela');for(let i=0;i<140;i++){const x0=-85+i*160/140,x1=-85+(i+1)*160/140,f=roadCenter,z0=f(x0)+dz,z1=f(x1)+dz;quad(b,[[x0,-1.143,z0-.045],[x1,-1.143,z1-.045],[x1,-1.143,z1+.045],[x0,-1.143,z0+.045]],[0,1,0]);}}
// White curb along the forecourt edge.
box(access,'Branco',[-48,-1.06,-26.5],[32,.20,.16],true);
const landscape='Paisagismo - palmeiras e jardim Sebraelab';
function palm(x,z,h){
 tube(landscape,'Tronco',[x,0,z],[x+.07,h,z+.03],.095,14);
 for(let f=0;f<10;f++){const angle=f*Math.PI/5+rand()*.24,frond=t=>[x+.07+Math.cos(angle)*2.0*t,h+.65*Math.sin(t*Math.PI)-.52*t,z+.03+Math.sin(angle)*2.0*t];
 for(let j=0;j<28;j++){const t=j/28,t1=(j+1)/28,a=frond(t),b=frond(t1);tube(landscape,'Folhas',a,b,.007,4);if(j<2)continue;
 for(const side of [-1,1]){const length=.48*Math.sin(t*Math.PI*.9),tip=[a[0]+Math.cos(angle+side*1.08)*length,a[1]-.16*t,a[2]+Math.sin(angle+side*1.08)*length],blade=[tip[0]+Math.cos(angle)*.018,tip[1]-.014,tip[2]+Math.sin(angle)*.018],base=[a[0]+Math.cos(angle)*.025,a[1],a[2]+Math.sin(angle)*.025];
 quad(batch(landscape,j%4?'Folhas':'FolhasClaras'),[a,tip,blade,base],[0,1,0]);quad(batch(landscape,j%4?'Folhas':'FolhasClaras'),[base,blade,tip,a],[0,-1,0]);}}
 }
}
for(const [x,z,h] of [[-24,-18.4,3.5],[-17.3,-18.4,3.3],[-9.5,-18.4,3.8],[-2.3,-18.4,3.6],[8.0,-18.5,3.4],[17.2,-18.6,3.6]])palm(x,z,h);
for(const [cx,cz,w,d] of [[12.5,-21.0,8.2,1.3],[8.0,-18,1.0,4.7],[17,-18,1.0,4.7]]){box(landscape,'Terra',[cx,-.02,cz],[w,.08,d]);for(let i=0;i<w*d*42;i++){const x=cx+(rand()-.5)*w,z=cz+(rand()-.5)*d,y=.35+rand()*.30;ellipsoid(landscape,i%3?'Folhas':'FolhasClaras',[x,y,z],[.12,.20,.12],9,4);if(rand()>.6)ellipsoid(landscape,'Flores',[x,y+.14,z],[.05,.04,.05],5,3);}}
for(let i=0;i<4200;i++){const a=rand()*Math.PI*2,r=Math.sqrt(rand()),x=-15+Math.cos(a)*16.4*r,z=-26.45+Math.sin(a)*2.8*r,h=.08+rand()*.23;const b=batch(landscape,'Grama');tri(b,[[x-.015,-.95,z],[x+.02,-.95,z],[x+.05,-.95+h,z+.015]],[0,0,-1]);}
// Simple timber pergola visible between the main building corner and the annex.
for(const x of [6.0,8.7])for(const z of [-16.0,-20.0])box(landscape,'Madeira',[x,1.3,z],[.12,2.6,.12],true);
for(const x of [6,8.7])box(landscape,'Madeira',[x,2.61,-18],[.14,.18,4.5]);for(let z=-20.1;z<-15.7;z+=.34)box(landscape,'Madeira',[7.35,2.75,z],[3.2,.12,.07]);
// Exterior lampposts, restrained in number for VR.
for(const [x,z] of [[-28,-25.3],[-2,-30],[23,-29]]){tube(landscape,'Aco',[x,-1.1,z],[x,6.6,z],.065,10);for(const s of [-1,1]){tube(landscape,'Aco',[x,6.6,z],[x+s*.95,6.85,z],.045,8);box(landscape,'Aco',[x+s*1.1,6.85,z],[.55,.07,.22]);}}
const streetDetails=addFrontStreet({box,polygon,batch,quad,tri,tube});
// Dimensions adapted at the user's request: approximately 78 m wide, 43 m deep and 8.5 m high.
for(const b of batches.values()){
 const isMain=b.section===main,westGround=b.section===access||b.section===landscape;
 for(const v of b.vertices){if(isMain){v[0]=4.5+(v[0]-4.5)*1.2;v[1]*=1.12;v[2]=-15.25+(v[2]+15.25)*1.2;const n=unit([v[3]/1.2,v[4]/1.12,v[5]/1.2]);v.splice(3,3,...n);}else if(westGround&&v[0]<4.5){v[0]=4.5+(v[0]-4.5)*1.2;const n=unit([v[3]/1.2,v[4],v[5]]);v.splice(3,3,...n);}}
}
for(const label of labels)if(label.section===main){label.c=[4.5+(label.c[0]-4.5)*1.2,label.c[1]*1.12,-15.25+(label.c[2]+15.25)*1.2];label.size=[label.size[0]*1.2,label.size[1]*1.12];}
for(const arch of arches){arch.center=4.5+(arch.center-4.5)*1.2;arch.radius*=1.2;arch.spring*=1.12;}
// Native Unity mesh assets avoid model import file-ID ambiguity.
const template=read('Assets/Samples/XR Hands/1.7.3/HandVisualizer/Materials/AxisMesh.asset');
const meshManifest=[];
for(const b of batches.values()){
 if(!b.vertices.length)continue;const n=b.vertices.length,vertexData=Buffer.alloc(n*48),index32=n>65535,indices=Buffer.alloc(n*(index32?4:2));const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 b.vertices.forEach((v,i)=>{v.forEach((x,k)=>vertexData.writeFloatLE(x,i*48+k*4));if(index32)indices.writeUInt32LE(i,i*4);else indices.writeUInt16LE(i,i*2);for(let k=0;k<3;k++){min[k]=Math.min(min[k],v[k]);max[k]=Math.max(max[k],v[k]);}});
 const center=min.map((x,i)=>(x+max[i])/2),extent=min.map((x,i)=>(max[i]-x)/2);
 const channels=Array.from({length:14},(_,i)=>({offset:i===1?12:i===2?24:i===4?40:0,dim:i<2?3:i===2?4:i===4?2:0})).map(c=>`    - stream: 0\n      offset: ${c.offset}\n      format: 0\n      dimension: ${c.dim}\n`).join('');
 let s=template.replace('m_Name: AxisMesh','m_Name: Campus'+meshManifest.length).replace(/indexCount: \d+/,'indexCount: '+n).replace(/vertexCount: \d+/,'vertexCount: '+n).replace(/m_VertexCount: \d+/,'m_VertexCount: '+n).replace(/m_IndexFormat: \d+/,'m_IndexFormat: '+(index32?1:0)).replace(/m_Center: \{[^}]+\}/g,'m_Center: '+vec(center)).replace(/m_Extent: \{[^}]+\}/g,'m_Extent: '+vec(extent)).replace(/m_IndexBuffer: [a-f0-9]+/,'m_IndexBuffer: '+indices.toString('hex')).replace(/    m_Channels:\n[\s\S]*?    m_DataSize: \d+\n    _typelessdata: [a-f0-9]+\n/,'    m_Channels:\n'+channels+'    m_DataSize: '+vertexData.length+'\n    _typelessdata: '+vertexData.toString('hex')+'\n');
 const p=`${assetDir}/Meshes/Campus${String(meshManifest.length).padStart(2,'0')}.asset`;write(p,s);meta(p);meshManifest.push({path:p,guid:guid(p),material:b.material,section:b.section,solid:b.solid,vertices:n,triangles:n/3,min,max});
}
// Patch both scenes, preserving all original scene documents and the original lab instance verbatim.
const common='  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n';
let id=2300000000;const nodes=[],components=[];
function group(name,parent=null){const n={go:id++,tr:id++,name,parent,children:[],extras:[]};nodes.push(n);if(parent)parent.children.push(n.tr);return n;}
const campus=group('Campus Sebrae - Multicenter e Sebraelab');
for(const m of meshManifest){if(!assemblies.has(m.section))assemblies.set(m.section,group(m.section,campus));const n=group(m.material+(m.solid?' - geometria fisica':''),assemblies.get(m.section)),mf=id++,mr=id++;n.extras.push(mf,mr);components.push(`--- !u!33 &${mf}\nMeshFilter:\n${common}  m_GameObject: {fileID: ${n.go}}\n  m_Mesh: {fileID: 4300000, guid: ${m.guid}, type: 2}\n`);components.push(`--- !u!23 &${mr}\nMeshRenderer:\n${common}  m_GameObject: {fileID: ${n.go}}\n  m_Enabled: 1\n  m_CastShadows: ${specs[m.material].label?0:1}\n  m_ReceiveShadows: 1\n  m_DynamicOccludee: 1\n  m_MotionVectors: 1\n  m_LightProbeUsage: 1\n  m_ReflectionProbeUsage: 1\n  m_RenderingLayerMask: 1\n  m_RendererPriority: 0\n  m_Materials:\n  - {fileID: 2100000, guid: ${materials[m.material]}, type: 2}\n  m_StaticBatchInfo:\n    firstSubMesh: 0\n    subMeshCount: 0\n  m_StaticBatchRoot: {fileID: 0}\n  m_ProbeAnchor: {fileID: 0}\n  m_LightProbeVolumeOverride: {fileID: 0}\n  m_ScaleInLightmap: 1\n  m_ReceiveGI: 1\n  m_PreserveUVs: 0\n  m_IgnoreNormalsForChartDetection: 0\n  m_ImportantGI: 0\n  m_StitchLightmapSeams: 1\n  m_SelectedEditorRenderState: 3\n  m_MinimumChartSize: 4\n  m_AutoUVMaxDistance: 0.5\n  m_AutoUVMaxAngle: 89\n  m_LightmapParameters: {fileID: 0}\n  m_SortingLayerID: 0\n  m_SortingLayer: 0\n  m_SortingOrder: 0\n`);if(m.solid){const c=id++;n.extras.push(c);components.push(`--- !u!64 &${c}\nMeshCollider:\n${common}  m_GameObject: {fileID: ${n.go}}\n  m_Material: {fileID: 0}\n  m_IncludeLayers:\n    serializedVersion: 2\n    m_Bits: 0\n  m_ExcludeLayers:\n    serializedVersion: 2\n    m_Bits: 0\n  m_LayerOverridePriority: 0\n  m_IsTrigger: 0\n  m_ProvidesContacts: 0\n  m_Enabled: 1\n  serializedVersion: 5\n  m_Convex: 0\n  m_CookingOptions: 30\n  m_Mesh: {fileID: 4300000, guid: ${m.guid}, type: 2}\n`);}}
function serialize(n){return `--- !u!1 &${n.go}\nGameObject:\n${common}  serializedVersion: 6\n  m_Component:\n${[n.tr,...n.extras].map(c=>`  - component: {fileID: ${c}}\n`).join('')}  m_Layer: 0\n  m_Name: ${n.name}\n  m_TagString: Untagged\n  m_Icon: {fileID: 0}\n  m_NavMeshLayer: 0\n  m_StaticEditorFlags: 0\n  m_IsActive: 1\n--- !u!4 &${n.tr}\nTransform:\n${common}  m_GameObject: {fileID: ${n.go}}\n  serializedVersion: 2\n  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}\n  m_LocalPosition: {x: 0, y: 0, z: 0}\n  m_LocalScale: {x: 1, y: 1, z: 1}\n  m_ConstrainProportionsScale: 0\n${n.children.length?'  m_Children:\n'+n.children.map(c=>`  - {fileID: ${c}}\n`).join(''):'  m_Children: []\n'}  m_Father: {fileID: ${n.parent?.tr||0}}\n  m_LocalEulerAnglesHint: {x: 0, y: 0, z: 0}\n`;}
for(const name of ['Sebrae','MostruarioSebrae']){
 const p=`Assets/Scenes/${name}.unity`,backup=`Tools/CampusBackup/${name}.unity.bak`;if(!fs.existsSync(path.join(root,backup)))write(backup,read(p));let scene=read(backup);
 if(scene.includes('&2300000000'))throw Error('Backup already contains campus IDs.');
 const at=scene.indexOf('--- !u!1660057539');if(at<0)throw Error('SceneRoots not found');const roots=scene.slice(at)+`  - {fileID: ${campus.tr}}\n`;
 scene=scene.slice(0,at)+nodes.map(serialize).join('')+components.join('')+roots;write(p,scene);
}
const manifest={version:3,referenceFront,streetDetails,referenceSign,adaptedMainDimensions:[78,8.512,43.2],referencePhotos:['IMG_9627.jpeg','2021-11-26.jpg','WhatsApp Image 2026-11-13 at 13.48.03 (1).jpeg','WhatsApp Image 2026-11-13 at 13.48.03.jpeg'],originalLabPreserved:true,notes:'Visible facade reconstructed from photos; dimensions and unseen elevations inferred, not surveyed. Existing lab stays at its original coordinates. Unity/headset visual validation pending.',arches,labels,meshes:meshManifest,materials,specs,rootId:campus.tr};
write('Tools/campus-layout.json',JSON.stringify(manifest,null,2));
// Geometry data for a dependency-free review render; not imported by Unity.
write('Tools/campus-review-geometry.json',JSON.stringify([...batches.values()].map(b=>({section:b.section,material:b.material,vertices:b.vertices}))));
console.log(`CAMPUS_BUILT: ${archCount} arches, ${meshManifest.length} mesh batches, ${meshManifest.reduce((s,m)=>s+m.triangles,0)} triangles; original lab and both scene backups retained.`);