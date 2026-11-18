import { beam, box, grid, mix, random, ribbon, smooth, spline, tube, up } from './multicenter-exterior-geometry.mjs';
import { parkCar } from './multicenter-exterior-aerial.mjs';
import { paintAccessible, paintArrow, paintStop, pavementPatch } from './multicenter-exterior-markings.mjs';

export const avenueShiftZ = -99;
export const parkingNorthZ = -73.4;
export const parkingSouthZ = -69.04 + avenueShiftZ;
export const parkingWest = -146.4;
export const parkingEast = 62.2;

const centre = -39.525;
const roadY = () => -1.16;
const markingY = () => roadY() + .019;
const northEdge = x => parkingNorthZ - .9 * smooth(0, 102, Math.abs(x - centre));

export const visitorLandings = [
  { name:'Estacionamento - eixo central', at:[centre,-1.145,-121.9], size:[2.8,.036,3.8] },
  { name:'Estacionamento - passagem oeste', at:[-101.3,-1.145,-95.98], size:[2.95,.036,2.1] },
  { name:'Estacionamento - passagem leste', at:[21.1,-1.145,-129.44], size:[2.95,.036,2.1] },
  { name:'Estacionamento - travessia da escadaria', at:[centre,-1.145,-75.82], size:[2.9,.036,1.3] }
];

