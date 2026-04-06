import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import SearchBar from '../shared/SearchBar';
import api from '../../services/api';

export default function NavBar() {
  const { view, setView, setSettingsOpen, setSelectedPersonId, people } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: '', title: '', seniority: '3a', region: 'AMERICAS', role: 'ic' });

  const handleAddPerson = async () => {
    if (!newPerson.name.trim()) return;
    try {
      const { data } = await api.post('/api/people', newPerson);
      setSelectedPersonId(data._id);
      setShowAddModal(false);
      setNewPerson({ name: '', title: '', seniority: '3a', region: 'AMERICAS', role: 'ic' });
    } catch (err) {
      alert('Failed to add person');
    }
  };

  const tabs = [
    { id: 'tree', label: 'Tree', hideOnMobile: true },
    { id: 'directory', label: 'Directory' },
    { id: 'accounts', label: 'Accounts', hideOnMobile: true }
  ];

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.left}>
          <img src="/logo.svg" alt="Logo" style={{ height: 24 }} />
          <span style={styles.logo}>Spark Studio</span>
        </div>
        <div style={styles.center}>
          <SearchBar />
        </div>
        <div style={styles.right}>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>+ Add</button>
          <button onClick={() => setSettingsOpen(true)} style={styles.iconBtn} title="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          </button>
        </div>
      </nav>

      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: 16 }}>Add Person</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Name (e.g. first.last)" value={newPerson.name}
                onChange={e => setNewPerson(p => ({ ...p, name: e.target.value }))} autoFocus />
              <input placeholder="Title" value={newPerson.title}
                onChange={e => setNewPerson(p => ({ ...p, title: e.target.value }))} />
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={newPerson.seniority} onChange={e => setNewPerson(p => ({ ...p, seniority: e.target.value }))}>
                  {['1b','1a','1.2','2a','2b','3a','3b','4a','4b','5a','5b','6a','6b','7a','7b','8a'].map(s =>
                    <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={newPerson.region} onChange={e => setNewPerson(p => ({ ...p, region: e.target.value }))}>
                  {['AMERICAS','EMEA','APAC'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={newPerson.role} onChange={e => setNewPerson(p => ({ ...p, role: e.target.value }))}>
                  <option value="ic">IC</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <select value={newPerson.managerId || ''} onChange={e => setNewPerson(p => ({ ...p, managerId: e.target.value || null }))}>
                <option value="">No manager</option>
                {people.filter(p => p.role === 'manager').map(p =>
                  <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowAddModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button onClick={handleAddPerson} style={styles.saveBtn}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 20px', height: 52, background: '#0A211F', color: 'white',
    flexShrink: 0, zIndex: 50, position: 'relative'
  },
  left: { display: 'flex', alignItems: 'center', gap: 24 },
  center: { position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  right: { display: 'flex', alignItems: 'center', gap: 8 },
  logo: { fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700 },
  tabs: { display: 'flex', gap: 2 },
  tab: {
    padding: '6px 14px', borderRadius: 9999,
    color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500,
    transition: 'all 0.15s'
  },
  tabActive: { color: 'white', background: 'rgba(255,255,255,0.15)' },
  addBtn: {
    padding: '6px 14px', borderRadius: 9999,
    background: 'var(--accent)', color: '#0A211F', fontSize: 13, fontWeight: 600
  },
  iconBtn: {
    padding: 8, borderRadius: 9999, color: 'rgba(255,255,255,0.7)',
    display: 'flex', alignItems: 'center'
  },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modal: {
    background: 'white', borderRadius: 'var(--radius-lg)', padding: 24,
    maxWidth: 420, width: '95%', color: 'var(--text-primary)'
  },
  cancelBtn: {
    padding: '8px 16px', borderRadius: 9999,
    border: '1px solid var(--border)', cursor: 'pointer'
  },
  saveBtn: {
    padding: '8px 16px', borderRadius: 9999,
    background: 'var(--accent)', color: '#0A211F', fontWeight: 600, cursor: 'pointer'
  }
};
