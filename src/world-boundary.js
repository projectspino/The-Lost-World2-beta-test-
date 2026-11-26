export class WorldBoundary {
  constructor(options = {}) {
    this.minX = options.minX ?? -205;
    this.maxX = options.maxX ?? 205;
    this.minZ = options.minZ ?? -205;
    this.maxZ = options.maxZ ?? 205;
  }

  clampPosition(position) {
    return {
      x: Math.max(this.minX, Math.min(this.maxX, position.x)),
      y: position.y,
      z: Math.max(this.minZ, Math.min(this.maxZ, position.z))
    };
  }

  isInside(position) {
    return (
      position.x >= this.minX &&
      position.x <= this.maxX &&
      position.z >= this.minZ &&
      position.z <= this.maxZ
    );
  }

  setBounds(minX, maxX, minZ, maxZ) {
    this.minX = minX;
    this.maxX = maxX;
    this.minZ = minZ;
    this.maxZ = maxZ;
  }
}
