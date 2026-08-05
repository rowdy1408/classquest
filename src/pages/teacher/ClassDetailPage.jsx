import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Edit3, Plus, RotateCcw, Save, Trash2 } from '../../icons';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ClickableSchedule from '../../components/ClickableSchedule';
import Modal from '../../components/Modal';
import QuestMap from '../../components/QuestMap';
import CharacterAvatar from '../../components/CharacterAvatar';
import { useApp } from '../../context/AppContext';

const tabs = [
  ['Overview', 'Tổng quan'],
  ['Students', 'Học viên'],
  ['Groups', 'Biệt đội'],
  ['Points', 'Điểm thưởng'],
  ['Rules', 'Quy tắc'],
  ['Tests', 'Kiểm tra'],
  ['Quest Map', 'Quest Map'],
  ['Submissions', 'Bài nộp'],
];
const dayLabels = { Monday: '2', Tuesday: '3', Wednesday: '4', Thursday: '5', Friday: '6', Saturday: '7', Sunday: 'CN' };
function createTemporaryPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const values = new Uint32Array(12);
  window.crypto.getRandomValues(values);
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join('');
}

function createStudentCredentials(students = []) {
  const existingEmails = new Set(students.map((student) => student.email?.toLowerCase()).filter(Boolean));
  const existingUsernames = new Set(students.map((student) => student.username?.toLowerCase()).filter(Boolean));

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const token = Math.random().toString(36).slice(2, 8).padEnd(6, '0');
    const username = `student-${token}`;
    const email = `${username}@classquest.local`;
    if (!existingEmails.has(email) && !existingUsernames.has(username)) {
      return { email, username, password: createTemporaryPassword() };
    }
  }

  const fallback = `student-${Date.now().toString(36)}`;
  return { email: `${fallback}@classquest.local`, username: fallback, password: createTemporaryPassword() };
}

function formatDate(value) {
  if (!value) return 'Chưa xếp lịch';
  return new Date(`${value}T12:00:00`).toLocaleDateString('vi-VN');
}

function meetingPattern(slots = []) {
  const days = [...new Set(slots.map((slot) => slot.day))];
  if (!days.length) return 'Chưa đặt';
  return days.map((day) => dayLabels[day] || day).join('–');
}

export default function ClassDetailPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const app = useApp();
  const { data, roleCatalog } = app;
  const klass = data.classes.find((item) => item.id === classId);
  const [activeTab, setActiveTab] = useState('Overview');
  const [modal, setModal] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  if (!klass) return <div className="empty-state">Không tìm thấy lớp. <button className="button secondary" onClick={() => navigate('/teacher/classes')}>Quay lại</button></div>;

  const classStudents = data.students.filter((student) => student.classIds.includes(classId));
  const classGroups = data.groups.filter((group) => group.classId === classId);
  const classRules = data.rules.filter((rule) => rule.classId === classId);
  const classTests = data.tests.filter((test) => test.classId === classId).sort((a, b) => a.date.localeCompare(b.date));
  const classNodes = data.questNodes.filter((node) => node.classId === classId);
  const classSubmissions = data.submissions.filter((submission) => classNodes.some((node) => node.id === submission.nodeId));

  return (
    <>
      <div className="class-detail-heading">
        <Link className="back-link inline" to="/teacher/classes"><ArrowLeft size={17} /> Tất cả lớp</Link>
        <div className="class-title-row">
          <div><small>{klass.code} · {klass.level}</small><h2>{klass.name}</h2><p>{klass.description}</p></div>
          <div className="class-heading-badges">
            <span className="class-badge">Khai giảng {klass.startDate || 'Chưa đặt'}</span>
            <span className="class-badge">{klass.sessionCount || classNodes.length || 0} buổi</span>
            <span className="class-badge">Lịch {meetingPattern(klass.meetingSlots)}</span>
          </div>
        </div>
      </div>
      <div className="tab-strip">{tabs.map(([tab, label]) => <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{label}</button>)}</div>

      {activeTab === 'Overview' && <OverviewTab klass={klass} tests={classTests} nodes={classNodes} updateClass={app.updateClass} />}
      {activeTab === 'Students' && <StudentsTab students={classStudents} roleCatalog={roleCatalog} onAdd={() => { setEditingStudent(null); setModal('student'); }} onEdit={(student) => { setEditingStudent(student); setModal('student'); }} onActivate={app.activateStudentAccount} onDelete={app.deleteStudent} />}
      {activeTab === 'Groups' && <GroupsTab groups={classGroups} students={classStudents} onAdd={() => setModal('group')} onUpdate={app.updateGroup} onDelete={app.deleteGroup} />}
      {activeTab === 'Points' && <PointsTab students={classStudents} logs={data.pointLogs.filter((log) => log.classId === classId)} onApply={() => setModal('points')} />}
      {activeTab === 'Rules' && <RulesTab rules={classRules} onAdd={() => setModal('rule')} onDelete={app.deleteRule} />}
      {activeTab === 'Tests' && <TestsTab tests={classTests} onAdd={() => setModal('test')} onDelete={app.deleteTest} />}
      {activeTab === 'Quest Map' && <QuestMapTab nodes={classNodes} sessionCount={klass.sessionCount} onGenerate={() => setModal('generate')} onEdit={(node) => { setEditingNode(node); setModal('node'); }} submissions={data.submissions} />}
      {activeTab === 'Submissions' && <SubmissionsTab submissions={classSubmissions} students={data.students} nodes={data.questNodes} onReview={app.reviewSubmission} />}

      <ClassModal modal={modal} setModal={setModal} classId={classId} students={classStudents} roleCatalog={roleCatalog} app={app} editingNode={editingNode} editingStudent={editingStudent} klass={klass} tests={classTests} />
    </>
  );
}

