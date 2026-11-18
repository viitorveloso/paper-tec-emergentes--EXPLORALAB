import { add, beam, box, clamp, front, grid, mix, mul, quad, random, ribbon, smooth, spline, sub, triangle, truss, tube, unit, up } from './multicenter-exterior-geometry.mjs';

import { buildAvenueContext, buildEntrance, buildWestBlock } from './multicenter-exterior-entrance.mjs';
import { barrelSkin, buildServiceYard, WingBays } from './multicenter-exterior-aerial.mjs';
import { buildParkingStair, parkingLandings, plantingClearance } from './multicenter-exterior-parking-stair.mjs';

import { avenueShiftZ, buildVisitorParking, visitorLandings } from './multicenter-exterior-visitor-parking.mjs';
import { buildEastDrive, eastLandings } from './multicenter-exterior-east-drive.mjs';

const wingEdge = -73.48;
const wingBack = 27.3;
const wingFront = -52.5;
const plazaFront = -20.4;
const ground = -1.198;
const walkWidth = 2.62;
const walkStart = -54;
const walkX = (z) => -75.8 - 3.15 * Math.exp(-(((z + 35) / 9.3) ** 2)) + 3.4 * smooth(-33,plazaFront,z);
const walkY = (z) => mix(-1.13, 0, clamp((z - walkStart) / (plazaFront - walkStart)));
const streetY = (x, z) => -1.16 + (1.02 - 0.78 * smooth(-24, 4, x)) * smooth(-51, plazaFront, z);
const paintY = (x, z) => streetY(x, z) + 0.014;
const eastBankY = (x,z) => streetY(x,z)+.94*smooth(-28,-19.57,z)*(1-.35*clamp((x-11.56)/(18.8-11.56)));
const island = spline([[-58.8,-39.5],[-49.2,-32.0],[-33.4,-29.55],[-17.5,-29.1],
  [-4.8,-28.37],[3.4,-29.78],[11.2,-34.9],[14.15,-38.1],[7.2,-41.44],
  [-6,-42.05],[-19.4,-46.5],[-30.4,-52.3],[-44.8,-53.3],[-55.9,-49.3]],6,true);
const islandCenter = [-22,-40.6];
const islandHeight = (x,z,r) => {
  const base=streetY(x,z);
  return plantingClearance(x,z)?base-.035:base+.16+.16*(1-r*r);
};

export const views = {
  acesso: { eye: [-76.25, 0.62, -51.6], target: [-44.5, 4.15, -12.0], fov: 59 },
  fachada: { eye: [-63.2, 1.63, -36.3], target: [-50, 4.3, -16.9], fov: 64 },
  campus: { eye: [-91, 34, -91], target: [-36, 3.2, -13], fov: 48 },
  portaria: { eye: [-53.8,.76,-96.9+avenueShiftZ], target: [-41.7,2.52,-74.1+avenueShiftZ], fov: 60 },
  bloco: { eye: [-116,1.0,-73], target: [-105.2,3.05,-49.4], fov: 60 },
  aeria: { eye: [-184.7,57,-103], target: [-81,4,-4], fov: 48 },
  estacionamento: { eye: [-55,51,-72], target: [-38,1.1,-29], fov: 55 },
  frente: { eye: [-106,76,-127], target: [-65,1,-32], fov: 60 },
  patio: { eye: [-40,112,-37.5], target: [-40,-.9,-138.5], fov: 60 },
  curvaLeste: { eye: [49.9,25.4,-43.6], target: [21.5,.6,-14.25], fov: 55 },
  anexo: { eye: [22, 3.86, -32.6], target: [12.2, 2.32, -17.45], fov: 51 }
};

export function buildExterior(mesh, signMask) {
  buildWing(mesh);
  buildWestBlock(mesh);
  buildServiceYard(mesh);
  buildStreet(mesh);
  buildParkingStair(mesh, streetY);
  buildVisitorParking(mesh);
  buildEastDrive(mesh, streetY, eastBankY);
  buildEntrance(mesh, signMask);
  buildAvenueContext(mesh);
  buildFacadeDetails(mesh);
  buildGardens(mesh);
  buildUtilities(mesh);
}

