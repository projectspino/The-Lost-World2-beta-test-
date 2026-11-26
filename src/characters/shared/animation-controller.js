
import { Vector3 } from "@babylonjs/core";

export function createAnimationController(scene, root) {
  let state = "idle";
  let elapsed = 0;
  let baseY = root.position.y;
  let enabled = true;

  const observer = scene.onBeforeRenderObservable.add(() => {
    if (!enabled || root.isDisposed()) return;

    const delta = scene.getEngine().getDeltaTime() / 1000;
    elapsed += delta;

    let amplitude = 0;
    let speed = 1;

    if (state === "walk") {
      amplitude = 0.045;
      speed = 8;
    } else if (state === "run") {
      amplitude = 0.09;
      speed = 13;
    } else if (state === "idle") {
      amplitude = 0.015;
      speed = 2;
    }

    root.position.y = baseY + Math.sin(elapsed * speed) * amplitude;
  });

  return {
    play(animation) {
      state = animation;
    },

    setEnabled(value) {
      enabled = value;
      if (!enabled) root.position.y = baseY;
    },

    setBaseY(value) {
      baseY = value;
      root.position.y = value;
    },

    dispose() {
      scene.onBeforeRenderObservable.remove(observer);
      root.position.y = baseY;
    },
  };
}