function OverviewTab({ klass, tests, nodes, updateClass }) {
  const [form, setForm] = useState({ sessionCount: 16, meetingSlots: [], ...klass });
  useEffect(() => setForm({ sessionCount: 16, meetingSlots: [], ...klass }), [klass]);
  const save = (event) => {
    event.preventDefault();
    const nextCount = Math.max(1, Number(form.sessionCount) || 1);
    if (nextCount < nodes.length) {
      const confirmed = window.confirm(
        `Giảm khóa học từ ${nodes.length} còn ${nextCount} buổi? Các node vượt quá số buổi mới và bài nộp liên quan sẽ bị xóa.`,
      );
      if (!confirmed) return;
    }
    updateClass(klass.id, { ...form, sessionCount: nextCount });
  };
  const finalTest = tests.find((test) => test.type === 'final');

  return (
    <div className="overview-stack">
      <div className="class-summary-grid">
        <article><small>QUY MÔ KHÓA HỌC</small><strong>{form.sessionCount || 0}</strong><span>tổng số buổi</span></article>
        <article><small>LỊCH HẰNG TUẦN</small><strong>{meetingPattern(form.meetingSlots)}</strong><span>{form.meetingSlots.length} ca học mỗi tuần</span></article>
        <article><small>LỊCH KIỂM TRA</small><strong>{tests.length}</strong><span>{tests.length ? `${tests.filter((test) => test.type === 'progress').length} tiến độ · ${finalTest ? '1 cuối khóa' : 'chưa có cuối khóa'}` : 'Chưa có bài kiểm tra'}</span></article>
        <article><small>QUEST MAP</small><strong>{nodes.length}</strong><span>{nodes.length === Number(form.sessionCount) ? 'khớp với số buổi' : 'node hiện có'}</span></article>
      </div>

      <div className="two-column-grid class-information-grid">
        <form className="panel form-grid" onSubmit={save}>
          <div className="panel-header span-2"><div><small>THÔNG TIN LỚP</small><h2>Thông tin cơ bản</h2></div><Edit3 /></div>
          <label className="span-2"><span>Tên lớp</span><input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label><span>Mã lớp</span><input value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value })} /></label>
          <label><span>Level</span><input value={form.level || ''} onChange={(e) => setForm({ ...form, level: e.target.value })} /></label>
          <label><span>Ngày khai giảng</span><input type="date" value={form.startDate || ''} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label>
          <label><span>Tổng số buổi</span><input min="1" type="number" value={form.sessionCount || 1} onChange={(e) => setForm({ ...form, sessionCount: e.target.value })} /><small className="field-help">Quest Map tự thêm hoặc bớt node theo số buổi này.</small></label>
          <label className="span-2"><span>Mô tả</span><textarea rows="4" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="form-actions span-2"><button className="button primary"><Save size={17} /> Lưu thông tin lớp</button></div>
        </form>

        <div className="panel">
          <div className="panel-header"><div><small>LỊCH HỌC</small><h2>Lịch học hằng tuần</h2><p>Chọn lịch 2–4–6, 3–5–7, cuối tuần hoặc tự thiết lập.</p></div></div>
          <ClickableSchedule value={form.meetingSlots || []} onChange={(meetingSlots) => { setForm({ ...form, meetingSlots }); updateClass(klass.id, { meetingSlots }); }} />
        </div>
      </div>

      <div className="panel">
        <div className="panel-header"><div><small>NGÀY BOSS</small><h2>Lịch kiểm tra</h2><p>Các ngày này dùng để đặt Mini Boss và Final Boss trên Quest Map.</p></div></div>
        {tests.length ? (
          <div className="test-date-grid">
            {tests.map((test) => (
              <article className={test.type} key={test.id}>
                <span>{test.type === 'final' ? '👑' : '⚔️'}</span>
                <div><small>{test.type === 'final' ? 'FINAL BOSS' : 'MINI BOSS'}</small><strong>{test.title}</strong><em>{formatDate(test.date)}</em></div>
              </article>
            ))}
          </div>
        ) : <div className="empty-state compact">Thêm bài kiểm tra tiến độ và cuối khóa tại tab Kiểm tra.</div>}
      </div>
    </div>
  );
}

