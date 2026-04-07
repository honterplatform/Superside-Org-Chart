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

  return (
    <>
      <nav className="nav-bar" style={styles.nav}>
        <div style={styles.left}>
          <img src="/logo.svg" alt="Logo" style={{ height: 24 }} />
          <span className="nav-logo-text" style={styles.logo}>Spark Studio</span>
        </div>
        <div className="nav-search-center" style={styles.center}>
          <SearchBar />
        </div>
        <div style={styles.right}>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>+<span style={{ marginLeft: 4 }}>Add</span></button>
          <button onClick={() => setSettingsOpen(true)} style={styles.iconBtn} title="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
    flexShrink: 0, zIndex: 50, position: 'relative', gap: 8
  },
  left: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  center: { position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  right: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  logo: { fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700 },
  addBtn: {
    padding: '6px 14px', borderRadius: 9999,
    background: 'var(--accent)', color: '#0A211F', fontSize: 13, fontWeight: 600,
    display: 'flex', alignItems: 'center'
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
