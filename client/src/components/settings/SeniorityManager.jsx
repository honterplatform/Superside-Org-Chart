import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

export default function SeniorityManager() {
  const { seniorityLevels, fetchAll } = useApp();
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', rank: 1 });

  const startEdit = (lv) => { setEditing(lv._id); setAdding(false); setForm({ name: lv.name, rank: lv.rank }); };

  const handleSave = async (id) => {
    if (!form.name.trim()) return;
    try {
      if (id) await api.put(`/api/seniority-levels/${id}`, { name: form.name, slug: form.name, rank: Number(form.rank) });
      else await api.post('/api/seniority-levels', { name: form.name, slug: form.name, rank: Number(form.rank) });
      await fetchAll(); setEditing(null); setAdding(false); setForm({ name: '', rank: 1 });
    } catch { alert('Failed to save'); }
  };

  const handleDelete = async (id) => { await api.delete(`/api/seniority-levels/${id}`); await fetchAll(); };
  const cancel = () => { setEditing(null); setAdding(false); setForm({ name: '', rank: 1 }); };

  const FormFields = ({ id }) => (
    <div style={st.form}>
      <div style={st.formRow}>
        <input placeholder="Level name (e.g. 5a)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={st.input} autoFocus />
        <input placeholder="Rank" type="number" value={form.rank} onChange={e => setForm(f => ({ ...f, rank: e.target.value }))} style={{ ...st.input, maxWidth: 80 }} />
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button onClick={cancel} style={st.cancelBtn}>Cancel</button>
        <button onClick={() => handleSave(id)} style={st.saveBtn}>Save</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{seniorityLevels.length} levels</span>
        {!adding && <button onClick={() => { setAdding(true); setEditing(null); setForm({ name: '', rank: seniorityLevels.length + 1 }); }} style={st.addBtn}>+ Add Level</button>}
      </div>
      {adding && <FormFields id={null} />}
      {seniorityLevels.map(lv => (
        <div key={lv._id}>
          {editing === lv._id ? <FormFields id={lv._id} /> : (
            <div style={st.row}>
              <span style={{ fontWeight: 500 }}>{lv.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Rank: {lv.rank}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => startEdit(lv)} style={st.editBtn}>Edit</button>
                <button onClick={() => handleDelete(lv._id)} style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }}>×</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const st = {
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 13, gap: 8 },
  form: { padding: 12, marginBottom: 8, background: 'var(--bg)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  formRow: { display: 'flex', gap: 6 },
  input: { flex: 1, padding: '6px 10px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 12 },
  addBtn: { padding: '6px 12px', borderRadius: 9999, background: 'var(--accent)', color: '#0A211F', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  editBtn: { padding: '2px 10px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)' },
  cancelBtn: { padding: '6px 14px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer' },
  saveBtn: { padding: '6px 14px', borderRadius: 9999, background: 'var(--accent)', color: '#0A211F', fontSize: 12, fontWeight: 600, cursor: 'pointer' }
};
