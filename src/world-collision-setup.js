
import { WorldColliderBuilder } from "./world-collider-builder.js";

const COLLIDER_PREFIXES = [
  "collectable-tree-",
  "collectable-tree-forest-",
  "forest-tree-",
  "central-tree-",
  "swamp-tree-",
  "mountain-",
  "village-house-",
  "house-roof-",
  "ruin-",
  "rock-",
  "dungeon-back-wall",
  "dungeon-left-wall",
  "dungeon-right-wall",
  "dungeon-front-wall-",
  "dungeon-pillar-",
  "dungeon-gate-"
];

export function setupWorldCollisions(scene, collisionSystem) {
  if (!scene || !collisionSystem) {
    throw new Error("Scene dan collisionSystem wajib tersedia.");
  }

  const builder = new WorldColliderBuilder();

  for (const mesh of scene.meshes) {
    if (!mesh || mesh.isDisposed()) continue;

    const shouldBlock = COLLIDER_PREFIXES.some(prefix =>
      mesh.name.startsWith(prefix)
    );

    if (shouldBlock) {
      builder.add(mesh);
    }
  }

  const colliders = builder.getAll();
  collisionSystem.addColliders(colliders);

  return {
    count: colliders.length,

    refresh() {
      builder.clear();

      for (const mesh of scene.meshes) {
        if (!mesh || mesh.isDisposed()) continue;

        const shouldBlock = COLLIDER_PREFIXES.some(prefix =>
          mesh.name.startsWith(prefix)
        );

        if (shouldBlock) {
          builder.add(mesh);
        }
      }

      collisionSystem.clearColliders();
      collisionSystem.addColliders(builder.getAll());

      return builder.getAll().length;
    },

    dispose() {
      builder.dispose();
    }
  };
}
