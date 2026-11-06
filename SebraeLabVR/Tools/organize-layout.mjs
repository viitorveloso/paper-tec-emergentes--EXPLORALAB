import fs from 'node:fs';
const root='SebraeLabVR/';
for(const scene of ['Sebrae','MostruarioSebrae'])fs.copyFileSync(root+`Assets/Scenes/${scene}.unity`,root+`Tools/${scene}.before-organization.bak`);
const file=root+'Tools/refine-showroom.mjs';let s=fs.readFileSync(file,'utf8');
s=s.replace("[9.4,8,2.5,3.3","[9.4,7.8,2.5,3.3").replace("[14.6,7,2.5,4.1","[14.2,7.8,2.5,4.1");
s=s.replace("[-.87,1.15,rear],[.28,2.25,.1]","[-.87,.835,rear],[.23,1.6,.07]").replace("[-.87,1.95,rear-.055]","[-.87,1.44,rear-.055]").replace("[-.87,1.45,rear-.055]","[-.87,1.05,rear-.055]");
if(!s.includes('mainAlignedStations')){
 const insert=String.raw`
 const mainAlignedStations=[{id:2000000006,position:[9.4,0,3.5]},{id:2000000026,position:[9.4,0,7.8]},{id:2000000046,position:[14.2,0,7.8]}];
 for(const station of mainAlignedStations){
  const expression=new RegExp('(--- !u!4 &'+station.id+'\\n[\\s\\S]*?m_LocalPosition:) \\{[^}]+\\}');
  if(!expression.test(scene))throw Error('Estacao principal ausente: '+station.id);
  scene=scene.replace(expression,'$1 '+vec(station.position));
 }
`;
 s=s.replace(" // Usa os ajustes de entrada e iluminacao",insert+'\n // Usa os ajustes de entrada e iluminacao');
}
fs.writeFileSync(file,s);
const ext=root+'Tools/exterior-pavilion.mjs';let e=fs.readFileSync(ext,'utf8').replace('for(const z of [21,27])','for(const z of [22.5,28])');fs.writeFileSync(ext,e);
fs.writeFileSync(root+'Tools/main-layout.json',JSON.stringify({stations:[{position:[9.4,0,3.5]},{position:[9.4,0,7.8]},{position:[14.2,0,7.8]}],pavilionMeetingRows:[26.5,32],notes:'Expositores da segunda fileira alinhados em Z=7.8; mesas do pavilhao alinhadas aos eixos dos stands.'},null,2));
const finish=root+'Assets/Mostruario/Editor/SebraeSceneFinishing.cs';let c=fs.readFileSync(finish,'utf8');
if(!c.includes('OrganizeBuilding(root)')){
 c=c.replace('                if(root.name=="Sebrae Lab")\n                foreach', '                if(root.name=="Sebrae Lab") OrganizeBuilding(root);\n                if(root.name=="Sebrae Lab")\n                foreach');
 const method=`        private static void OrganizeBuilding(GameObject root)
        {
            var obsolete = new System.Collections.Generic.HashSet<string>
            {
                "Area de Trabalho 1", "Area de Trabalho 2", "Cube.012", "Cube.013", "Cube.014",
                "Cube.005", "Cube.018", "Cube.024", "Sofa.001", "Torre Tomadas.001"
            };
            foreach(var renderer in root.GetComponentsInChildren<MeshRenderer>(true))
            {
                var bounds=renderer.bounds;
                bool prototype=renderer.name.StartsWith("SM_") && Mathf.Abs(bounds.center.z)>30f;
                bool stagingPlane=renderer.name!="Base" && (bounds.size.x>50f || bounds.size.z>50f);
                if(obsolete.Contains(renderer.name) || prototype || stagingPlane)
                {
                    renderer.gameObject.SetActive(false);
                    PrefabUtility.RecordPrefabInstancePropertyModifications(renderer.gameObject);
                }
            }
        }

`;
 c=c.replace('        public static void ApplyBoth(Scene main)',method+'        public static void ApplyBoth(Scene main)');fs.writeFileSync(finish,c);
}
const apply=root+'Assets/Mostruario/Editor/SebraeApplyVisibleLayout.cs';let a=fs.readFileSync(apply,'utf8');
if(!a.includes('mostruario-principal-organizado.png')){
 a=a.replace('        private static void CaptureRoom()\n        {','        private static void CaptureRoom()\n        {\n            Capture("Tools/mostruario-principal-organizado.png",new Vector3(12.4f,1.7f,1.8f),new Vector3(12.1f,1.0f,8.5f));\n            Capture("Tools/corredor-organizado.png",new Vector3(15.7f,1.65f,-7.5f),new Vector3(15.4f,1.0f,5.5f));');fs.writeFileSync(apply,a);
}