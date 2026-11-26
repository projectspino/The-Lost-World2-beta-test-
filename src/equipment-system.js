
const EQUIPMENT_SAVE_KEY = "the-lost-world-equipment";

const equipmentCatalog = [
  {
    id: "iron_sword",
    name: "Iron Sword",
    slot: "weapon",
    attack: 15,
    defense: 0,
    price: 100
  },
  {
    id: "wooden_bow",
    name: "Wooden Bow",
    slot: "weapon",
    attack: 12,
    defense: 0,
    price: 90
  },
  {
    id: "apprentice_staff",
    name: "Apprentice Staff",
    slot: "weapon",
    attack: 18,
    defense: 0,
    price: 120
  },
  {
    id: "leather_armor",
    name: "Leather Armor",
    slot: "armor",
    attack: 0,
    defense: 8,
    price: 100
  },
  {
    id: "iron_armor",
    name: "Iron Armor",
    slot: "armor",
    attack: 0,
    defense: 18,
    price: 180
  },
  {
    id: "bronze_ring",
    name: "Bronze Ring",
    slot: "accessory",
    attack: 5,
    defense: 5,
    price: 150
  }
];

export function createEquipmentSystem(inventory) {
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
      weapon: equipmentSlots.weapon
        ? { ...equipmentSlots.weapon }
        : null,
      armor: equipmentSlots.armor
        ? { ...equipmentSlots.armor }
        : null,
      accessory: equipmentSlots.accessory
        ? { ...equipmentSlots.accessory }
        : null
    };
  }

  // =====================================
  // SAVE EQUIPMENT
  // =====================================

  function saveEquipment() {
    try {
      const saveData = {
        version: 1,
        equipment: getEquipment()
      };

      localStorage.setItem(
        EQUIPMENT_SAVE_KEY,
        JSON.stringify(saveData)
      );

      console.log("Equipment berhasil disimpan!");
      return true;
    } catch (error) {
      console.error("Gagal menyimpan equipment:", error);
      return false;
    }
  }

  // =====================================
  // LOAD EQUIPMENT
  // =====================================

  function loadEquipment() {
    try {
      const rawData = localStorage.getItem(
        EQUIPMENT_SAVE_KEY
      );

      if (!rawData) {
        return false;
      }

      const saveData = JSON.parse(rawData);

      if (
        !saveData ||
        saveData.version !== 1 ||
        !saveData.equipment
      ) {
        return false;
      }

      const loadedSlots = {
        weapon: null,
        armor: null,
        accessory: null
      };

      for (const slot of Object.keys(loadedSlots)) {
        const savedItem = saveData.equipment[slot];

        if (savedItem === null || savedItem === undefined) {
          continue;
        }

        const catalogItem = equipmentCatalog.find(
          item =>
            item.id === savedItem.id &&
            item.slot === slot
        );

        if (!catalogItem) {
          continue;
        }

        loadedSlots[slot] = { ...catalogItem };
      }

      equipmentSlots.weapon = loadedSlots.weapon;
      equipmentSlots.armor = loadedSlots.armor;
      equipmentSlots.accessory = loadedSlots.accessory;

      console.log("Equipment berhasil dimuat!");
      return true;
    } catch (error) {
      console.error("Gagal memuat equipment:", error);
      return false;
    }
  }

  // =====================================
  // DELETE EQUIPMENT SAVE
  // =====================================

  function deleteEquipmentSave() {
    try {
      localStorage.removeItem(EQUIPMENT_SAVE_KEY);

      equipmentSlots.weapon = null;
      equipmentSlots.armor = null;
      equipmentSlots.accessory = null;

      return true;
    } catch (error) {
      console.error("Gagal menghapus save equipment:", error);
      return false;
    }
  }

  // =====================================
  // EQUIP ITEM
  // =====================================

  function equip(itemId) {
    const item = equipmentCatalog.find(
      entry => entry.id === itemId
    );

    if (!item) {
      return {
        success: false,
        message: "Perlengkapan tidak ditemukan."
      };
    }

    const ownedItem = inventory.getItems().find(
      entry => entry.name === item.name && entry.quantity > 0
    );

    if (!ownedItem) {
      return {
        success: false,
        message: "Kamu belum memiliki barang ini."
      };
    }

    const previousItem = equipmentSlots[item.slot];

    if (!inventory.removeItem(item.name, 1)) {
      return {
        success: false,
        message: "Gagal memakai perlengkapan."
      };
    }

    if (previousItem) {
      const returned = inventory.addItem(
        previousItem.name,
        1,
        "Equipment"
      );

      if (!returned) {
        inventory.addItem(item.name, 1, "Equipment");

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

  // =====================================
  // UNEQUIP ITEM
  // =====================================

  function unequip(slot) {
    if (
      !Object.prototype.hasOwnProperty.call(
        equipmentSlots,
        slot
      )
    ) {
      return {
        success: false,
        message: "Slot tidak valid."
      };
    }

    const item = equipmentSlots[slot];

    if (!item) {
      return {
        success: false,
        message: "Slot masih kosong."
      };
    }

    if (!inventory.addItem(item.name, 1, "Equipment")) {
      return {
        success: false,
        message: "Inventori penuh."
      };
    }

    equipmentSlots[slot] = null;

    saveEquipment();

    return {
      success: true,
      message: item.name + " berhasil dilepas."
    };
  }

  // =====================================
  // EQUIPMENT BONUS
  // =====================================

  function getBonuses() {
    let attack = 0;
    let defense = 0;

    for (const item of Object.values(equipmentSlots)) {
      if (!item) continue;

      attack += item.attack;
      defense += item.defense;
    }

    return {
      attack,
      defense
    };
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
