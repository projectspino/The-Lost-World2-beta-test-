
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

      const legs = [];

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
        legs.push(leg);
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

  let enemyIndex = 0;

  for (const type of enemyTypes) {
    for (let i = 0; i < type.count; i++) {
      spawnEnemy(type, enemyIndex, 7);
      enemyIndex++;
    }
  }

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
      
