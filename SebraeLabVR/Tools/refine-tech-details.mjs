import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8').replaceAll('\r\n','\n'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
let s=read('Tools/install-tech-expo.mjs');
if(!s.includes('Modulo IoT - demonstracao')){
 s=s.replace("g,[-.03,.927,-.64]","g,index===1?[-.23,0,-.64]:[-.03,.927,-.64]");
 const marker='// Attach the existing dynamic font material binder';
 const additions=String.raw`// Additional connected-device exhibits, fitted within the existing display surfaces.
const iot=h.group('Modulo IoT - demonstracao',wall,[0,.975,-.38]);
shape('Suporte acrilico',iot,[0,-.015,0],[.28,.03,.20],'Vidro');
shape('Placa de circuito',iot,[0,.008,0],[.20,.016,.12],'Ciano');
shape('Microcontrolador',iot,[0,.024,0],[.045,.018,.045],'Preto');
for(const side of [-1,1])for(let i=0;i<9;i++)shape('Pino de conexao',iot,[-.075+i*.018,.027,side*.05],[.005,.022,.005],'Metal');
shape('Conector USB do modulo',iot,[-.09,.023,0],[.035,.02,.026],'Metal');
h.text('Legenda IoT',wall,[0,1.045,-.50],'IoT / SENSORES',.018);
const vrStation=h.nodes.find(n=>n.name==='03 - Experiencias imersivas');
const router=h.group('Roteador de demonstracao',vrStation,[.28,.927,.10]);
shape('Corpo do roteador',router,[0,.025,0],[.24,.05,.15],'Branco');
for(const side of [-1,1])shape('Antena',router,[side*.08,.13,.055],[.012,.24,.012],'Grafite');
for(let i=0;i<4;i++)shape('Indicador de rede',router,[-.07+i*.025,.03,-.077],[.007,.007,.004],'Led');
for(const station of h.nodes.filter(n=>n.name==='01 - Computacao e IA'||n.name==='02 - Criacao digital'))shape('Mousepad',station,[.31,.929,.05],[.21,.004,.22],'Grafite');
`;
 s=s.replace(marker,additions+'\n'+marker);write('Tools/install-tech-expo.mjs',s);
}
console.log('TECH_DETAILS_READY: notebook/tower separated, IoT board, router, antennas, indicator LEDs and mousepads.');