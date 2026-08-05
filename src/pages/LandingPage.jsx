import React from 'react';
import { ArrowRight, GraduationCap, ShieldCheck, Sparkles, Swords } from '../icons';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="pixel-sky" />
      <header className="landing-nav"><div className="brand-inline"><span className="brand-mark">CQ</span><strong>ClassQuest</strong></div><span className="pill-label"><Sparkles size={15} /> Lớp học phiêu lưu RPG</span></header>
      <main className="landing-main">
        <section className="hero-copy">
          <span className="eyebrow">Học tập. Làm nhiệm vụ. Lên cấp.</span>
          <h1>Biến mỗi lớp học thành một hành trình RPG.</h1>
          <p>Giáo viên quản lý lớp, lịch học, điểm thưởng và bài kiểm tra. Học viên khám phá bản đồ nhiệm vụ, mở khóa kỹ năng và phát triển nhân vật của mình.</p>
          <div className="feature-chips"><span>Quest Map</span><span>Cây kỹ năng</span><span>Biệt đội</span><span>Cửa hàng Gold</span></div>
        </section>
        <section className="portal-grid">
          <Link to="/teacher-login" className="portal-card teacher-portal">
            <span className="portal-icon"><ShieldCheck size={42} /></span>
            <small>KHU VỰC GIÁO VIÊN</small>
            <h2>Đăng nhập giáo viên</h2>
            <p>Tạo lớp, xây dựng Quest Map, quản lý học viên và ghi nhận tiến bộ.</p>
            <span className="portal-action">Vào trang giáo viên <ArrowRight size={18} /></span>
          </Link>
          <Link to="/student-login" className="portal-card student-portal">
            <span className="portal-icon"><Swords size={42} /></span>
            <small>KHU VỰC HỌC VIÊN</small>
            <h2>Đăng nhập học viên</h2>
            <p>Tiếp tục nhiệm vụ, xem nhân vật, biệt đội, kỹ năng và vật phẩm.</p>
            <span className="portal-action">Vào trang học viên <ArrowRight size={18} /></span>
          </Link>
        </section>
      </main>
      <footer className="landing-footer"><GraduationCap size={17} /> ClassQuest — hành trình học tập nhìn thấy được.</footer>
    </div>
  );
}
