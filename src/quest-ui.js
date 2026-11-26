
export function createQuestUI(questSystem) {
  if (!questSystem) return () => {};

  const style = document.createElement("style");
  style.textContent = `
    #quest-panel {
      position: fixed;
      top: 55px;
      right: 12px;
      width: min(300px, 82vw);
      max-height: 70vh;
      overflow-y: auto;
      z-index: 1000;
      display: none;
      padding: 14px;
      color: white;
      background: rgba(15,25,35,.95);
      border: 1px solid #b99b55;
      border-radius: 12px;
      font-family: Arial,sans-serif;
    }
    #quest-panel h2 { color: #f3d27a; }
    .quest-card {
      padding: 10px;
      margin-bottom: 10px;
      background: rgba(255,255,255,.08);
      border-radius: 8px;
    }
    .quest-card h3 { margin: 0 0 6px; }
    .quest-card p { font-size: 12px; }
    .quest-card button, #quest-toggle {
      padding: 9px 12px;
      color: white;
      background: #75552b;
      border: 1px solid #d6b66a;
      border-radius: 7px;
      font-weight: bold;
    }
    #quest-toggle {
      position: fixed;
      top: 12px;
      left: 12px;
      z-index: 1001;
    }
  `;

  document.head.appendChild(style);

  const toggle = document.createElement("button");
  toggle.id = "quest-toggle";
  toggle.textContent = "QUEST";

  const panel = document.createElement("section");
  panel.id = "quest-panel";

  const heading = document.createElement("h2");
  heading.textContent = "Daftar Misi";

  const list = document.createElement("div");
  panel.append(heading, list);
  document.body.append(toggle, panel);

  function render() {
    list.replaceChildren();

    for (const quest of questSystem.getQuests()) {
      const card = document.createElement("article");
      card.className = "quest-card";

      const title = document.createElement("h3");
      title.textContent = quest.title;

      const description = document.createElement("p");
      description.textContent = quest.description;

      const progress = document.createElement("p");
      progress.textContent =
        `Progres: ${quest.progress}/${quest.required}`;

      const reward = document.createElement("p");
      reward.textContent =
        `Hadiah: ${quest.rewardXP} XP + ${quest.rewardGold} Gold`;

      const action = document.createElement("button");

      if (quest.claimed) {
        action.textContent = "Hadiah Diambil";
        action.disabled = true;
      } else if (quest.completed) {
        action.textContent = "Ambil Hadiah";
        action.addEventListener("click", () => {
          questSystem.claimReward(quest.id);
          render();
        });
      } else if (quest.accepted) {
        action.textContent = "Sedang Berjalan";
        action.disabled = true;
      } else {
        action.textContent = "Terima Misi";
        action.addEventListener("click", () => {
          questSystem.acceptQuest(quest.id);
          questSystem.saveQuests?.();
          render();
        });
      }

      card.append(title, description, progress, reward, action);
      list.appendChild(card);
    }
  }

  toggle.addEventListener("click", () => {
    const open = panel.style.display === "block";
    panel.style.display = open ? "none" : "block";
    if (!open) render();
  });

  render();

  return function disposeQuestUI() {
    toggle.remove();
    panel.remove();
    style.remove();
  };
}
