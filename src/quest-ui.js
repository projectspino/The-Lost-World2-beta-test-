
export function createQuestUI(questSystem) {
  if (!questSystem) return () => {};

  const style = document.createElement("style");
  style.textContent = `
    #quest-panel {
      position: fixed;
      top: 12px;
      right: 12px;
      width: min(300px, 82vw);
      max-height: 70vh;
      overflow-y: auto;
      z-index: 1000;
      display: none;
      padding: 14px;
      color: white;
      background: rgba(15, 25, 35, 0.95);
      border: 1px solid #b99b55;
      border-radius: 12px;
      font-family: Arial, sans-serif;
    }

    #quest-panel h2 {
      margin: 0 0 12px;
      color: #f3d27a;
      font-size: 20px;
    }

    .quest-card {
      padding: 10px;
      margin-bottom: 10px;
      background: rgba(255,255,255,0.08);
      border-radius: 8px;
    }

    .quest-card h3 {
      margin: 0 0 6px;
      font-size: 15px;
    }

    .quest-card p {
      margin: 5px 0;
      font-size: 12px;
    }

    .quest-card button,
    #quest-toggle {
      padding: 9px 12px;
      color: white;
      background: #75552b;
      border: 1px solid #d6b66a;
      border-radius: 7px;
      font-weight: bold;
    }

    .quest-card button:disabled {
      opacity: 0.5;
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
  panel.innerHTML = "<h2>Daftar Misi</h2><div id='quest-list'></div>";

  document.body.append(toggle, panel);

  function render() {
    const list = panel.querySelector("#quest-list");
    const quests = questSystem.getQuests();

    list.replaceChildren();

    quests.forEach(quest => {
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
      reward.textContent = `Hadiah: ${quest.rewardXP} XP`;

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
          render();
        });
      }

      card.append(title, description, progress, reward, action);
      list.appendChild(card);
    });
  }

  toggle.addEventListener("click", () => {
    const isOpen = panel.style.display === "block";
    panel.style.display = isOpen ? "none" : "block";

    if (!isOpen) render();
  });

  render();

  return function disposeQuestUI() {
    toggle.remove();
    panel.remove();
    style.remove();
  };
        }
