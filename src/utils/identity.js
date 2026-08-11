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
export function studentAuthEmail(username) {
  const normalized = normalizeUsername(username);
  if (!normalized) throw new Error('Tên đăng nhập học viên chưa hợp lệ.');
  return `${normalized}@classquest.local`;
}
