import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { filterPeople } from '../../utils/filters';
import { formatName, formatCurrency } from '../../utils/formatters';
import { StatusBadge } from '../shared/Badge';
import AccountLogo from '../shared/AccountLogo';

export default function PeopleDirectory() {
  const { people, accounts, assignments, filters, setSelectedPersonId } = useApp();
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState(1);
  const [page, setPage] = useState(0);
  const perPage = 25;

  const personAssignments = useMemo(() => {
    const map = {};
    for (const a of assignments) {
      const pid = a.personId?._id || a.personId;
      if (!map[pid]) map[pid] = [];
      map[pid].push(a);
    }
    return map;
  }, [assignments]);

  const getAccountForAssignment = (a) => {
    const aid = a.accountId?._id || a.accountId;
    return a.accountId?.name ? a.accountId : accounts.find(ac => ac._id === aid);
  };

  const sorted = useMemo(() => {
    const filtered = filterPeople(people, filters);
    return [...filtered].sort((a, b) => {
      let va = a[sortKey] || '';
      let vb = b[sortKey] || '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return va < vb ? -sortDir : va > vb ? sortDir : 0;
    });
  }, [people, filters, sortKey, sortDir]);

  const paged = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => -d);
    else { setSortKey(key); setSortDir(1); }
  };

  const SortHeader = ({ field, children }) => (
    <th onClick={() => toggleSort(field)} style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' }}>
      {children} {sortKey === field && (sortDir === 1 ? '↑' : '↓')}
    </th>
  );

  const handleExport = () => {
    const headers = ['Name', 'Title', 'Seniority', 'Region', 'Role', 'Status', 'Manager', 'Main Account'];
    const rows = sorted.map(p => {
      const mgr = people.find(m => m._id === (p.managerId?._id || p.managerId));
      const assigns = personAssignments[p._id] || [];
      const mainAssign = assigns.find(a => a.priority === 'main');
      const mainAcct = mainAssign ? getAccountForAssignment(mainAssign) : null;
      return [p.name, p.title, p.seniority, p.region, p.role, p.status, mgr?.name || '', mainAcct?.name || ''];
    });
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'spark-directory.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.count}>{sorted.length} people</span>
        <button onClick={handleExport} style={styles.exportBtn}>Export CSV</button>
      </div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <SortHeader field="name">Name</SortHeader>
              <SortHeader field="title">Title</SortHeader>
              <SortHeader field="seniority">Seniority</SortHeader>
              <SortHeader field="region">Region</SortHeader>
              <th style={styles.th}>Manager</th>
              <th style={styles.th}>Accounts</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(person => {
              const mgr = people.find(m => m._id === (person.managerId?._id || person.managerId));
              const assigns = (personAssignments[person._id] || []).sort((a, b) => (a.order || 0) - (b.order || 0));
              return (
                <tr key={person._id} onClick={() => setSelectedPersonId(person._id)}
                  style={styles.row}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...styles.td, fontWeight: 500 }}>{formatName(person.name)}</td>
                  <td style={styles.td}>{person.title}</td>
                  <td style={styles.td}>{person.seniority}</td>
                  <td style={styles.td}>{person.region}</td>
                  <td style={styles.td}>{mgr ? formatName(mgr.name) : '—'}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {assigns.slice(0, 4).map((a, i) => {
                        const acct = getAccountForAssignment(a);
                        return acct ? <AccountLogo key={i} account={acct} size={24} /> : null;
                      })}
                      {assigns.length > 4 && <span style={{ fontSize: 11, color: 'var(--text-secondary)', alignSelf: 'center' }}>+{assigns.length - 4}</span>}
                    </div>
                  </td>
                  <td style={styles.td}><StatusBadge status={person.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={styles.pageBtn}>← Prev</button>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={styles.pageBtn}>Next →</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 20px', borderBottom: '1px solid var(--border)'
  },
  count: { fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' },
  exportBtn: {
    padding: '6px 12px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', fontSize: 12, fontWeight: 500, cursor: 'pointer'
  },
  tableWrap: { flex: 1, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12,
    color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)',
    position: 'sticky', top: 0, background: 'white', zIndex: 1,
    whiteSpace: 'nowrap'
  },
  td: { padding: '10px 14px', borderBottom: '1px solid var(--border-light)' },
  row: { cursor: 'pointer', transition: 'background 0.1s' },
  pagination: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16,
    padding: '12px', borderTop: '1px solid var(--border)'
  },
  pageBtn: {
    padding: '6px 12px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer'
  }
};
