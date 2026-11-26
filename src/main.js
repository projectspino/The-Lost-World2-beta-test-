JavaScript

import * as BABYLON from "@babylonjs/core";
import "./styles/menu.css";

import { buildWorld } from "./world.js";
import { createPlayerController } from "./player-controller.js";
import { createCombatSystem } from "./combat-system.js";
import { createPlayerStats } from "./player-stats.js";
import { createInventory } from "./inventory-system.js";
import { createInventoryUI } from "./inventory-ui.js";
import { createEnemyAI } from "./enemy-ai.js";
import { createQuestSystem } from "./quest-system.js";
import { createQuestUI } from "./quest-ui.js";
import { createShopSystem } from "./shop-system.js";
import { createShopUI } from "./shop-ui.js";
import { createEquipmentSystem } from "./equipment-system.js";
import { createEquipmentUI } from "./equipment-ui.js";

const app = document.getElementById("app");

let engine = null;
let scene = null;
let camera = null;
let player = null;

let disposePlayerController = null;
let disposeCombatSystem = null;
let disposeInventoryUI = null;
let disposeQuestUI = null;
let disposeWorldInteraction = null;

let enemyAI = null;
let questSystem = null;
let playerStats = null;
let inventory = null;

let shopSystem = null;
let shopUI = null;

let equipmentSystem = null;
let equipmentUI = null;

let selectedCharacter = "Ksatria";

const characters = [
  {
    name: "Ksatria",
    icon: "⚔️",
    description: "Petarung tangguh dengan pedang dan perisai."
  },
  {
    name: "Pemanah",
    icon: "🏹",
    description: "Ahli serangan jarak jauh."
  },
  {
    name: "Penyihir",
    icon: "🔮",
    description: "Pengguna kekuatan sihir."
  },
  {
    name: "Assassin",
    icon: "🗡️",
    description: "Petarung cepat dan lincah."
  },
  {
    name: "Paladin",
    icon: "🛡️",
    description: "Pelindung dengan kekuatan suci."
  },
  {
    name: "Druid",
    icon: "🌿",
    description: "Pengendali kekuatan alam."
  }
];

const settings = {
  quality: localStorage.getItem("quality") || "Medium",
  shadows: localStorage.getItem("shadows") !== "false",
  particles: localStorage.getItem("particles") !== "false",
  fps: Number(localStorage.getItem("fps") || 60)
};

// =====================================
// CHECK SAVED GAME
// =====================================

function hasSavedGame() {
  return (
    localStorage.getItem("the-lost-world-player-stats") !== null ||
    localStorage.getItem("the-lost-world-inventory") !== null
  );
}

// =====================================
// SAVE ALL GAME DATA
// =====================================

function saveAllGameData() {
  if (!playerStats || !inventory) {
    return false;
  }

  const statsSaved = playerStats.saveGame();
  const inventorySaved = inventory.saveInventory();

  const questsSaved = questSystem
    ? questSystem.saveQuests()
    : true;

  const equipmentSaved = equipmentSystem
    ? equipmentSystem.saveEquipment()
    : true;

  let positionSaved = true;

  if (player) {
    try {
      localStorage.setItem(
        "the-lost-world-player-position",
        JSON.stringify({
          x: player.position.x,
          y: player.position.y,
          z: player.position.z
        })
      );
    } catch (error) {
      console.warn("Gagal menyimpan posisi pemain.", error);
      positionSaved = false;
    }
  }

  let characterSaved = true;

  try {
    localStorage.setItem(
      "the-lost-world-character",
      selectedCharacter
    );
  } catch (error) {
    console.warn("Gagal menyimpan karakter.", error);
    characterSaved = false;
  }

  const success =
    statsSaved &&
    inventorySaved &&
    questsSaved &&
    equipmentSaved &&
    positionSaved &&
    characterSaved;

  console.log(
    success
      ? "Semua progres game berhasil disimpan!"
      : "Gagal menyimpan sebagian progres game."
  );

  return success;
}

