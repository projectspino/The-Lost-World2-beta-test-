export class DayNightSystem {
  constructor(scene, options = {}) {
    if (!scene) {
      throw new Error("Scene tidak tersedia.");
    }

    this.scene = scene;
    this.duration = options.duration ?? 600;
    this.time = options.startTime ?? 0.35;
    this.running = false;

    this.sun = options.sun ?? null;
    this.ambientLight = options.ambientLight ?? null;

    this.onPhaseChange = options.onPhaseChange ?? null;
    this.currentPhase = this.getPhase();
  }

  getPhase() {
    if (this.time < 0.25) return "night";
    if (this.time < 0.35) return "sunrise";
    if (this.time < 0.65) return "day";
    if (this.time < 0.75) return "sunset";
    return "night";
  }

  update(deltaSeconds) {
    if (!this.running) return;

    this.time += deltaSeconds / this.duration;
    this.time %= 1;

    const angle = this.time * Math.PI * 2;
    const daylight = Math.max(0, Math.sin(angle));

    if (this.sun) {
      this.sun.direction.set(
        Math.cos(angle),
        -Math.max(0.05, daylight),
        Math.sin(angle)
      );

      this.sun.intensity = 0.15 + daylight * 0.85;
    }

    if (this.ambientLight) {
      this.ambientLight.intensity = 0.2 + daylight * 0.5;
    }

    const phase = this.getPhase();

    if (phase !== this.currentPhase) {
      this.currentPhase = phase;

      if (typeof this.onPhaseChange === "function") {
        this.onPhaseChange(phase);
      }
    }
  }

  start() {
    this.running = true;
  }

  pause() {
    this.running = false;
  }

  setTime(value) {
    if (!Number.isFinite(value)) return false;

    this.time = ((value % 1) + 1) % 1;
    this.currentPhase = this.getPhase();

    return true;
  }

  getTime() {
    return this.time;
  }

  getCurrentPhase() {
    return this.currentPhase;
  }

  dispose() {
    this.running = false;
    this.scene = null;
    this.sun = null;
    this.ambientLight = null;
    this.onPhaseChange = null;
  }
        }
