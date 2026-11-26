
const STATUS_EFFECTS = {
  poison: {
    name: "Poison",
    duration: 5,
    interval: 1,
    damage: 3,
    speedMultiplier: 1,
    stunned: false
  },
  burn: {
    name: "Burn",
    duration: 4,
    interval: 1,
    damage: 5,
    speedMultiplier: 1,
    stunned: false
  },
  slow: {
    name: "Slow",
    duration: 4,
    interval: 0,
    damage: 0,
    speedMultiplier: 0.5,
    stunned: false
  },
  stun: {
    name: "Stun",
    duration: 2,
    interval: 0,
    damage: 0,
    speedMultiplier: 0,
    stunned: true
  }
};

export class StatusEffectSystem {
  constructor(onDamage = null, onChange = null) {
    this.effects = new Map();
    this.onDamage = onDamage;
    this.onChange = onChange;
  }

  apply(targetId, effectName, options = {}) {
    if (
      targetId === undefined ||
      targetId === null ||
      !STATUS_EFFECTS[effectName]
    ) {
      return false;
    }

    const config = STATUS_EFFECTS[effectName];
    const duration = Number(options.duration ?? config.duration);
    const damage = Number(options.damage ?? config.damage);
    const interval = Number(options.interval ?? config.interval);

    if (
      !Number.isFinite(duration) ||
      duration <= 0 ||
      !Number.isFinite(damage) ||
      damage < 0 ||
      !Number.isFinite(interval) ||
      interval < 0
    ) {
      return false;
    }

    if (!this.effects.has(targetId)) {
      this.effects.set(targetId, new Map());
    }

    const targetEffects = this.effects.get(targetId);
    const existing = targetEffects.get(effectName);

    targetEffects.set(effectName, {
      name: effectName,
      duration: Math.max(
        existing?.duration ?? 0,
        duration
      ),
      remaining: Math.max(
        existing?.remaining ?? 0,
        duration
      ),
      damage,
      interval,
      timer: existing?.timer ?? interval,
      speedMultiplier: config.speedMultiplier,
      stunned: config.stunned
    });

    this.notify(targetId);
    return true;
  }

  update(deltaSeconds) {
    const delta = Number(deltaSeconds);

    if (!Number.isFinite(delta) || delta <= 0) {
      return;
    }

    for (const [targetId, targetEffects] of this.effects) {
      for (const [effectName, effect] of targetEffects) {
        effect.remaining -= delta;

        if (effect.interval > 0 && effect.damage > 0) {
          effect.timer -= delta;

          while (effect.timer <= 0 && effect.remaining > 0) {
            if (typeof this.onDamage === "function") {
              this.onDamage(
                targetId,
                effect.damage,
                effectName
              );
            }

            effect.timer += effect.interval;
          }
        }

        if (effect.remaining <= 0) {
          targetEffects.delete(effectName);
          this.notify(targetId);
        }
      }

      if (targetEffects.size === 0) {
        this.effects.delete(targetId);
      }
    }
  }

  remove(targetId, effectName) {
    const targetEffects = this.effects.get(targetId);

    if (!targetEffects || !targetEffects.has(effectName)) {
      return false;
    }

    targetEffects.delete(effectName);

    if (targetEffects.size === 0) {
      this.effects.delete(targetId);
    }

    this.notify(targetId);
    return true;
  }

  clear(targetId) {
    if (!this.effects.has(targetId)) {
      return false;
    }

    this.effects.delete(targetId);
    this.notify(targetId);
    return true;
  }

  clearAll() {
    const targets = [...this.effects.keys()];
    this.effects.clear();

    for (const targetId of targets) {
      this.notify(targetId);
    }
  }

  has(targetId, effectName) {
    return this.effects.get(targetId)?.has(effectName) ?? false;
  }

  getEffects(targetId) {
    const targetEffects = this.effects.get(targetId);

    if (!targetEffects) return [];

    return [...targetEffects.values()].map(effect => ({
      name: effect.name,
      remaining: Math.max(0, effect.remaining),
      duration: effect.duration,
      damage: effect.damage
    }));
  }

  getSpeedMultiplier(targetId) {
    const targetEffects = this.effects.get(targetId);

    if (!targetEffects) return 1;

    let multiplier = 1;

    for (const effect of targetEffects.values()) {
      multiplier = Math.min(
        multiplier,
        effect.speedMultiplier
      );
    }

    return multiplier;
  }

  isStunned(targetId) {
    const targetEffects = this.effects.get(targetId);

    if (!targetEffects) return false;

    for (const effect of targetEffects.values()) {
      if (effect.stunned) return true;
    }

    return false;
  }

  notify(targetId) {
    if (typeof this.onChange === "function") {
      this.onChange(targetId, this.getEffects(targetId));
    }
  }
}
