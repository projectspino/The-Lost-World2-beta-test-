const SETTINGS_KEY = "the_lost_world_settings_v1";

const DEFAULT_SETTINGS = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  controlSensitivity: 1,
  graphicsQuality: "high",
  showFPS: false
};

export class SettingsSystem {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.load();
  }

  getAll() {
    return { ...this.settings };
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    if (!(key in DEFAULT_SETTINGS)) {
      return false;
    }

    if (key === "musicVolume" || key === "sfxVolume") {
      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > 1
      ) {
        return false;
      }
    }

    if (key === "controlSensitivity") {
      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < 0.5 ||
        value > 2
      ) {
        return false;
      }
    }

    if (
      key === "graphicsQuality" &&
      !["low", "medium", "high"].includes(value)
    ) {
      return false;
    }

    if (key === "showFPS" && typeof value !== "boolean") {
      return false;
    }

    this.settings[key] = value;
    return true;
  }

  save() {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(this.settings)
      );

      return true;
    } catch {
      return false;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);

      if (!raw) return false;

      const saved = JSON.parse(raw);

      if (!saved || typeof saved !== "object") {
        return false;
      }

      for (const key of Object.keys(DEFAULT_SETTINGS)) {
        if (key in saved) {
          this.set(key, saved[key]);
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  reset() {
    this.settings = { ...DEFAULT_SETTINGS };
    return this.save();
  }
  }
