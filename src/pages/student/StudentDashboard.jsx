import React from 'react';
import { ArrowRight, CheckCircle2, Coins, ShoppingBag, Sparkles, Swords, Users } from '../../icons';
import { Link } from 'react-router-dom';
import StatPill from '../../components/StatPill';
import CharacterAvatar from '../../components/CharacterAvatar';
import { useApp } from '../../context/AppContext';
import { getArmorTier, getNextArmorTier } from '../../utils/characterSkins';
import { wasUsedToday } from '../../utils/dailyUsage';

export default function StudentDashboard() {
  const { data, currentStudent, roleCatalog } = useApp();
  const classId = currentStudent.classIds[0];
  const klass = data.classes.find((item) => item.id === classId);
  const nodes = data.questNodes.filter((node) => node.classId === classId).sort((a, b) => a.order - b.order);
  const nextQuest = nodes.find((node) => node.status === 'available') || nodes.find((node) => node.status === 'locked');
  const group = data.groups.find((item) => item.id === currentStudent.groupId);
  const role = roleCatalog[currentStudent.role];
  const purchases = data.purchases.filter((item) => item.studentId === currentStudent.id);
  const dailyReadyCount = purchases.filter((item) => !wasUsedToday(item.lastUsedAt)).length;
  const armour = getArmorTier(currentStudent.level);
  const nextArmour = getNextArmorTier(currentStudent.level);

  return (
    <>
      <section className="student-hero-card">
        <div className="character-panel">
          <CharacterAvatar student={currentStudent} className="character-avatar skin-avatar" showTier />
          <div>
            <small>{klass?.name}</small>
            <h2>{currentStudent.name}</h2>
            <p>{role.icon} Cấp {currentStudent.level} · {role.displayName}</p>
            <span className="armour-progress-copy">
              {armour.label}{nextArmour ? ` · Giáp tiếp theo ở cấp ${nextArmour.minLevel}` : ' · Đã đạt giáp tối đa'}
            </span>
          </div>
        </div>
        <div className="hero-stat-grid">
          <StatPill icon="⭐" label="Cấp" value={currentStudent.level} tone="yellow" />
          <StatPill icon="⚡" label="XP" value={`${currentStudent.xp}/${currentStudent.xpToNext}`} />
          <StatPill icon="🪙" label="Gold" value={currentStudent.gold} tone="yellow" />
          <StatPill icon="❤️" label="HP" value={`${currentStudent.hp}/${role.maxHp}`} tone="red" />
          <StatPill icon="🔷" label="Mana" value={`${currentStudent.mana}/${role.maxMana}`} tone="purple" />
        </div>
      </section>

      <section className="student-dashboard-grid">
        <article className="continue-quest-card">
          <div><span className="eyebrow"><Swords size={16} /> NHIỆM VỤ TIẾP THEO</span><h2>{nextQuest?.title || 'Em đã hoàn thành các nhiệm vụ hiện tại'}</h2><p>{nextQuest?.description || 'Quay lại khi giáo viên mở nhiệm vụ mới nhé.'}</p></div>
          {nextQuest && <div className="quest-reward-preview"><span>⭐ {nextQuest.xpReward} XP</span><span>🪙 {nextQuest.goldReward}</span><span>📅 {nextQuest.date}</span></div>}
          <Link to="/student/quests" className="button primary">Mở bản đồ nhiệm vụ <ArrowRight size={17} /></Link>
        </article>

        <article className="panel compact-panel">
          <div className="panel-header"><div><small>BIỆT ĐỘI CỦA EM</small><h2>{group?.name || 'Chưa có biệt đội'}</h2></div><Users /></div>
          <p>{group?.motto || 'Giáo viên chưa xếp biệt đội cho em.'}</p>
          <div className="avatar-stack">
            {group?.memberIds
              .map((id) => data.students.find((student) => student.id === id))
              .filter(Boolean)
              .map((student) => <CharacterAvatar student={student} className="stack-character-skin" key={student.id} />)}
          </div>
          <Link className="text-link" to="/student/group">Xem biệt đội <ArrowRight size={15} /></Link>
        </article>

        <Link to="/student/skills" className="dashboard-tile purple-tile"><Sparkles /><div><strong>Cây kỹ năng</strong><span>Chọn nhánh phát triển và mở kỹ năng đến cấp 30.</span></div></Link>
        <Link to="/student/shop" className="dashboard-tile gold-tile"><ShoppingBag /><div><strong>Cửa hàng kỹ năng</strong><span>Dùng Gold mua kỹ năng và kích hoạt mỗi ngày một lần.</span></div></Link>
        <Link to="/student/profile" className="dashboard-tile blue-tile"><CheckCircle2 /><div><strong>Hồ sơ nhân vật</strong><span>Xem cấp giáp, chỉ số và kho kỹ năng.</span></div></Link>
        <div className="dashboard-tile green-tile"><Coins /><div><strong>{dailyReadyCount} kỹ năng sẵn sàng hôm nay</strong><span>Em đang sở hữu {purchases.length} kỹ năng vĩnh viễn.</span></div></div>
      </section>
    </>
  );
}
