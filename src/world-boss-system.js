
export class WorldBossSystem {
  constructor(options = {}) {
    this.onSpawn = options.onSpawn ?? null;
    this.onPhaseChange = options.onPhaseChange ?? null;
    this.onDefeated = options.onDefeated ?? null;

    this.bosses = new Map();
    this.activeBoss = null;
    this.cooldowns = new Map();
  }

  notify(callback, data) {
    if (typeof callback !== "function") return;

    try {
      callback(data);
    } catch (error) {
      console.error("World Boss callback error:", error);
    }
  }

  registerBoss(id, data = {}) {
    if (
      typeof id !== "string" ||
      !id.trim() ||
      this.bosses.has(id)
    ) {
      return false;
    }

    const phases = Array.isArray(data.phases)
      ? data.phases
          .filter(item =>
            item &&
            Number.isFinite(item.healthPercent)
          )
          .map(item => ({
            healthPercent: Math.max(
              0,
              Math.min(100, item.healthPercent)
            ),
            name: String(item.name ?? "Phase")
          }))
          .sort((a, b) => b.healthPercent - a.healthPercent)
      : [
          { healthPercent: 70, name: "Enraged" },
          { healthPercent: 30, name: "Final Phase" }
        ];

    this.bosses.set(id, {
      id,
      name: data.name ?? id,
      maxHealth: Math.max(1, Number(data.health) || 1000),
      damage: Math.max(0, Number(data.damage) || 30),
      defense: Math.max(0, Number(data.defense) || 5),
      cooldown: Math.max(0, Number(data.cooldown) || 900),
      rewards: Array.isArray(data.rewards)
        ? data.rewards.map(item => ({ ...item }))
        : [],
      phases
    });

    return true;
  }

  spawn(id) {
    if (this.activeBoss) return false;

    const boss = this.bosses.get(id);

    if (!boss || this.getCooldown(id) > 0) {
      return false;
    }

    this.activeBoss = {
      ...boss,
      rewards: boss.rewards.map(item => ({ ...item })),
      phases: boss.phases.map(item => ({ ...item })),
      health: boss.maxHealth,
      phase: 0,
      alive: true,
      spawnedAt: Date.now()
    };

    this.notify(this.onSpawn, this.getActiveBoss());
    return true;
  }

  damageBoss(amount) {
    if (!this.activeBoss?.alive) return false;

    const damage = Number(amount);

    if (!Number.isFinite(damage) || damage <= 0) {
      return false;
    }

    this.activeBoss.health = Math.max(
      0,
      this.activeBoss.health - damage
    );

    this.updatePhase();

    if (this.activeBoss.health <= 0) {
      this.defeatBoss();
    }

    return true;
  }

  updatePhase() {
    const boss = this.activeBoss;
    if (!boss) return;

    const percentage = boss.health / boss.maxHealth * 100;

    const nextPhase = boss.phases.reduce(
      (phase, entry, index) =>
        percentage <= entry.healthPercent
          ? index + 1
          : phase,
      0
    );

    if (nextPhase !== boss.phase) {
      boss.phase = nextPhase;

      this.notify(this.onPhaseChange, {
        bossId: boss.id,
        phase: nextPhase,
        phaseName: boss.phases[nextPhase - 1]?.name ?? null,
        healthPercent: percentage
      });
    }
  }

  defeatBoss() {
    if (!this.activeBoss) return false;

    const defeated = this.activeBoss;

    defeated.alive = false;
    defeated.health = 0;

    this.cooldowns.set(defeated.id, defeated.cooldown);
    this.activeBoss = null;

    this.notify(this.onDefeated, {
      id: defeated.id,
      name: defeated.name,
      rewards: defeated.rewards.map(item => ({ ...item }))
    });

    return true;
  }

  update(deltaSeconds) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
      return;
    }

    for (const [id, remaining] of this.cooldowns) {
      const next = Math.max(0, remaining - deltaSeconds);

      if (next <= 0) {
        this.cooldowns.delete(id);
      } else {
        this.cooldowns.set(id, next);
      }
    }
  }

  getActiveBoss() {
    if (!this.activeBoss) return null;

    return {
      ...this.activeBoss,
      rewards: this.activeBoss.rewards.map(item => ({ ...item })),
      phases: this.activeBoss.phases.map(item => ({ ...item }))
    };
  }

  getBosses() {
    return [...this.bosses.values()].map(boss => ({
      id: boss.id,
      name: boss.name,
      maxHealth: boss.maxHealth,
      available:
        !this.activeBoss &&
        this.getCooldown(boss.id) <= 0
    }));
  }

  getCooldown(id) {
    return Math.max(0, this.cooldowns.get(id) ?? 0);
  }

  reset() {
    this.activeBoss = null;
    this.cooldowns.clear();
  }

  dispose() {
    this.reset();
    this.bosses.clear();
    this.onSpawn = null;
    this.onPhaseChange = null;
    this.onDefeated = null;
  }
}
