import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { formatName } from '../../utils/formatters';
import { StatusBadge, PriorityLabel, ModifierBadge } from '../shared/Badge';
import AccountLogo from '../shared/AccountLogo';
import AssignmentEditor from './AssignmentEditor';
import CapabilityPicker from './CapabilityPicker';
import FreelancePoolEditor from './FreelancePoolEditor';
import api from '../../services/api';

export default function PersonDetail() {
  const { selectedPersonId, setSelectedPersonId, people, accounts, assignments, roles, seniorityLevels, fetchAll } = useApp();
  const [person, setPerson] = useState(null);
  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadPerson = useCallback(async () => {
    if (!selectedPersonId) return;
    try {
      const { data } = await api.get(`/api/people/${selectedPersonId}`);
      setPerson(data);
    } catch { setPerson(null); }
  }, [selectedPersonId]);

  useEffect(() => { loadPerson(); }, [loadPerson]);

  if (!person) return null;

  const handleSave = async (field, value) => {
    setSaving(true);
    try {
      await api.put(`/api/people/${person._id}`, { [field]: value });
      await loadPerson();
      await fetchAll();
    } catch (err) { alert('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/people/${person._id}`);
      setSelectedPersonId(null);
      await fetchAll();
    } catch { alert('Failed to delete'); }
  };

  const directReports = person.directReports || [];
  const manager = people.find(p => p._id === (person.managerId?._id || person.managerId));

  return (
    <div style={styles.overlay} onClick={() => setSelectedPersonId(null)}>
      <div style={styles.panel} className="slide-in" onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <button onClick={() => setSelectedPersonId(null)} style={styles.closeBtn}>&times;</button>
        </div>

        <div style={styles.body}>
          {/* Profile Photo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ position: 'relative' }}>
              {person.photoUrl ? (
                <img src={person.photoUrl} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8E0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#6B5CE7' }}>
                  {formatName(person.name).split(' ').map(p => p[0]).join('').slice(0, 2)}
                </div>
              )}
              <label style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, boxShadow: 'var(--shadow-sm)' }}>
                +
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const form = new FormData();
                  form.append('photo', file);
                  try {
                    await api.post(`/api/people/${person._id}/photo`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
                    loadPerson();
                    fetchAll();
                  } catch { alert('Failed to upload photo'); }
                }} />
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <EditableField value={person.name} onSave={v => handleSave('name', v)}
                renderDisplay={v => <h2 style={styles.name}>{formatName(v)}</h2>} />
            </div>
          </div>

          {/* Role (optional) */}
          <div style={styles.section}>
            <label style={styles.sectionLabel}>Role</label>
            <select value={person.title || ''} onChange={e => handleSave('title', e.target.value)}
              style={styles.select}>
              <option value="">No role</option>
              {roles.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
            </select>
          </div>

          {/* Seniority + Region + Manager/IC */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <select value={person.seniority} onChange={e => handleSave('seniority', e.target.value)}
              style={styles.select}>
              {seniorityLevels.map(s =>
                <option key={s._id} value={s.name}>{s.name}</option>)}
            </select>
            <select value={person.region} onChange={e => handleSave('region', e.target.value)}
              style={styles.select}>
              {['AMERICAS','EMEA','APAC'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={person.role} onChange={e => handleSave('role', e.target.value)}
              style={styles.select}>
              <option value="ic">IC</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          {/* Status */}
          <div style={styles.section}>
            <label style={styles.sectionLabel}>Status</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={person.status} onChange={e => handleSave('status', e.target.value)}
                style={styles.select}>
                {['active','new','leaving','planned'].map(s =>
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <StatusBadge status={person.status} />
            </div>
            <input placeholder="Status note..." value={person.statusNote || ''}
              onChange={e => setPerson(p => ({ ...p, statusNote: e.target.value }))}
              onBlur={e => handleSave('statusNote', e.target.value)}
              style={{ ...styles.input, marginTop: 6 }} />
          </div>

          {/* Manager */}
          <div style={styles.section}>
            <label style={styles.sectionLabel}>Manager</label>
            <select value={person.managerId?._id || person.managerId || ''}
              onChange={e => handleSave('managerId', e.target.value || null)}
              style={styles.select}>
              <option value="">No manager</option>
              {people.filter(p => p._id !== person._id && p.role === 'manager').map(p =>
                <option key={p._id} value={p._id}>{formatName(p.name)}</option>)}
            </select>
          </div>

          {/* Secondary Manager */}
          <div style={styles.section}>
            <label style={styles.sectionLabel}>Secondary Manager (dotted line)</label>
            <select value={person.secondaryManagerId?._id || person.secondaryManagerId || ''}
              onChange={e => handleSave('secondaryManagerId', e.target.value || null)}
              style={styles.select}>
              <option value="">None</option>
              {people.filter(p => p._id !== person._id).map(p =>
                <option key={p._id} value={p._id}>{formatName(p.name)}</option>)}
            </select>
          </div>

          {/* Account Assignments */}
          <div style={styles.section}>
            <label style={styles.sectionLabel}>Account Assignments</label>
            <AssignmentEditor personId={person._id} assignments={person.assignments || []}
              onUpdate={loadPerson} />
          </div>

          {/* Capabilities */}
          <div style={styles.section}>
            <label style={styles.sectionLabel}>Capabilities</label>
            <CapabilityPicker personId={person._id} current={person.capabilities || []}
              onUpdate={() => { loadPerson(); fetchAll(); }} />
          </div>

          {/* Notes */}
          <div style={styles.section}>
            <label style={styles.sectionLabel}>Notes</label>
            <textarea
              value={person.notes || ''}
              onChange={e => setPerson(p => ({ ...p, notes: e.target.value }))}
              onBlur={e => handleSave('notes', e.target.value)}
              rows={3} placeholder="Add notes..."
              style={{ ...styles.input, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Freelance Pool */}
          <FreelancePoolEditor personId={person._id} />

          {/* Direct Reports */}
          {directReports.length > 0 && (
            <div style={styles.section}>
              <label style={styles.sectionLabel}>Direct Reports ({directReports.length})</label>
              {directReports.map(r => (
                <div key={r._id} onClick={() => setSelectedPersonId(r._id)}
                  style={styles.reportItem}>
                  <span style={{ fontWeight: 500 }}>{formatName(r.name)}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.seniority} • {r.region}</span>
                </div>
              ))}
            </div>
          )}

          {/* Type */}
          <div style={styles.section}>
            <label style={styles.sectionLabel}>Type</label>
            <select value={person.type || 'employee'} onChange={e => handleSave('type', e.target.value)}
              style={styles.select}>
              <option value="employee">Employee</option>
              <option value="freelancer">Freelancer</option>
              <option value="planned_role">Planned Role</option>
            </select>
          </div>

          {/* Delete */}
          <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} style={styles.deleteBtn}>Delete Person</button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleDelete} style={{ ...styles.deleteBtn, background: 'var(--red)', color: 'white' }}>
                  Confirm Delete
                </button>
                <button onClick={() => setConfirmDelete(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableField({ value, onSave, renderDisplay }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <input value={draft} onChange={e => setDraft(e.target.value)}
        onBlur={() => { onSave(draft); setEditing(false); }}
        onKeyDown={e => { if (e.key === 'Enter') { onSave(draft); setEditing(false); } }}
        autoFocus style={{ ...styles.input, fontWeight: 600 }} />
    );
  }
  return <div onClick={() => { setDraft(value); setEditing(true); }} style={{ cursor: 'pointer' }}>
    {renderDisplay(value)}
  </div>;
}

const styles = {
  overlay: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 40,
    display: 'flex', justifyContent: 'flex-end'
  },
  panel: {
    width: 420, maxWidth: '100vw', height: '100%', background: 'white',
    boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    display: 'flex', justifyContent: 'flex-end', padding: '12px 16px',
    borderBottom: '1px solid var(--border)'
  },
  closeBtn: { fontSize: 22, color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 4px' },
  body: { flex: 1, overflow: 'auto', padding: '16px 20px' },
  name: { fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, marginBottom: 0 },
  title: { fontSize: 14, color: 'var(--text-secondary)' },
  section: { marginTop: 20 },
  sectionLabel: { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 },
  select: {
    padding: '6px 10px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', fontSize: 13, background: 'white'
  },
  input: {
    width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', fontSize: 13
  },
  reportItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 10px', borderRadius: 'var(--radius-sm)',
    cursor: 'pointer', marginBottom: 4, fontSize: 13,
    background: 'var(--bg)'
  },
  deleteBtn: {
    padding: '8px 16px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--red)', color: 'var(--red)',
    fontSize: 13, fontWeight: 500, cursor: 'pointer'
  },
  cancelBtn: {
    padding: '8px 16px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', fontSize: 13, cursor: 'pointer'
  }
};
