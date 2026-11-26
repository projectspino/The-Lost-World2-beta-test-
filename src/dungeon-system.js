export class DungeonSystem {
  constructor(options = {}) {
    this.dungeons = new Map();
    this.onBossSpawn = options.onBossSpawn ?? null;
    this.onDungeonComplete = options.onDungeonComplete ?? null;
  }

  registerDungeon(id, config = {}) {
    if (!id || this.dungeons.has(id)) {
      return false;
    }

    this.dungeons.set(id, {
      id,
      name: config.name ?? id,
      bossName: config.bossName ?? "Dungeon Boss",
      status: "locked",
      bossSpawned: false,
      bossDefeated: false,
      completed: false
    });

    return true;
  }

  unlockDungeon(id) {
    const dungeon = this.dungeons.get(id);

    if (!dungeon || dungeon.status !== "locked") {
      return false;
    }

    dungeon.status = "unlocked";
    return true;
  }

  enterDungeon(id) {
    const dungeon = this.dungeons.get(id);

    if (!dungeon || dungeon.status !== "unlocked") {
      return false;
    }

    dungeon.status = "active";
    return true;
  }

  spawnBoss(id) {
    const dungeon = this.dungeons.get(id);

    if (
      !dungeon ||
      dungeon.status !== "active" ||
      dungeon.bossSpawned
    ) {
      return false;
    }

    dungeon.bossSpawned = true;

    if (typeof this.onBossSpawn === "function") {
      this.onBossSpawn({
        dungeonId: id,
        bossName: dungeon.bossName
      });
    }

    return true;
  }

  defeatBoss(id) {
    const dungeon = this.dungeons.get(id);

    if (
      !dungeon ||
      dungeon.status !== "active" ||
      !dungeon.bossSpawned ||
      dungeon.bossDefeated
    ) {
      return false;
    }

    dungeon.bossDefeated = true;
    dungeon.completed = true;
    dungeon.status = "completed";

    if (typeof this.onDungeonComplete === "function") {
      this.onDungeonComplete({
        dungeonId: id,
        dungeonName: dungeon.name,
        bossName: dungeon.bossName
      });
    }

    return true;
  }

  getDungeon(id) {
    const dungeon = this.dungeons.get(id);

    return dungeon ? { ...dungeon } : null;
  }

  getAllDungeons() {
    return Array.from(this.dungeons.values()).map(
      dungeon => ({ ...dungeon })
    );
  }

  isCompleted(id) {
    return this.dungeons.get(id)?.completed ?? false;
  }

  resetDungeon(id) {
    const dungeon = this.dungeons.get(id);

    if (!dungeon) return false;

    dungeon.status = "unlocked";
    dungeon.bossSpawned = false;
    dungeon.bossDefeated = false;
    dungeon.completed = false;

    return true;
  }
  }