function buildWing(mesh) {
  const batch = (name, material, options) => mesh('Ala esquerda coberta', name, material, options);
  const west = -134.5;
  const roofTop = batch('Telhado ondulado', 'TelhaPrincipal');
  const roofUnder = batch('Face inferior da telha', 'ForroPavilhao');
  const steel = batch('Trelicas e terças', 'AcoAzul');
  const columns = batch('Pilares da cobertura', 'AcoAzul', { solid: true });
  const molding = batch('Arremates da cobertura', 'Amarelo');
  const floor = batch('Piso e bases de concreto', 'Concreto', { solid: true });
  const walls = batch('Mureta de paineis claros', 'Reboco', { solid: true });
  const dark = batch('Portas e grelhas tecnicas', 'Caixilho');
  const roofY = x => mix(8.24,8.18,(x-west)/(wingEdge-west));
  barrelSkin(roofTop,west,wingEdge,WingBays,{west:.06,columns:19});
  barrelSkin(roofUnder,west,wingEdge,WingBays,{west:.06,under:true,columns:19});
  for(const z of WingBays.slice(1,-1)) {
    box(roofTop,[west,8.248,z-.075],[wingEdge,8.294,z+.075]);
  }
  box(molding,[wingEdge-.19,5.87,wingFront],[wingEdge+.012,8.56,-17.66]);
  box(molding,[west-.12,6.64,wingFront],[west+.04,8.31,wingBack]);
  for (let i = 0; i < 13; i++) {
    const x0 = mix(west,wingEdge,i/13), x1 = mix(west,wingEdge,(i+1)/13);
    const y0 = roofY(x0)-.04, y1 = roofY(x1)-.04;
    quad(molding,[[x0,y0-1.35,wingFront-.034],[x1,y1-1.35,wingFront-.034],
      [x1,y1,wingFront-.034],[x0,y0,wingFront-.034]],front);
  }

  const floorY = (z) => -.84 + .84 * smooth(walkStart,plazaFront,z);
  grid(floor, (s,t) => {
    const z = mix(-54,wingBack,t);
    const edge = z <= plazaFront ? Math.min(wingEdge, walkX(z) - walkWidth/2 - .025) : wingEdge;
    return [mix(west,edge,s),floorY(z),z];
  },3,115,up);
  const rowPositions = [-50,-39.5,-29,-18.5,-8,2.5,13,23.5];
  for (const z of rowPositions) {
    for (const x of [-130.5,-114.16,-97.84,-81.3]) {
      const y = floorY(z);
      box(floor,[x-.47,y,z-.46],[x+.47,y+.12,z+.46]);
      box(columns,[x-.26,y+.1,z-.29],[x+.26,7.58,z+.29]);
      box(steel,[x-.3,7.36,z-.34],[x+.3,7.61,z+.34]);
    }
    truss(steel,[west+.24,8.07,z],[wingEdge-.16,8.07,z],.78,12,.14);
  }
  for (const x of [west+.3,-130.5,-122.33,-114.16,-106.0,-97.84,-89.57,-81.3,wingEdge-.18]) {
    for (let i = 1; i < rowPositions.length; i++) {
      const a = [x,8.1,rowPositions[i-1]], b = [x,8.1,rowPositions[i]];
      if ([-130.5,-114.16,-97.84,-81.3,wingEdge-.18].includes(x)) truss(steel,a,b,.66,6,.11);
      else beam(steel, a, b, .08);
    }
  }
  const lamps = batch('Luminarias industriais', 'Metal');
  const lenses = batch('Difusores das luminarias', 'Lente');
  for (const z of [-44.75,-34.25,-23.75,-13.25,-2.75,7.75,18.25]) {
    for (const x of [-125.6,-109.5,-93.5,-80.1]) {
      tube(steel,[x,8.18,z],[x,7.57,z],.013,.013,6,false);
      tube(lamps,[x,7.57,z],[x,7.37,z],.11,.23,12,false);
      tube(lenses,[x,7.367,z],[x,7.344,z],.211,.211,12);
    }
  }

  for (const [a,b] of [[-12,-4.7],[2,19]]) {
    const x = -79.9;
    box(walls,[x-.16,floorY(a)-.02,a],[x+.16,1.68,b]);
    box(floor,[x-.2,1.68,a],[x+.2,1.732,b]);
    for (let z = a; z <= b; z += 2.45) box(floor,[x-.17,floorY(z),z-.045],[x+.18,1.73,z+.045]);
  }
  box(walls,[-91.1,0,-14.7],[-84,3.42,-8.95]);
  box(floor,[-91.25,3.42,-14.85],[-83.86,3.54,-8.8]);
  box(dark,[-85.88,.04,-14.75],[-84.52,2.21,-14.68]);
  box(dark,[-89.26,2.43,-14.76],[-87.16,2.99,-14.67]);
  for (let y = 2.47; y < 2.99; y += .074) box(steel,[-89.24,y,-14.78],[-87.18,y+.024,-14.76]);
}

