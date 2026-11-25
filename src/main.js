
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/core/Helpers/sceneHelpers";

const app = document.getElementById("app");

const characters = [
  { id: "knight", name: "Ksatria", role: "Warrior", desc: "Petarung dengan pertahanan kuat.", icon: "⚔️" },
  { id: "archer", name: "Pemanah", role: "Ranger", desc: "Ahli serangan jarak jauh.", icon: "🏹" },
  { id: "mage", name: "Penyihir", role: "Mage", desc: "Pengendali kekuatan elemen.", icon: "🔮" },
  { id: "assassin", name: "Assassin", role: "Rogue", desc: "Cepat, lincah, dan sulit ditebak.", icon: "🗡️" },
  { id: "paladin", name: "Paladin", role: "Holy Knight", desc: "Pelindung dengan kekuatan suci.", icon: "🛡️" },
  { id: "druid", name: "Druid", role: "Nature Guardian", desc: "Menggunakan kekuatan alam.", icon: "🌿" }
];

const defaults = {
  quality: "medium",
  shadows: true,
  particles: true,
  fps: 60
};

let settings = loadSettings();
let selectedCharacter = "knight";

function loadSettings() {
  try {
    return {
      ...defaults,
      ...JSON.parse(localStorage.getItem("tlw_settings") || "{}")
    };
  } catch {
    return { ...defaults };
  }
}

function saveSettings() {
  localStorage.setItem("tlw_settings", JSON.stringify(settings));
}

const style = document.createElement("style");

style.textContent = `
* { box-sizing: border-box; }

body {
  margin: 0;
  background: #101713;
  color: #f5ead4;
  font-family: Georgia, serif;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.screen {
  min-height: 100vh;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background:
    linear-gradient(#08120ab8, #08120af2),
    radial-gradient(ellipse at center, #536c43, #101713 75%);
}

.logo {
  font-size: clamp(30px, 7vw, 58px);
  font-weight: bold;
  letter-spacing: 5px;
  text-shadow: 0 4px 15px #000;
  animation: logoIn 1.4s ease both;
}

.subtitle {
  color: #c9a96b;
  letter-spacing: 4px;
  font-size: 11px;
  margin-top: 10px;
}

.menu {
  width: min(100%, 360px);
  display: grid;
  gap: 12px;
  margin-top: 35px;
}

.game-button {
  border: 1px solid #b99555;
  background: linear-gradient(110deg, #58401f, #8b6736);
  color: white;
  padding: 15px;
  font-size: 15px;
  letter-spacing: 1px;
  border-radius: 5px;
  cursor: pointer;
}

.game-button.secondary {
  background: #17231ddd;
  border-color: #77704e;
}

.game-button:active {
  transform: scale(.97);
}

.panel {
  width: min(100%, 650px);
  background: #142019ee;
  border: 1px solid #907348;
  border-radius: 10px;
  padding: 22px;
  box-shadow: 0 10px 40px #0008;
}

.panel h2 {
  color: #d9b978;
  letter-spacing: 2px;
}

.character-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 20px 0;
}

.character {
  background: #26372c;
  border: 1px solid #64745a;
  border-radius: 8px;
  color: white;
  padding: 15px 5px;
  cursor: pointer;
}

.character.selected {
  border: 2px solid #e0b75f;
  background: #594326;
}

.character-icon {
  display: block;
  font-size: 30px;
  margin-bottom: 8px;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 13px 0;
  border-bottom: 1px solid #ffffff20;
  text-align: left;
}

.setting-row select {
  max-width: 145px;
  background: #26372c;
  color: white;
  border: 1px solid #9b8358;
  padding: 9px;
  border-radius: 5px;
}

.setting-row input {
  width: 22px;
  height: 22px;
  accent-color: #c59b4f;
}

.description {
  color: #c5c0ad;
  font-size: 13px;
  line-height: 1.6;
}

#gameCanvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
}

#gameScreen {
  position: fixed;
  inset: 0;
  background: #18251c;
}

#gameHUD {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

#gameTitle {
  position: absolute;
  top: 15px;
  left: 15px;
  text-shadow: 0 2px 5px black;
}

#joystick {
  position: absolute;
  left: 25px;
  bottom: 25px;
  width: 115px;
  height: 115px;
  border: 2px solid #ffffff77;
  border-radius: 50%;
  background: #ffffff22;
  pointer-events: auto;
  touch-action: none;
}

#stick {
  position: absolute;
  left: 32px;
  top: 32px;
  width: 47px;
  height: 47px;
  border-radius: 50%;
  background: #ffffffbb;
}

#jumpButton {
  position: absolute;
  right: 25px;
  bottom: 35px;
  width: 75px;
  height: 75px;
  border: 2px solid #e6c17a;
  border-radius: 50%;
  background: #785328dd;
  color: white;
  pointer-events: auto;
}

@keyframes logoIn {
  from { opacity: 0; transform: translateY(25px) scale(.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 500px) {
  .screen { padding: 14px; }
  .panel { padding: 15px; }
  .character-grid { gap: 6px; }
  .character { font-size: 12px; }
}
`;

