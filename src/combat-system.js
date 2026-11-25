import * as BABYLON from "@babylonjs/core";

export function createCombatSystem(
  scene,
  player,
  attackButton,
  playerStats
) {
  const enemies = [];
  let disposed = false;

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

  // Membuat lima Goblin
  for (let i = 0; i < 5; i++) {
    const goblin = BABYLON.MeshBuilder.CreateCapsule(
      "goblin-" + i,
      {
        height: 1.7,
        radius: 0.4
      },
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
      {
        diameter: 0.12
      },
      scene
    );

    eye.parent = goblin;
    eye.position.set(0, 0.25, -0.36);
    eye.material = eyeMaterial;

    enemies.push({
      mesh: goblin,
      hp: 100,
      alive: true
    });
  }

  function attack() {
    if (disposed) return;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      const distance = BABYLON.Vector3.Distance(
        player.position,
        enemy.mesh.position
      );

      if (distance <= 3.5) {
        enemy.hp -= 25;

        enemy.mesh.scaling.set(
          1.15,
          0.9,
          1.15
        );

        setTimeout(() => {
          if (!disposed && enemy.alive) {
            enemy.mesh.scaling.set(1, 1, 1);
          }
        }, 120);

        // Goblin dikalahkan
        if (enemy.hp <= 0) {
          enemy.alive = false;
          enemy.mesh.dispose();

          // Memberikan 25 XP
          if (playerStats) {
            playerStats.addXP(25);
          }
        }

        break;
      }
    }
  }

  attackButton.addEventListener("click", attack);

  return function disposeCombatSystem() {
    disposed = true;

    attackButton.removeEventListener(
      "click",
      attack
    );

    for (const enemy of enemies) {
      if (
        enemy.mesh &&
        !enemy.mesh.isDisposed()
      ) {
        enemy.mesh.dispose();
      }
    }

    enemies.length = 0;
  };
}
