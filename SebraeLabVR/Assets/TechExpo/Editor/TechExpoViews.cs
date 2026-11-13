using System.IO;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace SebraeLab.Editor {
 public static class TechExpoViews {
  [MenuItem("SebraeLab/Exposicao Tech/Mostrar sala")]
  public static void Show(){var root=GameObject.Find("Exposicao Tech - Sebraelab");if(root==null)return;Selection.activeGameObject=root;var view=SceneView.lastActiveSceneView;if(view!=null){view.sceneLighting=true;view.LookAt(new Vector3(12,1,4.6f),Quaternion.Euler(25,-30,0),8);view.Repaint();}}
  [MenuItem("SebraeLab/Exposicao Tech/Capturar imagem")]
  public static void Capture(){var go=new GameObject("Tech Expo capture");var camera=go.AddComponent<Camera>();camera.enabled=false;camera.transform.position=new Vector3(12.1f,2.15f,1.1f);camera.transform.LookAt(new Vector3(11.8f,1.05f,7.6f));camera.fieldOfView=76;camera.nearClipPlane=.05f;camera.GetUniversalAdditionalCameraData().renderPostProcessing=false;var rt=new RenderTexture(1920,1080,24);rt.Create();var previous=RenderTexture.active;Texture2D image=null;try{RenderPipeline.SubmitRenderRequest(camera,new UniversalRenderPipeline.SingleCameraRequest{destination=rt});RenderTexture.active=rt;image=new Texture2D(1920,1080,TextureFormat.RGB24,false);image.ReadPixels(new Rect(0,0,1920,1080),0,0);image.Apply();Directory.CreateDirectory("Docs/Previews");File.WriteAllBytes("Docs/Previews/tech-expo-unity.png",image.EncodeToPNG());}finally{RenderTexture.active=previous;if(image!=null)Object.DestroyImmediate(image);rt.Release();Object.DestroyImmediate(rt);Object.DestroyImmediate(go);}}
 }
}