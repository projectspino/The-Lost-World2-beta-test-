
import * as BABYLON from "@babylonjs/core";
import "./styles/menu.css";
import { buildWorld } from "./world.js";
import { createPlayerController } from "./player-controller.js";

const app = document.getElementById("app");

let engine = null;
let scene = null;
let camera = null;
let player = null;
let disposePlayerController = null;

let selectedCharacter = "Ksatria";

const characters = [
  { name: "Ksatria", icon: "⚔️", description: "Petarung tangguh dengan pedang dan perisai." },
  { name: "Pemanah", icon: "🏹", description: "Ahli serangan jarak jauh." },
  { name: "Penyihir", icon: "🔮", description: "Pengguna kekuatan sihir." },
  { name: "Assassin", icon: "🗡️", description: "Petarung cepat dan lincah." },
  { name: "Paladin", icon: "🛡️", description: "Pelindung dengan kekuatan suci." },
  { name: "Druid", icon: "🌿", description: "Pengendali kekuatan alam." }
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

  document.getElementById("play-button").onclick = showCharacterSelect;
  document.getElementById("settings-button").onclick = showSettings;
}

function showCharacterSelect() {
  const cards = characters.map(character => `
    <button class="character ${
      character.name === selectedCharacter ? "selected" : ""
    }" data-character="${character.name}">
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
          <input type="checkbox" id="shadows"
            ${settings.shadows ? "checked" : ""}>
        </div>

        <div class="setting-row">
          <label for="particles">Particle Effects</label>
          <input type="checkbox" id="particles"
            ${settings.particles ? "checked" : ""}>
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

  document.getElementById("back-button").onclick = showMainMenu;
}

function startGame() {
  app.innerHTML = `
    <div id="game-container">
      <canvas id="game-canvas"></canvas>

      <div class="game-hud">
        <div class="hero-info">
          <strong>${selectedCharacter}</strong>
          <span>Level 1 • The Lost World</span>
        </div>
        <button id="exit-game">MENU</button>
      </div>

      <div class="game-controls">
        <div class="joystick" id="joystick">✥</div>
        <button id="jump-button">JUMP</button>
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
    { height: 2, radius: 0.45 },
    scene
  );

  player.position.y = 1;

  const playerMaterial = new BABYLON.StandardMaterial(
    "player-material",
    scene
  );

  playerMaterial.diffuseColor = new BABYLON.Color3(0.65, 0.72, 0.82);
  player.material = playerMaterial;

  camera.lockedTarget = player;

  // Membuat lingkungan dunia fantasi
  buildWorld(scene);

  // Mengaktifkan kontrol karakter
  const joystick = document.getElementById("joystick");
  const jumpButton = document.getElementById("jump-button");

  disposePlayerController = createPlayerController(
    scene,
    camera,
    player,
    joystick,
    jumpButton
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

  window.removeEventListener("resize", resizeEngine);

  if (engine) {
    engine.stopRenderLoop();
    engine.dispose();
  }

  engine = null;
  scene = null;
  camera = null;
  player = null;

  showMainMenu();
}

showLoading();
      