function StudentsTab({ students, roleCatalog, onAdd, onEdit, onActivate, onDelete }) {
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');

  const activate = async (student) => {
    const temporaryPassword = window.prompt(
      `Nhập mật khẩu tạm cho ${student.name}. Hãy sao chép và gửi riêng cho học viên.`,
      createTemporaryPassword(),
    );
    if (!temporaryPassword) return;
    setBusyId(student.id);
    setMessage('');
    const result = await onActivate(student.id, temporaryPassword);
    setBusyId('');
    setMessage(result.ok ? `Đã kích hoạt đăng nhập online cho ${student.name}. Hãy gửi riêng mật khẩu tạm vừa chọn.` : result.message);
  };

  const remove = async (student) => {
    if (!window.confirm(`Xóa ${student.name}? Tài khoản online sẽ bị khóa.`)) return;
    setBusyId(student.id);
    setMessage('');
    const result = await onDelete(student.id);
    setBusyId('');
    if (result?.ok === false) setMessage(result.message);
  };

  return (
    <div className="panel">
      <div className="panel-header"><div><small>DANH SÁCH LỚP</small><h2>Học viên</h2></div><button className="button primary" onClick={onAdd}><Plus size={17} /> Thêm học viên</button></div>
      {message && <div className="account-sync-message" role="status">{message}</div>}
      <div className="table-wrap"><table><thead><tr><th>Học viên</th><th>Đăng nhập</th><th>Nhân vật</th><th>Cấp</th><th>XP</th><th>Gold</th><th></th></tr></thead><tbody>
        {students.map((student) => <tr key={student.id}><td><div className="student-cell"><CharacterAvatar student={student} className="teacher-table-avatar" /><div><strong>{student.name}</strong><small>{student.email}</small></div></div></td><td><code>{student.username}</code><span className={`account-status ${student.authUid ? 'ready' : 'pending'}`}>{student.authUid ? 'Online' : 'Chưa kích hoạt'}</span></td><td>{roleCatalog[student.role]?.icon} {roleCatalog[student.role]?.displayName || student.role}</td><td>{student.level}</td><td>{student.xp}/{student.xpToNext}</td><td>🪙 {student.gold}</td><td><div className="button-row">{!student.authUid && <button className="mini-button" disabled={busyId === student.id} onClick={() => activate(student)}>{busyId === student.id ? 'Đang tạo…' : 'Kích hoạt'}</button>}<button className="icon-button" title="Sửa học viên" onClick={() => onEdit(student)}><Edit3 size={16} /></button><button className="icon-button danger" disabled={busyId === student.id} onClick={() => remove(student)}><Trash2 size={16} /></button></div></td></tr>)}
      </tbody></table></div>
      {!students.length && <div className="empty-state compact">Chưa có học viên.</div>}
    </div>
  );
}

