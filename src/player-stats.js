
const STORAGE_KEY = "lost_world_player_stats_v2";

export function createPlayerStats() {
  const stats = {
    level: 1,
    hp: 100,
    maxHp: 100,
    xp: 0,
    xpToNextLevel: 100,
    gold: 100,
    attack: 10,
    defense: 5
  };

  let dead = false;

  function updateUI() {
    document.dispatchEvent(
      new CustomEvent("player-stats-updated", {
        detail: { ...stats, isDead: dead }
      })
    );
  }

  function addXP(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0 || dead) {
      return false;
    }

    stats.xp += Math.floor(value);

    while (stats.xp >= stats.xpToNextLevel) {
      stats.xp -= stats.xpToNextLevel;
      stats.level += 1;

      stats.xpToNextLevel = Math.floor(
        stats.xpToNextLevel * 1.25
      );

      stats.maxHp += 20;
      stats.attack += 3;
      stats.defense += 2;
      stats.hp = stats.maxHp;
    }

    updateUI();
    return true;
  }

  function addGold(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      return false;
    }

    stats.gold += Math.floor(value);
    updateUI();
    return true;
  }

  function spendGold(amount) {
    const value = Number(amount);

    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      stats.gold < value
    ) {
      return false;
    }

    stats.gold -= Math.floor(value);
    updateUI();
    return true;
  }

  function takeDamage(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0 || dead) {
      return false;
    }

    const actualDamage = Math.max(
      1,
      Math.floor(value - stats.defense)
    );

    stats.hp = Math.max(0, stats.hp - actualDamage);

    if (stats.hp <= 0) {
      dead = true;
    }

    updateUI();
    return actualDamage;
  }

  function heal(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0 || dead) {
      return false;
    }

    const previousHP = stats.hp;

    stats.hp = Math.min(
      stats.maxHp,
      stats.hp + Math.floor(value)
    );

    updateUI();
    return stats.hp - previousHP;
  }

  function revive(health = 50) {
    const value = Number(health);

    if (!Number.isFinite(value) || value <= 0) {
      return false;
    }

    dead = false;
    stats.hp = Math.min(stats.maxHp, Math.floor(value));

    updateUI();
    return true;
  }

  function getStats() {
    return {
      ...stats,
      isDead: dead
    };
  }

  function saveGame() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 2,
          stats,
          dead
        })
      );

      return true;
    } catch (error) {
      console.error("Gagal menyimpan player stats:", error);
      return false;
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const saved = JSON.parse(raw);

      if (
        !saved ||
        saved.version !== 2 ||
        !saved.stats
      ) {
        return false;
      }

      const fields = [
        "level",
        "hp",
        "maxHp",
        "xp",
        "xpToNextLevel",
        "gold",
        "attack",
        "defense"
      ];

      for (const field of fields) {
        const value = Number(saved.stats[field]);

        if (!Number.isFinite(value) || value < 0) {
          return false;
        }
      }

      if (
        saved.stats.level < 1 ||
        saved.stats.maxHp < 1 ||
        saved.stats.hp > saved.stats.maxHp ||
        saved.stats.xp >= saved.stats.xpToNextLevel ||
        saved.stats.xpToNextLevel < 1
      ) {
        return false;
      }

      for (const field of fields) {
        stats[field] = Number(saved.stats[field]);
      }

      dead = Boolean(saved.dead);
      updateUI();

      return true;
    } catch (error) {
      console.error("Gagal memuat player stats:", error);
      return false;
    }
  }

  function deleteSave() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Gagal menghapus player stats:", error);
      return false;
    }
  }

  function isDead() {
    return dead;
  }

  updateUI();

  return {
    addXP,
    addGold,
    spendGold,
    takeDamage,
    heal,
    revive,
    getStats,
    saveGame,
    loadGame,
    deleteSave,
    updateUI,
    isDead
  };
}
