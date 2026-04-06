import React from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

export default function RegionManager() {
  const { regions, fetchAll } = useApp();

  const handleDelete = async (id) => {
    await api.delete(`/api/regions/${id}`);
    await fetchAll();
  };

  const handleAdd = async () => {
    const name = prompt('Region name:');
    if (!name) return;
    await api.post('/api/regions', { name, slug: name.toLowerCase() });
    await fetchAll();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={handleAdd} style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add Region</button>
      </div>
      {regions.map(r => (
        <div key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
          <span style={{ fontWeight: 500 }}>{r.name}</span>
          <button onClick={() => handleDelete(r._id)} style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      ))}
    </div>
  );
}
