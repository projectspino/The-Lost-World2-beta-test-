
export class WorldBossAbilitySystem {
  constructor(options = {}) {
    this.abilities = new Map();
    this.cooldowns = new Map();
    this.onCast = options.onCast ?? null;
    this.enabled = true;

    this.registerDefaults();
  }

  registerDefaults() {
    this.register("ground-smash", {
      cooldown: 12,
      damageMultiplier: 1.5,
      range: 8,
      type: "area"
    });

    this.register("energy-blast", {
      cooldown: 8,
      damageMultiplier: 1.2,
      range: 18,
      type: "ranged"
    });

    this.register("battle-roar", {
      cooldown: 20,
      damageMultiplier: 0,
      range: 12,
      type: "buff"
    });
  }

  register(id, config) {
    if (!id || !config) return false;

    this.abilities.set(id, {
      cooldown: Math.max(0, config.cooldown ?? 5),
      damageMultiplier: Math.max(
        0,
        config.damageMultiplier ?? 1
      ),
      range: Math.max(0, config.range ?? 5),
      type: config.type ?? "normal"
    });

    this.cooldowns.set(id, 0);
    return true;
  }

  update(deltaSeconds) {
    if (
      !this.enabled ||
      !Number.isFinite(deltaSeconds) ||
      deltaSeconds <= 0
    ) {
      return;
    }

    for (const [id, remaining] of this.cooldowns) {
      this.cooldowns.set(
        id,
        Math.max(0, remaining - deltaSeconds)
      );
    }
  }

  canCast(id) {
    return (
      this.enabled &&
      this.abilities.has(id) &&
      (this.cooldowns.get(id) ?? 0) <= 0
    );
  }

  cast(id, boss, target, baseDamage = 10) {
    const ability = this.abilities.get(id);

    if (!ability || !this.canCast(id)) return false;

    if (!boss?.position || !target?.position) {
      return false;
    }

    const dx = target.position.x - boss.position.x;
    const dz = target.position.z - boss.position.z;
    const distance = Math.hypot(dx, dz);

    if (distance > ability.range) return false;

    const result = {
      id,
      type: ability.type,
      boss,
      target,
      damage: baseDamage * ability.damageMultiplier,
      range: ability.range
    };

    this.cooldowns.set(id, ability.cooldown);

    if (typeof this.onCast === "function") {
      this.onCast(result);
    }

    return result;
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
  }

  getAbilities() {
    return Array.from(this.abilities.entries()).map(
      ([id, ability]) => ({
        id,
        ...ability,
        cooldownRemaining: this.cooldowns.get(id) ?? 0
      })
    );
  }

  resetCooldowns() {
    for (const id of this.abilities.keys()) {
      this.cooldowns.set(id, 0);
    }
  }

  dispose() {
    this.abilities.clear();
    this.cooldowns.clear();
    this.onCast = null;
    this.enabled = false;
  }
}
