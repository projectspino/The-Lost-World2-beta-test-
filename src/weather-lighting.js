
export class WeatherLighting {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.BABYLON = options.BABYLON ?? globalThis.BABYLON;
    this.light = options.light ?? null;

    this.originalFogColor = scene?.fogColor?.clone?.() ?? null;
    this.originalAmbient = this.light?.intensity ?? 1;

    this.presets = {
      clear: { ambient: 1, fog: [0.65, 0.8, 1], density: 0.0005 },
      cloudy: { ambient: 0.8, fog: [0.55, 0.6, 0.68], density: 0.001 },
      rain: { ambient: 0.65, fog: [0.4, 0.48, 0.58], density: 0.002 },
      storm: { ambient: 0.4, fog: [0.22, 0.25, 0.32], density: 0.004 },
      fog: { ambient: 0.7, fog: [0.72, 0.76, 0.8], density: 0.012 },
      snow: { ambient: 0.9, fog: [0.82, 0.88, 0.95], density: 0.003 }
    };

    this.currentWeather = "clear";
  }

  setWeather(type, intensity = 1) {
    if (!this.scene || !this.presets[type]) return false;

    const preset = this.presets[type];
    const amount = Math.max(0, Math.min(1, intensity));

    if (this.light) {
      this.light.intensity =
        this.originalAmbient +
        (preset.ambient - this.originalAmbient) * amount;
    }

    if (this.BABYLON?.Color3) {
      const color = preset.fog;
      this.scene.fogColor = new this.BABYLON.Color3(
        color[0],
        color[1],
        color[2]
      );
    }

    this.scene.fogMode = this.BABYLON?.Scene?.FOGMODE_EXP2 ?? 2;
    this.scene.fogDensity = preset.density * amount;

    this.currentWeather = type;
    return true;
  }

  reset() {
    if (!this.scene) return;

    if (this.originalFogColor) {
      this.scene.fogColor = this.originalFogColor.clone();
    }

    this.scene.fogDensity = 0;

    if (this.light) {
      this.light.intensity = this.originalAmbient;
    }

    this.currentWeather = "clear";
  }

  dispose() {
    this.reset();
    this.scene = null;
    this.light = null;
  }
}
