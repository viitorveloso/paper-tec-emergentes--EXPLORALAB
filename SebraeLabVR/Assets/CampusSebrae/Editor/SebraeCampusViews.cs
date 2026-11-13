using System.IO;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace SebraeLab.Editor
{
    public static class SebraeCampusViews
    {
        [MenuItem("SebraeLab/Campus/Mostrar Multicenter e Sebraelab")]
        public static void ShowCampus()
        {
            var root = GameObject.Find("Campus Sebrae - Multicenter e Sebraelab");
            if (root == null) { Debug.LogWarning("Abra Assets/Scenes/Sebrae.unity."); return; }
            Selection.activeGameObject = root;
            var view = SceneView.lastActiveSceneView;
            if (view != null) { view.sceneLighting = true; view.LookAt(new Vector3(-30f,3f,-12f),Quaternion.Euler(10f,29f,0f),61f); view.Repaint(); }
        }
        [MenuItem("SebraeLab/Campus/Mostrar anexo verde e placa")]
        public static void ShowLab()
        {
            var view = SceneView.lastActiveSceneView;
            if (view != null) { view.sceneLighting = true; view.LookAt(new Vector3(12.5f,2.5f,-18f),Quaternion.Euler(8f,-15f,0f),12f); view.Repaint(); }
        }
        [MenuItem("SebraeLab/Campus/Capturar imagens no Unity")]
        public static void Capture()
        {
            if (EditorApplication.isPlayingOrWillChangePlaymode) { Debug.LogWarning("Saia do Play para capturar."); return; }
            Directory.CreateDirectory("Docs/Previews");
            Render("Docs/Previews/campus-unity.png",new Vector3(-62f,13f,-88f),new Vector3(-26f,3f,-9f),44f);
            Render("Docs/Previews/sebraelab-unity.png",new Vector3(21.5f,4.4f,-32f),new Vector3(12.4f,2.6f,-17f),58f);
            Render("Docs/Previews/sebraelab-placa-unity.png",new Vector3(17.5f,3.4f,-27.5f),new Vector3(12.4f,2.4f,-20f),54f);
            Render("Docs/Previews/multicenter-frontal-unity.png",new Vector3(-34.5f,4.2f,-82f),new Vector3(-34.5f,3f,-13f),50f);
            Debug.Log("CAMPUS_CAPTURE_OK: imagens do Unity em Docs/Previews.");
        }
        private static void Render(string path,Vector3 position,Vector3 target,float fov)
        {
            var go=new GameObject("Campus - camera temporaria"); var camera=go.AddComponent<Camera>();
            camera.enabled=false; camera.transform.position=position; camera.transform.LookAt(target);
            camera.fieldOfView=fov; camera.nearClipPlane=.08f; camera.farClipPlane=240f; camera.clearFlags=CameraClearFlags.Skybox;
            camera.GetUniversalAdditionalCameraData().renderPostProcessing=false;
            var rt=new RenderTexture(1920,1080,24); rt.Create(); var previous=RenderTexture.active; Texture2D image=null;
            try { RenderPipeline.SubmitRenderRequest(camera,new UniversalRenderPipeline.SingleCameraRequest { destination=rt }); RenderTexture.active=rt; image=new Texture2D(rt.width,rt.height,TextureFormat.RGB24,false); image.ReadPixels(new Rect(0,0,rt.width,rt.height),0,0); image.Apply(); File.WriteAllBytes(path,image.EncodeToPNG()); }
            finally { RenderTexture.active=previous; if(image!=null)Object.DestroyImmediate(image); rt.Release(); Object.DestroyImmediate(rt); Object.DestroyImmediate(go); }
        }
    }
}