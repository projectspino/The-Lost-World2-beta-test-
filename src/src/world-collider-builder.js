
export class WorldColliderBuilder {
  constructor() {
    this.colliders = new Set();
  }

  add(mesh) {
    if (!mesh || mesh.isDisposed()) return false;

    mesh.computeWorldMatrix(true);
    this.colliders.add(mesh);

    return true;
  }

  addMany(meshes) {
    let added = 0;

    for (const mesh of meshes) {
      if (this.add(mesh)) added++;
    }

    return added;
  }

  addByName(scene, names) {
    let added = 0;

    for (const name of names) {
      const mesh = scene.getMeshByName(name);

      if (this.add(mesh)) added++;
    }

    return added;
  }

  remove(mesh) {
    return this.colliders.delete(mesh);
  }

  getAll() {
    return [...this.colliders].filter(
      mesh => mesh && !mesh.isDisposed()
    );
  }

  clear() {
    this.colliders.clear();
  }

  dispose() {
    this.clear();
  }
}
