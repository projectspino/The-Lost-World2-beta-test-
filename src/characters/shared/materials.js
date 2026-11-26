
import { PBRMaterial, Color3 } from "@babylonjs/core";

export function createCharacterMaterials(scene) {
  const colors = {
    skin: "#c98f6b",
    leather: "#493027",
    cloth: "#34445c",
    metal: "#8995a3",
    gold: "#d6a640",
    wood: "#704629",
    bone: "#d8d0b8",
    shadow: "#211d2c",
    green: "#527b43",
    red: "#a33b3b",
    blue: "#426eaa",
    purple: "#704c9c",
  };

  const materials = {};

  for (const [name, hex] of Object.entries(colors)) {
    const material = new PBRMaterial(
      `character_${name}`,
      scene
    );

    material.albedoColor = Color3.FromHexString(hex);
    material.metallic = name === "metal" || name === "gold" ? 0.65 : 0;
    material.roughness = name === "metal" || name === "gold" ? 0.35 : 0.8;

    materials[name] = material;
  }

  return materials;
}

export function disposeCharacterMaterials(materials) {
  if (!materials) return;

  for (const material of Object.values(materials)) {
    material?.dispose();
  }
}
