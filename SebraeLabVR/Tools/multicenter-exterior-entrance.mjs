import { box, beam, front, grid, mix, quad, ribbon, triangle, tube, up } from './multicenter-exterior-geometry.mjs';

import { avenueShiftZ, parkingEast, parkingSouthZ, parkingWest } from './multicenter-exterior-visitor-parking.mjs';

// Coordinates follow the existing campus grid. The entrance placement is inferred from the photos.
export function buildEntrance(mesh, signMask) {
  const parts=[];
  const batch=(name,material,options)=>{
    const vertices=mesh('Portaria e acesso pela avenida',name,material,options);
    parts.push(vertices);
    return vertices;
  };
  const asphalt=batch('Avenida e pista da portaria','Asfalto',{solid:true});
  const curb=batch('Passeios e ilhas da entrada','MeioFio',{solid:true});
  const grass=batch('Grama das ilhas e talude','Grama',{solid:true,shadow:false});
  const paint=batch('Canalizacao e vagas da avenida','Pintura',{shadow:false});
  const portal=batch('Pilares e vigas dos porticos','BrancoPortico',{solid:true});
  const glass=batch('Paineis espelhados da guarita','VidroPortaria',{solid:true});
  const mirror=batch('Vidro espelhado da guarita central','VidroEspelhadoPortaria',{solid:true});
  const panel=batch('Revestimento branco dos porticos','PainelPortico',{solid:true});
  const relief=batch('Letras em relevo dos porticos','Letreiro');
  const magenta=batch('Grafismos rosa dos porticos','FaixaMagenta');
  const dark=batch('Esquadrias e base de controle','Caixilho');
  const steel=batch('Cancela, luminarias e postes','Metal');
  const white=batch('Hastes de cancela e cobertura da guarita','BrancoPortico');
  const red=batch('Faixas vermelhas e sinalizacao','FaixaVermelha');
  const orange=batch('Pastilha laranja da guarita lateral','PastilhaPortaria',{solid:true});
  const blue=batch('Base azul da guarita lateral','AzulSebrae');
  const label=batch('Letreiros dos porticos','NomePortico',{shadow:false});
  const totem=batch('Identidade do Sebrae no totem','NomeSebraeAzul',{shadow:false});
  const sign=batch('Placa de orientacao da portaria','NomeOrientacao',{shadow:false});
  const violet=batch('Grafismos roxos dos porticos','FaixaRoxa');
  const cyan=batch('Grafismos azuis dos porticos','FaixaCiano');
  const green=batch('Grafismos verdes dos porticos','FaixaVerde');
  const coral=batch('Grafismos laranja dos porticos','FaixaLaranja');

  const roadTop=-1.16, paintY=()=>roadTop+.012;
  const joinZ=parkingSouthZ-avenueShiftZ;
  const pavers=batch('Pavimento intertravado da entrada','PisoPortaria',{solid:true});
  box(asphalt,[parkingWest,-1.23,-88],[parkingEast,roadTop,joinZ]);
  grid(pavers,(s,t)=>[mix(-69,-15,s),roadTop+.008,mix(-88.03,joinZ,t)],8,4,up);
  box(asphalt,[-182,-1.23,-105.7],[102,roadTop,-88]);
  box(curb,[-182,-1.31,-108.5],[102,-.99,-105.61]);
  for(const [x,a] of [[-182,-69],[-15,102]]){
    box(curb,[x,-1.35,-88.08],[a,-.99,-86.6]);
  }
  for(const z of [-93.01,-101.77]){
    for(let x=-177;x<96;x+=8.1) ribbon(paint,[[x,z],[x+3.72,z]],.103,paintY);
  }
  for(const z of [-105.39,-88.38]){
    ribbon(paint,[[-181,z],[101.6,z]],.096,paintY);
  }
  for(let i=0;i<7;i++){
    const x=-62+i*5.4;
    ribbon(paint,[[x,-88.85],[x+.68,-88.2]],.099,paintY);
  }

  const island=(x0,x1,z0,z1,planted=true)=>{
    const rounded=(target,inset,top,bottom)=>{
      const radius=Math.min(.79,(x1-x0)/2-.05)-inset;
      const centers=[[x1-radius-inset,z1-radius-inset],[x0+radius+inset,z1-radius-inset],
        [x0+radius+inset,z0+radius+inset],[x1-radius-inset,z0+radius+inset]];
      const rim=centers.flatMap(([x,z],k)=>Array.from({length:9},(_,i)=>{
        const a=(k+i/8)*Math.PI/2;
        return [x+radius*Math.cos(a),top,z+radius*Math.sin(a)];
      }));
      const center=[(x0+x1)/2,top,(z0+z1)/2];
      for(let i=0;i<rim.length;i++){
        const p=rim[i],q=rim[(i+1)%rim.length];
        triangle(target,[center,p,q],up);
        quad(target,[[p[0],bottom,p[2]],p,q,[q[0],bottom,q[2]]]);
      }
    };
    rounded(curb,0,-.96,-1.21);
    if(planted) rounded(grass,.205,-.938,-.96);
  };
  island(-67.8,-61.7,-86.7,-74.2);
  island(-59.05,-55.96,-82.91,-71.65);
  island(-49.72,-48.15,-85.44,-74.3,false);
  island(-43.11,-33.92,-85.37,-71.18);
  island(-29.83,-28.08,-80.46,-70.41,false);
  island(-17.75,-14.62,-74.25,-66.55);

  island(-180.6,-72.4,-98.26,-96.24);
  island(-11.1,100.65,-98.26,-96.24);
  for(const [x,z] of [[-65.1,-82.5],[-46.4,-70.2],[-28.8,-67.6],[-11.6,-82.6]]) {
    tube(steel,[x,-.95,z],[x,7.4,z],.086,.05,10);
    for(const [dx,dz] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const end=[x+dx*.68,7.53,z+dz*.68];
      beam(steel,[x,7.31,z],end,.095);
      box(dark,[end[0]-.26,7.46,end[2]-.21],[end[0]+.26,7.62,end[2]+.21]);
    }
  }

  const utility=batch('Postes de concreto da avenida','Concreto');
  const wires=batch('Rede aerea ao longo da avenida','Caixilho',{shadow:false});
  const poles=[-92,-62,-24,13,52], poleZ=-87.18, top=7.76;
  for(const x of poles){
    beam(utility,[x,-1.13,poleZ],[x,top,poleZ],.17,.23);
    beam(steel,[x,top-.2,poleZ-.52],[x,top-.2,poleZ+.52],.082);
    for(const z of [-.42,0,.42]) tube(white,[x,top-.19,poleZ+z],[x,top-.035,poleZ+z],.05,.042,7);
  }
  for(let i=1;i<poles.length;i++){
    for(const z of [-.42,0,.42]){
      const pt=t=>[mix(poles[i-1],poles[i],t),top-.034-.58*Math.sin(t*Math.PI),poleZ+z];
      for(let k=0;k<17;k++) tube(wires,pt(k/17),pt((k+1)/17),.016,.016,5,false);
    }
  }

  function portalAt(left,right,outerIsLeft){
    const [x0,z0]=left, [x1,z1]=right, length=Math.hypot(x1-x0,z1-z0);
    const dx=(x1-x0)/length, dz=(z1-z0)/length;
    const point=(u,y,d)=>[x0+dx*u-dz*d,y,z0+dz*u+dx*d];
    const faceNormal=[dz,0,-dx];
    const shape=(target,lo,hi)=>{
      const faces=[];
      box(faces,lo,hi);
      for(const [u,y,d,nx,ny,nz,uvX,uvY] of faces){
        target.push([...point(u,y,d),dx*nx-dz*nz,ny,dz*nx+dx*nz,uvX,uvY]);
      }
    };
    const bottom=outerIsLeft?3.52:3.21, top=outerIsLeft?4.73:4.54;
    const outer=outerIsLeft?0:length, inner=outerIsLeft?length:0;
    const tall=outerIsLeft?top+.78:top+.10;
    shape(panel,[-.03,bottom,-.36],[length+.03,top,.34]);
    shape(panel,[outer-.54,-.96,-.43],[outer+.54,tall,.43]);
    shape(panel,[inner-.64,2.75,-.37],[inner+.64,top,.315]);
    const pic=(target,points)=>{
      const pts=points.map(([u,y])=>point(outer+u*.54,y,-.433));
      if(pts.length===3) triangle(target,pts,faceNormal);
      else quad(target,pts,faceNormal);
    };
    if(outerIsLeft){
      const joint=.57;
      pic(violet,[[-1,3.75],[joint,2.34],[1,2.32],[1,tall]]);
      pic(violet,[[-1,3.75],[1,tall],[-1,tall]]);
      pic(magenta,[[-1,3.68],[-1,1.44],[joint-.075,2.33]]);
      pic(red,[[-1,.11],[1,.11],[1,2.25],[joint,2.28]]);
      pic(red,[[-1,.11],[joint,2.28],[-1,1.38]]);
    }else{
      pic(cyan,[[-1,2.30],[.40,2.26],[.15,3.12],[-1,tall]]);
      pic(cyan,[[-1,tall],[.15,3.12],[.68,tall]]);
      pic(green,[[.21,3.13],[.45,2.39],[1,2.44],[1,tall]]);
      pic(green,[[.21,3.13],[1,tall],[.75,tall]]);
      pic(coral,[[-1,.25],[1,.25],[1,2.37],[-1,2.21]]);
    }
    const u0=1.13, u1=length-1.13;
    const y0=bottom+.10,y1=top-.10;
    const vertex=(col,row,d)=>point(mix(u0,u1,col/signMask.width),mix(y1,y0,row/signMask.height),d);
    for(let y=0;y<signMask.mainRows;y++){
      const filled=(x,dy=0)=>signMask.at(x,y+dy);
      for(let x=0;x<signMask.width;x++){
        if(!filled(x)) continue;
        const next=x+1, a=vertex(x,y,-.445), b=vertex(next,y,-.445),
          c=vertex(next,y+1,-.445), d=vertex(x,y+1,-.445);
        quad(relief,[a,b,c,d],faceNormal);
        const e=vertex(x,y,-.36), f=vertex(next,y,-.36),
          g=vertex(next,y+1,-.36), h=vertex(x,y+1,-.36);
        if(!filled(x,-1)) quad(relief,[a,e,f,b]);
        if(!filled(x,1)) quad(relief,[d,c,g,h]);
        if(!filled(x-1)) quad(relief,[a,d,h,e]);
        if(!filled(next)) quad(relief,[b,f,g,c]);
      }
    }
    const split=1-signMask.mainRows/signMask.height;
    quad(label,[point(u0,y0,-.369),point(u1,y0,-.369),vertex(signMask.width,signMask.mainRows,-.369),
      vertex(0,signMask.mainRows,-.369)],faceNormal,[[0,0],[1,0],[1,split],[0,split]]);
    for(const u of [.22,.40,.59,.77]){
      const anchor=mix(u0,u1,u), curve=t=>point(anchor,top+.05+.27*Math.sin(Math.PI*t*.84),-.12-.61*t);
      for(let i=0;i<10;i++) tube(steel,curve(i/10),curve((i+1)/10),.023,.023,8,false);
      shape(dark,[anchor-.084,top+.10,-.782],[anchor+.084,top+.192,-.695]);
    }
  }
  portalAt([-57.48,-78.54],[-40.58,-78.41],true);
  portalAt([-39.12,-77.18],[-16.25,-70.92],false);

  // Mirrored centre booth, raised barriers, and an independent older side booth.
  box(dark,[-41.93,-.943,-80.32],[-38.07,-.71,-75.50]);
  box(mirror,[-41.9,-.71,-80.28],[-38.1,2.66,-75.53]);
  box(portal,[-42.02,2.66,-80.41],[-37.98,2.79,-75.4]);
  for(const y of [-.83,.39,1.68,2.6]) box(dark,[-41.95,y-.025,-80.33],[-38.05,y+.025,-80.28]);
  for(const x of [-41.88,-40.02,-38.12]) box(dark,[x-.022,-.93,-80.34],[x+.022,2.66,-80.28]);
  for(const [x,z,lean] of [[-48.92,-81.27,-.08],[-42.73,-81.06,.09],[-29.11,-75.66,-.13],[-16.68,-70.54,.21],[-62.1,-76.9,.84]]){
    box(dark,[x-.21,-.97,z-.16],[x+.21,-.05,z+.16]);
    const point=t=>[x+lean*t,-.05+t*3.24,z];
    beam(white,point(0),point(1),.09,.09);
    for(let i=1;i<8;i+=2) beam(red,point(i/8),point((i+.76)/8),.097,.096);
  }
  for(const [x,z] of [[-49.06,-83.03],[-42.65,-83.17],[-57.87,-80.95],[-33.95,-73.18],[-16.94,-73.1]]){
    tube(dark,[x,-.957,z],[x,-.355,z],.042,.042,9);
    tube(steel,[x,-.45,z],[x,-.408,z],.044,.044,9,false);
  }
  box(orange,[-66.6,-.96,-80.0],[-64.24,1.98,-76.75]);
  box(portal,[-64.24,-.96,-80.0],[-62.86,1.98,-76.75]);
  box(blue,[-64.24,-.94,-80.055],[-62.84,-.18,-79.98]);
  for(const [x,a,y] of [[-66.18,-64.69,.63],[-64.16,-62.96,-.11]]){
    box(dark,[x,y,-80.095],[a,1.42,-80.02]);
    box(glass,[x+.062,y+.07,-80.108],[a-.062,1.355,-80.09]);
  }
  grid(white,(s,t)=>{
    const x=mix(-67.21,-62.26,s),z=mix(-80.57,-76.21,t);
    return [x,2.02+.081*Math.cos(s*14*Math.PI)+.12*t,z];
  },56,2,up);
  tube(steel,[-61.91,-.96,-83.8],[-61.91,6.82,-83.8],.106,.082,12);
  box(portal,[-63.07,4.61,-83.94],[-60.75,7.39,-83.65]);
  quad(totem,[[-62.94,4.84,-83.951],[-60.88,4.84,-83.951],[-60.88,7.16,-83.951],[-62.94,7.16,-83.951]],front,[[0,0],[1,0],[1,1],[0,1]]);
  tube(steel,[-65.75,-.96,-82.1],[-65.75,3.63,-82.1],.057,.049,9);
  box(red,[-66.44,2.22,-82.18],[-65.06,3.59,-82.02]);
  quad(sign,[[-66.36,2.28,-82.186],[-65.14,2.28,-82.186],[-65.14,3.53,-82.186],[-66.36,3.53,-82.186]],front,[[0,0],[1,0],[1,1],[0,1]]);
  for(const vertices of parts){
    for(const vertex of vertices) vertex[2]+=avenueShiftZ;
  }
}

