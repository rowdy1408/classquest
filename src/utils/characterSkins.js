export const MAX_CHARACTER_LEVEL = 30;

export const armorTiers = [
  { key: 'base', label: 'Trang Phục Khởi Đầu', minLevel: 1, maxLevel: 3 },
  { key: 'iron', label: 'Giáp Sắt', minLevel: 4, maxLevel: 9 },
  { key: 'steel', label: 'Giáp Thép', minLevel: 10, maxLevel: 15 },
  { key: 'knight', label: 'Giáp Hiệp Sĩ', minLevel: 16, maxLevel: 21 },
  { key: 'crystal', label: 'Giáp Pha Lê', minLevel: 22, maxLevel: 27 },
  { key: 'divine', label: 'Giáp Thần Thánh', minLevel: 28, maxLevel: 30 },
];

const ROLE_ALIASES = {
  warrior: ['warrior', 'chien-binh', 'chienbinh'],
  mage: ['mage', 'phap-su', 'phapsu'],
  cleric: ['cleric', 'druid', 'tu-si', 'tusi'],
  explorer: ['explorer', 'archer', 'tham-hiem', 'thamhiem'],
  guardian: ['guardian', 'paladin', 'ho-ve', 'hove'],
  bard: ['bard', 'assassin', 'thi-si', 'thisi'],
};

const GENDER_ALIASES = {
  male: ['male', 'nam', 'boy'],
  female: ['female', 'nu', 'girl'],
};

const TIER_ALIASES = {
  base: ['base', 'default', 'starter', 'khoi-dau', 'khoidau'],
  iron: ['iron', 'bronze', 'sat'],
  steel: ['steel', 'silver', 'thep'],
  knight: ['knight', 'gold', 'hiep-si', 'hiepsi'],
  crystal: ['crystal', 'pha-le', 'phale'],
  divine: ['divine', 'than-thanh', 'thanthanh'],
};

// Vite discovers the user's own character files at build time. Both singular
// and plural folder names are supported so an existing asset folder can be
// reused without moving or importing every image by hand.
const bundledCharacterFiles = {
  ...import.meta.glob('../assets/character/*.{png,webp,jpg,jpeg,avif}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
  ...import.meta.glob('../assets/character/**/*_{male,female}.{png,webp,jpg,jpeg,avif}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
  ...import.meta.glob('../assets/character/**/*-{male,female}.{png,webp,jpg,jpeg,avif}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
  ...import.meta.glob('../assets/characters/*.{png,webp,jpg,jpeg,avif}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
  ...import.meta.glob('../assets/characters/**/*_{male,female}.{png,webp,jpg,jpeg,avif}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
  ...import.meta.glob('../assets/characters/**/*-{male,female}.{png,webp,jpg,jpeg,avif}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
};

function stripVietnamese(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd');
}

function normalizeAssetName(value = '') {
  return stripVietnamese(value)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]+/g, '-');
}

function containsAlias(assetName, aliases = []) {
  const padded = `-${assetName}-`;
  return aliases.some((alias) => padded.includes(`-${alias}-`));
}

export function getArmorTier(level = 1) {
  const safeLevel = Math.max(1, Math.min(MAX_CHARACTER_LEVEL, Number(level) || 1));
  return [...armorTiers].reverse().find((tier) => safeLevel >= tier.minLevel) || armorTiers[0];
}

export function normalizeSkinRole(role = 'Explorer') {
  return normalizeAssetName(role || 'Explorer');
}

export function normalizeGender(gender = 'male') {
  return normalizeAssetName(gender || 'male') === 'female' ? 'female' : 'male';
}

function getBundledCharacterCandidates({ roleKey, genderKey, tierKey }) {
  const roleAliases = ROLE_ALIASES[roleKey] || [roleKey];
  const wantedGender = GENDER_ALIASES[genderKey];
  const oppositeGender = GENDER_ALIASES[genderKey === 'female' ? 'male' : 'female'];
  const wantedTier = TIER_ALIASES[tierKey] || [tierKey];
  const allTierAliases = Object.values(TIER_ALIASES).flat();

  return Object.entries(bundledCharacterFiles)
    .map(([path, url]) => {
      const assetName = normalizeAssetName(path);
      if (!containsAlias(assetName, roleAliases)) return null;
      if (containsAlias(assetName, oppositeGender)) return null;

      const hasWantedGender = containsAlias(assetName, wantedGender);
      const hasAnyGender = containsAlias(assetName, Object.values(GENDER_ALIASES).flat());
      const hasWantedTier = containsAlias(assetName, wantedTier);
      const hasAnyTier = containsAlias(assetName, allTierAliases);

      // Exact role + gender + armour files win. A neutral/base role image is
      // the final fallback when the user's pack does not include every tier.
      let score = 10;
      if (hasWantedGender) score += 6;
      else if (!hasAnyGender) score += 2;
      if (hasWantedTier) score += 5;
      else if (!hasAnyTier || containsAlias(assetName, TIER_ALIASES.base)) score += 1;
      if (assetName.endsWith(`-${roleKey}`)) score += 2;

      return { url, score, path };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
    .map((item) => item.url);
}

function getPublicCharacterCandidates({ roleKey, genderKey, tierKey }) {
  const extensions = ['png', 'webp', 'jpg', 'jpeg', 'avif'];
  const roots = ['/assets/character', '/assets/characters'];
  const genderAliases = genderKey === 'female' ? ['female', 'nu'] : ['male', 'nam'];
  const tierAliases = TIER_ALIASES[tierKey] || [tierKey];
  const filenames = [];

  for (const tierAlias of tierAliases) {
    for (const genderAlias of genderAliases) {
      filenames.push(
        `${roleKey}-${tierAlias}-${genderAlias}`,
        `${roleKey}_${tierAlias}_${genderAlias}`,
        `${roleKey}-${genderAlias}-${tierAlias}`,
        `${roleKey}_${genderAlias}_${tierAlias}`,
      );
    }
    filenames.push(`${roleKey}-${tierAlias}`, `${roleKey}_${tierAlias}`);
  }

  for (const genderAlias of genderAliases) {
    filenames.push(`${roleKey}-${genderAlias}`, `${roleKey}_${genderAlias}`);
  }
  filenames.push(roleKey);

  const candidates = [];
  for (const root of roots) {
    for (const filename of filenames) {
      for (const extension of extensions) {
        candidates.push(`${root}/${roleKey}/${filename}.${extension}`);
        candidates.push(`${root}/${filename}.${extension}`);
      }
    }
  }
  return candidates;
}

export function getCharacterSkinCandidates({ role, gender, level }) {
  const roleKey = normalizeSkinRole(role);
  const genderKey = normalizeGender(gender);
  const tierKey = getArmorTier(level).key;

  return [...new Set([
    ...getBundledCharacterCandidates({ roleKey, genderKey, tierKey }),
    ...getPublicCharacterCandidates({ roleKey, genderKey, tierKey }),
  ])];
}

export function getNextArmorTier(level = 1) {
  const safeLevel = Math.max(1, Number(level) || 1);
  return armorTiers.find((tier) => tier.minLevel > safeLevel) || null;
}
