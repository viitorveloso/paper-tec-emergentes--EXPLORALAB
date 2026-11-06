import fs from 'node:fs';
const p='SebraeLabVR/Tools/refine-showroom.mjs';let s=fs.readFileSync(p,'utf8');
if(s.includes('buildRooms'))throw Error('Salas ja instaladas');
for(const scene of ['Sebrae','MostruarioSebrae'])fs.copyFileSync(`SebraeLabVR/Assets/Scenes/${scene}.unity`,`SebraeLabVR/Tools/${scene}.before-rooms.bak`);
s="import { buildRooms } from './corridor-rooms.mjs';\n"+s;
s=s.replace("write('Tools/exterior-layout.json',JSON.stringify(exteriorDesign,null,2));","write('Tools/exterior-layout.json',JSON.stringify(exteriorDesign,null,2));\nconst roomDesign=buildRooms({group,shape,text,prefab,teleport,showroom,prefabData});\nwrite('Tools/rooms-layout.json',JSON.stringify(roomDesign,null,2));");
s=s.replace("JSON.stringify({exterior:exteriorDesign,scene:","JSON.stringify({rooms:roomDesign,exterior:exteriorDesign,scene:");fs.writeFileSync(p,s);
const v='SebraeLabVR/Tools/validate-exterior.mjs';s=fs.readFileSync(v,'utf8').replace("if(areas.length!==6)throw Error('Esperadas 6 areas externas');","if(areas.filter(a=>!a.name.startsWith('Chegada -')&&a.name!=='Circulacao do corredor interno').length!==6)throw Error('Esperadas 6 areas externas');");
s=s.replace('8 stands, 6 areas externas, referencias validas','8 stands, '+"${areas.length}"+' areas de circulacao, referencias validas');
fs.writeFileSync(v,s);
const view='SebraeLabVR/Assets/Mostruario/Editor/SebraeMostruarioView.cs';s=fs.readFileSync(view,'utf8').replace('Applied.v4','Applied.v5').replace('            ShowPavilion();','            ShowRooms();');
const menu=`        [MenuItem("SebraeLab/Mostruario/Mostrar salas do corredor")]
        public static void ShowRooms()
        {
            var root = GameObject.Find("Salas do corredor - Exposicao");
            if (root == null) return;
            Selection.activeGameObject = root;
            var view = SceneView.lastActiveSceneView;
            if (view != null)
            {
                view.LookAt(new Vector3(11.5f, 0.8f, -8.5f), Quaternion.Euler(65f, 0f, 0f), 12f);
                view.Repaint();
            }
            Debug.Log("SALAS_OK: 3 salas, 4 mesas, 8 cadeiras e 19 amostras.");
        }

`;
s=s.replace('        [MenuItem("SebraeLab/Mostruario/Mostrar pavilhao externo")]',menu+'        [MenuItem("SebraeLab/Mostruario/Mostrar pavilhao externo")]');fs.writeFileSync(view,s);