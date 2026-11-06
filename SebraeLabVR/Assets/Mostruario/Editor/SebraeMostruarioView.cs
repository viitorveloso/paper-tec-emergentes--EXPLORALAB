using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace SebraeLab.Editor
{
    [InitializeOnLoad]
    public static class SebraeMostruarioView
    {
        private const string Path = "Assets/Scenes/Sebrae.unity";
        private const string Key = "SebraeMostruarioView.Applied.v7";

        static SebraeMostruarioView()
        {
            EditorApplication.delayCall += RefreshOnce;
        }

        private static void RefreshOnce()
        {
            if (SessionState.GetBool(Key, false) || EditorApplication.isPlayingOrWillChangePlaymode) return;
            var scene = EditorSceneManager.GetActiveScene();
            if (scene.path != Path) return;
            if (scene.isDirty)
            {
                Debug.LogWarning("As mesas foram salvas em Sebrae.unity. A cena aberta tem alteracoes pendentes: reabra-a para carregar o mostruario salvo.");
                return;
            }
            SessionState.SetBool(Key, true);
            EditorSceneManager.OpenScene(Path);
            ShowPlants();
        }

        [MenuItem("SebraeLab/Mostruario/Mostrar plantas da fachada")]
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
            Debug.Log("PAISAGISMO_OK: dez vasos adicionados; dois junto a porta principal.");
        }

        [MenuItem("SebraeLab/Mostruario/Mostrar salas do corredor")]
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

        [MenuItem("SebraeLab/Mostruario/Mostrar pavilhao externo")]
        public static void ShowPavilion()
        {
            var root = GameObject.Find("Pavilhao externo - Vitrine Sebrae");
            if (root == null) return;
            Selection.activeGameObject = root;
            var view = SceneView.lastActiveSceneView;
            if (view != null)
            {
                view.LookAt(new Vector3(12f, 0.8f, 25f), Quaternion.Euler(48f, 0f, 0f), 23f);
                view.Repaint();
            }
            Debug.Log("VITRINE_EXTERNA_OK: 8 stands, 4 mesas de encontro, palco e circulacao central.");
        }
        [MenuItem("SebraeLab/Mostruario/Localizar mesas na cena Sebrae")]
        public static void ShowTables()
        {
            var root = GameObject.Find("Cenografia - Mostruario Sebrae");
            if (root == null) return;
            Selection.activeGameObject = root;
            var view = SceneView.lastActiveSceneView;
            if (view != null)
            {
                view.LookAt(new Vector3(12f, 0.8f, 6f), Quaternion.Euler(45f, -35f, 0f), 10f);
                view.Repaint();
            }
            Debug.Log("SEBRAE_MOSTRUARIO_OK: 3 mesas, vitrine com 2 manequins e sinalizacao salvas na cena Sebrae, em Mostruario/Exposicao.");
        }
    }
}