export class AudioSystem {
  constructor(options = {}) {
    this.musicVolume = options.musicVolume ?? 0.7;
    this.sfxVolume = options.sfxVolume ?? 0.8;

    this.sounds = new Map();
    this.music = null;
    this.enabled = true;
  }

  loadSound(name, url, options = {}) {
    if (!name || !url) return false;

    const audio = new Audio(url);

    audio.preload = "auto";
    audio.loop = options.loop ?? false;
    audio.volume = this.sfxVolume;

    this.sounds.set(name, audio);

    return true;
  }

  async playSound(name) {
    if (!this.enabled) return false;

    const sound = this.sounds.get(name);

    if (!sound) return false;

    try {
      sound.currentTime = 0;
      sound.volume = this.sfxVolume;
      await sound.play();
      return true;
    } catch {
      return false;
    }
  }

  async playMusic(url) {
    if (!this.enabled || !url) return false;

    this.stopMusic();

    this.music = new Audio(url);
    this.music.loop = true;
    this.music.volume = this.musicVolume;

    try {
      await this.music.play();
      return true;
    } catch {
      return false;
    }
  }

  pauseMusic() {
    if (!this.music) return false;

    this.music.pause();
    return true;
  }

  resumeMusic() {
    if (!this.music || !this.enabled) return false;

    return this.music.play().then(
      () => true,
      () => false
    );
  }

  stopMusic() {
    if (!this.music) return;

    this.music.pause();
    this.music.currentTime = 0;
    this.music = null;
  }

  setMusicVolume(value) {
    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value > 1
    ) {
      return false;
    }

    this.musicVolume = value;

    if (this.music) {
      this.music.volume = value;
    }

    return true;
  }

  setSFXVolume(value) {
    if (
      !Number.isFinite(value) ||
      value < 0 ||
      value > 1
    ) {
      return false;
    }

    this.sfxVolume = value;

    for (const sound of this.sounds.values()) {
      sound.volume = value;
    }

    return true;
  }

  setEnabled(value) {
    this.enabled = Boolean(value);

    if (!this.enabled) {
      this.stopMusic();

      for (const sound of this.sounds.values()) {
        sound.pause();
        sound.currentTime = 0;
      }
    }
  }

  dispose() {
    this.stopMusic();

    for (const sound of this.sounds.values()) {
      sound.pause();
      sound.src = "";
    }

    this.sounds.clear();
  }
}
