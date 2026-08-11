import readExcelFile from 'read-excel-file/browser';
import { sortTests, validateTestSchedule } from './classValidation.js';

const sheetAliases = {
  classInfo: ['thong tin lop', 'class info', 'lop hoc'],
  schedule: ['buoi hoc va test', 'lich hoc va test', 'sessions and tests', 'schedule'],
  students: ['hoc vien', 'students', 'danh sach hoc vien'],
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function plain(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLowerCase()
    .replace(/[_–—-]+/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function findSheet(sheets, aliases) {
  const wanted = aliases.map(plain);
  return sheets.find((sheet) => wanted.includes(plain(sheet.sheet)));
}

function formatDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const source = String(value ?? '').trim();
  if (!source) return '';
  const iso = source.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  const vietnamese = source.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (vietnamese) return `${vietnamese[3]}-${vietnamese[2].padStart(2, '0')}-${vietnamese[1].padStart(2, '0')}`;
  return '';
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && formatDate(date) === value;
}

function normalizeTime(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
  }
  if (typeof value === 'number' && value >= 0 && value < 1) {
    const totalMinutes = Math.round(value * 24 * 60);
    return `${String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
  }
  const source = String(value ?? '').trim();
  const match = source.match(/^(\d{1,2})(?::|h)(\d{2})$/i) || source.match(/^(\d{1,2})$/);
  if (!match) return '';
  const hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  if (hour > 23 || minute > 59) return '';
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function keyValueRows(rows = []) {
  const record = {};
  rows.forEach((row) => {
    const key = plain(row?.[0]);
    if (key) record[key] = row?.[1];
  });
  return record;
}

function valueByAlias(record, aliases) {
  for (const alias of aliases) {
    const value = record[plain(alias)];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return '';
}

function tableRows(rows = [], headerAliases = []) {
  const wantedHeaders = headerAliases.map(plain);
  const headerIndex = rows.findIndex((row) => {
    const cells = row.map(plain);
    return wantedHeaders.some((header) => cells.includes(header));
  });
  if (headerIndex < 0) return [];
  const headers = rows[headerIndex].map(plain);
  return rows.slice(headerIndex + 1)
    .filter((row) => row.some((cell) => String(cell ?? '').trim()))
    .map((row, index) => ({
      rowNumber: headerIndex + index + 2,
      values: Object.fromEntries(headers.map((header, column) => [header, row[column]])),
    }));
}

function cell(row, aliases) {
  return valueByAlias(row.values, aliases);
}

function normalizeEntryType(value) {
  const type = plain(value);
  if (['buoi hoc', 'lesson', 'session', 'class'].includes(type)) return 'lesson';
  if (['progress test', 'progress', 'kiem tra tien do', 'mini boss'].includes(type)) return 'progress';
  if (['final test', 'final', 'kiem tra cuoi khoa', 'final boss'].includes(type)) return 'final';
  return '';
}

function deriveMeetingSlots(sessions) {
  const seen = new Set();
  return sessions.flatMap((session) => {
    if (!session.start || !session.end || session.start >= session.end) return [];
    const date = new Date(`${session.date}T12:00:00`);
    const day = dayNames[date.getDay()];
    const key = `${day}-${session.start}-${session.end}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ id: `imported-slot-${seen.size}`, day, start: session.start, end: session.end }];
  });
}

function normalizeRole(value) {
  const role = plain(value);
  const roles = {
    warrior: 'Warrior', chien_binh: 'Warrior', 'chien binh': 'Warrior',
    mage: 'Mage', phap_su: 'Mage', 'phap su': 'Mage',
    cleric: 'Cleric', healer: 'Cleric',
    explorer: 'Explorer', tham_hiem: 'Explorer', 'tham hiem': 'Explorer',
    guardian: 'Guardian', ho_ve: 'Guardian', 'ho ve': 'Guardian',
    bard: 'Bard', nghe_si: 'Bard', 'nghe si': 'Bard',
  };
  return roles[role] || 'Explorer';
}

function normalizeGender(value) {
  const gender = plain(value);
  if (['female', 'nu', 'f'].includes(gender)) return 'female';
  return 'male';
}

