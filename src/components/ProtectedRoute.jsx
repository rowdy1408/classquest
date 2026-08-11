import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ role, children }) {
  const { authReady, session, currentTeacher, currentStudent } = useApp();
  const location = useLocation();
  const profilePending = (role === 'student' && session?.role === 'student' && !currentStudent)
    || (role === 'teacher' && session?.role === 'teacher' && !currentTeacher);
  if (!authReady || profilePending) {
    return <div className="route-loader"><span className="brand-mark">CQ</span><strong>Đang khôi phục dữ liệu ClassQuest…</strong></div>;
  }
  if (!session || session.role !== role) {
    return <Navigate to={role === 'teacher' ? '/teacher-login' : '/student-login'} replace state={{ from: location.pathname }} />;
  }
  return children;
}