// =====================================
// DELETE ALL SAVED GAME DATA
// =====================================

function deleteAllGameData() {
  const saveKeys = [
    "the-lost-world-player-stats",
    "the-lost-world-inventory",
    "the-lost-world-quests",
    "the-lost-world-equipment",
    "the-lost-world-player-position",
    "the-lost-world-character"
  ];

  saveKeys.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log("Semua progres lama telah dihapus.");
}

// =====================================
// LOADING SCREEN
// =====================================

function showLoading() {
  app.innerHTML = `
    <div class="screen loading-screen" id="loading-screen">
      <div class="logo">⚔</div>
      <h1>THE LOST WORLD</h1>
      <p class="subtitle">AN EPIC FANTASY ADVENTURE</p>

      <div class="loading-track">
        <div class="loading-progress"></div>
      </div>

      <p>Preparing your adventure...</p>
    </div>
  `;

  setTimeout(showMainMenu, 2400);
}

// =====================================
// MAIN MENU
// =====================================

function showMainMenu() {
  const savedGameExists = hasSavedGame();

  app.innerHTML = `
    <div class="screen main-screen">
      <div class="menu-content">
        <div class="logo">⚔</div>
        <h1>THE LOST WORLD</h1>
        <p class="subtitle">2.0 • BETA ADVENTURE</p>

        <div class="menu">
          ${
            savedGameExists
              ? `
                <button class="game-button" id="continue-button">
                  CONTINUE GAME
                </button>
              `
              : ""
          }

          <button class="game-button" id="play-button">
            NEW GAME
          </button>

          <button class="game-button secondary" id="settings-button">
            SETTINGS
          </button>

          <p class="version">Fantasy Open World RPG</p>
        </div>
      </div>
    </div>
  `;

  const continueButton =
    document.getElementById("continue-button");

  if (continueButton) {
    continueButton.onclick = () => {
      startGame();
    };
  }

  document.getElementById("play-button").onclick = () => {
    if (hasSavedGame()) {
      const confirmed = confirm(
        "Mulai game baru? Semua progres tersimpan akan dihapus."
      );

      if (!confirmed) return;

      deleteAllGameData();
    }

    selectedCharacter = "Ksatria";
    showCharacterSelect();
  };

  document.getElementById("settings-button").onclick =
    showSettings;
}

// =====================================
// CHARACTER SELECT
// =====================================

function showCharacterSelect() {
  const cards = characters.map(character => `
    <button
      class="character ${
        character.name === selectedCharacter ? "selected" : ""
      }"
      data-character="${character.name}"
    >
      <span class="character-icon">${character.icon}</span>
      <strong>${character.name}</strong>
      <small>${character.description}</small>
    </button>
  `).join("");

  app.innerHTML = `
    <div class="screen">
      <div class="panel">
        <h1>CHOOSE YOUR HERO</h1>
        <p class="subtitle">Select your adventure class</p>

        <div class="character-list">${cards}</div>

        <button class="game-button" id="start-button">
          START ADVENTURE
        </button>

        <button class="game-button secondary" id="back-button">
          BACK
        </button>
      </div>
    </div>
  `;

  document.querySelectorAll(".character").forEach(button => {
    button.onclick = () => {
      selectedCharacter = button.dataset.character;

      document.querySelectorAll(".character").forEach(item => {
        item.classList.remove("selected");
      });

      button.classList.add("selected");
    };
  });

  document.getElementById("start-button").onclick = () => {
    startGame();
  };

  document.getElementById("back-button").onclick =
    showMainMenu;
}

// =====================================
// SETTINGS
// =====================================

