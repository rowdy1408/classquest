import React, { useState } from 'react';
import { CheckCircle2, KeyRound, ShieldAlert } from '../../icons';
import { useApp } from '../../context/AppContext';

export default function StudentSettingsPage() {
  const { changeStudentPassword, currentStudent, session } = useApp();
  const account = currentStudent || session;
  const [form, setForm] = useState({ currentPassword: '', nextPassword: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (form.nextPassword.length < 8) {
      setError('Mật khẩu mới cần có ít nhất 8 ký tự.');
      return;
    }
    if (form.nextPassword === form.currentPassword) {
      setError('Mật khẩu mới cần khác mật khẩu hiện tại.');
      return;
    }
    if (form.nextPassword !== form.confirmPassword) {
      setError('Hai lần nhập mật khẩu mới chưa khớp.');
      return;
    }

    setBusy(true);
    const result = await changeStudentPassword(form.currentPassword, form.nextPassword);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setForm({ currentPassword: '', nextPassword: '', confirmPassword: '' });
    setSuccess('Đổi mật khẩu thành công. Em có thể tiếp tục hành trình ClassQuest.');
  };

  return (
    <div className="settings-grid">
      <section className="panel password-settings-panel">
        <div className="panel-header">
          <div><small>BẢO MẬT TÀI KHOẢN</small><h2>Đổi mật khẩu</h2><p>Cập nhật mật khẩu dùng để đăng nhập ClassQuest.</p></div>
          <KeyRound size={28} />
        </div>

        {session?.mustChangePassword && (
          <div className="password-required-notice" role="status">
            <ShieldAlert size={20} />
            <div><strong>Em cần đổi mật khẩu mặc định</strong><p>Hãy tạo mật khẩu riêng trước khi sử dụng các chức năng khác.</p></div>
          </div>
        )}

        <form className="password-settings-form" onSubmit={submit}>
          <label><span>Mật khẩu hiện tại</span><input type="password" value={form.currentPassword} onChange={updateField('currentPassword')} autoComplete="current-password" required /></label>
          <label><span>Mật khẩu mới</span><input type="password" value={form.nextPassword} onChange={updateField('nextPassword')} minLength="8" autoComplete="new-password" required /><small>Ít nhất 8 ký tự; nên kết hợp chữ, số và ký tự đặc biệt.</small></label>
          <label><span>Nhập lại mật khẩu mới</span><input type="password" value={form.confirmPassword} onChange={updateField('confirmPassword')} minLength="8" autoComplete="new-password" required /></label>
          {error && <div className="error-message" role="alert">{error}</div>}
          {success && <div className="password-success-message" role="status"><CheckCircle2 size={17} /> {success}</div>}
          <button className="button primary" type="submit" disabled={busy}>{busy ? 'Đang đổi mật khẩu…' : 'Lưu mật khẩu mới'}</button>
        </form>
      </section>

      <aside className="panel account-summary-card">
        <small>TÀI KHOẢN CỦA EM</small>
        <h3>{account?.name || 'Tài khoản học viên'}</h3>
        <dl>
          <div><dt>Email</dt><dd>{account?.email || 'Chưa có'}</dd></div>
          <div><dt>Tên đăng nhập</dt><dd>{account?.username || 'Chưa có'}</dd></div>
        </dl>
        <p>Em có thể dùng một trong hai thông tin trên để đăng nhập sau khi đổi mật khẩu.</p>
      </aside>
    </div>
  );
}
