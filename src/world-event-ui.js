
export class WorldEventUI {
  constructor(options = {}) {
    this.eventSystem = options.eventSystem ?? null;
    this.container = options.container ?? null;
    this.onEventSelect = options.onEventSelect ?? null;

    this.visible = false;
    this.refreshInterval = 0.5;
    this.elapsed = 0;
    this.element = null;

    if (this.container) {
      this.createUI();
    }
  }

  createUI() {
    if (typeof document === "undefined") return false;

    this.element = document.createElement("section");
    this.element.className = "world-event-panel";
    this.element.style.cssText = `
      position: absolute;
      top: 90px;
      right: 12px;
      width: 250px;
      max-height: 65vh;
      overflow-y: auto;
      padding: 14px;
      color: white;
      background: rgba(15, 22, 35, 0.92);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      font-family: sans-serif;
      font-size: 13px;
      z-index: 100;
      display: none;
    `;

    this.container.appendChild(this.element);
    this.render();

    return true;
  }

  update(deltaSeconds) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) return;

    this.elapsed += deltaSeconds;

    if (this.elapsed >= this.refreshInterval) {
      this.elapsed = 0;
      this.render();
    }
  }

  render() {
    if (!this.element || !this.eventSystem) return;

    const active = this.eventSystem.getActiveEvent();
    const events = this.eventSystem.getAvailableEvents();
    const progress = this.eventSystem.getProgress();

    const activeHTML = active
      ? `
        <div style="padding:10px;background:#34445c;border-radius:8px;margin-bottom:12px">
          <strong>${this.escape(active.name)}</strong>
          <p>${this.escape(active.description)}</p>
          <p>Waktu tersisa: ${Math.ceil(active.remaining)} detik</p>
        </div>
      `
      : "<p>Tidak ada event aktif.</p>";

    const eventHTML = events.map(event => `
      <div style="padding:9px;border-bottom:1px solid #445">
        <strong>${this.escape(event.name)}</strong>
        <p>${this.escape(event.description)}</p>
        <small>${event.available ? "Tersedia" : "Belum tersedia"}</small>
        <button
          type="button"
          data-event-id="${this.escape(event.id)}"
          ${event.available ? "" : "disabled"}
          style="display:block;margin-top:6px;padding:6px 10px"
        >
          Mulai Event
        </button>
      </div>
    `).join("");

    this.element.innerHTML = `
      <h3>EVENT DUNIA</h3>
      <p>Diselesaikan: ${progress.completed}/${progress.total}</p>
      <h4>Event Aktif</h4>
      ${activeHTML}
      <h4>Daftar Event</h4>
      ${eventHTML}
    `;

    this.element.querySelectorAll("[data-event-id]").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.eventId;

        if (typeof this.onEventSelect === "function") {
          this.onEventSelect(id);
        }
      });
    });
  }

  escape(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  show() {
    this.visible = true;
    if (this.element) this.element.style.display = "block";
    this.render();
  }

  hide() {
    this.visible = false;
    if (this.element) this.element.style.display = "none";
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  dispose() {
    this.element?.remove();
    this.element = null;
    this.eventSystem = null;
    this.container = null;
    this.onEventSelect = null;
  }
}
