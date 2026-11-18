import { mix, quad, ribbon, triangle, up } from './multicenter-exterior-geometry.mjs';

function markingFrame([x,z], heading) {
  const cosine=Math.cos(heading), sine=Math.sin(heading);
  return (forward,side)=>[x+forward*cosine+side*sine,z+forward*sine-side*cosine];
}

function onSurface([x,z], y) {
  return [x,y(x,z),z];
}

export function paintArrow(target, centre, heading, y, length=2.85) {
  const at=markingFrame(centre,heading);
  ribbon(target,[at(-length*.50,0),at(length*.13,0)],.15,y);
  triangle(target,[at(length*.50,0),at(length*.10,-.41),at(length*.10,.41)].map(p=>onSurface(p,y)),up);
}

export function paintAccessible(blue, white, centre, heading, y, size=.99) {
  const at=markingFrame(centre,heading);
  const point=(u,v)=>at(u*size,v*size);
  const raised=(x,z)=>y(x,z)+.008;
  quad(blue,[point(-.55,-.57),point(.55,-.57),point(.55,.57),point(-.55,.57)].map(p=>onSurface(p,y)),up);
  const wheel=Array.from({length:18},(_,i)=>{
    const a=mix(.23*Math.PI,1.86*Math.PI,i/17);
    return point(-.135+Math.sin(a)*.225,-.088+Math.cos(a)*.225);
  });
  ribbon(white,wheel,.053*size,raised);
  ribbon(white,[point(.225,-.075),point(.013,-.075),point(.015,.14),point(-.234,.268),point(-.234,.34)],.055*size,raised);
  const head=point(.355,-.075);
  for(let i=0;i<10;i++){
    const p=k=>point(.355+.061*Math.sin(k*Math.PI/5),-.075+.061*Math.cos(k*Math.PI/5));
    triangle(white,[head,p(i),p(i+1)].map(v=>onSurface(v,raised)),up);
  }
}

// Each glyph uses forward distance and transverse distance in the lane.
const stopLetters = [
  [[0,0],[1,0],[1,1],[.51,1],[.51,0]],
  [[0,0],[1,.5],[0,1],[.44,.78],[.44,.22]],
  [[0,0],[1,0],[1,1],[.52,1],[.52,0],[.52,.53],[0,1]],
  [[1,1],[1,0],[0,0],[0,1],[0,0],[.51,0],[.51,.78]]
];

export function paintStop(target, centre, heading, y) {
  const at=markingFrame(centre,heading);
  ribbon(target,[at(1.2,-1.52),at(1.2,1.52)],.23,y);
  for(const [i,path] of stopLetters.entries()){
    const offset=(i-1.5)*.50-.178;
    ribbon(target,path.map(([forward,side])=>at(forward*.89-.55,offset+side*.356)),.091,y);
  }
}

export function pavementPatch(target,[x,z],width,length,y,rng) {
  const footprint=[[-.50,-.50],[-.08,-.48],[.49,-.5],[.495,.08],[.50,.49],
    [.11,.51],[-.495,.50],[-.50,.08]];
  const centre=onSurface([x,z],(a,b)=>y(a,b)+.007);
  const corners=footprint.map(([a,b])=>
    onSurface([x+(a+(rng()-.5)*.058)*width,z+(b+(rng()-.5)*.058)*length],(c,d)=>y(c,d)+.007));
  for(let i=0;i<corners.length;i++){
    triangle(target,[centre,corners[i],corners[(i+1)%corners.length]],up);
  }
}
