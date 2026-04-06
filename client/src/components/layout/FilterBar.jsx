import React from 'react';
import { useApp } from '../../context/AppContext';

export default function FilterBar() {
  const { filters, setFilters, regions, capabilities, seniorityLevels } = useApp();

  const toggle = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? undefined : value }));
  };

  const clear = () => setFilters({});
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div style={styles.bar}>
      <div style={styles.chips}>
        <span style={styles.label}>Filter:</span>

        {regions.map(r => (
          <button key={r._id} onClick={() => toggle('region', r.name)}
            style={{ ...styles.chip, ...(filters.region === r.name ? styles.chipActive : {}) }}>
            {r.name}
          </button>
        ))}

        <span style={styles.divider} />

        {capabilities.filter(c => !['temporary', 'if_time_allows'].includes(c.slug)).map(c => (
          <button key={c._id} onClick={() => toggle('capability', c.slug)}
            style={{ ...styles.chip, ...(filters.capability === c.slug ? styles.chipActive : {}) }}>
            {c.name}
          </button>
        ))}

        <span style={styles.divider} />

        {['new', 'leaving', 'planned'].map(s => (
          <button key={s} onClick={() => toggle('status', s)}
            style={{ ...styles.chip, ...(filters.status === s ? styles.chipActive : {}) }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        {hasFilters && (
          <button onClick={clear} style={{ ...styles.chip, color: 'var(--red)' }}>
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  bar: {
    padding: '8px 20px', background: 'white',
    borderBottom: '1px solid var(--border)', flexShrink: 0,
    overflowX: 'auto'
  },
  chips: {
    display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap'
  },
  label: {
    fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
    marginRight: 4, whiteSpace: 'nowrap'
  },
  chip: {
    padding: '4px 10px', borderRadius: 16, fontSize: 12,
    border: '1px solid var(--border)', color: 'var(--text-secondary)',
    whiteSpace: 'nowrap', transition: 'all 0.15s', fontWeight: 500
  },
  chipActive: {
    background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)'
  },
  divider: {
    width: 1, height: 20, background: 'var(--border)', flexShrink: 0
  }
};
