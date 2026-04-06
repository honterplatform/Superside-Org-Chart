import { useApp } from '../context/AppContext';

export function useAccounts() {
  const { accounts, setAccounts } = useApp();
  return { accounts, setAccounts };
}
