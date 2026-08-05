import React from 'react';
import { CalendarDays, CheckCircle2, Coins, School, ScrollText, ShieldAlert, Swords, Users } from '../../icons';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function TeacherDashboard() {
  const { data, currentTeacher } = useApp();
  const teacherClasses = data.classes.filter((item) => item.teacherId === currentTeacher.id);
  const classIds = teacherClasses.map((item) => item.id);
  const students = data.students.filter((student) => student.classIds.some((id) => classIds.includes(id)));
  const upcomingTests = data.tests.filter((test) => classIds.includes(test.classId)).sort((a, b) => a.date.localeCompare(b.date));
  const submitted = data.submissions.filter((item) => item.status === 'submitted');

  return (
    <>
      <section className="metric-grid">
        <div className="metric-card"><School /><span><small>Lớp học</small><strong>{teacherClasses.length}</strong></span></div>
        <div className="metric-card"><Users /><span><small>Học viên</small><strong>{students.length}</strong></span></div>
        <div className="metric-card"><Swords /><span><small>Node nhiệm vụ</small><strong>{data.questNodes.filter((node) => classIds.includes(node.classId)).length}</strong></span></div>
        <div className="metric-card"><CheckCircle2 /><span><small>Chờ duyệt</small><strong>{submitted.length}</strong></span></div>
      </section>

      <section className="dashboard-grid">
        <div className="panel wide-panel">
          <div className="panel-header"><div><small>THAO TÁC NHANH</small><h2>Phòng điều hành</h2></div></div>
          <div className="command-grid">
            <Link to="/teacher/classes" className="command-card"><School /><strong>Tạo hoặc quản lý lớp</strong><span>Thông tin lớp, lịch học và danh sách học viên</span></Link>
            <Link to="/teacher/classes" className="command-card"><Swords /><strong>Xây dựng Quest Map</strong><span>Node buổi học, Mini Boss và Final Boss</span></Link>
            <Link to="/teacher/rules" className="command-card"><ScrollText /><strong>Quy tắc thưởng phạt</strong><span>Tạo quy tắc dùng cho từng lớp</span></Link>
            <Link to="/teacher/shop" className="command-card"><Coins /><strong>Cửa hàng kỹ năng</strong><span>Quản lý kỹ năng học viên mua bằng Gold</span></Link>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><div><small>SẮP TỚI</small><h2>Bài kiểm tra & Boss</h2></div><CalendarDays /></div>
          <div className="stack-list">
            {upcomingTests.slice(0, 5).map((test) => {
              const klass = data.classes.find((item) => item.id === test.classId);
              return <div className="list-row" key={test.id}><span className={`round-icon ${test.type}`}>{test.type === 'final' ? '👑' : '⚔️'}</span><div><strong>{test.title}</strong><small>{klass?.name} · {test.date}</small></div></div>;
            })}
            {!upcomingTests.length && <div className="empty-state compact">Chưa có bài kiểm tra.</div>}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><div><small>CẦN XỬ LÝ</small><h2>Bài nộp chờ duyệt</h2></div><ShieldAlert /></div>
          <div className="stack-list">
            {submitted.slice(0, 5).map((submission) => {
              const student = data.students.find((item) => item.id === submission.studentId);
              const node = data.questNodes.find((item) => item.id === submission.nodeId);
              return <div className="list-row" key={submission.id}><span className="round-icon">📝</span><div><strong>{student?.name}</strong><small>{node?.title || 'Nhiệm vụ'} · đã nộp</small></div></div>;
            })}
            {!submitted.length && <div className="empty-state compact">Không có bài nộp đang chờ duyệt.</div>}
          </div>
        </div>
      </section>
    </>
  );
}
