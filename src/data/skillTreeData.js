export const skillNodeStates = {
  locked: "Locked",
  available: "Available",
  unlocked: "Unlocked",
  used: "Used",
};

export const skillEffectTypes = {
  classroomPrivilege: "classroom_privilege",
  rewardBoost: "reward_boost",
  protection: "protection",
  support: "support",
  flexibility: "flexibility",
  fun: "fun",
  costume: "costume",
  title: "title",
  ultimate: "ultimate",
};

export const maxLevel = 30;

export const tierRequiredLevels = {
  1: 1,
  2: 8,
  3: 15,
  4: 25,
};

export const classBaseStats = {
  1: {
    classId: 1,
    className: "Warrior",
    maxHp: 120,
    maxMana: 60,
    role: "Balanced fighter with good HP and moderate Mana.",
  },
  2: {
    classId: 2,
    className: "Mage",
    maxHp: 80,
    maxMana: 120,
    role: "Low HP but high Mana for frequent skill use.",
  },
  3: {
    classId: 3,
    className: "Cleric",
    maxHp: 90,
    maxMana: 100,
    role: "Support class with Mana recovery potential.",
  },
  4: {
    classId: 4,
    className: "Explorer",
    maxHp: 100,
    maxMana: 90,
    role: "Flexible class with balanced HP and Mana.",
  },
  5: {
    classId: 5,
    className: "Guardian",
    maxHp: 150,
    maxMana: 40,
    role: "Tank class with high HP but low Mana.",
  },
  6: {
    classId: 6,
    className: "Bard",
    maxHp: 90,
    maxMana: 100,
    role: "Social support class with good Mana.",
  },
};

export const classSkillThemes = {
  1: {
    classId: 1,
    className: "Chiến Binh",
    englishName: "Warrior",
    icon: "⚔️",
    color: "#f97316",
    glowColor: "rgba(249, 115, 22, 0.35)",
    description:
      "Brave skills for retrying, resisting penalties, and taking on challenges.",
  },
  2: {
    classId: 2,
    className: "Pháp Sư",
    englishName: "Mage",
    icon: "🔮",
    color: "#8b5cf6",
    glowColor: "rgba(139, 92, 246, 0.35)",
    description:
      "Magic skills for hints, knowledge support, and extra thinking time.",
  },
  3: {
    classId: 3,
    className: "Tu Sĩ",
    englishName: "Cleric",
    icon: "🌿",
    color: "#22c55e",
    glowColor: "rgba(34, 197, 94, 0.35)",
    description:
      "Healing skills for support, emotional safety, and team recovery.",
  },
  4: {
    classId: 4,
    className: "Thám Hiểm",
    englishName: "Explorer",
    icon: "🧭",
    color: "#0ea5e9",
    glowColor: "rgba(14, 165, 233, 0.35)",
    description:
      "Flexible skills for movement, swaps, and creative classroom choices.",
  },
  5: {
    classId: 5,
    className: "Hộ Vệ",
    englishName: "Guardian",
    icon: "🛡️",
    color: "#64748b",
    glowColor: "rgba(100, 116, 139, 0.35)",
    description:
      "Protection skills for attendance, HP shields, and team defense.",
  },
  6: {
    classId: 6,
    className: "Thi Sĩ",
    englishName: "Bard",
    icon: "🎻",
    color: "#ec4899",
    glowColor: "rgba(236, 72, 153, 0.35)",
    description:
      "Social skills for music, teamwork, presentation flow, and class energy.",
  },
};

