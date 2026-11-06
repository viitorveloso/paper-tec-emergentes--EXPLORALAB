export function buildRooms({group,shape,text,prefab,teleport,showroom,prefabData}) {
 const root=group('Salas do corredor - Exposicao',showroom);
 const rooms=[
  {name:'Sala 01 - Design e artesanato',title:'Design & origem',center:[9.5,0,-4.55],bounds:[7.2,11.7,-5.8,-3.35],tables:[{x:9.5,z:-4.55,yaw:90,collection:'Design autoral'}],back:-5.76,arrival:[12.5,.012,-5.2]},
  {name:'Sala 02 - Criacao e economia local',title:'Criacao & negocios',center:[9.5,0,-7.3],bounds:[7.2,11.7,-8.6,-6.05],tables:[{x:9.5,z:-7.3,yaw:90,collection:'Ideias que ganham forma'}],back:-8.64,arrival:[12.5,.012,-8.1]},
  {name:'Sala 03 - Galeria dos empreendedores',title:'Galeria dos empreendedores',center:[12,0,-11.7],bounds:[7.2,16.7,-14.7,-9.05],tables:[{x:9.7,z:-11.7,yaw:0,collection:'Sabores da nossa terra'},{x:14.2,z:-11.7,yaw:0,collection:'Feito a mao'}],back:-14.66,arrival:[12,.012,-10]}
 ];
 for(let r=0;r<rooms.length;r++){
  const room=rooms[r],g=group(room.name,root);
  for(let i=0;i<room.tables.length;i++){
   const t=room.tables[i],station=group('Mesa de exposicao '+(i+1),g,[t.x,0,t.z],[1,1,1],t.yaw);
   shape('Tapete da exposicao',station,[0,.006,0],[2.05,.012,3.85],'Tapete',10202,false);
   // Mesa de galeria: tampo fino com UVs de madeira e estrutura de metal.
   shape('Mesa - Tampo de madeira',station,[0,.866,0],[1.16,.068,2.34],'Areia');
   shape('Estrutura sob o tampo',station,[0,.815,0],[1.06,.035,2.23],'Grafite');
   for(const x of [-.49,.49])for(const z of [-1.02,1.02])shape('Pe metalico da mesa',station,[x,.4,z],[.035,.8,.035],'Grafite');
   for(const z of [-1.02,1.02])shape('Travessa inferior',station,[0,.08,z],[1.01,.035,.035],'Grafite');
   prefab('OfficeChair',station,[0,0,-1.67],0,.78);
   prefab('OfficeChair',station,[0,0,1.67],180,.78);
   shape('Placa da colecao',station,[-.59,.67,0],[.022,.20,1.3],'Azul');
   text('Nome da colecao',station,[-.604,.68,0],t.collection,.033,90);
   shape('Filete da identificacao',station,[-.605,.577,0],[.006,.008,1.3],'Dourado',10202,false);
   // Pares de bases com alturas diferentes deixam espaco entre os produtos.
   const base1=shape('Base de produto A',station,[0,.924,-.58],[.76,.048,.74],'Branco');
   const base2=shape('Base de produto B',station,[0,.945,.52],[.76,.09,.74],'Branco');
   if(r===0){prefab('Mug',station,[.22,.951,-.58],15,1);}
   if(r===1){prefab('BookOpen',station,[0,.951,-.58],0,1);prefab('BookPile1',station,[-.15,.993,.52],0,.85);prefab('PenHolder',station,[.24,.993,.52],0,.85);}
   shape('Cartao de colecao',station,[0,.958,1.02],[.62,.115,.025],'Azul',10202,false);
   text('Texto do cartao',station,[0,.96,1.036],r===2&&i===0?'SABORES & ORIGENS':r===2?'DESIGN AUTORAL':r===0?'PECAS COM HISTORIA':'CRIACAO LOCAL',.024,180);
  }
  const width=r===2?3.45:2.7;
  shape('Painel da sala',g,[room.center[0],1.67,room.back],[width,.82,.055],'Azul');
  shape('Acabamento inferior do painel',g,[room.center[0],1.254,room.back+.01],[width,.012,.06],'Dourado',10202,false);
  text('Assinatura institucional',g,[room.center[0],1.94,room.back+.032],'VITRINE SEBRAE',.034,180);
  text('Nome da sala',g,[room.center[0],1.69,room.back+.032],room.title,.074,180);
  text('Convite da sala',g,[room.center[0],1.38,room.back+.032],'Produtos, historias e novos encontros.',.031,180);
  teleport('Chegada - '+room.name,room.arrival,[.7,.024,.7]);
 }
 const display=group('Pedestais de produtos da galeria',root,[12,0,-13.75]);
 for(const [x,h] of [[-1.1,.64],[0,.83],[1.1,.64]]){
  shape('Rodape recuado do pedestal',display,[x,.025,0],[.49,.05,.49],'Grafite');
  shape('Pedestal de amostras',display,[x,h/2+.03,0],[.60,h-.06,.60],'Branco');
  shape('Acabamento de madeira',display,[x,h+.012,0],[.61,.024,.61],'Areia');
  if(x===0)prefab('DeskPlant',display,[x,h+.025,0],0,1.3);
 }
 teleport('Circulacao do corredor interno',[15.9,.012,-5.8],[.8,.024,4.4]);
 return {rooms:rooms.map(({name,bounds,tables,arrival})=>({name,bounds,tables,arrival})),tables:4,chairs:8,teleportAreas:4,source:'Geometria real de Sebrae Lab.fbx.'};
}