import React from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

export default function SeniorityManager() {
  const { seniorityLevels, fetchAll } = useApp();

  const handleDelete = async (id) => {
    await api.delete(`/api/seniority-levels/${id}`);
    await fetchAll();
  };

  const handleAdd = async () => {
    const name = prompt('Level name (e.g. 5a):');
    if (!name) return;
    const rank = parseInt(prompt('Rank (1-20):', '10'), 10);
    await api.post('/api/seniority-levels', { name, slug: name, rank });
    await fetchAll();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={handleAdd} style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add Level</button>
      </div>
      {seniorityLevels.map(s => (
        <div key={s._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
          <span style={{ fontWeight: 500 }}>{s.name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Rank: {s.rank}</span>
          <button onClick={() => handleDelete(s._id)} style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      ))}
    </div>
  );
}
