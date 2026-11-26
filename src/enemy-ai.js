
import * as BABYLON from "@babylonjs/core";

export function createEnemyAI(scene, player, onPlayerHit = () => {}) {
  const enemies = [];
  let disposed = false;

  const enemyTypes = [
    {
      name: "Skeleton",
      count: 3,
      color: new BABYLON.Color3(0.82, 0.82, 0.72),
      speed: 1.8,
      health: 60,
      damage: 8,
      attackRange: 2.2,
      attackDelay: 1.5,
      scale: 0.9
    },
    {
      name: "Dire Wolf",
      count: 2,
      color: new BABYLON.Color3(0.35, 0.38, 0.42),
      speed: 3.2,
      health: 45,
      damage: 6,
      attackRange: 1.8,
      attackDelay: 1.1,
      scale: 0.8
    },
    {
      name: "Orc",
      count: 2,
      color: new BABYLON.Color3(0.25, 0.48, 0.25),
      speed: 1.2,
      health: 120,
      damage: 15,
      attackRange: 2.5,
      attackDelay: 2,
      scale: 1.25
    }
  ];

  function createMaterial(name, color) {
    const material = new BABYLON.StandardMaterial(name, scene);
    material.diffuseColor = color;
    material.specularColor = new BABYLON.Color3(0.15, 0.15, 0.15);
    return material;
  }

  function createEnemyBody(type, position, index) {
    const root = new BABYLON.TransformNode(
      `${type.name}-${index}`,
      scene
    );

    const material = createMaterial(
      `${type.name}-material-${index}`,
      type.color
    );

    let body;

    if (type.name === "Dire Wolf") {
      body = BABYLON.MeshBuilder.CreateBox(
        `${type.name}-body-${index}`,
        {
          width: 1.25,
          height: 0.65,
          depth: 0.75
        },
        scene
      );

      body.position.y = 0.65;

      const head = BABYLON.MeshBuilder.CreateBox(
        `${type.name}-head-${index}`,
        {
          width: 0.55,
          height: 0.5,
          depth: 0.55
        },
        scene
      );

      head.position.set(0, 0.9, 0.65);
      head.material = material;
      head.parent = root;

      for (let i = 0; i < 4; i++) {
        const leg = BABYLON.MeshBuilder.CreateBox(
          `${type.name}-leg-${index}-${i}`,
          {
            width: 0.18,
            height: 0.55,
            depth: 0.18
          },
          scene
        );

        leg.position.set(
          i < 2 ? -0.4 : 0.4,
          0.28,
          i % 2 === 0 ? -0.35 : 0.35
        );

        leg.material = material;
        leg.parent = root;
      }

      body.material = material;
      body.parent = root;
    } else {
      body = BABYLON.MeshBuilder.CreateCapsule(
        `${type.name}-body-${index}`,
        {
          height: 1.8,
          radius: 0.42
        },
        scene
      );

      body.position.y = 0.95;
      body.material = material;
      body.parent = root;

      const head = BABYLON.MeshBuilder.CreateSphere(
        `${type.name}-head-${index}`,
        {
          diameter: 0.65
        },
        scene
      );

      head.position.y = 1.95;
      head.material = material;
      head.parent = root;
    }

    root.position.copyFrom(position);
    root.scaling.setAll(type.scale);

    return root;
  }

  function createGolemBody(position) {
    const root = new BABYLON.TransformNode(
      "Ancient-Golem",
      scene
    );

    const stoneMaterial = createMaterial(
      "golem-stone-material",
      new BABYLON.Color3(0.28, 0.25, 0.22)
    );

    const darkMaterial = createMaterial(
      "golem-dark-stone-material",
      new BABYLON.Color3(0.12, 0.12, 0.14)
    );

    const eyeMaterial = new BABYLON.StandardMaterial(
      "golem-eye-material",
      scene
    );

    eyeMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.25, 0.05);
    eyeMaterial.emissiveColor = new BABYLON.Color3(0.8, 0.12, 0.02);

    const body = BABYLON.MeshBuilder.CreateBox(
      "golem-body",
      {
        width: 2.2,
        height: 2.8,
        depth: 1.5
      },
      scene
    );

    body.position.y = 2.1;
    body.material = stoneMaterial;
    body.parent = root;

    const head = BABYLON.MeshBuilder.CreateBox(
      "golem-head",
      {
        width: 1.5,
        height: 1.3,
        depth: 1.3
      },
      scene
    );

    head.position.y = 4.15;
    head.material = darkMaterial;
    head.parent = root;

    const leftEye = BABYLON.MeshBuilder.CreateSphere(
      "golem-left-eye",
      { diameter: 0.22 },
      scene
    );

    leftEye.position.set(-0.38, 4.25, 0.68);
    leftEye.material = eyeMaterial;
    leftEye.parent = root;

    const rightEye = BABYLON.MeshBuilder.CreateSphere(
      "golem-right-eye",
      { diameter: 0.22 },
      scene
    );

    rightEye.position.set(0.38, 4.25, 0.68);
    rightEye.material = eyeMaterial;
    rightEye.parent = root;

    const leftArm = BABYLON.MeshBuilder.CreateBox(
      "golem-left-arm",
      {
        width: 0.8,
        height: 2.3,
        depth: 0.9
      },
      scene
    );

    leftArm.position.set(-1.45, 2.15, 0);
    leftArm.material = stoneMaterial;
    leftArm.parent = root;

    const rightArm = BABYLON.MeshBuilder.CreateBox(
      "golem-right-arm",
      {
        width: 0.8,
        height: 2.3,
        depth: 0.9
      },
      scene
    );

    rightArm.position.set(1.45, 2.15, 0);
    rightArm.material = stoneMaterial;
    rightArm.parent = root;

    const leftLeg = BABYLON.MeshBuilder.CreateBox(
      "golem-left-leg",
      {
        width: 0.85,
        height: 1.4,
        depth: 1
      },
      scene
    );

    leftLeg.position.set(-0.6, 0.7, 0);
    leftLeg.material = darkMaterial;
    leftLeg.parent = root;

    const rightLeg = BABYLON.MeshBuilder.CreateBox(
      "golem-right-leg",
      {
        width: 0.85,
        height: 1.4,
        depth: 1
      },
      scene
    );

    rightLeg.position.set(0.6, 0.7, 0);
    rightLeg.material = darkMaterial;
    rightLeg.parent = root;

    root.position.copyFrom(position);

    return root;
  }

  function spawnEnemy(type, index, total) {
    const angle = (Math.PI * 2 * index) / total;
    const distance = 15 + (index % 3) * 4;

    const position = new BABYLON.Vector3(
      Math.cos(angle) * distance,
      0,
      Math.sin(angle) * distance
    );

    const mesh = createEnemyBody(type, position, index);

    enemies.push({
      name: type.name,
      mesh,
      health: type.health,
      maxHealth: type.health,
      speed: type.speed,
      damage: type.damage,
      attackRange: type.attackRange,
      attackDelay: type.attackDelay,
      attackTimer: 0,
      alive: true
    });
  }

  function spawnBoss() {
    const bossType = {
      name: "Ancient Golem",
      health: 500,
      speed: 0.85,
      damage: 20,
      attackRange: 3.8,
      attackDelay: 2.5
    };

    const position = new BABYLON.Vector3(65, 0, 43);
    const mesh = createGolemBody(position);

    enemies.push({
      name: bossType.name,
      mesh,
      health: bossType.health,
      maxHealth: bossType.health,
      speed: bossType.speed,
      damage: bossType.damage,
      attackRange: bossType.attackRange,
      attackDelay: bossType.attackDelay,
      attackTimer: 0,
      alive: true,
      isBoss: true
    });
  }

  let enemyIndex = 0;

  for (const type of enemyTypes) {
    for (let i = 0; i < type.count; i++) {
      spawnEnemy(type, enemyIndex, 7);
      enemyIndex++;
    }
  }

  spawnBoss();

  function updateEnemy(enemy, deltaTime) {
    if (!enemy.alive || !enemy.mesh || !player) return;

    const direction = player.position.subtract(
      enemy.mesh.position
    );

    direction.y = 0;

    const distance = direction.length();

    if (distance > 0.001) {
      direction.normalize();

      enemy.mesh.rotation.y = Math.atan2(
        direction.x,
        direction.z
      );
    }

    if (distance > enemy.attackRange) {
      const movement = Math.min(
        enemy.speed * deltaTime,
        Math.max(0, distance - enemy.attackRange)
      );

      enemy.mesh.position.addInPlace(
        direction.scale(movement)
      );
    } else {
      enemy.attackTimer -= deltaTime;

      if (enemy.attackTimer <= 0) {
        onPlayerHit(enemy.damage, enemy.name);
        enemy.attackTimer = enemy.attackDelay;
      }
    }
  }

  function update() {
    if (disposed) return;

    const deltaTime = Math.min(
      scene.getEngine().getDeltaTime() / 1000,
      0.05
    );

    for (const enemy of enemies) {
      updateEnemy(enemy, deltaTime);
    }
  }

  const observer = scene.onBeforeRenderObservable.add(update);

  function damageEnemy(enemyName, damage) {
    const enemy = enemies.find(item =>
      item.name === enemyName && item.alive
    );

    if (!enemy) return false;

    enemy.health -= Math.max(0, damage);

    if (enemy.health <= 0) {
      enemy.health = 0;
      enemy.alive = false;
      enemy.mesh.setEnabled(false);
      return true;
    }

    return false;
  }

  function getEnemies() {
    return enemies;
  }

  function dispose() {
    if (disposed) return;

    disposed = true;
    scene.onBeforeRenderObservable.remove(observer);

    for (const enemy of enemies) {
      if (enemy.mesh) {
        enemy.mesh.dispose(false, true);
      }
    }

    enemies.length = 0;
  }

  return {
    getEnemies,
    damageEnemy,
    dispose
  };
      }
  
