export function normalizeStudentProgress(student, maxLevel = 40) {
  let level = Math.max(1, Math.min(maxLevel, Number(student?.level) || 1));
  let xp = Math.max(0, Number(student?.xp) || 0);
  let xpToNext = Math.max(100, Number(student?.xpToNext) || level * 100);

  while (level < maxLevel && xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    xpToNext += 100;
  }

  if (level >= maxLevel) {
    level = maxLevel;
    xp = Math.min(xp, xpToNext);
  }

  return { ...student, level, xp, xpToNext };
}

export function applyStudentXpChange(student, change, maxLevel = 40) {
  return normalizeStudentProgress({
    ...student,
    xp: Math.max(0, Number(student?.xp || 0) + Number(change || 0)),
  }, maxLevel);
}

