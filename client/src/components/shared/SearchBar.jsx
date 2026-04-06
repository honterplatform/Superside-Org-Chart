import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { formatName } from '../../utils/formatters';

export default function SearchBar({ compact = false }) {
  const { people, accounts, setSelectedPersonId, setView } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const matchedPeople = people
      .filter(p => p.name?.toLowerCase().includes(q) || p.title?.toLowerCase().includes(q))
      .slice(0, 5)
      .map(p => ({ type: 'person', id: p._id, label: formatName(p.name), sub: `${p.seniority} • ${p.region}` }));
    const matchedAccounts = accounts
      .filter(a => a.name?.toLowerCase().includes(q) || a.teamName?.toLowerCase().includes(q))
      .slice(0, 3)
      .map(a => ({ type: 'account', id: a._id, label: a.name, sub: a.teamName }));
    setResults([...matchedPeople, ...matchedAccounts]);
    setOpen(true);
  }, [query, people, accounts]);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (result) => {
    if (result.type === 'person') {
      setSelectedPersonId(result.id);
    } else {
      setView('accounts');
    }
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: compact ? 200 : 300 }}>
      <input
        type="text"
        placeholder="Search people, accounts..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => query && setOpen(true)}
        style={{
          width: '100%', padding: '8px 12px 8px 32px',
          borderRadius: 9999, border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 13,
          outline: 'none'
        }}
      />
      <svg style={{ position: 'absolute', left: 10, top: 10, opacity: 0.5 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
          background: 'white', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 100
        }}>
          {results.map(r => (
            <div key={`${r.type}-${r.id}`} onClick={() => handleSelect(r)}
              style={{
                padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <div style={{ fontSize: 13, fontWeight: 500 }}>{r.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{r.sub}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
