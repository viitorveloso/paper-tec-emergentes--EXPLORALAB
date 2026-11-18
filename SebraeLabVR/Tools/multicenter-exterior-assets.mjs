// Native assets use the same Mesh and URP Material versions as the rest of this project.
import crypto from 'node:crypto';
import { cross, dot, mul, sub, unit } from './multicenter-exterior-geometry.mjs';
import { encodePng } from './multicenter-exterior-surfaces.mjs';

export const assetFolder = 'Assets/CampusSebrae/Exterior';
export const guid = (path) => crypto.createHash('md5').update('MulticenterExterior/' + path).digest('hex');
export const fields = (values,keys='xyz') => '{' + values.map((v,i) => keys[i]+': '+Number(v.toFixed(7))).join(', ') + '}';
export const common = [
  '  m_ObjectHideFlags: 0',
  '  m_CorrespondingSourceObject: {fileID: 0}',
  '  m_PrefabInstance: {fileID: 0}',
  '  m_PrefabAsset: {fileID: 0}',
].join('\n');

export function folderMeta(write, path) {
  write(path+'.meta','fileFormatVersion: 2\nguid: '+guid(path)+'\nfolderAsset: yes\nDefaultImporter:\n  externalObjects: {}\n');
}

export function nativeMeta(write,path,id) {
  write(path+'.meta','fileFormatVersion: 2\nguid: '+guid(path)+'\nNativeFormatImporter:\n  externalObjects: {}\n  mainObjectFileID: '+id+'\n');
}

export function texturePath(name) { return assetFolder + '/Textures/' + name + '.png'; }

export function textureAsset(write,name,width,height,rgb,{ normal=false, panorama=false, label=false }={}) {
  const path=texturePath(name);
  if(rgb) write(path,encodePng(width,height,rgb));
  write(path+'.meta',[
    'fileFormatVersion: 2','guid: '+guid(path),'TextureImporter:', '  externalObjects: {}',
    '  serializedVersion: 13','  mipmaps:','    enableMipMap: '+Number(!panorama),
    '    sRGBTexture: '+Number(!normal),'    linearTexture: '+Number(normal),
    '  isReadable: 0','  textureType: '+Number(normal),'  textureShape: 1',
    '  alphaIsTransparency: '+Number(label),'  maxTextureSize: '+(panorama?2048:label?4096:512),
    '  nPOTScale: 0','  textureSettings:','    serializedVersion: 2','    filterMode: '+(label?1:2),
    '    aniso: '+(panorama?1:label?4:8),'    mipBias: 0','    wrapU: '+Number(label),
    '    wrapV: '+Number(panorama||label),'    wrapW: 0',''
  ].join('\n'));
}

export function materialAsset(write,template,name,spec) {
  const path=assetFolder+'/Materials/'+name+'.mat';
  const keywords=[];
  if(spec.normal) keywords.push('_NORMALMAP');
  if(spec.emission) keywords.push('_EMISSION');
  let material=template.replace(/^  m_Name: .*$/m,'  m_Name: Multicenter '+name)
    .replace(/  m_ValidKeywords: \[\]/,'  m_ValidKeywords: '+(keywords.length?'\n'+keywords.map(k=>'  - '+k).join('\n'):'[]'));
  const properties={ _Smoothness:spec.smooth??.14, _Metallic:spec.metal??0, _Cull:spec.doubleSided?0:2,
    _BumpScale:spec.bump??1, _SpecularHighlights:spec.specular===false?0:1, _EnvironmentReflections:spec.specular===false?0:1 };
  for(const [key,value] of Object.entries(properties)) {
    material=material.replace(new RegExp('    - '+key+': [^\\n]+'),'    - '+key+': '+value);
  }
  for(const [key,values] of [['_BaseColor',spec.color||[1,1,1]],['_Color',spec.color||[1,1,1]],['_EmissionColor',spec.emission||[0,0,0]]]) {
    material=material.replace(new RegExp('    - '+key+': \\{[^}]+\\}'),'    - '+key+': '+fields([...values,1],'rgba'));
  }
  for(const [key,texture] of [['_BaseMap',spec.tex],['_BumpMap',spec.normal],['_MainTex',spec.label&&spec.tex]]) {
    if(texture) material=material.replace(new RegExp('(- '+key+':\\n        m_Texture:) \\{[^}]+\\}'), '$1 {fileID: 2800000, guid: '+guid(texturePath(texture))+', type: 3}');
  }
  write(path,material);
  nativeMeta(write,path,2100000);
  return guid(path);
}

