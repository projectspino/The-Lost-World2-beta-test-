
export class WeatherForecast {
  constructor(options = {}) {
    this.weatherSystem = options.weatherSystem ?? null;
    this.forecastDuration = options.forecastDuration ?? 900;
    this.forecast = [];
    this.elapsed = 0;

    this.weatherTypes = [
      "clear",
      "cloudy",
      "rain",
      "storm",
      "fog",
      "snow"
    ];

    this.generate();
  }

  generate() {
    this.forecast = [];

    let remaining = this.forecastDuration;

    while (remaining > 0) {
      const duration = Math.min(
        remaining,
        120 + Math.random() * 240
      );

      const type = this.weatherTypes[
        Math.floor(Math.random() * this.weatherTypes.length)
      ];

      this.forecast.push({
        type,
        duration: Math.floor(duration),
        intensity: Number((0.3 + Math.random() * 0.7).toFixed(2))
      });

      remaining -= duration;
    }

    return this.getForecast();
  }

  getForecast() {
    return this.forecast.map(item => ({ ...item }));
  }

  getCurrentPrediction() {
    return this.forecast[0] ? { ...this.forecast[0] } : null;
  }

  update(deltaSeconds) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
      return null;
    }

    if (this.forecast.length === 0) {
      this.generate();
      return null;
    }

    this.elapsed += deltaSeconds;

    while (
      this.forecast.length > 0 &&
      this.elapsed >= this.forecast[0].duration
    ) {
      this.elapsed -= this.forecast[0].duration;
      this.forecast.shift();
    }

    if (this.forecast.length === 0) {
      this.generate();
    }

    return this.getCurrentPrediction();
  }

  applyCurrentPrediction() {
    const prediction = this.getCurrentPrediction();

    if (!prediction || !this.weatherSystem) return false;

    return this.weatherSystem.setWeather(
      prediction.type,
      prediction.intensity
    );
  }

  reset() {
    this.elapsed = 0;
    this.generate();
  }

  dispose() {
    this.forecast = [];
    this.weatherSystem = null;
  }
}
