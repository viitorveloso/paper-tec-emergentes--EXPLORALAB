export function buildInteriorLighting({group,shape,mesh,light,showroom}){
 const root=group('Lustre e focos - Salao principal',showroom);
 const chandelier=group('Lustre contemporaneo de dois aros',root,[13.1,0,5.8]);
 shape('Canopla central',chandelier,[0,2.62,0],[.20,.025,.20],'MetalLustre',10206,false);
 for(const [radius,y] of [[.82,2.35],[.51,2.48]]){
  mesh('Aro metalico do lustre',chandelier,[0,y,0],[radius,1,radius],'AroLustre','MetalLustre');
  mesh('Difusor luminoso do lustre',chandelier,[0,y-.032,0],[radius,.15,radius],'DifusorLustre','LuzQuente');
  for(let i=0;i<3;i++){
   const a=i*Math.PI*2/3,r=radius*.95,x=Math.cos(a)*r,z=Math.sin(a)*r;
   shape('Fixacao da suspensao',chandelier,[x,2.629,z],[.035,.018,.035],'MetalLustre',10206,false);
   const low=y+.028,high=2.61;
   shape('Cabo de suspensao',chandelier,[x,(low+high)/2,z],[.006,(high-low)/2,.006],'Grafite',10206,false);
  }
 }
 light('Luz quente do lustre',chandelier,[0,2.28,0],{type:2,intensity:.55,range:5.3,color:[1,.94,.85]});
 const displays=[[9.4,3.5],[9.4,7.8],[14.2,7.8],[15.7,-.4]];
 for(const [x,z] of displays){
  const fixture=group('Foco de destaque do expositor',root,[x,0,z]);
  shape('Base do foco',fixture,[0,2.628,0],[.12,.035,.12],'Grafite',10202,false);
  shape('Corpo do foco',fixture,[0,2.55,0],[.10,.06,.10],'MetalLustre',10206,false);
  shape('Lente do foco',fixture,[0,2.485,0],[.085,.004,.085],'LuzQuente',10206,false);
  light('Luz de destaque de produtos',fixture,[0,2.47,0],{type:0,intensity:.68,range:3.5,angle:80,color:[1,.97,.91]});
 }
 return {chandeliers:1,rings:2,spotlights:displays.length,lowestFixture:2.3135,notes:'Luz quente no lustre e focos neutros quentes nos expositores; sem sombras adicionais em tempo real.'};
}