// Curved canopy and raised signage reconstructed from IMG_9627.jpeg. Coordinates are photo samples, not a survey.
import fs from 'node:fs';import path from 'node:path';
import { pngPixels } from './campus-reference-detail.mjs';
function solve(A,b){for(let i=0;i<b.length;i++){let r=i;for(let j=i+1;j<b.length;j++)if(Math.abs(A[j][i])>Math.abs(A[r][i]))r=j;[A[i],A[r]]=[A[r],A[i]];[b[i],b[r]]=[b[r],b[i]];const d=A[i][i];if(Math.abs(d)<1e-12)throw Error('Singular homography');for(let k=i;k<b.length;k++)A[i][k]/=d;b[i]/=d;for(let j=0;j<b.length;j++)if(j!==i){const q=A[j][i];for(let k=i;k<b.length;k++)A[j][k]-=q*A[i][k];b[j]-=q*b[i];}}return b;}
function homography(src,dst){const A=[],b=[];for(let i=0;i<4;i++){const[x,y]=src[i],[u,v]=dst[i];A.push([x,y,1,0,0,0,-u*x,-u*y]);b.push(u);A.push([0,0,0,x,y,1,-v*x,-v*y]);b.push(v);}return solve(A,b);}
const map=(h,x,y)=>{const d=h[6]*x+h[7]*y+1;return[(h[0]*x+h[1]*y+h[2])/d,(h[3]*x+h[4]*y+h[5])/d];};
const bezier=(p,t)=>[0,1].map(k=>(1-t)**3*p[0][k]+3*(1-t)**2*t*p[1][k]+3*(1-t)*t*t*p[2][k]+t**3*p[3][k]);
export function buildFrontReference(ctx){
 const {root,write,guid,meta,textureMeta,assetDir,specs,materials,materialTemplate,batch,tri,quad,polygon,box}=ctx,main='Multicenter - edificio principal';
 const sourceCorners=[[0,265],[979,400],[979,453],[0,362]],planeCorners=[[-60.5,7.6],[-25.2,7.6],[-25.2,5.55],[-60.5,5.55]],toPlane=homography(sourceCorners,planeCorners),toPhoto=homography(planeCorners,sourceCorners);
 const p=assetDir+'/Textures/MulticenterReferencia.png',pixels=pngPixels(path.join(root,p));textureMeta(p);
 const matPath=assetDir+'/Materials/FachadaFoto.mat';let mat=materialTemplate.replace('m_Name: ShowroomBranco','m_Name: MulticenterReferenciaFrontal');for(const key of ['_BaseColor','_Color'])mat=mat.replace(new RegExp('- '+key+': \\{[^}]+\\}'),'- '+key+': {r: 1, g: 1, b: 1, a: 1}');mat=mat.replace(/(- _BaseMap:\n        m_Texture:) \{[^}]+\}/,'$1 {fileID: 2800000, guid: '+guid(p)+', type: 3}').replace(/- _Smoothness: [^\n]+/,'- _Smoothness: 0.25');write(matPath,mat);meta(matPath,'NativeFormatImporter','  mainObjectFileID: 2100000\n');materials.FachadaFoto=guid(matPath);specs.FachadaFoto={color:[1,1,1],tex:p,smooth:.25,photoFace:true};
 const uv=p=>[p[0]/pixels.w,1-p[1]/pixels.h],uvWorld=p=>uv(map(toPhoto,p[0],p[1])),frontZ=-17.235,backZ=-16.80;
 const profile=[];const left=[[0,375],[190,394],[345,461],[526,590]],right=[[556,590],[675,479],[744,436],[979,453]];
 for(let i=0;i<=100;i++)profile.push(map(toPlane,...bezier(left,i/100)));profile.push(map(toPlane,556,590));for(let i=1;i<=100;i++)profile.push(map(toPlane,...bezier(right,i/100)));
 // Tessellated strips give the curved lower outline real geometry and projectively mapped UVs.
 for(let i=0;i<profile.length-1;i++){
  const a=profile[i],b=profile[i+1],points=[[a[0],a[1],frontZ],[b[0],b[1],frontZ],[b[0],7.6,frontZ],[a[0],7.6,frontZ]];
  quad(batch(main,'FachadaFoto',true),points,[0,0,-1],points.map(uvWorld));quad(batch(main,'Amarelo',true),points.map(v=>[v[0],v[1],backZ]),[0,0,1]);
  const n=[b[1]-a[1],a[0]-b[0],0],len=Math.hypot(...n)||1;quad(batch(main,'Branco',true),[[a[0],a[1],frontZ],[a[0],a[1],backZ],[b[0],b[1],backZ],[b[0],b[1],frontZ]],n.map(v=>v/len));
 }
 // Yellow photo strip over the stone arcade, preserving the same source colour and corrugation.
 const rightPhoto=[[979,400],[1485,453],[1485,493],[979,453]],rightWorld=[[-25.2,7.6],[4.5,7.6],[4.5,5.44],[-25.2,5.44]],rightH=homography(rightWorld,rightPhoto);
 for(let i=0;i<80;i++)for(let j=0;j<4;j++){const x0=-25.2+29.7*i/80,x1=x0+29.7/80,y0=5.44+2.16*j/4,y1=y0+2.16/4,vs=[[x0,y0,-15.64],[x1,y0,-15.64],[x1,y1,-15.64],[x0,y1,-15.64]];quad(batch(main,'FachadaFoto'),vs,[0,0,-1],vs.map(v=>uv(map(rightH,v[0],v[1]))));}
 // White trapezoidal base seen below the blunt tip in the new front reference.
 const tipLeft=map(toPlane,526,590),tipRight=map(toPlane,556,590);
 polygon(main,'Branco',[[tipLeft[0]-2.0,.10],[tipRight[0]+2.0,.10],[tipRight[0],tipRight[1]],[tipLeft[0],tipLeft[1]]],frontZ-.08,2.15,true);
 // Raised coloured brackets retain the exact painted colour pattern in the reference photograph.
 const bracketPixels=[[[209,296],[221,297],[221,394],[209,393]],[[210,295],[242,299],[242,310],[210,307]],[[210,381],[244,383],[244,396],[210,393]],[[806,370],[827,373],[827,382],[806,379]],[[815,379],[826,380],[825,444],[815,443]],[[804,435],[826,437],[826,445],[804,444]]];
 for(const points of bracketPixels){const pts=points.map(p=>map(toPlane,...p)),pb=batch(main,'FachadaFoto',true),start=pb.vertices.length;polygon(main,'FachadaFoto',pts,frontZ-.055,.055,true);const added=pb.vertices.splice(start);for(let i=0;i<added.length;i+=3){const t=added.slice(i,i+3);if(t[0][5]<-.5){for(const v of t){const q=uvWorld(v);v[10]=q[0];v[11]=q[1];}pb.vertices.push(...t);}else batch(main,'Amarelo',true).vertices.push(...t);}}
 // Blue letters and the subtitle stand off the fascia. Mask is derived from source glyph pixels, not a substitute font.
 const cols=480,rows=96,lo=[-55.1,5.0],hi=[-35.1,7.55],dx=(hi[0]-lo[0])/cols,dy=(hi[1]-lo[1])/rows,mask=new Uint8Array(cols*rows);
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const q=map(toPhoto,lo[0]+(x+.5)*dx,hi[1]-(y+.5)*dy),px=Math.round(q[0]),py=Math.round(q[1]);if(px<250||px>803||py<310||py>442)continue;const k=(py*pixels.w+px)*pixels.channels,r=pixels.data[k],g=pixels.data[k+1],b=pixels.data[k+2];if(r<120&&g<150&&b<150&&g>r*.65)mask[y*cols+x]=1;}
 let letterCells=0;const z=frontZ-.075;
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(mask[y*cols+x]){letterCells++;const x0=lo[0]+x*dx,x1=x0+dx,y1=hi[1]-y*dy,y0=y1-dy,vs=[[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]];quad(batch(main,'FachadaFoto'),vs,[0,0,-1],vs.map(uvWorld));if(x===0||!mask[y*cols+x-1])quad(batch(main,'LetrasAzuis'),[[x0,y0,frontZ],[x0,y1,frontZ],[x0,y1,z],[x0,y0,z]],[-1,0,0]);if(x===cols-1||!mask[y*cols+x+1])quad(batch(main,'LetrasAzuis'),[[x1,y0,z],[x1,y1,z],[x1,y1,frontZ],[x1,y0,frontZ]],[1,0,0]);if(y===0||!mask[(y-1)*cols+x])quad(batch(main,'LetrasAzuis'),[[x0,y1,z],[x1,y1,z],[x1,y1,frontZ],[x0,y1,frontZ]],[0,1,0]);if(y===rows-1||!mask[(y+1)*cols+x])quad(batch(main,'LetrasAzuis'),[[x0,y0,frontZ],[x1,y0,frontZ],[x1,y0,z],[x0,y0,z]],[0,-1,0]);}
 const data={source:'IMG_9627.jpeg',texture:p,sourceCorners,toPlane,toPhoto,profile,leftCurvePixels:left,rightCurvePixels:right,tipLeft,tipRight,bracketPixels,letterCells,letterDepth:.075,adaptedDimensions:true};write('Tools/multicenter-front-trace.json',JSON.stringify(data,null,2));return data;
}
export function addFrontStreet(ctx){const {box,polygon,batch,quad,tri,tube}=ctx,section='Acessos - rampas escadas e corrimaos',y=-1.139;
 // Foreground street and markings visible in IMG_9627. The original inner approach road remains.
 box(section,'Asfalto',[-25,-1.19,-54],[160,.08,16],true);
 box(section,'Concreto',[-25,-1.16,-65],[160,.12,5.8],true);
 for(const z of [-61.65,-46.35])box(section,'Branco',[-25,y,z],[160,.016,.10]);
 box(section,'FaixaAmarela',[-25,-1.12,-62],[160,.035,.14]);
 for(let x=-95;x<55;x+=6)box(section,'Branco',[x,y,-54],[3,.016,.10]);
 const white=batch(section,'Branco');
 function arrow(cx,cz){const points=[[-2,-.12],[.5,-.12],[.5,-.75],[2.15,0],[.5,.75],[.5,.12],[-2,.12]]; // Concave outline is split into shaft and arrow head.
 quad(white,[[cx-2,y,cz-.12],[cx+.5,y,cz-.12],[cx+.5,y,cz+.12],[cx-2,y,cz+.12]],[0,1,0]);tri(white,[[cx+.5,y,cz-.75],[cx+2.15,y,cz],[cx+.5,y,cz+.75]],[0,1,0]);}
 for(const x of [-60,-28])for(const z of [-58,-50])arrow(x,z);
 const crossingX=8.3;for(let i=0;i<10;i++)box(section,'Branco',[crossingX,y,-61+i*1.45],[6.2,.018,.72]);
 // Pedestrian island access and three marked parking bays on the far side of the crossing.
 box(section,'Concreto',[crossingX,-1.22,-42.6],[5.9,.14,7.4],true);
 for(const x of [-3.5,.0,3.5]){for(const side of [-1,1])box(section,'Branco',[x+side*1.45,y+.015,-40.0],[.10,.018,5.3]);box(section,'Branco',[x,y+.015,-42.65],[2.9,.018,.10]);box(section,'AzulVaga',[x,y+.019,-40.8],[1.25,.018,1.55]);
  const b=batch(section,'Branco'),cy=y+.032,cz=-40.65,r=.33;for(let i=0;i<36;i++){const a=i*Math.PI/18,a1=(i+1)*Math.PI/18,p=(rr,t)=>[x+rr*Math.cos(t),cy,cz+rr*Math.sin(t)];quad(b,[p(r,a),p(r,a1),p(r-.055,a1),p(r-.055,a)],[0,1,0]);}
  // Seated-person pictogram in the road plane, for visual correspondence only.
  for(let i=0;i<20;i++){const a=i*Math.PI/10,a1=(i+1)*Math.PI/10;tri(b,[[x-.1,cy,-41.18],[x-.1+.095*Math.cos(a),cy,-41.18+.095*Math.sin(a)],[x-.1+.095*Math.cos(a1),cy,-41.18+.095*Math.sin(a1)]],[0,1,0]);}
  box(section,'Branco',[x-.1,cy,-40.92],[.065,.018,.38]);box(section,'Branco',[x+.08,cy,-40.74],[.40,.018,.065]);box(section,'Branco',[x+.28,cy,-40.53],[.065,.018,.44]);box(section,'Branco',[x+.4,cy,-40.32],[.25,.018,.065]);
 }
 const aisleX=-7;for(let i=0;i<6;i++){const z=-42.45+i*.85;quad(white,[[aisleX-1.2,y,z],[aisleX-1.05,y,z],[aisleX+1.2,y,z+.65],[aisleX+1.05,y,z+.65]],[0,1,0]);}
 return {foregroundStreet:[[-105,-62],[55,-46]],crossingX,crosswalkStripes:10,parkingBays:3,arrows:4};
}