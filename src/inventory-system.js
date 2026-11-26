
const MAX_INVENTORY_SLOTS = 20;
const INVENTORY_SAVE_KEY = "the-lost-world-inventory";

export function createInventory() {
  const items = [];
  let onItemAdded = null;

  function setOnItemAdded(callback) {
    onItemAdded =
      typeof callback === "function" ? callback : null;
  }

  function addItem(name, quantity = 1, type = "Material") {
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof type !== "string" ||
      !type.trim() ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isInteger(quantity)
    ) {
      return false;
    }

    const existingItem = items.find(
      item => item.name === name && item.type === type
    );

    if (existingItem) {
      existingItem.quantity += quantity;

      if (onItemAdded) {
        try {
          onItemAdded(name, quantity);
        } catch (error) {
          console.error("Inventory callback error:", error);
        }
      }

      return true;
    }

    if (items.length >= MAX_INVENTORY_SLOTS) {
      return false;
    }

    items.push({
      id: Date.now() + Math.random(),
      name,
      quantity,
      type
    });

    if (onItemAdded) {
      try {
        onItemAdded(name, quantity);
      } catch (error) {
        console.error("Inventory callback error:", error);
      }
    }

    return true;
  }

  function removeItem(name, quantity = 1, type = null) {
    if (
      typeof name !== "string" ||
      !name.trim() ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isInteger(quantity) ||
      (type !== null && typeof type !== "string")
    ) {
      return false;
    }

    const index = items.findIndex(item =>
      item.name === name &&
      (type === null || item.type === type)
    );

    if (index === -1 || items[index].quantity < quantity) {
      return false;
    }

    items[index].quantity -= quantity;

    if (items[index].quantity <= 0) {
      items.splice(index, 1);
    }

    return true;
  }

  function getItems() {
    return items.map(item => ({ ...item }));
  }

  function getItemCount() {
    return items.length;
  }

  function hasItem(name, type = null) {
    return items.some(item =>
      item.name === name &&
      (type === null || item.type === type)
    );
  }

  function clearInventory() {
    items.length = 0;
  }

  function saveInventory() {
    try {
      localStorage.setItem(
        INVENTORY_SAVE_KEY,
        JSON.stringify({
          version: 1,
          items: getItems()
        })
      );

      return true;
    } catch (error) {
      console.error("Gagal menyimpan inventaris:", error);
      return false;
    }
  }

  function loadInventory() {
    try {
      const savedText = localStorage.getItem(INVENTORY_SAVE_KEY);

      if (!savedText) return false;

      const savedData = JSON.parse(savedText);

      if (
        !savedData ||
        savedData.version !== 1 ||
        !Array.isArray(savedData.items) ||
        savedData.items.length > MAX_INVENTORY_SLOTS
      ) {
        return false;
      }

      const validItems = [];

      for (const item of savedData.items) {
        if (
          !item ||
          typeof item.name !== "string" ||
          !item.name.trim() ||
          typeof item.type !== "string" ||
          !item.type.trim() ||
          !Number.isFinite(item.quantity) ||
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0
        ) {
          return false;
        }

        validItems.push({
          id: Number.isFinite(item.id)
            ? item.id
            : Date.now() + Math.random(),
          name: item.name,
          quantity: item.quantity,
          type: item.type
        });
      }

      items.length = 0;
      items.push(...validItems);

      return true;
    } catch (error) {
      console.error("Gagal memuat inventaris:", error);
      return false;
    }
  }

  function deleteInventorySave() {
    try {
      localStorage.removeItem(INVENTORY_SAVE_KEY);
      return true;
    } catch (error) {
      console.error("Gagal menghapus save inventaris:", error);
      return false;
    }
  }

  return {
    addItem,
    removeItem,
    getItems,
    getItemCount,
    hasItem,
    clearInventory,
    setOnItemAdded,
    saveInventory,
    loadInventory,
    deleteInventorySave
  };
  }
