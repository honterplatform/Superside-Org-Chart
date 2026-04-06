import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import socket from '../services/socket';

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem('spark_token'));
  const [view, setView] = useState('tree');
  const [people, setPeople] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [regions, setRegions] = useState([]);
  const [seniorityLevels, setSeniorityLevels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filters, setFilters] = useState({});
  const [locked, setLocked] = useState(true);
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (password) => {
    const { data } = await api.post('/api/auth/login', { password });
    localStorage.setItem('spark_token', data.token);
    setAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('spark_token');
    setAuthenticated(false);
  }, []);

  const fetchAll = useCallback(async () => {
    if (!authenticated) return;
    setLoading(true);
    try {
      const [ppl, accts, caps, regs, seniority, rolesRes] = await Promise.all([
        api.get('/api/people'),
        api.get('/api/accounts'),
        api.get('/api/capabilities'),
        api.get('/api/regions'),
        api.get('/api/seniority-levels'),
        api.get('/api/roles')
      ]);
      setPeople(ppl.data);
      setAccounts(accts.data);
      setCapabilities(caps.data);
      setRegions(regs.data);
      setSeniorityLevels(seniority.data);
      setRoles(rolesRes.data);

      // Fetch all assignments
      const allAssignments = [];
      for (const person of ppl.data) {
        try {
          const { data } = await api.get(`/api/people/${person._id}/assignments`);
          allAssignments.push(...data);
        } catch { /* skip */ }
      }
      setAssignments(allAssignments);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
    setLoading(false);
  }, [authenticated]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Socket.io real-time updates
  useEffect(() => {
    if (!authenticated) return;

    const handlers = {
      'person:created': (person) => setPeople(prev => [...prev, person]),
      'person:updated': (person) => setPeople(prev => prev.map(p => p._id === person._id ? person : p)),
      'person:deleted': ({ _id }) => setPeople(prev => prev.filter(p => p._id !== _id)),
      'person:moved': (person) => setPeople(prev => prev.map(p => p._id === person._id ? person : p)),
      'people:reordered': (allPeople) => setPeople(allPeople),
      'positions:reset': () => fetchAll(),
      'account:created': (account) => setAccounts(prev => [...prev, account]),
      'account:updated': (account) => setAccounts(prev => prev.map(a => a._id === account._id ? account : a)),
      'account:deleted': ({ _id }) => setAccounts(prev => prev.filter(a => a._id !== _id)),
      'assignment:created': (assignment) => setAssignments(prev => [...prev, assignment]),
      'assignment:updated': (assignment) => setAssignments(prev => prev.map(a => a._id === assignment._id ? assignment : a)),
      'assignment:deleted': ({ _id }) => setAssignments(prev => prev.filter(a => a._id !== _id)),
    };

    for (const [event, handler] of Object.entries(handlers)) {
      socket.on(event, handler);
    }

    socket.on('reconnect', () => fetchAll());

    return () => {
      for (const event of Object.keys(handlers)) {
        socket.off(event);
      }
      socket.off('reconnect');
    };
  }, [authenticated, fetchAll]);

  const value = {
    authenticated, login, logout,
    view, setView,
    people, setPeople, accounts, setAccounts, assignments, setAssignments,
    capabilities, setCapabilities, regions, setRegions, seniorityLevels, setSeniorityLevels, roles, setRoles,
    filters, setFilters, locked, setLocked,
    selectedPersonId, setSelectedPersonId,
    chatOpen, setChatOpen,
    settingsOpen, setSettingsOpen,
    loading, fetchAll
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
