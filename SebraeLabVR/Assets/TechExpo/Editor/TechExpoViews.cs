using System;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace SebraeLab.Editor
{
    public static class TechExpoViews
    {
        private const string RootName = "Exposicao Tech - Sebraelab";
        private static readonly Vector3 RoomEye = new Vector3(12.0f, 2.23f, 4.7f);
        private static readonly Vector3 RoomTarget = new Vector3(11.88f, 1.12f, 8.0f);

        [MenuItem("SebraeLab/Exposicao Tech/Mostrar sala")]
        public static void Show()
        {
            var root = GameObject.Find(RootName);
            var view = SceneView.lastActiveSceneView;
            if (root == null || view == null)
                return;
            Selection.activeGameObject = root;
            view.sceneLighting = true;
            view.LookAt(RoomTarget, Quaternion.LookRotation(RoomTarget - RoomEye), 7);
            view.Repaint();
        }

        [MenuItem("SebraeLab/Exposicao Tech/Capturar imagem")]
        public static void Capture()
        {
            if (EditorApplication.isPlayingOrWillChangePlaymode)
                return;
            var root = GameObject.Find(RootName);
            if (root == null)
                return;

            VerifyModel(root.transform.Find("03 - Experiencias imersivas/Headset"), .99f);
            VerifyModel(root.transform.Find("04 - Prototipagem e IoT/Drone"), .94f);
            VerifyModel(root.transform.Find("04 - Prototipagem e IoT/Impressora"), .94f);

            Directory.CreateDirectory("Docs/Previews");
            SebraeCampusViews.Render("tech-expo-unity", RoomEye, RoomTarget, 70);
            SebraeCampusViews.Render("tech-prototipagem-unity", new Vector3(13.06f, 1.96f, -2.27f),
                new Vector3(15.62f, 1.21f, -.43f), 57);
            SebraeCampusViews.Render("tech-imersao-unity", new Vector3(12.72f, 1.68f, 6.92f),
                new Vector3(14.19f, 1.06f, 7.62f), 55);
            Debug.Log("SEBRAELAB_TECH_EXPO_OK");
        }

        private static void VerifyModel(Transform model, float tabletop)
        {
            if (model == null)
                throw new InvalidOperationException("Modelo de exposição ausente.");
            var renderers = model.GetComponentsInChildren<MeshRenderer>();
            if (renderers.Length == 0)
                throw new InvalidOperationException("Malha ausente em " + model.name);
            float bottom = float.PositiveInfinity;
            foreach (var renderer in renderers)
            {
                var mesh = renderer.GetComponent<MeshFilter>();
                if (mesh == null || mesh.sharedMesh == null || renderer.sharedMaterial == null)
                    throw new InvalidOperationException("Importação incompleta em " + model.name);
                bottom = Mathf.Min(bottom, renderer.bounds.min.y);
            }
            if (Mathf.Abs(bottom - tabletop) > .015f)
                throw new InvalidOperationException("Apoio incorreto de " + model.name);
        }
    }
}
