import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from '../icons';
import { useApp } from '../context/AppContext';
import CharacterAvatar from './CharacterAvatar';

export default function AppLayout({ title, subtitle, navItems, children, mode }) {
  const { cloudStatus, logout, currentTeacher, currentStudent, roleCatalog } = useApp();
  const navigate = useNavigate();
  const user = mode === 'teacher' ? currentTeacher : currentStudent;

  const handleLogout = () => {
    const loginRoute = mode === 'teacher' ? '/teacher-login' : '/student-login';
    Promise.resolve(logout()).finally(() => navigate(loginRoute, { replace: true }));
  };

  return (
    <div className={`app-shell ${mode}-shell`}>
      <aside className="sidebar">
        <NavLink to={mode === 'teacher' ? '/teacher' : '/student'} className="brand-block">
          <span className="brand-mark">CQ</span>
          <span><strong>ClassQuest</strong><small>{mode === 'teacher' ? 'Giáo viên' : 'Học viên'}</small></span>
        </NavLink>
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={19} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="mini-user-card">{mode === 'teacher' ? (currentTeacher?.photoURL ? <img className="teacher-photo" src={currentTeacher.photoURL} alt="" referrerPolicy="no-referrer" /> : <span>🧑‍🏫</span>) : <CharacterAvatar student={currentStudent} className="mini-character-skin" />}<div><strong>{user?.name}</strong><small>{mode === 'teacher' ? user?.email : roleCatalog[currentStudent?.role]?.displayName || currentStudent?.role}</small></div></div>
          {mode === 'teacher' && <div className={`cloud-sync-status ${cloudStatus}`}><i />{cloudStatus === 'saving' ? 'Đang lưu thay đổi…' : cloudStatus === 'error' ? 'Cần kiểm tra đồng bộ' : 'Đã đồng bộ dữ liệu'}</div>}
          <button className="nav-link ghost" onClick={handleLogout}><LogOut size={18} /> Đăng xuất</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-copy"><h1>{title}</h1><p>{subtitle}</p></div>
          <div className="topbar-actions">
            {mode === 'student' && currentStudent && (
              <div className="topbar-stats"><span>⭐ Lv.{currentStudent.level}</span><span>🪙 {currentStudent.gold}</span><span>⚡ {currentStudent.xp}/{currentStudent.xpToNext}</span></div>
            )}
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
