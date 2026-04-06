import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

const emptyForm = { name: '', icon: '', color: '#666666', description: '' };

export default function CapabilityManager() {
  const { capabilities, fetchAll } = useApp();
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const startEdit = (c) => {
    setEditing(c._id); setAdding(false);
    setForm({ name: c.name, icon: c.icon || '', color: c.color || '#666666', description: c.description || '' });
  };

  const handleSave = async (id) => {
    const slug = form.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    try {
      if (id) await api.put(`/api/capabilities/${id}`, { ...form, slug });
      else await api.post('/api/capabilities', { ...form, slug });
      await fetchAll(); setEditing(null); setAdding(false); setForm(emptyForm);
    } catch { alert('Failed to save'); }
  };

  const handleDelete = async (id) => { await api.delete(`/api/capabilities/${id}`); await fetchAll(); };
  const cancel = () => { setEditing(null); setAdding(false); setForm(emptyForm); };

  const FormFields = ({ id }) => (
    <div style={s.form}>
      <div style={s.formRow}>
        <input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={s.input} />
        <input placeholder="Icon name" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} style={s.input} />
        <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 36, height: 32, padding: 2, border: '1px solid var(--border)', borderRadius: 9999, cursor: 'pointer' }} />
      </div>
      <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={s.input} />
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button onClick={cancel} style={s.cancelBtn}>Cancel</button>
        <button onClick={() => handleSave(id)} style={s.saveBtn}>Save</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        {!adding && <button onClick={() => { setAdding(true); setEditing(null); setForm(emptyForm); }} style={s.addBtn}>+ Add Capability</button>}
      </div>
      {adding && <FormFields id={null} />}
      {capabilities.map(c => (
        <div key={c._id}>
          {editing === c._id ? <FormFields id={c._id} /> : (
            <div style={s.row}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontWeight: 500 }}>{c.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.description}</span>
              <button onClick={() => startEdit(c)} style={s.editBtn}>Edit</button>
              <button onClick={() => handleDelete(c._id)} style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const s = {
  row: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 13 },
  form: { padding: 12, marginBottom: 8, background: 'var(--bg)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  formRow: { display: 'flex', gap: 6 },
  input: { flex: 1, padding: '6px 10px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 12 },
  addBtn: { padding: '6px 12px', borderRadius: 9999, background: 'var(--accent)', color: '#0A211F', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  editBtn: { padding: '2px 10px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)' },
  cancelBtn: { padding: '6px 14px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer' },
  saveBtn: { padding: '6px 14px', borderRadius: 9999, background: 'var(--accent)', color: '#0A211F', fontSize: 12, fontWeight: 600, cursor: 'pointer' }
};
