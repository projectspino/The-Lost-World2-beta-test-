
import { TransformNode, Vector3 } from "@babylonjs/core";
import { createCharacterMaterials } from "../shared/materials.js";
import { createPart } from "../shared/character-utils.js";

const NPC_CONFIG = {
  villager: {
    cloth: "green",
    armor: "leather",
    accessory: "none",
  },
  merchant: {
    cloth: "gold",
    armor: "leather",
    accessory: "bag",
  },
  guard: {
    cloth: "blue",
    armor: "metal",
    accessory: "helmet",
  },
};

export function createNPC(scene, type = "villager", options = {}) {
  const config = NPC_CONFIG[type] || NPC_CONFIG.villager;
  const materials = createCharacterMaterials(scene);
  const root = new TransformNode(`npc_${type}`, scene);

  function part(name, shape, size, position, material) {
    return createPart(
      scene, root, `npc_${type}_${name}`,
      shape, size, position, material
    );
  }

  // Tubuh
  part("torso", "box",
    { width: 0.85, height: 1, depth: 0.45 },
    [0, 1.45, 0], materials[config.cloth]);

  part("head", "sphere",
    { diameter: 0.55 },
    [0, 2.25, 0], materials.skin);

  part("left_arm", "capsule",
    { height: 0.85, radius: 0.16 },
    [-0.58, 1.45, 0], materials.skin);

  part("right_arm", "capsule",
    { height: 0.85, radius: 0.16 },
    [0.58, 1.45, 0], materials.skin);

  part("left_leg", "capsule",
    { height: 0.9, radius: 0.19 },
    [-0.23, 0.48, 0], materials.leather);

  part("right_leg", "capsule",
    { height: 0.9, radius: 0.19 },
    [0.23, 0.48, 0], materials.leather);

  // Sabuk dan pelindung bahu
  part("belt", "box",
    { width: 0.88, height: 0.13, depth: 0.48 },
    [0, 1.05, 0], materials.gold);

  if (type === "guard") {
    part("helmet", "sphere",
      { diameter: 0.68 },
      [0, 2.48, 0], materials.metal);

    part("helmet_visor", "box",
      { width: 0.4, height: 0.1, depth: 0.1 },
      [0, 2.3, 0.25], materials.shadow);

    part("left_shoulder", "sphere",
      { diameter: 0.38 },
      [-0.57, 1.82, 0], materials.metal);

    part("right_shoulder", "sphere",
      { diameter: 0.38 },
      [0.57, 1.82, 0], materials.metal);

    part("spear", "cylinder",
      { diameter: 0.07, height: 2.4 },
      [0.85, 1.4, 0], materials.wood);
  } else {
    part("hair", "sphere",
      { diameter: 0.59 },
      [0, 2.48, 0], materials.leather);
  }

  if (type === "merchant") {
    part("merchant_bag", "box",
      { width: 0.4, height: 0.45, depth: 0.3 },
      [-0.55, 1.05, -0.25], materials.wood);

    part("merchant_hat", "cylinder",
      { diameter: 0.75, height: 0.15 },
      [0, 2.55, 0], materials.gold);
  }

  if (options.position) {
    root.position = options.position.clone();
  } else {
    root.position = Vector3.Zero();
  }

  return {
    root,
    type,
    dispose() {
      root.dispose(false, true);
      Object.values(materials).forEach(material => material.dispose());
    },
  };
}

export const NPC_TYPES = Object.keys(NPC_CONFIG);
  
