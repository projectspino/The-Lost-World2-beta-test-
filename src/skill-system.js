
const SKILL_SAVE_KEY = "the-lost-world-skills";

const SKILL_CATALOG = [
  {
    id: "power_strike",
    name: "Power Strike",
    description: "Serangan kuat kepada satu musuh.",
    manaCost: 10,
    cooldown: 3,
    unlockLevel: 1,
    type: "damage",
    power: 2
  },
  {
    id: "fireball",
    name: "Fireball",
    description: "Meluncurkan bola api kepada musuh.",
    manaCost: 20,
    cooldown: 5,
    unlockLevel: 3,
    type: "damage",
    power: 3
  },
  {
    id: "healing_light",
    name: "Healing Light",
    description: "Memulihkan HP pemain.",
    manaCost: 25,
    cooldown: 8,
    unlockLevel: 2,
    type: "heal",
    power: 40
  },
  {
    id: "frost_nova",
    name: "Frost Nova",
    description: "Serangan es untuk beberapa musuh.",
    manaCost: 35,
    cooldown: 12,
    unlockLevel: 5,
    type: "area",
    power: 2
  }
];

export function createSkillSystem(playerStats, options = {}) {
  const maxMana = Math.max(1, options.maxMana ?? 100);
  const onCast =
    typeof options.onCast === "function"
      ? options.onCast
      : null;

  let mana = maxMana;
  let unlockedSkills = ["power_strike"];
  const cooldowns = new Map();

  function getLevel() {
    return Math.max(1, Number(playerStats?.stats?.level ?? 1));
  }

  function getCatalog() {
    return SKILL_CATALOG.map(skill => ({
      ...skill,
      unlocked: unlockedSkills.includes(skill.id),
      cooldownRemaining: cooldowns.get(skill.id) ?? 0
    }));
  }

  function getStatus() {
    return {
      mana,
      maxMana,
      unlockedSkills: [...unlockedSkills],
      cooldowns: Object.fromEntries(cooldowns)
    };
  }

  function unlockSkill(skillId) {
    const skill = SKILL_CATALOG.find(item => item.id === skillId);

    if (!skill) return false;
    if (unlockedSkills.includes(skillId)) return false;
    if (getLevel() < skill.unlockLevel) return false;

    unlockedSkills.push(skillId);
    return true;
  }

  function regenerateMana(amount = 5) {
    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      return false;
    }

    mana = Math.min(maxMana, mana + value);
    return true;
  }

  function update(deltaSeconds = 1) {
    const delta = Number(deltaSeconds);

    if (!Number.isFinite(delta) || delta <= 0) {
      return false;
    }

    for (const [skillId, remaining] of cooldowns.entries()) {
      const next = Math.max(0, remaining - delta);

      if (next === 0) {
        cooldowns.delete(skillId);
      } else {
        cooldowns.set(skillId, next);
      }
    }

    regenerateMana(3 * delta);
    return true;
  }

  function castSkill(skillId, target = null) {
    const skill = SKILL_CATALOG.find(item => item.id === skillId);

    if (!skill) {
      return { success: false, message: "Skill tidak ditemukan." };
    }

    if (!unlockedSkills.includes(skillId)) {
      return { success: false, message: "Skill belum terbuka." };
    }

    if (getLevel() < skill.unlockLevel) {
      return { success: false, message: "Level pemain belum cukup." };
    }

    if ((cooldowns.get(skillId) ?? 0) > 0) {
      return { success: false, message: "Skill masih cooldown." };
    }

    if (mana < skill.manaCost) {
      return { success: false, message: "Mana tidak cukup." };
    }

    const result = {
      skillId: skill.id,
      name: skill.name,
      type: skill.type,
      power: skill.power,
      target
    };

    if (onCast) {
      try {
        const callbackResult = onCast(result);

        if (callbackResult === false) {
          return {
            success: false,
            message: "Skill gagal digunakan."
          };
        }
      } catch (error) {
        console.error("Gagal menjalankan skill:", error);

        return {
          success: false,
          message: "Terjadi kesalahan saat menggunakan skill."
        };
      }
    }

    mana -= skill.manaCost;
    cooldowns.set(skillId, skill.cooldown);

    return {
      success: true,
      message: skill.name + " berhasil digunakan.",
      skill: result,
      mana
    };
  }

  function saveSkills() {
    try {
      localStorage.setItem(
        SKILL_SAVE_KEY,
        JSON.stringify({
          version: 1,
          mana,
          unlockedSkills
        })
      );

      return true;
    } catch (error) {
      console.error("Gagal menyimpan skill:", error);
      return false;
    }
  }

  function loadSkills() {
    try {
      const raw = localStorage.getItem(SKILL_SAVE_KEY);
      if (!raw) return false;

      const data = JSON.parse(raw);

      if (!data || data.version !== 1) return false;

      const validSkills = SKILL_CATALOG
        .filter(skill =>
          Array.isArray(data.unlockedSkills) &&
          data.unlockedSkills.includes(skill.id) &&
          getLevel() >= skill.unlockLevel
        )
        .map(skill => skill.id);

      unlockedSkills = [
        "power_strike",
        ...validSkills.filter(id => id !== "power_strike")
      ];

      const savedMana = Number(data.mana);

      mana = Number.isFinite(savedMana)
        ? Math.max(0, Math.min(maxMana, savedMana))
        : maxMana;

      cooldowns.clear();
      return true;
    } catch (error) {
      console.error("Gagal memuat skill:", error);
      return false;
    }
  }

  function resetSkills() {
    mana = maxMana;
    unlockedSkills = ["power_strike"];
    cooldowns.clear();

    try {
      localStorage.removeItem(SKILL_SAVE_KEY);
      return true;
    } catch (error) {
      console.error("Gagal mereset skill:", error);
      return false;
    }
  }

  return {
    getCatalog,
    getStatus,
    unlockSkill,
    regenerateMana,
    update,
    castSkill,
    saveSkills,
    loadSkills,
    resetSkills
  };
        }
        
