
const ACHIEVEMENT_SAVE_KEY = "the-lost-world-achievements";

const DEFAULT_ACHIEVEMENTS = [
  {
    id: "first_blood",
    name: "First Blood",
    description: "Kalahkan monster pertama.",
    target: 1
  },
  {
    id: "monster_hunter",
    name: "Monster Hunter",
    description: "Kalahkan 50 monster.",
    target: 50
  },
  {
    id: "wood_collector",
    name: "Wood Collector",
    description: "Kumpulkan 100 Wood.",
    target: 100
  },
  {
    id: "dungeon_explorer",
    name: "Dungeon Explorer",
    description: "Selesaikan satu dungeon.",
    target: 1
  }
];

export class AchievementSystem {
  constructor() {
    this.achievements = new Map();

    for (const achievement of DEFAULT_ACHIEVEMENTS) {
      this.achievements.set(achievement.id, {
        ...achievement,
        progress: 0,
        completed: false
      });
    }
  }

  addAchievement(data) {
    if (
      !data ||
      typeof data.id !== "string" ||
      !data.id.trim() ||
      typeof data.name !== "string" ||
      !data.name.trim() ||
      !Number.isFinite(data.target) ||
      data.target <= 0 ||
      this.achievements.has(data.id)
    ) {
      return false;
    }

    this.achievements.set(data.id, {
      id: data.id,
      name: data.name,
      description: data.description ?? "",
      target: data.target,
      progress: 0,
      completed: false
    });

    return true;
  }

  addProgress(id, amount = 1) {
    const achievement = this.achievements.get(id);
    const value = Number(amount);

    if (
      !achievement ||
      achievement.completed ||
      !Number.isFinite(value) ||
      value <= 0
    ) {
      return null;
    }

    achievement.progress = Math.min(
      achievement.target,
      achievement.progress + value
    );

    if (achievement.progress >= achievement.target) {
      achievement.completed = true;
    }

    return {
      completed: achievement.completed,
      achievement: { ...achievement }
    };
  }

  getAchievement(id) {
    const achievement = this.achievements.get(id);
    return achievement ? { ...achievement } : null;
  }

  getAll() {
    return Array.from(this.achievements.values()).map(
      achievement => ({ ...achievement })
    );
  }

  getCompleted() {
    return this.getAll().filter(
      achievement => achievement.completed
    );
  }

  getCompletionCount() {
    return this.getCompleted().length;
  }

  save() {
    try {
      const data = {
        version: 1,
        achievements: this.getAll()
      };

      localStorage.setItem(
        ACHIEVEMENT_SAVE_KEY,
        JSON.stringify(data)
      );

      return true;
    } catch (error) {
      console.error("Gagal menyimpan achievement:", error);
      return false;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(ACHIEVEMENT_SAVE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw);

      if (
        !data ||
        data.version !== 1 ||
        !Array.isArray(data.achievements)
      ) {
        return false;
      }

      for (const saved of data.achievements) {
        if (!saved || typeof saved.id !== "string") continue;

        const current = this.achievements.get(saved.id);
        if (!current) continue;

        const progress = Number(saved.progress);

        if (!Number.isFinite(progress)) continue;

        current.progress = Math.max(
          0,
          Math.min(current.target, progress)
        );

        current.completed =
          current.progress >= current.target;
      }

      return true;
    } catch (error) {
      console.error("Gagal memuat achievement:", error);
      return false;
    }
  }

  reset() {
    for (const achievement of this.achievements.values()) {
      achievement.progress = 0;
      achievement.completed = false;
    }

    try {
      localStorage.removeItem(ACHIEVEMENT_SAVE_KEY);
      return true;
    } catch (error) {
      console.error("Gagal mereset achievement:", error);
      return false;
    }
  }
}
