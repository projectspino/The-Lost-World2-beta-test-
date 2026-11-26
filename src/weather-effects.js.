
export class WeatherEffects {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.BABYLON = options.BABYLON ?? globalThis.BABYLON;
    this.target = options.target ?? null;

    this.maxParticles = options.maxParticles ?? 350;
    this.particleSystem = null;
    this.texture = null;
    this.currentEffect = "clear";
    this.disposed = false;

    this.createTexture();
  }

  createTexture() {
    const B = this.BABYLON;

    if (!B?.DynamicTexture || !this.scene) return;

    this.texture = new B.DynamicTexture(
      "weather-particle-texture",
      { width: 32, height: 32 },
      this.scene,
      false
    );

    const context = this.texture.getContext();
    context.clearRect(0, 0, 32, 32);
    context.beginPath();
    context.arc(16, 16, 12, 0, Math.PI * 2);
    context.fillStyle = "white";
    context.fill();
    this.texture.update();
  }

  clear() {
    if (this.particleSystem) {
      this.particleSystem.stop();
      this.particleSystem.dispose();
      this.particleSystem = null;
    }

    this.currentEffect = "clear";
  }

  setWeather(type, intensity = 1) {
    if (this.disposed || !this.scene) return false;

    const supported = ["clear", "cloudy", "rain", "storm", "snow", "fog"];

    if (!supported.includes(type)) return false;

    this.clear();

    if (type === "clear" || type === "cloudy" || type === "fog") {
      return true;
    }

    const B = this.BABYLON;

    if (!B?.ParticleSystem || !this.texture) return false;

    const strength = Math.max(0, Math.min(1, intensity));
    const system = new B.ParticleSystem(
      "weather-particles",
      Math.max(20, Math.floor(this.maxParticles * strength)),
      this.scene
    );

    system.particleTexture = this.texture;
    system.emitter = new B.Vector3(0, 12, 0);

    system.minEmitBox = new B.Vector3(-18, 0, -18);
    system.maxEmitBox = new B.Vector3(18, 0, 18);

    system.minSize = type === "snow" ? 0.08 : 0.025;
    system.maxSize = type === "snow" ? 0.18 : 0.06;

    system.minLifeTime = type === "snow" ? 3 : 1.2;
    system.maxLifeTime = type === "snow" ? 6 : 2.5;

    system.emitRate = type === "storm" ? 220 : 120;

    if (type === "snow") {
      system.color1 = new B.Color4(0.9, 0.95, 1, 0.9);
      system.color2 = new B.Color4(1, 1, 1, 0.8);
      system.minEmitPower = 0.3;
      system.maxEmitPower = 0.8;
      system.gravity = new B.Vector3(0, -1.2, 0);
      system.direction1 = new B.Vector3(-0.3, -1, -0.3);
      system.direction2 = new B.Vector3(0.3, -1, 0.3);
    } else {
      system.color1 = new B.Color4(0.65, 0.8, 1, 0.65);
      system.color2 = new B.Color4(0.8, 0.9, 1, 0.5);
      system.minEmitPower = type === "storm" ? 9 : 6;
      system.maxEmitPower = type === "storm" ? 14 : 10;
      system.gravity = new B.Vector3(0, -9.81, 0);
      system.direction1 = new B.Vector3(-0.2, -1, 0);
      system.direction2 = new B.Vector3(0.2, -1, 0);
    }

    system.start();
    this.particleSystem = system;
    this.currentEffect = type;

    return true;
  }

  update(playerPosition = null) {
    if (this.disposed || !this.particleSystem) return;

    const position = playerPosition ?? this.target?.position;

    if (position && this.particleSystem.emitter) {
      this.particleSystem.emitter = new this.BABYLON.Vector3(
        position.x,
        position.y + 12,
        position.z
      );
    }
  }

  dispose() {
    if (this.disposed) return;

    this.clear();

    if (this.texture) {
      this.texture.dispose();
      this.texture = null;
    }

    this.scene = null;
    this.target = null;
    this.disposed = true;
  }
}
