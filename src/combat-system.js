
import * as BABYLON from "@babylonjs/core";

export function createCombatSystem(
  scene,
  player,
  attackButton,
  playerStats,
  inventory,
  enemyAI = null,
  questSystem = null,
  equipmentSystem = null
) {
  const goblins = [];
  let disposed = false;

  const goldRewards = {
    Goblin: 5,
    Skeleton: 8,
    "Dire Wolf": 10,
    Orc: 15
  };

  const goblinMaterial = new BABYLON.StandardMaterial(
    "goblin-material",
    scene
  );
  goblinMaterial.diffuseColor =
    new BABYLON.Color3(0.2, 0.55, 0.18);

  const eyeMaterial = new BABYLON.StandardMaterial(
    "goblin-eye-material",
    scene
  );
  eyeMaterial.diffuseColor =
    new BABYLON.Color3(1, 0.8, 0.1);

  for (let i = 0; i < 5; i++) {
    const goblin = BABYLON.MeshBuilder.CreateCapsule(
      "goblin-" + i,
      { height: 1.7, radius: 0.4 },
      scene
    );

    goblin.position.set(
      8 + (i % 3) * 4,
      0.85,
      8 + Math.floor(i / 3) * 5
    );

    goblin.material = goblinMaterial;

    const eye = BABYLON.MeshBuilder.CreateSphere(
      "goblin-eye-" + i,
      { diameter: 0.12 },
      scene
    );

    eye.parent = goblin;
    eye.position.set(0, 0.25, -0.36);
    eye.material = eyeMaterial;

    goblins.push({
      name: "Goblin",
      mesh: goblin,
      hp: 100,
      alive: true
    });
  }

  function getAttackDamage() {
    const baseDamage = 25;

    if (!equipmentSystem) return baseDamage;

    const bonuses = equipmentSystem.getBonuses();

    return baseDamage + Math.max(0, bonuses.attack || 0);
  }

  function giveLoot(enemyName) {
    if (!inventory) return;

    const lootTables = {
      Goblin: [
        { name: "Goblin Token", type: "Quest", chance: 0.8 },
        { name: "Wood", type: "Material", chance: 0.5 },
        { name: "Health Potion", type: "Consumable", chance: 0.2 }
      ],
      Skeleton: [
        { name: "Bone", type: "Material", chance: 0.8 },
        { name: "Old Coin", type: "Quest", chance: 0.3 }
      ],
      "Dire Wolf": [
        { name: "Wolf Pelt", type: "Material", chance: 0.8 },
        { name: "Wolf Fang", type: "Material", chance: 0.5 }
      ],
      Orc: [
        { name: "Orc Token", type: "Quest", chance: 0.7 },
        { name: "Iron Ore", type: "Material", chance: 0.5 },
        { name: "Health Potion", type: "Consumable", chance: 0.3 }
      ]
    };

    const loot = lootTables[enemyName] || [];

    for (const item of loot) {
      if (Math.random() < item.chance) {
        inventory.addItem(item.name, 1, item.type);
      }
    }
  }

  function defeatEnemy(enemy) {
    if (!enemy.alive) return;

    enemy.alive = false;

    if (enemy.mesh && !enemy.mesh.isDisposed()) {
      enemy.mesh.dispose();
    }

    if (playerStats) {
      playerStats.addXP(enemy.name === "Orc" ? 40 : 25);

      const reward = goldRewards[enemy.name] || 0;

      if (reward > 0 && playerStats.addGold) {
        playerStats.addGold(reward);
      }
    }

    if (questSystem) {
      questSystem.addProgress(enemy.name, 1);
    }

    giveLoot(enemy.name);
  }

  function getAllTargets() {
    const targets = [];

    for (const goblin of goblins) {
      if (
        goblin.alive &&
        goblin.mesh &&
        !goblin.mesh.isDisposed()
      ) {
        targets.push({
          enemy: goblin,
          mesh: goblin.mesh,
          name: "Goblin",
          source: "goblin"
        });
      }
    }

    if (enemyAI) {
      const otherEnemies = enemyAI.getEnemies();

      for (const enemy of otherEnemies) {
        if (
          enemy.alive &&
          enemy.mesh &&
          !enemy.mesh.isDisposed()
        ) {
          targets.push({
            enemy,
            mesh: enemy.mesh,
            name: enemy.name,
            source: "enemyAI"
          });
        }
      }
    }

    return targets;
  }

  function attack() {
    if (disposed || !player) return;

    const targets = getAllTargets();

    let nearestTarget = null;
    let nearestDistance = 3.5;

    for (const target of targets) {
      const distance = BABYLON.Vector3.Distance(
        player.position,
        target.mesh.position
      );

      if (distance <= nearestDistance) {
        nearestDistance = distance;
        nearestTarget = target;
      }
    }

    if (!nearestTarget) return;

    const enemy = nearestTarget.enemy;
    const damage = getAttackDamage();

    if (nearestTarget.source === "goblin") {
      enemy.hp -= damage;

      enemy.mesh.scaling.set(1.15, 0.9, 1.15);

      setTimeout(() => {
        if (
          !disposed &&
          enemy.alive &&
          enemy.mesh &&
          !enemy.mesh.isDisposed()
        ) {
          enemy.mesh.scaling.set(1, 1, 1);
        }
      }, 120);

      if (enemy.hp <= 0) {
        defeatEnemy(enemy);
      }
    } else {
      enemy.health -= damage;

      enemy.mesh.scaling.set(1.15, 0.9, 1.15);

      setTimeout(() => {
        if (
          !disposed &&
          enemy.alive &&
          enemy.mesh &&
          !enemy.mesh.isDisposed()
        ) {
          enemy.mesh.scaling.setAll(
            enemy.name === "Orc" ? 1.25 :
            enemy.name === "Dire Wolf" ? 0.8 : 0.9
          );
        }
      }, 120);

      if (enemy.health <= 0) {
        defeatEnemy(enemy);
      }
    }
  }

  attackButton.addEventListener("click", attack);

  return function disposeCombatSystem() {
    if (disposed) return;

    disposed = true;

    attackButton.removeEventListener("click", attack);

    for (const goblin of goblins) {
      if (goblin.mesh && !goblin.mesh.isDisposed()) {
        goblin.mesh.dispose();
      }
    }

    goblins.length = 0;
  };
          }
        
