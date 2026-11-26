
import { TransformNode, Vector3 } from "@babylonjs/core";
import { createCharacterMaterials } from "../shared/materials.js";
import { createPart } from "../shared/character-utils.js";

const MONSTERS = {
  Goblin: {
    color: "green",
    size: 0.8,
    body: "humanoid",
    weapon: "dagger",
  },
  Skeleton: {
    color: "bone",
    size: 1,
    body: "humanoid",
    weapon: "sword",
  },
  "Dire Wolf": {
    color: "shadow",
    size: 1.2,
    body: "wolf",
  },
  Orc: {
    color: "green",
    size: 1.4,
    body: "humanoid",
    weapon: "axe",
  },
  "Ancient Golem": {
    color: "metal",
    size: 2.2,
    body: "golem",
  },
  "Forest Troll": {
    color: "green",
    size: 2,
    body: "troll",
  },
  "Shadow Wraith": {
    color: "purple",
    size: 1.5,
    body: "wraith",
  },
};

export const MONSTER_TYPES = Object.keys(MONSTERS);

export function createMonster(scene, monsterName, options = {}) {
  const config = MONSTERS[monsterName] || MONSTERS.Goblin;
  const materials = createCharacterMaterials(scene);
  const root = new TransformNode(`monster_${monsterName}`, scene);
  const parts = [];

  function add(name, shape, size, position, material) {
    const mesh = createPart(
      scene,
      root,
      `${monsterName}_${name}`,
      shape,
      size,
      position,
      material
    );

    parts.push(mesh);
    return mesh;
  }

  const mainMaterial = materials[config.color];

  if (config.body === "humanoid") {
    const isGoblin = monsterName === "Goblin";
    const isSkeleton = monsterName === "Skeleton";
    const isOrc = monsterName === "Orc";

    const height = isGoblin ? 0.75 : isOrc ? 1.7 : 1;

    add("torso", "box",
      { width: 0.9 * height, height: 1.1 * height, depth: 0.5 * height },
      [0, 1.3 * height, 0], mainMaterial);

    add("head", "sphere",
      { diameter: isOrc ? 0.85 : 0.6 },
      [0, 2.15 * height, 0], mainMaterial);

    add("left_arm", "capsule",
      { height: 0.9 * height, radius: 0.17 * height },
      [-0.6 * height, 1.4 * height, 0], mainMaterial);

    add("right_arm", "capsule",
      { height: 0.9 * height, radius: 0.17 * height },
      [0.6 * height, 1.4 * height, 0], mainMaterial);

    add("left_leg", "capsule",
      { height: 0.9 * height, radius: 0.2 * height },
      [-0.25 * height, 0.45 * height, 0], mainMaterial);

    add("right_leg", "capsule",
      { height: 0.9 * height, radius: 0.2 * height },
      [0.25 * height, 0.45 * height, 0], mainMaterial);

    if (isOrc) {
      add("left_tusk", "cylinder",
        { diameter: 0.13, height: 0.35 },
        [-0.2, 1.95, 0.25], materials.bone);

      add("right_tusk", "cylinder",
        { diameter: 0.13, height: 0.35 },
        [0.2, 1.95, 0.25], materials.bone);
    }

    if (isGoblin) {
      add("left_ear", "sphere",
        { diameter: 0.3 },
        [-0.42, 2.2, 0], mainMaterial);

      add("right_ear", "sphere",
        { diameter: 0.3 },
        [0.42, 2.2, 0], mainMaterial);
    }

    if (isSkeleton) {
      add("left_eye", "sphere",
        { diameter: 0.12 },
        [-0.14, 2.17, 0.27], materials.red);

      add("right_eye", "sphere",
        { diameter: 0.12 },
        [0.14, 2.17, 0.27], materials.red);
    }

    if (config.weapon === "sword") {
      add("sword", "box",
        { width: 0.1, height: 1, depth: 0.07 },
        [0.8, 1.3, 0], materials.metal);
    }

    if (config.weapon === "dagger") {
      add("dagger", "box",
        { width: 0.08, height: 0.5, depth: 0.06 },
        [0.65, 1.1, 0], materials.metal);
    }

    if (config.weapon === "axe") {
      add("axe_handle", "cylinder",
        { diameter: 0.1, height: 1.2 },
        [0.85, 1.3, 0], materials.wood);

      add("axe_blade", "box",
        { width: 0.45, height: 0.5, depth: 0.12 },
        [0.85, 1.8, 0], materials.metal);
    }
  }

  if (config.body === "wolf") {
    add("body", "box",
      { width: 1.5, height: 0.7, depth: 0.65 },
      [0, 0.85, 0], mainMaterial);

    add("head", "sphere",
      { diameter: 0.65 },
      [0, 1.1, 0.65], mainMaterial);

    add("snout", "box",
      { width: 0.35, height: 0.25, depth: 0.45 },
      [0, 1, 1], materials.leather);

    for (const x of [-0.5, 0.5]) {
      for (const z of [-0.35, 0.35]) {
        add(`leg_${x}_${z}`, "cylinder",
          { diameter: 0.22, height: 0.8 },
          [x, 0.4, z], mainMaterial);
      }
    }

    add("tail", "capsule",
      { height: 0.8, radius: 0.13 },
      [0, 1.15, -0.8], mainMaterial);
  }

  if (config.body === "golem") {
    add("body", "box",
      { width: 1.7, height: 1.8, depth: 1 },
      [0, 1.5, 0], mainMaterial);

    add("head", "box",
      { width: 1.1, height: 1, depth: 0.9 },
      [0, 2.9, 0], mainMaterial);

    add("left_arm", "box",
      { width: 0.55, height: 1.7, depth: 0.65 },
      [-1.15, 1.5, 0], materials.metal);

    add("right_arm", "box",
      { width: 0.55, height: 1.7, depth: 0.65 },
      [1.15, 1.5, 0], materials.metal);

    add("left_eye", "sphere",
      { diameter: 0.2 },
      [-0.25, 2.95, 0.48], materials.blue);

    add("right_eye", "sphere",
      { diameter: 0.2 },
      [0.25, 2.95, 0.48], materials.blue);
  }

  if (config.body === "troll") {
    add("body", "capsule",
      { height: 2.2, radius: 0.65 },
      [0, 1.7, 0], mainMaterial);

    add("head", "sphere",
      { diameter: 0.9 },
      [0, 3, 0], mainMaterial);

    add("left_arm", "capsule",
      { height: 1.6, radius: 0.3 },
      [-0.85, 1.8, 0], mainMaterial);

    add("right_arm", "capsule",
      { height: 1.6, radius: 0.3 },
      [0.85, 1.8, 0], mainMaterial);

    add("left_leg", "capsule",
      { height: 1.2, radius: 0.3 },
      [-0.35, 0.6, 0], materials.leather);

    add("right_leg", "capsule",
      { height: 1.2, radius: 0.3 },
      [0.35, 0.6, 0], materials.leather);
  }

  if (config.body === "wraith") {
    add("body", "capsule",
      { height: 2.4, radius: 0.6 },
      [0, 1.6, 0], materials.purple);

    add("head", "sphere",
      { diameter: 0.85 },
      [0, 3, 0], materials.shadow);

    add("left_eye", "sphere",
      { diameter: 0.16 },
      [-0.2, 3.05, 0.35], materials.red);

    add("right_eye", "sphere",
      { diameter: 0.16 },
      [0.2, 3.05, 0.35], materials.red);
  }

  root.position = options.position
    ? options.position.clone()
    : Vector3.Zero();

  root.scaling.setAll(config.size * (options.scale || 1));

  return {
    root,
    monsterName,
    parts,

    dispose() {
      root.dispose(false, true);
      Object.values(materials).forEach(material => material.dispose());
    },
  };
  }
