import React from 'react';
import { Crown, Users } from '../../icons';
import CharacterAvatar from '../../components/CharacterAvatar';
import { useApp } from '../../context/AppContext';
import { getArmorTier } from '../../utils/characterSkins';

export default function StudentGroupPage() {
  const { data, currentStudent, roleCatalog } = useApp();
  const group = data.groups.find((item) => item.id === currentStudent.groupId);
  const members = group ? group.memberIds.map((id) => data.students.find((student) => student.id === id)).filter(Boolean) : [];
  return (
    <section className="panel group-hall">
      <div className="group-banner"><span>🛡️</span><div><small>BIỆT ĐỘI CỦA EM</small><h2>{group?.name || 'Chưa được xếp đội'}</h2><p>{group?.motto || 'Giáo viên sẽ sớm xếp biệt đội cho em.'}</p></div></div>
      <div className="group-member-grid">
        {members.map((member, index) => (
          <article className="member-card" key={member.id}>
            <CharacterAvatar student={member} className="member-avatar skin-avatar" />
            <div>
              <small>{index === 0 ? <><Crown size={13} /> Thành viên</> : <><Users size={13} /> Thành viên</>}</small>
              <h3>{member.name}</h3>
              <p>{roleCatalog[member.role]?.displayName || member.role} · Cấp {member.level}</p>
              <em className="member-armour-label">{getArmorTier(member.level).label}</em>
              <div className="member-stats"><span>⭐ {member.xp}</span><span>🪙 {member.gold}</span></div>
            </div>
          </article>
        ))}
      </div>
      {!members.length && <div className="empty-state compact">Biệt đội chưa có thành viên.</div>}
    </section>
  );
}
