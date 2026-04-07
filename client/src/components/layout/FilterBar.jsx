import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function FilterBar() {
  const { view, setView, filters, setFilters, regions, capabilities, locked, setLocked } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const toggle = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? undefined : value }));
  };

  const clear = () => setFilters({});
  const activeCount = Object.values(filters).filter(Boolean).length;

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const tabs = [
    { id: 'tree', label: 'Tree' },
    { id: 'directory', label: 'Directory' },
    { id: 'accounts', label: 'Accounts' }
  ];

  return (
    <div className="filter-bar" style={styles.bar}>
      {/* View tabs */}
      <div className="filter-tabs" style={styles.tabs}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)}
            style={{ ...styles.tab, ...(view === tab.id ? styles.tabActive : {}) }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lock toggle + Filter dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
        <button onClick={() => setLocked(l => !l)} title={locked ? 'Unlock cards' : 'Lock cards'}
          style={{
            ...styles.filterBtn,
            ...(locked ? { background: '#0A211F', color: 'white', borderColor: '#0A211F' } : {})
          }}>
          {locked ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
            </svg>
          )}
        </button>
      </div>
      <div ref={ref} style={{ position: 'relative' }}>
        <button onClick={() => setOpen(o => !o)} style={{
          ...styles.filterBtn,
          ...(open || activeCount > 0 ? styles.filterBtnActive : {})
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          <span className="filter-text">Filter</span>{activeCount > 0 && ` (${activeCount})`}
        </button>

        {open && (
          <div style={styles.dropdown}>
            {/* Region */}
            <div style={styles.section}>
              <span style={styles.sectionLabel}>Region</span>
              <div style={styles.optionGroup}>
                {regions.map(r => (
                  <button key={r._id} onClick={() => toggle('region', r.name)}
                    style={{ ...styles.option, ...(filters.region === r.name ? styles.optionActive : {}) }}>
                    {r.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div style={styles.section}>
              <span style={styles.sectionLabel}>Capability</span>
              <div style={styles.optionGroup}>
                {capabilities.filter(c => !['temporary', 'if_time_allows'].includes(c.slug)).map(c => (
                  <button key={c._id} onClick={() => toggle('capability', c.slug)}
                    style={{ ...styles.option, ...(filters.capability === c.slug ? styles.optionActive : {}) }}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div style={styles.section}>
              <span style={styles.sectionLabel}>Status</span>
              <div style={styles.optionGroup}>
                {['new', 'leaving', 'planned'].map(s => (
                  <button key={s} onClick={() => toggle('status', s)}
                    style={{ ...styles.option, ...(filters.status === s ? styles.optionActive : {}) }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {activeCount > 0 && (
              <button onClick={clear} style={styles.clearBtn}>Clear all filters</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  bar: {
    padding: '6px 20px', background: 'white',
    borderBottom: '1px solid var(--border)', flexShrink: 0,
    display: 'flex', alignItems: 'center', gap: 8
  },
  tabs: { display: 'flex', gap: 2, flexShrink: 0 },
  tab: {
    padding: '5px 14px', borderRadius: 16, fontSize: 12,
    fontWeight: 600, color: 'var(--text-secondary)',
    whiteSpace: 'nowrap', transition: 'all 0.15s',
    border: '1px solid transparent'
  },
  tabActive: {
    background: '#0A211F', color: 'white', borderColor: '#0A211F'
  },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '5px 14px', borderRadius: 16, fontSize: 12,
    fontWeight: 600, color: 'var(--text-secondary)',
    border: '1px solid var(--border)', cursor: 'pointer',
    transition: 'all 0.15s'
  },
  filterBtnActive: {
    background: 'var(--accent)', color: '#0A211F', borderColor: 'var(--accent)'
  },
  dropdown: {
    position: 'absolute', top: '100%', right: 0, marginTop: 6,
    background: 'white', borderRadius: 'var(--radius-md)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)', padding: 16,
    width: 260, zIndex: 100
  },
  section: { marginBottom: 14 },
  sectionLabel: {
    display: 'block', fontSize: 11, fontWeight: 700,
    color: 'var(--text-secondary)', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 6
  },
  optionGroup: { display: 'flex', flexWrap: 'wrap', gap: 4 },
  option: {
    padding: '4px 10px', borderRadius: 14, fontSize: 11,
    fontWeight: 500, border: '1px solid var(--border)',
    color: 'var(--text-secondary)', cursor: 'pointer',
    transition: 'all 0.15s'
  },
  optionActive: {
    background: 'var(--accent)', color: '#0A211F', borderColor: 'var(--accent)'
  },
  clearBtn: {
    width: '100%', padding: '6px', borderRadius: 9999,
    fontSize: 11, fontWeight: 600, color: 'var(--red)',
    border: '1px solid var(--red)', cursor: 'pointer',
    background: 'white'
  }
};
