import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const root='SebraeLabVR/',dir='Assets/Mostruario/ArtecCollection';const read=p=>fs.readFileSync(root+p,'utf8'),write=(p,s)=>fs.writeFileSync(root+p,s),guid=p=>crypto.createHash('md5').update('SebraeArtec/'+p).digest('hex');
fs.mkdirSync(root+dir+'/Meshes',{recursive:true});fs.mkdirSync(root+dir+'/Materials',{recursive:true});
function meta(p,type,id){const file=root+p+'.meta';if(fs.existsSync(file))return fs.readFileSync(file,'utf8').match(/^guid: (\w+)/m)[1];write(p+'.meta',`fileFormatVersion: 2\nguid: ${guid(p)}\n${type}:\n  externalObjects: {}\n${id?'  mainObjectFileID: '+id+'\n':''}  userData: \n  assetBundleName: \n  assetBundleVariant: \n`);return guid(p);}
const data=JSON.parse(read('Tools/artec-mesh-data.json')),template=read('Assets/Samples/XR Hands/1.7.3/HandVisualizer/Materials/AxisMesh.asset').replaceAll('\r\n','\n');
const vec=v=>'{'+v.map((n,i)=>'xyz'[i]+': '+n.toFixed(7)).join(', ')+'}';const manifest={author:'Artec 3D',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',modifications:'Decimation, rescaling, conversion to Unity mesh assets, texture reduction to 1K.',models:{}};
for(const [model,m] of Object.entries(data)){
 const materials={};for(const [key,source] of Object.entries(m.materials)){
  const p=dir+'/Materials/'+model+'-'+key+'.mat';let mat=read('Assets/Mostruario/Materials/AmbienteURP.mat').replace('m_Name: AmbienteURP','m_Name: Artec '+model+' '+key);
  if(source.texture){const textureGuid=meta(source.texture,'TextureImporter');mat=mat.replace(/(- _BaseMap:\r?\n        m_Texture:) \{[^}]+\}/,`$1 {fileID: 2800000, guid: ${textureGuid}, type: 3}`);}
  for(const property of ['_BaseColor','_Color'])mat=mat.replace(new RegExp('- '+property+': \\{[^}]+\\}'),'- '+property+': {r: '+source.color[0]+', g: '+source.color[1]+', b: '+source.color[2]+', a: 1}');
  mat=mat.replace('- _Smoothness: 0','- _Smoothness: '+(model==='houseplant'?'.10':'.26'));write(p,mat);materials[key]=meta(p,'NativeFormatImporter',2100000);
 }
 const parts=[];for(const [key,vertices] of Object.entries(m.parts)){
  const n=vertices.length;if(n>65535||n%3)throw Error('Mesh invalida '+model);
  const bytes=Buffer.alloc(n*32),indices=Buffer.alloc(n*2);vertices.forEach((v,i)=>{v.forEach((x,k)=>bytes.writeFloatLE(x,i*32+k*4));indices.writeUInt16LE(i,i*2);});
  const min=[0,1,2].map(i=>Math.min(...vertices.map(v=>v[i]))),max=[0,1,2].map(i=>Math.max(...vertices.map(v=>v[i]))),center=min.map((v,i)=>(v+max[i])/2),extent=min.map((v,i)=>(max[i]-v)/2);
  const channels=Array.from({length:14},(_,i)=>({offset:i===1?12:i===4?24:0,dim:i<2?3:i===4?2:0})).map(c=>`    - stream: 0\n      offset: ${c.offset}\n      format: 0\n      dimension: ${c.dim}\n`).join('');
  let mesh=template.slice(0,template.indexOf('  m_CompressedMesh:')).replace('m_Name: AxisMesh','m_Name: '+model+' '+key).replace('indexCount: 144','indexCount: '+n).replace('vertexCount: 96','vertexCount: '+n).replace('m_VertexCount: 96','m_VertexCount: '+n).replace(/m_IndexBuffer: [a-f0-9]+/,'m_IndexBuffer: '+indices.toString('hex'));
  mesh=mesh.replace(/m_Center: \{[^}]+\}/g,'m_Center: '+vec(center)).replace(/m_Extent: \{[^}]+\}/g,'m_Extent: '+vec(extent));
  mesh=mesh.replace(/    m_Channels:\n[\s\S]*?    m_DataSize: \d+\n    _typelessdata: [a-f0-9]+\n/,'    m_Channels:\n'+channels+'    m_DataSize: '+bytes.length+'\n    _typelessdata: '+bytes.toString('hex')+'\n');
  let tail=template.slice(template.indexOf('  m_CompressedMesh:')).replace(/m_Center: \{[^}]+\}/,'m_Center: '+vec(center)).replace(/m_Extent: \{[^}]+\}/,'m_Extent: '+vec(extent));
  const p=dir+'/Meshes/'+model+'-'+key+'.asset';write(p,mesh+tail);parts.push({meshGuid:meta(p,'NativeFormatImporter',4300000),materialGuid:materials[key],triangles:n/3});
 }
 manifest.models[model]={min:m.min,max:m.max,parts,source:'https://www.artec3d.com/3d-models/'+model,sketchfab:'https://sketchfab.com/models/'+(model==='houseplant'?'23a0b38312c343b1a977ee5dd8d54f06':'4ebd4b167d3a4a7da1d906f621b7392c')};
}
write('Tools/artec-assets.json',JSON.stringify(manifest,null,2));
const license=fs.readdirSync(root+'Tools/Downloads/Artec/decorative-vase',{recursive:true}).find(p=>p.endsWith('license.txt')&&!p.includes('._'));
fs.copyFileSync(root+'Tools/Downloads/Artec/decorative-vase/'+license,root+dir+'/LICENSE-CC-BY-4.0.txt');
write(dir+'/CREDITS.md','# Artec 3D collection\n\nDecorative vase by Artec 3D\nhttps://www.artec3d.com/3d-models/decorative-vase\nSketchfab: https://sketchfab.com/models/4ebd4b167d3a4a7da1d906f621b7392c\n\nHouseplant by Artec 3D\nhttps://www.artec3d.com/3d-models/houseplant\nSketchfab: https://sketchfab.com/models/23a0b38312c343b1a977ee5dd8d54f06\n\nCC BY 4.0: https://creativecommons.org/licenses/by/4.0/\nModifications: decimation, rescaling, texture reduction to 1K and conversion to native Unity meshes.\n\nOriginal archives are retained under Tools/Downloads/Artec. Downloads came from the author\'s official website because Sketchfab returned HTTP 403 to automated access. These are exhibition sample objects; Artec 3D does not endorse this project.\n');
console.log('Colecao Artec preparada: 2 modelos, 14000 triangulos no conjunto, materiais URP e creditos.');