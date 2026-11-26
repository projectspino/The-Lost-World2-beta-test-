
export const WORLD_REGIONS = [
  {
    id: "greenwood",
    name: "Greenwood Forest",
    biome: "forest",
    bounds: { minX: 25, maxX: 190, minZ: -190, maxZ: 25 },
    description: "Hutan luas dengan pepohonan tua dan makhluk liar.",
    recommendedLevel: 1,
    enemies: ["Goblin", "Dire Wolf"],
    resources: ["Wood", "Herb", "Berry"]
  },
  {
    id: "forgotten_swamp",
    name: "Forgotten Swamp",
    biome: "swamp",
    bounds: { minX: -200, maxX: -35, minZ: -150, maxZ: 120 },
    description: "Rawa berkabut yang menyimpan tanaman langka.",
    recommendedLevel: 5,
    enemies: ["Goblin", "Skeleton"],
    resources: ["Herb", "Mushroom", "Swamp Root"]
  },
  {
    id: "frost_mountain",
    name: "Frost Mountain",
    biome: "mountain",
    bounds: { minX: -150, maxX: 150, minZ: -210, maxZ: -90 },
    description: "Pegunungan dingin dengan reruntuhan kuno.",
    recommendedLevel: 10,
    enemies: ["Skeleton", "Orc"],
    resources: ["Iron Ore", "Crystal"]
  },
  {
    id: "ancient_ruins",
    name: "Ancient Ruins",
    biome: "ruins",
    bounds: { minX: 35, maxX: 105, minZ: 5, maxZ: 85 },
    description: "Reruntuhan yang menjaga rahasia dunia lama.",
    recommendedLevel: 15,
    enemies: ["Skeleton", "Ancient Golem"],
    resources: ["Ancient Stone", "Crystal"]
  }
];

export const WORLD_LOCATIONS = [
  {
    id: "eldoria_village",
    name: "Eldoria Village",
    type: "town",
    position: { x: 0, y: 0, z: 0 },
    regionId: "greenwood",
    fastTravel: true
  },
  {
    id: "whispering_forest",
    name: "Whispering Forest",
    type: "landmark",
    position: { x: 90, y: 0, z: -100 },
    regionId: "greenwood",
    fastTravel: false
  },
  {
    id: "sunken_marsh",
    name: "Sunken Marsh",
    type: "landmark",
    position: { x: -110, y: 0, z: 35 },
    regionId: "forgotten_swamp",
    fastTravel: false
  },
  {
    id: "frost_peak",
    name: "Frost Peak",
    type: "landmark",
    position: { x: 0, y: 0, z: -160 },
    regionId: "frost_mountain",
    fastTravel: false
  },
  {
    id: "ancient_dungeon",
    name: "Ancient Dungeon",
    type: "dungeon",
    position: { x: 65, y: 0, z: 35 },
    regionId: "ancient_ruins",
    fastTravel: false
  }
];

export const ENEMY_ZONES = [
  {
    id: "goblin_camp",
    name: "Goblin Camp",
    regionId: "greenwood",
    center: { x: 65, y: 0, z: -55 },
    radius: 24,
    enemies: ["Goblin"],
    recommendedLevel: 2
  },
  {
    id: "wolf_trail",
    name: "Wolf Trail",
    regionId: "greenwood",
    center: { x: 135, y: 0, z: -115 },
    radius: 30,
    enemies: ["Dire Wolf"],
    recommendedLevel: 4
  },
  {
    id: "swamp_graveyard",
    name: "Swamp Graveyard",
    regionId: "forgotten_swamp",
    center: { x: -100, y: 0, z: 55 },
    radius: 28,
    enemies: ["Skeleton"],
    recommendedLevel: 7
  },
  {
    id: "orc_outpost",
    name: "Orc Outpost",
    regionId: "frost_mountain",
    center: { x: -70, y: 0, z: -145 },
    radius: 32,
    enemies: ["Orc"],
    recommendedLevel: 12
  },
  {
    id: "golem_sanctum",
    name: "Golem Sanctum",
    regionId: "ancient_ruins",
    center: { x: 65, y: 0, z: 55 },
    radius: 18,
    enemies: ["Ancient Golem"],
    recommendedLevel: 18
  }
];

export const GATHERING_NODES = [
  {
    id: "greenwood_trees",
    name: "Greenwood Trees",
    resource: "Wood",
    regionId: "greenwood",
    position: { x: 105, y: 0, z: -35 },
    respawnSeconds: 90
  },
  {
    id: "forest_herbs",
    name: "Forest Herbs",
    resource: "Herb",
    regionId: "greenwood",
    position: { x: 145, y: 0, z: -65 },
    respawnSeconds: 120
  },
  {
    id: "swamp_mushrooms",
    name: "Swamp Mushrooms",
    resource: "Mushroom",
    regionId: "forgotten_swamp",
    position: { x: -125, y: 0, z: 65 },
    respawnSeconds: 150
  },
  {
    id: "mountain_iron",
    name: "Iron Deposit",
    resource: "Iron Ore",
    regionId: "frost_mountain",
    position: { x: 45, y: 0, z: -175 },
    respawnSeconds: 180
  },
  {
    id: "ruins_crystal",
    name: "Ancient Crystal",
    resource: "Crystal",
    regionId: "ancient_ruins",
    position: { x: 90, y: 0, z: 65 },
    respawnSeconds: 240
  }
];

export function getRegionById(id) {
  return WORLD_REGIONS.find(region => region.id === id) || null;
}

export function getLocationById(id) {
  return WORLD_LOCATIONS.find(location => location.id === id) || null;
}

export function getEnemyZonesByRegion(regionId) {
  return ENEMY_ZONES.filter(zone => zone.regionId === regionId);
}

export function getGatheringNodesByRegion(regionId) {
  return GATHERING_NODES.filter(node => node.regionId === regionId);
}

export function getRegionAtPosition(x, z) {
  return WORLD_REGIONS.find(region =>
    x >= region.bounds.minX &&
    x <= region.bounds.maxX &&
    z >= region.bounds.minZ &&
    z <= region.bounds.maxZ
  ) || null;
               }
