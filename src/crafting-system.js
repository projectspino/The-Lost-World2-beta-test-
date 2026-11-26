
const RECIPES = [
  {
    id: "wooden_sword",
    name: "Wooden Sword",
    resultType: "Weapon",
    materials: [
      { name: "Wood", amount: 5 }
    ],
    resultAmount: 1
  },
  {
    id: "wooden_shield",
    name: "Wooden Shield",
    resultType: "Armor",
    materials: [
      { name: "Wood", amount: 8 }
    ],
    resultAmount: 1
  },
  {
    id: "health_potion",
    name: "Health Potion",
    resultType: "Consumable",
    materials: [
      { name: "Herb", amount: 3 }
    ],
    resultAmount: 1
  }
];

export function createCraftingSystem(inventory) {
  if (
    !inventory ||
    typeof inventory.getItems !== "function" ||
    typeof inventory.addItem !== "function" ||
    typeof inventory.removeItem !== "function"
  ) {
    throw new Error("Inventory tidak valid untuk crafting.");
  }

  function getRecipes() {
    return RECIPES.map(recipe => ({
      ...recipe,
      materials: recipe.materials.map(item => ({ ...item }))
    }));
  }

  function getRecipe(id) {
    const recipe = RECIPES.find(item => item.id === id);

    if (!recipe) return null;

    return {
      ...recipe,
      materials: recipe.materials.map(item => ({ ...item }))
    };
  }

  function canCraft(id) {
    const recipe = RECIPES.find(item => item.id === id);

    if (!recipe) return false;

    const items = inventory.getItems();

    return recipe.materials.every(material => {
      const found = items.find(
        item => item.name === material.name
      );

      return found && found.quantity >= material.amount;
    });
  }

  function craft(id) {
    const recipe = RECIPES.find(item => item.id === id);

    if (!recipe) {
      return {
        success: false,
        message: "Resep tidak ditemukan."
      };
    }

    const items = inventory.getItems();

    const materialsToRemove = [];

    for (const material of recipe.materials) {
      const found = items.find(
        item => item.name === material.name
      );

      if (!found || found.quantity < material.amount) {
        return {
          success: false,
          message: "Bahan crafting tidak mencukupi."
        };
      }

      materialsToRemove.push({
        name: material.name,
        amount: material.amount,
        type: found.type
      });
    }

    const removedMaterials = [];

    for (const material of materialsToRemove) {
      const removed = inventory.removeItem(
        material.name,
        material.amount
      );

      if (!removed) {
        for (const previous of removedMaterials) {
          inventory.addItem(
            previous.name,
            previous.amount,
            previous.type
          );
        }

        return {
          success: false,
          message: "Crafting gagal. Bahan dikembalikan."
        };
      }

      removedMaterials.push(material);
    }

    const added = inventory.addItem(
      recipe.name,
      recipe.resultAmount,
      recipe.resultType
    );

    if (!added) {
      for (const material of removedMaterials) {
        inventory.addItem(
          material.name,
          material.amount,
          material.type
        );
      }

      return {
        success: false,
        message: "Inventaris penuh. Bahan dikembalikan."
      };
    }

    return {
      success: true,
      message: `${recipe.name} berhasil dibuat!`,
      item: recipe.name
    };
  }

  return {
    getRecipes,
    getRecipe,
    canCraft,
    craft
  };
}
  
