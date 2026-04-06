import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

export default function RegionManager() {
  const { regions, fetchAll } = useApp();
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  const startEdit = (r) => { setEditing(r._id); setAdding(false); setName(r.name); };

  const handleSave = async (id) => {
    if (!name.trim()) return;
    try {
      if (id) await api.put(`/api/regions/${id}`, { name, slug: name.toLowerCase() });
      else await api.post('/api/regions', { name, slug: name.toLowerCase() });
      await fetchAll(); setEditing(null); setAdding(false); setName('');
    } catch { alert('Failed to save'); }
  };

  const handleDelete = async (id) => { await api.delete(`/api/regions/${id}`); await fetchAll(); };
  const cancel = () => { setEditing(null); setAdding(false); setName(''); };

  const FormFields = ({ id }) => (
    <div style={s.form}>
      <input placeholder="Region name (e.g. AMERICAS)" value={name} onChange={e => setName(e.target.value)} style={s.input} autoFocus />
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button onClick={cancel} style={s.cancelBtn}>Cancel</button>
        <button onClick={() => handleSave(id)} style={s.saveBtn}>Save</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{regions.length} regions</span>
        {!adding && <button onClick={() => { setAdding(true); setEditing(null); setName(''); }} style={s.addBtn}>+ Add Region</button>}
      </div>
      {adding && <FormFields id={null} />}
      {regions.map(r => (
        <div key={r._id}>
          {editing === r._id ? <FormFields id={r._id} /> : (
            <div style={s.row}>
              <span style={{ fontWeight: 500 }}>{r.name}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => startEdit(r)} style={s.editBtn}>Edit</button>
                <button onClick={() => handleDelete(r._id)} style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }}>×</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const s = {
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 13 },
  form: { padding: 12, marginBottom: 8, background: 'var(--bg)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  input: { flex: 1, padding: '6px 10px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 12 },
  addBtn: { padding: '6px 12px', borderRadius: 9999, background: 'var(--accent)', color: '#0A211F', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  editBtn: { padding: '2px 10px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)' },
  cancelBtn: { padding: '6px 14px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer' },
  saveBtn: { padding: '6px 14px', borderRadius: 9999, background: 'var(--accent)', color: '#0A211F', fontSize: 12, fontWeight: 600, cursor: 'pointer' }
};