function showSettings() {
  app.innerHTML = `
    <div class="screen">
      <div class="panel">
        <h1>GAME SETTINGS</h1>

        <div class="setting-row">
          <label for="quality">Graphics Quality</label>
          <select id="quality">
            <option ${settings.quality === "Low" ? "selected" : ""}>Low</option>
            <option ${settings.quality === "Medium" ? "selected" : ""}>Medium</option>
            <option ${settings.quality === "High" ? "selected" : ""}>High</option>
            <option ${settings.quality === "Ultra" ? "selected" : ""}>Ultra</option>
          </select>
        </div>

        <div class="setting-row">
          <label for="shadows">Shadows</label>
          <input
            type="checkbox"
            id="shadows"
            ${settings.shadows ? "checked" : ""}
          >
        </div>

        <div class="setting-row">
          <label for="particles">Particle Effects</label>
          <input
            type="checkbox"
            id="particles"
            ${settings.particles ? "checked" : ""}
          >
        </div>

        <div class="setting-row">
          <label for="fps">Target FPS</label>
          <select id="fps">
            <option value="30" ${settings.fps === 30 ? "selected" : ""}>30 FPS</option>
            <option value="45" ${settings.fps === 45 ? "selected" : ""}>45 FPS</option>
            <option value="60" ${settings.fps === 60 ? "selected" : ""}>60 FPS</option>
          </select>
        </div>

        <button class="game-button" id="save-settings">
          SAVE SETTINGS
        </button>

        <button class="game-button secondary" id="back-button">
          BACK
        </button>
      </div>
    </div>
  `;

  document.getElementById("save-settings").onclick = () => {
    settings.quality = document.getElementById("quality").value;
    settings.shadows = document.getElementById("shadows").checked;
    settings.particles = document.getElementById("particles").checked;
    settings.fps = Number(document.getElementById("fps").value);

    localStorage.setItem("quality", settings.quality);
    localStorage.setItem("shadows", settings.shadows);
    localStorage.setItem("particles", settings.particles);
    localStorage.setItem("fps", settings.fps);

    showSettings();
  };

  document.getElementById("back-button").onclick =
    showMainMenu;
}

// =====================================
// GAME HUD STYLES
// =====================================

function addGameHudStyles() {
  if (document.getElementById("game-hud-styles")) return;

  const style = document.createElement("style");
  style.id = "game-hud-styles";

  style.textContent = `
    .hero-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-label {
      color: white;
      font-size: 12px;
      margin-top: 5px;
    }

    .stat-track {
      width: 150px;
      max-width: 35vw;
      height: 9px;
      background: #333;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 3px;
    }

    .stat-fill {
      height: 100%;
      width: 100%;
      transition: width 0.2s ease;
    }

    .hp-fill {
      background: #d83b3b;
    }

    .xp-fill {
      background: #36b85a;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    #attack-button,
    #jump-button,
    #equipment-button {
      min-width: 65px;
      min-height: 44px;
      border-radius: 12px;
      font-weight: bold;
      touch-action: manipulation;
    }

    #save-game,
    #exit-game {
      min-height: 38px;
      padding: 8px 12px;
      border-radius: 8px;
      font-weight: bold;
    }

    .npc-dialog {
      position: absolute;
      left: 50%;
      bottom: 100px;
      transform: translateX(-50%);
      width: min(420px, 88vw);
      padding: 16px;
      color: white;
      background: rgba(20, 25, 30, 0.96);
      border: 1px solid #b89552;
      border-radius: 12px;
      z-index: 20;
      text-align: center;
    }

    .npc-dialog h3 {
      margin: 0 0 8px;
      color: #e7c77e;
    }

    .npc-dialog p {
      line-height: 1.5;
    }

    .npc-dialog button {
      margin: 5px;
      padding: 10px 16px;
      border: 0;
      border-radius: 8px;
      font-weight: bold;
    }
  `;

  document.head.appendChild(style);
}

// =====================================
// NPC DIALOG
// =====================================

