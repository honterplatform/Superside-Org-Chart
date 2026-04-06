import React from 'react';
import { formatName } from '../../utils/formatters';
import { StatusBadge } from '../shared/Badge';

export default function PeopleCard({ person, onClick }) {
  return (
    <div onClick={onClick} style={styles.card}>
      <div style={styles.top}>
        <span style={styles.name}>{formatName(person.name)}</span>
        <StatusBadge status={person.status} />
      </div>
      <div style={styles.sub}>{person.seniority} • {person.region}</div>
      {person.title && <div style={styles.title}>{person.title}</div>}
    </div>
  );
}

const styles = {
  card: {
    padding: '14px 16px', background: 'white', borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'box-shadow 0.15s'
  },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 14, fontWeight: 600 },
  sub: { fontSize: 12, color: 'var(--text-secondary)' },
  title: { fontSize: 12, color: 'var(--text-light)', marginTop: 2 }
};
