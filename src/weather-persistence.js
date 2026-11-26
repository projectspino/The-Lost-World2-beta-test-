
export class WeatherPersistence {
  constructor(options = {}) {
    this.storageKey =
      options.storageKey ?? "lost_world_weather_save";

    this.defaultWeather = options.defaultWeather ?? "clear";

    this.allowedWeather = [
      "clear",
      "cloudy",
      "rain",
      "storm",
      "fog",
      "snow"
    ];
  }

  save(weatherSystem) {
    if (!weatherSystem) return false;

    const weather = {
      type: weatherSystem.currentWeather ?? this.defaultWeather,
      intensity: Number(weatherSystem.intensity ?? 0),
      savedAt: Date.now()
    };

    if (!this.allowedWeather.includes(weather.type)) {
      return false;
    }

    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(weather)
      );

      return true;
    } catch {
      return false;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);

      if (!raw) return null;

      const saved = JSON.parse(raw);

      if (
        !saved ||
        !this.allowedWeather.includes(saved.type)
      ) {
        return null;
      }

      return {
        type: saved.type,
        intensity: Math.max(
          0,
          Math.min(1, Number(saved.intensity) || 0)
        ),
        savedAt: Number(saved.savedAt) || 0
      };
    } catch {
      return null;
    }
  }

  restore(weatherSystem) {
    if (!weatherSystem) return false;

    const saved = this.load();

    if (!saved) {
      return weatherSystem.setWeather(this.defaultWeather);
    }

    return weatherSystem.setWeather(
      saved.type,
      saved.intensity
    );
  }

  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch {
      return false;
    }
  }
}
