
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

    return {
      success: true,
      message: item.name + " berhasil dipakai."
    };
  }

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
    getBonuses
  };
}
