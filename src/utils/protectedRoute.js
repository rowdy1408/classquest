export function resolveProtectedRoute({ authReady, expectedRole, session, hasProfile, pathname }) {
  if (!authReady) return { state: 'loading' };

  if (!session || session.role !== expectedRole) {
    return {
      state: 'redirect',
      to: expectedRole === 'teacher' ? '/teacher-login' : '/student-login',
    };
  }

  if (expectedRole === 'student' && session.mustChangePassword && pathname !== '/student/settings') {
    return { state: 'redirect', to: '/student/settings' };
  }

  const passwordSetupOnly = expectedRole === 'student'
    && session.mustChangePassword
    && pathname === '/student/settings';

  if (!hasProfile && !passwordSetupOnly) return { state: 'loading' };
  return { state: 'allow' };
}
