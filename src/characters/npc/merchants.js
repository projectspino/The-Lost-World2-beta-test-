
import { createNPC } from "./npc-factory.js";

export function createMerchant(scene, options = {}) {
  return createNPC(scene, "merchant", options);
}
