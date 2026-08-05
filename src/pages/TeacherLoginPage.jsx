import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck, Sparkles } from '../icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function GoogleMark() {
  return <span className="google-mark" aria-hidden="true"><i>G</i></span>;
}

export default function TeacherLoginPage() {
  const { authReady, loginTeacherWithGoogle, session } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const returnTo = location.state?.from?.startsWith('/teacher') ? location.state.from : '/teacher';

  useEffect(() => {
    if (authReady && session?.role === 'teacher') navigate(returnTo, { replace: true });
  }, [authReady, navigate, returnTo, session]);

  const signIn = async () => {
    setError('');
    setBusy(true);
    const result = await loginTeacherWithGoogle();
    setBusy(false);
    if (result.ok) navigate(returnTo, { replace: true });
    else setError(result.message);
  };

  return (
    <div className="auth-page teacher-auth firebase-auth-page">
      <div className="auth-orbit auth-orbit-one" />
      <div className="auth-orbit auth-orbit-two" />
      <Link to="/" className="back-link"><ArrowLeft size={17} /> Quay lại</Link>

      <main className="teacher-login-shell">
        <section className="teacher-login-story">
          <div className="auth-brand"><span className="brand-mark">CQ</span><span><strong>ClassQuest</strong><small>Dành cho giáo viên</small></span></div>
          <span className="eyebrow"><Sparkles size={15} /> PHÒNG ĐIỀU HÀNH</span>
          <h1>Quản lý lớp học của bạn ở bất cứ đâu.</h1>
          <p>Đăng nhập bằng tài khoản Google đã được cấp quyền để tiếp tục quản lý lớp học, lịch học, nhiệm vụ và tiến độ học viên.</p>
          <div className="auth-benefit-grid">
            <article><CheckCircle2 size={18} /><span><strong>Một tài khoản an toàn</strong><small>Không cần ghi nhớ thêm mật khẩu riêng.</small></span></article>
            <article><CheckCircle2 size={18} /><span><strong>Dữ liệu luôn đồng bộ</strong><small>Tiếp tục công việc trên thiết bị khác.</small></span></article>
          </div>
        </section>

        <section className="google-login-card" aria-labelledby="teacher-login-title">
          <span className="auth-icon"><ShieldCheck size={36} /></span>
          <small>ĐĂNG NHẬP GIÁO VIÊN</small>
          <h2 id="teacher-login-title">Chào mừng bạn quay lại</h2>
          <p>Sử dụng đúng tài khoản Google đã được mời vào ClassQuest.</p>

          {error && <div className="error-message auth-error" role="alert">{error}</div>}

          <button className="google-signin-button" type="button" onClick={signIn} disabled={busy || !authReady}>
            <GoogleMark />
            <span>{busy || !authReady ? 'Đang kết nối…' : 'Tiếp tục với Google'}</span>
          </button>

          <div className="auth-security-note"><Lock size={15} /><span>ClassQuest chỉ sử dụng tên, email và ảnh đại diện Google để xác thực.</span></div>
          <div className="student-route-note">Bạn là học viên? <Link to="/student-login">Đăng nhập tại đây</Link></div>
        </section>
      </main>
    </div>
  );
}
