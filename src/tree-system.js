
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export async function createTreeSystem(scene, baseUrl) {
  const assetPath = baseUrl + "assets/environment/forest/";

  const modelFiles = {
    elder: "elder-canopy-tree.glb",
    young: "young-canopy-tree.glb",
    shrub: "woodland-shrub.glb"
  };

  const templates = {};
  const instances = [];

  async function loadTemplate(key, fileName) {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      assetPath,
      fileName,
      scene
    );

    const root =
      result.meshes.find(mesh => mesh.name === "__root__") ||
      result.meshes[0];

    if (!root) {
      throw new Error("Root model tidak ditemukan: " + fileName);
    }

    templates[key] = {
      root,
      meshes: result.meshes
    };
  }

  function setCollectable(root, woodAmount) {
    root.metadata = {
      collectable: woodAmount > 0,
      collected: false,
      woodAmount,
      treeRoot: root
    };

    root.isPickable = true;

    root.getChildMeshes(false).forEach(mesh => {
      mesh.metadata = root.metadata;
      mesh.isPickable = true;
    });
  }

  function placeModel(key, name, x, z, scale, rotation, woodAmount) {
    const template = templates[key];

    if (!template) return null;

    const root = template.root.clone(
      name,
      null,
      true
    );

    if (!root) return null;

    root.position.set(x, 0, z);
    root.scaling.set(scale, scale, scale);
    root.rotation.y = rotation;
    root.setEnabled(true);

    setCollectable(root, woodAmount);

    instances.push(root);

    return root;
  }

  try {
    await Promise.all([
      loadTemplate("elder", modelFiles.elder),
      loadTemplate("young", modelFiles.young),
      loadTemplate("shrub", modelFiles.shrub)
    ]);
  } catch (error) {
    console.error("Gagal memuat model vegetasi:", error);

    Object.values(templates).forEach(template => {
      template.root.dispose(false, true);
    });

    return {
      dispose() {
        instances.forEach(instance => {
          if (!instance.isDisposed()) {
            instance.dispose(false, true);
          }
        });
      }
    };
  }

  Object.values(templates).forEach(template => {
    template.root.setEnabled(false);
  });

  // HUTAN TIMUR
  for (let i = 0; i < 34; i++) {
    const angle = i * 2.399;
    const radius = 24 + (i % 7) * 12;

    const x = 125 + Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius * 1.35;

    if (Math.abs(z) < 10 && x < 125) continue;

    const isElder = i % 4 === 0;

    placeModel(
      isElder ? "elder" : "young",
      "glb-forest-tree-" + i,
      x,
      z,
      isElder ? 1.0 : 0.8 + (i % 3) * 0.08,
      (i * 1.7) % (Math.PI * 2),
      isElder ? 4 : 2
    );
  }

  // HUTAN TENGAH
  for (let i = 0; i < 12; i++) {
    const angle = i * 2.4;
    const radius = 38 + (i % 3) * 9;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    if (Math.abs(x - 22) < 12) continue;

    placeModel(
      i % 4 === 0 ? "elder" : "young",
      "glb-central-tree-" + i,
      x,
      z,
      0.75 + (i % 3) * 0.1,
      angle,
      2
    );
  }

  // SEMAK HUTAN
  for (let i = 0; i < 24; i++) {
    const angle = i * 2.4;
    const radius = 28 + (i % 5) * 9;

    const x = 125 + Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    placeModel(
      "shrub",
      "glb-forest-shrub-" + i,
      x,
      z,
      0.65 + (i % 3) * 0.12,
      angle,
      0
    );
  }

  console.log(
    "Sistem pohon 3D dimuat:",
    instances.length,
    "model"
  );

  return {
    dispose() {
      instances.forEach(instance => {
        if (!instance.isDisposed()) {
          instance.dispose(false, true);
        }
      });

      Object.values(templates).forEach(template => {
        if (!template.root.isDisposed()) {
          template.root.dispose(false, true);
        }
      });

      instances.length = 0;
    }
  };
    }