function GroupsTab({ groups, students, onAdd, onUpdate, onDelete }) {
  const toggle = (group, studentId) => {
    const memberIds = group.memberIds.includes(studentId) ? group.memberIds.filter((id) => id !== studentId) : [...group.memberIds, studentId];
    onUpdate(group.id, { memberIds });
  };
  return (
    <div className="panel">
      <div className="panel-header"><div><small>BIỆT ĐỘI</small><h2>Nhóm trong lớp</h2></div><button className="button primary" onClick={onAdd}><Plus size={17} /> Tạo biệt đội</button></div>
      <div className="group-grid">{groups.map((group) => <article className="group-card" key={group.id}><div className="group-card-title"><span>🛡️</span><div><h3>{group.name}</h3><p>{group.motto}</p></div><button className="icon-button danger" onClick={() => onDelete(group.id)}><Trash2 size={16} /></button></div><div className="member-checklist">{students.map((student) => <label key={student.id} className={group.memberIds.includes(student.id) ? 'checked' : ''}><input type="checkbox" checked={group.memberIds.includes(student.id)} onChange={() => toggle(group, student.id)} /><span className="checklist-student"><CharacterAvatar student={student} className="checklist-character-avatar" /> {student.name}</span></label>)}</div></article>)}</div>
      {!groups.length && <div className="empty-state compact">Hãy tạo biệt đội đầu tiên.</div>}
    </div>
  );
}

function PointsTab({ students, logs, onApply }) {
  return (
    <div className="two-column-grid">
      <div className="panel"><div className="panel-header"><div><small>THAO TÁC NHANH</small><h2>Cộng hoặc trừ điểm</h2></div><button className="button primary" onClick={onApply}><Plus size={17} /> Điều chỉnh điểm</button></div><div className="student-score-list">{students.map((student) => <div className="score-row" key={student.id}><CharacterAvatar student={student} className="score-character-avatar" /><div><strong>{student.name}</strong><small>{roleCatalog[student.role]?.displayName || student.role} · Cấp {student.level}</small></div><b>⭐ {student.xp}</b><b>🪙 {student.gold}</b></div>)}</div></div>
      <div className="panel"><div className="panel-header"><div><small>LỊCH SỬ</small><h2>Thay đổi gần đây</h2></div></div><div className="stack-list">{logs.slice(0, 12).map((log) => { const student = students.find((item) => item.id === log.studentId); return <div className="list-row" key={log.id}><span className={`round-icon ${log.points >= 0 ? 'positive' : 'negative'}`}>{log.points >= 0 ? '+' : '−'}</span><div><strong>{student?.name || 'Học viên'} · {log.reason}</strong><small>{log.points >= 0 ? '+' : ''}{log.points} XP · {log.gold >= 0 ? '+' : ''}{log.gold} Gold</small></div></div>; })}{!logs.length && <div className="empty-state compact">Chưa có thay đổi điểm.</div>}</div></div>
    </div>
  );
}

function RulesTab({ rules, onAdd, onDelete }) {
  return <div className="panel"><div className="panel-header"><div><small>HỆ THỐNG ĐIỂM</small><h2>Quy tắc thưởng phạt</h2></div><button className="button primary" onClick={onAdd}><Plus size={17} /> Thêm quy tắc</button></div><div className="rule-grid">{rules.map((rule) => <article className={`rule-card ${rule.type}`} key={rule.id}><div><span>{rule.type === 'reward' ? '🏆 Khen thưởng' : '⚠️ Trừ điểm'}</span><h3>{rule.title}</h3><p>{rule.description}</p></div><div className="rule-values"><strong>{rule.points > 0 ? '+' : ''}{rule.points} XP</strong><strong>{rule.gold > 0 ? '+' : ''}{rule.gold} Gold</strong><button className="icon-button danger" onClick={() => onDelete(rule.id)}><Trash2 size={16} /></button></div></article>)}</div></div>;
}

function TestsTab({ tests, onAdd, onDelete }) {
  return <div className="panel"><div className="panel-header"><div><small>LỊCH BOSS</small><h2>Kiểm tra & đánh giá</h2><p>Thêm ngày chính xác rồi đồng bộ Quest Map để đặt Mini Boss và Final Boss.</p></div><button className="button primary" onClick={onAdd}><Plus size={17} /> Thêm bài kiểm tra</button></div><div className="timeline-list">{tests.map((test) => <div className={`timeline-item ${test.type}`} key={test.id}><span className="timeline-dot">{test.type === 'final' ? '👑' : '⚔️'}</span><div><small>{formatDate(test.date)} · {test.type === 'final' ? 'cuối khóa' : 'tiến độ'}</small><h3>{test.title}</h3><p>{test.description}</p><span>Điểm tối đa: {test.maxScore}</span></div><button className="icon-button danger" onClick={() => onDelete(test.id)}><Trash2 size={16} /></button></div>)}</div>{!tests.length && <div className="empty-state compact">Chưa có bài kiểm tra.</div>}</div>;
}

