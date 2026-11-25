
import * as BABYLON from "@babylonjs/core";

export function createPlayerController(
  scene,
  camera,
  player,
  joystick,
  jumpButton
) {
  let inputX = 0;
  let inputY = 0;
  let jumping = false;
  let verticalSpeed = 0;
  let activePointer = null;

  const walkSpeed = 5;
  const jumpPower = 7;
  const gravity = 18;

  function updateJoystick(event) {
    const rect = joystick.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    inputX = Math.max(
      -1,
      Math.min(1, (event.clientX - centerX) / 40)
    );

    inputY = Math.max(
      -1,
      Math.min(1, (event.clientY - centerY) / 40)
    );
  }

  joystick.addEventListener("pointerdown", event => {
    activePointer = event.pointerId;
    joystick.setPointerCapture(activePointer);
    updateJoystick(event);
    event.preventDefault();
  });

  joystick.addEventListener("pointermove", event => {
    if (event.pointerId !== activePointer) return;

    updateJoystick(event);
    event.preventDefault();
  });

  function stopJoystick(event) {
    if (event.pointerId !== activePointer) return;

    activePointer = null;
    inputX = 0;
    inputY = 0;
  }

  joystick.addEventListener("pointerup", stopJoystick);
  joystick.addEventListener("pointercancel", stopJoystick);

  jumpButton.addEventListener("click", () => {
    if (jumping) return;

    jumping = true;
    verticalSpeed = jumpPower;
  });

  const observer = scene.onBeforeRenderObservable.add(() => {
    const delta = Math.min(
      scene.getEngine().getDeltaTime() / 1000,
      0.05
    );

    const forward = new BABYLON.Vector3(
      -Math.sin(camera.alpha),
      0,
      -Math.cos(camera.alpha)
    );

    const right = new BABYLON.Vector3(
      Math.cos(camera.alpha),
      0,
      -Math.sin(camera.alpha)
    );

    const movement = forward.scale(-inputY).add(
      right.scale(inputX)
    );

    if (movement.length() > 0.01) {
      movement.normalize();

      player.position.addInPlace(
        movement.scale(walkSpeed * delta)
      );

      player.rotation.y = Math.atan2(
        movement.x,
        movement.z
      );
    }

    if (jumping) {
      verticalSpeed -= gravity * delta;
      player.position.y += verticalSpeed * delta;

      if (player.position.y <= 1) {
        player.position.y = 1;
        verticalSpeed = 0;
        jumping = false;
      }
    }
  });

  return function disposeController() {
    scene.onBeforeRenderObservable.remove(observer);
    joystick.replaceWith(joystick.cloneNode(true));
    jumpButton.replaceWith(jumpButton.cloneNode(true));
  };
}
