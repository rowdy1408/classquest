import React, { useState } from 'react';
import { CalendarDays, ChevronRight, HelpCircle, Plus, School, Trash2, Upload, Users } from '../../icons';
import { Link } from 'react-router-dom';
import ClickableSchedule from '../../components/ClickableSchedule';
import ClassImportModal, { ClassImportHelpModal } from '../../components/ClassImportModal';
import Modal from '../../components/Modal';
import { useApp } from '../../context/AppContext';
import { validateTestSchedule } from '../../utils/classValidation';
import { buildMeetingDates } from '../../utils/questSchedule';

const makeTempId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function makeTest(type = 'progress', order = 1) {
  return {
    tempId: makeTempId('test'),
    title: type === 'final' ? 'Kiểm tra cuối khóa' : `Kiểm tra tiến độ ${order}`,
    date: '',
    type,
    maxScore: 100,
    description: '',
  };
}

function orderTests(tests) {
  return [
    ...tests.filter((test) => test.type === 'progress'),
    ...tests.filter((test) => test.type === 'final'),
  ];
}

function makeEmptyForm() {
  return {
    name: '',
    code: '',
    level: '',
    startDate: '',
    sessionCount: 16,
    description: '',
    meetingSlots: [],
    tests: [makeTest('progress', 1), makeTest('final', 1)],
  };
}

