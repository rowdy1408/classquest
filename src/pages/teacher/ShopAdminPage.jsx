import React, { useState } from 'react';
import { Edit3, Plus, Power, Trash2 } from '../../icons';
import Modal from '../../components/Modal';
import { useApp } from '../../context/AppContext';

const emptyForm = { name: '', icon: '✨', price: 50, category: 'Hỗ trợ nhiệm vụ', description: '', effect: '' };

export default function ShopAdminPage() {
  const { data, addShopItem, updateShopItem, deleteShopItem } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const payload = { ...form, price: Number(form.price) };
    if (editingId) updateShopItem(editingId, payload);
    else addShopItem(payload);
    setOpen(false);
  };

  const openCreate = () => {
    setEditingId('');
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...item });
    setOpen(true);
  };

  return (
    <>
      <div className="page-toolbar">
        <div><h2>Cửa hàng kỹ năng chung</h2><p>Tài khoản giáo viên có sẵn 8 kỹ năng mẫu dùng cho mọi lớp. Bạn có thể bật/tắt, xóa hoặc tạo thêm.</p></div>
        <button className="button primary" onClick={openCreate}><Plus size={17} /> Thêm kỹ năng</button>
      </div>
      <div className="shop-grid">
        {data.shopItems.map((item) => (
          <article className={`shop-card ${item.active ? '' : 'disabled-card'}`} key={item.id}>
            <div className="shop-icon">{item.icon}</div><small>{item.category}</small><h3>{item.name}</h3><p>{item.description}</p><div className="effect-box">{item.effect}</div>
            <div className="shop-footer"><strong>🪙 {item.price}</strong><div className="button-row"><button className="icon-button" aria-label={`Sửa ${item.name}`} onClick={() => openEdit(item)}><Edit3 size={17} /></button><button className="icon-button" title="Bật/tắt kỹ năng" aria-label={`Bật hoặc tắt ${item.name}`} onClick={() => updateShopItem(item.id, { active: !item.active })}><Power size={17} /></button><button className="icon-button danger" aria-label={`Xóa ${item.name}`} onClick={() => deleteShopItem(item.id)}><Trash2 size={17} /></button></div></div>
          </article>
        ))}
      </div>
      {!data.shopItems.length && <div className="empty-state">Chưa có kỹ năng trong cửa hàng. Chọn “Thêm kỹ năng” để tạo mục mới.</div>}

      <Modal open={open} title={editingId ? 'Sửa kỹ năng chung' : 'Thêm kỹ năng chung'} onClose={() => setOpen(false)}>
        <form className="form-grid" onSubmit={submit}>
          <label><span>Tên kỹ năng</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label><span>Biểu tượng / emoji</span><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></label>
          <label><span>Giá</span><input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
          <label><span>Nhóm kỹ năng</span><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
          <label className="span-2"><span>Mô tả</span><textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <label className="span-2"><span>Hiệu ứng</span><input value={form.effect} onChange={(e) => setForm({ ...form, effect: e.target.value })} /></label>
          <div className="form-actions span-2"><button className="button ghost" type="button" onClick={() => setOpen(false)}>Hủy</button><button className="button primary">{editingId ? 'Cập nhật kỹ năng' : 'Thêm vào cửa hàng'}</button></div>
        </form>
      </Modal>
    </>
  );
}
