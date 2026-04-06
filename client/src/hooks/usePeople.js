import { useApp } from '../context/AppContext';

export function usePeople() {
  const { people, setPeople } = useApp();
  return { people, setPeople };
}
