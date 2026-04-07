import React from 'react';
import { useApp } from '../../context/AppContext';

export default function MobileTabBar() {
  const { view, setView, setSettingsOpen } = useApp();

  const tabs = [
    { id: 'directory', label: 'Directory', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
    { id: 'settings', label: 'Settings', icon: 'M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' }
  ];

  const handleTab = (id) => {
    if (id === 'settings') { setSettingsOpen(true); }
    else { setView(id); }
  };

  return (
    <div className="show-mobile-only" style={styles.bar}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => handleTab(tab.id)}
          style={{ ...styles.tab, color: view === tab.id ? 'var(--accent)' : 'var(--text-secondary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={tab.icon} />
          </svg>
          <span style={styles.label}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

const styles = {
  bar: {
    display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    padding: '8px 0', background: 'white', borderTop: '1px solid var(--border)',
    flexShrink: 0
  },
  tab: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    padding: '4px 16px', border: 'none', background: 'none', cursor: 'pointer'
  },
  label: { fontSize: 10, fontWeight: 500 }
};
