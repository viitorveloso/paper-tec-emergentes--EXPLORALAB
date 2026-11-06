using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace SebraeLab.Editor
{
    [InitializeOnLoad]
    public static class SebraeLiveDiagnostics
    {
        [Serializable] private class Item { public string name; public string path; public bool active; public Vector3 position; public Vector3 scale; public Vector3 center; public Vector3 size; public string[] materials; }
        [Serializable] private class Report { public string scene; public bool playing; public bool dirty; public Vector3 viewPivot; public Quaternion viewRotation; public Vector3 cameraPosition; public Item[] objects; }
        static SebraeLiveDiagnostics() { EditorApplication.delayCall += Export; }
        [MenuItem("SebraeLab/Mostruario/Exportar diagnostico da cena")]
        public static void Export()
        {
            var scene = EditorSceneManager.GetActiveScene();
            if (scene.path != "Assets/Scenes/Sebrae.unity") return;
            var view = SceneView.lastActiveSceneView;
            var renderers = UnityEngine.Object.FindObjectsByType<MeshRenderer>(FindObjectsInactive.Include, FindObjectsSortMode.None);
            var report = new Report { scene=scene.path, playing=EditorApplication.isPlaying, dirty=scene.isDirty,
                viewPivot=view == null ? Vector3.zero : view.pivot, viewRotation=view == null ? Quaternion.identity : view.rotation,
                cameraPosition=view == null ? Vector3.zero : view.camera.transform.position,
                objects=renderers.Select(r=>new Item { name=r.name, path=PathOf(r.transform),active=r.gameObject.activeInHierarchy,
                    position=r.transform.position,scale=r.transform.lossyScale,center=r.bounds.center,size=r.bounds.size,
                    materials=r.sharedMaterials.Select(m=>m==null?"MISSING":m.name+" | "+(m.shader==null?"MISSING":m.shader.name)+" | supported="+(m.shader!=null&&m.shader.isSupported)).ToArray() }).ToArray() };
            File.WriteAllText("Tools/live-unity-layout.json", JsonUtility.ToJson(report,true));
            Debug.Log("LIVE_LAYOUT_EXPORTED: "+report.objects.Length+" renderers, playing="+report.playing);
        }
        private static string PathOf(Transform t) { return t.parent == null ? t.name : PathOf(t.parent)+"/"+t.name; }
    }
}