
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
    if (typeof id !== "string" || !id.trim() || this.events.has(id)) {
      return false;
    }

    this.events.set(id, {
      id,
      name: data.name ?? id,
      description: data.description ?? "",
      type: data.type ?? "exploration",
      duration: Math.max(1, Number(data.duration) || 300),
      cooldown: Math.max(0, Number(data.cooldown) || 600),
      rewards: Array.isArray(data.rewards)
        ? data.rewards.map(item => ({ ...item }))
        : [],
      requirements:
        typeof data.requirements === "function"
          ? data.requirements
          : null
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

  notify(callback, data) {
    if (typeof callback !== "function") return;

    try {
      callback(data);
    } catch (error) {
      console.error("World event callback error:", error);
    }
  }

  startEvent(id, context = {}) {
    if (this.activeEvent) return false;

    const event = this.events.get(id);
    if (!event || this.getCooldown(id) > 0) return false;

    if (event.requirements) {
      try {
        if (!event.requirements(context)) return false;
      } catch (error) {
        console.error("World event requirement error:", error);
        return false;
      }
    }

    this.activeEvent = {
      ...event,
      rewards: event.rewards.map(item => ({ ...item })),
      remaining: event.duration,
      startedAt: Date.now(),
      status: "active"
    };

    this.save();
    this.notify(this.onEventStart, this.getActiveEvent());

    return true;
  }

  update(deltaSeconds) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
      return null;
    }

    for (const [id, remaining] of this.cooldowns) {
      const next = Math.max(0, remaining - deltaSeconds);

      if (next <= 0) {
        this.cooldowns.delete(id);
      } else {
        this.cooldowns.set(id, next);
      }
    }

    if (!this.activeEvent) return null;

    this.activeEvent.remaining = Math.max(
      0,
      this.activeEvent.remaining - deltaSeconds
    );

    if (this.activeEvent.remaining <= 0) {
      this.endEvent("expired");
      return null;
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

    this.notify(this.onEventComplete, {
      id: event.id,
      name: event.name,
      rewards: event.rewards.map(item => ({ ...item }))
    });

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
    this.notify(this.onEventEnd, {
      id: event.id,
      reason
    });

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
      rewards: event.rewards.map(item => ({ ...item })),
      available:
        !this.activeEvent &&
        this.getCooldown(event.id) <= 0
    }));
  }

  getProgress() {
    return {
      total: this.events.size,
      completed: this.completedEvents.size,
      active: this.activeEvent?.id ?? null
    };
  }

  getCooldown(id) {
    return Math.max(0, this.cooldowns.get(id) ?? 0);
  }

  save() {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          version: 1,
          completed: [...this.completedEvents],
          cooldowns: [...this.cooldowns]
        })
      );

      return true;
    } catch (error) {
      console.error("World event save error:", error);
      return false;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return false;

      const saved = JSON.parse(raw);
      if (!saved || saved.version !== 1) return false;

      this.completedEvents = new Set(
        Array.isArray(saved.completed)
          ? saved.completed.filter(id => typeof id === "string")
          : []
      );

      this.cooldowns = new Map(
        Array.isArray(saved.cooldowns)
          ? saved.cooldowns.filter(
              entry =>
                Array.isArray(entry) &&
                typeof entry[0] === "string" &&
                Number.isFinite(entry[1]) &&
                entry[1] >= 0
            )
          : []
      );

      return true;
    } catch (error) {
      console.error("World event load error:", error);
      return false;
    }
  }

  reset() {
    this.activeEvent = null;
    this.completedEvents.clear();
    this.cooldowns.clear();

    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error("World event reset error:", error);
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
