import React, { useMemo, useState } from 'react';
import { Check, Lock } from '../../icons';
import CharacterAvatar from '../../components/CharacterAvatar';
import { useApp } from '../../context/AppContext';
import { branchLabels } from '../../data/skillTreeVi';
import { tierRequiredLevels } from '../../data/skillTreeData';

function earnedSkillPoints(level) {
  return Object.values(tierRequiredLevels).filter((requiredLevel) => Number(level || 1) >= requiredLevel).length;
}

function usageWindowStart(skill, now = new Date()) {
  if (skill.usesPerWeek) {
    const start = new Date(now);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (skill.usesPerMonth) return new Date(now.getFullYear(), now.getMonth(), 1);
  return null;
}

function usageStatus(entries, studentId, skill) {
  const now = new Date();
  const start = usageWindowStart(skill, now);
  const count = entries.filter((entry) => {
    if (entry.studentId !== studentId || entry.skillId !== skill.id) return false;
    if (!start) return true;
    const usedAt = new Date(entry.usedAt);
    return !Number.isNaN(usedAt.getTime()) && usedAt >= start && usedAt <= now;
  }).length;
  const limit = Number(skill.usesPerWeek || skill.usesPerMonth || skill.usesPerTerm || 1);
  return { count, limit, exhausted: count >= limit };
}

function limitLabel(skill) {
  if (skill.usesPerWeek) return `${skill.usesPerWeek} lần/tuần`;
  if (skill.usesPerMonth) return `${skill.usesPerMonth} lần/tháng`;
  return `${skill.usesPerTerm || 1} lần/khóa`;
}

function SkillCard({ skill, student, role, data, availablePoints, onUnlock, onActivate }) {
  const unlockedIds = student.unlockedSkillIds || [];
  const unlocked = unlockedIds.includes(skill.id);
  const prerequisitesMet = skill.prerequisiteSkillIds.every((id) => unlockedIds.includes(id));
  const ultimateChosen = role.skills.some((item) => item.isUltimate && unlockedIds.includes(item.id));
  const levelReady = student.level >= skill.requiredLevel;
  const pointReady = availablePoints >= Number(skill.cost || 1);
  const canUnlock = !unlocked && levelReady && prerequisitesMet && pointReady && !(skill.isUltimate && ultimateChosen);
  const usage = usageStatus(data.skillUses, student.id, skill);
  const state = unlocked ? (usage.exhausted ? 'used' : 'unlocked') : canUnlock ? 'available' : 'locked';

  let lockedReason = '';
  if (!levelReady) lockedReason = `Cần đạt cấp ${skill.requiredLevel}`;
  else if (!prerequisitesMet) lockedReason = 'Cần mở kỹ năng trước đó';
  else if (skill.isUltimate && ultimateChosen) lockedReason = 'Đã chọn kỹ năng Tối thượng khác';
  else if (!pointReady) lockedReason = `Cần ${skill.cost} Điểm kỹ năng`;

  return (
    <article className={`branch-skill-card ${state} tier-${skill.tier}`}>
      <div className="branch-skill-topline">
        <span className="branch-skill-icon">{skill.icon}</span>
        <div>
          <small>BẬC {skill.tier} · CẤP {skill.requiredLevel}</small>
          <h3>{skill.name}</h3>
        </div>
        <span className="skill-state-icon">{unlocked ? <Check /> : <Lock />}</span>
      </div>
      <p className="skill-short-copy">{skill.shortDescription}</p>
      <p>{skill.description}</p>
      <div className="skill-cost-row">
        <span>✨ {skill.cost} điểm</span>
        <span>🔷 {skill.manaCost} Mana</span>
        <span>⏱ {limitLabel(skill)}</span>
      </div>
      {unlocked ? (
        <button className={`mini-button ${usage.exhausted ? '' : 'success'}`} disabled={usage.exhausted} onClick={() => onActivate(skill.id)}>
          {usage.exhausted ? `Đã dùng ${usage.count}/${usage.limit}` : 'Kích hoạt kỹ năng'}
        </button>
      ) : (
        <button className={`mini-button ${canUnlock ? 'primary' : ''}`} disabled={!canUnlock} onClick={() => onUnlock(skill)}>
          {canUnlock ? 'Mở khóa kỹ năng' : lockedReason}
        </button>
      )}
    </article>
  );
}

export default function StudentSkillTreePage() {
  const { data, currentStudent, roleCatalog, unlockRoleSkill, useRoleSkill } = useApp();
  const [message, setMessage] = useState('');
  const role = roleCatalog[currentStudent.role];
  const unlockedIds = currentStudent.unlockedSkillIds || [];
  const spentPoints = role.skills
    .filter((skill) => unlockedIds.includes(skill.id))
    .reduce((total, skill) => total + Number(skill.cost || 1), 0);
  const availablePoints = Math.max(0, earnedSkillPoints(currentStudent.level) - spentPoints);
  const branches = useMemo(() => {
    const names = [...new Set(role.skills.filter((skill) => !skill.isUltimate).map((skill) => skill.branch))];
    return names.map((branch) => ({
      branch,
      skills: role.skills.filter((skill) => skill.branch === branch).sort((a, b) => a.tier - b.tier),
    }));
  }, [role]);
  const ultimates = role.skills.filter((skill) => skill.isUltimate);

  const activate = (skillId) => {
    const result = useRoleSkill(currentStudent.id, skillId);
    setMessage(result.message);
  };

  const unlock = (skill) => {
    const warning = skill.isUltimate
      ? 'Mỗi nhân vật chỉ được chọn một kỹ năng Tối thượng. Em có chắc muốn chọn kỹ năng này?'
      : `Dùng ${skill.cost} Điểm kỹ năng để mở “${skill.name}”? Lựa chọn này sẽ được lưu vào nhân vật.`;
    if (!window.confirm(warning)) return;
    const result = unlockRoleSkill(currentStudent.id, skill.id);
    setMessage(result.message);
  };

  return (
    <div className="skill-tree-page">
      <section className="skill-tree-header" style={{ '--skill-accent': role.color }}>
        <CharacterAvatar student={currentStudent} className="skill-tree-character" />
        <div className="skill-tree-heading-copy">
          <small>HỆ {role.displayName.toUpperCase()}</small>
          <h2>Cây kỹ năng {role.displayName}</h2>
          <p>{role.description}</p>
          <div className="skill-point-summary">
            <span>✨ <strong>{availablePoints}</strong> Điểm kỹ năng còn lại</span>
            <span>🔷 <strong>{currentStudent.mana}</strong>/{role.maxMana} Mana</span>
            <span>🔓 <strong>{unlockedIds.length}</strong>/12 kỹ năng đã mở</span>
          </div>
        </div>
      </section>

      {message && <div className="toast-message">{message}</div>}

      <section className="branch-tree-grid">
        {branches.map(({ branch, skills }) => (
          <div className="skill-branch-column" key={branch}>
            <div className="skill-branch-title">
              <span>{role.icon}</span>
              <div><small>NHÁNH KỸ NĂNG</small><h3>{branchLabels[branch] || branch}</h3></div>
            </div>
            <div className="skill-branch-path">
              {skills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  student={currentStudent}
                  role={role}
                  data={data}
                  availablePoints={availablePoints}
                  onUnlock={unlock}
                  onActivate={activate}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="ultimate-skill-section">
        <div className="ultimate-heading">
          <div><small>BẬC 4 · MỞ Ở CẤP 25</small><h2>👑 Kỹ năng Tối thượng</h2></div>
          <p>Chọn duy nhất một kỹ năng Tối thượng cho nhân vật.</p>
        </div>
        <div className="ultimate-skill-grid">
          {ultimates.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              student={currentStudent}
              role={role}
              data={data}
              availablePoints={availablePoints}
              onUnlock={unlock}
              onActivate={activate}
            />
          ))}
        </div>
      </section>

      <div className="info-banner">
        Nhận Điểm kỹ năng ở cấp 1, 8, 15 và 25. Giáp mới mở ở cấp 4, 10, 16, 22 và 28. Cấp tối đa của nhân vật là 30.
      </div>
    </div>
  );
}
