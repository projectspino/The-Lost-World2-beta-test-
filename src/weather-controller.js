
export class WeatherController {
  constructor(options = {}) {
    this.weatherSystem = options.weatherSystem ?? null;
    this.weatherEffects = options.weatherEffects ?? null;
    this.weatherAudio = options.weatherAudio ?? null;
    this.weatherLighting = options.weatherLighting ?? null;
    this.weatherTransition = options.weatherTransition ?? null;
    this.weatherPersistence = options.weatherPersistence ?? null;

    this.currentWeather = "clear";
    this.intensity = 0;
    this.disposed = false;

    this.presets = {
      clear:  { intensity: 0 },
      cloudy: { intensity: 0.2 },
      rain:   { intensity: 0.6 },
      storm:  { intensity: 1 },
      fog:    { intensity: 0.8 },
      snow:   { intensity: 0.7 }
    };
  }

  setWeather(type, intensity = null) {
    if (this.disposed || !this.presets[type]) {
      return false;
    }

    const preset = this.presets[type];
    const value = Math.max(
      0,
      Math.min(1, intensity ?? preset.intensity)
    );

    const results = [];

    if (this.weatherSystem) {
      results.push(
        this.weatherSystem.setWeather(type, value)
      );
    }

    if (this.weatherEffects) {
      results.push(
        this.weatherEffects.setWeather(type, value)
      );
    }

    if (this.weatherLighting) {
      results.push(
        this.weatherLighting.setWeather(type, value)
      );
    }

    if (this.weatherAudio) {
      this.weatherAudio.setWeather(type);
    }

    this.currentWeather = type;
    this.intensity = value;

    this.save();

    return !results.some(result => result === false);
  }

  update(deltaSeconds, playerPosition = null) {
    if (this.disposed) return;

    this.weatherSystem?.update(deltaSeconds);
    this.weatherEffects?.update(playerPosition);

    if (this.weatherTransition?.active) {
      this.weatherTransition.update(deltaSeconds);
    }
  }

  save() {
    return this.weatherPersistence?.save(
      this.weatherSystem ?? {
        currentWeather: this.currentWeather,
        intensity: this.intensity
      }
    ) ?? false;
  }

  restore() {
    if (this.disposed) return false;

    const saved = this.weatherPersistence?.load();

    if (!saved) {
      return this.setWeather("clear");
    }

    return this.setWeather(
      saved.type,
      saved.intensity
    );
  }

  setVolume(value) {
    this.weatherAudio?.setVolume(value);
  }

  setAudioEnabled(enabled) {
    this.weatherAudio?.setEnabled(enabled);
  }

  getState() {
    return {
      weather: this.currentWeather,
      intensity: this.intensity
    };
  }

  dispose() {
    if (this.disposed) return;

    this.save();

    this.weatherEffects?.clear();
    this.weatherAudio?.stopAll();

    this.weatherSystem = null;
    this.weatherEffects = null;
    this.weatherAudio = null;
    this.weatherLighting = null;
    this.weatherTransition = null;
    this.weatherPersistence = null;

    this.disposed = true;
  }
}
