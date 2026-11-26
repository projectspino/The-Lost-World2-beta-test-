export class AssetLoader {
  constructor(scene, BABYLON) {
    if (!scene || !BABYLON) {
      throw new Error("Scene atau Babylon.js tidak tersedia.");
    }

    this.scene = scene;
    this.BABYLON = BABYLON;
    this.loadedAssets = new Map();
    this.loadingAssets = new Set();
  }

  async loadTexture(name, url, options = {}) {
    if (!name || !url) {
      throw new Error("Nama dan URL tekstur wajib diisi.");
    }

    if (this.loadedAssets.has(name)) {
      return this.loadedAssets.get(name);
    }

    if (this.loadingAssets.has(name)) {
      throw new Error(`Aset ${name} sedang dimuat.`);
    }

    this.loadingAssets.add(name);

    try {
      const texture = await new Promise((resolve, reject) => {
        new this.BABYLON.Texture(
          url,
          this.scene,
          options.noMipmap ?? false,
          options.invertY ?? true,
          options.samplingMode,
          resolve,
          reject
        );
      });

      this.loadedAssets.set(name, texture);
      return texture;
    } finally {
      this.loadingAssets.delete(name);
    }
  }

  async loadModel(name, rootUrl, fileName) {
    if (!name || !rootUrl || !fileName) {
      throw new Error("Informasi model belum lengkap.");
    }

    if (this.loadedAssets.has(name)) {
      return this.loadedAssets.get(name);
    }

    const loader = this.BABYLON.SceneLoader;

    if (!loader?.ImportMeshAsync) {
      throw new Error("Babylon SceneLoader tidak tersedia.");
    }

    if (this.loadingAssets.has(name)) {
      throw new Error(`Aset ${name} sedang dimuat.`);
    }

    this.loadingAssets.add(name);

    try {
      const result = await loader.ImportMeshAsync(
        "",
        rootUrl,
        fileName,
        this.scene
      );

      this.loadedAssets.set(name, result);
      return result;
    } finally {
      this.loadingAssets.delete(name);
    }
  }

  getAsset(name) {
    return this.loadedAssets.get(name) ?? null;
  }

  hasAsset(name) {
    return this.loadedAssets.has(name);
  }

  removeAsset(name) {
    const asset = this.loadedAssets.get(name);

    if (!asset) return false;

    if (asset.dispose) {
      asset.dispose();
    } else if (asset.meshes) {
      for (const mesh of asset.meshes) {
        mesh.dispose();
      }
    }

    this.loadedAssets.delete(name);
    return true;
  }

  dispose() {
    for (const name of [...this.loadedAssets.keys()]) {
      this.removeAsset(name);
    }

    this.loadingAssets.clear();
    this.scene = null;
    this.BABYLON = null;
  }
  }
