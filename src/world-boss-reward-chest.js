
export class WorldBossRewardChest {
  constructor(options = {}) {
    this.chests = new Map();
    this.onClaim = options.onClaim ?? null;
    this.storageKey = options.storageKey ?? "lostworld_boss_chests";
    this.load();
  }

  create(bossId, rewards = []) {
    if (!bossId || this.chests.has(bossId)) {
      return false;
    }

    this.chests.set(bossId, {
      bossId,
      rewards: rewards.map(item => ({
        id: item.id,
        quantity: Math.max(
          1,
          Math.floor(item.quantity ?? 1)
        )
      })),
      unlocked: false,
      claimed: false
    });

    this.save();
    return true;
  }

  unlock(bossId) {
    const chest = this.chests.get(bossId);

    if (!chest || chest.claimed) return false;

    chest.unlocked = true;
    this.save();
    return true;
  }

  claim(bossId) {
    const chest = this.chests.get(bossId);

    if (!chest || !chest.unlocked || chest.claimed) {
      return false;
    }

    const rewards = chest.rewards.map(item => ({
      ...item
    }));

    if (typeof this.onClaim === "function") {
      try {
        const result = this.onClaim({
          bossId,
          rewards
        });

        if (result === false) return false;
      } catch {
        return false;
      }
    }

    chest.claimed = true;
    this.save();

    return rewards;
  }

  getChest(bossId) {
    const chest = this.chests.get(bossId);

    return chest ? {
      ...chest,
      rewards: chest.rewards.map(item => ({ ...item }))
    } : null;
  }

  save() {
    try {
      const data = Array.from(this.chests.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return false;

      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return false;

      for (const entry of data) {
        if (!Array.isArray(entry) || entry.length !== 2) continue;

        const [id, chest] = entry;

        if (
          typeof id !== "string" ||
          !chest ||
          chest.bossId !== id ||
          !Array.isArray(chest.rewards)
        ) {
          continue;
        }

        this.chests.set(id, chest);
      }

      return true;
    } catch {
      return false;
    }
  }

  reset(bossId) {
    if (!this.chests.has(bossId)) return false;

    this.chests.delete(bossId);
    this.save();
    return true;
  }

  dispose() {
    this.chests.clear();
    this.onClaim = null;
  }
}