export const levelMilestones = [
  {
    level: 1,
    type: "starter_skill",
    icon: "🌱",
    name: "First Awakening",
    description: "Choose your first starter skill path.",
    reward: { xp: 0, hp: 0, gold: 0, maxHp: 0, skillPoints: 1 },
  },
  {
    level: 2,
    type: "gold",
    icon: "🪙",
    name: "Pocket Gold",
    description: "Gain 10 Gold.",
    reward: { xp: 0, hp: 0, gold: 10, maxHp: 0, skillPoints: 0 },
  },
  {
    level: 3,
    type: "hp",
    icon: "❤️",
    name: "Stronger Spirit",
    description: "Increase team Max HP by 5.",
    reward: { xp: 0, hp: 0, gold: 0, maxHp: 5, skillPoints: 0 },
  },
  {
    level: 4,
    type: "costume",
    icon: "🛡️",
    name: "Iron Armour",
    description: "Unlock the first armour costume.",
    costumeTier: "iron",
  },
  {
    level: 5,
    type: "title",
    icon: "🏅",
    name: "Rising Adventurer",
    description: "Unlock your first character title.",
  },
  {
    level: 6,
    type: "gold",
    icon: "💰",
    name: "Adventure Bonus",
    description: "Gain 15 Gold.",
    reward: { xp: 0, hp: 0, gold: 15, maxHp: 0, skillPoints: 0 },
  },
  {
    level: 7,
    type: "frame",
    icon: "🖼️",
    name: "Bronze Avatar Frame",
    description: "Unlock a basic avatar frame.",
  },
  {
    level: 8,
    type: "skill_point",
    icon: "✨",
    name: "Tier 2 Awakening",
    description: "Gain 1 skill point and unlock Tier 2 skills.",
    reward: { xp: 0, hp: 0, gold: 0, maxHp: 0, skillPoints: 1 },
  },
  {
    level: 9,
    type: "hp",
    icon: "💖",
    name: "Battle Spirit",
    description: "Increase team Max HP by 5.",
    reward: { xp: 0, hp: 0, gold: 0, maxHp: 5, skillPoints: 0 },
  },
  {
    level: 10,
    type: "costume",
    icon: "⚙️",
    name: "Steel Armour",
    description: "Upgrade costume from Iron Armour to Steel Armour.",
    costumeTier: "steel",
  },
  {
    level: 12,
    type: "gold",
    icon: "🪙",
    name: "Quest Bonus",
    description: "Gain 20 Gold.",
    reward: { xp: 0, hp: 0, gold: 20, maxHp: 0, skillPoints: 0 },
  },
  {
    level: 14,
    type: "frame",
    icon: "🖼️",
    name: "Silver Avatar Frame",
    description: "Unlock a silver avatar frame.",
  },
  {
    level: 15,
    type: "skill_point",
    icon: "🌟",
    name: "Tier 3 Awakening",
    description: "Gain 1 skill point and unlock Tier 3 skills.",
    reward: { xp: 0, hp: 0, gold: 0, maxHp: 0, skillPoints: 1 },
  },
  {
    level: 16,
    type: "costume",
    icon: "🥋",
    name: "Knight Armour",
    description: "Upgrade costume from Steel Armour to Knight Armour.",
    costumeTier: "knight",
  },
  {
    level: 18,
    type: "title",
    icon: "🏆",
    name: "Class Champion",
    description: "Unlock a rare class title.",
  },
  {
    level: 20,
    type: "mixed_reward",
    icon: "💎",
    name: "Hero Growth",
    description: "Gain Gold and increase team Max HP.",
    reward: { xp: 0, hp: 0, gold: 25, maxHp: 10, skillPoints: 0 },
  },
  {
    level: 22,
    type: "costume",
    icon: "🔷",
    name: "Crystal Armour",
    description: "Upgrade costume from Knight Armour to Crystal Armour.",
    costumeTier: "crystal",
  },
  {
    level: 24,
    type: "frame",
    icon: "🌌",
    name: "Legendary Avatar Frame",
    description: "Unlock a legendary avatar frame.",
  },
  {
    level: 25,
    type: "ultimate_skill",
    icon: "🌠",
    name: "Ultimate Awakening",
    description: "Gain 1 ultimate skill point and choose 1 ultimate skill.",
    reward: { xp: 0, hp: 0, gold: 0, maxHp: 0, skillPoints: 1 },
  },
  {
    level: 26,
    type: "gold",
    icon: "👑",
    name: "Prestige Gold",
    description: "Gain 30 Gold.",
    reward: { xp: 0, hp: 0, gold: 30, maxHp: 0, skillPoints: 0 },
  },
  {
    level: 28,
    type: "costume",
    icon: "🌟",
    name: "Divine Armour",
    description: "Unlock the highest armour costume: Divine Armour.",
    costumeTier: "divine",
  },
  {
    level: 30,
    type: "final_mastery",
    icon: "👑",
    name: "Final Class Mastery",
    description: "Unlock the final class title and complete the progression map.",
  },
];

export const costumeUnlocks = [
  {
    id: "iron_armour",
    name: "Iron Armour",
    icon: "🛡️",
    tier: "iron",
    requiredLevel: 4,
  },
  {
    id: "steel_armour",
    name: "Steel Armour",
    icon: "⚙️",
    tier: "steel",
    requiredLevel: 10,
  },
  {
    id: "knight_armour",
    name: "Knight Armour",
    icon: "🥋",
    tier: "knight",
    requiredLevel: 16,
  },
  {
    id: "crystal_armour",
    name: "Crystal Armour",
    icon: "🔷",
    tier: "crystal",
    requiredLevel: 22,
  },
  {
    id: "divine_armour",
    name: "Divine Armour",
    icon: "🌟",
    tier: "divine",
    requiredLevel: 28,
  },

  {
    id: "warrior_divine_armour",
    classId: 1,
    name: "Warrior Divine Armour",
    icon: "⚔️",
    tier: "class_divine",
    requiredLevel: 28,
  },
  {
    id: "mage_divine_robe",
    classId: 2,
    name: "Mage Divine Robe",
    icon: "🔮",
    tier: "class_divine",
    requiredLevel: 28,
  },
  {
    id: "cleric_divine_cloak",
    classId: 3,
    name: "Cleric Divine Cloak",
    icon: "🌿",
    tier: "class_divine",
    requiredLevel: 28,
  },
  {
    id: "explorer_divine_coat",
    classId: 4,
    name: "Explorer Divine Coat",
    icon: "🧭",
    tier: "class_divine",
    requiredLevel: 28,
  },
  {
    id: "guardian_divine_plate",
    classId: 5,
    name: "Guardian Divine Plate",
    icon: "🛡️",
    tier: "class_divine",
    requiredLevel: 28,
  },
  {
    id: "bard_divine_stage_outfit",
    classId: 6,
    name: "Bard Divine Stage Outfit",
    icon: "🎻",
    tier: "class_divine",
    requiredLevel: 28,
  },
];

function makeSkill({
  id,
  classId,
  branch,
  tier,
  x,
  y,
  name,
  icon,
  shortDescription,
  description,
  prerequisiteSkillIds = [],
  cost,
  manaCost,
  usesPerWeek,
  usesPerMonth,
  usesPerTerm,
  requiresTeacherApproval = true,
  effectType,
  reward,
  protection,
  isUltimate = false,
}) {
return {
  id,
  classId,
  branch,
  tier,
  position: { x, y },
  name,
  icon,
  shortDescription,
  description,
  cost: cost ?? (isUltimate ? 1 : tier === 3 ? 2 : 1),
  manaCost:
    manaCost ??
    (isUltimate ? 60 : tier === 3 ? 35 : tier === 2 ? 20 : 10),
  requiredLevel: isUltimate ? 25 : tierRequiredLevels[tier],
    prerequisiteSkillIds,
    usesPerWeek,
    usesPerMonth,
    usesPerTerm,
    requiresTeacherApproval,
    effectType,
    reward,
    protection,
    isUltimate,
  };
}

