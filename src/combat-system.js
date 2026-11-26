
import * as BABYLON from "@babylonjs/core";

export function createCombatSystem(
  scene,
  player,
  attackButton,
  playerStats,
  inventory,
  enemyAI = null,
  questSystem = null,
  equipmentSystem = null,
  lootSystem = null
) {
  const goblins = [];
  let disposed = false;

  const goldRewards = {
    Goblin: 5,
    Skeleton: 8,
    "Dire Wolf": 10,
    Orc: 15,
    "Ancient Golem": 250
  };

  const xpRewards = {
    Goblin: 25,
    Skeleton: 25,
    "Dire Wolf": 25,
    Orc: 40,
    "Ancient Golem": 300
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
      maxHp: 100,
      alive: true,
      rewarded: false
    });
  }

  const bossBar = document.createElement("div");

  bossBar.style.cssText = `
    position: fixed;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    width: min(82%, 420px);
    padding: 10px;
    background: rgba(15, 10, 10, 0.9);
    border: 2px solid #9b6b35;
    border-radius: 10px;
    color: white;
    font-family: Arial, sans-serif;
    text-align: center;
    z-index: 9999;
    display: none;
    pointer-events: none;
  `;

  const bossName = document.createElement("div");
  bossName.textContent = "ANCIENT GOLEM";
  bossName.style.cssText = `
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 7px;
    color: #f0c27b;
    letter-spacing: 2px;
  `;

  const bossTrack = document.createElement("div");
  bossTrack.style.cssText = `
    width: 100%;
    height: 15px;
    background: #333;
    border: 1px solid #777;
    border-radius: 8px;
    overflow: hidden;
  `;

  const bossFill = document.createElement("div");
  bossFill.style.cssText = `
    width: 100%;
    height: 100%;
    background: #b52b20;
    transition: width 0.15s;
  `;

  const bossHealthText = document.createElement("div");
  bossHealthText.style.cssText = `
    margin-top: 5px;
    font-size: 12px;
    color: #eee;
  `;

  bossTrack.appendChild(bossFill);
  bossBar.appendChild(bossName);
  bossBar.appendChild(bossTrack);
  bossBar.appendChild(bossHealthText);
  document.body.appendChild(bossBar);

  function updateBossBar() {
    if (disposed || !player || !enemyAI) {
      bossBar.style.display = "none";
      return;
    }

    const boss = enemyAI.getEnemies().find(
      enemy => enemy.name === "Ancient Golem"
    );

    if (
      !boss ||
      !boss.alive ||
      !boss.mesh ||
      boss.mesh.isDisposed()
    ) {
      bossBar.style.display = "none";
      return;
    }

    const distance = BABYLON.Vector3.Distance(
      player.position,
      boss.mesh.position
    );

    if (distance > 35) {
      bossBar.style.display = "none";
      return;
    }

    const percentage = Math.max(
      0,
      Math.min(100, (boss.health / boss.maxHealth) * 100)
    );

    bossBar.style.display = "block";
    bossFill.style.width = percentage + "%";
    bossHealthText.textContent =
      `${Math.ceil(boss.health)} / ${boss.maxHealth} HP`;
  }

  const bossBarObserver =
    scene.onBeforeRenderObservable.add(updateBossBar);

  function getAttackDamage() {
    const baseDamage = 25;

    if (!equipmentSystem) return baseDamage;

    const bonuses = equipmentSystem.getBonuses();

    return baseDamage + Math.max(0, bonuses.attack || 0);
  }

  function giveLegacyLoot(enemyName) {
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
      ],
      "Ancient Golem": [
        { name: "Ancient Core", type: "Quest", chance: 1 }
      ]
    };

    const loot = lootTables[enemyName] || [];

    for (const item of loot) {
      if (Math.random() < item.chance) {
        inventory.addItem(item.name, 1, item.type);
      }
    }
  }

  function giveEnemyReward(enemy) {
    if (enemy.rewarded) return;

    enemy.rewarded = true;

    if (lootSystem && typeof lootSystem.rewardMonster === "function") {
      const result = lootSystem.rewardMonster(enemy);

      if (result.success) return;
    }

    if (playerStats) {
      playerStats.addXP(xpRewards[enemy.name] || 25);

      const gold = goldRewards[enemy.name] || 0;

      if (gold > 0 && playerStats.addGold) {
        playerStats.addGold(gold);
      }
    }

    giveLegacyLoot(enemy.name);
  }

  function defeatEnemy(enemy) {
    if (!enemy || !enemy.alive) return;

    enemy.alive = false;

    giveEnemyReward(enemy);

    if (enemy.mesh && !enemy.mesh.isDisposed()) {
      enemy.mesh.dispose();
    }

    if (questSystem) {
      questSystem.addProgress(enemy.name, 1);
    }

    updateBossBar();
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
      for (const enemy of enemyAI.getEnemies()) {
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
            enemy.isBoss ? 1 :
            enemy.name === "Orc" ? 1.25 :
            enemy.name === "Dire Wolf" ? 0.8 : 0.9
          );
        }
      }, 120);

      if (enemy.health <= 0) {
        defeatEnemy(enemy);
      }
    }

    updateBossBar();
  }

  attackButton.addEventListener("click", attack);

  return function disposeCombatSystem() {
    if (disposed) return;

    disposed = true;

    attackButton.removeEventListener("click", attack);
    scene.onBeforeRenderObservable.remove(bossBarObserver);

    if (bossBar.parentNode) {
      bossBar.parentNode.removeChild(bossBar);
    }

    for (const goblin of goblins) {
      if (goblin.mesh && !goblin.mesh.isDisposed()) {
        goblin.mesh.dispose();
      }
    }

    goblins.length = 0;
  };
}
  
