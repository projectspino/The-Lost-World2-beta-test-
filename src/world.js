
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

  // Material dungeon
  const dungeonStone = material("dungeon-stone", "#35383B");
  const dungeonFloor = material("dungeon-floor", "#25282D");
  const dungeonTrim = material("dungeon-trim", "#77716A");

  const torchMaterial = new BABYLON.StandardMaterial(
    "dungeon-torch-material",
    scene
  );
  torchMaterial.diffuseColor = new BABYLON.Color3(1, 0.35, 0.05);
  torchMaterial.emissiveColor = new BABYLON.Color3(1, 0.18, 0.02);

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

  // =====================================
  // DUNGEON KUNO
  // =====================================

  const dungeonX = 65;
  const dungeonZ = 35;

  // Lantai dungeon
  const dungeonGround = BABYLON.MeshBuilder.CreateGround(
    "ancient-dungeon-ground",
    {
      width: 34,
      height: 30
    },
    scene
  );

  dungeonGround.position.set(dungeonX, 0.08, dungeonZ);
  dungeonGround.material = dungeonFloor;

  // Dinding belakang
  const backWall = BABYLON.MeshBuilder.CreateBox(
    "dungeon-back-wall",
    {
      width: 34,
      height: 9,
      depth: 2
    },
    scene
  );

  backWall.position.set(dungeonX, 4.5, dungeonZ + 15);
  backWall.material = dungeonStone;

  // Dinding kiri
  const leftWall = BABYLON.MeshBuilder.CreateBox(
    "dungeon-left-wall",
    {
      width: 2,
      height: 9,
      depth: 30
    },
    scene
  );

  leftWall.position.set(dungeonX - 17, 4.5, dungeonZ);
  leftWall.material = dungeonStone;

  // Dinding kanan
  const rightWall = BABYLON.MeshBuilder.CreateBox(
    "dungeon-right-wall",
    {
      width: 2,
      height: 9,
      depth: 30
    },
    scene
  );

  rightWall.position.set(dungeonX + 17, 4.5, dungeonZ);
  rightWall.material = dungeonStone;

  // Dinding depan kiri dan kanan
  for (let i = 0; i < 2; i++) {
    const frontWall = BABYLON.MeshBuilder.CreateBox(
      "dungeon-front-wall-" + i,
      {
        width: 11,
        height: 9,
        depth: 2
      },
      scene
    );

    frontWall.position.set(
      dungeonX + (i === 0 ? -11.5 : 11.5),
      4.5,
      dungeonZ - 15
    );

    frontWall.material = dungeonStone;
  }

  // Pilar dungeon
  for (let i = 0; i < 4; i++) {
    const side = i < 2 ? -1 : 1;
    const positionZ = i % 2 === 0 ? -11 : 11;

    const pillar = BABYLON.MeshBuilder.CreateBox(
      "dungeon-pillar-" + i,
      {
        width: 2,
        height: 9,
        depth: 2
      },
      scene
    );

    pillar.position.set(
      dungeonX + side * 13,
      4.5,
      dungeonZ + positionZ
    );

    pillar.material = dungeonTrim;
  }

  // Gerbang utama dungeon
  const gateLeft = BABYLON.MeshBuilder.CreateBox(
    "dungeon-gate-left",
    {
      width: 3,
      height: 9,
      depth: 3
    },
    scene
  );

  gateLeft.position.set(dungeonX - 6, 4.5, dungeonZ - 15);
  gateLeft.material = dungeonTrim;

  const gateRight = BABYLON.MeshBuilder.CreateBox(
    "dungeon-gate-right",
    {
      width: 3,
      height: 9,
      depth: 3
    },
    scene
  );

  gateRight.position.set(dungeonX + 6, 4.5, dungeonZ - 15);
  gateRight.material = dungeonTrim;

  const gateTop = BABYLON.MeshBuilder.CreateBox(
    "dungeon-gate-top",
    {
      width: 15,
      height: 2,
      depth: 3
    },
    scene
  );

  gateTop.position.set(dungeonX, 9, dungeonZ - 15);
  gateTop.material = dungeonTrim;

  // Penanda pintu masuk
  const entranceMarker = BABYLON.MeshBuilder.CreateBox(
    "dungeon-entrance-marker",
    {
      width: 9,
      height: 6,
      depth: 0.5
    },
    scene
  );

  entranceMarker.position.set(
    dungeonX,
    3,
    dungeonZ - 15
  );

  entranceMarker.isPickable = true;
  entranceMarker.visibility = 0.01;
  entranceMarker.metadata = {
    dungeonEntrance: true,
    dungeonName: "Dungeon Kuno"
  };

  // Obor dungeon
  for (let i = 0; i < 4; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const positionZ = i < 2 ? -8 : 8;

    const torch = BABYLON.MeshBuilder.CreateCylinder(
      "dungeon-torch-" + i,
      {
        height: 2,
        diameter: 0.25
      },
      scene
    );

    torch.position.set(
      dungeonX + side * 12,
      2.5,
      dungeonZ + positionZ
    );

    torch.material = dungeonTrim;

    const flame = BABYLON.MeshBuilder.CreateSphere(
      "dungeon-flame-" + i,
      {
        diameter: 0.8,
        segments: 6
      },
      scene
    );

    flame.position.set(
      dungeonX + side * 12,
      3.8,
      dungeonZ + positionZ
    );

    flame.material = torchMaterial;

    const torchLight = new BABYLON.PointLight(
      "dungeon-light-" + i,
      new BABYLON.Vector3(
        dungeonX + side * 12,
        4,
        dungeonZ + positionZ
      ),
      scene
    );

    torchLight.diffuse = new BABYLON.Color3(1, 0.45, 0.12);
    torchLight.intensity = 0.6;
    torchLight.range = 12;
  }

  // Batu hiasan dungeon
  for (let i = 0; i < 10; i++) {
    const rock = BABYLON.MeshBuilder.CreateBox(
      "dungeon-debris-" + i,
      {
        width: 1 + (i % 3),
        height: 0.5 + (i % 2),
        depth: 1 + (i % 2)
      },
      scene
    );

    rock.position.set(
      dungeonX - 13 + (i % 5) * 6,
      0.4,
      dungeonZ - 10 + Math.floor(i / 5) * 18
    );

    rock.rotation.y = i * 0.5;
    rock.material = stone;
  }

  // Interaksi pohon dan NPC
  const pointerObserver = scene.onPointerObservable.add(
    (pointerInfo) => {
      if (
        pointerInfo.type !== BABYLON.PointerEventTypes.POINTERDOWN
      ) {
        return;
      }

      const pick = scene.pick(
        scene.pointerX,
        scene.pointerY
      );

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
    }
  );

  return function disposeWorldInteraction() {
    scene.onPointerObservable.remove(pointerObserver);
  };
      }
  
