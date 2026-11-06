import fs from 'node:fs';import crypto from 'node:crypto';
const root='SebraeLabVR/';const read=p=>fs.readFileSync(root+p,'utf8');const write=(p,s)=>fs.writeFileSync(root+p,s);const guid=p=>crypto.createHash('md5').update('SebraeShowroom/'+p).digest('hex');
const colors={PisoNeutro:[1,1,1],ParedeCreme:[.96,.93,.86],TetoBranco:[.99,.99,.99]};
for(const [name,color] of Object.entries(colors)){
 const p=`Assets/Mostruario/Materials/Showroom${name}.mat`;let mat=read('Assets/Mostruario/Materials/AmbienteURP.mat').replace('m_Name: AmbienteURP','m_Name: Showroom'+name);
 for(const key of ['_BaseColor','_Color'])mat=mat.replace(new RegExp('- '+key+': \\{[^}]+\\}'),`- ${key}: {r: ${color[0]}, g: ${color[1]}, b: ${color[2]}, a: 1}`);
 mat=mat.replace('- _Smoothness: 0','- _Smoothness: '+(name==='PisoNeutro'?'.24':'.08'));write(p,mat);
 if(!fs.existsSync(root+p+'.meta'))write(p+'.meta',`fileFormatVersion: 2\nguid: ${guid(p)}\nNativeFormatImporter:\n  externalObjects: {}\n  mainObjectFileID: 2100000\n  userData: \n  assetBundleName: \n  assetBundleVariant: \n`);
}
let s=read('Tools/refine-showroom.mjs').replace('PisoNeutro:[.68,.69,.70]','PisoNeutro:[1,1,1],ParedeCreme:[.96,.93,.86],TetoBranco:[.99,.99,.99]');write('Tools/refine-showroom.mjs',s);
s=read('Tools/exterior-pavilion.mjs').replace("[1.6,.16,3.6],'Areia'","[1.6,.16,3.6],'PisoNeutro'");write('Tools/exterior-pavilion.mjs',s);
write('Tools/finish-palette.json',JSON.stringify({floor:'Branco',floorRGB:[1,1,1],walls:'Creme pastel',wallRGB:[.96,.93,.86],ceiling:'Branco',ceilingRGB:[.99,.99,.99]},null,2));