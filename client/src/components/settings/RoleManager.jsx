import React from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

export default function RoleManager() {
  const { roles, fetchAll } = useApp();

  const handleDelete = async (id) => {
    await api.delete(`/api/roles/${id}`);
    await fetchAll();
  };

  const handleAdd = async () => {
    const name = prompt('Role name (e.g. CD, ACD, Strategy):');
    if (!name) return;
    const slug = name.toLowerCase().replace(/[\s\/]+/g, '_').replace(/[^a-z0-9_]/g, '');
    await api.post('/api/roles', { name, slug, order: roles.length });
    await fetchAll();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{roles.length} roles</span>
        <button onClick={handleAdd} style={styles.addBtn}>+ Add Role</button>
      </div>
      {roles.map(r => (
        <div key={r._id} style={styles.row}>
          <span style={{ fontWeight: 500 }}>{r.name}</span>
          <button onClick={() => handleDelete(r._id)} style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  row: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 13
  },
  addBtn: {
    padding: '6px 12px', borderRadius: 'var(--radius-sm)',
    background: 'var(--accent)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer'
  }
};
