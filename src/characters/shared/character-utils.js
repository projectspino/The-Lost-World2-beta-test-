
import {
  TransformNode,
  MeshBuilder,
  Vector3,
} from "@babylonjs/core";

export function createPart(
  scene,
  root,
  name,
  type,
  options,
  position,
  material
) {
  let mesh;

  switch (type) {
    case "sphere":
      mesh = MeshBuilder.CreateSphere(name, options, scene);
      break;

    case "cylinder":
      mesh = MeshBuilder.CreateCylinder(name, options, scene);
      break;

    case "capsule":
      mesh = MeshBuilder.CreateCapsule(name, options, scene);
      break;

    case "torus":
      mesh = MeshBuilder.CreateTorus(name, options, scene);
      break;

    default:
      mesh = MeshBuilder.CreateBox(name, options, scene);
  }

  mesh.parent = root;
  mesh.position = new Vector3(...position);

  if (material) mesh.material = material;

  return mesh;
}

export function createHumanoidBase(scene, name, materials) {
  const root = new TransformNode(name, scene);

  const parts = {};

  parts.torso = createPart(
    scene, root, `${name}_torso`, "box",
    { width: 0.85, height: 1, depth: 0.45 },
    [0, 1.45, 0], materials.cloth
  );

  parts.head = createPart(
    scene, root, `${name}_head`, "sphere",
    { diameter: 0.55 },
    [0, 2.25, 0], materials.skin
  );

  parts.leftArm = createPart(
    scene, root, `${name}_left_arm`, "capsule",
    { height: 0.85, radius: 0.16 },
    [-0.58, 1.45, 0], materials.skin
  );

  parts.rightArm = createPart(
    scene, root, `${name}_right_arm`, "capsule",
    { height: 0.85, radius: 0.16 },
    [0.58, 1.45, 0], materials.skin
  );

  parts.leftLeg = createPart(
    scene, root, `${name}_left_leg`, "capsule",
    { height: 0.9, radius: 0.19 },
    [-0.23, 0.48, 0], materials.leather
  );

  parts.rightLeg = createPart(
    scene, root, `${name}_right_leg`, "capsule",
    { height: 0.9, radius: 0.19 },
    [0.23, 0.48, 0], materials.leather
  );

  parts.leftBoot = createPart(
    scene, root, `${name}_left_boot`, "box",
    { width: 0.34, height: 0.2, depth: 0.48 },
    [-0.23, 0.08, 0.08], materials.leather
  );

  parts.rightBoot = createPart(
    scene, root, `${name}_right_boot`, "box",
    { width: 0.34, height: 0.2, depth: 0.48 },
    [0.23, 0.08, 0.08], materials.leather
  );

  return { root, parts };
    }
