export function placeLandscaping({group,prefab,showroom}) {
 const root=group('Paisagismo - Fachada e entrada',showroom);
 const placements=[
  {name:'Vaso junto a porta principal - lado A',position:[17.6,0,4.5],scale:3.6,yaw:20},
  {name:'Vaso junto a porta principal - lado B',position:[17.25,0,10.4],scale:3.6,yaw:110},
  {name:'Vaso frontal esquerdo',position:[7.8,0,-15.7],scale:4.6,yaw:15},
  {name:'Vaso frontal intermediario esquerdo',position:[10,0,-15.7],scale:4.0,yaw:70},
  {name:'Vaso frontal intermediario direito',position:[14,0,-15.7],scale:4.0,yaw:145},
  {name:'Vaso frontal direito',position:[16.25,0,-15.7],scale:4.6,yaw:210},
  {name:'Vaso lateral junto a fachada',position:[6.2,0,-12.6],scale:4.4,yaw:30},
  {name:'Vaso lateral do corredor',position:[6.2,0,-6.8],scale:4.0,yaw:120},
  {name:'Vaso lateral da vitrine',position:[6.2,0,1.8],scale:4.4,yaw:190},
  {name:'Vaso lateral do mostruario',position:[6.2,0,8.2],scale:4.0,yaw:270}
 ];
 for(const p of placements){
  const pot=group(p.name,root,p.position);
  if(!p.name.startsWith('Vaso junto a porta principal'))prefab('DeskPlant',pot,[0,0,0],p.yaw,p.scale);
 }
 return {count:placements.length,placements,notes:'Vasos de 1,15 a 1,32 m. Acesso central frontal entre x=10,5 e x=13,5 permanece livre.'};
}