function QuestMapTab({ nodes, sessionCount, onGenerate, onEdit, submissions }) {
  const closed = nodes.filter((node) => node.submissionLocked || (node.lockAfterDeadline && node.deadline && new Date(node.deadline).getTime() < Date.now())).length;
  const expected = Math.max(1, Number(sessionCount) || 1);
  const synced = nodes.length === expected;
  return <div className="panel quest-panel"><div className="panel-header"><div><small>LỘ TRÌNH RPG</small><h2>Quest Map</h2><p>{nodes.length}/{expected} node buổi học · {closed} cửa sổ nộp bài đã đóng</p><span className={`sync-status ${synced ? 'synced' : 'syncing'}`}>{synced ? '✓ Đã tự động khớp với tổng số buổi' : 'Đang cập nhật node theo số buổi…'}</span></div><div className="button-row"><button className="button secondary" onClick={onGenerate}>Đồng bộ ngày & Boss</button></div></div><QuestMap nodes={nodes} submissions={submissions} teacherMode onEdit={onEdit} /></div>;
}

function SubmissionsTab({ submissions, students, nodes, onReview }) {
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');

  const openSubmission = (submission) => {
    setSelected(submission);
    setFeedback(submission.teacherFeedback || '');
  };

  const review = (status) => {
    onReview(selected.id, status, feedback);
    setSelected(null);
  };

  return (
    <>
      <div className="panel">
        <div className="panel-header"><div><small>DUYỆT NHIỆM VỤ</small><h2>Bài nộp của học viên</h2><p>Mở từng bài để kiểm tra đường dẫn, câu trả lời và hình ảnh minh chứng.</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>Học viên</th><th>Nhiệm vụ</th><th>Thời gian nộp</th><th>Minh chứng</th><th>Trạng thái</th><th>Duyệt</th></tr></thead><tbody>
          {submissions.map((submission) => {
            const student = students.find((item) => item.id === submission.studentId);
            const node = nodes.find((item) => item.id === submission.nodeId);
            const evidenceCount = Number(Boolean(submission.workLink)) + Number(Boolean(submission.responseText)) + Number(submission.images?.length || 0);
            return <tr key={submission.id}><td><div className="student-cell"><CharacterAvatar student={student} className="teacher-table-avatar" /><strong>{student?.name}</strong></div></td><td>{node?.title}</td><td>{new Date(submission.submittedAt).toLocaleString('vi-VN')}</td><td>{evidenceCount} mục</td><td><span className={`status-tag ${submission.status}`}>{submission.status}</span></td><td><button className="mini-button" onClick={() => openSubmission(submission)}>Xem & duyệt</button></td></tr>;
          })}
        </tbody></table></div>
        {!submissions.length && <div className="empty-state compact">Chưa có bài nộp.</div>}
      </div>

      <Modal open={Boolean(selected)} title="Kiểm tra minh chứng bài nộp" onClose={() => setSelected(null)} wide>
        {selected && (() => {
          const student = students.find((item) => item.id === selected.studentId);
          const node = nodes.find((item) => item.id === selected.nodeId);
          return (
            <div className="submission-review">
              <div className="review-heading"><div><small>HỌC VIÊN</small><strong className="review-student-name"><CharacterAvatar student={student} className="teacher-table-avatar" /> {student?.name}</strong></div><div><small>NHIỆM VỤ</small><strong>{node?.title}</strong></div><div><small>LẦN NỘP</small><strong>#{selected.attemptCount || 1}</strong></div></div>

              {selected.workLink && <section><small>ĐƯỜNG DẪN BÀI LÀM</small><a className="evidence-link" href={selected.workLink} target="_blank" rel="noreferrer">Mở đường dẫn đã nộp ↗</a></section>}
              {selected.responseText && <section><small>CÂU TRẢ LỜI</small><p className="response-paper">{selected.responseText}</p></section>}
              {selected.studentNote && <section><small>GHI CHÚ CỦA HỌC VIÊN</small><p>{selected.studentNote}</p></section>}
              {selected.images?.length > 0 && <section><small>HÌNH ẢNH MINH CHỨNG</small><div className="review-image-grid">{selected.images.map((image) => <a key={image.id} href={image.dataUrl} target="_blank" rel="noreferrer"><img src={image.dataUrl} alt={image.name} /><span>{image.name}</span></a>)}</div></section>}
              {!selected.workLink && !selected.responseText && !selected.images?.length && <div className="empty-state compact">Bài nộp này chưa có minh chứng.</div>}

              <label><span>Nhận xét của giáo viên</span><textarea rows="4" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Nêu phần đã đạt hoặc nội dung cần sửa." /></label>
              <div className="form-actions"><button className="button warning" onClick={() => review('revision')}>Yêu cầu chỉnh sửa</button><button className="button success" onClick={() => review('approved')}><Check size={16} /> Duyệt bài</button></div>
            </div>
          );
        })()}
      </Modal>
    </>
  );
}

