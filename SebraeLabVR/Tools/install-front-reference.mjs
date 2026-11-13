import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8').replaceAll('\r\n','\n'),write=(p,s)=>fs.writeFileSync(path.join(root,p),s);
let detail=read('Tools/campus-reference-detail.mjs');if(!detail.includes('export { pngPixels }'))write('Tools/campus-reference-detail.mjs',detail+'\nexport { pngPixels };\n');
let s=read('Tools/rebuild-campus.mjs');if(s.includes('const referenceFront='))throw Error('Front reference already installed');
for(const p of ['Tools/rebuild-campus.mjs','Tools/review-campus.mjs','Assets/Scenes/Sebrae.unity','Assets/Scenes/MostruarioSebrae.unity']){const target='Tools/CampusBackup/BeforeFrontPhoto-'+path.basename(p)+'.bak';if(!fs.existsSync(path.join(root,target)))write(target,read(p));}
function replace(a,b){if(!s.includes(a))throw Error('Patch target missing: '+a.slice(0,90));s=s.replace(a,b);}
s="import { buildFrontReference, addFrontStreet } from './campus-front-reference.mjs';\n"+s;
replace("Luz:{color:[.95,.92,.78],smooth:.4},","AzulVaga:{color:[.025,.27,.48],smooth:.08}, Terracota:{color:[.65,.30,.12],smooth:.12}, Luz:{color:[.95,.92,.78],smooth:.4},");
replace("polygon(main,'Amarelo',[[-60.5,7.6],[-25.2,7.6],[-25.2,5.55],[-30.3,4.85],[-35.5,.65],[-43.6,5.1],[-60.5,5.1]],-17.2,.42);","const referenceFront=buildFrontReference({root,write,guid,meta,textureMeta,assetDir,specs,materials,materialTemplate,batch,tri,quad,polygon,box});");
const rb=s.indexOf('function canopyBottom('),re=s.indexOf('// Existing lab:',rb);if(rb<0||re<0)throw Error('Legacy ribs missing');s=s.slice(0,rb)+'// Corrugation and bracket colours now use the high-resolution front photograph.\n'+s.slice(re);
s=s.replace(/^.*key:'Multicenter'.*\n/m,'').replace(/^.*key:'NegociosEventos'.*\n/m,'');
s=s.replace("{key:'Entrada',text:'ENTRADA',section:main,c:[-30.2,4.4,-16.87],size:[3.6,.27]","{key:'Entrada',text:'PEDRO NEIVA DE SANTANA',section:main,c:[-37.5,4.4,-16.87],size:[9.2,.30]");
s=s.replace("for(const x of [-54,-40])","for(const x of [-54,-37.5])").replace("[-30.2,4.4,-16.8],[8.0,.42,.10]","[-37.5,4.4,-16.8],[10.0,.42,.10]").replace("for(const x of [-58.7,-48,-36])","for(const x of [-54.2,-32.3,-25.45])");
// The last arch in IMG_9627 is an open passage. The preceding one is a dark door; the first six are blue glazing.
replace("const glass=batch(main,'Vidro',true);box(main,'Vidro',[cx,spring/2,-14.12],[radius*2,spring,.08],true);","if(i<archCount-1){const glass=batch(main,i===archCount-2?'Caixilho':'Vidro',true);box(main,i===archCount-2?'Caixilho':'Vidro',[cx,spring/2,-14.12],[radius*2,spring,.08],true);");
replace("box(main,'Caixilho',[cx,1.6,-14.20],[.055,3.2,.07]);box(main,'Caixilho',[cx,2.65,-14.21],[2.48,.055,.07]);","for(const offset of [-.6,.6])box(main,'Caixilho',[cx+offset,1.6,-14.20],[.04,3.2,.07]);for(const y of [1.05,2.10,3.2])box(main,'Caixilho',[cx,y,-14.21],[2.48,.045,.07]);}\n");
replace('color:[.075,.12,.13]','color:[.14,.25,.30]');
replace('// Dimensions adapted at the user',"const streetDetails=addFrontStreet({box,polygon,batch,quad,tri,tube});\n// Dimensions adapted at the user");
replace('const manifest={version:2,referenceSign,','const manifest={version:3,referenceFront,streetDetails,referenceSign,');
replace("referencePhotos:['2021-11-26.jpg'","referencePhotos:['IMG_9627.jpeg','2021-11-26.jpg'");
write('Tools/rebuild-campus.mjs',s);
let review=read('Tools/review-campus.mjs');review=review.replace("render('multicenter-fachada',[-85,3.3,-62],[-29,3,-12],50);","render('multicenter-fachada',[-63,4.3,-76],[-28,3.3,-13],52);\nrender('multicenter-frontal',[-40,3.4,-78],[-29,3.2,-13],48,1600,1000);");write('Tools/review-campus.mjs',review);
console.log('FRONT_PHOTO_READY: curved canopy aligned under logo, white base, raised reference lettering/coloured brackets, open last arch, foreground crosswalk/road markings.');