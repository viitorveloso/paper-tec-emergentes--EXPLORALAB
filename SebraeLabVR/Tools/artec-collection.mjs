export function placeArtecCollection({scan,group,shape,text,nodes,showroom,manifest}){
 const additions=group('Novas pecas - Artec 3D',showroom);
 for(const [x,z] of [[8.1,-13.7],[15.8,-13.7]])scan('houseplant',additions,[x,0,z],x<12?20:-20,1);
 const pedestals=nodes.find(n=>n.name==='Pedestais de produtos da galeria');
 scan('decorative-vase',pedestals,[-1.1,.665,0],25,1);
 scan('decorative-vase',pedestals,[1.1,.665,0],150,.85);
 const room=nodes.find(n=>n.name==='Sala 01 - Design e artesanato');const table=nodes.find(n=>n.parent===room&&n.name==='Mesa de exposicao 1');
 scan('decorative-vase',table,[-.19,.951,-.58],-20,.75);
 const model=manifest.models.houseplant,width=model.max[0]-model.min[0],depth=model.max[2]-model.min[2],scale=Math.min(1,.72/Math.max(width,depth));
 for(const parent of nodes.filter(n=>n.name.startsWith('Vaso junto a porta principal'))){
  shape('Base do vaso de entrada',parent,[0,.04,0],[.36,.08,.36],'Branco');
  scan('houseplant',parent,[0,.082,0],0,scale);
 }
 const welcome=nodes.find(n=>n.name==='Boas-vindas');
 text('Creditos do acervo digital',welcome,[0,1.35,.052],'CREDITOS DO ACERVO\nArtec 3D\nDecorative vase / Houseplant\nCC BY 4.0 - modelos adaptados\nartec3d.com',.023,180);
 text('Licenca do acervo',welcome,[0,.63,.052],'creativecommons.org\n/licenses/by/4.0/',.019,180);
 return {models:2,instances:7,entrancePlants:2,galleryPlants:2,decorativeVases:3,source:'Artec 3D; mesmos modelos publicados no Sketchfab',license:'CC BY 4.0'};
}