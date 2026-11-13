using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;
using UnityEngine.Rendering;
namespace SebraeLab.Editor {
 public static class Quest2Build {
  private const string Scene="Assets/Scenes/Sebrae.unity";
  [MenuItem("SebraeLab/Quest 2/Configurar Android")]
  public static void Configure(){
   PlayerSettings.companyName="ExploraLab";
   PlayerSettings.productName="SebraeLab VR";
   PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.Android,"br.exploralab.sebraelabvr");
   PlayerSettings.SetScriptingBackend(NamedBuildTarget.Android,ScriptingImplementation.IL2CPP);
   PlayerSettings.Android.targetArchitectures=AndroidArchitecture.ARM64;
   PlayerSettings.Android.minSdkVersion=AndroidSdkVersions.AndroidApiLevel32;
   PlayerSettings.Android.targetSdkVersion=AndroidSdkVersions.AndroidApiLevel34;
   PlayerSettings.Android.useCustomKeystore=false;
   PlayerSettings.SetUseDefaultGraphicsAPIs(BuildTarget.Android,false);
   PlayerSettings.SetGraphicsAPIs(BuildTarget.Android,new[]{GraphicsDeviceType.Vulkan,GraphicsDeviceType.OpenGLES3});
   EditorUserBuildSettings.buildAppBundle=false;
   EditorUserBuildSettings.androidBuildSubtarget=MobileTextureSubtarget.ASTC;
   EditorBuildSettings.scenes=new[]{new EditorBuildSettingsScene(Scene,true)};
   AssetDatabase.SaveAssets();
   Debug.Log("QUEST2_CONFIGURED: Android ARM64/IL2CPP; ASTC; APK de desenvolvimento; cena Sebrae.");
  }
  public static void Validate(){
   if(!File.Exists(Scene))throw new BuildFailedException("Cena Sebrae ausente.");
   if(!BuildPipeline.IsBuildTargetSupported(BuildTargetGroup.Android,BuildTarget.Android))throw new BuildFailedException("Android Build Support não instalado.");
   Configure();
   Directory.CreateDirectory("Tools/VRSetup");
   File.WriteAllText("Tools/VRSetup/editor-validation.txt","Editor importou e executou a validacao. Build Android e teste no Quest 2 ainda dependem da geracao e execucao do APK.");
   Debug.Log("QUEST2_EDITOR_VALIDATION_OK");
  }
  [MenuItem("SebraeLab/Quest 2/Gerar APK de desenvolvimento")]
  public static void Build(){
   Validate();
   if(EditorUserBuildSettings.activeBuildTarget!=BuildTarget.Android)throw new BuildFailedException("Selecione Android em Build Profiles antes de gerar o APK.");
   Directory.CreateDirectory("Builds/Quest2");
   var report=BuildPipeline.BuildPlayer(new BuildPlayerOptions{scenes=new[]{Scene},locationPathName="Builds/Quest2/SebraeLabVR-Quest2.apk",target=BuildTarget.Android,options=BuildOptions.Development});
   if(report.summary.result!=BuildResult.Succeeded)throw new BuildFailedException("Build Android falhou: "+report.summary.result);
   Debug.Log("QUEST2_APK_BUILT: "+Path.GetFullPath("Builds/Quest2/SebraeLabVR-Quest2.apk"));
  }
 }
}