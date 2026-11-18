import { box, beam, front, grid, mix, quad, ribbon, spline, tube, unit, up } from './multicenter-exterior-geometry.mjs';

export const PavilionBays = [-14.9,-1.2,13,27.3];
export const WingBays = [-52.5,-40,-27.45,...PavilionBays];

export function barrelRise(z,bays){
  const upper=bays.findIndex((stop,i)=>i>0 && z<=stop);
  const end=upper<0?bays.length-1:upper;
  const length=bays[end]-bays[end-1];
  const u=Math.max(0,Math.min(1,(z-bays[end-1])/length));
  return [1.1*Math.sin(Math.PI*u),1.1*Math.PI/length*Math.cos(Math.PI*u)];
}

export function barrelSkin(target,x0,x1,bays,{west=0,east=0,under=false,columns=6}={}){
  const slopeX=(east-west)/(x1-x0), sign=under?-1:1;
  for(let i=1;i<bays.length;i++){
    const a=bays[i-1],b=bays[i], length=b-a;
    grid(target,(s,t)=>{
      const x=mix(x0,x1,s),z=mix(a,b,t);
      return [x,8.18+mix(west,east,s)+1.1*Math.sin(Math.PI*t)-(under?.09:0),z];
    },columns,20,(p)=>{
      const slopeZ=1.1*Math.PI/length*Math.cos(Math.PI*(p[2]-a)/length);
      return unit([-slopeX*sign,sign,-slopeZ*sign]);
    });
  }
}
export function pavilionSkin(x0,x1,under=false){
  const vertices=[];
  barrelSkin(vertices,x0,x1,PavilionBays,{under,columns:Math.max(5,Math.ceil((x1-x0)/2.6))});
  return vertices;
}

export function parkCar(targets,[x,y,z],heading=0){
  const parts=Object.fromEntries(Object.keys(targets).map(key=>[key,[]]));
  const {body,glass,dark,metal,headlights,lampsRed}=parts;
  const contour=[[-2.09,.28,.72],[-2.12,.57,.78],[-1.85,.78,.90],
    [1.83,.79,.90],[2.13,.57,.77],[2.09,.31,.72]];
  const p=([a,b,w],s)=>[a,b,s*w];
  for(let i=1;i<contour.length;i++){
    const a=contour[i-1], b=contour[i];
    quad(body,[p(a,-1),p(a,1),p(b,1),p(b,-1)]);
  }
  for(const side of [-1,1]){
    quad(body,[[-2.04,.31,side*.73],[2.04,.31,side*.73],
      [1.83,.79,side*.90],[-1.85,.78,side*.90]],[0,0,side]);
  }
  const a=-.98, b=1.10, c=-.56, d=.49, top=1.42, w=.65, ledge=.80;
  quad(body,[[c,top,-w],[d,top,-w],[d,top,w],[c,top,w]],up);
  for(const s of [-1,1]){
    quad(glass,[[a,ledge,s*.82],[b,ledge,s*.82],[d,top,s*w],[c,top,s*w]],[0,0,s]);
    beam(body,[.11,.79,s*.823],[.11,top,s*.651],.065,.046);
  }
  quad(glass,[[a,ledge,-.82],[c,top,-w],[c,top,w],[a,ledge,.82]]);
  quad(glass,[[d,top,-w],[b,ledge,-.82],[b,ledge,.82],[d,top,w]]);
  for(const axle of [-1.28,1.30]) for(const s of [-1,1]){
    tube(dark,[axle,.31,s*.66],[axle,.31,s*.925],.32,.32,12);
    tube(metal,[axle,.31,s*.926],[axle,.31,s*.938],.168,.168,12);
  }
  for(const s of [-1,1]){
    box(headlights,[2.05,.49,s*.55-.19],[2.115,.635,s*.55+.19]);
    box(lampsRed,[-2.125,.50,s*.53-.16],[-2.049,.64,s*.53+.16]);
  }

  const cosine=Math.cos(heading), sine=Math.sin(heading);
  for(const [part,vertices] of Object.entries(parts)){
    for(const [a,h,b,nx,ny,nz] of vertices){
      const vx=x+a*cosine-b*sine, vz=z+a*sine+b*cosine;
      targets[part].push([vx,y+h,vz,nx*cosine-nz*sine,ny,nx*sine+nz*cosine,vx,vz]);
    }
  }
}

