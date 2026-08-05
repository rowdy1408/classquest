import React, { useEffect } from 'react';
import { X } from '../icons';

export default function Modal({ open, title, children, onClose, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className={`modal-card ${wide ? 'modal-wide' : ''}`} onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close modal"><X size={20} /></button>
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}
