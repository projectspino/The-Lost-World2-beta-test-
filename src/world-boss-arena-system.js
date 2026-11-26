
export class WorldBossArenaSystem {
  constructor(options = {}) {
    this.arenas = new Map();
    this.onEnter = options.onEnter ?? null;
    this.onExit = options.onExit ?? null;
    this.activeArena = null;
  }

  register(id, config = {}) {
    if (!id || this.arenas.has(id)) return false;

    const center = config.center ?? { x: 0, z: 0 };

    this.arenas.set(id, {
      id,
      center: {
        x: center.x ?? 0,
        z: center.z ?? 0
      },
      radius: Math.max(1, config.radius ?? 20),
      bossId: config.bossId ?? null,
      locked: false,
      active: false
    });

    return true;
  }

  enter(id, playerPosition) {
    const arena = this.arenas.get(id);

    if (!arena || !playerPosition || arena.locked) {
      return false;
    }

    if (this.activeArena && this.activeArena !== id) {
      this.exit();
    }

    arena.active = true;
    this.activeArena = id;

    if (typeof this.onEnter === "function") {
      this.onEnter({
        arenaId: id,
        bossId: arena.bossId
      });
    }

    return true;
  }

  isInside(id, position) {
    const arena = this.arenas.get(id);

    if (!arena || !position) return false;

    const dx = position.x - arena.center.x;
    const dz = position.z - arena.center.z;

    return Math.hypot(dx, dz) <= arena.radius;
  }

  lock(id) {
    const arena = this.arenas.get(id);
    if (!arena) return false;

    arena.locked = true;
    return true;
  }

  unlock(id) {
    const arena = this.arenas.get(id);
    if (!arena) return false;

    arena.locked = false;
    return true;
  }

  exit() {
    if (!this.activeArena) return false;

    const id = this.activeArena;
    const arena = this.arenas.get(id);

    if (arena) arena.active = false;

    this.activeArena = null;

    if (typeof this.onExit === "function") {
      this.onExit({ arenaId: id });
    }

    return true;
  }

  getActiveArena() {
    if (!this.activeArena) return null;

    const arena = this.arenas.get(this.activeArena);
    return arena ? { ...arena, center: { ...arena.center } } : null;
  }

  dispose() {
    this.exit();
    this.arenas.clear();
    this.onEnter = null;
    this.onExit = null;
  }
}
