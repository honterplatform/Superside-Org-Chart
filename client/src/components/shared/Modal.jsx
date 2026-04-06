import React from 'react';

export default function Modal({ title, onClose, children, wide = false }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modal, maxWidth: wide ? 900 : 520 }} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button onClick={onClose} style={styles.close}>&times;</button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, animation: 'fadeIn 0.15s'
  },
  modal: {
    background: 'white', borderRadius: 'var(--radius-lg)',
    width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column',
    boxShadow: 'var(--shadow-lg)'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px', borderBottom: '1px solid var(--border)'
  },
  title: { fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600 },
  close: { fontSize: 24, color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 4px' },
  body: { padding: '20px 24px', overflow: 'auto', flex: 1 }
};
