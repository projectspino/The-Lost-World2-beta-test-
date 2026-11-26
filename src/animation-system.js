export class AnimationSystem {
  constructor(scene, BABYLON) {
    if (!scene || !BABYLON?.Animation) {
      throw new Error("Scene atau Babylon.js tidak tersedia.");
    }

    this.scene = scene;
    this.BABYLON = BABYLON;
    this.activeAnimations = new Map();
  }

  animatePosition(mesh, target, options = {}) {
    return this.animateVector(
      mesh,
      "position",
      target,
      options
    );
  }

  animateScale(mesh, target, options = {}) {
    return this.animateVector(
      mesh,
      "scaling",
      target,
      options
    );
  }

  animateRotation(mesh, target, options = {}) {
    return this.animateVector(
      mesh,
      "rotation",
      target,
      options
    );
  }

  animateVector(mesh, property, target, options = {}) {
    if (!mesh || mesh.isDisposed()) return false;

    const BABYLON = this.BABYLON;
    const fps = options.fps ?? 30;
    const duration = options.duration ?? 1;
    const frames = Math.max(1, Math.round(fps * duration));

    const animation = new BABYLON.Animation(
      `animation_${property}`,
      property,
      fps,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      options.loop
        ? BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        : BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    animation.setKeys([
      {
        frame: 0,
        value: mesh[property].clone()
      },
      {
        frame: frames,
        value: new BABYLON.Vector3(
          target.x,
          target.y,
          target.z
        )
      }
    ]);

    const key = `${mesh.uniqueId}_${property}`;

    this.stop(mesh, property);

    const animationGroup = this.scene.beginDirectAnimation(
      mesh,
      [animation],
      0,
      frames,
      options.loop ?? false
    );

    this.activeAnimations.set(key, animationGroup);

    animationGroup.onAnimationEndObservable.addOnce(() => {
      this.activeAnimations.delete(key);
    });

    return animationGroup;
  }

  stop(mesh, property) {
    if (!mesh) return false;

    const key = `${mesh.uniqueId}_${property}`;
    const animationGroup = this.activeAnimations.get(key);

    if (!animationGroup) return false;

    animationGroup.stop();
    this.activeAnimations.delete(key);

    return true;
  }

  stopAll() {
    for (const animation of this.activeAnimations.values()) {
      animation.stop();
    }

    this.activeAnimations.clear();
  }

  dispose() {
    this.stopAll();
    this.scene = null;
    this.BABYLON = null;
  }
  }