export function buildServiceYard(mesh){
  const translated=[];
  const batch=(name,material,options)=>{
    const vertices=mesh('Pátio de serviço e volume posterior',name,material,options);
    translated.push(vertices);
    return vertices;
  };
  const earth=batch('Saibro do patio de servico','SaibroServico',{solid:true,shadow:false});
  const loading=batch('Pista lateral de carga e descarga','Asfalto',{solid:true});
  const paving=batch('Bases e lancis dos acessos de carga','MeioFio',{solid:true});
  const stripes=batch('Vagas e limites da doca','PinturaAmarela',{shadow:false});
  const walls=batch('Alvenaria baixa e fechamentos laterais','Reboco',{solid:true});
  const shutters=batch('Portas de enrolar e grelhas de servico','Metal');
  const glass=batch('Caixilhos escuros do volume posterior','VidroPortaria');
  const flashing=batch('Arremates do volume posterior','AzulSebrae');
  const blueRoof=batch('Telhas azul-claro do volume posterior','TelhaAzul');
  const metal=batch('Postes e ferragens de servico','Metal');
  const dark=batch('Pneus e chassis dos veiculos','Pneu');
  const cars=[batch('Carrocerias claras','BrancoPortico',{solid:true}),batch('Carrocerias cinza','CinzaCarro',{solid:true}),
    batch('Carrocerias azuis','AzulCarro',{solid:true}),batch('Carrocerias vermelhas','FaixaVermelha',{solid:true})];
  const headlights=batch('Faróis dos veículos estacionados','Lente');
  const lampsRed=batch('Lanternas dos veículos estacionados','FaixaVermelha');

  // The low compacted yard is separate from the visitor forecourt.
  const west=-130.5, edge=-94.84, south=-48.65, north=41.4;
  grid(earth,(s,t)=>{
    const x=mix(west,edge,s),z=mix(south,north,t);
    return [x,-1.166+.029*Math.sin(s*Math.PI*3)*Math.sin(t*Math.PI)**2,z];
  },14,25,up);
  const lane=[
    [-81.1,-61.5],[-92.8,-61.55],[-102.35,-60.1],[-107.5,-57.68],
    [-111.1,-53],[-108.4,-44.8],[-103.65,-38],[-102.5,-23],
    [-102.1,-6],[-102.35,17.8],[-104.65,32.3],[-108.9,42.8]
  ];
  const path=spline(lane,8);
  const serviceY=()=>-1.124;
  ribbon(loading,path,6.35,serviceY);
  ribbon(stripes,path,.095,(x,z)=>serviceY(x,z)+.012,2.96);
  // The narrow strip between the enclosure and the access road includes perpendicular parking.
  box(loading,[-100.7,-1.22,-41.2],[-94.88,-1.121,36.8]);
  for(let i=0;i<21;i++){
    const z=-38.9+i*3.52;
    ribbon(stripes,[[-100.68,z],[-95.57,z]],.071,()=>-1.105);
  }
  for(const [a,b] of [[-45,-35.4],[-29.3,-19.2],[-12.2,-4.8],[4,16.6],[23.9,26.9]]){
    box(walls,[-94.93,-1.13,a],[-94.58,1.30,b]);
    box(paving,[-94.99,1.30,a],[-94.51,1.38,b]);
  }
  for(const [a,b] of [[-35.1,-30.25],[-19.02,-12.55],[-4.63,3.85],[17.0,22.77]]){
    box(shutters,[-94.80,-.11,a],[-94.63,3.33,b]);
    for(let y=.07;y<3.27;y+=.182) box(metal,[-94.82,y,a],[-94.79,y+.019,b]);
    box(paving,[-96.17,-1.13,a+.09],[-94.91,-.15,b-.09]);
    grid(paving,(s,t)=>[-96.18-1.83*t,mix(-.15,-1.12,t),mix(a+.16,b-.16,s)],6,4,up);
  }
  for(const z of [-46,-25,-3,19,40]){
    tube(metal,[-112.4,-1.12,z],[-112.4,5.75,z],.073,.041,9);
    beam(metal,[-112.4,5.69,z],[-111.49,5.91,z],.059);
    box(shutters,[-111.65,5.83,z-.128],[-111.20,5.976,z+.128]);
  }

  // The rear roof is aligned to the main pavilion, rather than to the shifted west edge.
  const beforeRear=translated.map(vertices=>vertices.length);
  const x0=-57.4,x1=-26.7,z0=29,z1=50.4;
  box(walls,[x0,-1.16,z0],[x1,9.16,z1]);
  box(flashing,[x0-.16,8.93,z0-.16],[x1+.16,9.51,z1+.16]);
  const ridge=(x)=>9.54+1.05*Math.sin(Math.PI*(x-x0)/(x1-x0));
  grid(blueRoof,(s,t)=>{
    const x=mix(x0,x1,s);
    return [x,ridge(x),mix(z0-.09,z1+.10,t)];
  },28,8,up);
  for(const z of [z0-.105,z1+.105]){
    for(let i=0;i<28;i++){
      const a=mix(x0,x1,i/28),b=mix(x0,x1,(i+1)/28);
      quad(flashing,[[a,9.41,z],[b,9.41,z],[b,ridge(b),z],[a,ridge(a),z]],z<z0?front:[0,0,1]);
    }
  }
  for(let x=x0+1.7;x<x1-1.7;x+=3.68){
    for(const z of [z0-.032,z1+.032]) box(glass,[x-.93,5.05,z-.019],[x+.93,7.05,z+.019]);
    for(const z of [z0-.046,z1+.046]) box(metal,[x-.017,5.04,z-.014],[x+.017,7.07,z+.014]);
  }
  for(let z=z0+1.8;z<z1-1.8;z+=3.56){
    box(glass,[x0-.044,5.11,z-.99],[x0-.018,7.16,z+.99]);
    box(glass,[x1+.018,5.11,z-.99],[x1+.044,7.16,z+.99]);
  }

  const afterRear=translated.map(vertices=>vertices.length);

  const vehicles=[[-97.82,-35.9,0],[-97.93,-32.38,1],[-97.78,-25.32,3],[-97.73,-21.8,0],
    [-97.72,-7.69,2],[-98.05,-.65,0],[-97.94,6.39,1],[-97.65,13.42,0],[-98.01,20.43,2]];
  for(const [x,z,color] of vehicles){
    parkCar({body:cars[color],glass,dark,metal,headlights,lampsRed},[x,-1.12,z]);
  }
  for(const [x,z] of [[-120.9,8.35],[-119.8,29.86]]){
    const y=-1.15;
    box(dark,[x-3.56,y+.44,z-1.01],[x+3.57,y+.72,z+1.01]);
    box(cars[0],[x-3.87,y+.79,z-1.16],[x+1.58,y+3.39,z+1.16]);
    box(cars[0],[x+1.78,y+.65,z-1.04],[x+3.85,y+2.58,z+1.04]);
    box(glass,[x+3.85,y+1.81,z-.85],[x+3.874,y+2.47,z+.85]);
    for(const a of [-2.48,-1.63,3.02]) for(const s of [-1,1]){
      tube(dark,[x+a,y+.43,z+s*.71],[x+a,y+.43,z+s*1.11],.438,.438,12);
      tube(metal,[x+a,y+.43,z+s*1.112],[x+a,y+.43,z+s*1.125],.205,.205,12);
    }
  }
  // Shift the service side with the west edge of the widened wing.
  for(let i=0;i<translated.length;i++){
    const vertices=translated[i];
    for(let j=0;j<vertices.length;j++){
      if(j<beforeRear[i]||j>=afterRear[i]) vertices[j][0]-=39.7;
    }
  }
}
