
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
    return quests.map(quest => ({ ...quest }));
  }

  function acceptQuest(id) {
    const quest = quests.find(item => item.id === id);

    if (!quest || quest.accepted || quest.claimed) {
      return false;
    }

    quest.accepted = true;
    return true;
  }

  function addProgress(target, amount = 1) {
    if (amount <= 0) return;

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
      }
    });
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
    return true;
  }

  function getActiveQuests() {
    return getQuests().filter(
      quest => quest.accepted && !quest.claimed
    );
  }

  return {
    getQuests,
    getActiveQuests,
    acceptQuest,
    addProgress,
    claimReward
  };
    }
