
export class WorldBossSpawnSystem {
  constructor(options = {}) {
    this.bosses = new Map();
    this.onSpawn = options.onSpawn ?? null;
    this.onDespawn = options.onDespawn ?? null;
  }

  register(id, config = {}) {
    if (!id || this.bosses.has(id)) return false;

    this.bosses.set(id, {
      id,
      position: {
        x: config.position?.x ?? 0,
        y: config.position?.y ?? 0,
        z: config.position?.z ?? 0
      },
      respawnDelay: Math.max(0, config.respawnDelay ?? 300),
      respawnTimer: 0,
      alive: false,
      spawned: false
    });

    return true;
  }

  spawn(id) {
    const boss = this.bosses.get(id);

    if (!boss || boss.spawned || boss.respawnTimer > 0) {
      return false;
    }

    boss.spawned = true;
    boss.alive = true;

    if (typeof this.onSpawn === "function") {
      this.onSpawn({
        id: boss.id,
        position: { ...boss.position }
      });
    }

    return true;
  }

  defeat(id) {
    const boss = this.bosses.get(id);

    if (!boss || !boss.spawned || !boss.alive) {
      return false;
    }

    boss.alive = false;
    boss.spawned = false;
    boss.respawnTimer = boss.respawnDelay;

    if (typeof this.onDespawn === "function") {
      this.onDespawn({ id });
    }

    return true;
  }

  update(deltaSeconds) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
      return;
    }

    for (const boss of this.bosses.values()) {
      if (boss.respawnTimer > 0) {
        boss.respawnTimer = Math.max(
          0,
          boss.respawnTimer - deltaSeconds
        );
      }
    }
  }

  getBoss(id) {
    const boss = this.bosses.get(id);

    return boss ? {
      ...boss,
      position: { ...boss.position }
    } : null;
  }

  getAllBosses() {
    return Array.from(this.bosses.keys()).map(
      id => this.getBoss(id)
    );
  }

  remove(id) {
    return this.bosses.delete(id);
  }

  dispose() {
    this.bosses.clear();
    this.onSpawn = null;
    this.onDespawn = null;
  }
}
