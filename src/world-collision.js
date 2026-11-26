
import * as BABYLON from "@babylonjs/core";

export class WorldCollisionSystem {
  constructor(scene, player, options = {}) {
    this.scene = scene;
    this.player = player;

    this.radius = options.radius ?? 0.8;
    this.height = options.height ?? 2;
    this.margin = options.margin ?? 0.05;

    this.colliders = new Set();

    this.worldBounds = {
      minX: options.minX ?? -205,
      maxX: options.maxX ?? 205,
      minZ: options.minZ ?? -205,
      maxZ: options.maxZ ?? 205
    };

    this.enabled = true;
  }

  // Daftarkan objek sebagai penghalang
  addCollider(mesh) {
    if (!mesh || mesh === this.player) return;

    mesh.computeWorldMatrix(true);
    this.colliders.add(mesh);

    return mesh;
  }

  // Daftarkan banyak objek sekaligus
  addColliders(meshes) {
    for (const mesh of meshes) {
      this.addCollider(mesh);
    }
  }

  // Hapus objek dari daftar penghalang
  removeCollider(mesh) {
    this.colliders.delete(mesh);
  }

  // Bersihkan semua penghalang
  clearColliders() {
    this.colliders.clear();
  }

  // Periksa tabrakan horizontal
  checkCollision(position) {
    if (!this.enabled) return false;

    const playerBottom = position.y;
    const playerTop = position.y + this.height;

    for (const mesh of this.colliders) {
      if (!mesh || mesh.isDisposed()) continue;
      if (!mesh.isEnabled()) continue;

      mesh.computeWorldMatrix(true);

      const bounds = mesh.getBoundingInfo().boundingBox;

      const min = bounds.minimumWorld;
      const max = bounds.maximumWorld;

      // Periksa apakah ketinggian objek bertabrakan
      if (
        playerTop < min.y ||
        playerBottom > max.y
      ) {
        continue;
      }

      const closestX = BABYLON.Scalar.Clamp(
        position.x,
        min.x,
        max.x
      );

      const closestZ = BABYLON.Scalar.Clamp(
        position.z,
        min.z,
        max.z
      );

      const dx = position.x - closestX;
      const dz = position.z - closestZ;

      const distanceSquared = dx * dx + dz * dz;
      const collisionRadius = this.radius + this.margin;

      if (
        distanceSquared <
        collisionRadius * collisionRadius
      ) {
        return true;
      }
    }

    return false;
  }

  // Periksa batas dunia
  isInsideWorld(position) {
    const bounds = this.worldBounds;

    return (
      position.x >= bounds.minX &&
      position.x <= bounds.maxX &&
      position.z >= bounds.minZ &&
      position.z <= bounds.maxZ
    );
  }

  // Hitung posisi gerak yang aman
  resolveMovement(displacement) {
    if (!this.enabled || !this.player) {
      return this.player?.position.clone();
    }

    const current = this.player.position.clone();

    const target = current.add(displacement);

    // Periksa gerakan penuh
    if (
      this.isInsideWorld(target) &&
      !this.checkCollision(target)
    ) {
      return target;
    }

    // Jika terhalang, coba gerak sumbu X
    const moveX = current.clone();
    moveX.x = target.x;

    if (
      this.isInsideWorld(moveX) &&
      !this.checkCollision(moveX)
    ) {
      current.x = moveX.x;
    }

    // Coba gerak sumbu Z
    const moveZ = current.clone();
    moveZ.z = target.z;

    if (
      this.isInsideWorld(moveZ) &&
      !this.checkCollision(moveZ)
    ) {
      current.z = moveZ.z;
    }

    return current;
  }

  // Terapkan gerakan yang sudah diperiksa
  movePlayer(displacement) {
    if (!this.player) return false;

    const safePosition = this.resolveMovement(displacement);

    if (!safePosition) return false;

    this.player.position.copyFrom(safePosition);

    return true;
  }

  setEnabled(value) {
    this.enabled = Boolean(value);
  }

  dispose() {
    this.clearColliders();
    this.player = null;
    this.scene = null;
  }
    }