function buildStreet(mesh) {
  const batch = (name, material, options) => mesh('Acessos, via e estacionamento', name, material, options);
  const asphalt = batch('Pavimento continuo', 'Asfalto', { solid: true });
  const terrain = batch('Solo do campus', 'Grama', { solid: true, shadow: false });
  const concrete = batch('Passeios, patamares e escada', 'Concreto', { solid: true });
  const curbs = batch('Meios-fios e muros de contencao', 'MeioFio', { solid: true });
  const lawn = batch('Canteiro central em talude', 'Grama', { solid: true });
  const white = batch('Pintura branca de transito', 'Pintura', { shadow: false });
  const yellow = batch('Dupla faixa amarela', 'PinturaAmarela', { shadow: false });
  const blue = batch('Baia de embarque acessivel', 'AzulVaga', { shadow: false });
  const rail = batch('Corrimaos de tubo azul', 'Corrimao');
  const earth = batch('Taludes no passeio leste', 'Grama', { solid: true });

  const corner=spline([[-139.4,-61.5],[-125,-61.55],[-108,-61.7],[-91,-61.82],[-77,-61.62],
    [-70.9,-59.43],[-67.96,-55.2],[-66.9,-49.6]],9);
  const cornerY=(x,z)=>Math.max(-1.137,streetY(x,z)+.012);
  ribbon(asphalt,corner,8.82,cornerY);
  for(const offset of [-.14,.14]){
    ribbon(yellow,corner,.105,(x,z)=>cornerY(x,z)+.013,offset);
  }
  for (const offset of [-4.16,4.16]) ribbon(white,corner,.091,(x,z)=>cornerY(x,z)+.013,offset);
  const curbPath=[
    [-138.75,-56.6],
    ...spline([[-83,-56.6],[-80,-56.55],[-77.94,-56.08],[-76.63,-55.28],[walkX(walkStart),walkStart]],8)
  ];
  const frontWalkY=(x)=>mix(-1.003,walkY(walkStart),smooth(-82,walkX(walkStart),x));
  ribbon(concrete,curbPath,1.25,frontWalkY,.48);
  ribbon(curbs,curbPath,.16,(x)=>frontWalkY(x)+.052,-.105);
  box(terrain,[-223,ground-.52,-269],[128,ground,105]);
  for(const [a,b] of [[-136.5,-125.25],[-123.35,-106.28],[-104.23,-78.05]]){
    box(lawn,[a,-1.195,-55.49],[b,-.94,-53.71]);
  }
  for(const [a,b] of [[-125.25,-123.35],[-106.28,-104.23]]){
    grid(concrete,(s,t)=>[mix(a,b,s),mix(-1.003,-.837,t),mix(-55.52,-53.9,t)],2,2,up);
  }
  for(const [a,b] of [[-137.6,-126.05],[-122.55,-107.07],[-103.44,-83]]){
    const z=-56.57, span=Math.ceil((b-a)/2.6);
    for(let i=0;i<=span;i++){
      const x=mix(a,b,i), y=frontWalkY(x);
      tube(rail,[x,y,z],[x,y+.93,z],.034,.034,10);
      tube(rail,[x,y,z],[x,y+.026,z],.066,.053,10);
    }
    for(const h of [.63,.93]) tube(rail,[a,frontWalkY(a)+h,z],[b,frontWalkY(b)+h,z],.033);
  }
  const forecourtEdge=z=>mix(36.8,20.3,smooth(-43.7,-35.6,z));
  grid(asphalt,(s,t) => {
    const z = mix(-62.7,plazaFront,t);
    const x = mix(walkX(z)+walkWidth/2,forecourtEdge(z),s);
    return [x,streetY(x,z),z];
  },46,100,up);
  const forecourtPath=Array.from({length:44},(_,i)=>{
    const z=mix(-62.57,-37.5,i/43);
    return [forecourtEdge(z),z];
  });
  ribbon(curbs,forecourtPath,.17,(x,z)=>streetY(x,z)+.132);
  ribbon(concrete,forecourtPath,1.21,(x,z)=>streetY(x,z)+.108,-.66);
  for(const [start,end] of [[-80,-69],[-13,36.83]]) {
    box(concrete,[start,-1.39,-67.4],[end,-1.12,-62.65]);
    box(curbs,[start,-1.33,-62.84],[end,-1.025,-62.62]);
  }

  const rampX = (s,z) => walkX(z) + (s-.5) * walkWidth;
  grid(concrete,(s,t) => {
    const z = mix(walkStart,plazaFront,t);
    return [rampX(s,z),walkY(z),z];
  },2,112,up);
  box(concrete,[walkX(walkStart)-walkWidth/2,-1.24,-67.36],[walkX(walkStart)+walkWidth/2,-1.13,walkStart+.025]);
  for (const side of [0,1]) {
    const n = [side === 0 ? -1 : 1,0,0], edge = (z) => rampX(side,z);
    const postX = (z) => edge(z) - n[0]*.145;
    for (let i = 0; i < 112; i++) {
      const a = mix(walkStart,plazaFront,i/112), b = mix(walkStart,plazaFront,(i+1)/112);
      const x0 = edge(a), x1 = edge(b), h0 = walkY(a)+.11, h1 = walkY(b)+.11, w = -.19*n[0];
      quad(curbs,[[x0,ground,a],[x0,h0,a],[x1,h1,b],[x1,ground,b]],n);
      quad(curbs,[[x0,h0,a],[x0+w,h0,a],[x1+w,h1,b],[x1,h1,b]],up);
      quad(curbs,[[x0+w,walkY(a),a],[x1+w,walkY(b),b],[x1+w,h1,b],[x0+w,h0,a]],mul(n,-1));
    }
    for (let i = 0; i <= 21; i++) {
      const z = mix(walkStart+.43,plazaFront-.52,i/21), x = postX(z), y = walkY(z)+.107;
      tube(rail,[x,y,z],[x,y+.85,z],.034,.034,10);
      tube(rail,[x,y,z],[x,y+.027,z],.059,.046,10);
    }
    for (const h of [.65,.96]) {
      const run = Array.from({ length: 57 }, (_,i) => {
        const z = mix(walkStart+.16,plazaFront-.3,i/56);
        return [postX(z),walkY(z)+h,z];
      });
      for (let i = 1; i < run.length; i++) tube(rail,run[i-1],run[i],.035,.035,10,false);
      for (const p of [run[0],run.at(-1)]) tube(rail,p,add(p,[0,-.1,0]),.035);
    }
  }

  const plazaCuts = [-75,-53.6,-49.1,4.54];
  for (let i = 1; i < plazaCuts.length; i++) {
    const a = plazaCuts[i-1], b = plazaCuts[i], curbRamp = i === 2;
    grid(concrete,(s,t) => {
      const x = mix(a,b,s), z = mix(plazaFront,-14.95,t);
      const dip = curbRamp ? -.14 * (1-smooth(plazaFront,-19.0,z)) * Math.sin(s*Math.PI)**.4 : 0;
      return [x,dip,z];
    },Math.ceil((b-a)/.64),8,up);
    grid(curbs,(s,t) => {
      const x = mix(a,b,s), bottom = streetY(x,plazaFront) - .05;
      const top = curbRamp ? -.14 * Math.sin(s*Math.PI)**.4 : 0;
      return [x,mix(bottom,top,t),plazaFront-.012];
    },Math.ceil((b-a)/.64),1,front);
  }

  const stairA = 4.74, stairB = 11.56, stairZ = -26.07, risers = 8;
  const stepY = streetY(8,stairZ);
  const stepEnd = -20.72;
  for (let i = 0; i < risers; i++) {
    const z = mix(stairZ,stepEnd,i/risers), end = mix(stairZ,stepEnd,(i+1)/risers);
    const y = mix(stepY,0,(i+1)/risers);
    box(concrete,[stairA,ground,z],[stairB,y,end]);
    box(curbs,[stairA,y,z+.044],[stairB,y+.006,z+.073]);
  }
  box(concrete,[stairA,-.42,stepEnd],[18.05,0,-19.54]);
  for (const x of [stairA+.13,(stairA+stairB)/2,stairB-.13]) {
    for (let i = 0; i <= 4; i++) {
      const z = mix(stairZ+.13,stepEnd-.12,i/4), y = mix(stepY,0,i/4);
      tube(rail,[x,y,z],[x,y+.99,z],.032);
    }
    for (const h of [.66,.94]) tube(rail,[x,stepY+h,stairZ+.02],[x,h,stepEnd],.034);
  }
  grid(earth,(s,t) => {
    const x = mix(stairB,18.8,s), z = mix(-29,-19.57,t);
    return [x,eastBankY(x,z),z];
  },29,22,up);

  const lane = spline([[-66.9,-49.6],[-69.3,-40.2],[-67.6,-33],[-61.7,-27.8],
    [-53.2,-25.05],[-40.4,-24.28],[-22,-24],[-8.5,-23.56],[0,-23.6],[4,-25.9]], 9);
  for (const offset of [-.14,.14]) {
    for (const segment of [
      lane.filter(([x])=>x<-55.5),
      lane.filter(([x])=>x>-48.55&&x<-42.96),
      lane.filter(([x])=>x>-36.08)
    ]) {
      ribbon(yellow,segment,.102,paintY,offset);
    }
  }
  grid(lawn, (s,t) => {
    const [px,pz] = island[Math.round(s*(island.length-1))];
    const x = mix(islandCenter[0],px,t), z = mix(islandCenter[1],pz,t);
    return [x,islandHeight(x,z,t),z];
  },island.length-1,10,up);
  for (let i = 1; i < island.length; i++) {
    const [x,z] = island[i-1], [a,b] = island[i];
    if(plantingClearance((x+a)/2,(z+b)/2)) continue;
    const hi = [x,islandHeight(x,z,1)+.04,z], next = [a,islandHeight(a,b,1)+.04,b];
    const rim = (j,point) => {
      const count = island.length-1;
      const [dx,dz] = sub(island[(j+1)%count],island[(j+count-1)%count]);
      return add(point,mul(unit([-dz,0,dx]),.16));
    };
    const o = rim(i-1,hi), q = rim(i,next);
    quad(curbs,[hi,next,q,o],up);
    quad(curbs,[o,q,[q[0],streetY(q[0],q[2])-.02,q[2]],[o[0],streetY(o[0],o[2])-.02,o[2]]],unit([z-b,0,a-x]));
  }

  for (let i = 0; i < 9; i++) {
    const z = -31.16+i*1.12, a = -55.45+i*.16, b = -50.51+i*.16;
    ribbon(white,[[a,z],[b,z]],.53,paintY);
  }
  for (let i = 0; i < 8; i++) ribbon(white,[[-15.1,-61.65+i*1.12],[-10.1,-61.65+i*1.12]],.54,paintY);
  for (let i = -63; i <= 32; i+=7) {
    if (i > -20 && i < -8) continue;
    ribbon(white,[[i,-56.55],[i+3.2,-56.55]],.105,paintY);
  }
  for (const start of [1.5]) {
    for (let i = 0; i < 12; i++) {
      const x = start + i*2.94;
      ribbon(white,[[x,-52],[x+2.15,-46.4]],.095,paintY);
      if (i < 11) ribbon(white,[[x+2.15,-46.4],[x+5.09,-46.4]],.088,paintY);
    }
  }
  for (const x of [-9.65,-6.7,-3.75]) {
    ribbon(blue,[[x,-50.9],[x+.78,-48.06]],1.92,(a,b) => paintY(a,b)+.004);
    const y = (a,b) => paintY(a,b)+.012, z = -49.28;
    const at = (a,b) => [x+a,z+b];
    const wheel = Array.from({length:21},(_,i) => at(.37+.34*Math.cos(i*Math.PI/10),.34*Math.sin(i*Math.PI/10)));
    ribbon(white,wheel,.064,y);
    ribbon(white,[at(.25,.54),at(.29,.08),at(.66,.08),at(.79,-.22)],.07,y);
    ribbon(white,[at(.23,.67),at(.23,.71)],.12,y);
  }
  for (const x of [-52,-24,12,32]) {
    const z = -59.45, p = (a,b) => [x+a,paintY(x+a,z+b),z+b];
    ribbon(white,[[x-2.06,z],[x+.56,z]],.15,paintY);
    triangle(white,[p(.45,-.49),p(1.94,0),p(.45,.49)],up);
  }

  const drains = batch('Grelhas de drenagem', 'Caixilho');
  for (const x of [-69,-58,-43,-28,-15,1]) {
    const z = plazaFront - .45, y = streetY(x,z)+.015;
    box(drains,[x-.32,y-.012,z-.18],[x+.32,y,z+.18]);
    for (let i = -5; i <= 5; i++) box(curbs,[x+i*.051-.009,y,z-.166],[x+i*.051+.009,y+.008,z+.166]);
  }
}

