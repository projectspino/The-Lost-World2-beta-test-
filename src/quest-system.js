
const QUEST_SAVE_KEY = "the-lost-world-quests";

export function createQuestSystem(playerStats, inventory) {
  const quests = [
    {
      id: "goblin_hunt",
      title: "Pemburu Goblin",
      description: "Kalahkan 5 Goblin.",
      target: "Goblin",
      required: 5,
      progress: 0,
      rewardXP: 100,
      rewardItems: [
        { name: "Health Potion", amount: 2 }
      ],
      accepted: false,
      completed: false,
      claimed: false
    },
    {
      id: "skeleton_hunt",
      title: "Penjaga Reruntuhan",
      description: "Kalahkan 3 Skeleton.",
      target: "Skeleton",
      required: 3,
      progress: 0,
      rewardXP: 150,
      rewardItems: [
        { name: "Goblin Token", amount: 2 }
      ],
      accepted: false,
      completed: false,
      claimed: false
    },
    {
      id: "collect_wood",
      title: "Persediaan Kayu",
      description: "Kumpulkan 10 Wood.",
      target: "Wood",
      required: 10,
      progress: 0,
      rewardXP: 75,
      rewardItems: [
        { name: "Health Potion", amount: 1 }
      ],
      accepted: false,
      completed: false,
      claimed: false
    }
  ];

  function getQuests() {
    return quests.map(quest => ({
      ...quest,
      rewardItems: quest.rewardItems.map(item => ({ ...item }))
    }));
  }

  function getQuest(id) {
    const quest = quests.find(item => item.id === id);

    if (!quest) return null;

    return {
      ...quest,
      rewardItems: quest.rewardItems.map(item => ({ ...item }))
    };
  }

  function saveQuests() {
    try {
      const data = quests.map(quest => ({
        id: quest.id,
        progress: quest.progress,
        accepted: quest.accepted,
        completed: quest.completed,
        claimed: quest.claimed
      }));

      localStorage.setItem(
        QUEST_SAVE_KEY,
        JSON.stringify({
          version: 1,
          quests: data
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
      const savedData = localStorage.getItem(QUEST_SAVE_KEY);

      if (!savedData) return false;

      const data = JSON.parse(savedData);

      if (!data || !Array.isArray(data.quests)) {
        return false;
      }

      data.quests.forEach(savedQuest => {
        const quest = quests.find(
          item => item.id === savedQuest.id
        );

        if (!quest) return;

        const progress = Number(savedQuest.progress);

        quest.progress = Number.isFinite(progress)
          ? Math.max(0, Math.min(quest.required, progress))
          : 0;

        quest.accepted = savedQuest.accepted === true;
        quest.claimed = savedQuest.claimed === true;

        quest.completed =
          savedQuest.completed === true ||
          quest.progress >= quest.required;

        if (quest.claimed) {
          quest.accepted = true;
          quest.completed = true;
        }
      });

      return true;
    } catch (error) {
      console.error("Gagal memuat quest:", error);
      return false;
    }
  }

  function deleteQuestSave() {
    try {
      localStorage.removeItem(QUEST_SAVE_KEY);
      return true;
    } catch (error) {
      console.error("Gagal menghapus save quest:", error);
      return false;
    }
  }

  function acceptQuest(id) {
    const quest = quests.find(item => item.id === id);

    if (!quest || quest.accepted || quest.claimed) {
      return false;
    }

    quest.accepted = true;
    saveQuests();

    return true;
  }

  function addProgress(target, amount = 1) {
    if (amount <= 0) return;

    let changed = false;

    quests.forEach(quest => {
      if (
        quest.accepted &&
        !quest.completed &&
        !quest.claimed &&
        quest.target === target
      ) {
        quest.progress = Math.min(
          quest.required,
          quest.progress + amount
        );

        if (quest.progress >= quest.required) {
          quest.completed = true;
        }

        changed = true;
      }
    });

    if (changed) {
      saveQuests();
    }
  }

  function claimReward(id) {
    const quest = quests.find(item => item.id === id);

    if (
      !quest ||
      !quest.completed ||
      quest.claimed
    ) {
      return false;
    }

    if (playerStats) {
      playerStats.addXP(quest.rewardXP);
    }

    if (inventory) {
      quest.rewardItems.forEach(item => {
        inventory.addItem(item.name, item.amount);
      });
    }

    quest.claimed = true;
    saveQuests();

    return true;
  }

  function getActiveQuests() {
    return getQuests().filter(
      quest => quest.accepted && !quest.claimed
    );
  }

  return {
    getQuests,
    getQuest,
    getActiveQuests,
    acceptQuest,
    addProgress,
    claimReward,
    saveQuests,
    loadQuests,
    deleteQuestSave
  };
}
