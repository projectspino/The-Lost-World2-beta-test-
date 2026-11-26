
import { createNPC } from "./npc-factory.js";

export function createGuard(scene, options = {}) {
  return createNPC(scene, "guard", options);
}
