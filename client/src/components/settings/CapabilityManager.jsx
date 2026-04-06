import React from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

export default function CapabilityManager() {
  const { capabilities, fetchAll } = useApp();

  const handleDelete = async (id) => {
    await api.delete(`/api/capabilities/${id}`);
    await fetchAll();
  };

  const handleAdd = async () => {
    const name = prompt('Capability name:');
    if (!name) return;
    const slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    await api.post('/api/capabilities', { name, slug, color: '#666666' });
    await fetchAll();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={handleAdd} style={styles.addBtn}>+ Add Capability</button>
      </div>
      {capabilities.map(c => (
        <div key={c._id} style={styles.row}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
          <span style={{ flex: 1, fontWeight: 500 }}>{c.name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.slug}</span>
          <button onClick={() => handleDelete(c._id)} style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 13 },
  addBtn: { padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }
};
