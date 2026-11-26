export class GatheringInteraction {
  constructor(gatheringSystem, worldInteraction, options = {}) {
    if (!gatheringSystem || typeof gatheringSystem.gather !== "function") {
      throw new Error("GatheringInteraction membutuhkan GatheringSystem.");
    }

    if (!worldInteraction || typeof worldInteraction.register !== "function") {
      throw new Error("GatheringInteraction membutuhkan WorldInteraction.");
    }

    this.gatheringSystem = gatheringSystem;
    this.worldInteraction = worldInteraction;
    this.maxDistance = options.maxDistance ?? 4;
    this.onResult = options.onResult ?? null;
    this.registeredMeshes = new Map();
  }

  register(mesh, nodeId, label = "Ambil bahan") {
    if (!mesh || typeof nodeId !== "string" || !nodeId.trim()) return false;

    if (!this.gatheringSystem.getNode(nodeId)) return false;

    const registered = this.worldInteraction.register(
      mesh,
      () => this.gather(nodeId, mesh.position),
      { label, maxDistance: this.maxDistance }
    );

    if (registered) this.registeredMeshes.set(mesh, nodeId);
    return registered;
  }

  registerMany(entries = []) {
    let count = 0;
    for (const entry of entries) {
      if (entry && this.register(entry.mesh, entry.nodeId, entry.label)) count++;
    }
    return count;
  }

  gather(nodeId, playerPosition) {
    const result = this.gatheringSystem.gather(
      nodeId,
      playerPosition,
      this.maxDistance
    );

    if (typeof this.onResult === "function") this.onResult({ ...result });
    return result;
  }

  interact(playerPosition) {
    const target = this.worldInteraction.getAvailableInteraction(playerPosition);
    if (!target) return { success: false, reason: "no_target" };

    const nodeId = this.registeredMeshes.get(target.mesh);
    if (!nodeId) return { success: false, reason: "not_gatherable" };

    return this.gather(nodeId, playerPosition);
  }

  unregister(mesh) {
    this.registeredMeshes.delete(mesh);
    return this.worldInteraction.unregister(mesh);
  }

  clear() {
    for (const mesh of this.registeredMeshes.keys()) {
      this.worldInteraction.unregister(mesh);
    }
    this.registeredMeshes.clear();
  }

  dispose() {
    this.clear();
    this.gatheringSystem = null;
    this.worldInteraction = null;
    this.onResult = null;
  }
}
