
const MONSTER_LOOT = {
  Goblin: {
    xp: 25,
    gold: [5, 15],
    drops: [
      { name: "Goblin Token", type: "Material", chance: 0.5 },
      { name: "Wood", type: "Material", chance: 0.5 },
      { name: "Health Potion", type: "Consumable", chance: 0.1 }
    ]
  },

  Skeleton: {
    xp: 40,
    gold: [10, 20],
    drops: [
      { name: "Bone", type: "Material", chance: 0.6 },
      { name: "Old Coin", type: "Quest", chance: 0.3 },
      { name: "Health Potion", type: "Consumable", chance: 0.15 }
    ]
  },

  "Dire Wolf": {
    xp: 50,
    gold: [10, 25],
    drops: [
      { name: "Wolf Pelt", type: "Material", chance: 0.8 },
      { name: "Wolf Fang", type: "Material", chance: 0.5 }
    ]
  },

  Orc: {
    xp: 60,
    gold: [15, 30],
    drops: [
      { name: "Orc Fang", type: "Material", chance: 0.5 },
      { name: "Orc Token", type: "Quest", chance: 0.7 },
      { name: "Iron Ore", type: "Material", chance: 0.5 },
      { name: "Health Potion", type: "Consumable", chance: 0.2 }
    ]
  },

  "Ancient Golem": {
    xp: 300,
    gold: [200, 300],
    drops: [
      { name: "Ancient Core", type: "Quest", chance: 1 }
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
    throw new Error("PlayerStats atau Inventory tidak valid.");
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
    if (!monster || typeof monster !== "object") {
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
      typeof monsterName !== "string" ||
      !monsterName.trim()
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

    const gold =
      Math.floor(
        Math.random() * (loot.gold[1] - loot.gold[0] + 1)
      ) + loot.gold[0];

    const collectedItems = [];
    const failedItems = [];

    try {
      playerStats.addXP(loot.xp);

      if (playerStats.addGold(gold) !== true) {
        return {
          success: false,
          message: "Gold gagal ditambahkan."
        };
      }

      for (const drop of loot.drops) {
        if (Math.random() <= drop.chance) {
          const added = inventory.addItem(
            drop.name,
            1,
            drop.type
          );

          if (added) {
            collectedItems.push(drop.name);
          } else {
            failedItems.push(drop.name);
          }
        }
      }

      rewardedEnemies.add(monster);

      return {
        success: true,
        monster: monsterName,
        xp: loot.xp,
        gold,
        items: collectedItems,
        failedItems,
        message: failedItems.length > 0
          ? "XP dan Gold diterima, tetapi sebagian item tidak masuk karena inventaris penuh."
          : "Hadiah monster berhasil diterima."
      };
    } catch (error) {
      return {
        success: false,
        message: "Terjadi kesalahan saat memberikan hadiah monster.",
        error
      };
    }
  }

  return {
    getMonsterLoot,
    rewardMonster
  };
}
