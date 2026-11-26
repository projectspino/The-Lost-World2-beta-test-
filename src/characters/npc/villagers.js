
import { createNPC } from "./npc-factory.js";

export function createVillager(scene, options = {}) {
  return createNPC(scene, "villager", options);
}
