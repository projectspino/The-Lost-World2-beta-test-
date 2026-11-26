import * as BABYLON from "@babylonjs/core";
import { createNPC } from "./characters/npc/npc-factory.js";

export function buildWorld(
  scene,
  onWoodCollected = () => {},
  onNpcTalk = (name, dialogue) => {
    if (typeof window !== "undefined") {
      window.alert(name + "\n\n" + dialogue);
    }
  },
  onDungeonEnter = (dungeonName) => {
    if (typeof window !== "undefined") {
      window.alert("Memasuki " + dungeonName);
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
  const deepWater = material("deep-water", "#174D70");
  const stone = material("stone", "#77766F");
  const wood = material("wood", "#68452B");
  const roof = material("roof", "#653A32");
  const leaves = material("leaves", "#24552B");
  const mountain = material("mountain", "#555B59");
  const snow = material("snow", "#D5DCE0");
  const path = material("path", "#A18B68");
  const sand = material("sand", "#D2BB82");
  const swamp = material("swamp", "#465B3A");
  const swampWater = material("swamp-water", "#344F42");

  const dungeonStone = material("dungeon-stone", "#35383B");
  const dungeonFloor = material("dungeon-floor", "#25282D");
  const dungeonTrim = material("dungeon-trim", "#77716A");

  const torchMaterial = new BABYLON.StandardMaterial(
    "dungeon-torch-material",
    scene
  );
  torchMaterial.diffuseColor = new BABYLON.Color3(1, 0.35, 0.05);
  torchMaterial.emissiveColor = new BABYLON.Color3(1, 0.18, 0.02);

  // =====================================
  // DUNIA UTAMA
  // =====================================

  const ground = BABYLON.MeshBuilder.CreateGround(
    "world-ground",
    { width: 420, height: 420, subdivisions: 4 },
    scene
  );
  ground.material = grass;

  const ocean = BABYLON.MeshBuilder.CreateGround(
    "southern-ocean",
    { width: 420, height: 85 },
    scene
  );
  ocean.position.set(0, -0.05, -175);
  ocean.material = deepWater;

  const beach = BABYLON.MeshBuilder.CreateGround(
    "southern-beach",
    { width: 420, height: 32 },
    scene
  );
  beach.position.set(0, 0.02, -116);
  beach.material = sand;

  const river = BABYLON.MeshBuilder.CreateGround(
    "river",
    { width: 9, height: 150 },
    scene
  );
  river.position.set(22, 0.04, 0);
  river.material = water;

  const road = BABYLON.MeshBuilder.CreateGround(
    "village-road",
    { width: 8, height: 70 },
    scene
  );
  road.position.set(-12, 0.06, 0);
  road.material = path;

  const eastRoad = BABYLON.MeshBuilder.CreateGround(
    "east-forest-road",
    { width: 110, height: 7 },
    scene
  );
  eastRoad.position.set(105, 0.07, 0);
  eastRoad.material = path;

  const southRoad = BABYLON.MeshBuilder.CreateGround(
    "south-beach-road",
    { width: 7, height: 95 },
    scene
  );
  southRoad.position.set(-12, 0.08, -75);
  southRoad.material = path;

  const westRoad = BABYLON.MeshBuilder.CreateGround(
    "west-swamp-road",
    { width: 90, height: 7 },
    scene
  );
  westRoad.position.set(-100, 0.07, 0);
  westRoad.material = path;

  const northRoad = BABYLON.MeshBuilder.CreateGround(
    "north-mountain-road",
    { width: 7, height: 100 },
    scene
  );
  northRoad.position.set(-12, 0.07, 85);
  northRoad.material = path;

  // =====================================
  // PEGUNUNGAN UTARA
  // =====================================

  for (let i = 0; i < 15; i++) {
    const height = 22 + (i % 4) * 7;
    const diameter = 25 + (i % 3) * 8;

    const hill = BABYLON.MeshBuilder.CreateCylinder(
      "mountain-" + i,
      {
        diameterTop: 1,
        diameterBottom: diameter,
        height,
        tessellation: 7
      },
      scene
    );

    hill.position.set(
      -150 + i * 21,
      height / 2,
      155 + (i % 3) * 10
    );
    hill.material = mountain;

    if (i % 3 === 0) {
      const snowCap = BABYLON.MeshBuilder.CreateCylinder(
        "mountain-snow-" + i,
        {
          diameterTop: 0.5,
          diameterBottom: diameter * 0.32,
          height: 5,
          tessellation: 7
        },
        scene
      );

      snowCap.position.set(
        hill.position.x,
        height - 2,
        hill.position.z
      );
      snowCap.material = snow;
    }
  }

  // =====================================
  // HUTAN TIMUR
  // =====================================

  for (let i = 0; i < 115; i++) {
    const x = 55 + Math.abs(Math.sin(i * 12.3)) * 135;
    const z = Math.sin(i * 8.7) * 105;

    if (Math.abs(z) < 7 && x < 125) continue;

    const trunk = BABYLON.MeshBuilder.CreateCylinder(
      "forest-trunk-" + i,
      { height: 4, diameter: 0.8 },
      scene
    );

    trunk.position.set(x, 2, z);
    trunk.material = wood;

    const crown = BABYLON.MeshBuilder.CreateSphere(
      "forest-crown-" + i,
      { diameter: 5, segments: 6 },
      scene
    );

    crown.position.set(x, 5, z);
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
      tree.name = "collectable-tree-forest-" + i;
      tree.position.set(x, 0, z);
      tree.isPickable = true;
      tree.metadata = {
        collectable: true,
        collected: false,
        woodAmount: 3
      };
    }
  }

  // =====================================
  // RAWA BARAT
  // =====================================

  const swampGround = BABYLON.MeshBuilder.CreateGround(
    "swamp-ground",
    { width: 100, height: 100 },
    scene
  );
  swampGround.position.set(-145, 0.03, 15);
  swampGround.material = swamp;

  for (let i = 0; i < 12; i++) {
    const pond = BABYLON.MeshBuilder.CreateCylinder(
      "swamp-pond-" + i,
      {
        diameter: 8 + (i % 4) * 3,
        height: 0.15,
        tessellation: 16
      },
      scene
    );

    pond.position.set(
      -180 + (i % 4) * 22,
      0.12,
      -20 + Math.floor(i / 4) * 30
    );
    pond.material = swampWater;
  }

  for (let i = 0; i < 28; i++) {
    const trunk = BABYLON.MeshBuilder.CreateCylinder(
      "swamp-tree-" + i,
      { height: 5, diameter: 0.55 },
      scene
    );

    trunk.position.set(
      -190 + (i * 17) % 90,
      2.5,
      -25 + (i * 23) % 90
    );
    trunk.material = wood;

    const crown = BABYLON.MeshBuilder.CreateSphere(
      "swamp-crown-" + i,
      { diameter: 3.5, segments: 6 },
      scene
    );

    crown.position.set(
      trunk.position.x,
      5.5,
      trunk.position.z
    );
    crown.material = leaves;
  }

  // =====================================
  // HUTAN DAN POHON LAMA
  // =====================================

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

  // =====================================
  // RUMAH DESA
  // =====================================

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

  // =====================================
  // NPC DESA - CHARACTER FACTORY
  // =====================================

  const npcData = [
    {
      name: "Eldric",
      type: "villager",
      dialogue: "Selamat datang di desa kami, petualang. Hutan di sebelah timur menyimpan banyak bahaya.",
      x: -12,
      z: -10
    },
    {
      name: "Mira",
      type: "villager",
      dialogue: "Jika kamu menemukan Wood, kumpulkanlah. Bahan itu berguna untuk membuat perlengkapan.",
      x: -5,
      z: -10
    },
    {
      name: "Bram",
      type: "guard",
      dialogue: "Monster berkeliaran di dekat reruntuhan. Pastikan kamu sudah siap sebelum pergi ke sana.",
      x: -24,
      z: 5
    },
    {
      name: "Tomas",
      type: "merchant",
      dialogue: "Selamat datang di toko desa! Aku menjual ramuan dan perlengkapan untuk para petualang.",
      x: -18,
      z: -2
    }
  ];

  const npcInstances = [];

  npcData.forEach(data => {
    const npc = createNPC(scene, data.type, {
      position: new BABYLON.Vector3(data.x, 0, data.z)
    });

    const npcMetadata = {
      npc: true,
      npcName: data.name,
      dialogue: data.dialogue,
      merchant: data.type === "merchant"
    };

    npc.root.metadata = npcMetadata;

    npc.root.getChildMeshes().forEach(mesh => {
      mesh.metadata = npcMetadata;
      mesh.isPickable = true;
    });

    npcInstances.push(npc);
  });

  // =====================================
  // RERUNTUHAN BATU
  // =====================================

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

  const dungeonGround = BABYLON.MeshBuilder.CreateGround(
    "ancient-dungeon-ground",
    { width: 34, height: 30 },
    scene
  );
  dungeonGround.position.set(dungeonX, 0.08, dungeonZ);
  dungeonGround.material = dungeonFloor;

  const backWall = BABYLON.MeshBuilder.CreateBox(
    "dungeon-back-wall",
    { width: 34, height: 9, depth: 2 },
    scene
  );
  backWall.position.set(dungeonX, 4.5, dungeonZ + 15);
  backWall.material = dungeonStone;

  const leftWall = BABYLON.MeshBuilder.CreateBox(
    "dungeon-left-wall",
    { width: 2, height: 9, depth: 30 },
    scene
  );
  leftWall.position.set(dungeonX - 17, 4.5, dungeonZ);
  leftWall.material = dungeonStone;

  const rightWall = BABYLON.MeshBuilder.CreateBox(
    "dungeon-right-wall",
    { width: 2, height: 9, depth: 30 },
    scene
  );
  rightWall.position.set(dungeonX + 17, 4.5, dungeonZ);
  rightWall.material = dungeonStone;

  for (let i = 0; i < 2; i++) {
    const frontWall = BABYLON.MeshBuilder.CreateBox(
      "dungeon-front-wall-" + i,
      { width: 11, height: 9, depth: 2 },
      scene
    );

    frontWall.position.set(
      dungeonX + (i === 0 ? -11.5 : 11.5),
      4.5,
      dungeonZ - 15
    );
    frontWall.material = dungeonStone;
  }

  for (let i = 0; i < 4; i++) {
    const side = i < 2 ? -1 : 1;
    const positionZ = i % 2 === 0 ? -11 : 11;

    const pillar = BABYLON.MeshBuilder.CreateBox(
      "dungeon-pillar-" + i,
      { width: 2, height: 9, depth: 2 },
      scene
    );

    pillar.position.set(
      dungeonX + side * 13,
      4.5,
      dungeonZ + positionZ
    );
    pillar.material = dungeonTrim;
  }

  const gateLeft = BABYLON.MeshBuilder.CreateBox(
    "dungeon-gate-left",
    { width: 3, height: 9, depth: 3 },
    scene
  );
  gateLeft.position.set(dungeonX - 6, 4.5, dungeonZ - 15);
  gateLeft.material = dungeonTrim;

  const gateRight = BABYLON.MeshBuilder.CreateBox(
    "dungeon-gate-right",
    { width: 3, height: 9, depth: 3 },
    scene
  );
  gateRight.position.set(dungeonX + 6, 4.5, dungeonZ - 15);
  gateRight.material = dungeonTrim;

  const gateTop = BABYLON.MeshBuilder.CreateBox(
    "dungeon-gate-top",
    { width: 15, height: 2, depth: 3 },
    scene
  );
  gateTop.position.set(dungeonX, 9, dungeonZ - 15);
  gateTop.material = dungeonTrim;

  const entranceMarker = BABYLON.MeshBuilder.CreateBox(
    "dungeon-entrance-marker",
    { width: 9, height: 6, depth: 0.5 },
    scene
  );

  entranceMarker.position.set(dungeonX, 3, dungeonZ - 15);
  entranceMarker.isPickable = true;
  entranceMarker.visibility = 0.01;
  entranceMarker.metadata = {
    dungeonEntrance: true,
    dungeonName: "Dungeon Kuno"
  };

  for (let i = 0; i < 4; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const positionZ = i < 2 ? -8 : 8;

    const torch = BABYLON.MeshBuilder.CreateCylinder(
      "dungeon-torch-" + i,
      { height: 2, diameter: 0.25 },
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
      { diameter: 0.8, segments: 6 },
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

  // =====================================
  // INTERAKSI
  // =====================================

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

      if (metadata.dungeonEntrance) {
        onDungeonEnter(metadata.dungeonName || "Dungeon Kuno");
        return;
      }

      if (metadata.npc) {
        onNpcTalk(metadata.npcName, metadata.dialogue);
        return;
      }

      if (metadata.collectable && !metadata.collected) {
        metadata.collected = true;
        onWoodCollected(metadata.woodAmount);
        selected.dispose();
      }
    }
  );

  return function disposeWorldInteraction() {
    scene.onPointerObservable.remove(pointerObserver);

    npcInstances.forEach(npc => {
      if (npc && typeof npc.dispose === "function") {
        npc.dispose();
      }
    });
  };
    }