export function decodeMesh(source) {
  const data=Buffer.from(source.match(/_typelessdata: ([a-f0-9]+)/i)[1],'hex');
  const n=Number(source.match(/m_VertexCount: (\d+)/)[1]);
  const stride=data.length/n;
  const offsets=[...source.matchAll(/    - stream: 0\n      offset: (\d+)\n      format: \d+\n      dimension: (\d+)/g)];
  const uv=Number(offsets[4]?.[1]);
  if(!Number.isInteger(uv)||uv<24||stride<uv+8) throw new Error('Mesh without readable position, normal and UV');
  const indices=Buffer.from(source.match(/m_IndexBuffer: ([a-f0-9]+)/i)[1],'hex');
  const indexSize=source.includes('m_IndexFormat: 1')?4:2;
  return Array.from({length:indices.length/indexSize},(_,i) => {
    const row=(indexSize===2?indices.readUInt16LE(i*2):indices.readUInt32LE(i*4))*stride;
    return [0,4,8,12,16,20,uv,uv+4].map(offset=>data.readFloatLE(row+offset));
  });
}

const vertexStride=48;
const axes = [[1,0,0],[0,0,1]];
export function worldUv(v,{tile=[1,1]}={}) {
  const [x,y,z,nx,ny,nz]=v;
  const [u,w]=Math.abs(ny)>.60
    ? [x,z]
    : Math.abs(nx)>Math.abs(nz) ? [z,y] : [x,y];
  return [u/tile[0],w/tile[1]];
}

export function meshAsset(write,template,path,name,source,uvMapper) {
  const vertices=[], indices=[], known=new Map();
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  let degenerate=0;
  for(let i=0;i<source.length;i+=3) {
    const tri=source.slice(i,i+3);
    const e1=sub(tri[1].slice(0,3),tri[0].slice(0,3));
    const e2=sub(tri[2].slice(0,3),tri[0].slice(0,3));
    const area=cross(e1,e2);
    if(Math.hypot(...area)<1e-10) { degenerate++; continue; }
    const uv=tri.map(v=>uvMapper ? uvMapper(v) : v.slice(6));
    const [u1,v1]=sub(uv[1],uv[0]),[u2,v2]=sub(uv[2],uv[0]);
    const determinant=u1*v2-u2*v1;
    const u=Math.abs(determinant)>1e-9 ? mul(sub(mul(e1,v2),mul(e2,v1)),1/determinant) : null;
    const v=u ? mul(sub(mul(e2,u1),mul(e1,u2)),1/determinant) : null;
    tri.forEach((point,j)=>{
      const p=point.slice(0,3), n=unit(point.slice(3,6));
      const axis=u||axes[Math.abs(n[0])>.8?1:0];
      const tangent=unit(sub(axis,mul(n,dot(axis,n))));
      const tangentSign=v&&dot(cross(n,tangent),v)<0?-1:1;
      const data=[...p,...n,...tangent,tangentSign,...uv[j]];
      if(data.some(x=>!Number.isFinite(x))) throw new Error('Nonfinite vertex in '+name);
      const key=data.map(x=>Math.round(x*1e6)).join(',');
      if(!known.has(key)) {
        known.set(key,vertices.length);
        vertices.push(data);
        for(let k=0;k<3;k++) {
          min[k]=Math.min(min[k],p[k]);
          max[k]=Math.max(max[k],p[k]);
        }
      }
      indices.push(known.get(key));
    });
  }
  if(!vertices.length) throw new Error('Empty mesh: '+name);
  const n=vertices.length, indexSize=n>65535?4:2;
  const data=Buffer.allocUnsafe(n*vertexStride);
  for(let i=0;i<n;i++) for(let j=0;j<12;j++) data.writeFloatLE(vertices[i][j],i*vertexStride+j*4);
  const indexBuffer=Buffer.allocUnsafe(indices.length*indexSize);
  for(let i=0;i<indices.length;i++) indexBuffer.writeUIntLE(indices[i],i*indexSize,indexSize);
  const channels=Array.from({length:14},(_,i) => {
    const [offset,dimensions]=[[0,3],[12,3],[24,4],[0,0],[40,2]][i]||[0,0];
    return '    - stream: 0\n      offset: '+offset+'\n      format: 0\n      dimension: '+dimensions;
  }).join('\n');
  const center=min.map((x,i)=>(x+max[i])/2), extents=min.map((x,i)=>(max[i]-x)/2);
  const asset=template.replace(/^  m_Name: .*$/m,'  m_Name: '+name)
    .replace(/indexCount: \d+/,'indexCount: '+indices.length)
    .replace(/vertexCount: \d+/,'vertexCount: '+n)
    .replace(/m_VertexCount: \d+/,'m_VertexCount: '+n)
    .replace(/m_IndexFormat: \d+/,'m_IndexFormat: '+Number(indexSize===4))
    .replace(/m_Center: \{[^}]+\}/g,'m_Center: '+fields(center))
    .replace(/m_Extent: \{[^}]+\}/g,'m_Extent: '+fields(extents))
    .replace(/m_IndexBuffer: [a-f0-9]+/,'m_IndexBuffer: '+indexBuffer.toString('hex'))
    .replace(/    m_Channels:\n[\s\S]*?    m_DataSize: \d+\n    _typelessdata: [a-f0-9]+\n/,
      '    m_Channels:\n'+channels+'\n    m_DataSize: '+data.length+'\n    _typelessdata: '+data.toString('hex')+'\n');
  write(path,asset);
  nativeMeta(write,path,4300000);
  return { path,guid:guid(path),vertices:n,triangles:indices.length/3,min,max,degenerate };
}

