function safeStorageSegment(value, fallback) {
  return String(value || fallback)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || fallback;
}

export function submissionStoragePath(ownerId, studentUid, submissionId, imageId) {
  return [
    'mhpSubmissions',
    safeStorageSegment(ownerId, 'unknown-owner'),
    safeStorageSegment(studentUid, 'unknown-student'),
    safeStorageSegment(submissionId, 'submission'),
    `${safeStorageSegment(imageId, 'image')}.jpg`,
  ].join('/');
}
