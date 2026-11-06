using System;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit.Locomotion.Teleportation;

namespace SebraeLab.Editor
{
    public static class MostruarioValidation
    {
        public const string ScenePath = "Assets/Scenes/Sebrae.unity";

        [MenuItem("SebraeLab/Mostruário/Abrir cena")]
        public static void Open()
        {
            if (EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo())
                EditorSceneManager.OpenScene(ScenePath);
        }

        [MenuItem("SebraeLab/Mostruário/Conferir cena aberta")]
        public static void Validate()
        {
            var environment = UnityEngine.Object.FindFirstObjectByType<MostruarioEnvironment>();
            if (environment == null) throw new InvalidOperationException("Abra a cena MostruarioSebrae antes de conferir.");
            var serialized = new SerializedObject(environment);
            foreach (var field in new[] { "buildingRoot", "teleportRoot", "materialTemplate" })
                if (serialized.FindProperty(field).objectReferenceValue == null)
                    throw new InvalidOperationException("Referência ausente: " + field);

            var roomsRoot = GameObject.Find("Salas do corredor - Exposicao");
            if (roomsRoot == null || roomsRoot.GetComponentsInChildren<MeshRenderer>().Count(r => r.name == "Mesa - Tampo de madeira") != 4)
                throw new InvalidOperationException("A montagem atualizada das quatro mesas das salas nao foi carregada.");
            var pavilion = GameObject.Find("Pavilhao externo - Vitrine Sebrae");
            if (pavilion == null || pavilion.GetComponentsInChildren<Transform>().Count(t => t.name.StartsWith("Stand ")) != 8)
                throw new InvalidOperationException("Esperados oito stands de empreendedores.");
            var stations = environment.transform.Find("Exposicao");
            if (stations == null || stations.childCount != 3)
                throw new InvalidOperationException("Esperadas três estações de exposição.");
            foreach (Transform station in stations)
            {
                var chairs = station.Find("Cadeiras");
                var products = station.Find("Produtos");
                if (station.Find("Mesa") == null || chairs == null || chairs.childCount != 2 || products == null || products.childCount != 4)
                    throw new InvalidOperationException("Estação incompleta: " + station.name);
                if (station.GetComponentsInChildren<MeshFilter>().Any(f => f.sharedMesh == null))
                    throw new InvalidOperationException("Malha ausente em " + station.name);
                if (station.GetComponentsInChildren<MeshRenderer>().Any(r => r.sharedMaterials.Any(m => m == null || m.shader == null)))
                    throw new InvalidOperationException("Material ausente em " + station.name);
            }
            if (UnityEngine.Object.FindFirstObjectByType<TeleportationProvider>() == null)
                throw new InvalidOperationException("Teleportation Provider ausente.");
            if (UnityEngine.Object.FindObjectsByType<AudioListener>(FindObjectsSortMode.None).Count(l => l.enabled && l.gameObject.activeInHierarchy) != 1)
                Debug.LogWarning("Confira os AudioListeners: as câmeras do FBX são desativadas ao entrar em Play.");
            if (EditorBuildSettings.scenes.Length == 0 || EditorBuildSettings.scenes[0].path != ScenePath || !EditorBuildSettings.scenes[0].enabled)
                throw new InvalidOperationException("O mostruário deve ser a primeira cena habilitada no build.");
            Debug.Log("MOSTRUARIO_OK: 3 mesas, 2 cadeiras de atendimento, 12 objetos; referências e entrada do build conferidas. Teste Play e depois o headset.");
        }

        public static void ValidateBatch()
        {
            EditorSceneManager.OpenScene(ScenePath);
            Validate();
        }
    }
}
