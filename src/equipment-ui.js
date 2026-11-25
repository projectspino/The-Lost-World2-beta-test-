
export function createEquipmentUI(equipmentSystem, inventory) {
  let panel = null;

  function close() {
    if (panel) {
      panel.remove();
      panel = null;
    }
  }

  function open() {
    close();

    const container = document.getElementById("game-container");
    if (!container) return;

    panel = document.createElement("div");
    panel.id = "equipment-panel";

    Object.assign(panel.style, {
      position: "absolute",
      inset: "8%",
      zIndex: "60",
      overflowY: "auto",
      padding: "16px",
      color: "#f5ead4",
      background: "rgba(16,25,19,0.97)",
      border: "2px solid #d9b36c",
      borderRadius: "14px",
      fontFamily: "Arial, sans-serif"
    });

    function render() {
      if (!panel) return;

      const equipped = equipmentSystem.getEquipment();
      const items = inventory.getItems();

      const slotNames = {
        weapon: "Senjata",
        armor: "Armor",
        accessory: "Aksesori"
      };

      const slotsHTML = Object.entries(slotNames).map(([slot, label]) => {
        const item = equipped[slot];

        return `
          <div style="padding:10px;border-bottom:1px solid #776344">
            <strong>${label}:</strong>
            ${item ? item.name : "Kosong"}
            ${
              item
                ? `<button data-unequip="${slot}">LEPAS</button>`
                : ""
            }
          </div>
        `;
      }).join("");

      const catalog = equipmentSystem.getCatalog();

      const ownedHTML = catalog.map(item => {
        const owned = items.find(
          entry => entry.name === item.name && entry.quantity > 0
        );

        if (!owned) return "";

        return `
          <div style="padding:8px;border-bottom:1px solid #776344">
            <strong>${item.name}</strong>
            <p>Serangan +${item.attack} | Pertahanan +${item.defense}</p>
            <button data-equip="${item.id}">PAKAI</button>
          </div>
        `;
      }).join("");

      const bonuses = equipmentSystem.getBonuses();

      panel.innerHTML = `
        <h2>PERLENGKAPAN</h2>

        <h3>Slot Perlengkapan</h3>
        ${slotsHTML}

        <h3>Bonus Karakter</h3>
        <p>Serangan: +${bonuses.attack}</p>
        <p>Pertahanan: +${bonuses.defense}</p>

        <h3>Barang yang Dimiliki</h3>
        ${ownedHTML || "<p>Belum memiliki perlengkapan.</p>"}

        <button id="equipment-close">TUTUP</button>
        <p id="equipment-message"></p>
      `;

      panel.querySelectorAll("[data-equip]").forEach(button => {
        button.onclick = () => {
          const result = equipmentSystem.equip(button.dataset.equip);
          showMessage(result.message);
          if (result.success) render();
        };
      });

      panel.querySelectorAll("[data-unequip]").forEach(button => {
        button.onclick = () => {
          const result = equipmentSystem.unequip(button.dataset.unequip);
          showMessage(result.message);
          if (result.success) render();
        };
      });

      panel.querySelector("#equipment-close").onclick = close;
    }

    function showMessage(message) {
      const messageElement = panel?.querySelector("#equipment-message");
      if (messageElement) messageElement.textContent = message;
    }

    container.appendChild(panel);
    render();
  }

  return {
    open,
    close,
    dispose: close
  };
                                               }
