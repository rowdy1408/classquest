import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { BookOpenCheck, CircleUserRound, Coins, Home, School, ScrollText, ShoppingBag, Sparkles, Swords, Users } from './icons';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import StudentLoginPage from './pages/StudentLoginPage';
import TeacherLoginPage from './pages/TeacherLoginPage';
import ClassDetailPage from './pages/teacher/ClassDetailPage';
import ClassesPage from './pages/teacher/ClassesPage';
import RulesPage from './pages/teacher/RulesPage';
import ShopAdminPage from './pages/teacher/ShopAdminPage';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentGroupPage from './pages/student/StudentGroupPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentQuestMapPage from './pages/student/StudentQuestMapPage';
import StudentShopPage from './pages/student/StudentShopPage';
import StudentSkillTreePage from './pages/student/StudentSkillTreePage';

const teacherNav = [
  { to: '/teacher', label: 'Tổng quan', icon: Home, end: true },
  { to: '/teacher/classes', label: 'Lớp học', icon: School },
  { to: '/teacher/rules', label: 'Quy tắc', icon: ScrollText },
  { to: '/teacher/shop', label: 'Cửa hàng kỹ năng', icon: ShoppingBag },
];

const studentNav = [
  { to: '/student', label: 'Trang chủ', icon: Home, end: true },
  { to: '/student/profile', label: 'Nhân vật', icon: CircleUserRound },
  { to: '/student/quests', label: 'Bản đồ nhiệm vụ', icon: Swords },
  { to: '/student/skills', label: 'Cây kỹ năng', icon: Sparkles },
  { to: '/student/group', label: 'Biệt đội', icon: Users },
  { to: '/student/shop', label: 'Cửa hàng', icon: Coins },
];

function TeacherShell({ children, title, subtitle }) {
  return <ProtectedRoute role="teacher"><AppLayout mode="teacher" navItems={teacherNav} title={title} subtitle={subtitle}>{children}</AppLayout></ProtectedRoute>;
}

function StudentShell({ children, title, subtitle }) {
  return <ProtectedRoute role="student"><AppLayout mode="student" navItems={studentNav} title={title} subtitle={subtitle}>{children}</AppLayout></ProtectedRoute>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/teacher-login" element={<TeacherLoginPage />} />
      <Route path="/student-login" element={<StudentLoginPage />} />

      <Route path="/teacher" element={<TeacherShell title="Tổng quan giáo viên" subtitle="Điều hành lớp học và theo dõi tiến độ tại một nơi."><TeacherDashboard /></TeacherShell>} />
      <Route path="/teacher/classes" element={<TeacherShell title="Quản lý lớp học" subtitle="Tạo lớp và mở phòng điều hành của từng lớp."><ClassesPage /></TeacherShell>} />
      <Route path="/teacher/classes/:classId" element={<TeacherShell title="Phòng điều hành lớp" subtitle="Lịch học, học viên, điểm thưởng, bài kiểm tra và bản đồ nhiệm vụ."><ClassDetailPage /></TeacherShell>} />
      <Route path="/teacher/rules" element={<TeacherShell title="Quy tắc thưởng phạt" subtitle="Ghi nhận nỗ lực và áp dụng quy tắc nhất quán."><RulesPage /></TeacherShell>} />
      <Route path="/teacher/shop" element={<TeacherShell title="Cửa hàng kỹ năng" subtitle="Quản lý các kỹ năng học viên có thể mua bằng Gold."><ShopAdminPage /></TeacherShell>} />

      <Route path="/student" element={<StudentShell title="Hành trình của em" subtitle="Xem nhiệm vụ tiếp theo và tiến độ nhân vật."><StudentDashboard /></StudentShell>} />
      <Route path="/student/profile" element={<StudentShell title="Hồ sơ nhân vật" subtitle="Chỉ số, cấp giáp và kho kỹ năng."><StudentProfilePage /></StudentShell>} />
      <Route path="/student/quests" element={<StudentShell title="Bản đồ nhiệm vụ" subtitle="Theo dõi từng buổi học và các trận Boss."><StudentQuestMapPage /></StudentShell>} />
      <Route path="/student/skills" element={<StudentShell title="Cây kỹ năng" subtitle="Mở khóa năng lực mới khi nhân vật lên cấp."><StudentSkillTreePage /></StudentShell>} />
      <Route path="/student/group" element={<StudentShell title="Biệt đội của em" subtitle="Xem đồng đội và tiến độ của cả nhóm."><StudentGroupPage /></StudentShell>} />
      <Route path="/student/shop" element={<StudentShell title="Cửa hàng kỹ năng" subtitle="Dùng Gold để mua kỹ năng được giáo viên phê duyệt."><StudentShopPage /></StudentShell>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
