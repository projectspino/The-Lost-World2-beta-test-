
export class WeatherTransition {
  constructor(options = {}) {
    this.duration = options.duration ?? 8;
    this.progress = 1;
    this.active = false;
    this.from = null;
    this.to = null;
    this.onUpdate = options.onUpdate ?? null;
    this.onComplete = options.onComplete ?? null;
  }

  start(from, to, duration = this.duration) {
    if (!from || !to || typeof from !== "object" || typeof to !== "object") {
      return false;
    }

    this.from = { ...from };
    this.to = { ...to };
    this.duration = Math.max(0.1, duration);
    this.progress = 0;
    this.active = true;

    return true;
  }

  update(deltaSeconds) {
    if (!this.active || !Number.isFinite(deltaSeconds) || deltaSeconds <= 0) {
      return null;
    }

    this.progress = Math.min(
      1,
      this.progress + deltaSeconds / this.duration
    );

    const t = this.progress * this.progress * (3 - 2 * this.progress);
    const result = {};

    for (const key of new Set([
      ...Object.keys(this.from),
      ...Object.keys(this.to)
    ])) {
      const start = this.from[key];
      const end = this.to[key];

      if (typeof start === "number" && typeof end === "number") {
        result[key] = start + (end - start) * t;
      } else {
        result[key] = t >= 1 ? end : start;
      }
    }

    if (typeof this.onUpdate === "function") {
      this.onUpdate(result, this.progress);
    }

    if (this.progress >= 1) {
      this.active = false;

      if (typeof this.onComplete === "function") {
        this.onComplete(result);
      }
    }

    return result;
  }

  cancel() {
    this.active = false;
    this.progress = 1;
    this.from = null;
    this.to = null;
  }

  dispose() {
    this.cancel();
    this.onUpdate = null;
    this.onComplete = null;
  }
}
