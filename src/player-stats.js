export function createPlayerStats() {
  const stats = {
    level: 1,
    hp: 100,
    maxHp: 100,
    xp: 0,
    xpToNextLevel: 100
  };

  function addXP(amount) {
    if (amount <= 0) return;

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
    if (amount <= 0) return;

    stats.hp = Math.max(0, stats.hp - amount);
    updateUI();
  }

  function heal(amount) {
    if (amount <= 0) return;

    stats.hp = Math.min(
      stats.maxHp,
      stats.hp + amount
    );

    updateUI();
  }

  function updateUI() {
    const hpText = document.getElementById("hp-text");
    const hpBar = document.getElementById("hp-bar");
    const xpText = document.getElementById("xp-text");
    const xpBar = document.getElementById("xp-bar");
    const levelText = document.getElementById("level-text");

    if (hpText) {
      hpText.textContent =
        `HP ${stats.hp}/${stats.maxHp}`;
    }

    if (hpBar) {
      hpBar.style.width =
        `${(stats.hp / stats.maxHp) * 100}%`;
    }

    if (xpText) {
      xpText.textContent =
        `XP ${stats.xp}/${stats.xpToNextLevel}`;
    }

    if (xpBar) {
      xpBar.style.width =
        `${(stats.xp / stats.xpToNextLevel) * 100}%`;
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
    updateUI
  };
}
