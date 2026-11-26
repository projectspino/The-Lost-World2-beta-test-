
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

  const processed = new WeakSet();

  function getMonsterLoot(name) {
    const data = MONSTER_LOOT[name];

    if (!data) return null;

    return {
      xp: data.xp,
      gold: [...data.gold],
      drops: data.drops.map(item => ({ ...item }))
    };
  }

  function rewardMonster(monster) {
    if (!monster || typeof monster !== "object") {
      return {
        success: false,
        message: "Data monster tidak valid."
      };
    }

    if (processed.has(monster)) {
      return {
        success: false,
        message: "Hadiah monster sudah diproses."
      };
    }

    const loot = getMonsterLoot(monster.name);

    if (!loot) {
      return {
        success: false,
        message: "Data loot monster tidak ditemukan."
      };
    }

    // Tandai sebelum memberikan hadiah agar tidak terjadi pembayaran ganda.
    processed.add(monster);

    const gold =
      Math.floor(
        Math.random() * (loot.gold[1] - loot.gold[0] + 1)
      ) + loot.gold[0];

    const result = {
      success: false,
      monster: monster.name,
      xp: 0,
      gold: 0,
      items: [],
      failedItems: [],
      message: ""
    };

    try {
      playerStats.addXP(loot.xp);
      result.xp = loot.xp;

      const goldAdded = playerStats.addGold(gold);

      if (goldAdded === false) {
        result.message = "XP diberikan, tetapi Gold gagal ditambahkan.";
        return result;
      }

      result.gold = gold;

      for (const drop of loot.drops) {
        if (Math.random() >= drop.chance) continue;

        try {
          const added = inventory.addItem(
            drop.name,
            1,
            drop.type
          );

          if (added === false) {
            result.failedItems.push(drop.name);
          } else {
            result.items.push(drop.name);
          }
        } catch (error) {
          console.error("Gagal menambahkan item loot:", error);
          result.failedItems.push(drop.name);
        }
      }

      result.success = true;

      result.message = result.failedItems.length > 0
        ? "XP dan Gold diberikan. Sebagian item tidak masuk inventaris."
        : "Hadiah monster berhasil diterima.";
    } catch (error) {
      result.message = "Terjadi kesalahan saat memproses hadiah.";
      result.error = error;

      console.error("Monster reward error:", error);
    }

    return result;
  }

  return {
    getMonsterLoot,
    rewardMonster
  };
       }
