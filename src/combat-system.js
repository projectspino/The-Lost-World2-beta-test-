
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
  if (!scene || !player || !attackButton) {
    throw new Error("Scene, player, dan attackButton wajib tersedia.");
  }

  const goblins = [];
  let disposed = false;

  const goblinMaterial = new BABYLON.StandardMaterial(
    "goblin-material",
    scene
  );
  goblinMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.55, 0.18);

  const eyeMaterial = new BABYLON.StandardMaterial(
    "goblin-eye-material",
    scene
  );
  eyeMaterial.diffuseColor = new BABYLON.Color3(1, 0.8, 0.1);

  for (let i = 0; i < 5; i++) {
    const mesh = BABYLON.MeshBuilder.CreateCapsule(
      `goblin-${i}`,
      { height: 1.7, radius: 0.4 },
      scene
    );

    mesh.position.set(
      8 + (i % 3) * 4,
      0.85,
      8 + Math.floor(i / 3) * 5
    );

    mesh.material = goblinMaterial;

    const eye = BABYLON.MeshBuilder.CreateSphere(
      `goblin-eye-${i}`,
      { diameter: 0.12 },
      scene
    );

    eye.parent = mesh;
    eye.position.set(0, 0.25, -0.36);
    eye.material = eyeMaterial;

    goblins.push({
      id: `goblin-${i}`,
      name: "Goblin",
      mesh,
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

  function isMeshValid(mesh) {
    return Boolean(mesh && !mesh.isDisposed());
  }

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
      !isMeshValid(boss.mesh)
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
    bossFill.style.width = `${percentage}%`;
    bossHealthText.textContent =
      `${Math.ceil(boss.health)} / ${boss.maxHealth} HP`;
  }

  const bossBarObserver =
    scene.onBeforeRenderObservable.add(updateBossBar);

  function getAttackDamage() {
    const baseDamage = 25;

    if (
      !equipmentSystem ||
      typeof equipmentSystem.getBonuses !== "function"
    ) {
      return baseDamage;
    }

    const bonuses = equipmentSystem.getBonuses() ?? {};
    const bonus = Number(bonuses.attack) || 0;

    return Math.max(1, baseDamage + bonus);
  }

  function giveFallbackReward(enemy) {
    if (!playerStats) return;

    const rewards = {
      Goblin: { xp: 25, gold: 5 },
      Skeleton: { xp: 40, gold: 10 },
      "Dire Wolf": { xp: 50, gold: 15 },
      Orc: { xp: 60, gold: 20 },
      "Ancient Golem": { xp: 300, gold: 250 }
    };

    const reward = rewards[enemy.name] ?? {
      xp: 10,
      gold: 0
    };

    if (typeof playerStats.addXP === "function") {
      playerStats.addXP(reward.xp);
    }

    if (
      reward.gold > 0 &&
      typeof playerStats.addGold === "function"
    ) {
      playerStats.addGold(reward.gold);
    }
  }

  function giveEnemyReward(enemy) {
    if (!enemy || enemy.rewarded) return;

    enemy.rewarded = true;

    if (
      lootSystem &&
      typeof lootSystem.rewardMonster === "function"
    ) {
      try {
        const result = lootSystem.rewardMonster(enemy);

        if (!result?.success) {
          console.warn(
            "Hadiah monster tidak berhasil diproses:",
            result?.message ?? "Tidak diketahui"
          );
        }
      } catch (error) {
        console.error("Monster reward error:", error);
      }

      return;
    }

    giveFallbackReward(enemy);
  }

  function defeatEnemy(enemy) {
    if (!enemy || !enemy.alive) return;

    enemy.alive = false;

    giveEnemyReward(enemy);

    if (isMeshValid(enemy.mesh)) {
      enemy.mesh.dispose();
    }

    if (
      questSystem &&
      typeof questSystem.addProgress === "function"
    ) {
      try {
        questSystem.addProgress(enemy.name, 1);
      } catch (error) {
        console.error("Quest progress error:", error);
      }
    }

    updateBossBar();
  }

  function getAllTargets() {
    const targets = [];

    for (const goblin of goblins) {
      if (goblin.alive && isMeshValid(goblin.mesh)) {
        targets.push({
          enemy: goblin,
          mesh: goblin.mesh,
          source: "goblin"
        });
      }
    }

    if (
      enemyAI &&
      typeof enemyAI.getEnemies === "function"
    ) {
      for (const enemy of enemyAI.getEnemies()) {
        if (enemy.alive && isMeshValid(enemy.mesh)) {
          targets.push({
            enemy,
            mesh: enemy.mesh,
            source: "enemyAI"
          });
        }
      }
    }

    return targets;
  }

  function attack() {
    if (disposed || !player || player.isDisposed?.()) {
      return;
    }

    let nearestTarget = null;
    let nearestDistance = 3.5;

    for (const target of getAllTargets()) {
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
      enemy.hp = Math.max(0, enemy.hp - damage);

      enemy.mesh.scaling.set(1.15, 0.9, 1.15);

      if (enemy.hp <= 0) {
        defeatEnemy(enemy);
      } else {
        enemy.mesh.scaling.set(1, 1, 1);
      }
    } else {
      if (
        !enemyAI ||
        typeof enemyAI.damageEnemy !== "function"
      ) {
        console.warn("Enemy AI tidak menyediakan damageEnemy().");
        return;
      }

      enemyAI.damageEnemy(enemy, damage);

      if (!enemy.alive || enemy.health <= 0) {
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

    scene.onBeforeRenderObservable.remove(
      bossBarObserver
    );

    bossBar.remove();

    for (const goblin of goblins) {
      if (isMeshValid(goblin.mesh)) {
        goblin.mesh.dispose();
      }
    }

    goblins.length = 0;

    goblinMaterial.dispose();
    eyeMaterial.dispose();
  };
                                       }
    
