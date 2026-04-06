import React from 'react';
import { formatCurrency, formatName } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import AccountLogo from '../shared/AccountLogo';
import Badge, { ModifierBadge } from '../shared/Badge';

export default function AccountCard({ account }) {
  const { setSelectedPersonId } = useApp();
  const { assignedPeople = [] } = account;

  const mainPeople = assignedPeople.filter(p => p.priority === 'main');
  const secondaryPeople = assignedPeople.filter(p => p.priority === 'secondary');
  const additionalPeople = assignedPeople.filter(p => p.priority === 'additional');

  const PersonRow = ({ person }) => (
    <div onClick={() => setSelectedPersonId(person._id)}
      style={styles.personRow}>
      <span style={{ fontWeight: 500 }}>{formatName(person.name)}</span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{person.seniority}</span>
        {person.modifier && <ModifierBadge modifier={person.modifier} />}
      </div>
    </div>
  );

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <AccountLogo account={account} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.name}>{account.name}</div>
          <div style={styles.teamName}>{account.teamName}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={styles.mrr}>{formatCurrency(account.mrr)}</div>
          <div style={styles.mrrLabel}>MRR</div>
        </div>
      </div>

      <div style={styles.meta}>
        <Badge label={account.region} color="#666" />
        <Badge label={account.businessUnit} color="#999" />
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{assignedPeople.length} people</span>
      </div>

      {mainPeople.length > 0 && (
        <div style={styles.tierSection}>
          <div style={styles.tierLabel}>Main Focus</div>
          {mainPeople.map(p => <PersonRow key={p._id} person={p} />)}
        </div>
      )}
      {secondaryPeople.length > 0 && (
        <div style={styles.tierSection}>
          <div style={styles.tierLabel}>Secondary Focus</div>
          {secondaryPeople.map(p => <PersonRow key={p._id} person={p} />)}
        </div>
      )}
      {additionalPeople.length > 0 && (
        <div style={styles.tierSection}>
          <div style={styles.tierLabel}>Additional Focus</div>
          {additionalPeople.map(p => <PersonRow key={p._id} person={p} />)}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: 'white', borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)', overflow: 'hidden'
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 12px'
  },
  name: { fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 },
  teamName: { fontSize: 12, color: 'var(--text-secondary)' },
  mrr: { fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 },
  mrrLabel: { fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase' },
  meta: {
    display: 'flex', gap: 6, alignItems: 'center', padding: '0 16px 12px',
    borderBottom: '1px solid var(--border-light)'
  },
  tierSection: { padding: '8px 16px' },
  tierLabel: { fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' },
  personRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '4px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
    fontSize: 13, marginBottom: 2
  }
};
