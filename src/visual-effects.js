export class VisualEffects {
  constructor(scene, BABYLON) {
    if (!scene || !BABYLON?.ParticleSystem) {
      throw new Error("Scene atau Babylon.js tidak tersedia.");
    }

    this.scene = scene;
    this.BABYLON = BABYLON;
    this.effects = new Set();
  }

  createEffect(position, options = {}) {
    const BABYLON = this.BABYLON;

    const particle = new BABYLON.ParticleSystem(
      options.name ?? "world-effect",
      options.capacity ?? 100,
      this.scene
    );

    const emitter = new BABYLON.TransformNode(
      "effect-emitter",
      this.scene
    );

    emitter.position.copyFrom(position);

    particle.emitter = emitter;

    particle.minEmitBox = new BABYLON.Vector3(-0.3, 0, -0.3);
    particle.maxEmitBox = new BABYLON.Vector3(0.3, 0.5, 0.3);

    particle.color1 = new BABYLON.Color4(1, 0.7, 0.2, 1);
    particle.color2 = new BABYLON.Color4(1, 0.2, 0.1, 1);
    particle.colorDead = new BABYLON.Color4(0.2, 0.1, 0.1, 0);

    particle.minSize = options.minSize ?? 0.1;
    particle.maxSize = options.maxSize ?? 0.4;

    particle.minLifeTime = options.minLifeTime ?? 0.3;
    particle.maxLifeTime = options.maxLifeTime ?? 1;

    particle.emitRate = options.emitRate ?? 100;

    particle.direction1 = new BABYLON.Vector3(-1, 1, -1);
    particle.direction2 = new BABYLON.Vector3(1, 3, 1);

    particle.minEmitPower = 1;
    particle.maxEmitPower = 3;

    particle.gravity = new BABYLON.Vector3(0, -2, 0);

    if (options.texture) {
      particle.particleTexture = new BABYLON.Texture(
        options.texture,
        this.scene
      );
    }

    particle.start();

    this.effects.add({ particle, emitter });

    return particle;
  }

  createMagicEffect(position, texture) {
    return this.createEffect(position, {
      name: "magic-effect",
      texture,
      emitRate: 150,
      minSize: 0.15,
      maxSize: 0.5,
      minLifeTime: 0.5,
      maxLifeTime: 1.5
    });
  }

  createHitEffect(position, texture) {
    return this.createEffect(position, {
      name: "hit-effect",
      texture,
      emitRate: 80,
      minSize: 0.1,
      maxSize: 0.3,
      minLifeTime: 0.2,
      maxLifeTime: 0.6
    });
  }

  stopEffect(particle) {
    for (const effect of this.effects) {
      if (effect.particle === particle) {
        effect.particle.stop();
        effect.particle.dispose();
        effect.emitter.dispose();
        this.effects.delete(effect);
        return true;
      }
    }

    return false;
  }

  stopAll() {
    for (const effect of this.effects) {
      effect.particle.stop();
      effect.particle.dispose();
      effect.emitter.dispose();
    }

    this.effects.clear();
  }

  dispose() {
    this.stopAll();
    this.scene = null;
    this.BABYLON = null;
  }
}
