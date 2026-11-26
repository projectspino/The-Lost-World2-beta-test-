
const STORAGE_KEY = "lost_world_quests_v1";

const DEFAULT_QUESTS = [
  {
    id: "goblin_hunter",
    title: "Pemburu Goblin",
    description: "Kalahkan 5 Goblin.",
    target: "Goblin",
    required: 5,
    rewardXP: 100,
    rewardGold: 50,
  },
  {
    id: "forest_gatherer",
    title: "Pengumpul Hutan",
    description: "Kumpulkan 10 Wood.",
    target: "Wood",
    required: 10,
    rewardXP: 75,
    rewardGold: 30,
  },
  {
    id: "skeleton_slayer",
    title: "Penakluk Tengkorak",
    description: "Kalahkan 3 Skeleton.",
    target: "Skeleton",
    required: 3,
    rewardXP: 150,
    rewardGold: 75,
  },
];

export function createQuestSystem(playerStats, inventory) {
  const quests = DEFAULT_QUESTS.map((quest) => ({
    ...quest,
    progress: 0,
    accepted: false,
    completed: false,
    claimed: false,
  }));

  function getQuests() {
    return quests.map((quest) => ({ ...quest }));
  }

  function acceptQuest(id) {
    const quest = quests.find((item) => item.id === id);

    if (!quest || quest.accepted || quest.claimed) {
      return false;
    }

    quest.accepted = true;
    return true;
  }

  function addProgress(target, amount = 1) {
    if (
      typeof target !== "string" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return false;
    }

    let changed = false;

    for (const quest of quests) {
      if (
        !quest.accepted ||
        quest.completed ||
        quest.claimed ||
        quest.target !== target
      ) {
        continue;
      }

      quest.progress = Math.min(
        quest.required,
        quest.progress + Math.floor(amount)
      );

      if (quest.progress >= quest.required) {
        quest.completed = true;
      }

      changed = true;
    }

    return changed;
  }

  function claimReward(id) {
    const quest = quests.find((item) => item.id === id);

    if (!quest || !quest.completed || quest.claimed) {
      return false;
    }

    if (
      !playerStats ||
      typeof playerStats.addXP !== "function" ||
      typeof playerStats.addGold !== "function"
    ) {
      return false;
    }

    const xpResult = playerStats.addXP(quest.rewardXP);

    if (xpResult === false) {
      return false;
    }

    const goldResult = playerStats.addGold(quest.rewardGold);

    if (goldResult === false) {
      return false;
    }

    quest.claimed = true;
    return true;
  }

  function saveQuests() {
    try {
      if (typeof localStorage === "undefined") return false;

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          quests: quests.map((quest) => ({
            id: quest.id,
            progress: quest.progress,
            accepted: quest.accepted,
            completed: quest.completed,
            claimed: quest.claimed,
          })),
        })
      );

      return true;
    } catch (error) {
      console.error("Gagal menyimpan quest:", error);
      return false;
    }
  }

  function loadQuests() {
    try {
      if (typeof localStorage === "undefined") return false;

      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const saved = JSON.parse(raw);

      if (
        !saved ||
        saved.version !== 1 ||
        !Array.isArray(saved.quests)
      ) {
        return false;
      }

      for (const savedQuest of saved.quests) {
        if (!savedQuest || typeof savedQuest.id !== "string") {
          continue;
        }

        const quest = quests.find(
          (item) => item.id === savedQuest.id
        );

        if (!quest) continue;

        const progress = Number(savedQuest.progress);

        if (!Number.isFinite(progress) || progress < 0) {
          continue;
        }

        quest.progress = Math.min(
          quest.required,
          Math.floor(progress)
        );

        quest.accepted = Boolean(savedQuest.accepted);
        quest.completed =
          Boolean(savedQuest.completed) ||
          quest.progress >= quest.required;

        quest.claimed = Boolean(savedQuest.claimed);

        if (quest.claimed) {
          quest.accepted = true;
          quest.completed = true;
        }
      }

      return true;
    } catch (error) {
      console.error("Gagal memuat quest:", error);
      return false;
    }
  }

  function resetQuests() {
    for (const quest of quests) {
      quest.progress = 0;
      quest.accepted = false;
      quest.completed = false;
      quest.claimed = false;
    }

    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Gagal mereset quest:", error);
    }

    return true;
  }

  return {
    getQuests,
    acceptQuest,
    addProgress,
    claimReward,
    saveQuests,
    loadQuests,
    resetQuests,
  };
}
