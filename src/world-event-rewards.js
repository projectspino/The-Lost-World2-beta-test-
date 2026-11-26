
export class WorldEventRewards {
  constructor(options = {}) {
    this.inventory = options.inventory ?? null;
    this.onExperience = options.onExperience ?? null;
    this.onGold = options.onGold ?? null;
    this.onReward = options.onReward ?? null;

    this.claimedEvents = new Set();
  }

  claim(event) {
    if (!event || typeof event.id !== "string" || !event.id) {
      return false;
    }

    if (this.claimedEvents.has(event.id)) return false;

    const rewards = Array.isArray(event.rewards)
      ? event.rewards
      : [];

    const normalized = [];

    for (const reward of rewards) {
      if (!reward || typeof reward.name !== "string") {
        return false;
      }

      const quantity = Number(reward.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return false;
      }

      const name = reward.name.toLowerCase();

      if (
        name !== "gold" &&
        name !== "experience" &&
        name !== "xp" &&
        (!this.inventory ||
          typeof this.inventory.addItem !== "function" ||
          typeof this.inventory.removeItem !== "function")
      ) {
        return false;
      }

      if (name === "gold" && typeof this.onGold !== "function") {
        return false;
      }

      if (
        (name === "experience" || name === "xp") &&
        typeof this.onExperience !== "function"
      ) {
        return false;
      }

      normalized.push({
        name,
        originalName: reward.name,
        quantity,
        type: reward.type ?? "Material"
      });
    }

    // Tandai sementara agar claim tidak bisa dipanggil berulang
    // saat proses pemberian hadiah berlangsung.
    this.claimedEvents.add(event.id);

    const addedItems = [];
    let goldGranted = 0;
    let experienceGranted = 0;

    try {
      for (const reward of normalized) {
        if (
          reward.name === "gold" ||
          reward.name === "experience" ||
          reward.name === "xp"
        ) continue;

        const success = this.inventory.addItem(
          reward.originalName,
          reward.quantity,
          reward.type
        );

        if (!success) {
          throw new Error(`Gagal menambahkan ${reward.originalName}`);
        }

        addedItems.push(reward);
      }

      for (const reward of normalized) {
        if (reward.name === "gold") {
          this.onGold(reward.quantity);
          goldGranted += reward.quantity;
        } else if (
          reward.name === "experience" ||
          reward.name === "xp"
        ) {
          this.onExperience(reward.quantity);
          experienceGranted += reward.quantity;
        }
      }
    } catch (error) {
      console.error("Event reward error:", error);

      for (const item of addedItems.reverse()) {
        try {
          this.inventory.removeItem(
            item.originalName,
            item.quantity,
            item.type
          );
        } catch (rollbackError) {
          console.error("Reward rollback error:", rollbackError);
        }
      }

      // Callback gold/experience tidak memiliki mekanisme
      // rollback pada API yang tersedia.
      if (goldGranted || experienceGranted) {
        console.error("Sebagian reward currency mungkin sudah diberikan.");
      }

      this.claimedEvents.delete(event.id);
      return false;
    }

    if (typeof this.onReward === "function") {
      try {
        this.onReward({
          eventId: event.id,
          rewards: rewards.map(item => ({ ...item }))
        });
      } catch (error) {
        console.error("Reward notification error:", error);
      }
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
