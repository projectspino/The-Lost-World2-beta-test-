
export class WorldBossPatterns {
  constructor(options = {}) {
    this.onAttack = options.onAttack ?? null;
    this.patterns = new Map();
    this.cooldowns = new Map();
    this.pendingHits = [];
    this.registerDefaults();
  }

  registerDefaults() {
    this.register("single-strike", {
      cooldown: 2, damageMultiplier: 1, range: 5, hits: 1, interval: 0
    });
    this.register("heavy-strike", {
      cooldown: 6, damageMultiplier: 2, range: 7, hits: 1, interval: 0
    });
    this.register("triple-strike", {
      cooldown: 8, damageMultiplier: 0.7, range: 5, hits: 3, interval: 0.5
    });
    this.register("area-burst", {
      cooldown: 10, damageMultiplier: 1.5, range: 9, hits: 1, interval: 0
    });
  }

  register(id, config = {}) {
    if (typeof id !== "string" || !id.trim()) return false;

    const values = [
      config.cooldown ?? 1,
      config.damageMultiplier ?? 1,
      config.range ?? 5,
      config.hits ?? 1,
      config.interval ?? 0
    ];

    if (!values.every(Number.isFinite) ||
        values[0] < 0 || values[1] < 0 ||
        values[2] < 0 || values[3] < 1 || values[4] < 0) {
      return false;
    }

    this.patterns.set(id, {
      cooldown: values[0],
      damageMultiplier: values[1],
      range: values[2],
      hits: Math.floor(values[3]),
      interval: values[4]
    });

    if (!this.cooldowns.has(id)) this.cooldowns.set(id, 0);
    return true;
  }

  update(deltaSeconds) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return;

    for (const [id, remaining] of this.cooldowns) {
      const next = Math.max(0, remaining - deltaSeconds);
      this.cooldowns.set(id, next);
    }

    for (const attack of this.pendingHits) {
      attack.timer -= deltaSeconds;
    }

    const remaining = [];

    for (const attack of this.pendingHits) {
      while (attack.timer <= 0 && attack.hitsLeft > 0) {
        if (attack.boss?.alive === false || attack.target?.alive === false) {
          break;
        }

        this.notifyAttack({
          patternId: attack.patternId,
          boss: attack.boss,
          target: attack.target,
          damage: attack.damage,
          hitNumber: attack.totalHits - attack.hitsLeft + 1,
          totalHits: attack.totalHits,
          isAreaAttack: attack.isAreaAttack
        });

        attack.hitsLeft--;
        attack.timer += attack.interval;

        if (attack.interval <= 0) break;
      }

      if (attack.hitsLeft > 0) remaining.push(attack);
    }

    this.pendingHits = remaining;
  }

  canUse(id) {
    return this.patterns.has(id) && (this.cooldowns.get(id) ?? 0) <= 0;
  }

  use(id, boss, target, baseDamage = 10) {
    const pattern = this.patterns.get(id);

    if (!pattern || !this.canUse(id)) return false;
    if (!boss?.position || !target?.position) return false;
    if (!Number.isFinite(baseDamage) || baseDamage < 0) return false;

    const dx = target.position.x - boss.position.x;
    const dz = target.position.z - boss.position.z;

    if (Math.hypot(dx, dz) > pattern.range) return false;

    this.cooldowns.set(id, pattern.cooldown);

    const attack = {
      patternId: id,
      boss,
      target,
      damage: baseDamage * pattern.damageMultiplier,
      hitsLeft: pattern.hits,
      totalHits: pattern.hits,
      interval: pattern.interval,
      timer: 0,
      isAreaAttack: id === "area-burst"
    };

    // Hit pertama langsung diproses.
    this.notifyAttack({
      patternId: id,
      boss,
      target,
      damage: attack.damage,
      hitNumber: 1,
      totalHits: attack.totalHits,
      isAreaAttack: attack.isAreaAttack
    });

    attack.hitsLeft--;

    if (attack.hitsLeft > 0) {
      attack.timer = pattern.interval;
      this.pendingHits.push(attack);
    }

    return {
      patternId: id,
      damage: attack.damage,
      hits: pattern.hits,
      interval: pattern.interval,
      isAreaAttack: attack.isAreaAttack
    };
  }

  notifyAttack(data) {
    if (typeof this.onAttack !== "function") return;
    try {
      this.onAttack(data);
    } catch (error) {
      console.error("Boss pattern callback error:", error);
    }
  }

  getPatterns() {
    return [...this.patterns.entries()].map(([id, config]) => ({
      id,
      ...config,
      cooldownRemaining: this.cooldowns.get(id) ?? 0
    }));
  }

  resetCooldowns() {
    for (const id of this.patterns.keys()) this.cooldowns.set(id, 0);
    this.pendingHits.length = 0;
  }

  dispose() {
    this.pendingHits.length = 0;
    this.patterns.clear();
    this.cooldowns.clear();
    this.onAttack = null;
  }
}
