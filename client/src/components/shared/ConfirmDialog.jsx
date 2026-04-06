import React from 'react';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.dialog} onClick={e => e.stopPropagation()}>
        <p style={{ marginBottom: 20, fontSize: 14 }}>{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={styles.cancelBtn}>Cancel</button>
          <button onClick={onConfirm} style={styles.confirmBtn}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
  },
  dialog: {
    background: 'white', borderRadius: 'var(--radius-md)', padding: 24,
    maxWidth: 400, width: '90%', boxShadow: 'var(--shadow-lg)'
  },
  cancelBtn: {
    padding: '8px 16px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', background: 'white', cursor: 'pointer'
  },
  confirmBtn: {
    padding: '8px 16px', borderRadius: 'var(--radius-sm)',
    background: 'var(--accent)', color: 'white', cursor: 'pointer', fontWeight: 600
  }
};
