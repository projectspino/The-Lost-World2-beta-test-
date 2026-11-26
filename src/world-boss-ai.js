
export class WorldBossAI {
  constructor(boss, options = {}) {
    this.boss = boss;
    this.target = null;

    this.moveSpeed = options.moveSpeed ?? 2.5;
    this.attackRange = options.attackRange ?? 3;
    this.detectionRange = options.detectionRange ?? 18;
    this.attackCooldown = options.attackCooldown ?? 2;
    this.attackDamage = options.attackDamage ?? 15;

    this.attackTimer = 0;
    this.state = "idle";
    this.onAttack = options.onAttack ?? null;
    this.onStateChange = options.onStateChange ?? null;
    this.disposed = false;
  }

  setTarget(target) {
    if (this.disposed) return false;
    this.target = target || null;
    return true;
  }

  getState() {
    return this.state;
  }

  setState(nextState) {
    if (this.state === nextState) return;

    this.state = nextState;

    if (typeof this.onStateChange === "function") {
      try {
        this.onStateChange(nextState, this.boss);
      } catch (error) {
        console.error("WorldBossAI state callback error:", error);
      }
    }
  }

  getPosition(entity) {
    if (!entity) return null;
    if (entity.position) return entity.position;
    if (entity.mesh?.position) return entity.mesh.position;
    return null;
  }

  update(deltaTime) {
    if (
      this.disposed ||
      !Number.isFinite(deltaTime) ||
      deltaTime <= 0 ||
      !this.boss
    ) return;

    const bossMesh = this.boss.mesh || this.boss;

    if (!bossMesh || bossMesh.isDisposed?.()) {
      this.setState("idle");
      return;
    }

    const bossPosition = bossMesh.position;
    const targetPosition = this.getPosition(this.target);

    if (!bossPosition || !targetPosition) {
      this.setState("idle");
      return;
    }

    const dx = targetPosition.x - bossPosition.x;
    const dz = targetPosition.z - bossPosition.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    this.attackTimer = Math.max(
      0,
      this.attackTimer - deltaTime
    );

    if (distance > this.detectionRange) {
      this.setState("idle");
      return;
    }

    if (distance <= this.attackRange) {
      this.setState("attacking");

      if (this.attackTimer <= 0) {
        this.attackTimer = this.attackCooldown;

        if (typeof this.onAttack === "function") {
          try {
            this.onAttack({
              boss: this.boss,
              target: this.target,
              damage: this.attackDamage
            });
          } catch (error) {
            console.error("WorldBossAI attack callback error:", error);
          }
        }
      }

      return;
    }

    this.setState("chasing");
    this.moveTowardsTarget(bossMesh, targetPosition, deltaTime);
  }

  moveTowardsTarget(bossMesh, targetPosition, deltaTime) {
    if (!bossMesh?.position || !targetPosition) return;

    const dx = targetPosition.x - bossMesh.position.x;
    const dz = targetPosition.z - bossMesh.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance <= 0.001) return;

    const step = Math.min(
      this.moveSpeed * Math.max(0, deltaTime),
      distance
    );

    bossMesh.position.x += (dx / distance) * step;
    bossMesh.position.z += (dz / distance) * step;

    if (bossMesh.rotation) {
      bossMesh.rotation.y = Math.atan2(dx, dz);
    }
  }

  dispose() {
    if (this.disposed) return;

    this.setState("idle");
    this.disposed = true;
    this.target = null;
    this.onAttack = null;
    this.onStateChange = null;
    this.boss = null;
  }
}
