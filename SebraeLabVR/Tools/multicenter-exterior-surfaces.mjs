import zlib from 'node:zlib';
import { clamp, mix, smooth, unit } from './multicenter-exterior-geometry.mjs';

export const sun = unit([0.37, 0.77, -0.52]);

const table = Array.from({length:256},(_,n) => {
  for (let i=0;i<8;i++) n=(n&1) ? 0xedb88320^(n>>>1) : n>>>1;
  return n>>>0;
});

export function encodePng(width,height,pixels) {
  const chunk = (tag,buffer) => {
    const data=Buffer.alloc(buffer.length+12);
    data.writeUInt32BE(buffer.length);
    data.write(tag,4,'ascii');
    buffer.copy(data,8);
    let crc=0xffffffff;
    for(let i=4;i<data.length-4;i++) crc=table[(crc^data[i])&255]^(crc>>>8);
    data.writeUInt32BE((crc^0xffffffff)>>>0,data.length-4);
    return data;
  };
  const header=Buffer.alloc(13);
  header.writeUInt32BE(width);
  header.writeUInt32BE(height,4);
  header[8]=8;
  header[9]=2;
  const raw=Buffer.alloc((width*3+1)*height);
  for(let y=0;y<height;y++) {
    const offset=y*(width*3+1);
    // PNG's Sub filter keeps slowly varying colour fields small.
    raw[offset]=1;
    for(let x=0;x<width*3;x++) {
      const i=y*width*3+x;
      raw[offset+x+1]=pixels[i]-(x>=3?pixels[i-3]:0);
    }
  }
  return Buffer.concat([
    Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),
    chunk('IDAT',zlib.deflateSync(raw,{level:6})),chunk('IEND',Buffer.alloc(0))
  ]);
}

function hash(x,y,seed=0) {
  let n=Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(seed,144264919);
  n=Math.imul(n^(n>>>13),1274126177);
  return ((n^(n>>>16))>>>0)/4294967295;
}

function noise(x,y,frequency,seed) {
  const a=x*frequency,b=y*frequency, i=Math.floor(a),j=Math.floor(b);
  const k=a-i,l=b-j, u=k*k*(3-2*k),v=l*l*(3-2*l);
  const at=(p,q)=>hash((p%frequency+frequency)%frequency,(q%frequency+frequency)%frequency,seed);
  return mix(mix(at(i,j),at(i+1,j),u),mix(at(i,j+1),at(i+1,j+1),u),v);
}
const edge = (x, count) => Math.abs(x*count - Math.round(x*count));
const comb = (x,y,seed) => .52*noise(x,y,5,seed) + .29*noise(x,y,14,seed) + .19*noise(x,y,49,seed);
const shift = (rgb, amount) => rgb.map(v => clamp(v+amount));

const patterns = {
  SaibroServico(u,v,g) {
    const clod=comb(u,v,52), dust=noise(u,v,143,22);
    const tint=(clod-.5)*.22+(dust-.5)*.08+(g-.5)*.063;
    return [shift([.51,.393,.268],tint),clod*.55+dust*.31+g*.14];
  },
  PisoPortaria(u,v,g) {
    const row=Math.floor(v*10), x=u+(row%2)*.05;
    const grit=comb(u,v,39), stone=hash(Math.floor((x%1)*10),row,27);
    const grout=smooth(.012,.047,Math.min(edge(x,10),edge(v,10)));
    const face=(stone-.48)*.08+(grit-.50)*.123+(g-.5)*.05;
    return [shift([.386,.369,.345],face-(1-grout)*.104),grout*.48+.28*grit+.14*g];
  },
  Asfalto(u,v,g) {
    const sediment=comb(u,v,28), stone=noise(u,v,175,42);
    const d=(sediment-.45)*.132+(g-.5)*.047+(stone>.72?.039:0);
    return [shift([.294,.292,.278],d),.41*g+.4*stone+.19*sediment];
  },
  Concreto(u,v,g) {
    const granule=noise(u,v,105,63), stain=comb(u,v,24);
    const joint=smooth(0,.011,Math.min(edge(u,3),edge(v,3)));
    const d=(stain-.52)*.144+(g-.5)*.073+(granule-.48)*.042-(1-joint)*.16;
    return [shift([.705,.686,.644],d),.22*g+.21*granule+.24*stain+.32*joint];
  },
  Pedra(u,v,g) {
    const row=Math.floor(v*5), x=u+(row%2)*.1;
    const tile=hash(Math.floor((x%1)*5),row,13);
    const grout=smooth(0,.013,Math.min(edge(x,5),edge(v,5)));
    const grain=comb(u,v,79), fleck=noise(u,v,102,78);
    const d=(tile-.5)*.155+(grain-.48)*.245+(g-.5)*.094+(fleck-.5)*.064;
    return [[.642+d,.605+d,.563+d].map(c=>clamp(mix(.435,c,grout))),.22*grain+.15*g+.15*fleck+grout*.61];
  },
  Chapa(u,v,g) {
    const wave=.5+.5*Math.cos(u*12*2*Math.PI);
    const seam=smooth(0,.022,edge(v,3));
    const d=(comb(u,v,27)-.5)*.094+(g-.5)*.045+(wave-.5)*.108-(1-seam)*.081;
    return [shift([.901,.712,.222],d),.8*wave+.06*g+.10*seam];
  },
  Telha(u,v,g) {
    const wave=.5+.5*Math.cos(v*12*2*Math.PI), stain=comb(u,v,41);
    return [shift([.795,.811,.816],(stain-.46)*.212+(wave-.5)*.09+(g-.5)*.058),.33*wave+.12*g+.48*stain];
  },
  Forro(u,v,g) {
    const wave=.5+.5*Math.cos(v*12*2*Math.PI), stain=comb(u,v,94);
    return [shift([.583,.549,.483],(stain-.45)*.26+(wave-.5)*.09+(g-.5)*.053),.29*wave+.12*g+.48*stain];
  },
  Grama(u,v,g) {
    const wet=comb(u,v,48), blade=noise(u,v,118,93);
    const dry=smooth(.36,.7,wet), tint=(g-.5)*.103+(blade-.49)*.132;
    return [[mix(.258,.467,dry)+tint,mix(.35,.478,dry)+tint,mix(.154,.251,dry)+tint],.41*g+.29*blade+.3*wet];
  },
  Estrias(u,v,g) {
    const vein=noise(u,v,9,3)*.45+noise(u*2,v*.25,17,84)*.4;
    return [shift([.402,.342,.259],(vein-.45)*.30+(g-.5)*.119),.31*g+.69*vein];
  },
  Pintura(u,v,g) {
    const worn=noise(u,v,72,73)*.39+noise(u,v,25,92)*.27+g*.31;
    const coverage=smooth(.09,.42,worn);
    return [[mix(.34,.92,coverage),mix(.34,.897,coverage),mix(.32,.835,coverage)],0];
  }
};

