
import * as BABYLON from "@babylonjs/core";

export function createEnemyAI(scene, player, onPlayerHit = () => {}) {
  const enemies = [];
  let disposed = false;
  let nextEnemyId = 1;

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

    if (type.name === "Dire Wolf") {
      const body = BABYLON.MeshBuilder.CreateBox(
        `${type.name}-body-${index}`,
        { width: 1.25, height: 0.65, depth: 0.75 },
        scene
      );

      body.position.y = 0.65;
      body.material = material;
      body.parent = root;

      const head = BABYLON.MeshBuilder.CreateBox(
        `${type.name}-head-${index}`,
        { width: 0.55, height: 0.5, depth: 0.55 },
        scene
      );

      head.position.set(0, 0.9, 0.65);
      head.material = material;
      head.parent = root;

      for (let i = 0; i < 4; i++) {
        const leg = BABYLON.MeshBuilder.CreateBox(
          `${type.name}-leg-${index}-${i}`,
          { width: 0.18, height: 0.55, depth: 0.18 },
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
    } else {
      const body = BABYLON.MeshBuilder.CreateCapsule(
        `${type.name}-body-${index}`,
        { height: 1.8, radius: 0.42 },
        scene
      );

      body.position.y = 0.95;
      body.material = material;
      body.parent = root;

      const head = BABYLON.MeshBuilder.CreateSphere(
        `${type.name}-head-${index}`,
        { diameter: 0.65 },
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
    const root = new BABYLON.TransformNode("Ancient-Golem", scene);

    const stone = createMaterial(
      "golem-stone-material",
      new BABYLON.Color3(0.28, 0.25, 0.22)
    );

    const dark = createMaterial(
      "golem-dark-material",
      new BABYLON.Color3(0.12, 0.12, 0.14)
    );

    const eyes = new BABYLON.StandardMaterial("golem-eye-material", scene);
    eyes.diffuseColor = new BABYLON.Color3(0.9, 0.25, 0.05);
    eyes.emissiveColor = new BABYLON.Color3(0.8, 0.12, 0.02);

    function part(name, size, positionValue, material) {
      const mesh = BABYLON.MeshBuilder.CreateBox(
        name,
        size,
        scene
      );

      mesh.position.copyFrom(positionValue);
      mesh.material = material;
      mesh.parent = root;
      return mesh;
    }

    part(
      "golem-body",
      { width: 2.2, height: 2.8, depth: 1.5 },
      new BABYLON.Vector3(0, 2.1, 0),
      stone
    );

    part(
      "golem-head",
      { width: 1.5, height: 1.3, depth: 1.3 },
      new BABYLON.Vector3(0, 4.15, 0),
      dark
    );

    for (const x of [-0.38, 0.38]) {
      const eye = BABYLON.MeshBuilder.CreateSphere(
        "golem-eye",
        { diameter: 0.22 },
        scene
      );

      eye.position.set(x, 4.25, 0.68);
      eye.material = eyes;
      eye.parent = root;
    }

    part(
      "golem-left-arm",
      { width: 0.8, height: 2.3, depth: 0.9 },
      new BABYLON.Vector3(-1.45, 2.15, 0),
      stone
    );

    part(
      "golem-right-arm",
      { width: 0.8, height: 2.3, depth: 0.9 },
      new BABYLON.Vector3(1.45, 2.15, 0),
      stone
    );

    part(
      "golem-left-leg",
      { width: 0.85, height: 1.4, depth: 1 },
      new BABYLON.Vector3(-0.6, 0.7, 0),
      dark
    );

    part(
      "golem-right-leg",
      { width: 0.85, height: 1.4, depth: 1 },
      new BABYLON.Vector3(0.6, 0.7, 0),
      dark
    );

    root.position.copyFrom(position);
    return root;
  }

  function addEnemy(type, mesh, extra = {}) {
    const enemy = {
      id: nextEnemyId++,
      name: type.name,
      mesh,
      health: type.health,
      maxHealth: type.health,
      speed: type.speed,
      damage: type.damage,
      attackRange: type.attackRange,
      attackDelay: type.attackDelay,
      attackTimer: 0,
      alive: true,
      rewarded: false,
      ...extra
    };

    enemies.push(enemy);
    return enemy;
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
    addEnemy(type, mesh);
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

    const mesh = createGolemBody(
      new BABYLON.Vector3(65, 0, 43)
    );

    addEnemy(bossType, mesh, { isBoss: true });
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
    if (
      !enemy.alive ||
      !enemy.mesh ||
      enemy.mesh.isDisposed() ||
      !player ||
      player.isDisposed?.()
    ) {
      return;
    }

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
        try {
          onPlayerHit(enemy.damage, enemy.name, enemy);
        } catch (error) {
          console.error("Gagal menjalankan serangan monster:", error);
        }

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

  function damageEnemy(target, damage) {
    if (disposed) return false;

    const enemy =
      typeof target === "object" && target !== null
        ? enemies.find(item => item === target)
        : enemies.find(
            item => item.id === target && item.alive
          );

    if (!enemy || !enemy.alive) return false;

    const amount = Number(damage);

    if (!Number.isFinite(amount) || amount <= 0) {
      return false;
    }

    enemy.health = Math.max(0, enemy.health - amount);

    if (enemy.health <= 0) {
      enemy.alive = false;

      if (enemy.mesh && !enemy.mesh.isDisposed()) {
        enemy.mesh.setEnabled(false);
      }

      return true;
    }

    return false;
  }

  function getEnemies() {
    return enemies.filter(enemy => enemy.alive);
  }

  function getEnemyById(id) {
    const enemy = enemies.find(item => item.id === id);
    return enemy ? { ...enemy } : null;
  }

  function dispose() {
    if (disposed) return;

    disposed = true;
    scene.onBeforeRenderObservable.remove(observer);

    for (const enemy of enemies) {
      if (enemy.mesh && !enemy.mesh.isDisposed()) {
        enemy.mesh.dispose(false, true);
      }
    }

    enemies.length = 0;
  }

  return {
    getEnemies,
    getEnemyById,
    damageEnemy,
    dispose
  };
  }
