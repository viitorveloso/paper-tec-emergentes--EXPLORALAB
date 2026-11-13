using System.IO;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace SebraeLab.Editor {
 public static class MulticenterInteriorViews {
  [MenuItem("SebraeLab/Multicenter/Mostrar stands internos")]
  public static void ShowStands(){Show(new Vector3(-57,3,8),24);}
  [MenuItem("SebraeLab/Multicenter/Mostrar plateia e palco")]
  public static void ShowStage(){Show(new Vector3(-21,3,13),22);}
  private static void Show(Vector3 pivot,float distance){var root=GameObject.Find("Interior Multicenter - Pavilhao de eventos");if(root==null){Debug.LogWarning("Abra a cena Sebrae.unity.");return;}Selection.activeGameObject=root;var view=SceneView.lastActiveSceneView;if(view!=null){view.sceneLighting=true;view.LookAt(pivot,Quaternion.Euler(7,0,0),distance);view.Repaint();}}
  [MenuItem("SebraeLab/Multicenter/Capturar interior no Unity")]
  public static void Capture(){if(EditorApplication.isPlayingOrWillChangePlaymode){Debug.LogWarning("Saia do Play para capturar a cena salva.");return;}Render("Docs/Previews/multicenter-stands-unity.png",new Vector3(-57,3.2f,-10),new Vector3(-53,3.2f,15));Render("Docs/Previews/multicenter-plateia-unity.png",new Vector3(-22,3.2f,-6),new Vector3(-21,3.3f,23));}
  private static void Render(string path,Vector3 eye,Vector3 target){var go=new GameObject("Multicenter camera temporaria");var camera=go.AddComponent<Camera>();camera.enabled=false;camera.transform.position=eye;camera.transform.LookAt(target);camera.fieldOfView=86;camera.nearClipPlane=.08f;camera.farClipPlane=180;camera.GetUniversalAdditionalCameraData().renderPostProcessing=false;var rt=new RenderTexture(1920,1080,24);rt.Create();var previous=RenderTexture.active;Texture2D image=null;try{RenderPipeline.SubmitRenderRequest(camera,new UniversalRenderPipeline.SingleCameraRequest{destination=rt});RenderTexture.active=rt;image=new Texture2D(1920,1080,TextureFormat.RGB24,false);image.ReadPixels(new Rect(0,0,1920,1080),0,0);image.Apply();Directory.CreateDirectory("Docs/Previews");File.WriteAllBytes(path,image.EncodeToPNG());}finally{RenderTexture.active=previous;if(image!=null)Object.DestroyImmediate(image);rt.Release();Object.DestroyImmediate(rt);Object.DestroyImmediate(go);}}
 }
}