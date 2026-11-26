
export class WorldEventSystem {
  constructor(options = {}) {
    this.onEventStart = options.onEventStart ?? null;
    this.onEventComplete = options.onEventComplete ?? null;
    this.onEventEnd = options.onEventEnd ?? null;

    this.events = new Map();
    this.activeEvent = null;
    this.completedEvents = new Set();
    this.cooldowns = new Map();

    this.storageKey = options.storageKey ?? "lost_world_events";
    this.load();
  }

  registerEvent(id, data = {}) {
    if (typeof id !== "string" || !id.trim()) return false;
    if (this.events.has(id)) return false;

    this.events.set(id, {
      id,
      name: data.name ?? id,
      description: data.description ?? "",
      type: data.type ?? "exploration",
      duration: Math.max(1, Number(data.duration) || 300),
      cooldown: Math.max(0, Number(data.cooldown) || 600),
      rewards: Array.isArray(data.rewards) ? data.rewards : [],
      requirements: data.requirements ?? null
    });

    return true;
  }

  registerDefaultEvents() {
    this.registerEvent("monster_invasion", {
      name: "Monster Invasion",
      description: "Pertahankan wilayah dari serangan monster.",
      type: "combat",
      duration: 300,
      cooldown: 900,
      rewards: [
        { name: "Gold", quantity: 100 },
        { name: "Monster Core", quantity: 2 }
      ]
    });

    this.registerEvent("ancient_boss", {
      name: "Ancient Boss",
      description: "Hadapi boss kuno yang muncul di dunia.",
      type: "boss",
      duration: 600,
      cooldown: 1800,
      rewards: [
        { name: "Ancient Core", quantity: 1 },
        { name: "Gold", quantity: 250 }
      ]
    });

    this.registerEvent("treasure_hunt", {
      name: "Treasure Hunt",
      description: "Temukan harta karun tersembunyi.",
      type: "exploration",
      duration: 240,
      cooldown: 600,
      rewards: [
        { name: "Gold", quantity: 150 },
        { name: "Crystal", quantity: 3 }
      ]
    });

    return this.events.size;
  }

  startEvent(id, context = {}) {
    if (this.activeEvent) return false;

    const event = this.events.get(id);
    if (!event || this.completedEvents.has(id)) return false;

    if ((this.cooldowns.get(id) ?? 0) > 0) return false;

    if (
      typeof event.requirements === "function" &&
      !event.requirements(context)
    ) {
      return false;
    }

    this.activeEvent = {
      ...event,
      remaining: event.duration,
      startedAt: Date.now(),
      status: "active"
    };

    if (typeof this.onEventStart === "function") {
      this.onEventStart(this.getActiveEvent());
    }

    return true;
  }

  update(deltaSeconds) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
      return null;
    }

    for (const [id, remaining] of this.cooldowns) {
      this.cooldowns.set(
        id,
        Math.max(0, remaining - deltaSeconds)
      );
    }

    if (!this.activeEvent) return null;

    this.activeEvent.remaining -= deltaSeconds;

    if (this.activeEvent.remaining <= 0) {
      this.endEvent("expired");
    }

    return this.getActiveEvent();
  }

  completeEvent(id = null) {
    if (!this.activeEvent) return false;
    if (id && this.activeEvent.id !== id) return false;

    const event = this.activeEvent;

    this.completedEvents.add(event.id);
    this.cooldowns.set(event.id, event.cooldown);

    this.activeEvent = null;
    this.save();

    if (typeof this.onEventComplete === "function") {
      this.onEventComplete({
        id: event.id,
        name: event.name,
        rewards: event.rewards.map(item => ({ ...item }))
      });
    }

    return true;
  }

  endEvent(reason = "cancelled") {
    if (!this.activeEvent) return false;

    const event = this.activeEvent;
    this.activeEvent = null;

    if (reason === "expired") {
      this.cooldowns.set(event.id, event.cooldown);
    }

    this.save();

    if (typeof this.onEventEnd === "function") {
      this.onEventEnd({
        id: event.id,
        reason
      });
    }

    return true;
  }

  getActiveEvent() {
    if (!this.activeEvent) return null;

    return {
      ...this.activeEvent,
      rewards: this.activeEvent.rewards.map(item => ({ ...item }))
    };
  }

  getAvailableEvents() {
    return [...this.events.values()].map(event => ({
      ...event,
      available:
        !this.activeEvent &&
        !this.completedEvents.has(event.id) &&
        (this.cooldowns.get(event.id) ?? 0) <= 0
    }));
  }

  getProgress() {
    return {
      total: this.events.size,
      completed: this.completedEvents.size,
      active: this.activeEvent?.id ?? null
    };
  }

  save() {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          completed: [...this.completedEvents],
          cooldowns: [...this.cooldowns]
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  load() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(this.storageKey) ?? "{}"
      );

      this.completedEvents = new Set(
        Array.isArray(saved.completed) ? saved.completed : []
      );

      this.cooldowns = new Map(
        Array.isArray(saved.cooldowns) ? saved.cooldowns : []
      );
    } catch {
      this.completedEvents.clear();
      this.cooldowns.clear();
    }
  }

  reset() {
    this.activeEvent = null;
    this.completedEvents.clear();
    this.cooldowns.clear();

    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Penyimpanan tidak tersedia.
    }
  }

  dispose() {
    this.activeEvent = null;
    this.events.clear();
    this.completedEvents.clear();
    this.cooldowns.clear();
    this.onEventStart = null;
    this.onEventComplete = null;
    this.onEventEnd = null;
  }
}