export async function parseClassWorkbook(fileOrBlob) {
  const sheets = await readExcelFile(fileOrBlob);
  const classSheet = findSheet(sheets, sheetAliases.classInfo);
  const scheduleSheet = findSheet(sheets, sheetAliases.schedule);
  const studentSheet = findSheet(sheets, sheetAliases.students);
  const errors = [];
  const warnings = [];

  if (!classSheet) errors.push('Không tìm thấy sheet THONG_TIN_LOP.');
  if (!scheduleSheet) errors.push('Không tìm thấy sheet BUOI_HOC_VA_TEST.');
  if (!studentSheet) errors.push('Không tìm thấy sheet HOC_VIEN.');
  if (errors.length) return { errors, warnings, classInfo: null, sessions: [], tests: [], students: [] };

  const classRecord = keyValueRows(classSheet.data);
  const classInfo = {
    name: String(valueByAlias(classRecord, ['Tên lớp', 'Class name']) || '').trim(),
    code: String(valueByAlias(classRecord, ['Mã lớp', 'Class code']) || '').trim(),
    level: String(valueByAlias(classRecord, ['Level', 'Trình độ']) || '').trim(),
    sessionCount: Number(valueByAlias(classRecord, ['Số buổi học', 'Số buổi', 'Session count']) || 0),
    startDate: formatDate(valueByAlias(classRecord, ['Ngày bắt đầu', 'Ngày khai giảng', 'Start date'])),
    description: String(valueByAlias(classRecord, ['Mô tả', 'Description']) || '').trim(),
  };

  if (!classInfo.name) errors.push('Sheet THONG_TIN_LOP chưa có Tên lớp.');
  if (classInfo.sessionCount && (!Number.isInteger(classInfo.sessionCount) || classInfo.sessionCount < 1)) {
    errors.push('Số buổi học phải là số nguyên lớn hơn 0.');
  }
  if (classInfo.startDate && !validDate(classInfo.startDate)) errors.push('Ngày bắt đầu không hợp lệ.');

  const scheduleRows = tableRows(scheduleSheet.data, ['Loại', 'Type']);
  const sessions = [];
  const tests = [];
  scheduleRows.forEach((row) => {
    const type = normalizeEntryType(cell(row, ['Loại', 'Type']));
    if (!type) {
      errors.push(`Sheet BUOI_HOC_VA_TEST, dòng ${row.rowNumber}: Loại phải là BUOI_HOC, PROGRESS_TEST hoặc FINAL_TEST.`);
      return;
    }
    const date = formatDate(cell(row, ['Ngày', 'Date']));
    if (!validDate(date)) {
      errors.push(`Sheet BUOI_HOC_VA_TEST, dòng ${row.rowNumber}: Ngày không hợp lệ.`);
      return;
    }
    const title = String(cell(row, ['Tên', 'Tên buổi / bài test', 'Title']) || '').trim();
    if (type === 'lesson') {
      const order = Number(cell(row, ['STT', 'Buổi số', 'Order']) || sessions.length + 1);
      if (!Number.isInteger(order) || order < 1) {
        errors.push(`Sheet BUOI_HOC_VA_TEST, dòng ${row.rowNumber}: STT phải là số nguyên dương.`);
        return;
      }
      const start = normalizeTime(cell(row, ['Giờ bắt đầu', 'Start time']));
      const end = normalizeTime(cell(row, ['Giờ kết thúc', 'End time']));
      if ((start && !end) || (!start && end) || (start && end && start >= end)) {
        errors.push(`Sheet BUOI_HOC_VA_TEST, dòng ${row.rowNumber}: Giờ học chưa hợp lệ.`);
        return;
      }
      sessions.push({
        order,
        title: title || `Buổi ${order}`,
        date,
        start,
        end,
        description: String(cell(row, ['Mô tả', 'Nội dung', 'Description']) || '').trim(),
      });
      return;
    }
    tests.push({
      title: title || (type === 'final' ? 'Kiểm tra cuối khóa' : `Kiểm tra tiến độ ${tests.filter((test) => test.type === 'progress').length + 1}`),
      date,
      type,
      maxScore: Math.max(1, Number(cell(row, ['Điểm tối đa', 'Max score'])) || 100),
      description: String(cell(row, ['Mô tả', 'Nội dung / hình thức', 'Description']) || '').trim(),
    });
  });

  sessions.sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || a.date.localeCompare(b.date));
  if (!sessions.length) errors.push('Sheet BUOI_HOC_VA_TEST cần có ít nhất một dòng BUOI_HOC.');
  const duplicateOrders = sessions.filter((session, index) => sessions.findIndex((item) => item.order === session.order) !== index);
  if (duplicateOrders.length) errors.push('STT buổi học bị trùng. Mỗi buổi cần một STT riêng.');
  if (sessions.some((session, index) => session.order !== index + 1)) errors.push('STT buổi học phải liên tục từ 1 đến hết khóa.');
  if (sessions.some((session, index) => index > 0 && session.date < sessions[index - 1].date)) {
    errors.push('Ngày học phải tăng dần theo STT buổi học.');
  }
  const duplicateDates = sessions.filter((session, index) => sessions.findIndex((item) => item.date === session.date && item.start === session.start) !== index);
  if (duplicateDates.length) warnings.push('Có nhiều buổi trùng ngày và giờ. Hãy kiểm tra lại trước khi nhập.');
  if (!sessions.some((session) => session.start && session.end)) warnings.push('File chưa có giờ học; hệ thống vẫn nhập đúng ngày từng buổi nhưng lịch học hằng tuần sẽ để trống.');
  if (sessions.length && classInfo.sessionCount !== sessions.length) {
    if (classInfo.sessionCount) warnings.push(`Số buổi được điều chỉnh từ ${classInfo.sessionCount} thành ${sessions.length} để khớp danh sách từng buổi.`);
    classInfo.sessionCount = sessions.length;
  }
  if (!classInfo.startDate && sessions.length) classInfo.startDate = sessions[0].date;

  const studentRows = tableRows(studentSheet.data, ['Họ và tên', 'Full name', 'Name']);
  const students = [];
  studentRows.forEach((row) => {
    const name = String(cell(row, ['Họ và tên', 'Tên học viên', 'Full name', 'Name']) || '').trim();
    if (!name) {
      errors.push(`Sheet HOC_VIEN, dòng ${row.rowNumber}: thiếu Họ và tên.`);
      return;
    }
    const email = String(cell(row, ['Email']) || '').trim().toLowerCase();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.push(`Sheet HOC_VIEN, dòng ${row.rowNumber}: Email không hợp lệ.`);
    students.push({
      name,
      email,
      username: String(cell(row, ['Tên đăng nhập', 'Username']) || '').trim().toLowerCase(),
      role: normalizeRole(cell(row, ['Vai trò', 'Nhân vật', 'Role'])),
      gender: normalizeGender(cell(row, ['Giới tính', 'Gender'])),
      note: String(cell(row, ['Ghi chú', 'Note']) || '').trim(),
    });
  });
  const duplicateEmails = students.filter((student, index) => student.email && students.findIndex((item) => item.email === student.email) !== index);
  if (duplicateEmails.length) errors.push('Email học viên bị trùng trong sheet HOC_VIEN.');
  const duplicateUsernames = students.filter((student, index) => student.username && students.findIndex((item) => item.username === student.username) !== index);
  if (duplicateUsernames.length) errors.push('Tên đăng nhập bị trùng trong sheet HOC_VIEN.');
  if (!students.length) warnings.push('File chưa có học viên. Bạn vẫn có thể tạo lớp và thêm học viên sau.');

  errors.push(...validateTestSchedule({ tests, lessonDates: sessions.map((session) => session.date), startDate: classInfo.startDate }));
  const orderedTests = sortTests(tests);

  return {
    errors,
    warnings,
    classInfo: {
      ...classInfo,
      sessionDates: sessions.map((session) => session.date),
      meetingSlots: deriveMeetingSlots(sessions),
    },
    sessions,
    tests: orderedTests,
    students,
  };
}

export function googleSheetExportUrl(value) {
  const source = String(value || '').trim();
  const id = source.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
  if (!id) throw new Error('Link Google Sheet chưa đúng định dạng.');
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`;
}