function ClassModal({ modal, setModal, classId, students, roleCatalog, app, editingNode, editingStudent, klass, tests }) {
  const close = () => setModal(null);
  if (!modal) return null;

  if (modal === 'student') return <StudentFormModal open onClose={close} editingStudent={editingStudent} students={app.data.students} roleCatalog={roleCatalog} onSubmit={async (form) => { const level = Math.max(1, Math.min(30, Number(form.level) || 1)); const payload = { name: form.name, email: form.email, username: form.username, password: form.password, role: form.role, gender: form.gender, level, xpToNext: Math.max(100, level * 100), note: form.note || '' }; if (editingStudent) { app.updateStudent(editingStudent.id, payload); close(); return { ok: true }; } const result = await app.addStudent({ ...payload, classIds: [classId] }); if (result.ok) close(); return result; }} />;
  if (modal === 'group') return <SimpleFormModal title="Tạo biệt đội" open onClose={close} initial={{ name: '', motto: '' }} fields={[['name','Tên biệt đội','text'],['motto','Khẩu hiệu','text']]} onSubmit={(form) => { app.addGroup({ ...form, classId }); close(); }} />;
  if (modal === 'rule') return <SimpleFormModal title="Thêm quy tắc lớp" open onClose={close} initial={{ type: 'reward', title: '', points: 5, gold: 5, description: '' }} fields={[['type','Loại','select',[{ value: 'reward', label: 'Khen thưởng' }, { value: 'penalty', label: 'Trừ điểm' }]],['title','Tên quy tắc','text'],['points','Thay đổi XP','number'],['gold','Thay đổi Gold','number'],['description','Mô tả','textarea']]} onSubmit={(form) => { app.addRule({ ...form, classId, points: Number(form.points), gold: Number(form.gold) }); close(); }} />;
  if (modal === 'test') return <SimpleFormModal title="Thêm ngày kiểm tra" open onClose={close} initial={{ title: '', date: '', type: 'progress', maxScore: 100, description: '' }} fields={[['title','Tên bài kiểm tra','text'],['date','Ngày kiểm tra','date'],['type','Loại Boss','select',[{ value: 'progress', label: 'Kiểm tra tiến độ' }, { value: 'final', label: 'Kiểm tra cuối khóa' }]],['maxScore','Điểm tối đa','number'],['description','Nội dung / hình thức','textarea']]} onSubmit={(form) => { app.addTest({ ...form, classId, maxScore: Number(form.maxScore) }); close(); }} />;
  if (modal === 'generate') return <SimpleFormModal title="Đồng bộ Quest Map theo lịch lớp và ngày kiểm tra" open onClose={close} initial={{ sessionCount: klass.sessionCount || 16, startDate: klass.startDate || '' }} fields={[['sessionCount','Tổng số buổi học','number'],['startDate','Ngày khai giảng','date']]} onSubmit={(form) => { app.generateQuestMap({ ...form, classId }); close(); }} />;
  if (modal === 'points') return <SimpleFormModal title="Cộng hoặc trừ điểm" open onClose={close} initial={{ studentId: students[0]?.id || '', points: 0, gold: 0, reason: '' }} fields={[['studentId','Học viên','select',students.map((student) => ({ value: student.id, label: student.name }))],['points','Thay đổi XP','number'],['gold','Thay đổi Gold','number'],['reason','Lý do','text']]} onSubmit={(form) => { app.applyPoints({ ...form, classId, points: Number(form.points), gold: Number(form.gold) }); close(); }} />;
  if (modal === 'node') {
    const initial = editingNode || {
      order: 1,
      title: '',
      type: 'lesson',
      date: '',
      deadline: '',
      status: 'locked',
      xpReward: 60,
      goldReward: 12,
      description: '',
      assignmentInstructions: '',
      customPrompt: '',
      acceptedEvidence: 'Google link, image, or text',
      lockAfterDeadline: true,
      submissionLocked: false,
      testId: '',
    };
    const testOptions = [{ value: '', label: 'Không liên kết bài kiểm tra' }, ...tests.map((test) => ({ value: test.id, label: `${test.title} · ${test.date}` }))];
    return <SimpleFormModal wide title={editingNode ? 'Sửa nhiệm vụ và hạn nộp' : 'Thêm nhiệm vụ'} open onClose={close} initial={initial} fields={[
      ['order','Thứ tự node','number'],
      ['title','Tên node','text'],
      ['type','Loại node','select',[{ value: 'lesson', label: 'Buổi học' }, { value: 'miniboss', label: 'Mini Boss' }, { value: 'final', label: 'Final Boss' }]],
      ['testId','Bài kiểm tra liên kết','select',testOptions],
      ['date','Ngày học / nhiệm vụ','date'],
      ['deadline','Hạn nộp bài','datetime-local'],
      ['status','Quyền truy cập','select',[{ value: 'locked', label: 'Đã khóa' }, { value: 'available', label: 'Đang mở' }, { value: 'completed', label: 'Đã hoàn thành' }]],
      ['acceptedEvidence','Minh chứng chấp nhận','select',[{ value: 'Google link, image, or text', label: 'Đường dẫn, hình ảnh hoặc văn bản' }, { value: 'Google link only', label: 'Chỉ đường dẫn' }, { value: 'Evidence image only', label: 'Chỉ hình ảnh' }, { value: 'Written response only', label: 'Chỉ câu trả lời viết' }, { value: 'Teacher-scored test evidence', label: 'Bài kiểm tra do giáo viên chấm' }]],
      ['xpReward','XP thưởng','number'],
      ['goldReward','Gold thưởng','number'],
      ['description','Tóm tắt nhiệm vụ','textarea'],
      ['assignmentInstructions','Hướng dẫn bài tập chi tiết','textarea-large'],
      ['customPrompt','Yêu cầu riêng cho học viên','textarea-large'],
      ['lockAfterDeadline','Tự động đóng sau hạn nộp','checkbox'],
      ['submissionLocked','Đóng nộp bài ngay bây giờ','checkbox'],
    ]} onSubmit={(form) => {
      const payload = {
        ...form,
        classId,
        order: Number(form.order),
        xpReward: Number(form.xpReward),
        goldReward: Number(form.goldReward),
        lockAfterDeadline: Boolean(form.lockAfterDeadline),
        submissionLocked: Boolean(form.submissionLocked),
      };
      if (editingNode) app.updateQuestNode(editingNode.id, payload); else app.addQuestNode(payload);
      close();
    }} />;
  }
  return null;
}

