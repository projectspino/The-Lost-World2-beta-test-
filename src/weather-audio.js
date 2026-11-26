
export class WeatherAudio {
  constructor(options = {}) {
    this.basePath = options.basePath ?? "assets/audio/weather/";
    this.volume = Math.max(0, Math.min(1, options.volume ?? 0.35));
    this.sounds = new Map();
    this.currentWeather = "clear";
    this.enabled = options.enabled ?? true;

    this.files = {
      rain: "rain.mp3",
      storm: "storm.mp3",
      wind: "wind.mp3",
      snow: "wind.mp3"
    };
  }

  async load(name, filename = this.files[name]) {
    if (!filename || typeof Audio === "undefined") return false;

    try {
      const audio = new Audio(`${this.basePath}${filename}`);
      audio.loop = true;
      audio.volume = this.volume;
      audio.preload = "none";

      this.sounds.set(name, audio);
      return true;
    } catch {
      return false;
    }
  }

  async setWeather(type) {
    this.stopAll();
    this.currentWeather = type;

    if (!this.enabled) return false;

    const soundName = {
      rain: "rain",
      storm: "storm",
      snow: "snow",
      cloudy: "wind",
      fog: "wind"
    }[type];

    if (!soundName) return true;

    let audio = this.sounds.get(soundName);

    if (!audio) {
      const loaded = await this.load(soundName);
      if (!loaded) return false;
      audio = this.sounds.get(soundName);
    }

    try {
      audio.volume = this.volume;
      await audio.play();
      return true;
    } catch {
      return false;
    }
  }

  playThunder() {
    if (!this.enabled || typeof Audio === "undefined") return false;

    try {
      const audio = new Audio(`${this.basePath}thunder.mp3`);
      audio.volume = this.volume;
      audio.play().catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, Number(value) || 0));

    for (const audio of this.sounds.values()) {
      audio.volume = this.volume;
    }
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);

    if (!this.enabled) {
      this.stopAll();
    }
  }

  stopAll() {
    for (const audio of this.sounds.values()) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  dispose() {
    this.stopAll();

    for (const audio of this.sounds.values()) {
      audio.src = "";
    }

    this.sounds.clear();
  }
}
