
import { Vector3, TransformNode } from "@babylonjs/core";
import { createCharacterMaterials } from "../shared/materials.js";
import { createPart } from "../shared/character-utils.js";

const CLASS_CONFIG = {
  Ksatria: { cloth: "blue", armor: "metal", weapon: "sword" },
  Pemanah: { cloth: "green", armor: "leather", weapon: "bow" },
  Penyihir: { cloth: "purple", armor: "cloth", weapon: "staff" },
  Assassin: { cloth: "shadow", armor: "leather", weapon: "dagger" },
  Paladin: { cloth: "gold", armor: "metal", weapon: "sword" },
  Druid: { cloth: "green", armor: "wood", weapon: "staff" },
};

export const PLAYER_CLASSES = Object.keys(CLASS_CONFIG);

export function createPlayerCharacter(
  scene,
  className = "Ksatria",
  options = {}
) {
  const config = CLASS_CONFIG[className] || CLASS_CONFIG.Ksatria;
  const materials = createCharacterMaterials(scene);
  const root = new TransformNode(`player_${className}`, scene);

  function part(name, type, size, position, material) {
    return createPart(
      scene,
      root,
      `${className}_${name}`,
      type,
      size,
      position,
      material
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

  // Armor
  part("chest_armor", "box",
    { width: 0.9, height: 0.48, depth: 0.48 },
    [0, 1.65, -0.015], materials[config.armor]);

  part("belt", "box",
    { width: 0.88, height: 0.13, depth: 0.48 },
    [0, 1.05, 0], materials.gold);

  part("left_shoulder", "sphere",
    { diameter: 0.36 },
    [-0.57, 1.82, 0], materials[config.armor]);

  part("right_shoulder", "sphere",
    { diameter: 0.36 },
    [0.57, 1.82, 0], materials[config.armor]);

  // Sepatu
  part("left_boot", "box",
    { width: 0.34, height: 0.2, depth: 0.48 },
    [-0.23, 0.08, 0.08], materials.leather);

  part("right_boot", "box",
    { width: 0.34, height: 0.2, depth: 0.48 },
    [0.23, 0.08, 0.08], materials.leather);

  // Kepala
  if (className === "Penyihir") {
    part("wizard_hat", "cylinder",
      { diameterTop: 0, diameterBottom: 0.75, height: 0.8 },
      [0, 2.82, 0], materials.purple);
  } else {
    part("hair", "sphere",
      { diameter: 0.59 },
      [0, 2.48, 0], materials.leather);
  }

  // Mata
  part("left_eye", "sphere",
    { diameter: 0.07 },
    [-0.12, 2.28, 0.25], materials.shadow);

  part("right_eye", "sphere",
    { diameter: 0.07 },
    [0.12, 2.28, 0.25], materials.shadow);

  // Senjata
  if (config.weapon === "sword") {
    part("sword_blade", "box",
      { width: 0.09, height: 0.95, depth: 0.06 },
      [0.82, 1.25, 0], materials.metal);

    part("sword_handle", "cylinder",
      { diameter: 0.1, height: 0.35 },
      [0.82, 0.7, 0], materials.wood);

    part("sword_guard", "box",
      { width: 0.38, height: 0.08, depth: 0.1 },
      [0.82, 0.91, 0], materials.gold);
  }

  if (config.weapon === "dagger") {
    part("dagger_blade", "box",
      { width: 0.08, height: 0.48, depth: 0.05 },
      [0.78, 1.25, 0], materials.metal);

    part("dagger_handle", "cylinder",
      { diameter: 0.09, height: 0.2 },
      [0.78, 0.9, 0], materials.leather);
  }

  if (config.weapon === "staff") {
    part("magic_staff", "cylinder",
      { diameter: 0.09, height: 1.8 },
      [0.8, 1.25, 0], materials.wood);

    part("staff_orb", "sphere",
      { diameter: 0.3 },
      [0.8, 2.2, 0], materials.blue);
  }

  if (config.weapon === "bow") {
    part("bow", "torus",
      { diameter: 0.85, thickness: 0.07, tessellation: 24 },
      [0.8, 1.45, 0], materials.wood);
  }

  if (options.position) {
    root.position.copyFrom(options.position);
  }

  if (options.scale) {
    root.scaling.setAll(options.scale);
  }

  return {
    root,
    className,

    dispose() {
      root.dispose(false, true);
      Object.values(materials).forEach(m => m.dispose());
    },
  };
       }