export function buildVisitorParking(mesh) {
  const batch = (name, material, options) => mesh('Estacionamento principal entre pórticos e escadaria', name, material, options);
  const pavement = batch('Asfalto do estacionamento principal', 'Asfalto', { solid:true });
  const patchLight = batch('Remendos de asfalto oxidado', 'AsfaltoRemendo', { shadow:false });
  const patchDark = batch('Recapeamentos escuros', 'AsfaltoRecente', { shadow:false });
  const yellow = batch('Fileiras de vagas e faixas zebradas', 'PinturaVagas', { shadow:false });
  const white = batch('Setas, PARE e travessias do estacionamento', 'Pintura', { shadow:false });
  const blue = batch('Vagas acessíveis azuis do estacionamento', 'AzulVaga', { shadow:false });
  const curb = batch('Meios-fios do estacionamento', 'MeioFio', { solid:true });
  const walk = batch('Passeios do perímetro e da escadaria', 'Concreto', { solid:true });
  const bank = batch('Talude frontal entre ruas e estacionamento', 'Grama', { solid:true, shadow:false });
  const poles = batch('Postes de quatro luminárias', 'Metal');
  const heads = batch('Carcaças das luminárias do estacionamento', 'Caixilho');
  const lamps = batch('Difusores das luminárias do estacionamento', 'Lente', { shadow:false });
  const fence = batch('Gradil lateral do estacionamento', 'Metal', { shadow:false });
  const clearBody = batch('Carrocerias claras nas vagas','BrancoPortico',{solid:true});
  const greyBody = batch('Carrocerias cinza nas vagas','CinzaCarro',{solid:true});
  const carParts={
    glass:batch('Vidros dos veículos do estacionamento','Vidro'),
    dark:batch('Pneus dos veículos do estacionamento','Pneu'),
    metal:batch('Aros dos veículos do estacionamento','Metal'),
    headlights:batch('Faróis dos veículos do estacionamento','Lente'),
    lampsRed:batch('Lanternas dos veículos do estacionamento','FaixaVermelha')
  };
  const rng = random(0xd5ce90f3);

  grid(pavement,(s,t)=>{
    const x=mix(parkingWest,parkingEast,s);
    return [x,roadY(),mix(parkingSouthZ,northEdge(x),t)];
  },20,8,up);

  // The west exit follows the bank and joins the existing road near its first bend.
  const westExit=spline([[-141.1,-76],[-144.4,-70.98],[-144.1,-67.2],[-141.15,-64.15],[-138.8,-61.55]],8);
  const exitY=z=>roadY() + .027 * smooth(-74,-61.55,z);
  ribbon(pavement,westExit,6.9,(_x,z)=>exitY(z));
  ribbon(white,westExit,.1,(_x,z)=>exitY(z)+.02,2.83);
  ribbon(yellow,westExit,.095,(_x,z)=>exitY(z)+.02);
  for(const x of [parkingWest,parkingEast]){
    const borderZ=x===parkingWest?-79:-74.55;
    box(walk,[x-1.1,-1.27,parkingSouthZ+.45],[x+1.1,-.995,borderZ]);
    const inner=x===parkingWest?x+.93:x-1.08;
    box(curb,[inner,-1.16,parkingSouthZ+.45],[inner+.15,-.928,borderZ]);
    const outside=x===parkingWest?x-.84:x+.84;
    for(let z=parkingSouthZ+1.4;z<borderZ-.4;z+=2.85) {
      box(fence,[outside-.023,-.997,z-.023],[outside+.023,.321,z+.023]);
    }
    for(const y of [-.75,-.19,.28]){
      beam(fence,[outside,y,parkingSouthZ+1.4],[outside,y,borderZ-.4],.052);
    }
  }
  // Leave the route to the stairs and the west exit open through the bank.
  for(const [a,b] of [[-137.2,centre-3.18],[centre+3.18,parkingEast]]){
    grid(bank,(s,t)=>{
      const x=mix(a,b,s), z=mix(northEdge(x),-67.18,t);
      const crest=.34+.13*Math.sin(x*.12);
      return [x,roadY()+.04+crest*Math.sin(t*Math.PI)**1.4,z];
    },38,13,up);
    const rim=Array.from({length:24},(_,i)=>{
      const x=mix(a,b,i/23);
      return [x,northEdge(x)+.12];
    });
    ribbon(curb,rim,.20,()=>roadY()+.12);
  }
  for(const x of [centre-3.18, centre+3.18]){
    box(curb,[x-.075,-1.17,northEdge(x)],[x+.075,-.966,northEdge(x)+2.08]);
  }
  for(let i=0;i<5;i++){
    const z=-74.05-.68*i;
    ribbon(white,[[centre-2.88,z],[centre+2.88,z]],.38,markingY);
  }

  for(const [x,z,w,d] of [[-44.8,-133.4,4.5,24],[-32.1,-113.5,4.22,10.3],
    [-47.8,-91.1,3.45,9],[-36.7,-147.2,3.9,11],[-75.5,-111.9,6.5,4.15],
    [-113.6,-148.5,8.9,3.1],[-90.15,-90.57,5.3,4.05],[21.6,-144,6.4,6.3],
    [-19.23,-95.3,5.3,3.72],[33,-127.9,4.61,4.25],[-12.6,-155.7,7.4,3.6],
    [37.5,-100.45,5.5,3.72],[-111,-121.52,8.2,4.5],[-126.8,-78.8,7.6,2.6]]){
    pavementPatch(patchLight,[x,z],w,d,roadY,rng);
  }
  for(const [x,z,w,d] of [[-38.65,-113.2,5.82,9.45],[-128.9,-138.5,10.3,4.15],
    [48,-115.5,6.3,4.75],[-60,-159.6,4.6,7.2],[-39,-82.0,7.6,3.9]]){
    pavementPatch(patchDark,[x,z],w,d,roadY,rng);
  }

  const depth = 5.12;
  const banks = [[parkingWest+7.35,centre-7.05],[centre+6.98,parkingEast-7.42]];
  const rows = [-84.05,-100.81,-117.57,-134.33,-151.09];
  for (const [bankIndex,[start,end]] of banks.entries()) {
    for (const [rowIndex,backZ] of rows.entries()) {
      ribbon(yellow,[[start,backZ],[end,backZ]],.11,markingY);
      for (const face of [-1,1]) {
        const outerZ=backZ+face*depth;
        const accessible=bankIndex===0 && (rowIndex<3 || face===1&&rowIndex===3);
        let x=start;
        while(x+2.72<=end){
          const reserved=accessible && x>centre-(rowIndex===0?40:29) && x<end-5.1;
          const width=reserved?3.06:2.72;
          ribbon(yellow,[[x,backZ],[x,outerZ]],.105,markingY);
          if(reserved){
            const hatch=x+width;
            paintAccessible(blue,white,[x+width/2,outerZ-face*.97],face*Math.PI/2,markingY,1.18);
            ribbon(yellow,[[hatch,backZ],[hatch,outerZ]],.091,markingY);
            if(face===1 || rowIndex<2){
              for(let k=0;k<6;k++){
                const zz=backZ+face*(.30+k*.73);
                ribbon(yellow,[[hatch,zz],[hatch+1.02,zz+face*.54]],.11,markingY);
              }
              x+=1.02;
            }
          }
          x+=width;
        }
        ribbon(yellow,[[x,backZ],[x,outerZ]],.105,markingY);
      }
      const inner=bankIndex===0?end:start, edge=bankIndex===0?-1:1;
      const join=inner-edge*2.32;
      for(const face of [-1,1]){
        const z=backZ+face*depth;
        ribbon(yellow,[[inner,z],[join,z],[inner,backZ]],.097,markingY);
      }
    }
    for(let x=start;x+2.7<end;x+=2.72){
      ribbon(yellow,[[x,parkingSouthZ+.31],[x+.33,-162.61]],.1,markingY);
    }
    for(const z of [-92.43,-109.19,-125.95,-142.71,-159.46]){
      const origin=bankIndex===0?centre-8.7:centre+8.7, dir=bankIndex===0?0:Math.PI;
      paintStop(white,[origin,z],dir,markingY);
      paintArrow(white,[mix(start,end,.28),z-1.46],0,markingY);
      paintArrow(white,[mix(start,end,.70),z+1.46],Math.PI,markingY);
    }
  }
  for (let z=-159.65;z<-80;z+=9.62){
    ribbon(white,[[centre,z],[centre,z+3.28]],.098,markingY);
  }
  for(const z of [-151.7,-131.4,-109.75,-88.48]){
    paintArrow(white,[centre-2.76,z],Math.PI/2,markingY,3.15);
    paintArrow(white,[centre+2.85,z],-Math.PI/2,markingY,3.15);
  }
  for(const [x,z,body] of [[-137.65,-81.49,clearBody],[-77.68,-81.45,greyBody],[-132.15,-103.42,greyBody],
    [53.13,-120.05,clearBody],[-126.81,-164.79,clearBody]]){
    parkCar({body,...carParts},[x,roadY(),z],Math.PI/2);
  }
  for(const [x,z] of [[-138.25,-83.9],[-104.45,-100.79],[-104.45,-134.35],
    [-48.87,-100.84],[-48.87,-134.41],[-29.88,-84.02],[-29.88,-117.59],[-29.88,-151.09],
    [25.46,-100.84],[25.46,-134.36],[55.81,-117.58],[55.81,-151.13]]){
    const top=7.08, bottom=roadY();
    box(curb,[x-.29,bottom,z-.24],[x+.29,bottom+.18,z+.24]);
    tube(poles,[x,bottom+.15,z],[x,top,z],.087,.047,10);
    for(const [dx,dz] of [[-1,0],[1,0],[0,-1],[0,1]]){
      const a=[x+dx*.58,top+.09,z+dz*.58];
      beam(poles,[x,top-.14,z],a,.075);
      box(heads,[a[0]-.195,top+.049,a[2]-.183],[a[0]+.195,top+.182,a[2]+.183]);
      box(lamps,[a[0]-.158,top+.038,a[2]-.148],[a[0]+.158,top+.054,a[2]+.148]);
    }
  }
}
