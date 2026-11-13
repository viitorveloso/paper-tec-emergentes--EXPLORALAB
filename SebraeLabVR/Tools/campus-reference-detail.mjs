// Photo-guided sign geometry. Source pixels remain an imported texture; the object is a mesh, not a billboard.
import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';
function solve(A,b){for(let i=0;i<b.length;i++){let r=i;for(let j=i+1;j<b.length;j++)if(Math.abs(A[j][i])>Math.abs(A[r][i]))r=j;[A[i],A[r]]=[A[r],A[i]];[b[i],b[r]]=[b[r],b[i]];const d=A[i][i];if(Math.abs(d)<1e-12)throw Error('Singular homography');for(let k=i;k<b.length;k++)A[i][k]/=d;b[i]/=d;for(let j=0;j<b.length;j++)if(j!==i){const q=A[j][i];for(let k=i;k<b.length;k++)A[j][k]-=q*A[i][k];b[j]-=q*b[i];}}return b;}
function homography(source,dest){const A=[],b=[];for(let i=0;i<4;i++){const [x,y]=source[i],[u,v]=dest[i];A.push([x,y,1,0,0,0,-u*x,-u*y]);b.push(u);A.push([0,0,0,x,y,1,-v*x,-v*y]);b.push(v);}return solve(A,b);}
const map=(h,x,y)=>{const d=h[6]*x+h[7]*y+1;return[(h[0]*x+h[1]*y+h[2])/d,(h[3]*x+h[4]*y+h[5])/d];};
function pngPixels(file){const f=fs.readFileSync(file);let w,h,type,parts=[];for(let i=8;i<f.length;){const n=f.readUInt32BE(i),kind=f.toString('ascii',i+4,i+8),b=f.subarray(i+8,i+8+n);if(kind==='IHDR'){w=b.readUInt32BE(0);h=b.readUInt32BE(4);type=b[9];if(b[8]!==8)throw Error('PNG depth');}if(kind==='IDAT')parts.push(b);i+=n+12;}const channels=type===6?4:type===2?3:0;if(!channels)throw Error('PNG type');const raw=zlib.inflateSync(Buffer.concat(parts)),data=Buffer.alloc(w*h*channels),stride=w*channels,paeth=(a,b,c)=>{const p=a+b-c,aa=Math.abs(p-a),bb=Math.abs(p-b),cc=Math.abs(p-c);return aa<=bb&&aa<=cc?a:bb<=cc?b:c;};for(let y=0;y<h;y++){const filter=raw[y*(stride+1)];for(let x=0;x<stride;x++){const i=y*stride+x,a=x>=channels?data[i-channels]:0,b=y?data[i-stride]:0,c=y&&x>=channels?data[i-stride-channels]:0;data[i]=(raw[y*(stride+1)+1+x]+(filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):filter===4?paeth(a,b,c):0))&255;}}return{w,h,channels,data};}
export function detailedSign(ctx){
 const {root,write,guid,meta,textureMeta,assetDir,specs,materials,materialTemplate,batch,tri,quad,polygon,box,tube}=ctx;
 const section='Sebraelab - placa escultural',sx=12.6,sy=2.5,sz=-20.05,width=3.65,height=1.05;
 const photoCorners=[[414,310],[1060,258],[1052,541],[415,462]],planeCorners=[[-width/2,height/2],[width/2,height/2],[width/2,-height/2],[-width/2,-height/2]],toPlane=homography(photoCorners,planeCorners),toPhoto=homography(planeCorners,photoCorners);
 const texPath=assetDir+'/Textures/PlacaReferencia.png',pixels=pngPixels(path.join(root,texPath));textureMeta(texPath);
 const photoMaterial=assetDir+'/Materials/PlacaFoto.mat';let mat=materialTemplate.replace('m_Name: ShowroomBranco','m_Name: PlacaSebraeLabDaReferencia');
 for(const key of ['_BaseColor','_Color'])mat=mat.replace(new RegExp('- '+key+': \\{[^}]+\\}'),'- '+key+': {r: 1, g: 1, b: 1, a: 1}');
 mat=mat.replace(/(- _BaseMap:\n        m_Texture:) \{[^}]+\}/,'$1 {fileID: 2800000, guid: '+guid(texPath)+', type: 3}').replace(/- _Smoothness: [^\n]+/,'- _Smoothness: 0.38');
 write(photoMaterial,mat);meta(photoMaterial,'NativeFormatImporter','  mainObjectFileID: 2100000\n');materials.PlacaFoto=guid(photoMaterial);specs.PlacaFoto={color:[1,1,1],tex:texPath,smooth:.38,photoFace:true};
 const world=(p,z)=>{const a=map(toPlane,...p);return[sx+a[0],sy+a[1],z];},uv=p=>[p[0]/pixels.w,1-p[1]/pixels.h];
 // Separate folded plates, traced from visible edges in the photograph. The cropped bottom is inferred.
 const pieces=[
  {name:'face esquerda',pixels:[[302,364],[624,0],[679,242],[654,282],[411,306],[411,465],[469,520],[502,482],[661,515],[655,646],[500,800],[308,543]],z:sz+.03,depth:.38},
  {name:'dobra superior esquerda',pixels:[[624,0],[742,0],[795,217],[680,242]],z:sz+.25,depth:.35},
  {name:'face superior direita',pixels:[[733,277],[927,72],[998,256]],z:sz+.04,depth:.38},
  {name:'dobra superior direita',pixels:[[927,72],[1054,89],[1194,390],[1064,449],[1065,254],[998,256]],z:sz+.28,depth:.32},
  {name:'face inferior direita',pixels:[[655,646],[790,510],[875,549],[1059,712],[891,843]],z:sz+.03,depth:.38},
  {name:'dobra inferior direita',pixels:[[1059,712],[1178,645],[1048,908],[891,843]],z:sz+.28,depth:.32},
 ];
 for(const piece of pieces){const points=piece.pixels.map(p=>world(p,piece.z));const photoBatch=batch(section,'PlacaFoto',true),start=photoBatch.vertices.length;polygon(section,'PlacaFoto',points.map(p=>p.slice(0,2)),piece.z,piece.depth,true);const added=photoBatch.vertices.splice(start); // Retexture front faces, use neutral painted metal on sides/back.
  for(let i=0;i<added.length;i+=3){const t=added.slice(i,i+3);if(t[0][5]<-.5){for(const v of t){const p=map(toPhoto,v[0]-sx,v[1]-sy);v[10]=p[0]/pixels.w;v[11]=1-p[1]/pixels.h;}photoBatch.vertices.push(...t);}else batch(section,t[0][5]>.5?'Branco':'CinzaDobras',true).vertices.push(...t);}
  // Narrow folded-metal seams, following actual traced edges rather than arbitrary diagonal strips.
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];tube(section,'Branco',[a[0],a[1],a[2]-.004],[b[0],b[1],b[2]-.004],.006,6);}
 }
 // Black support has real thickness; its front is projectively mapped from the actual plaque.
 box(section,'PretoPlaca',[sx,sy,sz-.075],[width,height,.19],true);
 const frontZ=sz-.177;
 for(let iy=0;iy<16;iy++)for(let ix=0;ix<48;ix++){
  const x0=-width/2+width*ix/48,x1=-width/2+width*(ix+1)/48,y0=-height/2+height*iy/16,y1=-height/2+height*(iy+1)/16;
  const pts=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],vs=pts.map(p=>[sx+p[0],sy+p[1],frontZ]),uvs=pts.map(p=>uv(map(toPhoto,...p)));
  quad(batch(section,'PlacaFoto'),vs,[0,0,-1],uvs);
 }
 // Build genuinely raised letters from the light glyphs of the reference panel, preserving its custom lettering.
 const cols=320,rows=100,mask=new Uint8Array(cols*rows),stepX=width/cols,stepY=height/rows;
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const wx=-width/2+(x+.5)*stepX,wy=height/2-(y+.5)*stepY,p=map(toPhoto,wx,wy),px=Math.round(p[0]),py=Math.round(p[1]);
  if(px<425||px>906||py<322||py>486||px>=pixels.w||py>=pixels.h)continue;
  const k=(py*pixels.w+px)*pixels.channels,r=pixels.data[k],g=pixels.data[k+1],b=pixels.data[k+2];if((r+g+b)/3>145&&Math.max(r,g,b)-Math.min(r,g,b)<45)mask[y*cols+x]=1;
 }
 let filled=0;const letterZ=frontZ-.045;
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(mask[y*cols+x]){
  filled++;const x0=sx-width/2+x*stepX,x1=x0+stepX,y1=sy+height/2-y*stepY,y0=y1-stepY;
  const p=[[x0,y0,letterZ],[x1,y0,letterZ],[x1,y1,letterZ],[x0,y1,letterZ]];quad(batch(section,'PlacaFoto'),p,[0,0,-1],p.map(v=>uv(map(toPhoto,v[0]-sx,v[1]-sy))));
  if(x===0||!mask[y*cols+x-1])quad(batch(section,'CinzaDobras'),[[x0,y0,frontZ],[x0,y1,frontZ],[x0,y1,letterZ],[x0,y0,letterZ]],[-1,0,0]);
  if(x===cols-1||!mask[y*cols+x+1])quad(batch(section,'Branco'),[[x1,y0,letterZ],[x1,y1,letterZ],[x1,y1,frontZ],[x1,y0,frontZ]],[1,0,0]);
  if(y===0||!mask[(y-1)*cols+x])quad(batch(section,'Branco'),[[x0,y1,letterZ],[x1,y1,letterZ],[x1,y1,frontZ],[x0,y1,frontZ]],[0,1,0]);
  if(y===rows-1||!mask[(y+1)*cols+x])quad(batch(section,'CinzaDobras'),[[x0,y0,frontZ],[x1,y0,frontZ],[x1,y0,letterZ],[x0,y0,letterZ]],[0,-1,0]);
 }
 for(const x of [sx-1.1,sx+1.0])box(section,'Aco',[x,.35,sz+.3],[.07,.7,.07],true);
 const data={source:texPath,blackPanelPhotoCorners:photoCorners,toPlane,toPhoto,pieces,origin:[sx,sy,sz],panelSize:[width,height],raisedLetterDepth:.045,raisedLetterPixels:filled,bottomInferred:true};write('Tools/sebraelab-reference-trace.json',JSON.stringify(data,null,2));return data;
}
export { pngPixels };
