import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import Modal from '../shared/Modal';
import AccountManager from './AccountManager';
import CapabilityManager from './CapabilityManager';
import RegionManager from './RegionManager';
import SeniorityManager from './SeniorityManager';
import RoleManager from './RoleManager';

const tabs = [
  { id: 'accounts', label: 'Accounts' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'roles', label: 'Roles' },
  { id: 'regions', label: 'Regions' },
  { id: 'seniority', label: 'Seniority' },
  { id: 'activity', label: 'Activity Log' }
];

export default function SettingsModal() {
  const { setSettingsOpen, logout } = useApp();
  const [activeTab, setActiveTab] = useState('accounts');

  return (
    <Modal title="Settings" onClose={() => setSettingsOpen(false)} wide>
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 14px', borderRadius: 9999,
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
              color: activeTab === tab.id ? '#0A211F' : 'var(--text-secondary)',
              border: activeTab === tab.id ? 'none' : '1px solid var(--border)'
            }}>
            {tab.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={logout} style={{
          padding: '6px 14px', borderRadius: 9999,
          fontSize: 13, border: '1px solid var(--red)', color: 'var(--red)', cursor: 'pointer'
        }}>
          Sign Out
        </button>
      </div>

      {activeTab === 'accounts' && <AccountManager />}
      {activeTab === 'capabilities' && <CapabilityManager />}
      {activeTab === 'roles' && <RoleManager />}
      {activeTab === 'regions' && <RegionManager />}
      {activeTab === 'seniority' && <SeniorityManager />}
      {activeTab === 'activity' && <ActivityLogView />}
    </Modal>
  );
}

function ActivityLogView() {
  const [logs, setLogs] = React.useState([]);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    api.get(`/api/activity?page=${page}&limit=20`).then(({ data }) => {
      setLogs(data.logs || []);
    });
  }, [page]);

  return (
    <div>
      {logs.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No activity yet.</p>}
      {logs.map(log => (
        <div key={log._id} style={{
          padding: '8px 12px', borderBottom: '1px solid var(--border-light)', fontSize: 12
        }}>
          <span style={{ fontWeight: 500 }}>{log.action}</span>
          <span style={{ color: 'var(--text-secondary)' }}> on {log.targetType}</span>
          <span style={{ color: 'var(--text-light)', marginLeft: 8 }}>
            {new Date(log.timestamp).toLocaleString()}
          </span>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
          style={{ padding: '4px 10px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer' }}>Prev</button>
        <button onClick={() => setPage(p => p + 1)}
          style={{ padding: '4px 10px', borderRadius: 9999, border: '1px solid var(--border)', fontSize: 12, cursor: 'pointer' }}>Next</button>
      </div>
    </div>
  );
}