document.head.appendChild(style);

function showLoading() {
  app.innerHTML = `
    <section class="screen">
      <div class="logo">THE LOST WORLD</div>
      <div class="subtitle">AN EPIC FANTASY ADVENTURE</div>
      <p class="description">Preparing your adventure...</p>
      <div style="width:230px;height:5px;background:#ffffff33;margin-top:20px;border-radius:10px;overflow:hidden">
        <div id="progress" style="height:100%;width:0;background:#d7ad62;transition:width 2s"></div>
      </div>
    </section>
  `;

  setTimeout(() => {
    const bar = document.getElementById("progress");
    if (bar) bar.style.width = "100%";
  }, 100);

  setTimeout(showMainMenu, 2200);
}

function showMainMenu() {
  app.innerHTML = `
    <section class="screen">
      <div class="logo">THE LOST WORLD 2.0</div>
      <div class="subtitle">A WORLD BEYOND LEGENDS</div>
      <p class="description">
        Explore kingdoms, discover ancient secrets,<br>
        and begin your own legendary adventure.
      </p>

      <div class="menu">
        <button class="game-button" id="start">START ADVENTURE</button>
        <button class="game-button secondary" id="characters">CHARACTER SELECT</button>
        <button class="game-button secondary" id="settings">GRAPHICS SETTINGS</button>
      </div>

      <p class="description">BETA VERSION · 2.0</p>
    </section>
  `;

  document.getElementById("start").onclick = startGame;
  document.getElementById("characters").onclick = showCharacters;
  document.getElementById("settings").onclick = showSettings;
}

function showCharacters() {
  app.innerHTML = `
    <section class="screen">
      <div class="panel">
        <h2>CHOOSE YOUR HERO</h2>
        <p class="description">Pilih karakter untuk memulai petualangan.</p>

        <div class="character-grid">
          ${characters.map(c => `
            <button class="character ${selectedCharacter === c.id ? "selected" : ""}"
              data-id="${c.id}">
              <span class="character-icon">${c.icon}</span>
              ${c.name}
            </button>
          `).join("")}
        </div>

        <h3 id="characterName"></h3>
        <p id="characterDescription" class="description"></p>

        <button class="game-button" id="confirmCharacter">CONFIRM CHARACTER</button>
        <button class="game-button secondary" id="back">BACK</button>
      </div>
    </section>
  `;

  function updateCharacter() {
    const c = characters.find(x => x.id === selectedCharacter);

    document.getElementById("characterName").textContent =
      c.name + " · " + c.role;

    document.getElementById("characterDescription").textContent =
      c.desc;

    document.querySelectorAll(".character").forEach(button => {
      button.classList.toggle(
        "selected",
        button.dataset.id === selectedCharacter
      );
    });
  }

  document.querySelectorAll(".character").forEach(button => {
    button.onclick = () => {
      selectedCharacter = button.dataset.id;
      updateCharacter();
    };
  });

  document.getElementById("confirmCharacter").onclick = () => {
    localStorage.setItem("tlw_character", selectedCharacter);
    showMainMenu();
  };

  document.getElementById("back").onclick = showMainMenu;

  updateCharacter();
}

function showSettings() {
  app.innerHTML = `
    <section class="screen">
      <div class="panel">
        <h2>GRAPHICS SETTINGS</h2>

        <div class="setting-row">
          <label for="quality">Graphics Quality</label>
          <select id="quality">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="ultra">Ultra</option>
          </select>
        </div>

        <div class="setting-row">
          <label for="shadows">Shadows</label>
          <input id="shadows" type="checkbox">
        </div>

        <div class="setting-row">
          <label for="particles">Particle Effects</label>
          <input id="particles" type="checkbox">
        </div>

        <div class="setting-row">
          <label for="fps">Target FPS</label>
          <select id="fps">
            <option value="30">30 FPS</option>
            <option value="45">45 FPS</option>
            <option value="60">60 FPS</option>
          </select>
        </div>

        <p class="description">
          Target FPS adalah batas target, bukan jaminan performa.
        </p>

        <button class="game-button" id="apply">APPLY SETTINGS</button>
        <button class="game-button secondary" id="reset">RESTORE DEFAULT</button>
        <button class="game-button secondary" id="back">BACK</button>
      </div>
    </section>
  `;

  document.getElementById("quality").value = settings.quality;
  document.getElementById("shadows").checked = settings.shadows;
  document.getElementById("particles").checked = settings.particles;
  document.getElementById("fps").value = String(settings.fps);

  document.getElementById("apply").onclick = () => {
    settings.quality = document.getElementById("quality").value;
    settings.shadows = document.getElementById("shadows").checked;
    settings.particles = document.getElementById("particles").checked;
    settings.fps = Number(document.getElementById("fps").value);

    saveSettings();
    alert("Pengaturan berhasil disimpan!");
  };

  document.getElementById("reset").onclick = () => {
    settings = { ...defaults };
    saveSettings();
    showSettings();
  };

  document.getElementById("back").onclick = showMainMenu;
}