export function surfaceMaps(writeTexture) {
  const side=512;
  const gradients={Asfalto:.54,Concreto:.64,Pedra:.97,Chapa:1.14,Telha:.76,Forro:.92,Grama:.56,Estrias:.8};
  for(const [name,pattern] of Object.entries(patterns)) {
    const colors=Buffer.alloc(side*side*3), height=new Float32Array(side*side);
    for(let y=0;y<side;y++) for(let x=0;x<side;x++) {
      const i=y*side+x;
      const [rgb,z]=pattern(x/side,y/side,hash(x,y,14));
      height[i]=z;
      for(let j=0;j<3;j++) colors[i*3+j]=Math.round(clamp(rgb[j])*255);
    }
    writeTexture(name,side,side,colors);
    const strength=gradients[name];
    if(!strength) continue;
    const normals=Buffer.alloc(colors.length);
    const sample=(x,y)=>height[((y+side)%side)*side+(x+side)%side];
    for(let y=0;y<side;y++) for(let x=0;x<side;x++) {
      const normal=unit([(sample(x-1,y)-sample(x+1,y))*strength,(sample(x,y+1)-sample(x,y-1))*strength,1]);
      for(let j=0;j<3;j++) normals[(y*side+x)*3+j]=Math.round((normal[j]*.5+.5)*255);
    }
    writeTexture(name+'Normal',side,side,normals,{normal:true});
  }
}

export function skyColor(dir) {
  const [x,y,z] = dir;
  const ramp = Math.max(0,y)**.54;
  let color = [mix(.798,.248,ramp),mix(.853,.479,ramp),mix(.893,.740,ramp)];
  if(y<0) color=color.map((c,i)=>mix(c,[.255,.279,.282][i],smooth(0,.56,-y)));
  if(y>0) {
    // Sample a horizontal cloud field in direction space. It has no seam at the panorama wrap.
    const u=.5+x/(.83+y)*.29, v=.5+z/(.83+y)*.31;
    const broad=.64*noise(u,v*1.46,6,42)+.23*noise(u,v*1.46,15,41)+.13*noise(u,v*1.46,50,69);
    const thin=noise(u*1.7+v*.33,v*2.75,14,17)*.7+noise(u,v,36,26)*.3;
    const cover=(smooth(.485,.757,broad)*.86 + smooth(.59,.797,thin)*.19)*smooth(.025,.29,y);
    const bright=.83+Math.max(0,x*sun[0]+y*sun[1]+z*sun[2])*.137;
    color=color.map((c,i)=>mix(c,bright+[.013,.024,.033][i],cover));
  }
  const angle=Math.max(0,x*sun[0]+y*sun[1]+z*sun[2]);
  const glare=angle**68*.13+smooth(.99978,.99993,angle)*.60;
  return color.map(c=>clamp(c+glare));
}

export function skyMap(writeTexture) {
  const width=1536,height=768,pixels=Buffer.alloc(width*height*3);
  for(let y=0;y<height;y++) {
    const pitch=(.5-(y+.5)/height)*Math.PI, cy=Math.cos(pitch), sy=Math.sin(pitch);
    for(let x=0;x<width;x++) {
      const angle=((x+.5)/width-.5)*Math.PI*2;
      const rgb=skyColor([Math.cos(angle)*cy,sy,Math.sin(angle)*cy]);
      for(let i=0;i<3;i++) pixels[(y*width+x)*3+i]=Math.round(rgb[i]*255);
    }
  }
  writeTexture('CeuMulticenter',width,height,pixels,{panorama:true});
}
