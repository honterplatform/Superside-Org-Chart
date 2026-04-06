import React from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

export default function CapabilityPicker({ personId, current, onUpdate }) {
  const { capabilities } = useApp();

  const toggle = async (slug) => {
    const updated = current.includes(slug)
      ? current.filter(c => c !== slug)
      : [...current, slug];
    try {
      await api.put(`/api/people/${personId}`, { capabilities: updated });
      onUpdate();
    } catch { alert('Failed to update capabilities'); }
  };

  // Only show real capabilities (not modifiers)
  const realCaps = capabilities.filter(c => !['temporary', 'if_time_allows'].includes(c.slug));

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {realCaps.map(cap => {
        const active = current.includes(cap.slug);
        return (
          <button key={cap._id} onClick={() => toggle(cap.slug)}
            style={{
              padding: '4px 10px', borderRadius: 16, fontSize: 12,
              fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              border: `1px solid ${active ? cap.color : 'var(--border)'}`,
              background: active ? `${cap.color}20` : 'white',
              color: active ? cap.color : 'var(--text-secondary)'
            }}>
            {cap.name}
          </button>
        );
      })}
    </div>
  );
}
