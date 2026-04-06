import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatName } from '../../utils/formatters';
import AccountCard from './AccountCard';

export default function AccountsGrid() {
  const { accounts, assignments, people, filters } = useApp();
  const [sortBy, setSortBy] = useState('mrr');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterBU, setFilterBU] = useState('');

  const enriched = useMemo(() => {
    return accounts.map(account => {
      const acctAssignments = assignments.filter(a => {
        const aid = a.accountId?._id || a.accountId;
        return aid === account._id;
      });
      const assignedPeople = acctAssignments.map(a => {
        const pid = a.personId?._id || a.personId;
        const person = people.find(p => p._id === pid);
        return person ? { ...person, priority: a.priority, modifier: a.modifier } : null;
      }).filter(Boolean);
      return { ...account, assignedPeople, assignmentCount: assignedPeople.length };
    });
  }, [accounts, assignments, people]);

  const filtered = useMemo(() => {
    let list = enriched;
    if (filterRegion) list = list.filter(a => a.region === filterRegion);
    if (filterBU) list = list.filter(a => a.businessUnit === filterBU);
    list.sort((a, b) => {
      if (sortBy === 'mrr') return (b.mrr || 0) - (a.mrr || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'region') return a.region.localeCompare(b.region);
      return 0;
    });
    return list;
  }, [enriched, sortBy, filterRegion, filterBU]);

  const totalMRR = filtered.reduce((sum, a) => sum + (a.mrr || 0), 0);
  const mrrByRegion = {};
  filtered.forEach(a => {
    mrrByRegion[a.region] = (mrrByRegion[a.region] || 0) + (a.mrr || 0);
  });
  const businessUnits = [...new Set(accounts.map(a => a.businessUnit).filter(Boolean))];

  return (
    <div style={styles.container}>
      {/* Summary bar */}
      <div style={styles.summary}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Total Accounts</span>
          <span style={styles.statValue}>{filtered.length}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Total MRR</span>
          <span style={styles.statValue}>{formatCurrency(totalMRR)}</span>
        </div>
        {Object.entries(mrrByRegion).map(([region, mrr]) => (
          <div key={region} style={styles.stat}>
            <span style={styles.statLabel}>{region}</span>
            <span style={styles.statValue}>{formatCurrency(mrr)}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={styles.select}>
          <option value="mrr">Sort: MRR</option>
          <option value="name">Sort: Name</option>
          <option value="region">Sort: Region</option>
        </select>
        <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} style={styles.select}>
          <option value="">All Regions</option>
          <option value="AMERICAS">AMERICAS</option>
          <option value="EMEA">EMEA</option>
          <option value="APAC">APAC</option>
        </select>
        <select value={filterBU} onChange={e => setFilterBU(e.target.value)} style={styles.select}>
          <option value="">All Business Units</option>
          {businessUnits.map(bu => <option key={bu} value={bu}>{bu}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div style={styles.grid}>
        {filtered.map(account => (
          <AccountCard key={account._id} account={account} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { height: '100%', overflow: 'auto', padding: 20 },
  summary: {
    display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16,
    padding: '14px 20px', background: 'white', borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)'
  },
  stat: { display: 'flex', flexDirection: 'column', gap: 2 },
  statLabel: { fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 },
  statValue: { fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading)' },
  filters: { display: 'flex', gap: 8, marginBottom: 16 },
  select: { padding: '6px 10px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 12 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }
};
