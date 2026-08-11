export const MAX_CHARACTER_LEVEL = 40;

export const armorTiers = [
  { key: 'base', label: 'Trang Phục Khởi Đầu', minLevel: 1, maxLevel: 9 },
  { key: 'bronze', label: 'Giáp Đồng', minLevel: 10, maxLevel: 19 },
  { key: 'gold', label: 'Giáp Vàng', minLevel: 20, maxLevel: 29 },
  { key: 'crystal', label: 'Giáp Pha Lê', minLevel: 30, maxLevel: 39 },
  { key: 'divine', label: 'Giáp Thần Thánh', minLevel: 40, maxLevel: 40 },
];

function stripVietnamese(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd');
}

export function normalizeSkinRole(role = 'Explorer') {
  return stripVietnamese(role).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function normalizeGender(gender = 'male') {
  return String(gender || '').toLowerCase() === 'female' ? 'female' : 'male';
}

export function getArmorTier(level = 1) {
  const safeLevel = Math.max(1, Math.min(MAX_CHARACTER_LEVEL, Number(level) || 1));
  return [...armorTiers].reverse().find((tier) => safeLevel >= tier.minLevel) || armorTiers[0];
}

export function getCharacterSkinCandidates({ role, gender, level }) {
  const roleKey = normalizeSkinRole(role);
  const genderKey = normalizeGender(gender);
  const tierKey = getArmorTier(level).key;
  const root = `${import.meta.env?.BASE_URL || '/'}assets/skins/${roleKey}`;
  return [
    `${root}/${roleKey}-${tierKey}-${genderKey}.webp`,
    `${root}/${roleKey}-base-${genderKey}.webp`,
    `${root}/${roleKey}-base-male.webp`,
  ];
}

export function getNextArmorTier(level = 1) {
  const safeLevel = Math.max(1, Number(level) || 1);
  return armorTiers.find((tier) => tier.minLevel > safeLevel) || null;
}
