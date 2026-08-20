export function normalizeUsername(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function scopedStudentUsername(username, ownerId, attempt = 1) {
  const base = normalizeUsername(username);
  if (!base) throw new Error('Tên đăng nhập học viên chưa hợp lệ.');
  const ownerKey = normalizeUsername(ownerId).replace(/[^a-z0-9]/g, '').slice(0, 8) || 'teacher';
  const suffix = attempt > 1 ? `${ownerKey}-${attempt}` : ownerKey;
  const maxBaseLength = Math.max(1, 40 - suffix.length - 1);
  return `${base.slice(0, maxBaseLength)}-${suffix}`;
}

export function studentAuthEmail(username) {
  const normalized = normalizeUsername(username);
  if (!normalized) throw new Error('Tên đăng nhập học viên chưa hợp lệ.');
  return `${normalized}@classquest.local`;
}
