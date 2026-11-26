
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

    function render(statusMessage = "") {
      if (!panel) return;

      const equipped = equipmentSystem.getEquipment();
      const items = inventory.getItems();

      const slotNames = {
        weapon: "Senjata",
        armor: "Armor",
        accessory: "Aksesori"
      };

      const slotsHTML = Object.entries(slotNames).map(
        ([slot, label]) => {
          const item = equipped[slot];

          return `
            <div style="
              padding:10px;
              margin-bottom:7px;
              background:#26372b;
              border-radius:8px;
            ">
              <strong>${label}:</strong>
              ${item ? item.name : "Kosong"}

              ${
                item
                  ? `<button data-unequip="${slot}">LEPAS</button>`
                  : ""
              }
            </div>
          `;
        }
      ).join("");

      const catalog = equipmentSystem.getCatalog();

      const ownedHTML = catalog.map(item => {
        const owned = items.find(
          entry =>
            entry.name === item.name &&
            entry.quantity > 0
        );

        if (!owned) return "";

        return `
          <div style="
            padding:10px;
            margin-bottom:7px;
            background:#26372b;
            border-radius:8px;
          ">
            <strong>${item.name}</strong>

            <p>
              Serangan +${item.attack}
              |
              Pertahanan +${item.defense}
            </p>

            <p>Jumlah: ${owned.quantity}</p>

            <button data-equip="${item.id}">
              PAKAI
            </button>
          </div>
        `;
      }).join("");

      const bonuses = equipmentSystem.getBonuses();

      panel.innerHTML = `
        <h2 style="color:#f1d49a;text-align:center">
          PERLENGKAPAN
        </h2>

        <h3>Slot Perlengkapan</h3>
        ${slotsHTML}

        <h3>Bonus Karakter</h3>

        <div style="
          padding:12px;
          background:#26372b;
          border-radius:8px;
        ">
          <p>Serangan: +${bonuses.attack}</p>
          <p>Pertahanan: +${bonuses.defense}</p>
        </div>

        <h3>Barang yang Dimiliki</h3>

        ${ownedHTML || "<p>Belum memiliki perlengkapan.</p>"}

        <p id="equipment-message" style="
          color:#f1d49a;
          text-align:center;
          min-height:20px;
        "></p>

        <button id="equipment-close" style="
          width:100%;
          padding:12px;
          margin-top:12px;
        ">
          TUTUP
        </button>
      `;

      const messageElement = panel.querySelector(
        "#equipment-message"
      );

      messageElement.textContent = statusMessage;

      panel.querySelectorAll("[data-equip]").forEach(button => {
        button.onclick = () => {
          const result = equipmentSystem.equip(
            button.dataset.equip
          );

          render(result.message);
        };
      });

      panel.querySelectorAll("[data-unequip]").forEach(button => {
        button.onclick = () => {
          const result = equipmentSystem.unequip(
            button.dataset.unequip
          );

          render(result.message);
        };
      });

      panel.querySelector("#equipment-close").onclick = close;
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
