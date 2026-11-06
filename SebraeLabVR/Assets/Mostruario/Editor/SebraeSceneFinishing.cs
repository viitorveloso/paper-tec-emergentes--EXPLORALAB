using System;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace SebraeLab.Editor
{
    public static class SebraeSceneFinishing
    {
        public static void Apply(Scene scene)
        {
            var floor=AssetDatabase.LoadAssetAtPath<Material>("Assets/Mostruario/Materials/ShowroomPisoNeutro.mat");
            var walls=AssetDatabase.LoadAssetAtPath<Material>("Assets/Mostruario/Materials/ShowroomParedeCreme.mat");
            var ceiling=AssetDatabase.LoadAssetAtPath<Material>("Assets/Mostruario/Materials/ShowroomTetoBranco.mat");
            var sign=AssetDatabase.LoadAssetAtPath<Material>("Assets/Mostruario/Materials/SebraeSignText.mat");
            if(floor==null || walls==null || ceiling==null || sign==null) throw new InvalidOperationException("Materiais de acabamento ausentes.");
            foreach(var root in scene.GetRootGameObjects())
            {
                if(root.name=="Sebrae Lab") OrganizeBuilding(root);
                if(root.name=="Sebrae Lab")
                foreach(var renderer in root.GetComponentsInChildren<MeshRenderer>(true))
                {
                    var materials=renderer.sharedMaterials;bool changed=false;
                    for(int i=0;i<materials.Length;i++)
                    {
                        if(materials[i]==null) continue;
                        string name=materials[i].name.ToLowerInvariant();
                        if(renderer.name=="Teto") { materials[i]=ceiling;changed=true; }
                        else if(name.Contains("azulejo") || name.Contains("piso") || name.Contains("chao") || name.Contains("calçada") || name.Contains("calcada")) { materials[i]=floor;changed=true; }
                        else if(name.Contains("parede")) { materials[i]=walls;changed=true; }
                    }
                    if(changed)
                    {
                        renderer.sharedMaterials=materials;
                        PrefabUtility.RecordPrefabInstancePropertyModifications(renderer);
                    }
                }
                foreach(var renderer in root.GetComponentsInChildren<MeshRenderer>(true))
                    if(renderer.name=="Passarela de acesso ao laboratorio")renderer.sharedMaterial=floor;
                foreach(var label in root.GetComponentsInChildren<TextMesh>(true))
                {
                    var renderer=label.GetComponent<MeshRenderer>();
                    if(renderer!=null) renderer.sharedMaterial=sign;
                }
            }
            EditorSceneManager.MarkSceneDirty(scene);
            if(!EditorSceneManager.SaveScene(scene))throw new InvalidOperationException("Falha ao salvar acabamento da cena.");
            foreach(var root in scene.GetRootGameObjects())
                foreach(var binding in root.GetComponentsInChildren<SebraeSignMaterials>(true))binding.RefreshLabels();
        }
        private static void OrganizeBuilding(GameObject root)
        {
            foreach(var light in root.GetComponentsInChildren<Light>(true))
            {
                light.enabled=false;
                PrefabUtility.RecordPrefabInstancePropertyModifications(light);
            }
            var obsolete = new System.Collections.Generic.HashSet<string>
            {
                "Area de Trabalho 1", "Area de Trabalho 2", "Cube.012", "Cube.013", "Cube.014",
                "Cube.005", "Cube.018", "Cube.024", "Sofa.001", "Torre Tomadas.001",
                "Mesa Grande", "Mesa Grande.001", "Torre Tomadas"
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

        public static void ApplyBoth(Scene main)
        {
            Apply(main);
            var other=EditorSceneManager.OpenScene("Assets/Scenes/MostruarioSebrae.unity",OpenSceneMode.Additive);
            try { Apply(other); }
            finally { EditorSceneManager.CloseScene(other,true);SceneManager.SetActiveScene(main); }
        }
    }
}