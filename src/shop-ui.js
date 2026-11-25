
export function createShopUI(shopSystem, playerStats, inventory) {
  let shopElement = null;

  function closeShop() {
    if (shopElement) {
      shopElement.remove();
      shopElement = null;
    }
  }

  function openShop() {
    closeShop();

    const container = document.getElementById("game-container");
    if (!container) return;

    shopElement = document.createElement("div");
    shopElement.id = "shop-panel";

    Object.assign(shopElement.style, {
      position: "absolute",
      inset: "5%",
      zIndex: "50",
      overflowY: "auto",
      padding: "18px",
      color: "#f5ead4",
      background: "rgba(16, 25, 19, 0.97)",
      border: "2px solid #d9b36c",
      borderRadius: "14px",
      fontFamily: "Arial, sans-serif"
    });

    function render(statusMessage = "Selamat berbelanja!") {
      if (!shopElement) return;

      const gold = playerStats.stats.gold;
      const catalog = shopSystem.getCatalog();
      const ownedItems = inventory.getItems();

      shopElement.innerHTML = `
        <h2 style="color:#f1d49a;text-align:center">
          TOKO TOMAS
        </h2>

        <p style="text-align:center">
          Gold: <strong>${gold}</strong> 🪙
        </p>

        <h3>BARANG TOKO</h3>
        <div id="shop-buy-list"></div>

        <h3>JUAL BARANG</h3>
        <div id="shop-sell-list"></div>

        <p id="shop-message"
           style="text-align:center;color:#f1d49a">
          ${statusMessage}
        </p>

        <button id="shop-close"
          style="width:100%;padding:12px;margin-top:12px">
          TUTUP TOKO
        </button>
      `;

      const buyList = shopElement.querySelector("#shop-buy-list");
      const sellList = shopElement.querySelector("#shop-sell-list");
      const message = shopElement.querySelector("#shop-message");

      catalog.forEach(item => {
        const row = document.createElement("div");

        Object.assign(row.style, {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
          padding: "9px",
          marginBottom: "7px",
          background: "#26372b",
          borderRadius: "8px"
        });

        const info = document.createElement("span");
        info.textContent =
          `${item.name} (${item.type}) — ${item.price} Gold`;

        const button = document.createElement("button");
        button.textContent = "BELI";

        button.onclick = () => {
          const result = shopSystem.buyItem(item.id, 1);

          if (result.success) {
            render(result.message);
          } else {
            message.textContent = result.message;
          }
        };

        row.append(info, button);
        buyList.appendChild(row);
      });

      ownedItems.forEach(item => {
        const catalogItem = catalog.find(
          entry => entry.name === item.name
        );

        if (!catalogItem || catalogItem.sellPrice <= 0) return;

        const row = document.createElement("div");

        Object.assign(row.style, {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
          padding: "9px",
          marginBottom: "7px",
          background: "#26372b",
          borderRadius: "8px"
        });

        const info = document.createElement("span");
        info.textContent =
          `${item.name} x${item.quantity} — ${catalogItem.sellPrice} Gold`;

        const button = document.createElement("button");
        button.textContent = "JUAL 1";

        button.onclick = () => {
          const result = shopSystem.sellItem(item.name, 1);

          if (result.success) {
            render(result.message);
          } else {
            message.textContent = result.message;
          }
        };

        row.append(info, button);
        sellList.appendChild(row);
      });

      shopElement.querySelector("#shop-close").onclick = closeShop;
    }

    container.appendChild(shopElement);
    render();
  }

  return {
    openShop,
    closeShop,
    dispose: closeShop
  };
}
