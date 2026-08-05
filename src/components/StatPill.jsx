import React from 'react';

export default function StatPill({ icon, label, value, tone = 'blue' }) {
  return (
    <div className={`stat-pill tone-${tone}`}>
      <span className="stat-icon">{icon}</span>
      <span><small>{label}</small><strong>{value}</strong></span>
    </div>
  );
}
