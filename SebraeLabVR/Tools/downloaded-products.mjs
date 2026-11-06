export function placeDownloadedProducts({food,nodes}){
 const stand=n=>nodes.find(x=>x.name.startsWith(`Stand ${n} -`));
 const counter=stand('03');
 for(const [model,x,z] of [['bread',-.95,-.92],['croissant',0,-.92],['bottle-oil',.95,-.92],['apple',-.95,-.40],['cheese',0,-.40],['pie',.95,-.40]])food(model,counter,[x,.944,z]);
 for(const [model,x] of [['bag',-.9],['bowl',0],['cup-coffee',.9]])food(model,stand('08'),[x,.944,-.65]);
 const rooms=nodes.filter(n=>n.name.startsWith('Sala 0'));
 for(let r=0;r<rooms.length;r++){
  const tables=nodes.filter(n=>n.parent===rooms[r]&&n.name.startsWith('Mesa de exposicao'));
  for(let i=0;i<tables.length;i++){
   if(r===0){food('bowl',tables[i],[-.19,.993,.52]);food('bag',tables[i],[.22,.993,.52],-12,.85);}
   if(r===2&&i===0){const plate=food('plate',tables[i],[0,.951,-.58]);food('croissant',tables[i],[0,plate+.003,-.58]);food('bottle-oil',tables[i],[-.19,.993,.52]);food('cheese',tables[i],[.20,.993,.52],25,.85);}
   if(r===2&&i===1){food('bowl',tables[i],[-.17,.951,-.58]);food('cup-coffee',tables[i],[.23,.951,-.58],10,.90);food('bag',tables[i],[0,.993,.52],-12,1.1);}
  }
 }
 for(const table of nodes.filter(n=>n.name==='Mesa de encontro'))for(const x of [-.33,.33])food('cup-coffee',table,[x,.81,0],x<0?30:-30,.8);
}