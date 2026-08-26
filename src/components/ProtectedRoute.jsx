import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { resolveProtectedRoute } from '../utils/protectedRoute';

export default function ProtectedRoute({ role, children }) {
  const { authReady, session, currentTeacher, currentStudent } = useApp();
  const location = useLocation();
  const hasProfile = role === 'student' ? Boolean(currentStudent) : Boolean(currentTeacher);
  const routeState = resolveProtectedRoute({
    authReady,
    expectedRole: role,
    session,
    hasProfile,
    pathname: location.pathname,
  });

  if (routeState.state === 'loading') {
    return <div className="route-loader"><span className="brand-mark">CQ</span><strong>Đang khôi phục dữ liệu ClassQuest…</strong></div>;
  }
  if (routeState.state === 'redirect') {
    return <Navigate to={routeState.to} replace state={{ from: location.pathname }} />;
  }
  return children;
}
