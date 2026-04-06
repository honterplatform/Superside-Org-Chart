import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function FreelancePoolEditor({ personId }) {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/freelance-pools').then(({ data }) => {
      setPools(data.filter(p => {
        const oid = p.ownerId?._id || p.ownerId;
        return oid === personId;
      }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [personId]);

  if (loading || pools.length === 0) return null;

  const pool = pools[0];

  const handleAddMember = async () => {
    const name = prompt('Member name:');
    if (!name) return;
    const specialty = prompt('Specialty:', 'RETOUCH') || '';
    const updated = [...pool.members, { name, specialty }];
    await api.put(`/api/freelance-pools/${pool._id}`, { members: updated });
    pool.members = updated;
    setPools([...pools]);
  };

  const handleRemoveMember = async (idx) => {
    const updated = pool.members.filter((_, i) => i !== idx);
    await api.put(`/api/freelance-pools/${pool._id}`, { members: updated });
    pool.members = updated;
    setPools([...pools]);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
        Freelance Pool: {pool.name}
      </label>
      {pool.members.map((m, i) => (
        <div key={i} style={styles.member}>
          <span>{m.name}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={styles.specialty}>{m.specialty}</span>
            <button onClick={() => handleRemoveMember(i)} style={styles.removeBtn}>×</button>
          </span>
        </div>
      ))}
      <button onClick={handleAddMember} style={styles.addBtn}>+ Add Member</button>
    </div>
  );
}

const styles = {
  member: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 10px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
    marginBottom: 4, fontSize: 13
  },
  specialty: { fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 },
  removeBtn: { color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 },
  addBtn: {
    marginTop: 6, padding: '6px 12px', borderRadius: 'var(--radius-sm)',
    border: '1px dashed var(--border)', color: 'var(--accent)',
    fontSize: 12, cursor: 'pointer', width: '100%'
  }
};
