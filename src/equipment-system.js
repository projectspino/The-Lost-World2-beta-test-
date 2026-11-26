
const EQUIPMENT_SAVE_KEY = "the-lost-world-equipment";

const equipmentCatalog = [
  { id: "wooden_sword", name: "Wooden Sword", slot: "weapon", attack: 7, defense: 0, price: 0 },
  { id: "wooden_shield", name: "Wooden Shield", slot: "armor", attack: 0, defense: 5, price: 0 },
  { id: "iron_sword", name: "Iron Sword", slot: "weapon", attack: 15, defense: 0, price: 100 },
  { id: "wooden_bow", name: "Wooden Bow", slot: "weapon", attack: 12, defense: 0, price: 90 },
  { id: "apprentice_staff", name: "Apprentice Staff", slot: "weapon", attack: 18, defense: 0, price: 120 },
  { id: "leather_armor", name: "Leather Armor", slot: "armor", attack: 0, defense: 8, price: 100 },
  { id: "iron_armor", name: "Iron Armor", slot: "armor", attack: 0, defense: 18, price: 180 },
  { id: "bronze_ring", name: "Bronze Ring", slot: "accessory", attack: 5, defense: 5, price: 150 }
];

export function createEquipmentSystem(inventory) {
  if (
    !inventory ||
    typeof inventory.getItems !== "function" ||
    typeof inventory.addItem !== "function" ||
    typeof inventory.removeItem !== "function"
  ) {
    throw new Error("Inventory tidak valid.");
  }

  const equipmentSlots = {
    weapon: null,
    armor: null,
    accessory: null
  };

  function getCatalog() {
    return equipmentCatalog.map(item => ({ ...item }));
  }

  function getEquipment() {
    return {
      weapon: equipmentSlots.weapon ? { ...equipmentSlots.weapon } : null,
      armor: equipmentSlots.armor ? { ...equipmentSlots.armor } : null,
      accessory: equipmentSlots.accessory ? { ...equipmentSlots.accessory } : null
    };
  }

  function saveEquipment() {
    try {
      localStorage.setItem(
        EQUIPMENT_SAVE_KEY,
        JSON.stringify({
          version: 1,
          equipment: getEquipment()
        })
      );
      return true;
    } catch (error) {
      console.error("Gagal menyimpan equipment:", error);
      return false;
    }
  }

  function loadEquipment() {
    try {
      const raw = localStorage.getItem(EQUIPMENT_SAVE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw);

      if (!data || data.version !== 1 || !data.equipment) {
        return false;
      }

      const loaded = {
        weapon: null,
        armor: null,
        accessory: null
      };

      for (const slot of Object.keys(loaded)) {
        const saved = data.equipment[slot];
        if (!saved) continue;

        const item = equipmentCatalog.find(
          entry => entry.id === saved.id && entry.slot === slot
        );

        if (item) loaded[slot] = { ...item };
      }

      for (const slot of Object.keys(loaded)) {
        equipmentSlots[slot] = loaded[slot];
      }

      return true;
    } catch (error) {
      console.error("Gagal memuat equipment:", error);
      return false;
    }
  }

  function equip(itemId) {
    const item = equipmentCatalog.find(entry => entry.id === itemId);

    if (!item) {
      return { success: false, message: "Perlengkapan tidak ditemukan." };
    }

    const owned = inventory.getItems().find(
      entry => entry.name === item.name && entry.quantity > 0
    );

    if (!owned) {
      return { success: false, message: "Kamu belum memiliki barang ini." };
    }

    const previous = equipmentSlots[item.slot];

    if (!inventory.removeItem(item.name, 1, owned.type)) {
      return { success: false, message: "Gagal memakai perlengkapan." };
    }

    if (previous) {
      if (!inventory.addItem(previous.name, 1, "Equipment")) {
        inventory.addItem(item.name, 1, owned.type);
        return {
          success: false,
          message: "Inventori penuh. Perlengkapan lama tidak berubah."
        };
      }
    }

    equipmentSlots[item.slot] = { ...item };
    saveEquipment();

    return {
      success: true,
      message: item.name + " berhasil dipakai."
    };
  }

  function unequip(slot) {
    if (!Object.prototype.hasOwnProperty.call(equipmentSlots, slot)) {
      return { success: false, message: "Slot tidak valid." };
    }

    const item = equipmentSlots[slot];

    if (!item) {
      return { success: false, message: "Slot masih kosong." };
    }

    if (!inventory.addItem(item.name, 1, "Equipment")) {
      return { success: false, message: "Inventori penuh." };
    }

    equipmentSlots[slot] = null;
    saveEquipment();

    return {
      success: true,
      message: item.name + " berhasil dilepas."
    };
  }

  function getBonuses() {
    let attack = 0;
    let defense = 0;

    for (const item of Object.values(equipmentSlots)) {
      if (!item) continue;
      attack += item.attack;
      defense += item.defense;
    }

    return { attack, defense };
  }

  function deleteEquipmentSave() {
    try {
      localStorage.removeItem(EQUIPMENT_SAVE_KEY);

      for (const slot of Object.keys(equipmentSlots)) {
        equipmentSlots[slot] = null;
      }

      return true;
    } catch (error) {
      console.error("Gagal menghapus equipment:", error);
      return false;
    }
  }

  return {
    getCatalog,
    getEquipment,
    equip,
    unequip,
    getBonuses,
    saveEquipment,
    loadEquipment,
    deleteEquipmentSave
  };
}
