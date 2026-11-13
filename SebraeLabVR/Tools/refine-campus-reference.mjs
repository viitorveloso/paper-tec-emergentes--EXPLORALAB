import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8').replaceAll('\r\n','\n'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
const base='Tools/rebuild-campus.mjs';let s=read(base);if(s.includes('const referenceSign='))throw Error('Reference refinement already applied.');
for(const p of [base,'Tools/review-campus.mjs','Tools/make-campus-labels.ps1','Assets/Scenes/Sebrae.unity','Assets/Scenes/MostruarioSebrae.unity']){const backup='Tools/CampusBackup/BeforeReference-'+path.basename(p)+'.bak';if(!fs.existsSync(path.join(root,backup)))write(backup,read(p));}
function replace(a,b){if(!s.includes(a))throw Error('Patch target absent: '+a.slice(0,100));s=s.replace(a,b);}
s="import { detailedSign } from './campus-reference-detail.mjs';\n"+s;
const begin=s.indexOf('function polygon('),end=s.indexOf('function ellipsoid(',begin);
if(begin<0||end<0)throw Error('Polygon helpers missing');
s=s.slice(0,begin)+String.raw`function triangulate(points){
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
`+s.slice(end);
replace("polygon(main,'Amarelo',[[-60.5,7.6],[-25.2,7.6],[-25.2,5.55],[-35.5,5.55],[-35.5,6.0],[-60.5,6.0]],-17.2,.28);\npolygon(main,'Amarelo',[[-60.5,6.0],[-35.5,6.0],[-35.5,.65],[-43.6,5.1],[-60.5,5.1]],-17.2,.28);", "polygon(main,'Amarelo',[[-60.5,7.6],[-25.2,7.6],[-25.2,5.55],[-30.3,4.85],[-35.5,.65],[-43.6,5.1],[-60.5,5.1]],-17.2,.42);");
replace('const archCount=9,archStart=-23.6,pitch=3.12,radius=1.17','const archCount=8,archStart=-23.3,pitch=3.55,radius=1.24');
replace("[2.34,.055,.07]","[2.48,.055,.07]");
const ribStart=s.indexOf('for(let x=-60.45;'),ribEnd=s.indexOf('// Existing lab:',ribStart);
s=s.slice(0,ribStart)+String.raw`function canopyBottom(x){if(x<-43.6)return 5.1;if(x<-35.5)return 5.1-(x+43.6)*4.45/8.1;if(x<-30.3)return .65+(x+35.5)*4.20/5.2;if(x<-25.2)return 4.85+(x+30.3)*.70/5.1;return 5.46;}
for(let x=-60.45;x<4.4;x+=.115){const z=x<-25.2?-17.219:-15.619,low=canopyBottom(x);box(main,'Amarelo',[x,(7.59+low)/2,z],[.008,7.59-low,.009]);}
`+s.slice(ribEnd);
replace("[12,1.52,-15.055],[9.8,3.04,.04]","[12,2.4,-15.055],[9.8,4.8,.08]");
replace("[7.155,1.35,-.5],[.035,2.7,29]","[7.155,2.4,-.5],[.08,4.8,29]");
replace("[16.84,1.35,-5.6],[.035,2.7,18.5]","[16.84,2.4,-5.6],[.08,4.8,18.5]");
replace("box(lab,'VerdeLab',[12,3.22,-15.055],[9.8,.36,.05]);","box(lab,'VerdeLab',[12,4.87,-15.055],[9.8,.14,.12]);");
s=s.replaceAll('[x,2.42,-15.095]','[x,3.85,-15.12]').replaceAll('[x,2.42,-15.13]','[x,3.85,-15.16]');
const signStart=s.indexOf('// Sculpture follows'),signEnd=s.indexOf('// Sign alpha textures',signStart);
s=s.slice(0,signStart)+"const referenceSign=detailedSign({root,write,guid,meta,textureMeta,assetDir,specs,materials,materialTemplate,batch,tri,quad,polygon,box,tube});\n"+s.slice(signEnd);
s=s.replace(/^.*key:'SebraeLab'.*\n/m,'');
// A tighter high-resolution material grain avoids the conspicuous coarse noise of the first version.
s=s.replace('value=.86+grain*.17','value=.95+grain*.045').replace('value=.94+grain*.14','value=.97+grain*.04').replace('value=.72+grain*.34','value=.86+grain*.10').replace('value=.76+grain*.34','value=.88+grain*.10');
s=s.replace('color:[.63,.6,.56]','color:[.76,.72,.68]').replace('color:[.94,.68,.10]','color:[1,.76,.19]').replace('color:[.48,.67,.085]','color:[.48,.65,.09]').replace('color:[.28,.37,.115]','color:[.35,.46,.15]');
// Change the rectangular road into a truly curved ribbon; the markings use the identical centre curve.
replace("box(access,'Asfalto',[-15,-1.19,-38],[160,.08,23],true);",String.raw`function roadCenter(x){return -29.3-6.9*(Math.tanh((x+22)/18)+1)/2;}
const road=batch(access,'Asfalto',true);
for(let i=0;i<200;i++){const x0=-90+i*.8,x1=x0+.8,z0=roadCenter(x0),z1=roadCenter(x1),derivative=(z1-z0)/.8,n=unit([-derivative,0,1]),w=6.2;
 quad(road,[[x0-n[0]*w,-1.15,z0-n[2]*w],[x1-n[0]*w,-1.15,z1-n[2]*w],[x1+n[0]*w,-1.15,z1+n[2]*w],[x0+n[0]*w,-1.15,z0+n[2]*w]],[0,1,0]);}
`);
replace("f=x=>-34.5-3.2*Math.tanh((x+20)/16)","f=roadCenter");
// Move the stairs to the actual side of the arcade instead of putting them in front of the last arch.
s=s.replace("[1.1,y/2-.63,z],[7.1,y+1.26,.44]","[6.8,y/2-.63,z],[7.1,y+1.26,.44]").replace("[1.1,y+.007,z-.14]","[6.8,y+.007,z-.14]").replace("for(const x of [-2.35,4.55])","for(const x of [3.35,10.25])");
// Replace coarse triangular palm leaves with thin pairs of leaflets along bent fronds.
const palmBegin=s.indexOf('function palm('),palmEnd=s.indexOf('for(const [x,z,h]',palmBegin);
s=s.slice(0,palmBegin)+String.raw`function palm(x,z,h){
 tube(landscape,'Tronco',[x,0,z],[x+.07,h,z+.03],.095,14);
 for(let f=0;f<10;f++){const angle=f*Math.PI/5+rand()*.24,frond=t=>[x+.07+Math.cos(angle)*2.0*t,h+.65*Math.sin(t*Math.PI)-.52*t,z+.03+Math.sin(angle)*2.0*t];
 for(let j=0;j<28;j++){const t=j/28,t1=(j+1)/28,a=frond(t),b=frond(t1);tube(landscape,'Folhas',a,b,.007,4);if(j<2)continue;
 for(const side of [-1,1]){const length=.48*Math.sin(t*Math.PI*.9),tip=[a[0]+Math.cos(angle+side*1.08)*length,a[1]-.16*t,a[2]+Math.sin(angle+side*1.08)*length],blade=[tip[0]+Math.cos(angle)*.018,tip[1]-.014,tip[2]+Math.sin(angle)*.018],base=[a[0]+Math.cos(angle)*.025,a[1],a[2]+Math.sin(angle)*.025];
 quad(batch(landscape,j%4?'Folhas':'FolhasClaras'),[a,tip,blade,base],[0,1,0]);quad(batch(landscape,j%4?'Folhas':'FolhasClaras'),[base,blade,tip,a],[0,-1,0]);}}
 }
}
`+s.slice(palmEnd);
s=s.replace('i<w*d*25','i<w*d*42').replace('y=.2+rand()*.3','y=.35+rand()*.30').replace('[.18,.17,.19],6,3','[.12,.20,.12],9,4');
// Larger event building, retaining the existing annex coordinates and proportions within each facade.
const nativeMarker='// Native Unity mesh assets avoid';
replace(nativeMarker,String.raw`// Dimensions adapted at the user's request: approximately 78 m wide, 43 m deep and 8.5 m high.
for(const b of batches.values()){
 const isMain=b.section===main,westGround=b.section===access||b.section===landscape;
 for(const v of b.vertices){if(isMain){v[0]=4.5+(v[0]-4.5)*1.2;v[1]*=1.12;v[2]=-15.25+(v[2]+15.25)*1.2;const n=unit([v[3]/1.2,v[4]/1.12,v[5]/1.2]);v.splice(3,3,...n);}else if(westGround&&v[0]<4.5){v[0]=4.5+(v[0]-4.5)*1.2;const n=unit([v[3]/1.2,v[4],v[5]]);v.splice(3,3,...n);}}
}
for(const label of labels)if(label.section===main){label.c=[4.5+(label.c[0]-4.5)*1.2,label.c[1]*1.12,-15.25+(label.c[2]+15.25)*1.2];label.size=[label.size[0]*1.2,label.size[1]*1.12];}
for(const arch of arches){arch.center=4.5+(arch.center-4.5)*1.2;arch.radius*=1.2;arch.spring*=1.12;}
`+nativeMarker);
replace('const manifest={version:1,','const manifest={version:2,referenceSign,adaptedMainDimensions:[78,8.512,43.2],');
s=s.replace('nine real round arch openings','eight real round arch openings').replace('// Two convex pieces create the distinctive down-pointing diagonal canopy without fan triangulation artifacts.','// Photo-guided V silhouette, including the rising right return. Concave faces are ear-clipped.');
write(base,s);
// The software preview samples RGB photographs and uses a closer eye-level view in addition to the overview.
let review=read('Tools/review-campus.mjs');
review=review.replace('let value=1,alpha=1;','let value=1,alpha=1,rgb=null;').replace('else value=texture.data[index]/255;','else if(t.spec.photoFace)rgb=[texture.data[index]/255,texture.data[index+1]/255,texture.data[index+2]/255];else value=texture.data[index]/255;').replace('255*t.spec.color[j]*value*shade','255*t.spec.color[j]*(rgb?rgb[j]:value)*shade');
review=review.replace("render('campus-geometria',[-52,11,-67],[-21,2,-10],64);","render('campus-geometria',[-62,13,-88],[-26,3,-9],60);\nrender('multicenter-fachada',[-85,3.3,-62],[-29,3,-12],65);");
review=review.replace("render('sebraelab-geometria',[21.5,4.4,-32],[12.4,1.9,-17],58,1400,900);","render('sebraelab-geometria',[21.5,4.4,-32],[12.4,2.6,-17],58,1400,900);\nrender('sebraelab-placa-detalhe',[17.5,3.4,-27.5],[12.4,2.4,-20],54,1400,1100);");
write('Tools/review-campus.mjs',review);
console.log('REFERENCE_REFINEMENT_READY: V canopy, eight arches, larger building, curved road, finer vegetation, photo-traced three-dimensional sign with raised letters.');