
const SAVE_KEY = "the_lost_world_save_v1";

export class SaveSystem {
  constructor() {
    this.storageAvailable = this.checkStorage();
  }

  checkStorage() {
    try {
      const testKey = "__tlw_storage_test__";

      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);

      return true;
    } catch {
      return false;
    }
  }

  save(data) {
    if (!this.storageAvailable) {
      return {
        success: false,
        message: "Penyimpanan tidak tersedia."
      };
    }

    if (!data || typeof data !== "object") {
      return {
        success: false,
        message: "Data permainan tidak valid."
      };
    }

    try {
      const saveData = {
        version: 1,
        savedAt: new Date().toISOString(),
        data
      };

      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(saveData)
      );

      return {
        success: true,
        message: "Permainan berhasil disimpan."
      };
    } catch (error) {
      console.error("Save error:", error);

      return {
        success: false,
        message: "Gagal menyimpan permainan."
      };
    }
  }

  load() {
    if (!this.storageAvailable) return null;

    try {
      const rawData = localStorage.getItem(SAVE_KEY);

      if (!rawData) return null;

      const saveData = JSON.parse(rawData);

      if (
        !saveData ||
        saveData.version !== 1 ||
        !saveData.data ||
        typeof saveData.data !== "object" ||
        Array.isArray(saveData.data)
      ) {
        return null;
      }

      return saveData;
    } catch (error) {
      console.error("Load error:", error);
      return null;
    }
  }

  hasSave() {
    return this.load() !== null;
  }

  deleteSave() {
    if (!this.storageAvailable) return false;

    try {
      localStorage.removeItem(SAVE_KEY);
      return true;
    } catch (error) {
      console.error("Delete save error:", error);
      return false;
    }
  }

  getSaveDate() {
    const saveData = this.load();
    return saveData?.savedAt ?? null;
  }
}
