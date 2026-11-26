
export class AssetLoader {
  constructor(scene, BABYLON) {
    if (!scene || !BABYLON) {
      throw new Error("Scene atau Babylon.js tidak tersedia.");
    }

    this.scene = scene;
    this.BABYLON = BABYLON;
    this.loadedAssets = new Map();
    this.loadingAssets = new Map();
    this.disposed = false;
  }

  async loadTexture(name, url, options = {}) {
    this.validate(name, url);

    if (this.loadedAssets.has(name)) {
      return this.loadedAssets.get(name);
    }

    if (this.loadingAssets.has(name)) {
      return this.loadingAssets.get(name);
    }

    const promise = new Promise((resolve, reject) => {
      let texture;

      texture = new this.BABYLON.Texture(
        url,
        this.scene,
        options.noMipmap ?? false,
        options.invertY ?? true,
        options.samplingMode,
        () => resolve(texture),
        (_message, error) => reject(
          error || new Error(`Gagal memuat tekstur: ${name}`)
        )
      );
    });

    this.loadingAssets.set(name, promise);

    try {
      const texture = await promise;

      if (this.disposed) {
        texture.dispose();
        throw new Error("AssetLoader sudah dihentikan.");
      }

      this.loadedAssets.set(name, texture);
      return texture;
    } finally {
      this.loadingAssets.delete(name);
    }
  }

  async loadModel(name, rootUrl, fileName) {
    this.validate(name, rootUrl);

    if (!fileName) {
      throw new Error("Nama file model wajib diisi.");
    }

    if (this.loadedAssets.has(name)) {
      return this.loadedAssets.get(name);
    }

    if (this.loadingAssets.has(name)) {
      return this.loadingAssets.get(name);
    }

    const loader = this.BABYLON.SceneLoader;

    if (!loader?.ImportMeshAsync) {
      throw new Error("Babylon SceneLoader tidak tersedia.");
    }

    const promise = loader.ImportMeshAsync(
      "",
      rootUrl,
      fileName,
      this.scene
    );

    this.loadingAssets.set(name, promise);

    try {
      const result = await promise;

      if (this.disposed) {
        result.meshes?.forEach(mesh => mesh.dispose());
        result.particleSystems?.forEach(item => item.dispose());
        result.skeletons?.forEach(item => item.dispose());
        result.animationGroups?.forEach(item => item.dispose());
        throw new Error("AssetLoader sudah dihentikan.");
      }

      this.loadedAssets.set(name, result);
      return result;
    } finally {
      this.loadingAssets.delete(name);
    }
  }

  validate(name, url) {
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof url !== "string" ||
      !url.trim()
    ) {
      throw new Error("Nama dan lokasi aset wajib diisi.");
    }

    if (this.disposed) {
      throw new Error("AssetLoader sudah dihentikan.");
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

    if (typeof asset.dispose === "function") {
      asset.dispose();
    } else {
      asset.animationGroups?.forEach(item => item.dispose());
      asset.particleSystems?.forEach(item => item.dispose());
      asset.skeletons?.forEach(item => item.dispose());
      asset.meshes?.forEach(item => item.dispose());
    }

    this.loadedAssets.delete(name);
    return true;
  }

  dispose() {
    if (this.disposed) return;

    this.disposed = true;

    for (const name of [...this.loadedAssets.keys()]) {
      this.removeAsset(name);
    }

    this.loadingAssets.clear();
    this.scene = null;
    this.BABYLON = null;
  }
}
