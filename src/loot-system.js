
const MONSTER_LOOT = {
  Goblin: {
    xp: 25,
    gold: [5, 15],
    drops: [
      { name: "Goblin Token", type: "Material", chance: 0.5 },
      { name: "Health Potion", type: "Consumable", chance: 0.1 }
    ]
  },

  Skeleton: {
    xp: 40,
    gold: [10, 20],
    drops: [
      { name: "Bone", type: "Material", chance: 0.6 },
      { name: "Health Potion", type: "Consumable", chance: 0.15 }
    ]
  },

  Orc: {
    xp: 60,
    gold: [15, 30],
    drops: [
      { name: "Orc Fang", type: "Material", chance: 0.5 },
      { name: "Health Potion", type: "Consumable", chance: 0.2 }
    ]
  }
};

export function createLootSystem(playerStats, inventory) {
  if (
    !playerStats ||
    typeof playerStats.addXP !== "function" ||
    typeof playerStats.addGold !== "function" ||
    !inventory ||
    typeof inventory.addItem !== "function"
  ) {
    throw new Error(
      "PlayerStats atau Inventory tidak valid."
    );
  }

  const rewardedEnemies = new WeakSet();

  function getMonsterLoot(monsterName) {
    const data = MONSTER_LOOT[monsterName];

    if (!data) return null;

    return {
      xp: data.xp,
      gold: [...data.gold],
      drops: data.drops.map(drop => ({ ...drop }))
    };
  }

  function rewardMonster(monster) {
    if (
      !monster ||
      typeof monster !== "object"
    ) {
      return {
        success: false,
        message: "Data monster tidak valid."
      };
    }

    if (rewardedEnemies.has(monster)) {
      return {
        success: false,
        message: "Hadiah monster ini sudah diberikan."
      };
    }

    const monsterName = monster.name;

    if (
      !monsterName ||
      typeof monsterName !== "string"
    ) {
      return {
        success: false,
        message: "Nama monster tidak valid."
      };
    }

    const loot = getMonsterLoot(monsterName);

    if (!loot) {
      return {
        success: false,
        message: "Monster tidak memiliki data loot."
      };
    }

    rewardedEnemies.add(monster);

    const gold = Math.floor(
      Math.random() *
      (loot.gold[1] - loot.gold[0] + 1)
    ) + loot.gold[0];

    playerStats.addXP(loot.xp);
    playerStats.addGold(gold);

    const collectedItems = [];

    for (const drop of loot.drops) {
      if (Math.random() <= drop.chance) {
        const added = inventory.addItem(
          drop.name,
          1,
          drop.type
        );

        if (added) {
          collectedItems.push(drop.name);
        }
      }
    }

    return {
      success: true,
      monster: monsterName,
      xp: loot.xp,
      gold,
      items: collectedItems
    };
  }

  return {
    getMonsterLoot,
    rewardMonster
  };
}
