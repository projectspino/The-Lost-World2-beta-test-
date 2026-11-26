
export class BiomeDecorator {
  constructor(scene) {
    this.scene = scene;
    this.objects = [];
    this.materials = {};
    this.createMaterials();
  }

  createMaterials() {
    const B = BABYLON;

    const create = (name, color) => {
      const material = new B.StandardMaterial(name, this.scene);
      material.diffuseColor = B.Color3.FromHexString(color);
      material.specularColor = new B.Color3(0.12, 0.12, 0.12);
      this.materials[name] = material;
    };

    create("pineGreen", "#244D35");
    create("pineLight", "#39734A");
    create("rockGray", "#62666B");
    create("swampGreen", "#465B36");
    create("crystalBlue", "#55C9E8");
    create("crystalPurple", "#9872D5");
    create("mountainStone", "#858B96");
    create("deadWood", "#60452E");
  }

  track(mesh) {
    this.objects.push(mesh);
    return mesh;
  }

  createPine(x, z, scale = 1) {
    const B = BABYLON;

    const trunk = B.MeshBuilder.CreateCylinder(
      "pineTrunk",
      { height: 3 * scale, diameter: 0.65 * scale },
      this.scene
    );

    trunk.position.set(x, 1.5 * scale, z);
    trunk.material = this.materials.deadWood;
    this.track(trunk);

    for (let i = 0; i < 3; i++) {
      const leaves = B.MeshBuilder.CreateCylinder(
        "pineLeaves",
        {
          height: 3.2 * scale,
          diameterTop: 0,
          diameterBottom: (3.4 - i * 0.55) * scale,
          tessellation: 7
        },
        this.scene
      );

      leaves.position.set(
        x,
        (3.2 + i * 1.35) * scale,
        z
      );

      leaves.material = i === 0
        ? this.materials.pineGreen
        : this.materials.pineLight;

      this.track(leaves);
    }
  }

  createRock(x, z, scale = 1, materialName = "rockGray") {
    const rock = BABYLON.MeshBuilder.CreatePolyhedron(
      "biomeRock",
      { type: 1, size: scale },
      this.scene
    );

    rock.position.set(x, scale * 0.65, z);
    rock.scaling.y = 0.7;
    rock.rotation.y = Math.random() * Math.PI;

    rock.material = this.materials[materialName];
    this.track(rock);
  }

  createCrystal(x, z, scale = 1, color = "crystalBlue") {
    const crystal = BABYLON.MeshBuilder.CreateCylinder(
      "biomeCrystal",
      {
        height: 3 * scale,
        diameterTop: 0,
        diameterBottom: 1.1 * scale,
        tessellation: 6
      },
      this.scene
    );

    crystal.position.set(x, 1.5 * scale, z);
    crystal.rotation.z = 0.12;
    crystal.material = this.materials[color];
    this.track(crystal);

    return crystal;
  }

  buildForest() {
    [
      [45, -70, 1.2],
      [75, -85, 1],
      [115, -45, 1.3],
      [155, -90, 1.1],
      [175, -130, 1.4],
      [55, -145, 1.1]
    ].forEach(p => this.createPine(...p));

    this.createRock(90, -60, 2);
    this.createRock(145, -125, 1.5);
  }

  buildSwamp() {
    [
      [-65, 35, 1.4],
      [-105, 75, 1.1],
      [-145, 20, 1.3],
      [-175, 90, 1.5]
    ].forEach(p => this.createRock(
      p[0], p[1], p[2], "swampGreen"
    ));

    this.createCrystal(-120, 50, 0.8, "crystalPurple");
    this.createCrystal(-90, 100, 0.65, "crystalBlue");
  }

  buildMountain() {
    [
      [-100, -145, 3],
      [-55, -180, 2.5],
      [35, -190, 3.2],
      [110, -150, 2.8],
      [140, -180, 2]
    ].forEach(p => this.createRock(
      p[0], p[1], p[2], "mountainStone"
    ));

    this.createCrystal(-25, -155, 1.5, "crystalBlue");
    this.createCrystal(75, -170, 1.8, "crystalPurple");
  }

  buildAncientRuins() {
    this.createCrystal(48, 48, 1.5, "crystalPurple");
    this.createCrystal(82, 48, 1.2, "crystalBlue");
    this.createRock(45, 75, 1.8, "mountainStone");
    this.createRock(95, 75, 2, "rockGray");
  }

  buildAll() {
    this.buildForest();
    this.buildSwamp();
    this.buildMountain();
    this.buildAncientRuins();

    return this.objects;
  }

  dispose() {
    for (const object of this.objects) {
      object.dispose();
    }

    this.objects = [];

    for (const material of Object.values(this.materials)) {
      material.dispose();
    }

    this.materials = {};
  }
      }
