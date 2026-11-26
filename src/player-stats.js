
const SAVE_KEY = "the-lost-world-player-stats";

export function createPlayerStats() {
  const stats = {
    level: 1,
    hp: 100,
    maxHp: 100,
    xp: 0,
    xpToNextLevel: 100,
    gold: 100
  };

  let isDead = false;

  function addXP(amount) {
    if (!Number.isFinite(amount) || amount <= 0 || isDead) return;

    stats.xp += Math.floor(amount);

    while (stats.xp >= stats.xpToNextLevel) {
      stats.xp -= stats.xpToNextLevel;
      stats.level += 1;
      stats.maxHp += 20;
      stats.hp = stats.maxHp;

      stats.xpToNextLevel =
        Math.floor(stats.xpToNextLevel * 1.5);
    }

    updateUI();
  }

  function addGold(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
      return false;
    }

    stats.gold += Math.floor(amount);
    updateUI();
    return true;
  }

  function spendGold(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
      return false;
    }

    amount = Math.floor(amount);

    if (stats.gold < amount) {
      return false;
    }

    stats.gold -= amount;
    updateUI();
    return true;
  }

  function takeDamage(amount) {
    if (!Number.isFinite(amount) || amount <= 0 || isDead) {
      return false;
    }

    stats.hp = Math.max(0, stats.hp - amount);

    if (stats.hp <= 0) {
      isDead = true;
    }

    updateUI();
    return isDead;
  }

  function heal(amount) {
    if (!Number.isFinite(amount) || amount <= 0 || isDead) return;

    stats.hp = Math.min(
      stats.maxHp,
      stats.hp + amount
    );

    updateUI();
  }

  function revive() {
    stats.hp = stats.maxHp;
    isDead = false;
    updateUI();
  }

  function saveGame() {
    try {
      const saveData = {
        version: 1,
        stats: { ...stats },
        isDead
      };

      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(saveData)
      );

      return true;
    } catch (error) {
      console.error("Gagal menyimpan game:", error);
      return false;
    }
  }

  function loadGame() {
    try {
      const savedText = localStorage.getItem(SAVE_KEY);

      if (!savedText) return false;

      const savedData = JSON.parse(savedText);

      if (
        !savedData ||
        savedData.version !== 1 ||
        !savedData.stats
      ) {
        return false;
      }

      const loaded = savedData.stats;

      const requiredValues = [
        "level",
        "hp",
        "maxHp",
        "xp",
        "xpToNextLevel",
        "gold"
      ];

      for (const key of requiredValues) {
        if (
          !Number.isFinite(loaded[key]) ||
          loaded[key] < 0
        ) {
          return false;
        }
      }

      if (
        loaded.level < 1 ||
        loaded.maxHp < 1 ||
        loaded.xpToNextLevel < 1 ||
        loaded.hp > loaded.maxHp ||
        loaded.xp >= loaded.xpToNextLevel
      ) {
        return false;
      }

      for (const key of requiredValues) {
        stats[key] = loaded[key];
      }

      isDead = savedData.isDead === true;

      if (isDead) {
        stats.hp = 0;
      }

      updateUI();
      return true;
    } catch (error) {
      console.error("Gagal memuat game:", error);
      return false;
    }
  }

  function deleteSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
      return true;
    } catch (error) {
      console.error("Gagal menghapus save:", error);
      return false;
    }
  }

  function updateUI() {
    const hpText = document.getElementById("hp-text");
    const hpBar = document.getElementById("hp-bar");
    const xpText = document.getElementById("xp-text");
    const xpBar = document.getElementById("xp-bar");
    const levelText = document.getElementById("level-text");
    const goldText = document.getElementById("gold-text");

    if (hpText) {
      hpText.textContent = isDead
        ? "HP 0 — KALAH"
        : `HP ${stats.hp}/${stats.maxHp}`;
    }

    if (hpBar) {
      const hpPercent =
        (stats.hp / stats.maxHp) * 100;

      hpBar.style.width = `${hpPercent}%`;
    }

    if (xpText) {
      xpText.textContent =
        `XP ${stats.xp}/${stats.xpToNextLevel}`;
    }

    if (xpBar) {
      const xpPercent =
        (stats.xp / stats.xpToNextLevel) * 100;

      xpBar.style.width = `${xpPercent}%`;
    }

    if (levelText) {
      levelText.textContent =
        `Level ${stats.level}`;
    }

    if (goldText) {
      goldText.textContent =
        `Gold: ${stats.gold}`;
    }
  }

  updateUI();

  return {
    stats,
    addXP,
    addGold,
    spendGold,
    takeDamage,
    heal,
    revive,
    updateUI,
    saveGame,
    loadGame,
    deleteSave,
    isDead: () => isDead
  };
}
