
export function createInventoryUI(inventory) {
  let isOpen = false;

  const style = document.createElement("style");
  style.id = "inventory-ui-style";

  style.textContent = `
    #inventory-button {
      position: fixed;
      top: 110px;
      right: 15px;
      z-index: 20;
      padding: 12px 16px;
      background: #49351f;
      color: white;
      border: 1px solid #c9a45c;
      border-radius: 8px;
      font-weight: bold;
    }

    #inventory-panel {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(340px, 88vw);
      max-height: 70vh;
      overflow-y: auto;
      padding: 18px;
      background: #211b16;
      color: white;
      border: 2px solid #c9a45c;
      border-radius: 12px;
      z-index: 30;
      display: none;
    }

    #inventory-panel h2 {
      text-align: center;
      margin-top: 0;
    }

    .inventory-item {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      padding: 10px;
      margin: 6px 0;
      background: #3b3025;
      border-radius: 6px;
    }

    #inventory-close {
      width: 100%;
      padding: 10px;
      margin-top: 12px;
      background: #76502d;
      color: white;
      border: 0;
      border-radius: 7px;
      font-weight: bold;
    }

    .inventory-empty {
      text-align: center;
      opacity: 0.75;
      padding: 20px 0;
    }
  `;

  document.head.appendChild(style);

  const button = document.createElement("button");
  button.id = "inventory-button";
  button.textContent = "BAG";

  const panel = document.createElement("div");
  panel.id = "inventory-panel";

  panel.innerHTML = `
    <h2>INVENTORY</h2>
    <div id="inventory-items"></div>
    <button id="inventory-close">CLOSE</button>
  `;

  document.body.appendChild(button);
  document.body.appendChild(panel);

  const itemContainer = panel.querySelector("#inventory-items");
  const closeButton = panel.querySelector("#inventory-close");

  function renderItems() {
    const items = inventory.getItems();

    if (items.length === 0) {
      itemContainer.innerHTML = `
        <div class="inventory-empty">
          Your inventory is empty.
        </div>
      `;
      return;
    }

    itemContainer.innerHTML = items.map(item => `
      <div class="inventory-item">
        <span>${escapeHTML(item.name)}</span>
        <span>x${item.quantity}</span>
      </div>
    `).join("");
  }

  function openInventory() {
    isOpen = true;
    renderItems();
    panel.style.display = "block";
  }

  function closeInventory() {
    isOpen = false;
    panel.style.display = "none";
  }

  function toggleInventory() {
    if (isOpen) {
      closeInventory();
    } else {
      openInventory();
    }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
      const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return replacements[character];
    });
  }

  button.addEventListener("click", toggleInventory);
  closeButton.addEventListener("click", closeInventory);

  return function disposeInventoryUI() {
    button.removeEventListener("click", toggleInventory);
    closeButton.removeEventListener("click", closeInventory);

    button.remove();
    panel.remove();
    style.remove();
  };
}
