import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, getInitials } from '../../utils/formatters';
import AccountLogo from '../shared/AccountLogo';
import api from '../../services/api';

const emptyForm = { name: '', teamName: '', externalId: '', mrr: 0, region: 'AMERICAS', businessUnit: '', logoUrl: '', color: '#666666' };

export default function AccountManager() {
  const { accounts, fetchAll } = useApp();
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const startEdit = (a) => {
    setEditing(a._id);
    setAdding(false);
    setForm({ name: a.name, teamName: a.teamName || '', externalId: a.externalId || '', mrr: a.mrr || 0, region: a.region || 'AMERICAS', businessUnit: a.businessUnit || '', logoUrl: a.logoUrl || '', color: a.color || '#666666' });
  };

  const handleSave = async (id) => {
    try {
      if (id) await api.put(`/api/accounts/${id}`, form);
      else await api.post('/api/accounts', form);
      await fetchAll();
      setEditing(null);
      setAdding(false);
      setForm(emptyForm);
    } catch { alert('Failed to save'); }
  };

  const handleLogoUpload = async (file, accountId) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    try {
      const { data } = await api.post(`/api/accounts/${accountId}/logo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, logoUrl: data.logoUrl }));
      await fetchAll();
    } catch { alert('Failed to upload logo'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this account and all its assignments?')) return;
    await api.delete(`/api/accounts/${id}`);
    await fetchAll();
  };

  const cancel = () => { setEditing(null); setAdding(false); setForm(emptyForm); };

  const FormFields = ({ id }) => (
    <div style={s.form}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        {/* Logo preview + upload */}
        <div style={{ position: 'relative' }}>
          {form.logoUrl ? (
            <img src={form.logoUrl} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'contain', background: '#f5f5f5' }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: form.color || '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>
              {form.name ? getInitials(form.name) : '?'}
            </div>
          )}
          {id && (
            <label style={{ position: 'absolute', bottom: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', color: '#0A211F', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>
              +
              <input type="file" accept=".svg,image/svg+xml,image/png,image/jpeg" style={{ display: 'none' }} onChange={e => handleLogoUpload(e.target.files?.[0], id)} />
            </label>
          )}
        </div>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{form.name || 'New Account'}</div>
      </div>
      <div style={s.formRow}>
        <input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={s.input} />
        <input placeholder="Team Name" value={form.teamName} onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))} style={s.input} />
      </div>
      <div style={s.formRow}>
        <input placeholder="MRR" type="number" value={form.mrr} onChange={e => setForm(f => ({ ...f, mrr: Number(e.target.value) }))} style={{ ...s.input, maxWidth: 100 }} />
        <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} style={s.input}>
          <option value="AMERICAS">AMERICAS</option><option value="EMEA">EMEA</option><option value="APAC">APAC</option>
        </select>
        <input placeholder="Business Unit" value={form.businessUnit} onChange={e => setForm(f => ({ ...f, businessUnit: e.target.value }))} style={s.input} />
      </div>
      <div style={s.formRow}>
        <input placeholder="External ID" value={form.externalId} onChange={e => setForm(f => ({ ...f, externalId: e.target.value }))} style={s.input} />
        <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 36, height: 32, padding: 2, border: '1px solid var(--border)', borderRadius: 9999, cursor: 'pointer' }} />
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button onClick={cancel} style={s.cancelBtn}>Cancel</button>
        <button onClick={() => handleSave(id)} style={s.saveBtn}>Save</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{accounts.length} accounts</span>
        {!adding && <button onClick={() => { setAdding(true); setEditing(null); setForm(emptyForm); }} style={s.addBtn}>+ Add Account</button>}
      </div>
      {adding && <FormFields id={null} />}
      {accounts.map(a => (
        <div key={a._id}>
          {editing === a._id ? <FormFields id={a._id} /> : (
            <div style={s.row}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <AccountLogo account={a} size={28} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{a.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{a.teamName} · {formatCurrency(a.mrr)} · {a.region}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => startEdit(a)} style={s.editBtn}>Edit</button>
                <button onClick={() => handleDelete(a._id)} style={{ color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14 }}>×</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const s = {
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid var(--border-light)', fontSize: 13, gap: 8 },
  form: { padding: 12, marginBottom: 8, background: 'var(--bg)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 8 },
  formRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  input: { flex: 1, padding: '6px 10px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 12, minWidth: 80 },
  addBtn: { padding: '6px 12px', borderRadius: 9999, background: 'var(--accent)', color: '#0A211F', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  editBtn: { padding: '2px 10px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)' },
  cancelBtn: { padding: '6px 14px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer' },
  saveBtn: { padding: '6px 14px', borderRadius: 9999, background: 'var(--accent)', color: '#0A211F', fontSize: 12, fontWeight: 600, cursor: 'pointer' }
};