function buildFacadeDetails(mesh) {
  const batch = (name, material, options) => mesh('Fachada e chegada', name, material, options);
  const metal = batch('Guarda-corpo de inox', 'Metal');
  const steel = batch('Esquadrias e soleiras', 'Caixilho');
  const soffit = batch('Forro e rufo da marquise', 'ForroLiso');
  const fascia = batch('Retorno da platibanda', 'Amarelo');
  const panes = batch('Vidros recuados da entrada oeste', 'Vidro', { solid: true });
  const threshold = batch('Acesso nivelado ao pavilhao', 'Concreto', { solid: true });
  const trim = batch('Friso do centro de convencoes', 'AcoAzul');
  const label = batch('Centro de Convencoes Gov. Pedro Neiva de Santana', 'LetreiroConvencoes', { shadow: false });
  const lamps = batch('Luminarias embutidas na marquise', 'Lente');
  const planters = batch('Floreiras junto da arcada', 'MeioFio');
  const turf = batch('Jardins baixos junto da arcada', 'Grama', { shadow: false });

  // The photographed canopy stands forward of the main roof; its soffit bridges the recess.
  box(soffit,[-73.5,7.96,-17.61],[-31.14,8.25,-14.86]);
  box(soffit,[-73.48,5.90,-17.6],[-31.145,6.02,-12.72]);
  box(fascia,[-31.145,6.08,-17.628],[-31.035,8.51,-15.63]);
  box(trim,[-70.2,4.86,-12.76],[-31.05,5.57,-12.62]);
  quad(label,[[-69.69,4.915,-12.765],[-31.56,4.915,-12.765],[-31.56,5.515,-12.765],[-69.69,5.515,-12.765]],front,[[0,0],[1,0],[1,1],[0,1]]);
  for (const x of [-69.6,-64.4,-59.2,-54,-48.8,-43.6,-38.4,-33.2]) {
    box(lamps,[x-.162,5.867,-15.39],[x+.162,5.902,-15.16]);
  }
  // The clear opening is centered on the existing pavilion entrance and its XR landing.
  box(panes,[-69.65,.123,-12.37],[-49.72,4.86,-12.29]);
  for(let x=-69.65;x<=-49.65;x+=1.99) box(steel,[x-.029,.123,-12.43],[x+.029,4.86,-12.345]);
  for (const y of [.34,2.26,4.78]) box(steel,[-69.68,y-.029,-12.44],[-49.66,y+.029,-12.35]);
  for (const x of [-49.68,-43.19]) box(steel,[x-.08,.121,-12.49],[x+.08,4.87,-12.21]);
  box(steel,[-49.69,4.58,-12.48],[-43.18,4.86,-12.26]);
  quad(threshold,[[-49.57,0,-16.25],[-43.31,0,-16.25],
    [-43.31,.124,-14.95],[-49.57,.124,-14.95]],up);
  box(threshold,[-49.57,.10,-14.95],[-43.31,.124,-12.39]);

  for (const c of [-28.86,-24.60,-20.34,-16.08,-11.82,-7.56]) {
    for (const x of [c-.57,c+.57]) {
      box(steel,[x-.025,3.51,-14.24],[x+.025,4.95,-14.16]);
      tube(metal,[x,1.05,-14.29],[x,1.46,-14.29],.018,.018,8);
    }
    box(steel,[c-1.481,.055,-14.25],[c+1.481,.136,-14.13]);
  }

  for (const [a,b,z] of [[-39.8,-32.75,-19.66],[-29.8,-24.2,-19.66],[-23,-13.15,-19.66],
    [-11.22,-5.38,-19.66],[-3.65,3.05,-19.66]]) {
    for (const y of [.63,.94]) tube(metal,[a,y,z],[b,y,z],.032);
    const n = Math.ceil((b-a)/1.85);
    for (let i = 0; i <= n; i++) {
      const x = mix(a,b,i/n);
      tube(metal,[x,0,z],[x,.945,z],.028);
      box(metal,[x-.055,.001,z-.055],[x+.055,.014,z+.055]);
    }
  }
  for (const x of [-29.3,-22.94,-16.55,-10.22,-4.22]) {
    box(planters,[x-1.79,0,-17.96],[x+1.79,.22,-16.09]);
    box(turf,[x-1.68,.205,-17.85],[x+1.68,.227,-16.20]);
  }
}

