import React, { useEffect, useMemo, useState } from 'react';
import { getArmorTier, getCharacterSkinCandidates, normalizeSkinRole } from '../utils/characterSkins';

const ROLE_FALLBACKS = {
  warrior: '⚔️',
  mage: '🧙',
  cleric: '✨',
  explorer: '🧭',
  guardian: '🛡️',
  bard: '🎵',
};

export default function CharacterAvatar({
  student,
  role,
  gender,
  level,
  fallback = '🧙',
  className = '',
  showTier = false,
  alt,
}) {
  const resolvedRole = student?.role || role || student?.rpgClassId || 'Explorer';
  const resolvedClassId = student?.rpgClassId;
  const resolvedRoleKey = normalizeSkinRole(resolvedRole, resolvedClassId);
  const resolvedGender = student?.gender || gender || 'male';
  const resolvedLevel = Number(student?.level ?? level ?? 1);
  const resolvedFallback = student?.avatar || ROLE_FALLBACKS[resolvedRoleKey] || fallback;
  const candidates = useMemo(
    () => getCharacterSkinCandidates({
      role: resolvedRole,
      rpgClassId: resolvedClassId,
      gender: resolvedGender,
      level: resolvedLevel,
    }),
    [resolvedRole, resolvedClassId, resolvedGender, resolvedLevel],
  );
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const tier = getArmorTier(resolvedLevel);

  useEffect(() => {
    setCandidateIndex(0);
    setFailed(false);
  }, [candidates]);

  const handleError = () => {
    if (candidateIndex < candidates.length - 1) setCandidateIndex((index) => index + 1);
    else setFailed(true);
  };

  return (
    <span className={`character-skin ${showTier ? 'has-armour-tier' : ''} ${className}`.trim()} title={`${resolvedRoleKey} · ${tier.label}`}>
      <span className="character-skin-frame">
        {!failed ? (
          <img
            src={candidates[candidateIndex]}
            alt={alt || `${resolvedRoleKey} ${tier.label}`}
            onError={handleError}
            draggable="false"
            decoding="async"
            loading="lazy"
            data-character-source="assets/skins"
          />
        ) : (
          <span className="character-skin-fallback" aria-label={`${resolvedRoleKey} fallback avatar`}>{resolvedFallback}</span>
        )}
      </span>
      {showTier && <small className={`armour-tier-badge tier-${tier.key}`}>{tier.label}</small>}
    </span>
  );
}
