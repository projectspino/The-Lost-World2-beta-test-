
export function createPlayerStats() {
  const stats = {
    level: 1,
    hp: 100,
    maxHp: 100,
    xp: 0,
    xpToNextLevel: 100
  };

  let isDead = false;

  function addXP(amount) {
    if (amount <= 0 || isDead) return;

    stats.xp += amount;

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

  function takeDamage(amount) {
    if (amount <= 0 || isDead) return false;

    stats.hp = Math.max(0, stats.hp - amount);

    if (stats.hp <= 0) {
      isDead = true;
    }

    updateUI();
    return isDead;
  }

  function heal(amount) {
    if (amount <= 0 || isDead) return;

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

  function updateUI() {
    const hpText = document.getElementById("hp-text");
    const hpBar = document.getElementById("hp-bar");
    const xpText = document.getElementById("xp-text");
    const xpBar = document.getElementById("xp-bar");
    const levelText = document.getElementById("level-text");

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
  }

  updateUI();

  return {
    stats,
    addXP,
    takeDamage,
    heal,
    revive,
    updateUI,
    isDead: () => isDead
  };
}
