export function buildExterior({group,shape,text,prefab,teleport,showroom}) {
 const exterior=group('Pavilhao externo - Vitrine Sebrae',showroom,[0,0,4]);
 // Plateau de 26 x 26 m; corredor central de 4 m e acessos laterais sem stands.
 shape('Praca externa - piso 26x26m',exterior,[12,-.12,25],[26,.24,26],'PisoNeutro');
 shape('Passarela de acesso ao laboratorio',exterior,[10.6,-.08,11.2],[1.6,.16,3.6],'PisoNeutro');
 for(const x of [-.85,24.85])shape('Borda lateral do pavilhao',exterior,[x,.005,25],[.08,.01,25.7],'Dourado',10202,false);
 for(const x of [6,18])shape('Faixa de circulacao lateral',exterior,[x,.008,25],[.05,.012,24],'Dourado',10202,false);
 const portal=group('Portal de entrada externo',exterior,[12,0,13.3]);
 for(const x of [-4,4])shape('Coluna do portal',portal,[x,1.8,0],[.2,3.6,.2],'Azul');
 shape('Testeira Sebrae',portal,[0,3.5,0],[8.2,.65,.22],'Azul');
 text('Marca do evento',portal,[0,3.52,-.12],'VITRINE SEBRAE  /  EMPREENDEDORES',.13);
 text('Marca interna',portal,[0,3.52,.12],'VITRINE SEBRAE  /  CONEXOES',.13,180);
 const categories=['DESIGN & DECORACAO','MODA & ACESSORIOS','SABORES & ORIGENS','ARTE & SABERES','CASA & BEM-ESTAR','CRIACAO & PAPELARIA','TECNOLOGIA & IDEIAS','NEGOCIOS LOCAIS'];
 const models=['DeskPlant','Mug','CoffePot','BookPile1','DeskPlant','PenHolder','Projector','BookOpen'];
 const stands=[];
 for(let row=0;row<4;row++)for(let side=0;side<2;side++){
  const index=row*2+side,num=String(index+1).padStart(2,'0');
  const position=[side?21:3,0,17+row*5.5];
  const stand=group(`Stand ${num} - Empreendedor ${num}`,exterior,position,[1,1,1],side?90:-90);
  stands.push({number:num,position,yaw:side?90:-90,category:categories[index]});
  shape('Tapete do stand',stand,[0,.012,0],[4.4,.02,3.6],'Tapete',10202,false);
  shape('Painel individual',stand,[0,1.35,1.65],[4.4,2.7,.10],'Branco');
  shape('Testeira de identificacao',stand,[0,2.62,1.58],[4.4,.48,.12],'Azul');
  text('Nome editavel do empreendedor',stand,[0,2.66,1.51],`EMPREENDEDOR ${num}`, .125);
  text('Categoria do stand',stand,[0,2.05,1.58],categories[index],.08);
  text('Identificacao de produtos',stand,[0,1.74,1.58],'PRODUTOS  /  HISTORIAS  /  CONEXOES',.044);
  for(const x of [-2.15,2.15]){
   shape('Divisoria de vidro',stand,[x,1.05,0],[.045,2.1,3.3],'Vidro');
   for(const z of [-1.6,1.6])shape('Montante da divisoria',stand,[x,1.12,z],[.055,2.24,.055],'Dourado');
  }
  shape('Tampo do balcao expositor',stand,[0,.90,-.65],[3.2,.08,1.0],'Branco');
  for(const x of [-1.22,1.22])shape('Apoio do balcao',stand,[x,.43,-.65],[.15,.86,.82],'Areia');
  shape('Frente do balcao',stand,[0,.56,-1.12],[2.8,.45,.06],'Azul');
  text('Numero do balcao',stand,[0,.57,-1.157],`${num}   /   VITRINE SEBRAE`,.075);
  // Malhas do pacote existente, apoiadas no tampo, mais pequenas colecoes cenograficas.
  if(index!==2 && index!==7){
  prefab(models[index],stand,[-.85,.944,-.65],0,1);
  prefab(index%2?'BookPile1':'Mug',stand,[.10,.944,-.65],20,1);
  prefab(index%2?'PenHolder':'DeskPlant',stand,[.92,.944,-.65],-10,1);
  }
  for(let j=0;j<3;j++){
   const x=-.52+j*.52;
   shape('Nicho de produto',stand,[x,1.10,.80],[.42,.18,.42],'Areia');
   if(index%3===0){
    shape('Peca de ceramica',stand,[x,1.35,.8],[.24,.32,.24],j%2?'Azul':'Branco',10207,false);
    shape('Boca do vaso',stand,[x,1.51,.8],[.13,.025,.13],'Dourado',10206,false);
   }else if(index%3===1){
    shape('Bolsa de exposicao',stand,[x,1.34,.8],[.28,.30,.14],j%2?'Azul':'Areia');
    shape('Alca esquerda',stand,[x-.075,1.55,.8],[.025,.17,.035],'Dourado');
    shape('Alca direita',stand,[x+.075,1.55,.8],[.025,.17,.035],'Dourado');
    shape('Alca superior',stand,[x,1.63,.8],[.17,.025,.035],'Dourado');
   }else{
    shape('Embalagem de amostra',stand,[x,1.35,.8],[.19,.34,.19],j%2?'Areia':'Azul',10206,false);
    shape('Tampa da embalagem',stand,[x,1.54,.8],[.20,.035,.20],'Dourado',10206,false);
   }
  }
 }
 const events=group('Praca central - Eventos e encontros',exterior);
 for(const x of [8.3,15.7])for(const z of [22.5,28]){
  const table=group('Mesa de encontro',events,[x,0,z]);
  shape('Tampo circular',table,[0,.76,0],[1.3,.045,1.3],'Areia',10206);
  shape('Pe central',table,[0,.38,0],[.10,.36,.10],'Grafite',10206);
  shape('Base da mesa',table,[0,.025,0],[.60,.025,.60],'Grafite',10206);
  prefab('DeskPlant',table,[0,.81,0],0,.65);
  for(const [dx,dz,yaw] of [[-.95,0,90],[.95,0,-90],[0,-.95,0],[0,.95,180]])prefab('OfficeChair',table,[dx,0,dz],yaw,.85);
 }
 const stage=group('Palco para apresentacoes',events,[12,0,35.4]);
 shape('Tablado do palco',stage,[0,.15,0],[7,.3,3.2],'Grafite');
 shape('Degrau do palco',stage,[0,.075,-1.85],[4.6,.15,.5],'Areia');
 shape('Painel de eventos',stage,[0,1.9,1.45],[7,3.2,.12],'Azul');
 text('Titulo do palco',stage,[0,2.55,1.38],'SEBRAE',.26);
 text('Mensagem do palco',stage,[0,1.94,1.38],'CONEXOES QUE TRANSFORMAM',.11);
 text('Programacao editavel',stage,[0,1.45,1.38],'APRESENTACOES  /  OFICINAS  /  ENCONTROS',.075);
 shape('Pulpito',stage,[-2,.87,-.15],[.62,1.14,.50],'Branco');
 text('Marca do pulpito',stage,[-2,1,-.41],'SEBRAE',.065);
 // Divisorias transparentes e guarda-corpo baixo mantem o pavilhao visualmente aberto.
 for(const x of [-.85,24.85])for(const z of [17,22.5,28,33.5]){
  shape('Jardineira de borda',exterior,[x,.25,z],[.30,.5,1.5],'Areia');
  for(const offset of [-.45,0,.45])prefab('DeskPlant',exterior,[x,.5,z+offset],0,1.6);
 }
 teleport('Eixo central externo',[12,.012,27.6],[3.8,.024,19]);
 for(const x of [6,18])teleport('Corredor dos stands',[x,.012,29],[1.2,.024,23]);
 teleport('Entrada do pavilhao',[12,.012,18.5],[6,.024,1]);
 teleport('Acesso ao laboratorio',[10.6,.012,15.2],[1.2,.024,3.4]);
 teleport('Frente do palco',[12,.012,36],[6,.024,1]);
 return {stands,footprint:{min:[-1,0,16],max:[25,3.83,42]},eventTables:4,eventChairs:16,centralClearWidth:3.8};
}