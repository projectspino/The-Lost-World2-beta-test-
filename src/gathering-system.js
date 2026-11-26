
export class GatheringSystem {
  constructor(inventory, options = {}) {
    if (!inventory || typeof inventory.addItem !== "function") {
      throw new Error("GatheringSystem membutuhkan inventory yang valid.");
    }

    this.inventory = inventory;
    this.nodes = new Map();
    this.cooldowns = new Map();
    this.defaultDistance = options.defaultDistance ?? 4;
    this.onGather = options.onGather ?? null;
  }

  registerNode(data) {
    if (
      !data ||
      typeof data.id !== "string" ||
      !data.id.trim() ||
      typeof data.name !== "string" ||
      typeof data.resource !== "string" ||
      !data.position ||
      ![data.position.x, data.position.y, data.position.z]
        .every(Number.isFinite)
    ) {
      return false;
    }

    const amount = data.amount ?? 1;
    const respawnSeconds = data.respawnSeconds ?? 90;

    if (
      !Number.isInteger(amount) ||
      amount <= 0 ||
      !Number.isFinite(respawnSeconds) ||
      respawnSeconds < 0
    ) {
      return false;
    }

    this.nodes.set(data.id, {
      id: data.id,
      name: data.name,
      resource: data.resource,
      position: { ...data.position },
      amount,
      respawnSeconds,
      available: true
    });

    this.cooldowns.delete(data.id);
    return true;
  }

  registerNodes(nodes = []) {
    let registered = 0;

    for (const node of nodes) {
      if (this.registerNode(node)) registered++;
    }

    return registered;
  }

  getNode(id) {
    const node = this.nodes.get(id);
    return node ? {
      ...node,
      position: { ...node.position }
    } : null;
  }

  getAvailableNodes() {
    return [...this.nodes.values()]
      .filter(node => node.available)
      .map(node => ({
        ...node,
        position: { ...node.position }
      }));
  }

  gather(id, playerPosition, maxDistance = this.defaultDistance) {
    const node = this.nodes.get(id);

    if (!node || !node.available) {
      return { success: false, reason: "unavailable" };
    }

    if (
      !playerPosition ||
      ![playerPosition.x, playerPosition.y, playerPosition.z]
        .every(Number.isFinite) ||
      !Number.isFinite(maxDistance) ||
      maxDistance < 0
    ) {
      return { success: false, reason: "invalid_position" };
    }

    const dx = playerPosition.x - node.position.x;
    const dy = playerPosition.y - node.position.y;
    const dz = playerPosition.z - node.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance > maxDistance) {
      return { success: false, reason: "too_far", distance };
    }

    const added = this.inventory.addItem(
      node.resource,
      node.amount,
      "Material"
    );

    if (!added) {
      return { success: false, reason: "inventory_full" };
    }

    node.available = false;

    const readyAt = Date.now() + node.respawnSeconds * 1000;
    this.cooldowns.set(id, readyAt);

    const result = {
      success: true,
      nodeId: id,
      resource: node.resource,
      amount: node.amount,
      respawnAt: readyAt
    };

    if (typeof this.onGather === "function") {
      this.onGather({ ...result });
    }

    return result;
  }

  update(now = Date.now()) {
    if (!Number.isFinite(now)) return 0;

    let respawned = 0;

    for (const [id, readyAt] of this.cooldowns) {
      if (now < readyAt) continue;

      const node = this.nodes.get(id);

      if (node) {
        node.available = true;
        respawned++;
      }

      this.cooldowns.delete(id);
    }

    return respawned;
  }

  getRemainingRespawn(id, now = Date.now()) {
    const readyAt = this.cooldowns.get(id);

    if (readyAt === undefined) return 0;

    return Math.max(0, Math.ceil((readyAt - now) / 1000));
  }

  resetNode(id) {
    const node = this.nodes.get(id);
    if (!node) return false;

    node.available = true;
    this.cooldowns.delete(id);
    return true;
  }

  resetAll() {
    for (const node of this.nodes.values()) {
      node.available = true;
    }

    this.cooldowns.clear();
  }
    }
