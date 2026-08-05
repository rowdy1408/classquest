import React, { useState } from 'react';
import { ArrowLeft, KeyRound, Swords, UserRound } from '../icons';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function StudentLoginPage() {
  const { loginStudent } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    const result = await loginStudent(username, password);
    setBusy(false);
    if (result.ok) navigate('/student');
    else setError(result.message);
  };

  return (
    <div className="auth-page student-auth">
      <Link to="/" className="back-link"><ArrowLeft size={17} /> Quay lại</Link>
      <form className="auth-card" onSubmit={submit}>
        <span className="auth-icon"><Swords size={36} /></span>
        <small>TÀI KHOẢN HỌC VIÊN</small>
        <h1>Đăng nhập học viên</h1>
        <p>Tiếp tục nhiệm vụ và phát triển nhân vật của em.</p>
        <label><span><UserRound size={16} /> Tên đăng nhập</span><input value={username} onChange={(event) => setUsername(event.target.value)} required /></label>
        <label><span><KeyRound size={16} /> Mật khẩu</span><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required /></label>
        {error && <div className="error-message">{error}</div>}
        <button className="button primary full" type="submit" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Vào hành trình của em'}</button>
      </form>
    </div>
  );
}
