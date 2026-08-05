import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ role, children }) {
  const { authReady, session } = useApp();
  const location = useLocation();
  if (role === 'teacher' && !authReady) {
    return <div className="route-loader"><span className="brand-mark">CQ</span><strong>Restoring your teacher workspace…</strong></div>;
  }
  if (!session || session.role !== role) {
    return <Navigate to={role === 'teacher' ? '/teacher-login' : '/student-login'} replace state={{ from: location.pathname }} />;
  }
  return children;
}
