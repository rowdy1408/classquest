export const MAX_CHARACTER_LEVEL = 40;

export const armorTiers = [
  { key: 'base', label: 'Trang Phục Khởi Đầu', minLevel: 1, maxLevel: 9 },
  { key: 'bronze', label: 'Giáp Đồng', minLevel: 10, maxLevel: 19 },
  { key: 'gold', label: 'Giáp Vàng', minLevel: 20, maxLevel: 29 },
  { key: 'crystal', label: 'Giáp Pha Lê', minLevel: 30, maxLevel: 39 },
  { key: 'divine', label: 'Giáp Thần Thánh', minLevel: 40, maxLevel: 40 },
];

const CLASS_ID_ROLES = {
  1: 'warrior',
  2: 'mage',
  3: 'cleric',
  4: 'explorer',
  5: 'guardian',
  6: 'bard',
};

const ROLE_ALIASES = {
  warrior: 'warrior',
  'chien-binh': 'warrior',
  chienbinh: 'warrior',
  mage: 'mage',
  'phap-su': 'mage',
  phapsu: 'mage',
  cleric: 'cleric',
  'tu-si': 'cleric',
  tusi: 'cleric',
  healer: 'cleric',
  explorer: 'explorer',
  'tham-hiem': 'explorer',
  thamhiem: 'explorer',
  guardian: 'guardian',
  'ho-ve': 'guardian',
  hove: 'guardian',
  bard: 'bard',
  'thi-si': 'bard',
  thisi: 'bard',
  'nghe-si': 'bard',
  nghesi: 'bard',
};

const LEGACY_TIER_ALIASES = {
  base: ['base'],
  bronze: ['bronze', 'brozne'],
  gold: ['gold'],
  crystal: ['crystal'],
  divine: ['divine'],
};

function stripVietnamese(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd');
}

function normalizeKey(value = '') {
  return stripVietnamese(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function normalizeSkinRole(role = 'Explorer', classId) {
  const numericClassId = Number(classId ?? role);
  if (CLASS_ID_ROLES[numericClassId]) return CLASS_ID_ROLES[numericClassId];
  const normalized = normalizeKey(role || 'Explorer');
  return ROLE_ALIASES[normalized] || normalized || 'explorer';
}

export function normalizeGender(gender = 'male') {
  const normalized = normalizeKey(gender);
  return ['female', 'nu', 'girl', 'f'].includes(normalized) ? 'female' : 'male';
}

export function getArmorTier(level = 1) {
  const safeLevel = Math.max(1, Math.min(MAX_CHARACTER_LEVEL, Number(level) || 1));
  return [...armorTiers].reverse().find((tier) => safeLevel >= tier.minLevel) || armorTiers[0];
}

function assetRoot(roleKey) {
  return `${import.meta.env?.BASE_URL || '/'}assets/skins/${roleKey}`;
}

function legacyCustomNames(roleKey, genderKey, tierKey) {
  const female = genderKey === 'female';
  const tierAliases = LEGACY_TIER_ALIASES[tierKey] || [tierKey];
  const stems = [];

  for (const tierAlias of tierAliases) {
    if (tierKey === 'base') {
      stems.push(female ? `${roleKey}-female` : roleKey);
    } else {
      stems.push(female ? `${roleKey}-${tierAlias}-female` : `${roleKey}-${tierAlias}`);
    }
  }

  // One file in the original custom pack has this legacy name.
  if (roleKey === 'cleric' && tierKey === 'gold' && female) {
    stems.push('cleric-gold.png-female');
  }

  return stems;
}

function pathsForStems(root, stems) {
  return stems.flatMap((stem) => [
    `${root}/${stem}.webp`,
    `${root}/${stem}.png`,
  ]);
}

export function getCharacterSkinCandidates({ role, classId, rpgClassId, gender, level }) {
  const roleKey = normalizeSkinRole(role, classId ?? rpgClassId);
  const genderKey = normalizeGender(gender);
  const tierKey = getArmorTier(level).key;
  const root = assetRoot(roleKey);
  const exactCustom = pathsForStems(root, legacyCustomNames(roleKey, genderKey, tierKey));
  const normalizedProduction = `${root}/${roleKey}-${tierKey}-${genderKey}.webp`;
  const baseCustom = pathsForStems(root, legacyCustomNames(roleKey, genderKey, 'base'));

  return [...new Set([
    ...exactCustom,
    normalizedProduction,
    ...baseCustom,
    `${root}/${roleKey}-base-${genderKey}.webp`,
    `${root}/${roleKey}-base-male.webp`,
  ])];
}

export function getNextArmorTier(level = 1) {
  const safeLevel = Math.max(1, Number(level) || 1);
  return armorTiers.find((tier) => tier.minLevel > safeLevel) || null;
}

