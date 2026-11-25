
export function createShopSystem(playerStats, inventory) {
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
    }
  ];

  function getCatalog() {
    return catalog.map(item => ({ ...item }));
  }

  function buyItem(id, quantity = 1) {
    const item = catalog.find(entry => entry.id === id);

    if (!item) {
      return { success: false, message: "Barang tidak ditemukan." };
    }

    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      return { success: false, message: "Jumlah pembelian tidak valid." };
    }

    const totalPrice = item.price * quantity;

    if (playerStats.stats.gold < totalPrice) {
      return { success: false, message: "Gold tidak cukup." };
    }

    const added = inventory.addItem(
      item.name,
      quantity,
      item.type
    );

    if (!added) {
      return { success: false, message: "Inventory penuh." };
    }

    const paid = playerStats.spendGold(totalPrice);

    if (!paid) {
      inventory.removeItem(item.name, quantity);
      return { success: false, message: "Pembayaran gagal." };
    }

    return {
      success: true,
      message: `Berhasil membeli ${quantity} ${item.name}.`,
      remainingGold: playerStats.stats.gold
    };
  }

  function sellItem(name, quantity = 1) {
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      return { success: false, message: "Jumlah penjualan tidak valid." };
    }

    const item = catalog.find(entry => entry.name === name);

    if (!item) {
      return { success: false, message: "Barang ini tidak dapat dijual." };
    }

    const ownedItem = inventory.getItems().find(
      entry => entry.name === name
    );

    if (!ownedItem || ownedItem.quantity < quantity) {
      return { success: false, message: "Jumlah barang tidak cukup." };
    }

    const removed = inventory.removeItem(name, quantity);

    if (!removed) {
      return { success: false, message: "Penjualan gagal." };
    }

    const earnedGold = item.sellPrice * quantity;
    playerStats.addGold(earnedGold);

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
        
