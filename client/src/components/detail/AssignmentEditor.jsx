import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PriorityLabel, ModifierBadge } from '../shared/Badge';
import AccountLogo from '../shared/AccountLogo';
import api from '../../services/api';

export default function AssignmentEditor({ personId, assignments, onUpdate }) {
  const { accounts } = useApp();
  const [adding, setAdding] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('main');

  const sorted = [...assignments].sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleAdd = async () => {
    if (!selectedAccount) return;
    try {
      await api.post('/api/assignments', {
        personId, accountId: selectedAccount,
        priority: selectedPriority, order: sorted.length
      });
      setAdding(false);
      setSelectedAccount('');
      onUpdate();
    } catch { alert('Failed to add assignment'); }
  };

  const handleRemove = async (id) => {
    try {
      await api.delete(`/api/assignments/${id}`);
      onUpdate();
    } catch { alert('Failed to remove'); }
  };

  const handleChangePriority = async (id, priority) => {
    try {
      await api.put(`/api/assignments/${id}`, { priority });
      onUpdate();
    } catch { alert('Failed to update'); }
  };

  const handleChangeModifier = async (id, modifier) => {
    try {
      await api.put(`/api/assignments/${id}`, { modifier: modifier || null });
      onUpdate();
    } catch { alert('Failed to update'); }
  };

  const getAccount = (a) => {
    if (a.accountId?.name) return a.accountId;
    return accounts.find(ac => ac._id === a.accountId);
  };

  return (
    <div>
      {sorted.map((a, i) => {
        const account = getAccount(a);
        return (
          <div key={a._id} style={styles.item}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
              <AccountLogo account={account} size={28} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {account?.name || 'Unknown'}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                  <select value={a.priority} onChange={e => handleChangePriority(a._id, e.target.value)}
                    style={styles.miniSelect}>
                    <option value="main">Main</option>
                    <option value="secondary">Secondary</option>
                    <option value="additional">Additional</option>
                  </select>
                  <select value={a.modifier || ''} onChange={e => handleChangeModifier(a._id, e.target.value)}
                    style={styles.miniSelect}>
                    <option value="">No modifier</option>
                    <option value="temporary">Temporary</option>
                    <option value="if_time_allows">If Time Allows</option>
                  </select>
                </div>
              </div>
            </div>
            <button onClick={() => handleRemove(a._id)} style={styles.removeBtn}>×</button>
          </div>
        );
      })}

      {adding ? (
        <div style={styles.addForm}>
          <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}
            style={{ flex: 1, ...styles.miniSelect }}>
            <option value="">Select account...</option>
            {accounts.map(a => <option key={a._id} value={a._id}>{a.name} — {a.teamName}</option>)}
          </select>
          <select value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}
            style={styles.miniSelect}>
            <option value="main">Main</option>
            <option value="secondary">Secondary</option>
            <option value="additional">Additional</option>
          </select>
          <button onClick={handleAdd} style={styles.addConfirmBtn}>Add</button>
          <button onClick={() => setAdding(false)} style={styles.cancelBtn}>×</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={styles.addBtn}>+ Add Account</button>
      )}
    </div>
  );
}

const styles = {
  item: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 10px', borderRadius: 'var(--radius-sm)',
    background: 'var(--bg)', marginBottom: 6, gap: 8
  },
  miniSelect: {
    padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)',
    fontSize: 11, background: 'white'
  },
  removeBtn: {
    width: 24, height: 24, borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    color: 'var(--text-secondary)', fontSize: 16, cursor: 'pointer',
    flexShrink: 0
  },
  addForm: {
    display: 'flex', gap: 6, alignItems: 'center', marginTop: 8, flexWrap: 'wrap'
  },
  addBtn: {
    marginTop: 8, padding: '6px 12px', borderRadius: 'var(--radius-sm)',
    border: '1px dashed var(--border)', color: 'var(--accent)',
    fontSize: 12, fontWeight: 500, cursor: 'pointer', width: '100%'
  },
  addConfirmBtn: {
    padding: '4px 10px', borderRadius: 4, background: 'var(--accent)',
    color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer'
  },
  cancelBtn: {
    padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)',
    fontSize: 13, cursor: 'pointer'
  }
};
