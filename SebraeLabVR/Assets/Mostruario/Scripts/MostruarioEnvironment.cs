using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.XR.Interaction.Toolkit;
using UnityEngine.XR.Interaction.Toolkit.Locomotion.Teleportation;

namespace SebraeLab
{
    /// <summary>Prepara somente a cópia do ambiente usada pelo mostruário.</summary>
    [DefaultExecutionOrder(-100)]
    public sealed class MostruarioEnvironment : MonoBehaviour
    {
        [SerializeField] private Transform buildingRoot;
        [SerializeField] private Transform teleportRoot;
        [SerializeField] private Material materialTemplate;
        private readonly Dictionary<Material, Material> convertedMaterials = new Dictionary<Material, Material>();

        private void Awake()
        {
            if (buildingRoot == null || teleportRoot == null || materialTemplate == null)
            {
                Debug.LogError("Mostruário: faltam referências do ambiente, teleporte ou material.", this);
                return;
            }

            // O FBX inclui câmeras de modelagem e cópias de peças fora da sala.
            foreach (var camera in buildingRoot.GetComponentsInChildren<Camera>(true)) camera.enabled = false;
            foreach (var listener in buildingRoot.GetComponentsInChildren<AudioListener>(true)) listener.enabled = false;
            foreach (var light in buildingRoot.GetComponentsInChildren<Light>(true)) light.enabled = false;

            foreach (var renderer in buildingRoot.GetComponentsInChildren<MeshRenderer>(true))
            {
                var bounds = renderer.bounds;
                if (bounds.max.z < -30f || bounds.min.z > 30f || bounds.size.x > 50f || bounds.size.z > 50f)
                {
                    renderer.gameObject.SetActive(false);
                    continue;
                }
                if (!renderer.gameObject.activeInHierarchy) continue;

                var materials = renderer.sharedMaterials;
                for (var i = 0; i < materials.Length; i++) materials[i] = GetUrpMaterial(materials[i]);
                renderer.sharedMaterials = materials;

                var filter = renderer.GetComponent<MeshFilter>();
                if (filter != null && filter.sharedMesh != null && renderer.GetComponent<Collider>() == null)
                    renderer.gameObject.AddComponent<MeshCollider>().sharedMesh = filter.sharedMesh;
            }

            var manager = FindFirstObjectByType<XRInteractionManager>();
            if (manager == null) manager = gameObject.AddComponent<XRInteractionManager>();
            var provider = FindFirstObjectByType<TeleportationProvider>();
            if (provider == null)
            {
                Debug.LogError("Mostruário: o XR Origin precisa de um Teleportation Provider.", this);
                return;
            }

            foreach (var collider in teleportRoot.GetComponentsInChildren<BoxCollider>())
            {
                var area = collider.GetComponent<TeleportationArea>();
                if (area == null) area = collider.gameObject.AddComponent<TeleportationArea>();
                area.interactionManager = manager;
                area.interactionLayers = 1 << 31; // Camada Teleport dos Starter Assets instalados.
                area.teleportationProvider = provider;
                area.matchOrientation = MatchOrientation.WorldSpaceUp;
                area.colliders.Clear();
                area.colliders.Add(collider);
            }
        }

        private Material GetUrpMaterial(Material source)
        {
            if (source == null) return materialTemplate;
            if (source.shader != null && source.shader.name.StartsWith("Universal Render Pipeline/")) return source;
            if (convertedMaterials.TryGetValue(source, out var cached)) return cached;

            var material = new Material(materialTemplate) { name = source.name + " (Mostruário URP)" };
            var texture = source.HasProperty("_BaseMap") ? source.GetTexture("_BaseMap") : null;
            if (texture == null && source.HasProperty("_MainTex")) texture = source.GetTexture("_MainTex");
            material.SetTexture("_BaseMap", texture);
            var color = source.HasProperty("_Color") ? source.GetColor("_Color") : Color.white;
            material.SetColor("_BaseColor", color);
            if (source.HasProperty("_MainTex"))
            {
                material.SetTextureScale("_BaseMap", source.GetTextureScale("_MainTex"));
                material.SetTextureOffset("_BaseMap", source.GetTextureOffset("_MainTex"));
            }
            if (source.HasProperty("_Metallic")) material.SetFloat("_Metallic", source.GetFloat("_Metallic"));
            if (source.HasProperty("_Glossiness")) material.SetFloat("_Smoothness", source.GetFloat("_Glossiness"));
            if (source.HasProperty("_Mode") && source.GetFloat("_Mode") >= 2f)
            {
                material.SetFloat("_Surface", 1f);
                material.SetFloat("_SrcBlend", (float)BlendMode.SrcAlpha);
                material.SetFloat("_DstBlend", (float)BlendMode.OneMinusSrcAlpha);
                material.SetFloat("_ZWrite", 0f);
                material.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
                material.SetOverrideTag("RenderType", "Transparent");
                material.renderQueue = (int)RenderQueue.Transparent;
            }
            convertedMaterials.Add(source, material);
            return material;
        }

        private void OnDestroy()
        {
            foreach (var material in convertedMaterials.Values) Destroy(material);
            convertedMaterials.Clear();
        }
    }
}
