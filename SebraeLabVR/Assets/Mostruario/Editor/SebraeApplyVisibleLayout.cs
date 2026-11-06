using System;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace SebraeLab.Editor
{
    [InitializeOnLoad]
    public static class SebraeApplyVisibleLayout
    {
        private const string Request = "Tools/apply-visible-layout.request";
        private static double next;
        static SebraeApplyVisibleLayout() { EditorApplication.update += Tick; }
        private static void Tick()
        {
            if (EditorApplication.timeSinceStartup < next) return;
            next=EditorApplication.timeSinceStartup+1;
            if (!File.Exists(Request) || EditorApplication.isCompiling || EditorApplication.isUpdating) return;
            if (EditorSceneManager.GetActiveScene().path != "Assets/Scenes/Sebrae.unity") return;
            if (EditorApplication.isPlaying) { EditorApplication.isPlaying=false; return; }
            if (EditorApplication.isPlayingOrWillChangePlaymode) return;
            string action=File.ReadAllText(Request).Trim();
            File.Delete(Request);
            try
            {
                var current=EditorSceneManager.GetActiveScene();
                if (current.isDirty)
                {
                    var backup="Assets/Scenes/Sebrae-unsaved-before-reload-"+DateTime.Now.ToString("yyyyMMdd-HHmmss")+".unity";
                    if (!EditorSceneManager.SaveScene(current,backup,true)) throw new IOException("Falha ao preservar alteracoes da cena aberta.");
                }
                EditorSceneManager.OpenScene("Assets/Scenes/Sebrae.unity");
                SebraeSceneFinishing.ApplyBoth(EditorSceneManager.GetActiveScene());
                var root=GameObject.Find(action=="lighting" ? "Lustre e focos - Salao principal" : "Salas do corredor - Exposicao");
                if (root==null) throw new InvalidOperationException("Montagem das salas ausente no arquivo carregado.");
                Selection.activeGameObject=root;
                var view=SceneView.lastActiveSceneView;
                if (view!=null)
                {
                    if(action=="lighting")view.LookAt(new Vector3(12.5f,1.35f,5.8f),Quaternion.Euler(5f,0f,0f),2f);
                    else view.LookAt(new Vector3(12f,1f,-12.1f),Quaternion.Euler(9f,180f,0f),1.25f);
                }
                SebraeLiveDiagnostics.Export();
                EditorApplication.delayCall += CaptureRoom;
                File.WriteAllText("Tools/live-layout-applied.txt","Cena atualizada carregada fora do Play; salas e paisagismo presentes.");
                Debug.Log("VISIBLE_LAYOUT_APPLIED: cena atualizada carregada fora do Play.");
            }
            catch(Exception e) { Debug.LogException(e); File.WriteAllText("Tools/live-layout-error.txt",e.ToString()); }
        }
        private static void CaptureRoom()
        {
            Capture("Tools/mostruario-principal-organizado.png",new Vector3(12.4f,1.7f,1.8f),new Vector3(12.1f,1.0f,8.5f));
            Capture("Tools/corredor-organizado.png",new Vector3(15.7f,1.65f,-7.5f),new Vector3(15.4f,1.0f,5.5f));
            Capture("Tools/pavilhao-elegante-unity.png",new Vector3(12,10,18.5f),new Vector3(12,0.5f,30));
            Capture("Tools/sala-design-elegante-unity.png",new Vector3(11.55f,1.7f,-4.65f),new Vector3(8.9f,1f,-4.65f));
            Capture("Tools/sala-mobiliada-unity.png",new Vector3(12,1.65f,-9.6f),new Vector3(12,.9f,-12.2f));
            Capture("Tools/entrada-com-plantas-unity.png",new Vector3(21.5f,1.8f,11.5f),new Vector3(17.3f,1f,7.4f));
        }
        private static void Capture(string path, Vector3 position, Vector3 target)
        {
            var go=new GameObject("Sebrae Verification Camera");
            var camera=go.AddComponent<Camera>();
            camera.enabled=false; camera.transform.position=position; camera.transform.LookAt(target);
            camera.fieldOfView=78;camera.nearClipPlane=.05f;camera.farClipPlane=90;
            camera.clearFlags=CameraClearFlags.Skybox;camera.backgroundColor=new Color(.65f,.75f,.85f);
            var data=camera.GetUniversalAdditionalCameraData(); data.renderPostProcessing=false;
            var rt=new RenderTexture(1280,800,24);rt.Create();
            Texture2D image=null;var old=RenderTexture.active;
            try
            {
                var request=new UniversalRenderPipeline.SingleCameraRequest { destination=rt };
                RenderPipeline.SubmitRenderRequest(camera,request);
                RenderTexture.active=rt;
                image=new Texture2D(1280,800,TextureFormat.RGB24,false);
                image.ReadPixels(new Rect(0,0,1280,800),0,0);image.Apply();
                File.WriteAllBytes(path,image.EncodeToPNG());
            }
            finally
            {
                RenderTexture.active=old;if(image!=null)UnityEngine.Object.DestroyImmediate(image);
                rt.Release();UnityEngine.Object.DestroyImmediate(rt);UnityEngine.Object.DestroyImmediate(go);
            }
        }
    }
}