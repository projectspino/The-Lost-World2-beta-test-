
export class WorldBossPhaseController {
  constructor(boss, options = {}) {
    this.boss = boss;
    this.phases = [];
    this.currentPhase = -1;
    this.onPhaseChange = options.onPhaseChange ?? null;

    this.registerDefaultPhases();
  }

  registerDefaultPhases() {
    this.addPhase({
      id: "phase-1",
      healthThreshold: 100,
      damageMultiplier: 1,
      speedMultiplier: 1
    });

    this.addPhase({
      id: "phase-2",
      healthThreshold: 60,
      damageMultiplier: 1.3,
      speedMultiplier: 1.2
    });

    this.addPhase({
      id: "phase-3",
      healthThreshold: 30,
      damageMultiplier: 1.6,
      speedMultiplier: 1.4
    });
  }

  addPhase(config) {
    if (!config?.id) return false;

    this.phases.push({
      id: config.id,
      healthThreshold: Math.max(
        0,
        Math.min(100, config.healthThreshold ?? 100)
      ),
      damageMultiplier: Math.max(
        0,
        config.damageMultiplier ?? 1
      ),
      speedMultiplier: Math.max(
        0,
        config.speedMultiplier ?? 1
      )
    });

    this.phases.sort(
      (a, b) => b.healthThreshold - a.healthThreshold
    );

    return true;
  }

  update(currentHealth, maxHealth) {
    if (
      !Number.isFinite(currentHealth) ||
      !Number.isFinite(maxHealth) ||
      maxHealth <= 0
    ) {
      return null;
    }

    const healthPercent = Math.max(
      0,
      Math.min(100, (currentHealth / maxHealth) * 100)
    );

    const nextIndex = this.phases.findIndex(
      phase => healthPercent <= phase.healthThreshold
    );

    if (nextIndex < 0 || nextIndex === this.currentPhase) {
      return this.getCurrentPhase();
    }

    this.currentPhase = nextIndex;

    const phase = this.getCurrentPhase();

    if (typeof this.onPhaseChange === "function") {
      this.onPhaseChange({
        phase,
        healthPercent,
        boss: this.boss
      });
    }

    return phase;
  }

  getCurrentPhase() {
    if (this.currentPhase < 0) {
      return null;
    }

    return this.phases[this.currentPhase] ?? null;
  }

  getDamageMultiplier() {
    return this.getCurrentPhase()?.damageMultiplier ?? 1;
  }

  getSpeedMultiplier() {
    return this.getCurrentPhase()?.speedMultiplier ?? 1;
  }

  reset() {
    this.currentPhase = -1;
  }

  dispose() {
    this.boss = null;
    this.phases = [];
    this.currentPhase = -1;
    this.onPhaseChange = null;
  }
}