export const skillTrees = {
  1: [
    makeSkill({
      id: "warrior_retry_1",
      classId: 1,
      branch: "retry",
      tier: 1,
      x: 1,
      y: 1,
      name: "Retry Strike",
      icon: "🔁",
      shortDescription: "Redo one classroom task.",
      description:
        "Use this skill to redo one question, mini task, or speaking attempt.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.flexibility,
    }),
    makeSkill({
      id: "warrior_retry_2",
      classId: 1,
      branch: "retry",
      tier: 2,
      x: 1,
      y: 2,
      name: "Second Chance",
      icon: "⚔️",
      shortDescription: "Redo with a small hint.",
      description:
        "Redo one task and receive one small teacher hint before trying again.",
      prerequisiteSkillIds: ["warrior_retry_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.flexibility,
    }),
    makeSkill({
      id: "warrior_retry_3",
      classId: 1,
      branch: "retry",
      tier: 3,
      x: 1,
      y: 3,
      name: "Heroic Comeback",
      icon: "🔥",
      shortDescription: "Turn a redo into bonus XP.",
      description:
        "After redoing a task successfully, the team gains a small XP bonus.",
      prerequisiteSkillIds: ["warrior_retry_2"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.rewardBoost,
      reward: { xp: 10, hp: 0, gold: 0 },
    }),

    makeSkill({
      id: "warrior_snack_1",
      classId: 1,
      branch: "comfort",
      tier: 1,
      x: 2,
      y: 1,
      name: "Snack Warrior",
      icon: "🍪",
      shortDescription: "Eat a light snack once.",
      description:
        "Use this skill to eat a light snack during class at a suitable time.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.classroomPrivilege,
    }),
    makeSkill({
      id: "warrior_snack_2",
      classId: 1,
      branch: "comfort",
      tier: 2,
      x: 2,
      y: 2,
      name: "Snack Share",
      icon: "🍫",
      shortDescription: "Share snack with one teammate.",
      description:
        "Use this skill to share a small snack with one teammate during break or a suitable class moment.",
      prerequisiteSkillIds: ["warrior_snack_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.fun,
    }),
    makeSkill({
      id: "warrior_snack_3",
      classId: 1,
      branch: "comfort",
      tier: 3,
      x: 2,
      y: 3,
      name: "Victory Feast",
      icon: "🍱",
      shortDescription: "Team snack privilege.",
      description:
        "After a strong team performance, unlock a short team snack moment with teacher approval.",
      prerequisiteSkillIds: ["warrior_snack_2"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.fun,
    }),

    makeSkill({
      id: "warrior_shield_1",
      classId: 1,
      branch: "shield",
      tier: 1,
      x: 3,
      y: 1,
      name: "Brave Shield",
      icon: "🛡️",
      shortDescription: "Block one small HP loss.",
      description:
        "Use this skill to block one small HP loss caused by a classroom mistake.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.protection,
      protection: { hpShield: 5 },
    }),
    makeSkill({
      id: "warrior_shield_2",
      classId: 1,
      branch: "shield",
      tier: 2,
      x: 3,
      y: 2,
      name: "Iron Will",
      icon: "💪",
      shortDescription: "Reduce stronger HP loss.",
      description: "Use this skill to reduce one stronger HP loss for the team.",
      prerequisiteSkillIds: ["warrior_shield_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.protection,
      protection: { hpShield: 10 },
    }),
    makeSkill({
      id: "warrior_shield_3",
      classId: 1,
      branch: "shield",
      tier: 3,
      x: 3,
      y: 3,
      name: "Last Stand",
      icon: "🏰",
      shortDescription: "Protect team from big HP loss.",
      description:
        "Use this skill once to protect the team from a major HP loss event.",
      prerequisiteSkillIds: ["warrior_shield_2"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.protection,
      protection: { hpShield: 20 },
    }),

    makeSkill({
      id: "warrior_ultimate_challenge",
      classId: 1,
      branch: "ultimate",
      tier: 4,
      x: 1,
      y: 4,
      name: "Heroic Challenge",
      icon: "🌋",
      shortDescription: "Huge Hard Quest XP boost.",
      description:
        "Ultimate: Choose one Hard Quest. If completed, the team gains a large XP bonus.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      reward: { xp: 50, hp: 0, gold: 0 },
      isUltimate: true,
    }),
    makeSkill({
      id: "warrior_ultimate_stand",
      classId: 1,
      branch: "ultimate",
      tier: 4,
      x: 2,
      y: 4,
      name: "Divine Last Stand",
      icon: "🛡️",
      shortDescription: "Block one major HP loss.",
      description:
        "Ultimate: Protect the team from one major HP loss event.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      protection: { hpShield: 40 },
      isUltimate: true,
    }),
    makeSkill({
      id: "warrior_ultimate_command",
      classId: 1,
      branch: "ultimate",
      tier: 4,
      x: 3,
      y: 4,
      name: "Victory Command",
      icon: "👑",
      shortDescription: "Team retry privilege.",
      description:
        "Ultimate: Let the whole team retry one group task with teacher approval.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      isUltimate: true,
    }),
  ],

  2: [
    makeSkill({
      id: "mage_hint_1",
      classId: 2,
      branch: "hint",
      tier: 1,
      x: 1,
      y: 1,
      name: "Hint Spell",
      icon: "🪄",
      shortDescription: "Ask for one hint.",
      description:
        "Use this skill to ask the teacher for one small hint during a task.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.support,
    }),
    makeSkill({
      id: "mage_hint_2",
      classId: 2,
      branch: "hint",
      tier: 2,
      x: 1,
      y: 2,
      name: "Guided Spell",
      icon: "✨",
      shortDescription: "Ask for a stronger hint.",
      description:
        "Use this skill to receive a clearer hint or example before answering.",
      prerequisiteSkillIds: ["mage_hint_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.support,
    }),
    makeSkill({
      id: "mage_hint_3",
      classId: 2,
      branch: "hint",
      tier: 3,
      x: 1,
      y: 3,
      name: "Oracle Whisper",
      icon: "🔮",
      shortDescription: "Preview task direction.",
      description:
        "Use this skill to preview the direction of one difficult task before starting.",
      prerequisiteSkillIds: ["mage_hint_2"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.support,
    }),

    makeSkill({
      id: "mage_dictionary_1",
      classId: 2,
      branch: "knowledge",
      tier: 1,
      x: 2,
      y: 1,
      name: "Magic Dictionary",
      icon: "📖",
      shortDescription: "Check one word.",
      description:
        "Use this skill to check the meaning of one word during a mini task.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.classroomPrivilege,
    }),
    makeSkill({
      id: "mage_dictionary_2",
      classId: 2,
      branch: "knowledge",
      tier: 2,
      x: 2,
      y: 2,
      name: "Word Archive",
      icon: "📚",
      shortDescription: "Check two words.",
      description:
        "Use this skill to check up to two words during a controlled task.",
      prerequisiteSkillIds: ["mage_dictionary_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.classroomPrivilege,
    }),
    makeSkill({
      id: "mage_dictionary_3",
      classId: 2,
      branch: "knowledge",
      tier: 3,
      x: 2,
      y: 3,
      name: "Scholar Mode",
      icon: "🧠",
      shortDescription: "Use notes once.",
      description:
        "Use this skill to check personal notes once during a teacher-approved activity.",
      prerequisiteSkillIds: ["mage_dictionary_2"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.classroomPrivilege,
    }),

    makeSkill({
      id: "mage_time_1",
      classId: 2,
      branch: "time",
      tier: 1,
      x: 3,
      y: 1,
      name: "Time Freeze",
      icon: "⏳",
      shortDescription: "Get 2 extra minutes.",
      description: "Use this skill to get 2 extra minutes for one task.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.flexibility,
    }),
    makeSkill({
      id: "mage_time_2",
      classId: 2,
      branch: "time",
      tier: 2,
      x: 3,
      y: 2,
      name: "Slow Motion",
      icon: "🕰️",
      shortDescription: "Get 3 extra minutes.",
      description:
        "Use this skill to get 3 extra minutes for one speaking or writing task.",
      prerequisiteSkillIds: ["mage_time_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.flexibility,
    }),
    makeSkill({
      id: "mage_time_3",
      classId: 2,
      branch: "time",
      tier: 3,
      x: 3,
      y: 3,
      name: "Time Portal",
      icon: "🌀",
      shortDescription: "Extend one deadline.",
      description:
        "Use this skill to extend one small homework deadline with teacher approval.",
      prerequisiteSkillIds: ["mage_time_2"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.flexibility,
    }),

    makeSkill({
      id: "mage_ultimate_oracle",
      classId: 2,
      branch: "ultimate",
      tier: 4,
      x: 1,
      y: 4,
      name: "Grand Oracle",
      icon: "🔮",
      shortDescription: "Powerful task hint.",
      description:
        "Ultimate: Receive a strong teacher-approved hint for one difficult task.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      isUltimate: true,
    }),
    makeSkill({
      id: "mage_ultimate_time",
      classId: 2,
      branch: "ultimate",
      tier: 4,
      x: 2,
      y: 4,
      name: "Time Mastery",
      icon: "⏳",
      shortDescription: "Extend one important deadline.",
      description:
        "Ultimate: Extend one important assignment deadline with teacher approval.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      isUltimate: true,
    }),
    makeSkill({
      id: "mage_ultimate_arcane",
      classId: 2,
      branch: "ultimate",
      tier: 4,
      x: 3,
      y: 4,
      name: "Arcane Boost",
      icon: "🌌",
      shortDescription: "Boost excellent answer reward.",
      description:
        "Ultimate: Give a large XP bonus after an excellent answer or creative task.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      reward: { xp: 40, hp: 0, gold: 10 },
      isUltimate: true,
    }),
  ],

  3: [
    makeSkill({
      id: "cleric_heal_1",
      classId: 3,
      branch: "heal",
      tier: 1,
      x: 1,
      y: 1,
      name: "Small Heal",
      icon: "💚",
      shortDescription: "Restore team HP.",
      description: "Use this skill to restore a small amount of HP to your team.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.support,
      reward: { xp: 0, hp: 5, gold: 0 },
    }),
    makeSkill({
      id: "cleric_heal_2",
      classId: 3,
      branch: "heal",
      tier: 2,
      x: 1,
      y: 2,
      name: "Gentle Heal",
      icon: "🌱",
      shortDescription: "Restore more HP.",
      description:
        "Use this skill to restore more HP after the team shows positive effort.",
      prerequisiteSkillIds: ["cleric_heal_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.support,
      reward: { xp: 0, hp: 10, gold: 0 },
    }),
    makeSkill({
      id: "cleric_heal_3",
      classId: 3,
      branch: "heal",
      tier: 3,
      x: 1,
      y: 3,
      name: "Team Revival",
      icon: "🌈",
      shortDescription: "Big team recovery.",
      description:
        "Use this skill to restore a large amount of HP after a difficult class day.",
      prerequisiteSkillIds: ["cleric_heal_2"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.support,
      reward: { xp: 0, hp: 20, gold: 0 },
    }),

    makeSkill({
      id: "cleric_friend_1",
      classId: 3,
      branch: "support",
      tier: 1,
      x: 2,
      y: 1,
      name: "Save a Friend",
      icon: "🤝",
      shortDescription: "Help one teammate.",
      description:
        "Use this skill to help one teammate during a task without penalty.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.support,
    }),
    makeSkill({
      id: "cleric_friend_2",
      classId: 3,
      branch: "support",
      tier: 2,
      x: 2,
      y: 2,
      name: "Pair Blessing",
      icon: "👥",
      shortDescription: "Choose a partner.",
      description:
        "Use this skill to choose your partner for one pair-work activity.",
      prerequisiteSkillIds: ["cleric_friend_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.classroomPrivilege,
    }),
    makeSkill({
      id: "cleric_friend_3",
      classId: 3,
      branch: "support",
      tier: 3,
      x: 2,
      y: 3,
      name: "Support Circle",
      icon: "🫶",
      shortDescription: "Team gets support bonus.",
      description:
        "Use this skill after helping teammates actively. Your team gains bonus HP.",
      prerequisiteSkillIds: ["cleric_friend_2"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.support,
      reward: { xp: 0, hp: 15, gold: 0 },
    }),

    makeSkill({
      id: "cleric_peace_1",
      classId: 3,
      branch: "peace",
      tier: 1,
      x: 3,
      y: 1,
      name: "Peace Pass",
      icon: "🕊️",
      shortDescription: "Skip one speaking turn.",
      description:
        "Use this skill to skip one speaking turn when feeling overwhelmed.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.classroomPrivilege,
    }),
    makeSkill({
      id: "cleric_peace_2",
      classId: 3,
      branch: "peace",
      tier: 2,
      x: 3,
      y: 2,
      name: "Calm Reset",
      icon: "🍃",
      shortDescription: "Take a short reset.",
      description:
        "Use this skill to take a short emotional reset before continuing.",
      prerequisiteSkillIds: ["cleric_peace_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.classroomPrivilege,
    }),
    makeSkill({
      id: "cleric_peace_3",
      classId: 3,
      branch: "peace",
      tier: 3,
      x: 3,
      y: 3,
      name: "Safe Space",
      icon: "🏡",
      shortDescription: "Skip one mini activity.",
      description:
        "Use this skill to skip one small activity without team HP loss.",
      prerequisiteSkillIds: ["cleric_peace_2"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.protection,
    }),

    makeSkill({
      id: "cleric_ultimate_revival",
      classId: 3,
      branch: "ultimate",
      tier: 4,
      x: 1,
      y: 4,
      name: "Divine Revival",
      icon: "🌈",
      shortDescription: "Huge team HP recovery.",
      description:
        "Ultimate: Restore a large amount of team HP after a difficult period.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      reward: { xp: 0, hp: 40, gold: 0 },
      isUltimate: true,
    }),
    makeSkill({
      id: "cleric_ultimate_aura",
      classId: 3,
      branch: "ultimate",
      tier: 4,
      x: 2,
      y: 4,
      name: "Safe Space Aura",
      icon: "🏡",
      shortDescription: "Protect one mini activity.",
      description:
        "Ultimate: The team may skip or soften one mini activity without HP loss.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      isUltimate: true,
    }),
    makeSkill({
      id: "cleric_ultimate_blessing",
      classId: 3,
      branch: "ultimate",
      tier: 4,
      x: 3,
      y: 4,
      name: "Blessing Circle",
      icon: "🫶",
      shortDescription: "Team support bonus.",
      description:
        "Ultimate: When the team supports each other well, gain HP and XP bonus.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      reward: { xp: 25, hp: 25, gold: 0 },
      isUltimate: true,
    }),
  ],

  4: [
    makeSkill({
      id: "explorer_swap_1",
      classId: 4,
      branch: "swap",
      tier: 1,
      x: 1,
      y: 1,
      name: "Quest Swap",
      icon: "🔀",
      shortDescription: "Swap one small task.",
      description:
        "Use this skill to swap one small classroom task for a similar one.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.flexibility,
    }),
    makeSkill({
      id: "explorer_swap_2",
      classId: 4,
      branch: "swap",
      tier: 2,
      x: 1,
      y: 2,
      name: "Question Reroute",
      icon: "🧩",
      shortDescription: "Change one question.",
      description:
        "Use this skill to change one difficult question into another question.",
      prerequisiteSkillIds: ["explorer_swap_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.flexibility,
    }),
    makeSkill({
      id: "explorer_swap_3",
      classId: 4,
      branch: "swap",
      tier: 3,
      x: 1,
      y: 3,
      name: "Path Finder",
      icon: "🗺️",
      shortDescription: "Choose one task route.",
      description:
        "Use this skill to choose between two teacher-approved task routes.",
      prerequisiteSkillIds: ["explorer_swap_2"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.flexibility,
    }),

    makeSkill({
      id: "explorer_seat_1",
      classId: 4,
      branch: "movement",
      tier: 1,
      x: 2,
      y: 1,
      name: "Seat Travel",
      icon: "🪑",
      shortDescription: "Change seat once.",
      description: "Use this skill to change your seat once during class.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.classroomPrivilege,
    }),
    makeSkill({
      id: "explorer_seat_2",
      classId: 4,
      branch: "movement",
      tier: 2,
      x: 2,
      y: 2,
      name: "Partner Travel",
      icon: "🚶",
      shortDescription: "Choose where to sit with partner.",
      description:
        "Use this skill to choose your seat with a partner for one activity.",
      prerequisiteSkillIds: ["explorer_seat_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.classroomPrivilege,
    }),
    makeSkill({
      id: "explorer_seat_3",
      classId: 4,
      branch: "movement",
      tier: 3,
      x: 2,
      y: 3,
      name: "Explorer Camp",
      icon: "⛺",
      shortDescription: "Choose team seating.",
      description:
        "Use this skill to choose a seating arrangement for your team for one class activity.",
      prerequisiteSkillIds: ["explorer_seat_2"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.classroomPrivilege,
    }),

    makeSkill({
      id: "explorer_break_1",
      classId: 4,
      branch: "break",
      tier: 1,
      x: 3,
      y: 1,
      name: "Adventure Break",
      icon: "🛌",
      shortDescription: "Rest from one mini activity.",
      description:
        "Use this skill to rest from one small classroom activity without team HP loss.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.protection,
    }),
    makeSkill({
      id: "explorer_break_2",
      classId: 4,
      branch: "break",
      tier: 2,
      x: 3,
      y: 2,
      name: "Energy Save",
      icon: "🔋",
      shortDescription: "Rest and keep participation safe.",
      description:
        "Use this skill to skip one low-stakes task while still keeping team HP safe.",
      prerequisiteSkillIds: ["explorer_break_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.protection,
    }),
    makeSkill({
      id: "explorer_break_3",
      classId: 4,
      branch: "break",
      tier: 3,
      x: 3,
      y: 3,
      name: "Safe Day Pass",
      icon: "🌤️",
      shortDescription: "One approved rest day.",
      description:
        "Use this skill for one teacher-approved rest day or makeup arrangement without team HP penalty.",
      prerequisiteSkillIds: ["explorer_break_2"],
      usesPerTerm: 1,
      effectType: skillEffectTypes.protection,
    }),

    makeSkill({
      id: "explorer_ultimate_route",
      classId: 4,
      branch: "ultimate",
      tier: 4,
      x: 1,
      y: 4,
      name: "Legendary Route",
      icon: "🗺️",
      shortDescription: "Choose a major task path.",
      description:
        "Ultimate: Choose between teacher-approved task routes for one major mission.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      isUltimate: true,
    }),
    makeSkill({
      id: "explorer_ultimate_voyage",
      classId: 4,
      branch: "ultimate",
      tier: 4,
      x: 2,
      y: 4,
      name: "Golden Voyage",
      icon: "🚢",
      shortDescription: "Gold bonus for exploration.",
      description:
        "Ultimate: Gain Gold after completing an exploration-style project or challenge.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      reward: { xp: 0, hp: 0, gold: 40 },
      isUltimate: true,
    }),
    makeSkill({
      id: "explorer_ultimate_safe_day",
      classId: 4,
      branch: "ultimate",
      tier: 4,
      x: 3,
      y: 4,
      name: "Safe Journey Pass",
      icon: "🌤️",
      shortDescription: "Strong rest/makeup privilege.",
      description:
        "Ultimate: Use one major rest or makeup arrangement without team HP penalty.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      isUltimate: true,
    }),
  ],

  5: [
    makeSkill({
      id: "guardian_absence_1",
      classId: 5,
      branch: "attendance",
      tier: 1,
      x: 1,
      y: 1,
      name: "Absence Shield",
      icon: "📝",
      shortDescription: "Protect one excused absence.",
      description:
        "Use this skill so one approved absence does not reduce team HP.",
      usesPerMonth: 1,
      effectType: skillEffectTypes.protection,
      protection: { hpShield: 10 },
    }),
    makeSkill({
      id: "guardian_absence_2",
      classId: 5,
      branch: "attendance",
      tier: 2,
      x: 1,
      y: 2,
      name: "Makeup Guard",
      icon: "📌",
      shortDescription: "Protect absence with makeup task.",
      description:
        "Use this skill to protect one absence by completing a makeup task.",
      prerequisiteSkillIds: ["guardian_absence_1"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.protection,
      protection: { hpShield: 15 },
    }),
    makeSkill({
      id: "guardian_absence_3",
      classId: 5,
      branch: "attendance",
      tier: 3,
      x: 1,
      y: 3,
      name: "Guardian Leave",
      icon: "🏯",
      shortDescription: "Strong absence protection.",
      description:
        "Use this skill for one important teacher-approved absence without team HP loss.",
      prerequisiteSkillIds: ["guardian_absence_2"],
      usesPerTerm: 1,
      effectType: skillEffectTypes.protection,
      protection: { hpShield: 20 },
    }),

    makeSkill({
      id: "guardian_late_1",
      classId: 5,
      branch: "late",
      tier: 1,
      x: 2,
      y: 1,
      name: "Late Guard",
      icon: "🕒",
      shortDescription: "Protect one small late arrival.",
      description:
        "Use this skill so one small late arrival does not reduce team HP.",
      usesPerMonth: 1,
      effectType: skillEffectTypes.protection,
      protection: { hpShield: 5 },
    }),
    makeSkill({
      id: "guardian_late_2",
      classId: 5,
      branch: "late",
      tier: 2,
      x: 2,
      y: 2,
      name: "Time Armor",
      icon: "⏰",
      shortDescription: "Reduce late penalty.",
      description:
        "Use this skill to reduce a late penalty for yourself or one teammate.",
      prerequisiteSkillIds: ["guardian_late_1"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.protection,
      protection: { hpShield: 10 },
    }),
    makeSkill({
      id: "guardian_late_3",
      classId: 5,
      branch: "late",
      tier: 3,
      x: 2,
      y: 3,
      name: "Clock Fortress",
      icon: "🕰️",
      shortDescription: "Protect team from time penalty.",
      description:
        "Use this skill to protect the team from one time-related HP penalty.",
      prerequisiteSkillIds: ["guardian_late_2"],
      usesPerTerm: 1,
      effectType: skillEffectTypes.protection,
      protection: { hpShield: 15 },
    }),

    makeSkill({
      id: "guardian_team_1",
      classId: 5,
      branch: "teamDefense",
      tier: 1,
      x: 3,
      y: 1,
      name: "Team Armor",
      icon: "🛡️",
      shortDescription: "Reduce team HP loss.",
      description: "Use this skill to reduce one team HP loss event.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.protection,
      protection: { hpShield: 5 },
    }),
    makeSkill({
      id: "guardian_team_2",
      classId: 5,
      branch: "teamDefense",
      tier: 2,
      x: 3,
      y: 2,
      name: "Protective Wall",
      icon: "🧱",
      shortDescription: "Bigger team shield.",
      description: "Use this skill to strongly reduce one team HP loss event.",
      prerequisiteSkillIds: ["guardian_team_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.protection,
      protection: { hpShield: 10 },
    }),
    makeSkill({
      id: "guardian_team_3",
      classId: 5,
      branch: "teamDefense",
      tier: 3,
      x: 3,
      y: 3,
      name: "Castle Defense",
      icon: "🏰",
      shortDescription: "Major team shield.",
      description:
        "Use this skill to protect your team from one major classroom HP loss event.",
      prerequisiteSkillIds: ["guardian_team_2"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.protection,
      protection: { hpShield: 20 },
    }),

    makeSkill({
      id: "guardian_ultimate_fortress",
      classId: 5,
      branch: "ultimate",
      tier: 4,
      x: 1,
      y: 4,
      name: "Fortress Heart",
      icon: "🏰",
      shortDescription: "Huge team shield.",
      description:
        "Ultimate: Protect the team from one major classroom penalty.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      protection: { hpShield: 40 },
      isUltimate: true,
    }),
    makeSkill({
      id: "guardian_ultimate_oath",
      classId: 5,
      branch: "ultimate",
      tier: 4,
      x: 2,
      y: 4,
      name: "Guardian Oath",
      icon: "🛡️",
      shortDescription: "Protect one teammate.",
      description:
        "Ultimate: Protect one teammate from a penalty with teacher approval.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      isUltimate: true,
    }),
    makeSkill({
      id: "guardian_ultimate_stability",
      classId: 5,
      branch: "ultimate",
      tier: 4,
      x: 3,
      y: 4,
      name: "Unbreakable Class",
      icon: "💎",
      shortDescription: "Team HP and Gold bonus.",
      description:
        "Ultimate: When the team stays consistent, gain HP and Gold bonus.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      reward: { xp: 0, hp: 25, gold: 20 },
      isUltimate: true,
    }),
  ],

  6: [
    makeSkill({
      id: "bard_music_1",
      classId: 6,
      branch: "music",
      tier: 1,
      x: 1,
      y: 1,
      name: "Music Choice",
      icon: "🎧",
      shortDescription: "Choose class music once.",
      description:
        "Use this skill to choose suitable music for warm-up, break time, or class transition.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.fun,
    }),
    makeSkill({
      id: "bard_music_2",
      classId: 6,
      branch: "music",
      tier: 2,
      x: 1,
      y: 2,
      name: "Playlist Spell",
      icon: "🎵",
      shortDescription: "Suggest a short playlist.",
      description:
        "Use this skill to suggest a short teacher-approved playlist for class break.",
      prerequisiteSkillIds: ["bard_music_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.fun,
    }),
    makeSkill({
      id: "bard_music_3",
      classId: 6,
      branch: "music",
      tier: 3,
      x: 1,
      y: 3,
      name: "Concert Moment",
      icon: "🎤",
      shortDescription: "Lead a music moment.",
      description:
        "Use this skill to lead a short music or chant moment for class energy.",
      prerequisiteSkillIds: ["bard_music_2"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.fun,
    }),

    makeSkill({
      id: "bard_cheer_1",
      classId: 6,
      branch: "teamEnergy",
      tier: 1,
      x: 2,
      y: 1,
      name: "Team Cheer",
      icon: "📣",
      shortDescription: "Give team small HP bonus.",
      description:
        "Use this skill after encouraging your team. The team gains a small HP bonus.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.support,
      reward: { xp: 0, hp: 5, gold: 0 },
    }),
    makeSkill({
      id: "bard_cheer_2",
      classId: 6,
      branch: "teamEnergy",
      tier: 2,
      x: 2,
      y: 2,
      name: "Hype Song",
      icon: "🌟",
      shortDescription: "Boost team energy.",
      description:
        "Use this skill when the whole team participates actively. The team gains HP and XP.",
      prerequisiteSkillIds: ["bard_cheer_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.rewardBoost,
      reward: { xp: 10, hp: 5, gold: 0 },
    }),
    makeSkill({
      id: "bard_cheer_3",
      classId: 6,
      branch: "teamEnergy",
      tier: 3,
      x: 2,
      y: 3,
      name: "Guild Anthem",
      icon: "🏆",
      shortDescription: "Big team morale boost.",
      description:
        "Use this skill after a strong team performance. The team gains a larger XP and HP bonus.",
      prerequisiteSkillIds: ["bard_cheer_2"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.rewardBoost,
      reward: { xp: 20, hp: 10, gold: 0 },
    }),

    makeSkill({
      id: "bard_order_1",
      classId: 6,
      branch: "presentation",
      tier: 1,
      x: 3,
      y: 1,
      name: "Presentation Order",
      icon: "🎲",
      shortDescription: "Choose presentation order.",
      description: "Use this skill to choose when your team presents.",
      usesPerWeek: 1,
      effectType: skillEffectTypes.classroomPrivilege,
    }),
    makeSkill({
      id: "bard_order_2",
      classId: 6,
      branch: "presentation",
      tier: 2,
      x: 3,
      y: 2,
      name: "Stage Control",
      icon: "🎭",
      shortDescription: "Choose speaker order.",
      description:
        "Use this skill to choose the speaking order inside your team presentation.",
      prerequisiteSkillIds: ["bard_order_1"],
      usesPerWeek: 1,
      effectType: skillEffectTypes.classroomPrivilege,
    }),
    makeSkill({
      id: "bard_order_3",
      classId: 6,
      branch: "presentation",
      tier: 3,
      x: 3,
      y: 3,
      name: "Spotlight Pass",
      icon: "✨",
      shortDescription: "Choose one presentation advantage.",
      description:
        "Use this skill to choose one teacher-approved presentation advantage such as order, format, or warm-up support.",
      prerequisiteSkillIds: ["bard_order_2"],
      usesPerMonth: 1,
      effectType: skillEffectTypes.classroomPrivilege,
    }),

    makeSkill({
      id: "bard_ultimate_anthem",
      classId: 6,
      branch: "ultimate",
      tier: 4,
      x: 1,
      y: 4,
      name: "Master Guild Anthem",
      icon: "🎼",
      shortDescription: "Huge team morale bonus.",
      description:
        "Ultimate: After strong teamwork, the team gains a large XP and HP bonus.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      reward: { xp: 30, hp: 20, gold: 0 },
      isUltimate: true,
    }),
    makeSkill({
      id: "bard_ultimate_stage",
      classId: 6,
      branch: "ultimate",
      tier: 4,
      x: 2,
      y: 4,
      name: "Grand Stage Control",
      icon: "🎭",
      shortDescription: "Control presentation flow.",
      description:
        "Ultimate: Choose a major presentation advantage with teacher approval.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      isUltimate: true,
    }),
    makeSkill({
      id: "bard_ultimate_celebration",
      classId: 6,
      branch: "ultimate",
      tier: 4,
      x: 3,
      y: 4,
      name: "Festival Moment",
      icon: "🎉",
      shortDescription: "Create a class fun moment.",
      description:
        "Ultimate: Unlock one teacher-approved class fun moment or celebration.",
      usesPerTerm: 1,
      effectType: skillEffectTypes.ultimate,
      isUltimate: true,
    }),
  ],
};

export function getSkillTreeByClassId(classId) {
  return skillTrees[Number(classId)] || [];
}

export function getAllSkills() {
  return Object.values(skillTrees).flat();
}

export function getSkillById(skillId) {
  return getAllSkills().find((skill) => skill.id === skillId);
}

export function getStarterSkillsByClassId(classId) {
  return getSkillTreeByClassId(classId).filter((skill) => skill.tier === 1);
}

export function getUltimateSkillsByClassId(classId) {
  return getSkillTreeByClassId(classId).filter((skill) => skill.isUltimate);
}

export function getUnlockedUltimateSkill(student) {
  const unlockedSkillIds = student.unlockedSkillIds || [];
  const ultimateSkills = getUltimateSkillsByClassId(student.rpgClassId);

  return ultimateSkills.find((skill) => unlockedSkillIds.includes(skill.id));
}

export function getSkillsByBranch(classId, branch) {
  return getSkillTreeByClassId(classId)
    .filter((skill) => skill.branch === branch)
    .sort((a, b) => Number(a.tier) - Number(b.tier));
}

export function getAvailableSkillsForStudent(student) {
  const unlockedSkillIds = student.unlockedSkillIds || [];
  const skillPoints = Number(student.skillPoints || 0);
  const level = Number(student.level || 1);
  const unlockedUltimateSkill = getUnlockedUltimateSkill(student);

  return getSkillTreeByClassId(student.rpgClassId).filter((skill) => {
    const isUnlocked = unlockedSkillIds.includes(skill.id);
    const hasEnoughLevel = level >= Number(skill.requiredLevel || 1);
    const hasEnoughPoints = skillPoints >= Number(skill.cost || 1);
    const prerequisitesMet = skill.prerequisiteSkillIds.every(
      (requiredSkillId) => unlockedSkillIds.includes(requiredSkillId)
    );

    if (skill.isUltimate && unlockedUltimateSkill && !isUnlocked) {
      return false;
    }

    return !isUnlocked && hasEnoughLevel && hasEnoughPoints && prerequisitesMet;
  });
}

export function getSkillNodeState(skill, student) {
  const unlockedSkillIds = student.unlockedSkillIds || [];
  const usedSkillIds = student.usedSkillIds || [];
  const skillPoints = Number(student.skillPoints || 0);
  const level = Number(student.level || 1);
  const unlockedUltimateSkill = getUnlockedUltimateSkill(student);

  if (usedSkillIds.includes(skill.id)) {
    return skillNodeStates.used;
  }

  if (unlockedSkillIds.includes(skill.id)) {
    return skillNodeStates.unlocked;
  }

  if (skill.isUltimate && unlockedUltimateSkill) {
    return skillNodeStates.locked;
  }

  const hasEnoughLevel = level >= Number(skill.requiredLevel || 1);
  const hasEnoughPoints = skillPoints >= Number(skill.cost || 1);
  const prerequisitesMet = skill.prerequisiteSkillIds.every((requiredSkillId) =>
    unlockedSkillIds.includes(requiredSkillId)
  );

  if (hasEnoughLevel && hasEnoughPoints && prerequisitesMet) {
    return skillNodeStates.available;
  }

  return skillNodeStates.locked;
}

export function getMilestonesUpToLevel(level) {
  return levelMilestones.filter(
    (milestone) => Number(milestone.level) <= Number(level)
  );
}

export function getNextMilestone(level) {
  return levelMilestones.find(
    (milestone) => Number(milestone.level) > Number(level)
  );
}

export function getCostumesForStudent(student) {
  const level = Number(student.level || 1);
  const classId = Number(student.rpgClassId);

  return costumeUnlocks.filter((costume) => {
    const levelUnlocked = level >= Number(costume.requiredLevel || 1);
    const classMatched = !costume.classId || Number(costume.classId) === classId;

    return levelUnlocked && classMatched;
  });
}
