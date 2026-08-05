import React, { useState } from 'react';
import { CheckCircle2, ShoppingBag } from '../../icons';
import { useApp } from '../../context/AppContext';

export default function StudentShopPage() {
  const { data, currentStudent, buyShopItem } = useApp();
  const [message, setMessage] = useState('');
  const ownedItemIds = new Set(data.purchases.filter((item) => item.studentId === currentStudent.id).map((item) => item.itemId));
  const buy = (itemId) => {
    const result = buyShopItem(currentStudent.id, itemId);
    setMessage(result.message);
  };

  return (
    <>
      <div className="shop-banner">
        <div><small>KHU CHỢ KỸ NĂNG</small><h2>Cửa hàng kỹ năng</h2><p>Mua một lần, sở hữu vĩnh viễn và kích hoạt một lần mỗi ngày.</p></div>
        <div className="gold-wallet">🪙 <strong>{currentStudent.gold}</strong><span>Gold của em</span></div>
      </div>
      {message && <div className="toast-message">{message}</div>}
      <div className="shop-grid">
        {data.shopItems.filter((item) => item.active).map((item) => {
          const owned = ownedItemIds.has(item.id);
          return (
            <article className={`shop-card ${owned ? 'owned-skill-card' : ''}`} key={item.id}>
              <div className="shop-icon">{item.icon}</div>
              <small>{item.category}</small>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div className="effect-box">{item.effect}</div>
              <div className="daily-use-note">⏱ Giới hạn: 1 lần/ngày</div>
              <div className="shop-footer">
                <strong>{owned ? 'Đã sở hữu vĩnh viễn' : `🪙 ${item.price}`}</strong>
                <button className={`button ${owned ? 'secondary' : 'primary'}`} disabled={owned || currentStudent.gold < item.price} onClick={() => buy(item.id)}>
                  {owned ? <><CheckCircle2 size={16} /> Đã sở hữu</> : <><ShoppingBag size={16} /> {currentStudent.gold < item.price ? 'Chưa đủ Gold' : 'Mua kỹ năng'}</>}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
