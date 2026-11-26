
export class WeatherScheduler {
  constructor(options = {}) {
    this.weatherSystem = options.weatherSystem ?? null;
    this.minInterval = options.minInterval ?? 120;
    this.maxInterval = options.maxInterval ?? 300;
    this.elapsed = 0;
    this.nextChange = this.randomInterval();
    this.enabled = true;

    this.weatherTypes = [
      "clear",
      "cloudy",
      "rain",
      "storm",
      "fog",
      "snow"
    ];

    this.allowedWeather = options.allowedWeather ??
      this.weatherTypes;
  }

  randomInterval() {
    return this.minInterval +
      Math.random() * (this.maxInterval - this.minInterval);
  }

  update(deltaSeconds) {
    if (!this.enabled || !this.weatherSystem) return false;
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return false;

    this.elapsed += deltaSeconds;

    if (this.elapsed < this.nextChange) return false;

    this.elapsed = 0;
    this.nextChange = this.randomInterval();

    const available = this.allowedWeather.filter(
      type => this.weatherTypes.includes(type)
    );

    if (available.length === 0) return false;

    const current = this.weatherSystem.currentWeather;
    const choices = available.filter(type => type !== current);
    const pool = choices.length > 0 ? choices : available;

    const next = pool[Math.floor(Math.random() * pool.length)];

    return this.weatherSystem.setWeather(next);
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
  }

  setInterval(minSeconds, maxSeconds) {
    if (
      !Number.isFinite(minSeconds) ||
      !Number.isFinite(maxSeconds) ||
      minSeconds <= 0 ||
      maxSeconds < minSeconds
    ) {
      return false;
    }

    this.minInterval = minSeconds;
    this.maxInterval = maxSeconds;
    this.nextChange = this.randomInterval();
    this.elapsed = 0;

    return true;
  }

  getRemainingTime() {
    return Math.max(0, this.nextChange - this.elapsed);
  }

  reset() {
    this.elapsed = 0;
    this.nextChange = this.randomInterval();
  }

  dispose() {
    this.weatherSystem = null;
    this.enabled = false;
  }
}
