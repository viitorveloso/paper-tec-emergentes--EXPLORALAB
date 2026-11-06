import fs from 'node:fs';
const root='SebraeLabVR/';const file=root+'Tools/refine-showroom.mjs';let s=fs.readFileSync(file,'utf8');
if(s.includes('placeLandscaping'))throw Error('Paisagismo ja instalado');
for(const scene of ['Sebrae','MostruarioSebrae'])fs.copyFileSync(root+`Assets/Scenes/${scene}.unity`,root+`Tools/${scene}.before-plants.bak`);
s="import { placeLandscaping } from './landscaping.mjs';\n"+s;
s=s.replace('placeDownloadedProducts({food,group,shape,text,showroom,nodes,foodAssets});',"placeDownloadedProducts({food,group,shape,text,showroom,nodes,foodAssets});\nconst landscaping=placeLandscaping({group,prefab,showroom});\nwrite('Tools/landscaping-layout.json',JSON.stringify(landscaping,null,2));");
s=s.replace('JSON.stringify({rooms:roomDesign,','JSON.stringify({landscaping,rooms:roomDesign,');fs.writeFileSync(file,s);
const v=root+'Assets/Mostruario/Editor/SebraeMostruarioView.cs';let view=fs.readFileSync(v,'utf8').replace('Applied.v6','Applied.v7').replace('            ShowRooms();','            ShowPlants();');
const menu=`        [MenuItem("SebraeLab/Mostruario/Mostrar plantas da fachada")]
        public static void ShowPlants()
        {
            var root = GameObject.Find("Paisagismo - Fachada e entrada");
            if (root == null) return;
            Selection.activeGameObject = root;
            var view = SceneView.lastActiveSceneView;
            if (view != null)
            {
                view.LookAt(new Vector3(11.5f, 1f, -13.5f), Quaternion.Euler(18f, 0f, 0f), 10f);
                view.Repaint();
            }
            Debug.Log("PAISAGISMO_OK: oito vasos adicionados na fachada e lateral.");
        }

`;
view=view.replace('        [MenuItem("SebraeLab/Mostruario/Mostrar salas do corredor")]',menu+'        [MenuItem("SebraeLab/Mostruario/Mostrar salas do corredor")]');fs.writeFileSync(v,view);