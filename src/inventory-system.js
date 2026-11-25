
const MAX_INVENTORY_SLOTS = 20;

export function createInventory() {
  const items = [];
  let onItemAdded = null;

  function setOnItemAdded(callback) {
    onItemAdded = typeof callback === "function" ? callback : null;
  }

  function addItem(name, quantity = 1, type = "Material") {
    if (!name || quantity <= 0) {
      return false;
    }

    const existingItem = items.find(
      item => item.name === name && item.type === type
    );

    if (existingItem) {
      existingItem.quantity += quantity;

      if (onItemAdded) {
        onItemAdded(name, quantity);
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
      onItemAdded(name, quantity);
    }

    return true;
  }

  function removeItem(name, quantity = 1) {
    const index = items.findIndex(
      item => item.name === name
    );

    if (index === -1 || quantity <= 0) {
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

  function hasItem(name) {
    return items.some(item => item.name === name);
  }

  function clearInventory() {
    items.length = 0;
  }

  return {
    addItem,
    removeItem,
    getItems,
    getItemCount,
    hasItem,
    clearInventory,
    setOnItemAdded
  };
}
