
export class WeatherSystem {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.currentWeather = "clear";
    this.duration = 0;
    this.changeInterval = options.changeInterval ?? 180;
    this.elapsed = 0;
    this.intensity = 0;
    this.onWeatherChange = options.onWeatherChange ?? null;

    this.weatherTypes = {
      clear: { intensity: 0, fog: 0.0005 },
      cloudy: { intensity: 0.2, fog: 0.001 },
      rain: { intensity: 0.6, fog: 0.002 },
      storm: { intensity: 1, fog: 0.004 },
      fog: { intensity: 0.8, fog: 0.012 }
    };

    this.originalFogDensity = scene?.fogDensity ?? 0;
    this.setWeather("clear");
  }

  setWeather(type, intensity = null) {
    const weather = this.weatherTypes[type];
    if (!weather) return false;

    this.currentWeather = type;
    this.intensity = Math.max(
      0,
      Math.min(1, intensity ?? weather.intensity)
    );

    if (this.scene) {
      this.scene.fogMode = 1;
      this.scene.fogDensity = weather.fog * this.intensity +
        (type === "clear" ? 0 : 0.0002);
    }

    if (typeof this.onWeatherChange === "function") {
      this.onWeatherChange({
        type,
        intensity: this.intensity
      });
    }

    return true;
  }

  update(deltaSeconds) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0) return;

    this.elapsed += deltaSeconds;

    if (this.elapsed >= this.changeInterval) {
      this.elapsed = 0;
      this.changeRandomWeather();
    }
  }

  changeRandomWeather() {
    const types = Object.keys(this.weatherTypes);
    const choices = types.filter(type => type !== this.currentWeather);
    const next = choices[Math.floor(Math.random() * choices.length)];

    return this.setWeather(next);
  }

  getWeather() {
    return {
      type: this.currentWeather,
      intensity: this.intensity,
      nextChangeIn: Math.max(0, this.changeInterval - this.elapsed)
    };
  }

  dispose() {
    if (this.scene) {
      this.scene.fogDensity = this.originalFogDensity;
    }

    this.scene = null;
    this.onWeatherChange = null;
  }
}
