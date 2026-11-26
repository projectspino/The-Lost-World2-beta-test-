export class WorldInteraction {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.maxDistance = options.maxDistance ?? 5;
    this.interactions = new Map();
  }

  register(mesh, callback, options = {}) {
    if (!mesh || typeof callback !== "function") {
      return false;
    }

    this.interactions.set(mesh, {
      callback,
      label: options.label ?? "Interaksi",
      maxDistance: options.maxDistance ?? this.maxDistance
    });

    return true;
  }

  unregister(mesh) {
    return this.interactions.delete(mesh);
  }

  findNearest(position) {
    let nearest = null;
    let nearestDistance = Infinity;

    for (const [mesh, data] of this.interactions) {
      if (!mesh || mesh.isDisposed()) continue;

      const distance = Math.sqrt(
        (mesh.position.x - position.x) ** 2 +
        (mesh.position.y - position.y) ** 2 +
        (mesh.position.z - position.z) ** 2
      );

      if (
        distance <= data.maxDistance &&
        distance < nearestDistance
      ) {
        nearest = { mesh, ...data, distance };
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  interact(position) {
    const target = this.findNearest(position);

    if (!target) {
      return false;
    }

    target.callback(target.mesh);
    return true;
  }

  getAvailableInteraction(position) {
    const target = this.findNearest(position);

    if (!target) return null;

    return {
      label: target.label,
      distance: target.distance,
      mesh: target.mesh
    };
  }

  clear() {
    this.interactions.clear();
  }

  dispose() {
    this.clear();
    this.scene = null;
  }
}
