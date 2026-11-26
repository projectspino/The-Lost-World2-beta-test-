
import * as BABYLON from "@babylonjs/core";

export function createEnemyAI(scene, player, onPlayerHit) {
  if (!scene || !player) {
    throw new Error("Scene dan player wajib tersedia.");
  }

  const enemies = [];
  let disposed = false;
  let nextId = 1;

  const definitions = [
    {
      name: "Skeleton",
      count: 3,
      health: 70,
      damage: 8,
      speed: 1.8,
      color: new BABYLON.Color3(0.85, 0.82, 0.72),
      distance: 13
    },
    {
      name: "Dire Wolf",
      count: 2,
      health: 90,
      damage: 12,
      speed: 3,
      color: new BABYLON.Color3(0.35, 0.35, 0.4),
      distance: 19
    },
    {
      name: "Orc",
      count: 2,
      health: 150,
      damage: 18,
      speed: 1.5,
      color: new BABYLON.Color3(0.2, 0.45, 0.18),
      distance: 25
    },
    {
      name: "Ancient Golem",
      count: 1,
      health: 1000,
      damage: 30,
      speed: 0.9,
      color: new BABYLON.Color3(0.45, 0.35, 0.25),
      distance: 35
    }
  ];

  for (const definition of definitions) {
    for (let i = 0; i < definition.count; i++) {
      const id = nextId++;

      const material = new BABYLON.StandardMaterial(
        `enemy-material-${id}`,
        scene
      );

      material.diffuseColor = definition.color.clone();

      const mesh = BABYLON.MeshBuilder.CreateCapsule(
        `enemy-${definition.name}-${id}`,
        {
          height: definition.name === "Ancient Golem" ? 3.5 : 1.7,
          radius: definition.name === "Ancient Golem" ? 1.1 : 0.4
        },
        scene
      );

      const angle = (id / 8) * Math.PI * 2;

      mesh.position.set(
        Math.cos(angle) * definition.distance,
        definition.name === "Ancient Golem" ? 1.75 : 0.85,
        Math.sin(angle) * definition.distance
      );

      mesh.material = material;

      enemies.push({
        id,
        name: definition.name,
        mesh,
        health: definition.health,
        maxHealth: definition.health,
        damage: definition.damage,
        speed: definition.speed,
        alive: true,
        attackCooldown: 0,
        attackRange: definition.name === "Dire Wolf" ? 1.8 : 2.2,
        material
      });
    }
  }

  function validEnemy(enemy) {
    return Boolean(
      enemy &&
      enemy.alive &&
      enemy.mesh &&
      !enemy.mesh.isDisposed()
    );
  }

  function moveTowardsTarget(enemy, deltaSeconds) {
    if (!validEnemy(enemy)) return;

    const direction = player.position.subtract(
      enemy.mesh.position
    );

    direction.y = 0;

    const distance = direction.length();

    if (distance <= enemy.attackRange || distance < 0.001) {
      return;
    }

    direction.normalize();

    const movement = Math.min(
      enemy.speed * deltaSeconds,
      distance - enemy.attackRange
    );

    enemy.mesh.position.addInPlace(
      direction.scale(movement)
    );

    enemy.mesh.position.y =
      enemy.name === "Ancient Golem" ? 1.75 : 0.85;

    enemy.mesh.rotation.y = Math.atan2(
      direction.x,
      direction.z
    );
  }

  function updateEnemy(enemy, deltaSeconds) {
    if (!validEnemy(enemy)) return;

    enemy.attackCooldown = Math.max(
      0,
      enemy.attackCooldown - deltaSeconds
    );

    const distance = BABYLON.Vector3.Distance(
      enemy.mesh.position,
      player.position
    );

    if (distance > 35) return;

    if (distance > enemy.attackRange) {
      moveTowardsTarget(enemy, deltaSeconds);
      return;
    }

    if (enemy.attackCooldown <= 0) {
      enemy.attackCooldown = 1.5;

      if (typeof onPlayerHit === "function") {
        try {
          onPlayerHit(enemy.damage, enemy);
        } catch (error) {
          console.error("Enemy attack callback error:", error);
        }
      }
    }
  }

  function update(deltaSeconds) {
    if (
      disposed ||
      !Number.isFinite(deltaSeconds) ||
      deltaSeconds <= 0 ||
      player.isDisposed?.()
    ) return;

    for (const enemy of enemies) {
      updateEnemy(enemy, Math.min(deltaSeconds, 0.1));
    }
  }

  function damageEnemy(target, damage) {
    if (disposed) return false;

    const enemy = typeof target === "object"
      ? enemies.find(item => item === target)
      : enemies.find(item => item.id === target);

    if (!validEnemy(enemy)) return false;

    const value = Number(damage);

    if (!Number.isFinite(value) || value <= 0) {
      return false;
    }

    enemy.health = Math.max(0, enemy.health - value);

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
    return enemies.filter(validEnemy);
  }

  function getEnemyById(id) {
    const enemy = enemies.find(item => item.id === id);
    if (!enemy) return null;

    return {
      ...enemy,
      mesh: enemy.mesh
    };
  }

  function dispose() {
    if (disposed) return;

    disposed = true;

    for (const enemy of enemies) {
      if (enemy.mesh && !enemy.mesh.isDisposed()) {
        enemy.mesh.dispose();
      }

      if (enemy.material) {
        enemy.material.dispose();
      }

      enemy.alive = false;
    }

    enemies.length = 0;
  }

  const observer = scene.onBeforeRenderObservable.add(() => {
    if (disposed) return;

    const deltaSeconds =
      scene.getEngine().getDeltaTime() / 1000;

    update(deltaSeconds);
  });

  function disposeEnemyAI() {
    if (disposed) return;

    scene.onBeforeRenderObservable.remove(observer);
    dispose();
  }

  return {
    update,
    damageEnemy,
    getEnemies,
    getEnemyById,
    dispose: disposeEnemyAI
  };
}