function startGame() {
  app.innerHTML = `
    <div id="gameScreen">
      <canvas id="gameCanvas"></canvas>
      <div id="gameHUD">
        <div id="gameTitle">THE LOST WORLD 2.0</div>
        <div id="joystick"><div id="stick"></div></div>
        <button id="jumpButton">JUMP</button>
      </div>
    </div>
  `;

  createWorld();
}

function createWorld() {
  const canvas = document.getElementById("gameCanvas");
  const engine = new BABYLON.Engine(canvas, true, {
    antialias: settings.quality !== "low",
    preserveDrawingBuffer: false,
    stencil: true
  });

  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.55, 0.72, 0.85, 1);

  const light = new BABYLON.HemisphericLight(
    "ambient",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );

  light.intensity = 0.9;

  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 250, height: 250, subdivisions: 40 },
    scene
  );

  const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.22, 0.35, 0.20);
  ground.material = groundMat;

  const player = BABYLON.MeshBuilder.CreateCapsule(
    "player",
    { height: 2.2, radius: 0.5 },
    scene
  );

  player.position.y = 1.1;

  const playerMat = new BABYLON.StandardMaterial("playerMat", scene);
  playerMat.diffuseColor = new BABYLON.Color3(0.15, 0.35, 0.8);
  player.material = playerMat;

  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    1.15,
    10,
    player.position,
    scene
  );

  camera.lowerRadiusLimit = 5;
  camera.upperRadiusLimit = 16;
  camera.attachControl(canvas, true);

  // Contoh kastil sederhana untuk pengujian dunia.
  const castle = BABYLON.MeshBuilder.CreateBox(
    "castle",
    { width: 20, height: 12, depth: 16 },
    scene
  );

  castle.position.set(0, 6, 35);

  const castleMat = new BABYLON.StandardMaterial("castleMat", scene);
  castleMat.diffuseColor = new BABYLON.Color3(0.5, 0.46, 0.39);
  castle.material = castleMat;

  let moveX = 0;
  let moveZ = 0;
  let verticalSpeed = 0;
  let grounded = true;

  const joystick = document.getElementById("joystick");
  const stick = document.getElementById("stick");
  let pointer = null;

  joystick.addEventListener("pointerdown", e => {
    pointer = e.pointerId;
    joystick.setPointerCapture(pointer);
  });

  joystick.addEventListener("pointermove", e => {
    if (e.pointerId !== pointer) return;

    const rect = joystick.getBoundingClientRect();
    let dx = e.clientX - (rect.left + rect.width / 2);
    let dy = e.clientY - (rect.top + rect.height / 2);

    const length = Math.hypot(dx, dy);
    const max = 35;

    if (length > max) {
      dx = dx / length * max;
      dy = dy / length * max;
    }

    moveX = dx / max;
    moveZ = -dy / max;
    stick.style.transform = `translate(${dx}px, ${dy}px)`;
  });

  function release() {
    pointer = null;
    moveX = 0;
    moveZ = 0;
    stick.style.transform = "translate(0,0)";
  }

  joystick.addEventListener("pointerup", release);
  joystick.addEventListener("pointercancel", release);

  document.getElementById("jumpButton").onclick = () => {
    if (grounded) {
      verticalSpeed = 8;
      grounded = false;
    }
  };

  engine.runRenderLoop(() => {
    const dt = Math.min(engine.getDeltaTime() / 1000, 0.04);

    const forward = camera.getForwardRay().direction;
    forward.y = 0;
    forward.normalize();

    const right = BABYLON.Vector3.Cross(
      forward,
      BABYLON.Axis.Y
    ).normalize();

    const direction = forward.scale(moveZ).add(
      right.scale(moveX)
    );

    if (direction.length() > 0.1) {
      direction.normalize();
      player.position.addInPlace(direction.scale(6 * dt));

      player.rotation.y = Math.atan2(
        direction.x,
        direction.z
      );
    }

    verticalSpeed -= 20 * dt;
    player.position.y += verticalSpeed * dt;

    if (player.position.y <= 1.1) {
      player.position.y = 1.1;
      verticalSpeed = 0;
      grounded = true;
    }

    camera.target.copyFrom(player.position);
    scene.render();
  });

  window.addEventListener("resize", () => engine.resize());

  window.addEventListener("beforeunload", () => {
    engine.dispose();
  });
}

const savedCharacter = localStorage.getItem("tlw_character");

if (characters.some(c => c.id === savedCharacter)) {
  selectedCharacter = savedCharacter;
}

showLoading();
  