function showNpcDialog(name, dialogue) {
  const oldDialog = document.getElementById("npc-dialog");

  if (oldDialog) oldDialog.remove();

  const dialog = document.createElement("div");
  dialog.id = "npc-dialog";
  dialog.className = "npc-dialog";

  const title = document.createElement("h3");
  title.textContent = name;

  const message = document.createElement("p");
  message.textContent = dialogue;

  dialog.append(title, message);

  if (name === "Eldric" && questSystem) {
    const quest = questSystem.getQuest("goblin_hunt");

    if (quest && !quest.accepted && !quest.claimed) {
      const acceptButton = document.createElement("button");
      acceptButton.textContent = "TERIMA QUEST";

      acceptButton.onclick = () => {
        const accepted = questSystem.acceptQuest("goblin_hunt");

        message.textContent = accepted
          ? "Quest Pemburu Goblin diterima! Kalahkan 5 Goblin."
          : "Quest belum bisa diterima.";

        acceptButton.remove();
      };

      dialog.appendChild(acceptButton);
    } else if (quest && quest.completed && !quest.claimed) {
      message.textContent =
        "Hebat! Kamu berhasil mengalahkan 5 Goblin. Ini hadiahmu!";

      const rewardButton = document.createElement("button");
      rewardButton.textContent = "AMBIL HADIAH";

      rewardButton.onclick = () => {
        const claimed = questSystem.claimReward("goblin_hunt");

        message.textContent = claimed
          ? "Hadiah diterima! Kamu mendapatkan 100 XP dan 2 Health Potion."
          : "Hadiah belum bisa diklaim.";

        rewardButton.remove();
      };

      dialog.appendChild(rewardButton);
    } else if (quest && quest.accepted && !quest.completed) {
      message.textContent =
        "Teruskan petualanganmu! Goblin dikalahkan: " +
        quest.progress + "/" + quest.required;
    } else if (quest && quest.claimed) {
      message.textContent =
        "Terima kasih atas bantuanmu, petualang!";
    }
  }

  if (name === "Tomas" && shopUI) {
    const shopButton = document.createElement("button");
    shopButton.textContent = "BUKA TOKO";

    shopButton.onclick = () => {
      dialog.remove();
      shopUI.openShop();
    };

    dialog.appendChild(shopButton);
  }

  const closeButton = document.createElement("button");
  closeButton.textContent = "TUTUP";
  closeButton.onclick = () => dialog.remove();

  dialog.appendChild(closeButton);

  document.getElementById("game-container").appendChild(dialog);
}

// =====================================
// START GAME
// =====================================

