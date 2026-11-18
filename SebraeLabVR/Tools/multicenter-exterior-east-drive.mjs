import { beam, box, grid, mix, offsetPath, quad, random, ribbon, smooth, spline, triangle, tube, up } from './multicenter-exterior-geometry.mjs';
import { parkCar } from './multicenter-exterior-aerial.mjs';
import { paintAccessible, paintArrow, paintStop, pavementPatch } from './multicenter-exterior-markings.mjs';

export const eastDriveY = (x,z,streetY) => streetY(x,z)+.016+.29*smooth(-19,47,z);

export const eastLandings = [
  { name:'Acesso leste - passeio externo', at:[39.18,-.728,-1.2], size:[1.25,.034,2.35] },
  { name:'Acesso leste - recuo lateral', at:[23.31,-.863,-5.36], size:[1.54,.035,2.0] }
];

export function buildEastDrive(mesh, streetY, eastBankY) {
  const batch=(name,material,options)=>mesh('Acesso lateral leste do Sebraelab',name,material,options);
  const pavement=batch('Pista curva do acesso leste','Asfalto',{solid:true});
  const repair=batch('Remendos da pista lateral','AsfaltoRemendo',{shadow:false});
  const paint=batch('PARE, zebrado e setas do acesso leste','Pintura',{shadow:false});
  const yellow=batch('Eixo amarelo na curva leste','PinturaVagas',{shadow:false});
  const blue=batch('Marca acessível junto ao Sebraelab','AzulVaga',{shadow:false});
  const walk=batch('Passeio externo da curva leste','Concreto',{solid:true});
  const turf=batch('Ilha gramada junto à curva','Grama',{solid:true,shadow:false});
  const curb=batch('Lancis junto à curva leste','MeioFio',{solid:true});
  const dark=batch('Grelhas e pneus na lateral','Pneu');
  const bollards=batch('Balizadores laranja da pista','FaixaLaranja');
  const steel=batch('Perfis e ferragens da lateral','Metal');
  const glass=batch('Vidros dos carros do acesso leste','Vidro');
  const body=batch('Carrocerias claras do acesso leste','BrancoPortico',{solid:true});
  const headlights=batch('Faróis dos carros do acesso leste','Lente');
  const lampsRed=batch('Lanternas dos carros do acesso leste','FaixaVermelha');
  const wood=batch('Assentos dos bancos da ilha','MadeiraBanco');
  const rng=random(0x4b10ee62);

  const y=(x,z)=>eastDriveY(x,z,streetY);
  const paintY=(x,z)=>y(x,z)+.022;
  const path=spline([[11.3,-31.3],[20.7,-31.4],[28.85,-28.83],[33.0,-23.65],
    [34.42,-17.08],[34.29,-10.44],[34,-2.42],[34.06,7.9],[34.15,18.2],[34.9,28.4],[36.76,42.3]],7);
  const branch=spline([[17.7,-29.75],[21.55,-24.6],[23.08,-19.24],
    [24.15,-13.24],[27.83,-10.12],[33.95,-8.85]],7);
  ribbon(pavement,path,8.08,y);
  ribbon(pavement,branch,4.62,(x,z)=>y(x,z)-.008);
  for(const offset of [-.13,.13]){
    ribbon(yellow,path.slice(10),.091,paintY,offset);
  }
  const lawnSide=path.slice(9);
  ribbon(paint,lawnSide,.087,paintY,-3.81);

  function raisedCurb(line,offset){
    const street=offsetPath(line,offset);
    const outer=offsetPath(line,offset+.17);
    for(let i=1;i<line.length;i++){
      const pt=([x,z],h)=>[x,y(x,z)+h,z];
      const a=pt(street[i-1],.13), b=pt(street[i],.13), c=pt(outer[i],.13), d=pt(outer[i-1],.13);
      quad(curb,[a,b,c,d],up);
      quad(curb,[pt(street[i-1],-.018),pt(street[i],-.018),b,a]);
    }
  }
  const outside=(x,z)=>y(x,z)+.112;
  raisedCurb(lawnSide,-4.0);
  ribbon(walk,lawnSide,1.47,outside,-5.18);

  // The short access lane branches around a triangular grass island.
  const island=spline([[24.21,-26.77],[26.51,-24.78],[28.25,-21.96],[29.27,-17.54],[29.26,-13.45],
    [27.4,-13.93],[26.21,-16.92],[25.49,-21.58]],5,true);
  const centre=[26.82,-19.25];
  const grassY=(x,z)=>y(x,z)+.099+.10*(1-smooth(1.2,5.8,Math.hypot(x-centre[0],z-centre[1])));
  const hub=[centre[0],grassY(...centre),centre[1]];
  for(let i=1;i<island.length;i++){
    const [x0,z0]=island[i-1], [x1,z1]=island[i];
    const a=[x0,grassY(x0,z0),z0], b=[x1,grassY(x1,z1),z1];
    triangle(turf,[hub,a,b],up);
    quad(curb,[[x0,y(x0,z0)-.027,z0],a,b,[x1,y(x1,z1)-.027,z1]]);
  }

  // Recessed spaces beyond the lawn lead to the edge of the existing annex.
  grid(pavement,(s,t)=>{
    const x=mix(21.35,30.42,s), z=mix(-13.8,9.73,t);
    return [x,y(x,z)-.012,z];
  },10,18,up);
  ribbon(walk,[[20.98,-13.6],[20.98,9.58]],1.16,(x,z)=>y(x,z)+.13);
  for(let i=0;i<=7;i++){
    const z=-11.95+i*2.99;
    ribbon(paint,[[21.52,z],[26.42,z+.25]],.089,paintY);
  }
  const landingY=(x,z)=>eastBankY(x,z)+.027;
  grid(walk,(s,t)=>{
    const x=mix(11.62,15.85,s), z=mix(-27.32,-21.72,t);
    return [x,landingY(x,z),z];
  },5,13,up);
  paintAccessible(blue,paint,[13.65,-24.54],Math.PI/2,(x,z)=>landingY(x,z)+.016,1.47);
  for(let i=0;i<5;i++){
    const x=13.44+i*.6;
    ribbon(paint,[[x,-26.48],[x+.87,-28.66]],.143,paintY);
  }

  for(const [x,z,w,d] of [[28.73,-31.64,2.7,3.6],[30.04,-27.51,2.5,2.11],
    [33.1,-20.72,2.64,3.72],[35.9,-15.2,2.07,2.91],[22.98,-19.58,2.07,3.12],
    [25.73,-9.17,3.13,2.55],[35.03,.45,4.21,1.53]]){
    pavementPatch(repair,[x,z],w,d,y,rng);
  }
  paintStop(paint,[31.91,-22.43],-1.16,paintY);
  paintStop(paint,[22.49,-21.59],-1.47,paintY);
  paintArrow(paint,[34.61,-24.25],1.13,paintY,2.24);
  paintArrow(paint,[36.19,-10.11],Math.PI/2,paintY,2.56);
  paintArrow(paint,[31.97,-3.1],-Math.PI/2,paintY,2.56);
  for(const [x,z] of [[24.73,-26.55],[23.94,-25.24],[30.19,-25],[37.21,-20.72]]){
    const base=y(x,z)+.007;
    box(dark,[x-.18,base,z-.17],[x+.18,base+.043,z+.17]);
    tube(bollards,[x,base+.04,z],[x,base+.57,z],.139,.048,10);
    tube(paint,[x,base+.32,z],[x,base+.397,z],.087,.073,10,false);
  }
  for(const [x,z,heading] of [[23.86,-10.32,.047],[24.02,-1.69,.045],[20.36,-28.41,.035]]){
    parkCar({body,glass,dark,metal:steel,headlights,lampsRed},[x,y(x,z)-.009,z],heading);
  }
  for(const [x,z] of [[27.05,-19.15],[26.09,-23.43]]){
    const base=grassY(x,z);
    for(const zz of [z-.64,z+.64]){
      beam(steel,[x-.11,base,zz],[x-.11,base+.45,zz],.071);
      beam(steel,[x+.18,base,zz],[x+.18,base+.84,zz],.071);
    }
    for(const dx of [-.12,.0,.12]){
      box(wood,[x+dx-.055,base+.41,z-.87],[x+dx+.055,base+.476,z+.87]);
    }
    for(const h of [.63,.78]){
      box(wood,[x+.151,base+h-.05,z-.87],[x+.209,base+h+.05,z+.87]);
    }
  }
}
