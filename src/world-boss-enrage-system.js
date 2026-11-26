
export class WorldBossEnrageSystem {
  constructor(boss, options = {}) {
    this.boss = boss;
    this.threshold = options.threshold ?? 20;
    this.damageMultiplier = options.damageMultiplier ?? 1.5;
    this.speedMultiplier = options.speedMultiplier ?? 1.3;

    this.enraged = false;
    this.onEnrage = options.onEnrage ?? null;
    this.onCalm = options.onCalm ?? null;
  }

  update(currentHealth, maxHealth) {
    if (
      !Number.isFinite(currentHealth) ||
      !Number.isFinite(maxHealth) ||
      maxHealth <= 0
    ) {
      return this.enraged;
    }

    const healthPercent = Math.max(
      0,
      Math.min(100, (currentHealth / maxHealth) * 100)
    );

    if (healthPercent <= this.threshold && !this.enraged) {
      this.enraged = true;

      if (typeof this.onEnrage === "function") {
        this.onEnrage({
          boss: this.boss,
          healthPercent,
          damageMultiplier: this.damageMultiplier,
          speedMultiplier: this.speedMultiplier
        });
      }
    }

    return this.enraged;
  }

  getDamageMultiplier() {
    return this.enraged ? this.damageMultiplier : 1;
  }

  getSpeedMultiplier() {
    return this.enraged ? this.speedMultiplier : 1;
  }

  isEnraged() {
    return this.enraged;
  }

  reset() {
    const wasEnraged = this.enraged;
    this.enraged = false;

    if (wasEnraged && typeof this.onCalm === "function") {
      this.onCalm({ boss: this.boss });
    }
  }

  dispose() {
    this.boss = null;
    this.onEnrage = null;
    this.onCalm = null;
    this.enraged = false;
  }
}
