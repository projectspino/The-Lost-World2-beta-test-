
export function createShopSystem(playerStats, inventory) {
  if (
    !playerStats?.stats ||
    typeof playerStats.spendGold !== "function" ||
    typeof playerStats.addGold !== "function" ||
    !inventory ||
    typeof inventory.addItem !== "function" ||
    typeof inventory.removeItem !== "function" ||
    typeof inventory.getItems !== "function"
  ) {
    throw new Error("PlayerStats atau Inventory tidak valid.");
  }

  const catalog = [
    {
      id: "health_potion",
      name: "Health Potion",
      type: "Consumable",
      price: 25,
      sellPrice: 12,
      description: "Memulihkan HP pemain."
    },
    {
      id: "wood",
      name: "Wood",
      type: "Material",
      price: 10,
      sellPrice: 5,
      description: "Bahan untuk membuat perlengkapan."
    },
    {
      id: "goblin_token",
      name: "Goblin Token",
      type: "Quest",
      price: 15,
      sellPrice: 7,
      description: "Token yang ditemukan dari Goblin."
    },
    {
      id: "iron_sword",
      name: "Iron Sword",
      type: "Equipment",
      price: 100,
      sellPrice: 50,
      description: "Senjata dengan bonus attack."
    },
    {
      id: "wooden_bow",
      name: "Wooden Bow",
      type: "Equipment",
      price: 90,
      sellPrice: 45,
      description: "Busur untuk menyerang musuh."
    },
    {
      id: "apprentice_staff",
      name: "Apprentice Staff",
      type: "Equipment",
      price: 120,
      sellPrice: 60,
      description: "Tongkat sihir dengan bonus attack."
    },
    {
      id: "leather_armor",
      name: "Leather Armor",
      type: "Equipment",
      price: 100,
      sellPrice: 50,
      description: "Armor dengan bonus defense."
    },
    {
      id: "iron_armor",
      name: "Iron Armor",
      type: "Equipment",
      price: 180,
      sellPrice: 90,
      description: "Armor kuat dengan bonus defense."
    },
    {
      id: "bronze_ring",
      name: "Bronze Ring",
      type: "Equipment",
      price: 150,
      sellPrice: 75,
      description: "Cincin dengan bonus attack dan defense."
    }
  ];

  function getCatalog() {
    return catalog.map(item => ({ ...item }));
  }

  function buyItem(id, quantity = 1) {
    const item = catalog.find(entry => entry.id === id);

    if (!item) {
      return {
        success: false,
        message: "Barang tidak ditemukan."
      };
    }

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > 99
    ) {
      return {
        success: false,
        message: "Jumlah pembelian tidak valid."
      };
    }

    const totalPrice = item.price * quantity;
    const currentGold = Number(playerStats.stats.gold);

    if (
      !Number.isFinite(currentGold) ||
      currentGold < totalPrice
    ) {
      return {
        success: false,
        message: "Gold tidak cukup."
      };
    }

    if (!inventory.addItem(item.name, quantity, item.type)) {
      return {
        success: false,
        message: "Inventory penuh."
      };
    }

    if (!playerStats.spendGold(totalPrice)) {
      inventory.removeItem(item.name, quantity);

      return {
        success: false,
        message: "Pembayaran gagal."
      };
    }

    return {
      success: true,
      message: `Berhasil membeli ${quantity} ${item.name}.`,
      remainingGold: playerStats.stats.gold
    };
  }

  function sellItem(name, quantity = 1) {
    if (
      typeof name !== "string" ||
      !name.trim() ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > 99
    ) {
      return {
        success: false,
        message: "Data penjualan tidak valid."
      };
    }

    const item = catalog.find(entry => entry.name === name);

    if (!item || item.sellPrice <= 0) {
      return {
        success: false,
        message: "Barang ini tidak dapat dijual."
      };
    }

    const ownedItem = inventory.getItems().find(
      entry =>
        entry.name === name &&
        Number.isInteger(entry.quantity) &&
        entry.quantity >= quantity
    );

    if (!ownedItem) {
      return {
        success: false,
        message: "Jumlah barang tidak cukup."
      };
    }

    if (!inventory.removeItem(name, quantity)) {
      return {
        success: false,
        message: "Penjualan gagal."
      };
    }

    const earnedGold = item.sellPrice * quantity;

    if (!playerStats.addGold(earnedGold)) {
      inventory.addItem(name, quantity, ownedItem.type);

      return {
        success: false,
        message: "Gagal menerima Gold."
      };
    }

    return {
      success: true,
      message: `Berhasil menjual ${quantity} ${name}.`,
      earnedGold,
      remainingGold: playerStats.stats.gold
    };
  }

  return {
    getCatalog,
    buyItem,
    sellItem
  };
      }
