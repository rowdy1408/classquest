import React, { useEffect, useMemo, useState } from 'react';
import { getArmorTier, getCharacterSkinCandidates } from '../utils/characterSkins';

const ROLE_FALLBACKS = {
  Warrior: '⚔️',
  Mage: '🧙',
  Cleric: '✨',
  Explorer: '🧭',
  Guardian: '🛡️',
  Bard: '🎵',
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
  const resolvedRole = student?.role || role || 'Explorer';
  const resolvedGender = student?.gender || gender || 'male';
  const resolvedLevel = Number(student?.level ?? level ?? 1);
  const resolvedFallback = student?.avatar || ROLE_FALLBACKS[resolvedRole] || fallback;
  const candidates = useMemo(
    () => getCharacterSkinCandidates({ role: resolvedRole, gender: resolvedGender, level: resolvedLevel }),
    [resolvedRole, resolvedGender, resolvedLevel],
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
    <span className={`character-skin ${showTier ? 'has-armour-tier' : ''} ${className}`.trim()} title={`${resolvedRole} · ${tier.label}`}>
      <span className="character-skin-frame">
        {!failed ? (
          <img
            src={candidates[candidateIndex]}
            alt={alt || `${resolvedRole} ${tier.label}`}
            onError={handleError}
            draggable="false"
            decoding="async"
            data-character-source="assets/character"
          />
        ) : (
          <span className="character-skin-fallback" aria-label={`${resolvedRole} fallback avatar`}>{resolvedFallback}</span>
        )}
      </span>
      {showTier && <small className={`armour-tier-badge tier-${tier.key}`}>{tier.label}</small>}
    </span>
  );
}
