const dayIndex = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

function parseLocalDate(value) {
  const [year, month, day] = String(value || '').split('-').map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildMeetingDates(startDate, count, meetingSlots = [], sessionDates = []) {
  const total = Math.max(1, Number(count) || 1);
  const exactDates = (Array.isArray(sessionDates) ? sessionDates : []).filter(Boolean).slice(0, total);
  if (exactDates.length === total) return exactDates;

  const base = parseLocalDate(startDate || formatLocalDate(new Date()));
  const meetingDays = [...new Set(meetingSlots.map((slot) => dayIndex[slot.day]).filter(Number.isInteger))].sort((a, b) => a - b);
  const dates = [];
  if (!meetingDays.length) {
    for (let index = 0; index < total; index += 1) {
      const date = new Date(base);
      date.setDate(base.getDate() + index * 3);
      dates.push(formatLocalDate(date));
    }
    return dates;
  }

  const cursor = new Date(base);
  for (let safety = 0; dates.length < total && safety < 1000; safety += 1) {
    if (meetingDays.includes(cursor.getDay())) dates.push(formatLocalDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function orderQuestNodes(nodes = []) {
  return [...nodes].sort((a, b) => {
    const finalOrder = Number(a.type === 'final') - Number(b.type === 'final');
    if (finalOrder) return finalOrder;
    const dateOrder = String(a.date || '').localeCompare(String(b.date || ''));
    if (dateOrder) return dateOrder;
    const typeOrder = Number(a.type !== 'lesson') - Number(b.type !== 'lesson');
    return typeOrder || Number(a.order || 0) - Number(b.order || 0);
  }).map((node, index) => ({ ...node, sortOrder: index + 1 }));
}
