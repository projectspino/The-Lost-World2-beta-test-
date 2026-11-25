
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

const app = document.getElementById("app");

let engine = null;
let scene = null;
let camera = null;
let player = null;

let disposePlayerController = null;
let disposeCombatSystem = null;
let disposeInventoryUI = null;
let disposeQuestUI = null;

let enemyAI = null;
let questSystem = null;

let playerStats = null;
let inventory = null;

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

function showMainMenu() {
  app.innerHTML = `
    <div class="screen main-screen">
      <div class="menu-content">
        <div class="logo">⚔</div>
        <h1>THE LOST WORLD</h1>
        <p class="subtitle">2.0 • BETA ADVENTURE</p>

        <div class="menu">
          <button class="game-button" id="play-button">
            NEW ADVENTURE
          </button>

          <button class="game-button secondary" id="settings-button">
            SETTINGS
          </button>

          <p class="version">Fantasy Open World RPG</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById("play-button").onclick =
    showCharacterSelect;

  document.getElementById("settings-button").onclick =
    showSettings;
}

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

  document.getElementById("start-button").onclick = startGame;
  document.getElementById("back-button").onclick = showMainMenu;
}

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
            <option value="30" ${settings.fps === 30 ? "selected" : ""}>
              30 FPS
            </option>
            <option value="45" ${settings.fps === 45 ? "selected" : ""}>
              45 FPS
            </option>
            <option value="60" ${settings.fps === 60 ? "selected" : ""}>
              60 FPS
            </option>
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

  document.getElementById("back-button").onclick = showMainMenu;
}

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
    #jump-button {
      min-width: 65px;
      min-height: 48px;
      border-radius: 12px;
      font-weight: bold;
      touch-action: manipulation;
    }
  `;

  document.head.appendChild(style);
}

function startGame() {
  addGameHudStyles();

  app.innerHTML = `
    <div id="game-container">
      <canvas id="game-canvas"></canvas>

      <div class="game-hud">
        <div class="hero-info">
          <strong>${selectedCharacter}</strong>
          <span id="level-text">Level 1</span>

          <div class="stat-label" id="hp-text">
            HP 100/100
          </div>

          <div class="stat-track">
            <div id="hp-bar" class="stat-fill hp-fill"></div>
          </div>

          <div class="stat-label" id="xp-text">
            XP 0/100
          </div>

          <div class="stat-track">
            <div id="xp-bar" class="stat-fill xp-fill"></div>
          </div>
        </div>

        <button id="exit-game">MENU</button>
      </div>

      <div class="game-controls">
        <div class="joystick" id="joystick">✥</div>

        <div class="action-buttons">
          <button id="attack-button">ATTACK</button>
          <button id="jump-button">JUMP</button>
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

  buildWorld(scene);

  playerStats = createPlayerStats();
  inventory = createInventory();

  inventory.addItem("Health Potion", 2, "Consumable");
  inventory.addItem("Wood", 5, "Material");
  inventory.addItem("Goblin Token", 1, "Quest");

  disposeInventoryUI = createInventoryUI(inventory);

  // Inisialisasi sistem Quest.
  questSystem = createQuestSystem(playerStats, inventory);
  disposeQuestUI = createQuestUI(questSystem);

  const joystick = document.getElementById("joystick");
  const jumpButton = document.getElementById("jump-button");

  disposePlayerController = createPlayerController(
    scene,
    camera,
    player,
    joystick,
    jumpButton
  );

  enemyAI = createEnemyAI(
    scene,
    player,
    (damage, enemyName) => {
      if (playerStats) {
        playerStats.takeDamage(damage);
      }

      console.log(enemyName + " menyerang pemain!");
    }
  );

  const attackButton = document.getElementById("attack-button");

  disposeCombatSystem = createCombatSystem(
    scene,
    player,
    attackButton,
    playerStats,
    inventory,
    enemyAI
  );

  engine.runRenderLoop(() => {
    if (scene) {
      scene.render();
    }
  });

  window.addEventListener("resize", resizeEngine);

  document.getElementById("exit-game").onclick = exitGame;
}

function resizeEngine() {
  if (engine) {
    engine.resize();
  }
}

function exitGame() {
  if (disposePlayerController) {
    disposePlayerController();
    disposePlayerController = null;
  }

  if (disposeCombatSystem) {
    disposeCombatSystem();
    disposeCombatSystem = null;
  }

  if (enemyAI) {
    enemyAI.dispose();
    enemyAI = null;
  }

  if (disposeInventoryUI) {
    disposeInventoryUI();
    disposeInventoryUI = null;
  }

  if (disposeQuestUI) {
    disposeQuestUI();
    disposeQuestUI = null;
  }

  window.removeEventListener("resize", resizeEngine);

  if (engine) {
    engine.stopRenderLoop();
    engine.dispose();
  }

  engine = null;
  scene = null;
  camera = null;
  player = null;
  playerStats = null;
  inventory = null;
  questSystem = null;

  const oldStyles = document.getElementById("game-hud-styles");

  if (oldStyles) {
    oldStyles.remove();
  }

  showMainMenu();
}

showLoading();
