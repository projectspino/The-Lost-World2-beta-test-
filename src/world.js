
import * as BABYLON from "@babylonjs/core";

export function buildWorld(
  scene,
  onWoodCollected = () => {},
  onNpcTalk = (name, dialogue) => {
    if (typeof window !== "undefined") {
      window.alert(name + "\n\n" + dialogue);
    }
  }
) {
  const material = (name, color) => {
    const mat = new BABYLON.StandardMaterial(name, scene);
    mat.diffuseColor = BABYLON.Color3.FromHexString(color);
    return mat;
  };

  const grass = material("grass", "#426B35");
  const water = material("water", "#287D9B");
  const stone = material("stone", "#77766F");
  const wood = material("wood", "#68452B");
  const roof = material("roof", "#653A32");
  const leaves = material("leaves", "#24552B");
  const mountain = material("mountain", "#555B59");
  const path = material("path", "#A18B68");

  const npcClothes = [
    material("npc-clothes-1", "#315D9B"),
    material("npc-clothes-2", "#8B4936"),
    material("npc-clothes-3", "#668447"),
    material("npc-clothes-4", "#B58A32")
  ];

  const skin = material("npc-skin", "#D5A477");

  // Tanah utama
  const ground = BABYLON.MeshBuilder.CreateGround(
    "world-ground",
    { width: 180, height: 180, subdivisions: 2 },
    scene
  );
  ground.material = grass;

  // Sungai
  const river = BABYLON.MeshBuilder.CreateGround(
    "river",
    { width: 9, height: 150 },
    scene
  );
  river.position.set(22, 0.04, 0);
  river.material = water;

  // Jalan desa
  const road = BABYLON.MeshBuilder.CreateGround(
    "village-road",
    { width: 8, height: 70 },
    scene
  );
  road.position.set(-12, 0.06, 0);
  road.material = path;

  // Pegunungan
  for (let i = 0; i < 9; i++) {
    const hill = BABYLON.MeshBuilder.CreateCylinder(
      "mountain-" + i,
      {
        diameterTop: 1,
        diameterBottom: 28,
        height: 22 + (i % 3) * 5,
        tessellation: 7
      },
      scene
    );

    hill.position.set(-75 + i * 19, 11, 70 + (i % 2) * 9);
    hill.material = mountain;
  }

  // Pepohonan yang bisa dikumpulkan
  for (let i = 0; i < 55; i++) {
    const x = Math.sin(i * 12.3) * 65;
    const z = Math.cos(i * 8.7) * 65;

    if (Math.abs(x - 22) < 8) continue;

    const trunk = BABYLON.MeshBuilder.CreateCylinder(
      "tree-trunk-" + i,
      { height: 3, diameter: 0.65 },
      scene
    );

    trunk.position.set(x, 1.5, z);
    trunk.material = wood;

    const crown = BABYLON.MeshBuilder.CreateSphere(
      "tree-crown-" + i,
      { diameter: 4, segments: 6 },
      scene
    );

    crown.position.set(x, 4, z);
    crown.material = leaves;

    const tree = BABYLON.Mesh.MergeMeshes(
      [trunk, crown],
      true,
      true,
      undefined,
      false,
      true
    );

    if (tree) {
      tree.name = "collectable-tree-" + i;
      tree.position.set(x, 0, z);
      tree.isPickable = true;
      tree.metadata = {
        collectable: true,
        collected: false,
        woodAmount: 2
      };
    }
  }

  // Rumah desa
  for (let i = 0; i < 6; i++) {
    const x = -28 + (i % 3) * 12;
    const z = -20 + Math.floor(i / 3) * 15;

    const house = BABYLON.MeshBuilder.CreateBox(
      "village-house-" + i,
      { width: 7, height: 5, depth: 7 },
      scene
    );

    house.position.set(x, 2.5, z);
    house.material = wood;

    const roofMesh = BABYLON.MeshBuilder.CreateCylinder(
      "house-roof-" + i,
      {
        diameterTop: 0,
        diameterBottom: 10,
        height: 4,
        tessellation: 4
      },
      scene
    );

    roofMesh.position.set(x, 6.5, z);
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.material = roof;
  }

  // NPC penduduk dan pedagang desa
  const npcData = [
    {
      name: "Eldric",
      dialogue: "Selamat datang di desa kami, petualang. Hutan di sebelah timur menyimpan banyak bahaya.",
      x: -12,
      z: -10,
      color: 0
    },
    {
      name: "Mira",
      dialogue: "Jika kamu menemukan Wood, kumpulkanlah. Bahan itu berguna untuk membuat perlengkapan.",
      x: -5,
      z: -10,
      color: 1
    },
    {
      name: "Bram",
      dialogue: "Monster berkeliaran di dekat reruntuhan. Pastikan kamu sudah siap sebelum pergi ke sana.",
      x: -24,
      z: 5,
      color: 2
    },
    {
      name: "Tomas",
      dialogue: "Selamat datang di toko desa! Aku menjual ramuan dan perlengkapan untuk para petualang.",
      x: -18,
      z: -2,
      color: 3,
      merchant: true
    }
  ];

  npcData.forEach((data, index) => {
    const body = BABYLON.MeshBuilder.CreateCapsule(
      "npc-body-" + index,
      { height: 2.2, radius: 0.45 },
      scene
    );

    body.position.set(data.x, 1.1, data.z);
    body.material = npcClothes[data.color];
    body.isPickable = true;

    const head = BABYLON.MeshBuilder.CreateSphere(
      "npc-head-" + index,
      { diameter: 0.8, segments: 8 },
      scene
    );

    head.position.set(data.x, 2.55, data.z);
    head.material = skin;
    head.isPickable = true;

    const npcMetadata = {
      npc: true,
      npcName: data.name,
      dialogue: data.dialogue,
      merchant: data.merchant === true
    };

    body.metadata = npcMetadata;
    head.metadata = npcMetadata;
  });

  // Reruntuhan batu
  for (let i = 0; i < 8; i++) {
    const ruin = BABYLON.MeshBuilder.CreateBox(
      "ruin-" + i,
      {
        width: 3,
        height: 4 + (i % 3),
        depth: 3
      },
      scene
    );

    ruin.position.set(
      48 + Math.sin(i) * 12,
      2 + (i % 3) / 2,
      -35 + i * 5
    );

    ruin.rotation.y = i * 0.4;
    ruin.material = stone;
  }

  // Batu-batu kecil
  for (let i = 0; i < 24; i++) {
    const rock = BABYLON.MeshBuilder.CreateSphere(
      "rock-" + i,
      {
        diameter: 1.5 + (i % 3),
        segments: 5
      },
      scene
    );

    rock.position.set(
      Math.sin(i * 4) * 60,
      0.6,
      Math.cos(i * 3) * 60
    );

    rock.material = stone;
  }

  // Interaksi pohon dan NPC
  const pointerObserver = scene.onPointerObservable.add((pointerInfo) => {
    if (
      pointerInfo.type !== BABYLON.PointerEventTypes.POINTERDOWN
    ) {
      return;
    }

    const pick = scene.pick(scene.pointerX, scene.pointerY);

    if (!pick || !pick.hit || !pick.pickedMesh) {
      return;
    }

    const selected = pick.pickedMesh;
    const metadata = selected.metadata;

    if (!metadata) return;

    // Bicara dengan NPC
    if (metadata.npc) {
      onNpcTalk(metadata.npcName, metadata.dialogue);
      return;
    }

    // Mengumpulkan Wood
    if (
      metadata.collectable &&
      !metadata.collected
    ) {
      metadata.collected = true;

      const amount = metadata.woodAmount;
      onWoodCollected(amount);

      selected.dispose();
    }
  });

  return function disposeWorldInteraction() {
    scene.onPointerObservable.remove(pointerObserver);
  };
}
