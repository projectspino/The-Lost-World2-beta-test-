const DEFAULT_ACHIEVEMENTS = [
  {
    id: "first_blood",
    name: "First Blood",
    description: "Kalahkan monster pertama.",
    target: 1,
    progress: 0,
    completed: false
  },
  {
    id: "monster_hunter",
    name: "Monster Hunter",
    description: "Kalahkan 50 monster.",
    target: 50,
    progress: 0,
    completed: false
  },
  {
    id: "wood_collector",
    name: "Wood Collector",
    description: "Kumpulkan 100 Wood.",
    target: 100,
    progress: 0,
    completed: false
  },
  {
    id: "dungeon_explorer",
    name: "Dungeon Explorer",
    description: "Selesaikan satu dungeon.",
    target: 1,
    progress: 0,
    completed: false
  }
];

export class AchievementSystem {
  constructor() {
    this.achievements = new Map();

    for (const achievement of DEFAULT_ACHIEVEMENTS) {
      this.achievements.set(achievement.id, {
        ...achievement
      });
    }
  }

  addAchievement(data) {
    if (
      !data?.id ||
      !data.name ||
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

    if (
      !achievement ||
      achievement.completed ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return null;
    }

    achievement.progress = Math.min(
      achievement.target,
      achievement.progress + amount
    );

    if (achievement.progress >= achievement.target) {
      achievement.completed = true;

      return {
        completed: true,
        achievement: { ...achievement }
      };
    }

    return {
      completed: false,
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

  reset() {
    for (const achievement of this.achievements.values()) {
      achievement.progress = 0;
      achievement.completed = false;
    }
  }
  }
