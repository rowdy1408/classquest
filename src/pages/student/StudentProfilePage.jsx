import React, { useState } from 'react';
import { CheckCircle2, PackageOpen } from '../../icons';
import CharacterAvatar from '../../components/CharacterAvatar';
import { useApp } from '../../context/AppContext';
import { getArmorTier, getNextArmorTier } from '../../utils/characterSkins';
import { wasUsedToday } from '../../utils/dailyUsage';

export default function StudentProfilePage() {
  const { data, currentStudent, roleCatalog, usePurchasedSkill } = useApp();
  const [message, setMessage] = useState('');
  const role = roleCatalog[currentStudent.role];
  const purchases = data.purchases.filter((item) => item.studentId === currentStudent.id);
  const armour = getArmorTier(currentStudent.level);
  const nextArmour = getNextArmorTier(currentStudent.level);

  const activate = (purchaseId) => {
    const result = usePurchasedSkill(purchaseId);
    setMessage(result.message);
  };

  return (
    <div className="two-column-grid">
      <section className="panel character-sheet">
        <CharacterAvatar student={currentStudent} className="large-avatar skin-avatar" showTier />
        <small>NHÂN VẬT CỦA EM</small>
        <h2>{currentStudent.name}</h2>
        <p className="role-line">{role.icon} {role.displayName} · Cấp {currentStudent.level}</p>
        <div className="armour-summary">
          <strong>{armour.label}</strong>
          <span>{nextArmour ? `Đạt cấp ${nextArmour.minLevel} để mở ${nextArmour.label}.` : 'Đã mở khóa cấp giáp tối đa.'}</span>
        </div>
        <div className="progress-block">
          <div><span>Kinh nghiệm</span><strong>{currentStudent.xp}/{currentStudent.xpToNext}</strong></div>
          <div className="progress-track"><span style={{ width: `${Math.min(100, currentStudent.xp / currentStudent.xpToNext * 100)}%` }} /></div>
        </div>
        <div className="sheet-stat-grid">
          <div><small>HP</small><strong>{currentStudent.hp}/{role.maxHp}</strong></div>
          <div><small>Mana</small><strong>{currentStudent.mana}/{role.maxMana}</strong></div>
          <div><small>Gold</small><strong>{currentStudent.gold}</strong></div>
          <div><small>Tên đăng nhập</small><strong>{currentStudent.username}</strong></div>
        </div>
        <div className="lore-box"><strong>Vai trò nhân vật</strong><p>{role.description}</p></div>
      </section>

      <section className="panel">
        <div className="panel-header"><div><small>KHO KỸ NĂNG</small><h2>Kỹ năng đã mua</h2><p>Mỗi kỹ năng có thể kích hoạt một lần trong ngày.</p></div><PackageOpen /></div>
        {message && <div className="toast-message">{message}</div>}
        <div className="inventory-list">
          {purchases.map((purchase) => {
            const item = data.shopItems.find((entry) => entry.id === purchase.itemId);
            const usedToday = wasUsedToday(purchase.lastUsedAt);
            return (
              <article className={usedToday ? 'inventory-item used' : 'inventory-item'} key={purchase.id}>
                <span>{item?.icon || '✨'}</span>
                <div>
                  <strong>{item?.name || 'Kỹ năng'}</strong>
                  <small>{item?.effect}</small>
                  <em>{usedToday ? 'Đã dùng hôm nay · mở lại vào ngày mai' : 'Sẵn sàng kích hoạt hôm nay'}</em>
                </div>
                <button className={`mini-button ${usedToday ? '' : 'success'}`} disabled={usedToday} onClick={() => activate(purchase.id)}>
                  <CheckCircle2 size={15} /> {usedToday ? 'Đã dùng' : 'Dùng kỹ năng'}
                </button>
              </article>
            );
          })}
          {!purchases.length && <div className="empty-state compact">Kho kỹ năng đang trống. Hãy ghé cửa hàng để mở khóa kỹ năng mới.</div>}
        </div>
      </section>
    </div>
  );
}
