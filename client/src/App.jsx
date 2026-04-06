import React from 'react';
import { useApp } from './context/AppContext';
import LoginScreen from './components/auth/LoginScreen';
import NavBar from './components/layout/NavBar';
import FilterBar from './components/layout/FilterBar';
import MobileTabBar from './components/layout/MobileTabBar';
import OrgTree from './components/tree/OrgTree';
import PeopleDirectory from './components/directory/PeopleDirectory';
import AccountsGrid from './components/accounts/AccountsGrid';
import PersonDetail from './components/detail/PersonDetail';
import ChatDrawer from './components/chat/ChatDrawer';
import SettingsModal from './components/settings/SettingsModal';

export default function App() {
  const { authenticated, view, selectedPersonId, chatOpen, settingsOpen, loading } = useApp();

  if (!authenticated) return <LoginScreen />;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 8 }}>
            Spark Studio
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>Loading org chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <NavBar />
      <FilterBar />
      <div className="app-main">
        {view === 'tree' && <OrgTree />}
        {view === 'directory' && <PeopleDirectory />}
        {view === 'accounts' && <AccountsGrid />}

        {selectedPersonId && <PersonDetail />}
        {chatOpen && <ChatDrawer />}
      </div>
      <MobileTabBar />
      {settingsOpen && <SettingsModal />}
    </div>
  );
}
