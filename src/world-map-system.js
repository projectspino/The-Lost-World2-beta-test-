
export class WorldMapSystem {
  constructor(options = {}) {
    this.storageKey = options.storageKey ?? "lost_world_discovered_locations";
    this.locations = new Map();
    this.discovered = new Set();
    this.onDiscover = options.onDiscover ?? null;

    this.load();
  }

  registerLocation(id, data = {}) {
    if (typeof id !== "string" || !id.trim()) return false;

    this.locations.set(id, {
      id,
      name: data.name ?? id,
      region: data.region ?? "Unknown",
      description: data.description ?? "",
      position: {
        x: Number(data.x ?? 0),
        y: Number(data.y ?? 0),
        z: Number(data.z ?? 0)
      }
    });

    return true;
  }

  registerLocations(entries = []) {
    let count = 0;

    for (const entry of entries) {
      if (entry && this.registerLocation(entry.id, entry)) count++;
    }

    return count;
  }

  discover(id) {
    const location = this.locations.get(id);

    if (!location || this.discovered.has(id)) return false;

    this.discovered.add(id);
    this.save();

    if (typeof this.onDiscover === "function") {
      this.onDiscover({ ...location });
    }

    return true;
  }

  isDiscovered(id) {
    return this.discovered.has(id);
  }

  getLocation(id) {
    const location = this.locations.get(id);
    return location ? { ...location } : null;
  }

  getAllLocations() {
    return [...this.locations.values()].map(location => ({
      ...location,
      discovered: this.discovered.has(location.id)
    }));
  }

  getDiscoveredLocations() {
    return this.getAllLocations().filter(location => location.discovered);
  }

  getProgress() {
    const total = this.locations.size;
    const discovered = this.discovered.size;

    return {
      total,
      discovered,
      remaining: Math.max(0, total - discovered),
      percentage: total === 0 ? 0 : Math.round(discovered / total * 100)
    };
  }

  save() {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify([...this.discovered])
      );
      return true;
    } catch {
      return false;
    }
  }

  load() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(this.storageKey) ?? "[]"
      );

      if (Array.isArray(saved)) {
        this.discovered = new Set(
          saved.filter(id => typeof id === "string")
        );
      }
    } catch {
      this.discovered.clear();
    }

    return this.discovered.size;
  }

  reset() {
    this.discovered.clear();

    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Penyimpanan mungkin tidak tersedia.
    }
  }

  dispose() {
    this.locations.clear();
    this.discovered.clear();
    this.onDiscover = null;
  }
}
