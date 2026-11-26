
export class WorldEventSave {
  constructor(options = {}) {
    this.storageKey =
      options.storageKey ?? "lost_world_event_save_v1";
  }

  save(eventSystem) {
    if (!eventSystem) return false;

    try {
      const cooldowns = eventSystem.cooldowns instanceof Map
        ? [...eventSystem.cooldowns.entries()]
        : [];

      const completedEvents = eventSystem.completedEvents instanceof Set
        ? [...eventSystem.completedEvents]
        : [];

      const active = eventSystem.activeEvent;

      const data = {
        version: 1,
        completedEvents: completedEvents.filter(
          id => typeof id === "string"
        ),
        cooldowns: cooldowns.filter(
          ([id, time]) =>
            typeof id === "string" &&
            Number.isFinite(time) &&
            time > 0
        ),
        activeEvent:
          active && typeof active.id === "string"
            ? {
                id: active.id,
                remaining: Math.max(
                  0,
                  Number(active.remaining) || 0
                )
              }
            : null,
        savedAt: Date.now()
      };

      localStorage.setItem(
        this.storageKey,
        JSON.stringify(data)
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
      if (!raw) return null;

      const data = JSON.parse(raw);

      if (
        !data ||
        data.version !== 1 ||
        !Array.isArray(data.completedEvents) ||
        !Array.isArray(data.cooldowns)
      ) {
        return null;
      }

      const savedAt = Number(data.savedAt);
      const elapsedSeconds = Number.isFinite(savedAt) && savedAt > 0
        ? Math.max(0, (Date.now() - savedAt) / 1000)
        : 0;

      const cooldowns = data.cooldowns
        .filter(
          entry =>
            Array.isArray(entry) &&
            typeof entry[0] === "string" &&
            Number.isFinite(entry[1]) &&
            entry[1] > 0
        )
        .map(([id, time]) => [
          id,
          Math.max(0, time - elapsedSeconds)
        ])
        .filter(([, time]) => time > 0);

      let activeEvent = null;

      if (
        data.activeEvent &&
        typeof data.activeEvent.id === "string" &&
        Number.isFinite(data.activeEvent.remaining)
      ) {
        const remaining = Math.max(
          0,
          data.activeEvent.remaining - elapsedSeconds
        );

        if (remaining > 0) {
          activeEvent = {
            id: data.activeEvent.id,
            remaining
          };
        }
      }

      return {
        completedEvents: data.completedEvents.filter(
          id => typeof id === "string"
        ),
        cooldowns,
        activeEvent,
        savedAt: Number.isFinite(savedAt) ? savedAt : Date.now()
      };
    } catch (error) {
      console.error("World event load error:", error);
      return null;
    }
  }

  restore(eventSystem) {
    if (!eventSystem) return false;

    const data = this.load();
    if (!data) return false;

    eventSystem.completedEvents = new Set(
      data.completedEvents
    );

    eventSystem.cooldowns = new Map(
      data.cooldowns
    );

    eventSystem.activeEvent = null;

    if (data.activeEvent) {
      const event = eventSystem.events?.get(
        data.activeEvent.id
      );

      if (event) {
        eventSystem.activeEvent = {
          ...event,
          rewards: Array.isArray(event.rewards)
            ? event.rewards.map(item => ({ ...item }))
            : [],
          remaining: data.activeEvent.remaining,
          startedAt: Date.now(),
          status: "active"
        };
      }
    }

    return true;
  }

  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error("World event clear error:", error);
      return false;
    }
  }
}
