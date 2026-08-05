import React, { useMemo, useState } from 'react';
import { CalendarDays, Clock, Plus, Trash2 } from '../icons';

const days = [
  { name: 'Monday', short: 'Mon', vn: 'Thứ 2' },
  { name: 'Tuesday', short: 'Tue', vn: 'Thứ 3' },
  { name: 'Wednesday', short: 'Wed', vn: 'Thứ 4' },
  { name: 'Thursday', short: 'Thu', vn: 'Thứ 5' },
  { name: 'Friday', short: 'Fri', vn: 'Thứ 6' },
  { name: 'Saturday', short: 'Sat', vn: 'Thứ 7' },
  { name: 'Sunday', short: 'Sun', vn: 'CN' },
];

const presets = [
  { id: '246', label: '2–4–6', days: ['Monday', 'Wednesday', 'Friday'] },
  { id: '357', label: '3–5–7', days: ['Tuesday', 'Thursday', 'Saturday'] },
  { id: 'weekend', label: 'Cuối tuần', days: ['Saturday', 'Sunday'] },
];

export default function ClickableSchedule({ value = [], onChange }) {
  const [selectedDays, setSelectedDays] = useState(() => {
    const existingDays = [...new Set(value.map((slot) => slot.day))];
    return existingDays.length ? existingDays : ['Tuesday', 'Thursday'];
  });
  const [start, setStart] = useState('18:00');
  const [end, setEnd] = useState('19:30');
  const grouped = useMemo(
    () => Object.fromEntries(days.map((day) => [day.name, value.filter((slot) => slot.day === day.name)])),
    [value],
  );
  const activePreset = presets.find((preset) => (
    preset.days.length === selectedDays.length && preset.days.every((day) => selectedDays.includes(day))
  ))?.id;

  const toggleDay = (day) => {
    setSelectedDays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day]));
  };

  const applyPreset = (presetDays) => setSelectedDays(presetDays);

  const addSlots = () => {
    if (!selectedDays.length) return;
    const next = [...value];
    selectedDays.forEach((day) => {
      const duplicate = next.some((slot) => slot.day === day && slot.start === start && slot.end === end);
      if (!duplicate) next.push({ id: `slot-${Date.now()}-${day}`, day, start, end });
    });
    onChange(next);
  };

  const clearSchedule = () => {
    if (value.length && window.confirm('Xóa toàn bộ lịch học hằng tuần?')) onChange([]);
  };

  return (
    <div className="schedule-builder compact-schedule-builder">
      <div className="schedule-compact-head">
        <div className="schedule-heading-copy">
          <span className="schedule-heading-icon"><CalendarDays size={17} /></span>
          <div><strong>Lịch học hằng tuần</strong><small>Chọn lịch gợi ý hoặc chọn từng ngày.</small></div>
        </div>
        <div className="schedule-presets" aria-label="Quick schedule patterns">
          {presets.map((preset) => (
            <button key={preset.id} type="button" className={`schedule-preset ${activePreset === preset.id ? 'active' : ''}`} onClick={() => applyPreset(preset.days)}>
              {preset.label}
            </button>
          ))}
          <button type="button" className={`schedule-preset ${!activePreset ? 'active' : ''}`} onClick={() => setSelectedDays([])}>Tùy chọn</button>
        </div>
      </div>

      <div className="weekday-grid">
        {days.map((day) => {
          const selected = selectedDays.includes(day.name);
          return (
            <button
              type="button"
              key={day.name}
              className={`weekday-button ${selected ? 'active' : ''} ${grouped[day.name].length ? 'has-slot' : ''}`}
              onClick={() => toggleDay(day.name)}
              aria-pressed={selected}
              aria-label={`${day.vn}, ${selected ? 'đã chọn' : 'chưa chọn'}`}
            >
              <span>{day.vn}</span>
              <small>{grouped[day.name].length ? `${grouped[day.name].length} ca học` : day.short}</small>
            </button>
          );
        })}
      </div>

      <div className="schedule-time-row">
        <div className="selected-day-summary">
          <strong>{selectedDays.length ? `${selectedDays.length} ngày đã chọn` : 'Chưa chọn ngày'}</strong>
          <small>{selectedDays.map((day) => days.find((item) => item.name === day)?.vn).join(' · ') || 'Chọn ngày ở phía trên'}</small>
        </div>
        <div className="compact-time-fields">
          <label><span>Từ</span><input aria-label="Giờ bắt đầu" type="time" value={start} onChange={(event) => setStart(event.target.value)} /></label>
          <span className="time-separator">→</span>
          <label><span>Đến</span><input aria-label="Giờ kết thúc" type="time" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        </div>
        <button type="button" className="button primary schedule-add-button" disabled={!selectedDays.length || !start || !end || start >= end} onClick={addSlots}>
          <Plus size={17} /> Thêm lịch
        </button>
      </div>

      <div className="saved-schedule-block">
        <div className="saved-schedule-head"><span><Clock size={15} /> Lịch học đã lưu</span>{value.length > 0 && <button type="button" className="text-button danger-text schedule-clear" onClick={clearSchedule}>Xóa tất cả</button>}</div>
        <div className="schedule-slots compact-schedule-slots">
          {value.length === 0 && <div className="schedule-empty">Chưa có lịch học.</div>}
          {value
            .slice()
            .sort((a, b) => days.findIndex((day) => day.name === a.day) - days.findIndex((day) => day.name === b.day) || a.start.localeCompare(b.start))
            .map((slot) => (
              <div className="schedule-slot schedule-chip" key={slot.id}>
                <span><strong>{days.find((day) => day.name === slot.day)?.vn || slot.day}</strong><em>{slot.start}–{slot.end}</em></span>
                <button type="button" className="schedule-chip-remove" aria-label={`Xóa lịch ${slot.day} ${slot.start} đến ${slot.end}`} onClick={() => onChange(value.filter((item) => item.id !== slot.id))}><Trash2 size={14} /></button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