export default function ClassesPage() {
  const { data, currentTeacher, addClass, importClassBundle, deleteClass } = useApp();
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [form, setForm] = useState(() => makeEmptyForm());
  const [error, setError] = useState('');
  const classes = data.classes.filter((item) => item.teacherId === currentTeacher.id);

  const openCreate = () => {
    setForm(makeEmptyForm());
    setError('');
    setOpen(true);
  };

  const closeCreate = () => {
    setOpen(false);
    setError('');
  };

  const updateTest = (tempId, patch) => {
    setForm((current) => ({
      ...current,
      tests: orderTests(current.tests.map((test) => (test.tempId === tempId ? { ...test, ...patch } : test))),
    }));
  };

  const removeTest = (tempId) => {
    setForm((current) => ({ ...current, tests: current.tests.filter((test) => test.tempId !== tempId) }));
  };

  const addProgressTest = () => {
    setForm((current) => {
      const progressCount = current.tests.filter((test) => test.type === 'progress').length;
      return { ...current, tests: orderTests([...current.tests, makeTest('progress', progressCount + 1)]) };
    });
  };

  const addFinalTest = () => {
    setForm((current) => ({ ...current, tests: orderTests([...current.tests, makeTest('final', 1)]) }));
  };

  const submit = (event) => {
    event.preventDefault();
    setError('');

    if (!form.meetingSlots.length) {
      setError('Hãy thêm ít nhất một lịch học hằng tuần để Quest Map tính ngày cho từng buổi.');
      return;
    }

    const incompleteTest = form.tests.find((test) => !test.title.trim() || !test.date);
    if (incompleteTest) {
      setError('Hãy nhập đủ tên và ngày cho từng bài kiểm tra, hoặc xóa thẻ chưa dùng.');
      return;
    }

    const testBeforeStart = form.tests.find((test) => form.startDate && test.date < form.startDate);
    if (testBeforeStart) {
      setError(`${testBeforeStart.title} không thể diễn ra trước ngày khai giảng.`);
      return;
    }

    const finalTest = form.tests.find((test) => test.type === 'final');
    const latestProgressDate = form.tests
      .filter((test) => test.type === 'progress')
      .map((test) => test.date)
      .sort()
      .at(-1);
    if (finalTest && latestProgressDate && finalTest.date <= latestProgressDate) {
      setError('Ngày kiểm tra cuối khóa phải sau bài kiểm tra tiến độ cuối cùng.');
      return;
    }

    const lessonDates = buildMeetingDates(form.startDate, form.sessionCount, form.meetingSlots);
    const scheduleErrors = validateTestSchedule({ tests: form.tests, lessonDates, startDate: form.startDate });
    if (scheduleErrors.length) {
      setError(scheduleErrors[0]);
      return;
    }

    addClass({
      name: form.name,
      code: form.code,
      level: form.level,
      startDate: form.startDate,
      sessionCount: Math.max(1, Number(form.sessionCount) || 1),
      description: form.description,
      meetingSlots: form.meetingSlots,
      initialTests: orderTests(form.tests).map(({ tempId, ...test }) => ({ ...test, maxScore: Number(test.maxScore) || 100 })),
    });
    setForm(makeEmptyForm());
    setOpen(false);
  };

  const hasFinalTest = form.tests.some((test) => test.type === 'final');
  const orderedTests = orderTests(form.tests);

  return (
    <>
      <div className="page-toolbar">
        <div>
          <h2>Các lớp của bạn</h2>
          <p>Tạo thông tin lớp, lịch học và ngày kiểm tra trong cùng một bước. Quest Map sẽ được tạo tự động.</p>
        </div>
        <div className="button-row wrap class-toolbar-actions">
          <button className="button secondary" onClick={() => setImportOpen(true)}><Upload size={18} /> Nhập từ file</button>
          <button className="icon-button class-import-help-trigger" onClick={() => setHelpOpen(true)} aria-label="Cách tạo file nhập lớp" title="Cách tạo file"><HelpCircle size={18} /></button>
          <button className="button primary" onClick={openCreate}><Plus size={18} /> Tạo lớp</button>
        </div>
      </div>

      <div className="class-card-grid">
        {classes.map((klass) => {
          const count = data.students.filter((student) => student.classIds.includes(klass.id)).length;
          const nextTest = data.tests.filter((test) => test.classId === klass.id).sort((a, b) => a.date.localeCompare(b.date))[0];
          return (
            <article className="class-card" key={klass.id}>
              <div className="class-card-top">
                <span className="class-emblem"><School /></span>
                <button className="icon-button danger" aria-label={`Xóa lớp ${klass.name}`} onClick={() => window.confirm(`Xóa lớp ${klass.name}?`) && deleteClass(klass.id)}><Trash2 size={17} /></button>
              </div>
              <small>{klass.code || 'CHƯA CÓ MÃ'} · {klass.level || 'Chưa có level'}</small>
              <h3>{klass.name}</h3>
              <p>{klass.description || 'Chưa có mô tả lớp.'}</p>
              <div className="class-meta">
                <span><CalendarDays size={15} /> Khai giảng {klass.startDate || 'Chưa đặt'}</span>
                <span><Users size={15} /> {count} học viên</span>
                <span>🗺️ {klass.sessionCount || 0} buổi</span>
              </div>
              {nextTest && <div className="next-boss">⚔️ Boss tiếp theo: {nextTest.title} · {nextTest.date}</div>}
              <Link className="button secondary full" to={`/teacher/classes/${klass.id}`}>Quản lý lớp <ChevronRight size={17} /></Link>
            </article>
          );
        })}
        {!classes.length && <div className="empty-state">Hãy tạo lớp đầu tiên để bắt đầu.</div>}
      </div>

      <Modal open={open} title="Tạo lớp và Quest Map" onClose={closeCreate} wide>
        <form className="form-grid create-class-form" onSubmit={submit}>
          <section className="create-form-section span-2">
            <div className="create-section-heading">
              <span className="create-step">1</span>
              <div><small>THIẾT LẬP LỚP HỌC</small><h3>Thông tin và lịch học</h3><p>Nhập ba nội dung chính để hệ thống tự tạo Quest Map theo đúng lịch.</p></div>
            </div>
            <div className="form-grid nested-form-grid create-class-core-grid">
              <label className="span-2 create-core-field"><span>Tên lớp</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: IELTS Foundation – Bảo" required /></label>
              <label className="create-core-field"><span>Số buổi học</span><input min="1" type="number" value={form.sessionCount} onChange={(e) => setForm({ ...form, sessionCount: e.target.value })} required /><small className="field-help">Mỗi buổi tương ứng với một node trên Quest Map.</small></label>
              <label className="create-core-field"><span>Ngày bắt đầu</span><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /><small className="field-help">Ngày buổi học đầu tiên của lớp.</small></label>
            </div>

            <div className="create-schedule-block">
              <div className="create-subheading">
                <div><small>LỊCH HỌC</small><strong>Chọn ngày và giờ học cố định</strong></div>
                <span>Bắt buộc</span>
              </div>
              <ClickableSchedule value={form.meetingSlots} onChange={(meetingSlots) => setForm({ ...form, meetingSlots })} />
            </div>

            <details className="create-optional-details">
              <summary>Thêm mã lớp, level và mô tả <span>Không bắt buộc</span></summary>
              <div className="form-grid nested-form-grid">
                <label><span>Mã lớp</span><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="AA1-E01" /></label>
                <label><span>Level</span><input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="A1 → A2" /></label>
                <label className="span-2"><span>Mô tả</span><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="3" placeholder="Trọng tâm khóa học, nhóm học viên, mục tiêu chính…" /></label>
              </div>
            </details>
          </section>

          <section className="create-form-section span-2">
            <div className="create-section-heading test-heading-row">
              <div className="heading-with-step">
                <span className="create-step">2</span>
                <div><small>LỊCH BOSS</small><h3>Thêm ngày kiểm tra tiến độ và cuối khóa</h3><p>Các node Boss sẽ tự động được đặt khi tạo lớp.</p></div>
              </div>
              <div className="button-row wrap">
                <button type="button" className="mini-button" onClick={addProgressTest}><Plus size={15} /> Progress Test</button>
                {!hasFinalTest && <button type="button" className="mini-button final-test-button" onClick={addFinalTest}><Plus size={15} /> Final Test</button>}
              </div>
            </div>

            <div className="create-test-list">
              {orderedTests.map((test) => (
                <article className={`create-test-card ${test.type}`} key={test.tempId}>
                  <div className="test-card-toolbar">
                    <span className="test-kind-badge">{test.type === 'final' ? '👑 FINAL BOSS' : '⚔️ MINI BOSS'}</span>
                    <button type="button" className="icon-button danger" onClick={() => removeTest(test.tempId)} aria-label={`Xóa ${test.title}`}><Trash2 size={16} /></button>
                  </div>
                  <div className="form-grid nested-form-grid compact-grid">
                    <label><span>Tên bài kiểm tra</span><input value={test.title} onChange={(e) => updateTest(test.tempId, { title: e.target.value })} required /></label>
                    <label><span>Ngày kiểm tra</span><input type="date" min={form.startDate || undefined} value={test.date} onChange={(e) => updateTest(test.tempId, { date: e.target.value })} required /></label>
                    <label><span>Loại Boss</span><select value={test.type} onChange={(e) => updateTest(test.tempId, { type: e.target.value, title: e.target.value === 'final' && !test.title ? 'Kiểm tra cuối khóa' : test.title })}><option value="progress">Kiểm tra tiến độ</option><option value="final" disabled={test.type !== 'final' && hasFinalTest}>Kiểm tra cuối khóa</option></select></label>
                    <label><span>Điểm tối đa</span><input type="number" min="1" value={test.maxScore} onChange={(e) => updateTest(test.tempId, { maxScore: e.target.value })} /></label>
                    <label className="span-2"><span>Nội dung / hình thức</span><textarea rows="2" value={test.description} onChange={(e) => updateTest(test.tempId, { description: e.target.value })} placeholder="Kiểm tra nói, bài viết, dự án cuối khóa…" /></label>
                  </div>
                </article>
              ))}
              {!form.tests.length && <div className="empty-state compact">Chưa có bài kiểm tra. Bạn vẫn có thể tạo lớp và thêm sau.</div>}
            </div>
          </section>

          {error && <div className="form-error span-2">⚠️ {error}</div>}

          <div className="create-form-summary span-2">
            <div><strong>{form.sessionCount || 0}</strong><span>Buổi học</span></div>
            <div><strong>{form.meetingSlots.length}</strong><span>Ca học/tuần</span></div>
            <div><strong>{form.tests.filter((test) => test.type === 'progress').length}</strong><span>Mini Boss</span></div>
            <div><strong>{form.tests.filter((test) => test.type === 'final').length}</strong><span>Final Boss</span></div>
          </div>

          <div className="form-actions span-2 create-form-actions">
            <button className="button ghost" type="button" onClick={closeCreate}>Hủy</button>
            <button className="button primary" type="submit">Tạo lớp và Quest Map</button>
          </div>
        </form>
      </Modal>

      <ClassImportModal open={importOpen} onClose={() => setImportOpen(false)} onImport={importClassBundle} onHelp={() => setHelpOpen(true)} />
      <ClassImportHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
