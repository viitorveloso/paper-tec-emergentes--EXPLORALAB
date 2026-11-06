import fs from 'node:fs';import crypto from 'node:crypto';
const root='SebraeLabVR/',dir='Assets/Mostruario/Lighting';fs.mkdirSync(root+dir,{recursive:true});
const template=fs.readFileSync(root+'Assets/Samples/XR Hands/1.7.3/HandVisualizer/Materials/AxisMesh.asset','utf8').replaceAll('\r\n','\n');
const vec=v=>'{'+v.map((n,i)=>'xyz'[i]+': '+n.toFixed(6)).join(', ')+'}';
const manifest={};
for(const [name,outer,inner,height] of [['AroLustre',1,.9,.06],['DifusorLustre',.985,.915,.06]]){
 const vertices=[];
 function quad(points,normal){const ab=points[1].map((x,i)=>x-points[0][i]),ac=points[2].map((x,i)=>x-points[0][i]);const cross=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];if(cross.reduce((a,n,i)=>a+n*normal[i],0)<0)points=[points[0],points[3],points[2],points[1]];for(const i of [0,1,2,0,2,3])vertices.push([...points[i],...normal,i===1||i===2?1:0,i>1?1:0]);}
 for(let i=0;i<64;i++){
  const a=i*Math.PI/32,b=(i+1)*Math.PI/32,m=(a+b)/2,h=height/2;
  const p=(r,y,t)=>[Math.cos(t)*r,y,Math.sin(t)*r];
  quad([p(outer,h,a),p(inner,h,a),p(inner,h,b),p(outer,h,b)],[0,1,0]);
  quad([p(outer,-h,a),p(outer,-h,b),p(inner,-h,b),p(inner,-h,a)],[0,-1,0]);
  quad([p(outer,-h,a),p(outer,h,a),p(outer,h,b),p(outer,-h,b)],[Math.cos(m),0,Math.sin(m)]);
  quad([p(inner,-h,a),p(inner,-h,b),p(inner,h,b),p(inner,h,a)],[-Math.cos(m),0,-Math.sin(m)]);
 }
 const n=vertices.length,v=Buffer.alloc(n*32),indices=Buffer.alloc(n*2);vertices.forEach((p,i)=>{p.forEach((x,k)=>v.writeFloatLE(x,i*32+k*4));indices.writeUInt16LE(i,i*2);});
 const center=[0,0,0],extent=[outer,height/2,outer];
 const channels=Array.from({length:14},(_,i)=>({offset:i===1?12:i===4?24:0,dim:i<2?3:i===4?2:0})).map(c=>`    - stream: 0\n      offset: ${c.offset}\n      format: 0\n      dimension: ${c.dim}\n`).join('');
 let s=template.slice(0,template.indexOf('  m_CompressedMesh:'));
 s=s.replace('m_Name: AxisMesh','m_Name: '+name).replace('indexCount: 144','indexCount: '+n).replace('vertexCount: 96','vertexCount: '+n).replace('m_VertexCount: 96','m_VertexCount: '+n);
 s=s.replace(/m_Center: \{[^}]+\}/g,'m_Center: '+vec(center)).replace(/m_Extent: \{[^}]+\}/g,'m_Extent: '+vec(extent)).replace(/m_IndexBuffer: [a-f0-9]+/,'m_IndexBuffer: '+indices.toString('hex'));
 s=s.replace(/    m_Channels:\n[\s\S]*?    m_DataSize: \d+\n    _typelessdata: [a-f0-9]+\n/,'    m_Channels:\n'+channels+'    m_DataSize: '+v.length+'\n    _typelessdata: '+v.toString('hex')+'\n');
 let tail=template.slice(template.indexOf('  m_CompressedMesh:')).replace(/m_Center: \{[^}]+\}/,'m_Center: '+vec(center)).replace(/m_Extent: \{[^}]+\}/,'m_Extent: '+vec(extent));
 const p=dir+'/'+name+'.asset',guid=crypto.createHash('md5').update('SebraeLighting/'+p).digest('hex');fs.writeFileSync(root+p,s+tail);fs.writeFileSync(root+p+'.meta',`fileFormatVersion: 2\nguid: ${guid}\nNativeFormatImporter:\n  externalObjects: {}\n  mainObjectFileID: 4300000\n  userData: \n  assetBundleName: \n  assetBundleVariant: \n`);manifest[name]={guid,vertices:n,triangles:n/3};
}
fs.writeFileSync(root+'Tools/lighting-meshes.json',JSON.stringify(manifest,null,2));
console.log('Malhas dos dois aros e difusores preparadas.');