function buildGardens(mesh) {
  const rng = random(0x4ac2f8a1);
  const batch = (name, material, options) => mesh('Paisagismo do campus', name, material, options);
  const bark = batch('Troncos curvos e aneis das palmeiras', 'Tronco');
  const branches = batch('Ramos das arvores', 'Galho', { shadow: false });
  const leaves = [batch('Folhas novas','FolhaClara'),batch('Folhas maduras','Folha'),batch('Folhas em sombra','FolhaSombra')];
  const trees = [batch('Copas distantes claras','CopaClara',{shadow:false}),batch('Copas distantes densas','Copa',{shadow:false})];
  const grass = batch('Tufos de capim nos canteiros', 'Capim', { shadow:false });
  const earth = batch('Terra dos jardins do Sebraelab', 'Terra');
  const shrubs = batch('Forracao do Sebraelab', 'Copa');

  function crown(v, center, radii) {
    const rings = 5, sides = 9, spin = rng()*6.283, wobble = Array.from({length:sides},() => .9+rng()*.24);
    function point(i,j) {
      const t = j / rings * Math.PI;
      const a = i / sides * 2*Math.PI+spin;
      const r = wobble[i % sides];
      return add(center,[radii[0]*r*Math.sin(t)*Math.cos(a),radii[1]*Math.cos(t),radii[2]*r*Math.sin(t)*Math.sin(a)]);
    }
    for(let j=0;j<rings;j++) for(let i=0;i<sides;i++) {
      const points = [point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)];
      const norms = points.map(p => unit(sub(p,center).map((v,k)=>v/(radii[k]*radii[k]))));
      quad(v,points,norms);
    }
  }

  const palms = [[-131.4,-54.74,-.94,5.67],[-122.7,-54.71,-.94,5.42],[-113.0,-54.66,-.94,6.02],
    [-100.45,-54.63,-.94,5.32],[-91.76,-54.69,-.94,5.78],[-82.4,-54.73,-.94,6.15],[-28.9,-17.1,.225,2.87],[-22.88,-16.97,.225,2.52],[-16.35,-16.92,.225,2.89],
    [-10.06,-17.2,.225,2.98],[-4.05,-17,.225,2.67],[8.03,-18.05,.02,3.02],
    [17.20,-18.66,.02,3.31],[-45.65,-35.45,islandHeight(-45.65,-35.45,.73),2.82],[-85,-70.1,-.968,5.45],[-76.5,-69.82,-.985,3.55],[-66.7,-70.36,-.72,2.65],[-40.92,-83.8+avenueShiftZ,-.938,2.14],[-35.48,-84.08+avenueShiftZ,-.938,1.72]];
  for (const [x,z,base,h] of palms) {
    const drift = (rng()-.5)*.68;
    const at = (t) => [x+drift*t*t,base+h*t,z+.18*t*t];
    for(let i=0;i<15;i++) tube(bark,at(i/15),at((i+1)/15),mix(.12,.079,i/15),mix(.12,.079,(i+1)/15),10,false);
    for(let i=1;i<=14;i++) tube(bark,at(i/15),at(i/15+.008),mix(.121,.080,i/15),mix(.122,.081,i/15),10,false);
    const top = at(1);
    const mature=clamp((h-3.3)/2);
    const fronds=Math.round(mix(16,21,mature));
    for(let f=0;f<fronds;f++) {
      const angle=f*2.39996+rng()*.39, length=(1.3+rng()*.92)*mix(1,1.27,mature);
      const droop=.36+rng()*.67+mature*.27, rise=.57+(f%3)*.22*mature;
      const vec=[Math.cos(angle),0,Math.sin(angle)], side=[-vec[2],0,vec[0]];
      const stem=t=>add(add(top,mul(vec,t*length)),[0,rise*Math.sin(t*Math.PI)-t*t*droop,0]);
      const leaf=leaves[f%3];
      for(let i=0;i<14;i++) {
        const t=i/14, n=(i+1)/14, p=stem(t), q=stem(n), w=.028*(1-t)+.004;
        quad(leaf,[add(p,mul(side,-w)),add(p,mul(side,w)),add(q,mul(side,w*.94)),add(q,mul(side,-w*.94))],up);
        if(i===0) continue;
        for(const sign of [-1,1]) {
          const l=mix(.38,.54,mature)*Math.sin(t*Math.PI)**.7*(.88+rng()*.25), k = add(add(p,mul(side,sign*l)),mul(vec,.38*l));
          const tip = add(k,[0,-.13-t*.16,0]), mid = add(p,mul(sub(tip,p),.45));
          const width = mul(vec,mix(.06,.088,mature)*(1-t)+.013);
          quad(leaf,[p,add(mid,width),tip,sub(mid,width)],up);
        }
      }
    }
  }

  for (const [cx,cz,w,d] of [[12.5,-21.02,8.15,1.14],[7.98,-17.88,.94,4.52],[17.03,-17.93,.96,4.62]]) {
    box(earth,[cx-w/2,-.055,cz-d/2],[cx+w/2,.063,cz+d/2]);
    for (let i=0;i<Math.round(w*d*10);i++) {
      crown(shrubs,[cx+(rng()-.5)*w,.14+rng()*.16,cz+(rng()-.5)*d],[.15+rng()*.1,.14+rng()*.07,.15+rng()*.11]);
    }
  }
  for (let i=0;i<1700;i++) {
    const edge=rng()*(island.length-1), j=Math.floor(edge), r=Math.sqrt(rng())*.97;
    const [a,b]=island[j].map((v,k)=>mix(v,island[j+1][k],edge-j));
    const x=mix(islandCenter[0],a,r), z=mix(islandCenter[1],b,r);
    const y=islandHeight(x,z,r), h=.047+rng()*.16;
    if(plantingClearance(x,z)) continue;
    const t=rng()*Math.PI, dx=Math.cos(t)*.032, dz=Math.sin(t)*.032;
    triangle(grass,[[x-dx,y,z-dz],[x+dx,y,z+dz],[x+dx*1.8,y+h,z+dz*1.8]]);
  }

  for (let i=0;i<60;i++) {
    const x=i<33 ? -132+i*6.55+rng()*4 : i<47 ? 44+(i-33)*4.6+rng()*3 : -174-rng()*8;
    const z=i<33 ? (x> -62&&x< -22?56:39)+rng()*20 : i<47 ? -33+rng()*65 : -56+(i-47)*7.3+rng()*4;
    const h=3.4+rng()*5.9, spread=2.2+rng()*2.5;
    tube(branches,[x,ground,z],[x+.1,ground+h,z],.125+rng()*.13,.072,7,false);
    for(let f=0;f<7;f++) {
      const a=f*2.39996, r=spread*(.25+rng()*.39);
      const c=[x+Math.cos(a)*r,ground+h+(rng()-.5)*2.4,z+Math.sin(a)*r];
      crown(trees[(i+f)%2],c,[spread*.60,spread*(.41+rng()*.22),spread*.65]);
    }
  }
  // Vegetation across the avenue also enters the booth's baked reflections.
  for(let i=0;i<22;i++){
    const x=-108+i*5.8+rng()*2.8, z=-112.2+avenueShiftZ-rng()*7.4, h=3.5+rng()*3.2;
    tube(branches,[x,ground,z],[x,ground+h,z],.145,.064,7,false);
    for(let k=0;k<6;k++){
      const a=k*2.39996;
      crown(trees[(i+k)%2],[x+Math.cos(a)*2.1,ground+h+(rng()-.5)*1.9,z+Math.sin(a)*2.18],
        [2.2+rng(),1.3+rng()*1.2,1.8+rng()]);
    }
  }
  // Trees screen the parking edges and form a wooded shoulder along the east bend.
  for(const [edge,from,to,count] of [[-152.6,-166.2,-80,17],[67.5,-165.1,-73.1,15],[43.3,-23,39,13]]){
    for(let i=0;i<count;i++){
      const x=edge+(rng()-.5)*5.3, z=mix(from,to,i/(count-1))+(rng()-.5)*2.5, h=3.3+rng()*5.4;
      tube(branches,[x,ground,z],[x+.16,ground+h,z],.16,.07,7,false);
      for(let j=0;j<4;j++){
        const a=j*2.39996;
        crown(trees[(i+j)%2],[x+Math.cos(a)*1.63,ground+h+(rng()-.5)*1.8,z+Math.sin(a)*1.9],
          [1.85+rng()*1.6,1.2+rng()*1.3,2.1+rng()*1.2]);
      }
    }
  }
  // Low overlapping foliage closes the background behind the utility line.
  for(let i=0;i<38;i++) {
    const x=43.5+i*1.67+rng()*1.5, z=-13+rng()*13, h=1.6+rng()*2.65;
    for(let k=0;k<4;k++) {
      crown(trees[(i+k)%2],[x+(rng()-.5)*2.6,ground+h+(rng()-.5)*1.3,z+(rng()-.5)*3.8],
        [1.6+rng()*1.2,.94+rng()*1.12,1.35+rng()*1.5]);
    }
  }
}

