
export class WeatherEvents {
  constructor(options = {}) {
    this.onEvent = options.onEvent ?? null;
    this.onThunder = options.onThunder ?? null;

    this.enabled = true;
    this.elapsed = 0;
    this.nextEvent = options.interval ?? 180;
    this.activeEvent = null;
    this.eventRemaining = 0;

    this.events = {
      thunder: { duration: 2, weather: ["storm"] },
      strong_wind: { duration: 12, weather: ["storm", "rain", "cloudy"] },
      heavy_rain: { duration: 20, weather: ["rain", "storm"] },
      sudden_fog: { duration: 15, weather: ["fog"] }
    };
  }

  update(deltaSeconds, currentWeather = "clear") {
    if (!this.enabled || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
      return null;
    }

    if (this.activeEvent) {
      this.eventRemaining -= deltaSeconds;

      if (this.eventRemaining <= 0) {
        this.endEvent();
      }

      return this.activeEvent;
    }

    this.elapsed += deltaSeconds;

    if (this.elapsed < this.nextEvent) return null;

    this.elapsed = 0;
    this.nextEvent = 120 + Math.random() * 240;

    const available = Object.entries(this.events)
      .filter(([, event]) => event.weather.includes(currentWeather))
      .map(([name]) => name);

    if (available.length === 0) return null;

    const selected = available[
      Math.floor(Math.random() * available.length)
    ];

    this.startEvent(selected);
    return this.activeEvent;
  }

  startEvent(name) {
    const event = this.events[name];

    if (!event) return false;

    this.activeEvent = name;
    this.eventRemaining = event.duration;

    if (name === "thunder" && typeof this.onThunder === "function") {
      this.onThunder();
    }

    if (typeof this.onEvent === "function") {
      this.onEvent({
        name,
        duration: event.duration,
        active: true
      });
    }

    return true;
  }

  endEvent() {
    const previous = this.activeEvent;

    this.activeEvent = null;
    this.eventRemaining = 0;

    if (typeof this.onEvent === "function" && previous) {
      this.onEvent({
        name: previous,
        duration: 0,
        active: false
      });
    }
  }

  setEnabled(value) {
    this.enabled = Boolean(value);

    if (!this.enabled) {
      this.endEvent();
    }
  }

  getState() {
    return {
      enabled: this.enabled,
      activeEvent: this.activeEvent,
      remaining: Math.max(0, this.eventRemaining)
    };
  }

  dispose() {
    this.endEvent();
    this.onEvent = null;
    this.onThunder = null;
    this.enabled = false;
  }
}
