import React from 'react';
import { formatName } from '../../utils/formatters';
import { StatusBadge } from '../shared/Badge';
import AccountLogo from '../shared/AccountLogo';
import { CARD_W, CARD_H } from '../../utils/treeLayout';

const capabilityIcons = {
  ai_capable: { symbol: '✦', color: '#F5C542' },
  customer_facing: { symbol: '◼', color: '#C4B5E0' },
  workshop_sales: { symbol: '▣', color: '#5B9BD5' },
  motion: { symbol: '▶', color: '#666666' }
};

export default React.memo(function TreeCard({
  node, dimmed, collapsed, hasChildren, onToggleCollapse, onClick,
  isDragging, isDropTarget, isConnectSource, connectMode
}) {
  const isManager = node.role === 'manager';
  const isFreelancer = node.type === 'freelancer';
  const isPlanned = node.type === 'planned_role';

  const bg = isManager ? 'var(--bg-card-manager)' : 'var(--bg-card-ic)';
  const border = isConnectSource
    ? '2px solid var(--accent)'
    : isDropTarget ? '2px solid var(--accent)'
    : isFreelancer ? '2px solid var(--border-freelancer)'
    : isPlanned ? '2px dashed var(--border)' : '1px solid var(--border)';

  const assignments = (node.assignmentsList || []).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div
      data-card
      data-node-id={node._id}
      style={{
        position: 'absolute',
        left: node.x, top: node.y,
        width: CARD_W, height: CARD_H,
        background: isDropTarget ? '#E8E0F0' : isPlanned ? 'white' : bg,
        border, borderRadius: 'var(--radius-md)',
        boxShadow: isConnectSource ? '0 0 0 3px rgba(107,92,231,0.4)' : isDropTarget ? '0 0 0 3px rgba(107,92,231,0.3)' : 'var(--shadow-sm)',
        padding: '10px 12px',
        cursor: connectMode ? 'crosshair' : 'grab',
        opacity: isDragging ? 0.3 : dimmed ? 0.2 : 1,
        transition: 'opacity 0.15s, box-shadow 0.15s, border-color 0.15s, transform 0.15s',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        fontSize: 12,
        transform: isDropTarget ? 'scale(1.04)' : 'none',
        zIndex: isDropTarget ? 5 : 1
      }}
      onClick={onClick}
    >
      {/* Drag handle indicator */}
      <div style={{
        position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
        width: 24, height: 3, borderRadius: 2,
        background: 'rgba(0,0,0,0.12)'
      }} />

      {/* Name */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4, marginTop: 4 }}>
        <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {formatName(node.name)}
        </div>
        <StatusBadge status={node.status} />
      </div>

      {/* Subtitle */}
      <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 2 }}>
        {node.seniority} • {node.region}
        {node.title && node.title !== node.seniority && ` • ${node.title}`}
      </div>

      {/* Account logos */}
      <div style={{ display: 'flex', gap: 4, marginTop: 'auto', alignItems: 'center' }}>
        {assignments.slice(0, 4).map((a, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <AccountLogo account={a.account} size={22} />
            {a.modifier === 'temporary' && (
              <div style={{ position: 'absolute', top: -2, right: -2, width: 6, height: 6, borderRadius: '50%', background: '#F4A582' }} />
            )}
            {a.modifier === 'if_time_allows' && (
              <div style={{ position: 'absolute', top: -2, right: -2, width: 6, height: 6, borderRadius: '50%', background: '#E74C3C' }} />
            )}
          </div>
        ))}
        {assignments.length > 4 && (
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>+{assignments.length - 4}</span>
        )}

        <div style={{ flex: 1 }} />

        {(node.capabilities || []).map(slug => {
          const cap = capabilityIcons[slug];
          if (!cap) return null;
          return (
            <span key={slug} title={slug} style={{ color: cap.color, fontSize: 11 }}>
              {cap.symbol}
            </span>
          );
        })}

        {node.notes && (
          <span title="Has notes" style={{ fontSize: 11, color: '#DAA520' }}>📝</span>
        )}
      </div>

      {/* Collapse toggle */}
      {hasChildren && (
        <button onClick={(e) => { e.stopPropagation(); onToggleCollapse(); }}
          style={{
            position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)',
            width: 24, height: 24, borderRadius: '50%',
            background: 'white', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, cursor: 'pointer', zIndex: 2,
            color: 'var(--text-secondary)', boxShadow: 'var(--shadow-sm)'
          }}>
          {collapsed ? '+' : '−'}
        </button>
      )}
    </div>
  );
});
