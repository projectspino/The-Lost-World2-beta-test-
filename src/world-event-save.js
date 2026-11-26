
export class WorldEventSave {
  constructor(options = {}) {
    this.storageKey =
      options.storageKey ?? "lost_world_event_save_v1";
  }

  save(eventSystem) {
    if (!eventSystem) return false;

    try {
      const data = {
        version: 1,
        completedEvents: [
          ...(eventSystem.completedEvents ?? [])
        ],
        cooldowns: [
          ...(eventSystem.cooldowns ?? [])
        ],
        activeEvent: eventSystem.activeEvent
          ? {
              id: eventSystem.activeEvent.id,
              remaining: Math.max(
                0,
                Number(eventSystem.activeEvent.remaining) || 0
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

      return {
        completedEvents: data.completedEvents.filter(
          id => typeof id === "string"
        ),
        cooldowns: data.cooldowns.filter(
          entry =>
            Array.isArray(entry) &&
            typeof entry[0] === "string" &&
            Number.isFinite(entry[1]) &&
            entry[1] >= 0
        ),
        activeEvent:
          data.activeEvent &&
          typeof data.activeEvent.id === "string" &&
          Number.isFinite(data.activeEvent.remaining)
            ? {
                id: data.activeEvent.id,
                remaining: Math.max(
                  0,
                  data.activeEvent.remaining
                )
              }
            : null,
        savedAt: Number(data.savedAt) || 0
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

      if (event && data.activeEvent.remaining > 0) {
        eventSystem.activeEvent = {
          ...event,
          rewards: Array.isArray(event.rewards)
            ? event.rewards.map(item => ({ ...item }))
            : [],
          remaining: data.activeEvent.remaining,
          startedAt: data.savedAt,
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
