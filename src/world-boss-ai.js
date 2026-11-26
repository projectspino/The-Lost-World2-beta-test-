
export class WorldBossAI {
  constructor(boss, options = {}) {
    this.boss = boss;
    this.detectionRange = options.detectionRange ?? 25;
    this.attackRange = options.attackRange ?? 5;
    this.moveSpeed = options.moveSpeed ?? 3;
    this.attackCooldown = options.attackCooldown ?? 2.5;

    this.state = "idle";
    this.attackTimer = 0;
    this.target = null;
    this.enabled = true;

    this.onAttack = options.onAttack ?? null;
    this.onStateChange = options.onStateChange ?? null;
  }

  setTarget(target) {
    this.target = target;
  }

  setState(state) {
    if (this.state === state) return;

    this.state = state;

    if (typeof this.onStateChange === "function") {
      this.onStateChange(state);
    }
  }

  distanceToTarget() {
    if (!this.boss?.position || !this.target?.position) {
      return Infinity;
    }

    const a = this.boss.position;
    const b = this.target.position;

    return Math.hypot(
      b.x - a.x,
      b.z - a.z
    );
  }

  update(deltaSeconds) {
    if (
      !this.enabled ||
      !this.boss ||
      !this.target ||
      !Number.isFinite(deltaSeconds) ||
      deltaSeconds <= 0
    ) {
      return;
    }

    this.attackTimer = Math.max(
      0,
      this.attackTimer - deltaSeconds
    );

    const distance = this.distanceToTarget();

    if (distance > this.detectionRange) {
      this.setState("idle");
      return;
    }

    if (distance <= this.attackRange) {
      this.setState("attack");
      this.tryAttack();
      return;
    }

    this.setState("chase");
    this.moveTowardsTarget(deltaSeconds);
  }

  moveTowardsTarget(deltaSeconds) {
    const position = this.boss.position;
    const target = this.target.position;

    const dx = target.x - position.x;
    const dz = target.z - position.z;
    const distance = Math.hypot(dx, dz);

    if (distance < 0.001) return;

    const step = Math.min(
      this.moveSpeed * deltaSeconds,
      distance
    );

    position.x += dx / distance * step;
    position.z += dz / distance * step;
  }

  tryAttack() {
    if (this.attackTimer > 0) return false;

    this.attackTimer = this.attackCooldown;

    if (typeof this.onAttack === "function") {
      this.onAttack({
        boss: this.boss,
        target: this.target
      });
    }

    return true;
  }

  setEnabled(value) {
    this.enabled = Boolean(value);

    if (!this.enabled) {
      this.setState("idle");
    }
  }

  getState() {
    return {
      state: this.state,
      attackCooldownRemaining: this.attackTimer,
      targetDetected: this.distanceToTarget() <= this.detectionRange
    };
  }

  dispose() {
    this.enabled = false;
    this.boss = null;
    this.target = null;
    this.onAttack = null;
    this.onStateChange = null;
    this.state = "idle";
  }
}
