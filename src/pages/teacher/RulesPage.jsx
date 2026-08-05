import React, { useState } from 'react';
import { Plus, ScrollText, Trash2 } from '../../icons';
import Modal from '../../components/Modal';
import { useApp } from '../../context/AppContext';

export default function RulesPage() {
  const { data, currentTeacher, addRule, deleteRule } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ classId: '', type: 'reward', title: '', points: 5, gold: 5, description: '' });
  const classes = data.classes.filter((item) => item.teacherId === currentTeacher.id);
  const classIds = classes.map((item) => item.id);
  const rules = data.rules.filter((rule) => classIds.includes(rule.classId));

  const submit = (event) => {
    event.preventDefault();
    addRule({ ...form, points: Number(form.points), gold: Number(form.gold) });
    setOpen(false);
  };

  return <><div className="page-toolbar"><div><h2>Thư viện quy tắc thưởng phạt</h2><p>Mỗi lớp có thể sử dụng một hệ thống điểm và Gold riêng.</p></div><button className="button primary" onClick={() => { setForm({ ...form, classId: classes[0]?.id || '' }); setOpen(true); }}><Plus size={17} /> Thêm quy tắc</button></div><div className="rule-grid">{rules.map((rule) => { const klass = classes.find((item) => item.id === rule.classId); return <article className={`rule-card ${rule.type}`} key={rule.id}><div><span><ScrollText size={15} /> {klass?.name}</span><h3>{rule.title}</h3><p>{rule.description}</p></div><div className="rule-values"><strong>{rule.points > 0 ? '+' : ''}{rule.points} XP</strong><strong>{rule.gold > 0 ? '+' : ''}{rule.gold} Gold</strong><button className="icon-button danger" onClick={() => deleteRule(rule.id)}><Trash2 size={16} /></button></div></article>; })}</div><Modal open={open} title="Thêm quy tắc" onClose={() => setOpen(false)}><form className="form-grid" onSubmit={submit}><label className="span-2"><span>Lớp</span><select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>{classes.map((klass) => <option value={klass.id} key={klass.id}>{klass.name}</option>)}</select></label><label><span>Loại</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="reward">Khen thưởng</option><option value="penalty">Trừ điểm</option></select></label><label><span>Tên quy tắc</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label><label><span>Thay đổi XP</span><input type="number" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} /></label><label><span>Thay đổi Gold</span><input type="number" value={form.gold} onChange={(e) => setForm({ ...form, gold: e.target.value })} /></label><label className="span-2"><span>Mô tả</span><textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><div className="form-actions span-2"><button className="button ghost" type="button" onClick={() => setOpen(false)}>Hủy</button><button className="button primary">Lưu quy tắc</button></div></form></Modal></>;
}
