using System.Collections.Generic;
using UnityEngine;

namespace SebraeLab
{
    // Mantem a fonte dinamica legivel no Scene View, no Play e no headset.
    [ExecuteAlways, DisallowMultipleComponent]
    public sealed class SebraeSignMaterials : MonoBehaviour
    {
        [SerializeField] private Material materialTemplate;
        private readonly Dictionary<Font, Material> materials = new Dictionary<Font, Material>();
        private bool preparing;

        private void OnEnable()
        {
            Font.textureRebuilt += OnFontTextureRebuilt;
            RefreshLabels();
        }

        [ContextMenu("Atualizar sinalizacao URP")]
        public void RefreshLabels()
        {
            if (materialTemplate == null || preparing) return;
            preparing = true;
            try
            {
                foreach (var label in GetComponentsInChildren<TextMesh>(true))
                {
                    var font = label.font;
                    if (font == null)
                    {
                        font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
                        label.font = font;
                    }
                    if (font == null) continue;
                    font.RequestCharactersInTexture(label.text, label.fontSize, label.fontStyle);
                    if (!materials.TryGetValue(font, out var material))
                    {
                        material = new Material(materialTemplate)
                        {
                            name = "Sebrae - Sinalizacao URP",
                            hideFlags = HideFlags.HideAndDontSave
                        };
                        materials.Add(font, material);
                    }
                    material.mainTexture = font.material.mainTexture;
                    var renderer = label.GetComponent<MeshRenderer>();
                    if (renderer != null) renderer.sharedMaterial = material;
                }
            }
            finally { preparing = false; }
        }

        private void OnFontTextureRebuilt(Font font)
        {
            if (font != null && materials.TryGetValue(font, out var material))
                material.mainTexture = font.material.mainTexture;
        }

        private void OnDisable()
        {
            Font.textureRebuilt -= OnFontTextureRebuilt;
            foreach (var material in materials.Values)
            {
                if (Application.isPlaying) Destroy(material);
                else DestroyImmediate(material);
            }
            materials.Clear();
        }
    }
}