function buildUtilities(mesh) {
  const batch = (name, material, options) => mesh('Mobiliario e infraestrutura externa', name, material, options);
  const steel = batch('Postes de iluminacao', 'Metal');
  const lens = batch('Lentes dos postes', 'Lente');
  const utility = batch('Postes da rede eletrica', 'Concreto');
  const wire = batch('Cabos aereos', 'Caixilho', { shadow:false });
  const insulators = batch('Isoladores', 'MeioFio');
  for(const [x,z] of [[-33.9,-34.2],[-5.8,-32.6],[26.8,-19.8],[29.3,-43.0],[-59.7,-56.2]]) {
    const y=streetY(x,z)+(x<0&&z>-41||x===26.8?.30:.025), top=y+7.9;
    box(steel,[x-.145,y-.10,z-.145],[x+.145,y+.12,z+.145]);
    tube(steel,[x,y,z],[x,top,z],.089,.054,12);
    for(const sign of [-1,1]) {
      const a=[x,top-.28,z], b=[x+.96*sign,top+.12,z-.04];
      tube(steel,a,b,.032,.026,8);
      beam(steel,b,[x+1.31*sign,top+.145,z-.04],.236,.082);
      box(lens,[x+1.1*sign-.131,top+.084,z-.126],[x+1.1*sign+.131,top+.104,z+.039]);
    }
  }
  const poles = [[39.46,-28.68],[40.85,-17.13],[40.78,-1.33],[40.93,16.3],[42.22,32.6]];
  for(const [x,z] of poles) {
    const top=9.58;
    beam(utility,[x,ground,z],[x,top,z],.20,.24);
    beam(steel,[x-1.08,top-.33,z],[x+1.08,top-.33,z],.102);
    for(const span of [-.8,0,.8]) tube(insulators,[x+span,top-.25,z],[x+span,top-.076,z],.063,.045,8);
    tube(steel,[x,top-1.7,z],[x-.96,top-1.13,z],.04,.027,8);
    beam(steel,[x-1.26,top-1.10,z],[x-.96,top-1.11,z],.20,.071);
  }
  for(let i=1;i<poles.length;i++) for(const span of [-.8,0,.8]) {
    const a=poles[i-1], b=poles[i];
    const at=(t)=>[mix(a[0],b[0],t)+span,9.502-.77*Math.sin(Math.PI*t),mix(a[1],b[1],t)];
    for(let j=0;j<18;j++) tube(wire,at(j/18),at((j+1)/18),.012,.012,5,false);
  }
}

export const teleportLandings = [
  ...parkingLandings,
  ...visitorLandings,
  ...eastLandings,
  {name:'Pista do patio de servico',at:[-142.35,-1.106,-24.6],size:[2.1,.035,2.4]},
  {name:'Ilha da portaria',at:[-37.19,-.918,-82.55+avenueShiftZ],size:[1.85,.032,2.3]},
  {name:'Passeio lateral da entrada',at:[-65.35,-.918,-85.1+avenueShiftZ],size:[1.9,.032,1.5]},
  ...[-49,-39,-28].map(z => ({
    name:'Rampa curva '+(-z), at:[walkX(z),walkY(z)+.016,z], size:[1.92,.042,.7]
  })),
  {name:'Ala coberta',at:[-82.4,.016,-17.2],size:[3.1,.032,2.4]},
  {name:'Passeio da entrada',at:[-65.8,.016,-18.42],size:[3.1,.032,2.05]},
  {name:'Passeio junto a arcada',at:[-19.45,.016,-18.7],size:[2.3,.032,1.38]},
  {name:'Patamar superior do Sebraelab',at:[9.35,.016,-20.23],size:[2.4,.032,.75]}
];
