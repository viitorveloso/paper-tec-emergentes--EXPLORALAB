import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const source=path.resolve(import.meta.dirname,'..');
const delivery=process.argv[2];
if(!delivery)throw new Error('Informe uma pasta nova de entrega como argumento.');
if(fs.existsSync(delivery))throw new Error('A pasta de entrega ja existe; escolha outra para preservar os arquivos.');
const target=path.join(delivery,'SebraeLabVR');
const excludedFolders=new Set(['.git','.vs','.idea','Library','Temp','Obj','obj','Build','Builds','Logs','UserSettings','MemoryCaptures','Recordings','node_modules']);
const excludedRuntime=new Set(['Continue-Quest2Setup.ps1','setup-status.json','editor-validation.txt']);
const files=[];
function copy(dir,relative=''){
 for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  const rel=path.join(relative,item.name),from=path.join(dir,item.name);
  if(item.isSymbolicLink())throw new Error('Link simbolico requer revisao: '+rel);
  if(item.isDirectory()){
   if(excludedFolders.has(item.name))continue;
   copy(from,rel);
  }else if(item.isFile()){
   if(/\.(log|pid|csproj|sln|suo|user|userprefs|opendb)$/i.test(item.name)||['.DS_Store','Thumbs.db'].includes(item.name))continue;
   if(relative.replaceAll('\\','/')==='Tools/VRSetup'&&excludedRuntime.has(item.name))continue;
   const to=path.join(target,rel),data=fs.readFileSync(from);
   fs.mkdirSync(path.dirname(to),{recursive:true});fs.writeFileSync(to,data);
   files.push({path:rel.replaceAll('\\','/'),bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')});
  }
 }
}
copy(source);
for(const required of ['Assets/Scenes/Sebrae.unity','Assets/Scenes/Sebrae.unity.meta','Assets/Scenes/MostruarioSebrae.unity','Assets/Quest2Setup/Editor/Quest2Build.cs','Packages/manifest.json','Packages/packages-lock.json','ProjectSettings/ProjectVersion.txt','LEIA-ME-OUTRA-MAQUINA.txt','Tools/VRSetup/Quest2.ps1']){
 if(!files.some(f=>f.path===required))throw new Error('Arquivo obrigatorio ausente: '+required);
}
const report={format:1,created:new Date().toISOString(),editor:'6000.0.83f1',target:'Meta Quest 2 standalone Android',unityCompilationValidated:false,apkBuilt:false,fileCount:files.length,totalBytes:files.reduce((n,f)=>n+f.bytes,0),files:files.sort((a,b)=>a.path.localeCompare(b.path))};
fs.writeFileSync(path.join(target,'INTEGRIDADE-SHA256.json'),JSON.stringify(report,null,2)+'\n');
fs.copyFileSync(path.join(target,'LEIA-ME-OUTRA-MAQUINA.txt'),path.join(delivery,'COMECE-AQUI.txt'));
console.log(JSON.stringify({delivery,target,files:report.fileCount,bytes:report.totalBytes}));
