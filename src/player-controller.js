
import * as BABYLON from "@babylonjs/core";

export function createPlayerController(
  scene,
  camera,
  player,
  joystick,
  jumpButton,
  collisionSystem = null
) {
  let inputX = 0;
  let inputY = 0;
  let jumping = false;
  let verticalSpeed = 0;
  let activePointer = null;
  let disposed = false;

  const walkSpeed = 7;
  const jumpPower = 7;
  const gravity = 18;
  const worldLimit = 205;

  function updateJoystick(event) {
    const rect = joystick.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    inputX = BABYLON.Scalar.Clamp(
      (event.clientX - centerX) / 40,
      -1,
      1
    );

    inputY = BABYLON.Scalar.Clamp(
      (event.clientY - centerY) / 40,
      -1,
      1
    );
  }

  function handlePointerDown(event) {
    if (disposed) return;

    activePointer = event.pointerId;

    if (joystick.setPointerCapture) {
      joystick.setPointerCapture(activePointer);
    }

    updateJoystick(event);
    event.preventDefault();
  }

  function handlePointerMove(event) {
    if (event.pointerId !== activePointer) return;

    updateJoystick(event);
    event.preventDefault();
  }

  function handlePointerUp(event) {
    if (event.pointerId !== activePointer) return;

    activePointer = null;
    inputX = 0;
    inputY = 0;
  }

  function handleJump() {
    if (disposed || jumping) return;

    jumping = true;
    verticalSpeed = jumpPower;
  }

  joystick.addEventListener(
    "pointerdown",
    handlePointerDown
  );

  joystick.addEventListener(
    "pointermove",
    handlePointerMove
  );

  joystick.addEventListener(
    "pointerup",
    handlePointerUp
  );

  joystick.addEventListener(
    "pointercancel",
    handlePointerUp
  );

  jumpButton.addEventListener(
    "click",
    handleJump
  );

  const observer = scene.onBeforeRenderObservable.add(() => {
    if (disposed || !player || !camera) return;

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

    if (movement.lengthSquared() > 0.0001) {
      movement.normalize();

      const displacement = movement.scale(
        walkSpeed * delta
      );

      if (
        collisionSystem &&
        collisionSystem.enabled
      ) {
        // Gerakan diperiksa oleh sistem collision
        collisionSystem.movePlayer(displacement);
      } else {
        // Gerakan normal dengan batas dunia
        const nextPosition = player.position.add(
          displacement
        );

        nextPosition.x = BABYLON.Scalar.Clamp(
          nextPosition.x,
          -worldLimit,
          worldLimit
        );

        nextPosition.z = BABYLON.Scalar.Clamp(
          nextPosition.z,
          -worldLimit,
          worldLimit
        );

        player.position.copyFrom(nextPosition);
      }

      player.rotation.y = Math.atan2(
        movement.x,
        movement.z
      );
    }

    // Sistem lompat dan gravitasi
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
    if (disposed) return;

    disposed = true;

    scene.onBeforeRenderObservable.remove(observer);

    joystick.removeEventListener(
      "pointerdown",
      handlePointerDown
    );

    joystick.removeEventListener(
      "pointermove",
      handlePointerMove
    );

    joystick.removeEventListener(
      "pointerup",
      handlePointerUp
    );

    joystick.removeEventListener(
      "pointercancel",
      handlePointerUp
    );

    jumpButton.removeEventListener(
      "click",
      handleJump
    );

    inputX = 0;
    inputY = 0;
    activePointer = null;
  };
}
  
