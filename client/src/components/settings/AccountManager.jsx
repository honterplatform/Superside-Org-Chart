import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import api from '../../services/api';

export default function AccountManager() {
  const { accounts, fetchAll } = useApp();
  const [editing, setEditing] = useState(null);

  const handleSave = async (id, updates) => {
    try {
      await api.put(`/api/accounts/${id}`, updates);
      await fetchAll();
      setEditing(null);
    } catch { alert('Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this account? This will remove all assignments.')) return;
    await api.delete(`/api/accounts/${id}`);
    await fetchAll();
  };

  const handleAdd = async () => {
    const name = prompt('Account name:');
    if (!name) return;
    await api.post('/api/accounts', { name, teamName: name, region: 'AMERICAS' });
    await fetchAll();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{accounts.length} accounts</span>
        <button onClick={handleAdd} style={styles.addBtn}>+ Add Account</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Team</th>
            <th style={styles.th}>MRR</th>
            <th style={styles.th}>Region</th>
            <th style={styles.th}>BU</th>
            <th style={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(a => (
            <tr key={a._id}>
              <td style={styles.td}>{a.name}</td>
              <td style={styles.td}>{a.teamName}</td>
              <td style={styles.td}>{formatCurrency(a.mrr)}</td>
              <td style={styles.td}>{a.region}</td>
              <td style={styles.td}>{a.businessUnit}</td>
              <td style={styles.td}>
                <button onClick={() => handleDelete(a._id)} style={styles.removeBtn}>×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  th: { padding: '8px 10px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)' },
  td: { padding: '8px 10px', borderBottom: '1px solid var(--border-light)' },
  addBtn: { padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  removeBtn: { color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }
};
