import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8').replaceAll('\r\n','\n'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
let s=read('Tools/rebuild-campus.mjs');
const rampStart=s.indexOf('slope(-59,-36,-22.9'),rampEnd=s.indexOf('for(let i=0;i<12;i++)',rampStart);if(rampStart<0||rampEnd<0)throw Error('Ramp patch target missing');
s=s.slice(0,rampStart)+String.raw`// Two return runs stay to the left of the canopy pedestal, instead of obscuring its base.
slope(-60,-50.4,-23.4,1.9,-1.16,-.58);
slope(-50.4,-60,-21.05,1.9,-.58,0);
for(const run of [{a:-60,b:-50.4,z:-23.4,y0:-1.16,y1:-.58},{a:-50.4,b:-60,z:-21.05,y0:-.58,y1:0}]){
 for(const side of [-1,1]){const z=run.z+side*.91;for(let i=0;i<=6;i++){const t=i/6,x=run.a+(run.b-run.a)*t,y=run.y0+(run.y1-run.y0)*t;tube(access,'AzulCorrimao',[x,y,z],[x,y+.94,z],.035,8);}for(const h of [.59,.94])tube(access,'AzulCorrimao',[run.a,run.y0+h,z],[run.b,run.y1+h,z],.038,10);}
}
box(access,'Concreto',[-50.4,-.64,-22.2],[1.95,.12,4.3],true);
box(access,'Concreto',[-60,-.06,-19.8],[2,.12,2.8],true);
`+s.slice(rampEnd);
s=s.replace("[-26,-.15,-17.7],[65,.3,5.4]","[-28,-.15,-17.7],[65,.3,5.4]").replace("[-15,-1.54,-10],[160,.7,115]","[-15,-1.54,-10],[240,.7,180]");
write('Tools/rebuild-campus.mjs',s);
let front=read('Tools/campus-front-reference.mjs');front=front.replace("box(section,'Asfalto',[-25,-1.19,-54],[160,.08,16],true);","box(section,'Asfalto',[-25,-1.19,-54],[160,.08,16],true);\n box(section,'Concreto',[-25,-1.16,-65],[160,.12,5.8],true);");write('Tools/campus-front-reference.mjs',front);
let review=read('Tools/review-campus.mjs').replace("render('multicenter-frontal',[-40,3.4,-78],[-29,3.2,-13],48,1600,1000);","render('multicenter-frontal',[-34.5,4.2,-82],[-34.5,3,-13],50,1600,1000);");write('Tools/review-campus.mjs',review);
let validator=read('Tools/validate-campus-reference.mjs');const testMarker='// Resolve every generated asset GUID';
if(!validator.includes('Front photograph checks'))validator=validator.replace(testMarker,String.raw`// Front photograph checks: reversible UV mapping, smooth silhouette, raised logo and an open last arch.
assert(m.referenceFront&&m.referenceFront.profile.length>150,'Curved front profile missing');
assert(m.referenceFront.bracketPixels.length===6&&m.referenceFront.letterCells>1000,'Reference logo relief missing');
const F=m.referenceFront.toPlane,G=m.referenceFront.toPhoto;
for(const p of m.referenceFront.sourceCorners){const r=project(G,project(F,p));assert(Math.hypot(r[0]-p[0],r[1]-p[1])<.001,'Front reference UV round-trip');}
const tip=(m.referenceFront.tipLeft[0]+m.referenceFront.tipRight[0])/2;
assert(Math.abs(tip-(-45.2))<2,'Canopy tip must sit under the logo, rather than at its right edge');
assert(m.streetDetails.crosswalkStripes===10&&m.streetDetails.parkingBays===3,'New street markings absent');
const last=m.arches.at(-1),start=[last.center,2.5,last.front-.25];
for(const b of geo.filter(g=>g.section==='Multicenter - edificio principal'&&['Vidro','Caixilho'].includes(g.material)))for(let i=0;i<b.vertices.length;i+=3){const t=hit(start,[0,0,1],b.vertices[i],b.vertices[i+1],b.vertices[i+2]);assert(t===null||t>3,'Last arch should be an open passage');}
`+testMarker);write('Tools/validate-campus-reference.mjs',validator);
let editor=read('Assets/CampusSebrae/Editor/SebraeCampusViews.cs');if(!editor.includes('multicenter-frontal-unity.png'))editor=editor.replace('Debug.Log("CAMPUS_CAPTURE_OK:', 'Render("Docs/Previews/multicenter-frontal-unity.png",new Vector3(-34.5f,4.2f,-82f),new Vector3(-34.5f,3f,-13f),50f);\n            Debug.Log("CAMPUS_CAPTURE_OK:');write('Assets/CampusSebrae/Editor/SebraeCampusViews.cs',editor);
let doc=read('CAMPUS-SEBRAE.md');doc+='\n## Referência frontal IMG_9627.jpeg\n\nA nova foto frontal substitui a aproximação do desenho principal da marquise: o contorno inferior agora é curvo, e a ponta achatada fica quase abaixo do centro do letreiro. Foi acrescentada a base branca trapezoidal. A faixa amarela frontal usa a fotografia por mapeamento UV projetivo; letras e peças coloridas do nome possuem relevo em geometria. Os dados estão em Tools/multicenter-front-trace.json. A imagem original foi preservada em Docs/CampusReferences.\n\nO último arco ficou aberto, conforme a nova fotografia. A rua externa ganhou faixa de pedestres, setas, vagas pintadas e passeio frontal. A rampa foi organizada em dois lances à esquerda para não encobrir o pedestal. As dimensões gerais continuam adaptadas com autorização do usuário. As marcações são cenografia, sem validação normativa.\n\nO nome Pedro Neiva de Santana, parcialmente visível na foto, foi confirmado na [Agência Sebrae de Notícias](https://ma.agenciasebrae.com.br/arquivo/decreto-estadual-confirma-hospital-de-campanha-em-sao-luis/).\n\nA imagem Docs/Previews/multicenter-frontal.png é uma revisão da nova geometria por software, não uma captura do Unity. Para gerar a captura no editor, use SebraeLab > Campus > Capturar imagens no Unity. A versão anterior a esta foto está em Tools/CampusBackup/BeforeFrontPhoto-*.bak.\n';write('CAMPUS-SEBRAE.md',doc);
console.log('FRONT_REFERENCE_FINISHED: return ramp clears pedestal; front photo tracing, street markings and editor capture are documented.');