import { classBaseStats, classSkillThemes, maxLevel, skillTrees, tierRequiredLevels } from './skillTreeData';
import { localizeSkillTree } from './skillTreeVi';

export const SKILL_UNLOCK_LEVELS = Object.values(tierRequiredLevels);
export const MAX_SKILL_TREE_LEVEL = maxLevel;

const roleDefinitions = [
  { key: 'Warrior', classId: 1, description: 'Dũng cảm tái chiến, chống chịu hình phạt và dẫn đầu những thử thách khó.' },
  { key: 'Mage', classId: 2, description: 'Làm chủ gợi ý, tri thức và thời gian để xử lý nhiệm vụ một cách thông minh.' },
  { key: 'Cleric', classId: 3, description: 'Hồi phục, hỗ trợ bạn học và tạo cảm giác an toàn cho cả đội.' },
  { key: 'Explorer', classId: 4, description: 'Linh hoạt đổi lộ trình, chỗ ngồi và cách tham gia hoạt động trên lớp.' },
  { key: 'Guardian', classId: 5, description: 'Bảo vệ chuyên cần, HP và sự ổn định của cả đội.' },
  { key: 'Bard', classId: 6, description: 'Tạo năng lượng bằng âm nhạc, tinh thần đội và khả năng thuyết trình.' },
];

export const roleCatalog = Object.fromEntries(roleDefinitions.map(({ key, classId, description }) => {
  const theme = classSkillThemes[classId];
  const stats = classBaseStats[classId];
  return [key, {
    classId,
    icon: theme.icon,
    displayName: theme.className,
    englishName: theme.englishName,
    color: theme.color,
    glowColor: theme.glowColor,
    maxHp: stats.maxHp,
    maxMana: stats.maxMana,
    description,
    skills: localizeSkillTree(skillTrees[classId]),
  }];
}));

// Public builds start empty. Existing teacher data is loaded from Firestore;
// new teachers create their first class after sign-in.
export const defaultData = {
  teachers: [],
  classes: [],
  students: [],
  groups: [],
  rules: [],
  tests: [],
  questNodes: [],
  pointLogs: [],
  shopItems: [],
  purchases: [],
  skillUses: [],
  submissions: [],
};