export function skyAsset(write) {
  const shaderPath=assetFolder+'/CeuMulticenter.shader', materialPath=assetFolder+'/Materials/CeuMulticenter.mat';
  write(shaderPath,`Shader "SebraeLab/Ceu Multicenter"
{
    Properties { _MainTex ("Panorama", 2D) = "white" {} }
    SubShader
    {
        Tags { "Queue"="Background" "RenderType"="Background" "PreviewType"="Skybox" }
        Cull Off
        ZWrite Off
        Pass
        {
            CGPROGRAM
            #pragma vertex Vert
            #pragma fragment Frag
            #pragma multi_compile_instancing
            #include "UnityCG.cginc"

            sampler2D _MainTex;
            struct Attributes
            {
                float4 vertex : POSITION;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };
            struct Varyings
            {
                float4 position : SV_POSITION;
                float3 direction : TEXCOORD0;
                UNITY_VERTEX_OUTPUT_STEREO
            };
            Varyings Vert(Attributes input)
            {
                Varyings output;
                UNITY_SETUP_INSTANCE_ID(input);
                UNITY_INITIALIZE_OUTPUT(Varyings, output);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(output);
                output.position = UnityObjectToClipPos(input.vertex);
                output.direction = input.vertex.xyz;
                return output;
            }
            half4 Frag(Varyings input) : SV_Target
            {
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(input);
                float3 ray = normalize(input.direction);
                float2 uv = float2(atan2(ray.z, ray.x) * (0.5 / UNITY_PI) + 0.5,
                    asin(clamp(ray.y, -1.0, 1.0)) * (1.0 / UNITY_PI) + 0.5);
                return half4(tex2D(_MainTex, uv).rgb, 1);
            }
            ENDCG
        }
    }
    Fallback Off
}
`);
  write(shaderPath+'.meta','fileFormatVersion: 2\nguid: '+guid(shaderPath)+'\nShaderImporter:\n  externalObjects: {}\n');
  write(materialPath,`%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!21 &2100000
Material:
  serializedVersion: 8
${common}
  m_Name: Ceu Multicenter
  m_Shader: {fileID: 4800000, guid: ${guid(shaderPath)}, type: 3}
  m_Parent: {fileID: 0}
  m_ValidKeywords: []
  m_InvalidKeywords: []
  m_LightmapFlags: 4
  m_EnableInstancingVariants: 0
  m_DoubleSidedGI: 0
  m_CustomRenderQueue: -1
  stringTagMap: {}
  disabledShaderPasses: []
  m_SavedProperties:
    serializedVersion: 3
    m_TexEnvs:
    - _MainTex:
        m_Texture: {fileID: 2800000, guid: ${guid(texturePath('CeuMulticenter'))}, type: 3}
        m_Scale: {x: 1, y: 1}
        m_Offset: {x: 0, y: 0}
    m_Ints: []
    m_Floats: []
    m_Colors: []
  m_BuildTextureStacks: []
`);
  nativeMeta(write,materialPath,2100000);
  return guid(materialPath);
}
