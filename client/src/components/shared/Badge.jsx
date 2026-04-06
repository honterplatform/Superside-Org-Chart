import React from 'react';

export default function Badge({ label, color = '#666', bg, small = false }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: small ? '0px 5px' : '2px 8px',
      borderRadius: 9999, fontSize: small ? 7 : 11,
      fontWeight: 700, whiteSpace: 'nowrap',
      color: color, background: bg || `${color}18`,
      lineHeight: small ? '13px' : '18px',
      letterSpacing: 0.3
    }}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    new: { label: 'NEW', color: '#fff', bg: '#4CAF50' },
    leaving: { label: 'LEAVING', color: '#fff', bg: '#FF9800' },
    planned: { label: 'PLANNED', color: '#fff', bg: '#2196F3' },
    active: null
  };
  const config = map[status];
  if (!config) return null;
  return <Badge {...config} small />;
}

export function ModifierBadge({ modifier }) {
  const map = {
    temporary: { label: 'TEMP', color: '#F4A582' },
    if_time_allows: { label: 'ITA', color: '#E74C3C' }
  };
  const config = map[modifier];
  if (!config) return null;
  return <Badge {...config} small />;
}

export function PriorityLabel({ priority }) {
  const map = {
    main: { label: 'Main', color: '#4CAF50' },
    secondary: { label: 'Secondary', color: '#FF9800' },
    additional: { label: 'Additional', color: '#999' }
  };
  return <Badge {...(map[priority] || map.main)} small />;
}
