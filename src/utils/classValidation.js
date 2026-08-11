export function sortTests(tests = []) {
  return [...tests].sort((a, b) => {
    const typeOrder = Number(a.type === 'final') - Number(b.type === 'final');
    return typeOrder || String(a.date || '').localeCompare(String(b.date || ''));
  });
}
export function validateTestSchedule({ tests = [], lessonDates = [], startDate = '' }) {
  const errors = [];
  const normalizedDates = lessonDates.filter(Boolean).sort();
  const courseStart = normalizedDates[0] || startDate || '';
  const courseEnd = normalizedDates.at(-1) || '';
  const finals = tests.filter((test) => test.type === 'final');
  const progress = tests.filter((test) => test.type === 'progress');

  if (finals.length > 1) errors.push('Chỉ được có tối đa một bài kiểm tra cuối khóa.');

  tests.forEach((test) => {
    if (!test.date) errors.push(`${test.title || 'Bài kiểm tra'} chưa có ngày.`);
    if (courseStart && test.date && test.date < courseStart) {
      errors.push(`${test.title || 'Bài kiểm tra'} không thể diễn ra trước buổi học đầu tiên.`);
    }
    if (courseEnd && test.date && test.date > courseEnd) {
      errors.push(`${test.title || 'Bài kiểm tra'} không thể diễn ra sau buổi học cuối cùng.`);
    }
  });

  const finalDate = finals[0]?.date || '';
  const latestProgress = progress.map((test) => test.date).filter(Boolean).sort().at(-1) || '';
  if (finalDate && latestProgress && finalDate <= latestProgress) {
    errors.push('Bài kiểm tra cuối khóa phải diễn ra sau bài kiểm tra tiến độ cuối cùng.');
  }

  return errors;
}
