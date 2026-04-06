import React from 'react';
import { getInitials } from '../../utils/formatters';

export default function AccountLogo({ account, size = 28 }) {
  if (!account) return null;

  if (account.logoUrl) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', overflow: 'hidden',
        flexShrink: 0, border: '1px solid #F4F5F4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent'
      }}
        title={account.name}
      >
        <img
          src={account.logoUrl}
          alt={account.name}
          style={{ width: size, height: size, objectFit: 'contain' }}
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
        <div style={{
          display: 'none', width: '100%', height: '100%',
          alignItems: 'center', justifyContent: 'center',
          background: account.color || '#666', color: 'white',
          fontSize: size * 0.35, fontWeight: 700
        }}>
          {getInitials(account.name)}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0, border: '1px solid #F4F5F4',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: account.color || '#666', color: 'white',
      fontSize: size * 0.35, fontWeight: 700
    }}
      title={account.name}
    >
      {getInitials(account.name)}
    </div>
  );
}
