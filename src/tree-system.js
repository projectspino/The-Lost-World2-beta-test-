
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export async function createTreeSystem(
  scene,
  baseUrl,
  onWoodCollected = () => {},
  collisionSystem = null
) {
  const assetPath =
    baseUrl + "assets/environment/forest/";

  const modelFiles = {
    elder: "elder-canopy-tree.glb",
    young: "young-canopy-tree.glb",
    shrub: "woodland-shrub.glb"
  };

  const containers = {};
  const instances = [];
  let disposed = false;

  async function loadModel(key, fileName) {
    const container =
      await BABYLON.SceneLoader.LoadAssetContainerAsync(
        assetPath,
        fileName,
        scene
      );

    if (disposed) {
      container.dispose();
      return;
    }

    containers[key] = container;
  }

  function createInstance(
    key,
    name,
    x,
    z,
    scale,
    rotation,
    woodAmount
  ) {
    const container = containers[key];

    if (!container || disposed) return null;

    const entries = container.instantiateModelsToScene(
      sourceName => name + "-" + sourceName,
      false
    );

    const root = new BABYLON.TransformNode(
      name + "-root",
      scene
    );

    root.position.set(x, 0, z);
    root.scaling.setAll(scale);
    root.rotation.y = rotation;

    const metadata = {
      collectable: woodAmount > 0,
      collected: false,
      woodAmount,
      treeRoot: root
    };

    root.metadata = metadata;

    entries.rootNodes.forEach(node => {
      node.parent = root;
    });

    root.getChildMeshes(false).forEach(mesh => {
      mesh.isPickable = woodAmount > 0;
      mesh.checkCollisions = false;
      mesh.metadata = metadata;
    });

    // Collider batang pohon.
    // Collider tidak terlihat dan tidak bisa dipilih dengan sentuhan.
    let collider = null;

    if (woodAmount > 0 && collisionSystem) {
      collider = BABYLON.MeshBuilder.CreateCylinder(
        name + "-collision",
        {
          height: 5.5,
          diameter: 1.1,
          tessellation: 8
        },
        scene
      );

      collider.parent = root;
      collider.position.set(0, 2.75, 0);
      collider.isVisible = false;
      collider.isPickable = false;
      collider.checkCollisions = false;
      collider.metadata = null;

      collisionSystem.addCollider(collider);

      metadata.treeCollider = collider;
    }

    instances.push(root);

    return root;
  }

  try {
    await Promise.all(
      Object.entries(modelFiles).map(([key, file]) =>
        loadModel(key, file)
      )
    );
  } catch (error) {
    console.error(
      "Gagal memuat model pohon:",
      error
    );

    dispose();

    return {
      dispose
    };
  }

  if (disposed) {
    return { dispose };
  }

  // =====================================
  // HUTAN TIMUR
  // =====================================

  for (let i = 0; i < 34; i++) {
    const angle = i * 2.399;
    const radius = 24 + (i % 7) * 12;

    const x = 125 + Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius * 1.35;

    if (Math.abs(z) < 10 && x < 125) {
      continue;
    }

    const elder = i % 4 === 0;

    createInstance(
      elder ? "elder" : "young",
      "forest-tree-" + i,
      x,
      z,
      elder ? 1 : 0.8 + (i % 3) * 0.08,
      angle,
      elder ? 4 : 2
    );
  }

  // =====================================
  // HUTAN TENGAH
  // =====================================

  for (let i = 0; i < 12; i++) {
    const angle = i * 2.4;
    const radius = 38 + (i % 3) * 9;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    if (Math.abs(x - 22) < 12) {
      continue;
    }

    createInstance(
      i % 4 === 0 ? "elder" : "young",
      "central-tree-" + i,
      x,
      z,
      0.75 + (i % 3) * 0.1,
      angle,
      2
    );
  }

  // =====================================
  // SEMAK HUTAN
  // =====================================

  for (let i = 0; i < 24; i++) {
    const angle = i * 2.4;
    const radius = 28 + (i % 5) * 9;

    const x = 125 + Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    createInstance(
      "shrub",
      "forest-shrub-" + i,
      x,
      z,
      0.65 + (i % 3) * 0.12,
      angle,
      0
    );
  }

  console.log(
    "Model vegetasi berhasil dibuat:",
    instances.length
  );

  return {
    dispose
  };

  function dispose() {
    if (disposed) return;

    disposed = true;

    instances.forEach(root => {
      if (!root.isDisposed()) {
        const collider = root.metadata?.treeCollider;

        if (collider && collisionSystem) {
          collisionSystem.removeCollider(collider);
        }

        root.dispose(false, true);
      }
    });

    instances.length = 0;

    Object.values(containers).forEach(container => {
      container.dispose();
    });
  }
    }