function startGame() {
  // Saat Continue, gunakan karakter yang tersimpan.
  const savedCharacter = localStorage.getItem(
    "the-lost-world-character"
  );

  if (
    savedCharacter &&
    characters.some(character => character.name === savedCharacter)
  ) {
    selectedCharacter = savedCharacter;
  }

  // Simpan karakter yang digunakan.
  localStorage.setItem(
    "the-lost-world-character",
    selectedCharacter
  );

  addGameHudStyles();

  app.innerHTML = `
    <div id="game-container">
      <canvas id="game-canvas"></canvas>

      <div class="game-hud">
        <div class="hero-info">
          <strong>${selectedCharacter}</strong>
          <span id="level-text">Level 1</span>
          <div id="gold-text">Gold: 100</div>

          <div class="stat-label" id="hp-text">HP 100/100</div>
          <div class="stat-track">
            <div id="hp-bar" class="stat-fill hp-fill"></div>
          </div>

          <div class="stat-label" id="xp-text">XP 0/100</div>
          <div class="stat-track">
            <div id="xp-bar" class="stat-fill xp-fill"></div>
          </div>
        </div>

        <div style="display:flex; gap:8px; align-items:flex-start;">
          <button id="save-game">SAVE GAME</button>
          <button id="exit-game">MENU</button>
        </div>
      </div>

      <div class="game-controls">
        <div class="joystick" id="joystick">✥</div>

        <div class="action-buttons">
          <button id="attack-button">ATTACK</button>
          <button id="jump-button">JUMP</button>
          <button id="equipment-button">EQUIPMENT</button>
        </div>
      </div>
    </div>
  `;

  const canvas = document.getElementById("game-canvas");

  engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: false,
    stencil: false,
    antialias: settings.quality !== "Low"
  });

  scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.45, 0.65, 0.78, 1);

  const light = new BABYLON.HemisphericLight(
    "world-light",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );

  light.intensity = 0.9;

  camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 3,
    9,
    new BABYLON.Vector3(0, 1, 0),
    scene
  );

  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 5;
  camera.upperRadiusLimit = 14;
  camera.wheelPrecision = 60;

  player = BABYLON.MeshBuilder.CreateCapsule(
    "player",
    {
      height: 2,
      radius: 0.45
    },
    scene
  );

  player.position.y = 1;

  // Muat posisi pemain yang tersimpan.
  try {
    const savedPosition = JSON.parse(
      localStorage.getItem("the-lost-world-player-position")
    );

    if (
      savedPosition &&
      Number.isFinite(savedPosition.x) &&
      Number.isFinite(savedPosition.y) &&
      Number.isFinite(savedPosition.z)
    ) {
      player.position.set(
        savedPosition.x,
        savedPosition.y,
        savedPosition.z
      );
    }
  } catch (error) {
    console.warn("Data posisi pemain tidak dapat dimuat.", error);
  }

  const playerMaterial = new BABYLON.StandardMaterial(
    "player-material",
    scene
  );

  playerMaterial.diffuseColor = new BABYLON.Color3(
    0.65,
    0.72,
    0.82
  );

  player.material = playerMaterial;
  camera.lockedTarget = player;

  // Statistik dan inventaris.
  playerStats = createPlayerStats();
  inventory = createInventory();

  const statsLoaded = playerStats.loadGame();
  const inventoryLoaded = inventory.loadInventory();

  console.log(
    statsLoaded
      ? "Progres pemain berhasil dimuat."
      : "Memulai progres pemain baru."
  );

  console.log(
    inventoryLoaded
      ? "Inventaris berhasil dimuat."
      : "Menggunakan inventaris awal."
  );

  // Item awal hanya diberikan jika belum ada save inventaris.
  if (!inventoryLoaded) {
    inventory.addItem("Health Potion", 2, "Consumable");
    inventory.addItem("Wood", 5, "Material");
    inventory.addItem("Goblin Token", 1, "Quest");
  }

  // Quest.
  questSystem = createQuestSystem(playerStats, inventory);

  const questsLoaded = questSystem.loadQuests();

  console.log(
    questsLoaded
      ? "Progres Quest berhasil dimuat."
      : "Memulai Quest baru."
  );

  // Shop.
  shopSystem = createShopSystem(playerStats, inventory);
  shopUI = createShopUI(shopSystem, playerStats, inventory);

  // Equipment.
  equipmentSystem = createEquipmentSystem(inventory);

  const equipmentLoaded = equipmentSystem.loadEquipment();

  console.log(
    equipmentLoaded
      ? "Equipment berhasil dimuat."
      : "Belum ada equipment tersimpan."
  );

  equipmentUI = createEquipmentUI(equipmentSystem, inventory);

  // Pantau item yang ditambahkan untuk progres Quest.
  inventory.setOnItemAdded((name, quantity) => {
    if (questSystem) {
      questSystem.addProgress(name, quantity);
    }
  });

  // Bangun dunia.
  disposeWorldInteraction = buildWorld(
    scene,
    (amount) => {
      if (!inventory) return;

      const added = inventory.addItem(
        "Wood",
        amount,
        "Material"
      );

      if (added) {
        console.log("Mendapatkan " + amount + " Wood!");
      } else {
        console.log(
