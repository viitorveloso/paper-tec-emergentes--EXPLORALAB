using UnityEngine;
using UnityEngine.XR.Interaction.Toolkit;
using UnityEngine.XR.Interaction.Toolkit.Locomotion.Teleportation;
namespace SebraeLab {
 [DefaultExecutionOrder(-90)]
 public sealed class MulticenterPavilionNavigation : MonoBehaviour {
  [SerializeField] private BoxCollider[] destinations;
  private void Awake(){
   var provider=FindFirstObjectByType<TeleportationProvider>();
   var manager=FindFirstObjectByType<XRInteractionManager>();
   if(provider==null||manager==null){Debug.LogWarning("Multicenter: confira o XR Origin e o Teleportation Provider.",this);return;}
   foreach(var collider in destinations){if(collider==null)continue;var area=collider.GetComponent<TeleportationArea>();if(area==null)area=collider.gameObject.AddComponent<TeleportationArea>();area.interactionManager=manager;area.interactionLayers=1<<31;area.teleportationProvider=provider;area.matchOrientation=MatchOrientation.WorldSpaceUp;area.colliders.Clear();area.colliders.Add(collider);}
  }
 }
}