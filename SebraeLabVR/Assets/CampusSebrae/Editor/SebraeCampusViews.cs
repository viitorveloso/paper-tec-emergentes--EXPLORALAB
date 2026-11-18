using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace SebraeLab.Editor
{
    public static class SebraeCampusViews
    {
        private const string Exterior = "Exterior Multicenter - acessos e fachada";
        private const string ScenePath = "Assets/Scenes/Sebrae.unity";
        private const float AvenueShiftZ = -99f;

        private static readonly Vector3 AccessEye = new Vector3(-76.25f, 0.62f, -51.6f);
        private static readonly Vector3 AccessTarget = new Vector3(-44.5f, 4.15f, -12f);
        private static readonly Vector3 CampusEye = new Vector3(-91f, 34f, -91f);
        private static readonly Vector3 CampusTarget = new Vector3(-36f, 3.2f, -13f);
        private static readonly Vector3 LabEye = new Vector3(22f, 3.86f, -32.6f);
        private static readonly Vector3 LabTarget = new Vector3(12.2f, 2.32f, -17.45f);

        [MenuItem("SebraeLab/Campus/Mostrar Multicenter e Sebraelab")]
        public static void ShowCampus() => Show(CampusEye, CampusTarget, 58f);

        [MenuItem("SebraeLab/Campus/Mostrar acesso coberto")]
        public static void ShowAccess() => Show(AccessEye, AccessTarget, 23f);

        [MenuItem("SebraeLab/Campus/Mostrar anexo verde e placa")]
        public static void ShowLab() => Show(LabEye, LabTarget, 9f);

        public static void OpenLab()
        {
            EditorSceneManager.OpenScene(ScenePath);
            EditorApplication.delayCall += ShowLab;
        }

        private static readonly Vector3 GateEye = new Vector3(-53.8f, .76f, -96.9f + AvenueShiftZ);
        private static readonly Vector3 GateTarget = new Vector3(-41.7f, 2.52f, -74.1f + AvenueShiftZ);

        [MenuItem("SebraeLab/Campus/Mostrar portaria e porticos")]
        public static void ShowEntrance() => Show(GateEye, GateTarget, 20f);

        public static void OpenEntrance()
        {
            EditorSceneManager.OpenScene(ScenePath);
            EditorApplication.delayCall += ShowEntrance;
        }

        private static readonly Vector3 AerialEye = new Vector3(-184.7f, 57f, -103f);
        private static readonly Vector3 AerialTarget = new Vector3(-81f, 4f, -4f);

        [MenuItem("SebraeLab/Campus/Mostrar cobertura e patio de servico")]
        public static void ShowServiceYard() => Show(AerialEye, AerialTarget, 72f);

        public static void OpenServiceYard()
        {
            EditorSceneManager.OpenScene(ScenePath);
            EditorApplication.delayCall += ShowServiceYard;
        }

        private static readonly Vector3 ParkingEye = new Vector3(-55f, 51f, -72f);
        private static readonly Vector3 ParkingTarget = new Vector3(-38f, 1.1f, -29f);

        [MenuItem("SebraeLab/Campus/Mostrar escadaria do estacionamento")]
        public static void ShowParkingStair() => Show(ParkingEye, ParkingTarget, 46f);

        public static void OpenParkingStair()
        {
            EditorSceneManager.OpenScene(ScenePath);
            EditorApplication.delayCall += ShowParkingStair;
        }

        private static readonly Vector3 FrontEye = new Vector3(-106f, 76f, -127f);
        private static readonly Vector3 FrontTarget = new Vector3(-65f, 1f, -32f);

        [MenuItem("SebraeLab/Campus/Mostrar frente do complexo")]
        public static void ShowFront() => Show(FrontEye, FrontTarget, 90f);

        public static void OpenFront()
        {
            EditorSceneManager.OpenScene(ScenePath);
            EditorApplication.delayCall += ShowFront;
        }

        private static readonly Vector3 LotEye = new Vector3(-40f, 112f, -37.5f);
        private static readonly Vector3 LotTarget = new Vector3(-40f, -.9f, -138.5f);
        private static readonly Vector3 EastEye = new Vector3(49.9f, 25.4f, -43.6f);
        private static readonly Vector3 EastTarget = new Vector3(21.5f, .6f, -14.25f);

        [MenuItem("SebraeLab/Campus/Mostrar estacionamento principal")]
        public static void ShowVisitorLot() => Show(LotEye, LotTarget, 118f);

        [MenuItem("SebraeLab/Campus/Mostrar curva ao lado do Sebraelab")]
        public static void ShowEastDrive() => Show(EastEye, EastTarget, 35f);

        private static void Show(Vector3 eye, Vector3 target, float size)
        {
            GameObject root = FindExterior();
            SceneView view = SceneView.lastActiveSceneView;
            if (root == null || view == null)
                return;

            Selection.activeGameObject = root;
            view.sceneLighting = true;
            view.LookAt(target, Quaternion.LookRotation(target - eye), size);
            view.Repaint();
        }

        [MenuItem("SebraeLab/Campus/Capturar imagens no Unity")]
        public static void Capture()
        {
            if (EditorApplication.isPlayingOrWillChangePlaymode || FindExterior() == null)
                return;

            Directory.CreateDirectory("Docs/Previews");
            // Prime URP's offscreen resources before saving the first frame.
            Render(null, CampusEye, CampusTarget, 48f);
            Render("multicenter-acesso-unity", AccessEye, AccessTarget, 59f, 1280);
            Render("campus-unity", CampusEye, CampusTarget, 48f);
            Render("multicenter-frente-complexo-unity", FrontEye, FrontTarget, 60f);
            Render("multicenter-estacionamento-principal-unity", LotEye, LotTarget, 60f);
            Render("multicenter-curva-sebraelab-unity", EastEye, EastTarget, 55f);
            Render("multicenter-escadaria-unity", ParkingEye, ParkingTarget, 55f);
            Render("multicenter-escadaria-pedestre-unity", new Vector3(-39.55f,.74f,-61.4f), new Vector3(-39.35f,2.7f,-31.6f), 55f);
            Render("multicenter-aerea-servico-unity", AerialEye, AerialTarget, 48f);
            Render("multicenter-docas-unity", new Vector3(-150.9f,1.05f,-31.1f), new Vector3(-136.7f,1.45f,-11f), 62f);
            Render("multicenter-portaria-unity", GateEye, GateTarget, 60f);
            Render("multicenter-portaria-lateral-unity", new Vector3(-67.4f,.72f,-94f + AvenueShiftZ), new Vector3(-64.6f,2.6f,-79f + AvenueShiftZ), 59f);
            Render("multicenter-bloco-sebrae-unity", new Vector3(-116f,1.0f,-73f), new Vector3(-105.2f,3.05f,-49.4f), 60f);
            Render("sebraelab-unity", LabEye, LabTarget, 51f);
            Render("sebraelab-placa-unity", new Vector3(15.4f, 2.17f, -24.8f), new Vector3(12.55f, 1.35f, -19.9f), 47f);
            Render("multicenter-frontal-unity", new Vector3(-63.2f, 1.63f, -36.3f), new Vector3(-50f, 4.3f, -16.9f), 64f);
            Debug.Log("Imagens do campus salvas em Docs/Previews.");
        }

        private static GameObject FindExterior()
        {
            GameObject root = GameObject.Find(Exterior);
            if (root == null)
                Debug.LogWarning("Abra a cena Assets/Scenes/Sebrae.unity para ver o exterior do Multicenter.");
            return root;
        }

        // Also callable by the editor in batch mode after importing the project.
        public static void ValidateExterior()
        {
            EditorSceneManager.OpenScene(ScenePath);
            GameObject exterior = FindExterior();
            if (exterior == null || RenderSettings.skybox == null)
                throw new System.InvalidOperationException("A revisão exterior ou o céu está ausente.");

            foreach (MeshFilter filter in exterior.GetComponentsInChildren<MeshFilter>())
            {
                MeshRenderer renderer = filter.GetComponent<MeshRenderer>();
                if (filter.sharedMesh == null || filter.sharedMesh.vertexCount == 0 || renderer.sharedMaterial == null)
                    throw new System.InvalidOperationException("Malha ou material ausente em " + filter.name);
            }

            Physics.SyncTransforms();
            Vector3 ramp = new Vector3(-78.4f, 3f, -39f);
            if (!Physics.Raycast(ramp, Vector3.down, out RaycastHit hit, 5f)
                || !hit.collider.transform.IsChildOf(exterior.transform))
                throw new System.InvalidOperationException("A rampa exterior não tem a colisão esperada.");

            var entranceFloor = new Vector3(-30f, 2f, -76f + AvenueShiftZ);
            if (!Physics.Raycast(entranceFloor, Vector3.down, out RaycastHit entranceHit, 5f)
                || entranceHit.collider.name != "Pavimento intertravado da entrada")
                throw new System.InvalidOperationException("O piso da entrada pela avenida não tem a colisão esperada.");

            var serviceFloor = new Vector3(-142.15f, 2f, -27.1f);
            if (!Physics.Raycast(serviceFloor, Vector3.down, out RaycastHit serviceHit, 5f)
                || serviceHit.collider.name != "Pista lateral de carga e descarga")
                throw new System.InvalidOperationException("O piso da pista de serviço não tem a colisão esperada.");

            var stairFloor = new Vector3(-40.15f, 2.5f, -47.17f);
            if (!Physics.Raycast(stairFloor, Vector3.down, out RaycastHit stairHit, 5f)
                || stairHit.collider.name != "Degraus e patamares azuis")
                throw new System.InvalidOperationException("A escadaria do estacionamento não tem a colisão esperada.");

            if (!Physics.Raycast(new Vector3(-106.6f, 1.7f, -61.69f), Vector3.down, out RaycastHit frontHit, 5f)
                || frontHit.collider.name != "Pavimento continuo")
                throw new System.InvalidOperationException("A pista frontal do bloco Sebrae não tem a colisão esperada.");

            CheckFloor(new Vector3(-39.7f, 2f, -112f), "Asfalto do estacionamento principal");
            CheckFloor(new Vector3(-39.5f, 2f, -69.3f), "Ligação de pedestres do estacionamento");
            CheckFloor(new Vector3(34.25f, 2f, -10.9f), "Pista curva do acesso leste");
            CheckFloor(new Vector3(39.18f, 2f, 1.6f), "Passeio externo da curva leste");

            Debug.Log("MULTICENTER_EXTERIOR_EDITOR_OK");
            var arguments = System.Environment.GetCommandLineArgs();
            if (System.Array.IndexOf(arguments, "-bakeEntranceReflection") >= 0)
                BakeEntranceReflection();
            if (System.Array.IndexOf(arguments, "-captureExterior") >= 0)
                Capture();
            if (System.Array.IndexOf(arguments, "-captureTechExpo") >= 0)
                TechExpoViews.Capture();
        }

        private static void CheckFloor(Vector3 origin, string expectedName)
        {
            if (!Physics.Raycast(origin, Vector3.down, out RaycastHit hit, 5f) || hit.collider.name != expectedName)
                throw new System.InvalidOperationException("Colisão ausente em " + expectedName);
        }

        private static void BakeEntranceReflection()
        {
            const string path = "Assets/CampusSebrae/Exterior/Textures/ReflexoPortaria.exr";
            var probeObject = GameObject.Find("Reflexo local da guarita");
            var probe = probeObject == null ? null : probeObject.GetComponent<ReflectionProbe>();
            if (probe == null)
                throw new System.InvalidOperationException("A sonda de reflexo da guarita está ausente.");

            probe.mode = ReflectionProbeMode.Baked;
            if (!Lightmapping.BakeReflectionProbe(probe, path))
                throw new System.InvalidOperationException("O Unity não conseguiu gravar o reflexo da guarita.");
            AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceSynchronousImport);
            var texture = AssetDatabase.LoadAssetAtPath<Cubemap>(path);
            if (texture == null || !AssetDatabase.TryGetGUIDAndLocalFileIdentifier(texture, out string guid, out long id))
                throw new System.InvalidOperationException("O cubemap da guarita não foi importado.");

            probe.mode = ReflectionProbeMode.Custom;
            probe.customBakedTexture = texture;
            Debug.Log("MULTICENTER_GATE_REFLECTION_OK " + guid + " " + id);
        }

        internal static void Render(string filename, Vector3 eye, Vector3 target, float verticalFov, int height = 1080)
        {
            const int width = 1920;
            var cameraObject = new GameObject("Campus - camera temporaria");
            var renderTarget = new RenderTexture(width, height, 24);
            RenderTexture previous = RenderTexture.active;
            Texture2D image = null;
            try
            {
                var camera = cameraObject.AddComponent<Camera>();
                camera.enabled = false;
                camera.transform.SetPositionAndRotation(eye, Quaternion.LookRotation(target - eye));
                camera.fieldOfView = verticalFov;
                camera.nearClipPlane = .06f;
                camera.farClipPlane = 355f;
                camera.clearFlags = CameraClearFlags.Skybox;
                camera.GetUniversalAdditionalCameraData().renderPostProcessing = false;
                renderTarget.Create();

                var request = new UniversalRenderPipeline.SingleCameraRequest { destination = renderTarget };
                RenderPipeline.SubmitRenderRequest(camera, request);
                RenderTexture.active = renderTarget;
                image = new Texture2D(width, height, TextureFormat.RGB24, false);
                image.ReadPixels(new Rect(0, 0, width, height), 0, 0);
                image.Apply();
                if (filename != null)
                    File.WriteAllBytes(Path.Combine("Docs", "Previews", filename + ".png"), image.EncodeToPNG());
            }
            finally
            {
                RenderTexture.active = previous;
                if (image != null)
                    Object.DestroyImmediate(image);
                renderTarget.Release();
                Object.DestroyImmediate(renderTarget);
                Object.DestroyImmediate(cameraObject);
            }
        }
    }
}
