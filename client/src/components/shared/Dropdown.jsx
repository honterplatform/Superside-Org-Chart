import React from 'react';

export default function Dropdown({ label, value, onChange, options, placeholder = 'Select...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>}
      <select value={value || ''} onChange={e => onChange(e.target.value || null)}
        style={{ padding: '8px 12px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 13, background: 'white' }}>
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