export function buildWestBlock(mesh){
  const batch=(name,material,options)=>mesh('Bloco Sebrae sob a cobertura esquerda',name,material,options);
  const walls=batch('Volume branco do Sebrae','PainelBrancoSebrae',{solid:true});
  const blue=batch('Corpo central azul e abas','AzulSebrae',{solid:true});
  const panels=batch('Placas azuis da fachada','PainelAzulSebrae');
  const glazing=batch('Janelas horizontais e entrada de vidro','Vidro');
  const frame=batch('Esquadrias e travessas do bloco','Metal');
  const joints=batch('Juntas da fachada branca','JuntaPainelSebrae');
  const stripes=batch('Barras do letreiro do Sebrae','PainelBrancoSebrae');
  const signage=batch('Sebrae em letras brancas','NomeSebraeBranco',{shadow:false});
  const a=-129.4, b=-80.7, middle=-105.16, z=-49.42;
  const blueLeft=middle-4.15, blueRight=middle+4.15;
  box(walls,[a,-.86,z],[b,5.83,-34.6]);
  box(walls,[a-.12,5.83,z-.12],[b+.12,6.02,-34.48]);
  box(blue,[blueLeft,-.76,z-.67],[blueRight,6.08,z+.02]);
  box(blue,[middle-4.35,2.25,z-1.66],[middle+4.35,2.45,z-.51]);

  // Panel faces leave a narrow joint at the edges and at the canopy.
  for(const [bottom,top] of [[-.72,2.23],[2.47,3.45],[3.48,6.04]]){
    const edges=bottom<0?[blueLeft,middle-2.14,middle+2.14,blueRight]:[blueLeft,blueRight];
    for(let i=1;i<edges.length;i++){
      if(bottom<0&&i===2) continue;
      const x0=edges[i-1]+.018, x1=edges[i]-.018, face=z-.703;
      quad(panels,[[x0,bottom,face],[x1,bottom,face],[x1,top,face],[x0,top,face]],front);
    }
  }

  for(const [start,end] of [[a+.65,blueLeft-.42],[blueRight+.42,b-.66]]){
    for(let x=start;x<end-.36;x+=2.29){
      const last=Math.min(x+1.82,end);
      for(const [bottom,top] of [[3.42,3.68],[4.98,5.25]]){
        box(frame,[x-.029,bottom-.035,z-.071],[last+.029,top+.035,z-.018]);
        box(glazing,[x,bottom,z-.077],[last,top,z-.071]);
      }
    }
    for(const y of [2.89,4.28,5.7]){
      quad(joints,[[start,y,z-.008],[end,y,z-.008],[end,y+.024,z-.008],[start,y+.024,z-.008]],front);
    }
    for(let x=start+4.58;x<end;x+=4.58){
      quad(joints,[[x,2.89,z-.009],[x+.026,2.89,z-.009],[x+.026,5.7,z-.009],[x,5.7,z-.009]],front);
    }
  }

  const doors=[
    [a+2.7,blueLeft-1.77,2.08],
    [blueRight+2.38,b-2.62,1.98]
  ];
  for(const [start,end,top] of doors){
    box(frame,[start,-.8,z-.09],[end,top,z-.015]);
    for(let i=0;i<8;i++){
      const x0=mix(start,end,i/8)+.047, x1=mix(start,end,(i+1)/8)-.047;
      box(glazing,[x0,-.73,z-.101],[x1,top-.067,z-.09]);
    }
  }

  box(glazing,[middle-2.14,-.74,z-.717],[middle+2.14,2.24,z-.68]);
  for(const x of [middle-2.09,middle-.83,middle+.83,middle+2.09]){
    box(frame,[x-.039,-.73,z-.766],[x+.039,2.24,z-.714]);
  }
  box(frame,[middle-2.11,1.87,z-.766],[middle+2.11,1.92,z-.714]);
  for(const offset of [-.66,.66]){
    tube(frame,[middle+offset,.24,z-.822],[middle+offset,.68,z-.822],.019);
  }

  // The low, inclined shelter runs along the windows to the left of the sign.
  const shelter=batch('Cobertura leve sobre o passeio do Sebrae','VidroCoberturaSebrae');
  const posts=batch('Perfis da cobertura do passeio','Metal');
  const nearZ=z-2.58, farZ=z-.27;
  for(let i=0;i<=6;i++){
    const x=-125.54+i*2.47;
    beam(posts,[x,-.842,nearZ],[x,2.42,nearZ],.075);
    beam(posts,[x,2.42,nearZ],[x,2.73,farZ],.078,.066);
    if(i===6) break;
    const start=x+.038, end=x+2.432;
    quad(shelter,[[start,2.446,nearZ],[end,2.446,nearZ],[end,2.756,farZ],[start,2.756,farZ]],up);
  }

  const signZ=z-.719;
  quad(signage,[[middle-2.93,3.77,signZ],[middle+2.93,3.77,signZ],
    [middle+2.93,5.73,signZ],[middle-2.93,5.73,signZ]],front,[[0,0],[1,0],[1,1],[0,1]]);
  for(const [x0,x1,y] of [[.06,2.27,5.24],[.57,2.27,5.49],[-2.27,-.06,4.17],[-2.27,-.57,3.93]]){
    quad(stripes,[[middle+x0,y,signZ],[middle+x1-.15,y,signZ],
      [middle+x1,y+.14,signZ],[middle+x0+.15,y+.14,signZ]],front);
  }
}


