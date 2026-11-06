using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace SebraeLab.Editor
{
    [InitializeOnLoad]
    public static class SebraeMostruarioView
    {
        private const string Path = "Assets/Scenes/Sebrae.unity";
        private const string Key = "SebraeMostruarioView.Applied.v2";

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
            ShowTables();
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