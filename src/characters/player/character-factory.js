
import * as BABYLON from "@babylonjs/core";

const CLASS_CONFIG = {
  Ksatria: { cloth:"#315A91", trim:"#C4A45A", hair:"#493326", weapon:"sword", armor:true },
  Pemanah: { cloth:"#55733C", trim:"#B9A36B", hair:"#493326", weapon:"bow", hood:true },
  Penyihir: { cloth:"#493B83", trim:"#B5A0E8", hair:"#D4C4A0", weapon:"staff", robe:true },
  Assassin: { cloth:"#34343D", trim:"#8B3F4A", hair:"#242126", weapon:"dagger", hood:true },
  Paladin: { cloth:"#D5D1C3", trim:"#D2AD43", hair:"#B99A6B", weapon:"sword", armor:true },
  Druid: { cloth:"#466B42", trim:"#8EAD63", hair:"#765137", weapon:"staff", robe:true }
};

function mat(scene, name, hex) {
  const m = new BABYLON.StandardMaterial(name, scene);
  m.diffuseColor = BABYLON.Color3.FromHexString(hex);
  return m;
}

function part(name, root, scene, type, options, material, position, scaling) {
  const mesh = type === "sphere"
    ? BABYLON.MeshBuilder.CreateSphere(name, options, scene)
    : type === "box"
      ? BABYLON.MeshBuilder.CreateBox(name, options, scene)
      : type === "cylinder"
        ? BABYLON.MeshBuilder.CreateCylinder(name, options, scene)
        : BABYLON.MeshBuilder.CreateCapsule(name, options, scene);

  mesh.parent = root;
  mesh.position.set(...position);
  if (scaling) mesh.scaling.set(...scaling);
  mesh.material = material;
  mesh.isPickable = false;
  return mesh;
}

export function createPlayerCharacter(scene, className = "Ksatria", options = {}) {
  if (!scene) throw new Error("Scene wajib tersedia.");

  const config = CLASS_CONFIG[className] || CLASS_CONFIG.Ksatria;
  const root = new BABYLON.TransformNode("player-character-" + className, scene);

  const skin = mat(scene, className+"-skin", options.skinColor || "#C98F69");
  const cloth = mat(scene, className+"-cloth", config.cloth);
  const trim = mat(scene, className+"-trim", config.trim);
  const hair = mat(scene, className+"-hair", config.hair);
  const dark = mat(scene, className+"-dark", "#292B32");

  part("torso",root,scene,"capsule",{height:1.05,radius:0.34},cloth,[0,1.45,0],[1,1,0.72]);
  part("head",root,scene,"sphere",{diameter:0.58,segments:12},skin,[0,2.25,0],[0.88,1.08,0.82]);
  part("hair",root,scene,"sphere",{diameter:0.62,segments:10},hair,[0,2.48,0.02],[1,0.48,0.9]);

  for (const side of [-1,1]) {
    part("eye-"+side,root,scene,"sphere",{diameter:0.055},dark,[side*0.12,2.28,-0.25]);
    part("arm-"+side,root,scene,"capsule",{height:0.82,radius:0.14},cloth,[side*0.48,1.48,0]);
    part("hand-"+side,root,scene,"sphere",{diameter:0.22},skin,[side*0.49,1.02,0]);
    part("leg-"+side,root,scene,"capsule",{height:0.78,radius:0.17},dark,[side*0.19,0.55,0]);
    part("boot-"+side,root,scene,"box",{width:0.3,height:0.18,depth:0.42},trim,[side*0.19,0.12,-0.06]);
  }

  if (config.armor) {
    part("shoulder-left",root,scene,"sphere",{diameter:0.42},trim,[-0.43,1.85,0]);
    part("shoulder-right",root,scene,"sphere",{diameter:0.42},trim,[0.43,1.85,0]);
    part("chest-plate",root,scene,"box",{width:0.56,height:0.62,depth:0.12},trim,[0,1.53,-0.25]);
  }

  if (config.hood) {
    part("hood",root,scene,"sphere",{diameter:0.76},cloth,[0,2.38,0.08],[1,0.85,1]);
  }

  if (config.robe) {
    part("robe",root,scene,"cylinder",{height:1.15,diameterTop:0.68,diameterBottom:0.95,tessellation:12},cloth,[0,1.03,0]);
    part("robe-belt",root,scene,"cylinder",{height:0.12,diameter:0.72,tessellation:12},trim,[0,1.25,0]);
  }

  if (config.weapon === "sword") {
    part("sword-blade",root,scene,"box",{width:0.09,height:0.9,depth:0.045},trim,[0.78,1.35,-0.04]);
    part("sword-hilt",root,scene,"box",{width:0.34,height:0.08,depth:0.1},dark,[0.78,0.9,-0.04]);
  } else if (config.weapon === "staff") {
    part("staff",root,scene,"cylinder",{height:1.65,diameter:0.075},hair,[0.78,1.25,0.04]);
    const orbMat = mat(scene,className+"-orb",config.trim);
    orbMat.emissiveColor = BABYLON.Color3.FromHexString(config.trim).scale(0.35);
    part("staff-orb",root,scene,"sphere",{diameter:0.25},orbMat,[0.78,2.12,0.04]);
  } else if (config.weapon === "bow") {
    part("bow",root,scene,"torus",{diameter:0.8,thickness:0.055,tessellation:12},trim,[0.78,1.5,0],[0.72,1.2,0.45]);
  } else {
    part("dagger",root,scene,"box",{width:0.07,height:0.48,depth:0.04},trim,[0.72,1.2,-0.05]);
  }

  root.position.copyFrom(options.position || BABYLON.Vector3.Zero());
  root.metadata = { entityType:"player", className };

  return {
    root,
    className,
    dispose() {
      root.getChildMeshes().forEach(mesh => mesh.material = null);
      root.dispose(false, true);
      [skin,cloth,trim,hair,dark].forEach(m => m.dispose());
    }
  };
}

export const PLAYER_CLASSES = Object.keys(CLASS_CONFIG);
                   
