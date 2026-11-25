
import * as BABYLON from "@babylonjs/core";

export function buildWorld(scene) {
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

    hill.position.set(
      -75 + i * 19,
      11,
      70 + (i % 2) * 9
    );
    hill.material = mountain;
  }

  // Pepohonan
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
      { diameter: 1.5 + (i % 3), segments: 5 },
      scene
    );

    rock.position.set(
      Math.sin(i * 4) * 60,
      0.6,
      Math.cos(i * 3) * 60
    );
    rock.material = stone;
  }
  }
