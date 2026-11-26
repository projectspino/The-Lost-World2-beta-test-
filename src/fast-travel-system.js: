
const FAST_TRAVEL_SAVE_KEY = "the-lost-world-fast-travel";

export class FastTravelSystem {
  constructor(player, onTravel = null) {
    this.player = player;
    this.onTravel = onTravel;
    this.locations = new Map();
    this.unlocked = new Set();
    this.currentLocation = null;
  }

  registerLocation(id, name, position) {
    if (
      typeof id !== "string" ||
      !id.trim() ||
      typeof name !== "string" ||
      !position ||
      !Number.isFinite(Number(position.x)) ||
      !Number.isFinite(Number(position.y)) ||
      !Number.isFinite(Number(position.z))
    ) {
      return false;
    }

    this.locations.set(id, {
      id,
      name,
      position: {
        x: Number(position.x),
        y: Number(position.y),
        z: Number(position.z)
      }
    });

    return true;
  }

  unlockLocation(id) {
    if (!this.locations.has(id)) return false;

    const alreadyUnlocked = this.unlocked.has(id);
    this.unlocked.add(id);
    this.save();

    return !alreadyUnlocked;
  }

  isUnlocked(id) {
    return this.unlocked.has(id);
  }

  getLocations() {
    return [...this.locations.values()].map(location => ({
      ...location,
      position: { ...location.position },
      unlocked: this.unlocked.has(location.id)
    }));
  }

  getUnlockedLocations() {
    return this.getLocations().filter(location => location.unlocked);
  }

  travelTo(id) {
    const location = this.locations.get(id);

    if (!location || !this.unlocked.has(id) || !this.player) {
      return false;
    }

    if (
      !this.player.position ||
      typeof this.player.position.copyFromFloats !== "function"
    ) {
      return false;
    }

    this.player.position.copyFromFloats(
      location.position.x,
      location.position.y,
      location.position.z
    );

    this.currentLocation = id;

    if (typeof this.onTravel === "function") {
      this.onTravel({
        id: location.id,
        name: location.name,
        position: { ...location.position }
      });
    }

    return true;
  }

  save() {
    try {
      localStorage.setItem(
        FAST_TRAVEL_SAVE_KEY,
        JSON.stringify({
          version: 1,
          unlocked: [...this.unlocked],
          currentLocation: this.currentLocation
        })
      );

      return true;
    } catch (error) {
      console.error("Gagal menyimpan fast travel:", error);
      return false;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(FAST_TRAVEL_SAVE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw);

      if (
        !data ||
        data.version !== 1 ||
        !Array.isArray(data.unlocked)
      ) {
        return false;
      }

      this.unlocked.clear();

      for (const id of data.unlocked) {
        if (
          typeof id === "string" &&
          this.locations.has(id)
        ) {
          this.unlocked.add(id);
        }
      }

      this.currentLocation =
        typeof data.currentLocation === "string" &&
        this.unlocked.has(data.currentLocation)
          ? data.currentLocation
          : null;

      return true;
    } catch (error) {
      console.error("Gagal memuat fast travel:", error);
      return false;
    }
  }

  reset() {
    this.unlocked.clear();
    this.currentLocation = null;

    try {
      localStorage.removeItem(FAST_TRAVEL_SAVE_KEY);
      return true;
    } catch (error) {
      console.error("Gagal mereset fast travel:", error);
      return false;
    }
  }
}