function StudentFormModal({ open, onClose, editingStudent, students, roleCatalog, onSubmit }) {
  const makeInitial = () => editingStudent || {
    name: '',
    ...createStudentCredentials(students),
    role: 'Explorer',
    gender: 'male',
    level: 1,
    note: '',
  };
  const [form, setForm] = useState(makeInitial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const regenerate = () => {
    const credentials = createStudentCredentials(students);
    setForm((current) => ({ ...current, ...credentials }));
  };

  return (
    <Modal open={open} title={editingStudent ? 'Sửa nhân vật học viên' : 'Thêm học viên'} onClose={onClose}>
      <form className="form-grid student-account-form" onSubmit={async (event) => { event.preventDefault(); setError(''); setBusy(true); const result = await onSubmit(form); setBusy(false); if (result?.ok === false) setError(result.message); }}>
        <label className="span-2"><span>Họ tên học viên</span><input value={form.name || ''} onChange={(event) => setForm({ ...form, name: event.target.value })} required autoFocus /></label>

        <div className="generated-account-box span-2">
          <div className="generated-account-heading">
            <div><small>TÀI KHOẢN HỌC VIÊN</small><strong>{editingStudent ? 'Thông tin đăng nhập' : 'Được tạo tự động'}</strong></div>
            {!editingStudent && <button className="button secondary compact" type="button" onClick={regenerate}><RotateCcw size={15} /> Tạo mã khác</button>}
          </div>
          <div className="generated-account-grid">
            <label><span>Email nội bộ ClassQuest</span><input type="email" value={form.email || ''} onChange={(event) => setForm({ ...form, email: event.target.value })} readOnly={!editingStudent || Boolean(editingStudent?.authUid)} required /></label>
            <label><span>Tên đăng nhập</span><input value={form.username || ''} onChange={(event) => setForm({ ...form, username: event.target.value })} readOnly={!editingStudent || Boolean(editingStudent?.authUid)} required /></label>
            {!editingStudent?.authUid && <label className="span-2"><span>Mật khẩu tạm</span><input value={form.password || ''} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength="8" required /></label>}
          </div>
          {!editingStudent && <p>Tài khoản sẽ được tạo trên Firebase để học viên đăng nhập từ mọi thiết bị. Hãy gửi tên đăng nhập và mật khẩu cho học viên.</p>}
          {editingStudent?.authUid && <p>Tài khoản online đã được kích hoạt. Email và tên đăng nhập được khóa để giữ đúng liên kết Firebase.</p>}
        </div>

        <label><span>Hệ nhân vật</span><select value={form.role || 'Explorer'} onChange={(event) => setForm({ ...form, role: event.target.value })}>{Object.keys(roleCatalog).map((role) => <option key={role} value={role}>{roleCatalog[role].displayName}</option>)}</select></label>
        <label><span>Skin nhân vật</span><select value={form.gender || 'male'} onChange={(event) => setForm({ ...form, gender: event.target.value })}><option value="male">Nam</option><option value="female">Nữ</option></select></label>
        <label><span>Cấp nhân vật</span><input type="number" min="1" max="30" value={form.level || 1} onChange={(event) => setForm({ ...form, level: event.target.value })} /></label>
        <label className="span-2"><span>Ghi chú của giáo viên</span><textarea value={form.note || ''} onChange={(event) => setForm({ ...form, note: event.target.value })} /></label>
        {error && <div className="error-message span-2" role="alert">{error}</div>}
        <div className="form-actions span-2"><button className="button primary" type="submit" disabled={busy}><Save size={16} /> {busy ? 'Đang tạo tài khoản…' : editingStudent ? 'Lưu học viên' : 'Tạo tài khoản học viên'}</button></div>
      </form>
    </Modal>
  );
}

function SimpleFormModal({ title, open, onClose, initial, fields, onSubmit, wide = false }) {
  const [form, setForm] = useState(initial);
  useEffect(() => setForm(initial), [initial]);
  return (
    <Modal open={open} title={title} onClose={onClose} wide={wide}>
      <form className="form-grid" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
        {fields.map(([key, label, type, options]) => {
          const isWide = ['textarea', 'textarea-large', 'checkbox'].includes(type);
          return (
            <label key={key} className={`${isWide ? 'span-2' : ''} ${type === 'checkbox' ? 'checkbox-field' : ''}`}>
              {type === 'checkbox' ? (
                <><input type="checkbox" checked={Boolean(form[key])} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} /><span>{label}</span></>
              ) : (
                <>
                  <span>{label}</span>
                  {type === 'select' ? (
                    <select value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
                      {options.map((option) => {
                        const value = typeof option === 'string' ? option : option.value;
                        const text = typeof option === 'string' ? option : option.label;
                        return <option key={value || 'blank'} value={value}>{text}</option>;
                      })}
                    </select>
                  ) : type === 'textarea' || type === 'textarea-large' ? (
                    <textarea rows={type === 'textarea-large' ? 6 : 3} value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                  ) : (
                    <input type={type} value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={['name','title','username','studentId'].includes(key)} />
                  )}
                </>
              )}
            </label>
          );
        })}
        <div className="form-actions span-2"><button className="button ghost" type="button" onClick={onClose}>Hủy</button><button className="button primary" type="submit">Lưu</button></div>
      </form>
    </Modal>
  );
}
