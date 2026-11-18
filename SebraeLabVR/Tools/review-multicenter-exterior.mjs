// Review renders the saved Unity mesh buffers. It approximates URP shading for offline review.
import fs from 'node:fs';
import zlib from 'node:zlib';
import { add, clamp, cross, dot, mix, mul, sub, unit, up } from './multicenter-exterior-geometry.mjs';
import { texturePath } from './multicenter-exterior-assets.mjs';
import { encodePng, sun } from './multicenter-exterior-surfaces.mjs';

function decodePng(filename) {
  const bytes=fs.readFileSync(filename), width=bytes.readUInt32BE(16), height=bytes.readUInt32BE(20);
  const channels=bytes[25]===6?4:3;
  if(bytes[24]!==8 || ![2,6].includes(bytes[25])) throw new Error('Unsupported PNG: '+filename);
  const parts=[];
  for(let i=8;i<bytes.length;) {
    const n=bytes.readUInt32BE(i), label=bytes.toString('ascii',i+4,i+8);
    if(label==='IDAT') parts.push(bytes.subarray(i+8,i+8+n));
    i+=12+n;
  }
  const raw=zlib.inflateSync(Buffer.concat(parts)), stride=width*channels, pixels=Buffer.alloc(stride*height);
  for(let y=0;y<height;y++) {
    const filter=raw[y*(stride+1)];
    for(let x=0;x<stride;x++) {
      const i=y*stride+x, a=x>=channels?pixels[i-channels]:0, b=y?pixels[i-stride]:0;
      const c=y&&x>=channels?pixels[i-stride-channels]:0, p=a+b-c;
      const pa=Math.abs(p-a), pb=Math.abs(p-b), pc=Math.abs(p-c);
      const predictor=filter===1?a:filter===2?b:filter===3?(a+b)>>1:filter===4?(pa<=pb&&pa<=pc?a:pb<=pc?b:c):0;
      pixels[i]=raw[y*(stride+1)+x+1]+predictor;
    }
  }
  return { width,height,channels,pixels };
}

function texel(tex,u,v,wrapU,wrapV) {
  const fold=(n,wrap)=>wrap ? n-Math.floor(n) : Math.min(.999999,clamp(n));
  const x=Math.min(tex.width-1,Math.floor(fold(u,wrapU)*tex.width));
  const y=Math.min(tex.height-1,Math.floor(fold(1-v,wrapV)*tex.height));
  return (y*tex.width+x)*tex.channels;
}

function raster(p,w,h,draw) {
  const [[x0,y0],[x1,y1],[x2,y2]]=p;
  const lx=Math.max(0,Math.ceil(Math.min(x0,x1,x2))), rx=Math.min(w-1,Math.floor(Math.max(x0,x1,x2)));
  const ly=Math.max(0,Math.ceil(Math.min(y0,y1,y2))), ry=Math.min(h-1,Math.floor(Math.max(y0,y1,y2)));
  if(rx<lx||ry<ly) return;
  const d=(y1-y2)*(x0-x2)+(x2-x1)*(y0-y2);
  if(Math.abs(d)<1e-8) return;
  const da=(y1-y2)/d, db=(y2-y0)/d;
  for(let y=ly;y<=ry;y++) {
    let a=((y1-y2)*(lx-x2)+(x2-x1)*(y-y2))/d, b=((y2-y0)*(lx-x2)+(x0-x2)*(y-y2))/d;
    for(let x=lx;x<=rx;x++,a+=da,b+=db) {
      const c=1-a-b;
      if(a>=-1e-5&&b>=-1e-5&&c>=-1e-5) draw(x,y,a,b,c);
    }
  }
}

function shadowMap(staged) {
  const right=unit(cross(up,sun)), vertical=cross(sun,right), size=2048;
  const center=[-32,0,-18], width=166, height=145;
  const f=(p)=>[(dot(p,right)-dot(center,right))*size/width+size/2,(dot(p,vertical)-dot(center,vertical))*size/height+size/2,dot(p,sun)];
  const depth=new Float32Array(size*size).fill(-Infinity);
  for(const batch of staged) {
    if(!batch.shadow||batch.spec.label) continue;
    for(let i=0;i<batch.vertices.length;i+=3) {
      const tri=batch.vertices.slice(i,i+3).map(v=>f(v.slice(0,3)));
      raster(tri,size,size,(x,y,a,b,c)=>{
        const z=a*tri[0][2]+b*tri[1][2]+c*tri[2][2], j=y*size+x;
        if(z>depth[j]) depth[j]=z;
      });
    }
  }
  return (p,cosine)=>{
    const [x,y,z]=f(p), a=Math.floor(x),b=Math.floor(y);
    if(a<0||b<0||a+1>=size||b+1>=size) return 1;
    const t=x-a,s=y-b,j=b*size+a;
    const bias=.075+(1-Math.max(0,cosine))*.072;
    const weight=(l)=>Number(depth[l]<=z+bias);
    return mix(mix(weight(j),weight(j+1),t),mix(weight(j+size),weight(j+size+1),t),s);
  };
}

