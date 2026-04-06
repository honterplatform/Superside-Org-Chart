import React from 'react';
import { formatName, getInitials } from '../../utils/formatters';
import { StatusBadge } from '../shared/Badge';
import AccountLogo from '../shared/AccountLogo';
import { CARD_W, CARD_H } from '../../utils/treeLayout';

const capabilityIcons = {
  ai_capable: { label: 'AI', color: '#F5C542' },
  customer_facing: { label: 'Customer Facing', color: '#C4B5E0' },
  workshop_sales: { label: 'Workshop / Sales', color: '#5B9BD5' },
  motion: { label: 'Motion', color: '#666' }
};

export default React.memo(function TreeCard({
  node, dimmed, collapsed, hasChildren, onToggleCollapse, onClick,
  isDragging, isDropTarget, isConnectSource, connectMode
}) {
  const isManager = node.role === 'manager';
  const isFreelancer = node.type === 'freelancer';
  const isPlanned = node.type === 'planned_role';

  const bg = isPlanned ? 'white' : isManager ? '#3B7567' : '#FFFFFF';
  const borderStyle = isConnectSource || isDropTarget
    ? '2px solid var(--accent)'
    : isFreelancer ? '2px solid var(--border-freelancer)'
    : isPlanned ? '2px dashed var(--border)' : 'none';

  const assignments = (node.assignmentsList || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  const caps = (node.capabilities || []).filter(s => capabilityIcons[s]);

  return (
    <div
      data-card
      data-node-id={node._id}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: node.x, top: node.y,
        width: CARD_W, height: assignments.length > 0 ? CARD_H : CARD_H - 50,
        background: isDropTarget ? '#E8E0F0' : bg,
        border: borderStyle,
        borderRadius: 12,
        boxShadow: isConnectSource ? '0 0 0 3px rgba(107,92,231,0.4)' : isDropTarget ? '0 0 0 3px rgba(107,92,231,0.3)' : 'none',
        cursor: connectMode ? 'crosshair' : 'grab',
        opacity: isDragging ? 0.3 : dimmed ? 0.2 : 1,
        transition: 'opacity 0.15s, box-shadow 0.15s, transform 0.15s',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '14px 16px 14px',
        overflow: 'hidden',
        transform: isDropTarget ? 'scale(1.03)' : 'none',
        zIndex: isDropTarget ? 5 : 1
      }}
    >
      {/* Top row: role label + seniority */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', marginBottom: 16
      }}>
        <span style={{
          fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: 0.5, color: isManager ? '#F9FBF7' : 'var(--text-secondary)'
        }}>
          {node.title || (isManager ? 'Manager' : 'IC')}
        </span>
        <StatusBadge status={node.status} />
        <span style={{
          fontSize: 9, fontWeight: 700, color: isManager ? '#F9FBF7' : 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: 0.5
        }}>
          {node.seniority?.toUpperCase()}
        </span>
      </div>

      {/* Profile photo */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
        flexShrink: 0, marginBottom: 10
      }}>
        {node.photoUrl ? (
          <img src={node.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: isManager ? 'rgba(249,251,247,0.15)' : '#E8DFC0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700,
            color: isManager ? 'rgba(249,251,247,0.7)' : '#8B7D3C'
          }}>
            {getInitials(node.name)}
          </div>
        )}
      </div>

      {/* Name */}
      <div style={{
        fontWeight: 500, fontSize: 13, textAlign: 'center',
        color: isManager ? '#F9FBF7' : 'var(--text-primary)',
        lineHeight: 1.2, maxWidth: '100%',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
      }}>
        {formatName(node.name)}
      </div>

      {/* Region */}
      <div style={{
        fontSize: 8, color: isManager ? 'rgba(249,251,247,0.6)' : 'var(--text-secondary)', marginTop: 1,
        textAlign: 'center'
      }}>
        {node.region}
      </div>

      {/* Capability tags */}
      {caps.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4,
          justifyContent: 'center'
        }}>
          {caps.map(slug => {
            const cap = capabilityIcons[slug];
            return (
              <span key={slug} style={{
                fontSize: 8, fontWeight: 600, padding: '1px 6px',
                borderRadius: 8, border: '1px solid rgba(0,0,0,0.12)',
                color: 'var(--text-secondary)', whiteSpace: 'nowrap'
              }}>
                {cap.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Account logos */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto',
        justifyContent: 'center', paddingTop: 4
      }}>
        {assignments.slice(0, 6).map((a, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <AccountLogo account={a.account} size={32} />
            {a.modifier === 'temporary' && (
              <div style={{ position: 'absolute', top: -2, right: -2, width: 6, height: 6, borderRadius: '50%', background: '#F4A582' }} />
            )}
            {a.modifier === 'if_time_allows' && (
              <div style={{ position: 'absolute', top: -2, right: -2, width: 6, height: 6, borderRadius: '50%', background: '#E74C3C' }} />
            )}
          </div>
        ))}
        {assignments.length > 6 && (
          <span style={{ fontSize: 9, color: 'var(--text-secondary)', alignSelf: 'center' }}>+{assignments.length - 6}</span>
        )}
      </div>

      {/* Notes indicator */}
      {node.notes && (
        <div style={{ position: 'absolute', top: 8, right: 28, fontSize: 10, color: '#DAA520' }}>📝</div>
      )}

    </div>
  );
});
