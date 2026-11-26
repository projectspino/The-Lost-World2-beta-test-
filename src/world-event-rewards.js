
export class WorldEventRewards {
  constructor(options = {}) {
    this.inventory = options.inventory ?? null;
    this.onExperience = options.onExperience ?? null;
    this.onGold = options.onGold ?? null;
    this.onReward = options.onReward ?? null;

    this.claimedEvents = new Set();
  }

  claim(event) {
    if (!event || !event.id) return false;
    if (this.claimedEvents.has(event.id)) return false;

    const rewards = Array.isArray(event.rewards)
      ? event.rewards
      : [];

    const results = [];

    for (const reward of rewards) {
      if (!reward || !reward.name) continue;

      const quantity = Math.max(
        1,
        Math.floor(Number(reward.quantity) || 1)
      );

      if (reward.name.toLowerCase() === "gold") {
        if (typeof this.onGold === "function") {
          this.onGold(quantity);
          results.push(true);
        }
        continue;
      }

      if (
        reward.name.toLowerCase() === "experience" ||
        reward.name.toLowerCase() === "xp"
      ) {
        if (typeof this.onExperience === "function") {
          this.onExperience(quantity);
          results.push(true);
        }
        continue;
      }

      if (this.inventory?.addItem) {
        results.push(
          this.inventory.addItem(
            reward.name,
            quantity,
            reward.type ?? "Material"
          )
        );
      }
    }

    this.claimedEvents.add(event.id);

    if (typeof this.onReward === "function") {
      this.onReward({
        eventId: event.id,
        rewards: rewards.map(item => ({ ...item }))
      });
    }

    return true;
  }

  hasClaimed(eventId) {
    return this.claimedEvents.has(eventId);
  }

  reset() {
    this.claimedEvents.clear();
  }

  dispose() {
    this.inventory = null;
    this.onExperience = null;
    this.onGold = null;
    this.onReward = null;
    this.claimedEvents.clear();
  }
}