// Approximate street-facing volumes visible across the avenue in the parking reference.
export function buildAvenueContext(mesh){
  const batch=(name,material,options)=>mesh('Entorno residencial além da avenida',name,material,options);
  const walls=batch('Volumes residenciais do outro lado da avenida','Reboco');
  const balconies=batch('Lajes e guarda-corpos das torres','PainelBrancoSebrae');
  const glass=batch('Vidros e vãos das torres','Vidro');
  const boundary=batch('Muro baixo junto à avenida','BrancoPortico');
  const paving=batch('Passeio junto ao muro','Concreto',{solid:true});
  const z=(local)=>local+avenueShiftZ;
  box(paving,[-154,-1.23,z(-112.25)],[65,-1.049,z(-108.42)]);
  for(const [start,end] of [[-149.3,-85.9],[-81.4,-38.2],[-32.8,19.7],[25.3,61.6]]){
    box(boundary,[start,-1.16,z(-112.03)],[end,1.18,z(-111.72)]);
    box(balconies,[start-.07,1.18,z(-112.08)],[end+.07,1.28,z(-111.67)]);
    for(let x=start;x<=end;x+=5.5){
      box(boundary,[x-.12,-1.148,z(-112.02)],[x+.12,1.30,z(-111.52)]);
    }
  }

  const towers=[
    { x:-129, rear:-155.9, front:-140.6, width:18, floors:10 },
    { x:-104, rear:-147.8, front:-130.5, width:16.2, floors:14 },
    { x:-74, rear:-151.15, front:-133.27, width:21.45, floors:15 },
    { x:-43.8, rear:-147.35, front:-130, width:19.8, floors:16 },
    { x:-7.3, rear:-151.4, front:-133.05, width:17.3, floors:13 },
    { x:23.5, rear:-146.6, front:-130.45, width:21.2, floors:14 },
    { x:50, rear:-150.9, front:-134.0, width:16.1, floors:11 }
  ];
  for(const {x,rear,front,width,floors} of towers){
    const left=x-width/2, right=x+width/2, near=z(front), far=z(rear), roof=2.55+floors*2.91;
    box(walls,[left,-1.17,far],[right,roof,near]);
    box(balconies,[left-.18,roof,far-.18],[right+.18,roof+.38,near+.15]);
    box(walls,[x-2,roof+.38,far+2.7],[x+2.82,roof+2.65,far+6.85]);
    box(glass,[left+.86,-.72,near],[right-.86,1.89,near+.032]);
    for(let floor=0;floor<floors;floor++){
      const y=2.46+floor*2.91;
      for(const [a,b] of [[left+.63,left+width*.34],[right-width*.34,right-.63]]){
        box(glass,[a,y+.38,near-.022],[b,y+2.29,near+.034]);
        box(balconies,[a-.18,y-.08,near-.118],[b+.17,y+.10,near+.94]);
        box(balconies,[a-.18,y+.10,near+.83],[b+.17,y+.84,near+.94]);
        for(const s of [a,b,(a+b)/2]){
          box(balconies,[s-.042,y+.115,near+.037],[s+.042,y+2.3,near+.13]);
        }
      }
      for(const offset of [-.1,.1]){
        const k=x+offset*width;
        box(glass,[k-.56,y+.88,near-.015],[k+.56,y+2.11,near+.028]);
      }
      for(const edge of [left,right]){
        for(const depth of [far+2.34,(far+near)/2,near-2.55]){
          box(glass,[edge-.037,y+.88,depth-.74],[edge+.043,y+2.09,depth+.74]);
        }
      }
    }
  }
}