function clip(poly,distance) {
  const result=[];
  for(let i=0;i<poly.length;i++) {
    const p=poly[i], q=poly[(i+1)%poly.length], a=distance(p), b=distance(q);
    if(a>=.12) result.push(p);
    if((a>=.12)!==(b>=.12)) {
      const t=(.12-a)/(b-a);
      result.push(p.map((v,j)=>mix(v,q[j],t)));
    }
  }
  return result;
}

export async function renderExterior({absolute,staged,views}) {
  const textures=new Map(), load=(p)=>{
    if(!textures.has(p)) textures.set(p,decodePng(absolute(p)));
    return textures.get(p);
  };
  const sky=load(texturePath('CeuMulticenter'));
  const skyPixel=(ray)=>texel(sky,Math.atan2(ray[2],ray[0])/(Math.PI*2)+.5,Math.asin(Math.max(-1,Math.min(1,ray[1])))/Math.PI+.5,true,false);
  for(const batch of staged) if(batch.spec.tex) batch.texture=load(batch.generated?texturePath(batch.spec.tex):batch.spec.tex);
  const shadow=shadowMap(staged);
  const drawOrder=staged.filter(m=>!m.spec.label).concat(staged.filter(m=>m.spec.label));
  for(const [name,{eye,target,fov}] of Object.entries(views)) {
    const w=1440,h=name==='acesso'?960:900, f=h/2/Math.tan(fov*Math.PI/360);
    const forward=unit(sub(target,eye)), right=unit(cross(up,forward)), vertical=cross(forward,right);
    const distance=(p)=>(p[0]-eye[0])*forward[0]+(p[1]-eye[1])*forward[1]+(p[2]-eye[2])*forward[2];
    const depth=new Float32Array(w*h).fill(Infinity), pixels=Buffer.alloc(w*h*3);
    const ray=(x,y)=>unit(add(add(forward,mul(right,(x-w/2)/f)),mul(vertical,(h/2-y)/f)));
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
      const i=skyPixel(ray(x,y)), j=(y*w+x)*3;
      for(let k=0;k<3;k++) pixels[j+k]=sky.pixels[i+k];
    }
    for(const batch of drawOrder) {
      const {vertices,spec,texture}=batch, color=spec.color||[1,1,1];
      for(let i=0;i<vertices.length;i+=3) {
        const triangle=vertices.slice(i,i+3);
        const top=triangle[0], normal=top.slice(3,6), toward=sub(eye,top.slice(0,3));
        if(!spec.doubleSided&&!spec.label&&dot(normal,toward)<-.035) continue;
        const clipped=clip(triangle,distance);
        for(let q=1;q<clipped.length-1;q++) {
          const v=[clipped[0],clipped[q],clipped[q+1]];
          const p=v.map(a=>{
            const d=sub(a.slice(0,3),eye), z=Math.max(.12,dot(d,forward)), inv=1/z;
            return [w/2+dot(d,right)*f*inv,h/2-dot(d,vertical)*f*inv,inv];
          });
          raster(p,w,h,(x,y,a,b,c)=>{
            const inv=a*p[0][2]+b*p[1][2]+c*p[2][2], z=1/inv, index=y*w+x;
            if(z>depth[index]+.000015) return;
            const k0=a*p[0][2]*z,k1=b*p[1][2]*z,k2=c*p[2][2]*z;
            const attr=(j)=>v[0][j]*k0+v[1][j]*k1+v[2][j]*k2;
            const j=texture?texel(texture,attr(6),attr(7),!spec.label,!spec.label):0;
            const alpha=spec.label&&texture?.channels===4?texture.pixels[j+3]/255:1;
            if(alpha<.035) return;
            const n=[attr(3),attr(4),attr(5)];
            const point=[attr(0),attr(1),attr(2)], cosine=dot(n,sun);
            const diffuse=spec.label?1:(.48+.10*clamp(n[1])+.05*clamp(-n[1]))+Math.max(0,cosine)*shadow(point,cosine)*.50;
            let reflected, fresnel;
            if(spec.glass) {
              const dir=unit(sub(eye,point)), angle=Math.max(0,dot(n,dir));
              reflected=skyPixel(unit(sub(mul(n,2*angle),dir)));
              fresnel=.16+.28*(1-angle)**3;
            }
            const fog=clamp((z-105)/141), dest=index*3;
            for(let k=0;k<3;k++) {
              const textureColor=texture&&!spec.label ? texture.pixels[j+(batch.generated||spec.photoFace?k:0)]/255 : 1;
              let shade=textureColor*color[k]*diffuse;
              if(spec.glass) shade=mix(shade,sky.pixels[reflected+k]/255,fresnel);
              if(spec.emission) shade=Math.min(1,shade+spec.emission[k]*.24);
              if(spec.metal&&!spec.glass) shade+=spec.metal*.055;
              const value=mix(shade,[.727,.8,.862][k],fog);
              pixels[dest+k]=Math.round(mix(pixels[dest+k],clamp(value)*255,alpha));
            }
            if(alpha>.5) depth[index]=z;
          });
        }
      }
    }
    const file='Docs/Previews/multicenter-exterior-'+name+'.png';
    fs.writeFileSync(absolute(file),encodePng(w,h,pixels));
    console.log('PREVIA_GEOMETRIA: '+file);
  }
}
