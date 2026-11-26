
export class WorldEventNotifications {
  constructor(options = {}) {
    this.onNotify = options.onNotify ?? null;
    this.history = [];
    this.maxHistory = options.maxHistory ?? 30;
  }

  notify(type, event) {
    if (!event) return false;

    const messages = {
      start: `Event dimulai: ${event.name ?? event.id}`,
      complete: `Event selesai: ${event.name ?? event.id}`,
      failed: `Event gagal: ${event.name ?? event.id}`,
      expired: `Waktu event habis: ${event.name ?? event.id}`
    };

    const message = messages[type];
    if (!message) return false;

    const notification = {
      type,
      eventId: event.id ?? null,
      message,
      timestamp: Date.now()
    };

    this.history.unshift(notification);

    if (this.history.length > this.maxHistory) {
      this.history.length = this.maxHistory;
    }

    if (typeof this.onNotify === "function") {
      this.onNotify({ ...notification });
    }

    return true;
  }

  eventStarted(event) {
    return this.notify("start", event);
  }

  eventCompleted(event) {
    return this.notify("complete", event);
  }

  eventFailed(event) {
    return this.notify("failed", event);
  }

  eventExpired(event) {
    return this.notify("expired", event);
  }

  getHistory() {
    return this.history.map(item => ({ ...item }));
  }

  clearHistory() {
    this.history = [];
  }

  dispose() {
    this.clearHistory();
    this.onNotify = null;
  }
}
