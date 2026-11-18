import { box, grid, mix, ribbon, tube, up } from './multicenter-exterior-geometry.mjs';

import { parkingNorthZ } from './multicenter-exterior-visitor-parking.mjs';

const left=-42.7, right=-36.35, centre=(left+right)/2;
const lower=-53.65, upper=-38.9, crossing=-28.7;

// The wide stair climbs across the planted bank in three flights.
const flights=[
  { start:-52.75,end:-50.48,low:-.81,high:-.39 },
  { start:-48.42,end:-46.15,low:-.39,high:.03 },
  { start:-44.03,end:-41.76,low:.03,high:.45 }
];

export function plantingClearance(x,z){
  return x>left-.10&&x<right+.10&&z>lower-.5&&z<crossing+.3;
}

export const parkingLandings=[
  {name:'Passeio inferior da escadaria azul',at:[centre,-1.00,-58.65],size:[3.4,.044,1.45]},
  {name:'Patamar superior da escadaria azul',at:[centre,.467,-40.45],size:[3.5,.036,1.55]},
];

export function buildParkingStair(mesh, streetY){
  const batch=(name,material,options)=>mesh('Escadaria azul do estacionamento',name,material,options);
  const walkway=batch('Ligação de pedestres do estacionamento','Concreto',{solid:true});
  const steps=batch('Degraus e patamares azuis','ConcretoEscadaAzul',{solid:true});
  const contrast=batch('Faixas amarelas nos degraus','PinturaAmarela',{shadow:false});
  const rail=batch('Corrimãos da escadaria azul','Corrimao');
  const roadPaint=batch('Travessia da escadaria','Pintura',{shadow:false});
  const marks=batch('Vagas no estacionamento inferior','PinturaAmarela',{shadow:false});
  const tactile=batch('Piso tátil junto ao embarque','PinturaAmarela');

  function solidDeck(target,a,b,y0,y1){
    grid(target,(s,t)=>[mix(left,right,s),mix(y0,y1,t),mix(a,b,t)],6,8,up);
    for(const x of [left,right]){
      const n=[x===left?-1:1,0,0];
      const outer=x+n[0]*.12;
      grid(target,(s,t)=>[outer,mix(-1.2,mix(y0,y1,s),t),mix(a,b,s)],9,1,n);
      grid(target,(s,t)=>[mix(x,outer,s),mix(y0,y1,t),mix(a,b,t)],1,8,up);
    }
  }
  solidDeck(walkway,parkingNorthZ-.015,-62.34,-1.154,-1.15);
  solidDeck(walkway,-62.34,lower,-1.15,-.81);
  solidDeck(walkway,lower,flights[0].start,-.81,-.81);
  for(let i=0;i<flights.length;i++){
    const {start,end,low,high}=flights[i], count=4;
    for(let n=0;n<count;n++){
      const a=mix(start,end,n/count), b=mix(start,end,(n+1)/count);
      const y=mix(low,high,(n+1)/count);
      box(steps,[left,-1.2,a],[right,y,b]);
      for(const x of [left+.14, right-.83]){
        box(contrast,[x,y+.002,a+.035],[x+.69,y+.008,a+.105]);
      }
    }
    solidDeck(steps,end,flights[i+1]?.start??upper,high,high);
  }
  const roadway=streetY(centre,crossing);
  solidDeck(walkway,upper,crossing,.45,roadway+.012);

  const endGuide=[[-53.52,-.81],[-52.75,-.81],[-50.48,-.39],[-48.42,-.39],[-46.15,.03],
    [-44.03,.03],[-41.76,.45],[-39.0,.45]];
  for(const x of [left+.16,centre,right-.16]){
    for(const [z,y] of endGuide){
      tube(rail,[x,y-.01,z],[x,y+1.01,z],.031,.031,9);
    }
    for(const h of [.65,.975]){
      for(let i=1;i<endGuide.length;i++){
        const [a,y0]=endGuide[i-1], [b,y1]=endGuide[i];
        tube(rail,[x,y0+h,a],[x,y1+h,b],.028,.028,9,false);
      }
    }
  }
  for(let z=-27.9;z<=-21.4;z+=.89){
    ribbon(roadPaint,[[left+.34,z],[right-.34,z]],.48,(x,d)=>streetY(x,d)+.018);
  }
  for(let i=0;i<24;i++){
    const x=left+.2+i*(right-left-.4)/24;
    box(tactile,[x,roadway+.010,crossing-.54],[x+.11,roadway+.037,crossing-.36]);
  }
  for(const [start,count] of [[-61.45,6],[-34,16]]){
    for(let i=0;i<=count;i++){
      const x=start+i*2.72;
      ribbon(marks,[[x,-61.6],[x-.31,-57.10]],.083,(a,b)=>streetY(a,b)+.011);
    }
  }
}
