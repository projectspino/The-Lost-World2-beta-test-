
export class WorldBossPatterns {
  constructor(options = {}) {
    this.onAttack = options.onAttack ?? null;
    this.patterns = new Map();
    this.cooldowns = new Map();

    this.registerDefaults();
  }

  registerDefaults() {
    this.register("single-strike", {
      cooldown: 2,
      damageMultiplier: 1,
      range: 5,
      hits: 1,
      interval: 0
    });

    this.register("heavy-strike", {
      cooldown: 6,
      damageMultiplier: 2,
      range: 7,
      hits: 1,
      interval: 0
    });

    this.register("triple-strike", {
      cooldown: 8,
      damageMultiplier: 0.7,
      range: 5,
      hits: 3,
      interval: 0.5
    });

    this.register("area-burst", {
      cooldown: 10,
      damageMultiplier: 1.5,
      range: 9,
      hits: 1,
      interval: 0
    });
  }

  register(id, config) {
    if (!id || !config) return false;

    this.patterns.set(id, {
      cooldown: Math.max(0, config.cooldown ?? 1),
      damageMultiplier: Math.max(
        0,
        config.damageMultiplier ?? 1
      ),
      range: Math.max(0, config.range ?? 5),
      hits: Math.max(
        1,
        Math.floor(config.hits ?? 1)
      ),
      interval: Math.max(0, config.interval ?? 0)
    });

    if (!this.cooldowns.has(id)) {
      this.cooldowns.set(id, 0);
    }

    return true;
  }

  update(deltaSeconds) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
      return;
    }

    for (const [id, remaining] of this.cooldowns) {
      this.cooldowns.set(
        id,
        Math.max(0, remaining - deltaSeconds)
      );
    }
  }

  canUse(id) {
    return (
      this.patterns.has(id) &&
      (this.cooldowns.get(id) ?? 0) <= 0
    );
  }

  use(id, boss, target, baseDamage = 10) {
    const pattern = this.patterns.get(id);

    if (!pattern || !this.canUse(id)) {
      return false;
    }

    if (!boss?.position || !target?.position) {
      return false;
    }

    const dx = target.position.x - boss.position.x;
    const dz = target.position.z - boss.position.z;
    const distance = Math.hypot(dx, dz);

    if (distance > pattern.range) {
      return false;
    }

    this.cooldowns.set(id, pattern.cooldown);

    const attack = {
      patternId: id,
      boss,
      target,
      damage: Math.max(
        0,
        baseDamage * pattern.damageMultiplier
      ),
      hits: pattern.hits,
      interval: pattern.interval,
      isAreaAttack: id === "area-burst"
    };

    if (typeof this.onAttack === "function") {
      this.onAttack(attack);
    }

    return attack;
  }

  getPatterns() {
    return Array.from(this.patterns.entries()).map(
      ([id, config]) => ({
        id,
        ...config,
        cooldownRemaining: this.cooldowns.get(id) ?? 0
      })
    );
  }

  resetCooldowns() {
    for (const id of this.patterns.keys()) {
      this.cooldowns.set(id, 0);
    }
  }

  dispose() {
    this.patterns.clear();
    this.cooldowns.clear();
    this.onAttack = null;
  }
}
