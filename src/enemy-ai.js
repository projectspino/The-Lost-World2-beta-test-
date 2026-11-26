
import * as BABYLON from "@babylonjs/core";
import { createMonster } from "./characters/monsters/monster-factory.js";

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
      distance: 13
    },
    {
      name: "Dire Wolf",
      count: 2,
      health: 90,
      damage: 12,
      speed: 3,
      distance: 19
    },
    {
      name: "Orc",
      count: 2,
      health: 150,
      damage: 18,
      speed: 1.5,
      distance: 25
    },
    {
      name: "Ancient Golem",
      count: 1,
      health: 1000,
      damage: 30,
      speed: 0.9,
      distance: 35
    }
  ];

  for (const definition of definitions) {
    for (let i = 0; i < definition.count; i++) {
      const id = nextId++;
      const angle = (id / 8) * Math.PI * 2;

      const position = new BABYLON.Vector3(
        Math.cos(angle) * definition.distance,
        0,
        Math.sin(angle) * definition.distance
      );

      const monster = createMonster(scene, definition.name, {
        position
      });

      const mesh = monster.root;

      mesh.metadata = {
        entityType: "enemy",
        enemyId: id,
        enemyName: definition.name
      };

      enemies.push({
        id,
        name: definition.name,
        mesh,
        monster,
        health: definition.health,
        maxHealth: definition.health,
        damage: definition.damage,
        speed: definition.speed,
        alive: true,
        attackCooldown: 0,
        attackRange: definition.name === "Dire Wolf" ? 1.8 : 2.2
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
    ) {
      return;
    }

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

      if (enemy.monster && typeof enemy.monster.dispose === "function") {
        enemy.monster.dispose();
      } else if (enemy.mesh && !enemy.mesh.isDisposed()) {
        enemy.mesh.dispose();
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
      if (enemy.monster && typeof enemy.monster.dispose === "function") {
        enemy.monster.dispose();
      } else if (enemy.mesh && !enemy.mesh.isDisposed()) {
        enemy.mesh.dispose();
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
